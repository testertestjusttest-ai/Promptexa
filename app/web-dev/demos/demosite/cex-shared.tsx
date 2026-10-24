"use client";

/** DemoSite CRYPTO-EXCHANGE layout — professional crypto exchange demo.
 * 60+ pages: spot/futures/P2P trading, wallets, earn, launchpad, NFT, academy...
 * Browser-local data only; nothing touches the real DigiPlyra DB or admin.
 * ALL trading is simulated — no real crypto, no real money.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useDemo } from "./store";
import type { DemoCoin } from "./types";
import { Page, SectionTitle, Empty, Back } from "./ui";
import { ShopLogin, ShopSignup, ShopAccount, ShopAbout, ShopContact } from "./shop-pages";

export const CexLogin = ShopLogin;
export const CexSignup = ShopSignup;
export const CexAccount = ShopAccount;
export const CexAbout = ShopAbout;
export const CexContact = ShopContact;

export const bn = (n: number | string) => String(n); // Latin digits in the default (English) view
export const USD_BDT = 121; // demo conversion rate
export const fmtUSD = (n: number) =>
  n >= 1000
    ? n.toLocaleString("en-US", { maximumFractionDigits: 2 })
    : n >= 1
      ? n.toLocaleString("en-US", { maximumFractionDigits: 2 })
      : n.toLocaleString("en-US", { maximumFractionDigits: 4 });
export const fmtBDT = (usd: number) => Math.round(usd * USD_BDT).toLocaleString("en-US");
export const fmtPct = (n: number) => `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;

/* ================= DATA ================= */

export interface CexCoin extends DemoCoin {
  bn: string; // Localised display name (English in the default view)
  vol: string; // 24h volume
  high: number;
  low: number;
}

export const CEX_COINS: CexCoin[] = [
  { code: "BTC", name: "Bitcoin", bn: "Bitcoin", price: 97400, change: 2.4, e: "₿", vol: "38.2B", high: 98500, low: 94800 },
  { code: "ETH", name: "Ethereum", bn: "Ethereum", price: 3420, change: 1.8, e: "Ξ", vol: "18.6B", high: 3490, low: 3310 },
  { code: "BNB", name: "BNB", bn: "BNB", price: 692, change: -0.8, e: "🟡", vol: "2.1B", high: 705, low: 680 },
  { code: "SOL", name: "Solana", bn: "Solana", price: 214, change: 5.2, e: "◎", vol: "5.4B", high: 219, low: 201 },
  { code: "XRP", name: "XRP", bn: "XRP", price: 2.35, change: 3.1, e: "✕", vol: "8.9B", high: 2.42, low: 2.24 },
  { code: "DOGE", name: "Dogecoin", bn: "Dogecoin", price: 0.32, change: -1.2, e: "Ð", vol: "3.3B", high: 0.335, low: 0.31 },
  { code: "ADA", name: "Cardano", bn: "Cardano", price: 0.98, change: 0.7, e: "₳", vol: "1.2B", high: 1.01, low: 0.95 },
  { code: "AVAX", name: "Avalanche", bn: "Avalanche", price: 42.5, change: 2.9, e: "🔺", vol: "980M", high: 43.8, low: 40.9 },
  { code: "LINK", name: "Chainlink", bn: "Chainlink", price: 22.8, change: 4.1, e: "⬡", vol: "760M", high: 23.4, low: 21.7 },
  { code: "DOT", name: "Polkadot", bn: "Polkadot", price: 8.9, change: -0.5, e: "●", vol: "420M", high: 9.1, low: 8.7 },
  { code: "USDT", name: "Tether", bn: "Tether", price: 1.0, change: 0.01, e: "₮", vol: "65.1B", high: 1.001, low: 0.999 },
  { code: "TRX", name: "Tron", bn: "Tron", price: 0.27, change: 1.5, e: "🔱", vol: "890M", high: 0.278, low: 0.262 },
];

export const coinOf = (code: string, coins: CexCoin[] = CEX_COINS): CexCoin =>
  coins.find((c) => c.code === code.toUpperCase()) ?? coins[0];

/** Trading-engine coins with admin price overrides merged in (demo only).
 * Overrides come from the demo store (customCexPrices); high/low are clamped
 * so an edited price never sits outside its own range. */
export function useCexCoins(): CexCoin[] {
  const { store } = useDemo();
  const overrides = store.custom.customCexPrices ?? {};
  return useMemo(() => CEX_COINS.map((c) => {
    const o = overrides[c.code];
    if (!o) return c;
    const price = o.price ?? c.price;
    return { ...c, price, change: o.change ?? c.change, high: Math.max(o.high ?? c.high, price), low: Math.min(o.low ?? c.low, price) };
  }), [overrides]);
}

/** Deterministic pseudo-random from a string seed (stable across renders). */
export function seeded(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return (h % 10000) / 10000;
}

