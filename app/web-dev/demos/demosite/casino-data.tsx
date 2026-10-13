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
import { toBnDigits } from "@/lib/format";
import { useDemo } from "./store";
import { Back, Empty, Field, Page, SectionTitle } from "./ui";

export const bn = (n: number | string) => toBnDigits(String(n));
export const money = (n: number) => `${toBnDigits(Math.round(n).toLocaleString("en-IN"))} টাকা`;
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
  /** days from today: negative = finished (ফলাফল), 0 = today, positive = upcoming */
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
  { id: "cricket", n: "ক্রিকেট", e: "🏏" },
  { id: "football", n: "ফুটবল", e: "⚽" },
  { id: "tennis", n: "টেনিস", e: "🎾" },
  { id: "basketball", n: "বাস্কেটবল", e: "🏀" },
];

export const sportName = (id: SportId) => SPORTS.find((s) => s.id === id)?.n ?? id;

/** Deterministic fixture engine — 3-4 months of upcoming, 30 days of results, live now. */
function fxRng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const BN_MONTHS = ["জানুয়ারি","ফেব্রুয়ারি","মার্চ","এপ্রিল","মে","জুন","জুলাই","আগস্ট","সেপ্টেম্বর","অক্টোবর","নভেম্বর","ডিসেম্বর"];
export function dayLabel(day: number): string {
  if (day === 0) return "আজ";
  if (day === 1) return "আগামীকাল";
  if (day === -1) return "গতকাল";
  if (day < 0 && day >= -6) return `${bn(Math.abs(day))} দিন আগে`;
  const d = new Date(); d.setDate(d.getDate() + day);
  return `${bn(d.getDate())} ${BN_MONTHS[d.getMonth()]}`;
}

