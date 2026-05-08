# SECURITY.md — Bảo mật & RLS audit GUNA GIFT

> Mục đích: tài liệu bảo mật của project — RLS policy, threat model, secrets management, audit checklist.
> Đọc trước khi: thêm bảng mới, đổi RLS, expose API mới, deploy production.

---

## 1. Mô hình bảo mật

### 1.1 Layers
```
[Client]
   │ (anon key, public)
   ▼
[Next.js Edge / Server]
   │
   ├─ Middleware: auth check, /admin redirect
   ├─ Route handler /api/auth/admin-signin: server-side login
   ├─ Server Component: read DB qua @supabase/ssr (cookie session)
   └─ Client Component: anon key, RLS bảo vệ
   │
   ▼
[Supabase Postgres]
   │
   ├─ RLS bật trên TẤT CẢ tables
   ├─ Policies kiểm soát SELECT/INSERT/UPDATE/DELETE theo auth.uid()
   ├─ SECURITY DEFINER functions cho ops cần escalate (create_order, increment_*)
   └─ Service role key CHỈ dùng server-side, không bao giờ client
```

### 1.2 Trust boundaries
- **Anon (chưa login)**: chỉ SELECT public data (products, articles, settings) + INSERT order qua RPC
- **Authenticated (customer)**: + đọc/sửa data của chính mình (`user_id = auth.uid()`)
- **Authenticated (admin/staff)**: full access qua RLS check `profiles.role IN ('admin','staff')`
- **Service role**: BYPASS RLS — chỉ dùng trong route handler có auth check riêng

---

## 2. Secrets management

### 2.1 Phân loại
| Secret | Nơi dùng | Public? |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | client + server | ✅ public OK |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | client + server | ✅ public OK (RLS bảo vệ) |
| `SUPABASE_SERVICE_ROLE_KEY` | **server only** | ❌ KHÔNG BAO GIỜ expose client |
| `RESEND_API_KEY` (sắp dùng) | server only | ❌ KHÔNG public |

### 2.2 Quy tắc
1. **Tên biến `NEXT_PUBLIC_*`** sẽ được Next.js inline vào client bundle → CHỈ đặt cho key thực sự an toàn để public.
2. Service role key **KHÔNG được phép** xuất hiện trong:
   - File `.env.local` đã commit (check `.gitignore`)
   - Client component (`"use client"`)
   - URL query string, console.log
3. **Check sau deploy**: mở DevTools → Sources → search `service_role` → phải KHÔNG match.
4. Nếu vô tình leak service role key → **rotate ngay** (Supabase Dashboard → Settings → API → Reset).

### 2.3 .env files
- `.env.local`: dev local, KHÔNG commit
- `.env.example`: commit (chỉ tên biến, không value)
- Vercel env vars: set qua dashboard, scope = Production / Preview / Development riêng

---

## 3. RLS policy — checklist từng bảng

> Tất cả bảng MUST có `ALTER TABLE ... ENABLE ROW LEVEL SECURITY;`. Bảng quên enable = lỗ hổng.

### 3.1 `profiles`
- **SELECT**: user xem profile chính mình (`id = auth.uid()`); admin xem tất cả
- **UPDATE**: user sửa profile chính mình; KHÔNG được sửa `role` (chặn escalation)
- **INSERT**: trigger `handle_new_user` tạo từ `auth.users` (không qua RLS)
- **DELETE**: chỉ admin

**Audit**: thử SQL `UPDATE profiles SET role='admin' WHERE id = auth.uid()` từ user thường → phải FAIL.

### 3.2 `orders`
- **SELECT**: user xem đơn của mình (`user_id = auth.uid()`); admin/staff xem tất cả
- **INSERT**: chỉ qua RPC `create_order` (SECURITY DEFINER) — RLS direct INSERT có thể disable
- **UPDATE**: chỉ admin/staff
- **DELETE**: không cho phép (soft delete bằng `cancelled` status)

