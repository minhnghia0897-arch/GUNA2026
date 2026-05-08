"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/context/ToastContext";

const STATUSES = [
  { key: "pending", label: "Chờ xác nhận" },
  { key: "confirmed", label: "Đã xác nhận" },
  { key: "shipping", label: "Đang giao" },
  { key: "delivered", label: "Đã giao" },
  { key: "cancelled", label: "Đã hủy" },
];

export default function OrderStatusUpdater({
  orderId,
  currentStatus,
  currentTracking,
}: {
  orderId: string;
  currentStatus: string;
  currentTracking: string | null;
}) {
  const router = useRouter();
  const toast = useToast();
  const [status, setStatus] = useState(currentStatus);
  const [tracking, setTracking] = useState(currentTracking ?? "");
  const [saving, setSaving] = useState(false);

  const update = async () => {
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("orders")
      .update({ status, tracking_number: tracking || null })
      .eq("id", orderId);
    setSaving(false);
    if (error) {
      toast.error("Cập nhật thất bại: " + error.message);
      return;
    }
    toast.success("Đã cập nhật đơn hàng");
    router.refresh();
  };

  const dirty = status !== currentStatus || (tracking || null) !== currentTracking;

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
          >
            {STATUSES.map((s) => (
              <option key={s.key} value={s.key}>{s.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 uppercase mb-1 block">Mã vận đơn</label>
          <input
            type="text"
            value={tracking}
            onChange={(e) => setTracking(e.target.value)}
            placeholder="VD: GHN-12345678"
            className="input-field"
          />
        </div>
        <button
          onClick={update}
          disabled={!dirty || saving}
          className="btn-burgundy w-full justify-center text-sm"
        >
          {saving ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
      </div>
    </div>
  );
}
