# GUNA GIFT — Hướng dẫn vận hành & luồng e-commerce

> Document tham chiếu cho Claude và developer khi làm việc với codebase. Mỗi luồng có **file path cụ thể**, **DB tables/triggers/RLS liên quan**, và **checkpoint xác minh "xong"**.

---

## 1. Stack & cấu trúc

- **Frontend:** Next.js 15 (App Router), TypeScript strict, Tailwind v4
- **Backend:** Supabase (Postgres + Auth + Storage + RLS)
- **Hosting:** Vercel (project `guna-2026`)
- **Repo:** `https://github.com/minhnghia0897-arch/GUNA2026`
- **Auth:** `@supabase/ssr` v0.10+ — cookie-based session

```
src/
├── app/                       # Next.js routes
│   ├── (storefront)/          # Public pages: /, /products, /about, /faq, /blog, /policies
│   ├── account/               # User: /account, /account/orders, /account/addresses, /account/wishlist...
│   ├── admin/                 # Admin: /admin/*, /admin/login (separate auth flow)
│   ├── api/auth/              # Server-side auth route handlers (signin, signout)
│   ├── checkout/              # Order placement
│   └── cart/
├── components/                # Client + server components
├── context/                   # React contexts (Cart, Wishlist, Toast, SiteConfig)
├── lib/
│   ├── supabase/
│   │   ├── client.ts          # Browser client (createBrowserClient)
│   │   ├── server.ts          # Server client (createServerClient + cookies())
│   │   ├── middleware.ts      # updateSession() for middleware
│   │   ├── static.ts          # Cookie-free client for build-time static gen
│   │   └── queries.ts, cms.ts # Pre-built fetchers
│   ├── seo.ts                 # SITE constants + metadata builders
│   └── format.ts              # Number/price helpers
└── middleware.ts              # Auth gates + x-pathname header
```

---

## 2. Nguyên tắc làm việc (BẮT BUỘC follow)

1. **Suy nghĩ trước khi làm** — đọc log/error thật, không đoán mò
2. **Sửa đúng chỗ cần sửa** — fix root cause, không patch triệu chứng
3. **Review sâu, test tìm bug** — grep pattern tương tự, build verify
4. **Đánh giá tiêu chí thành công** — định nghĩa ≥3 acceptance criteria trước khi claim "done"

Reference: `~/.claude/projects/-Users-mac/memory/feedback_working_method.md`

---

## 3. Luồng KHÁCH HÀNG (Customer Journey)

### 3.1. Đăng ký
- **Page:** [src/app/account/register/page.tsx](src/app/account/register/page.tsx)
- **API:** `supabase.auth.signUp()` (browser client)
- **DB tác động:** insert `auth.users`, trigger tự tạo row `public.profiles`
- **⚠️ Yêu cầu:** Supabase setting `Allow new users to sign up` phải = `true`. Nếu disable → 422 "Signups not allowed". Bật tại Dashboard → Authentication → Providers → Email.
- **Test:**
  - [ ] Form submit không kẹt loading
  - [ ] Tạo được user → tự login → redirect `/account`
  - [ ] Profile có role default = `customer`

### 3.2. Đăng nhập (user thường)
- **Page:** [src/app/account/login/page.tsx](src/app/account/login/page.tsx)
- **API:** `supabase.auth.signInWithPassword()` (browser client)
- **Redirect:** Validate redirect param chỉ accept internal path (`/...`, không `//` hoặc external)
- **Test:**
  - [ ] Sai password → toast lỗi, button reset
  - [ ] Đúng → redirect `/account` (hoặc `?redirect=...`)
  - [ ] Cookies set → middleware nhận diện ở route protected

### 3.3. Đăng nhập ADMIN (luồng riêng)
- **Page:** [src/app/admin/login/page.tsx](src/app/admin/login/page.tsx)
- **API:** **POST `/api/auth/admin-signin`** ([route handler server-side](src/app/api/auth/admin-signin/route.ts))
- **Vì sao server-side?** Browser-side `signInWithPassword` set cookies qua `document.cookie` → có race với middleware edge. Server-side dùng `Set-Cookie` response header → đồng bộ guaranteed.
- **Role check:** Server reject nếu `profile.role` không phải `admin` hoặc `staff`.
- **Sau success:** `window.location.href = "/admin"` (hard reload, không `router.push`)
- **Test:**
  - [ ] Admin user login → redirect `/admin` → AdminShell render
  - [ ] Customer user thử login admin → reject + toast "Tài khoản không có quyền"
  - [ ] Sai mật khẩu → toast cụ thể

