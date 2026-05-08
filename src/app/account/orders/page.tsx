"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { createClient } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/format";
import type { DbOrder } from "@/lib/supabase/types";

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

export default function OrdersPage() {
  const [orders, setOrders] = useState<DbOrder[] | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (cancelled) return;
        if (!user) {
          setOrders([]);
          return;
        }
        const { data: list } = await supabase
          .from("orders")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        if (cancelled) return;
        const orderList = (list as DbOrder[]) ?? [];
        setOrders(orderList);

        if (orderList.length > 0) {
          const orderIds = orderList.map((o) => o.id);
          const { data: items } = await supabase
            .from("order_items")
            .select("order_id")
            .in("order_id", orderIds);
          if (cancelled) return;
          const map: Record<string, number> = {};
          (items as { order_id: string }[] | null)?.forEach((i) => {
            map[i.order_id] = (map[i.order_id] ?? 0) + 1;
          });
          setCounts(map);
        }
      } catch (err) {
        console.error("[OrdersPage] load failed", err);
        if (!cancelled) setOrders([]);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  if (orders === null) {
    return (
      <>
        <PageHeader title="Đơn Hàng Của Tôi" crumbs={[{ label: "Trang Chủ", href: "/" }, { label: "Đơn Hàng" }]} />
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="animate-spin w-8 h-8 border-2 border-gold border-t-transparent rounded-full mx-auto" />
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Đơn Hàng Của Tôi"
        crumbs={[{ label: "Trang Chủ", href: "/" }, { label: "Tài Khoản", href: "/account" }, { label: "Đơn Hàng" }]}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {orders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gold/10">
            <div className="text-6xl mb-4 opacity-30">📦</div>
            <h2 className="font-serif text-xl text-burgundy mb-2">Chưa có đơn hàng nào</h2>
            <p className="text-gray-500 mb-6">Khám phá các sản phẩm và đặt hàng đầu tiên của bạn</p>
            <Link href="/products" className="btn-gold inline-flex">Mua sắm ngay</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((o) => (
              <Link
                key={o.id}
                href={`/account/orders/${o.order_code}`}
                className="block bg-white rounded-xl border border-gold/10 p-6 hover:shadow-lg hover:shadow-burgundy/5 transition-all"
              >
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                  <div>
                    <p className="font-medium text-burgundy">#{o.order_code}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(o.created_at).toLocaleString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${STATUS_COLOR[o.status]}`}>
                    {STATUS_LABEL[o.status]}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gold/10 text-sm">
                  <span className="text-gray-600">{counts[o.id] ?? 0} sản phẩm</span>
                  <span className="text-burgundy font-semibold">{formatPrice(o.total)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
