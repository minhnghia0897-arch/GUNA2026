"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  IconDashboard, IconOrders, IconProducts, IconCustomers,
  IconVoucher, IconArticle, IconSettings, IconArrowLeft,
  IconChevronDown, IconLeaf, IconMail,
} from "@/components/icons";

type AdminUser = { name: string; email: string; role: string };

const NAV_ITEMS = [
  { label: "Tổng quan", href: "/admin", Icon: IconDashboard, exact: true },
  { label: "Đơn hàng", href: "/admin/orders", Icon: IconOrders },
  { label: "Sản phẩm", href: "/admin/products", Icon: IconProducts },
  { label: "Danh mục", href: "/admin/categories", Icon: IconLeaf },
  { label: "Khách hàng", href: "/admin/customers", Icon: IconCustomers },
  { label: "Voucher", href: "/admin/vouchers", Icon: IconVoucher },
  { label: "Bài viết", href: "/admin/articles", Icon: IconArticle },
  { label: "Newsletter", href: "/admin/newsletter", Icon: IconMail },
  { label: "Cài đặt", href: "/admin/settings", Icon: IconSettings },
];

export default function AdminShell({
  user,
  children,
}: {
  user: AdminUser;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  };

  const logout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut({ scope: "local" });
    } catch (err) {
      console.error("[admin logout] signOut failed", err);
    }
    const form = document.createElement("form");
    form.method = "POST";
    form.action = "/api/auth/signout?redirect=/";
    document.body.appendChild(form);
    form.submit();
  };

  return (
    <div className="min-h-screen bg-cream">
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-burgundy-950 text-white z-40 transform transition-transform lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-3 px-6 py-5 border-b border-white/5">
          <div className="w-10 h-10 rounded-full bg-gold/20 border-2 border-gold flex items-center justify-center">
            <span className="text-gold font-serif font-bold">F</span>
          </div>
          <div>
            <p className="font-serif text-gold text-base">GUNA GIFT</p>
            <p className="text-[10px] text-gold/50 uppercase tracking-[0.2em]">Quản trị</p>
          </div>
        </div>

        <nav className="p-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href, item.exact);
            const Icon = item.Icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  active
                    ? "bg-gold text-burgundy-950 font-medium shadow-md"
                    : "text-white/70 hover:bg-white/5 hover:text-gold"
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" strokeWidth={1.5} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 inset-x-0 p-3 border-t border-white/5">
          <Link href="/" className="flex items-center gap-2 px-3 py-2 text-xs text-white/50 hover:text-gold transition-colors">
            <IconArrowLeft className="w-4 h-4" />
            Về trang khách hàng
          </Link>
        </div>
      </aside>

      {open && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setOpen(false)} />
      )}

      <div className="lg:ml-64 min-h-screen flex flex-col">
        <header className="sticky top-0 z-20 bg-white border-b border-gold/10 px-4 sm:px-6 py-3 flex items-center justify-between">
          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden text-burgundy"
            aria-label="Menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="hidden lg:block flex-1" />

          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-3 hover:bg-cream px-3 py-1.5 rounded-lg transition-colors"
            >
              <div className="w-9 h-9 rounded-full bg-burgundy text-white flex items-center justify-center font-serif font-bold text-sm">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-sm font-medium text-burgundy">{user.name}</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">{user.role}</p>
              </div>
              <IconChevronDown className="w-4 h-4 text-gray-400" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-xl border border-gold/10 py-1 z-30">
                <p className="px-4 py-2 text-xs text-gray-500 border-b border-gold/10">{user.email}</p>
                <Link href="/account" className="block px-4 py-2 text-sm hover:bg-cream" onClick={() => setMenuOpen(false)}>
                  Tài khoản cá nhân
                </Link>
                <Link href="/admin/settings" className="block px-4 py-2 text-sm hover:bg-cream" onClick={() => setMenuOpen(false)}>
                  Cài đặt shop
                </Link>
                <button onClick={logout} className="w-full text-left px-4 py-2 text-sm hover:bg-cream text-red-600">
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
