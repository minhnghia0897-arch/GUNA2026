import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/format";
import {
  IconRevenue, IconOrders, IconTrendUp, IconClock,
  IconCustomers, IconProducts,
} from "@/components/icons";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  shipping: "Đang giao",
  delivered: "Đã giao",
  cancelled: "Đã hủy",
};

const STATUS_COLOR: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-blue-100 text-blue-700",
  shipping: "bg-indigo-100 text-indigo-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default async function AdminDashboard() {
  const supabase = await createClient();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayIso = today.toISOString();

  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();

  const [
    { data: ordersToday },
    { data: ordersMonth },
    { data: pendingOrders },
    { data: lowStock },
    { data: recentOrders },
    { count: customerCount },
    { count: productCount },
  ] = await Promise.all([
    supabase.from("orders").select("total, status").gte("created_at", todayIso),
    supabase.from("orders").select("total, status").gte("created_at", startOfMonth),
    supabase.from("orders").select("id, order_code").eq("status", "pending").limit(100),
    supabase.from("products").select("id, name, slug, stock_count").lt("stock_count", 20).order("stock_count").limit(5),
    supabase.from("orders").select("id, order_code, customer_name, status, total, created_at").order("created_at", { ascending: false }).limit(8),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "customer"),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("is_visible", true),
  ]);

  const revenueToday = (ordersToday ?? [])
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + (o.total ?? 0), 0);
  const revenueMonth = (ordersMonth ?? [])
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + (o.total ?? 0), 0);

  const stats = [
    { label: "Doanh thu hôm nay", value: formatPrice(revenueToday), accent: "text-gold", Icon: IconRevenue },
    { label: "Đơn hôm nay", value: (ordersToday ?? []).length.toString(), accent: "text-burgundy", Icon: IconOrders },
    { label: "Doanh thu tháng", value: formatPrice(revenueMonth), accent: "text-gold", Icon: IconTrendUp },
    { label: "Chờ xử lý", value: (pendingOrders ?? []).length.toString(), accent: "text-amber-600", Icon: IconClock },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl text-burgundy">Tổng quan</h1>
        <p className="text-sm text-gray-500 mt-1">
          {today.toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.Icon;
          return (
            <div key={s.label} className="bg-white rounded-xl border border-gold/10 p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-gray-500 uppercase tracking-wider">{s.label}</span>
                <Icon className={`w-5 h-5 ${s.accent}`} strokeWidth={1.5} />
              </div>
              <p className={`font-serif text-2xl font-bold ${s.accent}`}>{s.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 text-center text-sm">
        <Link href="/admin/customers" className="bg-white rounded-xl border border-gold/10 p-4 hover:bg-cream transition-colors group">
          <IconCustomers className="w-6 h-6 mx-auto mb-2 text-gold group-hover:text-burgundy transition-colors" strokeWidth={1.5} />
          <p className="text-2xl font-serif text-burgundy">{customerCount ?? 0}</p>
          <p className="text-xs text-gray-500 mt-1">Khách hàng</p>
        </Link>
        <Link href="/admin/products" className="bg-white rounded-xl border border-gold/10 p-4 hover:bg-cream transition-colors group">
          <IconProducts className="w-6 h-6 mx-auto mb-2 text-gold group-hover:text-burgundy transition-colors" strokeWidth={1.5} />
          <p className="text-2xl font-serif text-burgundy">{productCount ?? 0}</p>
          <p className="text-xs text-gray-500 mt-1">Sản phẩm</p>
        </Link>
        <Link href="/admin/orders" className="bg-white rounded-xl border border-gold/10 p-4 hover:bg-cream transition-colors group">
          <IconOrders className="w-6 h-6 mx-auto mb-2 text-gold group-hover:text-burgundy transition-colors" strokeWidth={1.5} />
          <p className="text-2xl font-serif text-burgundy">{(recentOrders ?? []).length}</p>
          <p className="text-xs text-gray-500 mt-1">Đơn gần đây</p>
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gold/10 overflow-hidden">
          <div className="px-5 py-4 border-b border-gold/10 flex items-center justify-between">
            <h2 className="font-serif text-lg text-burgundy">Đơn mới nhất</h2>
            <Link href="/admin/orders" className="text-xs text-burgundy hover:text-gold">
              Xem tất cả →
            </Link>
          </div>
          <div className="divide-y divide-gold/5">
            {(recentOrders ?? []).length === 0 ? (
              <div className="px-5 py-12 text-center text-sm text-gray-400">
                Chưa có đơn hàng nào
              </div>
            ) : (
              (recentOrders ?? []).map((o) => (
                <Link
                  key={o.id}
                  href={`/admin/orders/${o.id}`}
                  className="flex items-center justify-between px-5 py-3 hover:bg-cream transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-burgundy">#{o.order_code}</p>
                    <p className="text-xs text-gray-500 truncate">{o.customer_name}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[o.status] ?? "bg-gray-100 text-gray-600"}`}>
                      {STATUS_LABEL[o.status] ?? o.status}
                    </span>
                    <span className="text-sm font-semibold text-burgundy">{formatPrice(o.total)}</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gold/10 overflow-hidden">
          <div className="px-5 py-4 border-b border-gold/10 flex items-center justify-between">
            <h2 className="font-serif text-lg text-burgundy">Sắp hết hàng</h2>
            <Link href="/admin/products" className="text-xs text-burgundy hover:text-gold">
              Quản lý →
            </Link>
          </div>
          <div className="divide-y divide-gold/5">
            {(lowStock ?? []).length === 0 ? (
              <div className="px-5 py-12 text-center text-sm text-gray-400">
                Tất cả sản phẩm đủ hàng ✓
              </div>
            ) : (
              (lowStock ?? []).map((p) => (
                <Link
                  key={p.id}
                  href={`/admin/products/${p.id}`}
                  className="flex items-center justify-between px-5 py-3 hover:bg-cream transition-colors"
                >
                  <p className="text-sm text-gray-700 truncate flex-1 pr-2">{p.name}</p>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      p.stock_count === 0 ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {p.stock_count === 0 ? "Hết hàng" : `${p.stock_count} cái`}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