**Audit**: anon thử `SELECT * FROM orders` → phải trả về 0 rows.

### 3.3 `order_items`
- **SELECT**: chỉ khi user owner của parent order
- **INSERT**: qua RPC `create_order` (atomic với orders insert)
- **UPDATE/DELETE**: chỉ admin

### 3.4 `addresses`
- **SELECT/UPDATE/DELETE**: `user_id = auth.uid()`
- **INSERT**: `user_id = auth.uid()`
- Trigger BEFORE INSERT/UPDATE: nếu set `is_default=true` → tự set các address khác của user thành `false`

### 3.5 `wishlist_items`
- **SELECT/INSERT/DELETE**: `user_id = auth.uid()`

### 3.6 `reviews`
- **SELECT**: tất cả (public)
- **INSERT**: user đã mua sản phẩm + có order `delivered` (check qua RLS join hoặc trigger)
- **UPDATE**: chỉ owner của review, trong 7 ngày sau khi tạo
- **DELETE**: owner hoặc admin
- `helpful_count` tăng qua RPC `increment_review_helpful` (không cho UPDATE trực tiếp để tránh spam)

### 3.7 `vouchers`
- **SELECT**: tất cả (public, để client check code)
- **INSERT/UPDATE/DELETE**: chỉ admin
- `used_count` tăng qua RPC `increment_voucher_used`

### 3.8 `products`, `categories`, `articles`, `site_settings`
- **SELECT**: tất cả (public)
- **INSERT/UPDATE/DELETE**: chỉ admin/staff

### 3.9 `order_status_logs`
- **SELECT**: user xem log của order của mình; admin xem tất cả
- **INSERT**: trigger AFTER UPDATE trên orders (tự động ghi log)
- **UPDATE/DELETE**: không cho phép (audit trail bất biến)

---

## 4. RPC functions audit

Các function `SECURITY DEFINER` chạy với quyền owner (postgres) → BYPASS RLS. Mỗi function PHẢI:
1. **Set `search_path` rõ ràng** để tránh hijack: `SET search_path = public, pg_temp`
2. **Validate input** trước khi exec: kiểm tra type, range, ownership
3. **Có comment** giải thích why dùng SECURITY DEFINER

### 4.1 `create_order(...)`
- **Why DEFINER**: anon role không có INSERT trên orders/order_items
- **Validate**: items không rỗng, total > 0, voucher_code (nếu có) hợp lệ
- **Side effects**: insert orders + order_items + update voucher.used_count + decrease product.stock — TẤT CẢ trong 1 transaction
- **Threat**: anon spam đặt đơn → cân nhắc rate limit (chưa có)

### 4.2 `increment_review_helpful(review_id)`
- **Why DEFINER**: user không UPDATE trực tiếp được helpful_count
- **Threat**: user spam click → idempotent? (hiện tại không, có thể tăng vô hạn) → cân nhắc dùng bảng `review_helpful_votes` track per-user

### 4.3 `increment_voucher_used(voucher_code)`
- **Why DEFINER**: anon không UPDATE vouchers
- **Validate**: chỉ +1 khi `used_count < usage_limit`
- **Race condition**: 2 user cùng dùng voucher cuối cùng → atomic UPDATE với WHERE clause kiểm tra used_count

### 4.4 `handle_new_user()` (trigger)
- AFTER INSERT trên `auth.users` → tạo `profiles` row
- DEFINER vì cần INSERT vào `profiles` từ context auth schema

---

## 5. Threat model — top risks

### 5.1 ⚠️ Privilege escalation
**Threat**: customer tự update `profiles.role = 'admin'`.
**Mitigation**:
- RLS policy UPDATE trên `profiles` KHÔNG cho phép sửa cột `role` (dùng column-level policy hoặc trigger BEFORE UPDATE check)
- Test định kỳ bằng SQL từ user thường

