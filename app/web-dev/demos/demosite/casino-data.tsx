"use client";

/**
 * DemoSite CASINO layout — online casino + sports betting platform demo.
 * 60+ pages: sportsbook, live betting, casino games (playable), wallet,
 * promotions, VIP, blog, support. All simulated — no real money.
 * Data is browser-local (store wallet/bets/gameHistory), never touches
 * the real DigiPlyra database or admin panel.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useDemo } from "./store";
import { Back, Empty, Field, Page, SectionTitle } from "./ui";

export const bn = (n: number | string) => String(n);
export const money = (n: number) => `${Math.round(n).toLocaleString("en-US")} credits`;
export const GOLD = "#f5c518";

/* ============================== data ============================== */

export type SportId = "cricket" | "football" | "tennis" | "basketball";

export interface CasiMatch {
  id: string;
  sport: SportId;
  league: string;
  home: string;
  away: string;
  he: string;
  ae: string;
  time: string;
  /** days from today: negative = finished (result), 0 = today, positive = upcoming */
  day: number;
  live?: boolean;
  minute?: string;
  hs?: number;
  as?: number;
  odds: { h: number; d?: number; a: number };
}

export interface FutureMarket {
  id: string;
  title: string;
  e: string;
  ends: string;
  selections: { name: string; flag: string; odds: number }[];
}

export const SPORTS: { id: SportId; n: string; e: string }[] = [
  { id: "cricket", n: "Cricket", e: "🏏" },
  { id: "football", n: "Football", e: "⚽" },
  { id: "tennis", n: "Tennis", e: "🎾" },
  { id: "basketball", n: "Basketball", e: "🏀" },
];

export const sportName = (id: SportId) => SPORTS.find((s) => s.id === id)?.n ?? id;

/** Deterministic fixture engine — 3-4 months of upcoming, 30 days of results, live now. */
export function fxRng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const EN_MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
export function dayLabel(day: number): string {
  if (day === 0) return "Today";
  if (day === 1) return "Tomorrow";
  if (day === -1) return "Yesterday";
  if (day < 0 && day >= -6) return `${bn(Math.abs(day))} days ago`;
  const d = new Date(); d.setDate(d.getDate() + day);
  return `${bn(d.getDate())} ${EN_MONTHS[d.getMonth()]}`;
}

type Team = { n: string; e: string; s: number };
export const FX_TEAMS: Record<SportId, { leagues: string[]; teams: Team[] }> = {
  cricket: {
    leagues: ["Bangladesh Premier League","Indian Premier League","T20 International","ODI Series","Test Series","Asia Cup"],
    teams: [
      { n: "Dhaka Dominators", e: "badge:D:#dc2626", s: 4 }, { n: "Cumilla Victorians", e: "badge:Cu:#2563eb", s: 5 },
      { n: "Rangpur Riders", e: "badge:Ra:#ca8a04", s: 4 }, { n: "Sylhet Strikers", e: "badge:Sy:#7c3aed", s: 3 },
      { n: "Chattogram Challengers", e: "badge:Ch:#0d9488", s: 3 }, { n: "Khulna Tigers", e: "badge:Kh:#ea580c", s: 3 },
      { n: "Barishal Fortune", e: "badge:Ba:#f97316", s: 4 }, { n: "Bangladesh", e: "🇧🇩", s: 4 },
      { n: "India", e: "🇮🇳", s: 5 }, { n: "Pakistan", e: "🇵🇰", s: 4 },
      { n: "Sri Lanka", e: "🇱🇰", s: 3 }, { n: "Australia", e: "🇦🇺", s: 5 },
      { n: "England", e: "🇬🇧", s: 4 }, { n: "Afghanistan", e: "🇦🇫", s: 3 },
      { n: "Mumbai Indians", e: "badge:Mu:#2563eb", s: 5 }, { n: "Chennai Super Kings", e: "badge:Ch:#ca8a04", s: 5 },
    ],
  },
  football: {
    leagues: ["Bangladesh Premier League","English Premier League","La Liga","UEFA Champions League","Bundesliga"],
    teams: [
      { n: "Dhaka Abahani", e: "badge:A:#2563eb", s: 4 }, { n: "Mohammedan SC", e: "badge:Mo:#1f2937", s: 4 },
      { n: "Bashundhara Kings", e: "badge:Ba:#7c3aed", s: 5 }, { n: "Saif Sporting", e: "badge:Sa:#ca8a04", s: 3 },
      { n: "Chattogram Abahani", e: "badge:Ch:#059669", s: 3 }, { n: "Rahmatganj", e: "badge:Ra:#dc2626", s: 2 },
      { n: "Arsenal", e: "badge:A:#dc2626", s: 5 }, { n: "Chelsea", e: "badge:Ch:#2563eb", s: 4 },
      { n: "Liverpool", e: "badge:Li:#dc2626", s: 5 }, { n: "Man City", e: "badge:Ma:#0ea5e9", s: 5 },
      { n: "Real Madrid", e: "badge:Re:#e2e8f0", s: 5 }, { n: "Barcelona", e: "badge:Ba:#7c3aed", s: 4 },
      { n: "Bayern Munich", e: "badge:Ba:#dc2626", s: 5 }, { n: "PSG", e: "badge:Pa:#1d4ed8", s: 4 },
      { n: "Bangladesh", e: "🇧🇩", s: 3 }, { n: "India", e: "🇮🇳", s: 3 },
    ],
  },
  tennis: {
    leagues: ["ATP Finals","WTA Finals","ATP 500","Australian Open","Dubai Championships"],
    teams: [
      { n: "Carlos Alcaraz", e: "🇪🇸", s: 5 }, { n: "Jannik Sinner", e: "🇮🇹", s: 5 },
      { n: "Novak Djokovic", e: "🇷🇸", s: 5 }, { n: "Daniil Medvedev", e: "🇷🇺", s: 4 },
      { n: "Iga Świątek", e: "🇵🇱", s: 5 }, { n: "Aryna Sabalenka", e: "🇧🇾", s: 5 },
      { n: "Holger Rune", e: "🇩🇰", s: 3 }, { n: "Félix Auger", e: "🇨🇦", s: 3 },
      { n: "Jessica Pegula", e: "🇺🇸", s: 4 }, { n: "Coco Gauff", e: "🇺🇸", s: 4 },
    ],
  },
  basketball: {
    leagues: ["NBA","Bangladesh Basketball League"],
    teams: [
      { n: "Lakers", e: "badge:La:#ca8a04", s: 4 }, { n: "Celtics", e: "badge:Ce:#059669", s: 5 },
      { n: "Warriors", e: "badge:Wa:#2563eb", s: 4 }, { n: "Nuggets", e: "badge:Nu:#92400e", s: 4 },
      { n: "Bucks", e: "badge:Bu:#059669", s: 4 }, { n: "Heat", e: "badge:He:#dc2626", s: 3 },
      { n: "Dhaka Gladiators", e: "badge:Gl:#dc2626", s: 3 }, { n: "Chattogram Titans", e: "badge:Ti:#2563eb", s: 3 },
    ],
  },
};

function fxOdds(sh: number, sa: number, draw: boolean, r: () => number) {
  const diff = sh - sa;
  const base = 1.9 - diff * 0.22 + (r() - 0.5) * 0.3;
  const h = Math.max(1.25, +base.toFixed(2));
  const a = Math.max(1.25, +(3.8 - h + (r() - 0.5) * 0.2).toFixed(2));
  const o: { h: number; d?: number; a: number } = { h, a };
  if (draw) o.d = +(2.6 + Math.abs(diff) * 0.35 + (r() - 0.5) * 0.4).toFixed(2);
  return o;
}
const FX_TIMES = ["4:00 PM","6:30 PM","8:00 PM","9:30 PM","1:30 PM","10:00 AM"];

