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

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-serif text-2xl text-burgundy">Đơn hàng</h1>
      </div>

      <OrdersFilter currentStatus={sp.status ?? "all"} currentQ={sp.q ?? ""} counts={countMap} />

      <OrdersTable orders={orders ?? []} />
    </div>
  );
}
