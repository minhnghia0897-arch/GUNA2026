"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useToast } from "@/context/ToastContext";
import type { DbPolicy } from "@/lib/supabase/cms-types";
import { updatePolicy } from "./actions";

export default function PoliciesClient({ initial }: { initial: DbPolicy[] }) {
  const toast = useToast();
  const [policies, setPolicies] = useState<DbPolicy[]>(initial);
  const [activeId, setActiveId] = useState<string | null>(initial[0]?.id ?? null);
  const [pending, startTransition] = useTransition();

  const active = policies.find((p) => p.id === activeId) ?? null;

  const update = <K extends keyof DbPolicy>(k: K, v: DbPolicy[K]) => {
    if (!active) return;
    setPolicies((ps) => ps.map((p) => (p.id === active.id ? { ...p, [k]: v } : p)));
  };

  const save = () => {
    if (!active) return;
    startTransition(async () => {
      const res = await updatePolicy(active.id, {
        slug: active.slug,
        title: active.title,
        content: active.content ?? null,
      });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success("Đã lưu chính sách");
    });
  };

  return (
    <div className="grid lg:grid-cols-4 gap-5">
      <div className="lg:col-span-1">
        <div className="bg-white rounded-xl border border-gold/10 overflow-hidden">
          <div className="divide-y divide-gold/5">
            {policies.map((p) => (
              <button
                key={p.id}
                onClick={() => setActiveId(p.id)}
                className={`w-full text-left px-4 py-3 transition-colors ${
                  active?.id === p.id ? "bg-burgundy text-white" : "hover:bg-cream"
                }`}
              >
                <p className="font-medium text-sm line-clamp-1">{p.title}</p>
                <p className={`text-xs mt-0.5 font-mono ${active?.id === p.id ? "text-white/60" : "text-gray-400"}`}>
                  /{p.slug}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="lg:col-span-3">
        {active ? (
          <div className="bg-white rounded-xl border border-gold/10 p-5 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-700 mb-1 block">Slug *</label>
                <input
                  value={active.slug}
                  onChange={(e) => update("slug", e.target.value)}
                  className="input-field font-mono text-sm"
                />
                <p className="text-xs text-gray-400 mt-1">URL: /policies/{active.slug}</p>
              </div>
              <div>
                <label className="text-sm text-gray-700 mb-1 block">Tiêu đề *</label>
                <input value={active.title} onChange={(e) => update("title", e.target.value)} className="input-field" />
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-700 mb-1 block">Nội dung (Markdown)</label>
              <textarea
                value={active.content ?? ""}
                onChange={(e) => update("content", e.target.value)}
                className="input-field font-mono text-sm leading-relaxed"
                rows={20}
              />
              <p className="text-xs text-gray-400 mt-1">
                Hỗ trợ: <code>## tiêu đề</code> · <code>**bold**</code> · <code>- list</code> · xuống dòng = đoạn mới
              </p>
            </div>
            <div className="flex gap-3 pt-2 border-t border-gold/10">
              <button onClick={save} disabled={pending} className="btn-gold">{pending ? "Đang lưu..." : "Lưu thay đổi"}</button>
              <Link href={`/policies/${active.slug}`} target="_blank" className="btn-outline-gold">
                Xem trang →
              </Link>
            </div>
          </div>
        ) : (
          <p className="text-center py-12 text-gray-400">Chọn một chính sách để sửa</p>
        )}
      </div>
    </div>
  );
}
