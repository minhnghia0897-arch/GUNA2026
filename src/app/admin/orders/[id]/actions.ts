"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type UpdateOrderResult =
  | { ok: true }
  | { ok: false; error: string };

export async function updateOrderStatus(
  orderId: string,
  status: string,
  tracking: string
): Promise<UpdateOrderResult> {
  console.log("[server:updateOrderStatus] start", { orderId, status, tracking });
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "Bạn chưa đăng nhập" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile || (profile.role !== "admin" && profile.role !== "staff")) {
    return { ok: false, error: "Tài khoản không có quyền quản trị" };
  }

  const t0 = Date.now();
  const { error, count } = await supabase
    .from("orders")
    .update({ status, tracking_number: tracking || null }, { count: "exact" })
    .eq("id", orderId);
  console.log(`[server:updateOrderStatus] UPDATE done ${Date.now() - t0}ms`, { error, count });

  if (error) {
    const raw = error.message ?? "";
    if (raw.includes("INVALID_STATUS_TRANSITION")) {
      return { ok: false, error: `Không thể chuyển sang "${status}". Trạng thái không hợp lệ.` };
    }
    return { ok: false, error: "Cập nhật thất bại: " + raw };
  }

  if (count === 0) {
    return { ok: false, error: "Không có quyền cập nhật đơn này (RLS)" };
  }

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
  return { ok: true };
}
