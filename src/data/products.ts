export type Product = {
  slug: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: "qua-cuoi" | "mat-ong" | "qua-tang" | "combo";
  categoryLabel: string;
  badge?: string | null;
  rating: number;
  reviews: number;
  image: string;
  gallery: string[];
  shortDesc: string;
  description: string;
  specs: { label: string; value: string }[];
  inStock: boolean;
  stockCount: number;
};

const IMG = ["/images/product-1.svg", "/images/product-2.svg", "/images/product-3.svg"];

export const products: Product[] = [
  {
    slug: "hop-qua-cuoi-happy-wedding-do",
    name: "Hộp Quà Cưới Happy Wedding - Đỏ",
    price: 1200000,
    originalPrice: 1500000,
    category: "qua-cuoi",
    categoryLabel: "Quà Cưới",
    badge: "Bán Chạy",
    rating: 5,
    reviews: 128,
    image: IMG[0],
    gallery: [IMG[0], IMG[2], IMG[1]],
    shortDesc: "Hộp quà cưới sang trọng với họa tiết cổ điển, màu đỏ truyền thống.",
    description:
      "Hộp quà cưới Happy Wedding phiên bản đỏ là lựa chọn hoàn hảo cho ngày trọng đại. Thiết kế lấy cảm hứng từ nghệ thuật Art Deco với họa tiết hoa văn vàng tinh xảo, tone đỏ đô sang trọng. Bên trong gồm các sản phẩm FarMơ cao cấp được tuyển chọn kỹ lưỡng, đảm bảo gửi gắm trọn vẹn lời chúc tốt đẹp đến người nhận.",
    specs: [
      { label: "Kích thước", value: "20 x 20 x 8 cm" },
      { label: "Trọng lượng", value: "500g" },
      { label: "Chất liệu hộp", value: "Giấy mỹ thuật cao cấp" },
      { label: "Hạn sử dụng", value: "12 tháng" },
      { label: "Xuất xứ", value: "Việt Nam" },
    ],
    inStock: true,
    stockCount: 42,
  },
  {
    slug: "mat-ong-amber-whisper",
    name: "Mật Ong Amber Whisper Cao Cấp",
    price: 2500000,
    originalPrice: 3000000,
    category: "mat-ong",
    categoryLabel: "Mật Ong",
    badge: "Yêu Thích",
    rating: 5,
    reviews: 95,
    image: IMG[1],
    gallery: [IMG[1], IMG[0], IMG[2]],
    shortDesc: "Mật ong nguyên chất, đậm đà hương vị thiên nhiên trong chai thủy tinh sang trọng.",
    description:
      "Mật ong Amber Whisper được thu hoạch từ những vùng hoa rừng nguyên sơ, chai thủy tinh thiết kế độc đáo với nhãn vàng đồng cổ điển. Sản phẩm 100% nguyên chất, không pha trộn, giữ trọn vẹn enzyme và vitamin tự nhiên. Phù hợp dùng hàng ngày hoặc làm quà biếu sang trọng.",
    specs: [
      { label: "Dung tích", value: "500ml" },
      { label: "Loại mật", value: "Mật ong rừng" },
      { label: "Độ ẩm", value: "≤ 18%" },
      { label: "Hạn sử dụng", value: "24 tháng" },
      { label: "Xuất xứ", value: "Việt Nam" },
    ],
    inStock: true,
    stockCount: 28,
  },
  {
    slug: "hop-qua-cuoi-happy-wedding-xanh",
    name: "Hộp Quà Cưới Happy Wedding - Xanh",
    price: 800000,
    originalPrice: 950000,
    category: "qua-cuoi",
    categoryLabel: "Quà Cưới",
    badge: null,
    rating: 5,
    reviews: 72,
    image: IMG[2],
    gallery: [IMG[2], IMG[0], IMG[1]],
    shortDesc: "Phiên bản xanh thanh lịch, phù hợp đám cưới phong cách hiện đại.",
    description:
      "Phiên bản xanh tươi mát của bộ sưu tập Happy Wedding, mang đến cảm giác thanh lịch và tinh tế. Thiết kế họa tiết hoa lá vàng đồng nổi bật trên nền xanh oliu, là điểm nhấn hoàn hảo cho mâm tiệc cưới sang trọng và phong cách hiện đại.",
    specs: [
      { label: "Kích thước", value: "18 x 18 x 7 cm" },
      { label: "Trọng lượng", value: "400g" },
      { label: "Chất liệu hộp", value: "Giấy mỹ thuật cao cấp" },
      { label: "Hạn sử dụng", value: "12 tháng" },
      { label: "Xuất xứ", value: "Việt Nam" },
    ],
    inStock: true,
    stockCount: 56,
  },
  {
    slug: "combo-qua-cuoi-do-xanh",
    name: "Combo Quà Cưới Đỏ & Xanh",
    price: 3800000,
    originalPrice: 4500000,
    category: "combo",
    categoryLabel: "Combo",
    badge: "Giới Hạn",
    rating: 5,
    reviews: 43,
    image: IMG[0],
    gallery: [IMG[0], IMG[2], IMG[1]],
    shortDesc: "Bộ combo gồm 2 hộp quà đỏ và xanh, tiết kiệm 700K.",
    description:
      "Combo đặc biệt dành cho những đám cưới quy mô lớn, gồm 2 hộp quà cưới Happy Wedding phiên bản đỏ và xanh. Là lựa chọn lý tưởng để tạo điểm nhấn ấn tượng cho khách mời, kết hợp giữa nét truyền thống đỏ và hiện đại xanh.",
    specs: [
      { label: "Số lượng", value: "2 hộp" },
      { label: "Trọng lượng", value: "900g" },
      { label: "Chất liệu hộp", value: "Giấy mỹ thuật cao cấp" },
      { label: "Hạn sử dụng", value: "12 tháng" },
      { label: "Xuất xứ", value: "Việt Nam" },
    ],
    inStock: true,
    stockCount: 15,
  },
  {
    slug: "set-qua-tang-mat-ong-banh",
    name: "Set Quà Tặng Mật Ong & Bánh",
    price: 2100000,
    originalPrice: 2600000,
    category: "qua-tang",
    categoryLabel: "Quà Tặng",
    badge: null,
    rating: 4,
    reviews: 156,
    image: IMG[1],
    gallery: [IMG[1], IMG[0], IMG[2]],
    shortDesc: "Set quà tặng cao cấp gồm mật ong nguyên chất và bánh truyền thống.",
    description:
      "Set quà tặng dành cho những dịp đặc biệt như Tết, sinh nhật, hoặc tri ân khách hàng. Bao gồm 1 chai mật ong Amber Whisper và bánh truyền thống được đóng gói trong hộp quà sang trọng, kèm thiệp viết tay miễn phí.",
    specs: [
      { label: "Bao gồm", value: "1 mật ong + 4 bánh" },
      { label: "Trọng lượng", value: "1.2kg" },
      { label: "Chất liệu hộp", value: "Giấy mỹ thuật cao cấp" },
      { label: "Hạn sử dụng", value: "6 tháng" },
      { label: "Xuất xứ", value: "Việt Nam" },
    ],
    inStock: true,
    stockCount: 38,
  },
  {
    slug: "hop-qua-cuoi-xanh-nho",
    name: "Hộp Quà Cưới Xanh Nhỏ",
    price: 350000,
    originalPrice: 450000,
    category: "qua-cuoi",
    categoryLabel: "Quà Cưới",
    badge: "Mới",
    rating: 5,
    reviews: 67,
    image: IMG[2],
    gallery: [IMG[2], IMG[0], IMG[1]],
    shortDesc: "Phiên bản nhỏ gọn, giá tốt, phù hợp số lượng lớn.",
    description:
      "Phiên bản mini của Happy Wedding xanh, được thiết kế nhỏ gọn nhưng vẫn giữ trọn nét tinh tế. Là lựa chọn kinh tế cho đám cưới có số lượng khách mời lớn mà vẫn đảm bảo sự sang trọng và ý nghĩa.",
    specs: [
      { label: "Kích thước", value: "12 x 12 x 5 cm" },
      { label: "Trọng lượng", value: "200g" },
      { label: "Chất liệu hộp", value: "Giấy mỹ thuật cao cấp" },
      { label: "Hạn sử dụng", value: "12 tháng" },
      { label: "Xuất xứ", value: "Việt Nam" },
    ],
    inStock: true,
    stockCount: 120,
  },
];

export const categories = [
  { slug: "all", label: "Tất Cả" },
  { slug: "qua-cuoi", label: "Quà Cưới" },
  { slug: "mat-ong", label: "Mật Ong" },
  { slug: "qua-tang", label: "Quà Tặng" },
  { slug: "combo", label: "Combo" },
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getRelatedProducts(slug: string, limit = 3): Product[] {
  const current = getProductBySlug(slug);
  if (!current) return [];
  return products
    .filter((p) => p.slug !== slug && p.category === current.category)
    .slice(0, limit);
}
