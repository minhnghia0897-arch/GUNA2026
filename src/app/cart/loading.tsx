import PageHeader from "@/components/PageHeader";
import { SkeletonBox } from "@/components/Skeleton";

export default function Loading() {
  return (
    <>
      <PageHeader title="Giỏ Hàng" crumbs={[{ label: "Trang Chủ", href: "/" }, { label: "Giỏ Hàng" }]} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white border border-gold/10 rounded-xl p-6 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-4 py-3 border-b border-gray-100">
              <SkeletonBox className="w-20 h-20 rounded-lg" />
              <div className="flex-1 space-y-2">
                <SkeletonBox className="h-3 w-3/4" />
                <SkeletonBox className="h-3 w-1/3" />
                <SkeletonBox className="h-8 w-32" />
              </div>
            </div>
          ))}
        </div>
        <div className="bg-white border border-gold/10 rounded-xl p-6 space-y-3 h-fit">
          <SkeletonBox className="h-5 w-40 mb-2" />
          <SkeletonBox className="h-10 w-full" />
          <SkeletonBox className="h-3 w-full" />
          <SkeletonBox className="h-3 w-2/3" />
          <SkeletonBox className="h-12 w-full mt-4" />
        </div>
      </div>
    </>
  );
}
