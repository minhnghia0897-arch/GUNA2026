"use client";

export default function Pagination({
  current,
  total,
  onChange,
}: {
  current: number;
  total: number;
  onChange: (page: number) => void;
}) {
  if (total <= 1) return null;

  const SIBLINGS = 1;
  const pages: (number | "...")[] = [];
  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= current - SIBLINGS && i <= current + SIBLINGS)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  const go = (p: number) => {
    if (p < 1 || p > total || p === current) return;
    onChange(p);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <nav className="flex items-center justify-center gap-1" aria-label="Phân trang">
      <button
        onClick={() => go(current - 1)}
        disabled={current === 1}
        className="px-3 py-2 text-sm rounded-lg border border-gray-200 hover:border-gold hover:text-gold disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:text-gray-600"
        aria-label="Trang trước"
      >
        ‹
      </button>
      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`dots-${i}`} className="px-2 text-gray-400 text-sm">…</span>
        ) : (
          <button
            key={p}
            onClick={() => go(p)}
            aria-current={p === current ? "page" : undefined}
            className={`min-w-[36px] h-9 text-sm rounded-lg border transition-colors ${
              p === current
                ? "bg-burgundy border-burgundy text-white"
                : "border-gray-200 hover:border-gold hover:text-gold"
            }`}
          >
            {p}
          </button>
        )
      )}
      <button
        onClick={() => go(current + 1)}
        disabled={current === total}
        className="px-3 py-2 text-sm rounded-lg border border-gray-200 hover:border-gold hover:text-gold disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:text-gray-600"
        aria-label="Trang sau"
      >
        ›
      </button>
    </nav>
  );
}
