"use server";

import { revalidatePath } from "next/cache";
import { assertStaff } from "@/lib/admin-action";
import { revalidateStorefront } from "@/app/actions";

export type PolicyUpdatePayload = { slug: string; title: string; content: string | null };
export type PolicyActionResult = { ok: true } | { ok: false; error: string };

export async function updatePolicy(id: string, payload: PolicyUpdatePayload): Promise<PolicyActionResult> {
  const { supabase, error: authErr } = await assertStaff();
  if (authErr) return { ok: false, error: authErr };

  const { error } = await supabase.from("policies").update(payload).eq("id", id);
  if (error) return { ok: false, error: "Lưu thất bại: " + error.message };

  await revalidateStorefront("policies");
  revalidatePath("/admin/settings/policies");
  return { ok: true };
}
