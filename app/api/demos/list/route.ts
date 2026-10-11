import { NextResponse } from "next/server";
import { DEMO_DEFS } from "@/app/web-dev/demos/demosite/defs";

export const dynamic = "force-dynamic";

/** GET /api/demos/list — all demo defs (slug, name, type, layout) for admin tools. */
export async function GET() {
  return NextResponse.json({
    demos: DEMO_DEFS.map((d) => ({ slug: d.slug, name: d.name, type: d.type, layout: d.layout })),
  });
}
