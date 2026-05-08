import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  published: "Đã xuất bản",
  draft: "Bản nháp",
  archived: "Lưu trữ",
};

const STATUS_COLOR: Record<string, string> = {
  published: "bg-green-100 text-green-700",
  draft: "bg-amber-100 text-amber-700",
  archived: "bg-gray-100 text-gray-600",
};

export default async function AdminArticlesPage() {
  const supabase = await createClient();
  const { data: articles } = await supabase
    .from("articles")
    .select("*")
    .order("published_at", { ascending: false });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-serif text-2xl text-burgundy">Bài viết ({(articles ?? []).length})</h1>
        <Link href="/admin/articles/new" className="btn-gold text-sm">+ Bài mới</Link>
      </div>

      <div className="bg-white rounded-xl border border-gold/10 overflow-hidden">
        <div className="divide-y divide-gold/5">
          {(articles ?? []).length === 0 ? (
            <p className="px-5 py-12 text-center text-gray-400 text-sm">Chưa có bài viết nào</p>
          ) : (
            (articles ?? []).map((a) => (
              <div key={a.id} className="px-5 py-4 flex items-center gap-4">
                <div className="relative w-16 h-12 rounded bg-cream overflow-hidden flex-shrink-0">
                  <Image src={a.image ?? "/images/product-1.svg"} alt="" fill sizes="64px" className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[a.status]}`}>
                      {STATUS_LABEL[a.status]}
                    </span>
                    {a.category && <span className="text-xs text-gold-700">{a.category}</span>}
                  </div>
                  <Link href={`/admin/articles/${a.id}`} className="font-medium text-burgundy hover:text-gold line-clamp-1">
                    {a.title}
                  </Link>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(a.published_at).toLocaleDateString("vi-VN")} · /{a.slug}
                  </p>
                </div>
                <Link href={`/admin/articles/${a.id}`} className="text-xs text-burgundy hover:text-gold flex-shrink-0">
                  Sửa →
                </Link>
              </div>
            ))
          )}
        </div>
      </div>

      <p className="text-xs text-gray-400 italic">
        💡 Form tạo/sửa bài viết đang trong giai đoạn 2 (Day 2.5). Hiện tại có thể chỉnh nội dung trực tiếp trong Supabase Dashboard.
      </p>
    </div>
  );
}
