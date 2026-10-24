"use client";
import { Fragment, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Back, Page } from "./ui";
import { bn, money, useSkin, useCasinoConfig, useGameRound } from "./casino-data";

/* ================= SUPER ACE — flagship card cascade slot (own IP) ================= */
type SARank = "A" | "K" | "Q" | "J" | "W" | "SC";
interface SACard { r: SARank; s: string; gold: boolean; key: number }
const SA_MULT = [1, 2, 3, 5];
const SA_PAY: Record<string, number[]> = {
  A: [0, 0, 0, 2, 10, 50], K: [0, 0, 0, 1.5, 8, 30],
  Q: [0, 0, 0, 1, 5, 20], J: [0, 0, 0, 0.5, 3, 12],
};
const SA_BETS = [0.5, 1, 2, 3, 5, 10, 20, 30, 40, 50, 80, 100, 200, 500, 1000];

function saDealCard(keyRef: { n: number }): SACard {
  const r = Math.random();
  let rank: SARank = "J", suit = "♣";
  if (r < 0.10) { rank = "A"; suit = "♠"; }
  else if (r < 0.26) { rank = "K"; suit = Math.random() < 0.5 ? "♥" : "♠"; }
  else if (r < 0.46) { rank = "Q"; suit = Math.random() < 0.5 ? "♦" : "♥"; }
  else if (r < 0.70) { rank = "J"; suit = Math.random() < 0.5 ? "♣" : "♠"; }
  else if (r < 0.735) { rank = "W"; suit = "🃏"; }
  else if (r < 0.76) { rank = "SC"; suit = "⭐"; }
  return { r: rank, s: suit, gold: false, key: keyRef.n++ };
}
function saDealGrid(keyRef: { n: number }): SACard[] {
  return Array.from({ length: 20 }, () => saDealCard(keyRef));
}
/** Ways evaluation: rank in consecutive columns from the left (any row). Wilds & golden cards substitute. */
function saEval(grid: SACard[], betAmt: number, mult: number) {
  const unit = betAmt / 20;
  let win = 0;
  const cells = new Set<number>();
  for (const rank of ["A", "K", "Q", "J"]) {
    const counts = [0, 0, 0, 0, 0];
    for (let c = 0; c < 5; c++) for (let rr = 0; rr < 4; rr++) {
      const card = grid[rr * 5 + c];
      if (card.r === rank || card.r === "W" || card.gold) counts[c]++;
    }
    let run = 0;
    while (run < 5 && counts[run] > 0) run++;
    if (run >= 3) {
      let ways = 1;
      for (let c = 0; c < run; c++) ways *= counts[c];
      win += unit * SA_PAY[rank][run] * ways;
      for (let c = 0; c < run; c++) for (let rr = 0; rr < 4; rr++) {
        const card = grid[rr * 5 + c];
        if (card.r === rank || card.r === "W" || card.gold) cells.add(rr * 5 + c);
      }
    }
  }
  return { win: Math.round(win * mult), cells: [...cells] };
}
function saCollapse(grid: SACard[], remove: Set<number>, keyRef: { n: number }): SACard[] {
  const next: SACard[] = new Array(20);
  for (let c = 0; c < 5; c++) {
    const col: SACard[] = [];
    for (let r = 3; r >= 0; r--) { const i = r * 5 + c; if (!remove.has(i)) col.push(grid[i]); }
    let r = 3;
    for (const card of col) { next[r * 5 + c] = { ...card, key: keyRef.n++ }; r--; }
    while (r >= 0) { next[r * 5 + c] = saDealCard(keyRef); r--; }
  }
  return next;
}

