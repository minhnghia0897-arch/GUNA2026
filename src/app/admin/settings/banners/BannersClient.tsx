"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useToast } from "@/context/ToastContext";
import ImageUpload from "@/components/admin/ImageUpload";
import type { DbBanner } from "@/lib/supabase/cms-types";
import { createBanner, updateBanner, deleteBanner } from "./actions";

const TYPE_OPTIONS: { key: DbBanner["type"]; label: string }[] = [
  { key: "hero", label: "Hero homepage" },
  { key: "hero_mobile", label: "Hero mobile" },
  { key: "category", label: "Banner danh mục" },
  { key: "promo_strip", label: "Strip khuyến mãi" },
];

const EMPTY: Omit<DbBanner, "id"> = {
  type: "hero",
  title: "",
  subtitle: "",
  image_url: "",
  mobile_image_url: "",
  link_url: "",
  link_label: "",
  position: 0,
  is_active: true,
  starts_at: null,
  ends_at: null,
};

export default function BannersClient({ initial }: { initial: DbBanner[] }) {
  const toast = useToast();
  const [banners, setBanners] = useState<DbBanner[]>(initial);
  const [editing, setEditing] = useState<DbBanner | null>(null);
  const [form, setForm] = useState<Omit<DbBanner, "id">>(EMPTY);
  const [showForm, setShowForm] = useState(false);
  const [pending, startTransition] = useTransition();

  const openNew = () => {
    setEditing(null);
    setForm(EMPTY);
    setShowForm(true);
  };
  const openEdit = (b: DbBanner) => {
    setEditing(b);
    const { id: _id, ...rest } = b;
    void _id;
    setForm(rest);
    setShowForm(true);
  };
  const cancel = () => {
    setShowForm(false);
    setEditing(null);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      title: form.title || null,
      subtitle: form.subtitle || null,
      image_url: form.image_url || null,
      mobile_image_url: form.mobile_image_url || null,
      link_url: form.link_url || null,
      link_label: form.link_label || null,
      starts_at: form.starts_at || null,
      ends_at: form.ends_at || null,
    };
    startTransition(async () => {
      const res = editing ? await updateBanner(editing.id, payload) : await createBanner(payload);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      if (res.banner) {
        if (editing) {
          setBanners((bs) => bs.map((b) => (b.id === editing.id ? res.banner! : b)));
        } else {
          setBanners((bs) => [...bs, res.banner!]);
        }
      }
      setShowForm(false);
      toast.success(editing ? "Đã cập nhật banner" : "Đã tạo banner");
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Xóa banner này?")) return;
    startTransition(async () => {
      const res = await deleteBanner(id);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      setBanners((bs) => bs.filter((b) => b.id !== id));
      toast.success("Đã xóa banner");
    });
  };

  const update = <K extends keyof Omit<DbBanner, "id">>(k: K, v: Omit<DbBanner, "id">[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="space-y-5">
      {showForm ? (
        <form onSubmit={submit} className="bg-white rounded-xl border border-gold/10 p-5 space-y-4">
          <h2 className="font-serif text-lg text-burgundy">{editing ? "Sửa" : "Tạo"} banner</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-700 mb-1 block">Loại *</label>
              <select required value={form.type} onChange={(e) => update("type", e.target.value as DbBanner["type"])} className="input-field">
                {TYPE_OPTIONS.map((t) => (
                  <option key={t.key} value={t.key}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-700 mb-1 block">Vị trí</label>
              <input type="number" value={form.position} onChange={(e) => update("position", parseInt(e.target.value) || 0)} className="input-field" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm text-gray-700 mb-1 block">Tiêu đề</label>
              <input value={form.title ?? ""} onChange={(e) => update("title", e.target.value)} className="input-field" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm text-gray-700 mb-1 block">Mô tả</label>
              <textarea value={form.subtitle ?? ""} onChange={(e) => update("subtitle", e.target.value)} className="input-field" rows={2} />
            </div>
            <div className="sm:col-span-2">
              <ImageUpload
                value={form.image_url ?? ""}
                onChange={(url) => update("image_url", url || null)}
                folder="banners"
                label="Ảnh chính (desktop)"
                aspectRatio="video"
              />
            </div>
            <div className="sm:col-span-2">
              <ImageUpload
                value={form.mobile_image_url ?? ""}
                onChange={(url) => update("mobile_image_url", url || null)}
                folder="banners"
                label="Ảnh mobile (tùy chọn)"
                aspectRatio="square"
                hint="Nếu trống sẽ dùng ảnh chính"
              />
            </div>
            <div>
              <label className="text-sm text-gray-700 mb-1 block">Link đến</label>
              <input value={form.link_url ?? ""} onChange={(e) => update("link_url", e.target.value)} className="input-field font-mono text-sm" placeholder="/products" />
            </div>
            <div>
              <label className="text-sm text-gray-700 mb-1 block">Label nút</label>
              <input value={form.link_label ?? ""} onChange={(e) => update("link_label", e.target.value)} className="input-field" placeholder="Khám phá ngay" />
            </div>
            <div>
              <label className="text-sm text-gray-700 mb-1 block">Hiệu lực từ</label>
              <input type="datetime-local" value={form.starts_at ? form.starts_at.slice(0, 16) : ""} onChange={(e) => update("starts_at", e.target.value || null)} className="input-field" />
            </div>
            <div>
              <label className="text-sm text-gray-700 mb-1 block">Đến ngày</label>
              <input type="datetime-local" value={form.ends_at ? form.ends_at.slice(0, 16) : ""} onChange={(e) => update("ends_at", e.target.value || null)} className="input-field" />
            </div>
            <label className="flex items-center gap-2 sm:col-span-2 text-sm">
              <input type="checkbox" checked={form.is_active} onChange={(e) => update("is_active", e.target.checked)} />
              <span>Đang hoạt động</span>
            </label>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={pending} className="btn-gold">{pending ? "Đang lưu..." : editing ? "Cập nhật" : "Tạo banner"}</button>
            <button type="button" onClick={cancel} className="btn-outline-gold">Hủy</button>
          </div>
        </form>
      ) : (
        <div className="flex justify-end">
          <button onClick={openNew} className="btn-gold text-sm">+ Thêm banner</button>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {banners.length === 0 ? (
          <p className="md:col-span-2 text-center text-gray-400 py-12">Chưa có banner nào</p>
        ) : (
          banners.map((b) => (
            <div key={b.id} className="bg-white rounded-xl border border-gold/10 overflow-hidden">
              {b.image_url && (
                <div className="relative aspect-video bg-cream">
                  <Image src={b.image_url} alt="" fill sizes="400px" className="object-cover" />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="text-[10px] uppercase tracking-wider bg-cream text-burgundy px-2 py-0.5 rounded">
                    {TYPE_OPTIONS.find((t) => t.key === b.type)?.label ?? b.type}
                  </span>
                  {b.is_active ? (
                    <span className="text-[10px] bg-green-50 text-green-700 px-2 py-0.5 rounded">Đang hoạt động</span>
                  ) : (
                    <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded">Đã ẩn</span>
                  )}
                </div>
                <p className="font-medium text-burgundy line-clamp-1">{b.title || "(Không tiêu đề)"}</p>
                {b.subtitle && <p className="text-xs text-gray-500 line-clamp-2 mt-1">{b.subtitle}</p>}
                <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gold/10 text-xs">
                  <button onClick={() => openEdit(b)} className="text-burgundy hover:text-gold font-medium">Sửa</button>
                  <button onClick={() => handleDelete(b.id)} className="text-red-500 hover:text-red-700">Xóa</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
