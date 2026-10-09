import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { chatEnabled } from "@/lib/dmchat";

export const dynamic = "force-dynamic";

/** GET /api/chat/status → { enabled } */
export async function GET() {
  const svc = createServiceClient();
  return NextResponse.json({ enabled: await chatEnabled(svc) });
}
