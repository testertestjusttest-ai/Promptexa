import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin";

/** POST /api/admin/payments/reject { payment_id, order_id } */
export async function POST(req: Request) {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;
  const { svc } = auth;

  try {
    const { payment_id, order_id } = (await req.json()) as {
      payment_id: string;
      order_id: string;
    };
    await svc.from("payments").update({ status: "failed" }).eq("id", payment_id);
    await svc.from("orders").update({ status: "cancelled" }).eq("id", order_id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "সার্ভার সমস্যা" }, { status: 500 });
  }
}
