import { createClient } from "@/lib/supabase/server";
import OrdersFilter from "./OrdersFilter";
import OrdersTable from "./OrdersTable";

export const dynamic = "force-dynamic";

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

  const exportParams = new URLSearchParams();
  if (sp.status && sp.status !== "all") exportParams.set("status", sp.status);
  if (sp.q) exportParams.set("q", sp.q);
  const exportQs = exportParams.toString() ? `?${exportParams.toString()}` : "";

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-serif text-2xl text-burgundy">Đơn hàng</h1>
        <a
          href={`/api/admin/orders/export${exportQs}`}
          className="btn-outline-gold text-sm py-2 px-4 inline-flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" />
          </svg>
          Tải Excel ({orders?.length ?? 0} đơn)
        </a>
      </div>

      <OrdersFilter currentStatus={sp.status ?? "all"} currentQ={sp.q ?? ""} counts={countMap} />

      <OrdersTable orders={orders ?? []} />
    </div>
  );
}
