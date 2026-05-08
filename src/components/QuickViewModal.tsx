"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { formatPrice, calcDiscount } from "@/lib/format";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { StarDisplay } from "./StarRating";

export default function QuickViewModal({
  product,
  onClose,
}: {
  product: Product | null;
  onClose: () => void;
}) {
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const { addItem } = useCart();
  const { has, toggle } = useWishlist();
  const trapRef = useFocusTrap<HTMLDivElement>(!!product);

  useEffect(() => {
    if (product) {
      setQuantity(1);
      setSelectedImage(0);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [product]);

  useEffect(() => {
    if (!product) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [product, onClose]);

  if (!product) return null;

  const discount = product.originalPrice ? calcDiscount(product.originalPrice, product.price) : 0;
  const liked = has(product.slug);

  return (
    <div className="fixed inset-0 z-[55] flex items-center justify-center p-4 fade-in" role="dialog" aria-modal="true" aria-label={`Xem nhanh ${product.name}`}>
      <div className="absolute inset-0 bg-burgundy-950/70 backdrop-blur-sm" onClick={onClose} />
      <div ref={trapRef} className="relative max-w-4xl w-full max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 hover:bg-cream flex items-center justify-center text-gray-500 hover:text-burgundy z-10"
          aria-label="Đóng"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="grid md:grid-cols-2 gap-6 p-6">
          <div>
            <div className="relative aspect-square bg-cream rounded-xl overflow-hidden mb-3 border border-gold/10">
              {product.badge && <div className="ribbon">{product.badge}</div>}
              {discount > 0 && (
                <div className="absolute top-3 right-3 bg-gold text-burgundy-950 text-xs font-bold px-2 py-1 rounded-full z-10">
                  -{discount}%
                </div>
              )}
              <Image
                src={product.gallery[selectedImage]}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, 400px"
                className="object-cover"
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {product.gallery.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`relative aspect-square rounded-lg overflow-hidden border-2 ${
                    selectedImage === i ? "border-gold" : "border-gray-100 hover:border-gold/50"
                  }`}
                  aria-label={`Ảnh ${i + 1}`}
                >
                  <Image src={img} alt="" fill sizes="80px" className="object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col">
            <p className="text-gold text-xs uppercase tracking-[0.2em] mb-1">{product.categoryLabel}</p>
            <h2 className="font-serif text-2xl text-burgundy mb-3 leading-tight">{product.name}</h2>
            <div className="flex items-center gap-3 mb-3">
              <StarDisplay value={product.rating} />
              <span className="text-xs text-gray-500">{product.reviews} đánh giá</span>
            </div>
            <div className="flex items-baseline gap-2 mb-4 pb-4 border-b border-gold/10">
              <span className="text-2xl font-serif font-bold text-burgundy">{formatPrice(product.price)}</span>
              {product.originalPrice && (
                <span className="text-sm text-gray-400 line-through">{formatPrice(product.originalPrice)}</span>
              )}
            </div>
            <p className="text-sm text-gray-600 leading-relaxed mb-4 line-clamp-3">{product.shortDesc}</p>

            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-2">Số lượng</p>
              <div className="inline-flex items-center border border-gray-200 rounded-lg">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-9 h-9 text-gray-500 hover:text-burgundy">
                  −
                </button>
                <span className="w-12 text-center text-sm">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="w-9 h-9 text-gray-500 hover:text-burgundy">
                  +
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-auto">
              <button
                onClick={() => {
                  addItem(product, quantity);
                  onClose();
                }}
                className="btn-burgundy flex-1 justify-center text-sm"
              >
                Thêm vào giỏ
              </button>
              <button
                onClick={() => toggle(product.slug, product.name)}
                className={`w-11 h-11 rounded-lg border-2 flex items-center justify-center transition-colors ${
                  liked ? "bg-burgundy border-burgundy text-white" : "border-burgundy text-burgundy hover:bg-burgundy hover:text-white"
                }`}
                aria-label="Yêu thích"
              >
                <svg className="w-5 h-5" fill={liked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
            </div>
            <Link
              href={`/products/${product.slug}`}
              onClick={onClose}
              className="text-center text-sm text-burgundy hover:text-gold underline mt-3"
            >
              Xem chi tiết đầy đủ →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
