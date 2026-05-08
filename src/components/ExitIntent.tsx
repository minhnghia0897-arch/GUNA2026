"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useToast } from "@/context/ToastContext";
import { useFocusTrap } from "@/hooks/useFocusTrap";

const SESSION_KEY = "farmo-exit-intent-shown";
const NEWSLETTER_KEY = "farmo-newsletter-popup";
const SKIP_PATHS = ["/checkout", "/cart"];
const SKIP_PREFIXES = ["/account", "/admin"];

export default function ExitIntent() {
  const pathname = usePathname();
  const toast = useToast();
  const [show, setShow] = useState(false);
  const [copied, setCopied] = useState(false);
  const trapRef = useFocusTrap<HTMLDivElement>(show);

  const skip = SKIP_PATHS.includes(pathname) || SKIP_PREFIXES.some((p) => pathname.startsWith(p));

  useEffect(() => {
    if (skip) return;

    let alreadyShown = false;
    let newsletterDismissed = false;
    try {
      alreadyShown = !!sessionStorage.getItem(SESSION_KEY);
      newsletterDismissed = !!localStorage.getItem(NEWSLETTER_KEY);
    } catch {}

    if (alreadyShown) return;

    const onMouseOut = (e: MouseEvent) => {
      if (e.clientY > 0) return;
      if (e.relatedTarget) return;
      try {
        if (sessionStorage.getItem(SESSION_KEY)) return;
      } catch {}
      try {
        if (!localStorage.getItem(NEWSLETTER_KEY)) return;
      } catch {}
      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {}
      setShow(true);
    };

    if (newsletterDismissed) {
      const timer = setTimeout(() => {
        document.addEventListener("mouseout", onMouseOut);
      }, 3000);
      return () => {
        clearTimeout(timer);
        document.removeEventListener("mouseout", onMouseOut);
      };
    }
  }, [skip]);

  useEffect(() => {
    if (!show) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShow(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [show]);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText("STAY15");
      setCopied(true);
      toast.success("Đã sao chép mã STAY15");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.info("Mã: STAY15");
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[58] flex items-center justify-center p-4 fade-in" role="dialog" aria-modal="true" aria-labelledby="exit-intent-title">
      <div className="absolute inset-0 bg-burgundy-950/70 backdrop-blur-sm" onClick={() => setShow(false)} />
      <div ref={trapRef} className="relative max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
        <button
          onClick={() => setShow(false)}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 hover:bg-cream flex items-center justify-center text-gray-500 hover:text-burgundy z-10"
          aria-label="Đóng"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="bg-gradient-to-br from-gold via-gold-400 to-gold-500 p-6 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/10 -translate-y-10 translate-x-10" />
          <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/10 translate-y-6 -translate-x-6" />
          <div className="relative">
            <div className="text-5xl mb-3">⏳</div>
            <p className="text-burgundy-950/80 text-xs uppercase tracking-[0.3em] mb-2 font-semibold">Đợi đã!</p>
            <h2 id="exit-intent-title" className="font-serif text-2xl text-burgundy-950 mb-2">
              Trước khi đi, nhận quà nhé
            </h2>
            <p className="text-burgundy-950/70 text-sm font-light">
              Giảm thêm <strong>15%</strong> cho đơn hàng đầu tiên của bạn
            </p>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="border-2 border-dashed border-gold rounded-xl p-4 flex items-center justify-between gap-3 bg-cream">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Mã giảm giá</p>
              <p className="font-mono font-bold text-xl text-burgundy">STAY15</p>
            </div>
            <button onClick={copyCode} className="btn-burgundy text-sm whitespace-nowrap">
              {copied ? "✓ Đã chép" : "Sao chép"}
            </button>
          </div>
          <p className="text-xs text-gray-500 text-center">
            Áp dụng cho đơn từ 300.000đ. Chỉ dành cho khách hàng mới.
          </p>
          <button
            onClick={() => setShow(false)}
            className="block mx-auto text-xs text-gray-400 hover:text-burgundy"
          >
            Không cần, cảm ơn
          </button>
        </div>
      </div>
    </div>
  );
}
