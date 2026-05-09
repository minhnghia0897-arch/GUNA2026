"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { revalidateStorefront } from "@/app/actions";

export type CategoryPayload = { slug: string; label: string; position: number };
export type CategoryRow = CategoryPayload & { id: string };

export type CategoryActionResult =
  | { ok: true; category?: CategoryRow }
  | { ok: false; error: string };

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

export async function createCategory(payload: CategoryPayload): Promise<CategoryActionResult> {
  const { supabase, error: authErr } = await assertStaff();
  if (authErr) return { ok: false, error: authErr };

  const { data, error } = await supabase!.from("categories").insert(payload).select().single();
  if (error) return { ok: false, error: "Tạo thất bại: " + error.message };

  await revalidateStorefront("products");
  revalidatePath("/admin/categories");
  return { ok: true, category: data as CategoryRow };
}

export async function updateCategory(id: string, payload: CategoryPayload): Promise<CategoryActionResult> {
  const { supabase, error: authErr } = await assertStaff();
  if (authErr) return { ok: false, error: authErr };

  const { data, error } = await supabase!.from("categories").update(payload).eq("id", id).select().single();
  if (error) return { ok: false, error: "Cập nhật thất bại: " + error.message };

  await revalidateStorefront("products");
  revalidatePath("/admin/categories");
  return { ok: true, category: data as CategoryRow };
}

export async function deleteCategory(id: string): Promise<CategoryActionResult> {
  const { supabase, error: authErr } = await assertStaff();
  if (authErr) return { ok: false, error: authErr };

  const { error } = await supabase!.from("categories").delete().eq("id", id);
  if (error) return { ok: false, error: "Xóa thất bại: " + error.message };

  await revalidateStorefront("products");
  revalidatePath("/admin/categories");
  return { ok: true };
}
