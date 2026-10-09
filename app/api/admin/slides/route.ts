import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin";

/** GET /api/admin/slides — all slides */
export async function GET() {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;
  const { data, error } = await auth.svc
    .from("slides")
    .select("*")
    .order("sort");
  if (error) return NextResponse.json({ error: "লোড হয়নি" }, { status: 500 });
  return NextResponse.json({ ok: true, slides: data });
}

/** POST — create slide */
export async function POST(req: Request) {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;
  const b = await req.json();
  if (!b.title_bn?.trim()) {
    return NextResponse.json({ error: "টাইটেল দিন" }, { status: 400 });
  }
  const { data, error } = await auth.svc
    .from("slides")
    .insert({
      title_bn: b.title_bn.trim(),
      subtitle_bn: b.subtitle_bn ?? "",
      cta_text: b.cta_text || "এখনই কিনুন",
      cta_link: b.cta_link || "/shop",
      image_url: b.image_url || null,
      bg_from: b.bg_from || "#8b5cf6",
      bg_to: b.bg_to || "#d7ff3f",
      sort: b.sort ?? 0,
      is_active: b.is_active ?? true,
    })
    .select("id")
    .single();
  if (error) return NextResponse.json({ error: "তৈরি হয়নি" }, { status: 400 });
  return NextResponse.json({ ok: true, id: data.id });
}

/** PUT — update slide { id, ...patch } */
export async function PUT(req: Request) {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;
  const b = await req.json();
  const { id, ...patch } = b;
  if (!id) return NextResponse.json({ error: "id আবশ্যক" }, { status: 400 });
  const { error } = await auth.svc.from("slides").update(patch).eq("id", id);
  if (error) return NextResponse.json({ error: "আপডেট হয়নি" }, { status: 400 });
  return NextResponse.json({ ok: true });
}

/** DELETE /api/admin/slides?id= */
export async function DELETE(req: Request) {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id আবশ্যক" }, { status: 400 });
  await auth.svc.from("slides").delete().eq("id", id);
  return NextResponse.json({ ok: true });
}
