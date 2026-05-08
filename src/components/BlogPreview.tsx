import Link from "next/link";
import Image from "next/image";
import { fetchArticles } from "@/lib/supabase/queries";
import { IconArrowRight } from "@/components/icons";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default async function BlogPreview() {
  const all = await fetchArticles();
  const posts = all.slice(0, 3);
  if (posts.length === 0) return null;

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-gold text-sm font-medium tracking-[0.3em] uppercase mb-3">Tin Tức</p>
          <h2 className="font-serif text-3xl sm:text-4xl text-burgundy mb-4">Bài Viết Mới Nhất</h2>
          <div className="w-20 h-[1px] bg-gold mx-auto mb-6" />
          <p className="text-gray-700 font-medium max-w-2xl mx-auto leading-relaxed">
            Cập nhật xu hướng quà tặng, mẹo bảo quản mật ong, và những câu chuyện thú vị từ GUNA GIFT.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
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
                <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                  {post.category && (
                    <span className="bg-gold/10 text-gold-700 px-2 py-1 rounded font-medium">{post.category}</span>
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
                <p className="text-gray-700 text-sm leading-relaxed line-clamp-3">{post.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-burgundy hover:text-gold border border-burgundy hover:border-gold px-6 py-2.5 rounded-full transition-all duration-300 font-medium"
          >
            Xem Tất Cả Bài Viết
            <IconArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
