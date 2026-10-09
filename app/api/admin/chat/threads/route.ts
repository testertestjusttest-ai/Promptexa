import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { displayName, isStaff } from "@/lib/dmchat";

export const dynamic = "force-dynamic";

/** GET /api/admin/chat/threads — all DM threads (staff only, monitoring). */
export async function GET() {
  const client = await createClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user) return NextResponse.json({ error: "লগইন করুন" }, { status: 401 });
  const svc = createServiceClient();
  if (!(await isStaff(svc, user.id))) return NextResponse.json({ error: "অনুমতি নেই" }, { status: 403 });

  const { data: threads } = await svc
    .from("dm_threads")
    .select("id, user_a, user_b, last_msg_at, created_at")
    .order("last_msg_at", { ascending: false })
    .limit(100);

  const out = [];
  for (const t of (threads ?? []) as any[]) {
    const { data: pa } = await svc.from("profiles").select("full_name, email").eq("id", t.user_a).single();
    const { data: pb } = await svc.from("profiles").select("full_name, email").eq("id", t.user_b).single();
    const { count } = await svc.from("dm_messages").select("id", { count: "exact", head: true }).eq("thread_id", t.id);
    out.push({
      id: t.id,
      a_name: displayName(pa as any),
      b_name: displayName(pb as any),
      msg_count: count ?? 0,
      last_msg_at: t.last_msg_at,
    });
  }
  return NextResponse.json({ threads: out });
}
