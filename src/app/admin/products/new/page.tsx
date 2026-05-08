import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ProductForm from "../ProductForm";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("slug, label")
    .order("position");

  return (
    <div className="space-y-5">
      <div>
        <Link href="/admin/products" className="text-xs text-burgundy hover:text-gold">
          ← Tất cả sản phẩm
        </Link>
        <h1 className="font-serif text-2xl text-burgundy mt-1">Tạo sản phẩm mới</h1>
      </div>
      <ProductForm categories={categories ?? []} isNew />
    </div>
  );
}
