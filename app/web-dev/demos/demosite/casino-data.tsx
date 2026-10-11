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
  live?: boolean;
  minute?: string;
  hs?: number;
  as?: number;
  odds: { h: number; d?: number; a: number };
}

export const SPORTS: { id: SportId; n: string; e: string }[] = [
  { id: "cricket", n: "ক্রিকেট", e: "🏏" },
  { id: "football", n: "ফুটবল", e: "⚽" },
  { id: "tennis", n: "টেনিস", e: "🎾" },
  { id: "basketball", n: "বাস্কেটবল", e: "🏀" },
];

export const sportName = (id: SportId) => SPORTS.find((s) => s.id === id)?.n ?? id;

export const MATCHES: CasiMatch[] = [
  // ---- cricket: live ----
  { id: "m1", sport: "cricket", league: "বাংলাদেশ প্রিমিয়ার লিগ", home: "ঢাকা ডমিনেটর্স", away: "কুমিল্লা ভিক্টোরিয়ান্স", he: "🟥", ae: "🟦", time: "লাইভ", live: true, minute: "১৪.২ ওভার", hs: 142, as: 3, odds: { h: 1.85, a: 1.95 } },
  { id: "m2", sport: "cricket", league: "টি-টোয়েন্টি আন্তর্জাতিক", home: "বাংলাদেশ", away: "ভারত", he: "🟩", ae: "🟧", time: "লাইভ", live: true, minute: "২য় ইনিংস • ৮.৪ ওভার", hs: 96, as: 2, odds: { h: 2.4, a: 1.55 } },
  // ---- cricket: upcoming ----
  { id: "m3", sport: "cricket", league: "বাংলাদেশ প্রিমিয়ার লিগ", home: "রংপুর রাইডার্স", away: "সিলেট স্ট্রাইকার্স", he: "🟨", ae: "🟪", time: "আজ • সন্ধ্যা ৬:৩০", odds: { h: 1.72, a: 2.05 } },
  { id: "m4", sport: "cricket", league: "বাংলাদেশ প্রিমিয়ার লিগ", home: "চট্টগ্রাম চ্যালেঞ্জার্স", away: "খুলনা টাইগার্স", he: "⬜", ae: "🟧", time: "আগামীকাল • দুপুর ১:৩০", odds: { h: 2.1, a: 1.68 } },
  { id: "m5", sport: "cricket", league: "ওয়ানডে সিরিজ", home: "বাংলাদেশ", away: "শ্রীলঙ্কা", he: "🟩", ae: "🟦", time: "শুক্রবার • সকাল ১০:০০", odds: { h: 1.9, a: 1.85 } },
  { id: "m6", sport: "cricket", league: "আইপিএল", home: "মুম্বাই ইন্ডিয়ান্স", away: "চেন্নাই সুপার কিংস", he: "🔵", ae: "🟡", time: "শনিবার • সন্ধ্যা ৭:৩০", odds: { h: 1.95, a: 1.8 } },
  // ---- football: live ----
  { id: "m7", sport: "football", league: "বাংলাদেশ প্রিমিয়ার লিগ", home: "ঢাকা আবাহনী", away: "মোহামেডান SC", he: "🔵", ae: "⚫", time: "লাইভ", live: true, minute: "৬৭'", hs: 1, as: 1, odds: { h: 2.6, d: 2.9, a: 2.7 } },
  { id: "m8", sport: "football", league: "ইংলিশ প্রিমিয়ার লিগ", home: "আর্সেনাল", away: "চেলসি", he: "🔴", ae: "🔵", time: "লাইভ", live: true, minute: "৩৪'", hs: 1, as: 0, odds: { h: 1.7, d: 3.6, a: 4.5 } },
  // ---- football: upcoming ----
  { id: "m9", sport: "football", league: "বাংলাদেশ প্রিমিয়ার লিগ", home: "বসুন্ধরা কিংস", away: "চট্টগ্রাম আবাহনী", he: "🟣", ae: "🟢", time: "আজ • বিকাল ৪:০০", odds: { h: 1.45, d: 4.0, a: 6.5 } },
  { id: "m10", sport: "football", league: "লা লিগা", home: "রিয়াল মাদ্রিদ", away: "বার্সেলোনা", he: "⚪", ae: "🔵", time: "রবিবার • রাত ১:০০", odds: { h: 2.2, d: 3.4, a: 3.0 } },
  { id: "m11", sport: "football", league: "ইংলিশ প্রিমিয়ার লিগ", home: "লিভারপুল", away: "ম্যান সিটি", he: "🔴", ae: "🩵", time: "সোমবার • রাত ৯:৩০", odds: { h: 2.8, d: 3.5, a: 2.4 } },
  // ---- tennis ----
  { id: "m12", sport: "tennis", league: "এটিপি ফাইনালস", home: "কার্লোস আলকারাজ", away: "ইয়ানিক সিনার", he: "🇪🇸", ae: "🇮🇹", time: "লাইভ", live: true, minute: "সেট ২", hs: 1, as: 1, odds: { h: 1.8, a: 2.0 } },
  { id: "m13", sport: "tennis", league: "ডব্লিউটিএ ফাইনালস", home: "ইগা শিয়নতেক", away: "আরিনা সাবালেঙ্কা", he: "🇵🇱", ae: "🇧🇾", time: "আজ • রাত ৮:০০", odds: { h: 1.65, a: 2.2 } },
  { id: "m14", sport: "tennis", league: "এটিপি ৫০০", home: "নোভাক জোকোভিচ", away: "দানিল মেদভেদেভ", he: "🇷🇸", ae: "🇷🇺", time: "আগামীকাল • সন্ধ্যা ৭:০০", odds: { h: 1.55, a: 2.45 } },
  // ---- basketball ----
  { id: "m15", sport: "basketball", league: "এনবিএ", home: "লেকার্স", away: "সেল্টিক্স", he: "🟡", ae: "🟢", time: "লাইভ", live: true, minute: "Q3 • ৪:১২", hs: 78, as: 82, odds: { h: 2.1, a: 1.72 } },
  { id: "m16", sport: "basketball", league: "এনবিএ", home: "ওয়ারিয়র্স", away: "নাগেটস", he: "🔵", ae: "🟤", time: "আগামীকাল • সকাল ৯:০০", odds: { h: 1.9, a: 1.9 } },
  { id: "m17", sport: "basketball", league: "বাংলাদেশ বাস্কেটবল লিগ", home: "ঢাকা গ্ল্যাডিয়েটর্স", away: "চট্টগ্রাম টাইটান্স", he: "🔴", ae: "🔵", time: "শনিবার • বিকাল ৫:০০", odds: { h: 1.75, a: 2.0 } },
  // ---- results ----
  { id: "r1", sport: "cricket", league: "বাংলাদেশ প্রিমিয়ার লিগ", home: "বরিশাল ফরচুন", away: "ঢাকা ডমিনেটর্স", he: "🟠", ae: "🟥", time: "গতকাল", hs: 186, as: 184, odds: { h: 2.0, a: 1.75 } },
  { id: "r2", sport: "football", league: "বাংলাদেশ প্রিমিয়ার লিগ", home: "সাইফ স্পোর্টিং", away: "রহমতগঞ্জ", he: "🟡", ae: "🔴", time: "গতকাল", hs: 2, as: 0, odds: { h: 1.8, d: 3.4, a: 4.2 } },
  { id: "r3", sport: "tennis", league: "এটিপি ২৫০", home: "হোলগার রুন", away: "ফেলিক্স ওজার", he: "🇩🇰", ae: "🇨🇦", time: "২ দিন আগে", hs: 2, as: 0, odds: { h: 1.7, a: 2.1 } },
  { id: "r4", sport: "basketball", league: "এনবিএ", home: "বাক্স", away: "হিট", he: "🟢", ae: "🔴", time: "২ দিন আগে", hs: 112, as: 108, odds: { h: 1.6, a: 2.3 } },
  { id: "r5", sport: "cricket", league: "টি-টোয়েন্টি আন্তর্জাতিক", home: "বাংলাদেশ", away: "আফগানিস্তান", he: "🟩", ae: "🔵", time: "৩ দিন আগে", hs: 158, as: 159, odds: { h: 1.65, a: 2.2 } },
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

/** Odds button — adds selection to bet slip. */
export function OddsBtn({ match, label, odds, small }: { match: CasiMatch; label: string; odds: number; small?: boolean }) {
  const { add } = useBetSlip();
  const [added, setAdded] = useState(false);
  return (
    <button
      onClick={() => { add({ matchId: match.id, match: `${match.home} বনাম ${match.away}`, selection: label, odds, live: match.live }); setAdded(true); setTimeout(() => setAdded(false), 900); }}
      className={`rounded-lg border font-bold transition ${small ? "px-2 py-1 text-[11px]" : "px-3 py-1.5 text-xs"} ${added ? "border-emerald-400 bg-emerald-500/20 text-emerald-300" : "border-[#f5c518]/30 bg-[#f5c518]/10 text-[#f5c518] hover:bg-[#f5c518]/20"}`}
    >
      {added ? "✓ যোগ হয়েছে" : `${label} ${bn(odds.toFixed(2))}`}
    </button>
  );
}

export function MatchCard({ m, livePulse }: { m: CasiMatch; livePulse?: boolean }) {
  const { base } = useSkin();
  return (
    <div className="rounded-2xl border border-[#f5c518]/15 bg-[#101828]/90 p-3">
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-slate-400">{m.league}</span>
        {m.live ? (
          <span className={`flex items-center gap-1 font-black text-red-400 ${livePulse ? "animate-pulse" : ""}`}>🔴 লাইভ • {m.minute}</span>
        ) : (
          <span className="text-slate-500">{m.time}</span>
        )}
      </div>
      <Link href={`${base}/match/${m.id}`} className="mt-2 block">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold">{m.he} {m.home}</span>
          {m.live && m.hs !== undefined && <b className="text-[#f5c518]">{bn(m.hs)}{m.sport === "cricket" ? `/${bn(m.as ?? 0)}` : ""}</b>}
        </div>
        <div className="mt-1 flex items-center justify-between">
          <span className="text-sm font-bold">{m.ae} {m.away}</span>
          {m.live && m.as !== undefined && m.sport !== "cricket" && <b className="text-[#f5c518]">{bn(m.as)}</b>}
        </div>
      </Link>
      <div className="mt-2.5 flex gap-1.5" onClick={(e) => e.stopPropagation()}>
        <OddsBtn match={m} label="১" odds={m.odds.h} small />
        {m.odds.d !== undefined && <OddsBtn match={m} label="X" odds={m.odds.d} small />}
        <OddsBtn match={m} label="২" odds={m.odds.a} small />
        <Link href={`${base}/match/${m.id}`} className="ml-auto rounded-lg px-2 py-1 text-[11px] font-bold text-slate-400 hover:text-white">
          বিস্তারিত →
        </Link>
      </div>
    </div>
  );
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
