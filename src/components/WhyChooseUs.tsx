import { fetchSectionsByPage } from "@/lib/supabase/cms";

const ICONS: Record<string, React.ReactNode> = {
  shield: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  gem: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
    </svg>
  ),
  package: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
};

export default async function WhyChooseUs() {
  const sections = await fetchSectionsByPage("home");
  const reasons = sections.filter((s) => s.section_key.startsWith("why_"));

  if (reasons.length === 0) return null;

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-gold text-sm font-normal tracking-[0.3em] uppercase mb-3">Ưu Điểm</p>
          <h2 className="font-serif text-3xl sm:text-4xl text-burgundy mb-4">Tại Sao Chọn Chúng Tôi</h2>
          <div className="w-20 h-[1px] bg-gold mx-auto" />
        </div>

        <div className="grid md:grid-cols-3 gap-10">
          {reasons.map((r) => (
            <div key={r.id} className="text-center group">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-gold/20 to-gold/5 border-2 border-gold/30 flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-white transition-all duration-500">
                {(r.subtitle && ICONS[r.subtitle]) ?? ICONS.shield}
              </div>
              <h3 className="font-serif text-lg text-burgundy mb-3">{r.title}</h3>
              <p className="text-gray-700 font-medium text-sm leading-relaxed max-w-xs mx-auto">{r.content}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