function buildFixtures(): CasiMatch[] {
  const out: CasiMatch[] = [];
  const r = fxRng(20261013);
  let n = 0;
  const nid = (p: string) => `${p}${++n}`;

  // ---------- LIVE (curated, always on) ----------
  const liveDefs: CasiMatch[] = [
    { id: "L1", sport: "cricket", league: "Bangladesh Premier League", home: "Dhaka Dominators", away: "Cumilla Victorians", he: "badge:D:#dc2626", ae: "badge:Cu:#2563eb", time: "Live", day: 0, live: true, minute: "14.2 overs", hs: 142, as: 3, odds: { h: 1.85, a: 1.95 } },
    { id: "L2", sport: "cricket", league: "T20 International", home: "Bangladesh", away: "India", he: "🇧🇩", ae: "🇮🇳", time: "Live", day: 0, live: true, minute: "2nd innings • 8.4 overs", hs: 96, as: 2, odds: { h: 2.4, a: 1.55 } },
    { id: "L3", sport: "cricket", league: "Indian Premier League", home: "Mumbai Indians", away: "Chennai Super Kings", he: "badge:Mu:#2563eb", ae: "badge:Ch:#ca8a04", time: "Live", day: 0, live: true, minute: "11.5 overs", hs: 108, as: 1, odds: { h: 1.72, a: 2.1 } },
    { id: "L4", sport: "football", league: "English Premier League", home: "Arsenal", away: "Chelsea", he: "badge:A:#dc2626", ae: "badge:Ch:#2563eb", time: "Live", day: 0, live: true, minute: "67'", hs: 2, as: 1, odds: { h: 1.62, d: 3.8, a: 5.0 } },
    { id: "L5", sport: "football", league: "Bangladesh Premier League", home: "Dhaka Abahani", away: "Mohammedan SC", he: "badge:A:#2563eb", ae: "badge:Mo:#1f2937", time: "Live", day: 0, live: true, minute: "34'", hs: 1, as: 0, odds: { h: 1.7, d: 3.4, a: 4.6 } },
    { id: "L6", sport: "football", league: "La Liga", home: "Real Madrid", away: "Barcelona", he: "badge:Re:#e2e8f0", ae: "badge:Ba:#7c3aed", time: "Live", day: 0, live: true, minute: "55'", hs: 1, as: 1, odds: { h: 2.5, d: 2.9, a: 2.8 } },
    { id: "L7", sport: "tennis", league: "ATP Finals", home: "Carlos Alcaraz", away: "Jannik Sinner", he: "🇪🇸", ae: "🇮🇹", time: "Live", day: 0, live: true, minute: "Set 3", hs: 1, as: 1, odds: { h: 1.8, a: 2.0 } },
    { id: "L8", sport: "tennis", league: "WTA Finals", home: "Iga Świątek", away: "Aryna Sabalenka", he: "🇵🇱", ae: "🇧🇾", time: "Live", day: 0, live: true, minute: "Set 2", hs: 0, as: 1, odds: { h: 2.3, a: 1.62 } },
    { id: "L9", sport: "basketball", league: "NBA", home: "Lakers", away: "Celtics", he: "badge:La:#ca8a04", ae: "badge:Ce:#059669", time: "Live", day: 0, live: true, minute: "Q3 • 4:12", hs: 78, as: 82, odds: { h: 2.1, a: 1.72 } },
    { id: "L10", sport: "cricket", league: "Asia Cup", home: "Pakistan", away: "Sri Lanka", he: "🇵🇰", ae: "🇱🇰", time: "Live", day: 0, live: true, minute: "17.3 overs", hs: 156, as: 4, odds: { h: 1.66, a: 2.2 } },
    { id: "L11", sport: "football", league: "UEFA Champions League", home: "Bayern Munich", away: "PSG", he: "badge:Ba:#dc2626", ae: "badge:Pa:#1d4ed8", time: "Live", day: 0, live: true, minute: "78'", hs: 2, as: 2, odds: { h: 2.9, d: 2.7, a: 2.6 } },
    { id: "L12", sport: "basketball", league: "NBA", home: "Warriors", away: "Nuggets", he: "badge:Wa:#2563eb", ae: "badge:Nu:#92400e", time: "Live", day: 0, live: true, minute: "Q2 • 7:45", hs: 54, as: 49, odds: { h: 1.8, a: 2.0 } },
  ];
  out.push(...liveDefs);

  // ---------- UPCOMING: next 120 days (~3-4 months) ----------
  const sports: SportId[] = ["cricket", "football", "tennis", "basketball"];
  for (const sp of sports) {
    const { leagues, teams } = FX_TEAMS[sp];
    const count = sp === "cricket" ? 70 : sp === "football" ? 65 : sp === "tennis" ? 35 : sp === "basketball" ? 25 : 18;
    for (let i = 0; i < count; i++) {
      const day = Math.floor(r() * 271); // 0..270 (~9 months)
      const lg = leagues[Math.floor(r() * leagues.length)];
      const hi = Math.floor(r() * teams.length);
      let ai = Math.floor(r() * teams.length);
      if (ai === hi) ai = (ai + 3) % teams.length;
      const H = teams[hi], A = teams[ai];
      const tm = FX_TIMES[Math.floor(r() * FX_TIMES.length)];
      out.push({
        id: nid("u"), sport: sp, league: lg, home: H.n, away: A.n, he: H.e, ae: A.e,
        time: `${dayLabel(day)} • ${tm}`, day,
        odds: fxOdds(H.s, A.s, sp === "football", r),
      });
    }
  }

  // ---------- FINISHED: past 30 days ----------
  for (const sp of sports) {
    const { leagues, teams } = FX_TEAMS[sp];
    const count = sp === "cricket" ? 12 : sp === "football" ? 12 : sp === "tennis" ? 8 : 6;
    for (let i = 0; i < count; i++) {
      const day = -(1 + Math.floor(r() * 30));
      const lg = leagues[Math.floor(r() * leagues.length)];
      const hi = Math.floor(r() * teams.length);
      let ai = Math.floor(r() * teams.length);
      if (ai === hi) ai = (ai + 3) % teams.length;
      const H = teams[hi], A = teams[ai];
      const hw = r() < 0.5 + (H.s - A.s) * 0.08;
      let hs = 0, as = 0;
      if (sp === "cricket") { hs = 140 + Math.floor(r() * 70); as = hw ? hs - 5 - Math.floor(r() * 30) : hs + 5 + Math.floor(r() * 25); }
      else if (sp === "football") { hs = Math.floor(r() * 3.4); as = Math.floor(r() * 3.0); if (hw && hs <= as) hs = as + 1; if (!hw && as <= hs) as = hs + 1; }
      else if (sp === "tennis") { hs = 2; as = Math.floor(r() * 2); }
      else { hs = 95 + Math.floor(r() * 30); as = 92 + Math.floor(r() * 30); if (hw && hs <= as) hs = as + 3; if (!hw && as <= hs) as = hs + 3; }
      out.push({
        id: nid("f"), sport: sp, league: lg, home: H.n, away: A.n, he: H.e, ae: A.e,
        time: dayLabel(day), day, hs, as,
        odds: fxOdds(H.s, A.s, sp === "football", r),
      });
    }
  }
  return out;
}

export const MATCHES: CasiMatch[] = buildFixtures();
export const LIVE_MATCHES = MATCHES.filter((m) => m.live);
export const UPCOMING_MATCHES = MATCHES.filter((m) => !m.live && m.day >= 0).sort((a, b) => a.day - b.day);
export const FINISHED_MATCHES = MATCHES.filter((m) => m.day < 0).sort((a, b) => b.day - a.day);

