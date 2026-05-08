export const SITE = {
  name: "GUNA GIFT",
  fullName: "GUNA GIFT",
  tagline: "Quà Trung Thu & Quà Tết Cao Cấp",
  description:
    "GUNA GIFT - Thương hiệu chuyên cung cấp set quà Trung Thu và Tết Nguyên Đán cao cấp dành cho doanh nghiệp và cá nhân. Thiết kế tinh tế, hương vị truyền thống, đóng gói sang trọng.",
  url: "https://gunagift.vn",
  ogImage: "/images/product-1.svg",
  twitterHandle: "@gunagift",
  locale: "vi_VN",
  phone: "+84868052683",
  email: "gunaquatet@gmail.com",
  address: {
    streetAddress: "84a Ngõ 264 Ngọc Thụy",
    addressLocality: "Long Biên",
    addressRegion: "Hà Nội",
    postalCode: "130000",
    addressCountry: "VN",
  },
  social: {
    facebook: "https://facebook.com/gunagift",
    instagram: "https://instagram.com/gunagift",
    youtube: "https://youtube.com/@gunagift",
  },
};

export function absUrl(path = ""): string {
  return `${SITE.url}${path.startsWith("/") ? path : `/${path}`}`;
}

export function buildOg(opts: {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: "website" | "article";
}) {
  return {
    title: opts.title,
    description: opts.description,
    url: absUrl(opts.path),
    siteName: SITE.fullName,
    locale: SITE.locale,
    type: opts.type ?? "website",
    images: [
      {
        url: absUrl(opts.image ?? SITE.ogImage),
        width: 1200,
        height: 630,
        alt: opts.title,
      },
    ],
  };
}

export function buildTwitter(opts: { title: string; description: string; image?: string }) {
  return {
    card: "summary_large_image" as const,
    title: opts.title,
    description: opts.description,
    creator: SITE.twitterHandle,
    images: [absUrl(opts.image ?? SITE.ogImage)],
  };
}