### 3.4. Browse sản phẩm
- **Pages:** [src/app/products/page.tsx](src/app/products/page.tsx), [src/app/products/[slug]/page.tsx](src/app/products/[slug]/page.tsx)
- **Data:** [`fetchAllProducts()`](src/lib/supabase/queries.ts), `fetchProductBySlug()`
- **DB:** `products` table (RLS: SELECT visible products cho all roles)
- **`generateStaticParams`:** dùng [static client](src/lib/supabase/static.ts) (cookie-free) để build prerender

### 3.5. Cart
- **Storage:** localStorage key `farmo-cart` (giữ tên cũ để không clear data của user hiện có)
- **Context:** [src/context/CartContext.tsx](src/context/CartContext.tsx)
- **Add to cart:** `addItem(product, quantity)` — không validate stock ở đây (chỉ validate ở checkout)
- **Voucher apply:** [src/app/cart/page.tsx](src/app/cart/page.tsx) — query `vouchers` table, validate `is_active`, `ends_at`, `min_order`. Lưu vào `sessionStorage` key `farmo-checkout-voucher` khi click "Tiến hành thanh toán".

### 3.6. Checkout (CRITICAL FLOW)
- **Page:** [src/app/checkout/page.tsx](src/app/checkout/page.tsx)
- **3-step UI:** Shipping → Payment → Success
- **Voucher:** đọc từ sessionStorage, recompute discount client-side (server cũng nhận giá trị)
- **Stock validation:** Query `products` đảm bảo `stock_count >= quantity` trước khi tạo order. Nếu fail → toast cụ thể "X chỉ còn N sản phẩm"
- **Order creation:** **RPC `create_order()`** ([migration 018](https://supabase.com/dashboard/project/quizttvwqovuatiznuyz/sql)) — SECURITY DEFINER, tạo `orders` + `order_items` trong 1 transaction.
- **Vì sao RPC?** Direct REST INSERT vào `orders` table BỊ CHẶN bởi RLS cho anon role (verified qua nhiều cách). RPC bypass RLS, capture `auth.uid()` bên trong function.
- **Voucher used_count:** sau order thành công, gọi RPC `increment_voucher_used(code)`.
- **Test (acceptance criteria):**
  - [ ] Anon user (chưa login) đặt được hàng → order có `user_id=null`
  - [ ] Authed user đặt → order có `user_id = auth.uid()`
  - [ ] Stock = 0 → reject + toast
  - [ ] Voucher percentage 10% → discount tính đúng
  - [ ] Voucher freeship → shipping_fee = 0
  - [ ] Order hiển thị trên success page với mã FM00001NNN
  - [ ] Anon user → success page chỉ hiện link "Đăng nhập để theo dõi" (không link `/account/orders/...`)

### 3.7. Order tracking
- **List:** [src/app/account/orders/page.tsx](src/app/account/orders/page.tsx) — RLS lọc theo `user_id = auth.uid()`
- **Detail:** [src/app/account/orders/[id]/page.tsx](src/app/account/orders/[id]/page.tsx) — lookup theo `order_code`. Cancel allowed khi status=`pending` & < 30 phút.
- **⚠️ Anon orders không xem lại được** — RLS chặn (policy: `auth.uid() = user_id`, `null != null`). Limitation đã accept.

### 3.8. Đăng xuất
- **Implementation:** Form POST đến `/api/auth/signout?redirect=/`
- **Route handler:** [src/app/api/auth/signout/route.ts](src/app/api/auth/signout/route.ts) — server-side `supabase.auth.signOut()` clear cookies qua `Set-Cookie` response.
- **Vì sao server-side?** Browser-side `signOut({ scope: "local" })` không clear server-set httpOnly cookies hoàn toàn.

---

## 4. Luồng ADMIN

### 4.1. Auth gate
- Middleware ([src/middleware.ts](src/middleware.ts)) redirect `/admin/*` → `/admin/login` nếu không có user.
- Layout ([src/app/admin/layout.tsx](src/app/admin/layout.tsx)) check `profile.role IN ('admin','staff')`. Sai → redirect `/?error=unauthorized`.
- Header `x-pathname` set bởi middleware → layout đọc để biết có phải `/admin/login` không (skip auth check ở trang login).

### 4.2. Order management
- **List:** [src/app/admin/orders/page.tsx](src/app/admin/orders/page.tsx) — staff thấy tất cả qua RLS `is_staff()` policy
- **Detail + status update:** [OrderStatusUpdater.tsx](src/app/admin/orders/[id]/OrderStatusUpdater.tsx) — UPDATE `orders.status` trigger:
  - `log_order_status_change()` → INSERT `order_timeline` (label tiếng Việt)
  - `update_profile_stats()` → cập nhật `total_orders`, `total_spent`, `tier` khi status='delivered'

### 4.3. Product CRUD
- **Form:** [ProductForm.tsx](src/app/admin/products/ProductForm.tsx)
- **Image upload:** [ImageGalleryUpload.tsx](src/components/admin/ImageGalleryUpload.tsx) — multi-file, max 10, 5MB/file. Bucket `product-images`. First image = main.
- **Delete:** Hard delete (không soft delete). Cảnh báo confirm.

### 4.4. CMS (Site settings)
- **General:** logo, hotline, email, hero CTAs ([general/GeneralSettingsForm.tsx](src/app/admin/settings/general/GeneralSettingsForm.tsx))
- **Banners, Sections, Policies, FAQ:** mỗi cái 1 trang riêng
- **Sau khi save:** gọi `revalidateStorefront(scope)` server action để invalidate Next.js cache.

---

## 5. Database — DB tables, triggers, RPCs

### Tables
| Table | Purpose | Key columns |
|---|---|---|
| `profiles` | User info + role + stats | `id` (auth.users.id), `role`, `tier`, `total_spent` |
| `products` | Catalog | `slug` (unique), `category_slug`, `stock_count`, `is_visible` |
| `categories` | Product cats | `slug`, `label`, `position` |
| `orders` | Đơn hàng | `order_code` (FM00001NNN), `user_id`, `status`, `voucher_code`, `discount` |
| `order_items` | Snapshot products tại thời điểm order | `product_id` (nullable nếu deleted), `unit_price`, `quantity` |
| `order_timeline` | Audit log status changes | trigger insert |
| `addresses` | User saved addresses | RLS self-only |
| `wishlists` | User wishlist | composite key `(user_id, product_id)` |
| `reviews` | Product reviews | `status` ('pending'/'published'/'rejected'), `helpful_count` |
| `vouchers` | Discount codes | `code`, `discount_type` (percentage/fixed/freeship), `used_count` |
| `articles` | Blog posts | `slug`, `status` (draft/published) |
| `site_settings` | CMS singleton (id='main') | logo, hotline, email, hero, social |
| `banners`, `site_sections`, `policies`, `faqs` | CMS content |
| `newsletter_subscribers` | Email list |

### Triggers (BEFORE/AFTER, all SECURITY DEFINER)
| Trigger | Event | Function | Purpose |
|---|---|---|---|
| `trg_generate_order_code` | BEFORE INSERT orders | `generate_order_code()` | Set `order_code = FM00001NNN` |
| `trg_log_order_status` | AFTER INSERT/UPDATE orders | `log_order_status_change()` | INSERT order_timeline (Vietnamese labels) |
| `trg_decrease_stock` | AFTER INSERT order_items | `decrease_stock()` | `products.stock_count -= quantity` (clamp 0) |
| `trg_update_profile_stats` | AFTER INSERT/UPDATE orders | `update_profile_stats()` | Cập nhật profile khi status='delivered' |
| `trg_recalc_rating` | AFTER INSERT/UPDATE/DELETE reviews | `recalc_product_rating()` | Avg rating + count |
| `trg_*_updated_at` | BEFORE UPDATE | `set_updated_at()` | Timestamp |

### RPCs
| RPC | Purpose | Caller |
|---|---|---|
| `is_staff()` | Check current user is admin/staff | RLS policies |
| `create_order(...)` | Anon-friendly order creation, bypass RLS | Checkout |
| `increment_review_helpful(review_id)` | Atomic helpful++ | ReviewSection |
| `increment_voucher_used(code)` | Atomic used_count++ | Checkout post-order |

### RLS Patterns
- **Self-only tables** (`profiles`, `addresses`, `wishlists`, `reviews_owner_*`): `auth.uid() = user_id`
- **Public read + staff write** (`products`, `categories`, `articles`): SELECT public if `is_visible`, ALL for `is_staff()`
- **Owner OR staff** (`orders`, `order_items`, `order_timeline`): SELECT owner or staff
- **Anon insert** (`orders` via RPC): bypass RLS via SECURITY DEFINER
- **Storage** (`product-images`, `site-assets`): public read, staff write

---

## 6. Anti-patterns (đã gặp, KHÔNG được lặp)

### 6.1. Loading state stuck — thiếu try/finally
**Anti-pattern:**
```tsx
setLoading(true);
const { error } = await supabase...;
setLoading(false); // ← không chạy nếu await throw
```
**Fix:** luôn dùng `try { ... } catch { toast.error } finally { setLoading(false) }`.

### 6.2. Rules of Hooks violation
**Anti-pattern:**
```tsx
const [x, setX] = useState();
if (someCondition) return null; // ← early return
useEffect(() => {...}); // ← hook AFTER return = react error #310
```
**Fix:** mọi hooks PHẢI gọi BEFORE early return. Đặt `if (skip) return null;` ở cuối.

### 6.3. useEffect deps làm re-fetch loop
**Anti-pattern:**
```tsx
const supabase = createClient(); // new instance mỗi render
useEffect(() => {...}, [supabase]); // ← re-fire vô hạn
```
**Fix:** đưa `createClient()` vào trong useEffect, hoặc dùng `[]`/string key. Thêm `cancelled` guard.

### 6.4. Cookie sync race (browser-side auth)
**Anti-pattern:**
```tsx
await supabase.auth.signInWithPassword(...); // browser-side
window.location.href = "/admin"; // cookies có thể chưa sync với edge
```
**Fix:** dùng server-side route handler (`/api/auth/*`) để set cookies qua `Set-Cookie` response header.

### 6.5. Anon RLS INSERT bị chặn
**Anti-pattern:** đặt RLS với `(user_id IS NULL OR user_id = auth.uid())` rồi expect anon insert work.
**Reality:** PostgREST + RLS quirk khiến anon insert thất bại dù policy đánh giá ra TRUE.
**Fix:** Dùng RPC SECURITY DEFINER cho mọi flow cần anon insert.

### 6.6. Open redirect
**Anti-pattern:** `router.push(params.get("redirect"))` không validate.
**Fix:** chỉ accept internal path (`startsWith("/")`, không `//`).

### 6.7. Order status transition không validate
Hiện tại admin có thể set bất kỳ status nào → bất kỳ status nào. Acceptable cho prototype, nên thêm state machine khi scale.

---

## 7. Khi gặp bug mới — quy trình debug

1. **YÊU CẦU console error/screenshot từ user trước khi đoán** — không tự fix dựa trên triệu chứng.
2. **Đọc log thật:**
   - Vercel runtime logs (server-side errors)
   - Supabase auth logs (login failures)
   - Supabase postgres logs (RLS errors, trigger failures)
   - Browser DevTools Console + Network
3. **Reproduce:** test bằng curl/SQL khi có thể (loại trừ browser-specific issues).
4. **Localize:** grep pattern tương tự trong codebase (anti-pattern thường lặp).
5. **Fix root + verify:** build pass + manual test ít nhất 2 paths (happy + edge).
6. **Document:** add anti-pattern vào section 6 nếu là pattern mới.

---

## 8. Deploy & infrastructure

### Vercel
- **Project:** `prj_83QeSu969y4ioK1XOpVBmzF0Rb2x`
- **Domain:** `guna-2026.vercel.app`
- **Env vars:**
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Framework preset:** Next.js (force qua `vercel.json` nếu auto-detect fail)
- **Deployment Protection:** **Disabled** (toggle "Require Log In" OFF) — nếu bật, public không truy cập được

### Supabase
- **Project ID:** `quizttvwqovuatiznuyz`
- **Storage buckets:** `product-images` (5MB), `site-assets` (10MB)
- **Migrations applied:** 001-018 (xem [supabase migrations](https://supabase.com/dashboard/project/quizttvwqovuatiznuyz/database/migrations))
- **Auth providers:** Email — bật/tắt signup tại Auth → Providers → Email

### Git
- **Repo:** `https://github.com/minhnghia0897-arch/GUNA2026`
- **Branch:** `main` (deploy auto từ Vercel GitHub integration)

---

## 9. Tiêu chí "xong" cho mỗi commit

Trước khi push, verify ≥3 trong 5 checkpoint sau:
- [ ] **Build pass** — `npm run build` không error
- [ ] **TypeScript pass** — không type error mới
- [ ] **Test happy path** — feature mới chạy đúng manually
- [ ] **Test edge cases** — error path có toast/error UI rõ ràng (không silent fail)
- [ ] **Anti-pattern check** — không lặp lại pattern ở section 6

Khi user báo bug:
- [ ] Đọc error message thật trước khi sửa
- [ ] Reproduce với data thật (curl/SQL)
- [ ] Define ≥3 acceptance criteria trước khi claim "done"
- [ ] Verify từng criteria sau fix

---

## 10. Roadmap còn thiếu

**🔴 Critical cho launch:**
- [ ] Email transactional (Resend) — wire `/api/email/order-confirmation`
- [ ] Sản phẩm thật (Trung Thu/Tết) thay sample data
- [ ] Logo thật upload qua admin/settings/general
- [ ] Custom domain `gunagift.vn` → Vercel

**🟡 Quan trọng:**
- [ ] Payment gateway (VNPay/MoMo) — cần merchant
- [ ] Banners + sections homepage cho GUNA GIFT
- [ ] About/Privacy/Terms nội dung thật

**🟢 Nice-to-have:**
- [ ] Admin moderation reviews (pending → published)
- [ ] Order status state machine validation
- [ ] Shipping API (GHN/GHTK)
- [ ] Analytics (GA4, FB Pixel)
- [ ] Error monitoring (Sentry)
