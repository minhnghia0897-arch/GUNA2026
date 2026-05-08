"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import { createClient } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/format";
import type { DbProfile } from "@/lib/supabase/types";
import { IconOrders, IconStar, IconRevenue, IconUser } from "@/components/icons";

export default function AccountPage() {
  const router = useRouter();
  const supabase = createClient();
  const [profile, setProfile] = useState<DbProfile | null>(null);
  const [orderCount, setOrderCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      const [{ data: p }, { count }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
        supabase.from("orders").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      ]);
      setProfile(p as DbProfile | null);
      setOrderCount(count ?? 0);
      setLoading(false);
    };
    load();
  }, [supabase]);

  const logout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-gold border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!profile) {
    return (
      <>
        <PageHeader title="Tài Khoản" crumbs={[{ label: "Trang Chủ", href: "/" }, { label: "Tài Khoản" }]} />
        <div className="max-w-md mx-auto px-4 py-20 text-center">
          <div className="text-6xl mb-6 opacity-30">👤</div>
          <h2 className="font-serif text-2xl text-burgundy mb-3">Chào mừng đến với GUNA GIFT</h2>
          <p className="text-gray-500 mb-6">Đăng nhập để xem đơn hàng, điểm thành viên và nhiều ưu đãi khác</p>
          <div className="flex gap-3 justify-center">
            <Link href="/account/login" className="btn-gold">Đăng nhập</Link>
            <Link href="/account/register" className="btn-outline-gold">Đăng ký</Link>
          </div>
        </div>
      </>
    );
  }

  const tierLabel = profile.tier === "diamond" ? "Kim Cương" : profile.tier === "gold" ? "Vàng" : "Bạc";
  const points = Math.floor(profile.total_spent / 10000);

  return (
    <>
      <PageHeader title="Tài Khoản" crumbs={[{ label: "Trang Chủ", href: "/" }, { label: "Tài Khoản" }]} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gold/10 p-6 sticky top-28">
              <div className="text-center mb-6 pb-6 border-b border-gold/10">
                <div className="w-16 h-16 mx-auto rounded-full bg-burgundy text-white flex items-center justify-center text-2xl font-serif font-bold mb-3">
                  {(profile.full_name || profile.email || "?").charAt(0).toUpperCase()}
                </div>
                <p className="font-medium text-burgundy">{profile.full_name || "Người dùng"}</p>
                <p className="text-xs text-gray-500">{profile.email}</p>
              </div>
              <nav className="space-y-1">
                {[
                  { label: "Tổng quan", href: "/account", active: true },
                  { label: "Đơn hàng", href: "/account/orders" },
                  { label: "Yêu thích", href: "/account/wishlist" },
                  { label: "Sổ địa chỉ", href: "/account/addresses" },
                  { label: "Hạng thành viên", href: "/account/membership" },
                  { label: "Voucher", href: "/account/vouchers" },
                ].map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`block px-3 py-2 text-sm rounded-lg transition-colors ${
                      item.active ? "bg-burgundy text-white" : "text-gray-600 hover:bg-cream"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
                <button
                  onClick={logout}
                  className="block w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-cream rounded-lg transition-colors"
                >
                  Đăng xuất
                </button>
              </nav>
            </div>
          </aside>

          <div className="lg:col-span-3 space-y-6">
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { label: "Đơn hàng", value: orderCount.toString(), Icon: IconOrders },
                { label: "Điểm tích lũy", value: points.toLocaleString("vi-VN"), Icon: IconStar },
                { label: "Đã chi tiêu", value: formatPrice(profile.total_spent), Icon: IconRevenue },
              ].map((s) => {
                const Icon = s.Icon;
                return (
                  <div key={s.label} className="bg-white rounded-xl border border-gold/10 p-6 text-center">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center text-gold">
                      <Icon className="w-6 h-6" strokeWidth={1.5} />
                    </div>
                    <p className="text-2xl font-serif font-bold text-burgundy">{s.value}</p>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">{s.label}</p>
                  </div>
                );
              })}
            </div>

            <div className="bg-white rounded-xl border border-gold/10 p-6">
              <h3 className="font-serif text-xl text-burgundy mb-4">Thông tin tài khoản</h3>
              <dl className="grid sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-gray-500 mb-1">Họ và tên</dt>
                  <dd className="font-medium">{profile.full_name || "—"}</dd>
                </div>
                <div>
                  <dt className="text-gray-500 mb-1">Email</dt>
                  <dd className="font-medium">{profile.email}</dd>
                </div>
                <div>
                  <dt className="text-gray-500 mb-1">Số điện thoại</dt>
                  <dd className="font-medium">{profile.phone || <span className="text-gray-400">Chưa cập nhật</span>}</dd>
                </div>
                <div>
                  <dt className="text-gray-500 mb-1">Hạng thành viên</dt>
                  <dd>
                    <Link href="/account/membership" className="inline-block bg-gold/10 text-gold-700 text-xs px-2 py-1 rounded hover:bg-gold/20">
                      {tierLabel}
                    </Link>
                  </dd>
                </div>
              </dl>
            </div>

            <div className="bg-gradient-to-br from-burgundy to-burgundy-900 text-white rounded-xl p-6">
              <p className="text-gold text-xs uppercase tracking-wider mb-2">Ưu Đãi Đặc Biệt</p>
              <h3 className="font-serif text-xl mb-3">Thăng hạng để nhận thêm ưu đãi</h3>
              <p className="text-white/70 text-sm font-light mb-4">
                Tổng chi tiêu hiện tại: <strong>{formatPrice(profile.total_spent)}</strong>. Mua sắm thêm để lên hạng cao hơn và nhận giảm giá độc quyền.
              </p>
              <Link href="/account/membership" className="text-gold hover:text-white text-sm underline">
                Xem chi tiết hạng thành viên →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
