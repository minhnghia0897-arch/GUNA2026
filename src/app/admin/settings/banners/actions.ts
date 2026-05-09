"use server";

import { revalidatePath } from "next/cache";
import { assertStaff } from "@/lib/admin-action";
import { revalidateStorefront } from "@/app/actions";
import type { DbBanner } from "@/lib/supabase/cms-types";

export type BannerPayload = Omit<DbBanner, "id">;
export type BannerActionResult =
  | { ok: true; banner?: DbBanner }
  | { ok: false; error: string };

export async function createBanner(payload: BannerPayload): Promise<BannerActionResult> {
  const { supabase, error: authErr } = await assertStaff();
  if (authErr) return { ok: false, error: authErr };

  const { data, error } = await supabase.from("banners").insert(payload).select().single();
  if (error) return { ok: false, error: "Tạo thất bại: " + error.message };

  await revalidateStorefront("all");
  revalidatePath("/admin/settings/banners");
  return { ok: true, banner: data as DbBanner };
}

export async function updateBanner(id: string, payload: BannerPayload): Promise<BannerActionResult> {
  const { supabase, error: authErr } = await assertStaff();
  if (authErr) return { ok: false, error: authErr };

  const { data, error } = await supabase.from("banners").update(payload).eq("id", id).select().single();
  if (error) return { ok: false, error: "Cập nhật thất bại: " + error.message };

  await revalidateStorefront("all");
  revalidatePath("/admin/settings/banners");
  return { ok: true, banner: data as DbBanner };
}

export async function deleteBanner(id: string): Promise<BannerActionResult> {
  const { supabase, error: authErr } = await assertStaff();
  if (authErr) return { ok: false, error: authErr };

  const { error } = await supabase.from("banners").delete().eq("id", id);
  if (error) return { ok: false, error: "Xóa thất bại: " + error.message };

  await revalidateStorefront("all");
  revalidatePath("/admin/settings/banners");
  return { ok: true };
}
