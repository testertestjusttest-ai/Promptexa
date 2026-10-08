import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin";

/** GET /api/admin/keys?product_id= — list keys (newest first) */
export async function GET(req: Request) {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;
  const { svc } = auth;

  const productId = new URL(req.url).searchParams.get("product_id");
  let q = svc
    .from("product_keys")
    .select("id, key_text, key_note, is_used, created_at, plan:plans(label_bn), product:products(name)")
    .order("created_at", { ascending: false })
    .limit(200);
  if (productId) q = q.eq("product_id", productId);
  const { data, error } = await q;
  if (error) return NextResponse.json({ error: "লোড হয়নি" }, { status: 500 });
  return NextResponse.json({ ok: true, keys: data });
}

/**
 * POST /api/admin/keys — bulk add keys
 * Body: { product_id, plan_id?, note?, keys_text } (one key per line)
 */
export async function POST(req: Request) {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;
  const { svc } = auth;

  try {
    const { product_id, plan_id, note, keys_text } = (await req.json()) as {
      product_id: string;
      plan_id?: string | null;
      note?: string;
      keys_text: string;
    };
    if (!product_id || !keys_text?.trim()) {
      return NextResponse.json({ error: "প্রোডাক্ট ও কী লিখুন" }, { status: 400 });
    }
    const lines = keys_text
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length === 0 || lines.length > 500) {
      return NextResponse.json({ error: "১–৫০০টি কী দিন" }, { status: 400 });
    }

    const { error } = await svc.from("product_keys").insert(
      lines.map((key_text) => ({
        product_id,
        plan_id: plan_id || null,
        key_text,
        key_note: note?.trim() || null,
      }))
    );
    if (error) throw error;
    return NextResponse.json({ ok: true, added: lines.length });
  } catch (e) {
    console.error("add keys error", e);
    return NextResponse.json({ error: "যোগ করা যায়নি" }, { status: 500 });
  }
}

/** DELETE /api/admin/keys?id= — delete an UNUSED key */
export async function DELETE(req: Request) {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;
  const { svc } = auth;

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id আবশ্যক" }, { status: 400 });

  const { data: key } = await svc.from("product_keys").select("is_used").eq("id", id).single();
  if (!key) return NextResponse.json({ error: "পাওয়া যায়নি" }, { status: 404 });
  if (key.is_used) {
    return NextResponse.json({ error: "ব্যবহৃত কী মোছা যাবে না" }, { status: 400 });
  }
  await svc.from("product_keys").delete().eq("id", id);
  return NextResponse.json({ ok: true });
}
