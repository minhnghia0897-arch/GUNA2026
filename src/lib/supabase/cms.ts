import { createClient as createServerClient } from "./server";
import { createStaticClient } from "./static";
import type {
  DbSiteSettings,
  DbBanner,
  DbSiteSection,
  DbPolicy,
  DbFaq,
} from "./cms-types";

export async function fetchSiteSettings(): Promise<DbSiteSettings | null> {
  const supabase = await createServerClient();
  const { data } = await supabase.from("site_settings").select("*").eq("id", "main").maybeSingle();
  return (data as DbSiteSettings | null) ?? null;
}

export async function fetchActiveBanners(type?: DbBanner["type"]): Promise<DbBanner[]> {
  const supabase = await createServerClient();
  let q = supabase
    .from("banners")
    .select("*")
    .eq("is_active", true)
    .order("position");
  if (type) q = q.eq("type", type);
  const { data } = await q;
  const now = Date.now();
  return ((data as DbBanner[]) ?? []).filter((b) => {
    if (b.starts_at && new Date(b.starts_at).getTime() > now) return false;
    if (b.ends_at && new Date(b.ends_at).getTime() < now) return false;
    return true;
  });
}

export async function fetchSectionsByPage(pageSlug: string): Promise<DbSiteSection[]> {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from("site_sections")
    .select("*")
    .eq("page_slug", pageSlug)
    .eq("is_visible", true)
    .order("position");
  return (data as DbSiteSection[]) ?? [];
}

export async function fetchPolicy(slug: string): Promise<DbPolicy | null> {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from("policies")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  return (data as DbPolicy | null) ?? null;
}

export async function fetchAllPolicies(): Promise<DbPolicy[]> {
  const supabase = await createServerClient();
  const { data } = await supabase.from("policies").select("*").order("position");
  return (data as DbPolicy[]) ?? [];
}

export async function fetchFaqs(): Promise<DbFaq[]> {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from("faqs")
    .select("*")
    .eq("is_visible", true)
    .order("position");
  return (data as DbFaq[]) ?? [];
}

export function groupFaqsByCategory(faqs: DbFaq[]): { category: string; items: DbFaq[] }[] {
  const map = new Map<string, DbFaq[]>();
  faqs.forEach((f) => {
    if (!map.has(f.category)) map.set(f.category, []);
    map.get(f.category)!.push(f);
  });
  return Array.from(map.entries()).map(([category, items]) => ({ category, items }));
}

// Static client variants for build-time generateMetadata
export async function fetchSiteSettingsStatic(): Promise<DbSiteSettings | null> {
  const supabase = createStaticClient();
  const { data } = await supabase.from("site_settings").select("*").eq("id", "main").maybeSingle();
  return (data as DbSiteSettings | null) ?? null;
}
