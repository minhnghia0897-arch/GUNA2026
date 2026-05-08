import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const sp = await searchParams;
  const supabase = await createClient();

  let q = supabase
    .from("products")
    .select("id, slug, name, image, category_slug, price, original_price, stock_count, rating, reviews_count, is_visible, position")
    .order("position", { ascending: true });

  if (sp.category && sp.category !== "all") q = q.eq("category_slug", sp.category);
  if (sp.q) q = q.ilike("name", `%${sp.q}%`);

  const [{ data: products }, { data: categories }] = await Promise.all([
    q,
    supabase.from("categories").select("slug, label").order("position"),
  ]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-serif text-2xl text-burgundy">Sản phẩm ({(products ?? []).length})</h1>
        <Link href="/admin/products/new" className="btn-gold text-sm">
          + Thêm sản phẩm
        </Link>
      </div>

      <form className="flex gap-2 flex-wrap" action="/admin/products" method="get">
        <input
          type="search"
          name="q"
          defaultValue={sp.q ?? ""}
          placeholder="Tìm theo tên sản phẩm..."
          className="input-field flex-1 min-w-[200px] max-w-md"
        />
        <select name="category" defaultValue={sp.category ?? "all"} className="input-field max-w-[180px]">
          <option value="all">Tất cả danh mục</option>
          {(categories ?? []).map((c) => (
            <option key={c.slug} value={c.slug}>{c.label}</option>
          ))}
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
                <th className="px-4 py-3 text-left font-medium">Sản phẩm</th>
                <th className="px-4 py-3 text-left font-medium hidden md:table-cell">Danh mục</th>
                <th className="px-4 py-3 text-right font-medium">Giá</th>
                <th className="px-4 py-3 text-center font-medium">Tồn kho</th>
                <th className="px-4 py-3 text-center font-medium hidden sm:table-cell">Hiện</th>
                <th className="px-4 py-3 text-right font-medium">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gold/5">
              {(products ?? []).length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                    Chưa có sản phẩm nào
                  </td>
                </tr>
              ) : (
                (products ?? []).map((p) => (
                  <tr key={p.id} className="hover:bg-cream transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-lg bg-cream overflow-hidden flex-shrink-0">
                          <Image
                            src={p.image ?? "/images/product-1.svg"}
                            alt=""
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <Link href={`/admin/products/${p.id}`} className="font-medium text-burgundy hover:text-gold line-clamp-1">
                            {p.name}
                          </Link>
                          <p className="text-xs text-gray-400">{p.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{p.category_slug}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-semibold text-burgundy">{formatPrice(p.price)}</span>
                      {p.original_price && (
                        <p className="text-xs text-gray-400 line-through">{formatPrice(p.original_price)}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${
                          p.stock_count === 0 ? "bg-red-100 text-red-700"
                          : p.stock_count < 20 ? "bg-amber-100 text-amber-700"
                          : "bg-green-100 text-green-700"
                        }`}
                      >
                        {p.stock_count}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center hidden sm:table-cell">
                      {p.is_visible ? (
                        <span className="text-green-600 text-lg" title="Đang hiện">●</span>
                      ) : (
                        <span className="text-gray-300 text-lg" title="Đã ẩn">●</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/admin/products/${p.id}`} className="text-xs text-burgundy hover:text-gold">
                        Sửa →
                      </Link>
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
