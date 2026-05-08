"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/format";
import { useEffect } from "react";
import { useFocusTrap } from "@/hooks/useFocusTrap";

export default function CartDrawer() {
  const pathname = usePathname();
  const { items, isOpen, closeCart, removeItem, setQuantity, subtotal, totalItems } = useCart();
  const trapRef = useFocusTrap<HTMLDivElement>(isOpen);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, closeCart]);

  if (pathname.startsWith("/admin")) return null;
  if (!isOpen) return null;

  const SHIPPING_THRESHOLD = 500000;
  const remaining = Math.max(0, SHIPPING_THRESHOLD - subtotal);
  const progress = Math.min(100, (subtotal / SHIPPING_THRESHOLD) * 100);

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50 fade-in" onClick={closeCart} />
      <div ref={trapRef} role="dialog" aria-modal="true" aria-label="Giỏ hàng" className="fixed top-0 right-0 h-full w-full sm:max-w-md bg-white z-50 shadow-2xl flex flex-col slide-in-right">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-serif text-xl text-burgundy">Giỏ hàng ({totalItems})</h2>
          <button onClick={closeCart} className="text-gray-400 hover:text-burgundy" aria-label="Đóng">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {items.length > 0 && (
          <div className="px-6 py-3 bg-cream border-b border-gold/10">
            {remaining > 0 ? (
              <p className="text-xs text-gray-600 mb-2">
                Mua thêm <span className="text-burgundy font-semibold">{formatPrice(remaining)}</span> để được <span className="font-semibold">miễn phí vận chuyển</span>
              </p>
            ) : (
              <p className="text-xs text-green-700 mb-2 font-medium">
                ✓ Bạn được miễn phí vận chuyển!
              </p>
            )}
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gold transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4 opacity-30">🛒</div>
              <p className="text-gray-500 font-light mb-6">Giỏ hàng của bạn đang trống</p>
              <Link href="/products" onClick={closeCart} className="btn-gold inline-flex">
                Khám phá sản phẩm
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.slug} className="flex gap-3 pb-4 border-b border-gray-50">
                  <Link href={`/products/${item.slug}`} onClick={closeCart} className="relative w-20 h-20 rounded-lg bg-cream overflow-hidden flex-shrink-0">
                    <Image src={item.image} alt={item.name} fill sizes="80px" className="object-cover" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link href={`/products/${item.slug}`} onClick={closeCart}>
                      <h4 className="text-sm font-medium text-gray-800 line-clamp-2 hover:text-burgundy">{item.name}</h4>
                    </Link>
                    <p className="text-burgundy text-sm font-semibold mt-1">{formatPrice(item.price)}</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-gray-200 rounded">
                        <button
                          onClick={() => setQuantity(item.slug, item.quantity - 1)}
                          className="px-2 py-1 text-gray-500 hover:text-burgundy"
                        >
                          −
                        </button>
                        <span className="px-3 text-sm">{item.quantity}</span>
                        <button
                          onClick={() => setQuantity(item.slug, item.quantity + 1)}
                          className="px-2 py-1 text-gray-500 hover:text-burgundy"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.slug)}
                        className="text-xs text-gray-400 hover:text-burgundy"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-gray-100 px-6 py-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tạm tính</span>
              <span className="font-semibold text-burgundy">{formatPrice(subtotal)}</span>
            </div>
            <p className="text-xs text-gray-400">Phí vận chuyển sẽ được tính ở bước thanh toán</p>
            <Link
              href="/checkout"
              onClick={closeCart}
              className="btn-gold w-full justify-center"
            >
              Thanh toán
            </Link>
            <Link
              href="/cart"
              onClick={closeCart}
              className="block text-center text-sm text-burgundy hover:text-gold underline"
            >
              Xem giỏ hàng đầy đủ
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
