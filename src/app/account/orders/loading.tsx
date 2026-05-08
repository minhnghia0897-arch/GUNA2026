import PageHeader from "@/components/PageHeader";
import { SkeletonBox } from "@/components/Skeleton";

export default function Loading() {
  return (
    <>
      <PageHeader title="Đơn Hàng Của Tôi" crumbs={[{ label: "Trang Chủ", href: "/" }, { label: "Đơn Hàng" }]} />
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gold/10 p-6 flex justify-between gap-4">
            <SkeletonBox className="h-5 w-32" />
            <SkeletonBox className="h-5 w-24" />
            <SkeletonBox className="h-5 w-20" />
          </div>
        ))}
      </div>
    </>
  );
}
