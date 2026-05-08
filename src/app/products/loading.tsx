import PageHeader from "@/components/PageHeader";
import { SkeletonGrid, SkeletonBox } from "@/components/Skeleton";

export default function Loading() {
  return (
    <>
      <PageHeader title="Bộ Sưu Tập Sản Phẩm" crumbs={[{ label: "Trang Chủ", href: "/" }, { label: "Sản Phẩm" }]} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="hidden lg:block lg:w-64 flex-shrink-0">
            <div className="bg-white border border-gold/10 rounded-xl p-6 space-y-3">
              <SkeletonBox className="h-5 w-32 mb-3" />
              {Array.from({ length: 5 }).map((_, i) => (
                <SkeletonBox key={i} className="h-9 w-full" />
              ))}
            </div>
          </aside>
          <div className="flex-1">
            <div className="flex justify-between mb-6">
              <SkeletonBox className="h-4 w-32" />
              <SkeletonBox className="h-9 w-40" />
            </div>
            <SkeletonGrid count={6} />
          </div>
        </div>
      </div>
    </>
  );
}
