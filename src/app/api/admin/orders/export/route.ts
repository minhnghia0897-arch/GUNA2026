import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const STATUS_LABEL: Record<string, string> = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  shipping: "Đang giao",
  delivered: "Đã giao",
  cancelled: "Đã hủy",
};

const SHIPPING_LABEL: Record<string, string> = {
  standard: "Tiêu chuẩn",
  express: "Nhanh",
};

const PAYMENT_LABEL: Record<string, string> = {
  cod: "COD",
  bank: "Chuyển khoản",
  vnpay: "VNPay",
  momo: "MoMo",
};

type ShippingAddress = {
  line?: string | null;
  ward_name?: string | null;
  district_name?: string | null;
  province_name?: string | null;
};

type OrderItem = {
  product_name: string | null;
  quantity: number | null;
  unit_price: number | null;
};

function csvEscape(v: string): string {
  if (/[",\r\n]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
  return v;
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile || (profile.role !== "admin" && profile.role !== "staff")) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const sp = request.nextUrl.searchParams;
  const status = sp.get("status");
  const q = sp.get("q");

  let query = supabase
    .from("orders")
    .select(
      "order_code, customer_name, customer_phone, customer_email, shipping_address, shipping_method, shipping_fee, payment_method, voucher_code, subtotal, discount, total, status, tracking_number, note, created_at, order_items(product_name, quantity, unit_price)"
    )
    .order("created_at", { ascending: false });

  if (status && status !== "all") {
    query = query.eq("status", status);
  }
  if (q) {
    query = query.or(`order_code.ilike.%${q}%,customer_name.ilike.%${q}%,customer_phone.ilike.%${q}%`);
  }

  const { data: orders, error } = await query;
  if (error) {
    return new NextResponse("Query failed: " + error.message, { status: 500 });
  }

  const columns = [
    "Mã đơn",
    "Ngày tạo",
    "Khách hàng",
    "SDT",
    "Email",
    "Tỉnh/TP",
    "Quận/Huyện",
    "Phường/Xã",
    "Địa chỉ chi tiết",
    "Chi tiết sản phẩm",
    "Tổng số lượng",
    "Tạm tính",
    "Voucher",
    "Giảm giá",
    "Phương thức VC",
    "Phí ship",
    "Thanh toán",
    "Tổng tiền",
    "Trạng thái",
    "Mã vận đơn",
    "Ghi chú",
  ];

  const rows = (orders ?? []).map((o) => {
    const addr = (o.shipping_address ?? {}) as ShippingAddress;
    const items = ((o.order_items ?? []) as OrderItem[]);
    const productsStr = items
      .map((i) => {
        const name = (i.product_name ?? "(không tên)").trim();
        const qty = i.quantity ?? 0;
        return `${name} × ${qty}`;
      })
      .join("\r\n");
    const totalQty = items.reduce((s, i) => s + (i.quantity ?? 0), 0);
    const date = new Date(o.created_at).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    return [
      o.order_code ?? "",
      date,
      o.customer_name ?? "",
      o.customer_phone ?? "",
      o.customer_email ?? "",
      addr.province_name ?? "",
      addr.district_name ?? "",
      addr.ward_name ?? "",
      addr.line ?? "",
      productsStr,
      String(totalQty),
      String(o.subtotal ?? 0),
      o.voucher_code ?? "",
      String(o.discount ?? 0),
      SHIPPING_LABEL[o.shipping_method ?? ""] ?? (o.shipping_method ?? ""),
      String(o.shipping_fee ?? 0),
      PAYMENT_LABEL[o.payment_method ?? ""] ?? (o.payment_method ?? ""),
      String(o.total ?? 0),
      STATUS_LABEL[o.status ?? ""] ?? (o.status ?? ""),
      o.tracking_number ?? "",
      o.note ?? "",
    ];
  });

  const csv = [columns, ...rows]
    .map((row) => row.map(csvEscape).join(","))
    .join("\r\n");

  const body = "﻿" + csv;
  const stamp = new Date().toISOString().slice(0, 10);
  const filename = `gunagift_orders_${stamp}.csv`;

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
