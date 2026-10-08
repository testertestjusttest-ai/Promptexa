import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin";
import { confirmOrderPayment } from "@/lib/delivery";

/** POST /api/admin/payments/approve { payment_id, order_id } — approve manual payment + auto-deliver keys */
export async function POST(req: Request) {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;
  const { svc } = auth;

  try {
    const { payment_id, order_id } = (await req.json()) as {
      payment_id: string;
      order_id: string;
    };
    if (!payment_id || !order_id) {
      return NextResponse.json({ error: "ID আবশ্যক" }, { status: 400 });
    }

    const { data: payment } = await svc
      .from("payments")
      .select("id, status, method")
      .eq("id", payment_id)
      .eq("order_id", order_id)
      .single();
    if (!payment || payment.status !== "pending") {
      return NextResponse.json({ error: "পেমেন্ট পাওয়া যায়নি" }, { status: 404 });
    }

    const result = await confirmOrderPayment(svc, order_id, {
      gateway_response: { approved_by_admin: true, manual: true },
    });

    return NextResponse.json({
      ok: true,
      delivered: result.delivered,
      missing: result.missing,
      message:
        result.missing > 0
          ? `অ্যাপ্রুভ হয়েছে, কিন্তু ${result.missing}টি আইটেমের কী স্টকে নেই — কী যোগ করুন।`
          : "অ্যাপ্রুভ হয়েছে ও কী ডেলিভারি সম্পন্ন।",
    });
  } catch (e) {
    console.error("approve error", e);
    return NextResponse.json({ error: "সার্ভার সমস্যা" }, { status: 500 });
  }
}
