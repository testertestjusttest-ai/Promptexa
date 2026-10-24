"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { toBnDigits } from "@/lib/format";
import { useDemo } from "./store";
import { Back, Empty, Field, Page, SectionTitle } from "./ui";
import { fmtUSD, fmtPct, priceSeries, ChangeBadge, Spark, CoinIcon, CoinRow, TickerTape, TradeChart, OrderBook, useCexBalances, balTotalUSD, bn, fmtBDT, useCexCoins, coinOf, LAUNCHPADS, EARN_PRODUCTS, NFTS, ANNOUNCEMENTS, FAQS, BLOGS, ACADEMY, useSkin, useLocal, Stat, PageHead, CexOrder, WalletShell } from "./cex-shared";

export function CexWallet() {
  const coins = useCexCoins();
  const { base } = useDemo();
  const { card, sub } = useSkin();
  const [bal] = useCexBalances();
  const total = balTotalUSD(bal, coins);
  const wallets = [
    ["📊", "স্পট ওয়ালেট", total * 0.6, "/wallet/spot", "ট্রেডিং ব্যালেন্স"],
    ["⚡", "ফিউচার্স ওয়ালেট", total * 0.25, "/wallet/futures", "মার্জিন ব্যালেন্স"],
    ["💼", "ফান্ডিং ওয়ালেট", total * 0.15, "/wallet/funding", "P2P ও পেমেন্ট"],
  ];
  return (
    <WalletShell t="👛 ওয়ালেট ওভারভিউ">
      <div className="rounded-2xl bg-gradient-to-br from-[#f0b90b] to-[#b57e04] p-5 text-black">
        <p className="text-xs font-bold opacity-70">মোট সম্পদ (আনুমানিক)</p>
        <p className="mt-1 text-3xl font-black">${fmtUSD(total)}</p>
        <p className="text-sm font-bold opacity-70">≈ {fmtBDT(total)} টাকা</p>
        <div className="mt-3 flex gap-2">
          <Link href={`${base}/deposit`} className="flex-1 rounded-xl bg-black/85 py-2.5 text-center text-xs font-black text-[#f0b90b]">📥 ডিপোজিট</Link>
          <Link href={`${base}/withdraw`} className="flex-1 rounded-xl bg-black/85 py-2.5 text-center text-xs font-black text-[#f0b90b]">📤 উইথড্র</Link>
          <Link href={`${base}/convert`} className="flex-1 rounded-xl bg-black/85 py-2.5 text-center text-xs font-black text-[#f0b90b]">🔄 কনভার্ট</Link>
        </div>
      </div>
      <div className="mt-3 space-y-2">
        {wallets.map(([e, t, v, href, d]) => (
          <Link key={href} href={`${base}${href}`} className={`${card} flex items-center gap-3 p-4 transition hover:border-[#f0b90b]/40`}>
            <span className="text-3xl">{e}</span>
            <div className="flex-1"><p className="text-sm font-black">{t}</p><p className={`text-[11px] ${sub}`}>{d}</p></div>
            <div className="text-right"><p className="font-black">${fmtUSD(v as number)}</p><span className="text-xs opacity-50">→</span></div>
          </Link>
        ))}
      </div>
    </WalletShell>
  );
}

function CoinBalances({ filter }: { filter?: (code: string) => boolean }) {
  const coins = useCexCoins();
  const { card, sub } = useSkin();
  const [bal] = useCexBalances();
  const rows = Object.entries(bal).filter(([c]) => !filter || filter(c));
  return (
    <div className={`${card} overflow-hidden`}>
      {rows.map(([code, q]) => {
        const c = coinOf(code, coins);
        const v = q * c.price;
        return (
          <div key={code} className="flex items-center gap-3 border-b border-white/5 p-3 last:border-0">
            <CoinIcon code={code} size={34} />
            <div className="flex-1"><p className="text-sm font-black">{code}</p><p className={`text-[11px] ${sub}`}>{c.bn}</p></div>
            <div className="text-right"><p className="text-sm font-black">{bn(q.toFixed(q < 1 ? 4 : 2))}</p><p className={`text-[11px] ${sub}`}>${fmtUSD(v)}</p></div>
          </div>
        );
      })}
      {rows.length === 0 && <p className={`p-6 text-center text-xs ${sub}`}>ব্যালেন্স খালি</p>}
    </div>
  );
}

export function CexSpotWallet() {
  const { base } = useDemo();
  return (
    <WalletShell t="📊 স্পট ওয়ালেট" sub="ট্রেডিংয়ের জন্য উপলব্ধ ব্যালেন্স">
      <CoinBalances />
      <Link href={`${base}/trade/BTCUSDT`} className="mt-3 block rounded-xl bg-[#f0b90b] py-3 text-center text-sm font-black text-black">📈 ট্রেড করুন</Link>
    </WalletShell>
  );
}

export function CexFuturesWallet() {
  const { base } = useDemo();
  const { card, sub } = useSkin();
  return (
    <WalletShell t="⚡ ফিউচার্স ওয়ালেট" sub="মার্জিন ট্রেডিং ব্যালেন্স">
      <div className={`${card} p-4`}>
        <div className="flex justify-between text-sm"><span className={sub}>মোট মার্জিন</span><b>$25,000.00</b></div>
        <div className="mt-2 flex justify-between text-sm"><span className={sub}>ব্যবহৃত</span><b>$4,200.00</b></div>
        <div className="mt-2 flex justify-between text-sm"><span className={sub}>উপলব্ধ</span><b className="text-emerald-400">$20,800.00</b></div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full w-[17%] rounded-full bg-[#f0b90b]" /></div>
      </div>
      <Link href={`${base}/futures`} className="mt-3 block rounded-xl bg-[#f0b90b] py-3 text-center text-sm font-black text-black">⚡ ফিউচার্স ট্রেড</Link>
    </WalletShell>
  );
}

export function CexFundingWallet() {
  const { base } = useDemo();
  return (
    <WalletShell t="💼 ফান্ডিং ওয়ালেট" sub="P2P ও পেমেন্টের জন্য">
      <CoinBalances filter={(c) => c === "USDT"} />
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Link href={`${base}/p2p`} className="rounded-xl bg-[#0ecb81] py-3 text-center text-sm font-black text-white">🤝 P2P ট্রেড</Link>
        <Link href={`${base}/deposit-fiat`} className="rounded-xl bg-white/10 py-3 text-center text-sm font-black">💰 ফিয়াট ডিপোজিট</Link>
      </div>
    </WalletShell>
  );
}

/* ================= HISTORIES ================= */

export function CexTxHistory() {
  const { card, sub } = useSkin();
  const [tab, setTab] = useState<"all" | "dep" | "wd">("all");
  const txs = [
    { t: "📥", n: "USDT ডিপোজিট (TRC20)", d: "১১ অক্টোবর, ৩:৪৫ PM", a: "+500.00 USDT", s: "✅ সম্পন্ন", dep: true },
    { t: "📤", n: "BTC উইথড্র", d: "১০ অক্টোবর, ১১:২০ AM", a: "-0.05 BTC", s: "✅ সম্পন্ন", dep: false },
    { t: "📥", n: "ফিয়াট ডিপোজিট (বিকাশ)", d: "৯ অক্টোবর, ৫:১০ PM", a: "+12,100 টাকা", s: "✅ সম্পন্ন", dep: true },
    { t: "📤", n: "ETH উইথড্র", d: "৭ অক্টোবর, ৯:০৫ AM", a: "-1.2 ETH", s: "⏳ প্রসেসিং", dep: false },
    { t: "📥", n: "USDT ডিপোজিট (BEP20)", d: "৫ অক্টোবর, ২:৩০ PM", a: "+1,000.00 USDT", s: "✅ সম্পন্ন", dep: true },
  ].filter((x) => tab === "all" || (tab === "dep" ? x.dep : !x.dep));
  return (
    <Page>
      <PageHead t="🧾 লেনদেন হিস্ট্রি" sub="ডিপোজিট ও উইথড্র রেকর্ড" />
      <div className="mb-3 flex gap-1.5">
        {([["all", "সব"], ["dep", "📥 ডিপোজিট"], ["wd", "📤 উইথড্র"]] as const).map(([v, t]) => (
          <button key={v} onClick={() => setTab(v)} className={`rounded-xl px-4 py-2 text-xs font-black ${tab === v ? "bg-[#f0b90b] text-black" : "bg-white/5 text-slate-400"}`}>{t}</button>
        ))}
      </div>
      <div className={`${card} divide-y divide-white/5`}>
        {txs.map((x, i) => (
          <div key={i} className="flex items-center gap-3 p-3">
            <span className="text-2xl">{x.t}</span>
            <div className="flex-1"><p className="text-sm font-bold">{x.n}</p><p className={`text-[11px] ${sub}`}>{x.d}</p></div>
            <div className="text-right"><p className={`text-sm font-black ${x.dep ? "text-emerald-400" : "text-white"}`}>{x.a}</p><p className="text-[11px] text-emerald-400">{x.s}</p></div>
          </div>
        ))}
      </div>
    </Page>
  );
}

export function CexSpotOrders() {
  const { card, sub } = useSkin();
  const [orders] = useLocal<CexOrder[]>("spot_orders", []);
  const [tab, setTab] = useState<"open" | "done">("done");
  return (
    <Page>
      <PageHead t="📝 স্পট অর্ডার হিস্ট্রি" />
      <div className="mb-3 flex gap-1.5">
        {(["open", "done"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`rounded-xl px-4 py-2 text-xs font-black ${tab === t ? "bg-[#f0b90b] text-black" : "bg-white/5 text-slate-400"}`}>{t === "open" ? "⏳ ওপেন" : "✅ সম্পন্ন"}</button>
        ))}
      </div>
      {orders.length === 0 ? <div className={card}><Empty emoji="📝" text="কোনো অর্ডার নেই" /></div> : (
        <div className="space-y-2">
          {orders.map((o) => (
            <div key={o.id} className={`${card} p-3`}>
              <div className="flex justify-between text-sm"><b className={o.side === "buy" ? "text-[#0ecb81]" : "text-[#f6465d]"}>{o.side === "buy" ? "🟢 কিনুন" : "🔴 বিক্রি"}</b><b>{o.pair}</b></div>
              <div className={`mt-1 flex justify-between text-xs ${sub}`}><span>{o.type} • {o.qty} @ ${fmtUSD(o.price)}</span><b className="text-white">${fmtUSD(o.total)}</b></div>
              <p className="mt-1 text-[11px] text-emerald-400">{o.status}</p>
            </div>
          ))}
        </div>
      )}
    </Page>
  );
}

