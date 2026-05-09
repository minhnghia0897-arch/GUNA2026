"use server";

import { revalidatePath } from "next/cache";
import { assertStaff } from "@/lib/admin-action";
import { revalidateStorefront } from "@/app/actions";
import type { DbSiteSection } from "@/lib/supabase/cms-types";

export type SectionPayload = Omit<DbSiteSection, "id">;
export type SectionActionResult = { ok: true } | { ok: false; error: string };

export async function updateSection(id: string, payload: SectionPayload): Promise<SectionActionResult> {
  const { supabase, error: authErr } = await assertStaff();
  if (authErr) return { ok: false, error: authErr };

  const { error } = await supabase.from("site_sections").update(payload).eq("id", id);
  if (error) return { ok: false, error: "Lưu thất bại: " + error.message };

  await revalidateStorefront("all");
  revalidatePath("/admin/settings/sections");
  return { ok: true };
}
