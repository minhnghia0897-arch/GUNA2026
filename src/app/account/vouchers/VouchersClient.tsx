"use client";

import { useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { useToast } from "@/context/ToastContext";
import { formatPrice } from "@/lib/format";
import type { DbVoucher } from "@/lib/supabase/types";

const TYPE_LABEL: Record<DbVoucher["discount_type"], string> = {
  percentage: "Giảm %",
  fixed: "Giảm tiền",
  freeship: "Freeship",
};

export default function VouchersClient({ vouchers }: { vouchers: DbVoucher[] }) {
  const toast = useToast();
  const [filter, setFilter] = useState<"all" | "active" | "expired">("all");
  const [copied, setCopied] = useState<string | null>(null);

  const filtered = vouchers.filter((v) => {
    const expired = v.ends_at ? new Date(v.ends_at).getTime() < Date.now() : false;
    if (filter === "active") return v.is_active && !expired;
    if (filter === "expired") return expired || !v.is_active;
    return true;
  });

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(code);
      toast.success(`Đã sao chép mã ${code}`);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      toast.info(`Mã: ${code}`);
    }
  };

  const formatValue = (v: DbVoucher): string => {
    if (v.discount_type === "percentage") return `${v.value}%`;
    if (v.discount_type === "fixed") return formatPrice(v.value);
    return "Free ship";
  };

  return (
    <>
      <PageHeader
        title="Voucher của tôi"
        crumbs={[
          { label: "Trang Chủ", href: "/" },
          { label: "Tài Khoản", href: "/account" },
          { label: "Voucher" },
        ]}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <p className="text-sm text-gray-500">{filtered.length} voucher</p>
          <div className="flex gap-2">
            {[
              { key: "all" as const, label: "Tất cả" },
              { key: "active" as const, label: "Đang hoạt động" },
              { key: "expired" as const, label: "Hết hạn" },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  filter === f.key
                    ? "bg-burgundy text-white border-burgundy"
                    : "border-gray-200 text-gray-600 hover:border-burgundy"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gold/10">
            <div className="text-6xl mb-4 opacity-30">🎁</div>
            <p className="text-gray-500 mb-6">Không có voucher trong danh mục này</p>
            <Link href="/products" className="btn-gold inline-flex">Mua sắm để nhận voucher</Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {filtered.map((v) => {
              const expired = v.ends_at ? new Date(v.ends_at).getTime() < Date.now() : false;
              const inactive = expired || !v.is_active;
              return (
                <div
                  key={v.id}
                  className={`bg-white rounded-2xl border border-gold/10 overflow-hidden flex shadow-sm hover:shadow-lg transition-shadow ${
                    inactive ? "opacity-60" : ""
                  }`}
                >
                  <div className="bg-gradient-to-br from-burgundy to-burgundy-900 text-white p-4 sm:p-5 flex flex-col items-center justify-center min-w-[110px] sm:min-w-[140px] relative">
                    <p className="font-serif text-2xl font-bold">{formatValue(v)}</p>
                    <p className="text-[10px] uppercase tracking-wider text-white/60 mt-1">{TYPE_LABEL[v.discount_type]}</p>
                    <div className="absolute top-1/2 -right-2 w-4 h-4 bg-cream rounded-full -translate-y-1/2" />
                  </div>
                  <div className="flex-1 p-4 sm:p-5 border-l border-dashed border-gold/30">
                    <div className="flex items-start justify-between mb-1 gap-2">
                      <h3 className="font-serif text-base text-burgundy leading-tight">{v.title}</h3>
                      {!inactive && (
                        <span className="text-[10px] bg-gold/10 text-gold-700 px-2 py-0.5 rounded-full font-medium whitespace-nowrap">
                          Có thể dùng
                        </span>
                      )}
                      {expired && (
                        <span className="text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-medium whitespace-nowrap">
                          Hết hạn
                        </span>
                      )}
                      {!v.is_active && !expired && (
                        <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium whitespace-nowrap">
                          Tạm ẩn
                        </span>
                      )}
                    </div>
                    {v.description && <p className="text-xs text-gray-500 mb-3">{v.description}</p>}
                    <div className="flex items-center gap-2 mb-3">
                      <code className="text-xs font-mono font-semibold text-burgundy bg-cream px-2 py-1 rounded">{v.code}</code>
                      <button
                        onClick={() => copyCode(v.code)}
                        disabled={inactive}
                        className="text-xs text-burgundy hover:text-gold disabled:opacity-40"
                      >
                        {copied === v.code ? "✓ Đã chép" : "Sao chép"}
                      </button>
                    </div>
                    {v.ends_at && (
                      <p className="text-[10px] text-gray-400">
                        HSD: {new Date(v.ends_at).toLocaleDateString("vi-VN")}
                      </p>
                    )}
                    {v.min_order > 0 && (
                      <p className="text-[10px] text-gray-400">
                        Đơn tối thiểu: {formatPrice(v.min_order)}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-10 text-center">
          <Link href="/account/membership" className="text-sm text-burgundy hover:text-gold">
            Xem hạng thành viên & ưu đãi →
          </Link>
        </div>
      </div>
    </>
  );
}
