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
  { title: "🎁 100% Welcome Bonus", sub: "Up to 20,000 credits on your first deposit", href: "/promotions", grad: "from-amber-500 via-orange-700 to-[#0b1120]" },
  { title: "📈 Crash — up to 10,000x", sub: "Cash out at the right moment", href: "/crash", grad: "from-emerald-500 via-teal-800 to-[#0b1120]" },
  { title: "💣 Mines — new game", sub: "Dodge the bombs, collect the gems", href: "/mines", grad: "from-violet-600 via-purple-900 to-[#0b1120]" },
  { title: "🏏 Live cricket betting", sub: "Ball-by-ball live odds", href: "/live", grad: "from-sky-500 via-blue-900 to-[#0b1120]" },
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
  push("⚡ Today", `${bn(list.filter((m) => m.day === 0).length)} matches`, list.filter((m) => m.day === 0));
  push("📅 Tomorrow", `${bn(list.filter((m) => m.day === 1).length)} matches`, list.filter((m) => m.day === 1));
  push("🗓️ This week", `${bn(list.filter((m) => m.day > 1 && m.day <= 7).length)} matches`, list.filter((m) => m.day > 1 && m.day <= 7));
  push("📆 This month", `${bn(list.filter((m) => m.day > 7 && m.day <= 30).length)} matches`, list.filter((m) => m.day > 7 && m.day <= 30));
  push("🔭 Further ahead (2-9 months)", `${bn(list.filter((m) => m.day > 30).length)} matches`, list.filter((m) => m.day > 30));
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
    if (sport === "cricket") { const a = 130 + Math.floor(r() * 80), b = 125 + Math.floor(r() * 80); score = w ? `${bn(a)}/${bn(3 + Math.floor(r() * 5))} vs ${bn(b)}` : `${bn(b)} vs ${bn(a)}/${bn(3 + Math.floor(r() * 5))}`; }
    else if (sport === "football") { const a = Math.floor(r() * 3), b = Math.floor(r() * 3); score = w ? `${bn(Math.max(a, b + 1))}-${bn(b)}` : d ? `${bn(a)}-${bn(a)}` : `${bn(b)}-${bn(Math.max(a, b + 1))}`; }
    else if (sport === "tennis") { score = w ? "2-0 sets" : "0-2 sets"; }
    else { const a = 95 + Math.floor(r() * 30), b = 90 + Math.floor(r() * 30); score = w ? `${bn(Math.max(a, b + 4))}-${bn(b)}` : `${bn(b)}-${bn(Math.max(a, b + 4))}`; }
    out.push({ vs: opp.n, vsE: opp.e, score, res: d ? "D" : w ? "W" : "L", date: dayLabel(-(2 + i * 4 + Math.floor(r() * 3))) });
  }
  return out;
}


