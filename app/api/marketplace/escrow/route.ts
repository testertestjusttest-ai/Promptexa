import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

/**
 * POST /api/marketplace/escrow { listing_id } — buyer starts an escrow deal.
 * Money goes to ADMIN first; released to seller only after buyer confirms.
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
      .select("id, seller_id, price_bdt, status, title")
      .eq("id", listing_id)
      .single();
    if (!listing || listing.status !== "approved") {
      return NextResponse.json({ error: "এই আইডি এখন কেনা যাবে না" }, { status: 400 });
    }
    if (listing.seller_id === user.id) {
      return NextResponse.json({ error: "নিজের আইডি নিজে কেনা যাবে না" }, { status: 400 });
    }

    // one active deal per buyer per listing
    const { data: existing } = await svc
      .from("escrow_deals")
      .select("id, status")
      .eq("listing_id", listing_id)
      .eq("buyer_id", user.id)
      .not("status", "in", "(completed,refunded,cancelled)")
      .limit(1)
      .single();
    if (existing) {
      return NextResponse.json({ ok: true, deal_id: existing.id, resumed: true });
    }

    const { data, error } = await svc
      .from("escrow_deals")
      .insert({
        listing_id,
        buyer_id: user.id,
        seller_id: listing.seller_id,
        amount_bdt: listing.price_bdt,
        status: "awaiting_payment",
      })
      .select("id")
      .single();
    if (error) throw error;
    return NextResponse.json({ ok: true, deal_id: data.id });
  } catch (e) {
    console.error("escrow create error", e);
    return NextResponse.json({ error: "সার্ভার সমস্যা" }, { status: 500 });
  }
}
