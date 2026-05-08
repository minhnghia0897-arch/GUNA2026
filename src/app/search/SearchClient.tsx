"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { products } from "@/data/products";
import ProductCard from "@/components/ProductCard";

export default function SearchClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQ = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(initialQ);

  useEffect(() => {
    setQuery(searchParams.get("q") ?? "");
  }, [searchParams]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.shortDesc.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.categoryLabel.toLowerCase().includes(q)
    );
  }, [query]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    const url = trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : "/search";
    router.replace(url);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <form onSubmit={onSubmit} className="flex gap-2 mb-8 max-w-2xl mx-auto">
        <div className="relative flex-1">
          <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            autoFocus
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nhập tên sản phẩm, danh mục..."
            className="input-field pl-10"
          />
        </div>
        <button type="submit" className="btn-burgundy">Tìm</button>
      </form>

      {query.trim() === "" ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4 opacity-30">🔎</div>
          <p className="text-gray-500 mb-2">Nhập từ khóa để tìm kiếm sản phẩm</p>
          <p className="text-xs text-gray-400">Thử: &quot;mật ong&quot;, &quot;quà cưới&quot;, &quot;happy wedding&quot;</p>
        </div>
      ) : results.length > 0 ? (
        <>
          <p className="text-sm text-gray-500 mb-6">
            Tìm thấy <span className="text-burgundy font-medium">{results.length}</span> sản phẩm cho{" "}
            <span className="text-burgundy font-medium">&quot;{query}&quot;</span>
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {results.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-16">
          <div className="text-6xl mb-4 opacity-30">😔</div>
          <p className="text-gray-700 mb-2">Không tìm thấy sản phẩm cho &quot;{query}&quot;</p>
          <p className="text-sm text-gray-500">Thử từ khóa khác hoặc xem tất cả sản phẩm</p>
        </div>
      )}
    </div>
  );
}
