"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSiteConfig } from "@/context/SiteConfigContext";
import Newsletter from "./Newsletter";
import { IconPhone, IconMail, IconMapPin } from "./icons";

export default function Footer() {
  const pathname = usePathname();
  const settings = useSiteConfig();

  if (pathname.startsWith("/admin")) return null;

  const shopName = settings?.shop_name ?? "FarMơ";
  const tagline = settings?.shop_tagline ?? "Cao Cấp";
  const description = settings?.shop_description ?? "Chuyên cung cấp sản phẩm thiên nhiên cao cấp.";
  const logoUrl = settings?.logo_url;
  const logoMark = settings?.logo_mark ?? "F";

  const socials = [
    { key: "facebook", url: settings?.facebook_url, label: "F" },
    { key: "instagram", url: settings?.instagram_url, label: "I" },
    { key: "youtube", url: settings?.youtube_url, label: "Y" },
    { key: "zalo", url: settings?.zalo_url, label: "Z" },
  ].filter((s) => s.url);

  return (
    <footer className="bg-burgundy-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="relative w-12 h-12 rounded-full bg-gold/20 border-2 border-gold flex items-center justify-center overflow-hidden">
                {logoUrl ? (
                  <Image src={logoUrl} alt={shopName} fill sizes="48px" className="object-cover" />
                ) : (
                  <span className="text-gold font-serif text-lg font-bold">{logoMark}</span>
                )}
              </div>
              <div>
                <h3 className="text-gold font-serif text-lg font-bold">{shopName}</h3>
                <p className="text-gold/50 text-[10px] tracking-[0.2em] uppercase">{tagline}</p>
              </div>
            </div>
            <p className="text-white/40 font-normal text-sm leading-relaxed mb-6">{description}</p>
            <div className="flex gap-3">
              {socials.map((s) => (
                <a
                  key={s.key}
                  href={s.url ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:bg-gold hover:border-gold hover:text-white transition-all duration-300 text-xs font-bold"
                  aria-label={s.key}
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-gold font-serif text-sm mb-6 tracking-wider">Liên Kết Nhanh</h4>
            <ul className="space-y-3">
              {[
                { l: "Trang Chủ", h: "/" },
                { l: "Sản Phẩm", h: "/products" },
                { l: "Về Chúng Tôi", h: "/about" },
                { l: "Blog", h: "/blog" },
              ].map((item) => (
                <li key={item.l}>
                  <Link href={item.h} className="text-white/40 hover:text-gold text-sm font-normal transition-colors duration-300">
                    {item.l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-gold font-serif text-sm mb-6 tracking-wider">Hỗ Trợ</h4>
            <ul className="space-y-3">
              {[
                { l: "Câu Hỏi Thường Gặp", h: "/faq" },
                { l: "Chính Sách Giao Hàng", h: "/policies/shipping" },
                { l: "Đổi Trả & Hoàn Tiền", h: "/policies/returns" },
                { l: "Bảo Mật Thông Tin", h: "/policies/privacy" },
                { l: "Điều Khoản Sử Dụng", h: "/policies/terms" },
              ].map((item) => (
                <li key={item.l}>
                  <Link href={item.h} className="text-white/40 hover:text-gold text-sm font-normal transition-colors duration-300">
                    {item.l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-gold font-serif text-sm mb-6 tracking-wider">Nhận Ưu Đãi</h4>
            <p className="text-white/40 text-sm font-normal mb-4">Đăng ký để nhận thông tin khuyến mãi mới nhất.</p>
            <Newsletter />
            <div className="mt-6 space-y-2.5 text-xs text-white/40">
              {settings?.hotline && (
                <p className="flex items-center gap-2">
                  <IconPhone className="w-3.5 h-3.5 text-gold/70 flex-shrink-0" />
                  <span>{settings.hotline}</span>
                </p>
              )}
              {settings?.email && (
                <p className="flex items-center gap-2">
                  <IconMail className="w-3.5 h-3.5 text-gold/70 flex-shrink-0" />
                  <span>{settings.email}</span>
                </p>
              )}
              {settings?.address_line && (
                <p className="flex items-start gap-2">
                  <IconMapPin className="w-3.5 h-3.5 text-gold/70 flex-shrink-0 mt-0.5" />
                  <span>{settings.address_line}</span>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/30 text-xs font-normal">
            &copy; {new Date().getFullYear()} {shopName} {tagline}. Đã đăng ký bản quyền.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/policies/terms" className="text-white/30 hover:text-gold text-xs font-normal transition-colors">
              Điều khoản sử dụng
            </Link>
            <Link href="/policies/privacy" className="text-white/30 hover:text-gold text-xs font-normal transition-colors">
              Chính sách bảo mật
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
