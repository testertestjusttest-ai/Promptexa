import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getRewardSettings } from "@/lib/wallet";

/**
 * POST /api/rewards/claim-card
 * Credits ৳1 for one completed reward card (box): the client opened the
 * direct ad link and ran the 15s on-page timer.
 * Server enforces: feature enabled, 15s box pacing, daily cap (atomic RPC).
 * Body: { box: number (0-19), waited_sec: number }
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

    const { box, waited_sec } = (await req.json().catch(() => ({}))) as {
      box?: number;
      waited_sec?: number;
    };
    if (typeof box !== "number" || box < 0 || box > 19) {
      return NextResponse.json({ error: "ভুল বক্স" }, { status: 400 });
    }
    // the 15s timer must have actually run on the page
    if (!waited_sec || waited_sec < 14) {
      return NextResponse.json({ error: "১৫ সেকেন্ড অপেক্ষা করুন" }, { status: 400 });
    }

    const svc = createServiceClient();

    // hourly round limit: max 20 boxes per rolling 60 minutes
    const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count: hourly } = await svc
      .from("ad_views")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", hourAgo);
    if ((hourly ?? 0) >= 20) {
      const { data: oldest } = await svc
        .from("ad_views")
        .select("created_at")
        .eq("user_id", user.id)
        .gte("created_at", hourAgo)
        .order("created_at", { ascending: true })
        .limit(1)
        .single();
      const waitSec = oldest
        ? Math.max(
            60,
            3600 - Math.floor((Date.now() - new Date(oldest.created_at).getTime()) / 1000)
          )
        : 3600;
      return NextResponse.json(
        {
          error: `এই রাউন্ড শেষ! পরের রাউন্ড ${Math.floor(waitSec / 60)} মিনিট পর`,
          wait_sec: waitSec,
          round_done: true,
        },
        { status: 429 }
      );
    }

    // 20s pacing between boxes (15s timer + margin), same daily cap
    const { data, error } = await svc.rpc("claim_ad_reward", {
      p_user: user.id,
      p_amount: Number(rewards.ad_reward_bdt) || 0,
      p_cooldown_sec: 20,
      p_daily_limit: Number(rewards.ad_daily_limit) || 480,
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
    console.error("card claim error", e);
    return NextResponse.json({ error: "সার্ভার সমস্যা" }, { status: 500 });
  }
}
