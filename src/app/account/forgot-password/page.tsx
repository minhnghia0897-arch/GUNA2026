"use client";

import { useState } from "react";
import Link from "next/link";
import { useToast } from "@/context/ToastContext";
import { createClient } from "@/lib/supabase/client";
import PageHeader from "@/components/PageHeader";

export default function ForgotPasswordPage() {
  const toast = useToast();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Email không hợp lệ");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: typeof window !== "undefined" ? `${window.location.origin}/account` : undefined,
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setSent(true);
    toast.success("Đã gửi email đặt lại mật khẩu");
  };

  return (
    <>
      <PageHeader
        title="Quên Mật Khẩu"
        crumbs={[
          { label: "Trang Chủ", href: "/" },
          { label: "Đăng Nhập", href: "/account/login" },
          { label: "Quên Mật Khẩu" },
        ]}
      />

      <div className="max-w-md mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl border border-gold/10 p-8 shadow-sm">
          {sent ? (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-50 flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="font-serif text-xl text-burgundy mb-2">Đã gửi email</h2>
              <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến{" "}
                <strong className="text-burgundy">{email}</strong>. Vui lòng kiểm tra hộp thư
                (cả thư mục spam) trong 5 phút tới.
              </p>
              <div className="flex gap-3 justify-center flex-wrap">
                <button onClick={() => setSent(false)} className="btn-outline-gold text-sm">
                  Gửi lại
                </button>
                <Link href="/account/login" className="btn-gold text-sm">
                  Về trang đăng nhập
                </Link>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-600 mb-6 text-center leading-relaxed">
                Nhập email đã đăng ký, chúng tôi sẽ gửi link đặt lại mật khẩu cho bạn.
              </p>
              <form onSubmit={submit} className="space-y-4">
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Email *</label>
                  <input
                    type="email"
                    required
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field"
                    placeholder="email@example.com"
                  />
                </div>
                <button type="submit" disabled={submitting} className="btn-gold w-full justify-center">
                  {submitting ? "Đang gửi..." : "Gửi link đặt lại"}
                </button>
              </form>
              <p className="text-center text-sm text-gray-500 mt-6">
                Nhớ ra mật khẩu?{" "}
                <Link href="/account/login" className="text-burgundy hover:text-gold font-medium">
                  Đăng nhập
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </>
  );
}
