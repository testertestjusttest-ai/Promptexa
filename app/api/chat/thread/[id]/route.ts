import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { chatEnabled, displayName, isStaff } from "@/lib/dmchat";
import { pushNotification } from "@/lib/notify";

export const dynamic = "force-dynamic";

/** GET /api/chat/thread/[id] — messages (participant or staff only). */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const client = await createClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user) return NextResponse.json({ error: "লগইন করুন" }, { status: 401 });
  const svc = createServiceClient();

  const { data: th } = await svc.from("dm_threads").select("user_a, user_b").eq("id", id).single();
  if (!th) return NextResponse.json({ error: "চ্যাট পাওয়া যায়নি" }, { status: 404 });
  const staff = await isStaff(svc, user.id);
  if ((th as any).user_a !== user.id && (th as any).user_b !== user.id && !staff) {
    return NextResponse.json({ error: "অনুমতি নেই" }, { status: 403 });
  }
  const otherId = (th as any).user_a === user.id ? (th as any).user_b : (th as any).user_a;
  const { data: prof } = await svc.from("profiles").select("full_name, email").eq("id", otherId).single();
  const { data: msgs } = await svc
    .from("dm_messages")
    .select("id, sender_id, body, created_at")
    .eq("thread_id", id)
    .order("created_at", { ascending: true })
    .limit(200);
  return NextResponse.json({
    other_name: displayName(prof as any),
    messages: ((msgs ?? []) as any[]).map((m) => ({ ...m, mine: m.sender_id === user.id })),
  });
}

/** POST /api/chat/thread/[id] { body } — send (participant only). */
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const client = await createClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user) return NextResponse.json({ error: "লগইন করুন" }, { status: 401 });
  const svc = createServiceClient();
  if (!(await chatEnabled(svc))) return NextResponse.json({ error: "চ্যাট এখন বন্ধ আছে" }, { status: 403 });

  const { data: th } = await svc.from("dm_threads").select("user_a, user_b").eq("id", id).single();
  if (!th) return NextResponse.json({ error: "চ্যাট পাওয়া যায়নি" }, { status: 404 });
  if ((th as any).user_a !== user.id && (th as any).user_b !== user.id) {
    return NextResponse.json({ error: "অনুমতি নেই" }, { status: 403 });
  }
  const { body } = (await req.json().catch(() => ({}))) as { body?: string };
  const text = String(body ?? "").trim().slice(0, 1000);
  if (!text) return NextResponse.json({ error: "মেসেজ লিখুন" }, { status: 400 });

  const { data: msg, error } = await svc
    .from("dm_messages")
    .insert({ thread_id: id, sender_id: user.id, body: text })
    .select("id, sender_id, body, created_at")
    .single();
  if (error || !msg) return NextResponse.json({ error: "পাঠানো যায়নি" }, { status: 500 });
  await svc.from("dm_threads").update({ last_msg_at: new Date().toISOString() }).eq("id", id);

  const otherId = (th as any).user_a === user.id ? (th as any).user_b : (th as any).user_a;
  const { data: me } = await svc.from("profiles").select("full_name, email").eq("id", user.id).single();
  try {
    await pushNotification(svc, otherId, `💬 ${displayName(me as any)}`, text.slice(0, 80), `/chat?thread=${id}`);
  } catch {}
  return NextResponse.json({ message: { ...(msg as any), mine: true } });
}