/** Futures / outright betting markets. */
export const FUTURES: FutureMarket[] = [
  { id: "fu1", title: "ICC ODI World Cup 2027 — Champion", e: "🏆", ends: "November 2027", selections: [
    { name: "India", flag: "🇮🇳", odds: 3.4 }, { name: "Australia", flag: "🇦🇺", odds: 4.0 }, { name: "England", flag: "🇬🇧", odds: 5.5 },
    { name: "Pakistan", flag: "🇵🇰", odds: 7.0 }, { name: "New Zealand", flag: "🇳🇿", odds: 8.0 }, { name: "Bangladesh", flag: "🇧🇩", odds: 12.0 }] },
  { id: "fu2", title: "Bangladesh Premier League 2027 — Champion", e: "🏏", ends: "February 2027", selections: [
    { name: "Cumilla Victorians", flag: "🟦", odds: 4.5 }, { name: "Dhaka Dominators", flag: "🟥", odds: 5.0 },
    { name: "Rangpur Riders", flag: "🟨", odds: 5.5 }, { name: "Barishal Fortune", flag: "🟠", odds: 6.0 }, { name: "Sylhet Strikers", flag: "🟪", odds: 7.5 }] },
  { id: "fu3", title: "English Premier League 2026/27 — Champion", e: "⚽", ends: "May 2027", selections: [
    { name: "Man City", flag: "🩵", odds: 2.8 }, { name: "Arsenal", flag: "🔴", odds: 3.2 },
    { name: "Liverpool", flag: "🔴", odds: 4.5 }, { name: "Chelsea", flag: "🔵", odds: 9.0 }, { name: "Tottenham", flag: "⚪", odds: 15.0 }] },
  { id: "fu4", title: "UEFA Champions League 2027 — Winner", e: "⭐", ends: "June 2027", selections: [
    { name: "Real Madrid", flag: "⚪", odds: 5.0 }, { name: "Man City", flag: "🩵", odds: 5.5 },
    { name: "Bayern Munich", flag: "🔴", odds: 7.0 }, { name: "Barcelona", flag: "🔵", odds: 8.0 }, { name: "PSG", flag: "🔵", odds: 9.0 }] },
  { id: "fu5", title: "Asia Cup 2027 — Champion", e: "🏏", ends: "September 2027", selections: [
    { name: "India", flag: "🟧", odds: 2.6 }, { name: "Pakistan", flag: "🇵🇰", odds: 4.0 },
    { name: "Sri Lanka", flag: "🇱🇰", odds: 5.5 }, { name: "Bangladesh", flag: "🇧🇩", odds: 6.5 }, { name: "Afghanistan", flag: "🇦🇫", odds: 9.0 }] },
  { id: "fu6", title: "Australian Open 2027 (Men's Singles) — Champion", e: "🎾", ends: "January 2027", selections: [
    { name: "Carlos Alcaraz", flag: "🇪🇸", odds: 3.0 }, { name: "Jannik Sinner", flag: "🇮🇹", odds: 3.4 },
    { name: "Novak Djokovic", flag: "🇷🇸", odds: 5.0 }, { name: "Daniil Medvedev", flag: "🇷🇺", odds: 9.0 }] },
];

export interface CasiGame { id: string; n: string; e: string; cat: string; players: string; rtp: string; hot?: boolean }

export const SLOT_GAMES: CasiGame[] = [
  { id: "royal", n: "Royal Slots", e: "🎰", cat: "slots", players: "12.4K", rtp: "96.5%", hot: true },
  { id: "golden7", n: "Golden Seven", e: "7️⃣", cat: "slots", players: "8.1K", rtp: "96.2%" },
  { id: "fruit", n: "Fruit Frenzy", e: "🍒", cat: "slots", players: "6.7K", rtp: "95.8%", hot: true },
  { id: "diamond", n: "Diamond Rush", e: "💎", cat: "slots", players: "5.2K", rtp: "96.9%" },
  { id: "lucky", n: "Lucky Spin", e: "🍀", cat: "slots", players: "4.3K", rtp: "95.5%" },
  { id: "pharaoh", n: "Pharaoh's Gold", e: "🏺", cat: "slots", players: "3.9K", rtp: "96.1%" },
];

export const TABLE_GAMES: CasiGame[] = [
  { id: "roulette", n: "Roulette", e: "🎡", cat: "table", players: "9.3K", rtp: "97.3%", hot: true },
  { id: "blackjack", n: "Blackjack", e: "🂡", cat: "table", players: "7.8K", rtp: "99.4%", hot: true },
  { id: "baccarat", n: "Baccarat", e: "🃏", cat: "table", players: "6.1K", rtp: "98.9%" },
  { id: "poker", n: "Three-Card Poker", e: "♠️", cat: "table", players: "4.7K", rtp: "96.6%" },
  { id: "teenpatti", n: "Teen Patti", e: "🪔", cat: "desi", players: "11.2K", rtp: "97.1%", hot: true },
  { id: "andarbahar", n: "Andar Bahar", e: "🎴", cat: "desi", players: "8.9K", rtp: "96.8%", hot: true },
  { id: "dragontiger", n: "Dragon Tiger", e: "🐉", cat: "desi", players: "7.4K", rtp: "96.7%" },
];

export const CRASH_GAMES: CasiGame[] = [
  { id: "crash", n: "Crash", e: "📈", cat: "crash", players: "15.6K", rtp: "97.0%", hot: true },
  { id: "aviator", n: "Jet Flight", e: "✈️", cat: "crash", players: "18.2K", rtp: "97.0%", hot: true },
  { id: "dice", n: "Dice", e: "🎲", cat: "crash", players: "9.8K", rtp: "97.5%" },
  { id: "wheel", n: "Wheel of Fortune", e: "🎡", cat: "crash", players: "7.3K", rtp: "96.3%" },
];

export const LIVE_GAMES: CasiGame[] = [
  { id: "live-roulette", n: "Live Roulette", e: "🎥", cat: "live", players: "2.1K", rtp: "97.3%", hot: true },
  { id: "live-blackjack", n: "Live Blackjack", e: "🎥", cat: "live", players: "1.8K", rtp: "99.4%" },
  { id: "live-baccarat", n: "Live Baccarat", e: "🎥", cat: "live", players: "1.5K", rtp: "98.9%" },
  { id: "live-teenpatti", n: "Live Teen Patti", e: "🎥", cat: "live", players: "2.4K", rtp: "97.1%", hot: true },
  { id: "live-dragontiger", n: "Live Dragon Tiger", e: "🎥", cat: "live", players: "1.9K", rtp: "96.7%" },
  { id: "live-andarbahar", n: "Live Andar Bahar", e: "🎥", cat: "live", players: "1.6K", rtp: "96.8%" },
];

export const ALL_GAMES = [...SLOT_GAMES, ...TABLE_GAMES, ...CRASH_GAMES, ...LIVE_GAMES];

/* ==================== MASSIVE GAME CATALOG (generated) ====================
 * 2,200+ games across own-brand providers. Every game is playable through
 * its engine (slots / crash / dice / wheel / mines / plinko / hilo / cards)
 * with a unique theme, symbol set, gradient art and payout profile.
 * Deterministic generation — same catalog on every load. */