type Team = { n: string; e: string; s: number };
const FX_TEAMS: Record<SportId, { leagues: string[]; teams: Team[] }> = {
  cricket: {
    leagues: ["বাংলাদেশ প্রিমিয়ার লিগ","ইন্ডিয়ান প্রিমিয়ার লিগ","টি-টোয়েন্টি আন্তর্জাতিক","ওয়ানডে সিরিজ","টেস্ট সিরিজ","এশিয়া কাপ"],
    teams: [
      { n: "ঢাকা ডমিনেটর্স", e: "badge:ঢ:#dc2626", s: 4 }, { n: "কুমিল্লা ভিক্টোরিয়ান্স", e: "badge:কু:#2563eb", s: 5 },
      { n: "রংপুর রাইডার্স", e: "badge:রং:#ca8a04", s: 4 }, { n: "সিলেট স্ট্রাইকার্স", e: "badge:সি:#7c3aed", s: 3 },
      { n: "চট্টগ্রাম চ্যালেঞ্জার্স", e: "badge:চ:#0d9488", s: 3 }, { n: "খুলনা টাইগার্স", e: "badge:খু:#ea580c", s: 3 },
      { n: "বরিশাল ফরচুন", e: "badge:ব:#f97316", s: 4 }, { n: "বাংলাদেশ", e: "🇧🇩", s: 4 },
      { n: "ভারত", e: "🇮🇳", s: 5 }, { n: "পাকিস্তান", e: "🇵🇰", s: 4 },
      { n: "শ্রীলঙ্কা", e: "🇱🇰", s: 3 }, { n: "অস্ট্রেলিয়া", e: "🇦🇺", s: 5 },
      { n: "ইংল্যান্ড", e: "🇬🇧", s: 4 }, { n: "আফগানিস্তান", e: "🇦🇫", s: 3 },
      { n: "মুম্বাই ইন্ডিয়ান্স", e: "badge:মু:#2563eb", s: 5 }, { n: "চেন্নাই সুপার কিংস", e: "badge:চে:#ca8a04", s: 5 },
    ],
  },
  football: {
    leagues: ["বাংলাদেশ প্রিমিয়ার লিগ","ইংলিশ প্রিমিয়ার লিগ","লা লিগা","উয়েফা চ্যাম্পিয়ন্স লিগ","বুন্দেসলিগা"],
    teams: [
      { n: "ঢাকা আবাহনী", e: "badge:আ:#2563eb", s: 4 }, { n: "মোহামেডান SC", e: "badge:মো:#1f2937", s: 4 },
      { n: "বসুন্ধরা কিংস", e: "badge:ব:#7c3aed", s: 5 }, { n: "সাইফ স্পোর্টিং", e: "badge:সা:#ca8a04", s: 3 },
      { n: "চট্টগ্রাম আবাহনী", e: "badge:চ:#059669", s: 3 }, { n: "রহমতগঞ্জ", e: "badge:র:#dc2626", s: 2 },
      { n: "আর্সেনাল", e: "badge:আ:#dc2626", s: 5 }, { n: "চেলসি", e: "badge:চে:#2563eb", s: 4 },
      { n: "লিভারপুল", e: "badge:লি:#dc2626", s: 5 }, { n: "ম্যান সিটি", e: "badge:সি:#0ea5e9", s: 5 },
      { n: "রিয়াল মাদ্রিদ", e: "badge:রি:#e2e8f0", s: 5 }, { n: "বার্সেলোনা", e: "badge:বা:#7c3aed", s: 4 },
      { n: "বায়ার্ন মিউনিখ", e: "badge:বা:#dc2626", s: 5 }, { n: "পিএসজি", e: "badge:পি:#1d4ed8", s: 4 },
      { n: "বাংলাদেশ", e: "🇧🇩", s: 3 }, { n: "ভারত", e: "🇮🇳", s: 3 },
    ],
  },
  tennis: {
    leagues: ["এটিপি ফাইনালস","ডব্লিউটিএ ফাইনালস","এটিপি ৫০০","অস্ট্রেলিয়ান ওপেন","দুবাই চ্যাম্পিয়নশিপ"],
    teams: [
      { n: "কার্লোস আলকারাজ", e: "🇪🇸", s: 5 }, { n: "ইয়ানিক সিনার", e: "🇮🇹", s: 5 },
      { n: "নোভাক জোকোভিচ", e: "🇷🇸", s: 5 }, { n: "দানিল মেদভেদেভ", e: "🇷🇺", s: 4 },
      { n: "ইগা শিয়নতেক", e: "🇵🇱", s: 5 }, { n: "আরিনা সাবালেঙ্কা", e: "🇧🇾", s: 5 },
      { n: "হোলগার রুন", e: "🇩🇰", s: 3 }, { n: "ফেলিক্স ওজার", e: "🇨🇦", s: 3 },
      { n: "জেসিকা পেগুলা", e: "🇺🇸", s: 4 }, { n: "কোকো গফ", e: "🇺🇸", s: 4 },
    ],
  },
  basketball: {
    leagues: ["এনবিএ","বাংলাদেশ বাস্কেটবল লিগ"],
    teams: [
      { n: "লেকার্স", e: "badge:লে:#ca8a04", s: 4 }, { n: "সেল্টিক্স", e: "badge:সে:#059669", s: 5 },
      { n: "ওয়ারিয়র্স", e: "badge:ও:#2563eb", s: 4 }, { n: "নাগেটস", e: "badge:না:#92400e", s: 4 },
      { n: "বাক্স", e: "badge:বা:#059669", s: 4 }, { n: "হিট", e: "badge:হি:#dc2626", s: 3 },
      { n: "ঢাকা গ্ল্যাডিয়েটর্স", e: "badge:গ্ল:#dc2626", s: 3 }, { n: "চট্টগ্রাম টাইটান্স", e: "badge:টা:#2563eb", s: 3 },
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
const FX_TIMES = ["বিকাল ৪:০০","সন্ধ্যা ৬:৩০","রাত ৮:০০","রাত ৯:৩০","দুপুর ১:৩০","সকাল ১০:০০"];

function buildFixtures(): CasiMatch[] {
  const out: CasiMatch[] = [];
  const r = fxRng(20261013);
  let n = 0;
  const nid = (p: string) => `${p}${++n}`;

  // ---------- LIVE (curated, always on) ----------
  const liveDefs: CasiMatch[] = [
    { id: "L1", sport: "cricket", league: "বাংলাদেশ প্রিমিয়ার লিগ", home: "ঢাকা ডমিনেটর্স", away: "কুমিল্লা ভিক্টোরিয়ান্স", he: "badge:ঢ:#dc2626", ae: "badge:কু:#2563eb", time: "লাইভ", day: 0, live: true, minute: "১৪.২ ওভার", hs: 142, as: 3, odds: { h: 1.85, a: 1.95 } },
    { id: "L2", sport: "cricket", league: "টি-টোয়েন্টি আন্তর্জাতিক", home: "বাংলাদেশ", away: "ভারত", he: "🇧🇩", ae: "🇮🇳", time: "লাইভ", day: 0, live: true, minute: "২য় ইনিংস • ৮.৪ ওভার", hs: 96, as: 2, odds: { h: 2.4, a: 1.55 } },
    { id: "L3", sport: "cricket", league: "ইন্ডিয়ান প্রিমিয়ার লিগ", home: "মুম্বাই ইন্ডিয়ান্স", away: "চেন্নাই সুপার কিংস", he: "badge:মু:#2563eb", ae: "badge:চে:#ca8a04", time: "লাইভ", day: 0, live: true, minute: "১১.৫ ওভার", hs: 108, as: 1, odds: { h: 1.72, a: 2.1 } },
    { id: "L4", sport: "football", league: "ইংলিশ প্রিমিয়ার লিগ", home: "আর্সেনাল", away: "চেলসি", he: "badge:আ:#dc2626", ae: "badge:চে:#2563eb", time: "লাইভ", day: 0, live: true, minute: "৬৭'", hs: 2, as: 1, odds: { h: 1.62, d: 3.8, a: 5.0 } },
    { id: "L5", sport: "football", league: "বাংলাদেশ প্রিমিয়ার লিগ", home: "ঢাকা আবাহনী", away: "মোহামেডান SC", he: "badge:আ:#2563eb", ae: "badge:মো:#1f2937", time: "লাইভ", day: 0, live: true, minute: "৩৪'", hs: 1, as: 0, odds: { h: 1.7, d: 3.4, a: 4.6 } },
    { id: "L6", sport: "football", league: "লা লিগা", home: "রিয়াল মাদ্রিদ", away: "বার্সেলোনা", he: "badge:রি:#e2e8f0", ae: "badge:বা:#7c3aed", time: "লাইভ", day: 0, live: true, minute: "৫৫'", hs: 1, as: 1, odds: { h: 2.5, d: 2.9, a: 2.8 } },
    { id: "L7", sport: "tennis", league: "এটিপি ফাইনালস", home: "কার্লোস আলকারাজ", away: "ইয়ানিক সিনার", he: "🇪🇸", ae: "🇮🇹", time: "লাইভ", day: 0, live: true, minute: "সেট ৩", hs: 1, as: 1, odds: { h: 1.8, a: 2.0 } },
    { id: "L8", sport: "tennis", league: "ডব্লিউটিএ ফাইনালস", home: "ইগা শিয়নতেক", away: "আরিনা সাবালেঙ্কা", he: "🇵🇱", ae: "🇧🇾", time: "লাইভ", day: 0, live: true, minute: "সেট ২", hs: 0, as: 1, odds: { h: 2.3, a: 1.62 } },
    { id: "L9", sport: "basketball", league: "এনবিএ", home: "লেকার্স", away: "সেল্টিক্স", he: "badge:লে:#ca8a04", ae: "badge:সে:#059669", time: "লাইভ", day: 0, live: true, minute: "Q3 • ৪:১২", hs: 78, as: 82, odds: { h: 2.1, a: 1.72 } },
    { id: "L10", sport: "cricket", league: "এশিয়া কাপ", home: "পাকিস্তান", away: "শ্রীলঙ্কা", he: "🇵🇰", ae: "🇱🇰", time: "লাইভ", day: 0, live: true, minute: "১৭.৩ ওভার", hs: 156, as: 4, odds: { h: 1.66, a: 2.2 } },
    { id: "L11", sport: "football", league: "উয়েফা চ্যাম্পিয়ন্স লিগ", home: "বায়ার্ন মিউনিখ", away: "পিএসজি", he: "badge:বা:#dc2626", ae: "badge:পি:#1d4ed8", time: "লাইভ", day: 0, live: true, minute: "৭৮'", hs: 2, as: 2, odds: { h: 2.9, d: 2.7, a: 2.6 } },
    { id: "L12", sport: "basketball", league: "এনবিএ", home: "ওয়ারিয়র্স", away: "নাগেটস", he: "badge:ও:#2563eb", ae: "badge:না:#92400e", time: "লাইভ", day: 0, live: true, minute: "Q2 • ৭:৪৫", hs: 54, as: 49, odds: { h: 1.8, a: 2.0 } },
  ];
  out.push(...liveDefs);

  // ---------- UPCOMING: next 120 days (~3-4 months) ----------
  const sports: SportId[] = ["cricket", "football", "tennis", "basketball"];
  for (const sp of sports) {
    const { leagues, teams } = FX_TEAMS[sp];
    const count = sp === "cricket" ? 52 : sp === "football" ? 48 : sp === "tennis" ? 26 : 18;
    for (let i = 0; i < count; i++) {
      const day = Math.floor(r() * 121); // 0..120
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
  { id: "fu1", title: "আইসিসি ওয়ানডে বিশ্বকাপ ২০২৭ — চ্যাম্পিয়ন", e: "🏆", ends: "নভেম্বর ২০২৭", selections: [
    { name: "ভারত", flag: "🇮🇳", odds: 3.4 }, { name: "অস্ট্রেলিয়া", flag: "🇦🇺", odds: 4.0 }, { name: "ইংল্যান্ড", flag: "🇬🇧", odds: 5.5 },
    { name: "পাকিস্তান", flag: "🇵🇰", odds: 7.0 }, { name: "নিউজিল্যান্ড", flag: "🇳🇿", odds: 8.0 }, { name: "বাংলাদেশ", flag: "🇧🇩", odds: 12.0 }] },
  { id: "fu2", title: "বাংলাদেশ প্রিমিয়ার লিগ ২০২৭ — চ্যাম্পিয়ন", e: "🏏", ends: "ফেব্রুয়ারি ২০২৭", selections: [
    { name: "কুমিল্লা ভিক্টোরিয়ান্স", flag: "🟦", odds: 4.5 }, { name: "ঢাকা ডমিনেটর্স", flag: "🟥", odds: 5.0 },
    { name: "রংপুর রাইডার্স", flag: "🟨", odds: 5.5 }, { name: "বরিশাল ফরচুন", flag: "🟠", odds: 6.0 }, { name: "সিলেট স্ট্রাইকার্স", flag: "🟪", odds: 7.5 }] },
  { id: "fu3", title: "ইংলিশ প্রিমিয়ার লিগ ২০২৬/২৭ — চ্যাম্পিয়ন", e: "⚽", ends: "মে ২০২৭", selections: [
    { name: "ম্যান সিটি", flag: "🩵", odds: 2.8 }, { name: "আর্সেনাল", flag: "🔴", odds: 3.2 },
    { name: "লিভারপুল", flag: "🔴", odds: 4.5 }, { name: "চেলসি", flag: "🔵", odds: 9.0 }, { name: "টটেনহ্যাম", flag: "⚪", odds: 15.0 }] },
  { id: "fu4", title: "উয়েফা চ্যাম্পিয়ন্স লিগ ২০২৭ — বিজয়ী", e: "⭐", ends: "জুন ২০২৭", selections: [
    { name: "রিয়াল মাদ্রিদ", flag: "⚪", odds: 5.0 }, { name: "ম্যান সিটি", flag: "🩵", odds: 5.5 },
    { name: "বায়ার্ন মিউনিখ", flag: "🔴", odds: 7.0 }, { name: "বার্সেলোনা", flag: "🔵", odds: 8.0 }, { name: "পিএসজি", flag: "🔵", odds: 9.0 }] },
  { id: "fu5", title: "এশিয়া কাপ ২০২৭ — চ্যাম্পিয়ন", e: "🏏", ends: "সেপ্টেম্বর ২০২৭", selections: [
    { name: "ভারত", flag: "🟧", odds: 2.6 }, { name: "পাকিস্তান", flag: "🇵🇰", odds: 4.0 },
    { name: "শ্রীলঙ্কা", flag: "🇱🇰", odds: 5.5 }, { name: "বাংলাদেশ", flag: "🇧🇩", odds: 6.5 }, { name: "আফগানিস্তান", flag: "🇦🇫", odds: 9.0 }] },
  { id: "fu6", title: "অস্ট্রেলিয়ান ওপেন ২০২৭ (পুরুষ একক) — চ্যাম্পিয়ন", e: "🎾", ends: "জানুয়ারি ২০২৭", selections: [
    { name: "কার্লোস আলকারাজ", flag: "🇪🇸", odds: 3.0 }, { name: "ইয়ানিক সিনার", flag: "🇮🇹", odds: 3.4 },
    { name: "নোভাক জোকোভিচ", flag: "🇷🇸", odds: 5.0 }, { name: "দানিল মেদভেদেভ", flag: "🇷🇺", odds: 9.0 }] },
];

export interface CasiGame { id: string; n: string; e: string; cat: string; players: string; rtp: string; hot?: boolean }

export const SLOT_GAMES: CasiGame[] = [
  { id: "royal", n: "রয়েল স্লটস", e: "🎰", cat: "slots", players: "১২.৪ক", rtp: "৯৬.৫%", hot: true },
  { id: "golden7", n: "গোল্ডেন সেভেন", e: "7️⃣", cat: "slots", players: "৮.১ক", rtp: "৯৬.২%" },
  { id: "fruit", n: "ফ্রুট ফ্রেনজি", e: "🍒", cat: "slots", players: "৬.৭ক", rtp: "৯৫.৮%", hot: true },
  { id: "diamond", n: "ডায়মন্ড রাশ", e: "💎", cat: "slots", players: "৫.২ক", rtp: "৯৬.৯%" },
  { id: "lucky", n: "লাকি স্পিন", e: "🍀", cat: "slots", players: "৪.৩ক", rtp: "৯৫.৫%" },
  { id: "pharaoh", n: "ফারাও'স গোল্ড", e: "🏺", cat: "slots", players: "৩.৯ক", rtp: "৯৬.১%" },
];

export const TABLE_GAMES: CasiGame[] = [
  { id: "roulette", n: "রুলেট", e: "🎡", cat: "table", players: "৯.৩ক", rtp: "৯৭.৩%", hot: true },
  { id: "blackjack", n: "ব্ল্যাকজ্যাক", e: "🂡", cat: "table", players: "৭.৮ক", rtp: "৯৯.৪%", hot: true },
  { id: "baccarat", n: "ব্যাকারাট", e: "🃏", cat: "table", players: "৬.১ক", rtp: "৯৮.৯%" },
  { id: "poker", n: "থ্রি-কার্ড পোকার", e: "♠️", cat: "table", players: "৪.৭ক", rtp: "৯৬.৬%" },
  { id: "teenpatti", n: "তিন পাত্তি", e: "🪔", cat: "desi", players: "১১.২ক", rtp: "৯৭.১%", hot: true },
  { id: "andarbahar", n: "অন্দর বাহার", e: "🎴", cat: "desi", players: "৮.৯ক", rtp: "৯৬.৮%", hot: true },
  { id: "dragontiger", n: "ড্রাগন টাইগার", e: "🐉", cat: "desi", players: "৭.৪ক", rtp: "৯৬.৭%" },
];

export const CRASH_GAMES: CasiGame[] = [
  { id: "crash", n: "ক্র্যাশ", e: "📈", cat: "crash", players: "১৫.৬ক", rtp: "৯৭.০%", hot: true },
  { id: "aviator", n: "জেট ফ্লাইট", e: "✈️", cat: "crash", players: "১৮.২ক", rtp: "৯৭.০%", hot: true },
  { id: "dice", n: "ডাইস", e: "🎲", cat: "crash", players: "৯.৮ক", rtp: "৯৭.৫%" },
  { id: "wheel", n: "ভাগ্যের চাকা", e: "🎡", cat: "crash", players: "৭.৩ক", rtp: "৯৬.৩%" },
];

export const LIVE_GAMES: CasiGame[] = [
  { id: "live-roulette", n: "লাইভ রুলেট", e: "🎥", cat: "live", players: "২.১ক", rtp: "৯৭.৩%", hot: true },
  { id: "live-blackjack", n: "লাইভ ব্ল্যাকজ্যাক", e: "🎥", cat: "live", players: "১.৮ক", rtp: "৯৯.৪%" },
  { id: "live-baccarat", n: "লাইভ ব্যাকারাট", e: "🎥", cat: "live", players: "১.৫ক", rtp: "৯৮.৯%" },
  { id: "live-teenpatti", n: "লাইভ তিন পাত্তি", e: "🎥", cat: "live", players: "২.৪ক", rtp: "৯৭.১%", hot: true },
  { id: "live-dragontiger", n: "লাইভ ড্রাগন টাইগার", e: "🎥", cat: "live", players: "১.৯ক", rtp: "৯৬.৭%" },
  { id: "live-andarbahar", n: "লাইভ অন্দর বাহার", e: "🎥", cat: "live", players: "১.৬ক", rtp: "৯৬.৮%" },
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
}

export const PROVIDERS = [
  "DigiPlay Originals", "রয়েল গেমিং", "মেগাউইন স্টুডিও", "গোল্ডেন টাচ",
  "নোভা সফট", "টাইগার গেমস", "লাকি স্পিন ল্যাব", "পদ্মা গেমিং",
  "ঢাকা প্লে", "স্পিন হাউস বিডি", "জেম ওয়ার্কস", "ভিক্টরি ল্যাব",
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
  { name: "ফলের বাগান", syms: ["🍒", "🍋", "🍇", "🍉", "🍓", "🔔", "⭐", "7️⃣"] },
  { name: "রত্ন খনি", syms: ["💎", "🔷", "🔶", "💠", "🔮", "✨", "👑", "💍"] },
  { name: "মিশরের ধন", syms: ["🏺", "🐪", "🔺", "👁️", "🪲", "⚱️", "🌙", "👑"] },
  { name: "ড্রাগন রাজ্য", syms: ["🐉", "🔥", "🏮", "🧧", "🪭", "🎋", "💰", "🐲"] },
  { name: "মহাকাশ যাত্রা", syms: ["🚀", "🪐", "⭐", "🌙", "👽", "🛸", "☄️", "🔭"] },
  { name: "সাগর তলা", syms: ["🐠", "🐙", "🦑", "🐚", "⚓", "🔱", "🦈", "🫧"] },
  { name: "জঙ্গল সাফারি", syms: ["🦁", "🐘", "🦒", "🦓", "🐆", "🌴", "🦜", "🐒"] },
  { name: "মিষ্টির দুনিয়া", syms: ["🍬", "🍭", "🧁", "🍩", "🍫", "🍦", "🍰", "🍯"] },
  { name: "ওয়াইল্ড ওয়েস্ট", syms: ["🤠", "🐴", "🔫", "⭐", "🏜️", "🌵", "🥃", "💰"] },
  { name: "ভাইকিং যুদ্ধ", syms: ["⚔️", "🛡️", "⛵", "🪓", "🐺", "⚡", "🏔️", "👑"] },
  { name: "লাক্সারি লাইফ", syms: ["💎", "🏎️", "⌚", "👜", "🥂", "💳", "🛥️", "👑"] },
  { name: "জাপানি বাগান", syms: ["🌸", "🎋", "🏯", "🎎", "🍵", "🪭", "🎏", "🌺"] },
  { name: "যাদুর জগৎ", syms: ["🔮", "🪄", "🧙", "🦉", "🌙", "⚗️", "📜", "✨"] },
  { name: "ফারাও সমাধি", syms: ["⚱️", "🏺", "🐍", "☀️", "🔺", "👁️", "🪲", "💛"] },
  { name: "ক্রিস্টাল গুহা", syms: ["💜", "💙", "💚", "💛", "🧡", "❤️", "🔮", "✨"] },
  { name: "আগুন পাহাড়", syms: ["🌋", "🔥", "💥", "🪨", "🦖", "🌋", "☄️", "🌡️"] },
  { name: "বরফ রাজ্য", syms: ["❄️", "⛄", "🐧", "🧊", "🌨️", "🦌", "🐻‍❄️", "💙"] },
  { name: "সোনার খনি", syms: ["⛏️", "💰", "🏆", "💛", "🪙", "🚂", "💎", "🔦"] },
  { name: "রংধনু উপত্যকা", syms: ["🌈", "🦄", "☁️", "⭐", "🍀", "🌟", "💫", "🎈"] },
  { name: "সার্কাস মেলা", syms: ["🎪", "🤹", "🎠", "🎡", "🍿", "🎈", "🥁", "🎭"] },
  { name: "মরুভূমি অভিযান", syms: ["🏜️", "🐪", "🦂", "🌵", "☀️", "🧭", "💧", "🏺"] },
  { name: "সাইবার সিটি", syms: ["🤖", "🌆", "💾", "🔋", "🛸", "🎮", "📡", "💡"] },
  { name: "রাজকীয় দরবার", syms: ["👑", "🏰", "⚜️", "🛡️", "🍷", "🎺", "💂", "🗝️"] },
];

/** Gradient per slot theme — stage & tiles always match the game's world. */
const THEME_GRADS = [
  "from-lime-600 via-green-800 to-slate-900",      // ফলের বাগান
  "from-violet-600 via-purple-900 to-slate-900",   // রত্ন খনি
  "from-amber-500 via-yellow-800 to-stone-900",     // মিশরের ধন
  "from-red-600 via-rose-900 to-slate-900",         // ড্রাগন রাজ্য
  "from-indigo-600 via-blue-950 to-black",          // মহাকাশ যাত্রা
  "from-cyan-500 via-sky-800 to-slate-900",         // সাগর তলা
  "from-emerald-600 via-green-900 to-slate-900",    // জঙ্গল সাফারি
  "from-pink-500 via-rose-700 to-slate-900",        // মিষ্টির দুনিয়া
  "from-orange-600 via-amber-900 to-stone-900",     // ওয়াইল্ড ওয়েস্ট
  "from-slate-500 via-slate-800 to-slate-950",      // ভাইকিং যুদ্ধ
  "from-yellow-500 via-amber-800 to-neutral-900",   // লাক্সারি লাইফ
  "from-rose-400 via-pink-800 to-slate-900",        // জাপানি বাগান
  "from-purple-600 via-indigo-950 to-black",        // যাদুর জগৎ
  "from-yellow-600 via-amber-900 to-stone-950",     // ফারাও সমাধি
  "from-fuchsia-500 via-purple-900 to-slate-950",   // ক্রিস্টাল গুহা
  "from-orange-500 via-red-900 to-slate-950",       // আগুন পাহাড়
  "from-sky-400 via-cyan-800 to-slate-900",         // বরফ রাজ্য
  "from-amber-400 via-yellow-800 to-stone-900",     // সোনার খনি
  "from-violet-500 via-fuchsia-800 to-slate-900",   // রংধনু উপত্যকা
  "from-red-500 via-rose-900 to-slate-950",         // সার্কাস মেলা
];

const SLOT_PREFIX = ["মেগা", "রয়েল", "সুপার", "আল্ট্রা", "গ্র্যান্ড", "লাকি", "গোল্ডেন", "ম্যাজিক", "ওয়াইল্ড", "ক্রেজি", "বিগ", "প্রিমিয়াম"];
const SLOT_SUFFIX = ["রিলস", "স্পিন", "জ্যাকপট", "উইন", "ফরচুন", "বোনানজা", "রাশ", "ডিলাক্স", "ম্যানিয়া", "ওয়ার্ল্ড"];

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
          players: `${(seededNum(id + "p", 180) / 10 + 0.3).toFixed(1)}ক`,
          rtp: 94 + seededNum(id + "r", 50) / 10,
          hot: seededNum(id + "h", 12) === 0,
          grad: THEME_GRADS[t],
          syms: theme.syms,
        });
      }
    }
  }
  // --- Crash family: 60 variants
  const crashNames = ["রকেট", "জেট", "বেলুন", "বুল", "চাঁদ", "বিমান", "বাইক", "ট্রেন", "হেলিকপ্টার", "স্পিড বোট"];
  const crashStyles = ["ক্র্যাশ", "ফ্লাইট", "রাইড", "রান", "এক্স"];
  let ci = 0;
  for (const cn of crashNames) {
    for (const cs of crashStyles) {
      ci++;
      const id = `crash-${ci}`;
      out.push({
        id, n: `${cn} ${cs}`, e: cn === "বিমান" || cn === "জেট" ? "✈️" : "🚀",
        cat: "crash", engine: ci % 3 === 0 ? "aviator" : "crash",
        provider: PROVIDERS[seededNum(id, PROVIDERS.length)],
        players: `${(seededNum(id + "p", 250) / 10 + 0.5).toFixed(1)}ক`,
        rtp: 96 + seededNum(id + "r", 30) / 10, hot: ci <= 6,
        grad: GRADS[seededNum(id + "g", GRADS.length)], syms: ["🚀"],
      });
    }
  }
  // --- Mines: 40 variants
  const mineNames = ["রত্ন", "সোনা", "বোমা", "হীরা", "ট্রেজার", "ক্রিস্টাল", "কয়লা", "রুবি"];
  let mi = 0;
  for (const mn of mineNames) {
    for (let v = 1; v <= 5; v++) {
      mi++;
      const id = `mines-${mi}`;
      out.push({
        id, n: `${mn} মাইনস ${v > 1 ? bn(v) : ""}`.trim(), e: "💣",
        cat: "mines", engine: "mines",
        provider: PROVIDERS[seededNum(id, PROVIDERS.length)],
        players: `${(seededNum(id + "p", 120) / 10 + 0.2).toFixed(1)}ক`,
        rtp: 96 + seededNum(id + "r", 30) / 10, hot: mi <= 4,
        grad: GRADS[seededNum(id + "g", GRADS.length)], syms: ["💣", "💎"],
      });
    }
  }
  // --- Plinko: 24 variants
  let pi = 0;
  for (const pn of ["গোল্ডেন", "নিয়ন", "রয়েল", "ক্যাজুয়াল", "টার্বো", "মেগা"]) {
    for (let v = 1; v <= 4; v++) {
      pi++;
      const id = `plinko-${pi}`;
      out.push({
        id, n: `${pn} প্লিংকো ${v > 1 ? bn(v) : ""}`.trim(), e: "🔵",
        cat: "plinko", engine: "plinko",
        provider: PROVIDERS[seededNum(id, PROVIDERS.length)],
        players: `${(seededNum(id + "p", 90) / 10 + 0.2).toFixed(1)}ক`,
        rtp: 95 + seededNum(id + "r", 40) / 10, hot: pi <= 3,
        grad: GRADS[seededNum(id + "g", GRADS.length)], syms: ["🔵"],
      });
    }
  }
  // --- Dice: 30 variants
  let di = 0;
  for (const dn of ["লাকি", "গোল্ডেন", "ডাবল", "রয়েল", "স্পিড", "ম্যাজিক"]) {
    for (let v = 1; v <= 5; v++) {
      di++;
      const id = `dice-${di}`;
      out.push({
        id, n: `${dn} ডাইস ${v > 1 ? bn(v) : ""}`.trim(), e: "🎲",
        cat: "dice", engine: "dice",
        provider: PROVIDERS[seededNum(id, PROVIDERS.length)],
        players: `${(seededNum(id + "p", 100) / 10 + 0.2).toFixed(1)}ক`,
        rtp: 96 + seededNum(id + "r", 30) / 10, hot: di <= 3,
        grad: GRADS[seededNum(id + "g", GRADS.length)], syms: ["🎲"],
      });
    }
  }
  // --- Wheel: 24 variants
  let wi = 0;
  for (const wn of ["লাকি", "গোল্ডেন", "মানি", "মেগা", "রয়েল", "স্পিন"]) {
    for (let v = 1; v <= 4; v++) {
      wi++;
      const id = `wheel-${wi}`;
      out.push({
        id, n: `${wn} হুইল ${v > 1 ? bn(v) : ""}`.trim(), e: "🎡",
        cat: "wheel", engine: "wheel",
        provider: PROVIDERS[seededNum(id, PROVIDERS.length)],
        players: `${(seededNum(id + "p", 80) / 10 + 0.2).toFixed(1)}ক`,
        rtp: 95 + seededNum(id + "r", 40) / 10, hot: wi <= 3,
        grad: GRADS[seededNum(id + "g", GRADS.length)], syms: ["🎡"],
      });
    }
  }
  // --- HiLo cards: 18 variants
  let hi = 0;
  for (const hn of ["রয়েল", "স্পিড", "গোল্ডেন", "ক্লাসিক", "টার্বো", "ভিআইপি"]) {
    for (let v = 1; v <= 3; v++) {
      hi++;
      const id = `hilo-${hi}`;
      out.push({
        id, n: `${hn} হাই-লো ${v > 1 ? bn(v) : ""}`.trim(), e: "🃏",
        cat: "hilo", engine: "hilo",
        provider: PROVIDERS[seededNum(id, PROVIDERS.length)],
        players: `${(seededNum(id + "p", 60) / 10 + 0.2).toFixed(1)}ক`,
        rtp: 96 + seededNum(id + "r", 30) / 10, hot: hi <= 2,
        grad: GRADS[seededNum(id + "g", GRADS.length)], syms: ["🃏"],
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

export const GAME_CATALOG: CatalogGame[] = buildCatalog();
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
  { id: "p1", t: "🎁 ১০০% ওয়েলকাম বোনাস", e: "🎁", d: "প্রথম ডিপোজিটে ১০০% বোনাস — সর্বোচ্চ ৫,০০০ টাকা পর্যন্ত!", body: "নতুন খেলোয়াড়দের জন্য বিশেষ অফার। প্রথম ডিপোজিটে ১০০% বোনাস পান — সর্বোচ্চ ৫,০০০ টাকা। বোনাস পেতে ন্যূনতম ৫০০ টাকা ডিপোজিট করুন। বোনাসের টাকা ১০ গুণ ওয়েজার করে তুলতে পারবেন। অফারটি অ্যাকাউন্ট খোলার ৭ দিনের মধ্যে প্রযোজ্য।" },
  { id: "p2", t: "💸 সাপ্তাহিক ক্যাশব্যাক ১০%", e: "💸", d: "হারানো টাকার ১০% ফেরত — প্রতি সোমবার!", body: "সপ্তাহে ক্যাসিনোতে নেট লস হলে ১০% ক্যাশব্যাক পাবেন প্রতি সোমবার সকালে। সর্বোচ্চ ১০,০০০ টাকা পর্যন্ত। কোনো ওয়েজার শর্ত নেই — সরাসরি উইথড্র করতে পারবেন।" },
  { id: "p3", t: "⚽ স্পোর্টস বুস্টার", e: "⚽", d: "মাল্টি বেটে ২৫% পর্যন্ত এক্সট্রা জয়!", body: "৫ বা তার বেশি সিলেকশনের মাল্টি বেট জিতলে অতিরিক্ত বোনাস: ৫ সিলেকশনে ৫%, ৮ সিলেকশনে ১৫%, ১২+ সিলেকশনে ২৫% এক্সট্রা।" },
  { id: "p4", t: "👑 ভিআইপি রিলোড বোনাস", e: "👑", d: "ভিআইপি সদস্যদের প্রতিদিন ২০% রিলোড!", body: "গোল্ড ও তার উপরের ভিআইপি সদস্যরা প্রতিদিনের প্রথম ডিপোজিটে ২০% রিলোড বোনাস পাবেন — সর্বোচ্চ ৩,০০০ টাকা।" },
  { id: "p5", t: "🎰 ফ্রি স্পিন ফ্রাইডে", e: "🎰", d: "প্রতি শুক্রবার ৫০টি ফ্রি স্পিন!", body: "শুক্রবার ১,০০০ টাকা ডিপোজিট করলেই রয়েল স্লটসে ৫০টি ফ্রি স্পিন। ফ্রি স্পিনের জয় ৫ গুণ ওয়েজারে উইথড্রযোগ্য।" },
];

export const TOURNAMENTS = [
  { id: "t1", t: "🏆 সাপ্তাহিক স্লট রেস", e: "🏆", prize: 100000, ends: "২ দিন বাকি", players: 1243, desc: "সপ্তাহের সর্বোচ্চ স্লট জয়ের ভিত্তিতে র‍্যাংকিং। টপ ৫০ জন পুরস্কার পাবেন।", body: "রয়েল স্লটস, গোল্ডেন সেভেন ও ফ্রুট ফ্রেনজিতে খেলে পয়েন্ট জমান। প্রতি ১০০ টাকা জয়ে ১ পয়েন্ট। পুরস্কার: ১ম — ২৫,০০০ টাকা, ২য় — ১৫,০০০ টাকা, ৩য় — ১০,০০০ টাকা, ৪র্থ–১০ম — ৫,০০০ টাকা, ১১তম–৫০তম — ১,০০০ টাকা।" },
  { id: "t2", t: "♠️ পোকার চ্যাম্পিয়নশিপ", e: "♠️", prize: 50000, ends: "৫ দিন বাকি", players: 486, desc: "থ্রি-কার্ড পোকারে সেরাদের লড়াই।", body: "প্রতিদিন রাত ৯টায় কোয়ালিফায়ার রাউন্ড। ফাইনাল রবিবার রাত ১০টা। এন্ট্রি ফি ৫০০ টাকা — বিজয়ী পাবেন ২০,০০০ টাকা!" },
  { id: "t3", t: "✈️ জেট ফ্লাইট মাস্টার্স", e: "✈️", prize: 75000, ends: "১ দিন বাকি", players: 2108, desc: "সর্বোচ্চ মাল্টিপ্লায়ারে ক্যাশআউটের প্রতিযোগিতা।", body: "জেট ফ্লাইটে ১০x বা তার বেশি মাল্টিপ্লায়ারে ক্যাশআউট করলেই এন্ট্রি। সর্বোচ্চ মাল্টিপ্লায়ারধারী ৩০ জন পুরস্কার পাবেন।" },
];

export const BLOG_POSTS = [
  { id: "b1", t: "ব্ল্যাকজ্যাকের ৫টি জয়ের কৌশল", e: "🂡", c: "কৌশল", time: "২ ঘণ্টা আগে", body: "ব্ল্যাকজ্যাক শুধু ভাগ্যের খেলা নয় — সঠিক কৌশলে হাউস এজ ০.৫%-এ নামিয়ে আনা যায়। ১) সবসময় ৮ ও এস স্প্লিট করুন। ২) ডিলারের ৬ বা কম থাকলে ১২+ হাতে স্ট্যান্ড করুন। ৩) ১১ হাতে সবসময় ডাবল ডাউন। ৪) কখনো ইন্স্যুরেন্স নেবেন না। ৫) বাজেট ঠিক করে খেলুন — হেরে গেলে তাড়াহুড়ো করে বাজি বাড়াবেন না।" },
  { id: "b2", t: "বাংলাদেশ বনাম ভারত: ম্যাচ প্রিভিউ", e: "🏏", c: "প্রিভিউ", time: "৫ ঘণ্টা আগে", body: "টি-টোয়েন্টি সিরিজের দ্বিতীয় ম্যাচে মুখোমুখি বাংলাদেশ-ভারত। প্রথম ম্যাচে বাংলাদেশের বোলাররা দুর্দান্ত করলেও ব্যাটিং ব্যর্থতায় হার। আজকের ম্যাচে টস গুরুত্বপূর্ণ — শিশিরের কারণে পরে ব্যাট করা সুবিধাজনক। আমাদের বিশ্লেষণে ভারত ফেভারিট (১.৫৫), তবে বাংলাদেশের হোম কন্ডিশন সুবিধা (২.৪০) মূল্যবান হতে পারে।" },
  { id: "b3", t: "ক্র্যাশ গেমে ব্যাংকরোল ম্যানেজমেন্ট", e: "📈", c: "কৌশল", time: "১ দিন আগে", body: "ক্র্যাশ/জেট ফ্লাইটে দীর্ঘমেয়াদে টিকে থাকার মূলমন্ত্র ব্যাংকরোল ম্যানেজমেন্ট। প্রতি বাজি মোট ব্যালেন্সের ২%-এর বেশি নয়। ১.৫x-এ অটো ক্যাশআউট সেট করুন — ছোট কিন্তু নিয়মিত জয় বড় লস এড়ায়। কখনো 'একটা বড় জয়ে সব উসুল' মানসিকতায় খেলবেন না।" },
  { id: "b4", t: "তিন পাত্তি: হাতের র‍্যাংকিং গাইড", e: "🪔", c: "গাইড", time: "২ দিন আগে", body: "তিন পাত্তিতে হাতের শক্তি: ট্রায়ো (তিনটি একই) > পিওর সিকোয়েন্স > সিকোয়েন্স > কালার > পেয়ার > হাই কার্ড। ব্লাইন্ড খেলা ঝুঁকিপূর্ণ কিন্তু প্রতিপক্ষকে চাপে ফেলে। মনে রাখুন — ভালো হাত না থাকলে ফোল্ড করাই বুদ্ধিমানের কাজ।" },
];

export const FAQS = [
  { q: "এটা কি আসল টাকার সাইট?", a: "না। এটি একটি ডেমো ওয়েবসাইট — সব ব্যালেন্স, বাজি ও জয় ভার্চুয়াল। কোনো আসল টাকা জমা বা উত্তোলন হয় না।" },
  { q: "অ্যাকাউন্ট খুলতে কী লাগে?", a: "শুধু নাম, মোবাইল নম্বর ও পাসওয়ার্ড। সাইন আপ করলেই ৫,০০০ টাকা ডেমো বোনাস পাবেন।" },
  { q: "ডিপোজিট কিভাবে করবো?", a: "ওয়ালেট পেজ থেকে বিকাশ/নগদ/রকেট সিলেক্ট করে ডেমো TrxID দিলেই ব্যালেন্স যোগ হবে (ডেমো)।" },
  { q: "বাজি কিভাবে ধরবো?", a: "যেকোনো ম্যাচের অডসে ক্লিক করলে বেট স্লিপে যোগ হবে। স্টেক দিয়ে 'বাজি কনফার্ম' চাপুন।" },
  { q: "জেতা টাকা কিভাবে তুলবো?", a: "ডেমোতে উইথড্র পেজ থেকে রিকোয়েস্ট করলে সাথে সাথে ব্যালেন্স থেকে কেটে 'প্রসেসিং' দেখাবে।" },
  { q: "অডস মানে কী?", a: "অডস ২.০০ মানে ১০০ টাকা বাজিতে জিতলে ২০০ টাকা ফেরত (লাভ ১০০)। অডস যত কম, জয়ের সম্ভাবনা তত বেশি।" },
  { q: "লাইভ বেটিং কী?", a: "চলমান ম্যাচে বাজি ধরা। খেলার পরিস্থিতি অনুযায়ী অডস বদলায় — দ্রুত সিদ্ধান্ত নিতে হয়।" },
  { q: "ভিআইপি প্রোগ্রাম কী?", a: "নিয়মিত খেলোয়াড়রা পয়েন্ট জমিয়ে ব্রোঞ্জ→সিলভার→গোল্ড→প্ল্যাটিনাম→ডায়মন্ড লেভেলে উঠতে পারেন। উচ্চ লেভেলে ক্যাশব্যাক ও বোনাস বেশি।" },
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
        <p className="text-[11px] text-slate-400">💰 ব্যালেন্স</p>
        <p className="text-xl font-black text-[#f5c518]">{money(store.wallet)}</p>
      </div>
      <Link href={`${base}/deposit`} className="rounded-xl bg-[#f5c518] px-4 py-2 text-sm font-black text-black">
        ＋ ডিপোজিট
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
      onClick={() => { add({ matchId: match.id, match: `${match.home} বনাম ${match.away}`, selection: label, odds, live: match.live }); setAdded(true); setTimeout(() => setAdded(false), 900); }}
      className={`flex items-center justify-center gap-1 rounded-xl border font-black transition active:scale-95 ${small ? "px-2.5 py-1.5 text-[11px]" : "px-3 py-2 text-xs"} ${added ? "border-emerald-400 bg-emerald-500/20 text-emerald-300" : flash === 1 ? "border-emerald-400/60 bg-emerald-500/15 text-emerald-200" : flash === -1 ? "border-red-400/60 bg-red-500/15 text-red-200" : "border-[#f5c518]/30 bg-[#f5c518]/10 text-[#f5c518] hover:bg-[#f5c518]/20"}`}
    >
      {added ? "✓ যোগ হয়েছে" : (<>{flash === 1 && <span className="text-[9px]">▲</span>}{flash === -1 && <span className="text-[9px]">▼</span>}{label} {bn(odds.toFixed(2))}</>)}
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
  if (m.sport === "tennis") return `${bn(m.hs)} - ${bn(m.as)} সেট`;
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
            <span className="h-1.5 w-1.5 rounded-full bg-red-500" /> লাইভ • {m.minute}
          </span>
        ) : finished ? (
          <span className="shrink-0 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold text-slate-300">সমাপ্ত</span>
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
          <OddsBtn match={t} label="১" odds={t.odds.h} small flash={t.dirH} />
          {t.odds.d !== undefined && <OddsBtn match={t} label="X" odds={t.odds.d} small flash={t.dirD} />}
          <OddsBtn match={t} label="২" odds={t.odds.a} small flash={t.dirA} />
          <Link href={`${base}/match/${m.id}`} className="ml-auto rounded-lg px-2 py-1 text-[11px] font-bold text-slate-400 hover:text-white">
            +{bn(m.sport === "football" ? 24 : 18)} মার্কেট →
          </Link>
        </div>
      )}
      {finished && (
        <div className="px-3 pb-3 pt-1">
          <p className="text-[11px] font-bold text-slate-400">✅ ফলাফল: <b className="text-white">{scoreLine(m)}</b> — {m.hs === m.as ? "ড্র" : hw ? `${m.home} জয়ী` : `${m.away} জয়ী`}</p>
        </div>
      )}
    </div>
  );
}

