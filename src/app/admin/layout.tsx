import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import AdminShell from "./AdminShell";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Quản trị | GUNA GIFT",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const headerList = await headers();
  const pathname = headerList.get("x-pathname") ?? "";

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const supabase = await createClient();
  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  console.log("[admin-layout] pathname=%s user=%s err=%s", pathname, user?.id ?? "null", userErr?.message ?? "");
  if (!user) {
    console.log("[admin-layout] no user → redirect /admin/login");
    redirect("/admin/login");
  }

  const { data: profile, error: profileErr } = await supabase
    .from("profiles")
    .select("role, full_name, email")
    .eq("id", user.id)
    .maybeSingle();

  console.log("[admin-layout] profile.role=%s err=%s", profile?.role ?? "null", profileErr?.message ?? "");

  if (!profile || (profile.role !== "admin" && profile.role !== "staff")) {
    console.log("[admin-layout] not admin → redirect /?error=unauthorized");
    redirect("/?error=unauthorized");
  }

  return (
    <AdminShell user={{ name: profile.full_name ?? "Admin", email: profile.email ?? "", role: profile.role }}>
      {children}
    </AdminShell>
  );
}
