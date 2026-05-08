import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import FaqClient from "./FaqClient";
import type { DbFaq } from "@/lib/supabase/cms-types";

export const dynamic = "force-dynamic";

export default async function AdminFaqPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("faqs").select("*").order("category").order("position");
  return (
    <div className="space-y-5">
      <div>
        <Link href="/admin/settings" className="text-xs text-burgundy hover:text-gold">
          ← Cài đặt
        </Link>
        <h1 className="font-serif text-2xl text-burgundy mt-1">FAQ</h1>
        <p className="text-sm text-gray-500 mt-1">Câu hỏi thường gặp - hiển thị trên trang /faq.</p>
      </div>
      <FaqClient initial={(data as DbFaq[]) ?? []} />
    </div>
  );
}