export interface CatalogGame {
  id: string;
  n: string;
  e: string;
  cat: string;        // slots | crash | dice | wheel | mines | plinko | hilo | table | desi | live
  engine: string;     // slots | crash | aviator | dice | wheel | mines | plinko | hilo | roulette | blackjack | baccarat | teenpatti | andarbahar | dragontiger
  provider: string;
  players: string;
  rtp: number;        // base RTP % (owner can override globally)
  hot?: boolean;
  grad: string;       // tailwind gradient classes for tile art
  syms: string[];     // symbol set for slot engine
  isNew?: boolean;
  cover?: string;
}

export const PROVIDERS = [
  "DigiPlay Originals", "Royal Gaming", "MegaWin Studio", "Golden Touch",
  "Nova Soft", "Tiger Games", "Lucky Spin Lab", "Padma Gaming",
  "Dhaka Play", "Spin House BD", "Gem Works", "Victory Lab",
  "Crown Gaming", "Thunder Play", "Fortune King", "Neon Star",
];

const GRADS = [
  "from-purple-600 via-indigo-700 to-slate-900", "from-rose-600 via-red-700 to-slate-900",
  "from-amber-500 via-orange-700 to-slate-900", "from-emerald-500 via-teal-700 to-slate-900",
  "from-sky-500 via-blue-800 to-slate-900", "from-fuchsia-600 via-purple-800 to-slate-900",
  "from-lime-500 via-green-700 to-slate-900", "from-yellow-500 via-amber-700 to-slate-900",
  "from-cyan-500 via-sky-800 to-slate-900", "from-pink-500 via-rose-800 to-slate-900",
  "from-violet-600 via-purple-900 to-black", "from-orange-500 via-red-800 to-slate-900",
];

/** Themed slot symbol sets — each theme gives the slot engine a unique look. */
const SLOT_THEMES: { name: string; syms: string[] }[] = [
  { name: "Fruit Garden", syms: ["🍒", "🍋", "🍇", "🍉", "🍓", "🔔", "⭐", "7️⃣"] },
  { name: "Gem Mine", syms: ["💎", "🔷", "🔶", "💠", "🔮", "✨", "👑", "💍"] },
  { name: "Egyptian Treasure", syms: ["🏺", "🐪", "🔺", "👁️", "🪲", "⚱️", "🌙", "👑"] },
  { name: "Dragon Kingdom", syms: ["🐉", "🔥", "🏮", "🧧", "🪭", "🎋", "💰", "🐲"] },
  { name: "Space Journey", syms: ["🚀", "🪐", "⭐", "🌙", "👽", "🛸", "☄️", "🔭"] },
  { name: "Under the Sea", syms: ["🐠", "🐙", "🦑", "🐚", "⚓", "🔱", "🦈", "🫧"] },
  { name: "Jungle Safari", syms: ["🦁", "🐘", "🦒", "🦓", "🐆", "🌴", "🦜", "🐒"] },
  { name: "Sweet World", syms: ["🍬", "🍭", "🧁", "🍩", "🍫", "🍦", "🍰", "🍯"] },
  { name: "Wild West", syms: ["🤠", "🐴", "🔫", "⭐", "🏜️", "🌵", "🥃", "💰"] },
  { name: "Viking Battle", syms: ["⚔️", "🛡️", "⛵", "🪓", "🐺", "⚡", "🏔️", "👑"] },
  { name: "Luxury Life", syms: ["💎", "🏎️", "⌚", "👜", "🥂", "💳", "🛥️", "👑"] },
  { name: "Japanese Garden", syms: ["🌸", "🎋", "🏯", "🎎", "🍵", "🪭", "🎏", "🌺"] },
  { name: "Magic World", syms: ["🔮", "🪄", "🧙", "🦉", "🌙", "⚗️", "📜", "✨"] },
  { name: "Pharaoh's Tomb", syms: ["⚱️", "🏺", "🐍", "☀️", "🔺", "👁️", "🪲", "💛"] },
  { name: "Crystal Cave", syms: ["💜", "💙", "💚", "💛", "🧡", "❤️", "🔮", "✨"] },
  { name: "Fire Mountain", syms: ["🌋", "🔥", "💥", "🪨", "🦖", "🌋", "☄️", "🌡️"] },
  { name: "Ice Kingdom", syms: ["❄️", "⛄", "🐧", "🧊", "🌨️", "🦌", "🐻‍❄️", "💙"] },
  { name: "Gold Mine", syms: ["⛏️", "💰", "🏆", "💛", "🪙", "🚂", "💎", "🔦"] },
  { name: "Rainbow Valley", syms: ["🌈", "🦄", "☁️", "⭐", "🍀", "🌟", "💫", "🎈"] },
  { name: "Circus Fair", syms: ["🎪", "🤹", "🎠", "🎡", "🍿", "🎈", "🥁", "🎭"] },
  { name: "Desert Expedition", syms: ["🏜️", "🐪", "🦂", "🌵", "☀️", "🧭", "💧", "🏺"] },
  { name: "Cyber City", syms: ["🤖", "🌆", "💾", "🔋", "🛸", "🎮", "📡", "💡"] },
  { name: "Royal Court", syms: ["👑", "🏰", "⚜️", "🛡️", "🍷", "🎺", "💂", "🗝️"] },
];

/** Gradient per slot theme — stage & tiles always match the game's world. */
const THEME_GRADS = [
  "from-lime-600 via-green-800 to-slate-900",      // Fruit Garden
  "from-violet-600 via-purple-900 to-slate-900",   // Gem Mine
  "from-amber-500 via-yellow-800 to-stone-900",     // Egyptian Treasure
  "from-red-600 via-rose-900 to-slate-900",         // Dragon Kingdom
  "from-indigo-600 via-blue-950 to-black",          // Space Journey
  "from-cyan-500 via-sky-800 to-slate-900",         // Under the Sea
  "from-emerald-600 via-green-900 to-slate-900",    // Jungle Safari
  "from-pink-500 via-rose-700 to-slate-900",        // Sweet World
  "from-orange-600 via-amber-900 to-stone-900",     // Wild West
  "from-slate-500 via-slate-800 to-slate-950",      // Viking Battle
  "from-yellow-500 via-amber-800 to-neutral-900",   // Luxury Life
  "from-rose-400 via-pink-800 to-slate-900",        // Japanese Garden
  "from-purple-600 via-indigo-950 to-black",        // Magic World
  "from-yellow-600 via-amber-900 to-stone-950",     // Pharaoh's Tomb
  "from-fuchsia-500 via-purple-900 to-slate-950",   // Crystal Cave
  "from-orange-500 via-red-900 to-slate-950",       // Fire Mountain
  "from-sky-400 via-cyan-800 to-slate-900",         // Ice Kingdom
  "from-amber-400 via-yellow-800 to-stone-900",     // Gold Mine
  "from-violet-500 via-fuchsia-800 to-slate-900",   // Rainbow Valley
  "from-red-500 via-rose-900 to-slate-950",         // Circus Fair
];

const SLOT_PREFIX = ["Mega", "Royal", "Super", "Ultra", "Grand", "Lucky", "Golden", "Magic", "Wild", "Crazy", "Big", "Premium"];
const SLOT_SUFFIX = ["Reels", "Spin", "Jackpot", "Win", "Fortune", "Bonanza", "Rush", "Deluxe", "Mania", "World"];

function seededNum(seed: string, mod: number): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h % mod;
}

