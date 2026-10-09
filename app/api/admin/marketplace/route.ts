import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin";

/**
 * GET /api/admin/marketplace — pending listings, recent listings, escrow deals.
 * POST — { action, id, note? }:
 *   approve_listing / reject_listing / release_deal / refund_deal / deal_note
 */
export async function GET() {
  const auth = await requireAdminApi({ support: "read" });
  if (auth.error) return auth.error;
  const { svc } = auth;
  try {
    const [pending, listings, deals] = await Promise.all([
      svc.from("id_listings").select("*, profiles!id_listings_seller_id_fkey(full_name)").eq("status", "pending").order("created_at", { ascending: false }),
      svc.from("id_listings").select("id, title, price_bdt, status, created_at").order("created_at", { ascending: false }).limit(30),
      svc.from("escrow_deals").select("*").order("created_at", { ascending: false }).limit(30),
    ]);
    return NextResponse.json({
      ok: true,
      pending: pending.data ?? [],
      listings: listings.data ?? [],
      deals: deals.data ?? [],
    });
  } catch (e) {
    console.error("admin marketplace error", e);
    return NextResponse.json({ error: "সার্ভার সমস্যা" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;
  if (auth.role !== "admin") {
    return NextResponse.json({ error: "সাপোর্ট অ্যাডমিন পরিবর্তন করতে পারবে না" }, { status: 403 });
  }
  const { svc } = auth;
  try {
    const { action, id, note } = (await req.json()) as Record<string, string>;
    if (action === "approve_listing") {
      await svc.from("id_listings").update({ status: "approved" }).eq("id", id);
    } else if (action === "reject_listing") {
      await svc.from("id_listings").update({ status: "rejected" }).eq("id", id);
    } else if (action === "release_deal") {
      await svc.from("escrow_deals").update({ status: "completed", admin_note: (note || "টাকা বিক্রেতাকে বুঝিয়ে দেওয়া হয়েছে").slice(0, 500), updated_at: new Date().toISOString() }).eq("id", id);
      const { data: deal } = await svc.from("escrow_deals").select("listing_id").eq("id", id).single();
      if (deal) await svc.from("id_listings").update({ status: "sold" }).eq("id", deal.listing_id);
    } else if (action === "refund_deal") {
      await svc.from("escrow_deals").update({ status: "refunded", admin_note: (note || "ক্রেতাকে রিফান্ড").slice(0, 500), updated_at: new Date().toISOString() }).eq("id", id);
    } else if (action === "deal_note") {
      await svc.from("escrow_deals").update({ admin_note: (note || "").slice(0, 500), updated_at: new Date().toISOString() }).eq("id", id);
    } else {
      return NextResponse.json({ error: "ভুল অ্যাকশন" }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("admin marketplace action error", e);
    return NextResponse.json({ error: "সার্ভার সমস্যা" }, { status: 500 });
  }
}
