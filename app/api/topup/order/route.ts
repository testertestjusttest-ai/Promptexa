import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { isValidUid } from "@/lib/topup";

export const dynamic = "force-dynamic";

/** POST — create a top-up order (guest allowed, phone is the key) */
export async function POST(req: Request) {
  try {
    const b = await req.json();
    const package_id = String(b.package_id || "");
    const player_uid = String(b.player_uid || "").trim();
    const phone = String(b.phone || "").trim();
    const payment_method = String(b.payment_method || "").toLowerCase();
    const sender_number = String(b.sender_number || "").trim();
    const trx_id = String(b.trx_id || "").trim().toUpperCase();

    if (!package_id) return NextResponse.json({ error: "প্যাকেজ সিলেক্ট করুন" }, { status: 400 });
    if (!isValidUid(player_uid))
      return NextResponse.json({ error: "সঠিক Player UID দিন" }, { status: 400 });
    if (!/^01[3-9]\d{8}$/.test(phone))
      return NextResponse.json({ error: "সঠিক মোবাইল নম্বর দিন" }, { status: 400 });
    if (!["bkash", "nagad", "rocket"].includes(payment_method))
      return NextResponse.json({ error: "পেমেন্ট মাধ্যম ঠিক নেই" }, { status: 400 });
    if (!sender_number || !trx_id)
      return NextResponse.json({ error: "সেন্ডার নম্বর ও TrxID দিন" }, { status: 400 });

    const svc = createServiceClient();

    const { data: pkg, error: pkgErr } = await svc
      .from("topup_packages")
      .select("id,name,diamonds,price_bdt,is_active")
      .eq("id", package_id)
      .eq("is_active", true)
      .single();
    if (pkgErr || !pkg)
      return NextResponse.json({ error: "প্যাকেজটি এখন নেই" }, { status: 400 });

    const { data: order, error } = await svc
      .from("topup_orders")
      .insert({
        player_uid,
        phone,
        package_id: pkg.id,
        package_name: pkg.name,
        diamonds: pkg.diamonds ?? 0,
        price_bdt: pkg.price_bdt,
        payment_method,
        sender_number,
        trx_id,
        status: "pending",
      })
      .select("*")
      .single();
    if (error) throw error;

    return NextResponse.json({ ok: true, order });
  } catch {
    return NextResponse.json({ error: "অর্ডার করা যায়নি, আবার চেষ্টা করুন" }, { status: 500 });
  }
}
