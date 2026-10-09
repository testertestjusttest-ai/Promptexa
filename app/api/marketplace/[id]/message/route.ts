import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { pushNotification } from "@/lib/notify";

/** POST /api/marketplace/[id]/message — send a chat message (buyer/seller/admin). */
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const client = await createClient();
    const {
      data: { user },
    } = await client.auth.getUser();
    if (!user) return NextResponse.json({ error: "লগইন করুন" }, { status: 401 });

    const { body } = (await req.json()) as { body?: string };
    const text = String(body || "").trim().slice(0, 1000);
    if (!text) return NextResponse.json({ error: "মেসেজ লিখুন" }, { status: 400 });

    const svc = createServiceClient();
    const { data: listing } = await svc
      .from("id_listings")
      .select("id, seller_id, status")
      .eq("id", id)
      .single();
    if (!listing) return NextResponse.json({ error: "লিস্টিং পাওয়া যায়নি" }, { status: 404 });

    const { data: prof } = await svc
      .from("profiles")
      .select("is_admin, is_support")
      .eq("id", user.id)
      .single();
    const isStaff = !!(prof?.is_admin || prof?.is_support);
    const isSeller = listing.seller_id === user.id;
    let isBuyer = false;
    if (!isSeller && !isStaff) {
      const { count } = await svc
        .from("escrow_deals")
        .select("id", { count: "exact", head: true })
        .eq("listing_id", id)
        .eq("buyer_id", user.id);
      isBuyer = (count ?? 0) > 0;
    }
    if (!isSeller && !isBuyer && !isStaff) {
      return NextResponse.json({ error: "চ্যাটের অনুমতি নেই — আগে কিনুন" }, { status: 403 });
    }

    const { data, error } = await svc
      .from("listing_messages")
      .insert({ listing_id: id, sender_id: user.id, body: text })
      .select("id, sender_id, body, created_at")
      .single();
    if (error) throw error;

    // Instant in-app notification to the other party
    try {
      const { data: deals } = await svc
        .from("escrow_deals")
        .select("buyer_id")
        .eq("listing_id", id)
        .order("created_at", { ascending: false })
        .limit(5);
      const buyers = [...new Set((deals ?? []).map((d) => d.buyer_id).filter((b) => b && b !== user.id))];
      const targets = new Set<string>();
      if (isSeller) buyers.forEach((b) => targets.add(b));
      else if (isBuyer) targets.add(listing.seller_id);
      else if (isStaff) {
        targets.add(listing.seller_id);
        buyers.forEach((b) => targets.add(b));
      }
      targets.delete(user.id);
      const { data: lp } = await svc.from("id_listings").select("title").eq("id", id).single();
      for (const t of targets) {
        await pushNotification(
          svc,
          t,
          "💬 নতুন মেসেজ",
          `“${(lp?.title || "ID").slice(0, 40)}” — ${text.slice(0, 80)}`,
          `/marketplace/${id}`
        );
      }
    } catch (e) {
      console.error("chat notify error", e);
    }

    return NextResponse.json({ ok: true, message: data });
  } catch (e) {
    console.error("chat send error", e);
    return NextResponse.json({ error: "সার্ভার সমস্যা" }, { status: 500 });
  }
}
