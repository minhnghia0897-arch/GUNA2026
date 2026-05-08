"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

const TABS = [
  { key: "all", label: "Tất cả" },
  { key: "pending", label: "Chờ xác nhận" },
  { key: "confirmed", label: "Đã xác nhận" },
  { key: "shipping", label: "Đang giao" },
  { key: "delivered", label: "Đã giao" },
  { key: "cancelled", label: "Đã hủy" },
];

export default function OrdersFilter({
  currentStatus,
  currentQ,
  counts,
}: {
  currentStatus: string;
  currentQ: string;
  counts: Record<string, number>;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(currentQ);

  const updateStatus = (status: string) => {
    const sp = new URLSearchParams(params);
    if (status === "all") sp.delete("status");
    else sp.set("status", status);
    router.push(`/admin/orders${sp.toString() ? `?${sp}` : ""}`);
  };

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const sp = new URLSearchParams(params);
    if (q.trim()) sp.set("q", q.trim());
    else sp.delete("q");
    router.push(`/admin/orders${sp.toString() ? `?${sp}` : ""}`);
  };

  return (
    <div className="space-y-3">
      <form onSubmit={submitSearch} className="flex gap-2">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Tìm theo mã đơn, tên, SĐT..."
          className="input-field flex-1 max-w-md"
        />
        <button type="submit" className="px-4 py-2 bg-burgundy text-white rounded-lg text-sm hover:bg-burgundy-900">
          Tìm
        </button>
      </form>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {TABS.map((t) => {
          const active = currentStatus === t.key;
          const count = t.key === "all" ? undefined : counts[t.key];
          return (
            <button
              key={t.key}
              onClick={() => updateStatus(t.key)}
              className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-colors flex items-center gap-2 ${
                active ? "bg-burgundy text-white" : "bg-white border border-gold/10 text-gray-600 hover:border-burgundy"
              }`}
            >
              {t.label}
              {count !== undefined && (
                <span className={`text-xs px-1.5 rounded ${active ? "bg-white/20" : "bg-cream text-gray-500"}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
