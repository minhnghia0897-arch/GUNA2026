"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useToast } from "@/context/ToastContext";
import { formatPrice, calcDiscount } from "@/lib/format";
import { pushRecentlyViewed } from "@/lib/recentlyViewed";
import ProductCard from "@/components/ProductCard";
import PageHeader from "@/components/PageHeader";
import ReviewSection from "@/components/ReviewSection";
import RecentlyViewed from "@/components/RecentlyViewed";
import BundleDeal from "@/components/BundleDeal";
import { IconTruck, IconRefresh, IconShield } from "@/components/icons";

type TabKey = "desc" | "specs" | "reviews" | "shipping";
const SWIPE_THRESHOLD = 50;

export default function ProductDetail({ product, related }: { product: Product; related: Product[] }) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<TabKey>("desc");
  const touchStartX = useRef<number | null>(null);
  const galleryLen = product.gallery.length;

  useEffect(() => {
    pushRecentlyViewed(product.slug);
  }, [product.slug]);

  const goPrev = () => setSelectedImage((i) => (i - 1 + galleryLen) % galleryLen);
  const goNext = () => setSelectedImage((i) => (i + 1) % galleryLen);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) < SWIPE_THRESHOLD) return;
    if (dx > 0) goPrev();
    else goNext();
  };
  const { addItem, buyNow } = useCart();
  const { has, toggle } = useWishlist();
  const toast = useToast();
  const liked = has(product.slug);
  const discount = product.originalPrice ? calcDiscount(product.originalPrice, product.price) : 0;

  return (
    <>
      <PageHeader
        title={product.name}
        crumbs={[
          { label: "Trang Chủ", href: "/" },
          { label: "Sản Phẩm", href: "/products" },
          { label: product.categoryLabel },
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          <div>
            <div
              className="aspect-square bg-cream rounded-2xl overflow-hidden mb-4 relative border border-gold/10 group/gallery select-none"
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
            >
              {product.badge && <div className="ribbon">{product.badge}</div>}
              {discount > 0 && (
                <div className="absolute top-4 right-4 bg-gold text-burgundy-950 text-sm font-bold px-3 py-1.5 rounded-full z-10">
                  -{discount}%
                </div>
              )}
              <Image
                src={product.gallery[selectedImage]}
                alt={product.name}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
                className="object-cover transition-opacity duration-300"
                draggable={false}
              />
              {galleryLen > 1 && (
                <>
                  <button
                    onClick={goPrev}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-burgundy shadow-md flex items-center justify-center opacity-0 group-hover/gallery:opacity-100 transition-opacity z-10"
                    aria-label="Ảnh trước"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={goNext}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-burgundy shadow-md flex items-center justify-center opacity-0 group-hover/gallery:opacity-100 transition-opacity z-10"
                    aria-label="Ảnh sau"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                    {product.gallery.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedImage(i)}
                        className={`h-1.5 rounded-full transition-all ${
                          selectedImage === i ? "w-6 bg-burgundy" : "w-1.5 bg-burgundy/30 hover:bg-burgundy/60"
                        }`}
                        aria-label={`Đến ảnh ${i + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
            <div className="grid grid-cols-3 gap-3">
              {product.gallery.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === i ? "border-gold" : "border-gray-100 hover:border-gold/50"
                  }`}
                  aria-label={`Ảnh ${i + 1}`}
                >
                  <Image src={img} alt={`${product.name} ${i + 1}`} fill sizes="120px" className="object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-gold text-xs uppercase tracking-[0.2em] mb-2">{product.categoryLabel}</p>
            <h1 className="font-serif text-3xl text-burgundy mb-4">{product.name}</h1>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg
                    key={i}
                    className={`w-4 h-4 ${i < product.rating ? "text-gold" : "text-gray-200"}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm text-gray-500">{product.reviews} đánh giá</span>
              <span className="text-sm text-gray-300">|</span>
              <span className={`text-sm font-medium ${product.inStock ? "text-green-600" : "text-red-500"}`}>
                {product.inStock ? `Còn ${product.stockCount} sản phẩm` : "Hết hàng"}
              </span>
            </div>

            <div className="flex items-baseline gap-3 mb-6 pb-6 border-b border-gold/10">
              <span className="text-3xl font-serif font-bold text-burgundy">{formatPrice(product.price)}</span>
              {product.originalPrice && (
                <span className="text-lg text-gray-400 line-through">{formatPrice(product.originalPrice)}</span>
              )}
            </div>

            <p className="text-gray-600 font-light text-sm leading-relaxed mb-6">{product.shortDesc}</p>

            <div className="mb-6">
              <p className="text-sm text-gray-700 font-medium mb-3">Số lượng</p>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-gray-200 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-burgundy"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-12 h-10 text-center outline-none"
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-burgundy"
                  >
                    +
                  </button>
                </div>
                <p className="text-sm text-gray-500">
                  Tổng: <span className="text-burgundy font-semibold">{formatPrice(product.price * quantity)}</span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mb-8">
              <button
                onClick={() => addItem(product, quantity)}
                disabled={!product.inStock}
                className="btn-burgundy flex-1 justify-center"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Thêm vào giỏ
              </button>
              <Link
                href="/checkout"
                onClick={() => {
                  buyNow(product, quantity);
                  toast.success(`Đã thêm "${product.name}" - chuyển đến thanh toán`);
                }}
                className="btn-gold flex-1 justify-center"
              >
                Mua ngay
              </Link>
              <button
                onClick={() => toggle(product.slug, product.name)}
                className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center transition-colors ${
                  liked ? "bg-burgundy border-burgundy text-white" : "border-burgundy text-burgundy hover:bg-burgundy hover:text-white"
                }`}
                aria-label="Yêu thích"
              >
                <svg className="w-5 h-5" fill={liked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center text-xs text-gray-600 pt-6 border-t border-gold/10">
              <div>
                <IconTruck className="w-7 h-7 mx-auto mb-2 text-gold" strokeWidth={1.25} />
                <p className="font-medium">Miễn phí giao hàng</p>
                <p className="text-gray-400">Đơn từ 500K</p>
              </div>
              <div>
                <IconRefresh className="w-7 h-7 mx-auto mb-2 text-gold" strokeWidth={1.25} />
                <p className="font-medium">Đổi trả 7 ngày</p>
                <p className="text-gray-400">Miễn phí</p>
              </div>
              <div>
                <IconShield className="w-7 h-7 mx-auto mb-2 text-gold" strokeWidth={1.25} />
                <p className="font-medium">Cam kết chính hãng</p>
                <p className="text-gray-400">100% nguyên chất</p>
              </div>
            </div>
          </div>
        </div>

        <BundleDeal current={product} candidates={related} />

        <div className="mt-16">
          <div className="flex border-b border-gold/10 mb-6 overflow-x-auto">
            {[
              { key: "desc" as const, label: "Mô Tả" },
              { key: "specs" as const, label: "Thông Số" },
              { key: "reviews" as const, label: `Đánh Giá (${product.reviews})` },
              { key: "shipping" as const, label: "Vận Chuyển" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.key
                    ? "border-gold text-burgundy"
                    : "border-transparent text-gray-500 hover:text-burgundy"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="text-gray-600 font-light text-sm leading-relaxed">
            {activeTab === "desc" && <p>{product.description}</p>}
            {activeTab === "specs" && (
              <table className="w-full max-w-2xl">
                <tbody>
                  {product.specs.map((s, i) => (
                    <tr key={i} className="border-b border-gold/5">
                      <td className="py-3 pr-4 font-medium text-burgundy w-1/3">{s.label}</td>
                      <td className="py-3 text-gray-600">{s.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {activeTab === "reviews" && <ReviewSection slug={product.slug} />}
            {activeTab === "shipping" && (
              <div className="space-y-3 max-w-2xl">
                <p>🚚 <strong>Miễn phí vận chuyển</strong> cho đơn hàng từ 500.000đ.</p>
                <p>📦 Đặt hàng trước 14h trong ngày để được giao trong ngày tại TP.HCM và Hà Nội.</p>
                <p>⏰ Thời gian giao hàng tỉnh thành khác: 2-4 ngày làm việc.</p>
                <p>🔄 Chính sách đổi trả miễn phí trong vòng 7 ngày kể từ khi nhận hàng.</p>
                <p>💳 Hỗ trợ thanh toán: COD, chuyển khoản, VNPay, MoMo.</p>
              </div>
            )}
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-20">
            <h2 className="font-serif text-2xl text-burgundy text-center mb-2">Sản phẩm liên quan</h2>
            <div className="w-16 h-[1px] bg-gold mx-auto mb-8" />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {related.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          </div>
        )}

        <RecentlyViewed excludeSlug={product.slug} />
      </div>
    </>
  );
}
