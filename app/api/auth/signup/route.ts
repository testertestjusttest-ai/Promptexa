import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import {
  creditWallet,
  generateUniqueReferralCode,
  getRewardSettings,
} from "@/lib/wallet";

/**
 * POST /api/auth/signup
 * Creates the user with email pre-confirmed (no verification link needed),
 * assigns a referral code, and credits the referrer's wallet if a valid
 * referral code was supplied.
 * Body: { name, email, password, referral_code? }
 */
export async function POST(req: Request) {
  try {
    const { name, email, password, referral_code } = (await req.json()) as {
      name: string;
      email: string;
      password: string;
      referral_code?: string;
    };

    const cleanName = (name || "").trim();
    const cleanEmail = (email || "").trim().toLowerCase();
    if (!cleanName) return NextResponse.json({ error: "নাম দিন" }, { status: 400 });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return NextResponse.json({ error: "সঠিক ইমেইল দিন" }, { status: 400 });
    }
    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে" },
        { status: 400 }
      );
    }

    const svc = createServiceClient();

    // resolve referrer (optional)
    let referrerId: string | null = null;
    const refCode = (referral_code || "").trim().toUpperCase();
    if (refCode) {
      const { data: ref } = await svc
        .from("profiles")
        .select("id")
        .eq("referral_code", refCode)
        .single();
      if (ref) referrerId = ref.id;
    }

    // create user, email pre-confirmed — no verification link needed
    const { data: created, error: createErr } =
      await svc.auth.admin.createUser({
        email: cleanEmail,
        password,
        email_confirm: true,
        user_metadata: { full_name: cleanName },
      });
    if (createErr || !created.user) {
      const msg = /already|exists/i.test(createErr?.message ?? "")
        ? "এই ইমেইলে অ্যাকাউন্ট আছে — লগইন করুন"
        : "রেজিস্ট্রেশন হয়নি, আবার চেষ্টা করুন";
      return NextResponse.json({ error: msg }, { status: 400 });
    }
    const userId = created.user.id;

    const myCode = await generateUniqueReferralCode(svc);
    const { getAdminEmails } = await import("@/lib/admin");
    const { error: profErr } = await svc.from("profiles").upsert(
      {
        id: userId,
        email: cleanEmail,
        full_name: cleanName,
        referral_code: myCode,
        referred_by: referrerId,
        is_admin: getAdminEmails().includes(cleanEmail),
      },
      { onConflict: "id" }
    );
    if (profErr) {
      await svc.auth.admin.deleteUser(userId);
      return NextResponse.json({ error: "রেজিস্ট্রেশন হয়নি" }, { status: 500 });
    }

    // referral bonus → referrer wallet
    if (referrerId) {
      const rewards = await getRewardSettings();
      const bonus = Number(rewards.referral_bonus_bdt) || 0;
      await svc.from("referrals").insert({
        referrer_id: referrerId,
        referred_id: userId,
        bonus_bdt: bonus,
      });
      if (bonus > 0) {
        await creditWallet(
          svc,
          referrerId,
          bonus,
          "referral_bonus",
          "রেফারেল বোনাস",
          userId
        );
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("signup error", e);
    return NextResponse.json({ error: "সার্ভার সমস্যা" }, { status: 500 });
  }
}