function buildCatalog(): CatalogGame[] {
  const out: CatalogGame[] = [];
  // --- Slots: 12 prefixes × 23 themes × 10 suffixes = 2,760 combos → take 2,070
  let idx = 0;
  for (const pre of SLOT_PREFIX) {
    for (let t = 0; t < SLOT_THEMES.length; t++) {
      for (const suf of SLOT_SUFFIX) {
        idx++;
        if (idx % 4 === 0) continue; // thin out to ~1,800
        const theme = SLOT_THEMES[t];
        const id = `slot-${idx}`;
        out.push({
          id,
          n: `${pre} ${theme.name} ${suf}`,
          e: theme.syms[0],
          cat: "slots",
          engine: "slots",
          provider: PROVIDERS[seededNum(id, PROVIDERS.length)],
          players: `${(seededNum(id + "p", 180) / 10 + 0.3).toFixed(1)}K`,
          rtp: 94 + seededNum(id + "r", 50) / 10,
          hot: seededNum(id + "h", 12) === 0,
          grad: THEME_GRADS[t],
          isNew: seededNum(id + "nw", 100) < 9,
          syms: theme.syms,
        });
      }
    }
  }
  // --- Crash family: 60 variants
  const crashNames = ["Rocket", "Jet", "Balloon", "Bull", "Moon", "Plane", "Bike", "Train", "Helicopter", "Speed Boat"];
  const crashStyles = ["Crash", "Flight", "Ride", "Run", "X"];
  let ci = 0;
  for (const cn of crashNames) {
    for (const cs of crashStyles) {
      ci++;
      const id = `crash-${ci}`;
      out.push({
        id, n: `${cn} ${cs}`, e: cn === "Plane" || cn === "Jet" ? "✈️" : "🚀",
        cat: "crash", engine: ci % 3 === 0 ? "aviator" : "crash",
        provider: PROVIDERS[seededNum(id, PROVIDERS.length)],
        players: `${(seededNum(id + "p", 250) / 10 + 0.5).toFixed(1)}K`,
        rtp: 96 + seededNum(id + "r", 30) / 10, hot: ci <= 6,
        grad: GRADS[seededNum(id + "g", GRADS.length)], syms: ["🚀"],
      isNew: seededNum(id + "nw", 100) < 9,
      });
    }
  }
  // --- Mines: 40 variants
  const mineNames = ["Gem", "Gold", "Bomb", "Diamond", "Treasure", "Crystal", "Coal", "Ruby"];
  let mi = 0;
  for (const mn of mineNames) {
    for (let v = 1; v <= 5; v++) {
      mi++;
      const id = `mines-${mi}`;
      out.push({
        id, n: `${mn} Mines ${v > 1 ? bn(v) : ""}`.trim(), e: "💣",
        cat: "mines", engine: "mines",
        provider: PROVIDERS[seededNum(id, PROVIDERS.length)],
        players: `${(seededNum(id + "p", 120) / 10 + 0.2).toFixed(1)}K`,
        rtp: 96 + seededNum(id + "r", 30) / 10, hot: mi <= 4,
        grad: GRADS[seededNum(id + "g", GRADS.length)], syms: ["💣", "💎"],
      isNew: seededNum(id + "nw", 100) < 9,
      });
    }
  }
  // --- Plinko: 24 variants
  let pi = 0;
  for (const pn of ["Golden", "Neon", "Royal", "Casual", "Turbo", "Mega"]) {
    for (let v = 1; v <= 4; v++) {
      pi++;
      const id = `plinko-${pi}`;
      out.push({
        id, n: `${pn} Plinko ${v > 1 ? bn(v) : ""}`.trim(), e: "🔵",
        cat: "plinko", engine: "plinko",
        provider: PROVIDERS[seededNum(id, PROVIDERS.length)],
        players: `${(seededNum(id + "p", 90) / 10 + 0.2).toFixed(1)}K`,
        rtp: 95 + seededNum(id + "r", 40) / 10, hot: pi <= 3,
        grad: GRADS[seededNum(id + "g", GRADS.length)], syms: ["🔵"],
      isNew: seededNum(id + "nw", 100) < 9,
      });
    }
  }
  // --- Dice: 30 variants
  let di = 0;
  for (const dn of ["Lucky", "Golden", "Double", "Royal", "Speed", "Magic"]) {
    for (let v = 1; v <= 5; v++) {
      di++;
      const id = `dice-${di}`;
      out.push({
        id, n: `${dn} Dice ${v > 1 ? bn(v) : ""}`.trim(), e: "🎲",
        cat: "dice", engine: "dice",
        provider: PROVIDERS[seededNum(id, PROVIDERS.length)],
        players: `${(seededNum(id + "p", 100) / 10 + 0.2).toFixed(1)}K`,
        rtp: 96 + seededNum(id + "r", 30) / 10, hot: di <= 3,
        grad: GRADS[seededNum(id + "g", GRADS.length)], syms: ["🎲"],
      isNew: seededNum(id + "nw", 100) < 9,
      });
    }
  }
  // --- Wheel: 24 variants
  let wi = 0;
  for (const wn of ["Lucky", "Golden", "Money", "Mega", "Royal", "Spin"]) {
    for (let v = 1; v <= 4; v++) {
      wi++;
      const id = `wheel-${wi}`;
      out.push({
        id, n: `${wn} Wheel ${v > 1 ? bn(v) : ""}`.trim(), e: "🎡",
        cat: "wheel", engine: "wheel",
        provider: PROVIDERS[seededNum(id, PROVIDERS.length)],
        players: `${(seededNum(id + "p", 80) / 10 + 0.2).toFixed(1)}K`,
        rtp: 95 + seededNum(id + "r", 40) / 10, hot: wi <= 3,
        grad: GRADS[seededNum(id + "g", GRADS.length)], syms: ["🎡"],
      isNew: seededNum(id + "nw", 100) < 9,
      });
    }
  }
  // --- HiLo cards: 18 variants
  let hi = 0;
  for (const hn of ["Royal", "Speed", "Golden", "Classic", "Turbo", "VIP"]) {
    for (let v = 1; v <= 3; v++) {
      hi++;
      const id = `hilo-${hi}`;
      out.push({
        id, n: `${hn} Hi-Lo ${v > 1 ? bn(v) : ""}`.trim(), e: "🃏",
        cat: "hilo", engine: "hilo",
        provider: PROVIDERS[seededNum(id, PROVIDERS.length)],
        players: `${(seededNum(id + "p", 60) / 10 + 0.2).toFixed(1)}K`,
        rtp: 96 + seededNum(id + "r", 30) / 10, hot: hi <= 2,
        grad: GRADS[seededNum(id + "g", GRADS.length)], syms: ["🃏"],
      isNew: seededNum(id + "nw", 100) < 9,
      });
    }
  }
  // Deterministic interleave — neighbouring lobby tiles never look the same:
  // stride-shuffle spreads themes/providers/gradients evenly through the list.
  const shuffled: CatalogGame[] = [];
  const stride = 613; // coprime-ish with catalog size
  for (let i = 0; i < out.length; i++) shuffled.push(out[(i * stride) % out.length]);
  return shuffled;
}

const _CATALOG = buildCatalog();
// ★ Pinned #1 — Super Ace (own IP flagship card slot)
_CATALOG.unshift({
  id: "superace-1", n: "Super Ace", e: "🂡", cat: "slots", engine: "superace",
  provider: "DigiPlay Originals", players: "32.8K", rtp: 96.8, hot: true, isNew: true,
  grad: "from-amber-500 via-yellow-600 to-orange-800",
  syms: ["🂡", "🃏", "👑", "💎", "♠️", "♥️", "♣️", "♦️"],
});
// AI covers — matched to themes
const COVER_MAP: [string, string][] = [
  ["superace-1", "covers/superace.webp"],
  ["Fruit Garden", "covers/fruit.webp"],
  ["Fire Mountain", "covers/volcano.webp"],
  ["Gem Mine", "covers/gems.webp"],
  ["Egyptian Treasure", "covers/egypt.webp"],
  ["Dragon Kingdom", "covers/dragon.webp"],
  ["Gold Mine", "covers/gold.webp"],
  ["Magic World", "covers/magic.webp"],
];
for (const [key, file] of COVER_MAP) {
  const g = key === "superace-1"
    ? _CATALOG.find((x) => x.id === "superace-1")
    : _CATALOG.find((x) => x.engine === "slots" && x.n.includes(key) && !x.cover);
  if (g) g.cover = `/demo-img/${file}`;
}
export const GAME_CATALOG: CatalogGame[] = _CATALOG;
export const CATALOG_COUNT = GAME_CATALOG.length;

