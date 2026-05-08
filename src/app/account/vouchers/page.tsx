import { createClient } from "@/lib/supabase/server";
import VouchersClient from "./VouchersClient";
import type { DbVoucher } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export default async function VouchersPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("vouchers")
    .select("*")
    .order("is_active", { ascending: false })
    .order("ends_at", { ascending: true, nullsFirst: false });

  return <VouchersClient vouchers={(data as DbVoucher[]) ?? []} />;
}
