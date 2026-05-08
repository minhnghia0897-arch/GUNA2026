import { createClient } from "@/lib/supabase/server";
import VouchersClient from "./VouchersClient";

export const dynamic = "force-dynamic";

export default async function AdminVouchersPage() {
  const supabase = await createClient();
  const { data: vouchers } = await supabase
    .from("vouchers")
    .select("*")
    .order("created_at", { ascending: false });

  return <VouchersClient initialVouchers={vouchers ?? []} />;
}