/** Find a catalog game by id. */
export function catalogGame(id: string): CatalogGame | undefined {
  return GAME_CATALOG.find((g) => g.id === id);
}

/** Where a game links to. */
export function catalogHref(g: CatalogGame): string {
  switch (g.engine) {
    case "slots": return `/slots/${g.id}`;
    case "crash": return `/crash`;
    case "aviator": return `/aviator`;
    case "dice": return `/dice`;
    case "wheel": return `/wheel`;
    case "mines": return `/mines`;
    case "plinko": return `/plinko`;
    case "hilo": return `/hilo`;
    case "superace": return `/superace`;
    default: return `/casino`;
  }
}

/**
 * Owner casino config — RTP & bet limits.
 * Demo mode: store.custom. Client mode: /api/client/{slug}/settings.
 * RTP = return-to-player % the owner sets (win chance control).
 */
export function useCasinoConfig(): { rtp: number; minBet: number; maxBet: number } {
  const { store, clientSlug } = useDemo();
  const [cfg, setCfg] = useState<{ rtp: number; minBet: number; maxBet: number }>({ rtp: 96, minBet: 10, maxBet: 50000 });
  useEffect(() => {
    const fromCustom = () => {
      const r = Number((store.custom as any)?.casinoRtp);
      const mn = Number((store.custom as any)?.casinoMinBet);
      const mx = Number((store.custom as any)?.casinoMaxBet);
      setCfg({
        rtp: r >= 50 && r <= 99.9 ? r : 96,
        minBet: mn >= 1 ? mn : 10,
        maxBet: mx >= 100 ? mx : 50000,
      });
    };
    if (clientSlug) {
      fetch(`/api/client/${clientSlug}/settings`)
        .then((r) => r.json())
        .then((d) => {
          const s = d.settings || {};
          const r = Number(s.casino_rtp);
          const mn = Number(s.casino_min_bet);
          const mx = Number(s.casino_max_bet);
          if (r >= 50 && r <= 99.9) setCfg((c) => ({ ...c, rtp: r }));
          if (mn >= 1) setCfg((c) => ({ ...c, minBet: mn }));
          if (mx >= 100) setCfg((c) => ({ ...c, maxBet: mx }));
          if (!(r >= 50)) fromCustom();
        })
        .catch(fromCustom);
    } else {
      fromCustom();
    }
  }, [clientSlug, store.custom]);
  return cfg;
}

export const PROMOS = [
  { id: "p1", t: "🎁 100% Welcome Bonus", e: "🎁", d: "100% bonus on your first deposit — up to 5,000 credits!", body: "Special offer for new players. Get a 100% bonus on your first deposit — up to 5,000 credits. Deposit at least 500 credits to claim the bonus. Bonus credits can be withdrawn after wagering 10x. The offer is valid for 7 days after opening your account." },
  { id: "p2", t: "💸 Weekly Cashback 10%", e: "💸", d: "10% of net losses back — every Monday!", body: "If you have a net loss at the casino during the week, you get 10% cashback every Monday morning. Up to 10,000 credits. No wagering requirement — you can withdraw directly." },
  { id: "p3", t: "⚽ Sports Booster", e: "⚽", d: "Up to 25% extra winnings on multi bets!", body: "Extra bonus when a multi bet with 5 or more selections wins: 5% for 5 selections, 15% for 8 selections, 25% extra for 12+ selections." },
  { id: "p4", t: "👑 VIP Reload Bonus", e: "👑", d: "20% daily reload for VIP members!", body: "Gold and higher VIP members get a 20% reload bonus on their first deposit each day — up to 3,000 credits." },
  { id: "p5", t: "🎰 Free Spin Friday", e: "🎰", d: "50 free spins every Friday!", body: "Deposit 1,000 credits on Friday and get 50 free spins on Royal Slots. Free-spin winnings are withdrawable after 5x wagering." },
];

export const TOURNAMENTS = [
  { id: "t1", t: "🏆 Weekly Slot Race", e: "🏆", prize: 100000, ends: "2 days left", players: 1243, desc: "Ranking based on the week's highest slot wins. The top 50 players win prizes.", body: "Collect points by playing Royal Slots, Golden Seven and Fruit Frenzy. 1 point per 100 credits won. Prizes: 1st — 25,000 credits, 2nd — 15,000 credits, 3rd — 10,000 credits, 4th–10th — 5,000 credits, 11th–50th — 1,000 credits." },
  { id: "t2", t: "♠️ Poker Championship", e: "♠️", prize: 50000, ends: "5 days left", players: 486, desc: "A battle of the best in Three-Card Poker.", body: "Qualifier rounds every day at 9 PM. Final on Sunday at 10 PM. Entry fee 500 credits — the winner gets 20,000 credits!" },
  { id: "t3", t: "✈️ Jet Flight Masters", e: "✈️", prize: 75000, ends: "1 day left", players: 2108, desc: "A competition for cashing out at the highest multiplier.", body: "Cash out at 10x or higher in Jet Flight to enter. The 30 players with the highest multipliers win prizes." },
];

export const BLOG_POSTS = [
  { id: "b1", t: "5 Blackjack Winning Strategies", e: "🂡", c: "Strategy", time: "2 hours ago", body: "Blackjack is not just a game of luck — with the right strategy the house edge can be brought down to 0.5%. 1) Always split 8s and Aces. 2) Stand on 12+ when the dealer shows 6 or less. 3) Always double down on 11. 4) Never take insurance. 5) Play to a budget — don't raise your bets in a rush after a loss." },
  { id: "b2", t: "Bangladesh vs India: Match Preview", e: "🏏", c: "Preview", time: "5 hours ago", body: "Bangladesh face India in the second match of the T20 series. In the first match Bangladesh's bowlers were excellent but batting let them down. The toss matters today — dew makes batting second advantageous. Our analysis makes India favourites (1.55), but Bangladesh's home conditions (2.40) could offer value." },
  { id: "b3", t: "Bankroll Management in Crash Games", e: "📈", c: "Strategy", time: "1 day ago", body: "The key to lasting in Crash/Jet Flight is bankroll management. Never bet more than 2% of your total balance per bet. Set auto cash-out at 1.5x — small but regular wins avoid big losses. Never play with a 'one big win will recover everything' mindset." },
  { id: "b4", t: "Teen Patti: Hand Rankings Guide", e: "🪔", c: "Guide", time: "2 days ago", body: "Hand strength in Teen Patti: Trio (three of a kind) > Pure Sequence > Sequence > Colour > Pair > High Card. Playing blind is risky but puts opponents under pressure. Remember — folding without a good hand is the smart move." },
];