/** Own IP provider brands — logo badges for the provider grid (NG88-style). */
export interface ProviderBrand { name: string; mono: string; grad: string; hot?: boolean; isNew?: boolean }
export const PROVIDER_BRANDS: ProviderBrand[] = [
  { name: "DigiPlay Originals", mono: "DP", grad: "from-amber-400 to-orange-600", hot: true },
  { name: "Royal Gaming", mono: "RG", grad: "from-purple-500 to-indigo-700", hot: true },
  { name: "MegaWin Studio", mono: "MW", grad: "from-rose-500 to-red-700" },
  { name: "Golden Touch", mono: "GT", grad: "from-yellow-400 to-amber-600", hot: true },
  { name: "Nova Soft", mono: "NV", grad: "from-sky-400 to-blue-700" },
  { name: "Tiger Games", mono: "TG", grad: "from-orange-500 to-red-700", hot: true },
  { name: "Lucky Spin Lab", mono: "LS", grad: "from-emerald-400 to-green-700" },
  { name: "Padma Gaming", mono: "PG", grad: "from-teal-400 to-cyan-700" },
  { name: "Dhaka Play", mono: "DK", grad: "from-lime-400 to-green-600", isNew: true },
  { name: "Spin House BD", mono: "SH", grad: "from-fuchsia-500 to-purple-700" },
  { name: "Gem Works", mono: "GW", grad: "from-cyan-400 to-sky-700", isNew: true },
  { name: "Victory Lab", mono: "VL", grad: "from-indigo-400 to-violet-700" },
  { name: "Crown Gaming", mono: "CG", grad: "from-amber-300 to-yellow-600", hot: true, isNew: true },
  { name: "Thunder Play", mono: "TP", grad: "from-slate-500 to-slate-800", isNew: true },
  { name: "Fortune King", mono: "FK", grad: "from-red-400 to-rose-700", hot: true },
  { name: "Neon Star", mono: "NS", grad: "from-pink-400 to-fuchsia-700", isNew: true },
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
        <p className="text-base font-black text-white">🎮 Game providers <span className="ml-1 rounded bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-black text-emerald-300">Own IP</span></p>
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
        <p className="text-sm font-black tracking-wide text-white">📅 Daily check-in: <span className="text-yellow-300">70 coins in 7 days</span></p>
      </div>
      <p className="px-4 pt-3 text-center text-xs text-slate-300">Check in every day, keep your streak — <b className="text-yellow-300">10 coins = 20 credits bonus!</b></p>
      <div className="flex justify-center gap-1.5 px-4 py-3">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d, i) => {
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
          {claimed ? `✅ Today's bonus claimed (streak ${bn(st.streak)} days)` : `🎁 Check in today`}
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
    { id: "hot", e: "🔥", n: "Hot games" },
    { id: "slots", e: "🎰", n: "Slots" },
    { id: "casino", e: "🃏", n: "Casino" },
    { id: "crash", e: "🚀", n: "Crash" },
    { id: "sports", e: "🏏", n: "Cricket" },
  ] as const;
  const dayIdx = (new Date().getDay() + 6) % 7;

  return (
    <div>
      {/* app download banner */}
      <div className="bg-gradient-to-r from-violet-700 via-purple-600 to-violet-700 px-4 py-2.5">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <p className="text-xs font-black text-white sm:text-sm">📱 Download our <b className="text-yellow-300">app</b> — faster, more bonuses!</p>
          <a href="#app" className="shrink-0 rounded-lg bg-gradient-to-b from-amber-400 to-orange-600 px-4 py-1.5 text-xs font-black text-white shadow">Download</a>
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
                  <span className="mt-3 inline-block rounded-full bg-white px-4 py-1.5 text-[11px] font-black text-black shadow">Go now →</span>
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
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d, i) => (
                <span key={d} className={`rounded-lg px-2 py-1 text-[10px] font-black ${i === dayIdx ? "bg-[#f5c518] text-black" : "text-slate-400"}`}>{d}</span>
              ))}
            </div>
            <Link href={`${base}/promotions`} className="shrink-0 rounded-lg bg-gradient-to-b from-amber-400 to-orange-600 px-3 py-1.5 text-[11px] font-black text-white">Log in</Link>
          </div>
          <p className="bg-gradient-to-r from-orange-500 to-amber-600 px-3 py-1.5 text-center text-sm font-black italic text-white">Play safely, win every day 🏆</p>
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
            <Link href={catTab === "sports" ? `${base}/sports` : `${base}/games`} className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-black text-white">See more ⌄</Link>
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
          <p className="px-4 pt-4 text-lg font-black text-white">👥 Referral programme</p>
          <div className="mx-4 mt-2 rounded-2xl bg-gradient-to-r from-purple-600 to-fuchsia-700 p-4 text-center">
            <p className="text-[11px] font-bold tracking-widest text-white/85">EXTRA up to</p>
            <p className="text-2xl font-black text-yellow-300">{money(19250000)} <span className="text-sm text-white">weekly rewards</span></p>
            <p className="mt-1 text-xs font-bold text-white">Up to <b className="text-yellow-300">455.5%</b> lifetime deposit rewards</p>
          </div>
          <div className="grid grid-cols-3 gap-1.5 px-4 py-3">
            {[["Tier 1", "4.0%"], ["Tier 2", "1.0%"], ["Tier 3", "0.5%"]].map(([t, v]) => (
              <div key={t} className="rounded-xl bg-white/[0.05] py-2 text-center ring-1 ring-white/10">
                <p className="text-[10px] font-bold text-slate-400">{t}</p>
                <p className="text-base font-black text-[#f5c518]">{v}</p>
              </div>
            ))}
          </div>
          <div className="px-4 pb-4 text-center">
            <Link href={`${base}/referral`} className="inline-block rounded-full bg-gradient-to-b from-amber-300 to-orange-500 px-8 py-2.5 text-sm font-black text-black shadow">Refer now →</Link>
          </div>
        </div>

        {/* daily check-in */}
        <div className="mt-4"><DailyCheckIn /></div>

        {/* top live */}
        <div className="mt-6 flex items-center justify-between">
          <p className="text-lg font-black text-white">🔝 Top <span className="text-red-400">LIVE</span> <span className="ml-1 rounded-full border border-red-400/50 px-2 py-0.5 text-[10px] font-black text-red-300">Sport</span></p>
          <Link href={`${base}/live`} className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-black text-white">All →</Link>
        </div>
        <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
          {jittered.slice(0, 4).map((m) => <MatchCard key={m.id} m={m} livePulse />)}
        </div>

        {/* promos */}
        <div className="mt-6 flex items-center justify-between">
          <p className="text-lg font-black text-white">🎁 Promotions</p>
          <Link href={`${base}/promotions`} className="text-xs font-bold text-[#f5c518]">See all →</Link>
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
              <p className="mb-2 text-xs font-black text-slate-300">💳 Payment methods</p>
              <div className="flex flex-wrap gap-1.5">
                {["bKash", "Nagad", "Rocket", "Bank", "Card"].map((p) => (
                  <span key={p} className="rounded-lg bg-white/10 px-2.5 py-1 text-[11px] font-black text-white">{p}</span>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-black text-slate-300">📣 Follow us</p>
              <div className="flex gap-1.5">
                {["✈️", "📘", "▶️", "📸"].map((s, i) => (
                  <span key={i} className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-sm">{s}</span>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-black text-slate-300">🛡️ Certification</p>
              <div className="flex flex-wrap gap-1.5">
                <span className="rounded-lg bg-white/10 px-2.5 py-1 text-[11px] font-black text-white">🔞 18+</span>
                <span className="rounded-lg bg-white/10 px-2.5 py-1 text-[11px] font-black text-white">✅ RNG certified</span>
                <span className="rounded-lg bg-white/10 px-2.5 py-1 text-[11px] font-black text-white">🔒 SSL secured</span>
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-black text-slate-300">📜 Gaming licence</p>
              <span className="rounded-lg bg-gradient-to-r from-amber-500/25 to-orange-500/25 px-2.5 py-1 text-[11px] font-black text-amber-300 ring-1 ring-amber-400/40">🏛️ Licensed platform</span>
            </div>
          </div>
          <p className="mt-4 text-center text-[11px] text-slate-500">🎮 Demo platform — play with a virtual balance • {bn(CATALOG_COUNT)}+ own games total • responsible gaming</p>
        </div>

        {count > 0 && (
          <Link href={`${base}/betslip`} className="fixed bottom-24 right-4 z-40 flex items-center gap-2 rounded-full bg-[#f5c518] px-5 py-3 text-sm font-black text-black shadow-2xl">
            🧾 Bet slip <span className="rounded-full bg-black px-2 text-xs text-[#f5c518]">{bn(count)}</span>
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
      <Back href={base} label="Home" />
      <SectionTitle t="⚽ Sports Betting" sub={`${bn(live)} live • ${bn(up)} upcoming • ${bn(FUTURES.length)} futures markets`} />
      {/* live hero strip */}
      <Link href={`${base}/live`} className="mb-4 block overflow-hidden rounded-3xl border border-red-500/40 bg-gradient-to-r from-red-950/70 via-[#141b2e] to-[#0b1120] p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="flex items-center gap-2 text-lg font-black text-white"><span className="relative flex h-3 w-3"><span className="absolute h-full w-full animate-ping rounded-full bg-red-500" /><span className="h-3 w-3 rounded-full bg-red-500" /></span> Live now</p>
            <p className="mt-1 text-xs text-slate-300">Odds are changing ball-by-ball in {bn(live)} matches — place your bet now</p>
          </div>
          <span className="rounded-full bg-red-500 px-4 py-2 text-sm font-black text-white">Watch →</span>
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {LIVE_MATCHES.slice(0, 6).map((m) => (
            <span key={m.id} className="shrink-0 rounded-xl bg-black/40 px-3 py-1.5 text-[11px] font-bold text-white ring-1 ring-white/10"><TeamEmblem e={m.he} size="sm" /> {m.home.split(" ").slice(0, 2).join(" ")} <b className="text-[#f5c518]">{bn(m.hs ?? 0)}</b></span>
          ))}
        </div>
      </Link>
      {/* tabs */}
      <div className="grid grid-cols-4 gap-2">
        {([[`${base}/live`, "🔴", "Live", bn(live)], [`${base}/upcoming`, "📅", "Upcoming", bn(up)], [`${base}/sports-futures`, "🏆", "Futures", bn(FUTURES.length)], [`${base}/results`, "📊", "Results", bn(fin)]] as const).map(([h, e, t, n]) => (
          <Link key={h} href={h} className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-center transition hover:border-[#f5c518]/50">
            <p className="text-2xl">{e}</p><p className="mt-1 text-xs font-black text-white">{t}</p><p className="text-[10px] font-bold text-[#f5c518]">{n}</p>
          </Link>
        ))}
      </div>
      {/* sports grid */}
      <p className="mb-2 mt-5 text-sm font-black text-slate-300">Choose a game</p>
      <div className="grid grid-cols-2 gap-3">
        {SPORTS.map((sp) => {
          const n = MATCHES.filter((m) => m.sport === sp.id && m.day >= 0).length;
          const lv = LIVE_MATCHES.filter((m) => m.sport === sp.id).length;
          return (
            <Link key={sp.id} href={`${base}/sports/${sp.id}`} className="rounded-3xl border border-[#f5c518]/15 bg-gradient-to-br from-[#141b2e] to-[#0b1120] p-5 text-center transition hover:border-[#f5c518]/50">
              <p className="text-5xl">{sp.e}</p>
              <p className="mt-2 text-lg font-black text-white">{sp.n}</p>
              <p className="mt-1 text-xs text-slate-400">{lv > 0 && <span className="mr-1 font-bold text-red-400">🔴 {bn(lv)} live</span>}{bn(n)} matches</p>
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
  if (!s) return <Page narrow><Empty emoji="🔍" text="Game not found" /></Page>;
  const live = liveTick.filter((m) => m.sport === sport);
  const up = UPCOMING_MATCHES.filter((m) => m.sport === sport);
  return (
    <Page>
      <Back href={`${base}/sports`} label="Sports" />
      <SectionTitle t={`${s.e} ${s.n}`} sub={`${bn(live.length + up.length)} matches`} />
      {live.length > 0 && (<>
        <p className="mb-2 text-sm font-black text-red-400">🔴 Live ({bn(live.length)})</p>
        <div className="grid gap-2.5 sm:grid-cols-2">{live.map((m) => <MatchCard key={m.id} m={m} ticked={m} livePulse />)}</div>
      </>)}
      {up.length > 0 && (<>
        <p className="mb-2 mt-5 text-sm font-black text-slate-300">📅 Upcoming ({bn(up.length)})</p>
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
      <div className="text-center"><p className="text-xs font-black text-red-400 animate-pulse">🔴 Live</p><p className="text-[11px] text-slate-400">{m.minute}</p></div>
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
      <p className="mb-2 text-xs font-black text-white">🎙️ Ball-by-ball <span className="font-bold text-red-400">• live</span></p>
      {/* cartoon pitch */}
      <div className="relative h-16 overflow-hidden rounded-xl bg-gradient-to-b from-emerald-900/60 to-emerald-950/80 ring-1 ring-emerald-800/40">
        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-2xl">🏃</span>
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-2xl">🏏</span>
        <span className="absolute left-1/2 top-1/2 h-8 w-1 -translate-x-1/2 -translate-y-1/2 rounded bg-amber-200/60" />
        {flying && <span className="dp-ballfly absolute text-lg" style={{ top: "45%" }}>⚪</span>}
        {!flying && <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] font-bold text-white/50">Next ball coming…</span>}
      </div>
      {/* recent balls */}
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {balls.map((b, i) => (
          <span key={`${i}-${b}`} className={`grid h-8 w-8 place-items-center rounded-full text-xs font-black ring-1 ${chip(b)} ${i === balls.length - 1 ? "dp-ballpop" : ""}`}>{b}</span>
        ))}
      </div>
      <p className="mt-2 text-[11px] text-slate-400">Last {bn(balls.length)} balls • <b className="text-emerald-300">Next ball:</b> how many runs? Bet below ⬇</p>
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
      <p className="mb-1 text-[10px] font-bold text-slate-400">📈 Odds movement (home win)</p>
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
      <p className="mb-1.5 text-xs font-black text-[#f5c518]">📋 {name} — last 5 matches</p>
      <div className="space-y-1">
        {form.map((f, i) => (
          <div key={i} className="flex items-center justify-between gap-2 rounded-lg bg-white/[0.04] px-2.5 py-1.5 text-[11px]">
            <span className="flex min-w-0 items-center gap-1.5 text-slate-300"><TeamEmblem e={f.vsE} size="sm" /><span className="truncate">vs {f.vs}</span></span>
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
  const [balls, setBalls] = useState<string[]>(["1", "0", "4", "1", "W", "2"]);
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
          const nb = ["0", "0", "1", "1", "1", "2", "2", "4", "4", "6", "W"][Math.floor(Math.random() * 11)];
          setBalls((b) => [...b.slice(-11), nb]);
          setScore((sc) => {
            let { hs = 0, as = 0 } = sc;
            if (nb === "W") as += 1;
            else if (nb === "4") hs += 4;
            else if (nb === "6") hs += 6;
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

  if (!m) return <Page narrow><Empty emoji="🔍" text="Match not found" /></Page>;
  const mm = { ...m, odds: odds ?? m.odds, hs: score.hs, as: score.as };
  const markets: { t: string; opts: { label: string; o: number; f?: number }[] }[] = [
    { t: "Match winner", opts: [{ label: m.home, o: mm.odds.h, f: m.live ? dir.h : 0 }, ...(mm.odds.d ? [{ label: "Draw", o: mm.odds.d, f: m.live ? dir.d : 0 }] : []), { label: m.away, o: mm.odds.a, f: m.live ? dir.a : 0 }] },
    ...(m.live && m.sport === "cricket" ? [{ t: "⚪ Next ball", opts: [{ label: "0 runs", o: 2.8 }, { label: "4 coming", o: 9.5 }, { label: "6 coming", o: 14.0 }, { label: "Wicket", o: 7.5 }] }] : []),
    { t: "Double chance", opts: [{ label: `${m.home}/Draw`, o: +(mm.odds.h * 0.72).toFixed(2) }, { label: `${m.away}/Draw`, o: +(mm.odds.a * 0.72).toFixed(2) }, { label: "Any win", o: 1.28 }] },
    { t: "Total goals/runs over-under", opts: [{ label: "Over 2.5", o: 1.95 }, { label: "Under 2.5", o: 1.85 }, { label: "Over 3.5", o: 2.6 }, { label: "Under 3.5", o: 1.45 }] },
    { t: "Both teams to score", opts: [{ label: "Yes", o: 1.75 }, { label: "No", o: 2.0 }] },
  ];
  return (
    <Page>
      <Back href={m.live ? `${base}/live` : `${base}/sports/${m.sport}`} label="Go back" />
      <div className={`${card} p-4`}>
        <div className="flex items-center justify-between text-[11px]"><span className={sub}>{m.league} • {sportName(m.sport)}</span>{m.live && <span className="font-black text-red-400 animate-pulse">🔴 Live</span>}</div>
        <MatchScoreLine m={mm} />
        {m.live && m.sport === "cricket" && <BallByBall balls={balls} flying={flying} />}
        {m.live && m.sport === "football" && (
          <div className="mt-3 rounded-2xl bg-black/30 p-3 ring-1 ring-white/10">
            <p className="mb-1.5 text-[11px] font-black text-white">⚡ Momentum</p>
            <div className="flex h-2.5 overflow-hidden rounded-full bg-white/10">
              <div className="bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-1000" style={{ width: `${mom}%` }} />
              <div className="flex-1 bg-gradient-to-r from-sky-500 to-sky-400 transition-all duration-1000" />
            </div>
            <div className="mt-1 flex justify-between text-[10px] font-bold text-slate-400"><span>{m.home} {bn(Math.round(mom))}%</span><span>{bn(100 - Math.round(mom))}% {m.away}</span></div>
            <div className="mt-2 grid grid-cols-3 gap-1.5 text-center text-[11px]">
              {[["🎯 Shots", `${bn(4 + Math.round(mom / 12))} - ${bn(4 + Math.round((100 - mom) / 12))}`], ["🚩 Corners", `${bn(2 + Math.round(mom / 25))} - ${bn(2 + Math.round((100 - mom) / 25))}`], ["🟨 Cards", `${bn(Math.round(mom / 40))} - ${bn(Math.round((100 - mom) / 40))}`]].map(([t, v]) => (
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
              {t === "odds" ? "📊 Odds" : "ℹ️ Info & form"}
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
          <p className="text-center text-[11px] text-slate-500">💡 Clicking odds adds to the bet slip • <b className="text-emerald-300">▲</b>/<b className="text-red-300">▼</b> = odds changed</p>
        </div>
      ) : (
        <div className={`${card} mt-3 space-y-4 p-4 text-sm`}>
          <div>
            <p><b className="text-[#f5c518]">League:</b> {m.league}</p>
            <p><b className="text-[#f5c518]">Venue:</b> {m.sport === "cricket" ? "Sher-e-Bangla Stadium, Dhaka" : m.sport === "football" ? "Bangabandhu Stadium, Dhaka" : "Indoor Stadium"}</p>
            <p><b className="text-[#f5c518]">Weather:</b> Clear, 28°C</p>
            <p className={sub}>Head-to-head: in the last 5 meetings {m.home} won 3, {m.away} won 2.</p>
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
      <Back href={base} label="Home" />
      <SectionTitle t="🔴 Live Betting" sub={`${bn(live.length)} matches live • odds update every 5 seconds`} />
      <div className="mb-3 flex items-center gap-2 rounded-2xl bg-red-500/10 px-3 py-2 ring-1 ring-red-500/30">
        <span className="relative flex h-2.5 w-2.5"><span className="absolute h-full w-full animate-ping rounded-full bg-red-500" /><span className="h-2.5 w-2.5 rounded-full bg-red-500" /></span>
        <p className="text-xs font-bold text-red-200">Live broadcast in progress — <b className="text-emerald-300">▲ green</b> means odds rose, <b className="text-red-300">▼ red</b> means they fell</p>
      </div>
      <div className="grid gap-2.5 sm:grid-cols-2">
        {live.map((m) => (
          <div key={m.id}>
            <MatchCard m={m} ticked={m} livePulse />
            <Link href={`${base}/live/${m.id}`} className="mt-1 block rounded-xl bg-red-600/15 py-1.5 text-center text-xs font-black text-red-300 hover:bg-red-600/25">
              📡 Live match centre →
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
  const [events, setEvents] = useState<string[]>(["Match started"]);
  useEffect(() => {
    if (!m) return;
    const t = setInterval(() => {
      setOdds((o) => o ? { h: +(o.h + (Math.random() - 0.5) * 0.12).toFixed(2), d: o.d ? +(o.d + (Math.random() - 0.5) * 0.12).toFixed(2) : undefined, a: +(o.a + (Math.random() - 0.5) * 0.12).toFixed(2) } : o);
      const ev = ["⚽ Attack in progress", "🛡️ Defence holding strong", "📊 Possession changed", "🎯 Chance created", "⏱️ Match heating up"][Math.floor(Math.random() * 5)];
      setEvents((e) => [`${new Date().getHours()}:${String(new Date().getMinutes()).padStart(2, "0")} — ${ev}`, ...e].slice(0, 8));
    }, 9000);
    return () => clearInterval(t);
  }, [m]);
  if (!m) return <Page narrow><Empty emoji="🔍" text="Live match not found" /></Page>;
  const mm = { ...m, odds: odds ?? m.odds };
  return (
    <Page>
      <Back href={`${base}/live`} label="Live" />
      <div className={`${card} p-4`}>
        <p className={`text-center text-[11px] ${sub}`}>{m.league}</p>
        <MatchScoreLine m={mm} />
        {/* simulated live visualization */}
        <div className="mt-4 rounded-2xl bg-emerald-950/60 p-4">
          <p className="mb-2 text-center text-[11px] font-bold text-emerald-300">📡 Live tracker (simulated)</p>
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
          <p className="mb-2 text-sm font-black text-[#f5c518]">⚡ Next event</p>
          <div className="grid grid-cols-3 gap-1.5">
            <OddsBtn match={mm} label={`${m.home} goal`} odds={2.1} small />
            <OddsBtn match={mm} label={`${m.away} goal`} odds={2.4} small />
            <OddsBtn match={mm} label="No goal" odds={3.2} small />
          </div>
        </div>
        <div className="mt-3">
          <p className="mb-2 text-sm font-black text-[#f5c518]">🏆 Match winner (live)</p>
          <div className="flex gap-1.5">
            <OddsBtn match={mm} label="1" odds={mm.odds.h} />
            {mm.odds.d !== undefined && <OddsBtn match={mm} label="X" odds={mm.odds.d} />}
            <OddsBtn match={mm} label="2" odds={mm.odds.a} />
          </div>
        </div>
      </div>
      <div className={`${card} mt-3 p-4`}>
        <p className="mb-2 text-sm font-black">📝 Live commentary</p>
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
      <Back href={base} label="Home" />
      <SectionTitle t="📅 Upcoming Matches" sub={`${bn(UPCOMING_MATCHES.length)} matches in the next 9 months`} />
      <div className="mb-4 flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
        {(["all", ...SPORTS.map((x) => x.id)] as const).map((sp) => (
          <button key={sp} onClick={() => setSport(sp)} className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-black transition ${sport === sp ? "bg-[#f5c518] text-black" : "bg-white/8 text-slate-300 ring-1 ring-white/15"}`}>
            {sp === "all" ? "🌐 All" : `${SPORTS.find((x) => x.id === sp)?.e} ${SPORTS.find((x) => x.id === sp)?.n}`}
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
      {groups.length === 0 && <Empty emoji="📅" text="No matches for this filter" />}
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
      <Back href={base} label="Home" />
      <SectionTitle t="📊 Results" sub={`Results of ${bn(FINISHED_MATCHES.length)} matches in the last 30 days`} />
      <div className="mb-4 flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
        {(["all", ...SPORTS.map((x) => x.id)] as const).map((sp) => (
          <button key={sp} onClick={() => setSport(sp)} className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-black transition ${sport === sp ? "bg-[#f5c518] text-black" : "bg-white/8 text-slate-300 ring-1 ring-white/15"}`}>
            {sp === "all" ? "🌐 All" : `${SPORTS.find((x) => x.id === sp)?.e} ${SPORTS.find((x) => x.id === sp)?.n}`}
          </button>
        ))}
      </div>
      <p className="mb-2 text-sm font-black text-white">🕘 Last 7 days</p>
      <div className="mb-5 grid gap-2.5 sm:grid-cols-2">{recent.map((m) => <MatchCard key={m.id} m={m} />)}</div>
      {older.length > 0 && (<>
        <p className="mb-2 text-sm font-black text-white">📁 Earlier results</p>
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
      <span className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-black ${added ? "bg-emerald-500/20 text-emerald-300" : "bg-[#f5c518]/12 text-[#f5c518]"}`}>{added ? "✓ Added" : bn(odds.toFixed(2))}</span>
    </button>
  );
}

export function FuturesPage() {
  const { base } = useSkin();
  return (
    <Page>
      <Back href={base} label="Home" />
      <SectionTitle t="🏆 Futures Betting" sub="Back future tournament and league champions now at the best odds" />
      <div className="mb-4 overflow-hidden rounded-3xl border border-[#f5c518]/30 bg-gradient-to-r from-amber-950/60 via-[#141b2e] to-[#0b1120] p-4">
        <p className="text-lg font-black text-white">🏆 Outright market</p>
        <p className="mt-1 text-xs leading-relaxed text-slate-300">Who will win the World Cup? Who will be league champions? Bet before the tournament starts — the earlier you bet, the better the odds. Credits are added to your balance as soon as a winner is declared.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {FUTURES.map((f, i) => (
          <div key={f.id} className="overflow-hidden rounded-3xl border border-white/10 bg-[#101828]">
            <div className={`bg-gradient-to-r ${["from-amber-600/40", "from-emerald-600/40", "from-sky-600/40", "from-violet-600/40", "from-rose-600/40", "from-indigo-600/40"][i % 6]} to-transparent px-4 py-3`}>
              <p className="text-base font-black text-white">{f.e} {f.title}</p>
              <p className="mt-0.5 text-[11px] font-bold text-slate-400">📅 Settles: {f.ends} • {bn(f.selections.length)} options</p>
            </div>
            <div className="space-y-1.5 p-3">
              {f.selections.map((sel) => (
                <FutureOddsBtn key={sel.name} market={f} name={sel.name} flag={sel.flag} odds={sel.odds} />
              ))}
            </div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-center text-[11px] text-slate-500">💡 Clicking a selection adds it to the bet slip</p>
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
    if (slip.length === 0) return setMsg("Slip is empty — select odds first");
    if (!store.user) return setMsg("Log in to place a bet");
    if (store.wallet < totalStake) return setMsg(`Low balance — needed ${money(totalStake)}, have ${money(store.wallet)}`);
    for (const s of slip) {
      const ok = store.payWithWallet(st, `🧾 Bet: ${s.match} (${s.selection})`);
      if (!ok) return setMsg("Insufficient balance");
      store.placeBet({ kind: s.live ? "live" : "sports", sport: "", match: s.match, selection: s.selection, odds: s.odds, stake: st, potential: +(st * s.odds).toFixed(0) });
    }
    clear();
    setDone(true);
  }

  if (done) return (
    <Page narrow>
      <div className="py-10 text-center">
        <p className="text-6xl">🎉</p>
        <h1 className="mt-3 text-2xl font-black text-emerald-400">Bet confirmed!</h1>
        <p className={`mt-1 text-sm ${sub}`}>Your bet has been accepted. Good luck!</p>
        <div className="mt-5 flex justify-center gap-2">
          <Link href={`${base}/my-bets`} className="rounded-xl bg-[#f5c518] px-5 py-2.5 text-sm font-black text-black">🧾 My bets</Link>
          <Link href={`${base}/sports`} className="rounded-xl border border-white/20 px-5 py-2.5 text-sm font-bold">More bets</Link>
        </div>
      </div>
    </Page>
  );

  return (
    <Page narrow>
      <Back href={base} label="Home" />
      <SectionTitle t="🧾 Bet slip" sub={`${bn(slip.length)} selections`} />
      {slip.length === 0 ? (
        <Empty emoji="🧾" text="Slip is empty — click a match's odds to add" />
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
            <p className="text-sm font-black">💰 Stake per bet</p>
            <div className="mt-2"><BetChips bet={st} setBet={(v) => setStake(String(v))} /></div>
            <input value={stake} onChange={(e) => setStake(e.target.value.replace(/\D/g, ""))} inputMode="numeric" className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-center text-lg font-black text-[#f5c518] outline-none" />
            <div className="mt-3 space-y-1 text-sm">
              <div className="flex justify-between"><span className={sub}>Total stake</span><b>{money(totalStake)}</b></div>
              <div className="flex justify-between"><span className={sub}>Potential win</span><b className="text-emerald-300">{money(totalPotential)}</b></div>
            </div>
            {msg && <p className="mt-2 rounded-xl bg-red-500/10 px-3 py-2 text-xs font-bold text-red-300">⚠️ {msg}</p>}
            {!store.user && <p className="mt-2 text-xs text-amber-300">💡 To place a bet, <Link href={`${base}/login`} className="font-bold underline">log in</Link></p>}
            <button onClick={confirm} className="mt-3 w-full rounded-xl bg-[#f5c518] py-3 text-base font-black text-black">✅ Confirm bet — {money(totalStake)}</button>
            <button onClick={clear} className="mt-2 w-full py-1 text-xs text-slate-500">Clear slip</button>
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
      <Back href={base} label="Home" />
      <div className="flex items-center justify-between">
        <SectionTitle t="🧾 My bets" sub={`${bn(open.length)} open`} />
        {open.length > 0 && (
          <button onClick={simulateSettle} className="rounded-xl bg-white/10 px-3 py-1.5 text-xs font-bold text-slate-300" title="Demo: simulate results">
            🎲 Demo results
          </button>
        )}
      </div>
      {settled && <p className="mb-2 text-center text-xs text-emerald-300">✅ Results updated!</p>}
      {open.length === 0 ? (
        <Empty emoji="🧾" text="No open bets" />
      ) : (
        <div className="space-y-2">
          {open.map((b) => (
            <div key={b.id} className={`${card} p-3`}>
              <div className="flex justify-between text-sm">
                <b>{b.match}</b>
                <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[11px] font-bold text-amber-300">{b.status}</span>
              </div>
              <p className={`mt-1 text-xs ${sub}`}>{b.selection} @ {bn(b.odds.toFixed(2))} • {b.kind === "live" ? "🔴 Live" : "⚽ Pre-match"}</p>
              <div className="mt-1.5 flex justify-between text-xs">
                <span className={sub}>Stake: {money(b.stake)}</span>
                <span className="font-bold text-emerald-300">Potential: {money(b.potential)}</span>
              </div>
              <p className={`mt-1 text-[10px] ${sub}`}>{b.id} • {fmtTime(b.date)}</p>
            </div>
          ))}
        </div>
      )}
      <Link href={`${base}/bet-history`} className="mt-4 block text-center text-sm font-bold text-[#f5c518]">📜 See bet history →</Link>
    </Page>
  );
}

export function BetHistory() {
  const { base, store, card, sub } = useSkin();
  const done = store.bets.filter((b) => b.status !== "Pending");
  const won = done.filter((b) => b.status === "Won").length;
  return (
    <Page>
      <Back href={`${base}/my-bets`} label="My bets" />
      <SectionTitle t="📜 Bet History" sub={`${bn(done.length)} settled • ${bn(won)} won`} />
      {done.length === 0 ? <Empty emoji="📜" text="No settled bets yet" /> : (
        <div className="space-y-2">
          {done.map((b) => (
            <div key={b.id} className={`${card} p-3`}>
              <div className="flex justify-between text-sm">
                <b>{b.match}</b>
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${b.status === "Won" ? "bg-emerald-500/15 text-emerald-300" : "bg-red-500/15 text-red-300"}`}>{b.status}</span>
              </div>
              <p className={`mt-1 text-xs ${sub}`}>{b.selection} @ {bn(b.odds.toFixed(2))} • stake {money(b.stake)}</p>
              {b.status === "Won" && <p className="mt-1 text-xs font-bold text-emerald-300">＋ {money(b.potential)} added</p>}
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
    ["🎯 General rules", "All bets are settled on the match's official result. Bets on cancelled matches are refunded."],
    ["⚽ Football", "Match-winner bets are settled on the 90-minute result (not extra time)."],
    ["🏏 Cricket", "If rain brings a Duckworth-Lewis result, that result is final. A super over does not count for the main bet."],
    ["🎾 Tennis", "If a player retires, the bet is void and refunded."],
    ["🔴 Live betting", "In a live match, odds change constantly. The odds at the moment the bet is accepted apply."],
    ["💰 Maximum win", "Maximum win of 1,000,000 credits on a single bet (demo)."],
    ["🚫 Restrictions", "Not for under-18s. Play responsibly."],
  ];
  return (
    <Page narrow>
      <Back href={base} label="Home" />
      <SectionTitle t="📖 Betting Rules" />
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
      <Back href={base} label="Home" />
      <SectionTitle t="🧮 Odds Guide" sub="Understand odds easily" />
      <div className={`${card} p-4 text-sm`}>
        <p className="font-black text-[#f5c518]">What are decimal odds?</p>
        <p className={`mt-1 ${sub}`}>Odds of 2.00 mean a 100-credit bet returns 200 credits in total (100 profit). Calculation: stake × odds = total return.</p>
      </div>
      <div className={`${card} mt-3 p-4`}>
        <p className="mb-2 font-black text-[#f5c518]">Example</p>
        <div className="space-y-1.5 text-sm">
          {[["1.50", "100 credits", "150 credits", "Favourite — higher chance of winning"], ["2.00", "100 credits", "200 credits", "Even chance"], ["5.00", "100 credits", "500 credits", "Underdog — higher risk, higher profit"]].map(([o, s, r, d]) => (
            <div key={o} className="flex items-center justify-between rounded-xl bg-white/[0.04] px-3 py-2">
              <span><b className="text-[#f5c518]">{bn(o)}</b> <span className={sub}>• {s}</span></span>
              <span className="text-right"><b className="text-emerald-300">{r}</b><br /><span className={`text-[10px] ${sub}`}>{d}</span></span>
            </div>
          ))}
        </div>
      </div>
      <div className={`${card} mt-3 p-4 text-sm`}>
        <p className="font-black text-[#f5c518]">What do 1 / X / 2 mean?</p>
        <p className={`mt-1 ${sub}`}>1 = home team wins, X = draw, 2 = away team wins. Cricket has no draw option.</p>
      </div>
      <div className={`${card} mt-3 p-4 text-center`}>
        <p className="text-sm font-bold">Ready?</p>
        <Link href={`${base}/sports`} className="mt-2 inline-block rounded-xl bg-[#f5c518] px-6 py-2.5 text-sm font-black text-black">⚽ Place a bet</Link>
      </div>
    </Page>
  );
}

/* ============================== CASINO ============================== */
