import { createClient } from "@/lib/supabase/client";

export type SavedAddress = {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  provinceCode: string;
  provinceName: string;
  districtCode: string;
  districtName: string;
  wardCode: string;
  wardName: string;
  line: string;
  isDefault: boolean;
};

type DbRow = {
  id: string;
  label: string | null;
  full_name: string;
  phone: string;
  province_code: string | null;
  province_name: string | null;
  district_code: string | null;
  district_name: string | null;
  ward_code: string | null;
  ward_name: string | null;
  line: string;
  is_default: boolean | null;
};

const fromRow = (r: DbRow): SavedAddress => ({
  id: r.id,
  label: r.label ?? "Nhà",
  fullName: r.full_name,
  phone: r.phone,
  provinceCode: r.province_code ?? "",
  provinceName: r.province_name ?? "",
  districtCode: r.district_code ?? "",
  districtName: r.district_name ?? "",
  wardCode: r.ward_code ?? "",
  wardName: r.ward_name ?? "",
  line: r.line,
  isDefault: !!r.is_default,
});

const toPayload = (addr: Omit<SavedAddress, "id"> & { id?: string }, userId: string) => ({
  user_id: userId,
  label: addr.label,
  full_name: addr.fullName,
  phone: addr.phone,
  province_code: addr.provinceCode || null,
  province_name: addr.provinceName || null,
  district_code: addr.districtCode || null,
  district_name: addr.districtName || null,
  ward_code: addr.wardCode || null,
  ward_name: addr.wardName || null,
  line: addr.line,
  is_default: !!addr.isDefault,
});

async function getUserId(): Promise<string | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export async function loadAddresses(): Promise<SavedAddress[]> {
  const supabase = createClient();
  const userId = await getUserId();
  if (!userId) return [];
  const { data, error } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", userId)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: true });
  if (error || !data) return [];
  return (data as DbRow[]).map(fromRow);
}

async function ensureOneDefault(userId: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from("addresses")
    .select("id, is_default, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });
  if (!data || data.length === 0) return;
  const hasDefault = data.some((a) => a.is_default);
  if (!hasDefault) {
    await supabase.from("addresses").update({ is_default: true }).eq("id", data[0].id);
  }
}

export async function upsertAddress(addr: Omit<SavedAddress, "id"> & { id?: string }): Promise<SavedAddress[]> {
  const supabase = createClient();
  const userId = await getUserId();
  if (!userId) throw new Error("Vui lòng đăng nhập");

  if (addr.isDefault) {
    await supabase.from("addresses").update({ is_default: false }).eq("user_id", userId);
  }

  const payload = toPayload(addr, userId);
  if (addr.id) {
    await supabase.from("addresses").update(payload).eq("id", addr.id).eq("user_id", userId);
  } else {
    const { data: existing } = await supabase
      .from("addresses")
      .select("id")
      .eq("user_id", userId)
      .limit(1);
    if (!existing || existing.length === 0) {
      payload.is_default = true;
    }
    await supabase.from("addresses").insert(payload);
  }

  await ensureOneDefault(userId);
  return loadAddresses();
}

export async function deleteAddress(id: string): Promise<SavedAddress[]> {
  const supabase = createClient();
  const userId = await getUserId();
  if (!userId) throw new Error("Vui lòng đăng nhập");
  const { data: removed } = await supabase
    .from("addresses")
    .select("is_default")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();
  await supabase.from("addresses").delete().eq("id", id).eq("user_id", userId);
  if (removed?.is_default) {
    const { data: rest } = await supabase
      .from("addresses")
      .select("id")
      .eq("user_id", userId)
      .order("created_at", { ascending: true })
      .limit(1);
    if (rest && rest.length > 0) {
      await supabase.from("addresses").update({ is_default: true }).eq("id", rest[0].id);
    }
  }
  return loadAddresses();
}

export async function setDefaultAddress(id: string): Promise<SavedAddress[]> {
  const supabase = createClient();
  const userId = await getUserId();
  if (!userId) throw new Error("Vui lòng đăng nhập");
  await supabase.from("addresses").update({ is_default: false }).eq("user_id", userId);
  await supabase.from("addresses").update({ is_default: true }).eq("id", id).eq("user_id", userId);
  return loadAddresses();
}
