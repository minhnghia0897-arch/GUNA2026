"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/context/ToastContext";
import { revalidateStorefront } from "@/app/actions";
import ImageGalleryUpload from "@/components/admin/ImageGalleryUpload";

type Spec = { label: string; value: string };
type Category = { slug: string; label: string };

export type ProductFormValues = {
  id?: string;
  slug: string;
  name: string;
  short_desc: string;
  description: string;
  category_slug: string;
  price: number;
  original_price: number | null;
  badge: string;
  image: string;
  gallery: string[];
  specs: Spec[];
  stock_count: number;
  is_visible: boolean;
};

const EMPTY: ProductFormValues = {
  slug: "",
  name: "",
  short_desc: "",
  description: "",
  category_slug: "",
  price: 0,
  original_price: null,
  badge: "",
  image: "",
  gallery: [],
  specs: [],
  stock_count: 0,
  is_visible: true,
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

export default function ProductForm({
  initial,
  categories,
  isNew,
}: {
  initial?: ProductFormValues;
  categories: Category[];
  isNew?: boolean;
}) {
  const router = useRouter();
  const toast = useToast();
  const [form, setForm] = useState<ProductFormValues>(initial ?? EMPTY);
  const [saving, setSaving] = useState(false);

  const update = <K extends keyof ProductFormValues>(k: K, v: ProductFormValues[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const updateGallery = (urls: string[]) => {
    setForm((f) => ({ ...f, gallery: urls, image: urls[0] ?? "" }));
  };

  const updateSpec = (i: number, key: keyof Spec, val: string) => {
    setForm((f) => ({
      ...f,
      specs: f.specs.map((s, idx) => (idx === i ? { ...s, [key]: val } : s)),
    }));
  };
  const addSpec = () => setForm((f) => ({ ...f, specs: [...f.specs, { label: "", value: "" }] }));
  const removeSpec = (i: number) =>
    setForm((f) => ({ ...f, specs: f.specs.filter((_, idx) => idx !== i) }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.slug.trim()) {
      toast.error("Vui lòng nhập slug");
      return;
    }
    if (form.price <= 0) {
      toast.error("Giá phải > 0");
      return;
    }
    setSaving(true);
    const supabase = createClient();
    const gallery = form.gallery;

    const payload = {
      slug: form.slug,
      name: form.name,
      short_desc: form.short_desc || null,
      description: form.description || null,
      category_slug: form.category_slug,
      price: form.price,
      original_price: form.original_price || null,
      badge: form.badge || null,
      image: gallery[0] || form.image || null,
      gallery,
      specs: form.specs.filter((s) => s.label && s.value),
      stock_count: form.stock_count,
      is_visible: form.is_visible,
    };

    const { error } = isNew
      ? await supabase.from("products").insert(payload)
      : await supabase.from("products").update(payload).eq("id", form.id!);

    setSaving(false);
    if (error) {
      toast.error("Lưu thất bại: " + error.message);
      return;
    }
    toast.success(isNew ? "Đã tạo sản phẩm" : "Đã cập nhật");
    await revalidateStorefront("products");
    router.push("/admin/products");
    router.refresh();
  };

  const handleDelete = async () => {
    if (!form.id) return;
    if (!confirm("Xóa sản phẩm này? Hành động không thể hoàn tác.")) return;
    const supabase = createClient();
    const { error } = await supabase.from("products").delete().eq("id", form.id);
    if (error) {
      toast.error("Xóa thất bại: " + error.message);
      return;
    }
    toast.success("Đã xóa sản phẩm");
    router.push("/admin/products");
    router.refresh();
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-xl border border-gold/10 p-5 space-y-4">
            <h2 className="font-serif text-lg text-burgundy">Thông tin cơ bản</h2>
            <div>
              <label className="text-sm text-gray-700 mb-1 block">Tên sản phẩm *</label>
              <input
                required
                value={form.name}
                onChange={(e) => {
                  update("name", e.target.value);
                  if (isNew && !form.slug) update("slug", slugify(e.target.value));
                }}
                className="input-field"
              />
            </div>
            <div>
              <label className="text-sm text-gray-700 mb-1 block">Slug (URL) *</label>
              <input
                required
                value={form.slug}
                onChange={(e) => update("slug", slugify(e.target.value))}
                className="input-field font-mono text-sm"
                placeholder="ten-san-pham"
              />
              <p className="text-xs text-gray-400 mt-1">URL: /products/{form.slug || "ten-san-pham"}</p>
            </div>
            <div>
              <label className="text-sm text-gray-700 mb-1 block">Mô tả ngắn</label>
              <input value={form.short_desc} onChange={(e) => update("short_desc", e.target.value)} className="input-field" maxLength={200} />
            </div>
            <div>
              <label className="text-sm text-gray-700 mb-1 block">Mô tả chi tiết</label>
              <textarea value={form.description} onChange={(e) => update("description", e.target.value)} className="input-field" rows={5} />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gold/10 p-5 space-y-4">
            <h2 className="font-serif text-lg text-burgundy">Hình ảnh sản phẩm</h2>
            <ImageGalleryUpload
              value={form.gallery}
              onChange={updateGallery}
              bucket="product-images"
              folder={form.slug || "new"}
              label=""
              hint="Ảnh đầu tiên là ảnh đại diện, hiển thị trên trang danh sách + cards. Hover để di chuyển hoặc xóa."
              max={10}
            />
          </div>

          <div className="bg-white rounded-xl border border-gold/10 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-lg text-burgundy">Thông số</h2>
              <button type="button" onClick={addSpec} className="text-xs text-burgundy hover:text-gold">+ Thêm</button>
            </div>
            {form.specs.length === 0 && <p className="text-xs text-gray-400">Chưa có thông số nào</p>}
            {form.specs.map((s, i) => (
              <div key={i} className="grid grid-cols-12 gap-2">
                <input
                  value={s.label}
                  onChange={(e) => updateSpec(i, "label", e.target.value)}
                  placeholder="Nhãn (VD: Trọng lượng)"
                  className="input-field col-span-5 text-sm"
                />
                <input
                  value={s.value}
                  onChange={(e) => updateSpec(i, "value", e.target.value)}
                  placeholder="Giá trị (VD: 500g)"
                  className="input-field col-span-6 text-sm"
                />
                <button
                  type="button"
                  onClick={() => removeSpec(i)}
                  className="col-span-1 text-red-500 hover:text-red-700 text-xs"
                >
                  Xóa
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-gold/10 p-5 space-y-4">
            <h2 className="font-serif text-lg text-burgundy">Hiển thị</h2>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.is_visible}
                onChange={(e) => update("is_visible", e.target.checked)}
              />
              <span>Đang bán (hiện trên storefront)</span>
            </label>
            <div>
              <label className="text-sm text-gray-700 mb-1 block">Danh mục *</label>
              <select
                required
                value={form.category_slug}
                onChange={(e) => update("category_slug", e.target.value)}
                className="input-field"
              >
                <option value="">-- Chọn danh mục --</option>
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-700 mb-1 block">Badge</label>
              <input
                value={form.badge}
                onChange={(e) => update("badge", e.target.value)}
                className="input-field"
                placeholder="VD: Bán chạy, Mới"
              />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gold/10 p-5 space-y-4">
            <h2 className="font-serif text-lg text-burgundy">Giá & Tồn kho</h2>
            <div>
              <label className="text-sm text-gray-700 mb-1 block">Giá bán *</label>
              <input
                type="number"
                required
                min="0"
                value={form.price || ""}
                onChange={(e) => update("price", parseInt(e.target.value) || 0)}
                className="input-field"
              />
            </div>
            <div>
              <label className="text-sm text-gray-700 mb-1 block">Giá gốc (để hiển thị giảm)</label>
              <input
                type="number"
                min="0"
                value={form.original_price || ""}
                onChange={(e) => update("original_price", e.target.value ? parseInt(e.target.value) : null)}
                className="input-field"
              />
            </div>
            <div>
              <label className="text-sm text-gray-700 mb-1 block">Tồn kho</label>
              <input
                type="number"
                min="0"
                value={form.stock_count}
                onChange={(e) => update("stock_count", parseInt(e.target.value) || 0)}
                className="input-field"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3 sticky bottom-0 bg-white py-4 border-t border-gold/10 px-1">
        <button type="submit" disabled={saving} className="btn-gold">
          {saving ? "Đang lưu..." : isNew ? "Tạo sản phẩm" : "Cập nhật"}
        </button>
        {!isNew && (
          <button type="button" onClick={handleDelete} className="text-red-600 text-sm px-4 hover:underline">
            Xóa sản phẩm
          </button>
        )}
        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          className="ml-auto text-sm text-gray-500 hover:text-burgundy px-4"
        >
          Hủy
        </button>
      </div>
    </form>
  );
}
