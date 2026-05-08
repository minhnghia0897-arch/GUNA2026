"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/context/ToastContext";

const MAX_FILE_BYTES = 5 * 1024 * 1024;

export default function ImageUpload({
  value,
  onChange,
  bucket = "site-assets",
  folder = "",
  label = "Hình ảnh",
  hint,
  aspectRatio = "square",
}: {
  value: string;
  onChange: (url: string) => void;
  bucket?: "site-assets" | "product-images";
  folder?: string;
  label?: string;
  hint?: string;
  aspectRatio?: "square" | "video" | "auto";
}) {
  const toast = useToast();
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (file.size > MAX_FILE_BYTES) {
      toast.error("Kích thước file tối đa 5MB");
      return;
    }
    setUploading(true);
    const supabase = createClient();
    const dot = file.name.lastIndexOf(".");
    const ext = dot >= 0 ? file.name.slice(dot + 1).toLowerCase() : "jpg";
    const path = `${folder ? folder + "/" : ""}${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage.from(bucket).upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });
    if (error) {
      console.error("[ImageUpload] upload error", { bucket, path, error });
      setUploading(false);
      toast.error("Upload thất bại: " + error.message);
      return;
    }
    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path);
    onChange(publicUrl);
    setUploading(false);
    toast.success("Đã upload ảnh");
  };

  const onPick = () => fileRef.current?.click();

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  };

  const aspectClass =
    aspectRatio === "video" ? "aspect-video" : aspectRatio === "auto" ? "" : "aspect-square";

  return (
    <div>
      <label className="text-sm text-gray-700 mb-2 block">{label}</label>
      <div className="flex gap-3 items-start">
        {value ? (
          <div className={`relative w-32 ${aspectClass} rounded-lg bg-cream overflow-hidden border border-gold/10 flex-shrink-0`}>
            <Image src={value} alt="" fill sizes="128px" className="object-cover" />
          </div>
        ) : (
          <button
            type="button"
            onClick={onPick}
            disabled={uploading}
            className={`w-32 ${aspectClass} rounded-lg border-2 border-dashed border-gold/30 hover:border-gold bg-cream/50 hover:bg-cream flex flex-col items-center justify-center text-burgundy text-xs gap-1 disabled:opacity-50 flex-shrink-0`}
          >
            {uploading ? (
              <>
                <div className="animate-spin w-5 h-5 border-2 border-gold border-t-transparent rounded-full" />
                <span>Đang upload...</span>
              </>
            ) : (
              <>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                </svg>
                <span>Thêm ảnh</span>
              </>
            )}
          </button>
        )}
        <div className="flex-1 space-y-2">
          {value && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onPick}
                disabled={uploading}
                className="text-xs px-3 py-1.5 border border-gold text-burgundy rounded hover:bg-cream disabled:opacity-50"
              >
                {uploading ? "Đang upload..." : "Đổi ảnh"}
              </button>
              <button
                type="button"
                onClick={() => onChange("")}
                className="text-xs text-red-500 hover:text-red-700"
              >
                Xóa
              </button>
            </div>
          )}
          {hint && <p className="text-xs text-gray-400">{hint}</p>}
          <p className="text-xs text-gray-400">Tối đa 5MB. JPG, PNG, WebP.</p>
        </div>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={onFileChange}
        className="hidden"
      />
    </div>
  );
}
