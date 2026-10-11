import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { hashPin, signToken, verifyToken } from "../_auth";

export const dynamic = "force-dynamic";

/**
 * POST /api/client/{slug}/admin/auth
 * Body: { pin }
 * - If no PIN set yet: sets it (first-time setup)
 * - Else: verifies it
 * Returns a 7-day token.
 */
export async function POST(req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const { pin } = (await req.json().catch(() => ({}))) as { pin?: string };
  if (!pin || pin.length < 4 || pin.length > 12 || !/^\d+$/.test(pin)) {
    return NextResponse.json({ error: "৪–১২ সংখ্যার PIN দিন" }, { status: 400 });
  }

  const svc = createServiceClient();
  const { data: site } = await svc.from("client_sites").select("id, admin_pin_hash").eq("slug", slug).eq("is_active", true).single();
  if (!site) return NextResponse.json({ error: "সাইট পাওয়া যায়নি" }, { status: 404 });

  if (!(site as any).admin_pin_hash) {
    // First-time setup
    await svc.from("client_sites").update({ admin_pin_hash: hashPin(pin) }).eq("id", (site as any).id);
    return NextResponse.json({ ok: true, token: signToken(slug), first: true });
  }

  if ((site as any).admin_pin_hash !== hashPin(pin)) {
    return NextResponse.json({ error: "ভুল PIN" }, { status: 401 });
  }
  return NextResponse.json({ ok: true, token: signToken(slug) });
}

/** GET verifies an existing token. */
export async function GET(req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const token = req.headers.get("x-client-token") || "";
  if (!verifyToken(token, slug)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  return NextResponse.json({ ok: true });
}
