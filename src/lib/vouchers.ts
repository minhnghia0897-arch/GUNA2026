export type Voucher = {
  code: string;
  title: string;
  description: string;
  discount: string;
  expiry: string;
  minSpend?: number;
  conditions: string[];
  claimed: boolean;
};

export const mockVouchers: Voucher[] = [
  {
    code: "FARMO10",
    title: "Giảm 10% đơn hàng đầu",
    description: "Áp dụng cho khách hàng mới",
    discount: "10%",
    expiry: "2026-12-31",
    minSpend: 300000,
    conditions: ["Áp dụng cho đơn từ 300.000đ", "Chỉ dùng 1 lần", "Không kết hợp khuyến mãi khác"],
    claimed: true,
  },
  {
    code: "FREESHIP",
    title: "Miễn phí vận chuyển",
    description: "Áp dụng toàn quốc",
    discount: "Freeship",
    expiry: "2026-06-30",
    minSpend: 200000,
    conditions: ["Đơn từ 200.000đ", "Tất cả tỉnh thành"],
    claimed: true,
  },
  {
    code: "FARMO20",
    title: "Flash Sale -20%",
    description: "Ưu đãi giới hạn 24h",
    discount: "20%",
    expiry: "2026-05-31",
    minSpend: 500000,
    conditions: ["Đơn từ 500.000đ", "Tối đa 200K", "Số lượng có hạn"],
    claimed: false,
  },
  {
    code: "BIRTHDAY",
    title: "Voucher sinh nhật",
    description: "Quà mừng sinh nhật khách hàng",
    discount: "150.000đ",
    expiry: "2026-12-31",
    conditions: ["Áp dụng cho khách hạng Vàng+", "Chỉ dùng trong tháng sinh nhật"],
    claimed: false,
  },
];
