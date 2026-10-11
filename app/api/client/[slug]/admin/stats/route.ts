import { NextResponse } from "next/server";
import { requireClientAdmin } from "../_auth";

export const dynamic = "force-dynamic";

/** GET /api/client/{slug}/admin/stats — dashboard: revenue, orders, profit/loss. */
export async function GET(req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const auth = await requireClientAdmin(req, slug);
  if (auth.error) return auth.error;
  const { svc } = auth;

  const { data: orders } = await svc
    .from("client_orders")
    .select("total_bdt, status, created_at")
    .eq("client_slug", slug)
    .order("created_at", { ascending: false })
    .limit(500);

  const list = (orders ?? []) as any[];
  const valid = list.filter((o) => o.status !== "cancelled");
  const revenue = valid.reduce((s, o) => s + Number(o.total_bdt || 0), 0);
  const pending = list.filter((o) => o.status === "pending").length;
  const delivered = list.filter((o) => o.status === "delivered").length;

  // Last 7 days revenue
  const days: { d: string; v: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const dt = new Date();
    dt.setDate(dt.getDate() - i);
    const key = dt.toISOString().slice(0, 10);
    const v = valid.filter((o) => String(o.created_at).slice(0, 10) === key)
      .reduce((s, o) => s + Number(o.total_bdt || 0), 0);
    days.push({ d: key.slice(5), v: Math.round(v) });
  }

  const { count: prodCount } = await svc
    .from("client_products")
    .select("id", { count: "exact", head: true })
    .eq("client_slug", slug)
    .eq("is_active", true);

  return NextResponse.json({
    revenue: Math.round(revenue),
    orders: list.length,
    pending,
    delivered,
    products: prodCount ?? 0,
    chart: days,
    recent: list.slice(0, 5),
  });
}
