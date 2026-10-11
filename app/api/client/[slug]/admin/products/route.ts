import { NextResponse } from "next/server";
import { requireClientAdmin } from "../_auth";

export const dynamic = "force-dynamic";

/** GET — list all products (including inactive). */
export async function GET(req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const auth = await requireClientAdmin(req, slug);
  if (auth.error) return auth.error;
  const { data } = await auth.svc.from("client_products").select("*").eq("client_slug", slug).order("sort").order("created_at", { ascending: false });
  return NextResponse.json({ products: data ?? [] });
}

/** POST — create product. */
export async function POST(req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const auth = await requireClientAdmin(req, slug);
  if (auth.error) return auth.error;
  const b = (await req.json().catch(() => ({}))) as Record<string, any>;
  if (!String(b.name || "").trim()) return NextResponse.json({ error: "নাম দিন" }, { status: 400 });
  const { data, error } = await auth.svc.from("client_products").insert({
    client_slug: slug,
    name: String(b.name).trim().slice(0, 100),
    price_bdt: Math.max(0, Math.round(Number(b.price_bdt) || 0)),
    old_price_bdt: b.old_price_bdt ? Math.round(Number(b.old_price_bdt)) : null,
    image_emoji: String(b.image_emoji || "📦").slice(0, 8),
    image_url: String(b.image_url || "").slice(0, 500) || null,
    category: String(b.category || "সব").slice(0, 40),
    stock: Math.max(0, Math.round(Number(b.stock ?? 100))),
    is_active: b.is_active !== false,
  }).select("*").single();
  if (error) return NextResponse.json({ error: "সেভ হয়নি" }, { status: 500 });
  return NextResponse.json({ ok: true, product: data });
}

/** PATCH — update product. Body: { id, ...fields } */
export async function PATCH(req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const auth = await requireClientAdmin(req, slug);
  if (auth.error) return auth.error;
  const b = (await req.json().catch(() => ({}))) as Record<string, any>;
  if (!b.id) return NextResponse.json({ error: "ID দিন" }, { status: 400 });
  const allowed = ["name", "price_bdt", "old_price_bdt", "image_emoji", "image_url", "category", "stock", "is_active", "sort"];
  const patch: Record<string, any> = {};
  for (const k of allowed) if (b[k] !== undefined) patch[k] = b[k];
  const { error } = await auth.svc.from("client_products").update(patch).eq("id", b.id).eq("client_slug", slug);
  if (error) return NextResponse.json({ error: "আপডেট হয়নি" }, { status: 500 });
  return NextResponse.json({ ok: true });
}

/** DELETE — ?id= */
export async function DELETE(req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const auth = await requireClientAdmin(req, slug);
  if (auth.error) return auth.error;
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID দিন" }, { status: 400 });
  await auth.svc.from("client_products").delete().eq("id", id).eq("client_slug", slug);
  return NextResponse.json({ ok: true });
}
