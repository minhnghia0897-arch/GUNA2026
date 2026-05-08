import PageHeader from "@/components/PageHeader";
import { SkeletonBox, SkeletonText } from "@/components/Skeleton";

export default function Loading() {
  return (
    <>
      <PageHeader title="Blog & Tin Tức" crumbs={[{ label: "Trang Chủ", href: "/" }, { label: "Blog" }]} />
      <div className="max-w-7xl mx-auto px-4 py-12 grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gold/10 overflow-hidden">
            <SkeletonBox className="aspect-[4/3] rounded-none" />
            <div className="p-6 space-y-3">
              <SkeletonBox className="h-4 w-1/3" />
              <SkeletonBox className="h-5 w-3/4" />
              <SkeletonText lines={3} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
