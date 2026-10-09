import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getRewardSettings } from "@/lib/wallet";

/**
 * POST /api/rewards/claim
 * Credits the signed-in user's wallet for watching a rewarded ad.
 * Server enforces: feature enabled, per-user cooldown, daily cap (atomic RPC).
 * Body: { watched_sec } — client must confirm the ad was actually viewed.
 */
export async function POST(req: Request) {
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

    const { watched_sec } = (await req.json().catch(() => ({}))) as {
      watched_sec?: number;
    };
    // require the client to confirm a real view (>= 10s on the ad)
    if (!watched_sec || watched_sec < 10) {
      return NextResponse.json({ error: "অ্যাডটি সম্পূর্ণ দেখুন" }, { status: 400 });
    }

    const svc = createServiceClient();
    const { data, error } = await svc.rpc("claim_ad_reward", {
      p_user: user.id,
      p_amount: Number(rewards.ad_reward_bdt) || 0,
      p_cooldown_sec: Number(rewards.ad_cooldown_sec) || 60,
      p_daily_limit: Number(rewards.ad_daily_limit) || 20,
    });
    if (error) {
      return NextResponse.json({ error: "সার্ভার সমস্যা" }, { status: 500 });
    }
    const r = data as { ok: boolean; error?: string; wait_sec?: number; amount?: number };
    if (!r.ok) {
      if (r.error === "cooldown") {
        return NextResponse.json(
          { error: `একটু অপেক্ষা করুন (${r.wait_sec} সেকেন্ড)`, wait_sec: r.wait_sec },
          { status: 429 }
        );
      }
      return NextResponse.json(
        { error: "আজকের লিমিট শেষ — আগামীকাল আবার চেষ্টা করুন" },
        { status: 429 }
      );
    }
    return NextResponse.json({ ok: true, amount: r.amount });
  } catch (e) {
    console.error("reward claim error", e);
    return NextResponse.json({ error: "সার্ভার সমস্যা" }, { status: 500 });
  }
}
