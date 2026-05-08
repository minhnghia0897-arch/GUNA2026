import { SkeletonBox, SkeletonText } from "@/components/Skeleton";

export default function Loading() {
  return (
    <>
      <div className="bg-gradient-to-br from-burgundy to-burgundy-950 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <SkeletonBox className="h-3 w-48 mx-auto mb-4 bg-white/10" />
          <SkeletonBox className="h-8 w-64 mx-auto bg-white/10" />
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          <div>
            <SkeletonBox className="aspect-square rounded-2xl mb-4" />
            <div className="grid grid-cols-3 gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <SkeletonBox key={i} className="aspect-square rounded-lg" />
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <SkeletonBox className="h-3 w-24" />
            <SkeletonBox className="h-8 w-3/4" />
            <SkeletonBox className="h-4 w-48" />
            <SkeletonBox className="h-12 w-1/2" />
            <SkeletonText lines={4} />
            <div className="flex gap-3 pt-6">
              <SkeletonBox className="h-12 flex-1 rounded" />
              <SkeletonBox className="h-12 flex-1 rounded" />
              <SkeletonBox className="h-12 w-12 rounded" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
