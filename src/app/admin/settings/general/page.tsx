import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import GeneralSettingsForm from "./GeneralSettingsForm";
import type { DbSiteSettings } from "@/lib/supabase/cms-types";

export const dynamic = "force-dynamic";

export default async function GeneralSettingsPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("site_settings").select("*").eq("id", "main").maybeSingle();
  const settings = (data as DbSiteSettings) ?? null;

  if (!settings) {
    return (
      <div className="p-8 text-center text-gray-500">
        Chưa có thông tin shop. Vui lòng tạo trong Supabase Dashboard.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <Link href="/admin/settings" className="text-xs text-burgundy hover:text-gold">
          ← Cài đặt
        </Link>
        <h1 className="font-serif text-2xl text-burgundy mt-1">Thông tin shop</h1>
        <p className="text-sm text-gray-500 mt-1">
          Tên cửa hàng, logo, hotline, địa chỉ, social media — hiển thị trên header/footer toàn site.
        </p>
      </div>
      <GeneralSettingsForm initial={settings} />
    </div>
  );
}
