"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { formatPrice } from "@/lib/format";

const BUNDLE_DISCOUNT = 0.1;

export default function BundleDeal({
  current,
  candidates,
}: {
  current: Product;
  candidates: Product[];
}) {
  const { addItem } = useCart();
  const toast = useToast();

  const partners = candidates.slice(0, 2);
  const allItems = useMemo(() => [current, ...partners], [current, partners]);

  const [selected, setSelected] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    allItems.forEach((p) => {
      init[p.slug] = true;
    });
    return init;
  });

  if (partners.length < 1) return null;

  const selectedItems = allItems.filter((p) => selected[p.slug]);
  const originalTotal = selectedItems.reduce((s, p) => s + p.price, 0);
  const allSelected = selectedItems.length === allItems.length;
  const discountedTotal = allSelected ? Math.round(originalTotal * (1 - BUNDLE_DISCOUNT)) : originalTotal;
  const savings = originalTotal - discountedTotal;

  const toggle = (slug: string) => {
    if (slug === current.slug) return;
    setSelected((s) => ({ ...s, [slug]: !s[slug] }));
  };

  const buyBundle = () => {
    if (selectedItems.length === 0) {
      toast.error("Vui lòng chọn ít nhất 1 sản phẩm");
      return;
    }
    selectedItems.forEach((p) => addItem(p, 1));
    if (allSelected) {
      toast.success(`Đã thêm bundle ${selectedItems.length} sản phẩm - tiết kiệm ${formatPrice(savings)}`);
    } else {
      toast.success(`Đã thêm ${selectedItems.length} sản phẩm vào giỏ`);
    }
  };

  return (
    <section className="mt-12 mb-8">
      <div className="bg-gradient-to-br from-cream to-white border-2 border-gold/20 rounded-2xl p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <p className="text-gold text-xs uppercase tracking-[0.3em] mb-1">Mua kèm tiết kiệm</p>
            <h3 className="font-serif text-xl sm:text-2xl text-burgundy">
              Combo {allItems.length} sản phẩm{" "}
              <span className="text-gold">−10%</span>
            </h3>
          </div>
          {allSelected && (
            <span className="bg-gold text-burgundy-950 text-xs font-bold px-3 py-1.5 rounded-full">
              Tiết kiệm {formatPrice(savings)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
          {allItems.map((p, i) => (
            <div key={p.slug} className="flex items-center gap-2 sm:gap-4">
              <label
                className={`relative flex flex-col items-center cursor-pointer transition-opacity ${
                  selected[p.slug] ? "opacity-100" : "opacity-40"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selected[p.slug] ?? false}
                  onChange={() => toggle(p.slug)}
                  disabled={p.slug === current.slug}
                  className="sr-only"
                />
                <div
                  className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-white border-2 overflow-hidden transition-all ${
                    selected[p.slug] ? "border-gold shadow-md" : "border-gray-200"
                  }`}
                >
                  <Image src={p.image} alt={p.name} fill sizes="96px" className="object-cover" />
                  {selected[p.slug] && (
                    <div className="absolute top-1 right-1 w-5 h-5 bg-gold rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-burgundy-950" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  {p.slug === current.slug && (
                    <div className="absolute bottom-0 inset-x-0 bg-burgundy text-white text-[9px] text-center py-0.5 font-medium">
                      SP này
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-gray-700 text-center mt-2 line-clamp-2 max-w-[96px] leading-snug">
                  {p.name}
                </p>
                <p className="text-xs text-burgundy font-semibold">{formatPrice(p.price)}</p>
              </label>
              {i < allItems.length - 1 && (
                <span className="text-gold text-2xl font-light hidden sm:block">+</span>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t border-gold/20 flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">
              {selectedItems.length} / {allItems.length} sản phẩm được chọn
            </p>
            <div className="flex items-baseline gap-2">
              <p className="font-serif text-2xl font-bold text-burgundy">{formatPrice(discountedTotal)}</p>
              {allSelected && (
                <p className="text-sm text-gray-400 line-through">{formatPrice(originalTotal)}</p>
              )}
            </div>
          </div>
          <button
            onClick={buyBundle}
            disabled={selectedItems.length === 0}
            className="btn-gold"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {allSelected ? "Mua bundle" : "Thêm vào giỏ"}
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-gray-500">
          {partners.map((p) => (
            <Link key={p.slug} href={`/products/${p.slug}`} className="hover:text-burgundy underline">
              Xem {p.name} →
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
