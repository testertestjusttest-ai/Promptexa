import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/** GET /api/client/{slug}/products — public product list for a client site. */
export async function GET(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const svc = createServiceClient();
  const { data } = await svc
    .from("client_products")
    .select("id, name, price_bdt, old_price_bdt, image_emoji, image_url, category, stock")
    .eq("client_slug", slug)
    .eq("is_active", true)
    .order("sort", { ascending: true })
    .order("created_at", { ascending: false });
  return NextResponse.json({ products: data ?? [] });
}
