"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function Newsletter({ source = "footer" }: { source?: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error" | "duplicate">("idle");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus("error");
      return;
    }
    setStatus("loading");
    const supabase = createClient();
    const { error } = await supabase
      .from("newsletter_subscribers")
      .insert({ email: email.toLowerCase().trim(), source });

    if (error) {
      if (error.code === "23505") {
        // Duplicate email
        setStatus("duplicate");
      } else {
        setStatus("error");
      }
      return;
    }

    setStatus("success");
    setEmail("");
    setTimeout(() => setStatus("idle"), 4000);
  };

  return (
    <>
      <form className="flex" onSubmit={onSubmit}>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === "loading"}
          placeholder="Email của bạn"
          className="flex-1 bg-white/5 border border-white/10 rounded-l-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-gold/50 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="bg-gold text-burgundy-950 px-4 py-2 rounded-r-lg text-sm font-semibold hover:bg-gold-400 transition-colors disabled:opacity-60"
        >
          {status === "loading" ? "..." : "Gửi"}
        </button>
      </form>
      {status === "success" && (
        <p className="text-xs text-green-400 mt-2">✓ Đã đăng ký thành công! Cảm ơn bạn.</p>
      )}
      {status === "duplicate" && (
        <p className="text-xs text-amber-400 mt-2">Email này đã được đăng ký trước đó.</p>
      )}
      {status === "error" && (
        <p className="text-xs text-red-400 mt-2">Email không hợp lệ hoặc lỗi mạng.</p>
      )}
    </>
  );
}
