export type OrderStatus = "pending" | "confirmed" | "shipping" | "delivered" | "cancelled";

export type StoredOrder = {
  id: string;
  createdAt: number;
  customer: { fullName: string; phone: string; email: string };
  address: { line: string; ward: string; district: string; province: string; note: string };
  shipping: "standard" | "express";
  payment: "cod" | "bank" | "vnpay" | "momo";
  items: { slug: string; name: string; price: number; image: string; quantity: number }[];
  subtotal: number;
  shippingFee: number;
  total: number;
  status: OrderStatus;
};

const KEY = "farmo-orders";
const CANCEL_WINDOW_MS = 30 * 60 * 1000;

export function loadOrders(): StoredOrder[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as StoredOrder[]) : [];
  } catch {
    return [];
  }
}

export function findOrder(id: string): StoredOrder | undefined {
  return loadOrders().find((o) => o.id === id);
}

export function saveOrders(orders: StoredOrder[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(orders));
  } catch {}
}

export function updateOrderStatus(id: string, status: OrderStatus): StoredOrder | undefined {
  const list = loadOrders();
  const idx = list.findIndex((o) => o.id === id);
  if (idx === -1) return undefined;
  list[idx] = { ...list[idx], status };
  saveOrders(list);
  return list[idx];
}

export function canCancel(order: StoredOrder): boolean {
  if (order.status !== "pending") return false;
  return Date.now() - order.createdAt < CANCEL_WINDOW_MS;
}

export const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  shipping: "Đang giao",
  delivered: "Đã giao",
  cancelled: "Đã hủy",
};

export const STATUS_COLOR: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-blue-100 text-blue-700",
  shipping: "bg-indigo-100 text-indigo-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export const PAYMENT_LABEL: Record<StoredOrder["payment"], string> = {
  cod: "Thanh toán khi nhận hàng (COD)",
  bank: "Chuyển khoản ngân hàng",
  vnpay: "VNPay",
  momo: "Ví MoMo",
};

export const SHIPPING_LABEL: Record<StoredOrder["shipping"], string> = {
  standard: "Giao hàng tiêu chuẩn (2-4 ngày)",
  express: "Giao hàng nhanh (trong ngày)",
};
