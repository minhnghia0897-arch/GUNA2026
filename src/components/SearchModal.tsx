"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { products } from "@/data/products";
import { formatPrice } from "@/lib/format";
import { useFocusTrap } from "@/hooks/useFocusTrap";

export default function SearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const trapRef = useFocusTrap<HTMLDivElement>(open);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const results = query.trim()
    ? products.filter((p) =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.shortDesc.toLowerCase().includes(query.toLowerCase()) ||
        p.categoryLabel.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const popular = products.slice(0, 4);

  return (
    <div className="fixed inset-0 z-[60] fade-in">
      <div className="absolute inset-0 bg-burgundy-950/80 backdrop-blur-sm" onClick={onClose} />
      <div ref={trapRef} role="dialog" aria-modal="true" aria-label="Tìm kiếm sản phẩm" className="relative max-w-2xl mt-20 bg-white rounded-2xl shadow-2xl overflow-hidden mx-4 sm:mx-auto">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-4">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm kiếm sản phẩm..."
            className="flex-1 outline-none text-base"
          />
          <button onClick={onClose} className="text-gray-400 hover:text-burgundy" aria-label="Đóng">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-4">
          {query.trim() ? (
            results.length > 0 ? (
              <div className="space-y-2">
                <p className="text-xs text-gray-500 px-2 py-1">{results.length} kết quả</p>
                {results.map((p) => (
                  <Link
                    key={p.slug}
                    href={`/products/${p.slug}`}
                    onClick={onClose}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-cream transition-colors"
                  >
                    <div className="relative w-14 h-14 rounded-lg bg-cream overflow-hidden flex-shrink-0">
                      <Image src={p.image} alt={p.name} fill sizes="56px" className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-800 truncate">{p.name}</h4>
                      <p className="text-xs text-gray-500">{p.categoryLabel}</p>
                    </div>
                    <p className="text-burgundy text-sm font-semibold">{formatPrice(p.price)}</p>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">Không tìm thấy sản phẩm phù hợp</p>
                <p className="text-xs text-gray-400 mt-2">Thử từ khóa khác hoặc xem tất cả sản phẩm</p>
              </div>
            )
          ) : (
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-500 px-2 py-1 mb-2">Phổ biến</p>
              <div className="space-y-2">
                {popular.map((p) => (
                  <Link
                    key={p.slug}
                    href={`/products/${p.slug}`}
                    onClick={onClose}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-cream transition-colors"
                  >
                    <div className="relative w-14 h-14 rounded-lg bg-cream overflow-hidden flex-shrink-0">
                      <Image src={p.image} alt={p.name} fill sizes="56px" className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-800 truncate">{p.name}</h4>
                      <p className="text-xs text-gray-500">{p.categoryLabel}</p>
                    </div>
                    <p className="text-burgundy text-sm font-semibold">{formatPrice(p.price)}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
