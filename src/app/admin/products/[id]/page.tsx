import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ProductForm, { type ProductFormValues } from "../ProductForm";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: product }, { data: categories }] = await Promise.all([
    supabase.from("products").select("*").eq("id", id).maybeSingle(),
    supabase.from("categories").select("slug, label").order("position"),
  ]);

  if (!product) notFound();

  const galleryRaw = ((product.gallery as string[]) ?? []).filter(Boolean);
  const gallery = galleryRaw.length > 0 ? galleryRaw : product.image ? [product.image] : [];

  const initial: ProductFormValues = {
    id: product.id,
    slug: product.slug,
    name: product.name,
    short_desc: product.short_desc ?? "",
    description: product.description ?? "",
    category_slug: product.category_slug,
    price: product.price,
    original_price: product.original_price,
    badge: product.badge ?? "",
    image: product.image ?? "",
    gallery,
    specs: (product.specs as { label: string; value: string }[]) ?? [],
    stock_count: product.stock_count,
    is_visible: product.is_visible,
  };

  return (
    <div className="space-y-5">
      <div>
        <Link href="/admin/products" className="text-xs text-burgundy hover:text-gold">
          ← Tất cả sản phẩm
        </Link>
        <h1 className="font-serif text-2xl text-burgundy mt-1">Sửa: {product.name}</h1>
      </div>
      <ProductForm initial={initial} categories={categories ?? []} />
    </div>
  );
}
