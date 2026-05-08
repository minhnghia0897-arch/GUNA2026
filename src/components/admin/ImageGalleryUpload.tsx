"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/context/ToastContext";

const MAX_FILE_BYTES = 5 * 1024 * 1024;

export default function ImageGalleryUpload({
  value,
  onChange,
  bucket = "product-images",
  folder = "gallery",
  label = "Thư viện ảnh",
  hint,
  max = 10,
}: {
  value: string[];
  onChange: (urls: string[]) => void;
  bucket?: "product-images" | "site-assets";
  folder?: string;
  label?: string;
  hint?: string;
  max?: number;
}) {
  const toast = useToast();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const fileRef = useRef<HTMLInputElement>(null);

  const uploadFiles = async (files: FileList) => {
    const all = Array.from(files);
    const remaining = max - value.length;
    if (all.length > remaining) {
      toast.error(`Chỉ được thêm tối đa ${remaining} ảnh nữa (giới hạn ${max})`);
      return;
    }
    const arr: File[] = [];
    for (const f of all) {
      if (f.size > MAX_FILE_BYTES) {
        toast.error(`"${f.name}" vượt quá 5MB, bỏ qua`);
        continue;
      }
      arr.push(f);
    }
    if (arr.length === 0) return;

    setUploading(true);
    setProgress({ done: 0, total: arr.length });
    const uploaded: string[] = [];
    try {
      const supabase = createClient();
      for (let i = 0; i < arr.length; i++) {
        const file = arr[i];
        const dot = file.name.lastIndexOf(".");
        const ext = dot >= 0 ? file.name.slice(dot + 1).toLowerCase() : "jpg";
        const path = `${folder ? folder + "/" : ""}${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}.${ext}`;
        const { error } = await supabase.storage.from(bucket).upload(path, file, {
          cacheControl: "3600",
          upsert: false,
        });
        if (error) {
          console.error("[ImageGalleryUpload] upload error", { bucket, path, error });
          toast.error(`Upload thất bại "${file.name}": ${error.message}`);
          continue;
        }
        const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path);
        uploaded.push(publicUrl);
        setProgress({ done: i + 1, total: arr.length });
      }

      if (uploaded.length > 0) {
        onChange([...value, ...uploaded]);
        toast.success(`Đã upload ${uploaded.length} ảnh`);
      }
    } catch (err) {
      console.error("[ImageGalleryUpload] threw", err);
      toast.error("Lỗi upload: " + (err instanceof Error ? err.message : "không xác định"));
    } finally {
      setUploading(false);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadFiles(e.target.files);
    }
    e.target.value = "";
  };

  const removeAt = (idx: number) => {
    onChange(value.filter((_, i) => i !== idx));
  };

  const move = (idx: number, dir: -1 | 1) => {
    const next = [...value];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    onChange(next);
  };

  return (
    <div>
      <label className="text-sm text-gray-700 mb-2 block">
        {label} <span className="text-xs text-gray-400">({value.length}/{max})</span>
      </label>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {value.map((url, i) => (
          <div key={url + i} className="relative group aspect-square rounded-lg overflow-hidden border border-gold/10 bg-cream">
            <Image src={url} alt="" fill sizes="160px" className="object-cover" />
            {i === 0 && (
              <span className="absolute top-1 left-1 bg-gold text-burgundy-950 text-[9px] font-bold px-1.5 py-0.5 rounded">
                CHÍNH
              </span>
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  className="w-7 h-7 bg-white text-burgundy rounded text-xs disabled:opacity-30 hover:bg-gold"
                  title="Di chuyển lên"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => move(i, 1)}
                  disabled={i === value.length - 1}
                  className="w-7 h-7 bg-white text-burgundy rounded text-xs disabled:opacity-30 hover:bg-gold"
                  title="Di chuyển xuống"
                >
                  ↓
                </button>
              </div>
              <button
                type="button"
                onClick={() => removeAt(i)}
                className="text-[10px] bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
              >
                Xóa
              </button>
            </div>
          </div>
        ))}

        {value.length < max && (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="aspect-square rounded-lg border-2 border-dashed border-gold/30 hover:border-gold bg-cream/50 hover:bg-cream flex flex-col items-center justify-center text-burgundy text-xs gap-1 disabled:opacity-50"
          >
            {uploading ? (
              <>
                <div className="animate-spin w-5 h-5 border-2 border-gold border-t-transparent rounded-full" />
                <span>{progress.done}/{progress.total}</span>
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
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        onChange={onFileChange}
        className="hidden"
      />

      <p className="text-xs text-gray-400 mt-2">
        {hint ?? `Ảnh đầu tiên là ảnh chính. Hover để di chuyển hoặc xóa. Max ${max} ảnh, mỗi ảnh ≤ 5MB.`}
      </p>
    </div>
  );
}
