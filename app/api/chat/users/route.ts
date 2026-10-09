import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { chatEnabled, displayName } from "@/lib/dmchat";

export const dynamic = "force-dynamic";

/** GET /api/chat/users?q= — search users to start a chat (name only, privacy-safe). */
export async function GET(req: Request) {
  const client = await createClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user) return NextResponse.json({ error: "লগইন করুন" }, { status: 401 });
  const svc = createServiceClient();
  if (!(await chatEnabled(svc))) return NextResponse.json({ error: "চ্যাট এখন বন্ধ আছে" }, { status: 403 });

  const q = new URL(req.url).searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json({ users: [] });
  const { data } = await svc
    .from("profiles")
    .select("id, full_name")
    .ilike("full_name", `%${q}%`)
    .neq("id", user.id)
    .limit(20);
  return NextResponse.json({
    users: (data ?? []).map((p: any) => ({ id: p.id, name: displayName(p) })),
  });
}
