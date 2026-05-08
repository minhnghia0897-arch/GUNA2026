import Link from "next/link";
import { fetchAllProducts } from "@/lib/supabase/queries";
import ProductCard from "./ProductCard";

export default async function BestSeller() {
  const products = await fetchAllProducts();

  return (
    <section id="products" className="py-20 bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-gold text-sm font-light tracking-[0.3em] uppercase mb-3">Bộ Sưu Tập</p>
          <h2 className="font-serif text-3xl sm:text-4xl text-burgundy mb-4">Sản Phẩm Bán Chạy</h2>
          <div className="w-20 h-[1px] bg-gold mx-auto mb-6" />
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-sm text-burgundy hover:text-gold border border-burgundy hover:border-gold px-6 py-2 rounded-full transition-all duration-300"
          >
            Xem Tất Cả
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          {products.slice(0, 6).map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
