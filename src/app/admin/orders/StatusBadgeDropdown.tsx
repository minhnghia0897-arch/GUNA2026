"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useToast } from "@/context/ToastContext";
import { quickUpdateOrderStatus } from "./actions";

const STATUS_LABEL: Record<string, string> = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  shipping: "Đang giao",
  delivered: "Đã giao",
  cancelled: "Đã hủy",
};

const STATUS_COLOR: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-blue-100 text-blue-700",
  shipping: "bg-indigo-100 text-indigo-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const VALID_NEXT: Record<string, string[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["shipping", "cancelled"],
  shipping: ["delivered", "cancelled"],
  delivered: ["cancelled"],
  cancelled: [],
};

export default function StatusBadgeDropdown({
  orderId,
  status: initialStatus,
}: {
  orderId: string;
  status: string;
}) {
  const toast = useToast();
  const [status, setStatus] = useState(initialStatus);
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const [pending, startTransition] = useTransition();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setStatus(initialStatus);
  }, [initialStatus]);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      if (
        menuRef.current && !menuRef.current.contains(e.target as Node) &&
        triggerRef.current && !triggerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    const onScroll = () => setOpen(false);
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onClickOutside);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const next = VALID_NEXT[status] ?? [];
  const canChange = next.length > 0 && !pending;

  const toggle = () => {
    if (open) { setOpen(false); return; }
    const rect = triggerRef.current?.getBoundingClientRect();
    if (rect) setCoords({ top: rect.bottom + 4, left: rect.left });
    setOpen(true);
  };

  const handleSelect = (newStatus: string) => {
    setOpen(false);
    const prev = status;
    setStatus(newStatus);
    startTransition(async () => {
      const res = await quickUpdateOrderStatus(orderId, prev, newStatus);
      if (res.ok) {
        toast.success(`Đã chuyển sang "${STATUS_LABEL[newStatus]}"`);
      } else {
        setStatus(prev);
        toast.error(res.error);
      }
    });
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={toggle}
        disabled={!canChange}
        title={canChange ? "Click để đổi trạng thái" : "Không thể chuyển trạng thái"}
        className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium transition-opacity ${STATUS_COLOR[status]} ${canChange ? "cursor-pointer hover:opacity-80" : "cursor-default"} ${pending ? "opacity-60" : ""}`}
      >
        {STATUS_LABEL[status]}
        {canChange && (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.25 4.39a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" />
          </svg>
        )}
      </button>
      {open && coords && (
        <div
          ref={menuRef}
          style={{ position: "fixed", top: coords.top, left: coords.left }}
          className="z-50 min-w-[160px] bg-white rounded-lg border border-gold/20 shadow-lg py-1"
        >
          {next.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => handleSelect(s)}
              className="w-full text-left px-3 py-2 hover:bg-cream transition-colors"
            >
              <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[s]}`}>
                {STATUS_LABEL[s]}
              </span>
            </button>
          ))}
        </div>
      )}
    </>
  );
}
