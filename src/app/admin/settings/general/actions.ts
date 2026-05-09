"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { revalidateStorefront } from "@/app/actions";
import type { DbSiteSettings } from "@/lib/supabase/cms-types";

export type GeneralActionResult = { ok: true } | { ok: false; error: string };

async function assertStaff() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase: null, error: "Bạn chưa đăng nhập" as const };
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (!profile || (profile.role !== "admin" && profile.role !== "staff")) {
    return { supabase: null, error: "Tài khoản không có quyền quản trị" as const };
  }
  return { supabase, error: null };
}

export async function updateSiteSettings(payload: DbSiteSettings): Promise<GeneralActionResult> {
  const { supabase, error: authErr } = await assertStaff();
  if (authErr) return { ok: false, error: authErr };

  const { id: _id, ...updates } = payload;
  const { error } = await supabase!.from("site_settings").update(updates).eq("id", "main");
  if (error) return { ok: false, error: "Lưu thất bại: " + error.message };

  await revalidateStorefront("settings");
  revalidatePath("/admin/settings/general");
  return { ok: true };
}
