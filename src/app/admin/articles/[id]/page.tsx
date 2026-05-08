import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ArticleForm, { type ArticleFormValues } from "../ArticleForm";

export const dynamic = "force-dynamic";

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: article } = await supabase.from("articles").select("*").eq("id", id).maybeSingle();
  if (!article) notFound();

  const initial: ArticleFormValues = {
    id: article.id,
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt ?? "",
    content: article.content ?? "",
    category: article.category ?? "",
    image: article.image ?? "",
    read_time: article.read_time ?? "",
    status: article.status,
    published_at: article.published_at,
  };

  return (
    <div className="space-y-5">
      <div>
        <Link href="/admin/articles" className="text-xs text-burgundy hover:text-gold">
          ← Tất cả bài viết
        </Link>
        <h1 className="font-serif text-2xl text-burgundy mt-1">Sửa: {article.title}</h1>
      </div>
      <ArticleForm initial={initial} />
    </div>
  );
}
