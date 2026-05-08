import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { email?: string; password?: string } | null;
  if (!body?.email || !body?.password) {
    return NextResponse.json({ error: "Email và mật khẩu là bắt buộc" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: body.email.trim(),
    password: body.password,
  });

  if (error || !data.user) {
    const msg = error?.message === "Invalid login credentials" ? "Email hoặc mật khẩu không đúng" : (error?.message ?? "Đăng nhập thất bại");
    return NextResponse.json({ error: msg }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();

  if (!profile || (profile.role !== "admin" && profile.role !== "staff")) {
    await supabase.auth.signOut({ scope: "local" });
    return NextResponse.json({ error: "Tài khoản không có quyền quản trị" }, { status: 403 });
  }

  return NextResponse.json({ ok: true });
}
