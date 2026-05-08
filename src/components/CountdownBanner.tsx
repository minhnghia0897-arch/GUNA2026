"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

const STORAGE_END = "farmo-flashsale-end";
const STORAGE_DISMISSED = "farmo-flashsale-dismissed";
const SALE_DURATION_MS = 24 * 60 * 60 * 1000;
const SKIP_PREFIXES = ["/checkout", "/cart", "/admin"];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export default function CountdownBanner() {
  const pathname = usePathname();
  const [remaining, setRemaining] = useState<number | null>(null);
  const [dismissed, setDismissed] = useState(true);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let endTime: number;
    let isDismissed = false;
    try {
      const stored = localStorage.getItem(STORAGE_END);
      if (stored) {
        endTime = parseInt(stored, 10);
        if (!Number.isFinite(endTime) || endTime <= Date.now()) {
          endTime = Date.now() + SALE_DURATION_MS;
          localStorage.setItem(STORAGE_END, String(endTime));
          localStorage.removeItem(STORAGE_DISMISSED);
        }
      } else {
        endTime = Date.now() + SALE_DURATION_MS;
        localStorage.setItem(STORAGE_END, String(endTime));
      }
      isDismissed = localStorage.getItem(STORAGE_DISMISSED) === String(endTime);
      setDismissed(isDismissed);
    } catch {
      endTime = Date.now() + SALE_DURATION_MS;
    }
    setHydrated(true);

    if (isDismissed || endTime <= Date.now()) {
      setRemaining(0);
      return;
    }

    let id: ReturnType<typeof setInterval> | undefined;
    const tick = () => {
      const left = Math.max(0, endTime - Date.now());
      setRemaining(left);
      if (left <= 0 && id) clearInterval(id);
    };
    tick();
    id = setInterval(tick, 1000);
    return () => {
      if (id) clearInterval(id);
    };
  }, []);

  const dismiss = () => {
    try {
      const end = localStorage.getItem(STORAGE_END);
      if (end) localStorage.setItem(STORAGE_DISMISSED, end);
    } catch {}
    setDismissed(true);
  };

  if (!hydrated) return null;
  if (dismissed) return null;
  if (remaining === null || remaining <= 0) return null;
  if (SKIP_PREFIXES.some((p) => pathname.startsWith(p))) return null;

  const totalSec = Math.floor(remaining / 1000);
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;

  return (
    <div className="bg-gradient-to-r from-burgundy-950 via-burgundy to-burgundy-950 text-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-center gap-2 sm:gap-4 text-center">
        <span className="text-gold animate-pulse text-sm">🔥</span>
        <p className="text-xs sm:text-sm font-light">
          <span className="font-semibold text-gold">FLASH SALE -20%</span>
          <span className="hidden sm:inline text-white/70"> · Mã </span>
          <Link href="/products" className="hidden sm:inline underline hover:text-gold">
            FARMO20
          </Link>
          <span className="text-white/70"> · Còn </span>
          <span className="font-mono font-semibold tabular-nums text-gold">
            {pad(hours)}:{pad(minutes)}:{pad(seconds)}
          </span>
        </p>
        <button
          onClick={dismiss}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
          aria-label="Đóng"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
