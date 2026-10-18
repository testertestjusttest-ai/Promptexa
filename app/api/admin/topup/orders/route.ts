import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin";

export const dynamic = "force-dynamic";

const STATUSES = ["pending", "approved", "delivered", "rejected"];

/** GET ?status= — list orders */
export async function GET(req: Request) {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;
  const status = new URL(req.url).searchParams.get("status") || "";
  let q = auth.svc.from("topup_orders").select("*").order("created_at", { ascending: false }).limit(100);
  if (STATUSES.includes(status)) q = q.eq("status", status);
  const { data, error } = await q;
  if (error) return NextResponse.json({ error: "লোড হয়নি" }, { status: 500 });
  return NextResponse.json({ ok: true, orders: data });
}

/** PUT — update order status (?id=) {status, admin_note} */
export async function PUT(req: Request) {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;
  const id = new URL(req.url).searchParams.get("id");
  const b = await req.json();
  if (!id) return NextResponse.json({ error: "id নেই" }, { status: 400 });
  const status = String(b.status || "");
  if (!STATUSES.includes(status))
    return NextResponse.json({ error: "স্ট্যাটাস ঠিক নেই" }, { status: 400 });
  const { error } = await auth.svc
    .from("topup_orders")
    .update({ status, admin_note: String(b.admin_note || "").slice(0, 500) || null })
    .eq("id", id);
  if (error) return NextResponse.json({ error: "আপডেট হয়নি" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
