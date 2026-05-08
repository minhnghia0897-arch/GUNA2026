import Link from "next/link";
import ArticleForm from "../ArticleForm";

export const dynamic = "force-dynamic";

export default function NewArticlePage() {
  return (
    <div className="space-y-5">
      <div>
        <Link href="/admin/articles" className="text-xs text-burgundy hover:text-gold">
          ← Tất cả bài viết
        </Link>
        <h1 className="font-serif text-2xl text-burgundy mt-1">Bài viết mới</h1>
      </div>
      <ArticleForm isNew />
    </div>
  );
}
