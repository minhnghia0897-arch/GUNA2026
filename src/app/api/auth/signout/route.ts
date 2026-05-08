import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();

  const url = new URL(request.url);
  const raw = url.searchParams.get("redirect");
  const redirectTo = raw && raw.startsWith("/") && !raw.startsWith("//") ? raw : "/";
  return NextResponse.redirect(new URL(redirectTo, url.origin), { status: 303 });
}
