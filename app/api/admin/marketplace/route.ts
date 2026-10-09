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
    const [pending, listings, deals, chats] = await Promise.all([
      svc.from("id_listings").select("*, profiles!id_listings_seller_id_fkey(full_name)").eq("status", "pending").order("created_at", { ascending: false }),
      svc.from("id_listings").select("id, title, price_bdt, status, created_at").order("created_at", { ascending: false }).limit(30),
      svc.from("escrow_deals").select("*").order("created_at", { ascending: false }).limit(30),
      svc.from("listing_messages").select("id, body, created_at, listing_id, sender_id, id_listings!inner(title)").order("created_at", { ascending: false }).limit(60),
    ]);
    return NextResponse.json({
      ok: true,
      pending: pending.data ?? [],
      listings: listings.data ?? [],
      deals: deals.data ?? [],
      chats: chats.data ?? [],
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
      // First real seller going live → auto sold-out all demo listings
      const { data: lst } = await svc.from("id_listings").select("seller_id").eq("id", id).single();
      if (lst) {
        const { data: seller } = await svc.from("profiles").select("is_admin, is_support").eq("id", lst.seller_id).single();
        const realSeller = !(seller?.is_admin || seller?.is_support);
        if (realSeller) {
          const { count } = await svc.from("id_listings")
            .select("id", { count: "exact", head: true })
            .eq("seller_id", lst.seller_id)
            .eq("status", "approved");
          if ((count ?? 0) <= 1) {
            await svc.from("id_listings").update({ status: "sold" }).eq("is_demo", true).eq("status", "approved");
          }
        }
      }
    } else if (action === "reject_listing") {
      await svc.from("id_listings").update({ status: "rejected" }).eq("id", id);
    } else if (action === "release_deal") {
      const { data: deal } = await svc.from("escrow_deals").select("listing_id, amount_bdt").eq("id", id).single();
      let fee = 0, payout = 0;
      if (deal) {
        const { data: feeRow } = await svc.from("site_settings").select("value").eq("key", "marketplace_fee_percent").single();
        const pct = Number(feeRow?.value) || 2;
        const amt = Number(deal.amount_bdt) || 0;
        fee = Math.round((amt * pct) / 100);
        payout = amt - fee;
      }
      await svc.from("escrow_deals").update({ status: "completed", fee_bdt: fee, seller_payout_bdt: payout, admin_note: (note || `টাকা বিক্রেতাকে বুঝিয়ে দেওয়া হয়েছে (ফি ৳${fee})`).slice(0, 500), updated_at: new Date().toISOString() }).eq("id", id);
      if (deal) await svc.from("id_listings").update({ status: "sold" }).eq("id", deal.listing_id);
    } else if (action === "refund_deal") {
      await svc.from("escrow_deals").update({ status: "refunded", admin_note: (note || "ক্রেতাকে রিফান্ড").slice(0, 500), updated_at: new Date().toISOString() }).eq("id", id);
    } else if (action === "deal_note") {
      await svc.from("escrow_deals").update({ admin_note: (note || "").slice(0, 500), updated_at: new Date().toISOString() }).eq("id", id);
    } else if (action === "delete_listing") {
      await svc.from("id_listings").delete().eq("id", id);
    } else {
      return NextResponse.json({ error: "ভুল অ্যাকশন" }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("admin marketplace action error", e);
    return NextResponse.json({ error: "সার্ভার সমস্যা" }, { status: 500 });
  }
}
