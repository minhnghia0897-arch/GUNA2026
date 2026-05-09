"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { revalidateStorefront } from "@/app/actions";

export type ArticlePayload = {
  slug: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  category: string | null;
  image: string | null;
  read_time: string | null;
  status: "published" | "draft" | "archived";
  published_at: string;
};

export type ArticleActionResult = { ok: true; id?: string } | { ok: false; error: string };

async function assertStaff() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase: null, error: "Bạn chưa đăng nhập" as const };
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (!profile || (profile.role !== "admin" && profile.role !== "staff")) {
    return { supabase: null, error: "Tài khoản không có quyền quản trị" as const };
  }
  return { supabase, error: null };
}

export async function createArticle(payload: ArticlePayload): Promise<ArticleActionResult> {
  const { supabase, error: authErr } = await assertStaff();
  if (authErr) return { ok: false, error: authErr };

  const { data, error } = await supabase!.from("articles").insert(payload).select("id").single();
  if (error) return { ok: false, error: "Tạo thất bại: " + error.message };

  await revalidateStorefront("blog");
  revalidatePath("/admin/articles");
  return { ok: true, id: data?.id };
}

export async function updateArticle(id: string, payload: ArticlePayload): Promise<ArticleActionResult> {
  const { supabase, error: authErr } = await assertStaff();
  if (authErr) return { ok: false, error: authErr };

  const { error, count } = await supabase!.from("articles").update(payload, { count: "exact" }).eq("id", id);
  if (error) return { ok: false, error: "Cập nhật thất bại: " + error.message };
  if (count === 0) return { ok: false, error: "Không tìm thấy bài viết hoặc không có quyền" };

  await revalidateStorefront("blog");
  revalidatePath("/admin/articles");
  revalidatePath(`/admin/articles/${id}`);
  return { ok: true, id };
}

export async function deleteArticle(id: string): Promise<ArticleActionResult> {
  const { supabase, error: authErr } = await assertStaff();
  if (authErr) return { ok: false, error: authErr };

  const { error } = await supabase!.from("articles").delete().eq("id", id);
  if (error) return { ok: false, error: "Xóa thất bại: " + error.message };

  await revalidateStorefront("blog");
  revalidatePath("/admin/articles");
  return { ok: true, id };
}
