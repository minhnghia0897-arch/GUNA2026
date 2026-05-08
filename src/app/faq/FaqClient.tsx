"use client";

import { useState } from "react";
import PageHeader from "@/components/PageHeader";

type Group = { category: string; items: { q: string; a: string }[] };

export default function FaqClient({
  groups,
  hotline,
  email,
}: {
  groups: Group[];
  hotline: string;
  email: string;
}) {
  const [openIdx, setOpenIdx] = useState<string | null>("0-0");
  const phoneClean = hotline.replace(/\s/g, "");

  return (
    <>
      <PageHeader
        title="Câu Hỏi Thường Gặp"
        subtitle="Tìm câu trả lời nhanh cho các thắc mắc về sản phẩm và dịch vụ FarMơ"
        crumbs={[{ label: "Trang Chủ", href: "/" }, { label: "FAQ" }]}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {groups.length === 0 ? (
          <p className="text-center py-20 text-gray-500">Chưa có câu hỏi nào.</p>
        ) : (
          groups.map((cat, ci) => (
            <div key={cat.category} className="mb-10">
              <h2 className="font-serif text-2xl text-burgundy mb-6 pb-3 border-b border-gold/10">
                {cat.category}
              </h2>
              <div className="space-y-3">
                {cat.items.map((item, ii) => {
                  const id = `${ci}-${ii}`;
                  const isOpen = openIdx === id;
                  return (
                    <div key={id} className="bg-white border border-gold/10 rounded-lg overflow-hidden">
                      <button
                        onClick={() => setOpenIdx(isOpen ? null : id)}
                        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-cream transition-colors"
                        aria-expanded={isOpen}
                      >
                        <span className="font-medium text-burgundy text-sm">{item.q}</span>
                        <svg
                          className={`w-5 h-5 text-gold flex-shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {isOpen && (
                        <div className="px-6 pb-4 text-sm text-gray-600 font-light leading-relaxed whitespace-pre-line">
                          {item.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}

        <div className="mt-16 bg-gradient-to-br from-burgundy to-burgundy-900 text-white rounded-2xl p-8 text-center">
          <h3 className="font-serif text-2xl mb-3">Vẫn còn thắc mắc?</h3>
          <p className="text-white/70 text-sm mb-6">Đội ngũ tư vấn FarMơ sẵn sàng hỗ trợ bạn 24/7</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a href={`tel:${phoneClean}`} className="btn-gold">📞 {hotline}</a>
            <a href={`mailto:${email}`} className="btn-outline-gold">✉️ {email}</a>
          </div>
        </div>
      </div>
    </>
  );
}
