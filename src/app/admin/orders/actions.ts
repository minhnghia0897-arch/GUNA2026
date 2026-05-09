"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const VALID_NEXT: Record<string, string[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["shipping", "cancelled"],
  shipping: ["delivered", "cancelled"],
  delivered: ["cancelled"],
  cancelled: [],
};

export type QuickStatusResult = { ok: true } | { ok: false; error: string };

export async function quickUpdateOrderStatus(
  orderId: string,
  currentStatus: string,
  nextStatus: string
): Promise<QuickStatusResult> {
  if (!VALID_NEXT[currentStatus]?.includes(nextStatus)) {
    return { ok: false, error: "Trạng thái không hợp lệ" };
  }

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

  const { error, count } = await supabase
    .from("orders")
    .update({ status: nextStatus }, { count: "exact" })
    .eq("id", orderId);

  if (error) {
    const raw = error.message ?? "";
    if (raw.includes("INVALID_STATUS_TRANSITION")) {
      return { ok: false, error: "Trạng thái không hợp lệ (DB rejected)" };
    }
    return { ok: false, error: "Cập nhật thất bại: " + raw };
  }

  if (count === 0) {
    return { ok: false, error: "Không có quyền cập nhật đơn này" };
  }

  revalidatePath("/admin/orders");
  return { ok: true };
}
