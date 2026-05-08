import type { Metadata } from "next";
import { Suspense } from "react";
import { absUrl, buildOg, buildTwitter } from "@/lib/seo";
import PageHeader from "@/components/PageHeader";
import SearchClient from "./SearchClient";

const TITLE = "Tìm Kiếm Sản Phẩm";
const DESC = "Tìm kiếm sản phẩm FarMơ - hộp quà cưới, mật ong, set quà tặng cao cấp.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: absUrl("/search") },
  openGraph: buildOg({ title: TITLE, description: DESC, path: "/search" }),
  twitter: buildTwitter({ title: TITLE, description: DESC }),
  robots: { index: false, follow: true },
};

export default function SearchPage() {
  return (
    <>
      <PageHeader title="Tìm Kiếm" crumbs={[{ label: "Trang Chủ", href: "/" }, { label: "Tìm Kiếm" }]} />
      <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-12 text-center text-gray-400">Đang tải...</div>}>
        <SearchClient />
      </Suspense>
    </>
  );
}
