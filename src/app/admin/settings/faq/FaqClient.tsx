"use client";

import { useState, useTransition } from "react";
import { useToast } from "@/context/ToastContext";
import type { DbFaq } from "@/lib/supabase/cms-types";
import { createFaq, updateFaq, deleteFaq } from "./actions";

const EMPTY: Omit<DbFaq, "id"> = {
  category: "Đặt hàng",
  question: "",
  answer: "",
  position: 0,
  is_visible: true,
};

export default function FaqClient({ initial }: { initial: DbFaq[] }) {
  const toast = useToast();
  const [faqs, setFaqs] = useState<DbFaq[]>(initial);
  const [editing, setEditing] = useState<DbFaq | null>(null);
  const [form, setForm] = useState<Omit<DbFaq, "id">>(EMPTY);
  const [showForm, setShowForm] = useState(false);
  const [pending, startTransition] = useTransition();

  const categories = Array.from(new Set(faqs.map((f) => f.category)));

  const openNew = () => {
    setEditing(null);
    setForm({ ...EMPTY, category: categories[0] ?? "Đặt hàng" });
    setShowForm(true);
  };

  const openEdit = (f: DbFaq) => {
    setEditing(f);
    const { id: _id, ...rest } = f;
    void _id;
    setForm(rest);
    setShowForm(true);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form };
    startTransition(async () => {
      const res = editing ? await updateFaq(editing.id, payload) : await createFaq(payload);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      if (res.faq) {
        if (editing) {
          setFaqs((fs) => fs.map((f) => (f.id === editing.id ? res.faq! : f)));
        } else {
          setFaqs((fs) => [...fs, res.faq!]);
        }
      }
      setShowForm(false);
      toast.success(editing ? "Đã cập nhật" : "Đã thêm câu hỏi");
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Xóa câu hỏi này?")) return;
    startTransition(async () => {
      const res = await deleteFaq(id);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      setFaqs((fs) => fs.filter((f) => f.id !== id));
      toast.success("Đã xóa");
    });
  };

  const grouped = faqs.reduce((acc: Record<string, DbFaq[]>, f) => {
    if (!acc[f.category]) acc[f.category] = [];
    acc[f.category].push(f);
    return acc;
  }, {});

  return (
    <div className="space-y-5">
      {showForm ? (
        <form onSubmit={submit} className="bg-white rounded-xl border border-gold/10 p-5 space-y-4">
          <h2 className="font-serif text-lg text-burgundy">{editing ? "Sửa" : "Thêm"} câu hỏi</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-700 mb-1 block">Danh mục *</label>
              <input
                required
                list="faq-categories"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="input-field"
              />
              <datalist id="faq-categories">
                {categories.map((c) => <option key={c} value={c} />)}
              </datalist>
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
            <div className="sm:col-span-2">
              <label className="text-sm text-gray-700 mb-1 block">Câu hỏi *</label>
              <input
                required
                value={form.question}
                onChange={(e) => setForm({ ...form, question: e.target.value })}
                className="input-field"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm text-gray-700 mb-1 block">Câu trả lời *</label>
              <textarea
                required
                value={form.answer}
                onChange={(e) => setForm({ ...form, answer: e.target.value })}
                className="input-field"
                rows={4}
              />
            </div>
            <label className="flex items-center gap-2 sm:col-span-2 text-sm">
              <input
                type="checkbox"
                checked={form.is_visible}
                onChange={(e) => setForm({ ...form, is_visible: e.target.checked })}
              />
              <span>Hiển thị</span>
            </label>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={pending} className="btn-gold">{pending ? "Đang lưu..." : editing ? "Cập nhật" : "Thêm câu hỏi"}</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-outline-gold">Hủy</button>
          </div>
        </form>
      ) : (
        <div className="flex justify-end">
          <button onClick={openNew} className="btn-gold text-sm">+ Thêm câu hỏi</button>
        </div>
      )}

      <div className="space-y-5">
        {Object.entries(grouped).map(([cat, items]) => (
          <div key={cat} className="bg-white rounded-xl border border-gold/10 overflow-hidden">
            <div className="px-5 py-3 bg-cream border-b border-gold/10">
              <h2 className="font-serif text-lg text-burgundy">{cat}</h2>
              <p className="text-xs text-gray-500">{items.length} câu hỏi</p>
            </div>
            <div className="divide-y divide-gold/5">
              {items.map((f) => (
                <div key={f.id} className="px-5 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-burgundy">{f.question}</p>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{f.answer}</p>
                      {!f.is_visible && (
                        <span className="inline-block mt-2 text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                          Đã ẩn
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 text-xs flex-shrink-0">
                      <button onClick={() => openEdit(f)} className="text-burgundy hover:text-gold">Sửa</button>
                      <button onClick={() => handleDelete(f.id)} className="text-red-500 hover:text-red-700">Xóa</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
