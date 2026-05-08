import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { absUrl, buildOg, buildTwitter } from "@/lib/seo";
import { fetchArticles } from "@/lib/supabase/queries";
import PageHeader from "@/components/PageHeader";

const TITLE = "Blog & Tin Tức";
const DESC = "Cập nhật xu hướng, mẹo hay và câu chuyện thú vị về quà cưới, mật ong và quà tặng cao cấp từ GUNA GIFT.";

export const revalidate = 300;

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: absUrl("/blog") },
  openGraph: buildOg({ title: TITLE, description: DESC, path: "/blog" }),
  twitter: buildTwitter({ title: TITLE, description: DESC }),
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default async function BlogPage() {
  const posts = await fetchArticles();

  return (
    <>
      <PageHeader
        title="Blog & Tin Tức"
        subtitle="Cập nhật xu hướng, mẹo hay và câu chuyện thú vị từ GUNA GIFT"
        crumbs={[{ label: "Trang Chủ", href: "/" }, { label: "Blog" }]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {posts.length === 0 ? (
          <p className="text-center py-20 text-gray-500">Chưa có bài viết nào.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group bg-white rounded-2xl overflow-hidden border border-gold/10 hover:shadow-xl hover:shadow-burgundy/5 transition-all duration-500"
              >
                <div className="relative aspect-[4/3] bg-cream overflow-hidden">
                  <Image
                    src={post.image ?? "/images/product-1.svg"}
                    alt={post.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                    {post.category && (
                      <span className="bg-gold/10 text-gold-700 px-2 py-1 rounded">{post.category}</span>
                    )}
                    <span>{formatDate(post.published_at)}</span>
                    {post.read_time && (
                      <>
                        <span>·</span>
                        <span>{post.read_time}</span>
                      </>
                    )}
                  </div>
                  <h3 className="font-serif text-lg text-burgundy mb-3 group-hover:text-gold transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-gray-500 font-light text-sm leading-relaxed line-clamp-3">{post.excerpt}</p>
                  <div className="mt-4 text-sm text-burgundy group-hover:text-gold flex items-center gap-2">
                    Đọc tiếp
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