function sportIcon(sport: SportId): string {
  return sport === "cricket" ? "🏏" : sport === "football" ? "⚽" : sport === "tennis" ? "🎾" : "🏀";
}

/** Team emblem: national teams show real flags (🇧🇩), clubs show a colored letter badge. e = "badge:ঢ:#dc2626" for clubs. */
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

/** Last-5 form for any team: opponents, scores, W/L. Deterministic per team name. */
export interface TeamFormRec { vs: string; vsE: string; score: string; res: "W" | "L" | "D"; date: string }
export function teamHistory(name: string, sport: SportId): TeamFormRec[] {
  const pool = FX_TEAMS[sport].teams.filter((t) => t.n !== name);
  let h = 0; for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  const r = fxRng(h + 777);
  const out: TeamFormRec[] = [];
  for (let i = 0; i < 5; i++) {
    const opp = pool[Math.floor(r() * pool.length)];
    const w = r() < 0.55;
    const d = !w && r() < 0.15;
    let score = "";
    if (sport === "cricket") { const a = 130 + Math.floor(r() * 80), b = 125 + Math.floor(r() * 80); score = w ? `${bn(a)}/${bn(3 + Math.floor(r() * 5))} বনাম ${bn(b)}` : `${bn(b)} বনাম ${bn(a)}/${bn(3 + Math.floor(r() * 5))}`; }
    else if (sport === "football") { const a = Math.floor(r() * 3), b = Math.floor(r() * 3); score = w ? `${bn(Math.max(a, b + 1))}-${bn(b)}` : d ? `${bn(a)}-${bn(a)}` : `${bn(b)}-${bn(Math.max(a, b + 1))}`; }
    else if (sport === "tennis") { score = w ? "২-০ সেট" : "০-২ সেট"; }
    else { const a = 95 + Math.floor(r() * 30), b = 90 + Math.floor(r() * 30); score = w ? `${bn(Math.max(a, b + 4))}-${bn(b)}` : `${bn(b)}-${bn(Math.max(a, b + 4))}`; }
    out.push({ vs: opp.n, vsE: opp.e, score, res: d ? "D" : w ? "W" : "L", date: dayLabel(-(2 + i * 4 + Math.floor(r() * 3))) });
  }
  return out;
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
      {g.hot && <span className="absolute right-2 top-2 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-black text-white">🔥 হট</span>}
      <p className="text-5xl transition group-hover:scale-110">{g.e}</p>
      <p className="mt-2 text-sm font-black">{g.n}</p>
      <p className="mt-1 text-[11px] text-slate-400">👥 {g.players} • RTP {g.rtp}</p>
      <span className="mt-2 inline-block rounded-lg bg-[#f5c518] px-4 py-1 text-xs font-black text-black">▶️ খেলুন</span>
    </Link>
  );
}

export function GameShell({ title, emoji, children, rtp }: { title: string; emoji: string; children: React.ReactNode; rtp?: string }) {
  const { base } = useSkin();
  return (
    <Page narrow>
      <Back href={`${base}/casino`} label="ক্যাসিনো লবি" />
      <BalanceBar />
      <div className="rounded-3xl border border-[#f5c518]/25 bg-gradient-to-b from-[#141b2e] to-[#0b1120] p-5">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-black">{emoji} {title}</h1>
          {rtp && <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-[11px] font-bold text-emerald-300">RTP {rtp}</span>}
        </div>
        <div className="mt-4">{children}</div>
      </div>
      <p className="mt-3 text-center text-[11px] text-slate-500">🎮 ডেমো গেম — ভার্চুয়াল ব্যালেন্সে খেলুন, আসল টাকা নয়</p>
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
