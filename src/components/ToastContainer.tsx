"use client";

import { useToast } from "@/context/ToastContext";

const ICONS: Record<string, string> = {
  success: "✓",
  error: "✕",
  info: "ℹ",
  warning: "!",
};

const STYLES: Record<string, string> = {
  success: "bg-green-50 border-green-200 text-green-800",
  error: "bg-red-50 border-red-200 text-red-800",
  info: "bg-blue-50 border-blue-200 text-blue-800",
  warning: "bg-amber-50 border-amber-200 text-amber-800",
};

const ICON_BG: Record<string, string> = {
  success: "bg-green-500",
  error: "bg-red-500",
  info: "bg-blue-500",
  warning: "bg-amber-500",
};

export default function ToastContainer() {
  const { toasts, dismiss } = useToast();

  return (
    <div
      className="fixed top-4 right-4 z-[70] flex flex-col gap-2 max-w-sm w-[calc(100%-2rem)] sm:w-auto pointer-events-none"
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-lg border shadow-lg slide-in-right ${STYLES[t.type]}`}
          role="status"
        >
          <div className={`w-6 h-6 rounded-full ${ICON_BG[t.type]} text-white flex items-center justify-center text-xs font-bold flex-shrink-0`}>
            {ICONS[t.type]}
          </div>
          <p className="text-sm font-medium flex-1 leading-snug">{t.message}</p>
          <button
            onClick={() => dismiss(t.id)}
            className="text-current opacity-50 hover:opacity-100 flex-shrink-0"
            aria-label="Đóng"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}
