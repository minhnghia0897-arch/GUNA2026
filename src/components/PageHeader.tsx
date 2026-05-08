import Link from "next/link";

type Crumb = { label: string; href?: string };

export default function PageHeader({
  title,
  subtitle,
  crumbs,
}: {
  title: string;
  subtitle?: string;
  crumbs?: Crumb[];
}) {
  return (
    <section className="bg-gradient-to-br from-burgundy to-burgundy-950 py-12 md:py-16 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 right-10 w-72 h-72 rounded-full border border-gold/20" />
        <div className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full bg-burgundy-900/30" />
      </div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {crumbs && (
          <nav className="flex items-center justify-center gap-2 text-xs text-white/50 mb-4">
            {crumbs.map((c, i) => (
              <span key={i} className="flex items-center gap-2">
                {c.href ? (
                  <Link href={c.href} className="hover:text-gold">{c.label}</Link>
                ) : (
                  <span className="text-gold">{c.label}</span>
                )}
                {i < crumbs.length - 1 && <span>/</span>}
              </span>
            ))}
          </nav>
        )}
        <h1 className="font-serif text-3xl md:text-4xl text-white mb-3">{title}</h1>
        {subtitle && <p className="text-white/60 font-light text-sm md:text-base max-w-2xl mx-auto">{subtitle}</p>}
        <div className="w-20 h-[1px] bg-gold mx-auto mt-6" />
      </div>
    </section>
  );
}
