"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useToast } from "@/context/ToastContext";
import { createClient } from "@/lib/supabase/client";
import { getReviews, type Review } from "@/data/reviews";
import { StarDisplay, StarInput } from "./StarRating";

const HELPFUL_KEY = "farmo-review-helpful";

type DbReview = {
  id: string;
  rating: number;
  title: string | null;
  content: string;
  author_name: string;
  is_verified: boolean | null;
  helpful_count: number | null;
  created_at: string;
};

const dbToReview = (r: DbReview): Review => ({
  id: r.id,
  author: r.author_name,
  rating: r.rating,
  title: r.title ?? undefined,
  content: r.content,
  date: r.created_at.slice(0, 10),
  verified: !!r.is_verified,
  helpful: r.helpful_count ?? 0,
});

export default function ReviewSection({ slug }: { slug: string }) {
  const toast = useToast();
  const [productId, setProductId] = useState<string | null>(null);
  const [dbReviews, setDbReviews] = useState<Review[]>([]);
  const [helpfulIds, setHelpfulIds] = useState<Set<string>>(new Set());
  const [showForm, setShowForm] = useState(false);
  const [authUser, setAuthUser] = useState<{ id: string; name: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState<{ rating: number; title: string; content: string }>({
    rating: 5,
    title: "",
    content: "",
  });

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const supabase = createClient();
      const { data: prod } = await supabase.from("products").select("id").eq("slug", slug).maybeSingle();
      if (cancelled || !prod) return;
      setProductId(prod.id as string);
      const { data: reviews } = await supabase
        .from("reviews")
        .select("id,rating,title,content,author_name,is_verified,helpful_count,created_at")
        .eq("product_id", prod.id)
        .eq("status", "published")
        .order("created_at", { ascending: false });
      if (cancelled) return;
      setDbReviews((reviews ?? []).map((r) => dbToReview(r as DbReview)));

      const { data: { user } } = await supabase.auth.getUser();
      if (cancelled) return;
      if (user) {
        const { data: profile } = await supabase.from("profiles").select("full_name,email").eq("id", user.id).maybeSingle();
        setAuthUser({
          id: user.id,
          name: (profile?.full_name as string) || (profile?.email as string) || "Khách hàng",
        });
      }

      try {
        const helpful = localStorage.getItem(HELPFUL_KEY);
        if (helpful) setHelpfulIds(new Set(JSON.parse(helpful)));
      } catch {}
    };
    load();
    return () => { cancelled = true; };
  }, [slug]);

  const allReviews = useMemo(() => {
    if (dbReviews.length > 0) return [...dbReviews, ...getReviews(slug)];
    return getReviews(slug);
  }, [dbReviews, slug]);

  const stats = useMemo(() => {
    if (allReviews.length === 0) {
      return { avg: 0, count: 0, breakdown: [0, 0, 0, 0, 0] };
    }
    const breakdown = [0, 0, 0, 0, 0];
    let sum = 0;
    for (const r of allReviews) {
      breakdown[5 - r.rating]++;
      sum += r.rating;
    }
    return { avg: sum / allReviews.length, count: allReviews.length, breakdown };
  }, [allReviews]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.content.trim()) {
      toast.error("Vui lòng viết nội dung đánh giá");
      return;
    }
    if (!authUser || !productId) return;

    setSubmitting(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("reviews")
      .insert({
        product_id: productId,
        user_id: authUser.id,
        author_name: authUser.name,
        rating: form.rating,
        title: form.title.trim() || null,
        content: form.content.trim(),
        is_verified: true,
        status: "published",
      })
      .select("id,rating,title,content,author_name,is_verified,helpful_count,created_at")
      .single();
    setSubmitting(false);

    if (error || !data) {
      toast.error("Gửi đánh giá thất bại: " + (error?.message ?? "lỗi không xác định"));
      return;
    }
    setDbReviews((cur) => [dbToReview(data as DbReview), ...cur]);
    setForm({ rating: 5, title: "", content: "" });
    setShowForm(false);
    toast.success("Đánh giá của bạn đã được gửi. Cảm ơn bạn!");
  };

  const markHelpful = async (id: string) => {
    if (helpfulIds.has(id)) return;
    const next = new Set(helpfulIds);
    next.add(id);
    setHelpfulIds(next);
    try {
      localStorage.setItem(HELPFUL_KEY, JSON.stringify(Array.from(next)));
    } catch {}

    const isDb = dbReviews.some((r) => r.id === id);
    if (isDb) {
      const supabase = createClient();
      const { data, error } = await supabase.rpc("increment_review_helpful", { review_id: id });
      if (!error && typeof data === "number") {
        setDbReviews((cur) => cur.map((r) => (r.id === id ? { ...r, helpful: data } : r)));
      }
    }
  };

  return (
    <div>
      {allReviews.length > 0 && (
        <div className="grid md:grid-cols-2 gap-8 mb-8 p-6 bg-cream rounded-2xl">
          <div className="text-center md:text-left">
            <p className="text-5xl font-serif font-bold text-burgundy mb-2">{stats.avg.toFixed(1)}</p>
            <StarDisplay value={Math.round(stats.avg)} size={5} />
            <p className="text-sm text-gray-500 mt-2">Dựa trên {stats.count} đánh giá</p>
          </div>
          <div className="space-y-2">
            {stats.breakdown.map((c, i) => {
              const star = 5 - i;
              const pct = stats.count ? (c / stats.count) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-3 text-xs">
                  <span className="w-8 text-gray-600">{star} ★</span>
                  <div className="flex-1 h-2 bg-white rounded overflow-hidden">
                    <div className="h-full bg-gold transition-all duration-500" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-8 text-gray-500 text-right">{c}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h3 className="font-serif text-xl text-burgundy">
          {allReviews.length > 0 ? `${allReviews.length} đánh giá` : "Chưa có đánh giá nào"}
        </h3>
        {authUser ? (
          <button onClick={() => setShowForm(!showForm)} className="btn-gold text-sm">
            {showForm ? "Đóng" : "Viết đánh giá"}
          </button>
        ) : (
          <Link href="/account/login" className="text-sm text-burgundy hover:text-gold underline">
            Đăng nhập để viết đánh giá
          </Link>
        )}
      </div>

      {showForm && authUser && (
        <form onSubmit={submit} className="bg-white border border-gold/20 rounded-xl p-6 mb-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Đánh giá của bạn *</label>
            <StarInput value={form.rating} onChange={(v) => setForm({ ...form, rating: v })} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Tiêu đề (tùy chọn)</label>
            <input
              className="input-field"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="VD: Sản phẩm tuyệt vời"
              maxLength={80}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Nội dung *</label>
            <textarea
              className="input-field"
              rows={4}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
              maxLength={1000}
            />
            <p className="text-xs text-gray-400 mt-1">{form.content.length}/1000</p>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={submitting} className="btn-gold">
              {submitting ? "Đang gửi..." : "Gửi đánh giá"}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-outline-gold">
              Hủy
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {allReviews.map((r) => (
          <div key={r.id} className="bg-white border border-gold/10 rounded-xl p-5">
            <div className="flex items-start justify-between mb-2 gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-burgundy/10 text-burgundy flex items-center justify-center font-serif font-bold text-sm flex-shrink-0">
                  {r.author.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-burgundy text-sm flex items-center gap-2">
                    {r.author}
                    {r.verified && (
                      <span className="text-[10px] bg-green-50 text-green-700 px-2 py-0.5 rounded-full">
                        ✓ Đã mua hàng
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-gray-400">{r.date}</p>
                </div>
              </div>
              <StarDisplay value={r.rating} />
            </div>
            {r.title && <p className="font-medium text-gray-800 text-sm mb-2 mt-3">{r.title}</p>}
            <p className="text-sm text-gray-600 font-light leading-relaxed">{r.content}</p>
            <button
              onClick={() => markHelpful(r.id)}
              className={`mt-3 inline-flex items-center gap-2 text-xs ${
                helpfulIds.has(r.id) ? "text-burgundy font-medium" : "text-gray-400 hover:text-burgundy"
              }`}
            >
              <svg className="w-4 h-4" fill={helpfulIds.has(r.id) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
              </svg>
              Hữu ích ({r.helpful + (helpfulIds.has(r.id) ? 1 : 0)})
            </button>
          </div>
        ))}
        {allReviews.length === 0 && (
          <div className="text-center py-12 bg-cream rounded-xl">
            <div className="text-5xl mb-3 opacity-30">💬</div>
            <p className="text-gray-500 text-sm">Hãy là người đầu tiên đánh giá sản phẩm này</p>
          </div>
        )}
      </div>
    </div>
  );
}
