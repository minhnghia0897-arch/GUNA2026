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
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name, email")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || (profile.role !== "admin" && profile.role !== "staff")) {
    redirect("/?error=unauthorized");
  }

  return (
    <AdminShell user={{ name: profile.full_name ?? "Admin", email: profile.email ?? "", role: profile.role }}>
      {children}
    </AdminShell>
  );
}