### 5.2 ⚠️ Cross-user data access
**Threat**: user A xem được order của user B qua URL `/account/orders/{B_order_id}`.
**Mitigation**:
- RLS SELECT trên `orders`: `user_id = auth.uid()`
- Test: user A login, mở URL với order_id của user B → phải 404 hoặc empty

### 5.3 ⚠️ Open redirect
**Threat**: phishing qua `/account/login?redirect=https://evil.com`.
**Mitigation**: validate `redirect.startsWith("/") && !redirect.startsWith("//")` ✅ ĐÃ FIX

### 5.4 ⚠️ XSS qua user content
**Threat**: review/article có HTML/script.
**Mitigation**:
- React tự escape JSX text — KHÔNG dùng `dangerouslySetInnerHTML` cho user content
- Article admin: nếu dùng rich text editor → sanitize HTML (DOMPurify) trước khi render
- Image alt: escape

### 5.5 ⚠️ SQL injection
**Threat**: query string vào SQL.
**Mitigation**: dùng Supabase client method (`.eq()`, `.in()`, parameterized) — KHÔNG concat string vào raw SQL. Audit: grep `supabase.rpc` + raw `query` calls.

### 5.6 ⚠️ Stock race condition
**Threat**: 2 user cùng đặt sản phẩm stock=1 → cả 2 đều thành công, oversold.
**Mitigation**: trong RPC `create_order`, dùng `UPDATE products SET stock = stock - X WHERE id = Y AND stock >= X RETURNING *` — nếu `stock < X` thì update affect 0 rows → raise exception → rollback transaction.
**Status**: ⚠️ cần verify implementation hiện tại có check này chưa.

### 5.7 ⚠️ Voucher abuse
**Threat**:
- User dùng cùng 1 voucher 2 lần (qua 2 đơn riêng)
- 2 user cùng dùng voucher có usage_limit=1
**Mitigation**:
- Atomic UPDATE với check `used_count < usage_limit`
- Cân nhắc bảng `voucher_uses(voucher_id, user_id, order_id)` để track per-user limit

### 5.8 ⚠️ CSRF
**Threat**: form admin bị submit từ site khác.
**Mitigation**:
- Supabase auth dùng cookie SameSite=Lax (default) → chặn cross-site POST
- Route handler `/api/auth/admin-signin` chỉ accept POST với JSON body → simple form CSRF không exploit được
- Cân nhắc thêm CSRF token cho admin actions quan trọng (delete, status change)

### 5.9 ⚠️ Brute force login
**Threat**: bot thử password admin.
**Mitigation**:
- Supabase Auth có rate limit built-in (mặc định)
- Cân nhắc: thêm Cloudflare Turnstile vào `/admin/login` sau N lần fail
- Password admin tối thiểu 12 ký tự (current `12345678` là tạm — phải đổi trước go-live)

### 5.10 ⚠️ File upload abuse
**Threat**: upload file thực thi (.php, .exe) hoặc file quá lớn.
**Mitigation**:
- Supabase Storage bucket policy: chỉ cho upload `image/*` MIME
- Max size limit (default 50MB, nên giảm xuống 5MB cho ảnh sản phẩm)
- Validate extension client-side trước khi upload (UX)

---

## 6. Audit định kỳ

### Hàng tuần
- [ ] Check Vercel logs có lỗi 5xx bất thường không
- [ ] Check Supabase logs có failed auth attempts cao bất thường không

### Hàng tháng
- [ ] Chạy `pg_dump --schema-only` so sánh với last month — phát hiện schema drift không qua migration
- [ ] List tất cả `SECURITY DEFINER` functions: `SELECT proname FROM pg_proc WHERE prosecdef = true;` — review từng cái
- [ ] List bảng KHÔNG có RLS: `SELECT tablename FROM pg_tables WHERE schemaname='public' AND rowsecurity=false;` — phải = 0 (trừ bảng cố ý public)
- [ ] List policies: `SELECT * FROM pg_policies WHERE schemaname='public';` — review thay đổi

