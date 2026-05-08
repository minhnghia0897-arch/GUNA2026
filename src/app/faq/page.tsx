import type { Metadata } from "next";
import { absUrl, buildOg, buildTwitter } from "@/lib/seo";
import { fetchFaqs, groupFaqsByCategory } from "@/lib/supabase/cms";
import { fetchSiteSettings } from "@/lib/supabase/cms";
import JsonLd from "@/components/JsonLd";
import FaqClient from "./FaqClient";

const TITLE = "Câu Hỏi Thường Gặp";
const DESC = "Tìm câu trả lời nhanh cho các thắc mắc về đặt hàng, vận chuyển, sản phẩm, thanh toán và đổi trả tại GUNA GIFT.";

export const revalidate = 300;

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: absUrl("/faq") },
  openGraph: buildOg({ title: TITLE, description: DESC, path: "/faq" }),
  twitter: buildTwitter({ title: TITLE, description: DESC }),
};

export default async function FAQPage() {
  const [faqs, settings] = await Promise.all([fetchFaqs(), fetchSiteSettings()]);
  const grouped = groupFaqsByCategory(faqs);

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };

  return (
    <>
      <JsonLd data={faqJsonLd} />
      <FaqClient
        groups={grouped.map((g) => ({
          category: g.category,
          items: g.items.map((i) => ({ q: i.question, a: i.answer })),
        }))}
        hotline={settings?.hotline ?? "0901 234 567"}
        email={settings?.email ?? "gunaquatet@gmail.com"}
      />
    </>
  );
}