function SACardView({ c, win, delay }: { c: SACard; win: boolean; delay: number }) {
  const red = c.s === "♥" || c.s === "♦";
  const base = `dp-safall relative flex aspect-[3/4] flex-col items-center justify-center overflow-hidden rounded-lg sm:rounded-xl ${win ? "z-10 scale-110" : ""}`;
  const ring = c.gold
    ? "bg-gradient-to-b from-yellow-100 via-amber-200 to-yellow-300 ring-2 ring-amber-400 shadow-[0_0_16px_rgba(245,197,24,0.8)]"
    : "bg-gradient-to-b from-white via-slate-100 to-slate-300 ring-1 ring-slate-400/60 shadow-[0_3px_8px_rgba(0,0,0,0.5)]";
  const glow = win ? "shadow-[0_0_20px_rgba(255,215,0,0.95)] ring-2 ring-yellow-300" : "";
  if (c.r === "W") return (
    <div className={`${base} ${ring} ${glow}`} style={{ animationDelay: `${delay}ms` }}>
      <span className="text-xl sm:text-3xl">🃏</span>
      <span className="text-[7px] font-black text-amber-700 sm:text-[9px]">WILD</span>
    </div>
  );
  if (c.r === "SC") return (
    <div className={`${base} bg-gradient-to-b from-indigo-900 via-[#1b1440] to-black ring-1 ring-indigo-400/50 ${glow}`} style={{ animationDelay: `${delay}ms` }}>
      <span className="text-xl sm:text-3xl">⭐</span>
    </div>
  );
  const face = c.r === "K" ? "🤴" : c.r === "Q" ? "👸" : c.r === "J" ? "🤵" : null;
  return (
    <div className={`${base} ${ring} ${glow}`} style={{ animationDelay: `${delay}ms` }}>
      <span className={`absolute left-1 top-0.5 text-sm font-black sm:text-lg ${red ? "text-red-600" : "text-slate-900"}`}>{c.r}</span>
      <span className={`absolute left-1 top-5 text-[10px] sm:top-6 sm:text-xs ${red ? "text-red-600" : "text-slate-900"}`}>{c.s}</span>
      {face ? <span className="text-2xl sm:text-4xl">{face}</span> : (
        <span className="flex flex-col items-center">
          <span className="text-2xl text-slate-900 sm:text-4xl">♠️</span>
          <span className="rounded bg-gradient-to-b from-yellow-300 to-amber-500 px-1 text-[7px] font-black text-black sm:text-[9px]">ACE</span>
        </span>
      )}
      {c.gold && <span className="absolute bottom-0.5 rounded bg-amber-500 px-1 text-[6px] font-black text-black sm:text-[8px]">GOLD</span>}
    </div>
  );
}

