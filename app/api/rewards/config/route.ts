import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getRewardSettings } from "@/lib/wallet";

export const HOURLY_ROUND_LIMIT = 20;

/** GET /api/rewards/config — public reward settings + today's progress for the Earn page */
export async function GET() {
  const r = await getRewardSettings();
  let adsWatchedToday = 0;
  let nextRoundAt: string | null = null;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const dayStart = new Date();
      dayStart.setHours(0, 0, 0, 0);
      const { count } = await supabase
        .from("ad_views")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("created_at", dayStart.toISOString());
      adsWatchedToday = count ?? 0;

      // hourly round limit: 20 boxes per rolling 60 minutes
      const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const { count: hourly } = await supabase
        .from("ad_views")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("created_at", hourAgo);
      if ((hourly ?? 0) >= HOURLY_ROUND_LIMIT) {
        const { data: oldest } = await supabase
          .from("ad_views")
          .select("created_at")
          .eq("user_id", user.id)
          .gte("created_at", hourAgo)
          .order("created_at", { ascending: true })
          .limit(1)
          .single();
        if (oldest) {
          nextRoundAt = new Date(
            new Date(oldest.created_at).getTime() + 60 * 60 * 1000
          ).toISOString();
        }
      }
    }
  } catch {
    /* progress optional */
  }
  return NextResponse.json({
    ok: true,
    config: {
      enabled: r.enabled,
      ad_reward_bdt: r.ad_reward_bdt,
      ad_cooldown_sec: r.ad_cooldown_sec,
      ad_daily_limit: r.ad_daily_limit,
      min_withdraw_bdt: r.min_withdraw_bdt,
      reward_ad_code: r.reward_ad_code,
      reward_direct_link: r.reward_direct_link,
      ads_watched_today: adsWatchedToday,
      next_round_at: nextRoundAt,
    },
  });
}
