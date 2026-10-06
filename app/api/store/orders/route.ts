import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const productIds = Array.isArray(body?.productIds) ? body.productIds.map(Number).filter(Boolean) : [];
  const paymentMethod = String(body?.paymentMethod || "");
  const senderNumber = String(body?.senderNumber || "").trim();
  const transactionId = String(body?.transactionId || "").trim();
  if (!productIds.length || !paymentMethod || !senderNumber || !transactionId) {
    return NextResponse.json({ error: "Product, payment method, sender number and transaction ID are required" }, { status: 400 });
  }

  const { data: products, error: productError } = await supabase
    .from("products")
    .select("id,name,price,active")
    .in("id", productIds)
    .eq("active", true);
  if (productError || !products || products.length !== productIds.length) {
    return NextResponse.json({ error: "One or more products are unavailable" }, { status: 400 });
  }

  const total = products.reduce((sum, p) => sum + Number(p.price), 0);
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({ user_id: user.id, total, payment_method: paymentMethod, sender_number: senderNumber, transaction_id: transactionId, status: "pending" })
    .select("id,total,status")
    .single();
  if (orderError || !order) return NextResponse.json({ error: orderError?.message || "Could not create order" }, { status: 500 });

  const items = products.map((p) => ({ order_id: order.id, product_id: p.id, product_name: p.name, unit_price: p.price, quantity: 1 }));
  const { error: itemError } = await supabase.from("order_items").insert(items);
  if (itemError) {
    await supabase.from("orders").delete().eq("id", order.id);
    return NextResponse.json({ error: "Could not create order items" }, { status: 500 });
  }

  return NextResponse.json({ order });
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const { data, error } = await supabase.from("orders").select("*,order_items(*)").eq("user_id", user.id).order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ orders: data || [] });
}
