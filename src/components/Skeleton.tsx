export function SkeletonBox({ className = "" }: { className?: string }) {
  return <div className={`bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%] animate-shimmer rounded ${className}`} />;
}

export function SkeletonProductCard() {
  return (
    <div className="bg-white rounded-xl overflow-hidden border border-gray-100">
      <SkeletonBox className="aspect-square rounded-none" />
      <div className="p-4 space-y-2">
        <SkeletonBox className="h-3 w-3/4" />
        <SkeletonBox className="h-3 w-1/2" />
        <div className="flex justify-between items-center pt-2">
          <SkeletonBox className="h-4 w-1/3" />
          <SkeletonBox className="h-9 w-9 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonProductCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonText({ lines = 3, className = "" }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonBox key={i} className={`h-3 ${i === lines - 1 ? "w-2/3" : "w-full"}`} />
      ))}
    </div>
  );
}
