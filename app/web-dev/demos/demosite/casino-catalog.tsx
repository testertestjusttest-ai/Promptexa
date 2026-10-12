"use client";

/** Casino catalog UI + extra engines (mines/plinko/hilo) — split from casino-games. */

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Back, Empty, Field, Page, SectionTitle } from "./ui";
import { bn, money, GOLD, useSkin, SLOT_GAMES, GAME_CATALOG, catalogHref, PROVIDERS, useCasinoConfig, catalogGame, GameShell, BetChips, useGameRound, rankVal, drawCard, CardView, type CatalogGame } from "./casino-data";

/* ============================== CATALOG TILE & LOBBY ============================== */

/** Rich visual game tile — gradient art, glow symbol, provider, players. */
export function CatalogTile({ g, small }: { g: CatalogGame; small?: boolean }) {
  const { base } = useSkin();
  // short display name for cover art (first two words)
  const cover = g.n.split(" ").slice(0, 2).join(" ");
  const maxWin = g.cat === "slots" ? "১০০০x" : g.cat === "crash" ? "১০,০০০x" : g.cat === "mines" ? "৫০০০x" : "১০০x";
  return (
    <Link href={`${base}${catalogHref(g)}`} className="group block overflow-hidden rounded-2xl border border-white/10 bg-[#101828] shadow-[0_8px_24px_rgba(0,0,0,0.35)] transition hover:border-[#f5c518]/60 hover:shadow-[0_10px_32px_rgba(245,197,24,0.22)] active:scale-[0.98]">
      <div className={`relative bg-gradient-to-br ${g.grad} ${small ? "h-[104px]" : "h-32"} overflow-hidden`}>
        {/* layered art: glow blobs + pattern + shine sweep */}
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(circle at 82% 12%, #ffffff66 0, transparent 44%), radial-gradient(circle at 12% 92%, #00000099 0, transparent 55%)" }} />
        <div className="absolute inset-0 opacity-[0.14]" style={{ backgroundImage: "repeating-linear-gradient(45deg, #fff 0 1px, transparent 1px 9px)" }} />
        <div className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ transform: "skewX(-18deg)", left: "-20%" }} />
        {/* giant symbol */}
        <div className="absolute right-1 top-1/2 -translate-y-1/2 text-[64px] leading-none drop-shadow-[0_8px_18px_rgba(0,0,0,0.7)] transition duration-300 group-hover:rotate-[-8deg] group-hover:scale-125">{g.e}</div>
        {/* cover title */}
        <div className="absolute bottom-2 left-2 right-14">
          <p className="text-[15px] font-black uppercase leading-[1.05] tracking-tight text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]" style={{ textShadow: "0 2px 0 rgba(0,0,0,0.45)" }}>{cover}</p>
          <p className="mt-0.5 text-[9px] font-bold uppercase tracking-widest text-white/75">{g.provider}</p>
        </div>
        {/* badges */}
        {g.hot && <span className="absolute left-2 top-2 rounded-md bg-gradient-to-b from-red-500 to-red-700 px-1.5 py-0.5 text-[9px] font-black text-white shadow">🔥 HOT</span>}
        <span className="absolute right-2 top-2 rounded-md bg-black/55 px-1.5 py-0.5 text-[9px] font-black text-yellow-300 ring-1 ring-yellow-400/40">MAX {maxWin}</span>
        <span className="absolute bottom-2 right-2 rounded-full bg-black/55 px-1.5 py-0.5 text-[8px] font-bold text-white/85">👥 {g.players}</span>
      </div>
      <div className="flex items-center gap-2 p-2.5">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[12px] font-black text-white">{g.n}</p>
          <p className="text-[10px] text-slate-400">RTP {bn(g.rtp.toFixed(1))}%</p>
        </div>
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-b from-yellow-300 to-amber-600 text-[11px] font-black text-black shadow transition group-hover:scale-110">▶</span>
      </div>
    </Link>
  );
}

const CAT_TABS: { id: string; n: string; e: string }[] = [
  { id: "all", n: "সব গেম", e: "🎮" },
  { id: "slots", n: "স্লটস", e: "🎰" },
  { id: "crash", n: "ক্র্যাশ", e: "📈" },
  { id: "mines", n: "মাইনস", e: "💣" },
  { id: "plinko", n: "প্লিংকো", e: "🔵" },
  { id: "dice", n: "ডাইস", e: "🎲" },
  { id: "wheel", n: "হুইল", e: "🎡" },
  { id: "hilo", n: "হাই-লো", e: "🃏" },
];

