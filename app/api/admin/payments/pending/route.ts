import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin";

/** GET /api/admin/payments/pending — manual payments awaiting verification */
export async function GET() {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;
  const { svc } = auth;

  const { data, error } = await svc
    .from("payments")
    .select("id, order_id, method, amount_bdt, sender_number, trx_id, created_at, order:orders(order_number, customer_name, customer_phone)")
    .eq("status", "pending")
    .in("method", ["bkash", "nagad", "rocket"])
    .not("trx_id", "is", null)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: "লোড হয়নি" }, { status: 500 });
  }
  return NextResponse.json({ ok: true, payments: data });
}
