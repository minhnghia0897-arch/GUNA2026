"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { formatPrice } from "@/lib/format";
import PageHeader from "@/components/PageHeader";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type AppliedVoucher = {
  code: string;
  discount_type: "percentage" | "fixed" | "freeship";
  value: number;
  max_discount: number | null;
};

export default function CartPage() {
  const { items, removeItem, setQuantity, subtotal, totalItems } = useCart();
  const toast = useToast();
  const [coupon, setCoupon] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedVoucher | null>(null);
  const [couponError, setCouponError] = useState("");
  const [applying, setApplying] = useState(false);

  const applyCoupon = async () => {
    const code = coupon.trim().toUpperCase();
    if (!code) return;
    setApplying(true);
    setCouponError("");
    type VoucherRow = { code: string; discount_type: AppliedVoucher["discount_type"]; value: number; min_order: number; max_discount: number | null; ends_at: string | null; is_active: boolean };
    let data: VoucherRow | null = null;
    let hasError = false;
    try {
      const supabase = createClient();
      const res = await supabase
        .from("vouchers")
        .select("code, discount_type, value, min_order, max_discount, ends_at, is_active")
        .eq("code", code)
        .maybeSingle();
      data = (res.data as VoucherRow | null) ?? null;
      hasError = !!res.error;
    } catch (err) {
      console.error("[cart] applyCoupon threw", err);
      hasError = true;
    } finally {
      setApplying(false);
    }

    if (hasError || !data) {
      setCouponError("Mã giảm giá không tồn tại");
      setAppliedCoupon(null);
      toast.error("Mã giảm giá không tồn tại");
      return;
    }
    if (!data.is_active) {
      setCouponError("Mã giảm giá đã ngừng hoạt động");
      setAppliedCoupon(null);
      toast.error("Mã giảm giá đã ngừng hoạt động");
      return;
    }
    if (data.ends_at && new Date(data.ends_at).getTime() < Date.now()) {
      setCouponError("Mã giảm giá đã hết hạn");
      setAppliedCoupon(null);
      toast.error("Mã giảm giá đã hết hạn");
      return;
    }
    if (data.min_order > 0 && subtotal < data.min_order) {
      setCouponError(`Đơn hàng tối thiểu ${formatPrice(data.min_order)} để dùng mã này`);
      setAppliedCoupon(null);
      toast.error(`Đơn tối thiểu ${formatPrice(data.min_order)}`);
      return;
    }

    setAppliedCoupon({
      code: data.code,
      discount_type: data.discount_type,
      value: data.value,
      max_discount: data.max_discount,
    });
    const label =
      data.discount_type === "percentage" ? `-${data.value}%`
      : data.discount_type === "fixed" ? `-${formatPrice(data.value)}`
      : "Miễn phí ship";
    toast.success(`Áp dụng mã ${code} thành công (${label})`);
  };

  const handleRemove = (slug: string, name: string) => {
    removeItem(slug);
    toast.info(`Đã xóa "${name}" khỏi giỏ hàng`);
  };

  const computeDiscount = () => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.discount_type === "percentage") {
      const raw = Math.round(subtotal * appliedCoupon.value / 100);
      return appliedCoupon.max_discount ? Math.min(raw, appliedCoupon.max_discount) : raw;
    }
    if (appliedCoupon.discount_type === "fixed") {
      return Math.min(subtotal, appliedCoupon.value);
    }
    return 0;
  };

  const discountAmount = computeDiscount();
  const isFreeship = appliedCoupon?.discount_type === "freeship";
  const baseShipping = subtotal >= 500000 || subtotal === 0 ? 0 : 30000;
  const shipping = isFreeship ? 0 : baseShipping;
  const total = subtotal - discountAmount + shipping;

  const persistVoucherForCheckout = () => {
    try {
      if (appliedCoupon) {
        sessionStorage.setItem(
          "farmo-checkout-voucher",
          JSON.stringify({
            code: appliedCoupon.code,
            discount_type: appliedCoupon.discount_type,
            value: appliedCoupon.value,
            max_discount: appliedCoupon.max_discount,
            isFreeship,
            discount: discountAmount,
          })
        );
      } else {
        sessionStorage.removeItem("farmo-checkout-voucher");
      }
    } catch {}
  };

  return (
    <>
      <PageHeader
        title="Giỏ Hàng"
        crumbs={[{ label: "Trang Chủ", href: "/" }, { label: "Giỏ Hàng" }]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {items.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-7xl mb-6 opacity-30">🛒</div>
            <h2 className="font-serif text-2xl text-burgundy mb-3">Giỏ hàng trống</h2>
            <p className="text-gray-500 mb-8">Bạn chưa có sản phẩm nào trong giỏ hàng</p>
            <Link href="/products" className="btn-gold">
              Khám phá sản phẩm
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl border border-gold/10 overflow-hidden">
                <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-cream text-xs uppercase tracking-wider text-gray-500 font-medium">
                  <div className="col-span-6">Sản phẩm</div>
                  <div className="col-span-2 text-center">Đơn giá</div>
                  <div className="col-span-2 text-center">Số lượng</div>
                  <div className="col-span-2 text-right">Tạm tính</div>
                </div>

                {items.map((item) => (
                  <div key={item.slug} className="grid grid-cols-12 gap-4 px-4 sm:px-6 py-4 border-b border-gold/5 items-center">
                    <div className="col-span-12 md:col-span-6 flex gap-4">
                      <Link href={`/products/${item.slug}`} className="relative w-20 h-20 rounded-lg bg-cream overflow-hidden flex-shrink-0">
                        <Image src={item.image} alt={item.name} fill sizes="80px" className="object-cover" />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link href={`/products/${item.slug}`}>
                          <h3 className="text-sm font-medium text-gray-800 line-clamp-2 hover:text-burgundy">{item.name}</h3>
                        </Link>
                        <button
                          onClick={() => handleRemove(item.slug, item.name)}
                          className="text-xs text-gray-400 hover:text-burgundy mt-2"
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                    <div className="col-span-4 md:col-span-2 text-burgundy text-sm md:text-center">{formatPrice(item.price)}</div>
                    <div className="col-span-4 md:col-span-2 flex md:justify-center">
                      <div className="inline-flex items-center border border-gray-200 rounded">
                        <button onClick={() => setQuantity(item.slug, item.quantity - 1)} className="w-8 h-8 text-gray-500 hover:text-burgundy">−</button>
                        <span className="w-10 text-center text-sm">{item.quantity}</span>
                        <button onClick={() => setQuantity(item.slug, item.quantity + 1)} className="w-8 h-8 text-gray-500 hover:text-burgundy">+</button>
                      </div>
                    </div>
                    <div className="col-span-4 md:col-span-2 text-burgundy font-semibold text-sm text-right">{formatPrice(item.price * item.quantity)}</div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between mt-6 flex-wrap gap-3">
                <Link href="/products" className="text-sm text-burgundy hover:text-gold flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                  </svg>
                  Tiếp tục mua sắm
                </Link>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl border border-gold/10 p-6 sticky top-28">
                <h3 className="font-serif text-xl text-burgundy mb-4">Tóm tắt đơn hàng</h3>

                <div className="mb-4">
                  <label className="text-sm text-gray-600 mb-2 block">Mã giảm giá</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={coupon}
                      onChange={(e) => setCoupon(e.target.value)}
                      placeholder="VD: FARMO10"
                      className="input-field flex-1"
                    />
                    <button
                      onClick={applyCoupon}
                      disabled={applying}
                      className="px-4 py-2 bg-burgundy text-white rounded-lg text-sm hover:bg-burgundy-900 disabled:opacity-50"
                    >
                      {applying ? "..." : "Áp dụng"}
                    </button>
                  </div>
                  {couponError && <p className="text-xs text-red-500 mt-1">{couponError}</p>}
                  {appliedCoupon && (
                    <p className="text-xs text-green-600 mt-1">
                      ✓ Đã áp dụng <strong>{appliedCoupon.code}</strong>
                      {" — "}
                      {appliedCoupon.discount_type === "percentage"
                        ? `Giảm ${appliedCoupon.value}%`
                        : appliedCoupon.discount_type === "fixed"
                        ? `Giảm ${formatPrice(appliedCoupon.value)}`
                        : "Miễn phí ship"}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">Mã giảm giá: xem tại <a href="/account/vouchers" className="underline hover:text-burgundy">Voucher của tôi</a></p>
                </div>

                <div className="space-y-3 py-4 border-t border-gold/10">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tạm tính ({totalItems} sản phẩm)</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Giảm giá</span>
                      <span>−{formatPrice(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Phí vận chuyển</span>
                    <span>{shipping === 0 ? "Miễn phí" : formatPrice(shipping)}</span>
                  </div>
                </div>

                <div className="flex justify-between pt-4 border-t border-gold/10 mb-6">
                  <span className="font-medium">Tổng cộng</span>
                  <span className="text-burgundy font-serif text-xl font-bold">{formatPrice(total)}</span>
                </div>

                <Link href="/checkout" onClick={persistVoucherForCheckout} className="btn-gold w-full justify-center">
                  Tiến hành thanh toán
                </Link>

                <div className="mt-4 text-xs text-gray-400 text-center">
                  Thanh toán an toàn • Bảo mật thông tin
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
