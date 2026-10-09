import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export type RewardSettings = {
  enabled: boolean;
  ad_reward_bdt: number;
  ad_cooldown_sec: number;
  ad_daily_limit: number;
  referral_bonus_bdt: number;
  min_withdraw_bdt: number;
  reward_ad_code: string;
  reward_direct_link: string;
};

const REWARD_FALLBACK: RewardSettings = {
  enabled: false,
  ad_reward_bdt: 2,
  ad_cooldown_sec: 60,
  ad_daily_limit: 20,
  referral_bonus_bdt: 20,
  min_withdraw_bdt: 500,
  reward_ad_code: "",
  reward_direct_link: "https://uplcm.com/4/11989836",
};

export async function getRewardSettings(): Promise<RewardSettings> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "rewards")
      .single();
    return { ...REWARD_FALLBACK, ...((data?.value as object) ?? {}) };
  } catch {
    return REWARD_FALLBACK;
  }
}

/**
 * Credit a user's wallet. Must be called with the SERVICE-ROLE client.
 */
export async function creditWallet(
  supabase: SupabaseClient,
  userId: string,
  amount: number,
  type: "ad_reward" | "referral_bonus" | "refund" | "adjustment",
  note: string,
  refId?: string
): Promise<void> {
  if (!(amount > 0)) return;
  await supabase.from("wallets").upsert(
    { user_id: userId },
    { onConflict: "user_id" }
  );
  // direct update (single-writer paths: signup bonus, admin) — claim_ad_reward uses its own RPC
  const { data: w } = await supabase
    .from("wallets")
    .select("balance_bdt, total_earned_bdt")
    .eq("user_id", userId)
    .single();
  const bal = Number(w?.balance_bdt ?? 0);
  const earned = Number(w?.total_earned_bdt ?? 0);
  await supabase
    .from("wallets")
    .update({
      balance_bdt: bal + amount,
      total_earned_bdt: earned + amount,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);
  await supabase.from("wallet_transactions").insert({
    user_id: userId,
    amount_bdt: amount,
    type,
    note,
    ref_id: refId ?? null,
  });
}

/** Generate a unique referral code (service-role client). */
export async function generateUniqueReferralCode(
  supabase: SupabaseClient
): Promise<string> {
  for (let i = 0; i < 10; i++) {
    const bytes = new Uint8Array(4);
    crypto.getRandomValues(bytes);
    const code = Array.from(bytes)
      .map((b) => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[b % 32])
      .join("");
    const { data } = await supabase
      .from("profiles")
      .select("id")
      .eq("referral_code", code)
      .limit(1);
    if (!data || data.length === 0) return code;
  }
  return "DP" + Date.now().toString(36).toUpperCase();
}
