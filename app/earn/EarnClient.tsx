"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { formatBDT, formatTk, displayPrice, toBnDigits, timeAgo, paymentKindLabel, paymentMethodLabel, isPaymentMethodLive } from "@/lib/format";
import { useLang } from "@/lib/i18n";
import type { Wallet, WalletTxn } from "@/lib/types";
import AdSlot from "@/components/AdSlot";
import MotionBg from "@/components/MotionBg";

type Config = {
  enabled: boolean;
  ad_reward_bdt: number;
  ad_cooldown_sec: number;
  ad_daily_limit: number;
  min_withdraw_bdt: number;
  reward_ad_code: string;
  reward_direct_link: string;
  ads_watched_today: number;
  next_round_at: string | null;
};

const CARDS_GOAL = 20;

type WithdrawalRow = {
  id: string;
  amount_bdt: number;
  method: string;
  account_number: string;
  status: string;
  created_at: string;
};

const WATCH_SEC = 15;
const BOX_WAIT_SEC = 15;

/** Celebration jingle (Web Audio) — plays on round completion / claim. */
function playCelebration() {
  try {
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g);
      g.connect(ctx.destination);
      o.type = "sine";
      o.frequency.value = f;
      const t = ctx.currentTime + i * 0.13;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.25, t + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
      o.start(t);
      o.stop(t + 0.45);
    });
  } catch {}
}

/** Renders raw ad code (Monetag/Adsterra/Monetag) with real <script> execution */
function AdFrame({ code }: { code: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.innerHTML = "";
    const tpl = document.createElement("template");
    tpl.innerHTML = code.trim();
    tpl.content.querySelectorAll("script").forEach((old) => {
      const s = document.createElement("script");
      Array.from(old.attributes).forEach((a) => s.setAttribute(a.name, a.value));
      s.textContent = old.textContent;
      old.replaceWith(s);
    });
    el.appendChild(tpl.content);
    return () => {
      el.innerHTML = "";
    };
  }, [code]);
  return <div ref={ref} className="min-h-[240px] w-full overflow-hidden rounded-xl bg-black/30 p-2" />;
}

const TXN_BN: Record<string, string> = {
  ad_reward: "🎬 অ্যাড বোনাস",
  referral_bonus: "👥 রেফারেল বোনাস",
  purchase: "🛒 কেনাকাটা",
  withdrawal: "💸 উত্তোলন",
  refund: "↩️ রিফান্ড",
  adjustment: "⚙️ অ্যাডজাস্ট",
};

const TXN_EN: Record<string, string> = {
  ad_reward: "🎬 Ad bonus",
  referral_bonus: "👥 Referral bonus",
  purchase: "🛒 Purchase",
  withdrawal: "💸 Withdrawal",
  refund: "↩️ Refund",
  adjustment: "⚙️ Adjustment",
};

const TXN_HI: Record<string, string> = {
  ad_reward: "🎬 विज्ञापन बोनस",
  referral_bonus: "👥 रेफ़रल बोनस",
  purchase: "🛒 खरीदारी",
  withdrawal: "💸 निकासी",
  refund: "↩️ रिफ़ंड",
  adjustment: "⚙️ समायोजन",
};

