import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import BannersClient from "./BannersClient";
import type { DbBanner } from "@/lib/supabase/cms-types";

export const dynamic = "force-dynamic";

export default async function BannersPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("banners").select("*").order("type").order("position");
  return (
    <div className="space-y-5">
      <div>
        <Link href="/admin/settings" className="text-xs text-burgundy hover:text-gold">
          ← Cài đặt
        </Link>
        <h1 className="font-serif text-2xl text-burgundy mt-1">Banners</h1>
        <p className="text-sm text-gray-500 mt-1">
          Hero homepage, banner mobile, banner danh mục, strip khuyến mãi.
        </p>
      </div>
      <BannersClient initial={(data as DbBanner[]) ?? []} />
    </div>
  );
}
