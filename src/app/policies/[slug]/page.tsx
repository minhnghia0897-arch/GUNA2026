import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { absUrl, buildOg, buildTwitter } from "@/lib/seo";
import { fetchPolicy } from "@/lib/supabase/cms";
import PageHeader from "@/components/PageHeader";

export const revalidate = 300;

function renderMarkdown(md: string): string {
  // Lightweight markdown renderer (h2, ul, bold, paragraphs)
  const lines = md.split("\n");
  const out: string[] = [];
  let inList = false;
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      if (inList) {
        out.push("</ul>");
        inList = false;
      }
      out.push("");
      continue;
    }
    if (line.startsWith("## ")) {
      if (inList) { out.push("</ul>"); inList = false; }
      out.push(`<h2 class="font-serif text-2xl text-burgundy mb-3 mt-6">${escapeHtml(line.slice(3))}</h2>`);
    } else if (line.startsWith("- ")) {
      if (!inList) { out.push('<ul class="list-disc pl-6 space-y-2">'); inList = true; }
      out.push(`<li>${formatInline(line.slice(2))}</li>`);
    } else {
      if (inList) { out.push("</ul>"); inList = false; }
      out.push(`<p class="leading-relaxed">${formatInline(line)}</p>`);
    }
  }
  if (inList) out.push("</ul>");
  return out.join("\n");
}

function formatInline(s: string): string {
  return escapeHtml(s).replace(/\*\*(.+?)\*\*/g, '<strong class="text-burgundy">$1</strong>');
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const policy = await fetchPolicy(slug);
  if (!policy) return { title: "Không tìm thấy" };
  const desc = policy.title + " - GUNA GIFT";
  return {
    title: policy.title,
    description: desc,
    alternates: { canonical: absUrl(`/policies/${slug}`) },
    openGraph: buildOg({ title: policy.title, description: desc, path: `/policies/${slug}` }),
    twitter: buildTwitter({ title: policy.title, description: desc }),
  };
}

export default async function PolicyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const policy = await fetchPolicy(slug);
  if (!policy) notFound();

  return (
    <>
      <PageHeader title={policy.title} crumbs={[{ label: "Trang Chủ", href: "/" }, { label: policy.title }]} />
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <p className="text-xs text-gray-400 mb-6">
          Cập nhật ngày {new Date(policy.updated_at).toLocaleDateString("vi-VN")}
        </p>
        <div
          className="text-gray-600 font-light leading-relaxed text-sm space-y-3"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(policy.content ?? "") }}
        />
      </article>
    </>
  );
}