export default function EarnClient({
  earnTopAds = [],
  earnBottomAds = [],
}: {
  earnTopAds?: string[];
  earnBottomAds?: string[];
}) {
  const { lang, t } = useLang();
  /** Digits: Bangla digits in BN view, Latin digits in EN/HI views. */
  const d = (v: string | number) => (lang === "bn" ? toBnDigits(v) : String(v));
  /** Money: Bangla Tk in BN view; USD equivalent + Tk amount in EN/HI views. */
  const money = (bdt: number) => (lang === "bn" ? formatBDT(bdt) : displayPrice(bdt, lang));
  /** Tk amount actually charged/paid, Latin digits in EN/HI views. */
  const tk = (bdt: number) => (lang === "bn" ? formatBDT(bdt) : formatTk(bdt));
  const TXN = lang === "hi" ? TXN_HI : lang === "en" ? TXN_EN : TXN_BN;

  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [txns, setTxns] = useState<WalletTxn[]>([]);
  const [refCode, setRefCode] = useState<string | null>(null);
  const [refCount, setRefCount] = useState(0);
  const [refEarned, setRefEarned] = useState(0);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRow[]>([]);
  const [config, setConfig] = useState<Config | null>(null);

  const [adOpen, setAdOpen] = useState(false);
  const [countdown, setCountdown] = useState(WATCH_SEC);
  const [claiming, setClaiming] = useState(false);
  const [msg, setMsg] = useState("");

  // 20-box hourly round: watch all 20 → claim 20 Tk lump sum
  const [cardsOn, setCardsOn] = useState(false);
  const [cardsDone, setCardsDone] = useState<number[]>([]);
  const [roundClaimed, setRoundClaimed] = useState(false);
  const [roundReward, setRoundReward] = useState(20);
  const [roundSecsLeft, setRoundSecsLeft] = useState(0);
  const [roundActive, setRoundActive] = useState(false);
  const [countingBox, setCountingBox] = useState<number | null>(null);
  const [boxSecs, setBoxSecs] = useState(BOX_WAIT_SEC);
  const [watchingBox, setWatchingBox] = useState(false);
  const [claimingRound, setClaimingRound] = useState(false);
  const [nowMs, setNowMs] = useState(Date.now());

  // tick for the round countdown
  useEffect(() => {
    if (!roundActive) return;
    const t = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(t);
  }, [roundActive]);

  const roundWaitSec = roundActive ? Math.max(0, roundSecsLeft - Math.floor((Date.now() - nowMs) / 1000)) : 0;

  const [wdAmount, setWdAmount] = useState("");
  const [wdMethod, setWdMethod] = useState("bkash");
  const [wdAcct, setWdAcct] = useState("");
  const [wdLoading, setWdLoading] = useState(false);
  const [depAmount, setDepAmount] = useState("");
  const [depMethod, setDepMethod] = useState("bkash");
  const [depTrx, setDepTrx] = useState("");
  const [depLoading, setDepLoading] = useState(false);

  function depPayInfo(): { number: string; kind: string } {
    const raw: unknown = payNumbers[depMethod];
    if (!raw) return { number: "", kind: "sendmoney" };
    if (typeof raw === "string") return { number: raw, kind: "sendmoney" };
    const o = raw as { number?: string; kind?: string; enabled?: boolean };
    return { number: o.number ?? "", kind: o.kind ?? "sendmoney" };
  }
  function depPayNumber(): string {
    return depPayInfo().number;
  }
  function copyDepNumber() {
    const n = depPayNumber();
    if (!n) return;
    navigator.clipboard.writeText(n).then(
      () => {
        setNumCopied(true);
        setTimeout(() => setNumCopied(false), 2000);
      },
      () => {}
    );
  }
  const [deposits, setDeposits] = useState<{ id: string; amount_bdt: number; method: string; trx_id: string; status: string }[]>([]);
  const [payNumbers, setPayNumbers] = useState<Record<string, unknown>>({});
  const [numCopied, setNumCopied] = useState(false);

  const DEP_METHOD_KEYS = ["bkash", "nagad", "rocket"];
  const liveDepMethods = DEP_METHOD_KEYS.filter((m) => isPaymentMethodLive(payNumbers[m] as never));
  // keep the selected method valid if admin switched it off
  useEffect(() => {
    if (Object.keys(payNumbers).length > 0 && !isPaymentMethodLive(payNumbers[depMethod] as never) && liveDepMethods.length > 0) {
      setDepMethod(liveDepMethods[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payNumbers]);

  const load = useCallback(async () => {
    const [wRes, cRes, rRes, dRes, sRes] = await Promise.all([
      fetch("/api/wallet"),
      fetch("/api/rewards/config"),
      fetch("/api/rewards/round"),
      fetch("/api/wallet/deposit"),
      fetch("/api/public/settings"),
    ]);
    const w = await wRes.json();
    const c = await cRes.json();
    const r = await rRes.json().catch(() => ({}));
    const dd = await dRes.json().catch(() => ({}));
    const ss = await sRes.json().catch(() => ({}));
    if (ss?.ok && ss.payment_numbers) setPayNumbers(ss.payment_numbers);
    if (dd.deposits) setDeposits(dd.deposits);
    if (wRes.ok && w.ok) {
      setLoggedIn(true);
      setWallet(w.wallet);
      setTxns(w.transactions);
      setRefCode(w.referral_code);
      setRefCount(w.referral_count);
      setRefEarned(w.referral_earned);
      setWithdrawals(w.withdrawals);
    } else {
      setLoggedIn(false);
    }
    if (c.ok) {
      setConfig(c.config);
    }
    if (r?.ok) {
      const done: number[] = r.cards_done ?? [];
      setCardsDone(done);
      setRoundClaimed(!!r.claimed);
      setRoundReward(Number(r.round_reward) || 20);
      setRoundSecsLeft(Number(r.seconds_left) || 0);
      // The 1-hour countdown is only shown after all 20 cards are complete.
      setRoundActive(!!r.round_start && done.length >= CARDS_GOAL);
      setNowMs(Date.now());
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // ad countdown
  useEffect(() => {
    if (!adOpen || countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [adOpen, countdown]);

  // box countdown → mark watched when it hits 0
  useEffect(() => {
    if (countingBox === null) return;
    if (boxSecs <= 0) {
      watchBox(countingBox);
      return;
    }
    const t = setTimeout(() => setBoxSecs((s) => s - 1), 1000);
    return () => clearTimeout(t);
  });

  /** Click a box: open the direct ad link, run the 15s timer on the box. */
  function clickBox(i: number) {
    if (countingBox !== null || watchingBox || cardsDone.includes(i) || roundClaimed) return;
    const link = config?.reward_direct_link?.trim() || "https://uplcm.com/4/11989836";
    window.open(link, "_blank", "noopener");
    setCountingBox(i);
    setBoxSecs(BOX_WAIT_SEC);
    setMsg("");
  }

  async function watchBox(i: number) {
    setWatchingBox(true);
    try {
      const res = await fetch("/api/rewards/watch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ box: i, waited_sec: BOX_WAIT_SEC }),
      });
      const d2 = await res.json();
      if (!res.ok) throw new Error(d2.error || t("er_failed"));
      const done: number[] = d2.cards_done ?? [];
      setCardsDone(done);
      setRoundClaimed(!!d2.claimed);
      setRoundSecsLeft(Number(d2.seconds_left) || 0);
      // Only arm the 1-hour countdown once all 20 cards are done.
      setRoundActive(done.length >= CARDS_GOAL);
      setNowMs(Date.now());
      if ((d2.cards_done ?? []).length >= CARDS_GOAL) {
        const rw = d2.round_reward ?? roundReward;
        setMsg(
          lang === "bn"
            ? `🎉 ${d(CARDS_GOAL)}টি কার্ড সম্পূর্ণ! এখন নিচের বাটনে ${d(rw)} টাকা বোনাস নিন!`
            : lang === "hi"
              ? `🎉 ${CARDS_GOAL} कार्ड पूरे! नीचे दिए बटन से ${rw} टका बोनस लें!`
              : `🎉 All ${CARDS_GOAL} cards done! Take your ${rw} Tk bonus with the button below!`
        );
        playCelebration();
      }
    } catch (e) {
      setMsg(`⚠️ ${e instanceof Error ? e.message : t("er_failed")} — ${t("er_try_again")}`);
      load();
    } finally {
      setCountingBox(null);
      setWatchingBox(false);
    }
  }

  async function claimRound() {
    if (claimingRound) return;
    setClaimingRound(true);
    try {
      const res = await fetch("/api/rewards/claim-round", { method: "POST" });
      const d2 = await res.json();
      if (!res.ok) throw new Error(d2.error || t("er_failed"));
      setMsg(
        lang === "bn"
          ? `🎉 ${d(d2.amount)} টাকা ওয়ালেটে যোগ হয়েছে! পরের রাউন্ড ১ ঘণ্টা পর।`
          : lang === "hi"
            ? `🎉 ${d2.amount} टका वॉलेट में जुड़ गया! अगला राउंड 1 घंटे बाद।`
            : `🎉 ${d2.amount} Tk added to your wallet! Next round in 1 hour.`
      );
      playCelebration();
      load();
    } catch (e) {
      setMsg(`⚠️ ${e instanceof Error ? e.message : t("er_failed")}`);
    } finally {
      setClaimingRound(false);
    }
  }

  function openAd() {
    setMsg("");
    setCountdown(WATCH_SEC);
    setAdOpen(true);
  }

  async function claim() {
    setClaiming(true);
    setMsg("");
    try {
      const res = await fetch("/api/rewards/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ watched_sec: WATCH_SEC }),
      });
      const d2 = await res.json();
      if (!res.ok) throw new Error(d2.error || t("er_failed"));
      setMsg(
        lang === "bn"
          ? `🎉 ${formatBDT(d2.amount)} বোনাস ওয়ালেটে যোগ হয়েছে!`
          : lang === "hi"
            ? `🎉 ${d2.amount} टका बोनस वॉलेट में जुड़ गया!`
            : `🎉 ${formatTk(d2.amount)} bonus added to your wallet!`
      );
      setAdOpen(false);
      load();
    } catch (e) {
      setMsg(`⚠️ ${e instanceof Error ? e.message : t("er_failed")}`);
    } finally {
      setClaiming(false);
    }
  }

  async function deposit(e: React.FormEvent) {
    e.preventDefault();
    setDepLoading(true);
    setMsg("");
    try {
      const res = await fetch("/api/wallet/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(depAmount),
          method: depMethod,
          trx_id: depTrx,
        }),
      });
      const d2 = await res.json();
      if (!res.ok) throw new Error(d2.error || t("er_failed"));
      setMsg(t("er_dep_ok"));
      setDepAmount("");
      setDepTrx("");
      load();
    } catch (e) {
      setMsg(`⚠️ ${e instanceof Error ? e.message : t("er_failed")}`);
    } finally {
      setDepLoading(false);
    }
  }

  async function withdraw(e: React.FormEvent) {
    e.preventDefault();
    setWdLoading(true);
    setMsg("");
    try {
      const res = await fetch("/api/wallet/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(wdAmount),
          method: wdMethod,
          account_number: wdAcct,
        }),
      });
      const d2 = await res.json();
      if (!res.ok) throw new Error(d2.error || t("er_failed"));
      setMsg(t("er_wd_ok"));
      setWdAmount("");
      setWdAcct("");
      load();
    } catch (e) {
      setMsg(`⚠️ ${e instanceof Error ? e.message : t("er_failed")}`);
    } finally {
      setWdLoading(false);
    }
  }

  function copy(text: string, label: string) {
    navigator.clipboard.writeText(text).then(
      () =>
        setMsg(
          lang === "bn"
            ? `📋 ${label} কপি হয়েছে!`
            : lang === "hi"
              ? `📋 ${label} कॉपी हो गया!`
              : `📋 ${label} copied!`
        ),
      () => setMsg(t("er_copy_failed"))
    );
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center text-slate-400">
        {t("er_loading")}
      </div>
    );
  }

  if (!loggedIn) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <div className="glass rounded-3xl p-8">
          <div className="text-5xl">💰</div>
          <h1 className="mt-4 font-display text-xl font-bold text-white">
            {t("er_login_title")}
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            {t("er_login_sub")}
          </p>
          <Link href="/auth/login" className="btn-vault mt-6 inline-flex">
            {t("er_login_btn")}
          </Link>
        </div>
      </div>
    );
  }

  const refLink =
    typeof window !== "undefined" && refCode
      ? `${window.location.origin}/auth/signup?ref=${refCode}`
      : "";

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-bold text-white">
        {t("er_title")}
      </h1>
      <p className="mt-1 text-sm text-slate-400">
        {t("er_sub")}
      </p>

      {msg && (
        <p className="mt-4 rounded-xl bg-[#d7ff3f]/10 px-4 py-3 text-sm text-[#d7ff3f]">
          {msg}
        </p>
      )}

      {earnTopAds.map((code, i) => (
        <AdSlot key={i} code={code} className="mt-6 !px-0" />
      ))}

      {/* wallet hero */}
      <div className="glass ring-conic relative mt-6 overflow-hidden rounded-3xl p-6">
        <MotionBg intensity="soft" />
        <div className="relative">
        <p className="text-xs uppercase tracking-wide text-slate-500">
          {t("er_wallet")}
        </p>
        <p className="font-display text-4xl font-bold text-[#d7ff3f]">
          {money(Number(wallet?.balance_bdt ?? 0))}
        </p>
        <div className="mt-4 grid grid-cols-3 gap-3 text-center">
          <div className="rounded-xl bg-white/[0.04] p-3">
            <p className="text-[11px] text-slate-500">{t("er_total_earned")}</p>
            <p className="font-bold text-white">{money(Number(wallet?.total_earned_bdt ?? 0))}</p>
          </div>
          <div className="rounded-xl bg-white/[0.04] p-3">
            <p className="text-[11px] text-slate-500">{t("er_spent")}</p>
            <p className="font-bold text-white">{money(Number(wallet?.total_spent_bdt ?? 0))}</p>
          </div>
          <div className="rounded-xl bg-white/[0.04] p-3">
            <p className="text-[11px] text-slate-500">{t("er_withdrawn")}</p>
            <p className="font-bold text-white">{money(Number(wallet?.total_withdrawn_bdt ?? 0))}</p>
          </div>
        </div>
        <Link href="/shop" className="btn-vault mt-4 inline-flex w-full !py-3 text-sm">
          {t("er_shop_balance")}
        </Link>
        </div>
      </div>

      {/* watch ad — 20-card hourly round, 20 Tk lump sum */}
      <div className="glass mt-6 rounded-3xl p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-white">{t("er_watch_title")}</h2>
          {config?.enabled && (
            <span className="rounded-full bg-[#d7ff3f]/15 px-3 py-1 text-xs font-bold text-[#d7ff3f]">
              {lang === "bn"
                ? `প্রতি রাউন্ডে ${d(roundReward)} টাকা`
                : lang === "hi"
                  ? `प्रति राउंड ${roundReward} टका`
                  : `${roundReward} Tk per round`}
            </span>
          )}
        </div>
        {!config?.enabled ? (
          <p className="mt-3 text-sm text-slate-500">{t("er_rewards_off")}</p>
        ) : (
          <>
            <p className="mt-2 text-sm text-slate-400">
              {lang === "bn" ? (
                <>
                  💰 <b className="text-white">আর্ন নাও</b> চাপুন — {d(CARDS_GOAL)}টি কার্ড
                  আসবে। প্রতিটি কার্ডে ক্লিক করলে অ্যাড খুলবে, {d(BOX_WAIT_SEC)} সেকেন্ড
                  পর কার্ডে ✓ পড়বে (লক থাকবে)। <b className="text-[#d7ff3f]">{d(CARDS_GOAL)}টি শেষ হলে একসাথে {d(roundReward)} টাকা ওয়ালেটে!</b>
                  <br />⏳ {d(CARDS_GOAL)}টি কার্ড শেষ হলে বাকি রাউন্ড-টাইমার দেখা যাবে — রাউন্ডের ১ ঘণ্টা শেষ হলে নতুন রাউন্ড শুরু হবে।
                </>
              ) : lang === "hi" ? (
                <>
                  💰 <b className="text-white">Earn Now</b> दबाएँ — {CARDS_GOAL} कार्ड
                  आएँगे। किसी कार्ड पर क्लिक करने से विज्ञापन खुलेगा, {BOX_WAIT_SEC} सेकंड
                  बाद कार्ड पर ✓ लग जाएगा (लॉक रहेगा)। <b className="text-[#d7ff3f]">{CARDS_GOAL} पूरे होने पर एक साथ {roundReward} टका वॉलेट में!</b>
                  <br />⏳ {CARDS_GOAL} कार्ड पूरे होने पर बाक़ी राउंड-टाइमर दिखेगा — राउंड का 1 घंटा खत्म होने पर नया राउंड शुरू होगा।
                </>
              ) : (
                <>
                  💰 Tap <b className="text-white">Earn Now</b> — {CARDS_GOAL} cards
                  will appear. Clicking a card opens an ad; after {BOX_WAIT_SEC} seconds
                  the card gets a ✓ (locked). <b className="text-[#d7ff3f]">All {CARDS_GOAL} done — {roundReward} Tk in your wallet at once!</b>
                  <br />⏳ After all {CARDS_GOAL} cards are done, the remaining round timer will show — a new round starts when the round&apos;s 1 hour ends.
                </>
              )}
            </p>

            {!cardsOn ? (
              <button onClick={() => setCardsOn(true)} className="btn-vault mt-4 w-full !py-3.5 text-base font-bold">
                💰 Earn Now
              </button>
            ) : (
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">{t("er_progress")}</span>
                  <span className="font-bold text-[#d7ff3f]">
                    {d(cardsDone.length)}/{d(CARDS_GOAL)} {t("er_cards")}
                    {roundActive && (
                      <span className="ml-2 text-slate-400">
                        ⏳ {d(Math.floor(roundWaitSec / 60))}:{d(String(roundWaitSec % 60).padStart(2, "0"))}
                      </span>
                    )}
                  </span>
                </div>
                {/* progress bar */}
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/[0.07]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-lime-300 to-[#d7ff3f] transition-all duration-500"
                    style={{ width: `${(cardsDone.length / CARDS_GOAL) * 100}%` }}
                  />
                </div>
                {/* 20 boxes, 3 columns */}
                <div className="mt-4 grid grid-cols-3 gap-2.5">
                  {Array.from({ length: CARDS_GOAL }).map((_, i) => {
                    const done = cardsDone.includes(i);
                    const counting = countingBox === i;
                    return (
                      <button
                        key={i}
                        disabled={done || counting || watchingBox || roundClaimed}
                        onClick={() => clickBox(i)}
                        className={`ad-card-shine relative flex min-h-[76px] flex-col items-center justify-center overflow-hidden rounded-2xl border font-bold transition-all duration-300 ${
                          done
                            ? "border-[#d7ff3f]/60 bg-gradient-to-br from-[#d7ff3f]/25 to-lime-500/10 text-[#d7ff3f] shadow-[0_0_16px_rgba(215,255,63,0.35)]"
                            : counting
                              ? "border-cyan-300/60 bg-cyan-400/10 text-cyan-200"
                              : "ad-card-glow ad-card-float border-white/10 bg-white/[0.04] text-white hover:border-[#d7ff3f]/50 hover:bg-[#d7ff3f]/10 active:scale-95"
                        } disabled:cursor-default`}
                      >
                        {done ? (
                          <>
                            <span className="text-2xl">✓</span>
                            <span className="mt-0.5 text-[10px] font-bold text-[#d7ff3f]/90">{t("er_box_done")}</span>
                          </>
                        ) : counting ? (
                          <>
                            <span className="font-display text-2xl text-cyan-300">
                              {d(boxSecs)}
                            </span>
                            <span className="mt-0.5 text-[10px] text-slate-400">{t("er_seconds")}</span>
                            <span
                              className="absolute bottom-0 left-0 h-1 bg-cyan-300/70 transition-all duration-1000"
                              style={{ width: `${((BOX_WAIT_SEC - boxSecs) / BOX_WAIT_SEC) * 100}%` }}
                            />
                          </>
                        ) : (
                          <>
                            <span className="font-display text-xl text-slate-200">
                              {d(i + 1)}
                            </span>
                            <span className="mt-0.5 text-[10px] text-slate-500">{t("er_watch_ad")}</span>
                          </>
                        )}
                      </button>
                    );
                  })}
                </div>
                {cardsDone.length >= CARDS_GOAL && !roundClaimed ? (
                  <div className="mt-4 animate-pulse rounded-3xl border-2 border-[#d7ff3f]/60 bg-gradient-to-br from-[#d7ff3f]/20 via-lime-500/10 to-[#d7ff3f]/20 p-5 text-center">
                    <p className="text-3xl">🎉🎊🎉</p>
                    <p className="font-display mt-2 text-xl font-black text-white">
                      {lang === "bn"
                        ? `${d(CARDS_GOAL)}টি কার্ড কমপ্লিট!`
                        : lang === "hi"
                          ? `${CARDS_GOAL} कार्ड पूरे!`
                          : `${CARDS_GOAL} cards complete!`}
                    </p>
                    <p className="mt-1 text-sm text-slate-300">
                      {lang === "bn"
                        ? `আপনার ${d(roundReward)} টাকা বোনাস রেডি`
                        : lang === "hi"
                          ? `आपका ${roundReward} टका बोनस तैयार है`
                          : `Your ${roundReward} Tk bonus is ready`}
                    </p>
                    <button
                      onClick={claimRound}
                      disabled={claimingRound}
                      className="btn-vault mt-3 w-full !py-4 text-lg font-black shadow-[0_0_32px_rgba(215,255,63,0.5)]"
                    >
                      {claimingRound
                        ? t("er_claiming")
                        : lang === "bn"
                          ? `🎁 ${d(roundReward)} টাকা বোনাস নিন!`
                          : lang === "hi"
                            ? `🎁 ${roundReward} टका बोनस लें!`
                            : `🎁 Claim your ${roundReward} Tk bonus!`}
                    </button>
                  </div>
                ) : roundClaimed ? (
                  <p className="mt-4 rounded-2xl bg-[#d7ff3f]/10 p-4 text-center text-sm font-bold text-[#d7ff3f]">
                    {lang === "bn"
                      ? `✅ এই রাউন্ডের ${d(roundReward)} টাকা বোনাস নেওয়া হয়েছে! পরের রাউন্ড ১ ঘণ্টা পর ⏳`
                      : lang === "hi"
                        ? `✅ इस राउंड का ${roundReward} टका बोनस ले लिया गया है! अगला राउंड 1 घंटे बाद ⏳`
                        : `✅ This round's ${roundReward} Tk bonus is claimed! Next round in 1 hour ⏳`}
                  </p>
                ) : (
                  <p className="mt-3 text-center text-xs text-slate-500">
                    {t("er_cards_tip")}
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* referral */}
      <div className="glass mt-6 rounded-3xl p-6">
        <h2 className="font-display text-lg font-bold text-white">{t("er_refer_title")}</h2>
        <p className="mt-2 text-sm text-slate-400">
          {lang === "bn" ? (
            <>
              আপনার লিংক দিয়ে কেউ অ্যাকাউন্ট খুললেই বোনাস! এখন পর্যন্ত{" "}
              <b className="text-white">{d(refCount)} জন</b> জয়েন করেছে, আয়{" "}
              <b className="text-[#d7ff3f]">{money(refEarned)}</b>
            </>
          ) : lang === "hi" ? (
            <>
              आपके लिंक से कोई खाता खोले तो बोनस! अब तक{" "}
              <b className="text-white">{refCount} लोग</b> जुड़ चुके हैं, कमाई{" "}
              <b className="text-[#d7ff3f]">{money(refEarned)}</b>
            </>
          ) : (
            <>
              Bonus when someone opens an account with your link! So far{" "}
              <b className="text-white">{refCount} people</b> joined, earned{" "}
              <b className="text-[#d7ff3f]">{money(refEarned)}</b>
            </>
          )}
        </p>
        {refCode && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2">
              <code className="flex-1 truncate rounded-xl bg-black/40 px-4 py-3 text-sm text-[#d7ff3f]">
                {refLink}
              </code>
              <button
                onClick={() => copy(refLink, t("er_ref_link"))}
                className="shrink-0 rounded-xl bg-white/10 px-4 py-3 text-sm font-bold text-white"
              >
                📋
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">{t("er_ref_code")}:</span>
              <code className="rounded-lg bg-white/5 px-3 py-1.5 font-mono text-sm font-bold text-white">
                {refCode}
              </code>
              <button
                onClick={() => copy(refCode, t("er_ref_code"))}
                className="text-sm font-bold text-[#d7ff3f]"
              >
                {t("er_copy")}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* deposit */}
      <div id="deposit" className="glass mt-6 scroll-mt-24 rounded-3xl p-6">
        <h2 className="font-display text-lg font-bold text-white">{t("er_dep_title")}</h2>
        <p className="mt-1 text-xs text-slate-500">
          {t("er_dep_sub")}
        </p>
        {depPayNumber() ? (
          <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl border border-[#d7ff3f]/25 bg-[#d7ff3f]/[0.06] px-4 py-3">
            <div>
              <p className="text-xs text-slate-400">
                {lang === "bn" ? (
                  <>
                    📲 এই নম্বরে ({paymentMethodLabel(depMethod, lang)}){" "}
                    <b className="text-white">{paymentKindLabel(depPayInfo().kind, lang)}</b> করুন
                  </>
                ) : lang === "hi" ? (
                  <>
                    📲 इस नंबर ({paymentMethodLabel(depMethod, lang)}) पर{" "}
                    <b className="text-white">{paymentKindLabel(depPayInfo().kind, lang)}</b> करें
                  </>
                ) : (
                  <>
                    📲 <b className="text-white">{paymentKindLabel(depPayInfo().kind, lang)}</b> to this number ({paymentMethodLabel(depMethod, lang)})
                  </>
                )}
              </p>
              <p className="font-display text-xl font-bold tracking-wide text-[#d7ff3f]">{depPayNumber()}</p>
            </div>
            <button
              type="button"
              onClick={copyDepNumber}
              className="shrink-0 rounded-xl bg-[#d7ff3f]/15 px-4 py-2 text-sm font-bold text-[#d7ff3f] transition hover:bg-[#d7ff3f]/25"
            >
              {numCopied ? t("er_copied") : `📋 ${t("er_copy")}`}
            </button>
          </div>
        ) : null}
        <form onSubmit={deposit} className="mt-4 grid gap-3 sm:grid-cols-2">
          <input
            type="number"
            min={100}
            value={depAmount}
            onChange={(e) => setDepAmount(e.target.value)}
            placeholder={t("er_dep_amount_ph")}
            className="field sm:col-span-2"
            required
          />
          {liveDepMethods.length > 0 ? (
            <select value={depMethod} onChange={(e) => setDepMethod(e.target.value)} className="field">
              {liveDepMethods.map((m) => (
                <option key={m} value={m}>{paymentMethodLabel(m, lang)}</option>
              ))}
            </select>
          ) : (
            <p className="rounded-xl bg-white/[0.03] px-4 py-3 text-sm text-slate-500 sm:col-span-2">
              {t("er_dep_none")}
            </p>
          )}
          <input
            value={depTrx}
            onChange={(e) => setDepTrx(e.target.value)}
            placeholder={t("er_dep_trx_ph")}
            className="field"
            required
          />
          <button type="submit" disabled={depLoading} className="btn-vault sm:col-span-2 !py-3 text-sm">
            {depLoading ? t("er_sending") : t("er_dep_submit")}
          </button>
        </form>
        {deposits.length > 0 && (
          <div className="mt-4 space-y-2">
            {deposits.map((dd) => (
              <div key={dd.id} className="flex items-center justify-between rounded-xl bg-white/[0.03] px-4 py-2.5 text-sm">
                <span className="text-slate-300">
                  {money(Number(dd.amount_bdt))} • {paymentMethodLabel(dd.method, lang)} • {dd.trx_id}
                </span>
                <span
                  className={
                    dd.status === "approved"
                      ? "text-xs font-bold text-green-400"
                      : dd.status === "rejected"
                        ? "text-xs font-bold text-red-400"
                        : "text-xs font-bold text-amber-300"
                  }
                >
                  {dd.status === "approved" ? t("er_status_added") : dd.status === "rejected" ? t("er_status_rejected") : t("er_status_pending")}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* withdraw */}
      <div className="glass mt-6 rounded-3xl p-6">
        <h2 className="font-display text-lg font-bold text-white">{t("er_wd_title")}</h2>
        <p className="mt-1 text-xs text-slate-500">
          {lang === "bn"
            ? <>সর্বনিম্ন {tk(config?.min_withdraw_bdt ?? 500)} — বিকাশ / নগদ / রকেটে পাবেন</>
            : lang === "hi"
              ? <>न्यूनतम {tk(config?.min_withdraw_bdt ?? 500)} — bKash / Nagad / Rocket पर मिलेगा</>
              : <>Minimum {tk(config?.min_withdraw_bdt ?? 500)} — paid to bKash / Nagad / Rocket</>}
        </p>
        <form onSubmit={withdraw} className="mt-4 grid gap-3 sm:grid-cols-2">
          <input
            type="number"
            min={config?.min_withdraw_bdt ?? 500}
            value={wdAmount}
            onChange={(e) => setWdAmount(e.target.value)}
            placeholder={
              lang === "bn"
                ? `টাকার পরিমাণ (সর্বনিম্ন ${d(config?.min_withdraw_bdt ?? 500)})`
                : lang === "hi"
                  ? `राशि (न्यूनतम ${config?.min_withdraw_bdt ?? 500} टका)`
                  : `Amount (minimum ${config?.min_withdraw_bdt ?? 500} Tk)`
            }
            className="field sm:col-span-2"
            required
          />
          <select value={wdMethod} onChange={(e) => setWdMethod(e.target.value)} className="field">
            <option value="bkash">{paymentMethodLabel("bkash", lang)}</option>
            <option value="nagad">{paymentMethodLabel("nagad", lang)}</option>
            <option value="rocket">{paymentMethodLabel("rocket", lang)}</option>
          </select>
          <input
            value={wdAcct}
            onChange={(e) => setWdAcct(e.target.value)}
            placeholder={t("er_wd_acct_ph")}
            className="field"
            required
          />
          <button type="submit" disabled={wdLoading} className="btn-vault sm:col-span-2 !py-3 text-sm">
            {wdLoading ? t("er_sending") : t("er_wd_submit")}
          </button>
        </form>
        {withdrawals.length > 0 && (
          <div className="mt-4 space-y-2">
            {withdrawals.map((w) => (
              <div key={w.id} className="flex items-center justify-between rounded-xl bg-white/[0.03] px-4 py-2.5 text-sm">
                <span className="text-slate-300">
                  {money(Number(w.amount_bdt))} • {paymentMethodLabel(w.method, lang)} • {w.account_number}
                </span>
                <span
                  className={
                    w.status === "approved"
                      ? "text-xs font-bold text-green-400"
                      : w.status === "rejected"
                        ? "text-xs font-bold text-red-400"
                        : "text-xs font-bold text-amber-300"
                  }
                >
                  {w.status === "approved" ? t("er_status_done") : w.status === "rejected" ? t("er_status_rejected") : t("er_status_pending")}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* transactions */}
      <div className="glass mt-6 rounded-3xl p-6">
        <h2 className="font-display text-lg font-bold text-white">{t("er_txn_title")}</h2>
        <div className="mt-3 space-y-2">
          {txns.length === 0 && (
            <p className="py-4 text-center text-sm text-slate-500">{t("er_txn_empty")}</p>
          )}
          {txns.map((txn) => (
            <div key={txn.id} className="flex items-center justify-between rounded-xl bg-white/[0.03] px-4 py-2.5">
              <div>
                <p className="text-sm font-semibold text-white">{TXN[txn.type] ?? txn.type}</p>
                <p className="text-xs text-slate-500">{timeAgo(txn.created_at, lang)}</p>
              </div>
              <p className={`font-display font-bold ${Number(txn.amount_bdt) >= 0 ? "text-[#d7ff3f]" : "text-red-300"}`}>
                {Number(txn.amount_bdt) >= 0 ? "+" : "−"}{money(Math.abs(Number(txn.amount_bdt)))}
              </p>
            </div>
          ))}
        </div>
      </div>

      {earnBottomAds.map((code, i) => (
        <AdSlot key={i} code={code} className="mt-6 !px-0" />
      ))}

      {/* ad modal */}
      {adOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 p-4 backdrop-blur-sm">
          <div className="mx-auto my-8 max-w-lg rounded-3xl bg-[#0b1120] p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-white">{t("er_ad_title")}</h3>
              <button
                onClick={() => setAdOpen(false)}
                className="grid h-9 w-9 place-items-center rounded-lg bg-white/10 text-white"
              >
                ✕
              </button>
            </div>
            <div className="mt-4">
              {config?.reward_ad_code ? (
                <AdFrame code={config.reward_ad_code} />
              ) : (
                <div className="grid min-h-[240px] place-items-center rounded-xl bg-black/30 text-slate-500">
                  {t("er_ad_loading")}
                </div>
              )}
            </div>
            <div className="mt-4 text-center">
              {countdown > 0 ? (
                <p className="text-sm text-slate-400">
                  {lang === "bn" ? (
                    <>বোনাস পেতে অপেক্ষা করুন: <b className="font-display text-2xl text-[#d7ff3f]">{d(countdown)}</b> সে.</>
                  ) : lang === "hi" ? (
                    <>बोनस पाने के लिए इंतज़ार करें: <b className="font-display text-2xl text-[#d7ff3f]">{countdown}</b> से.</>
                  ) : (
                    <>Wait to get your bonus: <b className="font-display text-2xl text-[#d7ff3f]">{countdown}</b> sec.</>
                  )}
                </p>
              ) : (
                <button
                  onClick={claim}
                  disabled={claiming}
                  className="btn-vault w-full !py-3 text-sm"
                >
                  {claiming
                    ? t("er_adding")
                    : lang === "bn"
                      ? `🎁 ${formatBDT(config?.ad_reward_bdt ?? 0)} বোনাস নিন`
                      : lang === "hi"
                        ? `🎁 ${config?.ad_reward_bdt ?? 0} टका बोनस लें`
                        : `🎁 Claim ${formatTk(config?.ad_reward_bdt ?? 0)} bonus`}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
