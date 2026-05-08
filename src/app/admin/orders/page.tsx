import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/format";
import OrdersFilter from "./OrdersFilter";

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

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const supabase = await createClient();
  let query = supabase
    .from("orders")
    .select("id, order_code, customer_name, customer_phone, status, payment_method, total, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  if (sp.status && sp.status !== "all") {
    query = query.eq("status", sp.status);
  }
  if (sp.q) {
    query = query.or(`order_code.ilike.%${sp.q}%,customer_name.ilike.%${sp.q}%,customer_phone.ilike.%${sp.q}%`);
  }
  const { data: orders } = await query;

  const counts = await Promise.all(
    ["pending", "confirmed", "shipping", "delivered", "cancelled"].map(async (s) => {
      const { count } = await supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", s);
      return [s, count ?? 0] as const;
    })
  );
  const countMap = Object.fromEntries(counts);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-serif text-2xl text-burgundy">Đơn hàng</h1>
      </div>

      <OrdersFilter currentStatus={sp.status ?? "all"} currentQ={sp.q ?? ""} counts={countMap} />

      <div className="bg-white rounded-xl border border-gold/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-cream text-xs text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Mã đơn</th>
                <th className="px-4 py-3 text-left font-medium">Khách hàng</th>
                <th className="px-4 py-3 text-left font-medium hidden md:table-cell">Ngày</th>
                <th className="px-4 py-3 text-left font-medium hidden md:table-cell">Thanh toán</th>
                <th className="px-4 py-3 text-left font-medium">Trạng thái</th>
                <th className="px-4 py-3 text-right font-medium">Tổng tiền</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gold/5">
              {(orders ?? []).length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                    Không có đơn hàng nào
                  </td>
                </tr>
              ) : (
                (orders ?? []).map((o) => (
                  <tr key={o.id} className="hover:bg-cream transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/admin/orders/${o.id}`} className="text-burgundy font-medium hover:text-gold">
                        #{o.order_code}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-gray-800">{o.customer_name}</p>
                      <p className="text-xs text-gray-400">{o.customer_phone}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">
                      {new Date(o.created_at).toLocaleString("vi-VN", {
                        day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 uppercase hidden md:table-cell">
                      {o.payment_method}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLOR[o.status]}`}>
                        {STATUS_LABEL[o.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-burgundy">
                      {formatPrice(o.total)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
