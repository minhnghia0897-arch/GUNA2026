import type { Metadata } from "next";
import { absUrl, buildOg, buildTwitter } from "@/lib/seo";
import { fetchAllProducts, fetchCategories } from "@/lib/supabase/queries";
import ProductsClient from "./ProductsClient";

const TITLE = "Bộ Sưu Tập Sản Phẩm";
const DESC = "Khám phá toàn bộ sản phẩm FarMơ cao cấp - hộp quà cưới, mật ong, set quà tặng. Miễn phí giao hàng từ 500.000đ.";

export const revalidate = 60;

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: absUrl("/products") },
  openGraph: buildOg({ title: TITLE, description: DESC, path: "/products" }),
  twitter: buildTwitter({ title: TITLE, description: DESC }),
};

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([fetchAllProducts(), fetchCategories()]);
  const cats = [{ slug: "all", label: "Tất Cả" }, ...categories.map((c) => ({ slug: c.slug, label: c.label }))];
  return <ProductsClient products={products} categories={cats} />;
}
