"use client";

/** DemoSite CRYPTO-EXCHANGE layout — Binance-style professional crypto exchange demo.
 * 60+ pages: spot/futures/P2P trading, wallets, earn, launchpad, NFT, academy...
 * Browser-local data only; nothing touches the real DigiPlyra DB or admin.
 * ALL trading is simulated — no real crypto, no real money.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { toBnDigits } from "@/lib/format";
import { useDemo } from "./store";
import type { DemoCoin } from "./types";
import { Page, SectionTitle, Empty, Back } from "./ui";
import { ShopLogin, ShopSignup, ShopAccount, ShopAbout, ShopContact } from "./shop-pages";

export const CexLogin = ShopLogin;
export const CexSignup = ShopSignup;
export const CexAccount = ShopAccount;
export const CexAbout = ShopAbout;
export const CexContact = ShopContact;

export const bn = (n: number | string) => toBnDigits(n);
export const USD_BDT = 121; // demo conversion rate
export const fmtUSD = (n: number) =>
  n >= 1000
    ? toBnDigits(n.toLocaleString("en-US", { maximumFractionDigits: 2 }))
    : n >= 1
      ? toBnDigits(n.toLocaleString("en-US", { maximumFractionDigits: 2 }))
      : toBnDigits(n.toLocaleString("en-US", { maximumFractionDigits: 4 }));
export const fmtBDT = (usd: number) => toBnDigits(Math.round(usd * USD_BDT).toLocaleString("en-IN"));
export const fmtPct = (n: number) => `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;

/* ================= DATA ================= */

export interface CexCoin extends DemoCoin {
  bn: string; // Bengali name
  vol: string; // 24h volume
  high: number;
  low: number;
}

export const CEX_COINS: CexCoin[] = [
  { code: "BTC", name: "Bitcoin", bn: "বিটকয়েন", price: 97400, change: 2.4, e: "₿", vol: "৩৮.২B", high: 98500, low: 94800 },
  { code: "ETH", name: "Ethereum", bn: "ইথেরিয়াম", price: 3420, change: 1.8, e: "Ξ", vol: "১৮.৬B", high: 3490, low: 3310 },
  { code: "BNB", name: "BNB", bn: "বিএনবি", price: 692, change: -0.8, e: "🟡", vol: "২.১B", high: 705, low: 680 },
  { code: "SOL", name: "Solana", bn: "সোলানা", price: 214, change: 5.2, e: "◎", vol: "৫.৪B", high: 219, low: 201 },
  { code: "XRP", name: "XRP", bn: "এক্সআরপি", price: 2.35, change: 3.1, e: "✕", vol: "৮.৯B", high: 2.42, low: 2.24 },
  { code: "DOGE", name: "Dogecoin", bn: "ডোজকয়েন", price: 0.32, change: -1.2, e: "Ð", vol: "৩.৩B", high: 0.335, low: 0.31 },
  { code: "ADA", name: "Cardano", bn: "কার্ডানো", price: 0.98, change: 0.7, e: "₳", vol: "১.২B", high: 1.01, low: 0.95 },
  { code: "AVAX", name: "Avalanche", bn: "অ্যাভালাঞ্চ", price: 42.5, change: 2.9, e: "🔺", vol: "৯৮০M", high: 43.8, low: 40.9 },
  { code: "LINK", name: "Chainlink", bn: "চেইনলিংক", price: 22.8, change: 4.1, e: "⬡", vol: "৭৬০M", high: 23.4, low: 21.7 },
  { code: "DOT", name: "Polkadot", bn: "পোলকাডট", price: 8.9, change: -0.5, e: "●", vol: "৪২০M", high: 9.1, low: 8.7 },
  { code: "USDT", name: "Tether", bn: "টিথার", price: 1.0, change: 0.01, e: "₮", vol: "৬৫.১B", high: 1.001, low: 0.999 },
  { code: "TRX", name: "Tron", bn: "ট্রন", price: 0.27, change: 1.5, e: "🔱", vol: "৮৯০M", high: 0.278, low: 0.262 },
];

