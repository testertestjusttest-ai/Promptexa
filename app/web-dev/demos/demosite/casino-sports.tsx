"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { toBnDigits } from "@/lib/format";
import { useDemo } from "./store";
import { Back, Empty, Field, Page, SectionTitle } from "./ui";
import { bn, money, GOLD, useSkin, useBetSlip, SPORTS, sportName, MATCHES, TABLE_GAMES, CRASH_GAMES, PROMOS, fmtTime, OddsBtn, MatchCard, GameCard, BetChips, type SportId, type CasiMatch } from "./casino-data";

export function CasinoHome() {
  const { base, def } = useSkin();
  const { count } = useBetSlip();
  const live = MATCHES.filter((m) => m.live);
  const upcoming = MATCHES.filter((m) => !m.live && !m.id.startsWith("r")).slice(0, 6);
  const [tick, setTick] = useState(0);
  useEffect(() => { const t = setInterval(() => setTick((x) => x + 1), 8000); return () => clearInterval(t); }, []);
  const jittered = useMemo(() => live.map((m) => ({
    ...m,
    odds: { h: +(m.odds.h + (Math.random() - 0.5) * 0.08).toFixed(2), d: m.odds.d ? +(m.odds.d + (Math.random() - 0.5) * 0.08).toFixed(2) : undefined, a: +(m.odds.a + (Math.random() - 0.5) * 0.08).toFixed(2) },
  })), [tick]);

  return (
    <div>
      {/* hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#1a1405] via-[#0b1120] to-[#0b1120] px-4 pb-8 pt-8">
        <div className="pointer-events-none absolute -right-10 -top-10 text-[160px] opacity-10">🎰</div>
        <div className="pointer-events-none absolute -left-6 bottom-0 text-[110px] opacity-10">⚽</div>
        <div className="mx-auto max-w-6xl">
          <p className="inline-block rounded-full border border-[#f5c518]/40 bg-[#f5c518]/10 px-3 py-1 text-[11px] font-black text-[#f5c518]">🎮 ডেমো প্ল্যাটফর্ম — ভার্চুয়াল ব্যালেন্স</p>
          <h1 className="mt-3 text-3xl font-black leading-tight text-white sm:text-5xl">
            {def.heroTitle || "খেলুন, জিতুন,"} <span className="text-[#f5c518]">উপভোগ করুন</span>
          </h1>
          <p className="mt-2 max-w-xl text-sm text-slate-400">লাইভ স্পোর্টস বেটিং • ৫০০+ ক্যাসিনো গেম • তিন পাত্তি • ক্র্যাশ — সব এক জায়গায়</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link href={`${base}/live`} className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-red-900/40">🔴 লাইভ বেটিং</Link>
            <Link href={`${base}/casino`} className="rounded-xl bg-[#f5c518] px-5 py-2.5 text-sm font-black text-black shadow-lg shadow-yellow-900/30">🎰 ক্যাসিনো লবি</Link>
            <Link href={`${base}/signup`} className="rounded-xl border border-white/20 px-5 py-2.5 text-sm font-black text-white">🎁 ৫,০০০ বোনাস নিন</Link>
          </div>
          <div className="mt-6 grid grid-cols-3 gap-2 text-center">
            {[["⚽", "২৬+", "লাইভ ম্যাচ"], ["🎰", "৫০০+", "ক্যাসিনো গেম"], ["💰", "১ কোটি+", "জ্যাকপট"]].map(([e, v, t]) => (
              <div key={t} className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                <p className="text-2xl">{e}</p>
                <p className="text-lg font-black text-[#f5c518]">{v}</p>
                <p className="text-[11px] text-slate-400">{t}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Page>
        {/* sports quick nav */}
        <div className="grid grid-cols-4 gap-2">
          {SPORTS.map((s) => (
            <Link key={s.id} href={`${base}/sports/${s.id}`} className="rounded-2xl border border-[#f5c518]/15 bg-[#101828]/90 p-3 text-center transition hover:border-[#f5c518]/50">
              <p className="text-3xl">{s.e}</p>
              <p className="mt-1 text-xs font-black">{s.n}</p>
            </Link>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <SectionTitle t="🔴 লাইভ বেটিং" sub="এখন চলছে" />
          <Link href={`${base}/live`} className="text-xs font-bold text-[#f5c518]">সব দেখুন →</Link>
        </div>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {jittered.map((m) => <MatchCard key={m.id} m={m} livePulse />)}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <SectionTitle t="📅 আসন্ন ম্যাচ" sub="শীঘ্রই শুরু" />
          <Link href={`${base}/upcoming`} className="text-xs font-bold text-[#f5c518]">সব দেখুন →</Link>
        </div>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {upcoming.map((m) => <MatchCard key={m.id} m={m} />)}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <SectionTitle t="🎰 জনপ্রিয় গেম" sub="এখনই খেলুন" />
          <Link href={`${base}/casino`} className="text-xs font-bold text-[#f5c518]">লবি →</Link>
        </div>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {[...CRASH_GAMES.slice(0, 2), ...TABLE_GAMES.slice(4, 6)].map((g) => (
            <GameCard key={g.id} g={g} />
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <SectionTitle t="🎁 প্রোমোশন" />
          <Link href={`${base}/promotions`} className="text-xs font-bold text-[#f5c518]">সব দেখুন →</Link>
        </div>
        <div className="grid gap-2.5 sm:grid-cols-3">
          {PROMOS.slice(0, 3).map((p) => (
            <Link key={p.id} href={`${base}/promotions/${p.id}`} className="rounded-2xl border border-[#f5c518]/15 bg-[#101828]/90 p-4 transition hover:border-[#f5c518]/50">
              <p className="text-2xl">{p.e}</p>
              <p className="mt-1 text-sm font-black">{p.t}</p>
              <p className="mt-1 text-xs text-slate-400">{p.d}</p>
            </Link>
          ))}
        </div>

        {count > 0 && (
          <Link href={`${base}/betslip`} className="fixed bottom-20 right-4 z-40 flex items-center gap-2 rounded-full bg-[#f5c518] px-5 py-3 text-sm font-black text-black shadow-2xl">
            🧾 বেট স্লিপ <span className="rounded-full bg-black px-2 text-xs text-[#f5c518]">{bn(count)}</span>
          </Link>
        )}
      </Page>
    </div>
  );
}

export function SportsHome() {
  const { base } = useSkin();
  return (
    <Page>
      <Back href={base} label="হোম" />
      <SectionTitle t="⚽ স্পোর্টস বেটিং" sub="খেলা বেছে নিন" />
      <div className="grid grid-cols-2 gap-3">
        {SPORTS.map((s) => {
          const n = MATCHES.filter((m) => m.sport === s.id && !m.id.startsWith("r")).length;
          const lv = MATCHES.filter((m) => m.sport === s.id && m.live).length;
          return (
            <Link key={s.id} href={`${base}/sports/${s.id}`} className="rounded-3xl border border-[#f5c518]/15 bg-gradient-to-br from-[#141b2e] to-[#0b1120] p-6 text-center transition hover:border-[#f5c518]/50">
              <p className="text-5xl">{s.e}</p>
              <p className="mt-2 text-lg font-black">{s.n}</p>
              <p className="mt-1 text-xs text-slate-400">{lv > 0 && <span className="mr-1 font-bold text-red-400">🔴 {bn(lv)} লাইভ</span>}{bn(n)}টি ম্যাচ</p>
            </Link>
          );
        })}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        {([["/live", "🔴", "লাইভ"], ["/upcoming", "📅", "আসন্ন"], ["/results", "📊", "ফলাফল"]] as const).map(([h, e, t]) => (
          <Link key={h} href={`${base}${h}`} className="rounded-2xl bg-white/5 p-4 transition hover:bg-white/10">
            <p className="text-2xl">{e}</p><p className="mt-1 text-xs font-black">{t}</p>
          </Link>
        ))}
      </div>
    </Page>
  );
}

export function SportPage({ sport }: { sport: string }) {
  const { base } = useSkin();
  const s = SPORTS.find((x) => x.id === sport);
  const [tick, setTick] = useState(0);
  useEffect(() => { const t = setInterval(() => setTick((x) => x + 1), 9000); return () => clearInterval(t); }, []);
  const list = useMemo(() => MATCHES.filter((m) => m.sport === sport && !m.id.startsWith("r")).map((m) =>
    m.live ? { ...m, odds: { h: +(m.odds.h + (Math.random() - 0.5) * 0.08).toFixed(2), d: m.odds.d ? +(m.odds.d + (Math.random() - 0.5) * 0.08).toFixed(2) : undefined, a: +(m.odds.a + (Math.random() - 0.5) * 0.08).toFixed(2) } } : m
  ), [sport, tick]);
  if (!s) return <Page narrow><Empty emoji="🔍" text="খেলা পাওয়া যায়নি" /></Page>;
  const live = list.filter((m) => m.live);
  const up = list.filter((m) => !m.live);
  return (
    <Page>
      <Back href={`${base}/sports`} label="স্পোর্টস" />
      <SectionTitle t={`${s.e} ${s.n}`} sub={`${bn(list.length)}টি ম্যাচ`} />
      {live.length > 0 && (<>
        <p className="mb-2 text-sm font-black text-red-400">🔴 লাইভ ({bn(live.length)})</p>
        <div className="grid gap-2.5 sm:grid-cols-2">{live.map((m) => <MatchCard key={m.id} m={m} livePulse />)}</div>
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
      <div className="text-center"><p className="text-3xl">{m.he}</p><p className="mt-1 text-xs font-bold">{m.home}</p><p className="text-2xl font-black text-[#f5c518]">{bn(m.hs)}{m.sport === "cricket" && m.as !== undefined ? `/${bn(m.as)}` : ""}</p></div>
      <div className="text-center"><p className="text-xs font-black text-red-400 animate-pulse">🔴 লাইভ</p><p className="text-[11px] text-slate-400">{m.minute}</p></div>
      <div className="text-center"><p className="text-3xl">{m.ae}</p><p className="mt-1 text-xs font-bold">{m.away}</p>{m.sport !== "cricket" && m.as !== undefined && <p className="text-2xl font-black text-[#f5c518]">{bn(m.as)}</p>}</div>
    </div>
  );
}

export function MatchDetail({ id }: { id: string }) {
  const { base, card, sub } = useSkin();
  const m = MATCHES.find((x) => x.id === id);
  const [tab, setTab] = useState<"odds" | "info">("odds");
  const [odds, setOdds] = useState(m?.odds);
  useEffect(() => {
    if (!m?.live) return;
    const t = setInterval(() => setOdds((o) => o ? { h: +(o.h + (Math.random() - 0.5) * 0.1).toFixed(2), d: o.d ? +(o.d + (Math.random() - 0.5) * 0.1).toFixed(2) : undefined, a: +(o.a + (Math.random() - 0.5) * 0.1).toFixed(2) } : o), 6000);
    return () => clearInterval(t);
  }, [m?.live]);
  if (!m) return <Page narrow><Empty emoji="🔍" text="ম্যাচ পাওয়া যায়নি" /></Page>;
  const mm = { ...m, odds: odds ?? m.odds };
  const markets: { t: string; opts: { label: string; o: number }[] }[] = [
    { t: "ম্যাচ উইনার", opts: [{ label: m.home, o: mm.odds.h }, ...(mm.odds.d ? [{ label: "ড্র", o: mm.odds.d }] : []), { label: m.away, o: mm.odds.a }] },
    { t: "ডাবল চান্স", opts: [{ label: `${m.home}/ড্র`, o: +(mm.odds.h * 0.72).toFixed(2) }, { label: `${m.away}/ড্র`, o: +(mm.odds.a * 0.72).toFixed(2) }, { label: "যেকোনো জয়", o: 1.28 }] },
    { t: "মোট গোল/রান ওভার-আন্ডার", opts: [{ label: "ওভার ২.৫", o: 1.95 }, { label: "আন্ডার ২.৫", o: 1.85 }, { label: "ওভার ৩.৫", o: 2.6 }, { label: "আন্ডার ৩.৫", o: 1.45 }] },
    { t: "উভয় দল স্কোর করবে", opts: [{ label: "হ্যাঁ", o: 1.75 }, { label: "না", o: 2.0 }] },
  ];
  return (
    <Page>
      <Back href={m.live ? `${base}/live` : `${base}/sports/${m.sport}`} label="ফিরে যান" />
      <div className={`${card} p-4`}>
        <div className="flex items-center justify-between text-[11px]"><span className={sub}>{m.league} • {sportName(m.sport)}</span>{m.live && <span className="font-black text-red-400 animate-pulse">🔴 লাইভ</span>}</div>
        <MatchScoreLine m={m} />
        {!m.live && <p className="mt-3 text-center text-sm text-slate-400">🕐 {m.time}</p>}
        <div className="mt-4 flex gap-2">
          {(["odds", "info"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`flex-1 rounded-xl py-2 text-sm font-black ${tab === t ? "bg-[#f5c518] text-black" : "bg-white/5 text-slate-400"}`}>
              {t === "odds" ? "📊 অডস" : "ℹ️ তথ্য"}
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
                    <OddsBtn match={mm} label={o.label} odds={o.o} small />
                  </div>
                ))}
              </div>
            </div>
          ))}
          <p className="text-center text-[11px] text-slate-500">💡 অডসে ক্লিক করলেই বেট স্লিপে যোগ হবে</p>
        </div>
      ) : (
        <div className={`${card} mt-3 space-y-2 p-4 text-sm`}>
          <p><b className="text-[#f5c518]">লিগ:</b> {m.league}</p>
          <p><b className="text-[#f5c518]">ভেন্যু:</b> {m.sport === "cricket" ? "শের-ই-বাংলা স্টেডিয়াম, ঢাকা" : m.sport === "football" ? "বঙ্গবন্ধু স্টেডিয়াম, ঢাকা" : "ইনডোর স্টেডিয়াম"}</p>
          <p><b className="text-[#f5c518]">আবহাওয়া:</b> পরিষ্কার, ২৮°সে</p>
          <p className={sub}>হেড-টু-হেড: শেষ ৫ দেখায় {m.home} ৩টি, {m.away} ২টি জিতেছে। ফর্ম বিবেচনায় অডস নির্ধারিত।</p>
        </div>
      )}
    </Page>
  );
}

export function LiveBetting() {
  const { base } = useSkin();
  const [tick, setTick] = useState(0);
  useEffect(() => { const t = setInterval(() => setTick((x) => x + 1), 7000); return () => clearInterval(t); }, []);
  const live = useMemo(() => MATCHES.filter((m) => m.live).map((m) => ({
    ...m,
    odds: { h: +(m.odds.h + (Math.random() - 0.5) * 0.08).toFixed(2), d: m.odds.d ? +(m.odds.d + (Math.random() - 0.5) * 0.08).toFixed(2) : undefined, a: +(m.odds.a + (Math.random() - 0.5) * 0.08).toFixed(2) },
  })), [tick]);
  return (
    <Page>
      <Back href={base} label="হোম" />
      <SectionTitle t="🔴 লাইভ বেটিং" sub={`${bn(live.length)}টি ম্যাচ চলছে • অডস লাইভ আপডেট হচ্ছে`} />
      <div className="grid gap-2.5 sm:grid-cols-2">
        {live.map((m) => (
          <div key={m.id}>
            <MatchCard m={m} livePulse />
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
  const list = MATCHES.filter((m) => !m.live && !m.id.startsWith("r"));
  return (
    <Page>
      <Back href={base} label="হোম" />
      <SectionTitle t="📅 আসন্ন ম্যাচ" sub={`${bn(list.length)}টি ম্যাচ`} />
      <div className="grid gap-2.5 sm:grid-cols-2">{list.map((m) => <MatchCard key={m.id} m={m} />)}</div>
    </Page>
  );
}

export function Results() {
  const { base, card, sub } = useSkin();
  const list = MATCHES.filter((m) => m.id.startsWith("r"));
  return (
    <Page>
      <Back href={base} label="হোম" />
      <SectionTitle t="📊 ফলাফল" sub="সমাপ্ত ম্যাচ" />
      <div className="space-y-2.5">
        {list.map((m) => (
          <div key={m.id} className={`${card} p-3`}>
            <p className={`text-[11px] ${sub}`}>{m.league} • {m.time}</p>
            <div className="mt-1.5 flex items-center justify-between text-sm font-bold">
              <span>{m.he} {m.home}</span><b className="text-[#f5c518]">{bn(m.hs ?? 0)}</b>
            </div>
            <div className="mt-1 flex items-center justify-between text-sm font-bold">
              <span>{m.ae} {m.away}</span><b className="text-[#f5c518]">{bn(m.as ?? 0)}</b>
            </div>
            <p className="mt-1.5 text-[11px] text-emerald-300">✅ {(m.hs ?? 0) > (m.as ?? 0) ? m.home : m.away} জিতেছে</p>
          </div>
        ))}
      </div>
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
  const open = store.bets.filter((b) => b.status === "পেন্ডিং");

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
  const done = store.bets.filter((b) => b.status !== "পেন্ডিং");
  const won = done.filter((b) => b.status === "জিতেছেন").length;
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
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${b.status === "জিতেছেন" ? "bg-emerald-500/15 text-emerald-300" : "bg-red-500/15 text-red-300"}`}>{b.status}</span>
              </div>
              <p className={`mt-1 text-xs ${sub}`}>{b.selection} @ {bn(b.odds.toFixed(2))} • স্টেক {money(b.stake)}</p>
              {b.status === "জিতেছেন" && <p className="mt-1 text-xs font-bold text-emerald-300">＋ {money(b.potential)} যোগ হয়েছে</p>}
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
