# TESTING.md — QA Checklist GUNA GIFT

> Mục đích: checklist test thủ công đầy đủ trước mỗi lần deploy production.
> Không thay thế automated test — đây là smoke test + acceptance test cho người làm QA hoặc dev tự test.

---

## 0. Quy tắc test

1. **Test trên staging trước**, không bao giờ test trực tiếp trên production sau khi đã có dữ liệu thật.
2. **Mỗi lần test = 1 trạng thái sạch**: clear cookies, dùng tab ẩn danh, hoặc tạo user mới.
3. **Test cả happy path lẫn edge case** — không test xong happy path là xong.
4. **Khi tìm thấy bug**: chụp screenshot console + network + state, không chỉ mô tả "không vào được".
5. **Sau fix, phải test lại từ đầu luồng đó** — không assume "chỉ chỗ kia thôi".

---

## 1. Smoke test sau mỗi deploy (5 phút)

Chạy ngay sau khi Vercel deploy thành công:

- [ ] `https://guna-2026.vercel.app/` → trang chủ load, không có console error
- [ ] `/products` → list sản phẩm hiện đầy đủ, ảnh hiện
- [ ] Click 1 sản phẩm → trang chi tiết load, ảnh + giá + mô tả OK
- [ ] Click "Thêm vào giỏ" → cart drawer mở, item xuất hiện
- [ ] `/admin/login` → form đăng nhập hiện
- [ ] Login admin → vào được `/admin`, không redirect loop
- [ ] `/admin/orders` → list đơn hàng load
- [ ] Logout admin → quay về `/admin/login`

**Nếu 1 mục FAIL → rollback deploy ngay** (Vercel → Deployments → Promote previous).

---

## 2. Customer journey — full flow

### 2.1 Đăng ký user mới
- [ ] Vào `/account/register`
- [ ] Nhập email + password (≥ 6 ký tự) + tên + phone → Submit
- [ ] Tự động đăng nhập, redirect về `/account`
- [ ] Profile hiện tên + email đúng
- [ ] Trong Supabase: row mới trong `auth.users` + `profiles` (role = `customer`, tier = `bronze`)
- [ ] **Edge case**: email đã tồn tại → hiện error "Email đã được sử dụng"
- [ ] **Edge case**: password < 6 ký tự → hiện error
- [ ] **Edge case**: email format sai → hiện error
- [ ] **Edge case**: spam click submit → chỉ tạo 1 user (loading state hoạt động)

### 2.2 Đăng nhập user
- [ ] `/account/login` → nhập email + password đúng → vào `/account`
- [ ] Sai password → "Email hoặc mật khẩu không đúng"
- [ ] Email không tồn tại → cùng error (không leak existence)
- [ ] **Mở redirect**: `/account/login?redirect=https://evil.com` → redirect về `/account` (không về evil.com)
- [ ] **Internal redirect**: `/account/login?redirect=/account/orders` → vào đúng `/account/orders`
- [ ] Refresh page sau login → vẫn đăng nhập (cookie persist)

### 2.3 Quên mật khẩu
- [ ] `/account/forgot-password` → nhập email → "Đã gửi email"
- [ ] Email không tồn tại → vẫn hiện success (không leak)
- [ ] Click link trong email → vào `/account/reset-password`
- [ ] Đặt password mới → login được với password mới

### 2.4 Browse + thêm giỏ hàng
- [ ] `/products` → filter theo category hoạt động
- [ ] `/products?search=trung+thu` → search trả kết quả đúng
- [ ] Click sản phẩm → trang chi tiết
- [ ] Thay đổi số lượng → giá cập nhật
- [ ] Thêm vào giỏ → drawer mở, items đúng
- [ ] Đóng drawer, thêm sản phẩm khác → drawer cộng dồn quantity (cùng slug)
- [ ] Refresh page → giỏ hàng vẫn còn (localStorage)
- [ ] Tăng/giảm/xóa item trong drawer → giá cập nhật
- [ ] Subtotal + shipping progress bar đúng

### 2.5 Wishlist
- [ ] Khi anon: click "Yêu thích" → lưu localStorage, icon đổi
- [ ] Đăng nhập → wishlist anon merge vào DB (table `wishlist_items`)
- [ ] Vào `/account/wishlist` → list sản phẩm đúng
- [ ] Bỏ yêu thích → biến mất khỏi list

