"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/context/ToastContext";
import ImageUpload from "@/components/admin/ImageUpload";
import type { DbSiteSettings } from "@/lib/supabase/cms-types";
import { revalidateStorefront } from "@/app/actions";

export default function GeneralSettingsForm({ initial }: { initial: DbSiteSettings }) {
  const router = useRouter();
  const toast = useToast();
  const [form, setForm] = useState<DbSiteSettings>(initial);
  const [saving, setSaving] = useState(false);

  const update = <K extends keyof DbSiteSettings>(k: K, v: DbSiteSettings[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from("site_settings").update(form).eq("id", "main");
    setSaving(false);
    if (error) {
      toast.error("Lưu thất bại: " + error.message);
      return;
    }
    toast.success("Đã lưu thay đổi");
    await revalidateStorefront("settings");
    router.refresh();
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <Section title="Thương hiệu">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Tên shop *">
            <input required value={form.shop_name} onChange={(e) => update("shop_name", e.target.value)} className="input-field" />
          </Field>
          <Field label="Tagline">
            <input value={form.shop_tagline} onChange={(e) => update("shop_tagline", e.target.value)} className="input-field" />
          </Field>
          <Field label="Logo mark (1 chữ)" hint="Hiển thị nếu chưa có logo URL">
            <input maxLength={2} value={form.logo_mark} onChange={(e) => update("logo_mark", e.target.value)} className="input-field font-serif text-center" />
          </Field>
          <Field label="Mô tả shop">
            <textarea value={form.shop_description ?? ""} onChange={(e) => update("shop_description", e.target.value)} className="input-field" rows={2} />
          </Field>
        </div>
        <ImageUpload
          value={form.logo_url ?? ""}
          onChange={(url) => update("logo_url", url || null)}
          folder="logo"
          label="Logo"
          hint="PNG/SVG, kích thước khuyến nghị 200x200px"
          aspectRatio="square"
        />
        <ImageUpload
          value={form.favicon_url ?? ""}
          onChange={(url) => update("favicon_url", url || null)}
          folder="favicon"
          label="Favicon"
          hint="32x32 hoặc 64x64px, ICO/PNG"
          aspectRatio="square"
        />
      </Section>

      <Section title="Liên hệ">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Hotline">
            <input value={form.hotline} onChange={(e) => update("hotline", e.target.value)} className="input-field" />
          </Field>
          <Field label="Email">
            <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} className="input-field" />
          </Field>
          <Field label="Địa chỉ" wide>
            <input value={form.address_line} onChange={(e) => update("address_line", e.target.value)} className="input-field" />
          </Field>
          <Field label="Giờ làm việc" wide>
            <input value={form.business_hours} onChange={(e) => update("business_hours", e.target.value)} className="input-field" placeholder="T2 - T7: 8:00 - 20:00" />
          </Field>
        </div>
      </Section>

      <Section title="Mạng xã hội">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Facebook URL">
            <input type="url" value={form.facebook_url ?? ""} onChange={(e) => update("facebook_url", e.target.value || null)} className="input-field" placeholder="https://facebook.com/..." />
          </Field>
          <Field label="Instagram URL">
            <input type="url" value={form.instagram_url ?? ""} onChange={(e) => update("instagram_url", e.target.value || null)} className="input-field" />
          </Field>
          <Field label="YouTube URL">
            <input type="url" value={form.youtube_url ?? ""} onChange={(e) => update("youtube_url", e.target.value || null)} className="input-field" />
          </Field>
          <Field label="Zalo URL">
            <input type="url" value={form.zalo_url ?? ""} onChange={(e) => update("zalo_url", e.target.value || null)} className="input-field" placeholder="https://zalo.me/0901234567" />
          </Field>
          <Field label="Messenger URL">
            <input type="url" value={form.messenger_url ?? ""} onChange={(e) => update("messenger_url", e.target.value || null)} className="input-field" placeholder="https://m.me/yourpage" />
          </Field>
        </div>
      </Section>

      <Section title="Hero homepage">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Eyebrow text">
            <input value={form.hero_eyebrow} onChange={(e) => update("hero_eyebrow", e.target.value)} className="input-field" />
          </Field>
          <div />
          <Field label="CTA chính - Text">
            <input value={form.hero_cta_primary} onChange={(e) => update("hero_cta_primary", e.target.value)} className="input-field" />
          </Field>
          <Field label="CTA chính - Link">
            <input value={form.hero_cta_primary_link} onChange={(e) => update("hero_cta_primary_link", e.target.value)} className="input-field font-mono text-sm" />
          </Field>
          <Field label="CTA phụ - Text">
            <input value={form.hero_cta_secondary} onChange={(e) => update("hero_cta_secondary", e.target.value)} className="input-field" />
          </Field>
          <Field label="CTA phụ - Link">
            <input value={form.hero_cta_secondary_link} onChange={(e) => update("hero_cta_secondary_link", e.target.value)} className="input-field font-mono text-sm" />
          </Field>
        </div>
      </Section>

      <Section title="Thông báo & Vận chuyển">
        <Field label="Banner thông báo (cuộn ngang trên top)">
          <textarea value={form.announcement_text ?? ""} onChange={(e) => update("announcement_text", e.target.value)} className="input-field" rows={2} />
        </Field>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.announcement_active} onChange={(e) => update("announcement_active", e.target.checked)} />
          <span>Hiển thị banner thông báo</span>
        </label>
        <Field label="Ngưỡng miễn phí ship (VNĐ)">
          <input type="number" min="0" value={form.freeship_threshold} onChange={(e) => update("freeship_threshold", parseInt(e.target.value) || 0)} className="input-field" />
        </Field>
      </Section>

      <div className="sticky bottom-0 bg-white py-4 border-t border-gold/10 flex gap-3">
        <button type="submit" disabled={saving} className="btn-gold">
          {saving ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
        <button type="button" onClick={() => router.push("/admin/settings")} className="btn-outline-gold">
          Hủy
        </button>
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gold/10 p-5 space-y-4">
      <h2 className="font-serif text-lg text-burgundy">{title}</h2>
      {children}
    </div>
  );
}

function Field({
  label,
  hint,
  wide,
  children,
}: {
  label: string;
  hint?: string;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={wide ? "sm:col-span-2" : ""}>
      <label className="text-sm text-gray-700 mb-1 block">{label}</label>
      {children}
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}
