"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/context/ToastContext";
import { createClient } from "@/lib/supabase/client";
import PageHeader from "@/components/PageHeader";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const toast = useToast();
  const supabase = createClient();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { error: err } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });
      if (err) {
        setError(err.message === "Invalid login credentials" ? "Email hoặc mật khẩu không đúng" : err.message);
        toast.error("Đăng nhập thất bại");
        return;
      }
      toast.success("Đăng nhập thành công");
      const redirect = params.get("redirect");
      const safeRedirect = redirect && redirect.startsWith("/") && !redirect.startsWith("//") ? redirect : "/account";
      router.push(safeRedirect);
      router.refresh();
    } catch (err) {
      console.error("[login] threw", err);
      setError("Lỗi: " + (err instanceof Error ? err.message : "không xác định"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gold/10 p-8 shadow-sm">
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="text-sm text-gray-600 mb-1 block">Email *</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="input-field"
            placeholder="email@example.com"
          />
        </div>
        <div>
          <label className="text-sm text-gray-600 mb-1 block">Mật khẩu *</label>
          <div className="relative">
            <input
              type={showPwd ? "text" : "password"}
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="input-field pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPwd(!showPwd)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"
            >
              {showPwd ? "Ẩn" : "Hiện"}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-gray-600">
            <input type="checkbox" />
            Nhớ tôi
          </label>
          <Link href="/account/forgot-password" className="text-burgundy hover:text-gold">
            Quên mật khẩu?
          </Link>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button type="submit" disabled={loading} className="btn-gold w-full justify-center">
          {loading ? "Đang đăng nhập..." : "Đăng Nhập"}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Chưa có tài khoản?{" "}
        <Link href="/account/register" className="text-burgundy hover:text-gold font-medium">
          Đăng ký ngay
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <>
      <PageHeader title="Đăng Nhập" crumbs={[{ label: "Trang Chủ", href: "/" }, { label: "Đăng Nhập" }]} />
      <div className="max-w-md mx-auto px-4 py-12">
        <Suspense fallback={<div className="bg-white rounded-2xl border border-gold/10 p-8 text-center text-gray-400">Đang tải...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </>
  );
}
