export type DbSiteSettings = {
  id: string;
  shop_name: string;
  shop_tagline: string;
  shop_description: string | null;
  logo_url: string | null;
  logo_mark: string;
  favicon_url: string | null;
  hotline: string;
  email: string;
  address_line: string;
  business_hours: string;
  facebook_url: string | null;
  instagram_url: string | null;
  youtube_url: string | null;
  zalo_url: string | null;
  messenger_url: string | null;
  freeship_threshold: number;
  announcement_text: string | null;
  announcement_active: boolean;
  hero_eyebrow: string;
  hero_cta_primary: string;
  hero_cta_primary_link: string;
  hero_cta_secondary: string;
  hero_cta_secondary_link: string;
  meta_keywords: string[];
};

export type DbBanner = {
  id: string;
  type: "hero" | "hero_mobile" | "category" | "promo_strip";
  title: string | null;
  subtitle: string | null;
  image_url: string | null;
  mobile_image_url: string | null;
  link_url: string | null;
  link_label: string | null;
  position: number;
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
};

export type DbSiteSection = {
  id: string;
  page_slug: string;
  section_key: string;
  position: number;
  eyebrow: string | null;
  title: string | null;
  subtitle: string | null;
  content: string | null;
  image_url: string | null;
  link_url: string | null;
  link_label: string | null;
  is_visible: boolean;
  metadata: Record<string, unknown>;
};

export type DbPolicy = {
  id: string;
  slug: string;
  title: string;
  content: string | null;
  position: number;
  updated_at: string;
};

export type DbFaq = {
  id: string;
  category: string;
  question: string;
  answer: string;
  position: number;
  is_visible: boolean;
};
