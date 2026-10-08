import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin";

/** POST — create plan { product_id, label_bn, duration_days, price_bdt, old_price_bdt, is_popular, sort } */
export async function POST(req: Request) {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;
  const body = await req.json();
  if (!body.product_id || !body.label_bn || !body.price_bdt) {
    return NextResponse.json({ error: "প্ল্যানের তথ্য দিন" }, { status: 400 });
  }
  const { data, error } = await auth.svc
    .from("plans")
    .insert({
      product_id: body.product_id,
      label_bn: body.label_bn,
      duration_days: body.duration_days || null,
      price_bdt: body.price_bdt,
      old_price_bdt: body.old_price_bdt || null,
      is_popular: !!body.is_popular,
      is_active: body.is_active ?? true,
      sort: body.sort ?? 0,
    })
    .select("id")
    .single();
  if (error) return NextResponse.json({ error: "তৈরি হয়নি" }, { status: 400 });
  return NextResponse.json({ ok: true, id: data.id });
}

/** PUT — update plan { id, ...patch } */
export async function PUT(req: Request) {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;
  const body = await req.json();
  const { id, ...patch } = body;
  if (!id) return NextResponse.json({ error: "id আবশ্যক" }, { status: 400 });
  const { error } = await auth.svc.from("plans").update(patch).eq("id", id);
  if (error) return NextResponse.json({ error: "আপডেট হয়নি" }, { status: 400 });
  return NextResponse.json({ ok: true });
}

/** DELETE /api/admin/plans?id= */
export async function DELETE(req: Request) {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id আবশ্যক" }, { status: 400 });
  const { error } = await auth.svc.from("plans").delete().eq("id", id);
  if (error) return NextResponse.json({ error: "মোছা যায়নি" }, { status: 400 });
  return NextResponse.json({ ok: true });
}
