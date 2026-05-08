"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";

const HIDE_PREFIXES = ["/checkout", "/admin"];

const items = [
  {
    label: "Trang chủ",
    href: "/",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    label: "Sản phẩm",
    href: "/products",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
  {
    label: "Tìm",
    href: "/search",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },
  {
    label: "Tài khoản",
    href: "/account",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { totalItems, openCart, isOpen } = useCart();

  const hidden = HIDE_PREFIXES.some((p) => pathname.startsWith(p)) || isOpen;
  if (hidden) return null;

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <>
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-gold/10 shadow-[0_-4px_20px_rgba(122,27,45,0.08)] safe-bottom"
        aria-label="Điều hướng chính"
      >
        <ul className="grid grid-cols-5">
          {items.slice(0, 2).map((item) => {
            const active = isActive(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex flex-col items-center justify-center gap-0.5 py-2 transition-colors ${
                    active ? "text-burgundy" : "text-gray-500"
                  }`}
                  aria-current={active ? "page" : undefined}
                >
                  <span className={active ? "scale-110" : ""}>{item.icon}</span>
                  <span className="text-[10px] font-medium">{item.label}</span>
                  {active && <span className="absolute top-0 w-8 h-0.5 bg-gold rounded-full" />}
                </Link>
              </li>
            );
          })}

          <li className="relative">
            <button
              onClick={openCart}
              className="w-full flex flex-col items-center justify-center gap-0.5 py-2 text-gray-500 hover:text-burgundy"
              aria-label="Giỏ hàng"
            >
              <span className="relative">
                <svg className="w-6 h-6 -mt-3 bg-gold text-burgundy-950 rounded-full p-1 shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {totalItems > 0 && (
                  <span className="absolute -top-4 -right-2 w-4 h-4 bg-burgundy text-white text-[9px] font-bold rounded-full flex items-center justify-center border border-white">
                    {totalItems > 99 ? "99+" : totalItems}
                  </span>
                )}
              </span>
              <span className="text-[10px] font-medium mt-0.5">Giỏ hàng</span>
            </button>
          </li>

          {items.slice(2).map((item) => {
            const active = isActive(item.href);
            return (
              <li key={item.href} className="relative">
                <Link
                  href={item.href}
                  className={`flex flex-col items-center justify-center gap-0.5 py-2 transition-colors ${
                    active ? "text-burgundy" : "text-gray-500"
                  }`}
                  aria-current={active ? "page" : undefined}
                >
                  <span className={active ? "scale-110" : ""}>{item.icon}</span>
                  <span className="text-[10px] font-medium">{item.label}</span>
                  {active && <span className="absolute top-0 w-8 h-0.5 bg-gold rounded-full" />}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="md:hidden h-16" aria-hidden="true" />
    </>
  );
}