export const coinOf = (code: string): CexCoin =>
  CEX_COINS.find((c) => c.code === code.toUpperCase()) ?? CEX_COINS[0];

/** Deterministic pseudo-random from a string seed (stable across renders). */
export function seeded(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return (h % 10000) / 10000;
}

/** Generate a 48-point price series for a coin (SVG chart). */
export function priceSeries(code: string, points = 48): number[] {
  const c = coinOf(code);
  const out: number[] = [];
  let p = c.price / (1 + c.change / 100);
  for (let i = 0; i < points; i++) {
    const drift = (seeded(code + i) - 0.48) * 0.02;
    p = p * (1 + drift);
    out.push(p);
  }
  // pin last point to current price
  out[points - 1] = c.price;
  return out;
}

export const P2P_ADS = [
  { id: "p2p1", side: "buy", coin: "USDT", price: 122.5, min: 5000, max: 200000, trader: "ঢাকা ট্রেডার", trades: 1240, rate: 98.7, pay: ["বিকাশ", "নগদ"] },
  { id: "p2p2", side: "buy", coin: "USDT", price: 122.8, min: 10000, max: 500000, trader: "ক্রিপ্টো বিডি", trades: 3560, rate: 99.1, pay: ["বিকাশ", "রকেট"] },
  { id: "p2p3", side: "sell", coin: "USDT", price: 120.2, min: 5000, max: 150000, trader: "সিলেট এক্সচেঞ্জ", trades: 890, rate: 97.9, pay: ["নগদ"] },
  { id: "p2p4", side: "buy", coin: "BTC", price: 11850000, min: 50000, max: 2000000, trader: "হোল্ডার বিডি", trades: 210, rate: 99.5, pay: ["বিকাশ"] },
  { id: "p2p5", side: "sell", coin: "BTC", price: 11620000, min: 100000, max: 5000000, trader: "মাইনার হাউস", trades: 540, rate: 98.2, pay: ["নগদ", "রকেট"] },
  { id: "p2p6", side: "sell", coin: "ETH", price: 408000, min: 20000, max: 800000, trader: "চট্টগ্রাম ক্রিপ্টো", trades: 670, rate: 98.8, pay: ["বিকাশ", "নগদ", "রকেট"] },
];

export const LAUNCHPADS = [
  { id: "lp1", n: "নোভাচেইন (NVC)", e: "🌐", price: "0.05 USDT", goal: "৫M USDT", progress: 78, ends: "২ দিন বাকি", desc: "লেয়ার-২ স্কেলিং সলিউশন — ১০০x ফাস্টার ট্রানজেকশন।" },
  { id: "lp2", n: "গ্রিনফাই (GRN)", e: "🌱", price: "0.12 USDT", goal: "৩M USDT", progress: 45, ends: "৫ দিন বাকি", desc: "কার্বন ক্রেডিট ট্রেডিং প্ল্যাটফর্ম ব্লকচেইনে।" },
  { id: "lp3", n: "গেমভার্স (GMV)", e: "🎮", price: "0.08 USDT", goal: "৮M USDT", progress: 92, ends: "১২ ঘণ্টা বাকি", desc: "প্লে-টু-আর্ন গেমিং ইকোসিস্টেম — ২M+ ওয়েটলিস্ট।" },
];

export const EARN_PRODUCTS = [
  { id: "e1", coin: "BTC", apy: 4.2, type: "ফ্লেক্সিবল", min: "0.001 BTC", e: "₿" },
  { id: "e2", coin: "ETH", apy: 5.8, type: "৩০ দিন লকড", min: "0.01 ETH", e: "Ξ" },
  { id: "e3", coin: "USDT", apy: 8.5, type: "ফ্লেক্সিবল", min: "10 USDT", e: "₮" },
  { id: "e4", coin: "BNB", apy: 6.2, type: "৬০ দিন লকড", min: "0.1 BNB", e: "🟡" },
  { id: "e5", coin: "SOL", apy: 9.4, type: "৯০ দিন লকড", min: "0.5 SOL", e: "◎" },
];

