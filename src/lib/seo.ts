export const SITE = {
  name: "FarMơ",
  fullName: "FarMơ Cao Cấp",
  tagline: "Sản Phẩm Thiên Nhiên Cao Cấp",
  description:
    "FarMơ - Chuyên cung cấp hộp quà cưới, mật ong và quà tặng cao cấp với nguyên liệu thiên nhiên 100%. Giao hàng toàn quốc, miễn phí từ 500.000đ.",
  url: "https://farmo.vn",
  ogImage: "/images/product-1.svg",
  twitterHandle: "@farmovn",
  locale: "vi_VN",
  phone: "+84901234567",
  email: "info@farmo.vn",
  address: {
    streetAddress: "123 Nguyễn Huệ",
    addressLocality: "Quận 1",
    addressRegion: "TP. Hồ Chí Minh",
    postalCode: "70000",
    addressCountry: "VN",
  },
  social: {
    facebook: "https://facebook.com/farmovn",
    instagram: "https://instagram.com/farmovn",
    youtube: "https://youtube.com/@farmovn",
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
