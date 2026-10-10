import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

/**
 * POST /api/marketplace/boost — seller pays from wallet to feature a listing.
 * Body: { listing_id }
 */
export async function POST(req: Request) {
  try {
    const client = await createClient();
    const {
      data: { user },
    } = await client.auth.getUser();
    if (!user) return NextResponse.json({ error: "লগইন করুন" }, { status: 401 });

    const { listing_id } = (await req.json()) as { listing_id?: string };
    if (!listing_id) return NextResponse.json({ error: "লিস্টিং দিন" }, { status: 400 });

    const svc = createServiceClient();
    const { data: listing } = await svc
      .from("id_listings")
      .select("id, seller_id, status, featured_until")
      .eq("id", listing_id)
      .single();
    if (!listing || listing.seller_id !== user.id)
      return NextResponse.json({ error: "নিজের লিস্টিং নয়" }, { status: 403 });
    if (listing.status !== "approved")
      return NextResponse.json({ error: "অনুমোদিত লিস্টিং-এই বুস্ট করা যায়" }, { status: 400 });
    if (listing.featured_until && new Date(listing.featured_until) > new Date())
      return NextResponse.json({ error: "ইতিমধ্যে ফিচার্ড আছে" }, { status: 400 });

    const { data: cfg } = await svc
      .from("site_settings")
      .select("key, value")
      .in("key", ["marketplace_boost_price", "marketplace_boost_days"]);
    const m: Record<string, number> = {};
    for (const r of cfg ?? []) m[r.key] = Number(r.value) || 0;
    const price = m["marketplace_boost_price"] || 30;
    const days = m["marketplace_boost_days"] || 3;

    const { data: spendRes, error: spendErr } = await svc.rpc("wallet_spend", {
      p_user: user.id,
      p_amount: price,
      p_note: `⭐ ID বুস্ট (${days} দিন)`,
      p_ref: listing_id,
    });
    if (spendErr || !(spendRes as { ok: boolean })?.ok) {
      return NextResponse.json(
        { error: `ওয়ালেটে ${price} টাকা নেই — /earn থেকে আয় করুন!`, need_topup: true },
        { status: 400 }
      );
    }

    const until = new Date(Date.now() + days * 86400000).toISOString();
    await svc.from("id_listings").update({ featured_until: until }).eq("id", listing_id);
    return NextResponse.json({ ok: true, featured_until: until, price, days });
  } catch (e) {
    console.error("boost error", e);
    return NextResponse.json({ error: "সার্ভার সমস্যা" }, { status: 500 });
  }
}
