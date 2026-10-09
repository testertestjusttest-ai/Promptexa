"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { formatBDT, toBnDigits, timeAgo } from "@/lib/format";
import type { Wallet, WalletTxn } from "@/lib/types";
import AdSlot from "@/components/AdSlot";

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

export default function EarnClient({
  earnTopAds = [],
  earnBottomAds = [],
}: {
  earnTopAds?: string[];
  earnBottomAds?: string[];
}) {
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

  // 20-box hourly round: watch all 20 → claim ৳20 lump sum
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

  const load = useCallback(async () => {
    const [wRes, cRes, rRes] = await Promise.all([
      fetch("/api/wallet"),
      fetch("/api/rewards/config"),
      fetch("/api/rewards/round"),
    ]);
    const w = await wRes.json();
    const c = await cRes.json();
    const r = await rRes.json().catch(() => ({}));
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
      setCardsDone(r.cards_done ?? []);
      setRoundClaimed(!!r.claimed);
      setRoundReward(Number(r.round_reward) || 20);
      setRoundSecsLeft(Number(r.seconds_left) || 0);
      setRoundActive(!!r.round_start);
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
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "ব্যর্থ");
      setCardsDone(d.cards_done ?? []);
      setRoundClaimed(!!d.claimed);
      setRoundSecsLeft(Number(d.seconds_left) || 0);
      setRoundActive(true);
      setNowMs(Date.now());
      if ((d.cards_done ?? []).length >= CARDS_GOAL) {
        setMsg(`🎉 ${toBnDigits(CARDS_GOAL)}টি কার্ড সম্পূর্ণ! এখন নিচের বাটনে ${toBnDigits(d.round_reward ?? roundReward)} টাকা বোনাস নিন!`);
        playCelebration();
      }
    } catch (e) {
      setMsg(`⚠️ ${e instanceof Error ? e.message : "ব্যর্থ"} — আবার চেষ্টা করুন`);
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
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "ব্যর্থ");
      setMsg(`🎉 ${toBnDigits(d.amount)} টাকা ওয়ালেটে যোগ হয়েছে! পরের রাউন্ড ১ ঘণ্টা পর।`);
      playCelebration();
      load();
    } catch (e) {
      setMsg(`⚠️ ${e instanceof Error ? e.message : "ব্যর্থ"}`);
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
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "ব্যর্থ");
      setMsg(`🎉 ${formatBDT(d.amount)} বোনাস ওয়ালেটে যোগ হয়েছে!`);
      setAdOpen(false);
      load();
    } catch (e) {
      setMsg(`⚠️ ${e instanceof Error ? e.message : "ব্যর্থ"}`);
    } finally {
      setClaiming(false);
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
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "ব্যর্থ");
      setMsg("✅ উত্তোলন রিকোয়েস্ট পাঠানো হয়েছে — অ্যাডমিন যাচাই করে পাঠিয়ে দেবে।");
      setWdAmount("");
      setWdAcct("");
      load();
    } catch (e) {
      setMsg(`⚠️ ${e instanceof Error ? e.message : "ব্যর্থ"}`);
    } finally {
      setWdLoading(false);
    }
  }

  function copy(text: string, label: string) {
    navigator.clipboard.writeText(text).then(
      () => setMsg(`📋 ${label} কপি হয়েছে!`),
      () => setMsg("⚠️ কপি হয়নি")
    );
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center text-slate-400">
        লোড হচ্ছে...
      </div>
    );
  }

  if (!loggedIn) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <div className="glass rounded-3xl p-8">
          <div className="text-5xl">💰</div>
          <h1 className="mt-4 font-display text-xl font-bold text-white">
            আয় করতে লগইন করুন
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            অ্যাড দেখে ও বন্ধুদের রেফার করে টাকা আয় করুন
          </p>
          <Link href="/auth/login" className="btn-vault mt-6 inline-flex">
            লগইন / রেজিস্টার
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
        💰 আয় করুন
      </h1>
      <p className="mt-1 text-sm text-slate-400">
        অ্যাড দেখুন, বন্ধুদের রেফার করুন — টাকা জমা হবে ওয়ালেটে
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
      <div className="glass ring-conic mt-6 rounded-3xl p-6">
        <p className="text-xs uppercase tracking-wide text-slate-500">
          ওয়ালেট ব্যালেন্স
        </p>
        <p className="font-display text-4xl font-bold text-[#d7ff3f]">
          {formatBDT(Number(wallet?.balance_bdt ?? 0))}
        </p>
        <div className="mt-4 grid grid-cols-3 gap-3 text-center">
          <div className="rounded-xl bg-white/[0.04] p-3">
            <p className="text-[11px] text-slate-500">মোট আয়</p>
            <p className="font-bold text-white">{formatBDT(Number(wallet?.total_earned_bdt ?? 0))}</p>
          </div>
          <div className="rounded-xl bg-white/[0.04] p-3">
            <p className="text-[11px] text-slate-500">খরচ</p>
            <p className="font-bold text-white">{formatBDT(Number(wallet?.total_spent_bdt ?? 0))}</p>
          </div>
          <div className="rounded-xl bg-white/[0.04] p-3">
            <p className="text-[11px] text-slate-500">উত্তোলন</p>
            <p className="font-bold text-white">{formatBDT(Number(wallet?.total_withdrawn_bdt ?? 0))}</p>
          </div>
        </div>
        <Link href="/shop" className="btn-vault mt-4 inline-flex w-full !py-3 text-sm">
          🛒 ব্যালেন্স দিয়ে কিনুন
        </Link>
      </div>

      {/* watch ad — 20-card hourly round, ৳20 lump sum */}
      <div className="glass mt-6 rounded-3xl p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-white">🎬 অ্যাড দেখে আয়</h2>
          {config?.enabled && (
            <span className="rounded-full bg-[#d7ff3f]/15 px-3 py-1 text-xs font-bold text-[#d7ff3f]">
              প্রতি রাউন্ডে {toBnDigits(roundReward)} টাকা
            </span>
          )}
        </div>
        {!config?.enabled ? (
          <p className="mt-3 text-sm text-slate-500">রিওয়ার্ড সিস্টেম এখন বন্ধ আছে।</p>
        ) : (
          <>
            <p className="mt-2 text-sm text-slate-400">
              💰 <b className="text-white">আর্ন নাও</b> চাপুন — {toBnDigits(CARDS_GOAL)}টি কার্ড
              আসবে। প্রতিটি কার্ডে ক্লিক করলে অ্যাড খুলবে, {toBnDigits(BOX_WAIT_SEC)} সেকেন্ড
              পর কার্ডে ✓ পড়বে (লক থাকবে)। <b className="text-[#d7ff3f]">{toBnDigits(CARDS_GOAL)}টি শেষ হলে একসাথে {toBnDigits(roundReward)} টাকা ওয়ালেটে!</b>
              <br />⏳ প্রতি রাউন্ড ১ ঘণ্টা — সময় শেষ হলে নতুন রাউন্ড শুরু হবে।
            </p>

            {!cardsOn ? (
              <button onClick={() => setCardsOn(true)} className="btn-vault mt-4 w-full !py-3.5 text-base font-bold">
                💰 Earn Now
              </button>
            ) : (
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">🎯 এই রাউন্ডের অগ্রগতি</span>
                  <span className="font-bold text-[#d7ff3f]">
                    {toBnDigits(cardsDone.length)}/{toBnDigits(CARDS_GOAL)} কার্ড
                    {roundActive && (
                      <span className="ml-2 text-slate-400">
                        ⏳ {toBnDigits(Math.floor(roundWaitSec / 60))}:{toBnDigits(String(roundWaitSec % 60).padStart(2, "0"))}
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
                        className={`relative flex min-h-[76px] flex-col items-center justify-center overflow-hidden rounded-2xl border font-bold transition-all duration-300 ${
                          done
                            ? "border-[#d7ff3f]/60 bg-gradient-to-br from-[#d7ff3f]/25 to-lime-500/10 text-[#d7ff3f] shadow-[0_0_16px_rgba(215,255,63,0.35)]"
                            : counting
                              ? "border-cyan-300/60 bg-cyan-400/10 text-cyan-200"
                              : "border-white/10 bg-white/[0.04] text-white hover:border-[#d7ff3f]/50 hover:bg-[#d7ff3f]/10 active:scale-95"
                        } disabled:cursor-default`}
                      >
                        {done ? (
                          <>
                            <span className="text-2xl">✓</span>
                            <span className="mt-0.5 text-[10px] font-bold text-[#d7ff3f]/90">কমপ্লিট ✓</span>
                          </>
                        ) : counting ? (
                          <>
                            <span className="font-display text-2xl text-cyan-300">
                              {toBnDigits(boxSecs)}
                            </span>
                            <span className="mt-0.5 text-[10px] text-slate-400">সেকেন্ড…</span>
                            <span
                              className="absolute bottom-0 left-0 h-1 bg-cyan-300/70 transition-all duration-1000"
                              style={{ width: `${((BOX_WAIT_SEC - boxSecs) / BOX_WAIT_SEC) * 100}%` }}
                            />
                          </>
                        ) : (
                          <>
                            <span className="font-display text-xl text-slate-200">
                              {toBnDigits(i + 1)}
                            </span>
                            <span className="mt-0.5 text-[10px] text-slate-500">অ্যাড দেখুন</span>
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
                      {toBnDigits(CARDS_GOAL)}টি কার্ড কমপ্লিট!
                    </p>
                    <p className="mt-1 text-sm text-slate-300">
                      আপনার {toBnDigits(roundReward)} টাকা বোনাস রেডি
                    </p>
                    <button
                      onClick={claimRound}
                      disabled={claimingRound}
                      className="btn-vault mt-3 w-full !py-4 text-lg font-black shadow-[0_0_32px_rgba(215,255,63,0.5)]"
                    >
                      {claimingRound ? "⏳ বোনাস যোগ হচ্ছে..." : `🎁 ${toBnDigits(roundReward)} টাকা বোনাস নিন!`}
                    </button>
                  </div>
                ) : roundClaimed ? (
                  <p className="mt-4 rounded-2xl bg-[#d7ff3f]/10 p-4 text-center text-sm font-bold text-[#d7ff3f]">
                    ✅ এই রাউন্ডের {toBnDigits(roundReward)} টাকা বোনাস নেওয়া হয়েছে! পরের রাউন্ড ১ ঘণ্টা পর ⏳
                  </p>
                ) : (
                  <p className="mt-3 text-center text-xs text-slate-500">
                    💡 কার্ডে ক্লিক → নতুন ট্যাবে অ্যাড খুলবে → {toBnDigits(BOX_WAIT_SEC)} সেকেন্ড
                    অপেক্ষা → ✓ লকড (১ ঘণ্টা)
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* referral */}
      <div className="glass mt-6 rounded-3xl p-6">
        <h2 className="font-display text-lg font-bold text-white">👥 বন্ধুদের রেফার করুন</h2>
        <p className="mt-2 text-sm text-slate-400">
          আপনার লিংক দিয়ে কেউ অ্যাকাউন্ট খুললেই বোনাস! এখন পর্যন্ত{" "}
          <b className="text-white">{toBnDigits(refCount)} জন</b> জয়েন করেছে, আয়{" "}
          <b className="text-[#d7ff3f]">{formatBDT(refEarned)}</b>
        </p>
        {refCode && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2">
              <code className="flex-1 truncate rounded-xl bg-black/40 px-4 py-3 text-sm text-[#d7ff3f]">
                {refLink}
              </code>
              <button
                onClick={() => copy(refLink, "রেফারেল লিংক")}
                className="shrink-0 rounded-xl bg-white/10 px-4 py-3 text-sm font-bold text-white"
              >
                📋
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">কোড:</span>
              <code className="rounded-lg bg-white/5 px-3 py-1.5 font-mono text-sm font-bold text-white">
                {refCode}
              </code>
              <button
                onClick={() => copy(refCode, "রেফারেল কোড")}
                className="text-sm font-bold text-[#d7ff3f]"
              >
                কপি
              </button>
            </div>
          </div>
        )}
      </div>

      {/* withdraw */}
      <div className="glass mt-6 rounded-3xl p-6">
        <h2 className="font-display text-lg font-bold text-white">💸 টাকা উত্তোলন</h2>
        <p className="mt-1 text-xs text-slate-500">
          সর্বনিম্ন {formatBDT(config?.min_withdraw_bdt ?? 500)} — বিকাশ / নগদ / রকেটে পাবেন
        </p>
        <form onSubmit={withdraw} className="mt-4 grid gap-3 sm:grid-cols-2">
          <input
            type="number"
            min={config?.min_withdraw_bdt ?? 500}
            value={wdAmount}
            onChange={(e) => setWdAmount(e.target.value)}
            placeholder={`টাকার পরিমাণ (সর্বনিম্ন ${config?.min_withdraw_bdt ?? 500})`}
            className="field sm:col-span-2"
            required
          />
          <select value={wdMethod} onChange={(e) => setWdMethod(e.target.value)} className="field">
            <option value="bkash">বিকাশ</option>
            <option value="nagad">নগদ</option>
            <option value="rocket">রকেট</option>
          </select>
          <input
            value={wdAcct}
            onChange={(e) => setWdAcct(e.target.value)}
            placeholder="মোবাইল নম্বর (01XXXXXXXXX)"
            className="field"
            required
          />
          <button type="submit" disabled={wdLoading} className="btn-vault sm:col-span-2 !py-3 text-sm">
            {wdLoading ? "পাঠানো হচ্ছে..." : "উত্তোলন রিকোয়েস্ট পাঠান"}
          </button>
        </form>
        {withdrawals.length > 0 && (
          <div className="mt-4 space-y-2">
            {withdrawals.map((w) => (
              <div key={w.id} className="flex items-center justify-between rounded-xl bg-white/[0.03] px-4 py-2.5 text-sm">
                <span className="text-slate-300">
                  {formatBDT(Number(w.amount_bdt))} • {w.method} • {w.account_number}
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
                  {w.status === "approved" ? "✅ সম্পন্ন" : w.status === "rejected" ? "❌ বাতিল" : "⏳ প্রসেসিং"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* transactions */}
      <div className="glass mt-6 rounded-3xl p-6">
        <h2 className="font-display text-lg font-bold text-white">📜 লেনদেন হিস্ট্রি</h2>
        <div className="mt-3 space-y-2">
          {txns.length === 0 && (
            <p className="py-4 text-center text-sm text-slate-500">এখনো কোনো লেনদেন নেই</p>
          )}
          {txns.map((t) => (
            <div key={t.id} className="flex items-center justify-between rounded-xl bg-white/[0.03] px-4 py-2.5">
              <div>
                <p className="text-sm font-semibold text-white">{TXN_BN[t.type] ?? t.type}</p>
                <p className="text-xs text-slate-500">{timeAgo(t.created_at)}</p>
              </div>
              <p className={`font-display font-bold ${Number(t.amount_bdt) >= 0 ? "text-[#d7ff3f]" : "text-red-300"}`}>
                {Number(t.amount_bdt) >= 0 ? "+" : "−"}{formatBDT(Math.abs(Number(t.amount_bdt)))}
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
              <h3 className="font-display font-bold text-white">🎬 স্পন্সরড অ্যাড</h3>
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
                  অ্যাড লোড হচ্ছে...
                </div>
              )}
            </div>
            <div className="mt-4 text-center">
              {countdown > 0 ? (
                <p className="text-sm text-slate-400">
                  বোনাস পেতে অপেক্ষা করুন:{" "}
                  <b className="font-display text-2xl text-[#d7ff3f]">{toBnDigits(countdown)}</b> সে.
                </p>
              ) : (
                <button
                  onClick={claim}
                  disabled={claiming}
                  className="btn-vault w-full !py-3 text-sm"
                >
                  {claiming ? "যোগ হচ্ছে..." : `🎁 ${formatBDT(config?.ad_reward_bdt ?? 0)} বোনাস নিন`}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