export const NFTS = [
  { id: "n1", n: "ঢাকার রিকশা #001", e: "🛺", price: 0.45, coin: "ETH", artist: "আর্ট বিডি" },
  { id: "n2", n: "পদ্মা সানসেট", e: "🌅", price: 0.28, coin: "ETH", artist: "পিক্সেল রানা" },
  { id: "n3", n: "বাঘের চোখ", e: "🐯", price: 1.2, coin: "ETH", artist: "ওয়াইল্ড এনএফটি" },
  { id: "n4", n: "সাইবার টাইগার", e: "🤖", price: 0.85, coin: "ETH", artist: "মেটা ঢাকা" },
  { id: "n5", n: "নকশী কাঁথা", e: "🧵", price: 0.15, coin: "ETH", artist: "হেরিটেজ ল্যাব" },
  { id: "n6", n: "ক্রিকেট লিজেন্ড", e: "🏏", price: 2.1, coin: "ETH", artist: "স্পোর্টস মিন্ট" },
];

export const ANNOUNCEMENTS = [
  { id: "a1", t: "নতুন লিস্টিং: নোভাচেইন (NVC/USDT)", d: "১২ অক্টোবর ২০২৬", body: "নোভাচেইন (NVC) স্পট মার্কেটে লিস্ট হচ্ছে। ট্রেডিং শুরু: ১২ অক্টোবর, দুপুর ২টা (বাংলাদেশ সময়)। ডিপোজিট এখনই খোলা আছে।" },
  { id: "a2", t: "সিস্টেম আপগ্রেড — ১৪ অক্টোবর", d: "১০ অক্টোবর ২০২৬", body: "১৪ অক্টোবর রাত ২টা–৪টা পর্যন্ত ফিউচার্স ট্রেডিং সাময়িক বন্ধ থাকবে। স্পট ট্রেডিং চালু থাকবে।" },
  { id: "a3", t: "USDT স্টেকিং APY বেড়ে ৮.৫%", d: "৮ অক্টোবর ২০২৬", body: "ফ্লেক্সিবল সেভিংসে USDT-এর বার্ষিক মুনাফা এখন ৮.৫%। যেকোনো সময় তোলা যাবে।" },
  { id: "a4", t: "P2P-তে নতুন পেমেন্ট: উপায়", d: "৫ অক্টোবর ২০২৬", body: "P2P ট্রেডিংয়ে এখন উপায় (Upay) সাপোর্টেড। ৫০০+ নতুন মার্চেন্ট যোগ দিয়েছে।" },
];

export const FAQS = [
  { q: "অ্যাকাউন্ট কিভাবে খুলবো?", a: "সাইন আপ পেজে মোবাইল নম্বর ও পাসওয়ার্ড দিন, OTP ভেরিফাই করুন — ২ মিনিটেই অ্যাকাউন্ট রেডি।" },
  { q: "KYC কি বাধ্যতামূলক?", a: "ডিপোজিট ও ট্রেডিংয়ের জন্য বেসিক KYC (NID/পাসপোর্ট) প্রয়োজন। যাচাই হতে ১০–৩০ মিনিট লাগে।" },
  { q: "টাকা কিভাবে জমা দেবো?", a: "বিকাশ/নগদ/রকেট দিয়ে ফিয়াট ডিপোজিট, অথবা অন্য ওয়ালেট থেকে ক্রিপ্টো পাঠাতে পারেন।" },
  { q: "ট্রেডিং ফি কত?", a: "স্পট মেকার ০.১%, টেকার ০.১%। BNB দিয়ে ফি দিলে ২৫% ছাড়।" },
  { q: "টাকা তোলা কি নিরাপদ?", a: "হ্যাঁ — উইথড্রতে 2FA + ইমেইল কনফার্মেশন বাধ্যতামূলক।" },
  { q: "P2P কি?", a: "ব্যবহারকারী-থেকে-ব্যবহারকারী সরাসরি কেনাবেচা — এসক্রো সুরক্ষাসহ।" },
];

