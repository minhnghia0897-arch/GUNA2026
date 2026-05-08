"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { useToast } from "./ToastContext";
import { createClient } from "@/lib/supabase/client";

type WishlistContextValue = {
  items: string[];
  toggle: (slug: string, productName?: string) => void;
  has: (slug: string) => boolean;
  count: number;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);
const STORAGE_KEY = "farmo-wishlist";

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const slugToIdRef = useRef<Map<string, string>>(new Map());
  const toast = useToast();

  const fetchWishlist = useCallback(async (uid: string) => {
    const supabase = createClient();
    const { data } = await supabase
      .from("wishlists")
      .select("product_id, products(slug)")
      .eq("user_id", uid);
    if (!data) return [] as string[];
    const slugs: string[] = [];
    const map = slugToIdRef.current;
    for (const row of data as unknown as Array<{ product_id: string; products: { slug: string } | { slug: string }[] | null }>) {
      const productRel = Array.isArray(row.products) ? row.products[0] : row.products;
      const slug = productRel?.slug;
      if (slug) {
        slugs.push(slug);
        map.set(slug, row.product_id);
      }
    }
    return slugs;
  }, []);

  const resolveSlugId = useCallback(async (slug: string): Promise<string | null> => {
    const cached = slugToIdRef.current.get(slug);
    if (cached) return cached;
    const supabase = createClient();
    const { data } = await supabase.from("products").select("id").eq("slug", slug).maybeSingle();
    if (!data) return null;
    slugToIdRef.current.set(slug, data.id as string);
    return data.id as string;
  }, []);

  useEffect(() => {
    const supabase = createClient();
    let mounted = true;

    const readLocal = (): string[] => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? (JSON.parse(raw) as string[]) : [];
      } catch {
        return [];
      }
    };

    const syncForUser = async (uid: string) => {
      const local = readLocal();
      const dbItems = await fetchWishlist(uid);
      if (!mounted) return;

      const toMerge = local.filter((s) => !dbItems.includes(s));
      if (toMerge.length > 0) {
        for (const slug of toMerge) {
          const pid = await resolveSlugId(slug);
          if (pid) {
            await supabase.from("wishlists").upsert(
              { user_id: uid, product_id: pid },
              { onConflict: "user_id,product_id" }
            );
          }
        }
        if (!mounted) return;
        setItems(await fetchWishlist(uid));
        try { localStorage.removeItem(STORAGE_KEY); } catch {}
      } else {
        setItems(dbItems);
      }
    };

    const init = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!mounted) return;
        if (user) {
          setUserId(user.id);
          await syncForUser(user.id);
        } else {
          setItems(readLocal());
        }
      } catch (err) {
        console.error("[WishlistContext] init failed", err);
        if (mounted) setItems(readLocal());
      } finally {
        if (mounted) setHydrated(true);
      }
    };

    init();

    const { data: sub } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      try {
        const newUid = session?.user?.id ?? null;
        setUserId(newUid);
        if (newUid) {
          if (event === "SIGNED_IN") {
            await syncForUser(newUid);
          } else {
            setItems(await fetchWishlist(newUid));
          }
        } else {
          setItems([]);
        }
      } catch (err) {
        console.error("[WishlistContext] auth change handler failed", err);
      }
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [fetchWishlist, resolveSlugId]);

  useEffect(() => {
    if (!hydrated || userId) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items, hydrated, userId]);

  const toggle = useCallback(
    async (slug: string, productName?: string) => {
      const exists = items.includes(slug);
      if (exists) {
        setItems((cur) => cur.filter((s) => s !== slug));
        toast.info(productName ? `Đã bỏ "${productName}" khỏi yêu thích` : "Đã bỏ khỏi yêu thích");
      } else {
        setItems((cur) => [...cur, slug]);
        toast.success(productName ? `Đã thêm "${productName}" vào yêu thích` : "Đã thêm vào yêu thích");
      }

      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      const uid = user?.id ?? userId;
      if (uid) {
        const pid = await resolveSlugId(slug);
        if (!pid) return;
        if (exists) {
          await supabase.from("wishlists").delete().eq("user_id", uid).eq("product_id", pid);
        } else {
          await supabase.from("wishlists").upsert(
            { user_id: uid, product_id: pid },
            { onConflict: "user_id,product_id" }
          );
        }
      }
    },
    [items, userId, resolveSlugId, toast]
  );

  const value: WishlistContextValue = {
    items,
    toggle,
    has: (slug) => items.includes(slug),
    count: items.length,
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
