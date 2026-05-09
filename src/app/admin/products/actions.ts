"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { revalidateStorefront } from "@/app/actions";

type Spec = { label: string; value: string };

export type ProductPayload = {
  slug: string;
  name: string;
  short_desc: string | null;
  description: string | null;
  category_slug: string;
  price: number;
  original_price: number | null;
  badge: string | null;
  image: string | null;
  gallery: string[];
  specs: Spec[];
  stock_count: number;
  is_visible: boolean;
};

export type ProductActionResult = { ok: true; id?: string } | { ok: false; error: string };

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

export async function createProduct(payload: ProductPayload): Promise<ProductActionResult> {
  const { supabase, error: authErr } = await assertStaff();
  if (authErr) return { ok: false, error: authErr };

  const { data, error } = await supabase!.from("products").insert(payload).select("id").single();
  if (error) return { ok: false, error: "Tạo thất bại: " + error.message };

  await revalidateStorefront("products");
  revalidatePath("/admin/products");
  return { ok: true, id: data?.id };
}

export async function updateProduct(id: string, payload: ProductPayload): Promise<ProductActionResult> {
  const { supabase, error: authErr } = await assertStaff();
  if (authErr) return { ok: false, error: authErr };

  const { error, count } = await supabase!.from("products").update(payload, { count: "exact" }).eq("id", id);
  if (error) return { ok: false, error: "Cập nhật thất bại: " + error.message };
  if (count === 0) return { ok: false, error: "Không tìm thấy sản phẩm hoặc không có quyền" };

  await revalidateStorefront("products");
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}`);
  return { ok: true, id };
}

export async function deleteProduct(id: string): Promise<ProductActionResult & { mode?: "hard" | "soft" }> {
  const { supabase, error: authErr } = await assertStaff();
  if (authErr) return { ok: false, error: authErr };

  const { count, error: countErr } = await supabase!
    .from("order_items")
    .select("id", { count: "exact", head: true })
    .eq("product_id", id);
  if (countErr) return { ok: false, error: "Kiểm tra dependency thất bại: " + countErr.message };

  if ((count ?? 0) > 0) {
    const { error: hideErr } = await supabase!.from("products").update({ is_visible: false }).eq("id", id);
    if (hideErr) return { ok: false, error: "Ẩn thất bại: " + hideErr.message };
    await revalidateStorefront("products");
    revalidatePath("/admin/products");
    return { ok: true, id, mode: "soft" };
  }

  const { error } = await supabase!.from("products").delete().eq("id", id);
  if (error) return { ok: false, error: "Xóa thất bại: " + error.message };
  await revalidateStorefront("products");
  revalidatePath("/admin/products");
  return { ok: true, id, mode: "hard" };
}

export async function checkProductOrderDependency(id: string): Promise<{ count: number; error?: string }> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("order_items")
    .select("id", { count: "exact", head: true })
    .eq("product_id", id);
  if (error) return { count: 0, error: error.message };
  return { count: count ?? 0 };
}
