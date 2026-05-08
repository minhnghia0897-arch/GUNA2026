export type DbProduct = {
  id: string;
  slug: string;
  name: string;
  short_desc: string | null;
  description: string | null;
  category_slug: "qua-cuoi" | "mat-ong" | "qua-tang" | "combo";
  price: number;
  original_price: number | null;
  badge: string | null;
  image: string | null;
  gallery: string[];
  specs: { label: string; value: string }[];
  stock_count: number;
  rating: number;
  reviews_count: number;
  is_visible: boolean;
  position: number;
  created_at: string;
};

export type DbCategory = {
  id: string;
  slug: string;
  label: string;
  position: number;
};

export type DbProfile = {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  role: "customer" | "staff" | "admin";
  total_orders: number;
  total_spent: number;
  tier: "silver" | "gold" | "diamond";
  created_at: string;
};

export type DbOrder = {
  id: string;
  order_code: string;
  user_id: string | null;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  shipping_address: {
    line: string;
    province_name: string;
    district_name: string;
    ward_name: string;
    note?: string;
  };
  shipping_method: "standard" | "express";
  shipping_fee: number;
  payment_method: "cod" | "bank" | "vnpay" | "momo";
  payment_status: "unpaid" | "paid" | "refunded";
  status: "pending" | "confirmed" | "shipping" | "delivered" | "cancelled";
  subtotal: number;
  discount: number;
  voucher_code: string | null;
  total: number;
  note: string | null;
  tracking_number: string | null;
  created_at: string;
};

export type DbOrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  product_slug: string;
  product_name: string;
  product_image: string | null;
  unit_price: number;
  quantity: number;
  total_price: number;
};

export type DbAddress = {
  id: string;
  user_id: string;
  label: string;
  full_name: string;
  phone: string;
  province_code: string | null;
  province_name: string | null;
  district_code: string | null;
  district_name: string | null;
  ward_code: string | null;
  ward_name: string | null;
  line: string;
  is_default: boolean;
};

export type DbReview = {
  id: string;
  product_id: string;
  user_id: string | null;
  author_name: string;
  rating: number;
  title: string | null;
  content: string;
  is_verified: boolean;
  helpful_count: number;
  status: "published" | "pending" | "hidden";
  created_at: string;
};

export type DbVoucher = {
  id: string;
  code: string;
  title: string;
  description: string | null;
  discount_type: "percentage" | "fixed" | "freeship";
  value: number;
  min_order: number;
  max_discount: number | null;
  ends_at: string | null;
  is_active: boolean;
};

export type DbArticle = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  category: string | null;
  image: string | null;
  read_time: string | null;
  status: "published" | "draft" | "archived";
  published_at: string;
};
