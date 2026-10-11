import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { displayName, isStaff } from "@/lib/dmchat";

export const dynamic = "force-dynamic";

/** GET /api/admin/chat/thread/[id] — read any thread's messages (staff only). */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const client = await createClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user) return NextResponse.json({ error: "লগইন করুন" }, { status: 401 });
  const svc = createServiceClient();
  if (!(await isStaff(svc, user.id))) return NextResponse.json({ error: "অনুমতি নেই" }, { status: 403 });

  const { data: th } = await svc.from("dm_threads").select("user_a, user_b").eq("id", id).single();
  if (!th) return NextResponse.json({ error: "চ্যাট পাওয়া যায়নি" }, { status: 404 });
  const { data: pa } = await svc.from("profiles").select("full_name, email").eq("id", (th as any).user_a).single();
  const { data: pb } = await svc.from("profiles").select("full_name, email").eq("id", (th as any).user_b).single();
  const { data: msgs } = await svc
    .from("dm_messages")
    .select("id, sender_id, body, created_at")
    .eq("thread_id", id)
    .order("created_at", { ascending: true })
    .limit(200);
  const names: Record<string, string> = {
    [(th as any).user_a]: displayName(pa as any),
    [(th as any).user_b]: displayName(pb as any),
  };
  return NextResponse.json({
    a_name: names[(th as any).user_a],
    b_name: names[(th as any).user_b],
    messages: ((msgs ?? []) as any[]).map((m) => ({ ...m, sender_name: names[m.sender_id] ?? "ইউজার" })),
  });
}

/** POST /api/admin/chat/thread/[id] — staff sends a message as the site owner. */
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const client = await createClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user) return NextResponse.json({ error: "লগইন করুন" }, { status: 401 });
  const svc = createServiceClient();
  if (!(await isStaff(svc, user.id))) return NextResponse.json({ error: "অনুমতি নেই" }, { status: 403 });

  const { data: th } = await svc.from("dm_threads").select("user_a, user_b").eq("id", id).single();
  if (!th) return NextResponse.json({ error: "চ্যাট পাওয়া যায়নি" }, { status: 404 });

  const { body } = (await req.json().catch(() => ({}))) as { body?: string };
  const text = String(body ?? "").trim().slice(0, 1000);
  if (!text) return NextResponse.json({ error: "মেসেজ লিখুন" }, { status: 400 });

  const { data: msg, error } = await svc
    .from("dm_messages")
    .insert({ thread_id: id, sender_id: user.id, body: `🏪 [সাইট ওনার] ${text}` })
    .select("id, sender_id, body, created_at")
    .single();
  if (error || !msg) return NextResponse.json({ error: "পাঠানো যায়নি" }, { status: 500 });
  await svc.from("dm_threads").update({ last_msg_at: new Date().toISOString() }).eq("id", id);

  return NextResponse.json({ message: { ...(msg as any), sender_name: "🏪 সাইট ওনার" } });
}
