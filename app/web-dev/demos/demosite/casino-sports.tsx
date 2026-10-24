"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { toBnDigits } from "@/lib/format";
import { useDemo } from "./store";
import { Back, Empty, Field, Page, SectionTitle } from "./ui";
import { bn, money, GOLD, useSkin, useBetSlip, SPORTS, sportName, MATCHES, LIVE_MATCHES, UPCOMING_MATCHES, FINISHED_MATCHES, FUTURES, dayLabel, TABLE_GAMES, CRASH_GAMES, PROMOS, fmtTime, OddsBtn, MatchCard, GameCard, BetChips, GAME_CATALOG, catalogHref, CATALOG_COUNT, type CatalogGame, type SportId, type CasiMatch, type TickedMatch, type FutureMarket } from "./casino-data";
import { FX_TEAMS, fxRng } from "./casino-data";
import { TeamEmblem } from "./casino-data";
import { CatalogTile } from "./casino-catalog";

interface CasiBanner { img?: string; title: string; sub: string; href: string; grad: string }

const DEFAULT_BANNERS: CasiBanner[] = [
  { title: "🎁 ১০০% ওয়েলকাম বোনাস", sub: "প্রথম ডিপোজিটে ২০,০০০ টাকা পর্যন্ত", href: "/promotions", grad: "from-amber-500 via-orange-700 to-[#0b1120]" },
  { title: "📈 ক্র্যাশ — ১০,০০০x পর্যন্ত", sub: "সঠিক সময়ে ক্যাশআউট করুন", href: "/crash", grad: "from-emerald-500 via-teal-800 to-[#0b1120]" },
  { title: "💣 মাইনস — নতুন গেম", sub: "বোমা এড়িয়ে রত্ন তুলুন", href: "/mines", grad: "from-violet-600 via-purple-900 to-[#0b1120]" },
  { title: "🏏 লাইভ ক্রিকেট বেটিং", sub: "বল বাই বল লাইভ অডস", href: "/live", grad: "from-sky-500 via-blue-900 to-[#0b1120]" },
];

function HScroll({ children }: { children: React.ReactNode }) {
  return <div className="-mx-4 flex gap-2.5 overflow-x-auto px-4 pb-1" style={{ scrollbarWidth: "none" }}>{children}</div>;
}

/** Real-time live ticker: every 5s odds drift + scores bump, with direction flags. */
export function useLiveTicker(): TickedMatch[] {
  const prevRef = useRef<Record<string, { h: number; d?: number; a: number }>>({});
  const [snap, setSnap] = useState<TickedMatch[]>(() => LIVE_MATCHES.map((m) => ({ ...m, dirH: 0, dirD: 0, dirA: 0 })));
  useEffect(() => {
    const t = setInterval(() => {
      setSnap(LIVE_MATCHES.map((m) => {
        const prev = prevRef.current[m.id] ?? m.odds;
        const r = Math.random;
        const j = (o: number) => Math.max(1.15, +(o + (r() - 0.5) * 0.16).toFixed(2));
        const nh = j(prev.h), na = j(prev.a);
        const nd = prev.d !== undefined ? j(prev.d) : undefined;
        prevRef.current[m.id] = { h: nh, d: nd, a: na };
        // score drift
        let { hs, as } = m;
        if (r() < 0.3 && hs !== undefined && as !== undefined) {
          if (m.sport === "cricket") hs += Math.floor(r() * 7);
          else if (m.sport === "football") { if (r() < 0.5) hs += 1; else as += 1; }
          else hs += Math.floor(r() * 5);
        }
        const dir = (a: number, b: number) => (a > b ? 1 : a < b ? -1 : 0);
        return { ...m, odds: { h: nh, d: nd, a: na }, hs, as, dirH: dir(nh, prev.h), dirD: prev.d !== undefined && nd !== undefined ? dir(nd, prev.d) : 0, dirA: dir(na, prev.a) };
      }));
    }, 5000);
    return () => clearInterval(t);
  }, []);
  return snap;
}