export const BLOGS = [
  { id: "b1", t: "বিটকয়েন ১ লাখ ডলারের পথে?", e: "₿", d: "১০ অক্টোবর", body: "বিশ্লেষকদের মতে ETF ইনফ্লো ও হালভিং-পরবর্তী সাইকেলে বিটকয়েন নতুন রেকর্ডের দিকে এগোচ্ছে। সাপোর্ট ৯০K, রেজিস্ট্যান্স ১০০K।" },
  { id: "b2", t: "নতুনদের জন্য ৫টি ট্রেডিং ভুল", e: "⚠️", d: "৭ অক্টোবর", body: "লিভারেজের অপব্যবহার, স্টপ-লস না দেওয়া, FOMO ট্রেডিং — নতুন ট্রেডারদের সবচেয়ে সাধারণ ৫টি ভুল ও এড়ানোর উপায়।" },
  { id: "b3", t: "স্টেকিং বনাম ট্রেডিং: কোনটি ভালো?", e: "⚖️", d: "৩ অক্টোবর", body: "প্যাসিভ আয় চাইলে স্টেকিং (৪–৯% APY), সক্রিয় মুনাফা চাইলে ট্রেডিং — ঝুঁকি ও রিটার্নের পূর্ণ তুলনা।" },
];

export const ACADEMY = [
  { id: "ac1", t: "ব্লকচেইন কী?", e: "⛓️", level: "বিগিনার", body: "ব্লকচেইন হলো বিকেন্দ্রীভূত ডিজিটাল খতিয়ান — হাজারো কম্পিউটারে একই রেকর্ড থাকে, তাই জালিয়াতি প্রায় অসম্ভব।" },
  { id: "ac2", t: "ওয়ালেট ও প্রাইভেট কী", e: "🔑", level: "বিগিনার", body: "প্রাইভেট কী = আপনার টাকার চাবি। কাউকে দেবেন না। সিড ফ্রেজ কাগজে লিখে নিরাপদে রাখুন।" },
  { id: "ac3", t: "ক্যান্ডেলস্টিক চার্ট পড়া", e: "📊", level: "ইন্টারমিডিয়েট", body: "সবুজ ক্যান্ডেল = দাম বেড়েছে, লাল = কমেছে। বডি ও উইক দেখে বায়ার-সেলার চাপ বোঝা যায়।" },
  { id: "ac4", t: "লিভারেজ ও লিকুইডেশন", e: "⚡", level: "অ্যাডভান্সড", body: "১০x লিভারেজে ১০% মুভমেন্ট = ১০০% লাভ/ক্ষতি। লিকুইডেশন প্রাইসের আগেই স্টপ-লস দিন।" },
];

/* ================= HELPERS ================= */

export function useSkin() {
  const { def } = useDemo();
  return {
    dark: true, // crypto-exchange is always dark (Binance style)
    accent: def.accent || "#f0b90b",
    card: "rounded-xl border border-white/10 bg-[#12161c]",
    sub: "text-slate-400",
    input: "w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-[#f0b90b]/60",
  };
}

/** Browser-local key-value hook (SSR-safe). */
export function useLocal<T>(key: string, fb: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const { def } = useDemo();
  const k = `cex:${def.slug}:${key}`;
  const [v, setV] = useState<T>(fb);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(k);
      if (raw) setV(JSON.parse(raw));
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [k]);
  useEffect(() => {
    try { localStorage.setItem(k, JSON.stringify(v)); } catch {}
  }, [k, v]);
  return [v, setV];
}

export function ChangeBadge({ v, big }: { v: number; big?: boolean }) {
  const up = v >= 0;
  return (
    <span className={`${big ? "text-base" : "text-xs"} font-bold ${up ? "text-emerald-400" : "text-red-400"}`}>
      {up ? "▲" : "▼"} {bn(Math.abs(v).toFixed(2))}%
    </span>
  );
}

