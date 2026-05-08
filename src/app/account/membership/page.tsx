"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { computeTotalSpend, getCurrentTier, getNextTier, pointsFromSpend, TIERS, type Tier } from "@/lib/membership";
import { formatPrice } from "@/lib/format";

export default function MembershipPage() {
  const [spend, setSpend] = useState<number | null>(null);

  useEffect(() => {
    setSpend(computeTotalSpend());
  }, []);

  if (spend === null) {
    return (
      <>
        <PageHeader title="Hạng Thành Viên" crumbs={[{ label: "Trang Chủ", href: "/" }, { label: "Thành Viên" }]} />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-gold border-t-transparent rounded-full mx-auto" />
        </div>
      </>
    );
  }

  const currentTier = getCurrentTier(spend);
  const nextTier = getNextTier(currentTier);
  const currentTierData = TIERS.find((t) => t.key === currentTier)!;
  const points = pointsFromSpend(spend, currentTier);

  const progress = nextTier
    ? Math.min(100, ((spend - currentTierData.minSpend) / (nextTier.minSpend - currentTierData.minSpend)) * 100)
    : 100;
  const remaining = nextTier ? Math.max(0, nextTier.minSpend - spend) : 0;

  return (
    <>
      <PageHeader
        title="Hạng Thành Viên"
        crumbs={[
          { label: "Trang Chủ", href: "/" },
          { label: "Tài Khoản", href: "/account" },
          { label: "Thành Viên" },
        ]}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className={`bg-gradient-to-br ${currentTierData.color} text-white rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-2xl`}>
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/10 -translate-y-12 translate-x-12" />
          <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-white/5 translate-y-8 -translate-x-8" />
          <div className="relative">
            <p className="text-white/70 text-xs uppercase tracking-[0.3em] mb-2">Hạng hiện tại</p>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="font-serif text-3xl sm:text-4xl font-bold">{currentTierData.name}</h2>
              {currentTier === "diamond" && <span className="text-2xl">💎</span>}
              {currentTier === "gold" && <span className="text-2xl">⭐</span>}
              {currentTier === "silver" && <span className="text-2xl">🥈</span>}
            </div>
            <div className="grid sm:grid-cols-3 gap-4 mt-6">
              <div>
                <p className="text-white/60 text-xs uppercase mb-1">Tổng chi tiêu</p>
                <p className="font-serif text-xl sm:text-2xl font-bold">{formatPrice(spend)}</p>
              </div>
              <div>
                <p className="text-white/60 text-xs uppercase mb-1">Điểm tích lũy</p>
                <p className="font-serif text-xl sm:text-2xl font-bold">{points.toLocaleString("vi-VN")}</p>
              </div>
              <div>
                <p className="text-white/60 text-xs uppercase mb-1">Voucher</p>
                <p className="font-serif text-xl sm:text-2xl font-bold">
                  <Link href="/account/vouchers" className="hover:underline">2</Link>
                </p>
              </div>
            </div>
          </div>
        </div>

        {nextTier && (
          <div className="bg-white border border-gold/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <p className="text-sm text-gray-700">
                Còn <span className="font-bold text-burgundy">{formatPrice(remaining)}</span> để lên hạng{" "}
                <span className="font-serif font-bold text-gold">{nextTier.name}</span>
              </p>
              <p className="text-xs text-gray-400">{Math.round(progress)}%</p>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-gold-400 to-gold transition-all duration-700 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-2">
              <span>{formatPrice(currentTierData.minSpend)}</span>
              <span>{formatPrice(nextTier.minSpend)}</span>
            </div>
          </div>
        )}

        <div>
          <h3 className="font-serif text-2xl text-burgundy mb-2 text-center">Bậc Thành Viên</h3>
          <p className="text-sm text-gray-500 text-center mb-8">Tích lũy chi tiêu để mở khóa thêm đặc quyền</p>
          <div className="grid md:grid-cols-3 gap-6">
            {TIERS.map((tier) => {
              const isCurrent = tier.key === currentTier;
              const isLocked = spend < tier.minSpend;
              return (
                <div
                  key={tier.key}
                  className={`relative bg-white rounded-2xl border-2 p-6 transition-all ${
                    isCurrent ? "border-gold shadow-xl shadow-gold/20" : "border-gold/10"
                  } ${isLocked ? "opacity-70" : ""}`}
                >
                  {isCurrent && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold text-burgundy-950 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                      Hiện tại
                    </span>
                  )}
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${tier.color} mb-4 flex items-center justify-center text-xl text-white`}>
                    {tier.key === "diamond" ? "💎" : tier.key === "gold" ? "⭐" : "🥈"}
                  </div>
                  <h4 className="font-serif text-xl text-burgundy mb-1">{tier.name}</h4>
                  <p className="text-xs text-gray-500 mb-4">
                    {tier.minSpend === 0 ? "Tự động" : `Từ ${formatPrice(tier.minSpend)}`}
                  </p>
                  <ul className="space-y-2">
                    {tier.perks.map((perk, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                        <svg className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>{perk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-cream rounded-2xl p-6 sm:p-8">
          <h3 className="font-serif text-xl text-burgundy mb-4">Quy tắc tích & đổi điểm</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• Mỗi 10.000đ chi tiêu = 1 điểm (Bạc), 1.5 điểm (Vàng), 2 điểm (Kim Cương)</li>
            <li>• 100 điểm = giảm 10.000đ cho đơn hàng tiếp theo</li>
            <li>• Điểm có hiệu lực trong 12 tháng kể từ ngày tích</li>
            <li>• Không tích điểm cho đơn dùng voucher hoặc đơn bị hủy/hoàn</li>
          </ul>
        </div>

        <div className="flex gap-3 flex-wrap justify-center">
          <Link href="/account/vouchers" className="btn-gold">
            Xem voucher của tôi
          </Link>
          <Link href="/products" className="btn-outline-gold">
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    </>
  );
}
