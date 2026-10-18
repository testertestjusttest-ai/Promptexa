import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/** GET ?phone=01... — track orders by phone */
export async function GET(req: Request) {
  const phone = new URL(req.url).searchParams.get("phone")?.trim() ?? "";
  if (!/^01[3-9]\d{8}$/.test(phone))
    return NextResponse.json({ ok: true, orders: [] });
  const svc = createServiceClient();
  const { data, error } = await svc
    .from("topup_orders")
    .select("id,player_uid,phone,package_name,diamonds,price_bdt,payment_method,trx_id,status,created_at")
    .eq("phone", phone)
    .order("created_at", { ascending: false })
    .limit(20);
  if (error) return NextResponse.json({ ok: true, orders: [] });
  return NextResponse.json({ ok: true, orders: data });
}
