export function formatPrice(price: number): string {
  return price.toLocaleString("vi-VN") + "đ";
}

export function calcDiscount(original: number, current: number): number {
  if (!original || original <= current) return 0;
  return Math.round(((original - current) / original) * 100);
}
