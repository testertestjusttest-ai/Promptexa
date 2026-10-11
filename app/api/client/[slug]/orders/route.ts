import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function orderNo(): string {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  return `ORD-${ymd}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

/**
 * POST /api/client/{slug}/orders — place an order (public, no auth).
 * Body: { customer_name, customer_phone, customer_address?, items: [{name, price, qty}], total_bdt, payment_method? }
 */
export async function POST(req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const svc = createServiceClient();
  const b = (await req.json().catch(() => ({}))) as Record<string, any>;

  const name = String(b.customer_name || "").trim();
  const phone = String(b.customer_phone || "").trim();
  const items = Array.isArray(b.items) ? b.items : [];
  const total = Math.round(Number(b.total_bdt) || 0);

  if (name.length < 3) return NextResponse.json({ error: "আপনার নাম দিন" }, { status: 400 });
  if (!/^01[3-9]\d{8}$/.test(phone)) return NextResponse.json({ error: "সঠিক মোবাইল নম্বর দিন" }, { status: 400 });
  if (items.length === 0 || total <= 0) return NextResponse.json({ error: "কার্ট খালি" }, { status: 400 });

  const { data, error } = await svc.from("client_orders").insert({
    client_slug: slug,
    order_no: orderNo(),
    customer_name: name,
    customer_phone: phone,
    customer_address: String(b.customer_address || "").trim() || null,
    items: items.map((it: any) => ({
      name: String(it.name || "").slice(0, 100),
      price: Math.round(Number(it.price) || 0),
      qty: Math.min(99, Math.max(1, Math.round(Number(it.qty) || 1))),
      emoji: String(it.emoji || "📦").slice(0, 8),
    })),
    total_bdt: total,
    payment_method: String(b.payment_method || "cod").slice(0, 20),
  }).select("id, order_no").single();

  if (error || !data) {
    return NextResponse.json({ error: "অর্�্ডার হয়নি — আবার চেষ্টা করুন" }, { status: 500 });
  }
  return NextResponse.json({ ok: true, order_no: (data as any).order_no, id: (data as any).id });
}

/**
 * GET /api/client/{slug}/orders?phone=01... — track orders by phone (public).
 */
export async function GET(req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const phone = new URL(req.url).searchParams.get("phone")?.trim() || "";
  if (!/^01[3-9]\d{8}$/.test(phone)) return NextResponse.json({ orders: [] });
  const svc = createServiceClient();
  const { data } = await svc
    .from("client_orders")
    .select("order_no, items, total_bdt, status, payment_status, created_at")
    .eq("client_slug", slug)
    .eq("customer_phone", phone)
    .order("created_at", { ascending: false })
    .limit(20);
  return NextResponse.json({ orders: data ?? [] });
}
