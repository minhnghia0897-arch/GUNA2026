"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "farmo-cookie-consent";

export default function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        const t = setTimeout(() => setShow(true), 800);
        return () => clearTimeout(t);
      }
    } catch {}
  }, []);

  const dismiss = (level: "all" | "necessary") => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ level, at: Date.now() })
      );
      window.dispatchEvent(new CustomEvent("cookie-consent-dismissed"));
    } catch {}
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 px-4 pb-4 sm:pb-6 fade-in pointer-events-none">
      <div className="max-w-4xl mx-auto bg-white border border-gold/20 rounded-2xl shadow-2xl shadow-burgundy/10 p-5 sm:p-6 pointer-events-auto">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center text-xl flex-shrink-0">
            🍪
          </div>
          <div className="flex-1">
            <h3 className="font-serif text-lg text-burgundy mb-1">Chúng tôi sử dụng cookies</h3>
            <p className="text-sm text-gray-600 font-light leading-relaxed">
              GUNA GIFT sử dụng cookies để cải thiện trải nghiệm mua sắm, ghi nhớ giỏ hàng và phân tích lưu lượng.
              Bằng cách tiếp tục, bạn đồng ý với{" "}
              <Link href="/policies/privacy" className="text-burgundy hover:text-gold underline">
                chính sách bảo mật
              </Link>{" "}
              của chúng tôi.
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
          <button
            onClick={() => dismiss("necessary")}
            className="text-sm px-5 py-2 border border-gray-200 rounded-lg hover:bg-cream transition-colors"
          >
            Chỉ cần thiết
          </button>
          <button
            onClick={() => dismiss("all")}
            className="text-sm px-5 py-2 bg-burgundy text-white rounded-lg hover:bg-burgundy-900 transition-colors font-medium"
          >
            Chấp nhận tất cả
          </button>
        </div>
      </div>
    </div>
  );
}
