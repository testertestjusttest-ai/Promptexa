import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin";
import { normalizePromoCode } from "@/lib/promo";

/** GET /api/admin/promos — list all promo codes */
export async function GET() {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;
  const { data, error } = await auth.svc
    .from("promo_codes")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: "লোড হয়নি" }, { status: 500 });
  return NextResponse.json({ ok: true, promos: data });
}

/** POST — create a promo code */
export async function POST(req: Request) {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;
  const b = await req.json();

  const code = normalizePromoCode(String(b.code || ""));
  if (!code || code.length < 3)
    return NextResponse.json({ error: "কমপক্ষে ৩ অক্ষরের কোড দিন (A-Z, 0-9)" }, { status: 400 });
  const discount_percent = Math.floor(Number(b.discount_percent));
  if (!discount_percent || discount_percent < 1 || discount_percent > 90)
    return NextResponse.json({ error: "ছাড় ১–৯০% এর মধ্যে দিন" }, { status: 400 });

  const max_uses =
    b.max_uses === "" || b.max_uses == null ? null : Math.max(1, Math.floor(Number(b.max_uses)));
  const min_order_bdt =
    b.min_order_bdt == null || b.min_order_bdt === "" ? 0 : Math.max(0, Math.floor(Number(b.min_order_bdt)));
  const expires_at = b.expires_at ? new Date(b.expires_at).toISOString() : null;

  const { data, error } = await auth.svc
    .from("promo_codes")
    .insert({
      code,
      label_bn: String(b.label_bn || "").trim().slice(0, 120) || null,
      discount_percent,
      max_uses,
      min_order_bdt,
      expires_at,
      is_active: b.is_active !== false,
    })
    .select("id")
    .single();
  if (error) {
    const msg =
      String(error.message || "").includes("duplicate") || (error as { code?: string }).code === "23505"
        ? "এই কোড আগে থেকেই আছে — অন্য নাম দিন"
        : "তৈরি হয়নি";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
  return NextResponse.json({ ok: true, id: data.id });
}

/** PATCH — toggle active / edit fields */
export async function PATCH(req: Request) {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;
  const b = await req.json();
  if (!b.id) return NextResponse.json({ error: "id দিন" }, { status: 400 });
  const patch: Record<string, unknown> = {};
  if (typeof b.is_active === "boolean") patch.is_active = b.is_active;
  if (b.label_bn !== undefined) patch.label_bn = String(b.label_bn).trim().slice(0, 120) || null;
  if (b.expires_at !== undefined)
    patch.expires_at = b.expires_at ? new Date(b.expires_at).toISOString() : null;
  if (b.max_uses !== undefined)
    patch.max_uses = b.max_uses === "" || b.max_uses == null ? null : Math.max(1, Math.floor(Number(b.max_uses)));
  if (Object.keys(patch).length === 0)
    return NextResponse.json({ error: "বদলানোর কিছু নেই" }, { status: 400 });
  const { error } = await auth.svc.from("promo_codes").update(patch).eq("id", b.id);
  if (error) return NextResponse.json({ error: "আপডেট হয়নি" }, { status: 400 });
  return NextResponse.json({ ok: true });
}

/** DELETE /api/admin/promos?id= — delete a promo code */
export async function DELETE(req: Request) {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id দিন" }, { status: 400 });
  const { error } = await auth.svc.from("promo_codes").delete().eq("id", id);
  if (error) return NextResponse.json({ error: "মোছা যায়নি" }, { status: 400 });
  return NextResponse.json({ ok: true });
}
