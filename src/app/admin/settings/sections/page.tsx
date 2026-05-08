import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import SectionsClient from "./SectionsClient";
import type { DbSiteSection } from "@/lib/supabase/cms-types";

export const dynamic = "force-dynamic";

export default async function SectionsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("site_sections")
    .select("*")
    .order("page_slug")
    .order("position");

  return (
    <div className="space-y-5">
      <div>
        <Link href="/admin/settings" className="text-xs text-burgundy hover:text-gold">
          ← Cài đặt
        </Link>
        <h1 className="font-serif text-2xl text-burgundy mt-1">Content blocks</h1>
        <p className="text-sm text-gray-500 mt-1">
          Sửa các khối nội dung trên homepage và các trang khác (giới thiệu, ưu điểm, video, intro testimonial, contact...).
        </p>
      </div>
      <SectionsClient initial={(data as DbSiteSection[]) ?? []} />
    </div>
  );
}
