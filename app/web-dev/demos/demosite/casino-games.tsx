"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { toBnDigits } from "@/lib/format";
import { useDemo } from "./store";
import { Back, Empty, Field, Page, SectionTitle } from "./ui";
import { bn, money, GOLD, useSkin, useBetSlip, SLOT_GAMES, LIVE_GAMES, ALL_GAMES, TOURNAMENTS, fmtTime, gameHref, GameCard, GameShell, BetChips, useGameRound, rankVal, drawCard, CardView, type SportId, type CasiMatch } from "./casino-data";

export function CasinoLobby() {
  const { base } = useSkin();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const cats = [["all", "🎮 সব"], ["slots", "🎰 স্লটস"], ["table", "🃏 টেবিল"], ["desi", "🪔 দেশি"], ["crash", "📈 ক্র্যাশ"], ["live", "🎥 লাইভ"]] as const;
  const list = ALL_GAMES.filter((g) => (cat === "all" || g.cat === cat) && (!q || g.n.includes(q)));
  return (
    <Page>
      <Back href={base} label="হোম" />
      <SectionTitle t="🎰 ক্যাসিনো লবি" sub={`${bn(ALL_GAMES.length)}টি গেম`} />
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="🔍 গেম খুঁজুন..."
        className="mb-3 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white outline-none placeholder:text-slate-500" />
      <div className="mb-4 flex gap-1.5 overflow-x-auto pb-1">
        {cats.map(([id, t]) => (
          <button key={id} onClick={() => setCat(id)}
            className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-black ${cat === id ? "bg-[#f5c518] text-black" : "bg-white/5 text-slate-300"}`}>{t}</button>
        ))}
      </div>
      {list.length === 0 ? <Empty emoji="🔍" text="গেম পাওয়া যায়নি" /> : (
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {list.map((g) => <GameCard key={g.id} g={g} />)}
        </div>
      )}
    </Page>
  );
}

export function SlotsList() {
  const { base } = useSkin();
  return (
    <Page>
      <Back href={`${base}/casino`} label="লবি" />
      <SectionTitle t="🎰 স্লট গেমস" sub={`${bn(SLOT_GAMES.length)}টি স্লট`} />
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {SLOT_GAMES.map((g) => <GameCard key={g.id} g={g} />)}
      </div>
    </Page>
  );
}

const SLOT_SYMBOLS: Record<string, string[]> = {
  royal: ["👑", "💎", "7️⃣", "🍒", "⭐", "🔔"],
  golden7: ["7️⃣", "💰", "🍋", "⭐", "🔔", "🍒"],
  fruit: ["🍒", "🍋", "🍇", "🍉", "⭐", "🔔"],
  diamond: ["💎", "👑", "💰", "⭐", "🔔", "🍒"],
  lucky: ["🍀", "⭐", "🔔", "🍒", "💰", "👑"],
  pharaoh: ["🏺", "👑", "💎", "🐍", "⭐", "🔔"],
};

export function SlotGame({ id }: { id: string }) {
  const g = SLOT_GAMES.find((x) => x.id === id) ?? SLOT_GAMES[0];
  const { store } = useSkin();
  const finish = useGameRound(g.n);
  const syms = SLOT_SYMBOLS[g.id] ?? SLOT_SYMBOLS.royal;
  const [bet, setBet] = useState(50);
  const [grid, setGrid] = useState<string[]>(() => Array.from({ length: 9 }, () => syms[Math.floor(Math.random() * syms.length)]));
  const [spinning, setSpinning] = useState(false);
  const [msg, setMsg] = useState("");
  const [win, setWin] = useState(0);

  function spin() {
    setMsg(""); setWin(0);
    if (spinning) return;
    if (!store.payWithWallet(bet, `🎰 ${g.n}`)) { setMsg("ব্যালেন্স কম — ডিপোজিট করুন"); return; }
    setSpinning(true);
    let n = 0;
    const t = setInterval(() => {
      setGrid(Array.from({ length: 9 }, () => syms[Math.floor(Math.random() * syms.length)]));
      if (++n > 10) {
        clearInterval(t);
        const final = Array.from({ length: 9 }, () => syms[Math.floor(Math.random() * syms.length)]);
        setGrid(final);
        // paylines: 3 rows — 3 of a kind pays
        let mult = 0;
        const lines = [[0, 1, 2], [3, 4, 5], [6, 7, 8]];
        for (const [a, b2, c] of lines) {
          if (final[a] === final[b2] && final[b2] === final[c]) {
            mult += final[a] === syms[0] ? 10 : final[a] === syms[1] ? 6 : 3;
          }
        }
        if (final[4] === syms[0]) mult += 2; // center bonus
        const w = Math.round(bet * mult);
        setWin(w);
        finish(bet, w);
        setMsg(w > 0 ? `🎉 জিতেছেন ${money(w)}!` : "😅 আবার চেষ্টা করুন");
        setSpinning(false);
      }
    }, 90);
  }

  return (
    <GameShell title={g.n} emoji={g.e} rtp={g.rtp}>
      <div className={`grid grid-cols-3 gap-2 rounded-2xl bg-black/40 p-4 ${spinning ? "animate-pulse" : ""}`}>
        {grid.map((s, i) => (
          <div key={i} className="flex h-20 items-center justify-center rounded-xl bg-gradient-to-b from-[#1c2440] to-[#101828] text-4xl">{s}</div>
        ))}
      </div>
      {msg && <p className={`mt-3 text-center text-sm font-black ${win > 0 ? "text-emerald-300" : "text-slate-400"}`}>{msg}</p>}
      <div className="mt-4">
        <p className="mb-1.5 text-xs font-bold text-slate-400">বাজি</p>
        <BetChips bet={bet} setBet={setBet} />
      </div>
      <button onClick={spin} disabled={spinning}
        className="mt-4 w-full rounded-2xl bg-gradient-to-r from-amber-500 to-[#f5c518] py-4 text-xl font-black text-black shadow-lg disabled:opacity-50">
        {spinning ? "🌀 ঘুরছে..." : "🎰 স্পিন করুন"}
      </button>
      <p className="mt-2 text-center text-[11px] text-slate-500">৩টি একই সিম্বল = ৩x–১০x • মাঝের {syms[0]} = বোনাস</p>
    </GameShell>
  );
}

export function LiveCasino() {
  const { base } = useSkin();
  return (
    <Page>
      <Back href={`${base}/casino`} label="লবি" />
      <SectionTitle t="🎥 লাইভ ক্যাসিনো" sub="রিয়েল ডিলার (সিমুলেটেড)" />
      <div className="mb-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-center text-xs text-red-200">
        🔴 এখন {bn(LIVE_GAMES.length)}টি টেবিল লাইভ — ডিলার অপেক্ষা করছে
      </div>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {LIVE_GAMES.map((g) => <GameCard key={g.id} g={g} />)}
      </div>
    </Page>
  );
}

export function LiveGameDetail({ id }: { id: string }) {
  const { base, card, sub } = useSkin();
  const g = LIVE_GAMES.find((x) => x.id === id);
  const [seats, setSeats] = useState(7);
  useEffect(() => {
    const t = setInterval(() => setSeats(3 + Math.floor(Math.random() * 8)), 5000);
    return () => clearInterval(t);
  }, []);
  if (!g) return <Page narrow><Empty emoji="🔍" text="টেবিল পাওয়া যায়নি" /></Page>;
  const target = g.id.replace("live-", "");
  const targetGame = ALL_GAMES.find((x) => x.id === target);
  const joinHref = targetGame ? `${base}${gameHref(targetGame)}` : `${base}/casino`;
  return (
    <Page narrow>
      <Back href={`${base}/casino/live`} label="লাইভ ক্যাসিনো" />
      <div className={`${card} overflow-hidden`}>
        <div className="relative bg-gradient-to-b from-emerald-950 to-[#0b1120] p-6 text-center">
          <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-red-600 px-2.5 py-1 text-[11px] font-black text-white animate-pulse">🔴 লাইভ</span>
          <p className="text-6xl">{g.e}</p>
          <h1 className="mt-2 text-xl font-black">{g.n}</h1>
          <p className={`mt-1 text-xs ${sub}`}>🎩 ডিলার: রিয়া • 💺 {bn(seats)} জন খেলছেন</p>
          {/* simulated dealer video */}
          <div className="mx-auto mt-4 flex h-36 max-w-sm items-center justify-center rounded-2xl border border-emerald-800 bg-black/50">
            <div className="text-center">
              <p className="text-5xl animate-pulse">🎩</p>
              <p className="mt-1 text-[11px] text-slate-400">ডিলার ভিডিও (সিমুলেটেড)</p>
            </div>
          </div>
        </div>
        <div className="p-4">
          <p className="mb-2 text-sm font-black text-[#f5c518]">💬 লাইভ চ্যাট (ডেমো)</p>
          <div className="mb-3 max-h-28 space-y-1 overflow-y-auto text-xs">
            {["রহিম: শুভকামনা সবাইকে! 🍀", "সাকিব: ডিলার আজ দারুণ", "নুসরাত: বড় জয় আসছে...", "করিম: তিন পাত্তি সেরা!"].map((c, i) => (
              <p key={i} className={sub}>{c}</p>
            ))}
          </div>
          <Link href={joinHref}
            className="block w-full rounded-xl bg-[#f5c518] py-3 text-center font-black text-black">
            ▶️ টেবিলে যোগ দিন
          </Link>
          <p className="mt-2 text-center text-[11px] text-slate-500">ডেমো টেবিল — একই গেম ইঞ্জিনে খেলুন</p>
        </div>
      </div>
    </Page>
  );
}

/* ---------- playable table games ---------- */

export function RouletteGame() {
  const { store } = useSkin();
  const finish = useGameRound("রুলেট");
  const [bet, setBet] = useState(50);
  const [pick, setPick] = useState<"red" | "black" | number>("red");
  const [spinning, setSpinning] = useState(false);
  const [num, setNum] = useState<number | null>(null);
  const [msg, setMsg] = useState("");
  const REDS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

  function spin() {
    setMsg("");
    if (spinning) return;
    if (!store.payWithWallet(bet, "🎡 রুলেট")) { setMsg("ব্যালেন্স কম — ডিপোজিট করুন"); return; }
    setSpinning(true);
    let n = 0;
    const t = setInterval(() => {
      setNum(Math.floor(Math.random() * 37));
      if (++n > 12) {
        clearInterval(t);
        const r = Math.floor(Math.random() * 37);
        setNum(r);
        const isRed = REDS.includes(r);
        let win = 0;
        if (typeof pick === "number" && pick === r) win = bet * 35;
        else if (pick === "red" && isRed && r !== 0) win = Math.round(bet * 1.95);
        else if (pick === "black" && !isRed && r !== 0) win = Math.round(bet * 1.95);
        finish(bet, win);
        setMsg(win > 0 ? `🎉 ${bn(r)}! জিতেছেন ${money(win)}` : `😅 ${bn(r)} — হারলেন`);
        setSpinning(false);
      }
    }, 100);
  }

  const color = num === null ? "" : num === 0 ? "bg-emerald-600" : REDS.includes(num) ? "bg-red-600" : "bg-slate-800";
  return (
    <GameShell title="রুলেট" emoji="🎡" rtp="৯৭.৩%">
      <div className="flex justify-center">
        <div className={`flex h-28 w-28 items-center justify-center rounded-full border-4 border-[#f5c518] text-4xl font-black text-white transition ${spinning ? "animate-spin" : ""} ${color || "bg-slate-800"}`}>
          {num === null ? "🎡" : bn(num)}
        </div>
      </div>
      {msg && <p className="mt-2 text-center text-sm font-black text-[#f5c518]">{msg}</p>}
      <p className="mb-1.5 mt-4 text-xs font-bold text-slate-400">বেছে নিন</p>
      <div className="grid grid-cols-2 gap-1.5">
        <button onClick={() => setPick("red")} className={`rounded-xl py-2.5 font-black ${pick === "red" ? "bg-red-600 text-white" : "bg-white/5"}`}>🔴 লাল (১.৯৫x)</button>
        <button onClick={() => setPick("black")} className={`rounded-xl py-2.5 font-black ${pick === "black" ? "bg-slate-700 text-white ring-2 ring-white/40" : "bg-white/5"}`}>⚫ কালো (১.৯৫x)</button>
      </div>
      <div className="mt-2 flex flex-wrap gap-1">
        {[0, 7, 14, 21, 28, 36].map((v) => (
          <button key={v} onClick={() => setPick(v)} className={`rounded-lg px-2.5 py-1 text-xs font-black ${pick === v ? "bg-[#f5c518] text-black" : "bg-white/10"}`}>{bn(v)} (৩৫x)</button>
        ))}
      </div>
      <div className="mt-3"><p className="mb-1.5 text-xs font-bold text-slate-400">বাজি</p><BetChips bet={bet} setBet={setBet} /></div>
      <button onClick={spin} disabled={spinning} className="mt-4 w-full rounded-2xl bg-[#f5c518] py-3.5 text-lg font-black text-black disabled:opacity-50">
        {spinning ? "🌀 ঘুরছে..." : "🎡 স্পিন"}
      </button>
    </GameShell>
  );
}

const bjVal = (hand: string[]) => {
  let t = 0, aces = 0;
  for (const c of hand) {
    const r = c.slice(0, -1);
    if (r === "A") { aces++; t += 11; }
    else if (["K", "Q", "J"].includes(r)) t += 10;
    else t += parseInt(r);
  }
  while (t > 21 && aces > 0) { t -= 10; aces--; }
  return t;
};

export function BlackjackGame() {
  const { store } = useSkin();
  const finish = useGameRound("ব্ল্যাকজ্যাক");
  const [bet, setBet] = useState(50);
  const [ph, setPh] = useState<string[]>([]);
  const [dh, setDh] = useState<string[]>([]);
  const [stage, setStage] = useState<"bet" | "play" | "done">("bet");
  const [msg, setMsg] = useState("");

  function deal() {
    setMsg("");
    if (!store.payWithWallet(bet, "🂡 ব্ল্যাকজ্যাক")) { setMsg("ব্যালেন্স কম — ডিপোজিট করুন"); return; }
    const used = new Set<string>();
    const p = [drawCard(used), drawCard(used)], d = [drawCard(used), drawCard(used)];
    setPh(p); setDh(d); setStage("play");
    if (bjVal(p) === 21) end(p, d, true);
  }
  function end(p: string[], d: string[], bj = false) {
    let dd = [...d];
    const used = new Set<string>([...p, ...d]);
    while (bjVal(dd) < 17) dd.push(drawCard(used));
    setDh(dd);
    const pv = bjVal(p), dv = bjVal(dd);
    let win = 0;
    if (bj && pv === 21) win = Math.round(bet * 2.5);
    else if (pv > 21) win = 0;
    else if (dv > 21 || pv > dv) win = bet * 2;
    else if (pv === dv) win = bet;
    finish(bet, win);
    setMsg(win > bet ? `🎉 জিতেছেন ${money(win)}!` : win === bet ? "🤝 ড্র — বাজি ফেরত" : `😅 হেরেছেন (ডিলার ${bn(dv)})`);
    setStage("done");
  }
  const hit = () => {
    const used = new Set<string>([...ph, ...dh]);
    const p = [...ph, drawCard(used)];
    setPh(p);
    if (bjVal(p) > 21) end(p, dh);
    else if (bjVal(p) === 21) end(p, dh);
  };

  return (
    <GameShell title="ব্ল্যাকজ্যাক" emoji="🂡" rtp="৯৯.৪%">
      {stage === "bet" ? (
        <>
          <p className="text-center text-6xl">🂡</p>
          <p className="mt-2 text-center text-sm text-slate-400">২১-এর কাছাকাছি যান, পার হবেন না!</p>
          <div className="mt-3"><p className="mb-1.5 text-xs font-bold text-slate-400">বাজি</p><BetChips bet={bet} setBet={setBet} /></div>
          {msg && <p className="mt-2 text-center text-xs font-bold text-red-300">{msg}</p>}
          <button onClick={deal} className="mt-4 w-full rounded-2xl bg-[#f5c518] py-3.5 font-black text-black">🃏 ডিল করুন</button>
        </>
      ) : (
        <>
          <div className="rounded-2xl bg-emerald-950/50 p-3">
            <p className="text-xs text-slate-400">ডিলার {stage === "play" ? "(একটি গোপন)" : ""} — {stage === "done" ? bn(bjVal(dh)) : "?"}</p>
            <div className="mt-1 flex gap-1.5">{dh.map((c, i) => <span key={i}>{i === 1 && stage === "play" ? <span className="inline-flex h-14 w-11 items-center justify-center rounded-lg bg-[#f5c518]/20 text-lg">❓</span> : <CardView c={c} />}</span>)}</div>
          </div>
          <div className="mt-3 rounded-2xl bg-emerald-950/50 p-3">
            <p className="text-xs text-slate-400">আপনি — {bn(bjVal(ph))}</p>
            <div className="mt-1 flex gap-1.5">{ph.map((c, i) => <CardView key={i} c={c} />)}</div>
          </div>
          {msg && <p className="mt-3 text-center text-sm font-black text-[#f5c518]">{msg}</p>}
          {stage === "play" ? (
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button onClick={hit} className="rounded-xl bg-[#f5c518] py-3 font-black text-black">👆 হিট</button>
              <button onClick={() => end(ph, dh)} className="rounded-xl border border-white/20 py-3 font-black">✋ স্ট্যান্ড</button>
            </div>
          ) : (
            <button onClick={() => { setStage("bet"); setPh([]); setDh([]); setMsg(""); }} className="mt-4 w-full rounded-xl bg-[#f5c518] py-3 font-black text-black">🔄 আবার খেলুন</button>
          )}
        </>
      )}
    </GameShell>
  );
}

export function BaccaratGame() {
  const { store } = useSkin();
  const finish = useGameRound("ব্যাকারাট");
  const [bet, setBet] = useState(50);
  const [pick, setPick] = useState<"player" | "banker" | "tie">("player");
  const [ph, setPh] = useState<string[]>([]);
  const [bh, setBh] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const [msg, setMsg] = useState("");
  const bv = (h: string[]) => h.reduce((s, c) => { const r = c.slice(0, -1); return s + (["K", "Q", "J", "10"].includes(r) ? 0 : r === "A" ? 1 : parseInt(r)); }, 0) % 10;

  function play() {
    setMsg("");
    if (!store.payWithWallet(bet, "🃏 ব্যাকারাট")) { setMsg("ব্যালেন্স কম — ডিপোজিট করুন"); return; }
    const used = new Set<string>();
    const p = [drawCard(used), drawCard(used)], b = [drawCard(used), drawCard(used)];
    if (bv(p) <= 5) p.push(drawCard(used));
    if (bv(b) <= 5) b.push(drawCard(used));
    setPh(p); setBh(b); setDone(true);
    const pv = bv(p), bval = bv(b);
    let win = 0;
    if (pv === bval && pick === "tie") win = bet * 8;
    else if (pv > bval && pick === "player") win = bet * 2;
    else if (bval > pv && pick === "banker") win = Math.round(bet * 1.95);
    finish(bet, win);
    setMsg(win > 0 ? `🎉 জিতেছেন ${money(win)}!` : `😅 হেরেছেন (প্লেয়ার ${bn(pv)} — ব্যাংকার ${bn(bval)})`);
  }
  return (
    <GameShell title="ব্যাকারাট" emoji="🃏" rtp="৯৮.৯%">
      {(["player", "banker", "tie"] as const).map((k) => (
        <button key={k} onClick={() => { setPick(k); setDone(false); }}
          className={`mb-1.5 w-full rounded-xl py-2.5 text-sm font-black ${pick === k ? "bg-[#f5c518] text-black" : "bg-white/5"}`}>
          {k === "player" ? "🧍 প্লেয়ার (২x)" : k === "banker" ? "🏦 ব্যাংকার (১.৯৫x)" : "🤝 টাই (৮x)"}
        </button>
      ))}
      {done && (
        <div className="mt-2 grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-white/5 p-2 text-center"><p className="text-xs text-slate-400">প্লেয়ার {bn(bv(ph))}</p><div className="mt-1 flex justify-center gap-1">{ph.map((c, i) => <CardView key={i} c={c} small />)}</div></div>
          <div className="rounded-xl bg-white/5 p-2 text-center"><p className="text-xs text-slate-400">ব্যাংকার {bn(bv(bh))}</p><div className="mt-1 flex justify-center gap-1">{bh.map((c, i) => <CardView key={i} c={c} small />)}</div></div>
        </div>
      )}
      {msg && <p className="mt-2 text-center text-sm font-black text-[#f5c518]">{msg}</p>}
      <div className="mt-3"><p className="mb-1.5 text-xs font-bold text-slate-400">বাজি</p><BetChips bet={bet} setBet={setBet} /></div>
      <button onClick={play} className="mt-3 w-full rounded-2xl bg-[#f5c518] py-3.5 font-black text-black">🃏 ডিল করুন</button>
    </GameShell>
  );
}

/* 3-card poker rank: 0 high .. 5 trail */
function pokerRank(hand: string[]): [number, number[]] {
  const vs = hand.map((c) => rankVal(c.slice(0, -1))).sort((a, b) => b - a);
  const ss = hand.map((c) => c.slice(-1));
  const flush = ss[0] === ss[1] && ss[1] === ss[2];
  const trail = vs[0] === vs[1] && vs[1] === vs[2];
  const pair = vs[0] === vs[1] || vs[1] === vs[2];
  const seq = (vs[0] - vs[1] === 1 && vs[1] - vs[2] === 1) || (vs[0] === 14 && vs[1] === 3 && vs[2] === 2);
  if (trail) return [5, vs];
  if (flush && seq) return [4, vs];
  if (seq) return [3, vs];
  if (flush) return [2, vs];
  if (pair) return [1, vs];
  return [0, vs];
}
const cmpHands = (a: [number, number[]], b: [number, number[]]) => {
  if (a[0] !== b[0]) return a[0] - b[0];
  for (let i = 0; i < 3; i++) if (a[1][i] !== b[1][i]) return a[1][i] - b[1][i];
  return 0;
};
const POKER_NAMES = ["হাই কার্ড", "পেয়ার", "কালার", "সিকোয়েন্স", "পিওর সিকোয়েন্স", "ট্রায়ো"];

export function PokerGame() {
  const { store } = useSkin();
  const finish = useGameRound("থ্রি-কার্ড পোকার");
  const [bet, setBet] = useState(50);
  const [ph, setPh] = useState<string[]>([]);
  const [dh, setDh] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const [msg, setMsg] = useState("");
  function play() {
    setMsg("");
    if (!store.payWithWallet(bet, "♠️ পোকার")) { setMsg("ব্যালেন্স কম — ডিপোজিট করুন"); return; }
    const used = new Set<string>();
    const p = [drawCard(used), drawCard(used), drawCard(used)];
    const d = [drawCard(used), drawCard(used), drawCard(used)];
    setPh(p); setDh(d); setDone(true);
    const cmp = cmpHands(pokerRank(p), pokerRank(d));
    const win = cmp > 0 ? bet * 2 : cmp === 0 ? bet : 0;
    finish(bet, win);
    setMsg(win > bet ? `🎉 জিতেছেন ${money(win)}! (${POKER_NAMES[pokerRank(p)[0]]})` : win === bet ? "🤝 ড্র — বাজি ফেরত" : `😅 হেরেছেন (ডিলার: ${POKER_NAMES[pokerRank(d)[0]]})`);
  }
  return (
    <GameShell title="থ্রি-কার্ড পোকার" emoji="♠️" rtp="৯৬.৬%">
      <p className="mb-3 text-center text-xs text-slate-400">ডিলারের চেয়ে ভালো হাত বানান</p>
      {done ? (
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-white/5 p-2 text-center"><p className="text-xs text-slate-400">আপনি — {POKER_NAMES[pokerRank(ph)[0]]}</p><div className="mt-1 flex justify-center gap-1">{ph.map((c, i) => <CardView key={i} c={c} small />)}</div></div>
          <div className="rounded-xl bg-white/5 p-2 text-center"><p className="text-xs text-slate-400">ডিলার — {POKER_NAMES[pokerRank(dh)[0]]}</p><div className="mt-1 flex justify-center gap-1">{dh.map((c, i) => <CardView key={i} c={c} small />)}</div></div>
        </div>
      ) : <p className="py-8 text-center text-6xl">🂠🂠🂠</p>}
      {msg && <p className="mt-2 text-center text-sm font-black text-[#f5c518]">{msg}</p>}
      <div className="mt-3"><p className="mb-1.5 text-xs font-bold text-slate-400">বাজি</p><BetChips bet={bet} setBet={setBet} /></div>
      <button onClick={play} className="mt-3 w-full rounded-2xl bg-[#f5c518] py-3.5 font-black text-black">♠️ ডিল করুন</button>
    </GameShell>
  );
}

export function TeenPattiGame() {
  const { store } = useSkin();
  const finish = useGameRound("তিন পাত্তি");
  const [bet, setBet] = useState(50);
  const [ph, setPh] = useState<string[]>([]);
  const [dh, setDh] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const [msg, setMsg] = useState("");
  function play() {
    setMsg("");
    if (!store.payWithWallet(bet, "🪔 তিন পাত্তি")) { setMsg("ব্যালেন্স কম — ডিপোজিট করুন"); return; }
    const used = new Set<string>();
    const p = [drawCard(used), drawCard(used), drawCard(used)];
    const d = [drawCard(used), drawCard(used), drawCard(used)];
    setPh(p); setDh(d); setDone(true);
    const cmp = cmpHands(pokerRank(p), pokerRank(d));
    const win = cmp > 0 ? bet * 2 : cmp === 0 ? bet : 0;
    finish(bet, win);
    setMsg(win > bet ? `🎉 শাবাশ! জিতেছেন ${money(win)} (${POKER_NAMES[pokerRank(p)[0]]})` : win === bet ? "🤝 ড্র — বাজি ফেরত" : `😅 হেরেছেন (প্রতিপক্ষ: ${POKER_NAMES[pokerRank(d)[0]]})`);
  }
  return (
    <GameShell title="তিন পাত্তি" emoji="🪔" rtp="৯৭.১%">
      <div className="mb-2 flex justify-center gap-1 text-[11px] text-slate-400">
        {POKER_NAMES.map((n, i) => <span key={n} className="rounded bg-white/5 px-1.5 py-0.5">{n}{i < 5 ? " <" : ""}</span>)}
      </div>
      {done ? (
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-white/5 p-2 text-center"><p className="text-xs text-slate-400">আপনি — {POKER_NAMES[pokerRank(ph)[0]]}</p><div className="mt-1 flex justify-center gap-1">{ph.map((c, i) => <CardView key={i} c={c} small />)}</div></div>
          <div className="rounded-xl bg-white/5 p-2 text-center"><p className="text-xs text-slate-400">প্রতিপক্ষ — {POKER_NAMES[pokerRank(dh)[0]]}</p><div className="mt-1 flex justify-center gap-1">{dh.map((c, i) => <CardView key={i} c={c} small />)}</div></div>
        </div>
      ) : <p className="py-8 text-center text-6xl">🪔</p>}
      {msg && <p className="mt-2 text-center text-sm font-black text-[#f5c518]">{msg}</p>}
      <div className="mt-3"><p className="mb-1.5 text-xs font-bold text-slate-400">বাজি (চাল)</p><BetChips bet={bet} setBet={setBet} /></div>
      <button onClick={play} className="mt-3 w-full rounded-2xl bg-[#f5c518] py-3.5 font-black text-black">🪔 পাত্তি দেখুন</button>
    </GameShell>
  );
}

export function AndarBaharGame() {
  const { store } = useSkin();
  const finish = useGameRound("অন্দর বাহার");
  const [bet, setBet] = useState(50);
  const [pick, setPick] = useState<"andar" | "bahar">("andar");
  const [mid, setMid] = useState("");
  const [seq, setSeq] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const [msg, setMsg] = useState("");
  function play() {
    setMsg(""); setSeq([]); setDone(false);
    if (!store.payWithWallet(bet, "🎴 অন্দর বাহার")) { setMsg("ব্যালেন্স কম — ডিপোজিট করুন"); return; }
    const used = new Set<string>();
    const m = drawCard(used);
    setMid(m);
    const target = m.slice(0, -1);
    const cards: string[] = [];
    let winner: "andar" | "bahar" | "" = "";
    for (let i = 0; i < 20; i++) {
      const c = drawCard(used);
      cards.push(c);
      if (c.slice(0, -1) === target) { winner = i % 2 === 0 ? "andar" : "bahar"; break; }
    }
    let i = 0;
    const t = setInterval(() => {
      setSeq(cards.slice(0, ++i));
      if (i >= cards.length) {
        clearInterval(t);
        setDone(true);
        const win = winner === pick ? Math.round(bet * 1.9) : 0;
        finish(bet, win);
        setMsg(win > 0 ? `🎉 ${winner === "andar" ? "অন্দর" : "বাহার"} জিতলো! ${money(win)}` : `😅 ${winner === "andar" ? "অন্দর" : "বাহার"} জিতলো — হারলেন`);
      }
    }, 350);
  }
  return (
    <GameShell title="অন্দর বাহার" emoji="🎴" rtp="৯৬.৮%">
      <div className="grid grid-cols-2 gap-2">
        {(["andar", "bahar"] as const).map((k) => (
          <button key={k} onClick={() => setPick(k)} className={`rounded-xl py-3 font-black ${pick === k ? "bg-[#f5c518] text-black" : "bg-white/5"}`}>
            {k === "andar" ? "⬅️ অন্দর" : "বাহার ➡️"}<br /><span className="text-xs">১.৯x</span>
          </button>
        ))}
      </div>
      {mid && (
        <div className="mt-3 rounded-xl bg-white/5 p-3 text-center">
          <p className="text-[11px] text-slate-400">মাঝের পাত্তি</p>
          <div className="mt-1 flex justify-center"><CardView c={mid} /></div>
          <div className="mt-2 flex flex-wrap justify-center gap-1">{seq.map((c, i) => <span key={i} className={i % 2 === 0 ? "mr-1" : ""}><CardView c={c} small /></span>)}</div>
        </div>
      )}
      {msg && <p className="mt-2 text-center text-sm font-black text-[#f5c518]">{msg}</p>}
      <div className="mt-3"><p className="mb-1.5 text-xs font-bold text-slate-400">বাজি</p><BetChips bet={bet} setBet={setBet} /></div>
      <button onClick={play} className="mt-3 w-full rounded-2xl bg-[#f5c518] py-3.5 font-black text-black">🎴 খেলুন</button>
    </GameShell>
  );
}

export function DragonTigerGame() {
  const { store } = useSkin();
  const finish = useGameRound("ড্রাগন টাইগার");
  const [bet, setBet] = useState(50);
  const [pick, setPick] = useState<"dragon" | "tiger" | "tie">("dragon");
  const [dc, setDc] = useState("");
  const [tc, setTc] = useState("");
  const [msg, setMsg] = useState("");
  function play() {
    setMsg("");
    if (!store.payWithWallet(bet, "🐉 ড্রাগন টাইগার")) { setMsg("ব্যালেন্স কম — ডিপোজিট করুন"); return; }
    const used = new Set<string>();
    const d = drawCard(used), t = drawCard(used);
    setDc(d); setTc(t);
    const dv = rankVal(d.slice(0, -1)), tv = rankVal(t.slice(0, -1));
    let win = 0;
    if (dv === tv && pick === "tie") win = bet * 8;
    else if (dv > tv && pick === "dragon") win = Math.round(bet * 1.95);
    else if (tv > dv && pick === "tiger") win = Math.round(bet * 1.95);
    finish(bet, win);
    setMsg(win > 0 ? `🎉 জিতেছেন ${money(win)}!` : `😅 হেরেছেন (ড্রাগন ${d} vs টাইগার ${t})`);
  }
  return (
    <GameShell title="ড্রাগন টাইগার" emoji="🐉" rtp="৯৬.৭%">
      <div className="grid grid-cols-3 gap-1.5">
        {(["dragon", "tiger", "tie"] as const).map((k) => (
          <button key={k} onClick={() => setPick(k)} className={`rounded-xl py-2.5 text-sm font-black ${pick === k ? "bg-[#f5c518] text-black" : "bg-white/5"}`}>
            {k === "dragon" ? "🐉 ড্রাগন" : k === "tiger" ? "🐯 টাইগার" : "🤝 টাই"}<br /><span className="text-[11px]">{k === "tie" ? "৮x" : "১.৯৫x"}</span>
          </button>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-white/5 p-3 text-center"><p className="text-xs text-slate-400">🐉 ড্রাগন</p><div className="mt-1 flex justify-center">{dc ? <CardView c={dc} /> : <span className="text-4xl">❓</span>}</div></div>
        <div className="rounded-xl bg-white/5 p-3 text-center"><p className="text-xs text-slate-400">🐯 টাইগার</p><div className="mt-1 flex justify-center">{tc ? <CardView c={tc} /> : <span className="text-4xl">❓</span>}</div></div>
      </div>
      {msg && <p className="mt-2 text-center text-sm font-black text-[#f5c518]">{msg}</p>}
      <div className="mt-3"><p className="mb-1.5 text-xs font-bold text-slate-400">বাজি</p><BetChips bet={bet} setBet={setBet} /></div>
      <button onClick={play} className="mt-3 w-full rounded-2xl bg-[#f5c518] py-3.5 font-black text-black">🐉 ডিল করুন</button>
    </GameShell>
  );
}

/* ---------- crash-style games ---------- */

function useCrashEngine(gameName: string) {
  const { store } = useSkin();
  const finish = useGameRound(gameName);
  const [bet, setBet] = useState(50);
  const [stage, setStage] = useState<"idle" | "flying" | "done">("idle");
  const [mult, setMult] = useState(1);
  const [crashAt, setCrashAt] = useState(0);
  const [msg, setMsg] = useState("");
  const [cashed, setCashed] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  function start() {
    setMsg(""); setCashed(0);
    if (stage === "flying") return;
    if (!store.payWithWallet(bet, `📈 ${gameName}`)) { setMsg("ব্যালেন্স কম — ডিপোজিট করুন"); return; }
    // house edge: crash point distribution
    const r = Math.random();
    const cp = r < 0.03 ? 1 : Math.max(1, +(0.99 / (1 - Math.random() * 0.97)).toFixed(2));
    setCrashAt(cp);
    setMult(1);
    setStage("flying");
    let m = 1;
    timer.current = setInterval(() => {
      m = +(m * (1 + 0.02 + Math.random() * 0.06)).toFixed(2);
      setMult(m);
      if (m >= cp) {
        if (timer.current) clearInterval(timer.current);
        setStage("done");
        finish(bet, 0);
        setMsg(`💥 ${bn(cp.toFixed(2))}x-এ ক্র্যাশ! বাজি হারলেন`);
      }
    }, 120);
  }
  function cashout() {
    if (stage !== "flying" || !timer.current) return;
    clearInterval(timer.current);
    const win = Math.round(bet * mult);
    setCashed(win);
    finish(bet, win);
    setMsg(`🎉 ${bn(mult.toFixed(2))}x-এ ক্যাশআউট! জিতেছেন ${money(win)}`);
    setStage("done");
  }
  useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);
  const reset = () => { setStage("idle"); setMult(1); setMsg(""); setCashed(0); };
  return { bet, setBet, stage, mult, msg, cashed, start, cashout, reset };
}

export function CrashGame() {
  const e = useCrashEngine("ক্র্যাশ");
  const pts = Array.from({ length: 20 }, (_, i) => {
    const x = (i / 19) * 100;
    const y = 100 - Math.min(100, (Math.pow(e.mult, 0.5) - 1) * 30 * (i / 19));
    return `${x},${y}`;
  }).join(" ");
  return (
    <GameShell title="ক্র্যাশ" emoji="📈" rtp="৯৭.০%">
      <div className="rounded-2xl bg-black/50 p-4">
        <svg viewBox="0 0 100 100" className="h-44 w-full">
          <polyline points={pts} fill="none" stroke={e.stage === "done" && e.cashed === 0 ? "#ef4444" : "#f5c518"} strokeWidth="2.5" />
          {e.stage === "flying" && <circle cx={100} cy={100 - Math.min(100, (Math.pow(e.mult, 0.5) - 1) * 30)} r="4" fill="#f5c518" />}
        </svg>
        <p className={`text-center text-5xl font-black ${e.stage === "done" && e.cashed === 0 ? "text-red-400" : "text-[#f5c518]"}`}>
          {bn(e.mult.toFixed(2))}x
        </p>
        <p className="text-center text-[11px] text-slate-500">ক্র্যাশের আগেই ক্যাশআউট করুন!</p>
      </div>
      {e.msg && <p className="mt-2 text-center text-sm font-black text-[#f5c518]">{e.msg}</p>}
      {e.stage === "idle" && (<>
        <div className="mt-3"><p className="mb-1.5 text-xs font-bold text-slate-400">বাজি</p><BetChips bet={e.bet} setBet={e.setBet} /></div>
        <button onClick={e.start} className="mt-3 w-full rounded-2xl bg-emerald-500 py-3.5 font-black text-white">🚀 বাজি ধরুন ও শুরু করুন</button>
      </>)}
      {e.stage === "flying" && (
        <button onClick={e.cashout} className="mt-3 w-full animate-pulse rounded-2xl bg-[#f5c518] py-4 text-xl font-black text-black">
          💰 ক্যাশআউট — {money(Math.round(e.bet * e.mult))}
        </button>
      )}
      {e.stage === "done" && (
        <button onClick={e.reset} className="mt-3 w-full rounded-2xl bg-[#f5c518] py-3.5 font-black text-black">🔄 নতুন রাউন্ড</button>
      )}
    </GameShell>
  );
}

export function AviatorGame() {
  const e = useCrashEngine("জেট ফ্লাইট");
  const [auto, setAuto] = useState("");
  useEffect(() => {
    if (e.stage === "flying" && auto) {
      const target = parseFloat(auto);
      if (!isNaN(target) && e.mult >= target) e.cashout();
    }
  }, [e.mult, e.stage]);
  const left = Math.min(88, (e.mult - 1) * 22);
  const bottom = Math.min(72, (e.mult - 1) * 18);
  return (
    <GameShell title="জেট ফ্লাইট" emoji="✈️" rtp="৯৭.০%">
      <div className="relative h-48 overflow-hidden rounded-2xl bg-gradient-to-b from-sky-950 to-[#0b1120]">
        <p className="absolute right-3 top-2 text-[11px] text-slate-400">☁️ ☁️ ☁️</p>
        {e.stage !== "idle" && (
          <span className="absolute text-4xl transition-all duration-150" style={{ left: `${8 + left}%`, bottom: `${10 + bottom}%`, transform: e.stage === "done" && e.cashed === 0 ? "rotate(90deg)" : "none" }}>
            {e.stage === "done" && e.cashed === 0 ? "💥" : "✈️"}
          </span>
        )}
        {e.stage === "idle" && <p className="absolute inset-0 flex items-center justify-center text-5xl">✈️</p>}
        <p className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-5xl font-black ${e.stage === "done" && e.cashed === 0 ? "text-red-400" : "text-white"}`}>
          {bn(e.mult.toFixed(2))}x
        </p>
      </div>
      {e.msg && <p className="mt-2 text-center text-sm font-black text-[#f5c518]">{e.msg}</p>}
      {e.stage === "idle" && (<>
        <div className="mt-3"><p className="mb-1.5 text-xs font-bold text-slate-400">বাজি</p><BetChips bet={e.bet} setBet={e.setBet} /></div>
        <div className="mt-2 flex items-center gap-2">
          <label className="text-xs text-slate-400">🤖 অটো ক্যাশআউট:</label>
          <input value={auto} onChange={(ev) => setAuto(ev.target.value.replace(/[^0-9.]/g, ""))} placeholder="যেমন ২.০" className="w-24 rounded-lg border border-white/15 bg-white/5 px-2 py-1.5 text-center text-sm text-white outline-none" />
          <span className="text-xs text-slate-500">x</span>
        </div>
        <button onClick={e.start} className="mt-3 w-full rounded-2xl bg-red-600 py-3.5 font-black text-white">✈️ উড্ডয়ন শুরু</button>
      </>)}
      {e.stage === "flying" && (
        <button onClick={e.cashout} className="mt-3 w-full animate-pulse rounded-2xl bg-[#f5c518] py-4 text-xl font-black text-black">
          💰 ক্যাশআউট — {money(Math.round(e.bet * e.mult))}
        </button>
      )}
      {e.stage === "done" && (
        <button onClick={e.reset} className="mt-3 w-full rounded-2xl bg-[#f5c518] py-3.5 font-black text-black">🔄 নতুন ফ্লাইট</button>
      )}
    </GameShell>
  );
}

export function DiceGame() {
  const { store } = useSkin();
  const finish = useGameRound("ডাইস");
  const [bet, setBet] = useState(50);
  const [pick, setPick] = useState<"small" | "big" | number>("big");
  const [roll, setRoll] = useState<number | null>(null);
  const [rolling, setRolling] = useState(false);
  const [msg, setMsg] = useState("");
  function play() {
    setMsg("");
    if (rolling) return;
    if (!store.payWithWallet(bet, "🎲 ডাইস")) { setMsg("ব্যালেন্স কম — ডিপোজিট করুন"); return; }
    setRolling(true);
    let n = 0;
    const t = setInterval(() => {
      setRoll(1 + Math.floor(Math.random() * 6));
      if (++n > 8) {
        clearInterval(t);
        const r = 1 + Math.floor(Math.random() * 6);
        setRoll(r);
        let win = 0;
        if (typeof pick === "number" && pick === r) win = bet * 5;
        else if (pick === "small" && r <= 3) win = Math.round(bet * 1.9);
        else if (pick === "big" && r >= 4) win = Math.round(bet * 1.9);
        finish(bet, win);
        setMsg(win > 0 ? `🎉 ${bn(r)}! জিতেছেন ${money(win)}` : `😅 ${bn(r)} পড়লো — হারলেন`);
        setRolling(false);
      }
    }, 90);
  }
  const faces = ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];
  return (
    <GameShell title="ডাইস" emoji="🎲" rtp="৯৭.৫%">
      <div className="flex justify-center py-4">
        <span className={`text-8xl ${rolling ? "animate-bounce" : ""}`}>{roll ? faces[roll] : "🎲"}</span>
      </div>
      {msg && <p className="text-center text-sm font-black text-[#f5c518]">{msg}</p>}
      <div className="mt-2 grid grid-cols-2 gap-1.5">
        <button onClick={() => setPick("small")} className={`rounded-xl py-2.5 font-black ${pick === "small" ? "bg-[#f5c518] text-black" : "bg-white/5"}`}>⬇️ ছোট (১-৩)<br /><span className="text-xs">১.৯x</span></button>
        <button onClick={() => setPick("big")} className={`rounded-xl py-2.5 font-black ${pick === "big" ? "bg-[#f5c518] text-black" : "bg-white/5"}`}>⬆️ বড় (৪-৬)<br /><span className="text-xs">১.৯x</span></button>
      </div>
      <div className="mt-2 flex gap-1">
        {[1, 2, 3, 4, 5, 6].map((v) => (
          <button key={v} onClick={() => setPick(v)} className={`flex-1 rounded-lg py-1.5 text-xs font-black ${pick === v ? "bg-[#f5c518] text-black" : "bg-white/10"}`}>{bn(v)}<br />৫x</button>
        ))}
      </div>
      <div className="mt-3"><p className="mb-1.5 text-xs font-bold text-slate-400">বাজি</p><BetChips bet={bet} setBet={setBet} /></div>
      <button onClick={play} disabled={rolling} className="mt-3 w-full rounded-2xl bg-[#f5c518] py-3.5 font-black text-black disabled:opacity-50">
        {rolling ? "🎲 ঘুরছে..." : "🎲 রোল করুন"}
      </button>
    </GameShell>
  );
}

const WHEEL_SEGS = [
  { t: "0x", v: 0, c: "#1f2937" }, { t: "১.২x", v: 1.2, c: "#065f46" },
  { t: "0x", v: 0, c: "#1f2937" }, { t: "২x", v: 2, c: "#b45309" },
  { t: "০.৫x", v: 0.5, c: "#374151" }, { t: "১.৫x", v: 1.5, c: "#065f46" },
  { t: "0x", v: 0, c: "#1f2937" }, { t: "৫x", v: 5, c: "#f5c518" },
];

export function WheelGame() {
  const { store } = useSkin();
  const finish = useGameRound("ভাগ্যের চাকা");
  const [bet, setBet] = useState(50);
  const [angle, setAngle] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [msg, setMsg] = useState("");
  function spin() {
    setMsg("");
    if (spinning) return;
    if (!store.payWithWallet(bet, "🎡 ভাগ্যের চাকা")) { setMsg("ব্যালেন্স কম — ডিপোজিট করুন"); return; }
    setSpinning(true);
    const seg = Math.floor(Math.random() * 8);
    const target = 360 * 6 + (360 - seg * 45) - 22.5;
    setAngle((a) => a + target - (a % 360));
    setTimeout(() => {
      setSpinning(false);
      const w = Math.round(bet * WHEEL_SEGS[seg].v);
      finish(bet, w);
      setMsg(w > 0 ? `🎉 ${WHEEL_SEGS[seg].t}-তে থামলো! জিতেছেন ${money(w)}` : "😅 ০x — হারলেন, আবার চেষ্টা করুন");
    }, 3200);
  }
  return (
    <GameShell title="ভাগ্যের চাকা" emoji="🎡" rtp="৯৬.৩%">
      <div className="flex justify-center py-2">
        <div className="relative h-56 w-56">
          <div className="absolute -top-2 left-1/2 z-10 -translate-x-1/2 text-3xl">🔻</div>
          <div className="h-full w-full rounded-full border-4 border-[#f5c518] transition-transform duration-[3000ms] ease-out"
            style={{ transform: `rotate(${angle}deg)`, background: `conic-gradient(${WHEEL_SEGS.map((s, i) => `${s.c} ${i * 45}deg ${(i + 1) * 45}deg`).join(",")})` }}>
            {WHEEL_SEGS.map((s, i) => (
              <span key={i} className="absolute left-1/2 top-1/2 text-[11px] font-black text-white"
                style={{ transform: `translate(-50%,-50%) rotate(${i * 45 + 22.5}deg) translateY(-88px)` }}>{s.t}</span>
            ))}
          </div>
          <div className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#f5c518] bg-[#0b1120]" />
        </div>
      </div>
      {msg && <p className="mt-1 text-center text-sm font-black text-[#f5c518]">{msg}</p>}
      <div className="mt-3"><p className="mb-1.5 text-xs font-bold text-slate-400">বাজি</p><BetChips bet={bet} setBet={setBet} /></div>
      <button onClick={spin} disabled={spinning} className="mt-3 w-full rounded-2xl bg-[#f5c518] py-3.5 font-black text-black disabled:opacity-50">
        {spinning ? "🌀 ঘুরছে..." : "🎡 চাকা ঘুরান"}
      </button>
    </GameShell>
  );
}

/* ---------- game meta pages ---------- */

export function GameHistory() {
  const { base, store, card, sub } = useSkin();
  const totalBet = store.gameHistory.reduce((s, g) => s + g.bet, 0);
  const totalWin = store.gameHistory.reduce((s, g) => s + g.win, 0);
  return (
    <Page>
      <Back href={`${base}/casino`} label="লবি" />
      <SectionTitle t="📜 গেম হিস্ট্রি" sub={`${bn(store.gameHistory.length)}টি রাউন্ড`} />
      <div className="mb-3 grid grid-cols-3 gap-2 text-center">
        <div className={`${card} p-3`}><p className="text-sm font-black">{money(totalBet)}</p><p className={`text-[11px] ${sub}`}>মোট বাজি</p></div>
        <div className={`${card} p-3`}><p className="text-sm font-black text-emerald-300">{money(totalWin)}</p><p className={`text-[11px] ${sub}`}>মোট জয়</p></div>
        <div className={`${card} p-3`}><p className={`text-sm font-black ${totalWin - totalBet >= 0 ? "text-emerald-300" : "text-red-300"}`}>{totalWin - totalBet >= 0 ? "+" : ""}{money(totalWin - totalBet)}</p><p className={`text-[11px] ${sub}`}>লাভ/লস</p></div>
      </div>
      {store.gameHistory.length === 0 ? <Empty emoji="📜" text="এখনো খেলেননি" /> : (
        <div className="space-y-1.5">
          {store.gameHistory.map((g) => (
            <div key={g.id} className={`${card} flex items-center justify-between p-2.5 text-sm`}>
              <div><b>{g.game}</b><p className={`text-[11px] ${sub}`}>{fmtTime(g.date)} • বাজি {money(g.bet)}</p></div>
              <b className={g.win > 0 ? "text-emerald-300" : "text-red-300"}>{g.win > 0 ? `+${money(g.win)}` : `-${money(g.bet)}`}</b>
            </div>
          ))}
        </div>
      )}
    </Page>
  );
}

export function Tournaments() {
  const { base, card, sub } = useSkin();
  return (
    <Page>
      <Back href={`${base}/casino`} label="লবি" />
      <SectionTitle t="🏆 টুর্নামেন্ট" sub="বড় পুরস্কার জিতুন" />
      <div className="space-y-3">
        {TOURNAMENTS.map((t) => (
          <Link key={t.id} href={`${base}/casino/tournaments/${t.id}`} className={`${card} block p-4 transition hover:border-[#f5c518]/50`}>
            <div className="flex items-start justify-between">
              <div><p className="text-lg font-black">{t.t}</p><p className={`mt-1 text-xs ${sub}`}>{t.desc}</p></div>
              <div className="text-right"><p className="text-lg font-black text-[#f5c518]">{money(t.prize)}</p><p className={`text-[11px] ${sub}`}>প্রাইজ পুল</p></div>
            </div>
            <div className="mt-2 flex justify-between text-[11px] text-slate-400"><span>👥 {bn(t.players)} জন</span><span>⏰ {t.ends}</span></div>
          </Link>
        ))}
      </div>
    </Page>
  );
}

export function TournamentDetail({ id }: { id: string }) {
  const { base, card, sub, store } = useSkin();
  const t = TOURNAMENTS.find((x) => x.id === id);
  const [joined, setJoined] = useState(false);
  if (!t) return <Page narrow><Empty emoji="🔍" text="টুর্নামেন্ট পাওয়া যায়নি" /></Page>;
  const leaders = [["রহিম_৯৯", "১২,৪৫০"], ["সাকিব_কিং", "১১,২০০"], ["নুসরাত_৭", "১০,৮৯০"], ["করিম_২১", "৯,৪৫০"], ["তানভীর_X", "৮,৯০০"]].map(([n, p], i) => ({ n, p, i }));
  return (
    <Page narrow>
      <Back href={`${base}/casino/tournaments`} label="টুর্নামেন্ট" />
      <div className={`${card} p-5 text-center`}>
        <p className="text-5xl">{t.e}</p>
        <h1 className="mt-2 text-xl font-black">{t.t}</h1>
        <p className="mt-1 text-2xl font-black text-[#f5c518]">{money(t.prize)}</p>
        <p className={`text-xs ${sub}`}>প্রাইজ পুল • {t.ends}</p>
        <p className="mt-3 text-sm text-slate-300">{t.body}</p>
        {joined ? (
          <p className="mt-4 rounded-xl bg-emerald-500/15 py-2.5 text-sm font-black text-emerald-300">✅ আপনি যোগ দিয়েছেন! শুভকামনা 🍀</p>
        ) : (
          <button onClick={() => { if (!store.user) { setJoined(false); } else setJoined(true); }} className="mt-4 w-full rounded-xl bg-[#f5c518] py-3 font-black text-black">
            {store.user ? "🚀 টুর্নামেন্টে যোগ দিন (ফ্রি)" : "🔑 যোগ দিতে লগইন করুন"}
          </button>
        )}
        {!store.user && !joined && <Link href={`${base}/login`} className="mt-2 block text-xs text-[#f5c518] underline">লগইন পেজ →</Link>}
      </div>
      <div className={`${card} mt-3 p-4`}>
        <p className="mb-2 text-sm font-black text-[#f5c518]">🏅 লিডারবোর্ড</p>
        <div className="space-y-1.5">
          {leaders.map((l) => (
            <div key={l.n} className="flex items-center justify-between rounded-xl bg-white/[0.04] px-3 py-2 text-sm">
              <span>{["🥇", "🥈", "🥉", "৪.", "৫."][l.i]} <b>{l.n}</b></span>
              <span className="font-black text-[#f5c518]">{bn(l.p)} পয়েন্ট</span>
            </div>
          ))}
        </div>
      </div>
    </Page>
  );
}

export function Jackpots() {
  const { base, card, sub } = useSkin();
  const [pots, setPots] = useState([8742500, 3210800, 1567400]);
  useEffect(() => {
    const t = setInterval(() => setPots((p) => p.map((v) => v + Math.floor(Math.random() * 900))), 3000);
    return () => clearInterval(t);
  }, []);
  const names = ["💎 মেগা জ্যাকপট", "👑 রয়েল জ্যাকপট", "⭐ ডেইলি জ্যাকপট"];
  return (
    <Page>
      <Back href={`${base}/casino`} label="লবি" />
      <SectionTitle t="💰 জ্যাকপট" sub="প্রতি মুহূর্তে বাড়ছে" />
      <div className="space-y-3">
        {pots.map((p, i) => (
          <div key={i} className="relative overflow-hidden rounded-3xl border border-[#f5c518]/30 bg-gradient-to-br from-[#1a1405] to-[#0b1120] p-6 text-center">
            <div className="pointer-events-none absolute inset-0 opacity-20" style={{ background: "radial-gradient(circle at 50% 0%, #f5c51855, transparent 70%)" }} />
            <p className="text-lg font-black">{names[i]}</p>
            <p className="mt-1 text-4xl font-black tabular-nums text-[#f5c518]">{money(p)}</p>
            <p className={`mt-1 text-[11px] ${sub}`}>⏱️ যেকোনো স্পিনে জিততে পারেন</p>
            <Link href={`${base}/casino/slots/royal`} className="mt-3 inline-block rounded-xl bg-[#f5c518] px-6 py-2.5 text-sm font-black text-black">🎰 এখনই খেলুন</Link>
          </div>
        ))}
      </div>
      <div className={`${card} mt-4 p-4`}>
        <p className="mb-2 text-sm font-black text-[#f5c518]">🏆 সাম্প্রতিক জ্যাকপট জয়ী</p>
        <div className="space-y-1.5 text-xs">
          {[["আরিফুল", "২,৪৫,০০০", "২ ঘণ্টা আগে"], ["শারমিন", "৮৯,৫০০", "৫ ঘণ্টা আগে"], ["মেহেদি", "১,১২,০০০", "গতকাল"]].map(([n, a, t]) => (
            <div key={n} className="flex justify-between"><span>🎉 <b>{n}***</b> <span className={sub}>{t}</span></span><b className="text-emerald-300">{bn(a)} টাকা</b></div>
          ))}
        </div>
      </div>
    </Page>
  );
}

/* ============================== ACCOUNT & WALLET ============================== */
