"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/context/ToastContext";
import ImageUpload from "@/components/admin/ImageUpload";
import type { DbSiteSection } from "@/lib/supabase/cms-types";
import { revalidateStorefront } from "@/app/actions";

export default function SectionsClient({ initial }: { initial: DbSiteSection[] }) {
  const router = useRouter();
  const toast = useToast();
  const [sections, setSections] = useState<DbSiteSection[]>(initial);
  const [editing, setEditing] = useState<DbSiteSection | null>(null);

  const grouped = sections.reduce((acc: Record<string, DbSiteSection[]>, s) => {
    if (!acc[s.page_slug]) acc[s.page_slug] = [];
    acc[s.page_slug].push(s);
    return acc;
  }, {});

  const save = async (s: DbSiteSection) => {
    const supabase = createClient();
    const { id, ...rest } = s;
    const { error } = await supabase.from("site_sections").update(rest).eq("id", id);
    if (error) {
      toast.error("Lưu thất bại: " + error.message);
      return;
    }
    setSections((arr) => arr.map((x) => (x.id === s.id ? s : x)));
    setEditing(null);
    toast.success("Đã lưu section");
    await revalidateStorefront("all");
    router.refresh();
  };

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([page, items]) => (
        <div key={page} className="bg-white rounded-xl border border-gold/10 overflow-hidden">
          <div className="px-5 py-3 bg-cream border-b border-gold/10 flex items-center justify-between">
            <h2 className="font-serif text-lg text-burgundy">Trang: {page}</h2>
            <span className="text-xs text-gray-500">{items.length} blocks</span>
          </div>
          <div className="divide-y divide-gold/5">
            {items.map((s) => (
              <div key={s.id} className="px-5 py-4">
                {editing?.id === s.id ? (
                  <SectionEditor
                    section={editing}
                    onChange={setEditing}
                    onSave={() => save(editing)}
                    onCancel={() => setEditing(null)}
                  />
                ) : (
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 uppercase tracking-wider">{s.section_key}</p>
                      <p className="font-medium text-burgundy mt-0.5 line-clamp-1">
                        {s.title || s.eyebrow || "(Không tiêu đề)"}
                      </p>
                      {s.content && <p className="text-sm text-gray-500 line-clamp-2 mt-1">{s.content}</p>}
                      {!s.is_visible && (
                        <span className="inline-block mt-2 text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                          Đã ẩn
                        </span>
                      )}
                    </div>
                    <button onClick={() => setEditing(s)} className="text-xs text-burgundy hover:text-gold flex-shrink-0">
                      Sửa →
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function SectionEditor({
  section,
  onChange,
  onSave,
  onCancel,
}: {
  section: DbSiteSection;
  onChange: (s: DbSiteSection) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  const update = <K extends keyof DbSiteSection>(k: K, v: DbSiteSection[K]) =>
    onChange({ ...section, [k]: v });

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-400 font-mono">{section.section_key}</p>
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-600 mb-1 block">Eyebrow (chữ nhỏ trên đầu)</label>
          <input value={section.eyebrow ?? ""} onChange={(e) => update("eyebrow", e.target.value || null)} className="input-field text-sm" />
        </div>
        <div>
          <label className="text-xs text-gray-600 mb-1 block">Tiêu đề</label>
          <input value={section.title ?? ""} onChange={(e) => update("title", e.target.value || null)} className="input-field text-sm" />
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs text-gray-600 mb-1 block">Subtitle / Icon</label>
          <input value={section.subtitle ?? ""} onChange={(e) => update("subtitle", e.target.value || null)} className="input-field text-sm" />
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs text-gray-600 mb-1 block">Nội dung</label>
          <textarea value={section.content ?? ""} onChange={(e) => update("content", e.target.value || null)} className="input-field text-sm" rows={3} />
        </div>
        <div className="sm:col-span-2">
          <ImageUpload
            value={section.image_url ?? ""}
            onChange={(url) => update("image_url", url || null)}
            folder={`sections/${section.page_slug}`}
            label="Hình ảnh (tùy chọn)"
            aspectRatio="auto"
          />
        </div>
        <div>
          <label className="text-xs text-gray-600 mb-1 block">Link URL</label>
          <input value={section.link_url ?? ""} onChange={(e) => update("link_url", e.target.value || null)} className="input-field text-sm font-mono" />
        </div>
        <div>
          <label className="text-xs text-gray-600 mb-1 block">Label link</label>
          <input value={section.link_label ?? ""} onChange={(e) => update("link_label", e.target.value || null)} className="input-field text-sm" />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={section.is_visible} onChange={(e) => update("is_visible", e.target.checked)} />
        <span>Hiển thị</span>
      </label>
      <div className="flex gap-3 pt-2">
        <button onClick={onSave} className="btn-gold text-sm">Lưu</button>
        <button onClick={onCancel} className="btn-outline-gold text-sm">Hủy</button>
      </div>
    </div>
  );
}
