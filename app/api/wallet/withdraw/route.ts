import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getRewardSettings } from "@/lib/wallet";

const METHODS = ["bkash", "nagad", "rocket"] as const;

/**
 * POST /api/wallet/withdraw
 * Body: { amount, method, account_number }
 * Deducts immediately, creates a pending request for admin approval.
 */
export async function POST(req: Request) {
  try {
    const client = await createClient();
    const {
      data: { user },
    } = await client.auth.getUser();
    if (!user) return NextResponse.json({ error: "লগইন করুন" }, { status: 401 });

    const { amount, method, account_number } = (await req.json()) as {
      amount: number;
      method: string;
      account_number: string;
    };

    const rewards = await getRewardSettings();
    const minW = Number(rewards.min_withdraw_bdt) || 500;
    const amt = Math.floor(Number(amount) || 0);
    if (amt < minW) {
      return NextResponse.json(
        { error: `সর্বনিম্ন উত্তোলন ${minW} টাকা` },
        { status: 400 }
      );
    }
    if (!METHODS.includes(method as (typeof METHODS)[number])) {
      return NextResponse.json({ error: "ভুল মাধ্যম" }, { status: 400 });
    }
    const acct = (account_number || "").trim();
    if (!/^01[3-9]\d{8}$/.test(acct)) {
      return NextResponse.json({ error: "সঠিক মোবাইল নম্বর দিন" }, { status: 400 });
    }

    const svc = createServiceClient();

    // one pending request at a time
    const { data: existing } = await svc
      .from("withdrawals")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "pending")
      .limit(1);
    if (existing && existing.length > 0) {
      return NextResponse.json(
        { error: "আপনার একটি রিকোয়েস্ট ইতিমধ্যে প্রসেসিং-এ আছে" },
        { status: 400 }
      );
    }

    // atomic debit
    const { data: res, error } = await svc.rpc("wallet_spend", {
      p_user: user.id,
      p_amount: amt,
      p_note: `উত্তোলন রিকোয়েস্ট (${method})`,
      p_ref: null,
    });
    if (error || !(res as { ok: boolean })?.ok) {
      return NextResponse.json({ error: "ব্যালেন্স যথেষ্ট নয়" }, { status: 400 });
    }

    const { data: wd, error: wdErr } = await svc
      .from("withdrawals")
      .insert({
        user_id: user.id,
        amount_bdt: amt,
        method,
        account_number: acct,
        status: "pending",
      })
      .select("id")
      .single();
    if (wdErr || !wd) {
      // refund the debit on failure
      const { data: w } = await svc
        .from("wallets")
        .select("balance_bdt, total_spent_bdt")
        .eq("user_id", user.id)
        .single();
      if (w) {
        await svc
          .from("wallets")
          .update({
            balance_bdt: Number(w.balance_bdt) + amt,
            total_spent_bdt: Number(w.total_spent_bdt) - amt,
          })
          .eq("user_id", user.id);
      }
      return NextResponse.json({ error: "রিকোয়েস্ট হয়নি" }, { status: 500 });
    }

    // link txn to withdrawal
    await svc
      .from("wallet_transactions")
      .update({ ref_id: wd.id })
      .eq("user_id", user.id)
      .eq("type", "purchase")
      .like("note", "উত্তোলন রিকোয়েস্ট%")
      .order("created_at", { ascending: false })
      .limit(1);

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("withdraw error", e);
    return NextResponse.json({ error: "সার্ভার সমস্যা" }, { status: 500 });
  }
}
