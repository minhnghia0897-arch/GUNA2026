import { createClient } from "@/lib/supabase/server";
import CategoriesClient from "./CategoriesClient";

export const dynamic = "force-dynamic";

export const metadata = { title: "Danh mục | Quản trị" };

type Category = { id: string; slug: string; label: string; position: number };

export default async function AdminCategoriesPage() {
  const supabase = await createClient();
  const [{ data: cats }, { data: counts }] = await Promise.all([
    supabase.from("categories").select("*").order("position"),
    supabase.from("products").select("category_slug"),
  ]);

  const list = (cats as Category[]) ?? [];
  const productCounts: Record<string, number> = {};
  ((counts as { category_slug: string }[]) ?? []).forEach((p) => {
    productCounts[p.category_slug] = (productCounts[p.category_slug] ?? 0) + 1;
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-serif text-2xl text-burgundy">Danh mục sản phẩm</h1>
        <p className="text-sm text-gray-500 mt-1">
          Quản lý danh mục, slug, thứ tự hiển thị. Slug dùng làm URL filter `/products?category=slug`.
        </p>
      </div>
      <CategoriesClient initial={list} productCounts={productCounts} />
    </div>
  );
}
