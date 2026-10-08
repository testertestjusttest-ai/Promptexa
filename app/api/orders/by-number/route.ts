import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

/** GET /api/orders/by-number?number=DP-... — public order status lookup (no keys). */
export async function GET(req: Request) {
  const number = new URL(req.url).searchParams.get("number");
  if (!number) {
    return NextResponse.json({ error: "number আবশ্যক" }, { status: 400 });
  }
  const supabase = createServiceClient();
  const { data: order } = await supabase
    .from("orders")
    .select(
      "id, order_number, status, payment_method, total_bdt, customer_name, created_at"
    )
    .eq("order_number", number)
    .single();
  if (!order) {
    return NextResponse.json({ error: "অর্ডার পাওয়া যায়নি" }, { status: 404 });
  }
  const { data: items } = await supabase
    .from("order_items")
    .select("product_name, plan_label_bn, price_bdt, qty")
    .eq("order_id", order.id);

  const { id: _omit, ...publicOrder } = order;
  return NextResponse.json({ ok: true, order: publicOrder, items: items ?? [] });
}
