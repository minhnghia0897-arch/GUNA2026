# GUNA GIFT — Business Logic & Cascade Rules

> Document mô tả **logic nghiệp vụ chi tiết** + **tác động lẫn nhau giữa các entity** khi thêm/sửa/xóa. Mỗi flow có:
> - Bước-từng-bước với file & DB query
> - Side effects (cascade) trên các bảng khác
> - Edge cases & validation rules
> - Acceptance criteria

---

## 0. Entity Relationships Map

```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│ auth.users   │──1:1─│ profiles     │──1:N─│ orders       │
│ (Supabase)   │      │ + role       │      │ + status     │
└──────────────┘      │ + tier       │      │ + voucher    │
                      │ + total_spent│      └──────┬───────┘
                      └──────┬───────┘             │
                             │                     │1:N
                             │                     ▼
                       1:N   │              ┌──────────────┐
                             ▼              │ order_items  │
                      ┌──────────────┐      │ snapshot     │
                      │ addresses    │      └──────┬───────┘
                      │ wishlists    │             │
                      │ reviews      │             │N:1
                      └──────────────┘             ▼
                                            ┌──────────────┐
                                            │ products     │──N:1── categories
                                            │ + stock      │
                                            │ + rating     │
                                            └──────────────┘

orders ──1:N──> order_timeline   (audit log)
orders ──N:1──> vouchers          (used_count++)
products ──1:N──> reviews         (rating recalc)
profiles + orders ──> tier upgrade (when delivered)
```

**Quy tắc đọc:** `1:N` = một bên có nhiều, `N:1` = nhiều thuộc một.

---

## 1. ĐĂNG KÝ USER (chi tiết từng bước)

### Happy path