/** Generate a 48-point price series for a coin (SVG chart). */
export function priceSeries(code: string, points = 48, coins: CexCoin[] = CEX_COINS): number[] {
  const c = coinOf(code, coins);
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
  { id: "p2p1", side: "buy", coin: "USDT", price: 122.5, min: 5000, max: 200000, trader: "Dhaka Trader", trades: 1240, rate: 98.7, pay: ["bKash", "Nagad"] },
  { id: "p2p2", side: "buy", coin: "USDT", price: 122.8, min: 10000, max: 500000, trader: "Crypto BD", trades: 3560, rate: 99.1, pay: ["bKash", "Rocket"] },
  { id: "p2p3", side: "sell", coin: "USDT", price: 120.2, min: 5000, max: 150000, trader: "Sylhet Exchange", trades: 890, rate: 97.9, pay: ["Nagad"] },
  { id: "p2p4", side: "buy", coin: "BTC", price: 11850000, min: 50000, max: 2000000, trader: "Holder BD", trades: 210, rate: 99.5, pay: ["bKash"] },
  { id: "p2p5", side: "sell", coin: "BTC", price: 11620000, min: 100000, max: 5000000, trader: "Miner House", trades: 540, rate: 98.2, pay: ["Nagad", "Rocket"] },
  { id: "p2p6", side: "sell", coin: "ETH", price: 408000, min: 20000, max: 800000, trader: "Chattogram Crypto", trades: 670, rate: 98.8, pay: ["bKash", "Nagad", "Rocket"] },
];

export const LAUNCHPADS = [
  { id: "lp1", n: "NovaChain (NVC)", e: "🌐", price: "0.05 USDT", goal: "5M USDT", progress: 78, ends: "2 days left", desc: "Layer-2 scaling solution — 100x faster transactions." },
  { id: "lp2", n: "GreenFi (GRN)", e: "🌱", price: "0.12 USDT", goal: "3M USDT", progress: 45, ends: "5 days left", desc: "Carbon-credit trading platform on blockchain." },
  { id: "lp3", n: "GameVerse (GMV)", e: "🎮", price: "0.08 USDT", goal: "8M USDT", progress: 92, ends: "12 hours left", desc: "Play-to-earn gaming ecosystem — 2M+ on the waitlist." },
];

export const EARN_PRODUCTS = [
  { id: "e1", coin: "BTC", apy: 4.2, type: "Flexible", min: "0.001 BTC", e: "₿" },
  { id: "e2", coin: "ETH", apy: 5.8, type: "Locked for 30 days", min: "0.01 ETH", e: "Ξ" },
  { id: "e3", coin: "USDT", apy: 8.5, type: "Flexible", min: "10 USDT", e: "₮" },
  { id: "e4", coin: "BNB", apy: 6.2, type: "Locked for 60 days", min: "0.1 BNB", e: "🟡" },
  { id: "e5", coin: "SOL", apy: 9.4, type: "Locked for 90 days", min: "0.5 SOL", e: "◎" },
];

export const NFTS = [
  { id: "n1", n: "Dhaka Rickshaw #001", e: "🛺", price: 0.45, coin: "ETH", artist: "Art BD" },
  { id: "n2", n: "Padma Sunset", e: "🌅", price: 0.28, coin: "ETH", artist: "Pixel Rana" },
  { id: "n3", n: "Tiger's Eye", e: "🐯", price: 1.2, coin: "ETH", artist: "Wild NFT" },
  { id: "n4", n: "Cyber Tiger", e: "🤖", price: 0.85, coin: "ETH", artist: "Meta Dhaka" },
  { id: "n5", n: "Nakshi Kantha", e: "🧵", price: 0.15, coin: "ETH", artist: "Heritage Lab" },
  { id: "n6", n: "Cricket Legend", e: "🏏", price: 2.1, coin: "ETH", artist: "Sports Mint" },
];

export const ANNOUNCEMENTS = [
  { id: "a1", t: "New listing: NovaChain (NVC/USDT)", d: "12 October 2026", body: "NovaChain (NVC) is listing on the spot market. Trading starts 12 October at 2 PM (Bangladesh time). Deposits are already open." },
  { id: "a2", t: "System upgrade — 14 October", d: "10 October 2026", body: "Futures trading will be paused on 14 October from 2–4 AM. Spot trading stays open." },
  { id: "a3", t: "USDT staking APY rises to 8.5%", d: "8 October 2026", body: "Annual returns on USDT in Flexible Savings are now 8.5%. You can withdraw at any time." },
  { id: "a4", t: "New P2P payment: Upay", d: "5 October 2026", body: "Upay is now supported in P2P trading. 500+ new merchants have joined." },
];

