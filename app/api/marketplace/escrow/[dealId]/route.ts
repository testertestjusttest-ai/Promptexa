import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

const DEAL_BN: Record<string, string> = {
  awaiting_payment: "পেমেন্ট বাকি",
  paid_to_admin: "অ্যাডমিনের কাছে টাকা ✅",
  id_delivered: "আইডি বুঝিয়ে দেওয়া হয়েছে",
  completed: "সম্পন্ন ✅",
  disputed: "বিরোধ চলছে ⚠️",
  refunded: "রিফান্ডেড",
  cancelled: "বাতিল",
};

/**
 * POST /api/marketplace/escrow/[dealId]
 * Actions:
 *  - buyer:  { action: "pay", trxid, sender_number } → paid_to_admin
 *  - seller: { action: "deliver" } → id_delivered
 *  - buyer:  { action: "confirm" } → completed (listing → sold)
 *  - buyer:  { action: "dispute", note } → disputed
 *  - admin:  { action: "release" } → completed + mark listing sold
 *  - admin:  { action: "refund" } → refunded
 *  - admin:  { action: "note", note }
 */
export async function POST(req: Request, ctx: { params: Promise<{ dealId: string }> }) {
  try {
    const { dealId } = await ctx.params;
    const client = await createClient();
    const {
      data: { user },
    } = await client.auth.getUser();
    if (!user) return NextResponse.json({ error: "লগইন করুন" }, { status: 401 });

    const { action, trxid, sender_number, note } = (await req.json()) as Record<string, string>;
    const svc = createServiceClient();

    const { data: deal } = await svc.from("escrow_deals").select("*").eq("id", dealId).single();
    if (!deal) return NextResponse.json({ error: "ডিল পাওয়া যায়নি" }, { status: 404 });

    const { data: prof } = await svc
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();
    const isAdmin = !!prof?.is_admin;
    const isBuyer = deal.buyer_id === user.id;
    const isSeller = deal.seller_id === user.id;
    const touch = { updated_at: new Date().toISOString() };

    async function setStatus(status: string, patch: Record<string, unknown> = {}) {
      const { error } = await svc.from("escrow_deals").update({ status, ...touch, ...patch }).eq("id", dealId);
      if (error) throw error;
    }

    // ---- buyer pays admin ----
    if (action === "pay") {
      if (!isBuyer) return NextResponse.json({ error: "অনুমতি নেই" }, { status: 403 });
      if (deal.status !== "awaiting_payment") return NextResponse.json({ error: "এই ধাপে পেমেন্ট দেওয়া যাবে না" }, { status: 400 });
      if (!trxid?.trim()) return NextResponse.json({ error: "TrxID দিন" }, { status: 400 });
      await setStatus("paid_to_admin", {
        buyer_trxid: trxid.trim().slice(0, 60),
        buyer_sender_number: (sender_number || "").trim().slice(0, 20),
      });
      return NextResponse.json({ ok: true, status: "paid_to_admin", label: DEAL_BN.paid_to_admin });
    }

    // ---- seller hands over the ID ----
    if (action === "deliver") {
      if (!isSeller) return NextResponse.json({ error: "অনুমতি নেই" }, { status: 403 });
      if (deal.status !== "paid_to_admin") {
        return NextResponse.json({ error: "আগে ক্রেতাকে অ্যাডমিনের কাছে পেমেন্ট করতে দিন" }, { status: 400 });
      }
      await setStatus("id_delivered");
      return NextResponse.json({ ok: true, status: "id_delivered", label: DEAL_BN.id_delivered });
    }

    // ---- buyer confirms receipt ----
    if (action === "confirm") {
      if (!isBuyer) return NextResponse.json({ error: "অনুমতি নেই" }, { status: 403 });
      if (deal.status !== "id_delivered") return NextResponse.json({ error: "আইডি এখনো বুঝিয়ে দেওয়া হয়নি" }, { status: 400 });
      await setStatus("completed");
      await svc.from("id_listings").update({ status: "sold" }).eq("id", deal.listing_id);
      return NextResponse.json({ ok: true, status: "completed", label: DEAL_BN.completed });
    }

    // ---- buyer opens dispute ----
    if (action === "dispute") {
      if (!isBuyer) return NextResponse.json({ error: "অনুমতি নেই" }, { status: 403 });
      if (!["paid_to_admin", "id_delivered"].includes(deal.status)) {
        return NextResponse.json({ error: "এই ধাপে বিরোধ খোলা যাবে না" }, { status: 400 });
      }
      await setStatus("disputed", { admin_note: (note || "").slice(0, 500) });
      return NextResponse.json({ ok: true, status: "disputed", label: DEAL_BN.disputed });
    }

    // ---- admin: release money to seller ----
    if (action === "release") {
      if (!isAdmin) return NextResponse.json({ error: "শুধু অ্যাডমিন" }, { status: 403 });
      await setStatus("completed", { admin_note: (note || "টাকা বিক্রেতাকে বুঝিয়ে দেওয়া হয়েছে").slice(0, 500) });
      await svc.from("id_listings").update({ status: "sold" }).eq("id", deal.listing_id);
      return NextResponse.json({ ok: true, status: "completed" });
    }

    // ---- admin: refund buyer ----
    if (action === "refund") {
      if (!isAdmin) return NextResponse.json({ error: "শুধু অ্যাডমিন" }, { status: 403 });
      await setStatus("refunded", { admin_note: (note || "ক্রেতাকে রিফান্ড করা হয়েছে").slice(0, 500) });
      return NextResponse.json({ ok: true, status: "refunded" });
    }

    // ---- admin: internal note ----
    if (action === "note") {
      if (!isAdmin) return NextResponse.json({ error: "শুধু অ্যাডমিন" }, { status: 403 });
      await svc.from("escrow_deals").update({ admin_note: (note || "").slice(0, 500), ...touch }).eq("id", dealId);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "ভুল অ্যাকশন" }, { status: 400 });
  } catch (e) {
    console.error("escrow action error", e);
    return NextResponse.json({ error: "সার্ভার সমস্যা" }, { status: 500 });
  }
}
