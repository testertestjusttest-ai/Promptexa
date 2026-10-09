import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** GET /api/wallet — own balance + recent transactions */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "লগইন করুন" }, { status: 401 });

  const [{ data: wallet }, { data: txns }, { data: profile }, { data: refStats }, { data: withdrawals }] =
    await Promise.all([
      supabase.from("wallets").select("*").eq("user_id", user.id).single(),
      supabase
        .from("wallet_transactions")
        .select("id, amount_bdt, type, note, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(30),
      supabase
        .from("profiles")
        .select("referral_code")
        .eq("id", user.id)
        .single(),
      supabase.from("referrals").select("bonus_bdt").eq("referrer_id", user.id),
      supabase
        .from("withdrawals")
        .select("id, amount_bdt, method, account_number, status, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

  const referralCount = refStats?.length ?? 0;
  const referralEarned = (refStats ?? []).reduce(
    (n, r) => n + Number(r.bonus_bdt || 0),
    0
  );

  return NextResponse.json({
    ok: true,
    wallet: wallet ?? {
      user_id: user.id,
      balance_bdt: 0,
      total_earned_bdt: 0,
      total_spent_bdt: 0,
      total_withdrawn_bdt: 0,
    },
    transactions: txns ?? [],
    referral_code: profile?.referral_code ?? null,
    referral_count: referralCount,
    referral_earned: referralEarned,
    withdrawals: withdrawals ?? [],
  });
}
