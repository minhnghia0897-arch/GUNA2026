"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type VoucherPayload = {
  code: string;
  title: string;
  description: string | null;
  discount_type: "percentage" | "fixed" | "freeship";
  value: number;
  min_order: number;
  max_discount: number | null;
  ends_at: string | null;
  is_active: boolean;
};

export type VoucherRow = VoucherPayload & { id: string; used_count: number };

export type VoucherActionResult =
  | { ok: true; voucher: VoucherRow }
  | { ok: true; voucher?: undefined }
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

export async function createVoucher(payload: VoucherPayload): Promise<VoucherActionResult> {
  const { supabase, error: authErr } = await assertStaff();
  if (authErr) return { ok: false, error: authErr };

  const { data, error } = await supabase!
    .from("vouchers")
    .insert({ ...payload, code: payload.code.toUpperCase().trim() })
    .select()
    .single();
  if (error) return { ok: false, error: "Tạo thất bại: " + error.message };

  revalidatePath("/admin/vouchers");
  return { ok: true, voucher: data as VoucherRow };
}

export async function updateVoucher(id: string, payload: VoucherPayload): Promise<VoucherActionResult> {
  const { supabase, error: authErr } = await assertStaff();
  if (authErr) return { ok: false, error: authErr };

  const { data, error } = await supabase!
    .from("vouchers")
    .update({ ...payload, code: payload.code.toUpperCase().trim() })
    .eq("id", id)
    .select()
    .single();
  if (error) return { ok: false, error: "Cập nhật thất bại: " + error.message };
  if (!data) return { ok: false, error: "Không tìm thấy voucher hoặc không có quyền" };

  revalidatePath("/admin/vouchers");
  return { ok: true, voucher: data as VoucherRow };
}

export async function deleteVoucher(id: string): Promise<VoucherActionResult> {
  const { supabase, error: authErr } = await assertStaff();
  if (authErr) return { ok: false, error: authErr };

  const { error } = await supabase!.from("vouchers").delete().eq("id", id);
  if (error) return { ok: false, error: "Xóa thất bại: " + error.message };

  revalidatePath("/admin/vouchers");
  return { ok: true };
}
