import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

/** GET /api/notifications — my recent notifications + unread count. */
export async function GET() {
  try {
    const client = await createClient();
    const {
      data: { user },
    } = await client.auth.getUser();
    if (!user) return NextResponse.json({ ok: true, items: [], unread: 0 });
    const svc = createServiceClient();
    const { data } = await svc
      .from("notifications")
      .select("id, title, body, link, is_read, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);
    const items = data ?? [];
    return NextResponse.json({ ok: true, items, unread: items.filter((i) => !i.is_read).length });
  } catch (e) {
    console.error("notifications error", e);
    return NextResponse.json({ error: "সার্ভার সমস্যা" }, { status: 500 });
  }
}

/** POST /api/notifications — { action: "read", id } or { action: "read_all" }. */
export async function POST(req: Request) {
  try {
    const client = await createClient();
    const {
      data: { user },
    } = await client.auth.getUser();
    if (!user) return NextResponse.json({ error: "লগইন করুন" }, { status: 401 });
    const { action, id } = (await req.json()) as Record<string, string>;
    const svc = createServiceClient();
    if (action === "read" && id) {
      await svc.from("notifications").update({ is_read: true }).eq("id", id).eq("user_id", user.id);
    } else if (action === "read_all") {
      await svc.from("notifications").update({ is_read: true }).eq("user_id", user.id).eq("is_read", false);
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("notifications update error", e);
    return NextResponse.json({ error: "সার্ভার সমস্যা" }, { status: 500 });
  }
}
