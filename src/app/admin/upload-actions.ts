"use server";

import { assertStaff } from "@/lib/admin-action";

export type UploadResult = { ok: true; url: string } | { ok: false; error: string };

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const ALLOWED_BUCKETS = new Set(["product-images", "site-assets"]);
const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
  "image/gif",
]);

export async function uploadImageAction(formData: FormData): Promise<UploadResult> {
  const file = formData.get("file");
  const bucket = String(formData.get("bucket") ?? "");
  const folder = String(formData.get("folder") ?? "");

  if (!(file instanceof File)) {
    return { ok: false, error: "Không có file" };
  }
  if (!ALLOWED_BUCKETS.has(bucket)) {
    return { ok: false, error: "Bucket không hợp lệ" };
  }
  if (file.size > MAX_FILE_BYTES) {
    return { ok: false, error: `File "${file.name}" vượt quá 5MB` };
  }
  if (file.type && !ALLOWED_MIME.has(file.type)) {
    return { ok: false, error: `Định dạng "${file.type}" không được hỗ trợ` };
  }

  const { supabase, error: authErr } = await assertStaff();
  if (authErr) return { ok: false, error: authErr };

  const dot = file.name.lastIndexOf(".");
  const ext = dot >= 0 ? file.name.slice(dot + 1).toLowerCase() : "jpg";
  const safeFolder = folder.replace(/^\/+|\/+$/g, "");
  const path = `${safeFolder ? safeFolder + "/" : ""}${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const buffer = Buffer.from(await file.arrayBuffer());
  const { error: upErr } = await supabase.storage.from(bucket).upload(path, buffer, {
    contentType: file.type || "image/jpeg",
    cacheControl: "3600",
    upsert: false,
  });
  if (upErr) {
    return { ok: false, error: "Upload thất bại: " + upErr.message };
  }

  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path);
  return { ok: true, url: publicUrl };
}
