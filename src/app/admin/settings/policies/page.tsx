import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import PoliciesClient from "./PoliciesClient";
import type { DbPolicy } from "@/lib/supabase/cms-types";

export const dynamic = "force-dynamic";

export default async function AdminPoliciesPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("policies").select("*").order("position");
  return (
    <div className="space-y-5">
      <div>
        <Link href="/admin/settings" className="text-xs text-burgundy hover:text-gold">
          ← Cài đặt
        </Link>
        <h1 className="font-serif text-2xl text-burgundy mt-1">Chính sách</h1>
        <p className="text-sm text-gray-500 mt-1">
          Sửa các trang: Chính sách giao hàng, đổi trả, bảo mật, điều khoản. Hỗ trợ Markdown nhẹ (tiêu đề ##, list -, **bold**).
        </p>
      </div>
      <PoliciesClient initial={(data as DbPolicy[]) ?? []} />
    </div>
  );
}