/** Date-grouped upcoming list. */
export function groupUpcoming(list: CasiMatch[]): { label: string; sub: string; items: CasiMatch[] }[] {
  const groups: { label: string; sub: string; items: CasiMatch[] }[] = [];
  const push = (label: string, sub: string, items: CasiMatch[]) => { if (items.length) groups.push({ label, sub, items }); };
  push("⚡ আজ", `${bn(list.filter((m) => m.day === 0).length)}টি ম্যাচ`, list.filter((m) => m.day === 0));
  push("📅 আগামীকাল", `${bn(list.filter((m) => m.day === 1).length)}টি ম্যাচ`, list.filter((m) => m.day === 1));
  push("🗓️ এই সপ্তাহে", `${bn(list.filter((m) => m.day > 1 && m.day <= 7).length)}টি ম্যাচ`, list.filter((m) => m.day > 1 && m.day <= 7));
  push("📆 এই মাসে", `${bn(list.filter((m) => m.day > 7 && m.day <= 30).length)}টি ম্যাচ`, list.filter((m) => m.day > 7 && m.day <= 30));
  push("🔭 আরো সামনে (২-৯ মাস)", `${bn(list.filter((m) => m.day > 30).length)}টি ম্যাচ`, list.filter((m) => m.day > 30));
  return groups;
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


/** Own IP provider brands — logo badges for the provider grid (NG88-style). */
export interface ProviderBrand { name: string; mono: string; grad: string; hot?: boolean; isNew?: boolean }
export const PROVIDER_BRANDS: ProviderBrand[] = [
  { name: "DigiPlay Originals", mono: "DP", grad: "from-amber-400 to-orange-600", hot: true },
  { name: "রয়েল গেমিং", mono: "RG", grad: "from-purple-500 to-indigo-700", hot: true },
  { name: "মেগাউইন স্টুডিও", mono: "MW", grad: "from-rose-500 to-red-700" },
  { name: "গোল্ডেন টাচ", mono: "GT", grad: "from-yellow-400 to-amber-600", hot: true },
  { name: "নোভা সফট", mono: "NV", grad: "from-sky-400 to-blue-700" },
  { name: "টাইগার গেমস", mono: "TG", grad: "from-orange-500 to-red-700", hot: true },
  { name: "লাকি স্পিন ল্যাব", mono: "LS", grad: "from-emerald-400 to-green-700" },
  { name: "পদ্মা গেমিং", mono: "PG", grad: "from-teal-400 to-cyan-700" },
  { name: "ঢাকা প্লে", mono: "DK", grad: "from-lime-400 to-green-600", isNew: true },
  { name: "স্পিন হাউস বিডি", mono: "SH", grad: "from-fuchsia-500 to-purple-700" },
  { name: "জেম ওয়ার্কস", mono: "GW", grad: "from-cyan-400 to-sky-700", isNew: true },
  { name: "ভিক্টরি ল্যাব", mono: "VL", grad: "from-indigo-400 to-violet-700" },
  { name: "ক্রাউন গেমিং", mono: "CG", grad: "from-amber-300 to-yellow-600", hot: true, isNew: true },
  { name: "থান্ডার প্লে", mono: "TP", grad: "from-slate-500 to-slate-800", isNew: true },
  { name: "ফরচুন কিং", mono: "FK", grad: "from-red-400 to-rose-700", hot: true },
  { name: "নিয়ন স্টার", mono: "NS", grad: "from-pink-400 to-fuchsia-700", isNew: true },
];

/** Provider logo tile — links to the games lobby pre-filtered by provider. */
export function ProviderTile({ b }: { b: ProviderBrand }) {
  const { base } = useSkin();
  return (
    <Link
      href={`${base}/games`}
      onClick={() => { try { localStorage.setItem("dp_provider", b.name); } catch {} }}
      className="group relative flex flex-col items-center rounded-2xl bg-white/[0.04] p-2 ring-1 ring-white/10 transition hover:ring-[#f5c518]/50 active:scale-95"
    >
      <div className={`relative grid h-16 w-16 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br ${b.grad} shadow-lg`}>
        <span className="text-xl font-black tracking-tight text-white drop-shadow">{b.mono}</span>
        <span className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        {b.hot && <span className="absolute -right-1 -top-1 rounded-full bg-red-600 px-1.5 py-0.5 text-[8px] font-black text-white shadow">🔥HOT</span>}
        {b.isNew && !b.hot && <span className="absolute -right-1 -top-1 rounded-full bg-emerald-500 px-1.5 py-0.5 text-[8px] font-black text-white shadow">NEW</span>}
      </div>
      <p className="mt-1.5 text-center text-[10px] font-bold leading-tight text-slate-300">{b.name}</p>
    </Link>
  );
}

function ProvidersRow() {
  const [more, setMore] = useState(false);
  const list = more ? PROVIDER_BRANDS : PROVIDER_BRANDS.slice(0, 8);
  return (
    <div className="mt-6">
      <div className="mb-2.5 flex items-center justify-between">
        <p className="text-base font-black text-white">🎮 গেম প্রোভাইডার <span className="ml-1 rounded bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-black text-emerald-300">নিজস্ব IP</span></p>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {list.map((b) => <ProviderTile key={b.name} b={b} />)}
      </div>
      <button onClick={() => setMore((m) => !m)} className="mt-2.5 w-full rounded-2xl bg-white/5 py-2.5 text-sm font-black text-slate-300 ring-1 ring-white/10 transition active:scale-[0.99]">
        {more ? "View Less ⌃" : "View More ⌄"}
      </button>
    </div>
  );
}

/** Daily check-in: 7-day coin streak, browser-local bonus. */
function DailyCheckIn() {
  const { store } = useSkin();
  const today = new Date().toISOString().slice(0, 10);
  const [st, setSt] = useState({ last: "", streak: 0 });
  useEffect(() => {
    try { setSt(JSON.parse(localStorage.getItem("dp_checkin_v1") || '{"last":"","streak":0}')); } catch {}
  }, []);
  const claimed = st.last === today;
  const claim = () => {
    if (claimed) return;
    const y = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
    const streak = st.last === y ? st.streak + 1 : 1;
    const bonus = streak * 20;
    store.topUp(bonus);
    const n = { last: today, streak };
    setSt(n);
    try { localStorage.setItem("dp_checkin_v1", JSON.stringify(n)); } catch {}
  };
  const dayIdx = ((new Date().getDay() + 6) % 7); // Mon=0
  return (
    <div className="overflow-hidden rounded-3xl border border-purple-400/25 bg-gradient-to-b from-purple-600/25 via-[#141126] to-[#0b1120]">
      <div className="bg-gradient-to-r from-purple-600 to-fuchsia-700 px-4 py-2.5 text-center">
        <p className="text-sm font-black tracking-wide text-white">📅 ডেইলি চেক-ইন: <span className="text-yellow-300">৭ দিনে ৭০ কয়েন</span></p>
      </div>
      <p className="px-4 pt-3 text-center text-xs text-slate-300">প্রতিদিন চেক-ইন করুন, স্ট্রিক ধরে রাখুন — <b className="text-yellow-300">১০ কয়েন = ২০ টাকা বোনাস!</b></p>
      <div className="flex justify-center gap-1.5 px-4 py-3">
        {["সোম", "মঙ্গল", "বুধ", "বৃহঃ", "শুক্র", "শনি", "রবি"].map((d, i) => {
          const got = i < (st.streak % 8) || (st.streak >= 7 && i < 7 && claimed);
          const isToday = i === dayIdx && !claimed;
          return (
            <div key={d} className={`flex w-11 flex-col items-center rounded-xl py-2 ${got ? "bg-yellow-400/20 ring-1 ring-yellow-400/60" : isToday ? "bg-white/10 ring-1 ring-white/30" : "bg-white/[0.04]"}`}>
              <span className={`text-xl ${got ? "" : "opacity-40 grayscale"}`}>🪙</span>
              <span className="mt-0.5 text-[9px] font-bold text-slate-400">{d}</span>
              {got && <span className="text-[8px] font-black text-yellow-300">✓</span>}
            </div>
          );
        })}
      </div>
      <div className="px-4 pb-4 text-center">
        <button onClick={claim} disabled={claimed}
          className={`rounded-full px-8 py-2.5 text-sm font-black shadow transition active:scale-95 ${claimed ? "bg-white/10 text-slate-400" : "bg-gradient-to-b from-amber-300 to-orange-500 text-black shadow-[0_4px_20px_rgba(245,197,24,0.4)]"}`}>
          {claimed ? `✅ আজকের বোনাস নেওয়া হয়েছে (স্ট্রিক ${bn(st.streak)} দিন)` : `🎁 আজকের চেক-ইন করুন`}
        </button>
      </div>
    </div>
  );
}

export function CasinoHome() {
  const { base, def, store } = useSkin();
  const { clientSlug } = useDemo();
  const { count } = useBetSlip();
  const live = MATCHES.filter((m) => m.live);
  const [tick, setTick] = useState(0);
  useEffect(() => { const t = setInterval(() => setTick((x) => x + 1), 8000); return () => clearInterval(t); }, []);
  const jittered = useMemo(() => live.map((m) => ({
    ...m,
    odds: { h: +(m.odds.h + (Math.random() - 0.5) * 0.08).toFixed(2), d: m.odds.d ? +(m.odds.d + (Math.random() - 0.5) * 0.08).toFixed(2) : undefined, a: +(m.odds.a + (Math.random() - 0.5) * 0.08).toFixed(2) },
  })), [tick]);

  // Owner banners (client settings / demo custom) with fallback
  const [banners, setBanners] = useState<CasiBanner[]>(DEFAULT_BANNERS);
  const [slide, setSlide] = useState(0);
  useEffect(() => {
    const apply = (raw: unknown) => {
      try {
        const arr = typeof raw === "string" ? JSON.parse(raw) : raw;
        if (Array.isArray(arr) && arr.length) setBanners(arr.map((b: any) => ({ img: b.img || undefined, title: String(b.title || ""), sub: String(b.sub || ""), href: String(b.href || "/promotions"), grad: String(b.grad || "from-amber-500 via-orange-700 to-[#0b1120]") })));
      } catch {}
    };
    if (clientSlug) {
      fetch(`/api/client/${clientSlug}/settings`).then((r) => r.json()).then((d) => { if (d.settings?.casino_banners) apply(d.settings.casino_banners); }).catch(() => {});
    } else {
      apply((store.custom as any)?.casinoBanners);
    }
  }, [clientSlug, store.custom]);
  useEffect(() => {
    const t = setInterval(() => setSlide((s) => (s + 1) % Math.max(1, banners.length)), 4200);
    return () => clearInterval(t);
  }, [banners.length]);

  // NG88-style category tabs filter the hot row
  const [catTab, setCatTab] = useState<"hot" | "slots" | "casino" | "crash" | "sports">("hot");
  const catGames = useMemo(() => {
    if (catTab === "hot") return GAME_CATALOG.filter((g) => g.hot).slice(0, 12);
    if (catTab === "slots") return GAME_CATALOG.filter((g) => g.cat === "slots").slice(0, 12);
    if (catTab === "crash") return GAME_CATALOG.filter((g) => g.cat === "crash").slice(0, 12);
    if (catTab === "casino") return GAME_CATALOG.filter((g) => ["table", "desi", "live"].includes(g.cat)).slice(0, 12);
    return [];
  }, [catTab]);
  const CATTABS = [
    { id: "hot", e: "🔥", n: "হট গেমস" },
    { id: "slots", e: "🎰", n: "স্লট" },
    { id: "casino", e: "🃏", n: "ক্যাসিনো" },
    { id: "crash", e: "🚀", n: "ক্র্যাশ" },
    { id: "sports", e: "🏏", n: "ক্রিকেট" },
  ] as const;
  const dayIdx = (new Date().getDay() + 6) % 7;

  return (
    <div>
      {/* app download banner */}
      <div className="bg-gradient-to-r from-violet-700 via-purple-600 to-violet-700 px-4 py-2.5">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <p className="text-xs font-black text-white sm:text-sm">📱 আমাদের <b className="text-yellow-300">অ্যাপ</b> ডাউনলোড করুন — আরো দ্রুত, আরো বোনাস!</p>
          <a href="#app" className="shrink-0 rounded-lg bg-gradient-to-b from-amber-400 to-orange-600 px-4 py-1.5 text-xs font-black text-white shadow">ডাউনলোড</a>
        </div>
      </div>

      <Page>
        {/* spotlight banner carousel */}
        <div className="relative overflow-hidden rounded-3xl">
          <div className="flex transition-transform duration-700 ease-out" style={{ transform: `translateX(-${slide * 100}%)` }}>
            {banners.map((b, i) => (
              <Link key={i} href={`${base}${b.href.startsWith("/") ? b.href : `/${b.href}`}`} className={`relative block w-full shrink-0 bg-gradient-to-br ${b.grad} px-5 py-6`}>
                {b.img && <img src={b.img} alt="" className="absolute inset-0 h-full w-full object-cover opacity-55" />}
                <div className="relative">
                  <p className="text-xl font-black leading-snug text-white drop-shadow sm:text-2xl">{b.title}</p>
                  <p className="mt-1 text-xs font-bold text-white/85 drop-shadow">{b.sub}</p>
                  <span className="mt-3 inline-block rounded-full bg-white px-4 py-1.5 text-[11px] font-black text-black shadow">এখনই যান →</span>
                </div>
              </Link>
            ))}
          </div>
          <div className="absolute bottom-2.5 left-0 right-0 flex justify-center gap-1.5">
            {banners.map((_, i) => (
              <button key={i} onClick={() => setSlide(i)} className={`h-1.5 rounded-full transition-all ${slide === i ? "w-6 bg-white" : "w-1.5 bg-white/40"}`} />
            ))}
          </div>
        </div>

        {/* weekly strip */}
        <div className="mt-3 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-indigo-950 via-[#141126] to-indigo-950">
          <div className="flex items-center justify-between px-3 py-2">
            <div className="flex gap-1">
              {["সোম", "মঙ্গল", "বুধ", "বৃহঃ", "শুক্র", "শনি", "রবি"].map((d, i) => (
                <span key={d} className={`rounded-lg px-2 py-1 text-[10px] font-black ${i === dayIdx ? "bg-[#f5c518] text-black" : "text-slate-400"}`}>{d}</span>
              ))}
            </div>
            <Link href={`${base}/promotions`} className="shrink-0 rounded-lg bg-gradient-to-b from-amber-400 to-orange-600 px-3 py-1.5 text-[11px] font-black text-white">লগইন করুন</Link>
          </div>
          <p className="bg-gradient-to-r from-orange-500 to-amber-600 px-3 py-1.5 text-center text-sm font-black italic text-white">নিরাপদে খেলুন, জিতুন প্রতিদিন 🏆</p>
        </div>

        {/* category tabs — NG88 style */}
        <div className="mt-4 grid grid-cols-5 gap-1.5">
          {CATTABS.map((t) => (
            <button key={t.id} onClick={() => setCatTab(t.id)}
              className={`flex flex-col items-center gap-1 rounded-2xl py-3 transition active:scale-95 ${catTab === t.id ? "bg-gradient-to-b from-[#f5c518] to-amber-600 text-black shadow-[0_6px_20px_rgba(245,197,24,0.35)]" : "border border-white/10 bg-[#101828] text-slate-300"}`}>
              <span className="text-2xl">{t.e}</span>
              <span className="text-[11px] font-black">{t.n}</span>
            </button>
          ))}
        </div>

        {/* hot games row */}
        <div className="mt-4">
          <div className="mb-2.5 flex items-center justify-between">
            <p className="text-base font-black text-white">{CATTABS.find((t) => t.id === catTab)?.e} {CATTABS.find((t) => t.id === catTab)?.n}</p>
            <Link href={catTab === "sports" ? `${base}/sports` : `${base}/games`} className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-black text-white">আরো দেখুন ⌄</Link>
          </div>
          {catTab === "sports" ? (
            <div className="grid gap-2.5 sm:grid-cols-2">
              {jittered.slice(0, 4).map((m) => <MatchCard key={m.id} m={m} livePulse />)}
            </div>
          ) : (
            <HScroll>
              {catGames.map((g) => <div key={g.id} className="w-[150px] shrink-0"><CatalogTile g={g} small /></div>)}
            </HScroll>
          )}
        </div>

        {/* game providers — own IP brands */}
        <ProvidersRow />
        {/* referral program */}
        <div className="mt-6 overflow-hidden rounded-3xl border border-fuchsia-400/25 bg-gradient-to-b from-fuchsia-600/20 via-[#141126] to-[#0b1120]">
          <p className="px-4 pt-4 text-lg font-black text-white">👥 রেফারেল প্রোগ্রাম</p>
          <div className="mx-4 mt-2 rounded-2xl bg-gradient-to-r from-purple-600 to-fuchsia-700 p-4 text-center">
            <p className="text-[11px] font-bold tracking-widest text-white/85">EXTRA up to</p>
            <p className="text-2xl font-black text-yellow-300">{money(19250000)} <span className="text-sm text-white">সাপ্তাহিক কমিশন</span></p>
            <p className="mt-1 text-xs font-bold text-white">সর্বোচ্চ <b className="text-yellow-300">৪৫৫.৫%</b> লাইফটাইম ডিপোজিট কমিশন</p>
          </div>
          <div className="grid grid-cols-3 gap-1.5 px-4 py-3">
            {[["টায়ার ১", "৪.০%"], ["টায়ার ২", "১.০%"], ["টায়ার ৩", "০.৫%"]].map(([t, v]) => (
              <div key={t} className="rounded-xl bg-white/[0.05] py-2 text-center ring-1 ring-white/10">
                <p className="text-[10px] font-bold text-slate-400">{t}</p>
                <p className="text-base font-black text-[#f5c518]">{v}</p>
              </div>
            ))}
          </div>
          <div className="px-4 pb-4 text-center">
            <Link href={`${base}/referral`} className="inline-block rounded-full bg-gradient-to-b from-amber-300 to-orange-500 px-8 py-2.5 text-sm font-black text-black shadow">এখনই রেফার করুন →</Link>
          </div>
        </div>

        {/* daily check-in */}
        <div className="mt-4"><DailyCheckIn /></div>

        {/* top live */}
        <div className="mt-6 flex items-center justify-between">
          <p className="text-lg font-black text-white">🔝 টপ <span className="text-red-400">LIVE</span> <span className="ml-1 rounded-full border border-red-400/50 px-2 py-0.5 text-[10px] font-black text-red-300">Sport</span></p>
          <Link href={`${base}/live`} className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-black text-white">সব →</Link>
        </div>
        <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
          {jittered.slice(0, 4).map((m) => <MatchCard key={m.id} m={m} livePulse />)}
        </div>

        {/* promos */}
        <div className="mt-6 flex items-center justify-between">
          <p className="text-lg font-black text-white">🎁 প্রোমোশন</p>
          <Link href={`${base}/promotions`} className="text-xs font-bold text-[#f5c518]">সব দেখুন →</Link>
        </div>
        <div className="mt-3 grid gap-2.5 sm:grid-cols-3">
          {PROMOS.slice(0, 3).map((p) => (
            <Link key={p.id} href={`${base}/promotions/${p.id}`} className="rounded-2xl border border-[#f5c518]/15 bg-[#101828]/90 p-4 transition hover:border-[#f5c518]/50">
              <p className="text-2xl">{p.e}</p>
              <p className="mt-1 text-sm font-black">{p.t}</p>
              <p className="mt-1 text-xs text-slate-400">{p.d}</p>
            </Link>
          ))}
        </div>

        {/* trust footer — payments / certs / license */}
        <div className="mt-6 rounded-3xl border border-white/10 bg-[#0d1322] p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="mb-2 text-xs font-black text-slate-300">💳 পেমেন্ট মেথড</p>
              <div className="flex flex-wrap gap-1.5">
                {["বিকাশ", "নগদ", "রকেট", "ব্যাংক", "কার্ড"].map((p) => (
                  <span key={p} className="rounded-lg bg-white/10 px-2.5 py-1 text-[11px] font-black text-white">{p}</span>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-black text-slate-300">📣 ফলো করুন</p>
              <div className="flex gap-1.5">
                {["✈️", "📘", "▶️", "📸"].map((s, i) => (
                  <span key={i} className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-sm">{s}</span>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-black text-slate-300">🛡️ সার্টিফিকেশন</p>
              <div className="flex flex-wrap gap-1.5">
                <span className="rounded-lg bg-white/10 px-2.5 py-1 text-[11px] font-black text-white">🔞 ১৮+</span>
                <span className="rounded-lg bg-white/10 px-2.5 py-1 text-[11px] font-black text-white">✅ RNG সার্টিফাইড</span>
                <span className="rounded-lg bg-white/10 px-2.5 py-1 text-[11px] font-black text-white">🔒 SSL সুরক্ষিত</span>
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-black text-slate-300">📜 গেমিং লাইসেন্স</p>
              <span className="rounded-lg bg-gradient-to-r from-amber-500/25 to-orange-500/25 px-2.5 py-1 text-[11px] font-black text-amber-300 ring-1 ring-amber-400/40">🏛️ লাইসেন্সপ্রাপ্ত প্ল্যাটফর্ম</span>
            </div>
          </div>
          <p className="mt-4 text-center text-[11px] text-slate-500">🎮 ডেমো প্ল্যাটফর্ম — ভার্চুয়াল ব্যালেন্সে খেলুন • মোট {bn(CATALOG_COUNT)}+ নিজস্ব গেম • দায়িত্বশীল গেমিং</p>
        </div>

        {count > 0 && (
          <Link href={`${base}/betslip`} className="fixed bottom-24 right-4 z-40 flex items-center gap-2 rounded-full bg-[#f5c518] px-5 py-3 text-sm font-black text-black shadow-2xl">
            🧾 বেট স্লিপ <span className="rounded-full bg-black px-2 text-xs text-[#f5c518]">{bn(count)}</span>
          </Link>
        )}

        {/* floating REWARDS tab */}
        <Link href={`${base}/promotions`} className="fixed left-0 top-1/2 z-40 -translate-y-1/2 rounded-r-xl bg-gradient-to-b from-purple-500 to-fuchsia-700 px-1.5 py-4 text-[10px] font-black tracking-[0.2em] text-white shadow-lg" style={{ writingMode: "vertical-rl" }}>
          🎁 REWARDS
        </Link>
      </Page>
    </div>
  );
}
export function SportsHome() {
  const { base } = useSkin();
  const live = LIVE_MATCHES.length, up = UPCOMING_MATCHES.length, fin = FINISHED_MATCHES.length;
  return (
    <Page>
      <Back href={base} label="হোম" />
      <SectionTitle t="⚽ স্পোর্টস বেটিং" sub={`${bn(live)} লাইভ • ${bn(up)} আসন্ন • ${bn(FUTURES.length)} ফিউচার মার্কেট`} />
      {/* live hero strip */}
      <Link href={`${base}/live`} className="mb-4 block overflow-hidden rounded-3xl border border-red-500/40 bg-gradient-to-r from-red-950/70 via-[#141b2e] to-[#0b1120] p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="flex items-center gap-2 text-lg font-black text-white"><span className="relative flex h-3 w-3"><span className="absolute h-full w-full animate-ping rounded-full bg-red-500" /><span className="h-3 w-3 rounded-full bg-red-500" /></span> এখন লাইভ</p>
            <p className="mt-1 text-xs text-slate-300">{bn(live)}টি ম্যাচে বল-বাই-বল অডস বদলাচ্ছে — এখনই বাজি ধরুন</p>
          </div>
          <span className="rounded-full bg-red-500 px-4 py-2 text-sm font-black text-white">দেখুন →</span>
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {LIVE_MATCHES.slice(0, 6).map((m) => (
            <span key={m.id} className="shrink-0 rounded-xl bg-black/40 px-3 py-1.5 text-[11px] font-bold text-white ring-1 ring-white/10"><TeamEmblem e={m.he} size="sm" /> {m.home.split(" ").slice(0, 2).join(" ")} <b className="text-[#f5c518]">{bn(m.hs ?? 0)}</b></span>
          ))}
        </div>
      </Link>
      {/* tabs */}
      <div className="grid grid-cols-4 gap-2">
        {([[`${base}/live`, "🔴", "লাইভ", bn(live)], [`${base}/upcoming`, "📅", "আসন্ন", bn(up)], [`${base}/sports-futures`, "🏆", "ফিউচার", bn(FUTURES.length)], [`${base}/results`, "📊", "ফলাফল", bn(fin)]] as const).map(([h, e, t, n]) => (
          <Link key={h} href={h} className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-center transition hover:border-[#f5c518]/50">
            <p className="text-2xl">{e}</p><p className="mt-1 text-xs font-black text-white">{t}</p><p className="text-[10px] font-bold text-[#f5c518]">{n}</p>
          </Link>
        ))}
      </div>
      {/* sports grid */}
      <p className="mb-2 mt-5 text-sm font-black text-slate-300">খেলা বেছে নিন</p>
      <div className="grid grid-cols-2 gap-3">
        {SPORTS.map((sp) => {
          const n = MATCHES.filter((m) => m.sport === sp.id && m.day >= 0).length;
          const lv = LIVE_MATCHES.filter((m) => m.sport === sp.id).length;
          return (
            <Link key={sp.id} href={`${base}/sports/${sp.id}`} className="rounded-3xl border border-[#f5c518]/15 bg-gradient-to-br from-[#141b2e] to-[#0b1120] p-5 text-center transition hover:border-[#f5c518]/50">
              <p className="text-5xl">{sp.e}</p>
              <p className="mt-2 text-lg font-black text-white">{sp.n}</p>
              <p className="mt-1 text-xs text-slate-400">{lv > 0 && <span className="mr-1 font-bold text-red-400">🔴 {bn(lv)} লাইভ</span>}{bn(n)}টি ম্যাচ</p>
            </Link>
          );
        })}
      </div>
    </Page>
  );
}

export function SportPage({ sport }: { sport: string }) {
  const { base } = useSkin();
  const s = SPORTS.find((x) => x.id === sport);
  const liveTick = useLiveTicker();
  if (!s) return <Page narrow><Empty emoji="🔍" text="খেলা পাওয়া যায়নি" /></Page>;
  const live = liveTick.filter((m) => m.sport === sport);
  const up = UPCOMING_MATCHES.filter((m) => m.sport === sport);
  return (
    <Page>
      <Back href={`${base}/sports`} label="স্পোর্টস" />
      <SectionTitle t={`${s.e} ${s.n}`} sub={`${bn(live.length + up.length)}টি ম্যাচ`} />
      {live.length > 0 && (<>
        <p className="mb-2 text-sm font-black text-red-400">🔴 লাইভ ({bn(live.length)})</p>
        <div className="grid gap-2.5 sm:grid-cols-2">{live.map((m) => <MatchCard key={m.id} m={m} ticked={m} livePulse />)}</div>
      </>)}
      {up.length > 0 && (<>
        <p className="mb-2 mt-5 text-sm font-black text-slate-300">📅 আসন্ন ({bn(up.length)})</p>
        <div className="grid gap-2.5 sm:grid-cols-2">{up.map((m) => <MatchCard key={m.id} m={m} />)}</div>
      </>)}
    </Page>
  );
}

function MatchScoreLine({ m }: { m: CasiMatch }) {
  if (!m.live || m.hs === undefined) return null;
  return (
    <div className="mt-3 flex items-center justify-center gap-6 rounded-2xl bg-black/30 p-4">
      <div className="text-center"><div className="flex justify-center"><TeamEmblem e={m.he} size="lg" /></div><p className="mt-1 text-xs font-bold">{m.home}</p><p className="text-2xl font-black text-[#f5c518]">{bn(m.hs)}{m.sport === "cricket" && m.as !== undefined ? `/${bn(m.as)}` : ""}</p></div>
      <div className="text-center"><p className="text-xs font-black text-red-400 animate-pulse">🔴 লাইভ</p><p className="text-[11px] text-slate-400">{m.minute}</p></div>
      <div className="text-center"><div className="flex justify-center"><TeamEmblem e={m.ae} size="lg" /></div><p className="mt-1 text-xs font-bold">{m.away}</p>{m.sport !== "cricket" && m.as !== undefined && <p className="text-2xl font-black text-[#f5c518]">{bn(m.as)}</p>}</div>
    </div>
  );
}

/** Ball-by-ball cartoon: bowler runs, ball flies, result pops. */
function BallByBall({ balls, flying }: { balls: string[]; flying: boolean }) {
  const chip = (b: string) =>
    b === "W" ? "bg-red-500/25 text-red-300 ring-red-500/50" :
    b === "6" ? "bg-amber-400/25 text-amber-300 ring-amber-400/50" :
    b === "4" ? "bg-emerald-500/25 text-emerald-300 ring-emerald-500/50" :
    "bg-white/8 text-slate-300 ring-white/15";
  return (
    <div className="mt-3 overflow-hidden rounded-2xl bg-[#0d1526] p-3 ring-1 ring-white/10">
      <style>{`@keyframes dp-ballfly { 0% { left: 6%; top: 45%; transform: scale(.7) } 45% { left: 48%; top: -25%; transform: scale(1) } 100% { left: 90%; top: 45%; transform: scale(.7) } } @keyframes dp-ballpop { 0% { transform: scale(0) rotate(-30deg) } 60% { transform: scale(1.4) rotate(8deg) } 100% { transform: scale(1) rotate(0) } } .dp-ballfly { animation: dp-ballfly 1.05s ease-in forwards } .dp-ballpop { animation: dp-ballpop .45s ease both }`}</style>
      <p className="mb-2 text-xs font-black text-white">🎙️ বল-বাই-বল <span className="font-bold text-red-400">• সরাসরি</span></p>
      {/* cartoon pitch */}
      <div className="relative h-16 overflow-hidden rounded-xl bg-gradient-to-b from-emerald-900/60 to-emerald-950/80 ring-1 ring-emerald-800/40">
        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-2xl">🏃</span>
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-2xl">🏏</span>
        <span className="absolute left-1/2 top-1/2 h-8 w-1 -translate-x-1/2 -translate-y-1/2 rounded bg-amber-200/60" />
        {flying && <span className="dp-ballfly absolute text-lg" style={{ top: "45%" }}>⚪</span>}
        {!flying && <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] font-bold text-white/50">পরের বল আসছে…</span>}
      </div>
      {/* recent balls */}
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {balls.map((b, i) => (
          <span key={`${i}-${b}`} className={`grid h-8 w-8 place-items-center rounded-full text-xs font-black ring-1 ${chip(b)} ${i === balls.length - 1 ? "dp-ballpop" : ""}`}>{b}</span>
        ))}
      </div>
      <p className="mt-2 text-[11px] text-slate-400">শেষ {bn(balls.length)} বল • <b className="text-emerald-300">পরের বল:</b> কত রান হবে? নিচে বাজি ধরুন ⬇</p>
    </div>
  );
}

/** Tiny odds-movement sparkline (SpreadEx-style price chart). */
function OddsSpark({ hist }: { hist: number[] }) {
  if (hist.length < 2) return null;
  const min = Math.min(...hist), max = Math.max(...hist), rg = Math.max(0.01, max - min);
  const pts = hist.map((v, i) => `${(i / (hist.length - 1)) * 100},${28 - ((v - min) / rg) * 24}`).join(" ");
  const up = hist[hist.length - 1] >= hist[0];
  return (
    <div className="mt-2 rounded-xl bg-black/30 p-2 ring-1 ring-white/10">
      <p className="mb-1 text-[10px] font-bold text-slate-400">📈 অডস মুভমেন্ট (হোম জয়)</p>
      <svg viewBox="0 0 100 30" className="h-8 w-full" preserveAspectRatio="none">
        <polyline points={pts} fill="none" stroke={up ? "#34d399" : "#f87171"} strokeWidth="2" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

/** Team form strip: last-5 with scores. */
function TeamForm({ name, sport, align = "left" }: { name: string; sport: SportId; align?: "left" | "right" }) {
  const form = teamHistory(name, sport);
  return (
    <div className={align === "right" ? "text-right" : ""}>
      <p className="mb-1.5 text-xs font-black text-[#f5c518]">📋 {name} — শেষ ৫ ম্যাচ</p>
      <div className="space-y-1">
        {form.map((f, i) => (
          <div key={i} className="flex items-center justify-between gap-2 rounded-lg bg-white/[0.04] px-2.5 py-1.5 text-[11px]">
            <span className="flex min-w-0 items-center gap-1.5 text-slate-300"><TeamEmblem e={f.vsE} size="sm" /><span className="truncate">বনাম {f.vs}</span></span>
            <span className="flex shrink-0 items-center gap-1.5">
              <span className="text-slate-400">{f.score}</span>
              <span className={`grid h-5 w-5 place-items-center rounded-full text-[9px] font-black ${f.res === "W" ? "bg-emerald-500/25 text-emerald-300" : f.res === "L" ? "bg-red-500/25 text-red-300" : "bg-white/15 text-slate-300"}`}>{f.res}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MatchDetail({ id }: { id: string }) {
  const { base, card, sub } = useSkin();
  const m = MATCHES.find((x) => x.id === id);
  const [tab, setTab] = useState<"odds" | "info">("odds");
  const [odds, setOdds] = useState(m?.odds);
  const [dir, setDir] = useState({ h: 0, d: 0, a: 0 });
  const [hist, setHist] = useState<number[]>(m ? [m.odds.h] : []);
  const [score, setScore] = useState({ hs: m?.hs, as: m?.as });
  const [balls, setBalls] = useState<string[]>(["১", "০", "৪", "১", "W", "২"]);
  const [flying, setFlying] = useState(false);
  const [mom, setMom] = useState(50);

  useEffect(() => {
    if (!m?.live) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const t = setInterval(() => {
      // odds drift with direction
      setOdds((o) => {
        if (!o) return o;
        const j = (v: number) => Math.max(1.15, +(v + (Math.random() - 0.5) * 0.14).toFixed(2));
        const nh = j(o.h), na = j(o.a), nd = o.d !== undefined ? j(o.d) : undefined;
        const sdir = (a: number, b: number) => (a > b ? 1 : a < b ? -1 : 0);
        setDir({ h: sdir(nh, o.h), d: o.d !== undefined && nd !== undefined ? sdir(nd, o.d) : 0, a: sdir(na, o.a) });
        setHist((hst) => [...hst.slice(-24), nh]);
        return { h: nh, d: nd, a: na };
      });
      if (m.sport === "cricket") {
        // ball-by-ball cartoon sequence
        setFlying(true);
        timers.push(setTimeout(() => {
          const nb = ["০", "০", "১", "১", "১", "২", "২", "৪", "৪", "৬", "W"][Math.floor(Math.random() * 11)];
          setBalls((b) => [...b.slice(-11), nb]);
          setScore((sc) => {
            let { hs = 0, as = 0 } = sc;
            if (nb === "W") as += 1;
            else if (nb === "৪") hs += 4;
            else if (nb === "৬") hs += 6;
            else hs += parseInt(nb) || 0;
            return { hs, as };
          });
          setFlying(false);
        }, 1150));
      } else if (m.sport === "football") {
        setMom((v) => Math.min(78, Math.max(22, v + (Math.random() - 0.5) * 14)));
        if (Math.random() < 0.12) setScore((sc) => (Math.random() < 0.5 ? { hs: (sc.hs ?? 0) + 1, as: sc.as } : { hs: sc.hs, as: (sc.as ?? 0) + 1 }));
      } else {
        setScore((sc) => ({ hs: (sc.hs ?? 0) + (Math.random() < 0.25 ? Math.floor(Math.random() * 4) : 0), as: sc.as }));
      }
    }, 5200);
    return () => { clearInterval(t); timers.forEach(clearTimeout); };
  }, [m?.id]);

  if (!m) return <Page narrow><Empty emoji="🔍" text="ম্যাচ পাওয়া যায়নি" /></Page>;
  const mm = { ...m, odds: odds ?? m.odds, hs: score.hs, as: score.as };
  const markets: { t: string; opts: { label: string; o: number; f?: number }[] }[] = [
    { t: "ম্যাচ উইনার", opts: [{ label: m.home, o: mm.odds.h, f: m.live ? dir.h : 0 }, ...(mm.odds.d ? [{ label: "ড্র", o: mm.odds.d, f: m.live ? dir.d : 0 }] : []), { label: m.away, o: mm.odds.a, f: m.live ? dir.a : 0 }] },
    ...(m.live && m.sport === "cricket" ? [{ t: "⚪ পরের বল", opts: [{ label: "০ রান", o: 2.8 }, { label: "৪ হবে", o: 9.5 }, { label: "৬ হবে", o: 14.0 }, { label: "উইকেট", o: 7.5 }] }] : []),
    { t: "ডাবল চান্স", opts: [{ label: `${m.home}/ড্র`, o: +(mm.odds.h * 0.72).toFixed(2) }, { label: `${m.away}/ড্র`, o: +(mm.odds.a * 0.72).toFixed(2) }, { label: "যেকোনো জয়", o: 1.28 }] },
    { t: "মোট গোল/রান ওভার-আন্ডার", opts: [{ label: "ওভার ২.৫", o: 1.95 }, { label: "আন্ডার ২.৫", o: 1.85 }, { label: "ওভার ৩.৫", o: 2.6 }, { label: "আন্ডার ৩.৫", o: 1.45 }] },
    { t: "উভয় দল স্কোর করবে", opts: [{ label: "হ্যাঁ", o: 1.75 }, { label: "না", o: 2.0 }] },
  ];
  return (
    <Page>
      <Back href={m.live ? `${base}/live` : `${base}/sports/${m.sport}`} label="ফিরে যান" />
      <div className={`${card} p-4`}>
        <div className="flex items-center justify-between text-[11px]"><span className={sub}>{m.league} • {sportName(m.sport)}</span>{m.live && <span className="font-black text-red-400 animate-pulse">🔴 লাইভ</span>}</div>
        <MatchScoreLine m={mm} />
        {m.live && m.sport === "cricket" && <BallByBall balls={balls} flying={flying} />}
        {m.live && m.sport === "football" && (
          <div className="mt-3 rounded-2xl bg-black/30 p-3 ring-1 ring-white/10">
            <p className="mb-1.5 text-[11px] font-black text-white">⚡ মোমেন্টাম</p>
            <div className="flex h-2.5 overflow-hidden rounded-full bg-white/10">
              <div className="bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-1000" style={{ width: `${mom}%` }} />
              <div className="flex-1 bg-gradient-to-r from-sky-500 to-sky-400 transition-all duration-1000" />
            </div>
            <div className="mt-1 flex justify-between text-[10px] font-bold text-slate-400"><span>{m.home} {bn(Math.round(mom))}%</span><span>{bn(100 - Math.round(mom))}% {m.away}</span></div>
            <div className="mt-2 grid grid-cols-3 gap-1.5 text-center text-[11px]">
              {[["🎯 শট", `${bn(4 + Math.round(mom / 12))} - ${bn(4 + Math.round((100 - mom) / 12))}`], ["🚩 কর্নার", `${bn(2 + Math.round(mom / 25))} - ${bn(2 + Math.round((100 - mom) / 25))}`], ["🟨 কার্ড", `${bn(Math.round(mom / 40))} - ${bn(Math.round((100 - mom) / 40))}`]].map(([t, v]) => (
                <div key={t} className="rounded-lg bg-white/[0.04] py-1.5"><p className="font-bold text-slate-400">{t}</p><p className="font-black text-white">{v}</p></div>
              ))}
            </div>
          </div>
        )}
        {m.live && <OddsSpark hist={hist} />}
        {!m.live && <p className="mt-3 text-center text-sm text-slate-400">🕐 {m.time}</p>}
        <div className="mt-4 flex gap-2">
          {(["odds", "info"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`flex-1 rounded-xl py-2 text-sm font-black ${tab === t ? "bg-[#f5c518] text-black" : "bg-white/5 text-slate-400"}`}>
              {t === "odds" ? "📊 অডস" : "ℹ️ তথ্য ও ফর্ম"}
            </button>
          ))}
        </div>
      </div>
      {tab === "odds" ? (
        <div className="mt-3 space-y-3">
          {markets.map((mk) => (
            <div key={mk.t} className={`${card} p-3`}>
              <p className="mb-2 text-sm font-black text-[#f5c518]">{mk.t}</p>
              <div className="grid grid-cols-2 gap-1.5">
                {mk.opts.map((o) => (
                  <div key={o.label} className="flex items-center justify-between rounded-xl bg-white/[0.04] px-3 py-2">
                    <span className="text-xs">{o.label}</span>
                    <OddsBtn match={mm} label={o.label} odds={o.o} small flash={o.f} />
                  </div>
                ))}
              </div>
            </div>
          ))}
          <p className="text-center text-[11px] text-slate-500">💡 অডসে ক্লিক করলেই বেট স্লিপে যোগ হবে • <b className="text-emerald-300">▲</b>/<b className="text-red-300">▼</b> = অডস বদলেছে</p>
        </div>
      ) : (
        <div className={`${card} mt-3 space-y-4 p-4 text-sm`}>
          <div>
            <p><b className="text-[#f5c518]">লিগ:</b> {m.league}</p>
            <p><b className="text-[#f5c518]">ভেন্যু:</b> {m.sport === "cricket" ? "শের-ই-বাংলা স্টেডিয়াম, ঢাকা" : m.sport === "football" ? "বঙ্গবন্ধু স্টেডিয়াম, ঢাকা" : "ইনডোর স্টেডিয়াম"}</p>
            <p><b className="text-[#f5c518]">আবহাওয়া:</b> পরিষ্কার, ২৮°সে</p>
            <p className={sub}>হেড-টু-হেড: শেষ ৫ দেখায় {m.home} ৩টি, {m.away} ২টি জিতেছে।</p>
          </div>
          <TeamForm name={m.home} sport={m.sport} />
          <TeamForm name={m.away} sport={m.sport} />
        </div>
      )}
    </Page>
  );
}

export function LiveBetting() {
  const { base } = useSkin();
  const live = useLiveTicker();
  return (
    <Page>
      <Back href={base} label="হোম" />
      <SectionTitle t="🔴 লাইভ বেটিং" sub={`${bn(live.length)}টি ম্যাচ চলছে • অডস প্রতি ৫ সেকেন্ডে আপডেট`} />
      <div className="mb-3 flex items-center gap-2 rounded-2xl bg-red-500/10 px-3 py-2 ring-1 ring-red-500/30">
        <span className="relative flex h-2.5 w-2.5"><span className="absolute h-full w-full animate-ping rounded-full bg-red-500" /><span className="h-2.5 w-2.5 rounded-full bg-red-500" /></span>
        <p className="text-xs font-bold text-red-200">সরাসরি সম্প্রচার চলছে — <b className="text-emerald-300">▲ সবুজ</b> মানে অডস বেড়েছে, <b className="text-red-300">▼ লাল</b> মানে কমেছে</p>
      </div>
      <div className="grid gap-2.5 sm:grid-cols-2">
        {live.map((m) => (
          <div key={m.id}>
            <MatchCard m={m} ticked={m} livePulse />
            <Link href={`${base}/live/${m.id}`} className="mt-1 block rounded-xl bg-red-600/15 py-1.5 text-center text-xs font-black text-red-300 hover:bg-red-600/25">
              📡 লাইভ ম্যাচ সেন্টার →
            </Link>
          </div>
        ))}
      </div>
    </Page>
  );
}

export function LiveMatchDetail({ id }: { id: string }) {
  const { base, card, sub } = useSkin();
  const m = MATCHES.find((x) => x.id === id && x.live);
  const [odds, setOdds] = useState(m?.odds);
  const [events, setEvents] = useState<string[]>(["ম্যাচ শুরু হয়েছে"]);
  useEffect(() => {
    if (!m) return;
    const t = setInterval(() => {
      setOdds((o) => o ? { h: +(o.h + (Math.random() - 0.5) * 0.12).toFixed(2), d: o.d ? +(o.d + (Math.random() - 0.5) * 0.12).toFixed(2) : undefined, a: +(o.a + (Math.random() - 0.5) * 0.12).toFixed(2) } : o);
      const ev = ["⚽ আক্রমণ চলছে", "🛡️ রক্ষণভাগ শক্ত", "📊 দখল বদল", "🎯 সুযোগ তৈরি", "⏱️ খেলা জমে উঠেছে"][Math.floor(Math.random() * 5)];
      setEvents((e) => [`${new Date().getHours()}:${String(new Date().getMinutes()).padStart(2, "0")} — ${ev}`, ...e].slice(0, 8));
    }, 9000);
    return () => clearInterval(t);
  }, [m]);
  if (!m) return <Page narrow><Empty emoji="🔍" text="লাইভ ম্যাচ পাওয়া যায়নি" /></Page>;
  const mm = { ...m, odds: odds ?? m.odds };
  return (
    <Page>
      <Back href={`${base}/live`} label="লাইভ" />
      <div className={`${card} p-4`}>
        <p className={`text-center text-[11px] ${sub}`}>{m.league}</p>
        <MatchScoreLine m={mm} />
        {/* simulated live visualization */}
        <div className="mt-4 rounded-2xl bg-emerald-950/60 p-4">
          <p className="mb-2 text-center text-[11px] font-bold text-emerald-300">📡 লাইভ ট্র্যাকার (সিমুলেটেড)</p>
          <div className="relative mx-auto h-24 max-w-md overflow-hidden rounded-xl border border-emerald-800 bg-emerald-900/40">
            <div className="absolute inset-x-4 top-1/2 h-px bg-emerald-700" />
            <div className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-emerald-700" />
            <span className="absolute left-[30%] top-[40%] animate-bounce text-xl">⚽</span>
            <span className="absolute left-[20%] top-[60%] text-sm">🔵</span>
            <span className="absolute left-[65%] top-[35%] text-sm">🔴</span>
            <span className="absolute left-[70%] top-[65%] text-sm">🔵</span>
          </div>
        </div>
        <div className="mt-3">
          <p className="mb-2 text-sm font-black text-[#f5c518]">⚡ পরবর্তী ঘটনা</p>
          <div className="grid grid-cols-3 gap-1.5">
            <OddsBtn match={mm} label={`${m.home} গোল`} odds={2.1} small />
            <OddsBtn match={mm} label={`${m.away} গোল`} odds={2.4} small />
            <OddsBtn match={mm} label="গোল হবে না" odds={3.2} small />
          </div>
        </div>
        <div className="mt-3">
          <p className="mb-2 text-sm font-black text-[#f5c518]">🏆 ম্যাচ উইনার (লাইভ)</p>
          <div className="flex gap-1.5">
            <OddsBtn match={mm} label="১" odds={mm.odds.h} />
            {mm.odds.d !== undefined && <OddsBtn match={mm} label="X" odds={mm.odds.d} />}
            <OddsBtn match={mm} label="২" odds={mm.odds.a} />
          </div>
        </div>
      </div>
      <div className={`${card} mt-3 p-4`}>
        <p className="mb-2 text-sm font-black">📝 লাইভ কমেন্ট্রি</p>
        <div className="max-h-44 space-y-1.5 overflow-y-auto text-xs">
          {events.map((e, i) => <p key={i} className={i === 0 ? "font-bold text-[#f5c518]" : sub}>{e}</p>)}
        </div>
      </div>
    </Page>
  );
}

export function UpcomingMatches() {
  const { base } = useSkin();
  const [sport, setSport] = useState<"all" | SportId>("all");
  const list = useMemo(() => (sport === "all" ? UPCOMING_MATCHES : UPCOMING_MATCHES.filter((m) => m.sport === sport)), [sport]);
  const groups = useMemo(() => groupUpcoming(list), [list]);
  return (
    <Page>
      <Back href={base} label="হোম" />
      <SectionTitle t="📅 আসন্ন ম্যাচ" sub={`আগামী ৯ মাসে ${bn(UPCOMING_MATCHES.length)}টি ম্যাচ`} />
      <div className="mb-4 flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
        {(["all", ...SPORTS.map((x) => x.id)] as const).map((sp) => (
          <button key={sp} onClick={() => setSport(sp)} className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-black transition ${sport === sp ? "bg-[#f5c518] text-black" : "bg-white/8 text-slate-300 ring-1 ring-white/15"}`}>
            {sp === "all" ? "🌐 সব" : `${SPORTS.find((x) => x.id === sp)?.e} ${SPORTS.find((x) => x.id === sp)?.n}`}
          </button>
        ))}
      </div>
      {groups.map((g) => (
        <div key={g.label} className="mb-5">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-black text-white">{g.label}</p>
            <p className="text-[11px] font-bold text-[#f5c518]">{g.sub}</p>
          </div>
          <div className="grid gap-2.5 sm:grid-cols-2">{g.items.map((m) => <MatchCard key={m.id} m={m} />)}</div>
        </div>
      ))}
      {groups.length === 0 && <Empty emoji="📅" text="এই ফিল্টারে কোনো ম্যাচ নেই" />}
    </Page>
  );
}

export function Results() {
  const { base } = useSkin();
  const [sport, setSport] = useState<"all" | SportId>("all");
  const list = sport === "all" ? FINISHED_MATCHES : FINISHED_MATCHES.filter((m) => m.sport === sport);
  const recent = list.filter((m) => m.day >= -7);
  const older = list.filter((m) => m.day < -7);
  return (
    <Page>
      <Back href={base} label="হোম" />
      <SectionTitle t="📊 ফলাফল" sub={`গত ৩০ দিনে ${bn(FINISHED_MATCHES.length)}টি ম্যাচের ফল`} />
      <div className="mb-4 flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
        {(["all", ...SPORTS.map((x) => x.id)] as const).map((sp) => (
          <button key={sp} onClick={() => setSport(sp)} className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-black transition ${sport === sp ? "bg-[#f5c518] text-black" : "bg-white/8 text-slate-300 ring-1 ring-white/15"}`}>
            {sp === "all" ? "🌐 সব" : `${SPORTS.find((x) => x.id === sp)?.e} ${SPORTS.find((x) => x.id === sp)?.n}`}
          </button>
        ))}
      </div>
      <p className="mb-2 text-sm font-black text-white">🕘 গত ৭ দিন</p>
      <div className="mb-5 grid gap-2.5 sm:grid-cols-2">{recent.map((m) => <MatchCard key={m.id} m={m} />)}</div>
      {older.length > 0 && (<>
        <p className="mb-2 text-sm font-black text-white">📁 আগের ফলাফল</p>
        <div className="grid gap-2.5 sm:grid-cols-2">{older.map((m) => <MatchCard key={m.id} m={m} />)}</div>
      </>)}
    </Page>
  );
}

/** Futures / outright betting — tournament & league winners. */
function FutureOddsBtn({ market, name, flag, odds }: { market: FutureMarket; name: string; flag: string; odds: number }) {
  const { add } = useBetSlip();
  const [added, setAdded] = useState(false);
  return (
    <button
      onClick={() => { add({ matchId: `futures:${market.id}:${name}`, match: market.title, selection: name, odds }); setAdded(true); setTimeout(() => setAdded(false), 900); }}
      className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2.5 transition active:scale-[0.98] ${added ? "border-emerald-400 bg-emerald-500/15" : "border-white/10 bg-white/[0.04] hover:border-[#f5c518]/50"}`}
    >
      <span className="flex min-w-0 items-center gap-2 text-sm font-bold text-white"><span className="text-xl">{flag}</span><span className="truncate">{name}</span></span>
      <span className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-black ${added ? "bg-emerald-500/20 text-emerald-300" : "bg-[#f5c518]/12 text-[#f5c518]"}`}>{added ? "✓ যোগ হয়েছে" : bn(odds.toFixed(2))}</span>
    </button>
  );
}

export function FuturesPage() {
  const { base } = useSkin();
  return (
    <Page>
      <Back href={base} label="হোম" />
      <SectionTitle t="🏆 ফিউচার বেটিং" sub="টুর্নামেন্ট ও লিগের ভবিষ্যৎ চ্যাম্পিয়ন — এখনই সেরা অডসে ধরুন" />
      <div className="mb-4 overflow-hidden rounded-3xl border border-[#f5c518]/30 bg-gradient-to-r from-amber-950/60 via-[#141b2e] to-[#0b1120] p-4">
        <p className="text-lg font-black text-white">🏆 আউটরাইট মার্কেট</p>
        <p className="mt-1 text-xs leading-relaxed text-slate-300">কে জিতবে বিশ্বকাপ? কে হবে লিগ চ্যাম্পিয়ন? টুর্নামেন্ট শুরুর আগেই বাজি ধরুন — যত আগে ধরবেন, অডস তত ভালো। জয়ী ঘোষণা হলেই ব্যালেন্সে টাকা যোগ হবে।</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {FUTURES.map((f, i) => (
          <div key={f.id} className="overflow-hidden rounded-3xl border border-white/10 bg-[#101828]">
            <div className={`bg-gradient-to-r ${["from-amber-600/40", "from-emerald-600/40", "from-sky-600/40", "from-violet-600/40", "from-rose-600/40", "from-indigo-600/40"][i % 6]} to-transparent px-4 py-3`}>
              <p className="text-base font-black text-white">{f.e} {f.title}</p>
              <p className="mt-0.5 text-[11px] font-bold text-slate-400">📅 নিষ্পত্তি: {f.ends} • {bn(f.selections.length)}টি অপশন</p>
            </div>
            <div className="space-y-1.5 p-3">
              {f.selections.map((sel) => (
                <FutureOddsBtn key={sel.name} market={f} name={sel.name} flag={sel.flag} odds={sel.odds} />
              ))}
            </div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-center text-[11px] text-slate-500">💡 সিলেকশনে ক্লিক করলেই বেট স্লিপে যোগ হবে</p>
    </Page>
  );
}

export function BetSlip() {
  const { base, store, card, sub } = useSkin();
  const { slip, remove, clear } = useBetSlip();
  const [stake, setStake] = useState("100");
  const [msg, setMsg] = useState("");
  const [done, setDone] = useState(false);
  const st = Math.max(10, parseInt(stake) || 0);
  const totalPotential = slip.reduce((s, x) => s + st * x.odds, 0);
  const totalStake = st * slip.length;

  function confirm() {
    setMsg("");
    if (slip.length === 0) return setMsg("স্লিপ খালি — আগে অডস সিলেক্ট করুন");
    if (!store.user) return setMsg("বাজি ধরতে লগইন করুন");
    if (store.wallet < totalStake) return setMsg(`ব্যালেন্স কম — প্রয়োজন ${money(totalStake)}, আছে ${money(store.wallet)}`);
    for (const s of slip) {
      const ok = store.payWithWallet(st, `🧾 বাজি: ${s.match} (${s.selection})`);
      if (!ok) return setMsg("ব্যালেন্স অপর্যাপ্ত");
      store.placeBet({ kind: s.live ? "live" : "sports", sport: "", match: s.match, selection: s.selection, odds: s.odds, stake: st, potential: +(st * s.odds).toFixed(0) });
    }
    clear();
    setDone(true);
  }

  if (done) return (
    <Page narrow>
      <div className="py-10 text-center">
        <p className="text-6xl">🎉</p>
        <h1 className="mt-3 text-2xl font-black text-emerald-400">বাজি কনফার্ম!</h1>
        <p className={`mt-1 text-sm ${sub}`}>আপনার বাজি গৃহীত হয়েছে। শুভকামনা!</p>
        <div className="mt-5 flex justify-center gap-2">
          <Link href={`${base}/my-bets`} className="rounded-xl bg-[#f5c518] px-5 py-2.5 text-sm font-black text-black">🧾 আমার বাজি</Link>
          <Link href={`${base}/sports`} className="rounded-xl border border-white/20 px-5 py-2.5 text-sm font-bold">আরো বাজি</Link>
        </div>
      </div>
    </Page>
  );

  return (
    <Page narrow>
      <Back href={base} label="হোম" />
      <SectionTitle t="🧾 বেট স্লিপ" sub={`${bn(slip.length)}টি সিলেকশন`} />
      {slip.length === 0 ? (
        <Empty emoji="🧾" text="স্লিপ খালি — ম্যাচের অডসে ক্লিক করে যোগ করুন" />
      ) : (
        <>
          <div className="space-y-2">
            {slip.map((s, i) => (
              <div key={i} className={`${card} flex items-center justify-between p-3`}>
                <div>
                  <p className="text-xs font-bold">{s.match}</p>
                  <p className="mt-0.5 text-[11px] text-[#f5c518]">{s.selection} @ {bn(s.odds.toFixed(2))} {s.live && <span className="text-red-400">🔴</span>}</p>
                </div>
                <button onClick={() => remove(i)} className="text-lg text-red-400">✕</button>
              </div>
            ))}
          </div>
          <div className={`${card} mt-3 p-4`}>
            <p className="text-sm font-black">💰 প্রতি বাজিতে স্টেক</p>
            <div className="mt-2"><BetChips bet={st} setBet={(v) => setStake(String(v))} /></div>
            <input value={stake} onChange={(e) => setStake(e.target.value.replace(/\D/g, ""))} inputMode="numeric" className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-center text-lg font-black text-[#f5c518] outline-none" />
            <div className="mt-3 space-y-1 text-sm">
              <div className="flex justify-between"><span className={sub}>মোট স্টেক</span><b>{money(totalStake)}</b></div>
              <div className="flex justify-between"><span className={sub}>সম্ভাব্য জয়</span><b className="text-emerald-300">{money(totalPotential)}</b></div>
            </div>
            {msg && <p className="mt-2 rounded-xl bg-red-500/10 px-3 py-2 text-xs font-bold text-red-300">⚠️ {msg}</p>}
            {!store.user && <p className="mt-2 text-xs text-amber-300">💡 বাজি ধরতে <Link href={`${base}/login`} className="font-bold underline">লগইন</Link> করুন</p>}
            <button onClick={confirm} className="mt-3 w-full rounded-xl bg-[#f5c518] py-3 text-base font-black text-black">✅ বাজি কনফার্ম — {money(totalStake)}</button>
            <button onClick={clear} className="mt-2 w-full py-1 text-xs text-slate-500">স্লিপ খালি করুন</button>
          </div>
        </>
      )}
    </Page>
  );
}

export function MyBets() {
  const { base, store, card, sub } = useSkin();
  const [settled, setSettled] = useState(false);
  const open = store.bets.filter((b) => b.status === "Pending");

  function simulateSettle() {
    // Demo: randomly settle pending bets so the demo feels alive
    open.forEach((b) => store.settleBet(b.id, Math.random() < 0.45));
    setSettled(true);
    setTimeout(() => setSettled(false), 2000);
  }

  return (
    <Page>
      <Back href={base} label="হোম" />
      <div className="flex items-center justify-between">
        <SectionTitle t="🧾 আমার বাজি" sub={`${bn(open.length)}টি ওপেন`} />
        {open.length > 0 && (
          <button onClick={simulateSettle} className="rounded-xl bg-white/10 px-3 py-1.5 text-xs font-bold text-slate-300" title="ডেমো: ফলাফল সিমুলেট করুন">
            🎲 ডেমো ফলাফল
          </button>
        )}
      </div>
      {settled && <p className="mb-2 text-center text-xs text-emerald-300">✅ ফলাফল আপডেট হয়েছে!</p>}
      {open.length === 0 ? (
        <Empty emoji="🧾" text="কোনো ওপেন বাজি নেই" />
      ) : (
        <div className="space-y-2">
          {open.map((b) => (
            <div key={b.id} className={`${card} p-3`}>
              <div className="flex justify-between text-sm">
                <b>{b.match}</b>
                <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[11px] font-bold text-amber-300">{b.status}</span>
              </div>
              <p className={`mt-1 text-xs ${sub}`}>{b.selection} @ {bn(b.odds.toFixed(2))} • {b.kind === "live" ? "🔴 লাইভ" : "⚽ প্রি-ম্যাচ"}</p>
              <div className="mt-1.5 flex justify-between text-xs">
                <span className={sub}>স্টেক: {money(b.stake)}</span>
                <span className="font-bold text-emerald-300">সম্ভাব্য: {money(b.potential)}</span>
              </div>
              <p className={`mt-1 text-[10px] ${sub}`}>{b.id} • {fmtTime(b.date)}</p>
            </div>
          ))}
        </div>
      )}
      <Link href={`${base}/bet-history`} className="mt-4 block text-center text-sm font-bold text-[#f5c518]">📜 বাজির ইতিহাস দেখুন →</Link>
    </Page>
  );
}

export function BetHistory() {
  const { base, store, card, sub } = useSkin();
  const done = store.bets.filter((b) => b.status !== "Pending");
  const won = done.filter((b) => b.status === "Won").length;
  return (
    <Page>
      <Back href={`${base}/my-bets`} label="আমার বাজি" />
      <SectionTitle t="📜 বাজির ইতিহাস" sub={`${bn(done.length)}টি নিষ্পত্তি • ${bn(won)}টি জয়`} />
      {done.length === 0 ? <Empty emoji="📜" text="এখনো কোনো নিষ্পত্তি বাজি নেই" /> : (
        <div className="space-y-2">
          {done.map((b) => (
            <div key={b.id} className={`${card} p-3`}>
              <div className="flex justify-between text-sm">
                <b>{b.match}</b>
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${b.status === "Won" ? "bg-emerald-500/15 text-emerald-300" : "bg-red-500/15 text-red-300"}`}>{b.status}</span>
              </div>
              <p className={`mt-1 text-xs ${sub}`}>{b.selection} @ {bn(b.odds.toFixed(2))} • স্টেক {money(b.stake)}</p>
              {b.status === "Won" && <p className="mt-1 text-xs font-bold text-emerald-300">＋ {money(b.potential)} যোগ হয়েছে</p>}
            </div>
          ))}
        </div>
      )}
    </Page>
  );
}

export function BettingRules() {
  const { base, card } = useSkin();
  const rules = [
    ["🎯 সাধারণ নিয়ম", "সব বাজি ম্যাচের অফিসিয়াল ফলাফলের ভিত্তিতে নিষ্পত্তি হয়। বাতিল ম্যাচের বাজি ফেরত দেওয়া হয়।"],
    ["⚽ ফুটবল", "ম্যাচ উইনার বাজি ৯০ মিনিটের ফলাফলে নিষ্পত্তি (অতিরিক্ত সময় নয়)।"],
    ["🏏 ক্রিকেট", "বৃষ্টিতে ডাকওয়ার্থ-লুইসে ফলাফল হলে সেটাই চূড়ান্ত। সুপার ওভার মূল বাজিতে গণ্য নয়।"],
    ["🎾 টেনিস", "খেলোয়াড় রিটায়ার করলে বাজি বাতিল ও ফেরত।"],
    ["🔴 লাইভ বেটিং", "চলমান খেলায় অডস প্রতি মুহূর্তে বদলায়। বাজি গৃহীত হওয়ার মুহূর্তের অডস প্রযোজ্য।"],
    ["💰 সর্বোচ্চ জয়", "একক বাজিতে সর্বোচ্চ ১০,০০,০০০ টাকা জয় সীমা (ডেমো)।"],
    ["🚫 নিষেধাজ্ঞা", "১৮ বছরের কম বয়সীদের জন্য নয়। দায়িত্বশীলভাবে খেলুন।"],
  ];
  return (
    <Page narrow>
      <Back href={base} label="হোম" />
      <SectionTitle t="📖 বেটিং নিয়মাবলী" />
      <div className="space-y-2.5">
        {rules.map(([t, d]) => (
          <div key={t} className={`${card} p-4`}>
            <p className="font-black text-[#f5c518]">{t}</p>
            <p className="mt-1 text-sm text-slate-300">{d}</p>
          </div>
        ))}
      </div>
    </Page>
  );
}

export function OddsGuide() {
  const { base, card, sub } = useSkin();
  return (
    <Page narrow>
      <Back href={base} label="হোম" />
      <SectionTitle t="🧮 অডস গাইড" sub="অডস বুঝুন সহজে" />
      <div className={`${card} p-4 text-sm`}>
        <p className="font-black text-[#f5c518]">ডেসিমাল অডস কী?</p>
        <p className={`mt-1 ${sub}`}>অডস ২.০০ মানে ১০০ টাকা বাজিতে মোট ২০০ টাকা ফেরত পাবেন (লাভ ১০০ টাকা)। হিসাব: স্টেক × অডস = মোট ফেরত।</p>
      </div>
      <div className={`${card} mt-3 p-4`}>
        <p className="mb-2 font-black text-[#f5c518]">উদাহরণ</p>
        <div className="space-y-1.5 text-sm">
          {[["১.৫০", "১০০ টাকা", "১৫০ টাকা", "ফেভারিট — জয়ের সম্ভাবনা বেশি"], ["২.০০", "১০০ টাকা", "২০০ টাকা", "সমান সম্ভাবনা"], ["৫.০০", "১০০ টাকা", "৫০০ টাকা", "আন্ডারডগ — ঝুঁকি বেশি, লাভ বেশি"]].map(([o, s, r, d]) => (
            <div key={o} className="flex items-center justify-between rounded-xl bg-white/[0.04] px-3 py-2">
              <span><b className="text-[#f5c518]">{bn(o)}</b> <span className={sub}>• {s}</span></span>
              <span className="text-right"><b className="text-emerald-300">{r}</b><br /><span className={`text-[10px] ${sub}`}>{d}</span></span>
            </div>
          ))}
        </div>
      </div>
      <div className={`${card} mt-3 p-4 text-sm`}>
        <p className="font-black text-[#f5c518]">১ / X / ২ মানে কী?</p>
        <p className={`mt-1 ${sub}`}>১ = হোম দল জিতবে, X = ড্র হবে, ২ = অ্যাওয়ে দল জিতবে। ক্রিকেটে ড্র অপশন থাকে না।</p>
      </div>
      <div className={`${card} mt-3 p-4 text-center`}>
        <p className="text-sm font-bold">প্রস্তুত?</p>
        <Link href={`${base}/sports`} className="mt-2 inline-block rounded-xl bg-[#f5c518] px-6 py-2.5 text-sm font-black text-black">⚽ বাজি ধরুন</Link>
      </div>
    </Page>
  );
}

/* ============================== CASINO ============================== */
