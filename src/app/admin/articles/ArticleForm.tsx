"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/context/ToastContext";
import ImageUpload from "@/components/admin/ImageUpload";
import { revalidateStorefront } from "@/app/actions";

export type ArticleFormValues = {
  id?: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  image: string;
  read_time: string;
  status: "published" | "draft" | "archived";
  published_at: string;
};

const EMPTY: ArticleFormValues = {
  slug: "",
  title: "",
  excerpt: "",
  content: "",
  category: "",
  image: "",
  read_time: "",
  status: "draft",
  published_at: new Date().toISOString().slice(0, 10),
};

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export default function ArticleForm({ initial, isNew }: { initial?: ArticleFormValues; isNew?: boolean }) {
  const router = useRouter();
  const toast = useToast();
  const [form, setForm] = useState<ArticleFormValues>(initial ?? EMPTY);
  const [saving, setSaving] = useState(false);

  const update = <K extends keyof ArticleFormValues>(k: K, v: ArticleFormValues[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.slug || !form.title) {
      toast.error("Vui lòng nhập slug và tiêu đề");
      return;
    }
    setSaving(true);
    const supabase = createClient();
    const payload = {
      slug: form.slug,
      title: form.title,
      excerpt: form.excerpt || null,
      content: form.content || null,
      category: form.category || null,
      image: form.image || null,
      read_time: form.read_time || null,
      status: form.status,
      published_at: form.published_at,
    };
    const { error } = isNew
      ? await supabase.from("articles").insert(payload)
      : await supabase.from("articles").update(payload).eq("id", form.id!);
    setSaving(false);
    if (error) {
      toast.error("Lưu thất bại: " + error.message);
      return;
    }
    toast.success(isNew ? "Đã tạo bài viết" : "Đã cập nhật");
    await revalidateStorefront("blog");
    router.push("/admin/articles");
    router.refresh();
  };

  const handleDelete = async () => {
    if (!form.id || !confirm("Xóa bài viết này?")) return;
    const supabase = createClient();
    const { error } = await supabase.from("articles").delete().eq("id", form.id);
    if (error) return toast.error("Xóa thất bại");
    toast.success("Đã xóa");
    router.push("/admin/articles");
    router.refresh();
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-xl border border-gold/10 p-5 space-y-4">
            <div>
              <label className="text-sm text-gray-700 mb-1 block">Tiêu đề *</label>
              <input
                required
                value={form.title}
                onChange={(e) => {
                  update("title", e.target.value);
                  if (isNew && !form.slug) update("slug", slugify(e.target.value));
                }}
                className="input-field text-lg"
              />
            </div>
            <div>
              <label className="text-sm text-gray-700 mb-1 block">Slug *</label>
              <input
                required
                value={form.slug}
                onChange={(e) => update("slug", slugify(e.target.value))}
                className="input-field font-mono text-sm"
              />
              <p className="text-xs text-gray-400 mt-1">URL: /blog/{form.slug || "slug"}</p>
            </div>
            <div>
              <label className="text-sm text-gray-700 mb-1 block">Mô tả ngắn (excerpt)</label>
              <textarea value={form.excerpt} onChange={(e) => update("excerpt", e.target.value)} className="input-field" rows={2} maxLength={300} />
            </div>
            <div>
              <label className="text-sm text-gray-700 mb-1 block">Nội dung (HTML hoặc Markdown nhẹ)</label>
              <textarea value={form.content} onChange={(e) => update("content", e.target.value)} className="input-field font-mono text-sm" rows={20} />
              <p className="text-xs text-gray-400 mt-1">
                Hỗ trợ HTML cơ bản: &lt;h2&gt;, &lt;p&gt;, &lt;ul&gt;&lt;li&gt;, &lt;strong&gt;, &lt;a&gt;
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-gold/10 p-5 space-y-4">
            <h2 className="font-serif text-lg text-burgundy">Xuất bản</h2>
            <div>
              <label className="text-sm text-gray-700 mb-1 block">Trạng thái</label>
              <select value={form.status} onChange={(e) => update("status", e.target.value as ArticleFormValues["status"])} className="input-field">
                <option value="draft">Bản nháp</option>
                <option value="published">Đã xuất bản</option>
                <option value="archived">Lưu trữ</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-700 mb-1 block">Ngày xuất bản</label>
              <input type="date" value={form.published_at.slice(0, 10)} onChange={(e) => update("published_at", e.target.value)} className="input-field" />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gold/10 p-5 space-y-4">
            <h2 className="font-serif text-lg text-burgundy">Phân loại</h2>
            <div>
              <label className="text-sm text-gray-700 mb-1 block">Danh mục</label>
              <input value={form.category} onChange={(e) => update("category", e.target.value)} className="input-field" placeholder="VD: Quà Cưới, Sức Khỏe" />
            </div>
            <div>
              <label className="text-sm text-gray-700 mb-1 block">Thời gian đọc</label>
              <input value={form.read_time} onChange={(e) => update("read_time", e.target.value)} className="input-field" placeholder="5 phút" />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gold/10 p-5">
            <ImageUpload
              value={form.image}
              onChange={(url) => update("image", url)}
              folder="articles"
              label="Ảnh đại diện"
              aspectRatio="video"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-3 sticky bottom-0 bg-white py-4 border-t border-gold/10">
        <button type="submit" disabled={saving} className="btn-gold">
          {saving ? "Đang lưu..." : isNew ? "Tạo bài viết" : "Cập nhật"}
        </button>
        {!isNew && (
          <button type="button" onClick={handleDelete} className="text-red-600 text-sm px-4 hover:underline">
            Xóa bài viết
          </button>
        )}
        <button type="button" onClick={() => router.push("/admin/articles")} className="ml-auto text-sm text-gray-500 hover:text-burgundy px-4">
          Hủy
        </button>
      </div>
    </form>
  );
}
