import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin";

/** GET /api/admin/products — all products with plans + categories */
export async function GET() {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;
  const { data, error } = await auth.svc
    .from("products")
    .select("*, category:categories(id, name_bn), plans(*)")
    .order("sort");
  if (error) return NextResponse.json({ error: "লোড হয়নি" }, { status: 500 });
  return NextResponse.json({ ok: true, products: data });
}

/** POST — create product */
export async function POST(req: Request) {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;
  const body = await req.json();
  const { data, error } = await auth.svc
    .from("products")
    .insert({
      slug: body.slug,
      name: body.name,
      tagline_bn: body.tagline_bn ?? "",
      description_bn: body.description_bn ?? "",
      features_bn: body.features_bn ?? [],
      delivery_note_bn: body.delivery_note_bn ?? "",
      badge: body.badge ?? "✦",
      badge_bg: body.badge_bg ?? "#8b5cf6",
      category_id: body.category_id || null,
      is_active: body.is_active ?? true,
      is_featured: body.is_featured ?? false,
      sort: body.sort ?? 0,
    })
    .select("id")
    .single();
  if (error) {
    return NextResponse.json({ error: "তৈরি হয়নি (slug ইউনিক হতে হবে)" }, { status: 400 });
  }
  return NextResponse.json({ ok: true, id: data.id });
}

/** PUT — update product */
export async function PUT(req: Request) {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;
  const body = await req.json();
  const { id, ...patch } = body;
  if (!id) return NextResponse.json({ error: "id আবশ্যক" }, { status: 400 });
  const { error } = await auth.svc.from("products").update(patch).eq("id", id);
  if (error) return NextResponse.json({ error: "আপডেট হয়নি" }, { status: 400 });
  return NextResponse.json({ ok: true });
}

/** DELETE /api/admin/products?id= */
export async function DELETE(req: Request) {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id আবশ্যক" }, { status: 400 });
  const { error } = await auth.svc.from("products").delete().eq("id", id);
  if (error) return NextResponse.json({ error: "মোছা যায়নি" }, { status: 400 });
  return NextResponse.json({ ok: true });
}
