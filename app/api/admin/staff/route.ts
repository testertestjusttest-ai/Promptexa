import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin";

/**
 * GET /api/admin/staff — list users (search by email).
 * POST — { action: "set_support", user_id, value } — admin only.
 */
export async function GET(req: Request) {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;
  try {
    const q = new URL(req.url).searchParams.get("q")?.trim() ?? "";
    let query = auth.svc
      .from("profiles")
      .select("id, email, full_name, is_admin, is_support, created_at")
      .order("created_at", { ascending: false })
      .limit(20);
    if (q) query = query.ilike("email", `%${q}%`);
    const { data } = await query;
    return NextResponse.json({ ok: true, users: data ?? [] });
  } catch (e) {
    console.error("staff list error", e);
    return NextResponse.json({ error: "সার্ভার সমস্যা" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;
  if (auth.role !== "admin") {
    return NextResponse.json({ error: "শুধু মূল অ্যাডমিন" }, { status: 403 });
  }
  try {
    const { action, user_id, value } = (await req.json()) as Record<string, unknown>;
    if (action === "set_support" && typeof user_id === "string") {
      // never demote a full admin via this toggle
      const { data: target } = await auth.svc
        .from("profiles")
        .select("is_admin")
        .eq("id", user_id)
        .single();
      if (target?.is_admin) {
        return NextResponse.json({ error: "ফুল অ্যাডমিনের রোল বদলানো যাবে না" }, { status: 400 });
      }
      await auth.svc.from("profiles").update({ is_support: !!value }).eq("id", user_id);
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: "ভুল অ্যাকশন" }, { status: 400 });
  } catch (e) {
    console.error("staff update error", e);
    return NextResponse.json({ error: "সার্ভার সমস্যা" }, { status: 500 });
  }
}
