import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getRewardSettings, creditWallet } from "@/lib/wallet";
import { ROUND_SECONDS, ROUND_CARDS } from "../round/route";

/**
 * POST /api/rewards/claim-round — claim the lump-sum round bonus.
 * Requires all 20 cards watched in the active round; one claim per round.
 */
export async function POST() {
  try {
    const client = await createClient();
    const {
      data: { user },
    } = await client.auth.getUser();
    if (!user) return NextResponse.json({ error: "লগইন করুন" }, { status: 401 });

    const rewards = await getRewardSettings();
    if (!rewards.enabled) {
      return NextResponse.json({ error: "রিওয়ার্ড এখন বন্ধ আছে" }, { status: 403 });
    }

    const svc = createServiceClient();
    const { data: round } = await svc
      .from("ad_rounds")
      .select("round_start, cards_done, claimed")
      .eq("user_id", user.id)
      .single();

    if (!round?.round_start) {
      return NextResponse.json({ error: "আগে কার্ডগুলো সম্পূর্ণ করুন" }, { status: 400 });
    }
    const expired = Date.now() - new Date(round.round_start).getTime() >= ROUND_SECONDS * 1000;
    if (expired) {
      return NextResponse.json({ error: "রাউন্ডের সময় শেষ — নতুন রাউন্ড শুরু করুন" }, { status: 400 });
    }
    if (round.claimed) {
      return NextResponse.json({ error: "বোনাস আগেই নেওয়া হয়েছে" }, { status: 400 });
    }
    const done = (round.cards_done ?? []).filter((n: number) => n >= 0 && n < ROUND_CARDS);
    if (done.length < ROUND_CARDS) {
      return NextResponse.json(
        { error: `আরও ${ROUND_CARDS - done.length}টি কার্ড বাকি` },
        { status: 400 }
      );
    }

    const amount = Number(rewards.round_reward_bdt) || 20;
    // mark claimed first (idempotency), then credit
    const { error: upErr } = await svc
      .from("ad_rounds")
      .update({ claimed: true, updated_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .eq("claimed", false);
    if (upErr) throw upErr;

    await creditWallet(svc, user.id, amount, "ad_reward", `🎬 ${ROUND_CARDS} কার্ড রাউন্ড বোনাস`);
    return NextResponse.json({ ok: true, amount });
  } catch (e) {
    console.error("claim round error", e);
    return NextResponse.json({ error: "সার্ভার সমস্যা" }, { status: 500 });
  }
}
