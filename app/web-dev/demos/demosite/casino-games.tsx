"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { toBnDigits } from "@/lib/format";
import { useDemo } from "./store";
import { Back, Empty, Field, Page, SectionTitle } from "./ui";
import { bn, money, GOLD, useSkin, useBetSlip, SLOT_GAMES, LIVE_GAMES, ALL_GAMES, TOURNAMENTS, fmtTime, gameHref, GameCard, GameShell, BetChips, useGameRound, rankVal, drawCard, CardView, catalogGame, GAME_CATALOG, catalogHref, PROVIDERS, useCasinoConfig, type CatalogGame, type SportId, type CasiMatch } from "./casino-data";

export function CasinoLobby() {
  const { base, store } = useSkin();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  // Phase 6: admin category toggles hide categories from the lobby.
  const disabledCats = store.custom.customDisabledGameCats ?? [];
  const cats = [["all", "🎮 All"], ["slots", "🎰 Slots"], ["table", "🃏 Table"], ["desi", "🪔 Desi"], ["crash", "📈 Crash"], ["live", "🎥 Live"]].filter(([id]) => id === "all" || !disabledCats.includes(id));
  const list = ALL_GAMES.filter((g) => !disabledCats.includes(g.cat) && (cat === "all" || g.cat === cat) && (!q || g.n.includes(q)));
  return (
    <Page>
      <Back href={base} label="Home" />
      <SectionTitle t="🎰 Casino Lobby" sub={`${bn(ALL_GAMES.length)} games`} />
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="🔍 Search games..."
        className="mb-3 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white outline-none placeholder:text-slate-500" />
      <div className="mb-4 flex gap-1.5 overflow-x-auto pb-1">
        {cats.map(([id, t]) => (
          <button key={id} onClick={() => setCat(id)}
            className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-black ${cat === id ? "bg-[#f5c518] text-black" : "bg-white/5 text-slate-300"}`}>{t}</button>
        ))}
      </div>
      {list.length === 0 ? <Empty emoji="🔍" text="No games found" /> : (
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
      <Back href={`${base}/casino`} label="Lobby" />
      <SectionTitle t="🎰 Slot Games" sub={`${bn(SLOT_GAMES.length)} slots`} />
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

const SLOT_PAY: Record<number, [number, number, number]> = {
  // symbol index -> [3 of a kind, 4, 5] multipliers of total bet
  0: [3, 8, 25], 1: [2, 6, 18], 2: [1.5, 5, 12], 3: [1, 4, 10],
  4: [0.8, 3, 8], 5: [0.6, 2.5, 6], 6: [0.5, 2, 5], 7: [0.5, 2, 5],
};
const SLOT_LINES = [
  [0, 1, 2, 3, 4], [5, 6, 7, 8, 9], [10, 11, 12, 13, 14], // rows
  [0, 6, 12, 8, 4], [10, 6, 2, 8, 14], // V shapes
];
const BET_STEPS = [10, 20, 50, 100, 200, 500, 1000, 2000, 5000];

type HWCell = null | { v: number } | { jp: "MINI" | "MINOR" | "MAJOR" | "GRAND" };
const HW_JP = { MINI: 10, MINOR: 25, MAJOR: 100, GRAND: 500 };

/** HOLD & WIN bonus round — 3x3 sticky coins, 3 respins, jackpot tiers. */
function HoldWinBonus({ bet, onEnd }: { bet: number; onEnd: (win: number) => void }) {
  const mkCoin = (): Exclude<HWCell, null> => {
    const r = Math.random();
    if (r < 0.05) return { jp: "MINI" };
    if (r < 0.08) return { jp: "MINOR" };
    if (r < 0.095) return { jp: "MAJOR" };
    return { v: [1, 2, 3, 5, 8][Math.floor(Math.random() * 5)] };
  };
  const [grid, setGrid] = useState<HWCell[]>(() => {
    const g: HWCell[] = Array(9).fill(null);
    const pos = [0, 1, 2, 3, 4, 5, 6, 7, 8].sort(() => Math.random() - 0.5).slice(0, 6);
    for (const i of pos) g[i] = mkCoin();
    return g;
  });
  const gridRef = useRef(grid);
  const [respins, setRespins] = useState(3);
  const [done, setDone] = useState(false);
  const [finalTotal, setFinalTotal] = useState(0);
  const doneRef = useRef(false);

  useEffect(() => {
    const t = setInterval(() => {
      if (doneRef.current) return;
      const prev = gridRef.current;
      const empties = prev.map((c, i) => (c ? -1 : i)).filter((i) => i >= 0);
      if (empties.length === 0) return;
      const next = [...prev];
      let added = 0;
      for (const i of empties) {
        if (Math.random() < 0.34) { next[i] = mkCoin(); added++; }
      }
      if (added > 0) { gridRef.current = next; setGrid(next); setRespins(3); }
      else setRespins((rp) => rp - 1);
    }, 1400);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const filled = grid.every((c) => c);
    if ((respins <= 0 || filled) && !doneRef.current) {
      doneRef.current = true;
      setDone(true);
      let total = 0;
      for (const c of grid) {
        if (!c) continue;
        total += "jp" in c ? HW_JP[c.jp] * bet : c.v * bet;
      }
      if (filled) total += HW_JP.GRAND * bet;
      total = Math.round(total);
      setFinalTotal(total);
      const t = setTimeout(() => onEnd(total), 2600);
      return () => clearTimeout(t);
    }
  }, [respins, grid]);

  const cellLabel = (c: HWCell) => {
    if (!c) return "";
    if ("jp" in c) return c.jp;
    return `${c.v}x`;
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
      <style>{`@keyframes dp-coinpop { 0% { transform: scale(0) rotate(-40deg) } 60% { transform: scale(1.25) rotate(10deg) } 100% { transform: scale(1) rotate(0) } } .dp-coinpop { animation: dp-coinpop .5s ease both }`}</style>
      <div className="w-full max-w-[420px] overflow-hidden rounded-3xl border-2 border-amber-400/70 bg-gradient-to-b from-[#2a1503] via-[#160b02] to-black shadow-[0_0_60px_rgba(245,197,24,0.35)]">
        <div className="bg-gradient-to-b from-amber-500/30 to-transparent px-4 pb-2 pt-4 text-center">
          <p className="bg-gradient-to-b from-yellow-200 via-[#f5c518] to-amber-600 bg-clip-text text-3xl font-black tracking-wide text-transparent">🪙 HOLD & WIN</p>
          <p className="mt-1 text-xs font-bold text-amber-200/80">Coins stay locked • a new coin = 3 respins again</p>
        </div>
        <div className="mx-4 grid grid-cols-4 gap-1.5">
          {[["GRAND", 500, "from-red-500 to-red-800"], ["MAJOR", 100, "from-fuchsia-500 to-purple-800"], ["MINOR", 25, "from-sky-500 to-blue-800"], ["MINI", 10, "from-emerald-500 to-green-800"]].map(([t, x, gr]) => (
            <div key={t as string} className={`rounded-lg bg-gradient-to-b ${gr} p-[1.5px]`}>
              <div className="rounded-md bg-black/60 px-1 py-1 text-center">
                <p className="text-[7px] font-black text-white/80">{t}</p>
                <p className="text-[10px] font-black text-yellow-200">{x}x</p>
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2 p-4">
          {grid.map((c, i) => (
            <div key={i} className="flex aspect-square items-center justify-center rounded-2xl bg-black/50 ring-1 ring-amber-500/25">
              {c && (
                <div className="dp-coinpop grid h-[86%] w-[86%] place-items-center rounded-full bg-gradient-to-b from-yellow-200 via-amber-400 to-amber-700 shadow-[0_0_18px_rgba(245,197,24,0.6)] ring-2 ring-yellow-200/70">
                  <p className={`font-black text-black ${"jp" in c ? "text-[11px]" : "text-lg"}`}>{cellLabel(c)}</p>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between px-4 pb-4">
          <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-black text-white">🔄 Respins: {bn(respins)}</span>
          {done ? (
            <span className="dp-coinpop rounded-full bg-gradient-to-b from-yellow-300 to-amber-600 px-4 py-1.5 text-sm font-black text-black">🏆 {money(finalTotal)}</span>
          ) : (
            <span className="text-xs font-bold text-white/60">Coins accumulating…</span>
          )}
        </div>
      </div>
    </div>
  );
}

export { SuperAceGame } from "./casino-superace";

export function SlotGame({ id }: { id: string }) {
  const cg = catalogGame(id);
  const g = SLOT_GAMES.find((x) => x.id === id) ?? (cg ? { id: cg.id, n: cg.n, e: cg.e, cat: "slots", players: cg.players, rtp: `${cg.rtp.toFixed(1)}%` } : SLOT_GAMES[0]);
  const { store, base } = useSkin();
  const cfg = useCasinoConfig();
  const finish = useGameRound(g.n);
  const syms = (cg?.syms ?? SLOT_SYMBOLS[g.id] ?? SLOT_SYMBOLS.royal).slice(0, 8);
  const SCATTER = "⭐";
  const COIN = "🪙";
  const allSyms = [...syms, SCATTER, COIN];
  const rnd = () => allSyms[Math.floor(Math.random() * allSyms.length)];
  const baseRnd = () => syms[Math.floor(Math.random() * syms.length)];

  const [bet, setBet] = useState(50);
  const [grid, setGrid] = useState<string[]>(() => Array.from({ length: 15 }, baseRnd));
  const [spinning, setSpinning] = useState(false);
  const [stoppedCols, setStoppedCols] = useState(5);
  const [winCells, setWinCells] = useState<number[]>([]);
  const [winLines, setWinLines] = useState<number[][]>([]);
  const [dispTotal, setDispTotal] = useState(0);
  const [totalWin, setTotalWin] = useState(0);
  const totalRef = useRef(0);
  const [tier, setTier] = useState<"" | "win" | "big" | "mega">("");
  const [coins, setCoins] = useState<number[]>([]);
  const [msg, setMsg] = useState("");
  const [nearMiss, setNearMiss] = useState(false);
  const [holdWin, setHoldWin] = useState<null | { paid: boolean }>(null);
  const [freeLeft, setFreeLeft] = useState(0);
  const [freeWon, setFreeWon] = useState(0);
  const [autoLeft, setAutoLeft] = useState(0);
  const [turbo, setTurbo] = useState(false);
  const [roundKey, setRoundKey] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const [pots, setPots] = useState({ grand: 0, major: 0, minor: 0, mini: 0 });
  useEffect(() => {
    setPots({ grand: bet * 500, major: bet * 50, minor: bet * 20, mini: bet * 10 });
    const t = setInterval(() => setPots((p) => ({ grand: p.grand + bet * 0.4, major: p.major + bet * 0.05, minor: p.minor + bet * 0.02, mini: p.mini + bet * 0.01 })), 2500);
    return () => clearInterval(t);
  }, [bet]);
  const colsRef = useRef(5);
  const stateRef = useRef({ spinning: false, freeLeft: 0, autoLeft: 0 });
  stateRef.current = { spinning, freeLeft, autoLeft };

  useEffect(() => () => { timers.current.forEach(clearTimeout); }, []);
  const later = (fn: () => void, ms: number) => { timers.current.push(setTimeout(fn, ms)); };

  /** RTP-weighted final grid: owner RTP controls winning-grid frequency. */
  function rollFinal(): string[] {
    const winBias = Math.max(0.03, Math.min(0.32, (cfg.rtp - 86) / 36));
    const f = Array.from({ length: 15 }, baseRnd);
    for (let i = 0; i < 15; i++) { const rr = Math.random(); if (rr < 0.035) f[i] = SCATTER; else if (rr < 0.065) f[i] = COIN; }
    if (Math.random() < winBias) {
      const line = SLOT_LINES[Math.floor(Math.random() * SLOT_LINES.length)];
      const sym = syms[Math.floor(Math.random() * 5)];
      const len = Math.random() < 0.22 ? 5 : Math.random() < 0.45 ? 4 : 3;
      for (let i = 0; i < len; i++) f[line[i]] = sym;
      if (Math.random() < 0.3) { // extra second line sometimes
        const l2 = SLOT_LINES[Math.floor(Math.random() * SLOT_LINES.length)];
        const s2 = syms[Math.floor(Math.random() * 5)];
        for (let i = 0; i < 3; i++) f[l2[i]] = s2;
      }
    } else {
      // prevent accidental line wins, but ALLOW near-misses (2 from left)
      for (const line of SLOT_LINES) {
        let run = 1;
        for (let i = 1; i < 5; i++) { if (f[line[i]] === f[line[0]] && f[line[i]] !== SCATTER && f[line[i]] !== COIN) run++; else break; }
        if (run >= 3) f[line[run]] = syms[(syms.indexOf(f[line[run]]) + 3) % syms.length];
      }
    }
    return f;
  }

  function evaluate(f: string[], betAmt: number, mult: number) {
    let win = 0;
    const cells = new Set<number>();
    const linesHit: number[][] = [];
    for (const line of SLOT_LINES) {
      const s0 = f[line[0]];
      if (s0 === SCATTER || s0 === COIN) continue;
      let run = 1;
      for (let i = 1; i < 5; i++) { if (f[line[i]] === s0) run++; else break; }
      if (run >= 3) {
        const pay = SLOT_PAY[syms.indexOf(s0)] ?? [0.5, 2, 5];
        win += betAmt * pay[run - 3];
        linesHit.push(line.slice(0, run));
        for (let i = 0; i < run; i++) cells.add(line[i]);
      }
    }
    const scatters = f.filter((x) => x === SCATTER).length;
    const coinCount = f.filter((x) => x === COIN).length;
    return { win: Math.round(win * mult), cells: [...cells], linesHit, scatters, coinCount };
  }

  function endHoldWin(total: number) {
    const cost = holdWin?.paid ? bet * 50 : 0;
    finish(cost, total);
    if (total > 0) {
      creditWin(total);
      const ratio = total / bet;
      setTier(ratio >= 25 ? "mega" : "win");
      setCoins(Array.from({ length: ratio >= 25 ? 26 : 12 }, (_, i) => i));
      setMsg(`🪙 HOLD & WIN — you won ${money(total)}!`);
    } else setMsg("Bonus over — try again");
    setHoldWin(null);
  }

  /** WIN panel always shows the SESSION TOTAL, counting up. */
  function creditWin(amount: number) {
    const from = totalRef.current;
    const to = from + amount;
    totalRef.current = to;
    setTotalWin(to);
    const steps = 18;
    let i = 0;
    const t = setInterval(() => {
      i++;
      setDispTotal(Math.round(from + ((to - from) * i) / steps));
      if (i >= steps) { clearInterval(t); setDispTotal(to); }
    }, 40);
    timers.current.push(t as unknown as ReturnType<typeof setTimeout>);
  }

  function doSpin(isFree: boolean, betAmt: number) {
    if (stateRef.current.spinning) return;
    if (!isFree) {
      if (!store.payWithWallet(betAmt, `🎰 ${g.n}`)) { setMsg("Low balance — deposit to continue"); setAutoLeft(0); return; }
    }
    setSpinning(true);
    setWinCells([]); setWinLines([]); setTier(""); setCoins([]); setNearMiss(false); setMsg("");
    setStoppedCols(0);
    setRoundKey((k) => k + 1);
    const final = rollFinal();
    const colDelay = turbo ? 130 : 260;
    // fast shuffle while spinning
    const shuffle = setInterval(() => {
      setGrid((prev) => prev.map((c, i) => ((i % 5) < colsRef.current ? c : rnd())));
    }, 80);
    colsRef.current = 0;
    for (let col = 0; col < 5; col++) {
      later(() => {
        colsRef.current = col + 1;
        setStoppedCols(col + 1);
        setGrid((prev) => prev.map((c, i) => ((i % 5) <= col ? final[i] : c)));
      }, 350 + col * colDelay);
    }
    later(() => {
      clearInterval(shuffle);
      setGrid(final);
      const mult = isFree ? 2 : 1;
      const { win, cells, linesHit, scatters, coinCount } = evaluate(final, betAmt, mult);
      setWinCells(cells); setWinLines(linesHit);
      setSpinning(false);
      let newFree = 0;
      if (scatters >= 3 && !isFree) newFree = 8;
      const effWin = win;
      if (effWin > 0) {
        creditWin(effWin);
        if (isFree) setFreeWon((w) => w + effWin);
        const ratio = effWin / betAmt;
        setTier(ratio >= 25 ? "mega" : ratio >= 10 ? "big" : "win");
        setCoins(Array.from({ length: ratio >= 10 ? 26 : 12 }, (_, i) => i));
        setMsg(ratio >= 25 ? "🌟 MEGA WIN!" : ratio >= 10 ? "🎉 BIG WIN!" : `🎉 You won!`);
      } else {
        // near-miss detection — exactly 2 matching from left on any line
        const nm = SLOT_LINES.some((line) => final[line[0]] !== SCATTER && final[line[0]] !== COIN && final[line[1]] === final[line[0]] && final[line[2]] !== final[line[0]]);
        setNearMiss(nm);
        setMsg(nm ? "😱 So close! Spin again" : isFree ? "" : "Try again — your luck will turn!");
      }
      // finish credits the win (topUp) + records history. Free rounds record bet 0.
      finish(isFree ? 0 : betAmt, effWin);
      if (coinCount >= 5 && !isFree && !holdWin) {
        setMsg("🪙 HOLD & WIN bonus!");
        later(() => setHoldWin({ paid: false }), 900);
      } else if (newFree > 0) {
        setMsg(`⭐⭐⭐ ${bn(newFree)} free spins! All wins 2x`);
        setFreeLeft(newFree);
        setFreeWon(0);
      }
    }, 350 + 5 * colDelay + 120);
  }

  // free-spin / autoplay chaining
  useEffect(() => {
    if (spinning) return;
    if (freeLeft > 0) {
      const t = setTimeout(() => { setFreeLeft((v) => v - 1); doSpin(true, bet); }, 1100);
      return () => clearTimeout(t);
    }
    if (autoLeft > 0) {
      const t = setTimeout(() => { setAutoLeft((v) => v - 1); doSpin(false, bet); }, 900);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spinning, freeLeft, autoLeft]);

  useEffect(() => {
    if (freeLeft === 0 && freeWon > 0 && !spinning) {
      setMsg(`🎁 Free spins over! You won ${money(freeWon)} in total`);
      setFreeWon(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [freeLeft, spinning]);

  const betIdx = Math.max(0, BET_STEPS.indexOf(bet));

  return (
    <Page>
      <Back href={`${base}/games`} label="Game lobby" />
      <style>{`
        @keyframes dp-fall { 0% { transform: translateY(-240%) scaleY(1.22) scaleX(.92); opacity: 0; filter: blur(3px) } 45% { opacity: 1; filter: blur(0) } 62% { transform: translateY(5%) scaleY(.86) scaleX(1.06) } 80% { transform: translateY(-2.5%) scaleY(1.04) scaleX(.98) } 100% { transform: translateY(0) scaleY(1) scaleX(1); opacity: 1 } }
        @keyframes dp-coin { 0% { transform: translateY(0) rotate(0) scale(1); opacity: 1 } 100% { transform: translateY(-190px) rotate(340deg) scale(.4); opacity: 0 } }
        @keyframes dp-tierpop { 0% { transform: scale(.3) rotate(-6deg); opacity: 0 } 60% { transform: scale(1.15) rotate(2deg); opacity: 1 } 100% { transform: scale(1) rotate(0) } }
        @keyframes dp-glowpulse { 0%,100% { box-shadow: 0 0 0 2px #f5c518, 0 0 14px #f5c51888 } 50% { box-shadow: 0 0 0 3px #ffe97a, 0 0 30px #f5c518 } }
        @keyframes dp-floaty { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-10px) } }
        @keyframes dp-shine { 0% { transform: translateX(-130%) skewX(-18deg) } 100% { transform: translateX(240%) skewX(-18deg) } }
        .dp-fall { animation: dp-fall .42s cubic-bezier(.3,.7,.4,1) both }
        .dp-wincell { animation: dp-glowpulse .7s ease-in-out infinite }
        .dp-tier { animation: dp-tierpop .55s cubic-bezier(.2,.9,.3,1.3) both }
        .dp-spinbtn { position: relative; overflow: hidden }
        .dp-spinbtn::after { content: ""; position: absolute; top: 0; bottom: 0; width: 40%; background: linear-gradient(90deg, transparent, #ffffff55, transparent); animation: dp-shine 2.4s ease infinite }
      `}</style>

      {/* ===== STAGE ===== */}
      <div className={`relative overflow-hidden rounded-[28px] border border-[#f5c518]/30 bg-gradient-to-b ${cg?.grad ?? "from-[#2a1650] via-[#160b2e] to-[#0b0e11]"} shadow-[0_20px_60px_rgba(0,0,0,0.55)]`}>
        {/* ambient decor */}
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-[190px] opacity-[0.13] blur-[1px]" style={{ animation: "dp-floaty 5s ease-in-out infinite" }}>{g.e}</div>
          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/12 to-transparent" />
          {["✨", "🪙", "⭐", "💫", "🪙"].map((p, i) => (
            <span key={i} className="absolute text-lg opacity-50" style={{ left: `${8 + i * 21}%`, top: `${12 + (i % 3) * 9}%`, animation: `dp-floaty ${3.4 + i * 0.5}s ease-in-out infinite` }}>{p}</span>
          ))}
        </div>

        <div className="relative px-3 pb-4 pt-4 sm:px-5">
          {/* balance + session strip — always visible while playing */}
          <div className="mb-3 flex items-center justify-between gap-2 rounded-2xl bg-black/45 px-3.5 py-2 ring-1 ring-white/10">
            <p className="text-xs font-bold text-white/75">💰 Balance <b className="text-sm text-[#f5c518]">{money(store.wallet)}</b></p>
            <p className="text-xs font-bold text-white/75">🏆 Won this session <b className="text-sm text-emerald-300">{money(totalWin)}</b></p>
            <Link href={`${base}/deposit`} className="rounded-lg bg-[#f5c518] px-2.5 py-1 text-[11px] font-black text-black">＋ Top-up</Link>
          </div>

          {/* jackpot tiers — progressive */}
          <div className="mx-auto mt-2 grid max-w-[560px] grid-cols-4 gap-1.5">
            {[["GRAND", pots.grand, "from-red-500 to-red-800"], ["MAJOR", pots.major, "from-fuchsia-500 to-purple-800"], ["MINOR", pots.minor, "from-sky-500 to-blue-800"], ["MINI", pots.mini, "from-emerald-500 to-green-800"]].map(([t, v, gr]) => (
              <div key={t as string} className={`rounded-xl bg-gradient-to-b ${gr} p-[2px] shadow`}>
                <div className="rounded-[10px] bg-black/55 px-1 py-1 text-center">
                  <p className="text-[8px] font-black tracking-widest text-white/85">{t}</p>
                  <p className="text-[11px] font-black tabular-nums text-yellow-200">{money(v as number)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* title bar */}
          <div className="flex items-center justify-between gap-2">
            <span className="rounded-lg bg-black/45 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-white/80">{cg?.provider ?? "DigiPlay Originals"}</span>
            <p className="bg-gradient-to-b from-yellow-200 via-[#f5c518] to-amber-600 bg-clip-text text-center text-xl font-black uppercase tracking-wide text-transparent drop-shadow sm:text-2xl">{g.n}</p>
            <span className="rounded-lg bg-gradient-to-b from-fuchsia-500 to-purple-700 px-2 py-1 text-[10px] font-black text-white shadow">MAX {bn(1000)}x</span>
          </div>

          {/* free spin banner */}
          {freeLeft > 0 && (
            <div className="mx-auto mt-3 w-fit rounded-full bg-gradient-to-r from-fuchsia-600 to-purple-600 px-4 py-1.5 text-xs font-black text-white shadow-lg">
              🎁 Free spins left: {bn(freeLeft)} • all wins 2x • collected {money(freeWon)}
            </div>
          )}

          {/* ===== REELS 5x3 ===== */}
          <div className="relative mx-auto mt-3 max-w-[560px] rounded-3xl border-2 border-[#f5c518]/50 bg-black/50 p-2 shadow-[inset_0_0_40px_rgba(0,0,0,0.8)] sm:p-2.5">
            <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
              {grid.map((s, i) => {
                const col = i % 5;
                const row = Math.floor(i / 5);
                const isWin = winCells.includes(i);
                const stopped = col < stoppedCols;
                return (
                  <div key={`${roundKey}-${i}`}
                    className={`relative flex aspect-[4/5] items-center justify-center overflow-hidden rounded-xl text-[26px] sm:text-4xl ${
                      isWin ? "dp-wincell z-10 bg-gradient-to-b from-amber-200 via-yellow-400 to-amber-500" : "bg-gradient-to-b from-[#2b3350] via-[#171d33] to-[#0d1220]"
                    } ${stopped && !spinning ? "dp-fall" : ""}`}
                    style={{ animationDelay: `${col * 90 + row * 55}ms` }}>
                    <span className={spinning && !stopped ? "opacity-70 blur-[1.5px]" : "drop-shadow-[0_3px_6px_rgba(0,0,0,0.65)]"}>{s}</span>
                    {s === SCATTER && <span className="absolute bottom-0.5 rounded bg-black/50 px-1 text-[7px] font-black text-yellow-200">SCATTER</span>}
                  </div>
                );
              })}
            </div>
            {/* coin burst */}
            {coins.length > 0 && (
              <div className="pointer-events-none absolute inset-0 overflow-visible" aria-hidden>
                {coins.map((c) => (
                  <span key={`${roundKey}-coin-${c}`} className="absolute text-xl"
                    style={{ left: `${8 + ((c * 37) % 84)}%`, bottom: "16%", animation: `dp-coin ${0.9 + (c % 5) * 0.14}s ease-out ${((c * 53) % 40) / 100}s both` }}>🪙</span>
                ))}
              </div>
            )}
            {/* win tier overlay */}
            {tier && !spinning && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden>
                <p className={`dp-tier bg-gradient-to-b ${tier === "mega" ? "from-fuchsia-300 via-pink-500 to-purple-700" : tier === "big" ? "from-yellow-200 via-[#f5c518] to-amber-600" : "from-emerald-200 via-emerald-400 to-green-600"} bg-clip-text text-5xl font-black uppercase tracking-wide text-transparent drop-shadow-[0_4px_22px_rgba(0,0,0,0.8)] sm:text-6xl`}>
                  {tier === "mega" ? "MEGA WIN" : tier === "big" ? "BIG WIN" : "WIN!"}
                </p>
              </div>
            )}
          </div>

          {/* WIN display */}
          <div className="mx-auto mt-3 flex max-w-[560px] items-center justify-center gap-3">
            <p className="text-sm font-black tracking-[0.3em] text-[#f5c518]">TOTAL WIN</p>
            <p className={`text-2xl font-black tabular-nums ${dispTotal > 0 ? "text-white" : "text-white/50"}`}>{money(dispTotal)}</p>
            {nearMiss && !spinning && <span className="animate-pulse rounded-full bg-red-500/20 px-2.5 py-1 text-[10px] font-black text-red-300 ring-1 ring-red-400/50">😱 So close!</span>}
          </div>
          {msg && <p className="mt-1.5 text-center text-xs font-bold text-white/85">{msg}</p>}

          {/* ===== CONTROL BAR (JILI style, mobile-fit) ===== */}
          <div className="mx-auto mt-3 grid max-w-[560px] grid-cols-[44px_1fr_72px_44px_44px] items-center gap-2">
            <div className="flex flex-col items-center gap-1">
              <button onClick={() => setTurbo((t) => !t)} className={`grid h-11 w-11 place-items-center rounded-full border text-lg transition active:scale-90 ${turbo ? "border-[#f5c518] bg-[#f5c518]/25 text-[#f5c518]" : "border-white/20 bg-black/40 text-white/70"}`} aria-label="Turbo">⚡</button>
              <span className="text-[9px] font-bold text-white/60">Turbo</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center justify-between gap-1 rounded-full border border-white/20 bg-black/45 p-1">
                <button onClick={() => setBet(BET_STEPS[Math.max(0, betIdx - 1)])} disabled={spinning || freeLeft > 0} className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/10 text-lg font-black text-white transition active:scale-90 disabled:opacity-40">−</button>
                <div className="min-w-0 text-center">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-white/55">Bet</p>
                  <p className="truncate text-sm font-black text-white">{money(bet)}</p>
                </div>
                <button onClick={() => setBet(BET_STEPS[Math.min(BET_STEPS.length - 1, betIdx + 1)])} disabled={spinning || freeLeft > 0} className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/10 text-lg font-black text-white transition active:scale-90 disabled:opacity-40">＋</button>
              </div>
              <p className="mt-1 text-center text-[9px] font-bold text-white/60">Max win {money(bet * 1000)}</p>
            </div>
            {/* SPIN */}
            <button onClick={() => doSpin(false, bet)} disabled={spinning || freeLeft > 0}
              className="dp-spinbtn relative grid h-[72px] w-[72px] place-items-center justify-self-center rounded-full bg-gradient-to-b from-yellow-200 via-[#f5c518] to-amber-600 text-black shadow-[0_10px_28px_rgba(245,197,24,0.45)] ring-4 ring-amber-900/60 transition hover:scale-105 active:scale-95 disabled:opacity-60">
              <span className={`text-[24px] ${spinning ? "animate-spin" : ""}`}>⟳</span>
              <span className="absolute bottom-2 text-[9px] font-black tracking-widest">{spinning ? "..." : "SPIN"}</span>
            </button>
            <div className="flex flex-col items-center gap-1">
              <button onClick={() => setAutoLeft(autoLeft > 0 ? 0 : 30)} disabled={spinning && autoLeft === 0}
                className={`grid h-11 w-11 place-items-center rounded-full border text-sm font-black transition active:scale-90 ${autoLeft > 0 ? "border-[#f5c518] bg-[#f5c518]/25 text-[#f5c518]" : "border-white/20 bg-black/40 text-white/70"}`} aria-label="Auto">
                {autoLeft > 0 ? bn(autoLeft) : "▶"}
              </button>
              <span className="text-[9px] font-bold text-white/60">Auto 30</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <button onClick={() => { if (stateRef.current.spinning || holdWin) return; if (store.payWithWallet(bet * 50, `🎁 ${g.n} bonus`)) { setMsg(""); setHoldWin({ paid: true }); } else setMsg("Low balance — deposit to continue"); }}
                className="grid h-11 w-11 place-items-center rounded-full border border-amber-300/60 bg-gradient-to-b from-amber-400/30 to-amber-600/30 text-lg transition active:scale-90" aria-label="Buy bonus">🎁</button>
              <span className="text-[9px] font-bold text-white/60">Bonus</span>
            </div>
          </div>
        </div>
      </div>

      {holdWin && <HoldWinBonus bet={bet} onEnd={endHoldWin} />}

      {/* paytable */}
      <div className="mx-auto mt-4 max-w-[560px] rounded-2xl border border-white/10 bg-[#101828]/90 p-4">
        <p className="text-sm font-black text-[#f5c518]">💰 Paytable (3/4/5 in a line)</p>
        <p className="mt-1 text-xs text-slate-300">🪙 <b className="text-white">5+ coins</b> = HOLD & WIN bonus (up to the jackpot!) • ⭐ 3+ = 8 free spins</p>
        <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-slate-300 sm:grid-cols-4">
          {syms.slice(0, 8).map((s, i) => (
            <p key={i}>{s} <b className="text-white">{bn(SLOT_PAY[i][0])}x / {bn(SLOT_PAY[i][1])}x / {bn(SLOT_PAY[i][2])}x</b></p>
          ))}
        </div>
        <p className="mt-2 text-[11px] text-slate-500">5 pay-lines • ⭐ Scatter 3+ = 8 free spins (2x) • RTP {g.rtp} • total won this session: {money(totalWin)}</p>
      </div>
    </Page>
  );
}
export function LiveCasino() {
  const { base } = useSkin();
  return (
    <Page>
      <Back href={`${base}/casino`} label="Lobby" />
      <SectionTitle t="🎥 Live Casino" sub="Real dealer (simulated)" />
      <div className="mb-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-center text-xs text-red-200">
        🔴 {bn(LIVE_GAMES.length)} tables live now — the dealer is waiting
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
  if (!g) return <Page narrow><Empty emoji="🔍" text="Table not found" /></Page>;
  const target = g.id.replace("live-", "");
  const targetGame = ALL_GAMES.find((x) => x.id === target);
  const joinHref = targetGame ? `${base}${gameHref(targetGame)}` : `${base}/casino`;
  return (
    <Page narrow>
      <Back href={`${base}/casino/live`} label="Live casino" />
      <div className={`${card} overflow-hidden`}>
        <div className="relative bg-gradient-to-b from-emerald-950 to-[#0b1120] p-6 text-center">
          <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-red-600 px-2.5 py-1 text-[11px] font-black text-white animate-pulse">🔴 Live</span>
          <p className="text-6xl">{g.e}</p>
          <h1 className="mt-2 text-xl font-black">{g.n}</h1>
          <p className={`mt-1 text-xs ${sub}`}>🎩 Dealer: Riya • 💺 {bn(seats)} players playing</p>
          {/* simulated dealer video */}
          <div className="mx-auto mt-4 flex h-36 max-w-sm items-center justify-center rounded-2xl border border-emerald-800 bg-black/50">
            <div className="text-center">
              <p className="text-5xl animate-pulse">🎩</p>
              <p className="mt-1 text-[11px] text-slate-400">Dealer video (simulated)</p>
            </div>
          </div>
        </div>
        <div className="p-4">
          <p className="mb-2 text-sm font-black text-[#f5c518]">💬 Live chat (demo)</p>
          <div className="mb-3 max-h-28 space-y-1 overflow-y-auto text-xs">
            {["Rahim: Good luck everyone! 🍀", "Sakib: The dealer is great today", "Nusrat: A big win is coming...", "Karim: Teen Patti is the best!"].map((c, i) => (
              <p key={i} className={sub}>{c}</p>
            ))}
          </div>
          <Link href={joinHref}
            className="block w-full rounded-xl bg-[#f5c518] py-3 text-center font-black text-black">
            ▶️ Join the table
          </Link>
          <p className="mt-2 text-center text-[11px] text-slate-500">Demo table — play on the same game engine</p>
        </div>
      </div>
    </Page>
  );
}

/* ---------- playable table games ---------- */

export function RouletteGame() {
  const { store } = useSkin();
  const finish = useGameRound("Roulette");
  const [bet, setBet] = useState(50);
  const [pick, setPick] = useState<"red" | "black" | number>("red");
  const [spinning, setSpinning] = useState(false);
  const [num, setNum] = useState<number | null>(null);
  const [msg, setMsg] = useState("");
  const REDS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

  function spin() {
    setMsg("");
    if (spinning) return;
    if (!store.payWithWallet(bet, "🎡 Roulette")) { setMsg("Low balance — deposit to continue"); return; }
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
        setMsg(win > 0 ? `🎉 ${bn(r)}! You won ${money(win)}` : `😅 ${bn(r)} — you lost`);
        setSpinning(false);
      }
    }, 100);
  }

  const color = num === null ? "" : num === 0 ? "bg-emerald-600" : REDS.includes(num) ? "bg-red-600" : "bg-slate-800";
  return (
    <GameShell title="Roulette" emoji="🎡" rtp="97.3%">
      <div className="flex justify-center">
        <div className={`flex h-28 w-28 items-center justify-center rounded-full border-4 border-[#f5c518] text-4xl font-black text-white transition ${spinning ? "animate-spin" : ""} ${color || "bg-slate-800"}`}>
          {num === null ? "🎡" : bn(num)}
        </div>
      </div>
      {msg && <p className="mt-2 text-center text-sm font-black text-[#f5c518]">{msg}</p>}
      <p className="mb-1.5 mt-4 text-xs font-bold text-slate-400">Choose</p>
      <div className="grid grid-cols-2 gap-1.5">
        <button onClick={() => setPick("red")} className={`rounded-xl py-2.5 font-black ${pick === "red" ? "bg-red-600 text-white" : "bg-white/5"}`}>🔴 Red (1.95x)</button>
        <button onClick={() => setPick("black")} className={`rounded-xl py-2.5 font-black ${pick === "black" ? "bg-slate-700 text-white ring-2 ring-white/40" : "bg-white/5"}`}>⚫ Black (1.95x)</button>
      </div>
      <div className="mt-2 flex flex-wrap gap-1">
        {[0, 7, 14, 21, 28, 36].map((v) => (
          <button key={v} onClick={() => setPick(v)} className={`rounded-lg px-2.5 py-1 text-xs font-black ${pick === v ? "bg-[#f5c518] text-black" : "bg-white/10"}`}>{bn(v)} (35x)</button>
        ))}
      </div>
      <div className="mt-3"><p className="mb-1.5 text-xs font-bold text-slate-400">Bet</p><BetChips bet={bet} setBet={setBet} /></div>
      <button onClick={spin} disabled={spinning} className="mt-4 w-full rounded-2xl bg-[#f5c518] py-3.5 text-lg font-black text-black disabled:opacity-50">
        {spinning ? "🌀 Spinning..." : "🎡 Spin"}
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
  const finish = useGameRound("Blackjack");
  const [bet, setBet] = useState(50);
  const [ph, setPh] = useState<string[]>([]);
  const [dh, setDh] = useState<string[]>([]);
  const [stage, setStage] = useState<"bet" | "play" | "done">("bet");
  const [msg, setMsg] = useState("");

  function deal() {
    setMsg("");
    if (!store.payWithWallet(bet, "🂡 Blackjack")) { setMsg("Low balance — deposit to continue"); return; }
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
    setMsg(win > bet ? `🎉 You won ${money(win)}!` : win === bet ? "🤝 Draw — bet returned" : `😅 You lost (dealer ${bn(dv)})`);
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
    <GameShell title="Blackjack" emoji="🂡" rtp="99.4%">
      {stage === "bet" ? (
        <>
          <p className="text-center text-6xl">🂡</p>
          <p className="mt-2 text-center text-sm text-slate-400">Get close to 21, don't go over!</p>
          <div className="mt-3"><p className="mb-1.5 text-xs font-bold text-slate-400">Bet</p><BetChips bet={bet} setBet={setBet} /></div>
          {msg && <p className="mt-2 text-center text-xs font-bold text-red-300">{msg}</p>}
          <button onClick={deal} className="mt-4 w-full rounded-2xl bg-[#f5c518] py-3.5 font-black text-black">🃏 Deal</button>
        </>
      ) : (
        <>
          <div className="rounded-2xl bg-emerald-950/50 p-3">
            <p className="text-xs text-slate-400">Dealer {stage === "play" ? "(one hidden)" : ""} — {stage === "done" ? bn(bjVal(dh)) : "?"}</p>
            <div className="mt-1 flex gap-1.5">{dh.map((c, i) => <span key={i}>{i === 1 && stage === "play" ? <span className="inline-flex h-14 w-11 items-center justify-center rounded-lg bg-[#f5c518]/20 text-lg">❓</span> : <CardView c={c} />}</span>)}</div>
          </div>
          <div className="mt-3 rounded-2xl bg-emerald-950/50 p-3">
            <p className="text-xs text-slate-400">You — {bn(bjVal(ph))}</p>
            <div className="mt-1 flex gap-1.5">{ph.map((c, i) => <CardView key={i} c={c} />)}</div>
          </div>
          {msg && <p className="mt-3 text-center text-sm font-black text-[#f5c518]">{msg}</p>}
          {stage === "play" ? (
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button onClick={hit} className="rounded-xl bg-[#f5c518] py-3 font-black text-black">👆 Hit</button>
              <button onClick={() => end(ph, dh)} className="rounded-xl border border-white/20 py-3 font-black">✋ Stand</button>
            </div>
          ) : (
            <button onClick={() => { setStage("bet"); setPh([]); setDh([]); setMsg(""); }} className="mt-4 w-full rounded-xl bg-[#f5c518] py-3 font-black text-black">🔄 Play again</button>
          )}
        </>
      )}
    </GameShell>
  );
}

export function BaccaratGame() {
  const { store } = useSkin();
  const finish = useGameRound("Baccarat");
  const [bet, setBet] = useState(50);
  const [pick, setPick] = useState<"player" | "banker" | "tie">("player");
  const [ph, setPh] = useState<string[]>([]);
  const [bh, setBh] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const [msg, setMsg] = useState("");
  const bv = (h: string[]) => h.reduce((s, c) => { const r = c.slice(0, -1); return s + (["K", "Q", "J", "10"].includes(r) ? 0 : r === "A" ? 1 : parseInt(r)); }, 0) % 10;

  function play() {
    setMsg("");
    if (!store.payWithWallet(bet, "🃏 Baccarat")) { setMsg("Low balance — deposit to continue"); return; }
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
    setMsg(win > 0 ? `🎉 You won ${money(win)}!` : `😅 You lost (player ${bn(pv)} — banker ${bn(bval)})`);
  }
  return (
    <GameShell title="Baccarat" emoji="🃏" rtp="98.9%">
      {(["player", "banker", "tie"] as const).map((k) => (
        <button key={k} onClick={() => { setPick(k); setDone(false); }}
          className={`mb-1.5 w-full rounded-xl py-2.5 text-sm font-black ${pick === k ? "bg-[#f5c518] text-black" : "bg-white/5"}`}>
          {k === "player" ? "🧍 Player (2x)" : k === "banker" ? "🏦 Banker (1.95x)" : "🤝 Tie (8x)"}
        </button>
      ))}
      {done && (
        <div className="mt-2 grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-white/5 p-2 text-center"><p className="text-xs text-slate-400">Player {bn(bv(ph))}</p><div className="mt-1 flex justify-center gap-1">{ph.map((c, i) => <CardView key={i} c={c} small />)}</div></div>
          <div className="rounded-xl bg-white/5 p-2 text-center"><p className="text-xs text-slate-400">Banker {bn(bv(bh))}</p><div className="mt-1 flex justify-center gap-1">{bh.map((c, i) => <CardView key={i} c={c} small />)}</div></div>
        </div>
      )}
      {msg && <p className="mt-2 text-center text-sm font-black text-[#f5c518]">{msg}</p>}
      <div className="mt-3"><p className="mb-1.5 text-xs font-bold text-slate-400">Bet</p><BetChips bet={bet} setBet={setBet} /></div>
      <button onClick={play} className="mt-3 w-full rounded-2xl bg-[#f5c518] py-3.5 font-black text-black">🃏 Deal</button>
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
const POKER_NAMES = ["High Card", "Pair", "Colour", "Sequence", "Pure Sequence", "Trio"];

export function PokerGame() {
  const { store } = useSkin();
  const finish = useGameRound("Three-Card Poker");
  const [bet, setBet] = useState(50);
  const [ph, setPh] = useState<string[]>([]);
  const [dh, setDh] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const [msg, setMsg] = useState("");
  function play() {
    setMsg("");
    if (!store.payWithWallet(bet, "♠️ Poker")) { setMsg("Low balance — deposit to continue"); return; }
    const used = new Set<string>();
    const p = [drawCard(used), drawCard(used), drawCard(used)];
    const d = [drawCard(used), drawCard(used), drawCard(used)];
    setPh(p); setDh(d); setDone(true);
    const cmp = cmpHands(pokerRank(p), pokerRank(d));
    const win = cmp > 0 ? bet * 2 : cmp === 0 ? bet : 0;
    finish(bet, win);
    setMsg(win > bet ? `🎉 You won ${money(win)}! (${POKER_NAMES[pokerRank(p)[0]]})` : win === bet ? "🤝 Draw — bet returned" : `😅 You lost (dealer: ${POKER_NAMES[pokerRank(d)[0]]})`);
  }
  return (
    <GameShell title="Three-Card Poker" emoji="♠️" rtp="96.6%">
      <p className="mb-3 text-center text-xs text-slate-400">Make a better hand than the dealer</p>
      {done ? (
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-white/5 p-2 text-center"><p className="text-xs text-slate-400">You — {POKER_NAMES[pokerRank(ph)[0]]}</p><div className="mt-1 flex justify-center gap-1">{ph.map((c, i) => <CardView key={i} c={c} small />)}</div></div>
          <div className="rounded-xl bg-white/5 p-2 text-center"><p className="text-xs text-slate-400">Dealer — {POKER_NAMES[pokerRank(dh)[0]]}</p><div className="mt-1 flex justify-center gap-1">{dh.map((c, i) => <CardView key={i} c={c} small />)}</div></div>
        </div>
      ) : <p className="py-8 text-center text-6xl">🂠🂠🂠</p>}
      {msg && <p className="mt-2 text-center text-sm font-black text-[#f5c518]">{msg}</p>}
      <div className="mt-3"><p className="mb-1.5 text-xs font-bold text-slate-400">Bet</p><BetChips bet={bet} setBet={setBet} /></div>
      <button onClick={play} className="mt-3 w-full rounded-2xl bg-[#f5c518] py-3.5 font-black text-black">♠️ Deal</button>
    </GameShell>
  );
}

export function TeenPattiGame() {
  const { store } = useSkin();
  const finish = useGameRound("Teen Patti");
  const [bet, setBet] = useState(50);
  const [ph, setPh] = useState<string[]>([]);
  const [dh, setDh] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const [msg, setMsg] = useState("");
  function play() {
    setMsg("");
    if (!store.payWithWallet(bet, "🪔 Teen Patti")) { setMsg("Low balance — deposit to continue"); return; }
    const used = new Set<string>();
    const p = [drawCard(used), drawCard(used), drawCard(used)];
    const d = [drawCard(used), drawCard(used), drawCard(used)];
    setPh(p); setDh(d); setDone(true);
    const cmp = cmpHands(pokerRank(p), pokerRank(d));
    const win = cmp > 0 ? bet * 2 : cmp === 0 ? bet : 0;
    finish(bet, win);
    setMsg(win > bet ? `🎉 Well done! You won ${money(win)} (${POKER_NAMES[pokerRank(p)[0]]})` : win === bet ? "🤝 Draw — bet returned" : `😅 You lost (opponent: ${POKER_NAMES[pokerRank(d)[0]]})`);
  }
  return (
    <GameShell title="Teen Patti" emoji="🪔" rtp="97.1%">
      <div className="mb-2 flex justify-center gap-1 text-[11px] text-slate-400">
        {POKER_NAMES.map((n, i) => <span key={n} className="rounded bg-white/5 px-1.5 py-0.5">{n}{i < 5 ? " <" : ""}</span>)}
      </div>
      {done ? (
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-white/5 p-2 text-center"><p className="text-xs text-slate-400">You — {POKER_NAMES[pokerRank(ph)[0]]}</p><div className="mt-1 flex justify-center gap-1">{ph.map((c, i) => <CardView key={i} c={c} small />)}</div></div>
          <div className="rounded-xl bg-white/5 p-2 text-center"><p className="text-xs text-slate-400">Opponent — {POKER_NAMES[pokerRank(dh)[0]]}</p><div className="mt-1 flex justify-center gap-1">{dh.map((c, i) => <CardView key={i} c={c} small />)}</div></div>
        </div>
      ) : <p className="py-8 text-center text-6xl">🪔</p>}
      {msg && <p className="mt-2 text-center text-sm font-black text-[#f5c518]">{msg}</p>}
      <div className="mt-3"><p className="mb-1.5 text-xs font-bold text-slate-400">Bet (move)</p><BetChips bet={bet} setBet={setBet} /></div>
      <button onClick={play} className="mt-3 w-full rounded-2xl bg-[#f5c518] py-3.5 font-black text-black">🪔 Show cards</button>
    </GameShell>
  );
}

export function AndarBaharGame() {
  const { store } = useSkin();
  const finish = useGameRound("Andar Bahar");
  const [bet, setBet] = useState(50);
  const [pick, setPick] = useState<"andar" | "bahar">("andar");
  const [mid, setMid] = useState("");
  const [seq, setSeq] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const [msg, setMsg] = useState("");
  function play() {
    setMsg(""); setSeq([]); setDone(false);
    if (!store.payWithWallet(bet, "🎴 Andar Bahar")) { setMsg("Low balance — deposit to continue"); return; }
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
        setMsg(win > 0 ? `🎉 ${winner === "andar" ? "Andar" : "Bahar"} won! ${money(win)}` : `😅 ${winner === "andar" ? "Andar" : "Bahar"} won — you lost`);
      }
    }, 350);
  }
  return (
    <GameShell title="Andar Bahar" emoji="🎴" rtp="96.8%">
      <div className="grid grid-cols-2 gap-2">
        {(["andar", "bahar"] as const).map((k) => (
          <button key={k} onClick={() => setPick(k)} className={`rounded-xl py-3 font-black ${pick === k ? "bg-[#f5c518] text-black" : "bg-white/5"}`}>
            {k === "andar" ? "⬅️ Andar" : "Bahar ➡️"}<br /><span className="text-xs">1.9x</span>
          </button>
        ))}
      </div>
      {mid && (
        <div className="mt-3 rounded-xl bg-white/5 p-3 text-center">
          <p className="text-[11px] text-slate-400">Middle card</p>
          <div className="mt-1 flex justify-center"><CardView c={mid} /></div>
          <div className="mt-2 flex flex-wrap justify-center gap-1">{seq.map((c, i) => <span key={i} className={i % 2 === 0 ? "mr-1" : ""}><CardView c={c} small /></span>)}</div>
        </div>
      )}
      {msg && <p className="mt-2 text-center text-sm font-black text-[#f5c518]">{msg}</p>}
      <div className="mt-3"><p className="mb-1.5 text-xs font-bold text-slate-400">Bet</p><BetChips bet={bet} setBet={setBet} /></div>
      <button onClick={play} className="mt-3 w-full rounded-2xl bg-[#f5c518] py-3.5 font-black text-black">🎴 Play</button>
    </GameShell>
  );
}

export function DragonTigerGame() {
  const { store } = useSkin();
  const finish = useGameRound("Dragon Tiger");
  const [bet, setBet] = useState(50);
  const [pick, setPick] = useState<"dragon" | "tiger" | "tie">("dragon");
  const [dc, setDc] = useState("");
  const [tc, setTc] = useState("");
  const [msg, setMsg] = useState("");
  function play() {
    setMsg("");
    if (!store.payWithWallet(bet, "🐉 Dragon Tiger")) { setMsg("Low balance — deposit to continue"); return; }
    const used = new Set<string>();
    const d = drawCard(used), t = drawCard(used);
    setDc(d); setTc(t);
    const dv = rankVal(d.slice(0, -1)), tv = rankVal(t.slice(0, -1));
    let win = 0;
    if (dv === tv && pick === "tie") win = bet * 8;
    else if (dv > tv && pick === "dragon") win = Math.round(bet * 1.95);
    else if (tv > dv && pick === "tiger") win = Math.round(bet * 1.95);
    finish(bet, win);
    setMsg(win > 0 ? `🎉 You won ${money(win)}!` : `😅 You lost (dragon ${d} vs tiger ${t})`);
  }
  return (
    <GameShell title="Dragon Tiger" emoji="🐉" rtp="96.7%">
      <div className="grid grid-cols-3 gap-1.5">
        {(["dragon", "tiger", "tie"] as const).map((k) => (
          <button key={k} onClick={() => setPick(k)} className={`rounded-xl py-2.5 text-sm font-black ${pick === k ? "bg-[#f5c518] text-black" : "bg-white/5"}`}>
            {k === "dragon" ? "🐉 Dragon" : k === "tiger" ? "🐯 Tiger" : "🤝 Tie"}<br /><span className="text-[11px]">{k === "tie" ? "8x" : "1.95x"}</span>
          </button>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-white/5 p-3 text-center"><p className="text-xs text-slate-400">🐉 Dragon</p><div className="mt-1 flex justify-center">{dc ? <CardView c={dc} /> : <span className="text-4xl">❓</span>}</div></div>
        <div className="rounded-xl bg-white/5 p-3 text-center"><p className="text-xs text-slate-400">🐯 Tiger</p><div className="mt-1 flex justify-center">{tc ? <CardView c={tc} /> : <span className="text-4xl">❓</span>}</div></div>
      </div>
      {msg && <p className="mt-2 text-center text-sm font-black text-[#f5c518]">{msg}</p>}
      <div className="mt-3"><p className="mb-1.5 text-xs font-bold text-slate-400">Bet</p><BetChips bet={bet} setBet={setBet} /></div>
      <button onClick={play} className="mt-3 w-full rounded-2xl bg-[#f5c518] py-3.5 font-black text-black">🐉 Deal</button>
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
    if (!store.payWithWallet(bet, `📈 ${gameName}`)) { setMsg("Low balance — deposit to continue"); return; }
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
        setMsg(`💥 Crashed at ${bn(cp.toFixed(2))}x! You lost the bet`);
      }
    }, 120);
  }
  function cashout() {
    if (stage !== "flying" || !timer.current) return;
    clearInterval(timer.current);
    const win = Math.round(bet * mult);
    setCashed(win);
    finish(bet, win);
    setMsg(`🎉 Cashed out at ${bn(mult.toFixed(2))}x! You won ${money(win)}`);
    setStage("done");
  }
  useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);
  const reset = () => { setStage("idle"); setMult(1); setMsg(""); setCashed(0); };
  return { bet, setBet, stage, mult, msg, cashed, start, cashout, reset };
}

export function CrashGame() {
  const e = useCrashEngine("Crash");
  const pts = Array.from({ length: 20 }, (_, i) => {
    const x = (i / 19) * 100;
    const y = 100 - Math.min(100, (Math.pow(e.mult, 0.5) - 1) * 30 * (i / 19));
    return `${x},${y}`;
  }).join(" ");
  return (
    <GameShell title="Crash" emoji="📈" rtp="97.0%">
      <div className="rounded-2xl bg-black/50 p-4">
        <svg viewBox="0 0 100 100" className="h-44 w-full">
          <polyline points={pts} fill="none" stroke={e.stage === "done" && e.cashed === 0 ? "#ef4444" : "#f5c518"} strokeWidth="2.5" />
          {e.stage === "flying" && <circle cx={100} cy={100 - Math.min(100, (Math.pow(e.mult, 0.5) - 1) * 30)} r="4" fill="#f5c518" />}
        </svg>
        <p className={`text-center text-5xl font-black ${e.stage === "done" && e.cashed === 0 ? "text-red-400" : "text-[#f5c518]"}`}>
          {bn(e.mult.toFixed(2))}x
        </p>
        <p className="text-center text-[11px] text-slate-500">Cash out before the crash!</p>
      </div>
      {e.msg && <p className="mt-2 text-center text-sm font-black text-[#f5c518]">{e.msg}</p>}
      {e.stage === "idle" && (<>
        <div className="mt-3"><p className="mb-1.5 text-xs font-bold text-slate-400">Bet</p><BetChips bet={e.bet} setBet={e.setBet} /></div>
        <button onClick={e.start} className="mt-3 w-full rounded-2xl bg-emerald-500 py-3.5 font-black text-white">🚀 Place your bet & start</button>
      </>)}
      {e.stage === "flying" && (
        <button onClick={e.cashout} className="mt-3 w-full animate-pulse rounded-2xl bg-[#f5c518] py-4 text-xl font-black text-black">
          💰 Cashout — {money(Math.round(e.bet * e.mult))}
        </button>
      )}
      {e.stage === "done" && (
        <button onClick={e.reset} className="mt-3 w-full rounded-2xl bg-[#f5c518] py-3.5 font-black text-black">🔄 New round</button>
      )}
    </GameShell>
  );
}

export function AviatorGame() {
  const e = useCrashEngine("Jet Flight");
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
    <GameShell title="Jet Flight" emoji="✈️" rtp="97.0%">
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
        <div className="mt-3"><p className="mb-1.5 text-xs font-bold text-slate-400">Bet</p><BetChips bet={e.bet} setBet={e.setBet} /></div>
        <div className="mt-2 flex items-center gap-2">
          <label className="text-xs text-slate-400">🤖 Auto cashout:</label>
          <input value={auto} onChange={(ev) => setAuto(ev.target.value.replace(/[^0-9.]/g, ""))} placeholder="e.g. 2.0" className="w-24 rounded-lg border border-white/15 bg-white/5 px-2 py-1.5 text-center text-sm text-white outline-none" />
          <span className="text-xs text-slate-500">x</span>
        </div>
        <button onClick={e.start} className="mt-3 w-full rounded-2xl bg-red-600 py-3.5 font-black text-white">✈️ Take off</button>
      </>)}
      {e.stage === "flying" && (
        <button onClick={e.cashout} className="mt-3 w-full animate-pulse rounded-2xl bg-[#f5c518] py-4 text-xl font-black text-black">
          💰 Cashout — {money(Math.round(e.bet * e.mult))}
        </button>
      )}
      {e.stage === "done" && (
        <button onClick={e.reset} className="mt-3 w-full rounded-2xl bg-[#f5c518] py-3.5 font-black text-black">🔄 New flight</button>
      )}
    </GameShell>
  );
}

export function DiceGame() {
  const { store } = useSkin();
  const finish = useGameRound("Dice");
  const [bet, setBet] = useState(50);
  const [pick, setPick] = useState<"small" | "big" | number>("big");
  const [roll, setRoll] = useState<number | null>(null);
  const [rolling, setRolling] = useState(false);
  const [msg, setMsg] = useState("");
  function play() {
    setMsg("");
    if (rolling) return;
    if (!store.payWithWallet(bet, "🎲 Dice")) { setMsg("Low balance — deposit to continue"); return; }
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
        setMsg(win > 0 ? `🎉 ${bn(r)}! You won ${money(win)}` : `😅 ${bn(r)} came up — you lost`);
        setRolling(false);
      }
    }, 90);
  }
  const faces = ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];
  return (
    <GameShell title="Dice" emoji="🎲" rtp="97.5%">
      <div className="flex justify-center py-4">
        <span className={`text-8xl ${rolling ? "animate-bounce" : ""}`}>{roll ? faces[roll] : "🎲"}</span>
      </div>
      {msg && <p className="text-center text-sm font-black text-[#f5c518]">{msg}</p>}
      <div className="mt-2 grid grid-cols-2 gap-1.5">
        <button onClick={() => setPick("small")} className={`rounded-xl py-2.5 font-black ${pick === "small" ? "bg-[#f5c518] text-black" : "bg-white/5"}`}>⬇️ Small (1-3)<br /><span className="text-xs">1.9x</span></button>
        <button onClick={() => setPick("big")} className={`rounded-xl py-2.5 font-black ${pick === "big" ? "bg-[#f5c518] text-black" : "bg-white/5"}`}>⬆️ Big (4-6)<br /><span className="text-xs">1.9x</span></button>
      </div>
      <div className="mt-2 flex gap-1">
        {[1, 2, 3, 4, 5, 6].map((v) => (
          <button key={v} onClick={() => setPick(v)} className={`flex-1 rounded-lg py-1.5 text-xs font-black ${pick === v ? "bg-[#f5c518] text-black" : "bg-white/10"}`}>{bn(v)}<br />5x</button>
        ))}
      </div>
      <div className="mt-3"><p className="mb-1.5 text-xs font-bold text-slate-400">Bet</p><BetChips bet={bet} setBet={setBet} /></div>
      <button onClick={play} disabled={rolling} className="mt-3 w-full rounded-2xl bg-[#f5c518] py-3.5 font-black text-black disabled:opacity-50">
        {rolling ? "🎲 Rolling..." : "🎲 Roll"}
      </button>
    </GameShell>
  );
}

