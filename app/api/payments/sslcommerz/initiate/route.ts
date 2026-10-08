import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { initSession, isSslEnabled } from "@/lib/sslcommerz";

/**
 * POST /api/payments/sslcommerz/initiate  { order_id }
 * Creates an SSLCommerz session and returns the gateway URL.
 */
export async function POST(req: Request) {
  try {
    const { order_id } = (await req.json()) as { order_id: string };
    if (!order_id) {
      return NextResponse.json({ error: "order_id আবশ্যক" }, { status: 400 });
    }
    if (!isSslEnabled()) {
      return NextResponse.json(
        { error: "কার্ড পেমেন্ট এখন বন্ধ আছে" },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();
    const { data: order } = await supabase
      .from("orders")
      .select("id, order_number, customer_name, customer_phone, customer_email, total_bdt, status, payment_method")
      .eq("id", order_id)
      .single();
    if (!order) {
      return NextResponse.json({ error: "অর্ডার পাওয়া যায়নি" }, { status: 404 });
    }
    if (order.payment_method !== "sslcommerz" || order.status !== "payment_pending") {
      return NextResponse.json({ error: "এই অর্ডারে পেমেন্ট করা যাবে না" }, { status: 400 });
    }

    const { data: items } = await supabase
      .from("order_items")
      .select("product_name, plan_label_bn")
      .eq("order_id", order.id);
    const productName =
      items?.map((i) => `${i.product_name} (${i.plan_label_bn})`).join(", ") ||
      "Digital products";

    const session = await initSession({
      tranId: order.order_number, // unique per order
      amount: order.total_bdt,
      customer: {
        name: order.customer_name,
        email: order.customer_email ?? undefined,
        phone: order.customer_phone,
      },
      productName: productName.slice(0, 200),
    });

    if (!session.ok || !session.gatewayUrl) {
      return NextResponse.json(
        { error: session.error || "পেমেন্ট সেশন তৈরি হয়নি" },
        { status: 502 }
      );
    }

    await supabase
      .from("payments")
      .update({ ssl_tran_id: order.order_number, gateway_response: { session_key: session.sessionKey } })
      .eq("order_id", order.id)
      .eq("status", "pending");

    return NextResponse.json({ ok: true, gateway_url: session.gatewayUrl });
  } catch (e) {
    console.error("ssl initiate error", e);
    return NextResponse.json({ error: "সার্ভার সমস্যা" }, { status: 500 });
  }
}