export const FAQS = [
  { q: "Is this a real-money site?", a: "No. This is a demo website — all balances, bets and wins are virtual. No real money is deposited or withdrawn." },
  { q: "What do I need to open an account?", a: "Just a name, mobile number and password. Sign up and you get a 5,000-credit demo bonus." },
  { q: "How do I deposit?", a: "From the wallet page, select bKash/Nagad/Rocket and enter a demo TrxID — the balance is added (demo)." },
  { q: "How do I place a bet?", a: "Click the odds of any match to add it to the bet slip. Enter a stake and press 'Confirm bet'." },
  { q: "How do I withdraw winnings?", a: "In the demo, requesting from the withdraw page immediately deducts the balance and shows 'Processing'." },
  { q: "What do odds mean?", a: "Odds of 2.00 mean a 100-credit bet returns 200 credits if it wins (100 profit). The lower the odds, the higher the chance of winning." },
  { q: "What is live betting?", a: "Betting on a match in progress. Odds change with the state of play — you need to decide quickly." },
  { q: "What is the VIP programme?", a: "Regular players collect points to move up Bronze → Silver → Gold → Platinum → Diamond levels. Higher levels get more cashback and bonuses." },
];

/* ============================== helpers ============================== */

function readLS<T>(k: string, fb: T): T {
  try { const v = localStorage.getItem(k); return v ? (JSON.parse(v) as T) : fb; } catch { return fb; }
}
function writeLS(k: string, v: unknown) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }

export interface SlipSel { matchId: string; match: string; selection: string; odds: number; live?: boolean }

export function useBetSlip() {
  const { def, clientSlug } = useDemo();
  const ns = clientSlug ? `client:${clientSlug}` : `dmsite:${def.slug}`;
  const key = `${ns}:betslip`;
  const [slip, setSlip] = useState<SlipSel[]>(() => readLS<SlipSel[]>(key, []));
  useEffect(() => {
    const h = () => setSlip(readLS<SlipSel[]>(key, []));
    window.addEventListener("betslip-changed", h);
    return () => window.removeEventListener("betslip-changed", h);
  }, [key]);
  const save = (s: SlipSel[]) => { writeLS(key, s); window.dispatchEvent(new Event("betslip-changed")); };
  return {
    slip,
    count: slip.length,
    add: (sel: SlipSel) => { if (!slip.find((x) => x.matchId === sel.matchId && x.selection === sel.selection)) save([...slip, sel]); },
    remove: (i: number) => save(slip.filter((_, x) => x !== i)),
    clear: () => save([]),
  };
}

export function useSkin() {
  const { def, base, store } = useDemo();
  return {
    def, base, store,
    gold: GOLD,
    accent: def.accent || GOLD,
    card: "rounded-2xl border border-[#f5c518]/15 bg-[#101828]/90",
    card2: "rounded-2xl border border-white/10 bg-white/[0.04]",
    sub: "text-slate-400",
    input: "w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white outline-none placeholder:text-slate-500",
  };
}

export function fmtTime(ts: number) {
  const d = new Date(ts);
  return `${d.getDate()}/${d.getMonth() + 1} ${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/** Balance pill shown on game pages. */
function BalanceBar() {
  const { store, base } = useSkin();
  return (
    <div className="mb-4 flex items-center justify-between rounded-2xl border border-[#f5c518]/25 bg-gradient-to-r from-[#1a1405] to-[#101828] px-4 py-3">
      <div>
        <p className="text-[11px] text-slate-400">💰 Balance</p>
        <p className="text-xl font-black text-[#f5c518]">{money(store.wallet)}</p>
      </div>
      <Link href={`${base}/deposit`} className="rounded-xl bg-[#f5c518] px-4 py-2 text-sm font-black text-black">
        ＋ Deposit
      </Link>
    </div>
  );
}

/** Odds button — adds selection to bet slip. flash: 1 = odds rose (green), -1 = dropped (red). */
export function OddsBtn({ match, label, odds, small, flash }: { match: CasiMatch; label: string; odds: number; small?: boolean; flash?: number }) {
  const { add } = useBetSlip();
  const [added, setAdded] = useState(false);
  return (
    <button
      onClick={() => { add({ matchId: match.id, match: `${match.home} vs ${match.away}`, selection: label, odds, live: match.live }); setAdded(true); setTimeout(() => setAdded(false), 900); }}
      className={`flex items-center justify-center gap-1 rounded-xl border font-black transition active:scale-95 ${small ? "px-2.5 py-1.5 text-[11px]" : "px-3 py-2 text-xs"} ${added ? "border-emerald-400 bg-emerald-500/20 text-emerald-300" : flash === 1 ? "border-emerald-400/60 bg-emerald-500/15 text-emerald-200" : flash === -1 ? "border-red-400/60 bg-red-500/15 text-red-200" : "border-[#f5c518]/30 bg-[#f5c518]/10 text-[#f5c518] hover:bg-[#f5c518]/20"}`}
    >
      {added ? "✓ Added" : (<>{flash === 1 && <span className="text-[9px]">▲</span>}{flash === -1 && <span className="text-[9px]">▼</span>}{label} {bn(odds.toFixed(2))}</>)}
    </button>
  );
}

/** Ticked live match — odds + score animate in real time. */
export interface TickedMatch extends CasiMatch { dirH: number; dirD: number; dirA: number }

const LEAGUE_GRAD: Record<string, string> = {};
function leagueGrad(league: string): string {
  if (!LEAGUE_GRAD[league]) {
    const grads = ["from-violet-900/60 via-[#141b2e] to-[#0b1120]", "from-emerald-900/60 via-[#141b2e] to-[#0b1120]", "from-amber-900/60 via-[#141b2e] to-[#0b1120]", "from-sky-900/60 via-[#141b2e] to-[#0b1120]", "from-rose-900/60 via-[#141b2e] to-[#0b1120]", "from-indigo-900/60 via-[#141b2e] to-[#0b1120]"];
    let h = 0; for (let i = 0; i < league.length; i++) h = (h * 31 + league.charCodeAt(i)) >>> 0;
    LEAGUE_GRAD[league] = grads[h % grads.length];
  }
  return LEAGUE_GRAD[league];
}

export function scoreLine(m: CasiMatch): string {
  if (m.hs === undefined || m.as === undefined) return "";
  if (m.sport === "cricket") return `${bn(m.hs)}/${bn(m.as)}`;
  if (m.sport === "tennis") return `${bn(m.hs)} - ${bn(m.as)} sets`;
  return `${bn(m.hs)} - ${bn(m.as)}`;
}

/** Unique match card: league gradient header, live pulse, animated odds. */
export function MatchCard({ m, ticked, livePulse }: { m: CasiMatch; ticked?: TickedMatch; livePulse?: boolean }) {
  const { base } = useSkin();
  const t = ticked ?? { ...m, dirH: 0, dirD: 0, dirA: 0 };
  const finished = m.day < 0;
  const hw = finished && m.hs !== undefined && m.as !== undefined && (m.sport === "cricket" ? m.hs > m.as : m.hs > m.as);
  return (
    <div className={`overflow-hidden rounded-2xl border bg-gradient-to-br ${leagueGrad(m.league)} ${t.live ? "border-red-500/40 shadow-[0_0_24px_rgba(239,68,68,0.12)]" : "border-[#f5c518]/15"}`}>
      {/* header */}
      <div className="flex items-center justify-between gap-2 bg-black/30 px-3 py-1.5">
        <span className="truncate text-[10px] font-bold uppercase tracking-wide text-slate-300">{sportIcon(m.sport)} {m.league}</span>
        {t.live ? (
          <span className={`flex shrink-0 items-center gap-1 rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-black text-red-400 ring-1 ring-red-500/40 ${livePulse ? "animate-pulse" : ""}`}>
            <span className="h-1.5 w-1.5 rounded-full bg-red-500" /> Live • {m.minute}
          </span>
        ) : finished ? (
          <span className="shrink-0 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold text-slate-300">Finished</span>
        ) : (
          <span className="shrink-0 text-[10px] font-bold text-slate-400">🕐 {m.time}</span>
        )}
      </div>
      {/* teams */}
      <Link href={`${base}/match/${m.id}`} className="block px-3.5 pt-2.5">
        <div className="flex items-center justify-between gap-2">
          <span className={`flex min-w-0 items-center gap-2 text-sm font-black ${finished && hw ? "text-[#f5c518]" : "text-white"}`}>
            <TeamEmblem e={m.he} /><span className="truncate">{m.home}</span>{finished && hw && <span>🏅</span>}
          </span>
          {(t.live || finished) && <b className="shrink-0 text-lg font-black text-[#f5c518] tabular-nums">{scoreLine(t)}</b>}
        </div>
        <div className="mt-1.5 flex items-center justify-between gap-2">
          <span className={`flex min-w-0 items-center gap-2 text-sm font-black ${finished && !hw ? "text-[#f5c518]" : "text-white"}`}>
            <TeamEmblem e={m.ae} /><span className="truncate">{m.away}</span>{finished && !hw && m.hs !== m.as && <span>🏅</span>}
          </span>
          {(t.live || finished) && m.sport === "tennis" && <span className="shrink-0 text-[10px] text-slate-400">{m.minute}</span>}
        </div>
      </Link>
      {/* odds */}
      {!finished && (
        <div className="flex items-center gap-1.5 px-3 pb-3 pt-2.5" onClick={(e) => e.stopPropagation()}>
          <OddsBtn match={t} label="1" odds={t.odds.h} small flash={t.dirH} />
          {t.odds.d !== undefined && <OddsBtn match={t} label="X" odds={t.odds.d} small flash={t.dirD} />}
          <OddsBtn match={t} label="2" odds={t.odds.a} small flash={t.dirA} />
          <Link href={`${base}/match/${m.id}`} className="ml-auto rounded-lg px-2 py-1 text-[11px] font-bold text-slate-400 hover:text-white">
            +{bn(m.sport === "football" ? 24 : 18)} markets →
          </Link>
        </div>
      )}
      {finished && (
        <div className="px-3 pb-3 pt-1">
          <p className="text-[11px] font-bold text-slate-400">✅ Result: <b className="text-white">{scoreLine(m)}</b> — {m.hs === m.as ? "Draw" : hw ? `${m.home} won` : `${m.away} won`}</p>
        </div>
      )}
    </div>
  );
}

function sportIcon(sport: SportId): string {
  return sport === "cricket" ? "🏏" : sport === "football" ? "⚽" : sport === "tennis" ? "🎾" : "🏀";
}

/** Team emblem: national teams show real flags (🇧🇩), clubs show a colored letter badge. e = "badge:D:#dc2626" for clubs. */
export function TeamEmblem({ e, size = "md" }: { e: string; size?: "sm" | "md" | "lg" | "xl" }) {
  const cls = size === "xl" ? "text-4xl" : size === "lg" ? "text-3xl" : size === "md" ? "text-2xl" : "text-lg";
  if (e.startsWith("badge:")) {
    const [, letter, color] = e.split(":");
    const box = size === "xl" ? "h-14 w-14 text-xl" : size === "lg" ? "h-11 w-11 text-base" : size === "md" ? "h-9 w-9 text-sm" : "h-7 w-7 text-[11px]";
    return (
      <span className={`grid shrink-0 place-items-center rounded-full font-black text-white ring-2 ring-white/25 shadow-lg ${box}`} style={{ background: `linear-gradient(135deg, ${color}, #0b1120 130%)` }}>
        {letter}
      </span>
    );
  }
  return <span className={`shrink-0 drop-shadow ${cls}`}>{e}</span>;
}

