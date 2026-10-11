import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/** GET /api/client/{slug}/settings — public settings (ad codes, announcement...). */
export async function GET(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const svc = createServiceClient();
  const { data } = await svc
    .from("client_settings")
    .select("key, value")
    .eq("client_slug", slug);
  const settings: Record<string, string> = {};
  for (const r of (data ?? []) as any[]) settings[r.key] = r.value;
  return NextResponse.json({ settings });
}
