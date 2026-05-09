"use server";

import { revalidatePath } from "next/cache";
import { assertStaff } from "@/lib/admin-action";
import { revalidateStorefront } from "@/app/actions";
import type { DbFaq } from "@/lib/supabase/cms-types";

export type FaqPayload = Omit<DbFaq, "id">;
export type FaqActionResult =
  | { ok: true; faq?: DbFaq }
  | { ok: false; error: string };

export async function createFaq(payload: FaqPayload): Promise<FaqActionResult> {
  const { supabase, error: authErr } = await assertStaff();
  if (authErr) return { ok: false, error: authErr };
  const { data, error } = await supabase.from("faqs").insert(payload).select().single();
  if (error) return { ok: false, error: "Tạo thất bại: " + error.message };
  await revalidateStorefront("policies");
  revalidatePath("/admin/settings/faq");
  return { ok: true, faq: data as DbFaq };
}

export async function updateFaq(id: string, payload: FaqPayload): Promise<FaqActionResult> {
  const { supabase, error: authErr } = await assertStaff();
  if (authErr) return { ok: false, error: authErr };
  const { data, error } = await supabase.from("faqs").update(payload).eq("id", id).select().single();
  if (error) return { ok: false, error: "Cập nhật thất bại: " + error.message };
  await revalidateStorefront("policies");
  revalidatePath("/admin/settings/faq");
  return { ok: true, faq: data as DbFaq };
}

export async function deleteFaq(id: string): Promise<FaqActionResult> {
  const { supabase, error: authErr } = await assertStaff();
  if (authErr) return { ok: false, error: authErr };
  const { error } = await supabase.from("faqs").delete().eq("id", id);
  if (error) return { ok: false, error: "Xóa thất bại: " + error.message };
  await revalidateStorefront("policies");
  revalidatePath("/admin/settings/faq");
  return { ok: true };
}
