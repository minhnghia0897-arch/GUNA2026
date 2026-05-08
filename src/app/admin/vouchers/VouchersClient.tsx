"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/context/ToastContext";
import { formatPrice } from "@/lib/format";

type Voucher = {
  id: string;
  code: string;
  title: string;
  description: string | null;
  discount_type: "percentage" | "fixed" | "freeship";
  value: number;
  min_order: number;
  max_discount: number | null;
  ends_at: string | null;
  is_active: boolean;
  used_count: number;
};

const EMPTY: Omit<Voucher, "id" | "used_count"> = {
  code: "",
  title: "",
  description: "",
  discount_type: "percentage",
  value: 10,
  min_order: 0,
  max_discount: null,
  ends_at: null,
  is_active: true,
};

const TYPE_LABEL: Record<string, string> = {
  percentage: "Phần trăm",
  fixed: "Số tiền cố định",
  freeship: "Miễn phí ship",
};

export default function VouchersClient({
  initialVouchers,
}: {
  initialVouchers: Voucher[];
}) {
  const router = useRouter();
  const toast = useToast();
  const [vouchers, setVouchers] = useState<Voucher[]>(initialVouchers);
  const [editing, setEditing] = useState<Voucher | null>(null);
  const [form, setForm] = useState<Omit<Voucher, "id" | "used_count">>(EMPTY);
  const [showForm, setShowForm] = useState(false);

  const openNew = () => {
    setEditing(null);
    setForm(EMPTY);
    setShowForm(true);
  };

  const openEdit = (v: Voucher) => {
    setEditing(v);
    setForm({
      code: v.code,
      title: v.title,
      description: v.description ?? "",
      discount_type: v.discount_type,
      value: v.value,
      min_order: v.min_order,
      max_discount: v.max_discount,
      ends_at: v.ends_at,
      is_active: v.is_active,
    });
    setShowForm(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    const payload = { ...form, code: form.code.toUpperCase().trim() };
    const { data, error } = editing
      ? await supabase.from("vouchers").update(payload).eq("id", editing.id).select().single()
      : await supabase.from("vouchers").insert(payload).select().single();

    if (error) {
      toast.error("Lưu thất bại: " + error.message);
      return;
    }
    if (editing) {
      setVouchers((vs) => vs.map((v) => (v.id === editing.id ? (data as Voucher) : v)));
    } else {
      setVouchers((vs) => [data as Voucher, ...vs]);
    }
    setShowForm(false);
    toast.success(editing ? "Đã cập nhật voucher" : "Đã tạo voucher");
    router.refresh();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa voucher này?")) return;
    const supabase = createClient();
    const { error } = await supabase.from("vouchers").delete().eq("id", id);
    if (error) {
      toast.error("Xóa thất bại");
      return;
    }
    setVouchers((vs) => vs.filter((v) => v.id !== id));
    toast.success("Đã xóa voucher");
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-serif text-2xl text-burgundy">Voucher ({vouchers.length})</h1>
        <button onClick={openNew} className="btn-gold text-sm">+ Tạo voucher</button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="bg-white rounded-xl border border-gold/10 p-5 space-y-4">
          <h2 className="font-serif text-lg text-burgundy">{editing ? "Sửa" : "Tạo"} voucher</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-700 mb-1 block">Mã *</label>
              <input
                required
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                className="input-field font-mono"
                placeholder="FARMO10"
              />
            </div>
            <div>
              <label className="text-sm text-gray-700 mb-1 block">Tên *</label>
              <input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="input-field"
                placeholder="Giảm 10% đơn đầu"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm text-gray-700 mb-1 block">Mô tả</label>
              <input
                value={form.description ?? ""}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="text-sm text-gray-700 mb-1 block">Loại *</label>
              <select
                value={form.discount_type}
                onChange={(e) => setForm({ ...form, discount_type: e.target.value as Voucher["discount_type"] })}
                className="input-field"
              >
                <option value="percentage">Phần trăm</option>
                <option value="fixed">Số tiền cố định</option>
                <option value="freeship">Miễn phí ship</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-700 mb-1 block">
                Giá trị {form.discount_type === "percentage" ? "(%)" : form.discount_type === "fixed" ? "(VNĐ)" : ""}
              </label>
              <input
                type="number"
                min="0"
                value={form.value}
                onChange={(e) => setForm({ ...form, value: parseInt(e.target.value) || 0 })}
                className="input-field"
                disabled={form.discount_type === "freeship"}
              />
            </div>
            <div>
              <label className="text-sm text-gray-700 mb-1 block">Đơn tối thiểu (VNĐ)</label>
              <input
                type="number"
                min="0"
                value={form.min_order}
                onChange={(e) => setForm({ ...form, min_order: parseInt(e.target.value) || 0 })}
                className="input-field"
              />
            </div>
            <div>
              <label className="text-sm text-gray-700 mb-1 block">Hết hạn</label>
              <input
                type="date"
                value={form.ends_at ? form.ends_at.slice(0, 10) : ""}
                onChange={(e) => setForm({ ...form, ends_at: e.target.value || null })}
                className="input-field"
              />
            </div>
            <label className="flex items-center gap-2 sm:col-span-2 text-sm">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              />
              <span>Đang hoạt động</span>
            </label>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-gold">{editing ? "Cập nhật" : "Tạo voucher"}</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-outline-gold">Hủy</button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl border border-gold/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-cream text-xs text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Mã</th>
                <th className="px-4 py-3 text-left font-medium">Tên</th>
                <th className="px-4 py-3 text-left font-medium">Loại</th>
                <th className="px-4 py-3 text-right font-medium">Giá trị</th>
                <th className="px-4 py-3 text-center font-medium">Dùng</th>
                <th className="px-4 py-3 text-center font-medium">HSD</th>
                <th className="px-4 py-3 text-center font-medium">Hoạt động</th>
                <th className="px-4 py-3 text-right font-medium">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gold/5">
              {vouchers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-400">Chưa có voucher nào</td>
                </tr>
              ) : (
                vouchers.map((v) => (
                  <tr key={v.id} className="hover:bg-cream transition-colors">
                    <td className="px-4 py-3 font-mono font-semibold text-burgundy">{v.code}</td>
                    <td className="px-4 py-3 text-gray-800">{v.title}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{TYPE_LABEL[v.discount_type]}</td>
                    <td className="px-4 py-3 text-right">
                      {v.discount_type === "percentage" ? `${v.value}%`
                        : v.discount_type === "fixed" ? formatPrice(v.value)
                        : "Free ship"}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600">{v.used_count}</td>
                    <td className="px-4 py-3 text-center text-xs text-gray-500">
                      {v.ends_at ? new Date(v.ends_at).toLocaleDateString("vi-VN") : "—"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {v.is_active ? <span className="text-green-600">●</span> : <span className="text-gray-300">●</span>}
                    </td>
                    <td className="px-4 py-3 text-right space-x-3">
                      <button onClick={() => openEdit(v)} className="text-xs text-burgundy hover:text-gold">Sửa</button>
                      <button onClick={() => handleDelete(v.id)} className="text-xs text-red-500 hover:text-red-700">Xóa</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
