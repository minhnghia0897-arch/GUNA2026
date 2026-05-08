"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useSiteConfig } from "@/context/SiteConfigContext";

const COOKIE_KEY = "farmo-cookie-consent";

export default function StickyContact() {
  const pathname = usePathname();
  const settings = useSiteConfig();
  const [open, setOpen] = useState(false);
  const [cookieDismissed, setCookieDismissed] = useState(false);

  useEffect(() => {
    const check = () => {
      try {
        setCookieDismissed(!!localStorage.getItem(COOKIE_KEY));
      } catch {
        setCookieDismissed(true);
      }
    };
    check();
    const onCustom = () => check();
    window.addEventListener("storage", check);
    window.addEventListener("cookie-consent-dismissed", onCustom);
    return () => {
      window.removeEventListener("storage", check);
      window.removeEventListener("cookie-consent-dismissed", onCustom);
    };
  }, []);

  if (pathname.startsWith("/admin")) return null;
  if (!cookieDismissed) return null;

  const phoneClean = (settings?.hotline ?? "0901234567").replace(/\s/g, "");

  const buttons = [
    {
      key: "phone",
      label: "Gọi điện",
      href: `tel:${phoneClean}`,
      bg: "bg-burgundy",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
    },
    settings?.zalo_url && {
      key: "zalo",
      label: "Chat Zalo",
      href: settings.zalo_url,
      bg: "bg-blue-500",
      icon: <span className="text-white font-bold text-sm">Z</span>,
    },
    settings?.messenger_url && {
      key: "messenger",
      label: "Messenger",
      href: settings.messenger_url,
      bg: "bg-blue-600",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.14 2 11.25c0 2.88 1.4 5.45 3.6 7.13V22l3.3-1.81c.97.27 2 .42 3.1.42 5.52 0 10-4.14 10-9.36S17.52 2 12 2zm1.05 12.61l-2.6-2.78-5.07 2.78 5.59-5.93 2.66 2.78 5.01-2.78-5.59 5.93z" />
        </svg>
      ),
    },
  ].filter(Boolean) as { key: string; label: string; href: string; bg: string; icon: React.ReactNode }[];

  return (
    <div className="fixed right-4 bottom-20 md:right-6 md:bottom-6 z-30 flex flex-col items-end gap-3">
      <div
        className={`flex flex-col gap-2 transition-all duration-300 ${
          open ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        {buttons.map((b) => (
          <a
            key={b.key}
            href={b.href}
            target={b.key === "phone" ? "_self" : "_blank"}
            rel={b.key === "phone" ? undefined : "noopener noreferrer"}
            className={`${b.bg} text-white w-12 h-12 rounded-full shadow-lg hover:scale-110 transition-transform flex items-center justify-center group relative`}
            aria-label={b.label}
          >
            {b.icon}
            <span className="absolute right-full mr-3 px-3 py-1.5 bg-burgundy-950 text-white text-xs whitespace-nowrap rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              {b.label}
            </span>
          </a>
        ))}
      </div>

      <button
        onClick={() => setOpen(!open)}
        className="bg-gold text-burgundy-950 w-14 h-14 rounded-full shadow-xl hover:scale-105 transition-all flex items-center justify-center relative"
        aria-label={open ? "Đóng liên hệ" : "Mở liên hệ"}
      >
        {!open && <span className="absolute inset-0 rounded-full bg-gold animate-ping opacity-30" />}
        <svg className={`w-6 h-6 transition-transform ${open ? "rotate-45" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {open ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          )}
        </svg>
      </button>
    </div>
  );
}
