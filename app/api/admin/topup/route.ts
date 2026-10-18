import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin";

export const dynamic = "force-dynamic";

/** GET — all packages (incl. inactive) */
export async function GET() {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;
  const { data, error } = await auth.svc
    .from("topup_packages")
    .select("*")
    .order("sort")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: "লোড হয়নি" }, { status: 500 });
  return NextResponse.json({ ok: true, packages: data });
}

function clean(b: Record<string, unknown>) {
  return {
    name: String(b.name || "").trim().slice(0, 120),
    kind: b.kind === "membership" ? "membership" : "diamond",
    diamonds: Math.max(0, Math.floor(Number(b.diamonds) || 0)),
    bonus: Math.max(0, Math.floor(Number(b.bonus) || 0)),
    price_bdt: Math.max(0, Number(b.price_bdt) || 0),
    old_price_bdt: b.old_price_bdt ? Number(b.old_price_bdt) : null,
    badge: String(b.badge || "").trim().slice(0, 40) || null,
    sort: Math.floor(Number(b.sort) || 0),
    is_active: b.is_active !== false,
  };
}

/** POST — create package */
export async function POST(req: Request) {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;
  const b = await req.json();
  const row = clean(b);
  if (!row.name) return NextResponse.json({ error: "প্যাকেজের নাম দিন" }, { status: 400 });
  if (row.price_bdt <= 0) return NextResponse.json({ error: "দাম দিন" }, { status: 400 });
  const { data, error } = await auth.svc.from("topup_packages").insert(row).select("id").single();
  if (error) return NextResponse.json({ error: "তৈরি হয়নি" }, { status: 500 });
  return NextResponse.json({ ok: true, id: data.id });
}

/** PUT — update package (?id=) */
export async function PUT(req: Request) {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id নেই" }, { status: 400 });
  const row = clean(await req.json());
  const { error } = await auth.svc.from("topup_packages").update(row).eq("id", id);
  if (error) return NextResponse.json({ error: "আপডেট হয়নি" }, { status: 500 });
  return NextResponse.json({ ok: true });
}

/** DELETE — delete package (?id=) */
export async function DELETE(req: Request) {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id নেই" }, { status: 400 });
  const { error } = await auth.svc.from("topup_packages").delete().eq("id", id);
  if (error) return NextResponse.json({ error: "ডিলিট হয়নি" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
