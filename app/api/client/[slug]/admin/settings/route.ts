import { NextResponse } from "next/server";
import { requireClientAdmin } from "../_auth";

export const dynamic = "force-dynamic";

/** Keys the client can configure (ads, announcements...). */
const ALLOWED = [
  "ad_head",        // <head> ad code (Adsterra/Monetag)
  "ad_top",         // top banner ad HTML
  "ad_bottom",      // bottom banner ad HTML
  "ad_popup",       // popup ad HTML
  "announcement",   // announcement bar text
  "whatsapp",       // WhatsApp number override
  "hero_slides",    // JSON: [{img, title, sub}] — custom slider
  "casino_rtp",     // casino return-to-player % (owner win-chance control)
  "casino_min_bet", // casino minimum bet
  "casino_max_bet", // casino maximum bet
  "casino_banners", // JSON: [{img, title, sub, href, grad}] — casino home banners
];

/** GET — all settings. */
export async function GET(req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const auth = await requireClientAdmin(req, slug);
  if (auth.error) return auth.error;
  const { data } = await auth.svc.from("client_settings").select("key, value").eq("client_slug", slug);
  const s: Record<string, string> = {};
  for (const r of (data ?? []) as any[]) s[r.key] = r.value;
  return NextResponse.json({ settings: s });
}

/** POST — save settings. Body: { key: value, ... } */
export async function POST(req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const auth = await requireClientAdmin(req, slug);
  if (auth.error) return auth.error;
  const b = (await req.json().catch(() => ({}))) as Record<string, string>;
  const rows = [];
  for (const k of ALLOWED) {
    if (b[k] !== undefined) {
      rows.push({ client_slug: slug, key: k, value: String(b[k]).slice(0, 10000), updated_at: new Date().toISOString() });
    }
  }
  if (rows.length === 0) return NextResponse.json({ error: "কিছু নেই" }, { status: 400 });
  const { error } = await auth.svc.from("client_settings").upsert(rows, { onConflict: "client_slug,key" });
  if (error) return NextResponse.json({ error: "সেভ হয়নি" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
