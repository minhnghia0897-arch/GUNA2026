"use client";

import { useState, useTransition } from "react";
import { useToast } from "@/context/ToastContext";
import { createCategory, updateCategory, deleteCategory } from "./actions";

type Category = { id: string; slug: string; label: string; position: number };

const EMPTY: Omit<Category, "id"> = { slug: "", label: "", position: 0 };

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

export default function CategoriesClient({
  initial,
  productCounts,
}: {
  initial: Category[];
  productCounts: Record<string, number>;
}) {
  const toast = useToast();
  const [list, setList] = useState<Category[]>(initial);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState<Omit<Category, "id">>(EMPTY);
  const [showForm, setShowForm] = useState(false);
  const [pending, startTransition] = useTransition();

  const openNew = () => {
    setEditing(null);
    setForm({ ...EMPTY, position: list.length + 1 });
    setShowForm(true);
  };

  const openEdit = (c: Category) => {
    setEditing(c);
    setForm({ slug: c.slug, label: c.label, position: c.position });
    setShowForm(true);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.slug || !form.label) {
      toast.error("Vui lòng nhập slug và tên");
      return;
    }
    const payload = { ...form };
    startTransition(async () => {
      const res = editing ? await updateCategory(editing.id, payload) : await createCategory(payload);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      if (res.category) {
        if (editing) {
          setList((cs) => cs.map((c) => (c.id === editing.id ? res.category! : c)));
        } else {
          setList((cs) => [...cs, res.category!]);
        }
      }
      setShowForm(false);
      toast.success(editing ? "Đã cập nhật danh mục" : "Đã tạo danh mục");
    });
  };

  const handleDelete = (c: Category) => {
    const count = productCounts[c.slug] ?? 0;
    if (count > 0) {
      toast.error(`Không thể xóa: còn ${count} sản phẩm thuộc danh mục này`);
      return;
    }
    if (!confirm(`Xóa danh mục "${c.label}"?`)) return;
    startTransition(async () => {
      const res = await deleteCategory(c.id);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      setList((cs) => cs.filter((x) => x.id !== c.id));
      toast.success("Đã xóa danh mục");
    });
  };

  return (
    <div className="space-y-5">
      {showForm ? (
        <form onSubmit={submit} className="bg-white rounded-xl border border-gold/10 p-5 space-y-4">
          <h2 className="font-serif text-lg text-burgundy">{editing ? "Sửa" : "Tạo"} danh mục</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-700 mb-1 block">Tên hiển thị *</label>
              <input
                required
                value={form.label}
                onChange={(e) => {
                  setForm({ ...form, label: e.target.value, slug: !editing && !form.slug ? slugify(e.target.value) : form.slug });
                }}
                className="input-field"
                placeholder="VD: Quà Cưới"
              />
            </div>
            <div>
              <label className="text-sm text-gray-700 mb-1 block">Slug *</label>
              <input
                required
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })}
                className="input-field font-mono text-sm"
                placeholder="qua-cuoi"
                disabled={!!editing}
              />
              {editing && <p className="text-xs text-gray-400 mt-1">Slug không thể đổi sau khi tạo (vì sản phẩm tham chiếu)</p>}
            </div>
            <div>
              <label className="text-sm text-gray-700 mb-1 block">Vị trí</label>
              <input
                type="number"
                value={form.position}
                onChange={(e) => setForm({ ...form, position: parseInt(e.target.value) || 0 })}
                className="input-field"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={pending} className="btn-gold">{pending ? "Đang lưu..." : editing ? "Cập nhật" : "Tạo danh mục"}</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-outline-gold">Hủy</button>
          </div>
        </form>
      ) : (
        <div className="flex justify-end">
          <button onClick={openNew} className="btn-gold text-sm">+ Thêm danh mục</button>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gold/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-cream text-xs text-gray-500 uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Vị trí</th>
              <th className="px-4 py-3 text-left font-medium">Tên</th>
              <th className="px-4 py-3 text-left font-medium">Slug</th>
              <th className="px-4 py-3 text-center font-medium">Số sản phẩm</th>
              <th className="px-4 py-3 text-right font-medium">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gold/5">
            {list.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-gray-400">Chưa có danh mục</td></tr>
            ) : (
              list.map((c) => (
                <tr key={c.id} className="hover:bg-cream transition-colors">
                  <td className="px-4 py-3 text-gray-500">{c.position}</td>
                  <td className="px-4 py-3 font-medium text-burgundy">{c.label}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{c.slug}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-xs px-2 py-1 rounded-full bg-gold/10 text-gold-700 font-medium">
                      {productCounts[c.slug] ?? 0}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-3">
                    <button onClick={() => openEdit(c)} className="text-xs text-burgundy hover:text-gold">Sửa</button>
                    <button
                      onClick={() => handleDelete(c)}
                      disabled={(productCounts[c.slug] ?? 0) > 0}
                      className="text-xs text-red-500 hover:text-red-700 disabled:opacity-30"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
