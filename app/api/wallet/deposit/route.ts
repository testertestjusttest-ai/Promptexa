import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

const METHODS = ["bkash", "nagad", "rocket", "card"] as const;

/**
 * POST /api/wallet/deposit
 * Body: { amount, method, trx_id }
 * Creates a pending deposit request. Admin approves → wallet credited.
 */
export async function POST(req: Request) {
  try {
    const client = await createClient();
    const { data: { user } } = await client.auth.getUser();
    if (!user) return NextResponse.json({ error: "লগইন করুন" }, { status: 401 });

    const { amount, method, trx_id } = (await req.json()) as {
      amount: number; method: string; trx_id: string;
    };

    const amt = Math.floor(Number(amount) || 0);
    if (amt < 100) return NextResponse.json({ error: "সর্বনিম্ন ডিপোজিট ১০০ টাকা" }, { status: 400 });
    if (amt > 100000) return NextResponse.json({ error: "সর্বোচ্চ ডিপোজিট ১,০০,০০০ টাকা" }, { status: 400 });
    if (!METHODS.includes(method as (typeof METHODS)[number])) {
      return NextResponse.json({ error: "ভুল মাধ্যম" }, { status: 400 });
    }
    const trx = (trx_id || "").trim();
    if (method !== "card" && trx.length < 6) {
      return NextResponse.json({ error: "সঠিক TrxID দিন" }, { status: 400 });
    }

    const svc = createServiceClient();
    const { data, error } = await svc.from("deposits").insert({
      user_id: user.id,
      amount_bdt: amt,
      method,
      trx_id: method === "card" ? "CARD" : trx,
    }).select("id").single();

    if (error || !data) return NextResponse.json({ error: "জমা হয়নি — আবার চেষ্টা করুন" }, { status: 500 });
    return NextResponse.json({ ok: true, id: (data as any).id });
  } catch (e) {
    console.error("deposit error", e);
    return NextResponse.json({ error: "সার্ভার সমস্যা" }, { status: 500 });
  }
}

/** GET /api/wallet/deposit — my deposit history */
export async function GET() {
  const client = await createClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user) return NextResponse.json({ error: "লগইন করুন" }, { status: 401 });
  const svc = createServiceClient();
  const { data } = await svc.from("deposits")
    .select("id, amount_bdt, method, status, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);
  return NextResponse.json({ deposits: data ?? [] });
}