export function Spark({ code, w = 96, h = 32 }: { code: string; w?: number; h?: number }) {
  const data = useMemo(() => priceSeries(code, 24), [code]);
  const min = Math.min(...data), max = Math.max(...data);
  const pts = data.map((p, i) => `${(i / (data.length - 1)) * w},${h - ((p - min) / (max - min || 1)) * (h - 4) - 2}`).join(" ");
  const up = coinOf(code).change >= 0;
  const col = up ? "#10b981" : "#ef4444";
  return (
    <svg width={w} height={h} className="shrink-0">
      <polyline points={pts} fill="none" stroke={col} strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

export function CoinIcon({ code, size = 40 }: { code: string; size?: number }) {
  const c = coinOf(code);
  return (
    <span
      className="grid shrink-0 place-items-center rounded-full font-black text-white"
      style={{ width: size, height: size, fontSize: size * 0.45, background: "linear-gradient(135deg,#2b3440,#12161c)", border: "1px solid rgba(255,255,255,.12)" }}
    >
      {c.e}
    </span>
  );
}

export function CoinRow({ code, link = true }: { code: string; link?: boolean }) {
  const { base } = useDemo();
  const { card } = useSkin();
  const c = coinOf(code);
  const inner = (
    <div className={`${card} flex items-center gap-3 p-3 transition hover:border-[#f0b90b]/40`}>
      <CoinIcon code={code} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-black">{c.code}<span className="ml-1 font-normal opacity-50">/USDT</span></p>
        <p className="truncate text-[11px] opacity-50">{c.bn}</p>
      </div>
      <Spark code={code} />
      <div className="text-right">
        <p className="text-sm font-black">${fmtUSD(c.price)}</p>
        <ChangeBadge v={c.change} />
      </div>
    </div>
  );
  return link ? <Link href={`${base}/coin/${c.code}`} className="block">{inner}</Link> : inner;
}

/** Scrolling ticker tape (Binance style). */
export function TickerTape() {
  const items = [...CEX_COINS, ...CEX_COINS];
  return (
    <div className="overflow-hidden border-y border-white/10 bg-[#0d1117] py-2">
      <div className="flex w-max animate-[tick_40s_linear_infinite] gap-8">
        {items.map((c, i) => (
          <span key={i} className="flex items-center gap-2 text-xs whitespace-nowrap">
            <b>{c.code}/USDT</b>
            <span className="opacity-70">${fmtUSD(c.price)}</span>
            <ChangeBadge v={c.change} />
          </span>
        ))}
      </div>
      <style>{`@keyframes tick { to { transform: translateX(-50%); } }`}</style>
    </div>
  );
}

/** SVG candlestick-ish chart. */
export function TradeChart({ code, height = 220 }: { code: string; height?: number }) {
  const data = useMemo(() => priceSeries(code, 60), [code]);
  const w = 600;
  const min = Math.min(...data), max = Math.max(...data);
  const y = (p: number) => height - 12 - ((p - min) / (max - min || 1)) * (height - 32);
  const pts = data.map((p, i) => `${(i / (data.length - 1)) * w},${y(p).toFixed(1)}`).join(" ");
  const up = data[data.length - 1] >= data[0];
  const col = up ? "#0ecb81" : "#f6465d";
  const id = `g${code}`;
  return (
    <div>
      <svg viewBox={`0 0 ${w} ${height}`} className="w-full" style={{ height }}>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={col} stopOpacity="0.35" />
            <stop offset="100%" stopColor={col} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((f) => (
          <line key={f} x1="0" x2={w} y1={height * f} y2={height * f} stroke="rgba(255,255,255,.06)" strokeDasharray="4 4" />
        ))}
        <polygon points={`0,${height} ${pts} ${w},${height}`} fill={`url(#${id})`} />
        <polyline points={pts} fill="none" stroke={col} strokeWidth="2" />
        <circle cx={w} cy={y(data[data.length - 1])} r="4" fill={col} />
      </svg>
      <div className="flex justify-between text-[10px] opacity-40">
        <span>২৪ঘ আগে</span><span>এখন</span>
      </div>
    </div>
  );
}

/** Simulated live order book. */
export function OrderBook({ code, compact }: { code: string; compact?: boolean }) {
  const c = coinOf(code);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 2500);
    return () => clearInterval(t);
  }, []);
  const rows = useMemo(() => {
    const asks: { p: number; q: number }[] = [];
    const bids: { p: number; q: number }[] = [];
    for (let i = 0; i < (compact ? 5 : 8); i++) {
      const j = (seeded(code + "a" + i) + tick * 0.13) % 1;
      const j2 = (seeded(code + "b" + i) + tick * 0.17) % 1;
      asks.push({ p: c.price * (1 + (i + 1) * 0.0004 + j * 0.0002), q: 0.01 + j * 2 });
      bids.push({ p: c.price * (1 - (i + 1) * 0.0004 - j2 * 0.0002), q: 0.01 + j2 * 2 });
    }
    return { asks: asks.reverse(), bids };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, tick, c.price]);
  const maxQ = Math.max(...rows.asks.map((r) => r.q), ...rows.bids.map((r) => r.q));
  const Row = ({ p, q, ask }: { p: number; q: number; ask: boolean }) => (
    <div className="relative flex justify-between px-2 py-[3px] text-[11px] tabular-nums">
      <div className="absolute inset-y-0 right-0" style={{ width: `${(q / maxQ) * 100}%`, background: ask ? "rgba(246,70,93,.12)" : "rgba(14,203,129,.12)" }} />
      <span className={`relative ${ask ? "text-[#f6465d]" : "text-[#0ecb81]"}`}>${fmtUSD(p)}</span>
      <span className="relative opacity-70">{q.toFixed(3)}</span>
    </div>
  );
  return (
    <div>
      <div className="flex justify-between px-2 py-1 text-[10px] opacity-40"><span>দাম (USDT)</span><span>পরিমাণ</span></div>
      {rows.asks.map((r, i) => <Row key={"a" + i} p={r.p} q={r.q} ask />)}
      <div className="flex items-center gap-2 px-2 py-1.5">
        <span className={`text-sm font-black ${c.change >= 0 ? "text-[#0ecb81]" : "text-[#f6465d]"}`}>${fmtUSD(c.price)}</span>
        <span className="text-[10px] opacity-40">≈ {fmtBDT(c.price)} টাকা</span>
      </div>
      {rows.bids.map((r, i) => <Row key={"b" + i} p={r.p} q={r.q} ask={false} />)}
    </div>
  );
}

