"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import { createClient } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/format";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import type { DbOrder, DbOrderItem } from "@/lib/supabase/types";

const STATUS_LABEL: Record<DbOrder["status"], string> = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  shipping: "Đang giao",
  delivered: "Đã giao",
  cancelled: "Đã hủy",
};

const STATUS_COLOR: Record<DbOrder["status"], string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-blue-100 text-blue-700",
  shipping: "bg-indigo-100 text-indigo-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const PAYMENT_LABEL: Record<DbOrder["payment_method"], string> = {
  cod: "Thanh toán khi nhận hàng (COD)",
  bank: "Chuyển khoản ngân hàng",
  vnpay: "VNPay",
  momo: "Ví MoMo",
};

const SHIPPING_LABEL: Record<DbOrder["shipping_method"], string> = {
  standard: "Giao hàng tiêu chuẩn (2-4 ngày)",
  express: "Giao hàng nhanh (trong ngày)",
};

const TIMELINE: { key: DbOrder["status"]; label: string }[] = [
  { key: "pending", label: "Chờ xác nhận" },
  { key: "confirmed", label: "Đã xác nhận" },
  { key: "shipping", label: "Đang giao" },
  { key: "delivered", label: "Đã giao" },
];

const CANCEL_WINDOW_MS = 30 * 60 * 1000;

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const toast = useToast();
  const { addItem } = useCart();
  const supabase = createClient();
  const [order, setOrder] = useState<DbOrder | null | undefined>(undefined);
  const [items, setItems] = useState<DbOrderItem[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data: o } = await supabase
        .from("orders")
        .select("*")
        .eq("order_code", id)
        .maybeSingle();
      if (!o) {
        setOrder(null);
        return;
      }
      const ord = o as DbOrder;
      setOrder(ord);
      const { data: its } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", ord.id);
      setItems((its as DbOrderItem[]) ?? []);
    };
    load();
  }, [id, supabase]);

  const handleCancel = async () => {
    if (!order) return;
    if (!confirm("Bạn có chắc muốn hủy đơn hàng này?")) return;
    const { data: updated, error } = await supabase
      .from("orders")
      .update({ status: "cancelled" })
      .eq("id", order.id)
      .select("*")
      .single();
    if (error) {
      toast.error("Hủy đơn thất bại: " + error.message);
      return;
    }
    setOrder(updated as DbOrder);
    toast.success("Đã hủy đơn hàng");
  };

  const handleReorder = async () => {
    if (!order || items.length === 0) return;
    const slugs = items.map((i) => i.product_slug);
    const { data: products } = await supabase
      .from("products")
      .select("id, slug, name, price, image, gallery, short_desc, description, category_slug, original_price, badge, stock_count, rating, reviews_count, specs")
      .in("slug", slugs);

    if (!products) {
      toast.error("Không thể đặt lại - sản phẩm không tồn tại");
      return;
    }
    const map = new Map(products.map((p) => [p.slug, p]));
    let added = 0;
    for (const it of items) {
      const p = map.get(it.product_slug);
      if (!p) continue;
      addItem({
        slug: p.slug,
        name: p.name,
        price: p.price,
        originalPrice: p.original_price ?? undefined,
        category: p.category_slug,
        categoryLabel: "",
        badge: p.badge,
        rating: p.rating,
        reviews: p.reviews_count,
        image: p.image ?? "/images/product-1.svg",
        gallery: (p.gallery as string[]) ?? [],
        shortDesc: p.short_desc ?? "",
        description: p.description ?? "",
        specs: (p.specs as { label: string; value: string }[]) ?? [],
        inStock: p.stock_count > 0,
        stockCount: p.stock_count,
      }, it.quantity);
      added++;
    }
    if (added > 0) {
      toast.success(`Đã thêm ${added} sản phẩm vào giỏ`);
      router.push("/cart");
    } else {
      toast.error("Không thể đặt lại - sản phẩm không còn tồn tại");
    }
  };

  if (order === undefined) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="animate-spin w-8 h-8 border-2 border-gold border-t-transparent rounded-full mx-auto" />
      </div>
    );
  }

  if (order === null) {
    return (
      <>
        <PageHeader title="Không tìm thấy đơn hàng" crumbs={[{ label: "Trang Chủ", href: "/" }, { label: "Đơn Hàng" }]} />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <div className="text-6xl mb-4 opacity-30">🔍</div>
          <p className="text-gray-500 mb-6">Không tìm thấy đơn hàng với mã <strong>{id}</strong></p>
          <Link href="/account/orders" className="btn-gold inline-flex">Xem tất cả đơn</Link>
        </div>
      </>
    );
  }

  const currentStepIdx = TIMELINE.findIndex((t) => t.key === order.status);
  const cancellable = order.status === "pending" && Date.now() - new Date(order.created_at).getTime() < CANCEL_WINDOW_MS;
  const addr = order.shipping_address;

  return (
    <>
      <PageHeader
        title={`Đơn hàng #${order.order_code}`}
        crumbs={[
          { label: "Trang Chủ", href: "/" },
          { label: "Đơn Hàng", href: "/account/orders" },
          { label: order.order_code },
        ]}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
        <div className="bg-white rounded-xl border border-gold/10 p-6">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Trạng thái</p>
              <span className={`inline-block text-sm px-3 py-1 rounded-full font-medium ${STATUS_COLOR[order.status]}`}>
                {STATUS_LABEL[order.status]}
              </span>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Đặt lúc</p>
              <p className="text-sm font-medium">
                {new Date(order.created_at).toLocaleString("vi-VN", {
                  day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
                })}
              </p>
            </div>
          </div>

          {order.status !== "cancelled" && (
            <div className="flex items-center justify-between">
              {TIMELINE.map((t, i) => {
                const done = i <= currentStepIdx;
                return (
                  <div key={t.key} className="flex-1 flex items-center">
                    <div className="flex flex-col items-center flex-1">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${done ? "bg-burgundy text-white" : "bg-gray-200 text-gray-400"}`}>
                        {done ? "✓" : i + 1}
                      </div>
                      <span className={`text-[10px] sm:text-xs mt-2 text-center ${done ? "text-burgundy font-medium" : "text-gray-400"}`}>
                        {t.label}
                      </span>
                    </div>
                    {i < TIMELINE.length - 1 && (
                      <div className={`flex-1 h-[1px] mb-5 ${i < currentStepIdx ? "bg-burgundy" : "bg-gray-200"}`} />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {(cancellable || order.status === "delivered" || order.status === "cancelled") && (
          <div className="bg-white rounded-xl border border-gold/10 p-4 flex items-center justify-between flex-wrap gap-3">
            <div className="text-sm">
              {cancellable && <p className="text-amber-700">⏰ Bạn có thể hủy đơn trong vòng 30 phút sau khi đặt</p>}
              {(order.status === "delivered" || order.status === "cancelled") && (
                <p className="text-gray-600">Mua lại các sản phẩm trong đơn này?</p>
              )}
            </div>
            <div className="flex gap-2 flex-wrap">
              {cancellable && (
                <button onClick={handleCancel} className="text-sm px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50">
                  Hủy đơn
                </button>
              )}
              <button onClick={handleReorder} className="text-sm px-4 py-2 bg-gold text-burgundy-950 rounded-lg hover:bg-gold/90 font-medium">
                Đặt lại
              </button>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gold/10 p-6">
            <h3 className="font-serif text-lg text-burgundy mb-4">Thông tin giao hàng</h3>
            <dl className="space-y-2 text-sm">
              <div><dt className="text-gray-500 inline">Người nhận: </dt><dd className="inline font-medium">{order.customer_name}</dd></div>
              <div><dt className="text-gray-500 inline">SĐT: </dt><dd className="inline font-medium">{order.customer_phone}</dd></div>
              {order.customer_email && <div><dt className="text-gray-500 inline">Email: </dt><dd className="inline font-medium">{order.customer_email}</dd></div>}
              <div><dt className="text-gray-500 inline">Địa chỉ: </dt><dd className="inline font-medium">{addr.line}, {addr.ward_name}, {addr.district_name}, {addr.province_name}</dd></div>
              {addr.note && <div><dt className="text-gray-500 inline">Ghi chú: </dt><dd className="inline">{addr.note}</dd></div>}
            </dl>
          </div>

          <div className="bg-white rounded-xl border border-gold/10 p-6">
            <h3 className="font-serif text-lg text-burgundy mb-4">Vận chuyển & Thanh toán</h3>
            <dl className="space-y-2 text-sm">
              <div><dt className="text-gray-500 inline">Vận chuyển: </dt><dd className="inline font-medium">{SHIPPING_LABEL[order.shipping_method]}</dd></div>
              <div><dt className="text-gray-500 inline">Thanh toán: </dt><dd className="inline font-medium">{PAYMENT_LABEL[order.payment_method]}</dd></div>
              {order.tracking_number && (
                <div><dt className="text-gray-500 inline">Mã vận đơn: </dt><dd className="inline font-mono">{order.tracking_number}</dd></div>
              )}
            </dl>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gold/10 overflow-hidden">
          <div className="px-6 py-4 border-b border-gold/10">
            <h3 className="font-serif text-lg text-burgundy">Sản phẩm ({items.length})</h3>
          </div>
          <div className="divide-y divide-gold/5">
            {items.map((item) => (
              <div key={item.id} className="px-6 py-4 flex gap-4 items-center">
                <Link href={`/products/${item.product_slug}`} className="relative w-16 h-16 rounded-lg bg-cream overflow-hidden flex-shrink-0">
                  <Image src={item.product_image ?? "/images/product-1.svg"} alt={item.product_name} fill sizes="64px" className="object-cover" />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link href={`/products/${item.product_slug}`} className="text-sm font-medium hover:text-burgundy line-clamp-2">
                    {item.product_name}
                  </Link>
                  <p className="text-xs text-gray-500 mt-1">SL: {item.quantity} × {formatPrice(item.unit_price)}</p>
                </div>
                <p className="text-burgundy font-semibold text-sm">{formatPrice(item.total_price)}</p>
              </div>
            ))}
          </div>
          <div className="px-6 py-4 bg-cream space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-600">Tạm tính</span><span>{formatPrice(order.subtotal)}</span></div>
            {order.discount > 0 && (
              <div className="flex justify-between text-green-600"><span>Giảm giá {order.voucher_code ? `(${order.voucher_code})` : ""}</span><span>−{formatPrice(order.discount)}</span></div>
            )}
            <div className="flex justify-between"><span className="text-gray-600">Phí vận chuyển</span><span>{order.shipping_fee === 0 ? "Miễn phí" : formatPrice(order.shipping_fee)}</span></div>
            <div className="flex justify-between pt-2 border-t border-gold/10"><span className="font-medium">Tổng cộng</span><span className="text-burgundy font-serif text-lg font-bold">{formatPrice(order.total)}</span></div>
          </div>
        </div>

        <div className="flex gap-3 flex-wrap">
          <Link href="/account/orders" className="btn-outline-gold">← Tất cả đơn hàng</Link>
          <Link href="/products" className="btn-gold">Tiếp tục mua sắm</Link>
        </div>
      </div>
    </>
  );
}
