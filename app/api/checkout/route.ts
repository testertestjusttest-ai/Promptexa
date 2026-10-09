import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { generateOrderNumber } from "@/lib/format";
import { isSslEnabled } from "@/lib/sslcommerz";
import { confirmOrderPayment } from "@/lib/delivery";

type CheckoutItem = { product_id: string; plan_id: string; qty: number };

/**
 * POST /api/checkout
 * Body: { customer: {name, phone, email?}, items: [{product_id, plan_id, qty}], payment_method, notes? }
 * Prices are ALWAYS read from the database — never trusted from the client.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { customer, items, payment_method, notes } = body as {
      customer: { name: string; phone: string; email?: string };
      items: CheckoutItem[];
      payment_method: string;
      notes?: string;
    };

    if (!customer?.name?.trim() || !customer?.phone?.trim()) {
      return NextResponse.json(
        { error: "নাম ও মোবাইল নম্বর আবশ্যক" },
        { status: 400 }
      );
    }
    if (!Array.isArray(items) || items.length === 0 || items.length > 20) {
      return NextResponse.json({ error: "কার্ট খালি" }, { status: 400 });
    }
    const validMethods = ["sslcommerz", "bkash", "nagad", "rocket", "wallet"];
    if (!validMethods.includes(payment_method)) {
      return NextResponse.json({ error: "ভুল পেমেন্ট মাধ্যম" }, { status: 400 });
    }
    if (payment_method === "sslcommerz" && !isSslEnabled()) {
      return NextResponse.json(
        { error: "কার্ড পেমেন্ট এখন বন্ধ আছে" },
        { status: 400 }
      );
    }

    // Link to signed-in user if any (guest checkout allowed, but wallet needs login)
    let userId: string | null = null;
    try {
      const client = await createClient();
      const {
        data: { user },
      } = await client.auth.getUser();
      userId = user?.id ?? null;
    } catch {
      /* guest */
    }
    if (payment_method === "wallet" && !userId) {
      return NextResponse.json(
        { error: "ওয়ালেট দিয়ে কিনতে লগইন করুন" },
        { status: 401 }
      );
    }

    const supabase = createServiceClient();

    // Validate items + compute total from DB prices
    const planIds = [...new Set(items.map((i) => i.plan_id))];
    const { data: plans, error: planErr } = await supabase
      .from("plans")
      .select("id, product_id, label_bn, price_bdt, is_active, product:products(id, name, is_active)")
      .in("id", planIds);
    if (planErr || !plans) {
      return NextResponse.json({ error: "প্ল্যান লোড করা যায়নি" }, { status: 500 });
    }

    const orderItems: {
      product_id: string;
      plan_id: string;
      product_name: string;
      plan_label_bn: string;
      price_bdt: number;
      qty: number;
    }[] = [];

    for (const item of items) {
      const plan = (plans as unknown as {
        id: string;
        product_id: string;
        label_bn: string;
        price_bdt: number;
        is_active: boolean;
        product: { id: string; name: string; is_active: boolean } | null;
      }[]).find((p) => p.id === item.plan_id);
      const qty = Math.min(Math.max(1, Math.floor(item.qty || 1)), 9);
      if (!plan || !plan.is_active || !plan.product?.is_active) {
        return NextResponse.json(
          { error: "একটি প্রোডাক্ট এখন আর পাওয়া যাচ্ছে না" },
          { status: 400 }
        );
      }
      orderItems.push({
        product_id: plan.product_id,
        plan_id: plan.id,
        product_name: plan.product.name,
        plan_label_bn: plan.label_bn,
        price_bdt: plan.price_bdt,
        qty,
      });
    }

    const total = orderItems.reduce((n, i) => n + i.price_bdt * i.qty, 0);
    if (total <= 0) {
      return NextResponse.json({ error: "ভুল অর্ডার" }, { status: 400 });
    }

    // wallet: atomic debit BEFORE creating the order
    if (payment_method === "wallet") {
      const { data: spendRes, error: spendErr } = await supabase.rpc("wallet_spend", {
        p_user: userId,
        p_amount: total,
        p_note: "DigiPlyra অর্ডার",
        p_ref: null,
      });
      if (spendErr || !(spendRes as { ok: boolean })?.ok) {
        return NextResponse.json(
          { error: "ওয়ালেটে যথেষ্ট ব্যালেন্স নেই — অ্যাড দেখে আয় করুন!" },
          { status: 400 }
        );
      }
    }

    const order_number = generateOrderNumber();

    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert({
        order_number,
        user_id: userId,
        customer_name: customer.name.trim(),
        customer_phone: customer.phone.trim(),
        customer_email: customer.email?.trim() || null,
        status:
          payment_method === "wallet"
            ? "paid"
            : payment_method === "sslcommerz"
              ? "payment_pending"
              : "pending",
        payment_method,
        total_bdt: total,
        notes: (notes || "").trim().slice(0, 2000) || null,
      })
      .select("id, order_number")
      .single();
    if (orderErr || !order) {
      return NextResponse.json({ error: "অর্ডার তৈরি করা যায়নি" }, { status: 500 });
    }

    const { error: itemsErr } = await supabase.from("order_items").insert(
      orderItems.map((i) => ({ ...i, order_id: order.id }))
    );
    if (itemsErr) {
      await supabase.from("orders").delete().eq("id", order.id);
      return NextResponse.json({ error: "অর্ডার তৈরি করা যায়নি" }, { status: 500 });
    }

    await supabase.from("payments").insert({
      order_id: order.id,
      method: payment_method,
      amount_bdt: total,
      status: payment_method === "wallet" ? "success" : "pending",
    });

    // wallet = instant payment → deliver immediately
    if (payment_method === "wallet") {
      await confirmOrderPayment(supabase, order.id, { method: "wallet" });
      return NextResponse.json({
        ok: true,
        order_id: order.id,
        order_number: order.order_number,
        total_bdt: total,
        paid: true,
      });
    }

    return NextResponse.json({
      ok: true,
      order_id: order.id,
      order_number: order.order_number,
      total_bdt: total,
    });
  } catch (e) {
    console.error("checkout error", e);
    return NextResponse.json({ error: "সার্ভার সমস্যা" }, { status: 500 });
  }
}
