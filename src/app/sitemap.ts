import type { MetadataRoute } from "next";
import { products } from "@/data/products";
import { SITE } from "@/lib/seo";

const BLOG_SLUGS = [
  "cach-chon-qua-cuoi-y-nghia",
  "loi-ich-mat-ong-nguyen-chat",
  "xu-huong-qua-tang-2026",
  "bao-quan-mat-ong-dung-cach",
  "qua-tang-tet-y-nghia",
  "y-nghia-mau-do-trong-van-hoa-cuoi",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE.url, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE.url}/products`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE.url}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE.url}/faq`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE.url}/policies/shipping`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE.url}/policies/returns`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE.url}/policies/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE.url}/policies/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${SITE.url}/products/${p.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const blogRoutes: MetadataRoute.Sitemap = BLOG_SLUGS.map((slug) => ({
    url: `${SITE.url}/blog/${slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...productRoutes, ...blogRoutes];
}
