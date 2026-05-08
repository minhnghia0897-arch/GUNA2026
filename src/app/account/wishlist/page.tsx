"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useWishlist } from "@/context/WishlistContext";
import { createClient } from "@/lib/supabase/client";
import type { Product } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import PageHeader from "@/components/PageHeader";

type DbProductRow = {
  slug: string;
  name: string;
  price: number;
  original_price: number | null;
  category_slug: string;
  badge: string | null;
  rating: number;
  reviews_count: number;
  image: string | null;
  gallery: string[] | null;
  short_desc: string | null;
  stock_count: number;
};

export default function WishlistPage() {
  const { items } = useWishlist();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const itemsKey = items.join(",");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const slugs = itemsKey ? itemsKey.split(",") : [];

    if (slugs.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        const supabase = createClient();
        const [productsRes, catsRes] = await Promise.all([
          supabase
            .from("products")
            .select("slug,name,price,original_price,category_slug,badge,rating,reviews_count,image,gallery,short_desc,stock_count")
            .in("slug", slugs)
            .eq("is_visible", true),
          supabase.from("categories").select("slug,label"),
        ]);
        if (cancelled) return;
        if (productsRes.error) console.error("[wishlist] products query error", productsRes.error);
        if (catsRes.error) console.error("[wishlist] categories query error", catsRes.error);
        const rows = productsRes.data as DbProductRow[] | null;
        const cats = catsRes.data;
        const labels = new Map((cats ?? []).map((c) => [c.slug, c.label]));
        const ordered: Product[] = slugs
          .map((slug) => rows?.find((r) => r.slug === slug))
          .filter((r): r is DbProductRow => Boolean(r))
          .map((p) => ({
            slug: p.slug,
            name: p.name,
            price: p.price,
            originalPrice: p.original_price ?? undefined,
            category: p.category_slug as Product["category"],
            categoryLabel: labels.get(p.category_slug) ?? p.category_slug,
            badge: p.badge,
            rating: Math.round(p.rating),
            reviews: p.reviews_count,
            image: p.image ?? "/images/product-1.svg",
            gallery: p.gallery && p.gallery.length > 0 ? p.gallery : [p.image ?? "/images/product-1.svg"],
            shortDesc: p.short_desc ?? "",
            description: "",
            specs: [],
            inStock: p.stock_count > 0,
            stockCount: p.stock_count,
          }));
        setProducts(ordered);
      } catch (err) {
        console.error("[wishlist] load failed", err);
        if (!cancelled) setProducts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [itemsKey]);

  return (
    <>
      <PageHeader
        title="Sản Phẩm Yêu Thích"
        crumbs={[{ label: "Trang Chủ", href: "/" }, { label: "Yêu Thích" }]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin w-8 h-8 border-2 border-gold border-t-transparent rounded-full" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gold/10">
            <div className="text-6xl mb-4 opacity-30">❤️</div>
            <h2 className="font-serif text-xl text-burgundy mb-2">Danh sách trống</h2>
            <p className="text-gray-500 mb-6">Thêm sản phẩm yêu thích để dễ dàng quay lại sau</p>
            <Link href="/products" className="btn-gold inline-flex">Khám phá sản phẩm</Link>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-6">{products.length} sản phẩm yêu thích</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {products.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
