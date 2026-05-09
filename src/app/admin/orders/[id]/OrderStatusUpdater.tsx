"use client";

import { useState, useTransition } from "react";
import { useToast } from "@/context/ToastContext";
import { updateOrderStatus } from "./actions";

const STATUSES = [
  { key: "pending", label: "Chờ xác nhận" },
  { key: "confirmed", label: "Đã xác nhận" },
  { key: "shipping", label: "Đang giao" },
  { key: "delivered", label: "Đã giao" },
  { key: "cancelled", label: "Đã hủy" },
];

const VALID_NEXT: Record<string, string[]> = {
  pending: ["pending", "confirmed", "cancelled"],
  confirmed: ["confirmed", "shipping", "cancelled"],
  shipping: ["shipping", "delivered", "cancelled"],
  delivered: ["delivered", "cancelled"],
  cancelled: ["cancelled"],
};

export default function OrderStatusUpdater({
  orderId,
  currentStatus,
  currentTracking,
}: {
  orderId: string;
  currentStatus: string;
  currentTracking: string | null;
}) {
  const toast = useToast();
  const [status, setStatus] = useState(currentStatus);
  const [tracking, setTracking] = useState(currentTracking ?? "");
  const [pending, startTransition] = useTransition();

  const onSave = () => {
    startTransition(async () => {
      console.log("[OSU] gọi server action updateOrderStatus", { orderId, status, tracking });
      const t0 = Date.now();
      const res = await updateOrderStatus(orderId, status, tracking);
      console.log(`[OSU] server action trả về sau ${Date.now() - t0}ms`, res);
      if (res.ok) {
        toast.success("Đã cập nhật đơn hàng");
      } else {
        toast.error(res.error);
      }
    });
  };

  const dirty = status !== currentStatus || (tracking || null) !== currentTracking;
  const allowed = VALID_NEXT[currentStatus] ?? [currentStatus];

  return (
    <div className="bg-white rounded-xl border border-gold/10 p-5">
      <h2 className="font-serif text-lg text-burgundy mb-4">Cập nhật trạng thái</h2>
      <div className="space-y-3">
        <div>
          <label className="text-xs text-gray-500 uppercase mb-1 block">Trạng thái</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="input-field"
            disabled={pending}
          >
            {STATUSES.filter((s) => allowed.includes(s.key)).map((s) => (
              <option key={s.key} value={s.key}>{s.label}</option>
            ))}
          </select>
          <p className="text-xs text-gray-400 mt-1">Chỉ hiển thị các trạng thái kế tiếp hợp lệ</p>
        </div>
        <div>
          <label className="text-xs text-gray-500 uppercase mb-1 block">Mã vận đơn</label>
          <input
            type="text"
            value={tracking}
            onChange={(e) => setTracking(e.target.value)}
            placeholder="VD: GHN-12345678"
            className="input-field"
            disabled={pending}
          />
        </div>
        <button
          type="button"
          onClick={onSave}
          disabled={!dirty || pending}
          className="btn-burgundy w-full justify-center text-sm"
        >
          {pending ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
      </div>
    </div>
  );
}
