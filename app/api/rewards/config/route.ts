import { NextResponse } from "next/server";
import { getRewardSettings } from "@/lib/wallet";

/** GET /api/rewards/config — public reward settings for the Earn page */
export async function GET() {
  const r = await getRewardSettings();
  return NextResponse.json({
    ok: true,
    config: {
      enabled: r.enabled,
      ad_reward_bdt: r.ad_reward_bdt,
      ad_cooldown_sec: r.ad_cooldown_sec,
      ad_daily_limit: r.ad_daily_limit,
      min_withdraw_bdt: r.min_withdraw_bdt,
      reward_ad_code: r.reward_ad_code,
    },
  });
}
