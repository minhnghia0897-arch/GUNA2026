"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import { useToast } from "@/context/ToastContext";
import {
  loadAddresses,
  upsertAddress,
  deleteAddress,
  setDefaultAddress,
  type SavedAddress,
} from "@/lib/addresses";
import { createClient } from "@/lib/supabase/client";
import { provinces, getDistricts, getWards } from "@/data/vn-address";

const EMPTY: Omit<SavedAddress, "id"> = {
  label: "Nhà",
  fullName: "",
  phone: "",
  provinceCode: "",
  provinceName: "",
  districtCode: "",
  districtName: "",
  wardCode: "",
  wardName: "",
  line: "",
  isDefault: false,
};

export default function AddressBookPage() {
  const toast = useToast();
  const router = useRouter();
  const [list, setList] = useState<SavedAddress[]>([]);
  const [editing, setEditing] = useState<SavedAddress | null>(null);
  const [form, setForm] = useState<Omit<SavedAddress, "id">>(EMPTY);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setAuthed(false);
        setLoading(false);
        return;
      }
      setAuthed(true);
      const items = await loadAddresses();
      setList(items);
      setLoading(false);
    };
    init();
  }, []);

  const districts = useMemo(() => getDistricts(form.provinceCode), [form.provinceCode]);
  const wards = useMemo(() => getWards(form.provinceCode, form.districtCode), [form.provinceCode, form.districtCode]);

  const startEdit = (addr: SavedAddress) => {
    setEditing(addr);
    setForm({
      label: addr.label,
      fullName: addr.fullName,
      phone: addr.phone,
      provinceCode: addr.provinceCode,
      provinceName: addr.provinceName,
      districtCode: addr.districtCode,
      districtName: addr.districtName,
      wardCode: addr.wardCode,
      wardName: addr.wardName,
      line: addr.line,
      isDefault: addr.isDefault,
    });
    setShowForm(true);
  };

  const startCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY, isDefault: list.length === 0 });
    setShowForm(true);
  };

  const cancel = () => {
    setShowForm(false);
    setEditing(null);
  };

  const onProvinceChange = (code: string) => {
    const p = provinces.find((x) => x.code === code);
    setForm((f) => ({
      ...f,
      provinceCode: code,
      provinceName: p?.name ?? "",
      districtCode: "",
      districtName: "",
      wardCode: "",
      wardName: "",
    }));
  };

  const onDistrictChange = (code: string) => {
    const d = districts.find((x) => x.code === code);
    setForm((f) => ({
      ...f,
      districtCode: code,
      districtName: d?.name ?? "",
      wardCode: "",
      wardName: "",
    }));
  };

  const onWardChange = (code: string) => {
    const w = wards.find((x) => x.code === code);
    setForm((f) => ({ ...f, wardCode: code, wardName: w?.name ?? "" }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^0\d{9,10}$/.test(form.phone)) {
      toast.error("Số điện thoại không hợp lệ");
      return;
    }
    if (!form.provinceCode || !form.districtCode || !form.wardCode) {
      toast.error("Vui lòng chọn đầy đủ tỉnh / quận / phường");
      return;
    }
    try {
      const next = await upsertAddress({ id: editing?.id, ...form });
      setList(next);
      setShowForm(false);
      setEditing(null);
      toast.success(editing ? "Đã cập nhật địa chỉ" : "Đã thêm địa chỉ mới");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Lưu thất bại");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa địa chỉ này?")) return;
    try {
      setList(await deleteAddress(id));
      toast.info("Đã xóa địa chỉ");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Xóa thất bại");
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      setList(await setDefaultAddress(id));
      toast.success("Đã đặt làm địa chỉ mặc định");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Cập nhật thất bại");
    }
  };

  return (
    <>
      <PageHeader
        title="Sổ Địa Chỉ"
        crumbs={[
          { label: "Trang Chủ", href: "/" },
          { label: "Tài Khoản", href: "/account" },
          { label: "Địa Chỉ" },
        ]}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin w-8 h-8 border-2 border-gold border-t-transparent rounded-full" />
          </div>
        ) : !authed ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gold/10">
            <div className="text-6xl mb-4 opacity-30">🔒</div>
            <h2 className="font-serif text-xl text-burgundy mb-2">Cần đăng nhập</h2>
            <p className="text-gray-500 mb-6">Đăng nhập để lưu và quản lý địa chỉ giao hàng</p>
            <button onClick={() => router.push("/account/login")} className="btn-gold inline-flex">Đăng nhập</button>
          </div>
        ) : showForm ? (
          <div className="bg-white rounded-2xl border border-gold/10 p-6 sm:p-8">
            <h2 className="font-serif text-xl text-burgundy mb-6">
              {editing ? "Sửa địa chỉ" : "Thêm địa chỉ mới"}
            </h2>
            <form onSubmit={submit} className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Nhãn *</label>
                <select
                  className="input-field"
                  value={form.label}
                  onChange={(e) => setForm({ ...form, label: e.target.value })}
                >
                  <option>Nhà</option>
                  <option>Công ty</option>
                  <option>Khác</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Họ tên *</label>
                <input
                  className="input-field"
                  required
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">SĐT *</label>
                <input
                  className="input-field"
                  required
                  inputMode="numeric"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/[^\d]/g, "") })}
                  placeholder="0901234567"
                />
              </div>
              <div className="hidden sm:block" />
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Tỉnh / TP *</label>
                <select className="input-field" value={form.provinceCode} onChange={(e) => onProvinceChange(e.target.value)}>
                  <option value="">-- Chọn --</option>
                  {provinces.map((p) => (
                    <option key={p.code} value={p.code}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Quận / Huyện *</label>
                <select
                  className="input-field"
                  value={form.districtCode}
                  onChange={(e) => onDistrictChange(e.target.value)}
                  disabled={!form.provinceCode}
                >
                  <option value="">{form.provinceCode ? "-- Chọn --" : "Chọn tỉnh trước"}</option>
                  {districts.map((d) => (
                    <option key={d.code} value={d.code}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Phường / Xã *</label>
                <select
                  className="input-field"
                  value={form.wardCode}
                  onChange={(e) => onWardChange(e.target.value)}
                  disabled={!form.districtCode}
                >
                  <option value="">{form.districtCode ? "-- Chọn --" : "Chọn quận trước"}</option>
                  {wards.map((w) => (
                    <option key={w.code} value={w.code}>{w.name}</option>
                  ))}
                </select>
              </div>
              <div className="hidden sm:block" />
              <div className="sm:col-span-2">
                <label className="text-sm text-gray-600 mb-1 block">Địa chỉ chi tiết *</label>
                <input
                  className="input-field"
                  required
                  value={form.line}
                  onChange={(e) => setForm({ ...form, line: e.target.value })}
                  placeholder="Số nhà, tên đường..."
                />
              </div>
              <div className="sm:col-span-2">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={form.isDefault}
                    onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
                  />
                  Đặt làm địa chỉ mặc định
                </label>
              </div>
              <div className="sm:col-span-2 flex gap-3 mt-2">
                <button type="submit" className="btn-gold">{editing ? "Cập nhật" : "Lưu địa chỉ"}</button>
                <button type="button" onClick={cancel} className="btn-outline-gold">Hủy</button>
              </div>
            </form>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <p className="text-sm text-gray-500">{list.length} địa chỉ đã lưu</p>
              <button onClick={startCreate} className="btn-gold text-sm">
                + Thêm địa chỉ
              </button>
            </div>

            {list.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-gold/10">
                <div className="text-6xl mb-4 opacity-30">📍</div>
                <h2 className="font-serif text-xl text-burgundy mb-2">Chưa có địa chỉ nào</h2>
                <p className="text-gray-500 mb-6">Thêm địa chỉ để thanh toán nhanh hơn</p>
                <button onClick={startCreate} className="btn-gold inline-flex">+ Thêm địa chỉ đầu tiên</button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {list.map((addr) => (
                  <div key={addr.id} className="bg-white rounded-xl border border-gold/10 p-5">
                    <div className="flex items-start justify-between mb-3 gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs px-2 py-1 bg-cream text-burgundy rounded font-medium">
                          {addr.label}
                        </span>
                        {addr.isDefault && (
                          <span className="text-xs px-2 py-1 bg-gold/10 text-gold-700 rounded font-medium">
                            ✓ Mặc định
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="font-medium text-sm">{addr.fullName} <span className="text-gray-400 font-normal">· {addr.phone}</span></p>
                    <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                      {addr.line}, {addr.wardName}, {addr.districtName}, {addr.provinceName}
                    </p>
                    <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gold/10 text-xs">
                      <button onClick={() => startEdit(addr)} className="text-burgundy hover:text-gold font-medium">
                        Sửa
                      </button>
                      <span className="text-gray-200">|</span>
                      {!addr.isDefault && (
                        <>
                          <button onClick={() => handleSetDefault(addr.id)} className="text-burgundy hover:text-gold font-medium">
                            Đặt mặc định
                          </button>
                          <span className="text-gray-200">|</span>
                        </>
                      )}
                      <button onClick={() => handleDelete(addr.id)} className="text-red-500 hover:text-red-700 font-medium">
                        Xóa
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-8">
              <Link href="/account" className="text-sm text-burgundy hover:text-gold flex items-center gap-2">
                ← Về trang tài khoản
              </Link>
            </div>
          </>
        )}
      </div>
    </>
  );
}
