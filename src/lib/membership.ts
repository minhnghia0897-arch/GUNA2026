import { loadOrders } from "./orders";

export type Tier = "silver" | "gold" | "diamond";

export const TIERS: { key: Tier; name: string; minSpend: number; color: string; perks: string[] }[] = [
  {
    key: "silver",
    name: "Bạc",
    minSpend: 0,
    color: "from-gray-400 to-gray-500",
    perks: [
      "Tích 1 điểm mỗi 10.000đ",
      "Voucher sinh nhật 50.000đ",
      "Miễn phí giao hàng đơn từ 500.000đ",
      "Ưu đãi độc quyền qua email",
    ],
  },
  {
    key: "gold",
    name: "Vàng",
    minSpend: 2_000_000,
    color: "from-yellow-400 to-amber-500",
    perks: [
      "Tích 1.5 điểm mỗi 10.000đ",
      "Voucher sinh nhật 150.000đ",
      "Miễn phí giao hàng mọi đơn",
      "Ưu tiên chăm sóc khách hàng",
      "Quà tri ân hàng quý",
    ],
  },
  {
    key: "diamond",
    name: "Kim Cương",
    minSpend: 10_000_000,
    color: "from-blue-400 via-indigo-500 to-purple-500",
    perks: [
      "Tích 2 điểm mỗi 10.000đ",
      "Voucher sinh nhật 500.000đ",
      "Miễn phí giao hàng + đổi trả",
      "Hotline VIP 24/7",
      "Quà tri ân hàng tháng",
      "Tặng riêng cho dịp đặc biệt (cưới, khai trương)",
    ],
  },
];

export function computeTotalSpend(): number {
  const orders = loadOrders();
  return orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + o.total, 0);
}

export function getCurrentTier(spend: number): Tier {
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (spend >= TIERS[i].minSpend) return TIERS[i].key;
  }
  return "silver";
}

export function getNextTier(current: Tier): { key: Tier; name: string; minSpend: number } | null {
  const idx = TIERS.findIndex((t) => t.key === current);
  if (idx === -1 || idx === TIERS.length - 1) return null;
  return TIERS[idx + 1];
}

export function pointsFromSpend(spend: number, tier: Tier): number {
  const rate = tier === "diamond" ? 2 : tier === "gold" ? 1.5 : 1;
  return Math.floor((spend / 10000) * rate);
}