export function gameHref(g: CasiGame): string {
  if (g.cat === "slots") return `/casino/slots/${g.id}`;
  if (g.cat === "live") return `/casino/live/${g.id}`;
  if (g.cat === "table") return `/casino/table/${g.id}`;
  if (g.cat === "desi") return `/casino/desi/${g.id}`;
  return `/casino/crash/${g.id}`;
}

export function GameCard({ g }: { g: CasiGame }) {
  const { base } = useSkin();
  return (
    <Link href={`${base}${gameHref(g)}`} className="group relative overflow-hidden rounded-2xl border border-[#f5c518]/15 bg-gradient-to-br from-[#141b2e] to-[#0b1120] p-4 text-center transition hover:border-[#f5c518]/50 hover:shadow-[0_0_20px_rgba(245,197,24,0.15)]">
      {g.hot && <span className="absolute right-2 top-2 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-black text-white">🔥 Hot</span>}
      <p className="text-5xl transition group-hover:scale-110">{g.e}</p>
      <p className="mt-2 text-sm font-black">{g.n}</p>
      <p className="mt-1 text-[11px] text-slate-400">👥 {g.players} • RTP {g.rtp}</p>
      <span className="mt-2 inline-block rounded-lg bg-[#f5c518] px-4 py-1 text-xs font-black text-black">▶️ Play</span>
    </Link>
  );
}

export function GameShell({ title, emoji, children, rtp }: { title: string; emoji: string; children: React.ReactNode; rtp?: string }) {
  const { base } = useSkin();
  return (
    <Page narrow>
      <Back href={`${base}/casino`} label="Casino lobby" />
      <BalanceBar />
      <div className="rounded-3xl border border-[#f5c518]/25 bg-gradient-to-b from-[#141b2e] to-[#0b1120] p-5">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-black">{emoji} {title}</h1>
          {rtp && <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-[11px] font-bold text-emerald-300">RTP {rtp}</span>}
        </div>
        <div className="mt-4">{children}</div>
      </div>
      <p className="mt-3 text-center text-[11px] text-slate-500">🎮 Demo game — play with a virtual balance, not real money</p>
    </Page>
  );
}

/** Bet amount selector chips. */
export function BetChips({ bet, setBet }: { bet: number; setBet: (n: number) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {[10, 50, 100, 500, 1000].map((v) => (
        <button key={v} onClick={() => setBet(v)}
          className={`rounded-lg px-3 py-1.5 text-xs font-black transition ${bet === v ? "bg-[#f5c518] text-black" : "bg-white/10 text-slate-300 hover:bg-white/15"}`}>
          {bn(v)}
        </button>
      ))}
    </div>
  );
}

/** Record a finished game round: debit already done via payWithWallet by caller. */
export function useGameRound(gameName: string) {
  const { store } = useSkin();
  return (bet: number, win: number) => {
    if (win > 0) store.topUp(win);
    store.placeGame({ game: gameName, bet, win });
  };
}

/* card helpers */
const SUITS = ["♠", "♥", "♦", "♣"];
const RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
export const rankVal = (r: string) => (r === "A" ? 14 : r === "K" ? 13 : r === "Q" ? 12 : r === "J" ? 11 : parseInt(r));
export function drawCard(used: Set<string>): string {
  for (let i = 0; i < 100; i++) {
    const c = RANKS[Math.floor(Math.random() * 13)] + SUITS[Math.floor(Math.random() * 4)];
    if (!used.has(c)) { used.add(c); return c; }
  }
  const c = RANKS[Math.floor(Math.random() * 13)] + SUITS[Math.floor(Math.random() * 4)];
  used.add(c); return c;
}
export function CardView({ c, small }: { c: string; small?: boolean }) {
  const red = c.includes("♥") || c.includes("♦");
  return (
    <span className={`inline-flex items-center justify-center rounded-lg border bg-white font-black ${red ? "text-red-600" : "text-slate-900"} ${small ? "h-10 w-8 text-sm" : "h-14 w-11 text-lg"}`}>
      {c}
    </span>
  );
}

/* ============================== SPORTS ============================== */
