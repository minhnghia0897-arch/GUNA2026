"use client";

import { useState } from "react";

export default function AdminLoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/admin-signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email.trim(), password: form.password }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error ?? "Đăng nhập thất bại");
        return;
      }
      window.location.href = "/admin";
      return;
    } catch (err) {
      console.error("[admin-login] threw", err);
      setError("Lỗi: " + (err instanceof Error ? err.message : "không xác định"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-burgundy-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gold/20 border-2 border-gold flex items-center justify-center">
            <span className="text-gold font-serif text-2xl font-bold">G</span>
          </div>
          <h1 className="font-serif text-3xl text-gold mb-2">GUNA GIFT</h1>
          <p className="text-gold/50 text-xs uppercase tracking-[0.3em]">Trang Quản Trị</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="font-serif text-xl text-burgundy mb-6 text-center">Đăng nhập quản trị viên</h2>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Email *</label>
              <input
                type="email"
                required
                autoComplete="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input-field"
                placeholder="admin@gunagift.vn"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Mật khẩu *</label>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="input-field pr-12"
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

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-burgundy w-full justify-center"
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-gold/10 text-center">
            <a href="/" className="text-xs text-gray-400 hover:text-burgundy">
              ← Quay về trang chính
            </a>
          </div>
        </div>

        <p className="text-center text-gold/30 text-xs mt-6">
          © GUNA GIFT — Khu vực bảo mật
        </p>
      </div>
    </div>
  );
}
