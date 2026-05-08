"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { formatPrice } from "@/lib/format";
import PageHeader from "@/components/PageHeader";
import { provinces, getDistricts, getWards } from "@/data/vn-address";
import { createClient } from "@/lib/supabase/client";

type PaymentMethod = "cod" | "bank" | "vnpay" | "momo";
type ShippingMethod = "standard" | "express";

type CheckoutVoucher = {
  code: string;
  discount_type: "percentage" | "fixed" | "freeship";
  value: number;
  max_discount: number | null;
  isFreeship: boolean;
  discount: number;
};

export default function CheckoutPage() {
  const { items, subtotal, totalItems, clear } = useCart();
  const toast = useToast();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [submitting, setSubmitting] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [voucher, setVoucher] = useState<CheckoutVoucher | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("farmo-checkout-voucher");
      if (raw) setVoucher(JSON.parse(raw) as CheckoutVoucher);
    } catch {}
  }, []);

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    provinceCode: "",
    districtCode: "",
    wardCode: "",
    address: "",
    note: "",
  });
  const [shipping, setShipping] = useState<ShippingMethod>("standard");
  const [payment, setPayment] = useState<PaymentMethod>("cod");

  const districts = useMemo(() => getDistricts(form.provinceCode), [form.provinceCode]);
  const wards = useMemo(
    () => getWards(form.provinceCode, form.districtCode),
    [form.provinceCode, form.districtCode]
  );

  const provinceName = provinces.find((p) => p.code === form.provinceCode)?.name ?? "";
  const districtName = districts.find((d) => d.code === form.districtCode)?.name ?? "";
  const wardName = wards.find((w) => w.code === form.wardCode)?.name ?? "";

  const recomputedDiscount = useMemo(() => {
    if (!voucher) return 0;
    if (voucher.discount_type === "percentage") {
      const raw = Math.round((subtotal * voucher.value) / 100);
      return voucher.max_discount ? Math.min(raw, voucher.max_discount) : raw;
    }
    if (voucher.discount_type === "fixed") return Math.min(subtotal, voucher.value);
    return 0;
  }, [voucher, subtotal]);

  const baseShippingFee = subtotal >= 500000 ? 0 : shipping === "express" ? 50000 : 30000;
  const shippingFee = voucher?.isFreeship ? 0 : baseShippingFee;
  const total = Math.max(0, subtotal - recomputedDiscount + shippingFee);

  const update = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const onProvinceChange = (code: string) => {
    setForm((f) => ({ ...f, provinceCode: code, districtCode: "", wardCode: "" }));
  };
  const onDistrictChange = (code: string) => {
    setForm((f) => ({ ...f, districtCode: code, wardCode: "" }));
  };

  const phoneValid = /^0\d{9,10}$/.test(form.phone);
  const isStep1Valid =
    form.fullName.trim() &&
    phoneValid &&
    form.address.trim() &&
    form.provinceCode &&
    form.districtCode &&
    form.wardCode;

  const submitOrder = async () => {
    setSubmitting(true);
    try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data: stockRows, error: stockErr } = await supabase
      .from("products")
      .select("id, slug, name, stock_count, is_visible, price")
      .in("slug", items.map((i) => i.slug));

    if (stockErr || !stockRows) {
      toast.error("Không tải được sản phẩm, vui lòng thử lại");
      return;
    }

    const stockMap = new Map(stockRows.map((p) => [p.slug, p]));
    for (const cartItem of items) {
      const p = stockMap.get(cartItem.slug);
      if (!p || !p.is_visible) {
        toast.error(`"${cartItem.name}" không còn bán`);
        return;
      }
      if (p.stock_count < cartItem.quantity) {
        toast.error(`"${p.name}" chỉ còn ${p.stock_count} sản phẩm trong kho`);
        return;
      }
    }

    const { data: created, error: orderErr } = await supabase
      .from("orders")
      .insert({
        user_id: user?.id ?? null,
        customer_name: form.fullName,
        customer_phone: form.phone,
        customer_email: form.email || null,
        shipping_address: {
          line: form.address,
          ward_code: form.wardCode,
          ward_name: wardName,
          district_code: form.districtCode,
          district_name: districtName,
          province_code: form.provinceCode,
          province_name: provinceName,
          note: form.note || null,
        },
        shipping_method: shipping,
        shipping_fee: shippingFee,
        payment_method: payment,
        subtotal,
        discount: recomputedDiscount,
        voucher_code: voucher?.code ?? null,
        total,
        note: form.note || null,
      })
      .select("id, order_code")
      .single();

    if (orderErr || !created) {
      toast.error("Đặt hàng thất bại: " + (orderErr?.message ?? "Vui lòng thử lại"));
      return;
    }

    const itemsPayload = items.map((i) => {
      const p = stockMap.get(i.slug);
      return {
        order_id: created.id,
        product_id: p?.id ?? null,
        product_slug: i.slug,
        product_name: i.name,
        product_image: i.image,
        unit_price: i.price,
        quantity: i.quantity,
        total_price: i.price * i.quantity,
      };
    });

    const { error: itemsErr } = await supabase.from("order_items").insert(itemsPayload);
    if (itemsErr) {
      await supabase.from("orders").delete().eq("id", created.id);
      toast.error("Lưu sản phẩm thất bại, đã hủy đơn. Vui lòng thử lại.");
      console.error("order items error", itemsErr);
      return;
    }

    if (voucher?.code) {
      await supabase.rpc("increment_voucher_used", { voucher_code: voucher.code });
    }

    const id = created.order_code;
    setOrderId(id);
    try { sessionStorage.removeItem("farmo-checkout-voucher"); } catch {}
    clear();
    setStep(3);
    toast.success(`Đơn hàng ${id} đã được tạo`);
    } catch (err) {
      console.error("[checkout] submitOrder threw", err);
      toast.error("Lỗi đặt hàng: " + (err instanceof Error ? err.message : "không xác định"));
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0 && step !== 3) {
    return (
      <>
        <PageHeader title="Thanh Toán" crumbs={[{ label: "Trang Chủ", href: "/" }, { label: "Thanh Toán" }]} />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <div className="text-6xl mb-4 opacity-30">🛒</div>
          <p className="text-gray-500 mb-6">Giỏ hàng của bạn đang trống</p>
          <Link href="/products" className="btn-gold inline-flex">Khám phá sản phẩm</Link>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={step === 3 ? "Đặt Hàng Thành Công" : "Thanh Toán"}
        crumbs={[{ label: "Trang Chủ", href: "/" }, { label: "Thanh Toán" }]}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {step !== 3 && (
          <div className="flex items-center justify-center gap-2 sm:gap-4 mb-10 flex-wrap">
            {[
              { num: 1, label: "Giao hàng" },
              { num: 2, label: "Thanh toán" },
              { num: 3, label: "Hoàn tất" },
            ].map((s, i) => (
              <div key={s.num} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step >= s.num ? "bg-burgundy text-white" : "bg-gray-200 text-gray-400"
                }`}>
                  {step > s.num ? "✓" : s.num}
                </div>
                <span className={`text-sm ${step >= s.num ? "text-burgundy font-medium" : "text-gray-400"}`}>
                  {s.label}
                </span>
                {i < 2 && <div className={`w-8 sm:w-16 h-[1px] ${step > s.num ? "bg-burgundy" : "bg-gray-200"}`} />}
              </div>
            ))}
          </div>
        )}

        {step === 3 ? (
          <div className="max-w-2xl mx-auto text-center bg-white rounded-2xl border border-gold/10 p-12">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-50 flex items-center justify-center">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="font-serif text-3xl text-burgundy mb-3">Đặt hàng thành công!</h2>
            <p className="text-gray-600 mb-2">Cảm ơn bạn đã mua sắm tại GUNA GIFT.</p>
            <p className="text-gray-600 mb-6">
              Mã đơn hàng: <span className="font-bold text-burgundy">{orderId}</span>
            </p>
            <div className="bg-cream rounded-lg p-4 mb-6 text-left text-sm space-y-2">
              <p>📞 Chúng tôi sẽ liên hệ trong vòng 30 phút để xác nhận đơn hàng.</p>
              <p>🚚 Đơn hàng dự kiến giao trong 1-3 ngày làm việc.</p>
              <p className="text-xs text-gray-500">Hãy lưu lại mã đơn để tra cứu sau.</p>
            </div>
            <div className="flex gap-3 justify-center flex-wrap">
              <Link href={`/account/orders/${orderId}`} className="btn-gold">Xem chi tiết đơn</Link>
              <Link href="/products" className="btn-outline-gold">Tiếp tục mua sắm</Link>
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {step === 1 && (
                <div className="bg-white rounded-xl border border-gold/10 p-6">
                  <h2 className="font-serif text-xl text-burgundy mb-6">Thông tin giao hàng</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-600 mb-1 block">Họ và tên *</label>
                      <input className="input-field" value={form.fullName} onChange={(e) => update("fullName", e.target.value)} />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600 mb-1 block">Số điện thoại *</label>
                      <input
                        className="input-field"
                        value={form.phone}
                        onChange={(e) => update("phone", e.target.value.replace(/[^\d]/g, ""))}
                        placeholder="0901234567"
                        inputMode="numeric"
                      />
                      {form.phone && !phoneValid && (
                        <p className="text-xs text-red-500 mt-1">SĐT phải bắt đầu bằng 0 và dài 10-11 chữ số</p>
                      )}
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-sm text-gray-600 mb-1 block">Email</label>
                      <input type="email" className="input-field" value={form.email} onChange={(e) => update("email", e.target.value)} />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600 mb-1 block">Tỉnh / Thành phố *</label>
                      <select
                        className="input-field"
                        value={form.provinceCode}
                        onChange={(e) => onProvinceChange(e.target.value)}
                      >
                        <option value="">-- Chọn tỉnh / TP --</option>
                        {provinces.map((p) => (
                          <option key={p.code} value={p.code}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600 mb-1 block">Quận / Huyện *</label>
                      <select
                        className="input-field"
                        value={form.districtCode}
                        onChange={(e) => onDistrictChange(e.target.value)}
                        disabled={!form.provinceCode}
                      >
                        <option value="">{form.provinceCode ? "-- Chọn quận / huyện --" : "Chọn tỉnh trước"}</option>
                        {districts.map((d) => (
                          <option key={d.code} value={d.code}>{d.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600 mb-1 block">Phường / Xã *</label>
                      <select
                        className="input-field"
                        value={form.wardCode}
                        onChange={(e) => update("wardCode", e.target.value)}
                        disabled={!form.districtCode}
                      >
                        <option value="">{form.districtCode ? "-- Chọn phường / xã --" : "Chọn quận trước"}</option>
                        {wards.map((w) => (
                          <option key={w.code} value={w.code}>{w.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-sm text-gray-600 mb-1 block">Địa chỉ chi tiết *</label>
                      <input className="input-field" value={form.address} onChange={(e) => update("address", e.target.value)} placeholder="Số nhà, tên đường..." />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-sm text-gray-600 mb-1 block">Ghi chú</label>
                      <textarea className="input-field" rows={3} value={form.note} onChange={(e) => update("note", e.target.value)} />
                    </div>
                  </div>

                  <div className="mt-6">
                    <p className="text-sm font-medium mb-3">Phương thức vận chuyển</p>
                    <div className="space-y-2">
                      <label className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${shipping === "standard" ? "border-gold bg-gold/5" : "border-gray-200"}`}>
                        <div className="flex items-center gap-3">
                          <input type="radio" checked={shipping === "standard"} onChange={() => setShipping("standard")} />
                          <div>
                            <p className="text-sm font-medium">Giao hàng tiêu chuẩn</p>
                            <p className="text-xs text-gray-500">2-4 ngày làm việc</p>
                          </div>
                        </div>
                        <span className="text-sm font-medium">{subtotal >= 500000 ? "Miễn phí" : "30.000đ"}</span>
                      </label>
                      <label className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${shipping === "express" ? "border-gold bg-gold/5" : "border-gray-200"}`}>
                        <div className="flex items-center gap-3">
                          <input type="radio" checked={shipping === "express"} onChange={() => setShipping("express")} />
                          <div>
                            <p className="text-sm font-medium">Giao hàng nhanh</p>
                            <p className="text-xs text-gray-500">Trong ngày tại TP.HCM, Hà Nội</p>
                          </div>
                        </div>
                        <span className="text-sm font-medium">{subtotal >= 500000 ? "Miễn phí" : "50.000đ"}</span>
                      </label>
                    </div>
                  </div>

                  <button
                    onClick={() => setStep(2)}
                    disabled={!isStep1Valid}
                    className="btn-gold w-full justify-center mt-6"
                  >
                    Tiếp tục đến thanh toán
                  </button>
                </div>
              )}

              {step === 2 && (
                <div className="bg-white rounded-xl border border-gold/10 p-6">
                  <h2 className="font-serif text-xl text-burgundy mb-6">Phương thức thanh toán</h2>
                  <div className="space-y-3">
                    {[
                      { key: "cod" as const, label: "Thanh toán khi nhận hàng (COD)", desc: "Trả tiền mặt khi nhận hàng", icon: "💵" },
                      { key: "bank" as const, label: "Chuyển khoản ngân hàng", desc: "Thông tin TK sẽ hiển thị sau khi đặt", icon: "🏦" },
                      { key: "vnpay" as const, label: "VNPay (ATM/Visa/Master)", desc: "Thanh toán online qua cổng VNPay", icon: "💳" },
                      { key: "momo" as const, label: "Ví MoMo", desc: "Quét QR thanh toán qua MoMo", icon: "📱" },
                    ].map((p) => (
                      <label key={p.key} className={`flex items-start gap-4 p-4 border rounded-lg cursor-pointer transition-colors ${payment === p.key ? "border-gold bg-gold/5" : "border-gray-200"}`}>
                        <input type="radio" checked={payment === p.key} onChange={() => setPayment(p.key)} className="mt-1" />
                        <div className="text-2xl">{p.icon}</div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{p.label}</p>
                          <p className="text-xs text-gray-500">{p.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>

                  <div className="bg-cream rounded-lg p-4 mt-6 text-sm">
                    <p className="font-medium text-burgundy mb-2">Giao đến:</p>
                    <p className="text-gray-700">{form.fullName} · {form.phone}</p>
                    <p className="text-gray-600 mt-1">
                      {form.address}, {wardName}, {districtName}, {provinceName}
                    </p>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button onClick={() => setStep(1)} className="btn-outline-gold flex-1 justify-center">
                      Quay lại
                    </button>
                    <button
                      onClick={submitOrder}
                      disabled={submitting}
                      className="btn-gold flex-1 justify-center"
                    >
                      {submitting ? "Đang xử lý..." : "Đặt hàng"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl border border-gold/10 p-6 sticky top-28">
                <h3 className="font-serif text-lg text-burgundy mb-4">Đơn hàng ({totalItems})</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto pr-2 mb-4">
                  {items.map((item) => (
                    <div key={item.slug} className="flex gap-3 text-sm">
                      <div className="w-14 h-14 rounded bg-cream overflow-hidden flex-shrink-0 relative">
                        <Image src={item.image} alt={item.name} fill sizes="56px" className="object-cover" />
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-burgundy text-white text-[10px] rounded-full flex items-center justify-center z-10">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium line-clamp-2">{item.name}</p>
                        <p className="text-burgundy text-xs mt-1">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="space-y-2 py-4 border-t border-gold/10 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Tạm tính</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  {voucher && recomputedDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Giảm ({voucher.code})</span>
                      <span>−{formatPrice(recomputedDiscount)}</span>
                    </div>
                  )}
                  {voucher?.isFreeship && (
                    <div className="flex justify-between text-green-600 text-xs">
                      <span>Voucher miễn phí ship ({voucher.code})</span>
                      <span>−{formatPrice(baseShippingFee)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-600">
                    <span>Vận chuyển</span>
                    <span>{shippingFee === 0 ? "Miễn phí" : formatPrice(shippingFee)}</span>
                  </div>
                </div>
                <div className="flex justify-between pt-3 border-t border-gold/10">
                  <span className="font-medium">Tổng cộng</span>
                  <span className="text-burgundy font-serif text-lg font-bold">{formatPrice(total)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
