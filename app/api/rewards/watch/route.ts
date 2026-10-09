import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getRewardSettings } from "@/lib/wallet";
import { ROUND_SECONDS, ROUND_CARDS } from "../round/route";

/**
 * POST /api/rewards/watch — mark one ad card watched (✓, locked for the round).
 * No money is credited here. Body: { box: 0-19, waited_sec }.
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
    if (typeof box !== "number" || box < 0 || box >= ROUND_CARDS) {
      return NextResponse.json({ error: "ভুল বক্স" }, { status: 400 });
    }
    if (!waited_sec || waited_sec < 14) {
      return NextResponse.json({ error: "১৫ সেকেন্ড অপেক্ষা করুন" }, { status: 400 });
    }

    const svc = createServiceClient();
    const now = new Date();
    let { data: round } = await svc
      .from("ad_rounds")
      .select("round_start, cards_done, claimed, updated_at")
      .eq("user_id", user.id)
      .single();

    const expired =
      !round?.round_start ||
      now.getTime() - new Date(round.round_start).getTime() >= ROUND_SECONDS * 1000;

    if (expired) {
      const { data: fresh, error } = await svc
        .from("ad_rounds")
        .upsert(
          { user_id: user.id, round_start: now.toISOString(), cards_done: [], claimed: false, updated_at: now.toISOString() },
          { onConflict: "user_id" }
        )
        .select("round_start, cards_done, claimed, updated_at")
        .single();
      if (error || !fresh) throw error ?? new Error("round init failed");
      round = fresh;
    }
    const r = round!;

    if (r.claimed) {
      return NextResponse.json({ error: "এই রাউন্ডের বোনাস নেওয়া হয়ে গেছে" }, { status: 400 });
    }
    const done: number[] = (r.cards_done ?? []).filter((n: number) => n >= 0 && n < ROUND_CARDS);
    if (done.includes(box)) {
      return NextResponse.json({ error: "এই কার্ড আগেই সম্পূর্ণ হয়েছে" }, { status: 400 });
    }
    // light pacing: at least 10s between card watches
    if (r.updated_at && now.getTime() - new Date(r.updated_at).getTime() < 10000) {
      return NextResponse.json({ error: "একটু ধীরে — কয়েক সেকেন্ড পর আবার চেষ্টা করুন" }, { status: 429 });
    }

    const next = [...done, box];
    const { error: upErr } = await svc
      .from("ad_rounds")
      .update({ cards_done: next, updated_at: now.toISOString() })
      .eq("user_id", user.id);
    if (upErr) throw upErr;
    // keep legacy analytics working
    await svc.from("ad_views").insert({ user_id: user.id });

    const elapsed = Math.floor((now.getTime() - new Date(r.round_start).getTime()) / 1000);
    return NextResponse.json({
      ok: true,
      cards_done: next,
      claimed: false,
      round_start: r.round_start,
      seconds_left: Math.max(0, ROUND_SECONDS - elapsed),
      round_reward: Number(rewards.round_reward_bdt) || 20,
    });
  } catch (e) {
    console.error("watch card error", e);
    return NextResponse.json({ error: "সার্ভার সমস্যা" }, { status: 500 });
  }
}
