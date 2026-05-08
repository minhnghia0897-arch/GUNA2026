const KEY = "farmo-recently-viewed";
const MAX = 10;

export function getRecentlyViewed(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function pushRecentlyViewed(slug: string) {
  if (typeof window === "undefined") return;
  try {
    const cur = getRecentlyViewed().filter((s) => s !== slug);
    cur.unshift(slug);
    const next = cur.slice(0, MAX);
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
}
