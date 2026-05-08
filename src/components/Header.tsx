"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useSiteConfig } from "@/context/SiteConfigContext";
import SearchModal from "./SearchModal";

export default function Header() {
  const pathname = usePathname();
  const settings = useSiteConfig();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [shake, setShake] = useState(false);
  const { totalItems, openCart, bumpKey } = useCart();
  const { count: wishCount } = useWishlist();

  useEffect(() => {
    if (bumpKey === 0) return;
    setShake(true);
    const t = setTimeout(() => setShake(false), 600);
    return () => clearTimeout(t);
  }, [bumpKey]);

  if (pathname.startsWith("/admin")) return null;

  const shopName = settings?.shop_name ?? "FarMơ";
  const tagline = settings?.shop_tagline ?? "Cao Cấp";
  const logoUrl = settings?.logo_url;
  const logoMark = settings?.logo_mark ?? "F";
  const announcement = settings?.announcement_text;
  const showAnnouncement = settings?.announcement_active && announcement;

  const navItems = [
    { label: "Trang Chủ", href: "/" },
    { label: "Sản Phẩm", href: "/products" },
    { label: "Về Chúng Tôi", href: "/about" },
    { label: "Bài Viết", href: "/blog" },
    { label: "Thành Viên", href: "/#membership" },
    { label: "Liên Hệ", href: "/#contact" },
  ];

  return (
    <>
      {showAnnouncement && (
        <div className="bg-burgundy text-white py-2 overflow-hidden relative">
          <div className="animate-scroll whitespace-nowrap flex">
            <span className="mx-8 text-sm font-light tracking-wide">{announcement}</span>
            <span className="mx-8 text-sm font-light tracking-wide">{announcement}</span>
          </div>
        </div>
      )}

      <header className="bg-burgundy/95 backdrop-blur-sm sticky top-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center gap-3 flex-shrink-0">
              <div className="relative w-14 h-14 rounded-full bg-gold/20 border-2 border-gold flex items-center justify-center overflow-hidden">
                {logoUrl ? (
                  <Image src={logoUrl} alt={shopName} fill sizes="56px" className="object-cover" />
                ) : (
                  <span className="text-gold font-serif text-xl font-bold">{logoMark}</span>
                )}
              </div>
              <div>
                <h1 className="text-gold font-serif text-xl font-bold tracking-wider">{shopName}</h1>
                <p className="text-gold-200 text-[10px] tracking-[0.2em] uppercase font-light">{tagline}</p>
              </div>
            </Link>

            <nav className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="text-white hover:text-gold text-sm font-semibold tracking-wide uppercase transition-colors duration-300 relative group"
                >
                  {item.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-gold transition-all duration-300 group-hover:w-full" />
                </Link>
              ))}
            </nav>

            <div className="hidden md:flex items-center space-x-5">
              <button className="text-white/80 hover:text-gold transition-colors" aria-label="Tìm kiếm" onClick={() => setSearchOpen(true)}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              <Link href="/account/wishlist" className="text-white/80 hover:text-gold transition-colors relative" aria-label="Yêu thích">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {wishCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-4 h-4 bg-gold text-burgundy-900 text-[10px] font-bold rounded-full flex items-center justify-center">{wishCount}</span>
                )}
              </Link>
              <Link href="/account" className="text-white/80 hover:text-gold transition-colors" aria-label="Tài khoản">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </Link>
              <button
                onClick={openCart}
                className={`text-white/80 hover:text-gold transition-colors relative ${shake ? "animate-wobble" : ""}`}
                aria-label="Giỏ hàng"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {totalItems > 0 && (
                  <span className={`absolute -top-2 -right-2 w-4 h-4 bg-gold text-burgundy-900 text-[10px] font-bold rounded-full flex items-center justify-center ${shake ? "animate-badge-pop" : ""}`}>{totalItems}</span>
                )}
              </button>
            </div>

            <div className="md:hidden flex items-center gap-4">
              <button onClick={openCart} className={`text-white relative ${shake ? "animate-wobble" : ""}`} aria-label="Giỏ hàng">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {totalItems > 0 && (
                  <span className={`absolute -top-1 -right-1 w-4 h-4 bg-gold text-burgundy-900 text-[10px] font-bold rounded-full flex items-center justify-center ${shake ? "animate-badge-pop" : ""}`}>{totalItems}</span>
                )}
              </button>
              <button className="text-white" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {menuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden bg-burgundy-900 border-t border-gold/20">
            <div className="px-4 py-4 space-y-3">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="block text-white hover:text-gold text-sm font-semibold tracking-wide uppercase py-2 transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <div className="border-t border-white/10 pt-3 space-y-2">
                <button
                  className="block text-white/80 hover:text-gold text-sm font-medium py-2"
                  onClick={() => { setMenuOpen(false); setSearchOpen(true); }}
                >
                  Tìm Kiếm
                </button>
                <Link href="/account" className="block text-white/80 hover:text-gold text-sm font-medium py-2" onClick={() => setMenuOpen(false)}>
                  Tài Khoản
                </Link>
                <Link href="/account/wishlist" className="block text-white/80 hover:text-gold text-sm font-medium py-2" onClick={() => setMenuOpen(false)}>
                  Yêu Thích ({wishCount})
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
