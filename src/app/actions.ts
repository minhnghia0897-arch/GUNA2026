"use server";

import { revalidatePath } from "next/cache";

const STOREFRONT_PATHS = ["/", "/products", "/blog", "/faq", "/about"];

export async function revalidateStorefront(scope?: "all" | "products" | "blog" | "policies" | "settings") {
  if (!scope || scope === "all") {
    STOREFRONT_PATHS.forEach((p) => revalidatePath(p, "page"));
    revalidatePath("/policies/[slug]", "page");
    revalidatePath("/products/[slug]", "page");
    revalidatePath("/blog/[slug]", "page");
    return;
  }

  if (scope === "products") {
    revalidatePath("/", "page");
    revalidatePath("/products", "page");
    revalidatePath("/products/[slug]", "page");
  } else if (scope === "blog") {
    revalidatePath("/", "page");
    revalidatePath("/blog", "page");
    revalidatePath("/blog/[slug]", "page");
  } else if (scope === "policies") {
    revalidatePath("/policies/[slug]", "page");
    revalidatePath("/about", "page");
    revalidatePath("/faq", "page");
  } else if (scope === "settings") {
    revalidatePath("/", "layout");
  }
}