| Bước | Event | DB tác động | File code |
|---|---|---|---|
| 1 | User submit form `/account/register` | (none) | [register/page.tsx:25](src/app/account/register/page.tsx#L25) |
| 2 | `supabase.auth.signUp({email, password, options:{data:{full_name, phone}}})` | INSERT `auth.users` | (Supabase API) |
| 3 | Trigger `on_auth_user_created` (Supabase managed) | INSERT `profiles {id=user.id, email, role='customer', tier='silver', total_orders=0, total_spent=0}` | DB trigger |
| 4 | Client upsert `profiles` thêm full_name + phone | UPDATE `profiles` (chỉ khi không có) | register/page.tsx:51 |
| 5 | Browser nhận session → cookies set tự động | (cookies) | @supabase/ssr |
| 6 | `router.push("/account")` | (navigation) | register/page.tsx:62 |

### Validation rules

| Rule | Reject reason |
|---|---|
| `password.length < 6` | "Mật khẩu phải có ít nhất 6 ký tự" |
| `password !== confirmPassword` | "Mật khẩu xác nhận không khớp" |
| `!agree` (terms checkbox) | "Vui lòng đồng ý điều khoản" |
| Email đã tồn tại trong `auth.users` | Supabase trả error "User already registered" |
| Supabase setting `signup_disabled=true` | Error "Signups not allowed for this instance" → **fail toàn flow** |

### Cascade effects

- ✅ Profile tự động tạo qua trigger DB → user có thể login ngay
- ✅ Default role = `customer` (admin phải promote thủ công qua SQL)
- ✅ Default tier = `silver`, sẽ upgrade khi `total_spent` đạt mức (xem section 6)

### ⚠️ Edge cases

- **Email confirmation:** Nếu Supabase setting `Enable email confirmations` = ON, user phải verify email trước khi login được
- **Race condition:** Nếu trigger tạo profile fail (rare), user có auth nhưng không có profile → mọi RLS check thất bại → bug "user logged in but features broken"
- **Recovery:** Admin manual: `INSERT INTO profiles (id, email, role) VALUES (auth_user_id, email, 'customer')`

### Acceptance criteria
- [ ] User register thành công → tự động login → /account hiển thị tên user
- [ ] Refresh trang → vẫn login
- [ ] Logout → login lại → session khôi phục đúng

---

## 2. ĐẶT HÀNG (Order Placement) — flow critical

### Pre-conditions
- Cart có ≥1 item (CartContext.items)
- User đã điền form shipping (validate phone, address, ward/district/province)
- Voucher (nếu có) đã apply ở `/cart` → lưu sessionStorage

### Happy path

| Bước | Event | DB tác động | Side effect |
|---|---|---|---|
| 1 | Click "Đặt hàng" ở `/checkout` | (none) | [checkout/page.tsx:96](src/app/checkout/page.tsx#L96) |
| 2 | `supabase.auth.getUser()` | (read) | Capture user nếu authed |
| 3 | Query `products` để validate stock + visibility | SELECT `products WHERE slug IN (...)` | Stock check client-side |
| 4 | Loop check: mỗi cart item có `is_visible=true` AND `stock_count >= quantity` | (validation) | Reject với toast cụ thể nếu fail |
| 5 | Call **RPC `create_order`** với items array | INSERT `orders` + INSERT `order_items` (atomic) | RPC bypass RLS |
| 6 | Trigger `generate_order_code` (BEFORE INSERT orders) | SET `order_code = 'FM' + nextval(seq)` | Sequential code |
| 7 | Trigger `log_order_status_change` (AFTER INSERT orders) | INSERT `order_timeline {action='created', actor='system'}` | Audit log |
| 8 | Trigger `update_profile_stats` (AFTER INSERT orders) | (no-op khi status='pending') | Chỉ chạy khi `delivered` |
| 9 | Trigger `decrease_stock` (AFTER INSERT order_items) | UPDATE `products SET stock_count = GREATEST(0, stock_count - qty)` | **Stock giảm ngay khi tạo đơn** |
| 10 | Nếu có voucher: RPC `increment_voucher_used(code)` | UPDATE `vouchers SET used_count++` | Track usage |
| 11 | Client: `clear()` cart, `setStep(3)` success page, remove sessionStorage voucher | (state) | UI update |

### Order data structure (snapshot pattern)

`order_items` chứa **bản chụp** thông tin product tại thời điểm đặt:
- `product_id` (nullable — nếu product bị xóa sau này, tham chiếu null nhưng order_items vẫn giữ snapshot)
- `product_slug`, `product_name`, `product_image`, `unit_price` — **immutable** sau khi đặt
- `quantity`, `total_price = unit_price × quantity`

→ **Lý do:** giá/tên/ảnh sản phẩm thay đổi không ảnh hưởng đơn cũ. Khách hàng luôn thấy đúng giá đã trả.

### Cascade effects khi tạo order

```
Order INSERT
├─→ order_code generated (FM00001NNN)
├─→ order_timeline INSERT "created" entry
├─→ profile.total_orders / total_spent: KHÔNG tăng (chỉ khi delivered)
├─→ Cart cleared (client-side)
├─→ Voucher used_count++ (nếu apply)
└─→ Stock decreased (qua trigger trên order_items):
     ├─→ Product có stock_count - qty (clamp 0)
     └─→ Nếu stock_count xuống 0 → product vẫn `is_visible=true` nhưng UI hiện "Hết hàng"
```

### ⚠️ Edge cases

| Case | Behavior |
|---|---|
| Stock = 0 khi đặt | Reject ở bước 4 với toast "X chỉ còn 0 sản phẩm" |
| User đặt 5 nhưng stock chỉ 3 | Reject (validate `>=`, không partial) |
| 2 user cùng đặt sản phẩm có stock=1 | **Race condition** — cả 2 pass validation, trigger clamp về 0, oversell 1 đơn. Hiện chấp nhận do COD (khắc phục manual). Fix sau bằng `SELECT ... FOR UPDATE` |
| Voucher hết hạn giữa lúc apply và đặt | Reject ở RPC nếu thêm check (hiện chỉ check ở `/cart`) |
| Voucher chỉ active=false nhưng còn trong sessionStorage | Apply vẫn pass nhưng `increment_voucher_used` skip do `WHERE is_active=true` |
| User anon đặt hàng | order.user_id=NULL, không xem lại được sau (RLS chặn) |
| Email không điền | Cho phép (nullable) — không gửi email confirmation được |

### Acceptance criteria
- [ ] Order tạo thành công → success page hiện FM00001NNN
- [ ] DB có row trong `orders`, `order_items`, `order_timeline`
- [ ] Stock của products giảm đúng số lượng đặt
- [ ] Voucher `used_count` tăng 1
- [ ] Cart clear (localStorage `farmo-cart` = `[]`)
- [ ] sessionStorage `farmo-checkout-voucher` removed
- [ ] Anon user → success page chỉ hiện link login (không link xem đơn)

---

## 3. CẬP NHẬT TRẠNG THÁI ĐƠN (Admin)

### Status state graph

```
       ┌───────┐  Admin confirm
       │pending│ ──────────────►┌─────────┐
       └───┬───┘                │confirmed│
           │                    └────┬────┘
           │ Customer cancel         │ Admin ship
           │ (within 30min)          ▼
           ▼                    ┌────────┐
       ┌─────────┐             │shipping│
       │cancelled│◄────────────┴────┬───┘
       └─────────┘  Admin cancel    │ Admin mark delivered
                                    ▼
                                ┌─────────┐
                                │delivered│ ← Final
                                └─────────┘
```

**Hiện tại:** không có state machine validation — admin có thể chuyển bất kỳ → bất kỳ. Cần thêm sau.

### Cascade effects khi đổi status

| Status | Cascade tự động |
|---|---|
| `pending → confirmed` | INSERT `order_timeline` (label: "Đã xác nhận") |
| `* → shipping` | INSERT `order_timeline` (label: "Đang giao") + admin nhập `tracking_number` |
| `* → delivered` | INSERT `order_timeline` + **`update_profile_stats` chạy** (nếu user_id ≠ NULL):<br>• `profile.total_orders += 1`<br>• `profile.total_spent += order.total`<br>• `profile.tier` recompute (xem section 6) |
| `* → cancelled` | INSERT `order_timeline` (label: "Đã hủy")<br>**KHÔNG** restore stock (manual nếu cần) |

### File code
- Admin update: [OrderStatusUpdater.tsx](src/app/admin/orders/[id]/OrderStatusUpdater.tsx) — UPDATE `orders.status`
- Customer cancel: [account/orders/[id]/page.tsx:82](src/app/account/orders/[id]/page.tsx#L82) — chỉ allowed khi `status='pending' && created_at > now() - 30min`

### Trigger details

```sql
log_order_status_change():
  ON UPDATE
  IF OLD.status IS DISTINCT FROM NEW.status:
    INSERT order_timeline (order_id, action=NEW.status, description='Trạng thái: '+ vietnamese_label, actor='system')
```

```sql
update_profile_stats():
  ON UPDATE
  IF NEW.status='delivered' AND OLD.status IS DISTINCT FROM 'delivered':
    UPDATE profiles SET total_orders+=1, total_spent+=NEW.total
    UPDATE profiles SET tier=CASE
      WHEN total_spent >= 10000000 THEN 'diamond'
      WHEN total_spent >= 2000000  THEN 'gold'
      ELSE 'silver' END
```

### ⚠️ Edge cases

- **Đổi đi đổi lại** `pending → confirmed → pending`: timeline có cả 2 entries, không bị skip
- **`delivered → cancelled`**: trigger không refund total_spent. Nếu cần, manual: `UPDATE profiles SET total_spent -= X`
- **Đặt cancel trên đơn delivered đã upgrade tier**: tier không downgrade tự động
- **Race**: 2 admin cùng update → last write wins (acceptable)

### Acceptance criteria
- [ ] Admin đổi status → DB updated
- [ ] `order_timeline` có entry mới với label tiếng Việt
- [ ] Khi delivered → `profiles.total_spent` tăng đúng
- [ ] Khi delivered + total_spent ≥ 2M → tier='gold'

---

## 4. PRODUCT CRUD (Admin)

### CREATE product

**File:** [ProductForm.tsx](src/app/admin/products/ProductForm.tsx) (isNew=true)

| Bước | Event | Tác động |
|---|---|---|
| 1 | Admin upload ảnh | INSERT `storage.objects` (bucket=`product-images`, path=`{slug}/...`) |
| 2 | Admin submit form | INSERT `products` |
| 3 | Server action `revalidateStorefront("products")` | Next.js cache cleared cho `/products`, `/products/[slug]`, `/` |
| 4 | Trigger `set_updated_at` | (timestamp) |

### UPDATE product

| Field | Cascade |
|---|---|
| `name`, `description`, `image`, `gallery`, `specs` | Đơn cũ giữ snapshot, đơn mới dùng giá trị mới |
| `price`, `original_price` | **CHỈ ảnh hưởng đơn mới**. Đơn cũ giữ giá đã chốt |
| `stock_count` | Hiện trên storefront ngay (qua revalidate) |
| `is_visible` = false | Product ẩn khỏi `/products` list. Đơn cũ vẫn hiển thị product info từ snapshot |
| `category_slug` | Đổi nhóm product |
| `slug` | **⚠️ CẢNH BÁO**: URL cũ 404. Wishlist (lưu slug) bị vỡ. Should warn admin trước khi sửa slug |

### DELETE product

**Hiện tại:** Hard delete (không soft).

| Bảng phụ thuộc | Cascade |
|---|---|
| `order_items.product_id` | SET NULL (FK ON DELETE SET NULL) — đơn cũ vẫn hiển thị product_name từ snapshot, không click vào được |
| `wishlists.product_id` | DELETE CASCADE — auto-remove khỏi wishlist user |
| `reviews.product_id` | DELETE CASCADE |
| `storage.objects` (ảnh trong bucket) | **KHÔNG xóa tự động** — admin phải xóa thủ công, gây orphan files |

### ⚠️ Edge cases

- **Stock < 0:** không thể vào DB do `GREATEST(0, ...)` clamp. Nhưng có thể `stock_count=0` → admin vẫn save được, UI hiện "Hết hàng"
- **Image URL trỏ vào product-images bucket:** nếu admin xóa product nhưng không xóa ảnh, ảnh leak trong storage
- **Update `slug`:** wishlist user có cũ slug → wishlist page render 0 sản phẩm (không match)

### Acceptance criteria
- [ ] CREATE: product hiện ngay trên `/products` (sau revalidate)
- [ ] UPDATE price: đơn cũ giữ giá cũ, đơn mới giá mới
- [ ] DELETE: order_items vẫn hiện tên cũ (snapshot), wishlist auto-remove, không crash

---

## 5. VOUCHER MECHANICS

### Tạo voucher (Admin)

**File:** [admin/vouchers/VouchersClient.tsx](src/app/admin/vouchers/VouchersClient.tsx)

| Field | Ý nghĩa |
|---|---|
| `code` | Unique. UPPERCASE. VD: `FARMO10` |
| `discount_type` | `percentage` (10% off) / `fixed` (giảm 50k) / `freeship` |
| `value` | Cho percentage: 10 = 10%. Cho fixed: 50000 = 50k VND |
| `min_order` | Đơn tối thiểu để dùng |
| `max_discount` | Cap số tiền giảm (chỉ percentage) |
| `usage_limit` | Số lần dùng tối đa (NULL = unlimited) |
| `used_count` | Auto-increment khi đặt đơn thành công |
| `is_active` | Toggle on/off |
| `ends_at` | Hết hạn |

### Apply voucher (Customer)

**File:** [cart/page.tsx:27](src/app/cart/page.tsx#L27)

```
1. Customer nhập code → SELECT vouchers WHERE code=X
2. Validate sequential:
   a. Tồn tại?           → "Mã không tồn tại"
   b. is_active=true?    → "Đã ngừng hoạt động"
   c. ends_at > now()?   → "Đã hết hạn"
   d. subtotal >= min_order? → "Đơn tối thiểu Xđ"
   e. usage_limit?       → (chưa check, TODO)
3. Lưu sessionStorage `farmo-checkout-voucher`
4. Compute discount:
   - percentage: subtotal × value / 100, cap by max_discount
   - fixed: min(value, subtotal)
   - freeship: discount=0, set shipping_fee=0
5. Hiển thị "Đã áp dụng X" + total mới
```

### Apply voucher → Order

| Bước | Cascade |
|---|---|
| Order created với `voucher_code='FARMO10'`, `discount=120000` | INSERT `orders` |
| Post-order: RPC `increment_voucher_used('FARMO10')` | UPDATE `vouchers SET used_count+=1 WHERE code AND is_active=true` |
| Voucher hết hạn / inactive giữa apply và submit | RPC update fail silently, used_count không tăng (acceptable) |

### ⚠️ Edge cases

- **Voucher xóa khỏi DB sau khi user apply:** sessionStorage còn voucher info → checkout dùng được nhưng RPC increment fail → log lỗi nhưng order vẫn tạo
- **Concurrent: voucher chỉ còn 1 lượt, 2 user dùng:** cả 2 đều tăng used_count, used_count=usage_limit+1. Hiện không hard-stop. Fix bằng RLS policy hoặc atomic check
- **User apply voucher → tăng cart → giảm subtotal dưới min_order:** voucher vẫn apply, cần re-validate ở checkout (TODO)

### Acceptance criteria
- [ ] FARMO10 (10%) trên đơn 1M → discount 100k → total 900k + shipping
- [ ] FREESHIP voucher → shipping=0 dù subtotal < threshold miễn phí
- [ ] Voucher dùng 1 lần → `used_count` từ 0 → 1
- [ ] Disable voucher → user mới không apply được, đơn cũ giữ nguyên

---

## 6. MEMBERSHIP TIER

### Tier thresholds

| Tier | Yêu cầu (`total_spent`) |
|---|---|
| `silver` | < 2,000,000đ (default) |
| `gold` | ≥ 2,000,000đ |
| `diamond` | ≥ 10,000,000đ |

### Khi nào tier update?

**Chỉ khi order chuyển sang `delivered`** (xem trigger `update_profile_stats` ở section 3).

### Cascade

```
Admin mark order #X as 'delivered' 
  → trigger UPDATE profile.total_spent += X.total
  → trigger UPDATE profile.tier dựa total_spent
  → User vào /account/membership thấy tier mới
  → /account header hiện badge tier
```

### ⚠️ Edge cases

- **Đơn delivered rồi cancelled:** tier không downgrade → user "claim" được tier cao hơn thực tế. Acceptable for now.
- **Anon order (user_id=NULL):** trigger skip, không upgrade tier (vì không có user)
- **2 đơn delivered cùng lúc:** trigger chạy lần lượt (PostgreSQL serializable), không lost update

### Acceptance criteria
- [ ] User đặt 1 đơn 2M, admin mark delivered → tier='gold'
- [ ] User /account/membership hiện đúng tier
- [ ] /account/page hiện badge tier

---

## 7. WISHLIST

**File:** [WishlistContext.tsx](src/context/WishlistContext.tsx)

### Add/Remove logic

```
toggle(slug, productName):
  if (anon):
    → state += slug, lưu localStorage 'farmo-wishlist'
  else (authed):
    → resolve product_id từ slug
    → INSERT/DELETE wishlists (user_id, product_id)
    → state cập nhật
```

### Cascade

| Event | Effect |
|---|---|
| User login lần đầu sau khi anon đã add | Merge localStorage items → DB → clear localStorage |
| Product bị admin xóa | wishlists row tự DELETE qua FK CASCADE |
| User logout | items state = [] (DB items vẫn còn, sẽ load lại khi login) |
| Multiple devices | DB sync ngay sau toggle (fetch fresh on auth state change) |

### ⚠️ Edge cases

- **Race khi login + toggle song song:** sync logic có guard `cancelled` flag, không double-insert nhờ `onConflict: "user_id,product_id"`
- **localStorage có slug không tồn tại trong DB (product deleted):** wishlist page filter bỏ qua, không crash

### Acceptance criteria
- [ ] Anon add → login → DB có item, localStorage rỗng
- [ ] Login device A add → device B refresh → thấy item
- [ ] Admin xóa product → wishlist auto-remove

---

## 8. REVIEWS

**File:** [ReviewSection.tsx](src/components/ReviewSection.tsx)

### Submit review

| Yêu cầu | Validation |
|---|---|
| Authed user (có profile) | Reject anon |
| Có content | Reject empty |
| Rating 1-5 | UI bắt nhập |

### Submit → DB

```
INSERT reviews {product_id, user_id, author_name, rating, title, content, is_verified=true, status='published'}
  → trigger recalc_product_rating():
    UPDATE products SET rating = AVG(reviews.rating), reviews_count = COUNT(reviews) WHERE id=product_id
```

### Helpful count

```
User click "Hữu ích":
  → localStorage track helpful_id (chống double-tap per device)
  → RPC increment_review_helpful(review_id) (SECURITY DEFINER bypass RLS)
  → UPDATE reviews SET helpful_count+=1
```

### Cascade

| Event | Effect |
|---|---|
| User submit review | products rating recalc, reviews_count tăng |
| User update review | products rating recalc |
| User/admin delete review | products rating recalc (giảm), reviews_count giảm |
| Admin xóa product | reviews CASCADE delete |

### ⚠️ Edge cases

- **Review status='pending' (moderation, future):** trigger recalc_rating chỉ count `published` (cần verify code)
- **Helpful spam từ same device:** localStorage prevent. Khác device vẫn tăng được. Cần tracking table cho chuẩn
- **Mock reviews từ `data/reviews.ts`:** hiện chỉ làm fallback UI khi DB rỗng, KHÔNG ảnh hưởng products.rating

### Acceptance criteria
- [ ] User submit review 5 sao trên product có rating 4 → product rating tăng
- [ ] Admin xóa review → product rating giảm
- [ ] Helpful click 1 lần → count +1, click thêm trên cùng device → không tăng

---

## 9. ADDRESSES

**File:** [src/lib/addresses.ts](src/lib/addresses.ts), [account/addresses/page.tsx](src/app/account/addresses/page.tsx)

### Default exclusivity

```
upsertAddress(addr):
  if addr.is_default:
    → UPDATE addresses SET is_default=false WHERE user_id=current
  → INSERT/UPDATE address với is_default từ form
  → ensureOneDefault(user_id):
    if no address has is_default=true:
      → UPDATE addresses SET is_default=true WHERE id = (oldest)
```

### Cascade

| Event | Effect |
|---|---|
| Add address đầu tiên | Tự đánh dấu is_default=true |
| Set default cho address X | Tất cả address khác is_default=false |
| Delete default address | Address cũ nhất còn lại tự promote thành default |
| Delete tất cả addresses | (no default exists, OK) |

### ⚠️ Edge cases

- **2 user A, B share device:** đăng ký A → add address → logout → đăng ký B → A's addresses không leak (RLS lọc theo user_id)
- **Delete address đang được order dùng:** không có FK constraint, OK. Order giữ snapshot trong `shipping_address` JSON

### Acceptance criteria
- [ ] User add 3 địa chỉ → cái đầu là default
- [ ] User đổi default sang cái 3 → cái 1 hết default
- [ ] Xóa cái default → cái khác tự lên default
- [ ] Xóa tất cả → không crash

---

## 10. CMS (Site Settings)

**File:** [admin/settings/general/GeneralSettingsForm.tsx](src/app/admin/settings/general/GeneralSettingsForm.tsx)

### Singleton pattern

`site_settings` table có **đúng 1 row** với `id='main'`. UPDATE thay vì INSERT.

### Cascade khi update

| Field | Tác động |
|---|---|
| `shop_name`, `shop_tagline` | Header, Footer, OpenGraph metadata |
| `logo_url`, `logo_mark` | Header logo, Footer logo |
| `hotline`, `email`, `address_line` | Footer contact, ContactSection |
| `freeship_threshold` | Cart progress bar, checkout shipping calculation (TODO: hiện hardcode 500k) |
| `meta_keywords` | SEO meta |

### Server action

Sau mỗi save: `revalidateStorefront(scope)` ở [src/app/actions.ts](src/app/actions.ts) — invalidate Next.js cache cho:
- `scope='settings'`: `/`, `/about`, `/contact`
- `scope='products'`: `/products`, `/products/[slug]`
- `scope='blog'`: `/blog`, `/blog/[slug]`
- `scope='policies'`: `/policies/*`, `/faq`

### ⚠️ Edge cases

- **Site_settings row không tồn tại:** fetcher return null, components dùng fallback từ `lib/seo.ts SITE` constants
- **Update fail giữa transaction:** atomic update, không partial state

### Acceptance criteria
- [ ] Admin đổi shop_name → reload `/` → header/footer hiện tên mới
- [ ] Đổi logo_url → ảnh mới load
- [ ] Đổi hotline → footer + JSON-LD organization update

---

## 11. NEWSLETTER

**File:** [Newsletter.tsx](src/components/Newsletter.tsx), [admin/newsletter/page.tsx](src/app/admin/newsletter/page.tsx)

```
User submit email → INSERT newsletter_subscribers {email, source='footer'/'popup'}
  ON CONFLICT (email) DO NOTHING (no double-subscribe)
Admin xem list → SELECT * FROM newsletter_subscribers ORDER BY created_at DESC
```

### Cascade
- Không có cascade với entity khác — standalone table.

---

## 12. ARTICLES (Blog)

**File:** [admin/articles/ArticleForm.tsx](src/app/admin/articles/ArticleForm.tsx)

### Status lifecycle

```
draft → published → archived
```

| Status | Visibility |
|---|---|
| `draft` | Chỉ admin thấy ở `/admin/articles` |
| `published` | Hiển thị `/blog`, `/blog/[slug]` |
| `archived` | Ẩn khỏi `/blog` nhưng URL trực tiếp vẫn vào được (TODO: redirect 410) |

### Cascade
- Không có cascade. Standalone.

---

## 13. CHECKPOINT TỔNG HỢP — Trước khi launch

Verify từng entity hoạt động đúng cascade:

| Test case | Expected |
|---|---|
| Customer register → đặt 1 đơn 2M COD → admin mark delivered | profile.total_spent=2M, tier='gold' |
| Apply FARMO10 (10%) trên đơn 1.5M | discount=150k, voucher.used_count++ |
| Đặt đơn cuối cùng của product (stock=1) → 2 user cùng đặt | 1 thành công, 1 reject (or 2 thành công nếu race — flag manual) |
| Admin update product price từ 1M lên 1.2M | Đơn cũ vẫn 1M, đơn mới 1.2M |
| Admin xóa product có đơn cũ | order_items.product_id=NULL, đơn cũ vẫn hiện tên cũ |
| User add wishlist anon → login → check wishlist | Items đã merge, localStorage rỗng |
| Customer mark cancel đơn pending < 30min | status='cancelled', timeline có entry |
| Customer try cancel đơn đã confirmed | UI ẩn nút cancel |

---

## 14. KHI VIẾT FEATURE MỚI — Checklist

1. **Define entity relationships:** vẽ map xem cascade (như section 0)
2. **List side effects:** mỗi action có thể trigger gì? (như section 2 cho order)
3. **Edge cases:** race, NULL, anon, deleted, expired (như cuối mỗi section)
4. **Acceptance criteria:** ≥3 verifiable checks (như cuối mỗi section)
5. **Anti-pattern check:** xem CLAUDE.md section 6 có lặp pattern không
6. **DB migration:** nếu cần schema change, viết migration file (lib/supabase/migrations)
7. **RLS:** check policy phù hợp role (anon/authed/owner/staff)
8. **Test happy + edge path:** đặt thử 2 case ít nhất

---

**Tham chiếu:**
- [CLAUDE.md](CLAUDE.md) — kiến trúc tổng quan + anti-patterns + debug workflow
- [README.md] (TODO) — hướng dẫn setup local
- Supabase Dashboard: https://supabase.com/dashboard/project/quizttvwqovuatiznuyz
- Vercel Dashboard: https://vercel.com/minhnghia0897-archs-projects/guna-2026
