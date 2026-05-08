import { fetchSectionsByPage } from "@/lib/supabase/cms";

export default async function AboutSection() {
  const sections = await fetchSectionsByPage("home");
  const intro = sections.find((s) => s.section_key === "about");
  const pillars = sections.filter((s) => s.section_key.startsWith("about_pillar_"));

  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-gold text-sm font-normal tracking-[0.3em] uppercase mb-3">
            {intro?.eyebrow ?? "Về Chúng Tôi"}
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl text-burgundy mb-4 whitespace-pre-line">
            {intro?.title ?? "GUNA GIFT Thiên Nhiên Cao Cấp"}
          </h2>
          <div className="w-20 h-[1px] bg-gold mx-auto mb-6" />
          <p className="text-gray-700 font-medium max-w-2xl mx-auto leading-relaxed">
            {intro?.content ?? "Chúng tôi tự hào mang đến những sản phẩm chất lượng hàng đầu."}
          </p>
        </div>

        {pillars.length > 0 && (
          <div className="grid md:grid-cols-3 gap-8">
            {pillars.map((p) => (
              <div
                key={p.id}
                className="group relative bg-gradient-to-b from-cream to-white border border-gold/10 rounded-2xl p-8 text-center hover:shadow-xl hover:shadow-burgundy/5 transition-all duration-500"
              >
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-burgundy/5 flex items-center justify-center text-4xl group-hover:bg-burgundy/10 transition-colors">
                  {p.subtitle ?? "🏺"}
                </div>
                <h3 className="font-serif text-xl text-burgundy mb-3 whitespace-pre-line leading-snug">
                  {p.title}
                </h3>
                <p className="text-gray-700 font-medium text-sm leading-relaxed">{p.content}</p>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-gold group-hover:w-1/2 transition-all duration-500" />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