export function Stat({ e, v, t }: { e: string; v: string; t: string }) {
  const { card } = useSkin();
  return (
    <div className={`${card} p-4 text-center`}>
      <p className="text-2xl">{e}</p>
      <p className="mt-1 text-lg font-black text-[#f0b90b]">{v}</p>
      <p className="text-[11px] opacity-60">{t}</p>
    </div>
  );
}

export function PageHead({ t, sub }: { t: string; sub?: string }) {
  const { base } = useDemo();
  return (
    <div className="mb-4">
      <Back href={base} label="হোম" />
      <SectionTitle t={t} sub={sub} />
    </div>
  );
}

/** Demo balances (USDT-based), browser-local. */
export function useCexBalances() {
  const [bal, setBal] = useLocal<Record<string, number>>("balances", { USDT: 100000, BTC: 0.25, ETH: 2.5 });
  return [bal, setBal] as const;
}

export function balTotalUSD(bal: Record<string, number>): number {
  return Object.entries(bal).reduce((s, [code, q]) => s + q * coinOf(code).price, 0);
}

export interface CexOrder {
  id: string;
  pair: string;
  side: "buy" | "sell";
  type: string;
  price: number;
  qty: number;
  total: number;
  date: number;
  status: string;
}

/* ================= HOME ================= */

/** Wallet page wrapper with consistent header. */
export function WalletShell({ t, sub, children }: { t: string; sub?: string; children: React.ReactNode }) {
  const { base } = useDemo();
  return (
    <Page>
      <Back href={`${base}/wallet`} label="ওয়ালেট" />
      <SectionTitle t={t} sub={sub} />
      {children}
    </Page>
  );
}
