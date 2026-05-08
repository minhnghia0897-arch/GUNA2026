import { createClient as createServerClient } from "./server";
import type { DbProduct, DbCategory, DbArticle, DbVoucher } from "./types";
import type { Product } from "@/data/products";

export function dbProductToProduct(p: DbProduct, categoryLabel: string): Product {
  return {
    slug: p.slug,
    name: p.name,
    price: p.price,
    originalPrice: p.original_price ?? undefined,
    category: p.category_slug,
    categoryLabel,
    badge: p.badge,
    rating: Math.round(p.rating),
    reviews: p.reviews_count,
    image: p.image ?? "/images/product-1.svg",
    gallery: p.gallery.length > 0 ? p.gallery : [p.image ?? "/images/product-1.svg"],
    shortDesc: p.short_desc ?? "",
    description: p.description ?? "",
    specs: p.specs,
    inStock: p.stock_count > 0,
    stockCount: p.stock_count,
  };
}

export async function fetchAllProducts(): Promise<Product[]> {
  const supabase = await createServerClient();
  const [{ data: products }, { data: categories }] = await Promise.all([
    supabase.from("products").select("*").eq("is_visible", true).order("position"),
    supabase.from("categories").select("slug,label"),
  ]);
  if (!products || !categories) return [];
  const labels = new Map(categories.map((c) => [c.slug, c.label]));
  return (products as DbProduct[]).map((p) => dbProductToProduct(p, labels.get(p.category_slug) ?? p.category_slug));
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  const supabase = await createServerClient();
  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("is_visible", true)
    .maybeSingle();
  if (!product) return null;
  const { data: cat } = await supabase
    .from("categories")
    .select("label")
    .eq("slug", (product as DbProduct).category_slug)
    .maybeSingle();
  return dbProductToProduct(product as DbProduct, cat?.label ?? (product as DbProduct).category_slug);
}

export async function fetchCategories(): Promise<DbCategory[]> {
  const supabase = await createServerClient();
  const { data } = await supabase.from("categories").select("*").order("position");
  return (data as DbCategory[]) ?? [];
}

export async function fetchProductSlugs(): Promise<string[]> {
  const supabase = await createServerClient();
  const { data } = await supabase.from("products").select("slug").eq("is_visible", true);
  return (data ?? []).map((r: { slug: string }) => r.slug);
}

export async function fetchArticles(): Promise<DbArticle[]> {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from("articles")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false });
  return (data as DbArticle[]) ?? [];
}

export async function fetchActiveVouchers(): Promise<DbVoucher[]> {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from("vouchers")
    .select("*")
    .eq("is_active", true);
  return (data as DbVoucher[]) ?? [];
}
