"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useToast } from "@/context/ToastContext";
import { formatPrice } from "@/lib/format";
import StatusBadgeDropdown from "./StatusBadgeDropdown";
import { bulkUpdateOrderStatus } from "./actions";

type OrderRow = {
  id: string;
  order_code: string;
  customer_name: string;
  customer_phone: string;
  status: string;
  payment_method: string;
  total: number;
  created_at: string;
};

const STATUS_LABEL: Record<string, string> = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  shipping: "Đang giao",
  delivered: "Đã giao",
  cancelled: "Đã hủy",
};

const VALID_NEXT: Record<string, string[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["shipping", "cancelled"],
  shipping: ["delivered", "cancelled"],
  delivered: ["cancelled"],
  cancelled: [],
};

export default function OrdersTable({ orders }: { orders: OrderRow[] }) {
  const toast = useToast();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<string>("");
  const [pending, startTransition] = useTransition();

  const toggle = (id: string) => {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const allChecked = orders.length > 0 && selected.size === orders.length;
  const someChecked = selected.size > 0 && selected.size < orders.length;

  const toggleAll = () => {
    if (selected.size > 0) setSelected(new Set());
    else setSelected(new Set(orders.map((o) => o.id)));
  };

  const selectedOrders = useMemo(
    () => orders.filter((o) => selected.has(o.id)),
    [orders, selected]
  );

  const commonStatus = useMemo(() => {
    if (selectedOrders.length === 0) return null;
    const first = selectedOrders[0].status;
    return selectedOrders.every((o) => o.status === first) ? first : null;
  }, [selectedOrders]);

  const validNext = commonStatus ? (VALID_NEXT[commonStatus] ?? []) : [];

  const onApplyBulk = () => {
    if (!commonStatus || !bulkAction) return;
    const ids = Array.from(selected);
    startTransition(async () => {
      const res = await bulkUpdateOrderStatus(ids, commonStatus, bulkAction);
      if (res.ok) {
        toast.success(`Đã cập nhật ${res.updated} đơn sang "${STATUS_LABEL[bulkAction]}"`);
        setSelected(new Set());
        setBulkAction("");
      } else {
        toast.error(res.error);
      }
    });
  };

  return (
    <>
      {selected.size > 0 && (
        <div className="bg-cream border border-gold/20 rounded-xl px-4 py-3 flex items-center gap-3 flex-wrap">
          <span className="text-sm text-burgundy font-medium">
            {selected.size} đơn đã chọn
          </span>
          {commonStatus ? (
            <>
              <span className="text-xs text-gray-500">
                Hiện tại: <span className="font-medium">{STATUS_LABEL[commonStatus]}</span>
              </span>
              {validNext.length > 0 ? (
                <>
                  <select
                    value={bulkAction}
                    onChange={(e) => setBulkAction(e.target.value)}
                    className="text-sm border border-gold/30 rounded px-2 py-1 bg-white"
                    disabled={pending}
                  >
                    <option value="">-- Chuyển sang --</option>
                    {validNext.map((s) => (
                      <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={onApplyBulk}
                    disabled={!bulkAction || pending}
                    className="btn-burgundy text-sm py-1 px-3"
                  >
                    {pending ? "Đang cập nhật..." : "Áp dụng"}
                  </button>
                </>
              ) : (
                <span className="text-xs text-gray-400">Không có hành động hợp lệ</span>
              )}
            </>
          ) : (
            <span className="text-xs text-gray-400">
              Các đơn có trạng thái khác nhau — không thể đổi hàng loạt
            </span>
          )}
          <button
            type="button"
            onClick={() => setSelected(new Set())}
            className="text-xs text-gray-500 hover:text-burgundy ml-auto"
          >
            Bỏ chọn tất cả
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gold/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-cream text-xs text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 text-left font-medium w-10">
                  <input
                    type="checkbox"
                    checked={allChecked}
                    ref={(el) => {
                      if (el) el.indeterminate = someChecked;
                    }}
                    onChange={toggleAll}
                    aria-label="Chọn tất cả"
                    className="rounded border-gold/30 text-burgundy focus:ring-gold cursor-pointer"
                  />
                </th>
                <th className="px-4 py-3 text-left font-medium">Mã đơn</th>
                <th className="px-4 py-3 text-left font-medium">Khách hàng</th>
                <th className="px-4 py-3 text-left font-medium hidden md:table-cell">Ngày</th>
                <th className="px-4 py-3 text-left font-medium hidden md:table-cell">Thanh toán</th>
                <th className="px-4 py-3 text-left font-medium">Trạng thái</th>
                <th className="px-4 py-3 text-right font-medium">Tổng tiền</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gold/5">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                    Không có đơn hàng nào
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr
                    key={o.id}
                    className={`transition-colors ${selected.has(o.id) ? "bg-gold/5" : "hover:bg-cream"}`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.has(o.id)}
                        onChange={() => toggle(o.id)}
                        aria-label={`Chọn đơn ${o.order_code}`}
                        className="rounded border-gold/30 text-burgundy focus:ring-gold cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/orders/${o.id}`} className="text-burgundy font-medium hover:text-gold">
                        #{o.order_code}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-gray-800">{o.customer_name}</p>
                      <p className="text-xs text-gray-400">{o.customer_phone}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">
                      {new Date(o.created_at).toLocaleString("vi-VN", {
                        day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 uppercase hidden md:table-cell">
                      {o.payment_method}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadgeDropdown orderId={o.id} status={o.status} />
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-burgundy">
                      {formatPrice(o.total)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