export function SuperAceGame() {
  const { store, base } = useSkin();
  const cfg = useCasinoConfig();
  const finish = useGameRound("Super Ace");
  const keyRef = useRef({ n: 1 });
  const [bet, setBet] = useState(10);
  const [grid, setGrid] = useState<SACard[]>(() => saDealGrid(keyRef.current));
  const [dealKey, setDealKey] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [winCells, setWinCells] = useState<number[]>([]);
  const [multIdx, setMultIdx] = useState(0);
  const [dispTotal, setDispTotal] = useState(0);
  const [spinWin, setSpinWin] = useState(0);
  const [msg, setMsg] = useState("");
  const [tier, setTier] = useState<"" | "win" | "big" | "mega">("");
  const [freeLeft, setFreeLeft] = useState(0);
  const [freeWon, setFreeWon] = useState(0);
  const [freeMult, setFreeMult] = useState(0);
  const [autoLeft, setAutoLeft] = useState(0);
  const [turbo, setTurbo] = useState(false);
  const [betOpen, setBetOpen] = useState(false);
  const spinRef = useRef(0);
  const spinningRef = useRef(false);
  const betRef = useRef(bet); betRef.current = bet;
  const turboRef = useRef(turbo); turboRef.current = turbo;
  const freeMultRef = useRef(0);
  const freeWonRef = useRef(0);
  const totalRef = useRef(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => { spinRef.current++; timers.current.forEach(clearTimeout); }, []);

  const wait = (ms: number) => new Promise<void>((res) => { const t = setTimeout(res, ms); timers.current.push(t); });

  function creditTotal(amount: number) {
    const from = totalRef.current, to = from + amount;
    totalRef.current = to;
    const steps = 16; let i = 0;
    const t = setInterval(() => {
      i++;
      setDispTotal(Math.round(from + ((to - from) * i) / steps));
      if (i >= steps) { clearInterval(t); setDispTotal(to); }
    }, 45);
    timers.current.push(t as unknown as ReturnType<typeof setTimeout>);
  }

  async function doSpin(isFree: boolean) {
    const my = ++spinRef.current;
    if (spinningRef.current) return;
    spinningRef.current = true;
    setSpinning(true);
    const betAmt = betRef.current;
    if (!isFree) {
      if (!store.payWithWallet(betAmt, "🂡 Super Ace")) {
        setMsg("Low balance — deposit to continue"); setAutoLeft(0);
        spinningRef.current = false; setSpinning(false); return;
      }
    }
    setWinCells([]); setMsg(""); setSpinWin(0); setTier("");
    // ★ Owner RTP controls win-vs-loss: lower RTP = more dead spins (lose more than win)
    const winChance = Math.max(0.08, Math.min(0.5, (cfg.rtp - 75) / 50));
    const wantWin = Math.random() < winChance;
    let g = saDealGrid(keyRef.current);
    let tries = 0;
    if (wantWin) {
      if (saEval(g, betAmt, 1).win === 0 && Math.random() < 0.45) {
        const rk = (["K", "Q", "J"] as SARank[])[Math.floor(Math.random() * 3)];
        const st = rk === "K" ? "♥" : rk === "Q" ? "♦" : "♣";
        g[0] = { r: rk, s: st, gold: false, key: keyRef.current.n++ };
        g[5] = { r: rk, s: st, gold: false, key: keyRef.current.n++ };
        g[10] = { r: rk, s: st, gold: false, key: keyRef.current.n++ };
      }
    } else {
      while (saEval(g, betAmt, 1).win > 0 && tries < 10) { g = saDealGrid(keyRef.current); tries++; }
    }
    setGrid(g); setDealKey((k) => k + 1);
    await wait(turboRef.current ? 350 : 650);
    if (spinRef.current !== my) return;
    let lvl = isFree ? freeMultRef.current : 0;
    setMultIdx(lvl);
    let total = 0;
    for (let cascade = 0; cascade < 12; cascade++) {
      const { win, cells } = saEval(g, betAmt, SA_MULT[lvl]);
      if (win <= 0 || cells.length === 0) break;
      total += win;
      setWinCells(cells); setSpinWin(total);
      await wait(turboRef.current ? 450 : 850);
      if (spinRef.current !== my) return;
      const rm = new Set(cells);
      g = saCollapse(g, rm, keyRef.current);
      // golden cards: 2 random survivors turn wild-gold
      const cand = g.map((c, i) => (c.r !== "SC" && c.r !== "W" && !c.gold ? i : -1)).filter((i) => i >= 0);
      for (let k = 0; k < 2 && cand.length; k++) {
        const pick = cand.splice(Math.floor(Math.random() * cand.length), 1)[0];
        g[pick] = { ...g[pick], gold: true };
      }
      setGrid(g); setWinCells([]);
      lvl = Math.min(3, lvl + 1);
      setMultIdx(lvl);
      if (isFree) { freeMultRef.current = lvl; setFreeMult(lvl); }
      await wait(turboRef.current ? 250 : 450);
      if (spinRef.current !== my) return;
    }
    const sc = g.filter((c) => c.r === "SC").length;
    if (total > 0) {
      creditTotal(total);
      finish(isFree ? 0 : betAmt, total);
      if (isFree) { freeWonRef.current += total; setFreeWon(freeWonRef.current); }
      const ratio = total / betAmt;
      setTier(ratio >= 25 ? "mega" : ratio >= 10 ? "big" : "win");
      setMsg(ratio >= 25 ? "🌟 MEGA WIN!" : ratio >= 10 ? "🎉 BIG WIN!" : "🎉 You won!");
    } else if (!isFree) setMsg("Try again — your luck will turn!");
    if (!isFree && sc >= 3) {
      freeMultRef.current = lvl; setFreeMult(lvl);
      freeWonRef.current = 0; setFreeWon(0);
      setFreeLeft(10);
      setMsg(`⭐ 10 free spins! The multiplier stays`);
    }
    if (isFree) {
      const left = freeLeft - 1;
      setFreeLeft(left);
      if (left <= 0) {
        const w = freeWonRef.current;
        setTimeout(() => setMsg(`🎁 Free spins over! You won ${money(w)} in total`), 700);
      }
    }
    spinningRef.current = false;
    setSpinning(false);
  }

  // auto-chain free spins & auto spins
  useEffect(() => {
    if (freeLeft > 0 && !spinning) {
      const t = setTimeout(() => doSpin(true), 1300);
      return () => clearTimeout(t);
    }
    if (autoLeft > 0 && !spinning && freeLeft === 0) {
      const t = setTimeout(() => { setAutoLeft((a) => a - 1); doSpin(false); }, 900);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [freeLeft, spinning, autoLeft]);

  const buyBonus = () => {
    if (spinningRef.current || freeLeft > 0) return;
    if (!store.payWithWallet(betRef.current * 100, "🂡 Super Ace bonus")) { setMsg("Low balance — deposit to continue"); return; }
    freeMultRef.current = 0; setFreeMult(0);
    freeWonRef.current = 0; setFreeWon(0);
    setMsg("🎁 Bonus purchased!");
    setFreeLeft(10);
  };

  return (
    <Page narrow>
      <style>{`@keyframes dp-safall { 0% { transform: translateY(-46px) scale(.92); opacity: 0 } 60% { transform: translateY(6px) scale(1.02); opacity: 1 } 100% { transform: translateY(0) scale(1); opacity: 1 } } .dp-safall { animation: dp-safall .38s cubic-bezier(.2,.9,.3,1.2) both } @keyframes dp-samarquee { 0% { transform: translateX(100%) } 100% { transform: translateX(-100%) } } .dp-samarquee { animation: dp-samarquee 14s linear infinite }`}</style>
      <Back href={`${base}/games`} label="Game lobby" />

      {/* top bar */}
      <div className="flex items-center justify-between">
        <Link href={`${base}/wallet`} className="flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1.5 text-xs font-black text-[#f5c518] ring-1 ring-[#f5c518]/40">
          💰 {money(store.wallet)} <span className="grid h-5 w-5 place-items-center rounded-full bg-emerald-500 text-sm text-white">+</span>
        </Link>
        <div className="flex flex-col items-end gap-1">
          <button onClick={buyBonus} className="rounded-full bg-gradient-to-b from-red-500 to-red-800 px-3 py-1.5 text-[10px] font-black text-yellow-200 shadow-[0_0_14px_rgba(239,68,68,0.6)] ring-2 ring-red-300/60 transition active:scale-90">
            BUY<br />BONUS
          </button>
          <span className="animate-pulse rounded-full bg-gradient-to-b from-fuchsia-500 to-purple-800 px-2 py-0.5 text-[8px] font-black text-yellow-200 shadow-[0_0_10px_rgba(217,70,239,0.7)] ring-1 ring-fuchsia-300/60">🏆 JACKPOT</span>
        </div>
      </div>

      {/* wooden top frame */}
      <div className="mt-2 h-3.5 rounded-full bg-gradient-to-b from-[#8a5a22] via-[#5c3a12] to-[#3a240a] shadow-[0_2px_6px_rgba(0,0,0,0.6)] ring-1 ring-yellow-900/60" />
      {/* logo + multiplier ladder */}
      <div className="mt-1 text-center">
        <p className="bg-gradient-to-b from-yellow-100 via-[#f5c518] to-amber-700 bg-clip-text text-4xl font-black tracking-wide text-transparent drop-shadow-[0_3px_0_rgba(0,0,0,0.6)]">SuperAce</p>
        <p className="mt-0.5 text-[9px] font-black uppercase tracking-[0.3em] text-amber-200/70">DigiPlay Originals</p>
        <div className="mx-auto mt-1.5 flex w-fit items-center gap-1 rounded-full bg-gradient-to-b from-amber-500/40 to-amber-800/40 px-2 py-1 ring-1 ring-amber-300/50">
          {SA_MULT.map((m, i) => (
            <span key={m} className={`rounded-full px-2.5 py-0.5 text-sm font-black transition-all ${i === multIdx ? "bg-gradient-to-b from-yellow-200 to-amber-500 text-black scale-110 shadow" : i < multIdx ? "text-amber-200" : "text-white/40"}`}>×{m}</span>
          ))}
        </div>
        <div className="mx-auto mt-1.5 max-w-[420px] overflow-hidden whitespace-nowrap rounded-full bg-black/40 py-1">
          <p className="dp-samarquee inline-block text-[11px] font-bold text-amber-200/90">✨ Get a Golden Card and have a chance to win BIG • 3+ ⭐ = 10 free spins • Golden Card = Wild ✨</p>
        </div>
      </div>

      {freeLeft > 0 && (
        <div className="mx-auto mt-2 w-fit rounded-full bg-gradient-to-r from-fuchsia-600 to-purple-600 px-4 py-1.5 text-xs font-black text-white shadow-lg">
          🎁 Free spins left: {bn(freeLeft)} • Multiplier ×{SA_MULT[freeMult]} • Collected {money(freeWon)}
        </div>
      )}

      {/* card table */}
      <div className="mx-auto mt-1.5 flex max-w-[480px] justify-center gap-1.5 opacity-90">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="flex h-9 w-7 items-center justify-center rounded-md bg-gradient-to-b from-[#2b3a67] to-[#141b33] text-sm ring-1 ring-white/25">🂠</div>
        ))}
      </div>
      <div className="relative mx-auto mt-1.5 max-w-[480px] rounded-3xl border-4 border-[#6b3f12] bg-gradient-to-b from-emerald-800 via-emerald-900 to-[#0a2e1f] p-2 shadow-[inset_0_0_50px_rgba(0,0,0,0.55)] sm:p-3">
        <div className="grid grid-cols-5 gap-1 sm:gap-1.5" key={dealKey}>
          {grid.map((c, i) => <SACardView key={c.key} c={c} win={winCells.includes(i)} delay={(i % 5) * 60 + Math.floor(i / 5) * 40} />)}
        </div>
      </div>

      {/* win display */}
      <div className="mt-2 text-center">
        <p className="text-xs font-black tracking-[0.25em] text-[#f5c518]">{tier === "mega" ? "MEGA WIN" : tier === "big" ? "BIG WIN" : "WIN"}</p>
        <p className={`text-3xl font-black tabular-nums ${spinWin > 0 ? "text-white" : "text-white/40"}`}>{money(spinWin)}</p>
        <p className="text-[11px] text-slate-400">Total win: <b className="text-emerald-300">{money(dispTotal)}</b></p>
        {msg && <p className="mt-1 text-sm font-bold text-amber-200">{msg}</p>}
      </div>

      {/* controls */}
      <div className="mx-auto mt-2 grid max-w-[480px] grid-cols-[52px_1fr_84px_52px] items-center gap-2">
        <button onClick={() => setTurbo((t) => !t)} className={`grid h-12 w-12 place-items-center rounded-full border text-xl transition active:scale-90 ${turbo ? "border-amber-300 bg-amber-400/25" : "border-white/15 bg-white/5"}`}>⚡</button>
        <button onClick={() => !spinning && freeLeft === 0 && setBetOpen(true)} className="rounded-2xl bg-white/5 py-2 text-center ring-1 ring-white/10">
          <p className="text-[10px] font-bold text-slate-400">Bet</p>
          <p className="text-lg font-black text-white">{money(bet)}</p>
        </button>
        <button onClick={() => !spinningRef.current && doSpin(false)}
          className="grid h-20 w-20 place-items-center justify-self-center rounded-full bg-gradient-to-b from-yellow-200 via-amber-400 to-amber-700 text-3xl shadow-[0_0_30px_rgba(245,197,24,0.55)] ring-4 ring-yellow-200/50 transition active:scale-90 disabled:opacity-50"
          disabled={spinning || freeLeft > 0} aria-label="Spin">🔄</button>
        <div className="flex flex-col items-center gap-1">
          <button onClick={() => setAutoLeft(autoLeft > 0 ? 0 : 30)} className="grid h-12 w-12 place-items-center rounded-full border border-white/15 bg-white/5 text-lg transition active:scale-90">▶</button>
          <span className="text-[9px] font-bold text-white/60">{autoLeft > 0 ? bn(autoLeft) : "Auto"}</span>
        </div>
      </div>

      <div className="mx-auto mt-2 flex max-w-[480px] items-center justify-between rounded-2xl bg-black/40 px-4 py-2 ring-1 ring-white/10">
        <span className="rounded bg-emerald-600 px-2 py-0.5 text-[10px] font-black text-white">LV 1</span>
        <span className="text-sm font-black text-[#f5c518]">Balance {money(store.wallet)}</span>
      </div>

      {/* bet selector popup */}
      {betOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6" onClick={() => setBetOpen(false)}>
          <div className="w-full max-w-[320px] rounded-3xl border border-amber-400/40 bg-[#141126] p-4" onClick={(e) => e.stopPropagation()}>
            <p className="mb-3 text-center text-sm font-black text-[#f5c518]">💰 Choose your bet</p>
            <div className="grid grid-cols-3 gap-2">
              {SA_BETS.map((b) => (
                <button key={b} onClick={() => { setBet(b); setBetOpen(false); }}
                  className={`rounded-xl py-2.5 text-sm font-black transition active:scale-95 ${bet === b ? "bg-gradient-to-b from-yellow-300 to-amber-600 text-black" : "bg-white/5 text-white ring-1 ring-white/10"}`}>
                  {b}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* paytable */}
      <div className="mx-auto mt-4 max-w-[480px] rounded-2xl bg-black/40 p-4 ring-1 ring-white/10">
        <p className="mb-2 text-sm font-black text-[#f5c518]">💰 Paytable (ways × bet/20)</p>
        <div className="grid grid-cols-5 gap-1 text-center text-[11px]">
          <span className="font-black text-slate-400">Card</span><span className="font-black text-slate-400">3</span><span className="font-black text-slate-400">4</span><span className="font-black text-slate-400">5</span><span className="font-black text-slate-400">Note</span>
          {[["A ♠️", "2x", "10x", "50x"], ["K 🤴", "1.5x", "8x", "30x"], ["Q 👸", "1x", "5x", "20x"], ["J 🤵", "0.5x", "3x", "12x"]].map(([r, a, b2, c2]) => (
            <Fragment key={r}>
              <span className="font-bold text-white">{r}</span><span className="text-slate-300">{a}</span><span className="text-slate-300">{b2}</span><span className="text-amber-300">{c2}</span><span className="text-slate-500">—</span>
            </Fragment>
          ))}
        </div>
        <p className="mt-2 text-[11px] leading-relaxed text-slate-400">🃏 WILD substitutes for all cards • <b className="text-amber-300">Golden Card</b> = Wild • The multiplier grows with each cascade ×1→×2→×3→×5 • ⭐ 3+ = 10 free spins</p>
      </div>
    </Page>
  );
}

