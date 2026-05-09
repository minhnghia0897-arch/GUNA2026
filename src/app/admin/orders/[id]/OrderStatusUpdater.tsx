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
  const router = useRouter();
  const toast = useToast();
  const [status, setStatus] = useState(currentStatus);
  const [tracking, setTracking] = useState(currentTracking ?? "");
  const [saving, setSaving] = useState(false);

  const update = async () => {
    console.log("[OSU] click Lưu — start", { orderId, status, tracking, currentStatus });
    setSaving(true);
    try {
      console.log("[OSU] tạo supabase client...");
      const supabase = createClient();
      console.log("[OSU] gửi PATCH /rest/v1/orders...");
      const t0 = Date.now();
      const { error, status: httpStatus, statusText } = await supabase
        .from("orders")
        .update({ status, tracking_number: tracking || null })
        .eq("id", orderId);
      console.log(`[OSU] PATCH trả về sau ${Date.now() - t0}ms`, { error, httpStatus, statusText });
      if (error) {
        console.error("[OSU] update error", error);
        const raw = error.message ?? "";
        const friendly = raw.includes("INVALID_STATUS_TRANSITION")
          ? `Không thể chuyển từ "${currentStatus}" sang "${status}". Vui lòng chọn trạng thái hợp lệ kế tiếp.`
          : "Cập nhật thất bại: " + raw;
        toast.error(friendly);
        return;
      }
      console.log("[OSU] thành công, gọi toast + router.refresh");
      toast.success("Đã cập nhật đơn hàng");
      router.refresh();
    } catch (err) {
      console.error("[OSU] threw", err);
      toast.error("Lỗi khi cập nhật: " + (err instanceof Error ? err.message : "không xác định"));
    } finally {
      console.log("[OSU] finally — setSaving(false)");
      setSaving(false);
    }
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
            {STATUSES.filter((s) => (VALID_NEXT[currentStatus] ?? [currentStatus]).includes(s.key)).map((s) => (
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
