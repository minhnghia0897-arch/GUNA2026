import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/format";
import OrderStatusUpdater from "./OrderStatusUpdater";
import type { DbOrder, DbOrderItem } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

const PAYMENT_LABEL: Record<string, string> = {
  cod: "Thanh toán khi nhận hàng (COD)",
  bank: "Chuyển khoản ngân hàng",
  vnpay: "VNPay",
  momo: "Ví MoMo",
};

const SHIPPING_LABEL: Record<string, string> = {
  standard: "Giao hàng tiêu chuẩn (2-4 ngày)",
  express: "Giao hàng nhanh (trong ngày)",
};

export default async function AdminOrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: order } = await supabase.from("orders").select("*").eq("id", id).maybeSingle();
  if (!order) notFound();

  const o = order as DbOrder;
  const [{ data: items }, { data: timeline }] = await Promise.all([
    supabase.from("order_items").select("*").eq("order_id", o.id),
    supabase.from("order_timeline").select("*").eq("order_id", o.id).order("created_at", { ascending: true }),
  ]);

  const addr = o.shipping_address;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <Link href="/admin/orders" className="text-xs text-burgundy hover:text-gold">
            ← Tất cả đơn hàng
          </Link>
          <h1 className="font-serif text-2xl text-burgundy mt-1">Đơn #{o.order_code}</h1>
          <p className="text-xs text-gray-500" suppressHydrationWarning>
            {new Date(o.created_at).toLocaleString("vi-VN", {
              weekday: "long", day: "2-digit", month: "2-digit", year: "numeric",
              hour: "2-digit", minute: "2-digit",
              timeZone: "Asia/Ho_Chi_Minh",
            })}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-xl border border-gold/10 overflow-hidden">
            <div className="px-5 py-4 border-b border-gold/10">
              <h2 className="font-serif text-lg text-burgundy">Sản phẩm ({(items ?? []).length})</h2>
            </div>
            <div className="divide-y divide-gold/5">
              {((items as DbOrderItem[]) ?? []).map((it) => (
                <div key={it.id} className="px-5 py-3 flex items-center gap-4">
                  <div className="relative w-14 h-14 rounded-lg bg-cream overflow-hidden flex-shrink-0">
                    <Image src={it.product_image ?? "/images/product-1.svg"} alt="" fill sizes="56px" className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-1">{it.product_name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">SL: {it.quantity} × {formatPrice(it.unit_price)}</p>
                  </div>
                  <p className="text-burgundy font-semibold text-sm">{formatPrice(it.total_price)}</p>
                </div>
              ))}
            </div>
            <div className="px-5 py-4 bg-cream space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Tạm tính</span>
                <span>{formatPrice(o.subtotal)}</span>
              </div>
              {o.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Giảm {o.voucher_code ? `(${o.voucher_code})` : ""}</span>
                  <span>−{formatPrice(o.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Phí vận chuyển</span>
                <span>{o.shipping_fee === 0 ? "Miễn phí" : formatPrice(o.shipping_fee)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gold/20 mt-2">
                <span className="font-medium">Tổng cộng</span>
                <span className="text-burgundy font-serif text-lg font-bold">{formatPrice(o.total)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gold/10 overflow-hidden">
            <div className="px-5 py-4 border-b border-gold/10">
              <h2 className="font-serif text-lg text-burgundy">Lịch sử trạng thái</h2>
            </div>
            <div className="px-5 py-4 space-y-3">
              {(timeline ?? []).length === 0 ? (
                <p className="text-sm text-gray-400">Chưa có hoạt động nào.</p>
              ) : (
                (timeline ?? []).map((t) => (
                  <div key={t.id} className="flex items-start gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-burgundy mt-1.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-gray-800">{t.description}</p>
                      <p className="text-xs text-gray-400 mt-0.5" suppressHydrationWarning>
                        {new Date(t.created_at).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })} · {t.actor}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <OrderStatusUpdater orderId={o.id} currentStatus={o.status} currentTracking={o.tracking_number} />

          <div className="bg-white rounded-xl border border-gold/10 p-5">
            <h2 className="font-serif text-lg text-burgundy mb-4">Khách hàng</h2>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-xs text-gray-500 uppercase mb-0.5">Tên</dt>
                <dd className="font-medium">{o.customer_name}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500 uppercase mb-0.5">SĐT</dt>
                <dd className="font-medium">
                  <a href={`tel:${o.customer_phone}`} className="text-burgundy hover:text-gold">{o.customer_phone}</a>
                </dd>
              </div>
              {o.customer_email && (
                <div>
                  <dt className="text-xs text-gray-500 uppercase mb-0.5">Email</dt>
                  <dd className="font-medium">
                    <a href={`mailto:${o.customer_email}`} className="text-burgundy hover:text-gold">{o.customer_email}</a>
                  </dd>
                </div>
              )}
            </dl>
          </div>

          <div className="bg-white rounded-xl border border-gold/10 p-5">
            <h2 className="font-serif text-lg text-burgundy mb-4">Giao hàng</h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              {addr?.line}, {addr?.ward_name}, {addr?.district_name}, {addr?.province_name}
            </p>
            {addr?.note && (
              <p className="text-xs text-gray-500 mt-2 italic">Ghi chú: {addr.note}</p>
            )}
            <dl className="space-y-2 text-sm mt-4 pt-4 border-t border-gold/10">
              <div>
                <dt className="text-xs text-gray-500 uppercase mb-0.5">Phương thức</dt>
                <dd>{SHIPPING_LABEL[o.shipping_method]}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500 uppercase mb-0.5">Thanh toán</dt>
                <dd>{PAYMENT_LABEL[o.payment_method]}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