export function CatalogLobby() {
  const { sub } = useSkin();
  const [cat, setCat] = useState("all");
  const [provider, setProvider] = useState("সব প্রোভাইডার");
  const [q, setQ] = useState("");
  const [shown, setShown] = useState(48);
  const filtered = useMemo(() => GAME_CATALOG.filter((g) =>
    (cat === "all" || g.cat === cat) &&
    (provider === "সব প্রোভাইডার" || g.provider === provider) &&
    (!q || g.n.includes(q) || g.provider.includes(q))
  ), [cat, provider, q]);
  return (
    <Page>
      <SectionTitle t="🎮 গেম লবি" sub={`মোট ${bn(GAME_CATALOG.length)}+ গেম • সব নিজস্ব ইঞ্জিনে চলে`} />
      <input value={q} onChange={(e) => { setQ(e.target.value); setShown(48); }} placeholder="🔍 গেম খুঁজুন..."
        className="mb-3 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white outline-none placeholder:text-slate-500" />
      <div className="mb-3 flex gap-1.5 overflow-x-auto pb-1">
        {CAT_TABS.map((t) => (
          <button key={t.id} onClick={() => { setCat(t.id); setShown(48); }}
            className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-bold transition ${cat === t.id ? "bg-[#f5c518] text-black" : "border border-white/15 bg-white/5 text-slate-300"}`}>
            {t.e} {t.n}
          </button>
        ))}
      </div>
      <div className="mb-4 flex gap-1.5 overflow-x-auto pb-1">
        {["সব প্রোভাইডার", ...PROVIDERS].map((pv) => (
          <button key={pv} onClick={() => { setProvider(pv); setShown(48); }}
            className={`whitespace-nowrap rounded-full px-3 py-1 text-[11px] font-bold transition ${provider === pv ? "bg-white text-black" : "border border-white/10 bg-white/[0.03] text-slate-400"}`}>
            {pv}
          </button>
        ))}
      </div>
      <p className={`mb-3 text-xs ${sub}`}>{bn(filtered.length)}টি গেম পাওয়া গেছে</p>
      {filtered.length === 0 ? <Empty emoji="🎮" text="কোনো গেম পাওয়া যায়নি" /> : (
        <>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
            {filtered.slice(0, shown).map((g) => <CatalogTile key={g.id} g={g} />)}
          </div>
          {shown < filtered.length && (
            <button onClick={() => setShown((v) => v + 48)} className="mt-5 w-full rounded-2xl border border-[#f5c518]/40 bg-[#f5c518]/10 py-3 text-sm font-black text-[#f5c518] transition active:scale-[0.99]">
              আরো গেম দেখুন (বাকি {bn(filtered.length - shown)}টি)
            </button>
          )}
        </>
      )}
    </Page>
  );
}

/* ============================== MINES ============================== */

export function MinesGame() {
  const { store, card } = useSkin();
  const cfg = useCasinoConfig();
  const finish = useGameRound("💣 মাইনস");
  const SIZE = 25;
  const [bet, setBet] = useState(50);
  const [mineCount, setMineCount] = useState(3);
  const [mines, setMines] = useState<Set<number>>(new Set());
  const [open, setOpen] = useState<Set<number>>(new Set());
  const [playing, setPlaying] = useState(false);
  const [busted, setBusted] = useState<number | null>(null);
  const [msg, setMsg] = useState("");

  const mult = useMemo(() => {
    if (open.size === 0) return 1;
    // fair multiplier with owner RTP applied
    let m = 1;
    for (let i = 0; i < open.size; i++) m *= (SIZE - i) / (SIZE - mineCount - i);
    return m * (cfg.rtp / 100);
  }, [open, mineCount, cfg.rtp]);

  function start() {
    if (playing) return;
    if (!store.payWithWallet(bet, "💣 মাইনস")) { setMsg("ব্যালেন্স কম — ডিপোজিট করুন"); return; }
    const ms = new Set<number>();
    while (ms.size < mineCount) ms.add(Math.floor(Math.random() * SIZE));
    setMines(ms); setOpen(new Set()); setBusted(null); setPlaying(true); setMsg("টাইল খুলুন — বোমা এড়িয়ে চলুন!");
  }
  function pick(i: number) {
    if (!playing || open.has(i)) return;
    if (mines.has(i)) {
      setBusted(i); setPlaying(false);
      finish(bet, 0);
      setMsg("💥 বোমা! বাজি হারালেন");
      return;
    }
    const no = new Set(open); no.add(i); setOpen(no);
    if (no.size === SIZE - mineCount) cashout(no);
  }
  function cashout(o?: Set<number>) {
    if (!playing) return;
    const cnt = (o ?? open).size;
    let m = 1;
    for (let i = 0; i < cnt; i++) m *= (SIZE - i) / (SIZE - mineCount - i);
    const w = Math.round(bet * m * (cfg.rtp / 100));
    setPlaying(false);
    finish(bet, w);
    setMsg(`🎉 ক্যাশআউট! জিতেছেন ${money(w)}`);
  }

  return (
    <GameShell title="মাইনস" emoji="💣" rtp={`${bn(cfg.rtp)}%`}>
      <style>{`@keyframes dp-flip { 0% { transform: rotateY(90deg) scale(.7); opacity: 0 } 100% { transform: rotateY(0) scale(1); opacity: 1 } } .dp-flip { animation: dp-flip .3s ease both }`}</style>
      <div className="grid grid-cols-5 gap-1.5">
        {Array.from({ length: SIZE }, (_, i) => {
          const isOpen = open.has(i);
          const isMine = busted !== null && mines.has(i);
          const revealed = busted !== null;
          return (
            <button key={i} onClick={() => pick(i)} disabled={!playing || isOpen}
              className={`flex aspect-square items-center justify-center rounded-xl text-xl transition active:scale-90 ${
                isMine ? "bg-red-500/40 ring-2 ring-red-500" :
                isOpen ? "dp-flip bg-emerald-500/25 ring-1 ring-emerald-400" :
                revealed && mines.has(i) ? "bg-red-500/15" :
                "bg-gradient-to-b from-[#232c47] to-[#141b30] ring-1 ring-white/10 hover:ring-[#f5c518]/50"
              }`}>
              {isOpen ? "💎" : isMine || (revealed && mines.has(i)) ? "💣" : "◆"}
            </button>
          );
        })}
      </div>
      {msg && <p className="mt-3 text-center text-sm font-black text-slate-200">{msg}</p>}
      {playing && (
        <div className={`${card} mt-3 flex items-center justify-between p-3`}>
          <p className="text-xs text-slate-300">💎 খোলা: <b>{bn(open.size)}</b> • মাল্টিপ্লায়ার: <b className="text-[#f5c518]">{bn(mult.toFixed(2))}x</b></p>
          <p className="text-sm font-black text-emerald-300">{money(Math.round(bet * mult))}</p>
        </div>
      )}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div>
          <p className="mb-1.5 text-xs font-bold text-slate-400">বাজি</p>
          <BetChips bet={bet} setBet={setBet} />
        </div>
        <div>
          <p className="mb-1.5 text-xs font-bold text-slate-400">বোমার সংখ্যা: {bn(mineCount)}</p>
          <div className="flex gap-1">
            {[1, 3, 5, 10, 24].map((n) => (
              <button key={n} disabled={playing} onClick={() => setMineCount(n)}
                className={`flex-1 rounded-lg px-1 py-2 text-xs font-black transition ${mineCount === n ? "bg-[#f5c518] text-black" : "border border-white/15 bg-white/5 text-slate-300"}`}>{bn(n)}</button>
            ))}
          </div>
        </div>
      </div>
      {playing ? (
        <button onClick={() => cashout()} className="mt-4 w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-green-500 py-4 text-lg font-black text-white shadow-lg transition active:scale-[0.98]">💵 ক্যাশআউট {money(Math.round(bet * mult))}</button>
      ) : (
        <button onClick={start} className="mt-4 w-full rounded-2xl bg-gradient-to-r from-amber-500 to-[#f5c518] py-4 text-lg font-black text-black shadow-lg transition active:scale-[0.98]">💣 খেলা শুরু</button>
      )}
    </GameShell>
  );
}

/* ============================== PLINKO ============================== */

const PLINKO_MULTS: Record<number, number[]> = {
  8: [5.6, 2.1, 1.1, 1, 0.5, 1, 1.1, 2.1, 5.6],
  12: [10, 3, 1.6, 1.4, 1.1, 0.7, 0.5, 0.7, 1.1, 1.4, 1.6, 3, 10],
  16: [16, 9, 2, 1.4, 1.4, 1.2, 1.1, 1, 0.5, 1, 1.1, 1.2, 1.4, 1.4, 2, 9, 16],
};

export function PlinkoGame() {
  const { store } = useSkin();
  const cfg = useCasinoConfig();
  const finish = useGameRound("🔵 প্লিংকো");
  const [bet, setBet] = useState(50);
  const [rows, setRows] = useState(12);
  const [ball, setBall] = useState<{ x: number; y: number; slot: number } | null>(null);
  const [dropping, setDropping] = useState(false);
  const [msg, setMsg] = useState("");
  const [hist, setHist] = useState<number[]>([]);
  const mults = PLINKO_MULTS[rows];

  function drop() {
    if (dropping) return;
    if (!store.payWithWallet(bet, "🔵 প্লিংকো")) { setMsg("ব্যালেন্স কম — ডিপোজিট করুন"); return; }
    setDropping(true); setMsg("");
    // binomial walk
    let slot = 0;
    const path: number[] = [0];
    for (let r = 0; r < rows; r++) { if (Math.random() < 0.5) slot++; path.push(slot); }
    let step = 0;
    setBall({ x: 0, y: 0, slot: 0 });
    const t = setInterval(() => {
      step++;
      if (step > rows) {
        clearInterval(t);
        const m = mults[slot] * (cfg.rtp / 97);
        const w = Math.round(bet * m);
        setHist((h) => [m, ...h].slice(0, 10));
        finish(bet, w);
        setMsg(w >= bet ? `🎉 ${bn(m.toFixed(1))}x — জিতেছেন ${money(w)}!` : `${bn(m.toFixed(1))}x — পেয়েছেন ${money(w)}`);
        setDropping(false);
        setBall(null);
        return;
      }
      setBall({ x: path[step], y: step, slot });
    }, 110);
  }

  return (
    <GameShell title="প্লিংকো" emoji="🔵" rtp={`${bn(cfg.rtp)}%`}>
      <div className="relative mx-auto max-w-[340px] rounded-2xl bg-black/40 px-2 pb-2 pt-4">
        {Array.from({ length: rows }, (_, r) => (
          <div key={r} className="flex justify-center gap-0" style={{ marginBottom: 6 }}>
            {Array.from({ length: r + 3 }, (_, i) => (
              <span key={i} className={`mx-[7px] inline-block h-1.5 w-1.5 rounded-full ${ball && ball.y === r && Math.abs(ball.x - (i - 1)) < 0.6 ? "bg-[#f5c518] shadow-[0_0_10px_#f5c518]" : "bg-white/50"}`} />
            ))}
          </div>
        ))}
        {ball && (
          <div className="pointer-events-none absolute left-1/2 h-4 w-4 rounded-full bg-gradient-to-br from-yellow-300 to-amber-600 shadow-[0_0_14px_#f5c518] transition-all duration-100"
            style={{ top: 10 + ball.y * 15, transform: `translateX(${(ball.x - ball.y / 2) * 29 - 8}px)` }} />
        )}
        <div className="mt-2 flex gap-[3px]">
          {mults.map((m, i) => (
            <div key={i} className={`flex-1 rounded-md py-1 text-center text-[9px] font-black ${m >= 3 ? "bg-red-500 text-white" : m >= 1 ? "bg-[#f5c518] text-black" : "bg-slate-600 text-white"}`}>{bn(m)}x</div>
          ))}
        </div>
      </div>
      {hist.length > 0 && <div className="mt-2 flex flex-wrap justify-center gap-1">{hist.map((m, i) => <span key={i} className={`rounded-full px-2 py-0.5 text-[10px] font-black ${m >= 1 ? "bg-emerald-500/20 text-emerald-300" : "bg-white/10 text-slate-300"}`}>{bn(m.toFixed(1))}x</span>)}</div>}
      {msg && <p className="mt-3 text-center text-sm font-black text-slate-200">{msg}</p>}
      <div className="mt-4">
        <p className="mb-1.5 text-xs font-bold text-slate-400">সারি</p>
        <div className="flex gap-1.5">
          {[8, 12, 16].map((r) => (
            <button key={r} disabled={dropping} onClick={() => setRows(r)} className={`flex-1 rounded-lg py-2 text-xs font-black transition ${rows === r ? "bg-[#f5c518] text-black" : "border border-white/15 bg-white/5 text-slate-300"}`}>{bn(r)} সারি</button>
          ))}
        </div>
      </div>
      <div className="mt-3">
        <p className="mb-1.5 text-xs font-bold text-slate-400">বাজি</p>
        <BetChips bet={bet} setBet={setBet} />
      </div>
      <button onClick={drop} disabled={dropping} className="mt-4 w-full rounded-2xl bg-gradient-to-r from-amber-500 to-[#f5c518] py-4 text-lg font-black text-black shadow-lg transition active:scale-[0.98] disabled:opacity-50">
        {dropping ? "🔵 বল পড়ছে..." : "🔵 বল ছাড়ুন"}
      </button>
    </GameShell>
  );
}

/* ============================== HI-LO CARDS ============================== */

export function HiLoGame() {
  const { store, card } = useSkin();
  const cfg = useCasinoConfig();
  const finish = useGameRound("🃏 হাই-লো");
  const fresh = () => drawCard(new Set<string>());
  const [bet, setBet] = useState(50);
  const [cur, setCur] = useState<string>(() => fresh());
  const [streak, setStreak] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [flipKey, setFlipKey] = useState(0);
  const [msg, setMsg] = useState("");
  const mult = useMemo(() => Math.pow(1.42, streak) * (cfg.rtp / 97), [streak, cfg.rtp]);

  function start() {
    if (!store.payWithWallet(bet, "🃏 হাই-লো")) { setMsg("ব্যালেন্স কম — ডিপোজিট করুন"); return; }
    setCur(fresh()); setStreak(0); setPlaying(true); setFlipKey((k) => k + 1); setMsg("পরের কার্ড বড় না ছোট — অনুমান করুন!");
  }
  function guess(dir: "hi" | "lo") {
    if (!playing) return;
    const nxt = fresh();
    const cv = rankVal(cur.slice(0, -1)), nv = rankVal(nxt.slice(0, -1));
    setFlipKey((k) => k + 1);
    const win = nv !== cv && (dir === "hi" ? nv > cv : nv < cv);
    setCur(nxt);
    if (win) {
      setStreak((v) => v + 1);
      setMsg(`✅ ঠিক! ধারাবাহিক জয়: ${bn(streak + 1)}`);
    } else {
      setPlaying(false);
      finish(bet, 0);
      setMsg(`❌ ভুল! কার্ড ছিল ${nxt} — বাজি হারালেন`);
    }
  }
  function cashout() {
    if (!playing || streak === 0) return;
    const w = Math.round(bet * mult);
    setPlaying(false);
    finish(bet, w);
    setMsg(`🎉 ক্যাশআউট! জিতেছেন ${money(w)}`);
  }

  return (
    <GameShell title="হাই-লো কার্ড" emoji="🃏" rtp={`${bn(cfg.rtp)}%`}>
      <style>{`@keyframes dp-cardfall { 0% { transform: translateY(-46px) rotate(-7deg) scale(.85); opacity: 0 } 60% { transform: translateY(4px) rotate(2deg); opacity: 1 } 100% { transform: translateY(0) rotate(0) } } .dp-cardfall { animation: dp-cardfall .38s cubic-bezier(.2,.9,.3,1.25) both }`}</style>
      <div className="flex items-center justify-center py-4">
        <div key={flipKey} className="dp-cardfall" style={{ transform: "scale(1.6)" }}><CardView c={cur} /></div>
      </div>
      <div className={`${card} mt-4 flex items-center justify-between p-3`}>
        <p className="text-xs text-slate-300">🔥 ধারাবাহিক জয়: <b className="text-white">{bn(streak)}</b></p>
        <p className="text-xs text-slate-300">মাল্টিপ্লায়ার: <b className="text-[#f5c518]">{bn(mult.toFixed(2))}x</b></p>
        <p className="text-sm font-black text-emerald-300">{playing ? money(Math.round(bet * mult)) : money(0)}</p>
      </div>
      {msg && <p className="mt-3 text-center text-sm font-black text-slate-200">{msg}</p>}
      {!playing ? (
        <>
          <div className="mt-4">
            <p className="mb-1.5 text-xs font-bold text-slate-400">বাজি</p>
            <BetChips bet={bet} setBet={setBet} />
          </div>
          <button onClick={start} className="mt-4 w-full rounded-2xl bg-gradient-to-r from-amber-500 to-[#f5c518] py-4 text-lg font-black text-black shadow-lg transition active:scale-[0.98]">🃏 খেলা শুরু</button>
        </>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-2.5">
          <button onClick={() => guess("hi")} className="rounded-2xl bg-gradient-to-b from-sky-500 to-blue-700 py-4 text-lg font-black text-white shadow-lg transition active:scale-[0.97]">⬆️ বড় হবে</button>
          <button onClick={() => guess("lo")} className="rounded-2xl bg-gradient-to-b from-violet-500 to-purple-700 py-4 text-lg font-black text-white shadow-lg transition active:scale-[0.97]">⬇️ ছোট হবে</button>
          <button onClick={cashout} disabled={streak === 0} className="col-span-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-500 py-3.5 text-base font-black text-white shadow-lg transition active:scale-[0.98] disabled:opacity-40">💵 ক্যাশআউট {streak > 0 ? money(Math.round(bet * mult)) : ""}</button>
        </div>
      )}
      <p className="mt-2 text-center text-[11px] text-slate-500">একই মানের কার্ড আসলে হার • প্রতিটি সঠিক অনুমানে মাল্টিপ্লায়ার বাড়ে</p>
    </GameShell>
  );
}
