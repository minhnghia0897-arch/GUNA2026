"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useToast } from "@/context/ToastContext";
import { useFocusTrap } from "@/hooks/useFocusTrap";

const STORAGE_KEY = "farmo-newsletter-popup";
const TRIGGER_DELAY_MS = 8000;
const SCROLL_THRESHOLD = 0.5;
const SKIP_PATHS = ["/checkout", "/cart"];
const SKIP_PREFIXES = ["/account", "/admin"];

export default function NewsletterPopup() {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const pathname = usePathname();
  const toast = useToast();
  const trapRef = useFocusTrap<HTMLDivElement>(show);

  const skipOnPath = SKIP_PATHS.includes(pathname) || SKIP_PREFIXES.some((p) => pathname.startsWith(p));

  useEffect(() => {
    if (skipOnPath) return;
    let alreadyShown = false;
    try {
      alreadyShown = !!localStorage.getItem(STORAGE_KEY);
    } catch {}
    if (alreadyShown) return;

    let triggered = false;
    const trigger = () => {
      if (triggered) return;
      triggered = true;
      setShow(true);
    };

    const timer = setTimeout(trigger, TRIGGER_DELAY_MS);
    const onScroll = () => {
      const scrolled = window.scrollY / Math.max(1, document.body.scrollHeight - window.innerHeight);
      if (scrolled >= SCROLL_THRESHOLD) trigger();
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };
  }, [skipOnPath]);

  useEffect(() => {
    if (!show) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  const close = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ dismissed: true, at: Date.now() }));
    } catch {}
    setShow(false);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Email không hợp lệ");
      return;
    }
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 500));
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ subscribed: true, email, at: Date.now() }));
    } catch {}
    setSubmitting(false);
    setShow(false);
    toast.success("Đã đăng ký! Mã FARMO10 đã gửi đến email của bạn.");
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[55] flex items-center justify-center p-4 fade-in" role="dialog" aria-labelledby="newsletter-title">
      <div className="absolute inset-0 bg-burgundy-950/60 backdrop-blur-sm" onClick={close} />
      <div ref={trapRef} className="relative max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
        <button
          onClick={close}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 hover:bg-cream flex items-center justify-center text-gray-500 hover:text-burgundy z-10"
          aria-label="Đóng"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="bg-gradient-to-br from-burgundy to-burgundy-900 p-6 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full border border-gold/20 -translate-y-10 translate-x-10" />
          <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full border border-gold/10 translate-y-6 -translate-x-6" />
          <div className="relative">
            <div className="text-5xl mb-3">🎁</div>
            <p className="text-gold text-xs uppercase tracking-[0.3em] mb-2">Ưu đãi đặc biệt</p>
            <h2 id="newsletter-title" className="font-serif text-2xl text-white mb-2">
              Giảm 10% đơn đầu tiên
            </h2>
            <p className="text-white/70 text-sm font-light">
              Đăng ký nhận tin để được giảm giá và cập nhật sản phẩm mới
            </p>
          </div>
        </div>

        <form onSubmit={submit} className="p-6">
          <input
            type="email"
            required
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email của bạn"
            className="input-field mb-3"
          />
          <button type="submit" disabled={submitting} className="btn-gold w-full justify-center">
            {submitting ? "Đang gửi..." : "Nhận ưu đãi 10%"}
          </button>
          <button
            type="button"
            onClick={close}
            className="block mx-auto mt-4 text-xs text-gray-400 hover:text-burgundy"
          >
            Không, cảm ơn
          </button>
          <p className="text-[10px] text-gray-400 text-center mt-3">
            Chúng tôi tôn trọng quyền riêng tư. Hủy đăng ký bất cứ lúc nào.
          </p>
        </form>
      </div>
    </div>
  );
}