const WHEEL_SEGS = [
  { t: "0x", v: 0, c: "#1f2937" }, { t: "1.2x", v: 1.2, c: "#065f46" },
  { t: "0x", v: 0, c: "#1f2937" }, { t: "2x", v: 2, c: "#b45309" },
  { t: "0.5x", v: 0.5, c: "#374151" }, { t: "1.5x", v: 1.5, c: "#065f46" },
  { t: "0x", v: 0, c: "#1f2937" }, { t: "5x", v: 5, c: "#f5c518" },
];

export function WheelGame() {
  const { store } = useSkin();
  const finish = useGameRound("Wheel of Fortune");
  const [bet, setBet] = useState(50);
  const [angle, setAngle] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [msg, setMsg] = useState("");
  function spin() {
    setMsg("");
    if (spinning) return;
    if (!store.payWithWallet(bet, "🎡 Wheel of Fortune")) { setMsg("Low balance — deposit to continue"); return; }
    setSpinning(true);
    const seg = Math.floor(Math.random() * 8);
    const target = 360 * 6 + (360 - seg * 45) - 22.5;
    setAngle((a) => a + target - (a % 360));
    setTimeout(() => {
      setSpinning(false);
      const w = Math.round(bet * WHEEL_SEGS[seg].v);
      finish(bet, w);
      setMsg(w > 0 ? `🎉 Stopped at ${WHEEL_SEGS[seg].t}! You won ${money(w)}` : "😅 0x — you lost, try again");
    }, 3200);
  }
  return (
    <GameShell title="Wheel of Fortune" emoji="🎡" rtp="96.3%">
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
      <div className="mt-3"><p className="mb-1.5 text-xs font-bold text-slate-400">Bet</p><BetChips bet={bet} setBet={setBet} /></div>
      <button onClick={spin} disabled={spinning} className="mt-3 w-full rounded-2xl bg-[#f5c518] py-3.5 font-black text-black disabled:opacity-50">
        {spinning ? "🌀 Spinning..." : "🎡 Spin the wheel"}
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
      <Back href={`${base}/casino`} label="Lobby" />
      <SectionTitle t="📜 Game History" sub={`${bn(store.gameHistory.length)} rounds`} />
      <div className="mb-3 grid grid-cols-3 gap-2 text-center">
        <div className={`${card} p-3`}><p className="text-sm font-black">{money(totalBet)}</p><p className={`text-[11px] ${sub}`}>Total bets</p></div>
        <div className={`${card} p-3`}><p className="text-sm font-black text-emerald-300">{money(totalWin)}</p><p className={`text-[11px] ${sub}`}>Total wins</p></div>
        <div className={`${card} p-3`}><p className={`text-sm font-black ${totalWin - totalBet >= 0 ? "text-emerald-300" : "text-red-300"}`}>{totalWin - totalBet >= 0 ? "+" : ""}{money(totalWin - totalBet)}</p><p className={`text-[11px] ${sub}`}>Profit/Loss</p></div>
      </div>
      {store.gameHistory.length === 0 ? <Empty emoji="📜" text="You haven't played yet" /> : (
        <div className="space-y-1.5">
          {store.gameHistory.map((g) => (
            <div key={g.id} className={`${card} flex items-center justify-between p-2.5 text-sm`}>
              <div><b>{g.game}</b><p className={`text-[11px] ${sub}`}>{fmtTime(g.date)} • bet {money(g.bet)}</p></div>
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
      <Back href={`${base}/casino`} label="Lobby" />
      <SectionTitle t="🏆 Tournaments" sub="Win big prizes" />
      <div className="space-y-3">
        {TOURNAMENTS.map((t) => (
          <Link key={t.id} href={`${base}/casino/tournaments/${t.id}`} className={`${card} block p-4 transition hover:border-[#f5c518]/50`}>
            <div className="flex items-start justify-between">
              <div><p className="text-lg font-black">{t.t}</p><p className={`mt-1 text-xs ${sub}`}>{t.desc}</p></div>
              <div className="text-right"><p className="text-lg font-black text-[#f5c518]">{money(t.prize)}</p><p className={`text-[11px] ${sub}`}>Prize pool</p></div>
            </div>
            <div className="mt-2 flex justify-between text-[11px] text-slate-400"><span>👥 {bn(t.players)} players</span><span>⏰ {t.ends}</span></div>
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
  if (!t) return <Page narrow><Empty emoji="🔍" text="Tournament not found" /></Page>;
  const leaders = [["Rahim_99", "12,450"], ["Sakib_King", "11,200"], ["Nusrat_7", "10,890"], ["Karim_21", "9,450"], ["Tanvir_X", "8,900"]].map(([n, p], i) => ({ n, p, i }));
  return (
    <Page narrow>
      <Back href={`${base}/casino/tournaments`} label="Tournaments" />
      <div className={`${card} p-5 text-center`}>
        <p className="text-5xl">{t.e}</p>
        <h1 className="mt-2 text-xl font-black">{t.t}</h1>
        <p className="mt-1 text-2xl font-black text-[#f5c518]">{money(t.prize)}</p>
        <p className={`text-xs ${sub}`}>Prize pool • {t.ends}</p>
        <p className="mt-3 text-sm text-slate-300">{t.body}</p>
        {joined ? (
          <p className="mt-4 rounded-xl bg-emerald-500/15 py-2.5 text-sm font-black text-emerald-300">✅ You have joined! Good luck 🍀</p>
        ) : (
          <button onClick={() => { if (!store.user) { setJoined(false); } else setJoined(true); }} className="mt-4 w-full rounded-xl bg-[#f5c518] py-3 font-black text-black">
            {store.user ? "🚀 Join the tournament (free)" : "🔑 Log in to join"}
          </button>
        )}
        {!store.user && !joined && <Link href={`${base}/login`} className="mt-2 block text-xs text-[#f5c518] underline">Login page →</Link>}
      </div>
      <div className={`${card} mt-3 p-4`}>
        <p className="mb-2 text-sm font-black text-[#f5c518]">🏅 Leaderboard</p>
        <div className="space-y-1.5">
          {leaders.map((l) => (
            <div key={l.n} className="flex items-center justify-between rounded-xl bg-white/[0.04] px-3 py-2 text-sm">
              <span>{["🥇", "🥈", "🥉", "4.", "5."][l.i]} <b>{l.n}</b></span>
              <span className="font-black text-[#f5c518]">{bn(l.p)} points</span>
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
  const names = ["💎 Mega Jackpot", "👑 Royal Jackpot", "⭐ Daily Jackpot"];
  return (
    <Page>
      <Back href={`${base}/casino`} label="Lobby" />
      <SectionTitle t="💰 Jackpots" sub="Growing every moment" />
      <div className="space-y-3">
        {pots.map((p, i) => (
          <div key={i} className="relative overflow-hidden rounded-3xl border border-[#f5c518]/30 bg-gradient-to-br from-[#1a1405] to-[#0b1120] p-6 text-center">
            <div className="pointer-events-none absolute inset-0 opacity-20" style={{ background: "radial-gradient(circle at 50% 0%, #f5c51855, transparent 70%)" }} />
            <p className="text-lg font-black">{names[i]}</p>
            <p className="mt-1 text-4xl font-black tabular-nums text-[#f5c518]">{money(p)}</p>
            <p className={`mt-1 text-[11px] ${sub}`}>⏱️ You can win on any spin</p>
            <Link href={`${base}/casino/slots/royal`} className="mt-3 inline-block rounded-xl bg-[#f5c518] px-6 py-2.5 text-sm font-black text-black">🎰 Play now</Link>
          </div>
        ))}
      </div>
      <div className={`${card} mt-4 p-4`}>
        <p className="mb-2 text-sm font-black text-[#f5c518]">🏆 Recent jackpot winners</p>
        <div className="space-y-1.5 text-xs">
          {[["Ariful", "2,45,000", "2 hours ago"], ["Sharmin", "89,500", "5 hours ago"], ["Mehedi", "1,12,000", "Yesterday"]].map(([n, a, t]) => (
            <div key={n} className="flex justify-between"><span>🎉 <b>{n}***</b> <span className={sub}>{t}</span></span><b className="text-emerald-300">{bn(a)} credits</b></div>
          ))}
        </div>
      </div>
    </Page>
  );
}


/* ============================== ACCOUNT & WALLET ============================== */
