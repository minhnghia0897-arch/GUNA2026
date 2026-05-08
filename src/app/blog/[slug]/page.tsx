import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { absUrl, buildOg, buildTwitter } from "@/lib/seo";
import { createClient } from "@/lib/supabase/server";
import type { DbArticle } from "@/lib/supabase/types";
import PageHeader from "@/components/PageHeader";

export const revalidate = 300;

async function getArticle(slug: string): Promise<DbArticle | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("articles")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  return (data as DbArticle | null) ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return { title: "Không tìm thấy" };
  const desc = article.excerpt ?? `${article.title} - Bài viết từ GUNA GIFT.`;
  return {
    title: article.title,
    description: desc,
    alternates: { canonical: absUrl(`/blog/${slug}`) },
    openGraph: buildOg({
      title: article.title,
      description: desc,
      path: `/blog/${slug}`,
      image: article.image ?? undefined,
      type: "article",
    }),
    twitter: buildTwitter({ title: article.title, description: desc, image: article.image ?? undefined }),
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  return (
    <>
      <PageHeader
        title={article.title}
        crumbs={[
          { label: "Trang Chủ", href: "/" },
          { label: "Blog", href: "/blog" },
          { label: article.title },
        ]}
      />

      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="relative aspect-[16/9] bg-cream rounded-2xl overflow-hidden mb-8">
          <Image
            src={article.image ?? "/images/product-1.svg"}
            alt={article.title}
            fill
            sizes="(max-width: 768px) 100vw, 768px"
            priority
            className="object-cover"
          />
        </div>

        <div className="flex items-center gap-3 text-xs text-gray-400 mb-6">
          {article.category && (
            <span className="bg-gold/10 text-gold-700 px-2 py-1 rounded">{article.category}</span>
          )}
          <span>{new Date(article.published_at).toLocaleDateString("vi-VN")}</span>
          {article.read_time && (
            <>
              <span>·</span>
              <span>{article.read_time} đọc</span>
            </>
          )}
        </div>

        <div className="prose prose-sm max-w-none text-gray-600 font-light leading-relaxed text-base space-y-4">
          {article.content ? (
            <div dangerouslySetInnerHTML={{ __html: article.content }} />
          ) : (
            <>
              <p>{article.excerpt}</p>
              <p className="text-gray-400 italic">Nội dung đầy đủ đang được biên soạn. Vui lòng quay lại sau.</p>
            </>
          )}
        </div>

        <div className="mt-12 pt-8 border-t border-gold/10 flex items-center justify-between">
          <Link href="/blog" className="text-sm text-burgundy hover:text-gold flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
            </svg>
            Tất cả bài viết
          </Link>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span>Chia sẻ:</span>
            {["Facebook", "Twitter", "Copy"].map((s) => (
              <button key={s} className="px-3 py-1 border border-gray-200 rounded hover:border-gold hover:text-gold transition-colors">
                {s}
              </button>
            ))}
          </div>
        </div>
      </article>
    </>
  );
}
