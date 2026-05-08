"use client";

import { createContext, useContext, ReactNode } from "react";
import type { DbSiteSettings } from "@/lib/supabase/cms-types";

const SiteConfigContext = createContext<DbSiteSettings | null>(null);

export function SiteConfigProvider({
  value,
  children,
}: {
  value: DbSiteSettings | null;
  children: ReactNode;
}) {
  return <SiteConfigContext.Provider value={value}>{children}</SiteConfigContext.Provider>;
}

export function useSiteConfig() {
  return useContext(SiteConfigContext);
}
