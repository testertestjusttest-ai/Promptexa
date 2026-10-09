import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin";
import { getAdsConfig, type AdsConfig, type AdPlacement } from "@/lib/catalog";

const PLACEMENTS: AdPlacement[] = ["home_top", "home_bottom", "product_page", "popup", "sitewide"];

/** GET /api/admin/ads — current ad config (slots + master switch) */
export async function GET() {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;
  const ads = await getAdsConfig();
  return NextResponse.json({ ads });
}

/** PUT /api/admin/ads — save ad config */
export async function PUT(req: Request) {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;
  const { svc } = auth;

  let body: Partial<AdsConfig>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "ভুল ডাটা" }, { status: 400 });
  }

  const slots = Array.isArray(body.slots) ? body.slots : [];
  const clean = slots
    .filter((s) => s && typeof s.id === "string" && s.id.trim() !== "")
    .map((s, i) => ({
      id: s.id.trim().slice(0, 64) || `slot_${i}`,
      name: String(s.name ?? s.id).slice(0, 80),
      placement: (PLACEMENTS as string[]).includes(s.placement) ? s.placement : ("sitewide" as AdPlacement),
      code: String(s.code ?? "").slice(0, 20000),
      enabled: s.enabled !== false,
    }));
  // unique ids
  const seen = new Set<string>();
  for (const s of clean) {
    let id = s.id;
    let n = 2;
    while (seen.has(id)) id = `${s.id}_${n++}`;
    s.id = id;
    seen.add(id);
  }

  const value = {
    master_enabled: body.master_enabled !== false,
    slots: clean,
  };

  const { error } = await svc
    .from("site_settings")
    .upsert({ key: "ads", value, updated_at: new Date().toISOString() }, { onConflict: "key" });
  if (error) return NextResponse.json({ error: "সেভ হয়নি" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
