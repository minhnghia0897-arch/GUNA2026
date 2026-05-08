import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SITE, absUrl, buildOg, buildTwitter } from "@/lib/seo";
import { fetchProductBySlug, fetchAllProducts } from "@/lib/supabase/queries";
import { fetchProductSlugsStatic } from "@/lib/supabase/static";
import JsonLd from "@/components/JsonLd";
import ProductDetail from "./ProductDetail";

export const revalidate = 60;

export async function generateStaticParams() {
  const slugs = await fetchProductSlugsStatic();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = await fetchProductBySlug(slug);
  if (!p) return { title: "Không tìm thấy" };
  const path = `/products/${p.slug}`;
  const title = p.name;
  const description = p.shortDesc;
  return {
    title,
    description,
    alternates: { canonical: absUrl(path) },
    openGraph: buildOg({ title, description, path, image: p.image, type: "website" }),
    twitter: buildTwitter({ title, description, image: p.image }),
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);
  if (!product) notFound();

  const all = await fetchAllProducts();
  const related = all
    .filter((p) => p.slug !== product.slug && p.category === product.category)
    .slice(0, 3);

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDesc,
    image: absUrl(product.image),
    sku: product.slug,
    brand: { "@type": "Brand", name: SITE.fullName },
    category: product.categoryLabel,
    offers: {
      "@type": "Offer",
      url: absUrl(`/products/${product.slug}`),
      priceCurrency: "VND",
      price: product.price,
      availability: product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: { "@type": "Organization", name: SITE.fullName },
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: Math.max(1, product.reviews),
      bestRating: 5,
      worstRating: 1,
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Trang chủ", item: SITE.url },
      { "@type": "ListItem", position: 2, name: "Sản phẩm", item: absUrl("/products") },
      { "@type": "ListItem", position: 3, name: product.name, item: absUrl(`/products/${product.slug}`) },
    ],
  };

  return (
    <>
      <JsonLd data={[productJsonLd, breadcrumbJsonLd]} />
      <ProductDetail product={product} related={related} />
    </>
  );
}
