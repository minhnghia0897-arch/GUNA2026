import { createClient } from "@/lib/supabase/server";

/**
 * Helper for admin server actions: verify role admin/staff before mutation.
 * Call at the top of every server action that writes data.
 */
export async function assertStaff() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { supabase: null as never, error: "Bạn chưa đăng nhập" as const };
  }
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile || (profile.role !== "admin" && profile.role !== "staff")) {
    return { supabase: null as never, error: "Tài khoản không có quyền quản trị" as const };
  }
  return { supabase, error: null };
}
