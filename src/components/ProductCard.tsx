"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { formatPrice, calcDiscount } from "@/lib/format";
import QuickViewModal from "./QuickViewModal";

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { has, toggle } = useWishlist();
  const [quickView, setQuickView] = useState<Product | null>(null);
  const discount = product.originalPrice ? calcDiscount(product.originalPrice, product.price) : 0;
  const liked = has(product.slug);

  return (
    <>
      <div className="product-card bg-white rounded-xl overflow-hidden border border-gray-100 group">
        <div className="relative aspect-square bg-gradient-to-b from-cream to-white p-6 flex items-center justify-center overflow-hidden">
          {product.badge && <div className="ribbon">{product.badge}</div>}
          {discount > 0 && (
            <div className="absolute top-3 right-3 bg-gold text-burgundy-950 text-[10px] font-bold px-2 py-1 rounded-full z-20">
              -{discount}%
            </div>
          )}
          <Link href={`/products/${product.slug}`} className="absolute inset-0 z-10" aria-label={product.name}>
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover group-hover:scale-110 transition-transform duration-500"
            />
          </Link>
          <button
            onClick={() => toggle(product.slug, product.name)}
            className={`absolute w-9 h-9 rounded-full backdrop-blur-sm flex items-center justify-center transition-all z-20 ${
              liked ? "bg-burgundy text-white" : "bg-white/80 text-gray-600 opacity-0 group-hover:opacity-100"
            }`}
            style={{ top: discount > 0 ? "44px" : "12px", right: "12px" }}
            aria-label={liked ? "Bỏ yêu thích" : "Yêu thích"}
          >
            <svg className="w-4 h-4" fill={liked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
          <button
            onClick={() => setQuickView(product)}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 px-4 py-2 bg-white/95 hover:bg-burgundy hover:text-white text-burgundy text-xs font-medium rounded-full shadow-md opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 z-20 flex items-center gap-1.5"
            aria-label="Xem nhanh"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Xem nhanh
          </button>
        </div>

        <div className="p-4">
          <Link href={`/products/${product.slug}`}>
            <h3 className="font-sans text-sm font-medium text-gray-800 mb-2 line-clamp-2 leading-snug hover:text-burgundy transition-colors">
              {product.name}
            </h3>
          </Link>
          <div className="flex items-center gap-1 mb-2">
            {Array.from({ length: 5 }).map((_, s) => (
              <svg
                key={s}
                className={`w-3 h-3 ${s < product.rating ? "text-gold" : "text-gray-200"}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
            <span className="text-gray-400 text-[10px] ml-1">({product.reviews})</span>
          </div>
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div>
              <div className="text-burgundy font-semibold text-sm">{formatPrice(product.price)}</div>
              {product.originalPrice && (
                <div className="text-gray-400 text-xs line-through">{formatPrice(product.originalPrice)}</div>
              )}
            </div>
            <button
              onClick={() => addItem(product, 1)}
              className="w-9 h-9 rounded-full bg-burgundy text-white flex items-center justify-center hover:bg-gold hover:text-burgundy-950 transition-colors"
              aria-label="Thêm vào giỏ"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <QuickViewModal product={quickView} onClose={() => setQuickView(null)} />
    </>
  );
}
