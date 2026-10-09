import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

/**
 * GET /api/marketplace/[id] — listing detail + chat messages + my escrow deals.
 * Chat is visible to: seller, buyers with a deal on this listing, and admins.
 */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const client = await createClient();
    const {
      data: { user },
    } = await client.auth.getUser();
    const svc = createServiceClient();

    const { data: listing, error } = await svc
      .from("id_listings")
      .select("*")
      .eq("id", id)
      .single();
    if (error || !listing) {
      return NextResponse.json({ error: "লিস্টিং পাওয়া যায়নি" }, { status: 404 });
    }

    // count a view for approved listings
    if (listing.status === "approved") {
      await svc
        .from("id_listings")
        .update({ views: (listing.views ?? 0) + 1 })
        .eq("id", id);
    }

    // who can see the chat?
    let canChat = false;
    let isAdmin = false;
    if (user) {
      const { data: prof } = await svc
        .from("profiles")
        .select("is_admin, is_support")
        .eq("id", user.id)
        .single();
      isAdmin = !!(prof?.is_admin || prof?.is_support);
      if (listing.seller_id === user.id || isAdmin) {
        canChat = true;
      } else {
        const { count } = await svc
          .from("escrow_deals")
          .select("id", { count: "exact", head: true })
          .eq("listing_id", id)
          .eq("buyer_id", user.id);
        if ((count ?? 0) > 0) canChat = true;
      }
    }

    let messages: unknown[] = [];
    const staffIds = new Set<string>();
    if (canChat) {
      const { data } = await svc
        .from("listing_messages")
        .select("id, sender_id, body, created_at")
        .eq("listing_id", id)
        .order("created_at", { ascending: true })
        .limit(200);
      messages = data ?? [];
      const senderIds = [...new Set((data ?? []).map((m) => m.sender_id))];
      if (senderIds.length > 0) {
        const { data: staff } = await svc
          .from("profiles")
          .select("id")
          .in("id", senderIds)
          .or("is_admin.eq.true,is_support.eq.true");
        for (const s of staff ?? []) staffIds.add(s.id);
      }
    }

    let deals: unknown[] = [];
    if (user && (listing.seller_id === user.id || isAdmin)) {
      const q = svc.from("escrow_deals").select("*").eq("listing_id", id).order("created_at", { ascending: false });
      const { data } = await q;
      deals = data ?? [];
    } else if (user) {
      const { data } = await svc
        .from("escrow_deals")
        .select("*")
        .eq("listing_id", id)
        .eq("buyer_id", user.id)
        .order("created_at", { ascending: false });
      deals = data ?? [];
    }

    // seller public name
    const { data: seller } = await svc
      .from("profiles")
      .select("full_name")
      .eq("id", listing.seller_id)
      .single();

    return NextResponse.json({
      ok: true,
      listing,
      seller_name: seller?.full_name ?? "বিক্রেতা",
      canChat,
      isAdmin,
      staff_ids: [...staffIds],
      messages,
      deals,
      me: user?.id ?? null,
    });
  } catch (e) {
    console.error("listing detail error", e);
    return NextResponse.json({ error: "সার্ভার সমস্যা" }, { status: 500 });
  }
}
