import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/format";

export const dynamic = "force-dynamic";

const TIER_LABEL: Record<string, string> = {
  silver: "Bạc",
  gold: "Vàng",
  diamond: "Kim Cương",
};

const TIER_COLOR: Record<string, string> = {
  silver: "bg-gray-100 text-gray-700",
  gold: "bg-amber-100 text-amber-700",
  diamond: "bg-indigo-100 text-indigo-700",
};

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tier?: string }>;
}) {
  const sp = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("profiles")
    .select("id, email, full_name, phone, role, total_orders, total_spent, tier, created_at")
    .order("total_spent", { ascending: false })
    .limit(200);

  if (sp.tier && sp.tier !== "all") query = query.eq("tier", sp.tier);
  if (sp.q) query = query.or(`email.ilike.%${sp.q}%,full_name.ilike.%${sp.q}%,phone.ilike.%${sp.q}%`);

  const { data: customers } = await query;

  return (
    <div className="space-y-5">
      <h1 className="font-serif text-2xl text-burgundy">Khách hàng ({(customers ?? []).length})</h1>

      <form className="flex gap-2 flex-wrap" action="/admin/customers" method="get">
        <input
          type="search"
          name="q"
          defaultValue={sp.q ?? ""}
          placeholder="Tìm theo email, tên, SĐT..."
          className="input-field flex-1 min-w-[200px] max-w-md"
        />
        <select name="tier" defaultValue={sp.tier ?? "all"} className="input-field max-w-[180px]">
          <option value="all">Mọi hạng</option>
          <option value="silver">Bạc</option>
          <option value="gold">Vàng</option>
          <option value="diamond">Kim Cương</option>
        </select>
        <button type="submit" className="px-4 py-2 bg-burgundy text-white rounded-lg text-sm hover:bg-burgundy-900">
          Lọc
        </button>
      </form>

      <div className="bg-white rounded-xl border border-gold/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-cream text-xs text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Khách hàng</th>
                <th className="px-4 py-3 text-left font-medium hidden md:table-cell">SĐT</th>
                <th className="px-4 py-3 text-center font-medium">Hạng</th>
                <th className="px-4 py-3 text-center font-medium">Đơn</th>
                <th className="px-4 py-3 text-right font-medium">Đã chi</th>
                <th className="px-4 py-3 text-right font-medium hidden md:table-cell">Tham gia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gold/5">
              {(customers ?? []).length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-400">Chưa có khách hàng nào</td>
                </tr>
              ) : (
                (customers ?? []).map((c) => (
                  <tr key={c.id} className="hover:bg-cream transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-burgundy/10 text-burgundy flex items-center justify-center text-sm font-serif font-bold flex-shrink-0">
                          {(c.full_name || c.email || "?").charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-800 truncate">{c.full_name || "—"}</p>
                          <p className="text-xs text-gray-400 truncate">{c.email}</p>
                        </div>
                        {c.role !== "customer" && (
                          <span className="text-[10px] bg-burgundy text-white px-2 py-0.5 rounded uppercase tracking-wider">
                            {c.role}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{c.phone || "—"}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${TIER_COLOR[c.tier]}`}>
                        {TIER_LABEL[c.tier]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-700">{c.total_orders}</td>
                    <td className="px-4 py-3 text-right font-semibold text-burgundy">{formatPrice(c.total_spent)}</td>
                    <td className="px-4 py-3 text-right text-xs text-gray-400 hidden md:table-cell">
                      {new Date(c.created_at).toLocaleDateString("vi-VN")}
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
