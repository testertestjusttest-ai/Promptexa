import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { getValidPromo } from "@/lib/promo";

/**
 * POST /api/promos/validate
 * Body: { code, total_bdt } → { ok, code, label_bn, discount_percent, discount_bdt }
 * Public — used by checkout before placing the order. Final enforcement
 * happens server-side in /api/checkout.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const svc = createServiceClient();
    const r = await getValidPromo(svc, String(body?.code || ""), Number(body?.total_bdt) || 0);
    if (!r.ok) return NextResponse.json({ ok: false, error: r.error });
    return NextResponse.json({
      ok: true,
      code: r.promo.code,
      label_bn: r.promo.label_bn,
      discount_percent: r.promo.discount_percent,
      discount_bdt: r.discount_bdt,
    });
  } catch {
    return NextResponse.json({ ok: false, error: "সার্ভার সমস্যা" });
  }
}
