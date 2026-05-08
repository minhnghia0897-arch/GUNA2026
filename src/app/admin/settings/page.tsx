import Link from "next/link";
import {
  IconUser, IconFlower, IconDashboard, IconArticle as IconDoc,
  IconArticle, IconRevenue, IconTruck, IconMail, IconCustomers, IconVoucher,
} from "@/components/icons";

export const metadata = { title: "Cài đặt | Quản trị GUNA GIFT" };

const SECTIONS = [
  { title: "Thông tin shop", description: "Tên cửa hàng, logo, hotline, email, địa chỉ, social", Icon: IconUser, href: "/admin/settings/general", ready: true },
  { title: "Banners", description: "Hero homepage, hero mobile, banner danh mục, strip khuyến mãi", Icon: IconFlower, href: "/admin/settings/banners", ready: true },
  { title: "Content blocks", description: "Sửa nội dung Hero/About/Why/Contact… trên homepage", Icon: IconDashboard, href: "/admin/settings/sections", ready: true },
  { title: "Chính sách", description: "Giao hàng, đổi trả, bảo mật, điều khoản — Markdown editor", Icon: IconDoc, href: "/admin/settings/policies", ready: true },
  { title: "FAQ", description: "Câu hỏi thường gặp theo danh mục", Icon: IconVoucher, href: "/admin/settings/faq", ready: true },
  { title: "Bài viết / Blog", description: "Tạo/sửa bài viết, phân loại, xuất bản", Icon: IconArticle, href: "/admin/articles", ready: true },
  { title: "Phương thức thanh toán", description: "VNPay, MoMo, COD (cấu hình)", Icon: IconRevenue, href: "#", ready: false },
  { title: "Phí vận chuyển", description: "GHN integration, freeship threshold", Icon: IconTruck, href: "#", ready: false },
  { title: "Email transactional", description: "Templates xác nhận đơn (Resend)", Icon: IconMail, href: "#", ready: false },
  { title: "Nhân viên", description: "Mời staff, phân quyền role", Icon: IconCustomers, href: "#", ready: false },
];

export default function AdminSettingsPage() {
  return (
    <div className="space-y-5">
      <h1 className="font-serif text-2xl text-burgundy">Cài đặt</h1>
      <p className="text-sm text-gray-500">Quản lý nội dung và cấu hình cửa hàng. Mọi thay đổi cập nhật ngay trên storefront.</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {SECTIONS.map((s) => {
          const Icon = s.Icon;
          return (
            <Link
              key={s.title}
              href={s.href}
              className={`bg-white rounded-xl border p-5 transition-all group ${
                s.ready
                  ? "border-gold/10 hover:shadow-lg hover:shadow-burgundy/5 hover:border-gold/30"
                  : "border-gray-100 opacity-60"
              }`}
            >
              <div className="w-11 h-11 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center mb-4 text-gold group-hover:bg-burgundy group-hover:text-white group-hover:border-burgundy transition-colors">
                <Icon className="w-5 h-5" strokeWidth={1.5} />
              </div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-serif text-base text-burgundy">{s.title}</h3>
                {!s.ready && <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded">Sắp ra mắt</span>}
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">{s.description}</p>
            </Link>
          );
        })}
      </div>

      <div className="bg-cream rounded-xl p-5 text-sm text-gray-600">
        <p className="font-medium text-burgundy mb-2">Mọi thay đổi cập nhật real-time trên storefront</p>
        <p className="text-xs">Cache 60s cho products, 5 phút cho blog/sections. Có thể clear cache bằng deploy hoặc đợi.</p>
      </div>
    </div>
  );
}
