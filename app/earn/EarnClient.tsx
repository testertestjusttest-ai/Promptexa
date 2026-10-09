"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { formatBDT, toBnDigits, timeAgo } from "@/lib/format";
import type { Wallet, WalletTxn } from "@/lib/types";

type Config = {
  enabled: boolean;
  ad_reward_bdt: number;
  ad_cooldown_sec: number;
  ad_daily_limit: number;
  min_withdraw_bdt: number;
  reward_ad_code: string;
  ads_watched_today: number;
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

export default function EarnClient() {
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

  const [wdAmount, setWdAmount] = useState("");
  const [wdMethod, setWdMethod] = useState("bkash");
  const [wdAcct, setWdAcct] = useState("");
  const [wdLoading, setWdLoading] = useState(false);

  const load = useCallback(async () => {
    const [wRes, cRes] = await Promise.all([
      fetch("/api/wallet"),
      fetch("/api/rewards/config"),
    ]);
    const w = await wRes.json();
    const c = await cRes.json();
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
    if (c.ok) setConfig(c.config);
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

      {/* watch ad */}
      <div className="glass mt-6 rounded-3xl p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-white">🎬 অ্যাড দেখে আয়</h2>
          {config?.enabled && (
            <span className="rounded-full bg-[#d7ff3f]/15 px-3 py-1 text-xs font-bold text-[#d7ff3f]">
              প্রতি অ্যাডে {formatBDT(config.ad_reward_bdt)}
            </span>
          )}
        </div>
        {!config?.enabled ? (
          <p className="mt-3 text-sm text-slate-500">রিওয়ার্ড সিস্টেম এখন বন্ধ আছে।</p>
        ) : (
          <>
            <p className="mt-2 text-sm text-slate-400">
              অ্যাডটি {toBnDigits(WATCH_SEC)} সেকেন্ড দেখুন, বোনাস সাথে সাথে ওয়ালেটে!
              দৈনিক সর্বোচ্চ {toBnDigits(config.ad_daily_limit)}টি অ্যাড।
            </p>

            {/* 20-card daily progress */}
            {(() => {
              const watched = Math.min(config.ads_watched_today ?? 0, CARDS_GOAL);
              const done = watched >= CARDS_GOAL;
              return (
                <div className="mt-4 rounded-2xl bg-black/30 p-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">🎯 আজকের অগ্রগতি</span>
                    <span className="font-bold text-[#d7ff3f]">
                      {toBnDigits(watched)}/{toBnDigits(CARDS_GOAL)} কার্ড
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-10 gap-1.5">
                    {Array.from({ length: CARDS_GOAL }).map((_, i) => (
                      <div
                        key={i}
                        className={`flex aspect-square items-center justify-center rounded-lg text-xs font-bold transition ${
                          i < watched
                            ? "bg-[#d7ff3f] text-black shadow-[0_0_8px_rgba(215,255,63,0.5)]"
                            : "bg-white/[0.06] text-slate-600"
                        }`}
                      >
                        {i < watched ? "✓" : toBnDigits(i + 1)}
                      </div>
                    ))}
                  </div>
                  {done ? (
                    <p className="mt-3 text-center text-sm font-bold text-[#d7ff3f]">
                      🎉 আজকের {toBnDigits(CARDS_GOAL)}টি সম্পূর্ণ — {formatBDT(CARDS_GOAL * config.ad_reward_bdt)} আয়!
                    </p>
                  ) : (
                    <p className="mt-2 text-center text-xs text-slate-500">
                      প্রতিটি কার্ড = {formatBDT(config.ad_reward_bdt)} — {toBnDigits(CARDS_GOAL)}টি
                      পূরণ হলে {formatBDT(CARDS_GOAL * config.ad_reward_bdt)}!
                    </p>
                  )}
                </div>
              );
            })()}

            <button onClick={openAd} className="btn-vault mt-4 w-full !py-3 text-sm">
              ▶️ অ্যাড দেখুন
            </button>
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
