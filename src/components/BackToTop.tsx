"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const SHOW_AFTER_PX = 400;

export default function BackToTop() {
  const pathname = usePathname();
  const [show, setShow] = useState(false);
  if (pathname.startsWith("/admin")) return null;

  useEffect(() => {
    const onScroll = () => {
      setShow(window.scrollY > SHOW_AFTER_PX);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const goTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      onClick={goTop}
      className={`fixed left-4 bottom-20 md:bottom-4 md:left-6 md:bottom-6 z-30 w-12 h-12 rounded-full bg-burgundy text-white shadow-lg hover:bg-burgundy-900 hover:scale-110 transition-all duration-300 flex items-center justify-center ${
        show ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-4 pointer-events-none"
      }`}
      aria-label="Lên đầu trang"
      tabIndex={show ? 0 : -1}
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    </button>
  );
}
