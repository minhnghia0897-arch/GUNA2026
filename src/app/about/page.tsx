import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { absUrl, buildOg, buildTwitter } from "@/lib/seo";
import { fetchPolicy, fetchSiteSettings } from "@/lib/supabase/cms";
import { IconArrowRight, IconLeaf, IconShield, IconGem } from "@/components/icons";

export const revalidate = 300;

function renderMarkdown(md: string): string {
  const lines = md.split("\n");
  const out: string[] = [];
  let inList = false;
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      if (inList) { out.push("</ul>"); inList = false; }
      out.push("");
      continue;
    }
    if (line.startsWith("## ")) {
      if (inList) { out.push("</ul>"); inList = false; }
      out.push(`<h2 class="font-serif text-2xl sm:text-3xl text-burgundy mb-4 mt-10">${escape(line.slice(3))}</h2>`);
    } else if (line.startsWith("- ")) {
      if (!inList) { out.push('<ul class="list-disc pl-6 space-y-2 marker:text-gold">'); inList = true; }
      out.push(`<li>${formatInline(line.slice(2))}</li>`);
    } else {
      if (inList) { out.push("</ul>"); inList = false; }
      out.push(`<p class="leading-relaxed mb-4">${formatInline(line)}</p>`);
    }
  }
  if (inList) out.push("</ul>");
  return out.join("\n");
}

function formatInline(s: string): string {
  return escape(s).replace(/\*\*(.+?)\*\*/g, '<strong class="text-burgundy font-bold">$1</strong>');
}

function escape(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export async function generateMetadata(): Promise<Metadata> {
  const policy = await fetchPolicy("about");
  const title = policy?.title ?? "Về Chúng Tôi";
  const desc = "Câu chuyện, sứ mệnh và giá trị cốt lõi của GUNA GIFT - thương hiệu quà tặng cao cấp Việt Nam.";
  return {
    title,
    description: desc,
    alternates: { canonical: absUrl("/about") },
    openGraph: buildOg({ title, description: desc, path: "/about" }),
    twitter: buildTwitter({ title, description: desc }),
  };
}

export default async function AboutPage() {
  const [policy, settings] = await Promise.all([fetchPolicy("about"), fetchSiteSettings()]);
  if (!policy) notFound();

  const shopName = settings?.shop_name ?? "GUNA GIFT";

  return (
    <>
      <section className="bg-gradient-to-br from-burgundy via-burgundy-900 to-burgundy-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 rounded-full border border-gold/30" />
          <div className="absolute bottom-0 right-10 w-96 h-96 rounded-full border border-gold/20" />
          <div className="absolute top-1/2 left-1/3 w-48 h-48 rounded-full bg-gold/10" />
        </div>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 text-center">
          <p className="text-gold text-xs sm:text-sm tracking-[0.4em] uppercase font-medium mb-4">
            Hành trình {shopName}
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl mb-6 leading-tight">
            {policy.title}
          </h1>
          <div className="w-20 h-[2px] bg-gold mx-auto mb-6" />
          <p className="text-white/80 text-base sm:text-lg max-w-2xl mx-auto font-medium leading-relaxed">
            Nơi tinh hoa truyền thống gặp gỡ chất lượng hiện đại — mỗi sản phẩm là một câu chuyện được kể bằng sự tận tâm.
          </p>
        </div>
      </section>

      <section className="bg-cream py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { Icon: IconLeaf, title: "100% Thiên Nhiên", desc: "Nguyên liệu tinh tuyển từ tự nhiên" },
              { Icon: IconShield, title: "Cam Kết Chất Lượng", desc: "Đạt chuẩn an toàn thực phẩm quốc tế" },
              { Icon: IconGem, title: "Trải Nghiệm Sang Trọng", desc: "Tinh tế trong từng chi tiết" },
            ].map((v, i) => {
              const Icon = v.Icon;
              return (
                <div key={i} className="bg-white rounded-2xl border border-gold/10 p-6 text-center hover:shadow-lg hover:shadow-burgundy/5 transition-shadow">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold">
                    <Icon className="w-7 h-7" strokeWidth={1.25} />
                  </div>
                  <h3 className="font-serif text-lg text-burgundy mb-2">{v.title}</h3>
                  <p className="text-sm text-gray-700">{v.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div
          className="text-gray-700 text-base leading-relaxed [&_h2:first-child]:mt-0"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(policy.content ?? "") }}
        />

        <div className="mt-16 pt-10 border-t border-gold/10 text-center">
          <p className="text-sm text-gray-500 mb-6">
            Cập nhật ngày {new Date(policy.updated_at).toLocaleDateString("vi-VN")}
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/products" className="btn-gold">
              Khám phá sản phẩm
              <IconArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/#contact" className="btn-outline-gold">
              Liên hệ với chúng tôi
            </Link>
          </div>
        </div>
      </article>
    </>
  );
}
