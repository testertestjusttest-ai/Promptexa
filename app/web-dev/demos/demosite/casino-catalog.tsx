"use client";

/** Casino catalog UI + extra engines (mines/plinko/hilo) — split from casino-games. */

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Back, Empty, Field, Page, SectionTitle } from "./ui";
import { bn, money, GOLD, useSkin, SLOT_GAMES, GAME_CATALOG, catalogHref, PROVIDERS, useCasinoConfig, catalogGame, GameShell, BetChips, useGameRound, rankVal, drawCard, CardView, type CatalogGame } from "./casino-data";

/* ============================== CATALOG TILE & LOBBY ============================== */

/** Rich visual game tile — gradient art, glow symbol, provider, players. */
/** Favorite games (browser-local). */
export function useFavGames() {
  const [favs, setFavs] = useState<string[]>([]);
  useEffect(() => {
    try { setFavs(JSON.parse(localStorage.getItem("dp_fav_games") || "[]")); } catch {}
  }, []);
  const toggle = (id: string) => {
    setFavs((f) => {
      const n = f.includes(id) ? f.filter((x) => x !== id) : [...f, id];
      try { localStorage.setItem("dp_fav_games", JSON.stringify(n)); } catch {}
      return n;
    });
  };
  return { favs, toggle };
}