export function CexFuturesOrders() {
  const { card, sub } = useSkin();
  const [orders, setOrders] = useLocal<CexOrder[]>("fut_orders", []);
  return (
    <Page>
      <PageHead t="⚡ ফিউচার্স অর্ডার হিস্ট্রি" />
      {orders.length === 0 ? <div className={card}><Empty emoji="⚡" text="কোনো ফিউচার্স অর্ডার নেই" /></div> : (
        <div className="space-y-2">
          {orders.map((o) => (
            <div key={o.id} className={`${card} p-3`}>
              <div className="flex justify-between text-sm"><b>{o.type}</b><b>{o.pair}</b></div>
              <div className={`mt-1 flex justify-between text-xs ${sub}`}><span>{o.qty} @ ${fmtUSD(o.price)}</span><b className="text-emerald-400">PnL: +${fmtUSD(o.total * 0.02)}</b></div>
              <button onClick={() => setOrders(orders.filter((x) => x.id !== o.id))} className="mt-2 rounded-lg bg-red-500/15 px-3 py-1.5 text-[11px] font-bold text-red-400">❌ পজিশন বন্ধ করুন</button>
            </div>
          ))}
        </div>
      )}
    </Page>
  );
}

export function CexTradeHistory() {
  const { card, sub } = useSkin();
  const [spot] = useLocal<CexOrder[]>("spot_orders", []);
  const [fut] = useLocal<CexOrder[]>("fut_orders", []);
  const all = [...spot, ...fut].sort((a, b) => b.date - a.date);
  const totalVol = all.reduce((s, o) => s + o.total, 0);
  return (
    <Page>
      <PageHead t="📜 ট্রেড হিস্ট্রি" sub="সব মার্কেটের সম্পূর্ণ রেকর্ড" />
      <div className="mb-3 grid grid-cols-3 gap-2">
        <Stat e="📊" v={bn(all.length)} t="মোট ট্রেড" />
        <Stat e="💵" v={`$${fmtUSD(totalVol)}`} t="মোট ভলিউম" />
        <Stat e="💰" v={`$${fmtUSD(totalVol * 0.001)}`} t="মোট ফি" />
      </div>
      {all.length === 0 ? <div className={card}><Empty emoji="📜" text="এখনো ট্রেড করেননি" /></div> : (
        <div className="space-y-2">
          {all.map((o) => (
            <div key={o.id} className={`${card} flex items-center justify-between p-3 text-xs`}>
              <span><b>{o.pair}</b> <span className={o.side === "buy" ? "text-[#0ecb81]" : "text-[#f6465d]"}>{o.side === "buy" ? "কিনুন" : "বিক্রি"}</span></span>
              <span className={sub}>{new Date(o.date).toLocaleDateString("bn-BD")}</span>
              <b>${fmtUSD(o.total)}</b>
            </div>
          ))}
        </div>
      )}
    </Page>
  );
}

/* ================= SECURITY / ACCOUNT ================= */

export function Cex2FA() {
  const { card, sub, input } = useSkin();
  const [code, setCode] = useState("");
  const [done, setDone] = useState(false);
  const [enabled, setEnabled] = useLocal("2fa_on", false);
  return (
    <Page narrow>
      <PageHead t="🔐 2FA সেটআপ" sub="গুগল অথেনটিকেটর দিয়ে সুরক্ষা বাড়ান" />
      {enabled ? (
        <div className={`${card} p-5 text-center`}>
          <p className="text-5xl">✅</p>
          <p className="mt-2 text-lg font-black text-emerald-400">2FA চালু আছে</p>
          <p className={`mt-1 text-xs ${sub}`}>আপনার অ্যাকাউন্ট অতিরিক্ত সুরক্ষিত</p>
          <button onClick={() => setEnabled(false)} className="mt-4 rounded-xl bg-red-500/15 px-6 py-2.5 text-sm font-bold text-red-400">2FA বন্ধ করুন</button>
        </div>
      ) : !done ? (
        <div className={`${card} p-5`}>
          <p className={`text-xs ${sub}`}>১. Google Authenticator অ্যাপে এই QR স্ক্যান করুন (ডেমো)</p>
          <div className="mx-auto mt-3 grid h-40 w-40 place-items-center rounded-2xl bg-white p-2">
            <div className="grid h-full w-full place-items-center rounded-xl bg-[repeating-conic-gradient(#000_0_25%,#fff_0_50%)] bg-[length:18px_18px] text-3xl">◈</div>
          </div>
          <p className={`mt-3 text-xs ${sub}`}>২. অ্যাপের ৬ সংখ্যার কোড দিন</p>
          <input value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" placeholder="000000" className={`${input} mt-1 text-center text-2xl tracking-[0.4em]`} />
          <button onClick={() => code.length === 6 && setDone(true)} className="mt-4 w-full rounded-xl bg-[#f0b90b] py-3 text-sm font-black text-black">✅ যাচাই করুন</button>
        </div>
      ) : (
        <div className={`${card} p-5 text-center`}>
          <p className="text-5xl">🎉</p>
          <p className="mt-2 text-lg font-black text-emerald-400">2FA চালু হয়েছে!</p>
          <button onClick={() => { setEnabled(true); setDone(false); }} className="mt-4 w-full rounded-xl bg-[#f0b90b] py-3 text-sm font-black text-black">সম্পন্ন</button>
        </div>
      )}
    </Page>
  );
}

