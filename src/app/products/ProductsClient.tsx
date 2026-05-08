"use client";

import { useEffect, useMemo, useState } from "react";
import type { Product } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import PageHeader from "@/components/PageHeader";
import Pagination from "@/components/Pagination";

type SortOption = "default" | "price-asc" | "price-desc" | "name" | "rating";
type CategoryItem = { slug: string; label: string };

const PER_PAGE = 9;

export default function ProductsClient({
  products,
  categories,
}: {
  products: Product[];
  categories: CategoryItem[];
}) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortBy, setSortBy] = useState<SortOption>("default");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000000]);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let result = [...products];
    if (activeCategory !== "all") result = result.filter((p) => p.category === activeCategory);
    result = result.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1]);
    switch (sortBy) {
      case "price-asc": result.sort((a, b) => a.price - b.price); break;
      case "price-desc": result.sort((a, b) => b.price - a.price); break;
      case "name": result.sort((a, b) => a.name.localeCompare(b.name)); break;
      case "rating": result.sort((a, b) => b.rating - a.rating); break;
    }
    return result;
  }, [activeCategory, sortBy, priceRange]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));

  useEffect(() => { setPage(1); }, [activeCategory, sortBy, priceRange]);
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const resetFilters = () => {
    setActiveCategory("all");
    setPriceRange([0, 5000000]);
    setSortBy("default");
  };

  return (
    <>
      <PageHeader
        title="Bộ Sưu Tập Sản Phẩm"
        subtitle="Khám phá toàn bộ sản phẩm GUNA GIFT cao cấp được tuyển chọn kỹ lưỡng"
        crumbs={[{ label: "Trang Chủ", href: "/" }, { label: "Sản Phẩm" }]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className={`lg:w-64 flex-shrink-0 ${showFilters ? "block" : "hidden lg:block"}`}>
            <div className="bg-white border border-gold/10 rounded-xl p-6 sticky top-28">
              <h3 className="font-serif text-lg text-burgundy mb-4">Danh Mục</h3>
              <ul className="space-y-2 mb-6">
                {categories.map((cat) => (
                  <li key={cat.slug}>
                    <button
                      onClick={() => setActiveCategory(cat.slug)}
                      className={`text-sm w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        activeCategory === cat.slug ? "bg-burgundy text-white" : "text-gray-600 hover:bg-cream"
                      }`}
                    >
                      {cat.label}
                    </button>
                  </li>
                ))}
              </ul>

              <h3 className="font-serif text-lg text-burgundy mb-4">Khoảng Giá</h3>
              <div className="space-y-2">
                {[
                  { label: "Tất cả", min: 0, max: 5000000 },
                  { label: "Dưới 500K", min: 0, max: 500000 },
                  { label: "500K - 1M", min: 500000, max: 1000000 },
                  { label: "1M - 2M", min: 1000000, max: 2000000 },
                  { label: "2M - 3M", min: 2000000, max: 3000000 },
                  { label: "Trên 3M", min: 3000000, max: 5000000 },
                ].map((r) => (
                  <button
                    key={r.label}
                    onClick={() => setPriceRange([r.min, r.max])}
                    className={`text-sm w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      priceRange[0] === r.min && priceRange[1] === r.max
                        ? "bg-gold/10 text-burgundy font-medium"
                        : "text-gray-600 hover:bg-cream"
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
              <p className="text-sm text-gray-500">
                Hiển thị <span className="text-burgundy font-medium">{filtered.length}</span> sản phẩm
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Lọc
                </button>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold"
                >
                  <option value="default">Mặc định</option>
                  <option value="price-asc">Giá tăng dần</option>
                  <option value="price-desc">Giá giảm dần</option>
                  <option value="name">Tên A-Z</option>
                  <option value="rating">Đánh giá cao</option>
                </select>
              </div>
            </div>

            {filtered.length > 0 ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                  {paginated.map((product) => (
                    <ProductCard key={product.slug} product={product} />
                  ))}
                </div>
                {totalPages > 1 && (
                  <div className="mt-10">
                    <Pagination current={page} total={totalPages} onChange={setPage} />
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20">
                <div className="text-6xl mb-4 opacity-30">🔍</div>
                <p className="text-gray-500 mb-4">Không có sản phẩm phù hợp</p>
                <button onClick={resetFilters} className="text-burgundy hover:text-gold underline text-sm">
                  Xóa bộ lọc
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
