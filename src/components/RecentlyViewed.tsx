"use client";

import { useEffect, useState } from "react";
import { getRecentlyViewed } from "@/lib/recentlyViewed";
import { products } from "@/data/products";
import ProductCard from "./ProductCard";

export default function RecentlyViewed({ excludeSlug, limit = 4 }: { excludeSlug?: string; limit?: number }) {
  const [slugs, setSlugs] = useState<string[]>([]);

  useEffect(() => {
    setSlugs(getRecentlyViewed());
  }, []);

  const items = slugs
    .filter((s) => s !== excludeSlug)
    .map((s) => products.find((p) => p.slug === s))
    .filter((p): p is NonNullable<typeof p> => Boolean(p))
    .slice(0, limit);

  if (items.length === 0) return null;

  return (
    <div className="mt-20">
      <h2 className="font-serif text-2xl text-burgundy text-center mb-2">Đã xem gần đây</h2>
      <div className="w-16 h-[1px] bg-gold mx-auto mb-8" />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {items.map((p) => (
          <ProductCard key={p.slug} product={p} />
        ))}
      </div>
    </div>
  );
}
