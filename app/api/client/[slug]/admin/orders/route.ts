import { NextResponse } from "next/server";
import { requireClientAdmin } from "../_auth";

export const dynamic = "force-dynamic";

/** GET /api/client/{slug}/admin/orders — list orders (admin). */
export async function GET(req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const auth = await requireClientAdmin(req, slug);
  if (auth.error) return auth.error;
  const status = new URL(req.url).searchParams.get("status") || "";
  let q = auth.svc.from("client_orders").select("*").eq("client_slug", slug).order("created_at", { ascending: false }).limit(100);
  if (status) q = q.eq("status", status);
  const { data } = await q;
  return NextResponse.json({ orders: data ?? [] });
}

/** PATCH /api/client/{slug}/admin/orders — update status. Body: { id, status } */
export async function PATCH(req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const auth = await requireClientAdmin(req, slug);
  if (auth.error) return auth.error;
  const { id, status } = (await req.json().catch(() => ({}))) as { id?: string; status?: string };
  if (!id || !["pending", "confirmed", "shipped", "delivered", "cancelled"].includes(status || "")) {
    return NextResponse.json({ error: "ভুল তথ্য" }, { status: 400 });
  }
  const { error } = await auth.svc.from("client_orders").update({ status }).eq("id", id).eq("client_slug", slug);
  if (error) return NextResponse.json({ error: "আপডেট হয়নি" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