### Khi thêm bảng mới
1. [ ] `ALTER TABLE ... ENABLE ROW LEVEL SECURITY;`
2. [ ] Tạo policy SELECT/INSERT/UPDATE/DELETE rõ ràng cho từng role
3. [ ] Test từ anon, customer, admin riêng — mỗi role chỉ thấy/sửa được data đúng phạm vi
4. [ ] Add bảng vào section §3 của file này

### Khi thêm RPC mới
1. [ ] Quyết định: cần `SECURITY DEFINER` không? Nếu RLS đủ thì dùng `SECURITY INVOKER` (mặc định an toàn hơn)
2. [ ] Set `search_path = public, pg_temp`
3. [ ] Validate input (type + business rule)
4. [ ] Add vào section §4

---

## 7. Incident response

Nếu nghi ngờ bị compromise:

1. **Rotate ngay**: Supabase service role key, admin password, Resend API key
2. **Revoke sessions**: Supabase Dashboard → Authentication → Users → revoke all sessions
3. **Check audit log**:
   - `auth.users.last_sign_in_at` bất thường?
   - `order_status_logs` có thay đổi do user lạ?
   - `profiles.role = 'admin'` có user mới được set?
4. **Snapshot DB** trước khi sửa gì
5. **Disable login tạm**: tắt route `/admin/login` hoặc thêm IP allowlist tạm thời
6. **Notify user** (nếu có data leak): gửi email thông báo

---

## 8. Compliance / Legal

- **PII collected**: name, email, phone, địa chỉ (orders)
- **Lưu giữ**: theo Luật Bảo vệ dữ liệu cá nhân Việt Nam (Nghị định 13/2023)
- **Quyền user**: xóa account → phải xóa hoặc anonymize PII trong orders cũ
- **Cookie**: hiện không track third-party (Google Analytics chưa wire). Nếu thêm → cần lại CookieConsent (đã xóa)
- **Email transactional**: chỉ gửi khi user opt-in (đặt hàng = implicit consent cho email order). Marketing email cần checkbox "Đăng ký nhận tin"

---

## 9. Quick audit commands

```sql
-- Bảng chưa enable RLS
SELECT tablename FROM pg_tables
WHERE schemaname='public' AND rowsecurity=false;

-- Tất cả policies hiện tại
SELECT tablename, policyname, cmd, qual, with_check
FROM pg_policies
WHERE schemaname='public'
ORDER BY tablename, cmd;

-- SECURITY DEFINER functions
SELECT proname, prosrc
FROM pg_proc
WHERE pronamespace = 'public'::regnamespace
  AND prosecdef = true;

-- User có role admin
SELECT id, email, role FROM profiles WHERE role IN ('admin','staff');

-- Orders không có user_id (anon orders)
SELECT count(*) FROM orders WHERE user_id IS NULL;

-- Triggers
SELECT trigger_name, event_object_table, action_timing, event_manipulation
FROM information_schema.triggers
WHERE trigger_schema='public';
```

---

## 10. Known issues / TODO bảo mật

- [ ] Admin password mặc định `12345678` — phải đổi trước go-live
- [ ] Chưa có rate limit RPC `create_order` (anon spam đặt đơn)
- [ ] `helpful_count` chưa idempotent per-user — user có thể spam click
- [ ] Chưa có CSRF token cho admin actions (mức độ thấp do SameSite cookie nhưng nên thêm cho defense in depth)
- [ ] Chưa có Cloudflare Turnstile / captcha cho login + checkout
- [ ] Chưa wire monitoring (Sentry / LogRocket) cho production errors
- [ ] Chưa có IP allowlist cho `/admin/*` (cân nhắc nếu thật sự muốn lock down)
- [ ] Service role key chỉ được dùng trong route handler — chưa audit toàn bộ codebase xem có leak không

---

**Reference**: [CLAUDE.md](CLAUDE.md) cho architecture, [BUSINESS_LOGIC.md](BUSINESS_LOGIC.md) cho cascade rules, [TESTING.md](TESTING.md) cho test plan.