export function CexKyc() {
  const { card, sub, input } = useSkin();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ name: "", nid: "", dob: "" });
  const [, setStatus] = useLocal("kyc_status", "none");
  const F = (k: keyof typeof form, ph: string) => (
    <input value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} placeholder={ph} className={`${input} mt-2`} />
  );
  return (
    <Page narrow>
      <PageHead t="🪪 KYC ভেরিফিকেশন" sub="পরিচয় যাচাই — ১০ মিনিটে সম্পন্ন" />
      <div className="mb-3 flex gap-1">
        {["তথ্য", "ডকুমেন্ট", "সেলফি"].map((t, i) => (
          <div key={t} className={`flex-1 rounded-xl py-2 text-center text-[11px] font-black ${step >= i ? "bg-[#f0b90b] text-black" : "bg-white/5 text-slate-500"}`}>{bn(i + 1)}. {t}</div>
        ))}
      </div>
      {step === 0 && (
        <div className={`${card} p-5`}>
          {F("name", "পূর্ণ নাম (NID অনুযায়ী)")}
          {F("nid", "NID নম্বর (১০/১৭ সংখ্যা)")}
          {F("dob", "জন্ম তারিখ (DD/MM/YYYY)")}
          <button onClick={() => form.name.length >= 3 && form.nid.length >= 10 && setStep(1)} className="mt-4 w-full rounded-xl bg-[#f0b90b] py-3 text-sm font-black text-black">➡️ পরবর্তী</button>
        </div>
      )}
      {step === 1 && (
        <div className={`${card} p-5`}>
          <p className={`text-xs ${sub}`}>NID-এর সামনে ও পেছনের ছবি আপলোড করুন (ডেমো)</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {["সামনের দিক", "পেছনের দিক"].map((t) => (
              <button key={t} className="grid h-28 place-items-center rounded-xl border-2 border-dashed border-white/20 text-3xl transition hover:border-[#f0b90b]/60">📷<span className="sr-only">{t}</span></button>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <button onClick={() => setStep(0)} className="flex-1 rounded-xl bg-white/10 py-3 text-sm font-bold">← ফিরুন</button>
            <button onClick={() => setStep(2)} className="flex-[2] rounded-xl bg-[#f0b90b] py-3 text-sm font-black text-black">➡️ পরবর্তী</button>
          </div>
        </div>
      )}
      {step === 2 && (
        <div className={`${card} p-5 text-center`}>
          <p className={`text-xs ${sub}`}>মুখের ছবি তুলুন — চশমা খুলে, আলোয় (ডেমো)</p>
          <button className="mx-auto mt-3 grid h-36 w-36 place-items-center rounded-full border-2 border-dashed border-white/20 text-5xl">🤳</button>
          <button onClick={() => { setStatus("pending"); setStep(3); }} className="mt-4 w-full rounded-xl bg-[#f0b90b] py-3 text-sm font-black text-black">✅ সাবমিট করুন</button>
        </div>
      )}
      {step === 3 && (
        <div className={`${card} p-5 text-center`}>
          <p className="text-5xl">⏳</p>
          <p className="mt-2 text-lg font-black">যাচাই চলছে...</p>
          <p className={`mt-1 text-xs ${sub}`}>১০–৩০ মিনিটের মধ্যে ফলাফল জানানো হবে (ডেমো)</p>
        </div>
      )}
    </Page>
  );
}

export function CexKycStatus() {
  const { base } = useDemo();
  const { card, sub } = useSkin();
  const [status, setStatus] = useLocal("kyc_status", "none");
  return (
    <Page narrow>
      <PageHead t="🪪 KYC স্ট্যাটাস" />
      <div className={`${card} p-5 text-center`}>
        {status === "none" && (<><p className="text-5xl">📝</p><p className="mt-2 font-black">এখনো KYC করেননি</p>
          <Link href={`${base}/kyc`} className="mt-4 inline-block rounded-xl bg-[#f0b90b] px-8 py-3 text-sm font-black text-black">KYC শুরু করুন</Link></>)}
        {status === "pending" && (<><p className="text-5xl">⏳</p><p className="mt-2 font-black text-amber-400">যাচাইাধীন</p><p className={`mt-1 text-xs ${sub}`}>ডকুমেন্ট রিভিউ চলছে...</p>
          <button onClick={() => setStatus("verified")} className="mt-3 text-xs underline opacity-60">(ডেমো: যাচাই সম্পন্ন করুন)</button></>)}
        {status === "verified" && (<><p className="text-5xl">✅</p><p className="mt-2 font-black text-emerald-400">ভেরিফাইড!</p><p className={`mt-1 text-xs ${sub}`}>সব ফিচার আনলক হয়েছে 🎉</p></>)}
      </div>
    </Page>
  );
}

export function CexSecurity() {
  const { base } = useDemo();
  const { card, sub } = useSkin();
  const [enabled] = useLocal("2fa_on", false);
  return (
    <Page>
      <PageHead t="🛡️ সিকিউরিটি সেটিংস" />
      <div className="space-y-2">
        <Link href={`${base}/2fa`} className={`${card} flex items-center gap-3 p-4`}>
          <span className="text-2xl">🔐</span>
          <div className="flex-1"><p className="text-sm font-black">টু-ফ্যাক্টর অথেনটিকেশন</p><p className={`text-[11px] ${sub}`}>{enabled ? "✅ চালু" : "❌ বন্ধ — চালু করুন"}</p></div>
          <span className="opacity-40">→</span>
        </Link>
        {[
          ["🔑", "পাসওয়ার্ড পরিবর্তন", "শেষ পরিবর্তন: ৩০ দিন আগে"],
          ["📱", "ডিভাইস ম্যানেজমেন্ট", "২টি ডিভাইসে লগইন আছে"],
          ["📧", "ইমেইল যাচাই", "✅ যাচাইকৃত"],
          ["🚨", "অ্যান্টি-ফিশিং কোড", "ইমেইলে নিরাপত্তা কোড সেট করুন"],
          ["📋", "লগইন হিস্ট্রি", "সাম্প্রতিক ১০টি লগইন দেখুন"],
        ].map(([e, t, d]) => (
          <button key={t} onClick={() => alert("ডেমো — শীঘ্রই আসছে")} className={`${card} flex w-full items-center gap-3 p-4 text-left transition hover:border-[#f0b90b]/40`}>
            <span className="text-2xl">{e}</span>
            <div className="flex-1"><p className="text-sm font-black">{t}</p><p className={`text-[11px] ${sub}`}>{d}</p></div>
            <span className="opacity-40">→</span>
          </button>
        ))}
      </div>
    </Page>
  );
}

export function CexApi() {
  const { card, sub, input } = useSkin();
  const [keys, setKeys] = useLocal<{ id: string; name: string; date: number }[]>("api_keys", []);
  const [name, setName] = useState("");
  const [show, setShow] = useState<string | null>(null);
  function create() {
    if (!name.trim()) return;
    const id = `ak_${Math.random().toString(36).slice(2, 10)}`;
    setKeys([{ id, name: name.trim(), date: Date.now() }, ...keys]);
    setName("");
    setShow(id);
  }
  return (
    <Page>
      <PageHead t="🔌 API ম্যানেজমেন্ট" sub="বট ও থার্ড-পার্টি অ্যাপের জন্য" />
      <div className={`${card} p-4`}>
        <p className="text-sm font-black">＋ নতুন API কী</p>
        <div className="mt-2 flex gap-2">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="কী-এর নাম (যেমন: ট্রেডিং বট)" className={input} />
          <button onClick={create} className="shrink-0 rounded-xl bg-[#f0b90b] px-5 text-sm font-black text-black">তৈরি</button>
        </div>
        {show && (
          <div className="mt-3 rounded-xl bg-amber-500/10 p-3">
            <p className="text-xs font-bold text-amber-300">⚠️ সিক্রেট কী একবারই দেখানো হবে — কপি করে রাখুন!</p>
            <p className="mt-1 break-all font-mono text-xs text-white">{show}{"x".repeat(24)}</p>
            <button onClick={() => setShow(null)} className="mt-2 text-xs underline opacity-70">লুকান</button>
          </div>
        )}
      </div>
      <div className="mt-3 space-y-2">
        {keys.map((k) => (
          <div key={k.id} className={`${card} flex items-center gap-3 p-3`}>
            <span className="text-2xl">🔑</span>
            <div className="flex-1"><p className="text-sm font-bold">{k.name}</p><p className={`font-mono text-[11px] ${sub}`}>{k.id}••••••••</p></div>
            <button onClick={() => setKeys(keys.filter((x) => x.id !== k.id))} className="rounded-lg bg-red-500/15 px-3 py-1.5 text-xs font-bold text-red-400">🗑 মুছুন</button>
          </div>
        ))}
        {keys.length === 0 && <div className={card}><Empty emoji="🔌" text="কোনো API কী নেই" /></div>}
      </div>
    </Page>
  );
}

/* ================= REFERRAL ================= */

export function CexReferral() {
  const { base } = useDemo();
  const { card, sub } = useSkin();
  return (
    <Page>
      <PageHead t="🎁 রেফারেল প্রোগ্রাম" sub="বন্ধুদের আনুন — ট্রেডিং ফির ৪০% কমিশন পান" />
      <div className="grid gap-2 sm:grid-cols-3">
        <Stat e="💰" v="৪০%" t="কমিশন রেট" />
        <Stat e="👥" v="১২,৪৫০" t="মোট রেফারার" />
        <Stat e="🏆" v="$২.৪M" t="বিতরণকৃত বোনাস" />
      </div>
      <div className={`${card} mt-3 p-5`}>
        <p className="text-sm font-black">📋 কিভাবে কাজ করে?</p>
        <ol className={`mt-2 list-decimal space-y-2 pl-5 text-xs ${sub}`}>
          <li>আপনার রেফারেল লিংক বন্ধুদের সাথে শেয়ার করুন</li>
          <li>বন্ধু সাইন আপ করে ট্রেড করলে আপনি <b className="text-white">৪০% কমিশন</b> পাবেন</li>
          <li>বন্ধু পাবেন <b className="text-white">১০০ USDT ওয়েলকাম বোনাস</b> (ডেমো)</li>
          <li>কমিশন প্রতিদিন অটো আপনার ওয়ালেটে যোগ হবে</li>
        </ol>
        <Link href={`${base}/referral-dash`} className="mt-4 block rounded-xl bg-[#f0b90b] py-3 text-center text-sm font-black text-black">📊 আমার রেফারেল ড্যাশবোর্ড</Link>
      </div>
    </Page>
  );
}

export function CexReferralDash() {
  const { card, sub, input } = useSkin();
  const [copied, setCopied] = useState(false);
  const link = "https://demo-exchange.com/ref/USER12345";
  return (
    <Page>
      <PageHead t="📊 রেফারেল ড্যাশবোর্ড" />
      <div className="grid grid-cols-3 gap-2">
        <Stat e="👥" v={bn(24)} t="মোট রেফারেল" />
        <Stat e="💰" v="$186" t="মোট আয়" />
        <Stat e="📅" v="$12" t="আজকের আয়" />
      </div>
      <div className={`${card} mt-3 p-4`}>
        <p className="text-sm font-black">🔗 আপনার রেফারেল লিংক</p>
        <div className="mt-2 flex gap-2">
          <input value={link} readOnly className={`${input} font-mono !text-xs`} />
          <button onClick={() => { navigator.clipboard?.writeText(link).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 1500); }} className="shrink-0 rounded-xl bg-[#f0b90b] px-4 text-sm font-black text-black">{copied ? "✅" : "📋"}</button>
        </div>
        <div className="mt-3 grid grid-cols-4 gap-2">
          {["📘 ফেসবুক", "✈️ টেলিগ্রাম", "💬 WhatsApp", "𝕏 টুইটার"].map((s) => (
            <button key={s} onClick={() => alert("ডেমো — শেয়ার শীঘ্রই")} className="rounded-xl bg-white/5 py-2.5 text-xs font-bold hover:bg-white/10">{s}</button>
          ))}
        </div>
      </div>
      <div className={`${card} mt-3 p-4`}>
        <p className="text-sm font-black">🕘 সাম্প্রতিক রেফারেল</p>
        <div className="mt-2 space-y-1.5 text-xs">
          {[["রহিম ***", "১১ অক্টোবর", "$8.50"], ["করিম ***", "১০ অক্টোবর", "$5.20"], ["সুমি ***", "৯ অক্টোবর", "$12.00"]].map(([n, d, a]) => (
            <div key={n} className="flex justify-between rounded-lg bg-white/[0.03] px-3 py-2"><span>{n} <span className={sub}>• {d}</span></span><b className="text-emerald-400">+{a}</b></div>
          ))}
        </div>
      </div>
    </Page>
  );
}

/* ================= LAUNCHPAD ================= */

export function CexLaunchpad() {
  const { base } = useDemo();
  const { card, sub } = useSkin();
  return (
    <Page>
      <PageHead t="🚀 লঞ্চপ্যাড" sub="নতুন টোকেন সেলে আগে অংশ নিন" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {LAUNCHPADS.map((p) => (
          <Link key={p.id} href={`${base}/launchpad/${p.id}`} className={`${card} block p-5 transition hover:-translate-y-1 hover:border-[#f0b90b]/40`}>
            <div className="flex items-center gap-3">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-[#f0b90b]/15 text-3xl">{p.e}</span>
              <div><p className="font-black">{p.n}</p><p className={`text-[11px] ${sub}`}>দাম: {p.price}</p></div>
            </div>
            <p className={`mt-2 text-xs ${sub}`}>{p.desc}</p>
            <div className="mt-3">
              <div className="flex justify-between text-[11px]"><span className={sub}>লক্ষ্য: {p.goal}</span><b className="text-[#f0b90b]">{bn(p.progress)}%</b></div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-[#f0b90b]" style={{ width: `${p.progress}%` }} /></div>
            </div>
            <p className="mt-2 text-[11px] font-bold text-amber-300">⏳ {p.ends}</p>
          </Link>
        ))}
      </div>
    </Page>
  );
}

export function CexLaunchpadDetail({ id }: { id: string }) {
  const { card, sub, input } = useSkin();
  const p = LAUNCHPADS.find((x) => x.id === id) ?? LAUNCHPADS[0];
  const [amount, setAmount] = useState("");
  const [done, setDone] = useState(false);
  return (
    <Page narrow>
      <PageHead t={`🚀 ${p.n}`} sub="টোকেন সেল" />
      <div className={`${card} p-5 text-center`}>
        <p className="text-6xl">{p.e}</p>
        <p className="mt-2 text-xl font-black">{p.n}</p>
        <p className={`mt-1 text-xs ${sub}`}>{p.desc}</p>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          {[["দাম", p.price], ["লক্ষ্য", p.goal], ["শেষ", p.ends]].map(([t, v]) => (
            <div key={t} className="rounded-xl bg-white/5 p-2"><p className={`text-[10px] ${sub}`}>{t}</p><p className="text-xs font-black">{v}</p></div>
          ))}
        </div>
        <div className="mt-3">
          <div className="flex justify-between text-[11px]"><span className={sub}>অগ্রগতি</span><b className="text-[#f0b90b]">{bn(p.progress)}%</b></div>
          <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-[#f0b90b]" style={{ width: `${p.progress}%` }} /></div>
        </div>
        <label className={`mt-4 block text-left text-xs ${sub}`}>অংশগ্রহণের পরিমাণ (USDT)</label>
        <input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" placeholder="সর্বনিম্ন 10 USDT" className={`${input} mt-1`} />
        <button onClick={() => parseFloat(amount) >= 10 && setDone(true)} className="mt-3 w-full rounded-xl bg-[#f0b90b] py-3 text-sm font-black text-black">🎯 অংশ নিন</button>
        {done && <p className="mt-2 rounded-xl bg-emerald-500/15 py-2 text-center text-xs font-bold text-emerald-400">✅ সফলভাবে অংশ নিয়েছেন! (ডেমো)</p>}
      </div>
    </Page>
  );
}

/* ================= EARN / SAVINGS ================= */

export function CexEarn() {
  const { base } = useDemo();
  const { card, sub } = useSkin();
  return (
    <Page>
      <PageHead t="🌱 আর্ন (স্টেকিং)" sub="কয়েন হোল্ড করে প্যাসিভ আয় করুন" />
      <div className="mb-3 grid grid-cols-3 gap-2">
        <Stat e="💰" v="$৪.২B" t="মোট স্টেকড" />
        <Stat e="👥" v="২.১M" t="ব্যবহারকারী" />
        <Stat e="📈" v="৯.৪%" t="সর্বোচ্চ APY" />
      </div>
      <div className="space-y-2">
        {EARN_PRODUCTS.map((p) => (
          <Link key={p.id} href={`${base}/earn/${p.id}`} className={`${card} flex items-center gap-3 p-4 transition hover:border-[#f0b90b]/40`}>
            <span className="grid h-12 w-12 place-items-center rounded-full bg-white/5 text-2xl">{p.e}</span>
            <div className="flex-1"><p className="text-sm font-black">{p.coin} স্টেকিং</p><p className={`text-[11px] ${sub}`}>{p.type} • সর্বনিম্ন {p.min}</p></div>
            <div className="text-right"><p className="text-lg font-black text-emerald-400">{bn(p.apy)}%</p><p className={`text-[10px] ${sub}`}>APY</p></div>
            <span className="opacity-40">→</span>
          </Link>
        ))}
      </div>
    </Page>
  );
}

export function CexEarnDetail({ id }: { id: string }) {
  const { card, sub, input } = useSkin();
  const p = EARN_PRODUCTS.find((x) => x.id === id) ?? EARN_PRODUCTS[0];
  const [amount, setAmount] = useState("");
  const [done, setDone] = useState(false);
  const daily = ((parseFloat(amount) || 0) * p.apy) / 100 / 365;
  return (
    <Page narrow>
      <PageHead t={`🌱 ${p.coin} স্টেকিং`} sub={`${p.type} • ${bn(p.apy)}% APY`} />
      <div className={`${card} p-5`}>
        <div className="flex items-center gap-3">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-white/5 text-3xl">{p.e}</span>
          <div><p className="text-4xl font-black text-emerald-400">{bn(p.apy)}%</p><p className={`text-xs ${sub}`}>বার্ষিক মুনাফা (APY)</p></div>
        </div>
        <label className={`mt-4 block text-xs ${sub}`}>স্টেক পরিমাণ (সর্বনিম্ন {p.min})</label>
        <input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" placeholder="0.00" className={`${input} mt-1`} />
        {daily > 0 && <p className="mt-1 text-xs text-emerald-400">📅 দৈনিক আনুমানিক আয়: {daily.toFixed(6)} {p.coin}</p>}
        <div className={`mt-3 space-y-1 text-xs ${sub}`}>
          <div className="flex justify-between"><span>মেয়াদ</span><b className="text-white">{p.type}</b></div>
          <div className="flex justify-between"><span>রিওয়ার্ড বিতরণ</span><b className="text-white">প্রতিদিন</b></div>
          <div className="flex justify-between"><span>আর্লি রিডিম্পশন</span><b className="text-white">{p.type === "ফ্লেক্সিবল" ? "যেকোনো সময়" : "মেয়াদ শেষে"}</b></div>
        </div>
        <button onClick={() => parseFloat(amount) > 0 && setDone(true)} className="mt-4 w-full rounded-xl bg-[#f0b90b] py-3 text-sm font-black text-black">🌱 স্টেক করুন</button>
        {done && <p className="mt-2 rounded-xl bg-emerald-500/15 py-2 text-center text-xs font-bold text-emerald-400">✅ স্টেকিং শুরু! প্রতিদিন রিওয়ার্ড পাবেন (ডেমো)</p>}
      </div>
    </Page>
  );
}

export function CexSavings() {
  const { card, sub } = useSkin();
  const [tab, setTab] = useState<"flex" | "lock">("flex");
  const rows = EARN_PRODUCTS.filter((p) => (tab === "flex" ? p.type === "ফ্লেক্সিবল" : p.type !== "ফ্লেক্সিবল"));
  return (
    <Page>
      <PageHead t="🏦 সেভিংস" sub="নিরাপদে সঞ্চয়, নিয়মিত মুনাফা" />
      <div className="mb-3 flex gap-1.5">
        {(["flex", "lock"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`rounded-xl px-5 py-2 text-xs font-black ${tab === t ? "bg-[#f0b90b] text-black" : "bg-white/5 text-slate-400"}`}>{t === "flex" ? "💧 ফ্লেক্সিবল" : "🔒 লকড"}</button>
        ))}
      </div>
      <div className="space-y-2">
        {rows.map((p) => (
          <div key={p.id} className={`${card} flex items-center gap-3 p-4`}>
            <span className="grid h-12 w-12 place-items-center rounded-full bg-white/5 text-2xl">{p.e}</span>
            <div className="flex-1"><p className="text-sm font-black">{p.coin}</p><p className={`text-[11px] ${sub}`}>{p.type}</p></div>
            <div className="text-right"><p className="text-lg font-black text-emerald-400">{bn(p.apy)}%</p><p className={`text-[10px] ${sub}`}>APY</p></div>
          </div>
        ))}
      </div>
      <p className={`mt-3 text-center text-[11px] ${sub}`}>💡 ফ্লেক্সিবল সেভিংসে যেকোনো সময় তোলা যায়</p>
    </Page>
  );
}

/* ================= NFT ================= */

export function CexNft() {
  const { base } = useDemo();
  const { card, sub, input } = useSkin();
  const [q, setQ] = useState("");
  const list = NFTS.filter((n) => !q || n.n.includes(q));
  return (
    <Page>
      <PageHead t="🎨 NFT মার্কেটপ্লেস" sub="বাংলাদেশি আর্টিস্টদের ডিজিটাল আর্ট" />
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="🔍 NFT খুঁজুন" className={`${input} mb-3`} />
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {list.map((n) => (
          <Link key={n.id} href={`${base}/nft/${n.id}`} className={`${card} group overflow-hidden transition hover:-translate-y-1 hover:border-[#f0b90b]/40`}>
            <div className="grid h-36 place-items-center bg-gradient-to-br from-[#1a1f2e] to-[#0d1117] text-6xl transition group-hover:scale-110">{n.e}</div>
            <div className="p-3">
              <p className="truncate text-sm font-black">{n.n}</p>
              <p className={`text-[11px] ${sub}`}>🎨 {n.artist}</p>
              <p className="mt-1 text-sm font-black text-[#f0b90b]">{n.price} {n.coin}</p>
            </div>
          </Link>
        ))}
      </div>
    </Page>
  );
}

export function CexNftDetail({ id }: { id: string }) {
  const { card, sub } = useSkin();
  const n = NFTS.find((x) => x.id === id) ?? NFTS[0];
  const [done, setDone] = useState(false);
  const [bid, setBid] = useState("");
  return (
    <Page narrow>
      <PageHead t="🎨 NFT বিবরণ" />
      <div className={`${card} overflow-hidden`}>
        <div className="grid h-64 place-items-center bg-gradient-to-br from-[#1a1f2e] to-[#0d1117] text-8xl">{n.e}</div>
        <div className="p-5">
          <p className="text-xl font-black">{n.n}</p>
          <p className={`mt-1 text-xs ${sub}`}>🎨 আর্টিস্ট: <b className="text-white">{n.artist}</b> • ✅ ভেরিফাইড</p>
          <div className="mt-3 grid grid-cols-2 gap-2 text-center">
            <div className="rounded-xl bg-white/5 p-3"><p className={`text-[10px] ${sub}`}>বর্তমান দাম</p><p className="text-lg font-black text-[#f0b90b]">{n.price} {n.coin}</p><p className={`text-[10px] ${sub}`}>≈ {fmtBDT(n.price * 3420)} টাকা</p></div>
            <div className="rounded-xl bg-white/5 p-3"><p className={`text-[10px] ${sub}`}>সর্বোচ্চ বিড</p><p className="text-lg font-black">{(n.price * 0.92).toFixed(2)} {n.coin}</p><p className={`text-[10px] ${sub}`}>১২টি বিড</p></div>
          </div>
          <div className="mt-3 flex gap-2">
            <input value={bid} onChange={(e) => setBid(e.target.value)} type="number" placeholder="বিড (ETH)" className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500" />
            <button onClick={() => parseFloat(bid) > 0 && setDone(true)} className="shrink-0 rounded-xl bg-white/10 px-5 text-sm font-black">🔨 বিড</button>
          </div>
          <button onClick={() => setDone(true)} className="mt-2 w-full rounded-xl bg-[#f0b90b] py-3 text-sm font-black text-black">🛒 এখনই কিনুন</button>
          {done && <p className="mt-2 rounded-xl bg-emerald-500/15 py-2 text-center text-xs font-bold text-emerald-400">✅ সফল! NFT আপনার কালেকশনে (ডেমো)</p>}
        </div>
      </div>
    </Page>
  );
}

/* ================= ANNOUNCEMENTS / SUPPORT / FAQ ================= */

export function CexAnnounce() {
  const { base } = useDemo();
  const { card, sub } = useSkin();
  return (
    <Page>
      <PageHead t="📢 ঘোষণা" sub="প্ল্যাটফর্মের সর্বশেষ আপডেট" />
      <div className="space-y-2">
        {ANNOUNCEMENTS.map((a) => (
          <Link key={a.id} href={`${base}/announcement/${a.id}`} className={`${card} block p-4 transition hover:border-[#f0b90b]/40`}>
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#f0b90b]/15 text-xl">📢</span>
              <div><p className="text-sm font-black">{a.t}</p><p className={`mt-0.5 text-[11px] ${sub}`}>{a.d}</p></div>
              <span className="ml-auto shrink-0 opacity-40">→</span>
            </div>
          </Link>
        ))}
      </div>
    </Page>
  );
}

export function CexAnnounceDetail({ id }: { id: string }) {
  const { card, sub } = useSkin();
  const a = ANNOUNCEMENTS.find((x) => x.id === id) ?? ANNOUNCEMENTS[0];
  return (
    <Page narrow>
      <PageHead t="📢 ঘোষণা" />
      <div className={`${card} p-5`}>
        <p className="text-lg font-black">{a.t}</p>
        <p className={`mt-1 text-[11px] ${sub}`}>📅 {a.d}</p>
        <p className="mt-3 text-sm leading-relaxed">{a.body}</p>
      </div>
    </Page>
  );
}

export function CexSupport() {
  const { card, sub, input } = useSkin();
  const [done, setDone] = useState(false);
  const [topic, setTopic] = useState("ট্রেডিং");
  const [msg, setMsg] = useState("");
  return (
    <Page>
      <PageHead t="🎧 সাপোর্ট সেন্টার" sub="২৪/৭ বাংলা সাপোর্ট" />
      <div className="grid gap-2 sm:grid-cols-3">
        <Stat e="💬" v="২৪/৭" t="লাইভ চ্যাট" />
        <Stat e="⚡" v="~৫ মিনিট" t="গড় রেসপন্স" />
        <Stat e="😊" v="৯৮%" t="সন্তুষ্টি" />
      </div>
      <div className={`${card} mt-3 p-5`}>
        <p className="text-sm font-black">🎫 সাপোর্ট টিকিট খুলুন</p>
        <label className={`mt-3 block text-xs ${sub}`}>বিষয়</label>
        <select value={topic} onChange={(e) => setTopic(e.target.value)} className={`${input} mt-1 [&>option]:text-black`}>
          {["ট্রেডিং", "ডিপোজিট/উইথড্র", "KYC", "P2P", "নিরাপত্তা", "অন্যান্য"].map((t) => <option key={t}>{t}</option>)}
        </select>
        <label className={`mt-3 block text-xs ${sub}`}>বিস্তারিত লিখুন</label>
        <textarea value={msg} onChange={(e) => setMsg(e.target.value)} rows={4} placeholder="আপনার সমস্যাটি বিস্তারিত লিখুন..." className={`${input} mt-1`} />
        <button onClick={() => msg.trim().length > 10 && setDone(true)} className="mt-3 w-full rounded-xl bg-[#f0b90b] py-3 text-sm font-black text-black">📨 টিকিট পাঠান</button>
        {done && <p className="mt-2 rounded-xl bg-emerald-500/15 py-2 text-center text-xs font-bold text-emerald-400">✅ টিকিট #SUP{Math.floor(1000 + Math.random() * 9000)} তৈরি! শীঘ্রই যোগাযোগ করা হবে (ডেমো)</p>}
      </div>
      <div className={`${card} mt-3 p-4`}>
        <p className="text-sm font-black">📞 সরাসরি যোগাযোগ</p>
        <p className={`mt-1 text-xs ${sub}`}>হটলাইন: <b className="text-white">০১৮৩৩৪০২৫৮৬</b> (সকাল ৯টা – রাত ১০টা)<br />ইমেইল: support@demo-exchange.com</p>
      </div>
    </Page>
  );
}

export function CexFaq() {
  const { card, sub, input } = useSkin();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<number | null>(0);
  const list = FAQS.filter((f) => !q || f.q.includes(q) || f.a.includes(q));
  return (
    <Page>
      <PageHead t="❓ সচরাচর প্রশ্ন" />
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="🔍 প্রশ্ন খুঁজুন" className={`${input} mb-3`} />
      <div className="space-y-2">
        {list.map((f, i) => (
          <div key={i} className={card}>
            <button onClick={() => setOpen(open === i ? null : i)} className="flex w-full items-center justify-between p-4 text-left">
              <span className="text-sm font-black">{f.q}</span>
              <span className="text-[#f0b90b]">{open === i ? "−" : "+"}</span>
            </button>
            {open === i && <p className={`px-4 pb-4 text-xs leading-relaxed ${sub}`}>{f.a}</p>}
          </div>
        ))}
      </div>
    </Page>
  );
}

/* ================= FEES / API DOCS / LEGAL ================= */

export function CexFees() {
  const { card, sub } = useSkin();
  return (
    <Page>
      <PageHead t="💸 ফি স্ট্রাকচার" sub="স্বচ্ছ ও সর্বনিম্ন ফি" />
      <div className={`${card} overflow-hidden`}>
        <p className="border-b border-white/10 p-3 text-sm font-black">📊 স্পট ট্রেডিং ফি</p>
        {[["মেকার", "০.১০%", "০.০৭৫%"], ["টেকার", "০.১০%", "০.০৭৫%"]].map(([t, s, bnb]) => (
          <div key={t} className="grid grid-cols-3 border-b border-white/5 p-3 text-sm last:border-0">
            <span>{t}</span><span className="text-center font-bold">{s}</span><span className="text-right font-bold text-[#f0b90b]">{bnb} <span className={`text-[10px] ${sub}`}>BNB-তে</span></span>
          </div>
        ))}
      </div>
      <div className={`${card} mt-3 overflow-hidden`}>
        <p className="border-b border-white/10 p-3 text-sm font-black">⚡ ফিউচার্স ফি</p>
        {[["মেকার", "০.০২%"], ["টেকার", "০.০৫%"]].map(([t, s]) => (
          <div key={t} className="grid grid-cols-2 border-b border-white/5 p-3 text-sm last:border-0"><span>{t}</span><span className="text-right font-bold">{s}</span></div>
        ))}
      </div>
      <div className={`${card} mt-3 overflow-hidden`}>
        <p className="border-b border-white/10 p-3 text-sm font-black">📥📤 ডিপোজিট / উইথড্র</p>
        {[["ক্রিপ্টো ডিপোজিট", "ফ্রি"], ["USDT উইথড্র (TRC20)", "১ USDT"], ["BTC উইথড্র", "০.০০০৫ BTC"], ["ফিয়াট ডিপোজিট", "ফ্রি"]].map(([t, s]) => (
          <div key={t} className="grid grid-cols-2 border-b border-white/5 p-3 text-sm last:border-0"><span>{t}</span><span className="text-right font-bold text-emerald-400">{s}</span></div>
        ))}
      </div>
      <p className={`mt-3 rounded-xl bg-[#f0b90b]/10 p-3 text-center text-xs font-bold text-[#f0b90b]`}>💡 BNB দিয়ে ফি পরিশোধে ২৫% ছাড়!</p>
    </Page>
  );
}

export function CexApiDocs() {
  const { card, sub } = useSkin();
  return (
    <Page>
      <PageHead t="📚 API ডকুমেন্টেশন" sub="ডেভেলপারদের জন্য REST + WebSocket" />
      <div className="space-y-2">
        {[
          ["🔌 REST API", "স্পট/ফিউচার্স অর্ডার, ব্যালেন্স, হিস্ট্রি — সব এন্ডপয়েন্ট", "GET /api/v3/ticker/price"],
          ["📡 WebSocket", "রিয়েল-টাইম প্রাইস, অর্ডার বুক, ট্রেড স্ট্রিম", "wss://stream.demo/v1/ws"],
          ["🤖 SDK", "Python, Node.js, PHP — অফিসিয়াল লাইব্রেরি", "pip install demo-exchange"],
        ].map(([t, d, code]) => (
          <div key={t} className={`${card} p-4`}>
            <p className="text-sm font-black">{t}</p>
            <p className={`mt-1 text-xs ${sub}`}>{d}</p>
            <code className="mt-2 block rounded-lg bg-black/60 p-2 font-mono text-[11px] text-emerald-300">{code}</code>
          </div>
        ))}
      </div>
    </Page>
  );
}

function LegalPage({ t, body }: { t: string; body: string[] }) {
  const { card } = useSkin();
  return (
    <Page narrow>
      <PageHead t={t} />
      <div className={`${card} space-y-3 p-5 text-xs leading-relaxed opacity-80`}>
        {body.map((p, i) => <p key={i}>{p}</p>)}
      </div>
    </Page>
  );
}

export function CexTerms() {
  return <LegalPage t="📜 শর্তাবলী" body={[
    "১. এই প্ল্যাটফর্ম একটি ডেমো — এখানে কোনো আসল ক্রিপ্টো বা টাকা লেনদেন হয় না।",
    "২. ব্যবহারকারীর বয়স কমপক্ষে ১৮ বছর হতে হবে।",
    "৩. একটি ব্যক্তি একটির বেশি অ্যাকাউন্ট খুলতে পারবেন না।",
    "৪. সন্দেহজনক কার্যকলাপে অ্যাকাউন্ট সাময়িক স্থগিত হতে পারে।",
    "৫. ক্রিপ্টো ট্রেডিংয়ে বড় ক্ষতির ঝুঁকি আছে — নিজ দায়িত্বে ট্রেড করুন।",
    "৬. প্ল্যাটফর্ম যেকোনো সময় শর্ত পরিবর্তনের অধিকার রাখে।",
  ]} />;
}

export function CexPrivacy() {
  return <LegalPage t="🔒 প্রাইভেসি পলিসি" body={[
    "১. আপনার ব্যক্তিগত তথ্য (নাম, NID, মোবাইল) শুধু KYC যাচাইয়ে ব্যবহৃত হয়।",
    "২. তৃতীয় পক্ষের কাছে ডেটা বিক্রি করা হয় না।",
    "৩. পাসওয়ার্ড এনক্রিপ্টেড থাকে — আমরা দেখতে পাই না।",
    "৪. 2FA চালু রাখলে অ্যাকাউন্ট অতিরিক্ত সুরক্ষিত থাকে।",
    "৫. ডেটা মুছে ফেলতে support@demo-exchange.com-এ ইমেইল করুন।",
  ]} />;
}

export function CexCareers() {
  const { card, sub } = useSkin();
  const jobs = [
    ["💻", "সিনিয়র ব্লকচেইন ডেভেলপার", "ফুল-টাইম • ঢাকা/রিমোট", "৮০K–১২০K টাকা"],
    ["🎨", "UI/UX ডিজাইনার", "ফুল-টাইম • রিমোট", "৬০K–৯০K টাকা"],
    ["📣", "মার্কেটিং ম্যানেজার", "ফুল-টাইম • ঢাকা", "৫০K–৮০K টাকা"],
    ["🎧", "কাস্টমার সাপোর্ট (বাংলা)", "শিফট • ঢাকা", "৩০K–৪৫K টাকা"],
  ];
  return (
    <Page>
      <PageHead t="💼 ক্যারিয়ার" sub="আমাদের সাথে ভবিষ্যৎ গড়ুন" />
      <div className="space-y-2">
        {jobs.map(([e, t, d, s]) => (
          <button key={t} onClick={() => alert("ডেমো — আবেদন শীঘ্রই")} className={`${card} flex w-full items-center gap-3 p-4 text-left transition hover:border-[#f0b90b]/40`}>
            <span className="text-3xl">{e}</span>
            <div className="flex-1"><p className="text-sm font-black">{t}</p><p className={`text-[11px] ${sub}`}>{d}</p></div>
            <div className="text-right"><p className="text-sm font-black text-[#f0b90b]">{s}</p><p className="text-[11px] text-emerald-400">আবেদন →</p></div>
          </button>
        ))}
      </div>
    </Page>
  );
}

/* ================= BLOG / ACADEMY ================= */

export function CexBlog() {
  const { base } = useDemo();
  const { card, sub } = useSkin();
  return (
    <Page>
      <PageHead t="📰 ব্লগ" sub="মার্কেট বিশ্লেষণ ও ইনসাইট" />
      <div className="space-y-2">
        {BLOGS.map((b) => (
          <Link key={b.id} href={`${base}/blog/${b.id}`} className={`${card} flex gap-3 p-4 transition hover:border-[#f0b90b]/40`}>
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[#f0b90b]/15 text-3xl">{b.e}</span>
            <div className="flex-1"><p className="text-sm font-black">{b.t}</p><p className={`mt-1 line-clamp-2 text-xs ${sub}`}>{b.body}</p><p className={`mt-1 text-[10px] ${sub}`}>📅 {b.d} • ৫ মিনিট পড়া</p></div>
            <span className="self-center opacity-40">→</span>
          </Link>
        ))}
      </div>
    </Page>
  );
}

export function CexBlogDetail({ id }: { id: string }) {
  const { card, sub } = useSkin();
  const b = BLOGS.find((x) => x.id === id) ?? BLOGS[0];
  return (
    <Page narrow>
      <PageHead t="📰 ব্লগ" />
      <div className={`${card} p-5`}>
        <p className="text-5xl">{b.e}</p>
        <p className="mt-2 text-xl font-black">{b.t}</p>
        <p className={`mt-1 text-[11px] ${sub}`}>📅 {b.d} • ✍️ রিসার্চ টিম</p>
        <p className="mt-3 text-sm leading-relaxed">{b.body}</p>
        <p className="mt-3 text-sm leading-relaxed opacity-70">বিনিয়োগের আগে নিজে গবেষণা করুন (DYOR)। এই আর্টিকেল আর্থিক পরামর্শ নয় — ডেমো কনটেন্ট।</p>
      </div>
    </Page>
  );
}

export function CexAcademy() {
  const { base } = useDemo();
  const { card, sub } = useSkin();
  const [level, setLevel] = useState("সব");
  const list = ACADEMY.filter((a) => level === "সব" || a.level === level);
  return (
    <Page>
      <PageHead t="🎓 অ্যাকাডেমি" sub="ফ্রিতে ক্রিপ্টো শিখুন" />
      <div className="mb-3 flex gap-1.5">
        {["সব", "বিগিনার", "ইন্টারমিডিয়েট", "অ্যাডভান্সড"].map((l) => (
          <button key={l} onClick={() => setLevel(l)} className={`rounded-xl px-4 py-2 text-xs font-black ${level === l ? "bg-[#f0b90b] text-black" : "bg-white/5 text-slate-400"}`}>{l}</button>
        ))}
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {list.map((a) => (
          <Link key={a.id} href={`${base}/academy/${a.id}`} className={`${card} block p-4 transition hover:border-[#f0b90b]/40`}>
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#f0b90b]/15 text-2xl">{a.e}</span>
              <div><p className="text-sm font-black">{a.t}</p><span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-400">{a.level}</span></div>
            </div>
          </Link>
        ))}
      </div>
    </Page>
  );
}

export function CexAcademyDetail({ id }: { id: string }) {
  const { card, sub } = useSkin();
  const a = ACADEMY.find((x) => x.id === id) ?? ACADEMY[0];
  const [done, setDone] = useLocal(`academy_done_${a.id}`, false);
  return (
    <Page narrow>
      <PageHead t="🎓 অ্যাকাডেমি" />
      <div className={`${card} p-5`}>
        <p className="text-5xl">{a.e}</p>
        <p className="mt-2 text-xl font-black">{a.t}</p>
        <span className="mt-1 inline-block rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-400">{a.level}</span>
        <p className="mt-3 text-sm leading-relaxed">{a.body}</p>
        <button onClick={() => setDone(!done)} className={`mt-4 w-full rounded-xl py-3 text-sm font-black ${done ? "bg-emerald-500/20 text-emerald-400" : "bg-[#f0b90b] text-black"}`}>
          {done ? "✅ সম্পন্ন!" : "📖 পড়া শেষ — সম্পন্ন চিহ্নিত করুন"}
        </button>
      </div>
    </Page>
  );
}

/* ================= ALERTS / WATCHLIST / PORTFOLIO / TAX / NOTIFS ================= */

export function CexAlerts() {
  const coins = useCexCoins();
  const { card, sub, input } = useSkin();
  const [alerts, setAlerts] = useLocal<{ id: string; coin: string; cond: string; price: number }[]>("alerts", []);
  const [coin, setCoin] = useState("BTC");
  const [cond, setCond] = useState<"above" | "below">("above");
  const [price, setPrice] = useState("");
  function add() {
    const p = parseFloat(price);
    if (!p) return;
    setAlerts([{ id: `al${Date.now()}`, coin, cond, price: p }, ...alerts].slice(0, 20));
    setPrice("");
  }
  return (
    <Page>
      <PageHead t="🔔 প্রাইস অ্যালার্ট" sub="দাম লক্ষ্যে পৌঁছালে নোটিফিকেশন" />
      <div className={`${card} p-4`}>
        <p className="text-sm font-black">＋ নতুন অ্যালার্ট</p>
        <div className="mt-2 grid grid-cols-3 gap-2">
          <select value={coin} onChange={(e) => setCoin(e.target.value)} className={`${input} [&>option]:text-black`}>{coins.map((c) => <option key={c.code} value={c.code}>{c.code}</option>)}</select>
          <select value={cond} onChange={(e) => setCond(e.target.value as any)} className={`${input} [&>option]:text-black`}>
            <option value="above">⬆️ উপরে গেলে</option>
            <option value="below">⬇️ নিচে নামলে</option>
          </select>
          <input value={price} onChange={(e) => setPrice(e.target.value)} type="number" placeholder="দাম ($)" className={input} />
        </div>
        <p className={`mt-1 text-[11px] ${sub}`}>বর্তমান: ${fmtUSD(coinOf(coin, coins).price)}</p>
        <button onClick={add} className="mt-2 w-full rounded-xl bg-[#f0b90b] py-2.5 text-sm font-black text-black">🔔 অ্যালার্ট সেট করুন</button>
      </div>
      <div className="mt-3 space-y-2">
        {alerts.map((a) => (
          <div key={a.id} className={`${card} flex items-center gap-3 p-3`}>
            <CoinIcon code={a.coin} size={32} />
            <div className="flex-1"><p className="text-sm font-black">{a.coin}/USDT</p><p className={`text-[11px] ${sub}`}>{a.cond === "above" ? "⬆️ উপরে" : "⬇️ নিচে"} ${fmtUSD(a.price)} গেলে</p></div>
            <button onClick={() => setAlerts(alerts.filter((x) => x.id !== a.id))} className="text-red-400">🗑</button>
          </div>
        ))}
        {alerts.length === 0 && <div className={card}><Empty emoji="🔔" text="কোনো অ্যালার্ট সেট নেই" /></div>}
      </div>
    </Page>
  );
}

export function CexWatchlist() {
  const coins = useCexCoins();
  const { card, sub } = useSkin();
  const [list, setList] = useLocal<string[]>("watchlist", ["BTC", "ETH", "SOL"]);
  const [adding, setAdding] = useState(false);
  const rest = coins.filter((c) => !list.includes(c.code));
  return (
    <Page>
      <PageHead t="⭐ ওয়াচলিস্ট" sub="পছন্দের কয়েন ট্র্যাক করুন" />
      <div className="space-y-2">
        {list.map((code) => (
          <div key={code} className={`${card} p-1 pr-2`}><div className="flex items-center"><div className="flex-1"><CoinRow code={code} /></div>
            <button onClick={() => setList(list.filter((c) => c !== code))} className="ml-1 shrink-0 rounded-lg bg-white/5 px-2.5 py-2 text-sm">⭐</button></div></div>
        ))}
        {list.length === 0 && <div className={card}><Empty emoji="⭐" text="ওয়াচলিস্ট খালি" /></div>}
      </div>
      <button onClick={() => setAdding(!adding)} className="mt-3 w-full rounded-xl bg-white/10 py-3 text-sm font-black">＋ কয়েন যোগ করুন</button>
      {adding && (
        <div className="mt-2 grid grid-cols-3 gap-2">
          {rest.map((c) => (
            <button key={c.code} onClick={() => { setList([...list, c.code]); }} className={`${card} p-3 text-center transition hover:border-[#f0b90b]/40`}>
              <p className="text-2xl">{c.e}</p><p className="mt-1 text-xs font-black">{c.code}</p>
            </button>
          ))}
        </div>
      )}
    </Page>
  );
}

export function CexPortfolio() {
  const coins = useCexCoins();
  const { card, sub } = useSkin();
  const [bal] = useCexBalances();
  const rows = Object.entries(bal).map(([code, q]) => ({ code, q, v: q * coinOf(code, coins).price })).filter((r) => r.v > 0.01).sort((a, b) => b.v - a.v);
  const total = rows.reduce((s, r) => s + r.v, 0);
  const R = 70, C = 2 * Math.PI * R;
  let acc = 0;
  const colors = ["#f0b90b", "#0ecb81", "#3b82f6", "#a855f7", "#f6465d", "#14b8a6"];
  return (
    <Page>
      <PageHead t="💼 পোর্টফোলিও ট্র্যাকার" sub="সম্পদের বণ্টন" />
      <div className={`${card} flex flex-col items-center gap-4 p-5 sm:flex-row`}>
        <div className="relative">
          <svg width="170" height="170" viewBox="0 0 170 170">
            {rows.map((r, i) => {
              const frac = r.v / total;
              const dash = `${frac * C} ${C}`;
              const rot = (acc / total) * 360;
              acc += r.v;
              return <circle key={r.code} cx="85" cy="85" r={R} fill="none" stroke={colors[i % colors.length]} strokeWidth="22" strokeDasharray={dash} transform={`rotate(${rot - 90} 85 85)`} />;
            })}
            <text x="85" y="82" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="900">${fmtUSD(total)}</text>
            <text x="85" y="100" textAnchor="middle" fill="#888" fontSize="10">মোট</text>
          </svg>
        </div>
        <div className="w-full flex-1 space-y-1.5">
          {rows.map((r, i) => (
            <div key={r.code} className="flex items-center gap-2 text-xs">
              <span className="h-3 w-3 rounded-full" style={{ background: colors[i % colors.length] }} />
              <b>{r.code}</b>
              <span className={sub}>{bn(r.q.toFixed(4))}</span>
              <b className="ml-auto">${fmtUSD(r.v)}</b>
              <span className={sub}>{bn(((r.v / total) * 100).toFixed(1))}%</span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <Stat e="💵" v={`$${fmtUSD(total)}`} t="মোট মূল্য" />
        <Stat e="📈" v="+$1,240" t="মোট লাভ (ডেমো)" />
        <Stat e="📊" v="+5.2%" t="রিটার্ন" />
      </div>
    </Page>
  );
}

export function CexTax() {
  const { card, sub } = useSkin();
  const [year, setYear] = useState("২০২৬");
  const [done, setDone] = useState(false);
  return (
    <Page narrow>
      <PageHead t="🧾 ট্যাক্স রিপোর্ট" sub="ট্রেডিং রিপোর্ট ডাউনলোড" />
      <div className={`${card} p-5`}>
        <label className={`text-xs ${sub}`}>অর্থবছর</label>
        <select value={year} onChange={(e) => setYear(e.target.value)} className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none [&>option]:text-black">
          {["২০২৬", "২০২৫", "২০২৪"].map((y) => <option key={y}>{y}</option>)}
        </select>
        <div className="mt-4 space-y-2 text-sm">
          {[["মোট ট্রেড", "৪৮টি"], ["মোট লাভ", "$1,240.50"], ["মোট ক্ষতি", "$320.00"], ["নিট লাভ", "$920.50"]].map(([t, v]) => (
            <div key={t} className="flex justify-between rounded-lg bg-white/[0.03] px-3 py-2"><span className={sub}>{t}</span><b>{t === "নিট লাভ" || t === "মোট লাভ" ? <span className="text-emerald-400">{v}</span> : v}</b></div>
          ))}
        </div>
        <button onClick={() => setDone(true)} className="mt-4 w-full rounded-xl bg-[#f0b90b] py-3 text-sm font-black text-black">📥 PDF ডাউনলোড</button>
        {done && <p className="mt-2 rounded-xl bg-emerald-500/15 py-2 text-center text-xs font-bold text-emerald-400">✅ রিপোর্ট তৈরি! (ডেমো)</p>}
        <p className={`mt-2 text-center text-[10px] ${sub}`}>💡 ট্যাক্স পরামর্শকের সাথে কথা বলুন — এটি শুধু হিসাব</p>
      </div>
    </Page>
  );
}

export function CexNotifs() {
  const { card, sub } = useSkin();
  const [read, setRead] = useLocal<string[]>("notif_read", []);
  const notifs = [
    { id: "n1", e: "📈", t: "BTC $৯৭,০০০ ছাড়ালো!", d: "১০ মিনিট আগে", b: "আপনার ওয়াচলিস্টের BTC নতুন হাই তৈরি করেছে।" },
    { id: "n2", e: "🎁", t: "১০০ USDT বোনাস পেয়েছেন", d: "২ ঘণ্টা আগে", b: "ওয়েলকাম বোনাস আপনার স্পট ওয়ালেটে যোগ হয়েছে।" },
    { id: "n3", e: "🚀", t: "নতুন লিস্টিং: NVC/USDT", d: "৫ ঘণ্টা আগে", b: "নোভাচেইন এখন স্পট মার্কেটে ট্রেড হচ্ছে।" },
    { id: "n4", e: "🌱", t: "স্টেকিং রিওয়ার্ড: ০.০০১২ ETH", d: "১ দিন আগে", b: "আপনার ETH স্টেকিং থেকে দৈনিক রিওয়ার্ড।" },
    { id: "n5", e: "⚠️", t: "সিস্টেম আপগ্রেড ১৪ অক্টোবর", d: "২ দিন আগে", b: "ফিউচার্স ট্রেডিং রাত ২–৪টা বন্ধ থাকবে।" },
  ];
  return (
    <Page>
      <div className="mb-4 flex items-center justify-between">
        <SectionTitle t="🔔 নোটিফিকেশন" />
        <button onClick={() => setRead(notifs.map((n) => n.id))} className={`text-xs font-bold ${sub} underline`}>সব পড়া হয়েছে</button>
      </div>
      <div className="space-y-2">
        {notifs.map((n) => {
          const isNew = !read.includes(n.id);
          return (
            <button key={n.id} onClick={() => !read.includes(n.id) && setRead([...read, n.id])} className={`${card} flex w-full gap-3 p-4 text-left ${isNew ? "border-[#f0b90b]/40" : "opacity-70"}`}>
              <span className="text-2xl">{n.e}</span>
              <div className="flex-1"><p className="text-sm font-black">{isNew && <span className="mr-1 inline-block h-2 w-2 rounded-full bg-[#f0b90b]" />}{n.t}</p>
                <p className={`mt-0.5 text-xs ${sub}`}>{n.b}</p><p className={`mt-1 text-[10px] ${sub}`}>{n.d}</p></div>
            </button>
          );
        })}
      </div>
    </Page>
  );
}

/* ================= COIN DETAIL ================= */

export function CexCoinDetail({ code }: { code: string }) {
  const coins = useCexCoins();
  const { base } = useDemo();
  const { card, sub } = useSkin();
  const c = coinOf(code, coins);
  const [wl, setWl] = useLocal<string[]>("watchlist", ["BTC", "ETH", "SOL"]);
  const inWl = wl.includes(c.code);
  return (
    <div>
      <TickerTape />
      <Page>
        <Back href={base} label="হোম" />
        <div className={`${card} p-5`}>
          <div className="flex items-center gap-3">
            <CoinIcon code={c.code} size={52} />
            <div className="flex-1">
              <p className="text-xl font-black">{c.bn} <span className="text-sm font-normal opacity-50">({c.name})</span></p>
              <p className={`text-xs ${sub}`}>{c.code}/USDT</p>
            </div>
            <button onClick={() => setWl(inWl ? wl.filter((x) => x !== c.code) : [...wl, c.code])} className={`rounded-xl px-4 py-2 text-sm font-black ${inWl ? "bg-[#f0b90b] text-black" : "bg-white/10"}`}>{inWl ? "⭐ সেভড" : "☆ ওয়াচলিস্ট"}</button>
          </div>
          <div className="mt-3 flex items-end gap-3">
            <p className="text-3xl font-black">${fmtUSD(c.price)}</p>
            <ChangeBadge v={c.change} big />
          </div>
          <p className={`text-xs ${sub}`}>≈ {fmtBDT(c.price)} টাকা</p>
          <div className="mt-4"><TradeChart code={c.code} height={200} /></div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
            {[["২৪ঘ হাই", `$${fmtUSD(c.high)}`], ["২৪ঘ লো", `$${fmtUSD(c.low)}`], ["২৪ঘ ভলিউম", c.vol], ["মার্কেট ক্যাপ", `$${fmtUSD(c.price * 19700000)}`]].map(([t, v]) => (
              <div key={t} className="rounded-xl bg-white/[0.03] p-2.5"><p className={`text-[10px] ${sub}`}>{t}</p><p className="text-xs font-black">{v}</p></div>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <Link href={`${base}/trade/${c.code}USDT`} className="rounded-xl bg-[#0ecb81] py-3 text-center text-sm font-black text-white">📊 ট্রেড</Link>
            <Link href={`${base}/convert`} className="rounded-xl bg-white/10 py-3 text-center text-sm font-black">🔄 কনভার্ট</Link>
            <Link href={`${base}/earn`} className="rounded-xl bg-white/10 py-3 text-center text-sm font-black">🌱 আর্ন</Link>
          </div>
        </div>
        <div className={`${card} mt-3 p-5`}>
          <p className="text-sm font-black">ℹ️ {c.bn} সম্পর্কে</p>
          <p className={`mt-2 text-xs leading-relaxed ${sub}`}>
            {c.code === "BTC" && "বিটকয়েন বিশ্বের প্রথম ও সবচেয়ে বড় ক্রিপ্টোকারেন্সি — ডিজিটাল গোল্ড হিসেবে পরিচিত। সর্বোচ্চ সরবরাহ ২১ মিলিয়ন।"}
            {c.code === "ETH" && "ইথেরিয়াম স্মার্ট কন্ট্রাক্ট প্ল্যাটফর্ম — DeFi ও NFT-এর প্রাণকেন্দ্র।"}
            {c.code === "BNB" && "বিএনবি এই এক্সচেঞ্জের নেটিভ টোকেন — ফিতে ২৫% ছাড়সহ নানা সুবিধা।"}
            {c.code === "USDT" && "টিথার ডলার-পেগড স্টেবলকয়েন — ১ USDT ≈ ১ ডলার। ট্রেডিংয়ের বেস কারেন্সি।"}
            {!["BTC", "ETH", "BNB", "USDT"].includes(c.code) && `${c.bn} (${c.name}) একটি জনপ্রিয় ক্রিপ্টোকারেন্সি — স্পট, ফিউচার্স ও P2P-তে ট্রেডযোগ্য।`}
          </p>
        </div>
      </Page>
    </div>
  );
}
