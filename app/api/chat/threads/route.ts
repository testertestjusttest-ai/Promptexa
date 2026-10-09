import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { canonPair, chatEnabled, displayName } from "@/lib/dmchat";

export const dynamic = "force-dynamic";

/** GET /api/chat/threads — my conversations. */
export async function GET() {
  const client = await createClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user) return NextResponse.json({ error: "লগইন করুন" }, { status: 401 });
  const svc = createServiceClient();
  if (!(await chatEnabled(svc))) return NextResponse.json({ error: "চ্যাট এখন বন্ধ আছে" }, { status: 403 });

  const { data: threads } = await svc
    .from("dm_threads")
    .select("id, user_a, user_b, last_msg_at")
    .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
    .order("last_msg_at", { ascending: false })
    .limit(50);

  const out = [];
  for (const t of (threads ?? []) as any[]) {
    const otherId = t.user_a === user.id ? t.user_b : t.user_a;
    const { data: prof } = await svc.from("profiles").select("full_name, email").eq("id", otherId).single();
    const { data: last } = await svc
      .from("dm_messages")
      .select("body, sender_id, created_at")
      .eq("thread_id", t.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    out.push({
      id: t.id,
      other_id: otherId,
      other_name: displayName(prof as any),
      last_body: (last as any)?.body?.slice(0, 60) ?? "",
      last_mine: (last as any)?.sender_id === user.id,
      last_at: (last as any)?.created_at ?? t.last_msg_at,
    });
  }
  return NextResponse.json({ threads: out });
}

/** POST /api/chat/threads { user_id } — get or create a 1:1 thread. */
export async function POST(req: Request) {
  const client = await createClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user) return NextResponse.json({ error: "লগইন করুন" }, { status: 401 });
  const svc = createServiceClient();
  if (!(await chatEnabled(svc))) return NextResponse.json({ error: "চ্যাট এখন বন্ধ আছে" }, { status: 403 });

  const { user_id } = (await req.json().catch(() => ({}))) as { user_id?: string };
  if (!user_id || user_id === user.id) return NextResponse.json({ error: "ভুল ইউজার" }, { status: 400 });
  const { data: target } = await svc.from("profiles").select("id").eq("id", user_id).single();
  if (!target) return NextResponse.json({ error: "ইউজার পাওয়া যায়নি" }, { status: 404 });

  const [a, b] = canonPair(user.id, user_id);
  let { data: th } = await svc.from("dm_threads").select("id").eq("user_a", a).eq("user_b", b).maybeSingle();
  if (!th) {
    const { data: created, error } = await svc.from("dm_threads").insert({ user_a: a, user_b: b }).select("id").single();
    if (error || !created) return NextResponse.json({ error: "আবার চেষ্টা করুন" }, { status: 500 });
    th = created;
  }
  return NextResponse.json({ thread_id: (th as any).id });
}