export function CatalogTile({ g, small, fav, onFav }: { g: CatalogGame; small?: boolean; fav?: boolean; onFav?: (id: string) => void }) {
  const { base } = useSkin();
  const cover = g.n.split(" ").slice(0, 2).join(" ");
  const maxX = g.cat === "slots" ? 1000 : g.cat === "crash" ? 10000 : g.cat === "mines" ? 5000 : 100;
  let h = 0; for (let i = 0; i < g.id.length; i++) h = (h * 31 + g.id.charCodeAt(i)) >>> 0;
  const v = h % 3;
  const s0 = g.syms[0] ?? g.e;
  const s1 = g.syms[1] ?? g.e;
  const s2 = g.syms[3] ?? g.syms[2] ?? g.e;
  return (
    <div className="group relative block overflow-hidden rounded-2xl border border-white/10 bg-[#101828] shadow-[0_8px_24px_rgba(0,0,0,0.35)] transition hover:border-[#f5c518]/60 hover:shadow-[0_10px_32px_rgba(245,197,24,0.22)] active:scale-[0.98]">
      <Link href={`${base}${catalogHref(g)}`} className="block">
        <div className={`relative bg-gradient-to-br ${g.grad} ${small ? "h-[104px]" : "h-36"} overflow-hidden`}>
          {g.cover ? (
            <>
              <img src={g.cover} alt={g.n} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-105" />
              <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            </>
          ) : (
          <>
          {/* rich layered art */}
          <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(circle at 82% 12%, #ffffff66 0, transparent 44%), radial-gradient(circle at 12% 92%, #00000099 0, transparent 55%)" }} />
          <div className="absolute inset-0 opacity-[0.12]" style={{ backgroundImage: "repeating-linear-gradient(45deg, #fff 0 1px, transparent 1px 9px)" }} />
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/55 to-transparent" />
          {/* floating particles */}
          <span className="absolute left-[18%] top-[18%] h-1.5 w-1.5 animate-pulse rounded-full bg-white/50" />
          <span className="absolute left-[68%] top-[30%] h-1 w-1 animate-pulse rounded-full bg-yellow-200/70" style={{ animationDelay: ".7s" }} />
          <span className="absolute left-[42%] top-[10%] h-1 w-1 animate-pulse rounded-full bg-white/40" style={{ animationDelay: "1.3s" }} />
          {/* symbol composition — 3 variants */}
          {v === 0 && (
            <>
              <div className="absolute right-2 top-[38%] -translate-y-1/2 text-[62px] leading-none drop-shadow-[0_8px_18px_rgba(0,0,0,0.7)] transition duration-300 group-hover:rotate-[-8deg] group-hover:scale-125">{s0}</div>
              <div className="absolute right-16 top-2 text-[22px] opacity-80 drop-shadow">{s1}</div>
              <div className="absolute bottom-10 right-3 text-[20px] opacity-70 drop-shadow">{s2}</div>
            </>
          )}
          {v === 1 && (
            <div className="absolute inset-x-0 top-1.5 flex items-start justify-center gap-1.5">
              <span className="mt-2 text-[30px] opacity-85 drop-shadow transition duration-300 group-hover:-rotate-12">{s1}</span>
              <span className="text-[54px] leading-none drop-shadow-[0_8px_18px_rgba(0,0,0,0.7)] transition duration-300 group-hover:scale-125">{s0}</span>
              <span className="mt-2 text-[30px] opacity-85 drop-shadow transition duration-300 group-hover:rotate-12">{s2}</span>
            </div>
          )}
          {v === 2 && (
            <>
              <div className="absolute left-1/2 top-[36%] h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/25 bg-white/10 shadow-[0_0_30px_rgba(255,255,255,0.25)]" />
              <div className="absolute left-1/2 top-[36%] -translate-x-1/2 -translate-y-1/2 text-[52px] leading-none drop-shadow-[0_8px_18px_rgba(0,0,0,0.7)] transition duration-300 group-hover:scale-125">{s0}</div>
              <div className="absolute left-3 top-2 text-[20px] opacity-75 drop-shadow">{s1}</div>
              <div className="absolute right-3 top-2 text-[20px] opacity-75 drop-shadow">{s2}</div>
            </>
          )}
          </>
          )}
          {/* ribbons */}
          {g.hot && <span className="absolute left-0 top-2.5 rounded-r-lg bg-gradient-to-r from-amber-400 to-orange-500 px-2 py-0.5 text-[9px] font-black text-black shadow">BEST</span>}
          {g.isNew && <span className="absolute left-0 top-[34px] rounded-r-lg bg-gradient-to-r from-emerald-400 to-green-600 px-2 py-0.5 text-[9px] font-black text-white shadow">NEW</span>}
          <span className="absolute right-2 top-2 rounded-md bg-black/55 px-1.5 py-0.5 text-[9px] font-black text-yellow-300 ring-1 ring-yellow-400/40">MAX {bn(maxX)}x</span>
          {/* cover title + win-up-to band */}
          <div className="absolute inset-x-0 bottom-0 p-2">
            <p className="text-[15px] font-black uppercase leading-[1.05] tracking-tight text-white" style={{ textShadow: "0 2px 0 rgba(0,0,0,0.45), 0 4px 14px rgba(0,0,0,0.8)" }}>{cover}</p>
            <div className="mt-1 flex items-center justify-between">
              <p className="text-[9px] font-bold uppercase tracking-widest text-white/75">{g.provider}</p>
              <p className="rounded bg-black/55 px-1.5 py-0.5 text-[10px] font-black text-amber-300">Win up to <b>x{bn(maxX)}</b></p>
            </div>
          </div>
          <span className="absolute bottom-2 right-2 hidden">👥</span>
        </div>
      </Link>
      <div className="flex items-center gap-2 p-2.5">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[12px] font-black text-white">{g.n}</p>
          <p className="text-[10px] text-slate-400">👥 {g.players} • RTP {bn(g.rtp.toFixed(1))}%</p>
        </div>
        {onFav && (
          <button onClick={() => onFav(g.id)} className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm transition active:scale-90 ${fav ? "bg-red-500/20 text-red-400" : "bg-white/5 text-slate-500 hover:text-white"}`} aria-label="Favourite">
            {fav ? "❤️" : "🤍"}
          </button>
        )}
        <Link href={`${base}${catalogHref(g)}`} className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-b from-yellow-300 to-amber-600 text-[11px] font-black text-black shadow transition group-hover:scale-110">▶</Link>
      </div>
    </div>
  );
}

const CAT_TABS: { id: string; n: string; e: string }[] = [
  { id: "all", n: "All games", e: "🎮" },
  { id: "slots", n: "Slots", e: "🎰" },
  { id: "crash", n: "Crash", e: "📈" },
  { id: "mines", n: "Mines", e: "💣" },
  { id: "plinko", n: "Plinko", e: "🔵" },
  { id: "dice", n: "Dice", e: "🎲" },
  { id: "wheel", n: "Wheel", e: "🎡" },
  { id: "hilo", n: "Hi-Lo", e: "🃏" },
];

/** Top-of-lobby strip: balance + total won + rounds played. */
function LobbyStats() {
  const { store } = useSkin();
  const totalWon = store.gameHistory.reduce((a, g) => a + g.win, 0);
  const totalBet = store.gameHistory.reduce((a, g) => a + g.bet, 0);
  return (
    <div className="mb-4 grid grid-cols-3 gap-2">
      <div className="rounded-2xl border border-[#f5c518]/25 bg-gradient-to-b from-[#1a1405] to-[#101828] p-3 text-center">
        <p className="text-[10px] font-bold text-slate-400">💰 My balance</p>
        <p className="mt-0.5 text-base font-black text-[#f5c518]">{money(store.wallet)}</p>
      </div>
      <div className="rounded-2xl border border-emerald-400/25 bg-gradient-to-b from-emerald-950/60 to-[#101828] p-3 text-center">
        <p className="text-[10px] font-bold text-slate-400">🏆 Total won</p>
        <p className="mt-0.5 text-base font-black text-emerald-300">{money(totalWon)}</p>
      </div>
      <div className="rounded-2xl border border-white/10 bg-[#101828] p-3 text-center">
        <p className="text-[10px] font-bold text-slate-400">🎮 Rounds played</p>
        <p className="mt-0.5 text-base font-black text-white">{bn(store.gameHistory.length)} <span className="text-[10px] font-bold text-slate-500">• Bet {money(totalBet)}</span></p>
      </div>
    </div>
  );
}

export function CatalogLobby() {
  const { base, sub, store } = useSkin();
  const [tab, setTab] = useState<"games" | "new" | "bonus" | "cashback" | "fav">("games");
  const [cat, setCat] = useState("all");
  const [provider, setProvider] = useState(() => {
    try {
      const p = localStorage.getItem("dp_provider");
      // Legacy: older browsers stored the Bangla "all providers" sentinel; map it to the English one.
      if (p) { localStorage.removeItem("dp_provider"); return p === "সব প্রোভাইডার" ? "All providers" : p; }
    } catch {}
    return "All providers";
  });
  const [q, setQ] = useState("");
  const [shown, setShown] = useState(48);
  const { favs, toggle } = useFavGames();
  // Phase 6: admin category toggles hide categories from this lobby too.
  // Catalogue cats crash/dice/wheel/mines/plinko/hilo all belong to the
  // admin's single "Crash Games" toggle; other cats map to themselves.
  const disabledCats = store.custom.customDisabledGameCats ?? [];
  const catalogCatGroup = (c: string) => ["crash", "dice", "wheel", "mines", "plinko", "hilo"].includes(c) ? "crash" : c;
  const filtered = useMemo(() => GAME_CATALOG.filter((g) =>
    !disabledCats.includes(catalogCatGroup(g.cat)) &&
    (cat === "all" || g.cat === cat) &&
    (provider === "All providers" || g.provider === provider) &&
    (!q || g.n.includes(q) || g.provider.includes(q)) &&
    (tab === "games" || (tab === "new" && g.isNew) || (tab === "fav" && favs.includes(g.id)))
  ), [cat, provider, q, tab, favs, disabledCats]);
  return (
    <Page>
      <SectionTitle t="🎮 Game Lobby" sub={`${bn(GAME_CATALOG.length)}+ games total • all run on our own engines`} />
      <LobbyStats />
      {/* lobby tabs */}
      <div className="mb-3 grid grid-cols-5 gap-1.5">
        {([["games", "🎮", "All games"], ["new", "🆕", "New"], ["bonus", "🎁", "Bonus"], ["cashback", "💸", "Cashback"], ["fav", "⭐", "Favourites"]] as const).map(([id, e, t]) => (
          <button key={id} onClick={() => { setTab(id); setShown(48); }}
            className={`rounded-2xl py-2.5 text-center transition ${tab === id ? "bg-[#f5c518] text-black" : "border border-white/10 bg-white/[0.04] text-slate-300"}`}>
            <p className="text-lg leading-none">{e}</p>
            <p className="mt-1 text-[10px] font-black">{t}</p>
            {id === "fav" && favs.length > 0 && <p className="text-[9px] font-bold opacity-70">{bn(favs.length)}</p>}
          </button>
        ))}
      </div>
      {tab === "bonus" && (
        <div className="mb-4 space-y-2">
          {[["🎁 100% Welcome Bonus", "Bonus up to 20,000 credits on your first deposit", "/promotions"], ["🔄 Free Spin Pack", "20 free spins for logging in every day", "/promotions"], ["👥 Referral Bonus", "Bring a friend, get 500 credits each", "/referral"]].map(([t, d, h]) => (
            <Link key={t} href={`${base}${h}`} className="flex items-center justify-between rounded-2xl border border-[#f5c518]/25 bg-gradient-to-r from-[#1a1405] to-[#101828] p-4">
              <div><p className="text-sm font-black text-white">{t}</p><p className="mt-0.5 text-xs text-slate-400">{d}</p></div>
              <span className="rounded-full bg-[#f5c518] px-3 py-1.5 text-xs font-black text-black">Claim →</span>
            </Link>
          ))}
        </div>
      )}
      {tab === "cashback" && (
        <div className="mb-4 overflow-hidden rounded-3xl border border-emerald-400/25 bg-gradient-to-br from-emerald-950/50 to-[#101828] p-5 text-center">
          <p className="text-3xl">💸</p>
          <p className="mt-2 text-lg font-black text-white">Weekly Cashback</p>
          <p className="mx-auto mt-1 max-w-xs text-xs leading-relaxed text-slate-300">Get up to <b className="text-emerald-300">10%</b> of your weekly net loss back every Monday. The higher your VIP level, the higher the cashback.</p>
          <Link href={`${base}/vip`} className="mt-3 inline-block rounded-full bg-emerald-500 px-5 py-2 text-xs font-black text-black">See VIP →</Link>
        </div>
      )}
      {(tab === "games" || tab === "new" || tab === "fav") && (<>
      <input value={q} onChange={(e) => { setQ(e.target.value); setShown(48); }} placeholder="🔍 Search games..."
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
        {["All providers", ...PROVIDERS].map((pv) => (
          <button key={pv} onClick={() => { setProvider(pv); setShown(48); }}
            className={`whitespace-nowrap rounded-full px-3 py-1 text-[11px] font-bold transition ${provider === pv ? "bg-white text-black" : "border border-white/10 bg-white/[0.03] text-slate-400"}`}>
            {pv}
          </button>
        ))}
      </div>
      <p className={`mb-3 text-xs ${sub}`}>{bn(filtered.length)} games found</p>
      {filtered.length === 0 ? <Empty emoji="🎮" text="No games found" /> : (
        <>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
            {filtered.slice(0, shown).map((g) => <CatalogTile key={g.id} g={g} fav={favs.includes(g.id)} onFav={toggle} />)}
          </div>
          {shown < filtered.length && (
            <button onClick={() => setShown((v) => v + 48)} className="mt-5 w-full rounded-2xl border border-[#f5c518]/40 bg-[#f5c518]/10 py-3 text-sm font-black text-[#f5c518] transition active:scale-[0.99]">
              See more games ({bn(filtered.length - shown)} left)
            </button>
          )}
        </>
      )}
      </>)}
    </Page>
  );
}

/* ============================== MINES ============================== */

export function MinesGame() {
  const { store, card } = useSkin();
  const cfg = useCasinoConfig();
  const finish = useGameRound("💣 Mines");
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
    if (!store.payWithWallet(bet, "💣 Mines")) { setMsg("Low balance — deposit to continue"); return; }
    const ms = new Set<number>();
    while (ms.size < mineCount) ms.add(Math.floor(Math.random() * SIZE));
    setMines(ms); setOpen(new Set()); setBusted(null); setPlaying(true); setMsg("Open tiles — dodge the bombs!");
  }
  function pick(i: number) {
    if (!playing || open.has(i)) return;
    if (mines.has(i)) {
      setBusted(i); setPlaying(false);
      finish(bet, 0);
      setMsg("💥 Bomb! You lost the bet");
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
    setMsg(`🎉 Cashout! You won ${money(w)}`);
  }

  return (
    <GameShell title="Mines" emoji="💣" rtp={`${bn(cfg.rtp)}%`}>
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
          <p className="text-xs text-slate-300">💎 Opened: <b>{bn(open.size)}</b> • Multiplier: <b className="text-[#f5c518]">{bn(mult.toFixed(2))}x</b></p>
          <p className="text-sm font-black text-emerald-300">{money(Math.round(bet * mult))}</p>
        </div>
      )}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div>
          <p className="mb-1.5 text-xs font-bold text-slate-400">Bet</p>
          <BetChips bet={bet} setBet={setBet} />
        </div>
        <div>
          <p className="mb-1.5 text-xs font-bold text-slate-400">Number of bombs: {bn(mineCount)}</p>
          <div className="flex gap-1">
            {[1, 3, 5, 10, 24].map((n) => (
              <button key={n} disabled={playing} onClick={() => setMineCount(n)}
                className={`flex-1 rounded-lg px-1 py-2 text-xs font-black transition ${mineCount === n ? "bg-[#f5c518] text-black" : "border border-white/15 bg-white/5 text-slate-300"}`}>{bn(n)}</button>
            ))}
          </div>
        </div>
      </div>
      {playing ? (
        <button onClick={() => cashout()} className="mt-4 w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-green-500 py-4 text-lg font-black text-white shadow-lg transition active:scale-[0.98]">💵 Cashout {money(Math.round(bet * mult))}</button>
      ) : (
        <button onClick={start} className="mt-4 w-full rounded-2xl bg-gradient-to-r from-amber-500 to-[#f5c518] py-4 text-lg font-black text-black shadow-lg transition active:scale-[0.98]">💣 Start game</button>
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
  const finish = useGameRound("🔵 Plinko");
  const [bet, setBet] = useState(50);
  const [rows, setRows] = useState(12);
  const [ball, setBall] = useState<{ x: number; y: number; slot: number } | null>(null);
  const [dropping, setDropping] = useState(false);
  const [msg, setMsg] = useState("");
  const [hist, setHist] = useState<number[]>([]);
  const mults = PLINKO_MULTS[rows];

  function drop() {
    if (dropping) return;
    if (!store.payWithWallet(bet, "🔵 Plinko")) { setMsg("Low balance — deposit to continue"); return; }
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
        setMsg(w >= bet ? `🎉 ${bn(m.toFixed(1))}x — you won ${money(w)}!` : `${bn(m.toFixed(1))}x — you got ${money(w)}`);
        setDropping(false);
        setBall(null);
        return;
      }
      setBall({ x: path[step], y: step, slot });
    }, 110);
  }

  return (
    <GameShell title="Plinko" emoji="🔵" rtp={`${bn(cfg.rtp)}%`}>
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
        <p className="mb-1.5 text-xs font-bold text-slate-400">Rows</p>
        <div className="flex gap-1.5">
          {[8, 12, 16].map((r) => (
            <button key={r} disabled={dropping} onClick={() => setRows(r)} className={`flex-1 rounded-lg py-2 text-xs font-black transition ${rows === r ? "bg-[#f5c518] text-black" : "border border-white/15 bg-white/5 text-slate-300"}`}>{bn(r)} Rows</button>
          ))}
        </div>
      </div>
      <div className="mt-3">
        <p className="mb-1.5 text-xs font-bold text-slate-400">Bet</p>
        <BetChips bet={bet} setBet={setBet} />
      </div>
      <button onClick={drop} disabled={dropping} className="mt-4 w-full rounded-2xl bg-gradient-to-r from-amber-500 to-[#f5c518] py-4 text-lg font-black text-black shadow-lg transition active:scale-[0.98] disabled:opacity-50">
        {dropping ? "🔵 Ball dropping..." : "🔵 Drop the ball"}
      </button>
    </GameShell>
  );
}

/* ============================== HI-LO CARDS ============================== */

export function HiLoGame() {
  const { store, card } = useSkin();
  const cfg = useCasinoConfig();
  const finish = useGameRound("🃏 Hi-Lo");
  const fresh = () => drawCard(new Set<string>());
  const [bet, setBet] = useState(50);
  const [cur, setCur] = useState<string>(() => fresh());
  const [streak, setStreak] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [flipKey, setFlipKey] = useState(0);
  const [msg, setMsg] = useState("");
  const mult = useMemo(() => Math.pow(1.42, streak) * (cfg.rtp / 97), [streak, cfg.rtp]);

  function start() {
    if (!store.payWithWallet(bet, "🃏 Hi-Lo")) { setMsg("Low balance — deposit to continue"); return; }
    setCur(fresh()); setStreak(0); setPlaying(true); setFlipKey((k) => k + 1); setMsg("Guess whether the next card is higher or lower!");
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
      setMsg(`✅ Correct! Winning streak: ${bn(streak + 1)}`);
    } else {
      setPlaying(false);
      finish(bet, 0);
      setMsg(`❌ Wrong! The card was ${nxt} — you lost the bet`);
    }
  }
  function cashout() {
    if (!playing || streak === 0) return;
    const w = Math.round(bet * mult);
    setPlaying(false);
    finish(bet, w);
    setMsg(`🎉 Cashout! You won ${money(w)}`);
  }

  return (
    <GameShell title="Hi-Lo Card" emoji="🃏" rtp={`${bn(cfg.rtp)}%`}>
      <style>{`@keyframes dp-cardfall { 0% { transform: translateY(-46px) rotate(-7deg) scale(.85); opacity: 0 } 60% { transform: translateY(4px) rotate(2deg); opacity: 1 } 100% { transform: translateY(0) rotate(0) } } .dp-cardfall { animation: dp-cardfall .38s cubic-bezier(.2,.9,.3,1.25) both }`}</style>
      <div className="flex items-center justify-center py-4">
        <div key={flipKey} className="dp-cardfall" style={{ transform: "scale(1.6)" }}><CardView c={cur} /></div>
      </div>
      <div className={`${card} mt-4 flex items-center justify-between p-3`}>
        <p className="text-xs text-slate-300">🔥 Winning streak: <b className="text-white">{bn(streak)}</b></p>
        <p className="text-xs text-slate-300">Multiplier: <b className="text-[#f5c518]">{bn(mult.toFixed(2))}x</b></p>
        <p className="text-sm font-black text-emerald-300">{playing ? money(Math.round(bet * mult)) : money(0)}</p>
      </div>
      {msg && <p className="mt-3 text-center text-sm font-black text-slate-200">{msg}</p>}
      {!playing ? (
        <>
          <div className="mt-4">
            <p className="mb-1.5 text-xs font-bold text-slate-400">Bet</p>
            <BetChips bet={bet} setBet={setBet} />
          </div>
          <button onClick={start} className="mt-4 w-full rounded-2xl bg-gradient-to-r from-amber-500 to-[#f5c518] py-4 text-lg font-black text-black shadow-lg transition active:scale-[0.98]">🃏 Start game</button>
        </>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-2.5">
          <button onClick={() => guess("hi")} className="rounded-2xl bg-gradient-to-b from-sky-500 to-blue-700 py-4 text-lg font-black text-white shadow-lg transition active:scale-[0.97]">⬆️ Higher</button>
          <button onClick={() => guess("lo")} className="rounded-2xl bg-gradient-to-b from-violet-500 to-purple-700 py-4 text-lg font-black text-white shadow-lg transition active:scale-[0.97]">⬇️ Lower</button>
          <button onClick={cashout} disabled={streak === 0} className="col-span-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-500 py-3.5 text-base font-black text-white shadow-lg transition active:scale-[0.98] disabled:opacity-40">💵 Cashout {streak > 0 ? money(Math.round(bet * mult)) : ""}</button>
        </div>
      )}
      <p className="mt-2 text-center text-[11px] text-slate-500">A card of the same value loses • each correct guess raises the multiplier</p>
    </GameShell>
  );
}
