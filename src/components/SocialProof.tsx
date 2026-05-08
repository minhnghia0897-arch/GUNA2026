"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { products } from "@/data/products";

const NAMES = [
  "Nguyễn Mai Anh",
  "Trần Quốc Hưng",
  "Lê Thị Hồng Ngọc",
  "Phạm Tuấn Đạt",
  "Hoàng Thanh Thảo",
  "Đỗ Minh Khôi",
  "Vũ Hà My",
  "Bùi Đức Phúc",
  "Cao Thanh Tùng",
  "Trịnh Linh Chi",
];

const CITIES = ["TP.HCM", "Hà Nội", "Đà Nẵng", "Hải Phòng", "Cần Thơ", "Nha Trang", "Vũng Tàu"];
const SKIP_PREFIXES = ["/checkout", "/admin"];

const FIRST_DELAY_MS = 6000;
const MIN_GAP_MS = 15000;
const MAX_GAP_MS = 28000;
const VISIBLE_MS = 5500;

type Notice = {
  id: number;
  name: string;
  city: string;
  productName: string;
  productImage: string;
  productSlug: string;
  minutesAgo: number;
};

let nextId = 1;

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function SocialProof() {
  const pathname = usePathname();
  const [notice, setNotice] = useState<Notice | null>(null);
  const skip = SKIP_PREFIXES.some((p) => pathname.startsWith(p));

  useEffect(() => {
    if (skip) return;

    let visibleTimer: ReturnType<typeof setTimeout> | undefined;
    let nextTimer: ReturnType<typeof setTimeout> | undefined;

    const showNext = () => {
      const product = pickRandom(products);
      setNotice({
        id: nextId++,
        name: pickRandom(NAMES),
        city: pickRandom(CITIES),
        productName: product.name,
        productImage: product.image,
        productSlug: product.slug,
        minutesAgo: Math.floor(Math.random() * 14) + 1,
      });
      visibleTimer = setTimeout(() => {
        setNotice(null);
        const gap = MIN_GAP_MS + Math.random() * (MAX_GAP_MS - MIN_GAP_MS);
        nextTimer = setTimeout(showNext, gap);
      }, VISIBLE_MS);
    };

    nextTimer = setTimeout(showNext, FIRST_DELAY_MS);

    return () => {
      if (visibleTimer) clearTimeout(visibleTimer);
      if (nextTimer) clearTimeout(nextTimer);
      setNotice(null);
    };
  }, [skip]);

  if (skip || !notice) return null;

  return (
    <div className="hidden sm:block fixed left-4 bottom-32 md:left-6 md:bottom-24 z-30 max-w-xs animate-slide-up-fade">
      <a
        href={`/products/${notice.productSlug}`}
        className="flex items-center gap-3 bg-white rounded-xl shadow-xl shadow-burgundy/10 border border-gold/10 p-3 hover:shadow-2xl transition-all"
      >
        <div className="relative w-12 h-12 rounded-lg bg-cream overflow-hidden flex-shrink-0">
          <Image src={notice.productImage} alt="" fill sizes="48px" className="object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-500 mb-0.5">
            <span className="text-burgundy font-medium">{notice.name}</span>
            <span className="text-gray-400"> · {notice.city}</span>
          </p>
          <p className="text-xs text-gray-700 line-clamp-1">vừa mua <span className="font-medium">{notice.productName}</span></p>
          <p className="text-[10px] text-gray-400 mt-0.5">{notice.minutesAgo} phút trước · ✓ Đã xác minh</p>
        </div>
      </a>
    </div>
  );
}
