import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getRewardSettings } from "@/lib/wallet";

export const ROUND_SECONDS = 3600;
export const ROUND_CARDS = 20;

/**
 * GET /api/rewards/round — current hourly ad-round state.
 * { cards_done, claimed, round_start, seconds_left, round_reward, enabled, direct_link }
 * A round lasts 60 minutes from the first card watch. Expired rounds read as fresh.
 */
export async function GET() {
  try {
    const client = await createClient();
    const {
      data: { user },
    } = await client.auth.getUser();
    const rewards = await getRewardSettings();
    const base = {
      ok: true,
      enabled: rewards.enabled,
      direct_link: rewards.reward_direct_link,
      round_reward: Number(rewards.round_reward_bdt) || 20,
      cards_done: [] as number[],
      claimed: false,
      round_start: null as string | null,
      seconds_left: 0,
    };
    if (!user) return NextResponse.json(base);
    const svc = createServiceClient();
    const { data: round } = await svc
      .from("ad_rounds")
      .select("round_start, cards_done, claimed")
      .eq("user_id", user.id)
      .single();
    if (!round?.round_start) return NextResponse.json(base);
    const elapsed = Math.floor((Date.now() - new Date(round.round_start).getTime()) / 1000);
    if (elapsed >= ROUND_SECONDS) return NextResponse.json(base); // expired → fresh
    return NextResponse.json({
      ...base,
      cards_done: (round.cards_done ?? []).filter((n: number) => n >= 0 && n < ROUND_CARDS),
      claimed: !!round.claimed,
      round_start: round.round_start,
      seconds_left: ROUND_SECONDS - elapsed,
    });
  } catch (e) {
    console.error("round state error", e);
    return NextResponse.json({ error: "সার্ভার সমস্যা" }, { status: 500 });
  }
}