export const FAQS = [
  { q: "How do I open an account?", a: "Enter your mobile number and password on the sign-up page and verify the OTP — your account is ready in 2 minutes." },
  { q: "Is KYC mandatory?", a: "Basic KYC (NID/passport) is required for deposits and trading. Verification takes 10–30 minutes." },
  { q: "How do I deposit?", a: "Deposit fiat with bKash/Nagad/Rocket, or send crypto from another wallet." },
  { q: "What are the trading fees?", a: "Spot maker 0.1%, taker 0.1%. Pay fees with BNB for a 25% discount." },
  { q: "Is withdrawing safe?", a: "Yes — withdrawals require 2FA + email confirmation." },
  { q: "What is P2P?", a: "Direct user-to-user buying and selling — with escrow protection." },
];

export const BLOGS = [
  { id: "b1", t: "Is Bitcoin headed for $100K?", e: "₿", d: "10 October", body: "Analysts say ETF inflows and the post-halving cycle are pushing Bitcoin toward a new record. Support at 90K, resistance at 100K." },
  { id: "b2", t: "5 Trading Mistakes Beginners Make", e: "⚠️", d: "7 October", body: "Misusing leverage, skipping stop-losses, FOMO trading — the 5 most common mistakes new traders make, and how to avoid them." },
  { id: "b3", t: "Staking vs Trading: Which Is Better?", e: "⚖️", d: "3 October", body: "Want passive returns? Staking (4–9% APY). Want active returns? Trading — a full risk-and-return comparison." },
];

export const ACADEMY = [
  { id: "ac1", t: "What is blockchain?", e: "⛓️", level: "Beginner", body: "A blockchain is a decentralised digital ledger — the same record lives on thousands of computers, making fraud almost impossible." },
  { id: "ac2", t: "Wallets & Private Keys", e: "🔑", level: "Beginner", body: "Your private key is the key to your funds. Never share it. Write your seed phrase on paper and keep it safe." },
  { id: "ac3", t: "Reading Candlestick Charts", e: "📊", level: "Intermediate", body: "A green candle means the price rose, red means it fell. The body and wick show buyer–seller pressure." },
  { id: "ac4", t: "Leverage & Liquidation", e: "⚡", level: "Advanced", body: "At 10x leverage, a 10% move = 100% profit or loss. Set a stop-loss before the liquidation price." },
];

/* ================= HELPERS ================= */

export function useSkin() {
  const { def } = useDemo();
  return {
    dark: true, // crypto-exchange is always dark
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
  const coins = useCexCoins();
  const data = useMemo(() => priceSeries(code, 24, coins), [code, coins]);
  const min = Math.min(...data), max = Math.max(...data);
  const pts = data.map((p, i) => `${(i / (data.length - 1)) * w},${h - ((p - min) / (max - min || 1)) * (h - 4) - 2}`).join(" ");
  const up = coinOf(code, coins).change >= 0;
  const col = up ? "#10b981" : "#ef4444";
  return (
    <svg width={w} height={h} className="shrink-0">
      <polyline points={pts} fill="none" stroke={col} strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

export function CoinIcon({ code, size = 40 }: { code: string; size?: number }) {
  const coins = useCexCoins();
  const c = coinOf(code, coins);
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
  const coins = useCexCoins();
  const { base } = useDemo();
  const { card } = useSkin();
  const c = coinOf(code, coins);
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

/** Scrolling ticker tape (demo prices). */
export function TickerTape() {
  const coins = useCexCoins();
  const items = [...coins, ...coins];
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
  const coins = useCexCoins();
  const data = useMemo(() => priceSeries(code, 60, coins), [code, coins]);
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
        <span>24h ago</span><span>Now</span>
      </div>
    </div>
  );
}

/** Simulated live order book. */
export function OrderBook({ code, compact }: { code: string; compact?: boolean }) {
  const coins = useCexCoins();
  const c = coinOf(code, coins);
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
      <div className="flex justify-between px-2 py-1 text-[10px] opacity-40"><span>Price (USDT)</span><span>Amount</span></div>
      {rows.asks.map((r, i) => <Row key={"a" + i} p={r.p} q={r.q} ask />)}
      <div className="flex items-center gap-2 px-2 py-1.5">
        <span className={`text-sm font-black ${c.change >= 0 ? "text-[#0ecb81]" : "text-[#f6465d]"}`}>${fmtUSD(c.price)}</span>
        <span className="text-[10px] opacity-40">≈ {fmtBDT(c.price)} BDT</span>
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
      <Back href={base} label="Home" />
      <SectionTitle t={t} sub={sub} />
    </div>
  );
}

/** Demo balances (USDT-based), browser-local. */
export function useCexBalances() {
  const [bal, setBal] = useLocal<Record<string, number>>("balances", { USDT: 100000, BTC: 0.25, ETH: 2.5 });
  return [bal, setBal] as const;
}

export function balTotalUSD(bal: Record<string, number>, coins: CexCoin[] = CEX_COINS): number {
  return Object.entries(bal).reduce((s, [code, q]) => s + q * coinOf(code, coins).price, 0);
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
      <Back href={`${base}/wallet`} label="Wallet" />
      <SectionTitle t={t} sub={sub} />
      {children}
    </Page>
  );
}
