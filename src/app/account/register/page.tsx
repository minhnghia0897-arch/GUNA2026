"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/context/ToastContext";
import { createClient } from "@/lib/supabase/client";
import PageHeader from "@/components/PageHeader";

export default function RegisterPage() {
  const router = useRouter();
  const toast = useToast();
  const supabase = createClient();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agree: false,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }
    if (form.password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }
    if (!form.agree) {
      setError("Vui lòng đồng ý với điều khoản sử dụng");
      return;
    }
    setLoading(true);
    const { data, error: err } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { full_name: form.name, phone: form.phone },
        emailRedirectTo: typeof window !== "undefined" ? `${window.location.origin}/account` : undefined,
      },
    });
    if (err) {
      setError(err.message);
      setLoading(false);
      toast.error("Đăng ký thất bại");
      return;
    }
    if (data.user) {
      await supabase.from("profiles").upsert({
        id: data.user.id,
        email: form.email,
        full_name: form.name,
        phone: form.phone,
      }, { onConflict: "id" });
    }
    setLoading(false);
    toast.success(`Chào mừng ${form.name}! Vui lòng kiểm tra email để xác minh.`);
    router.push("/account");
    router.refresh();
  };

  return (
    <>
      <PageHeader title="Đăng Ký" crumbs={[{ label: "Trang Chủ", href: "/" }, { label: "Đăng Ký" }]} />
      <div className="max-w-md mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl border border-gold/10 p-8 shadow-sm">
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Họ và tên *</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Email *</label>
              <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Số điện thoại *</label>
              <input
                required
                inputMode="numeric"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/[^\d]/g, "") })}
                className="input-field"
                placeholder="0901234567"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Mật khẩu *</label>
              <input type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Xác nhận mật khẩu *</label>
              <input type="password" required value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} className="input-field" />
            </div>

            <label className="flex items-start gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={form.agree}
                onChange={(e) => setForm({ ...form, agree: e.target.checked })}
                className="mt-1"
              />
              <span>
                Tôi đồng ý với{" "}
                <Link href="/policies/terms" className="text-burgundy hover:text-gold">Điều khoản sử dụng</Link>{" "}và{" "}
                <Link href="/policies/privacy" className="text-burgundy hover:text-gold">Chính sách bảo mật</Link>
              </span>
            </label>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button type="submit" disabled={loading} className="btn-gold w-full justify-center">
              {loading ? "Đang xử lý..." : "Đăng Ký"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Đã có tài khoản?{" "}
            <Link href="/account/login" className="text-burgundy hover:text-gold font-medium">
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
