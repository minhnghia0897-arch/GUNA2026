import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata = { title: "Newsletter | Quản trị" };

type Subscriber = {
  id: string;
  email: string;
  source: string;
  is_active: boolean;
  created_at: string;
};

export default async function AdminNewsletterPage() {
  const supabase = await createClient();
  const [{ data: subs }, { count: activeCount }] = await Promise.all([
    supabase
      .from("newsletter_subscribers")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500),
    supabase
      .from("newsletter_subscribers")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true),
  ]);

  const list = (subs as Subscriber[]) ?? [];

  // Source breakdown
  const bySource = list.reduce<Record<string, number>>((acc, s) => {
    acc[s.source] = (acc[s.source] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-serif text-2xl text-burgundy">Newsletter Subscribers</h1>
        <p className="text-sm text-gray-500 mt-1">
          Email khách đăng ký nhận khuyến mãi từ Footer + popup. Có thể export hoặc gửi mail.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gold/10 p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Tổng đăng ký</p>
          <p className="font-serif text-2xl font-bold text-burgundy">{list.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gold/10 p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Đang hoạt động</p>
          <p className="font-serif text-2xl font-bold text-green-600">{activeCount ?? 0}</p>
        </div>
        {Object.entries(bySource).slice(0, 2).map(([src, count]) => (
          <div key={src} className="bg-white rounded-xl border border-gold/10 p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Từ {src}</p>
            <p className="font-serif text-2xl font-bold text-burgundy">{count}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gold/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-cream text-xs text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Email</th>
                <th className="px-4 py-3 text-left font-medium">Nguồn</th>
                <th className="px-4 py-3 text-center font-medium">Trạng thái</th>
                <th className="px-4 py-3 text-right font-medium">Đăng ký</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gold/5">
              {list.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-gray-400">
                    Chưa có ai đăng ký newsletter
                  </td>
                </tr>
              ) : (
                list.map((s) => (
                  <tr key={s.id} className="hover:bg-cream transition-colors">
                    <td className="px-4 py-3 font-medium text-burgundy">{s.email}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 uppercase">{s.source}</td>
                    <td className="px-4 py-3 text-center">
                      {s.is_active ? (
                        <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                          Hoạt động
                        </span>
                      ) : (
                        <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">
                          Đã hủy
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-gray-500">
                      {new Date(s.created_at).toLocaleString("vi-VN", {
                        day: "2-digit", month: "2-digit", year: "numeric",
                        hour: "2-digit", minute: "2-digit",
                      })}
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
