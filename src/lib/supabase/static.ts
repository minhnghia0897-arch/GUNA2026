import { createClient } from "@supabase/supabase-js";

export function createStaticClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );
}

export async function fetchProductSlugsStatic(): Promise<string[]> {
  const supabase = createStaticClient();
  const { data } = await supabase.from("products").select("slug").eq("is_visible", true);
  return (data ?? []).map((r: { slug: string }) => r.slug);
}
