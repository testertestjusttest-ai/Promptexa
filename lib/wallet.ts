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
  round_reward_bdt: number;
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
  round_reward_bdt: 20,
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
 * Valid-referral bonus: when a referred user completes their FIRST paid
 * order, the referrer earns referral_bonus_bdt (default ৳20).
 * Idempotent — the referrals row is marked paid before crediting.
 * Must be called with the SERVICE-ROLE client.
 */
export async function awardReferralBonus(
  supabase: SupabaseClient,
  referredUserId: string
): Promise<void> {
  try {
    const { data: ref } = await supabase
      .from("referrals")
      .select("id, referrer_id")
      .eq("referred_id", referredUserId)
      .eq("bonus_bdt", 0)
      .single();
    if (!ref) return; // no pending referral

    const { data: s } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "rewards")
      .single();
    const bonus = Number((s?.value as any)?.referral_bonus_bdt) || 20;
    if (!(bonus > 0)) return;

    // mark paid first (prevents double credit on retries)
    const { data: marked } = await supabase
      .from("referrals")
      .update({ bonus_bdt: bonus })
      .eq("id", ref.id)
      .eq("bonus_bdt", 0)
      .select("id");
    if (!marked || marked.length === 0) return;

    await creditWallet(
      supabase,
      ref.referrer_id,
      bonus,
      "referral_bonus",
      "ভ্যালিড রেফারেল বোনাস (প্রথম কেনা)",
      referredUserId
    );
  } catch (e) {
    console.error("awardReferralBonus error", e);
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