### 2.6 Checkout (anon — không đăng nhập)
- [ ] Có item trong giỏ → vào `/checkout`
- [ ] Form nhập tên, phone, email, địa chỉ → Submit
- [ ] Order tạo thành công, redirect `/checkout/success?id=...`
- [ ] Trong DB: order có `user_id = NULL`, `customer_name/phone/email` lưu đúng
- [ ] `order_items` có đủ items, đúng quantity + price
- [ ] **Edge case**: voucher hợp lệ → discount áp dụng, voucher_used +1
- [ ] **Edge case**: voucher hết hạn → reject với message rõ ràng
- [ ] **Edge case**: voucher dưới min_order_amount → reject
- [ ] **Edge case**: stock = 0 → cảnh báo, không cho đặt
- [ ] Trang success: hiện thông tin đơn, KHÔNG hiện link "Xem chi tiết đơn" (anon không có account)

### 2.7 Checkout (đã đăng nhập)
- [ ] Form auto-fill từ profile + default address
- [ ] Đặt hàng → order có `user_id = auth.uid()`
- [ ] `/account/orders` → đơn mới hiện ngay
- [ ] Trang success: có link "Xem chi tiết đơn" → vào `/account/orders/{id}`

### 2.8 Account management
- [ ] `/account` → hiển thị thông tin profile, tier, tổng chi tiêu
- [ ] Edit profile → lưu thành công, refresh hiện đúng
- [ ] `/account/addresses` → thêm/sửa/xóa địa chỉ
- [ ] Set 1 address default → các địa chỉ khác mất default (chỉ 1 default tại 1 thời điểm)
- [ ] `/account/orders` → list đơn của user, có status badge
- [ ] Click 1 đơn → trang chi tiết, đầy đủ items + status timeline
- [ ] **Edge case**: user A không xem được order của user B (RLS chặn)

### 2.9 Reviews
- [ ] Trang sản phẩm → list reviews
- [ ] User đã mua sản phẩm này (có order `delivered`) → form review hiện
- [ ] User chưa mua → không thấy form review
- [ ] Submit review (rating 1-5 + text) → review xuất hiện
- [ ] Click "Hữu ích" trên review → counter +1, không +2 khi click 2 lần (debounce/idempotent)
- [ ] Trang sản phẩm: average rating cập nhật

---

## 3. Admin journey

### 3.1 Login
- [ ] `/admin/login` (KHÔNG dùng `/account/login`)
- [ ] Login với admin account → vào `/admin`
- [ ] Login với customer account → reject "Tài khoản không có quyền quản trị"
- [ ] Truy cập `/admin/orders` khi chưa login → redirect `/admin/login`
- [ ] Logout admin → quay về `/admin/login`, không còn cookie

### 3.2 Dashboard
- [ ] `/admin` → hiện thống kê (số đơn, doanh thu, sản phẩm low stock)
- [ ] Số liệu khớp với DB

### 3.3 Quản lý sản phẩm
- [ ] `/admin/products` → list đầy đủ
- [ ] Tạo sản phẩm mới → upload ảnh OK, lưu thành công, hiện ngay trên `/products`
- [ ] Edit sản phẩm → đổi giá → reflect trên `/products/{slug}` ngay
- [ ] Xóa sản phẩm → biến mất khỏi `/products`
- [ ] **Edge case**: sản phẩm đã có order → KHÔNG cho xóa hoặc xóa mềm
- [ ] Upload ảnh nhiều → gallery hiển thị đúng thứ tự

### 3.4 Quản lý đơn hàng
- [ ] `/admin/orders` → list đầy đủ, filter theo status hoạt động
- [ ] Click 1 đơn → trang chi tiết
- [ ] Đổi status `pending` → `confirmed` → click "Lưu" → toast success, không stuck "Đang lưu..."
- [ ] Refresh trang → status đã đổi
- [ ] Trong DB: `order_status_logs` có row mới với `from_status` + `to_status` + `note`
- [ ] Đổi status `confirmed` → `shipping` → nhập tracking number → lưu
- [ ] `shipping` → `delivered` → trigger upgrade tier (nếu user đủ ngưỡng)
- [ ] Hủy đơn (`cancelled`) → KHÔNG trừ stock thêm, KHÔNG cộng tier

### 3.5 Quản lý voucher
- [ ] Tạo voucher mới (code, type, value, min_order, usage_limit, expires_at)
- [ ] Voucher hoạt động trên checkout
- [ ] Sau khi user dùng voucher → `used_count` +1
- [ ] Khi `used_count >= usage_limit` → voucher reject

