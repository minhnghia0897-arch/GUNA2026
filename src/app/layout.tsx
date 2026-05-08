import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/context/ToastContext";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { SiteConfigProvider } from "@/context/SiteConfigContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import ToastContainer from "@/components/ToastContainer";
import StickyContact from "@/components/StickyContact";
import NewsletterPopup from "@/components/NewsletterPopup";
import BackToTop from "@/components/BackToTop";
import MobileBottomNav from "@/components/MobileBottomNav";
import CountdownBanner from "@/components/CountdownBanner";
import SocialProof from "@/components/SocialProof";
import ExitIntent from "@/components/ExitIntent";
import JsonLd from "@/components/JsonLd";
import { SITE, absUrl, buildOg, buildTwitter } from "@/lib/seo";
import { fetchSiteSettings } from "@/lib/supabase/cms";

const TITLE = `${SITE.fullName} - ${SITE.tagline}`;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await fetchSiteSettings();
  const title = settings ? `${settings.shop_name} - ${settings.shop_tagline}` : TITLE;
  const description = settings?.shop_description ?? SITE.description;

  return {
    metadataBase: new URL(SITE.url),
    title: { default: title, template: `%s | ${settings?.shop_name ?? SITE.name}` },
    description,
    applicationName: settings?.shop_name ?? SITE.fullName,
    keywords: settings?.meta_keywords ?? ["GUNA GIFT", "quà cưới", "mật ong", "quà tặng"],
    authors: [{ name: settings?.shop_name ?? SITE.fullName }],
    creator: settings?.shop_name ?? SITE.fullName,
    publisher: settings?.shop_name ?? SITE.fullName,
    alternates: { canonical: SITE.url, languages: { "vi-VN": SITE.url } },
    openGraph: buildOg({ title, description, path: "/", type: "website" }),
    twitter: buildTwitter({ title, description }),
    robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
    icons: { icon: settings?.favicon_url ?? "/favicon.ico", apple: "/apple-touch-icon.png" },
    formatDetection: { email: false, telephone: false },
  };
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const settings = await fetchSiteSettings();

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: settings?.shop_name ?? SITE.fullName,
    url: SITE.url,
    description: settings?.shop_description ?? SITE.description,
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${SITE.url}/search?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: settings?.shop_name ?? SITE.fullName,
    url: SITE.url,
    logo: absUrl(settings?.logo_url ?? "/images/product-1.svg"),
    description: settings?.shop_description ?? SITE.description,
    contactPoint: {
      "@type": "ContactPoint",
      telephone: settings?.hotline ?? SITE.phone,
      email: settings?.email ?? SITE.email,
      contactType: "customer service",
      areaServed: "VN",
      availableLanguage: ["Vietnamese"],
    },
    sameAs: [settings?.facebook_url, settings?.instagram_url, settings?.youtube_url].filter(Boolean),
  };

  return (
    <html lang="vi">
      <body className="antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-burgundy focus:text-white focus:px-4 focus:py-2 focus:rounded"
        >
          Bỏ qua đến nội dung chính
        </a>
        <JsonLd data={[websiteJsonLd, organizationJsonLd]} />
        <SiteConfigProvider value={settings}>
          <ToastProvider>
            <CartProvider>
              <WishlistProvider>
                <CountdownBanner />
                <Header />
                <main id="main-content">{children}</main>
                <Footer />
                <CartDrawer />
                <ToastContainer />
                <StickyContact />
                <BackToTop />
                <MobileBottomNav />
                <SocialProof />
                <NewsletterPopup />
                <ExitIntent />
              </WishlistProvider>
            </CartProvider>
          </ToastProvider>
        </SiteConfigProvider>
      </body>
    </html>
  );
}
