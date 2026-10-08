import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

/**
 * POST /api/payments/manual
 * Body: { order_id, sender_number, trx_id }
 * Customer submits their bKash/Nagad/Rocket TrxID after sending money.
 * Admin approves it in the admin panel → keys are delivered automatically.
 */
export async function POST(req: Request) {
  try {
    const { order_id, sender_number, trx_id } = (await req.json()) as {
      order_id: string;
      sender_number: string;
      trx_id: string;
    };

    if (!order_id || !sender_number?.trim() || !trx_id?.trim()) {
      return NextResponse.json(
        { error: "সেন্ডার নম্বর ও TrxID দিন" },
        { status: 400 }
      );
    }
    const cleanTrx = trx_id.trim().toUpperCase();
    if (!/^[A-Z0-9]{6,20}$/.test(cleanTrx)) {
      return NextResponse.json({ error: "সঠিক TrxID দিন" }, { status: 400 });
    }

    const supabase = createServiceClient();
    const { data: order } = await supabase
      .from("orders")
      .select("id, status, payment_method")
      .eq("id", order_id)
      .single();
    if (!order) {
      return NextResponse.json({ error: "অর্ডার পাওয়া যায়নি" }, { status: 404 });
    }
    if (!["bkash", "nagad", "rocket"].includes(order.payment_method ?? "")) {
      return NextResponse.json({ error: "এই অর্ডারে ম্যানুয়াল পেমেন্ট নয়" }, { status: 400 });
    }
    if (order.status !== "pending") {
      return NextResponse.json(
        { error: "এই অর্ডারের পেমেন্ট ইতিমধ্যে জমা দেওয়া হয়েছে" },
        { status: 400 }
      );
    }

    // Prevent duplicate TrxID reuse
    const { data: dup } = await supabase
      .from("payments")
      .select("id")
      .eq("trx_id", cleanTrx)
      .limit(1);
    if (dup && dup.length > 0) {
      return NextResponse.json(
        { error: "এই TrxID ইতিমধ্যে ব্যবহার করা হয়েছে" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("payments")
      .update({
        sender_number: sender_number.trim(),
        trx_id: cleanTrx,
        status: "pending",
      })
      .eq("order_id", order.id)
      .eq("status", "pending");
    if (error) {
      return NextResponse.json({ error: "জমা দেওয়া যায়নি" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("manual payment error", e);
    return NextResponse.json({ error: "সার্ভার সমস্যা" }, { status: 500 });
  }
}