### 3.6 CMS
- [ ] `/admin/articles` → tạo bài viết → hiện trên `/articles`
- [ ] `/admin/settings/general` → đổi logo, tên shop, contact info → reflect trên header/footer
- [ ] Đổi banner trang chủ → reflect ngay (revalidate)

### 3.7 Phân quyền
- [ ] User role `customer` truy cập `/admin/*` → redirect `/admin/login` hoặc 403
- [ ] User role `staff` truy cập admin → vào được nhưng giới hạn (nếu có phân quyền chi tiết)
- [ ] User role `admin` → full access

---

## 4. Edge cases bắt buộc test

### 4.1 Concurrency
- [ ] 2 user cùng đặt sản phẩm có stock = 1 → chỉ 1 user thành công, user kia báo hết hàng
- [ ] User đặt 1 voucher có usage_limit = 1, 2 tab cùng submit → chỉ 1 thành công

### 4.2 Network
- [ ] Tắt WiFi giữa lúc đặt hàng → form hiện error, KHÔNG kẹt loading vĩnh viễn
- [ ] Slow 3G (Chrome DevTools) → loading state hiện đầy đủ, button disable

### 4.3 Browser
- [ ] Test Chrome desktop + mobile
- [ ] Test Safari iOS (cookie SameSite issue thường xảy ra)
- [ ] Test Firefox
- [ ] Tab ẩn danh (incognito) — quan trọng cho test cookie

### 4.4 Responsive
- [ ] Mobile (375px): nav menu, cart drawer, checkout form
- [ ] Tablet (768px)
- [ ] Desktop (1280px+)

### 4.5 SEO + Meta
- [ ] View source `/products/{slug}` → có meta title + description
- [ ] OpenGraph image hiện khi share Facebook/Zalo
- [ ] Sitemap `/sitemap.xml` accessible

---

## 5. Performance test

- [ ] Lighthouse score ≥ 80 (Performance, Accessibility, SEO) trên trang chủ
- [ ] First Contentful Paint < 2s trên 4G
- [ ] Trang sản phẩm load < 3s
- [ ] Image lazy load hoạt động (chỉ load khi scroll tới)

---

## 6. Regression checklist (sau mỗi feature mới)

Khi thêm/sửa code, check 5 trang quan trọng nhất KHÔNG bị vỡ:

1. [ ] Trang chủ `/`
2. [ ] List sản phẩm `/products`
3. [ ] Chi tiết sản phẩm `/products/{slug}`
4. [ ] Checkout `/checkout`
5. [ ] Admin orders `/admin/orders`

Mở console — KHÔNG có error đỏ. Mở Network — KHÔNG có request fail (4xx/5xx) trừ khi có ý đồ.

---

## 7. Pre-launch checklist (trước go-live thật)

### Kỹ thuật
- [ ] Tất cả env vars trên Vercel đã set (NEXT_PUBLIC_SUPABASE_URL, ANON_KEY, SUPABASE_SERVICE_ROLE_KEY)
- [ ] Custom domain `gunagift.vn` đã point + SSL active
- [ ] `robots.txt` cho phép index
- [ ] Google Analytics / Facebook Pixel đã wire (nếu có)
- [ ] Email transactional (Resend) test gửi thật

### Dữ liệu
- [ ] Sản phẩm thật đã import (không còn data FarMơ)
- [ ] Logo thật đã upload qua admin/settings
- [ ] Banner trang chủ đã đổi
- [ ] Article "About us", "Chính sách bảo mật", "Điều khoản" đã có
- [ ] Footer info (hotline, email, địa chỉ) đã update

### Bảo mật
- [ ] Đã đổi password admin mặc định (`12345678` → password mạnh)
- [ ] Service role key KHÔNG xuất hiện trong client bundle (check Network tab)
- [ ] RLS policy đã review (xem SECURITY.md)

### Pháp lý
- [ ] Trang "Chính sách bảo mật" có
- [ ] Trang "Điều khoản sử dụng" có
- [ ] Form checkout có checkbox "Đồng ý điều khoản"

---

## 8. Bug report template

Khi tìm bug, ghi rõ:

```
## Bug: [tóm tắt 1 dòng]

### Trang
URL: ...

### Bước tái hiện
1. ...
2. ...
3. ...

### Kết quả mong đợi
...

### Kết quả thực tế
...

### Console error
[paste full error stack]

### Network request fail (nếu có)
[Method, URL, Status, Response body]

### Browser + device
Chrome 120 / iPhone 14 / 1280px
```

Bug không có console + network info = bug chưa thể debug.
