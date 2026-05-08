import Link from "next/link";
import { fetchSectionsByPage, fetchSiteSettings } from "@/lib/supabase/cms";
import { IconPhone, IconMail, IconMapPin, IconClock, IconArrowRight } from "@/components/icons";

export default async function ContactSection() {
  const [sections, settings] = await Promise.all([fetchSectionsByPage("home"), fetchSiteSettings()]);
  const block = sections.find((s) => s.section_key === "contact_block");

  const eyebrow = block?.eyebrow ?? "Liên Hệ";
  const title = block?.title ?? "Bạn có thắc mắc hay cần hỗ trợ thêm?";
  const content = block?.content ?? "Liên hệ với chúng tôi để được tư vấn miễn phí.";

  const items = [
    { Icon: IconPhone, label: "Hotline", value: settings?.hotline ?? "0901 234 567" },
    { Icon: IconMail, label: "Email", value: settings?.email ?? "info@farmo.vn" },
    { Icon: IconMapPin, label: "Địa chỉ", value: settings?.address_line ?? "—" },
    { Icon: IconClock, label: "Giờ mở cửa", value: settings?.business_hours ?? "T2 - T7: 8:00 - 20:00" },
  ];

  return (
    <section id="contact" className="py-20 bg-gradient-to-br from-burgundy to-burgundy-950 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-72 h-72 rounded-full border border-gold/5" />
        <div className="absolute bottom-10 right-10 w-56 h-56 rounded-full border border-gold/5" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-gold text-sm font-normal tracking-[0.3em] uppercase mb-3">{eyebrow}</p>
            <h2 className="font-serif text-3xl sm:text-4xl text-white mb-4 leading-snug whitespace-pre-line">
              {title}
            </h2>
            <p className="text-white/60 font-normal text-sm leading-relaxed mb-8">{content}</p>
            <Link href="/faq" className="btn-gold text-sm">
              Xem Câu Hỏi Thường Gặp
              <IconArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-6">
            {items.map((item, i) => {
              const Icon = item.Icon;
              return (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center text-gold flex-shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-white/40 text-xs font-normal uppercase tracking-wider mb-1">{item.label}</p>
                    <p className="text-white font-normal text-sm">{item.value}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
