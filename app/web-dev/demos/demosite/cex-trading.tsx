"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useDemo } from "./store";
import { Back, Empty, Field, Page, SectionTitle } from "./ui";
import { fmtUSD, fmtPct, priceSeries, ChangeBadge, Spark, CoinIcon, CoinRow, TickerTape, TradeChart, OrderBook, useCexBalances, balTotalUSD, bn, USD_BDT, useCexCoins, coinOf, seeded, P2P_ADS, useSkin, useLocal, PageHead, CexOrder } from "./cex-shared";

export function CexHome() {
  const coins = useCexCoins();
  const { def, base } = useDemo();
  const { card, sub } = useSkin();
  const gainers = [...coins].sort((a, b) => b.change - a.change).slice(0, 4);
  const losers = [...coins].sort((a, b) => a.change - b.change).slice(0, 4);
  return (
    <div>
      {/* hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#1a1f2e] via-[#0d1117] to-[#0d1117] px-4 py-12 sm:py-16">
        <div className="pointer-events-none absolute -right-10 -top-10 text-[180px] opacity-10">₿</div>
        <div className="relative mx-auto max-w-6xl">
          <p className="inline-block rounded-full bg-[#f0b90b]/15 px-3 py-1 text-[11px] font-black text-[#f0b90b]">🚀 Demo crypto exchange — no real trading</p>
          <h1 className="mt-3 max-w-xl text-3xl font-black leading-tight text-white sm:text-5xl">
            {def.heroTitle || "Crypto trading in the palm of your hand"}
          </h1>
          <p className="mt-2 max-w-lg text-sm text-slate-400">{def.heroSub || "Spot, futures, P2P — trade 350+ coins at the lowest fees."}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link href={`${base}/signup`} className="rounded-xl bg-[#f0b90b] px-8 py-3 text-sm font-black text-black transition hover:brightness-110">🎁 Open a free account</Link>
            <Link href={`${base}/trade/BTCUSDT`} className="rounded-xl border border-white/20 px-8 py-3 text-sm font-bold text-white transition hover:bg-white/10">📈 Start trading</Link>
          </div>
          <div className="mt-6 grid max-w-lg grid-cols-3 gap-2 text-center">
            {[["9", "Demo coins"], ["Spot • Futures • P2P", "Demo trading"], ["Virtual", "Balances only"]].map(([v, t]) => (
              <div key={t} className="rounded-xl bg-white/5 p-3"><p className="text-lg font-black text-[#f0b90b]">{v}</p><p className="text-[11px] text-slate-400">{t}</p></div>
            ))}
          </div>
        </div>
      </div>
      <TickerTape />
      <Page>
        <SectionTitle t="🔥 Top Gainers" link={`${base}/markets`} linkLabel="All markets →" />
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {gainers.map((c) => <CoinRow key={c.code} code={c.code} />)}
        </div>
        <div className="mt-6">
          <SectionTitle t="📉 Top Losers" link={`${base}/markets`} linkLabel="All markets →" />
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {losers.map((c) => <CoinRow key={c.code} code={c.code} />)}
          </div>
        </div>
        {/* services */}
        <div className="mt-8">
          <SectionTitle t="⚡ Services" />
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              ["📊", "Spot Trading", "/trade/BTCUSDT", "Trade 350+ pairs"],
              ["⚡", "Futures", "/futures", "Up to 125x leverage"],
              ["🤝", "P2P Trading", "/p2p", "Buy & sell with bKash/Nagad"],
              ["🔄", "Convert", "/convert", "Swap in 1 click"],
              ["🌱", "Earn / Staking", "/earn", "Up to 9.4% APY"],
              ["🚀", "Launchpad", "/launchpad", "New token sales"],
              ["🎨", "NFT Market", "/nft", "Digital art"],
              ["🎓", "Academy", "/academy", "Learn free"],
            ].map(([e, t, href, d]) => (
              <Link key={href} href={`${base}${href}`} className={`${card} group p-4 transition hover:-translate-y-1 hover:border-[#f0b90b]/40`}>
                <p className="text-3xl">{e}</p>
                <p className="mt-2 text-sm font-black">{t}</p>
                <p className={`text-[11px] ${sub}`}>{d}</p>
              </Link>
            ))}
          </div>
        </div>
        {/* market table preview */}
        <div className="mt-8">
          <SectionTitle t="📋 Popular Pairs" link={`${base}/markets`} linkLabel="See all →" />
          <div className={`${card} overflow-hidden`}>
            {coins.slice(0, 6).map((c) => (
              <Link key={c.code} href={`${base}/trade/${c.code}USDT`} className="flex items-center gap-3 border-b border-white/5 p-3 transition last:border-0 hover:bg-white/5">
                <CoinIcon code={c.code} size={34} />
                <div className="flex-1"><p className="text-sm font-black">{c.code}/USDT</p><p className="text-[11px] opacity-50">Volume {c.vol}</p></div>
                <Spark code={c.code} w={80} h={28} />
                <div className="text-right"><p className="text-sm font-black">${fmtUSD(c.price)}</p><ChangeBadge v={c.change} /></div>
              </Link>
            ))}
          </div>
        </div>
        {/* CTA */}
        <div className="mt-8 rounded-2xl bg-gradient-to-r from-[#f0b90b] to-[#d49a06] p-6 text-center text-black sm:p-8">
          <p className="text-2xl font-black">🎁 100 USDT bonus for new users!</p>
          <p className="mt-1 text-sm font-bold opacity-80">Sign up + complete KYC for the welcome reward (demo)</p>
          <Link href={`${base}/signup`} className="mt-4 inline-block rounded-xl bg-black px-8 py-3 text-sm font-black text-[#f0b90b]">Start now</Link>
        </div>
      </Page>
    </div>
  );
}

/* ================= MARKETS ================= */

export function CexMarkets() {
  const coins = useCexCoins();
  const { base, store } = useDemo();
  const { card, sub, input } = useSkin();
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"vol" | "gain" | "price">("vol");
  const [tab, setTab] = useState<"spot" | "futures">("spot");
  // Phase 6: admin pair toggles hide pairs from this markets list only.
  const disabledPairs = store.custom.customDisabledCexPairs ?? [];
  const list = useMemo(() => {
    let l = coins.filter((c) => !disabledPairs.includes(c.code) && (!q || (c.code + c.bn + c.name).toLowerCase().includes(q.toLowerCase())));
    if (sort === "gain") l = [...l].sort((a, b) => b.change - a.change);
    else if (sort === "price") l = [...l].sort((a, b) => b.price - a.price);
    return l;
  }, [q, sort, disabledPairs]);
  return (
    <div>
      <TickerTape />
      <Page>
        <PageHead t="📊 Markets" sub="All trading pairs — live prices (demo)" />
        <div className="flex gap-1.5">
          {(["spot", "futures"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`rounded-xl px-4 py-2 text-xs font-black ${tab === t ? "bg-[#f0b90b] text-black" : "bg-white/5 text-slate-400"}`}>
              {t === "spot" ? "📊 Spot" : "⚡ Futures"}
            </button>
          ))}
        </div>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="🔍 Search coins (BTC, Ethereum...)" className={input} />
          <div className="flex gap-1.5">
            {([["vol", "Volume"], ["gain", "Gainers"], ["price", "Price"]] as const).map(([v, t]) => (
              <button key={v} onClick={() => setSort(v)} className={`whitespace-nowrap rounded-xl px-3 py-2 text-xs font-bold ${sort === v ? "bg-[#f0b90b] text-black" : "bg-white/5 text-slate-400"}`}>{t}</button>
            ))}
          </div>
        </div>
        <div className={`${card} mt-3 overflow-hidden`}>
          <div className="grid grid-cols-4 gap-2 border-b border-white/10 p-3 text-[10px] font-bold opacity-40">
            <span>Pair</span><span className="text-right">Price</span><span className="text-right">24h %</span><span className="text-right">Chart</span>
          </div>
          {list.map((c) => (
            <Link key={c.code} href={`${base}/${tab === "spot" ? "trade" : "futures"}/${c.code}USDT`} className="grid grid-cols-4 items-center gap-2 border-b border-white/5 p-3 transition last:border-0 hover:bg-white/5">
              <span className="flex items-center gap-2"><CoinIcon code={c.code} size={30} /><span><b className="text-sm">{c.code}</b><span className="text-[11px] opacity-50">/USDT</span><p className="text-[10px] opacity-40">{c.bn}</p></span></span>
              <span className="text-right text-sm font-black">${fmtUSD(c.price)}</span>
              <span className="text-right"><ChangeBadge v={c.change} /></span>
              <span className="flex justify-end"><Spark code={c.code} w={72} h={26} /></span>
            </Link>
          ))}
          {list.length === 0 && <Empty emoji="🔍" text="No coins found" />}
        </div>
        <p className={`mt-2 text-center text-[11px] ${sub}`}>💡 Prices are demo — not real market prices</p>
      </Page>
    </div>
  );
}

/* ================= SPOT TRADING ================= */

export function CexSpot({ pair }: { pair?: string }) {
  const coins = useCexCoins();
  const { base } = useDemo();
  const { card, sub, input } = useSkin();
  const code = (pair || "BTCUSDT").replace("USDT", "");
  const c = coinOf(code, coins);
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [otype, setOtype] = useState("Limit");
  const [price, setPrice] = useState(String(c.price));
  const [qty, setQty] = useState("");
  const [orders, setOrders] = useLocal<CexOrder[]>("spot_orders", []);
  const [bal, setBal] = useCexBalances();
  const [done, setDone] = useState(false);

  useEffect(() => { setPrice(String(c.price)); }, [code]);

  const total = (parseFloat(price) || 0) * (parseFloat(qty) || 0);

  function submit() {
    const p = parseFloat(price), qn = parseFloat(qty);
    if (!p || !qn || p <= 0 || qn <= 0) return;
    const t = p * qn;
    if (side === "buy" && (bal.USDT ?? 0) < t) { alert("Low USDT balance!"); return; }
    if (side === "sell" && (bal[code] ?? 0) < qn) { alert(`${code} balance too low!`); return; }
    const nb = { ...bal };
    if (side === "buy") { nb.USDT -= t; nb[code] = (nb[code] ?? 0) + qn; }
    else { nb[code] -= qn; nb.USDT = (nb.USDT ?? 0) + t; }
    setBal(nb);
    const newOrder: CexOrder = { id: `SP${Date.now()}`, pair: `${code}/USDT`, side, type: otype, price: p, qty: qn, total: t, date: Date.now(), status: "✅ Completed" };
    setOrders([newOrder, ...orders].slice(0, 30));
    setQty("");
    setDone(true);
    setTimeout(() => setDone(false), 2500);
  }

  return (
    <div>
      <TickerTape />
      <div className="mx-auto max-w-6xl px-2 py-3 sm:px-4">
        {/* pair header */}
        <div className="mb-2 flex flex-wrap items-center gap-2 px-2">
          <CoinIcon code={code} size={36} />
          <div>
            <p className="text-lg font-black">{code}/USDT <span className={`text-xs ${sub}`}>{c.bn}</span></p>
            <p className="text-[11px] opacity-50">24h high ${fmtUSD(c.high)} • low ${fmtUSD(c.low)} • volume {c.vol}</p>
          </div>
          <span className={`text-xl font-black ${c.change >= 0 ? "text-[#0ecb81]" : "text-[#f6465d]"}`}>${fmtUSD(c.price)}</span>
          <ChangeBadge v={c.change} big />
          <Link href={`${base}/coin/${code}`} className="ml-auto rounded-lg bg-white/5 px-3 py-1.5 text-xs font-bold hover:bg-white/10">📄 Coin info</Link>
        </div>
        <div className="grid gap-2 lg:grid-cols-[1fr_280px_300px]">
          {/* chart */}
          <div className={`${card} p-3`}>
            <div className="mb-2 flex gap-1.5">
              {["1m", "15m", "1H", "4H", "1D", "1W"].map((t, i) => (
                <button key={t} className={`rounded-lg px-2.5 py-1 text-[11px] font-bold ${i === 4 ? "bg-[#f0b90b] text-black" : "bg-white/5 text-slate-400"}`}>{t}</button>
              ))}
            </div>
            <TradeChart code={code} height={260} />
            {/* recent trades */}
            <p className="mt-3 text-xs font-black opacity-60">🕘 Recent trades</p>
            <div className="mt-1 grid grid-cols-3 gap-1 text-[11px] tabular-nums">
              {Array.from({ length: 6 }).map((_, i) => {
                const up = seeded(code + "t" + i) > 0.45;
                return (
                  <div key={i} className="flex justify-between rounded bg-white/[0.03] px-2 py-1">
                    <span className={up ? "text-[#0ecb81]" : "text-[#f6465d]"}>${fmtUSD(c.price * (1 + (seeded(code + i) - 0.5) * 0.002))}</span>
                    <span className="opacity-50">{(seeded(code + "q" + i) * 1.5).toFixed(3)}</span>
                  </div>
                );
              })}
            </div>
          </div>
          {/* order book */}
          <div className={`${card} p-2`}>
            <p className="px-2 py-1 text-xs font-black opacity-60">📖 Order book <span className="font-normal">(live demo)</span></p>
            <OrderBook code={code} />
          </div>
          {/* buy/sell panel */}
          <div className={`${card} p-3`}>
            <div className="grid grid-cols-2 gap-1 rounded-xl bg-white/5 p-1">
              {(["buy", "sell"] as const).map((s) => (
                <button key={s} onClick={() => setSide(s)} className={`rounded-lg py-2 text-sm font-black ${side === s ? (s === "buy" ? "bg-[#0ecb81] text-white" : "bg-[#f6465d] text-white") : "text-slate-400"}`}>
                  {s === "buy" ? "🟢 Buy" : "🔴 Sell"}
                </button>
              ))}
            </div>
            <div className="mt-2 flex gap-1.5">
              {["Limit", "Market", "Stop-Limit"].map((t) => (
                <button key={t} onClick={() => setOtype(t)} className={`flex-1 rounded-lg py-1.5 text-[11px] font-bold ${otype === t ? "bg-white/15 text-white" : "text-slate-500"}`}>{t}</button>
              ))}
            </div>
            <div className="mt-3 space-y-2">
              <div>
                <label className={`text-[11px] ${sub}`}>Price (USDT)</label>
                <input value={price} onChange={(e) => setPrice(e.target.value)} type="number" className={input} />
              </div>
              <div>
                <label className={`text-[11px] ${sub}`}>Amount ({code})</label>
                <input value={qty} onChange={(e) => setQty(e.target.value)} type="number" placeholder="0.00" className={input} />
              </div>
              <div className="flex gap-1.5">
                {[25, 50, 75, 100].map((p) => (
                  <button key={p} onClick={() => setQty(String((((bal.USDT ?? 0) * p) / 100 / (parseFloat(price) || 1)).toFixed(6)))} className="flex-1 rounded-lg bg-white/5 py-1.5 text-[11px] font-bold text-slate-400 hover:bg-white/10">{p}%</button>
                ))}
              </div>
              <div className={`flex justify-between text-xs ${sub}`}><span>Total</span><b className="text-white">${fmtUSD(total)} USDT</b></div>
              <div className={`flex justify-between text-[11px] ${sub}`}><span>Balance</span><span>{bn((bal.USDT ?? 0).toLocaleString("en-US", { maximumFractionDigits: 2 }))} USDT • {bn((bal[code] ?? 0).toFixed(4))} {code}</span></div>
              <button onClick={submit} className={`w-full rounded-xl py-3 text-sm font-black text-white transition hover:brightness-110 ${side === "buy" ? "bg-[#0ecb81]" : "bg-[#f6465d]"}`}>
                {side === "buy" ? `🟢 Buy ${code}` : `🔴 Sell ${code}`}
              </button>
              {done && <p className="rounded-xl bg-emerald-500/15 py-2 text-center text-xs font-bold text-emerald-400">✅ Order completed! (Demo)</p>}
            </div>
          </div>
        </div>
        {/* my orders */}
        <div className={`${card} mt-2 p-3`}>
          <p className="text-xs font-black opacity-60">📝 My spot orders</p>
          {orders.length === 0 ? <p className={`py-4 text-center text-xs ${sub}`}>No orders yet — trade from above</p> : (
            <div className="mt-2 space-y-1.5">
              {orders.slice(0, 5).map((o) => (
                <div key={o.id} className="flex items-center justify-between rounded-lg bg-white/[0.03] px-3 py-2 text-xs">
                  <span><b className={o.side === "buy" ? "text-[#0ecb81]" : "text-[#f6465d]"}>{o.side === "buy" ? "Buy" : "Sell"}</b> {o.pair}</span>
                  <span className="opacity-60">{o.qty} @ ${fmtUSD(o.price)}</span>
                  <span className="font-bold">${fmtUSD(o.total)}</span>
                  <span className="text-emerald-400">{o.status}</span>
                </div>
              ))}
              <Link href={`${base}/orders/spot`} className="block text-center text-xs font-bold text-[#f0b90b]">See all orders →</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ================= FUTURES ================= */

export function CexFutures({ pair }: { pair?: string }) {
  const coins = useCexCoins();
  const { base } = useDemo();
  const { card, sub, input } = useSkin();
  const code = (pair || "BTCUSDT").replace("USDT", "");
  const c = coinOf(code, coins);
  const [side, setSide] = useState<"long" | "short">("long");
  const [lev, setLev] = useState(10);
  const [qty, setQty] = useState("");
  const [orders, setOrders] = useLocal<CexOrder[]>("fut_orders", []);
  const [done, setDone] = useState(false);

  function submit() {
    const qn = parseFloat(qty);
    if (!qn || qn <= 0) return;
    const t = c.price * qn;
    const newOrder: CexOrder = { id: `FU${Date.now()}`, pair: `${code}/USDT`, side: side === "long" ? "buy" : "sell", type: `${lev}x ${side === "long" ? "Long" : "Short"}`, price: c.price, qty: qn, total: t, date: Date.now(), status: "✅ Open" };
    setOrders([newOrder, ...orders].slice(0, 30));
    setQty("");
    setDone(true);
    setTimeout(() => setDone(false), 2500);
  }

  return (
    <div>
      <TickerTape />
      <div className="mx-auto max-w-6xl px-2 py-3 sm:px-4">
        <div className="mb-2 flex items-center gap-2 px-2">
          <CoinIcon code={code} size={36} />
          <p className="text-lg font-black">{code}/USDT <span className="rounded bg-[#f0b90b]/20 px-1.5 py-0.5 text-[10px] font-black text-[#f0b90b]">PERP</span></p>
          <span className={`text-xl font-black ${c.change >= 0 ? "text-[#0ecb81]" : "text-[#f6465d]"}`}>${fmtUSD(c.price)}</span>
          <ChangeBadge v={c.change} big />
          <span className={`ml-auto text-[11px] ${sub}`}>💰 Funding rate: <b className="text-emerald-400">0.0100%</b></span>
        </div>
        <div className="grid gap-2 lg:grid-cols-[1fr_280px_300px]">
          <div className={`${card} p-3`}>
            <TradeChart code={code} height={260} />
            <div className="mt-2 grid grid-cols-4 gap-2 text-center text-[11px]">
              {[["24h high", `$${fmtUSD(c.high)}`], ["24h low", `$${fmtUSD(c.low)}`], ["24h volume", c.vol], ["Open interest", "2.4B"]].map(([t, v]) => (
                <div key={t} className="rounded-lg bg-white/[0.03] p-2"><p className="opacity-50">{t}</p><p className="font-bold">{v}</p></div>
              ))}
            </div>
          </div>
          <div className={`${card} p-2`}>
            <p className="px-2 py-1 text-xs font-black opacity-60">📖 Order book</p>
            <OrderBook code={code} />
          </div>
          <div className={`${card} p-3`}>
            <div className="mb-2 flex items-center justify-between">
              <span className={`text-xs ${sub}`}>Leverage</span>
              <span className="rounded-lg bg-[#f0b90b]/20 px-2 py-1 text-xs font-black text-[#f0b90b]">{bn(lev)}x</span>
            </div>
            <input type="range" min={1} max={125} value={lev} onChange={(e) => setLev(+e.target.value)} className="w-full accent-[#f0b90b]" />
            <div className="mt-2 grid grid-cols-2 gap-1 rounded-xl bg-white/5 p-1">
              {(["long", "short"] as const).map((s) => (
                <button key={s} onClick={() => setSide(s)} className={`rounded-lg py-2 text-sm font-black ${side === s ? (s === "long" ? "bg-[#0ecb81] text-white" : "bg-[#f6465d] text-white") : "text-slate-400"}`}>
                  {s === "long" ? "🟢 Long / Buy" : "🔴 Short / Sell"}
                </button>
              ))}
            </div>
            <div className="mt-3 space-y-2">
              <div><label className={`text-[11px] ${sub}`}>Amount ({code})</label><input value={qty} onChange={(e) => setQty(e.target.value)} type="number" placeholder="0.00" className={input} /></div>
              <div className={`flex justify-between text-xs ${sub}`}><span>Margin required</span><b className="text-white">${fmtUSD((c.price * (parseFloat(qty) || 0)) / lev)}</b></div>
              <div className={`flex justify-between text-[11px] ${sub}`}><span>Liquidation price (approx.)</span><span className="text-red-400">${fmtUSD(c.price * (side === "long" ? 1 - 0.9 / lev : 1 + 0.9 / lev))}</span></div>
              <button onClick={submit} className={`w-full rounded-xl py-3 text-sm font-black text-white ${side === "long" ? "bg-[#0ecb81]" : "bg-[#f6465d]"}`}>
                {side === "long" ? `🟢 Open long (${bn(lev)}x)` : `🔴 Open short (${bn(lev)}x)`}
              </button>
              {done && <p className="rounded-xl bg-emerald-500/15 py-2 text-center text-xs font-bold text-emerald-400">✅ Position opened! (Demo)</p>}
              <p className={`text-center text-[10px] ${sub}`}>⚠️ Futures carry a big risk of loss — learn safely in the demo</p>
            </div>
          </div>
        </div>
        <div className={`${card} mt-2 p-3`}>
          <div className="flex items-center justify-between">
            <p className="text-xs font-black opacity-60">📝 Open positions</p>
            <Link href={`${base}/orders/futures`} className="text-xs font-bold text-[#f0b90b]">See all →</Link>
          </div>
          {orders.length === 0 ? <p className={`py-4 text-center text-xs ${sub}`}>No open positions</p> : (
            <div className="mt-2 space-y-1.5">
              {orders.slice(0, 5).map((o) => (
                <div key={o.id} className="flex items-center justify-between rounded-lg bg-white/[0.03] px-3 py-2 text-xs">
                  <span><b className={o.side === "buy" ? "text-[#0ecb81]" : "text-[#f6465d]"}>{o.type}</b> {o.pair}</span>
                  <span className="opacity-60">{o.qty} @ ${fmtUSD(o.price)}</span>
                  <span className="font-bold text-emerald-400">+${fmtUSD(o.total * 0.02)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ================= P2P ================= */

export function CexP2P() {
  const { base } = useDemo();
  const { card, sub, input } = useSkin();
  const [tab, setTab] = useState<"buy" | "sell">("buy");
  const [coin, setCoin] = useState("USDT");
  const [q, setQ] = useState("");
  const ads = P2P_ADS.filter((a) => a.side === tab && a.coin === coin && (!q || a.trader.includes(q)));
  return (
    <Page>
      <PageHead t="🤝 P2P Trading" sub="Buy & sell directly with other users — escrow protected" />
      <div className={`${card} p-4`}>
        <div className="grid grid-cols-2 gap-1 rounded-xl bg-white/5 p-1">
          {(["buy", "sell"] as const).map((s) => (
            <button key={s} onClick={() => setTab(s)} className={`rounded-lg py-2.5 text-sm font-black ${tab === s ? "bg-[#f0b90b] text-black" : "text-slate-400"}`}>
              {s === "buy" ? "💰 Buy" : "💸 Sell"}
            </button>
          ))}
        </div>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <div className="flex gap-1.5">
            {["USDT", "BTC", "ETH"].map((cc) => (
              <button key={cc} onClick={() => setCoin(cc)} className={`rounded-xl px-4 py-2 text-xs font-black ${coin === cc ? "bg-white/15 text-white" : "bg-white/5 text-slate-400"}`}>{cc}</button>
            ))}
          </div>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="🔍 Search merchants" className={input} />
        </div>
      </div>
      <div className="mt-3 space-y-2">
        {ads.map((a) => (
          <div key={a.id} className={`${card} p-4`}>
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-[#f0b90b]/15 text-lg">👤</span>
                <div>
                  <p className="text-sm font-black">{a.trader} <span className="text-[10px] font-normal text-emerald-400">● Online</span></p>
                  <p className={`text-[11px] ${sub}`}>{bn(a.trades)} trades • {bn(a.rate.toFixed(1))}% success</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-black text-[#f0b90b]">{bn(a.price.toLocaleString("en-US"))} BDT</p>
                <p className={`text-[11px] ${sub}`}>per {a.coin}</p>
              </div>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px]">
              <span className={`${sub}`}>Limit: {bn(a.min.toLocaleString("en-US"))}–{bn(a.max.toLocaleString("en-US"))} BDT</span>
              {a.pay.map((p) => <span key={p} className="rounded-full bg-white/5 px-2 py-0.5 font-bold">{p}</span>)}
              <Link href={`${base}/p2p/${a.id}`} className={`ml-auto rounded-xl px-6 py-2 text-xs font-black ${tab === "buy" ? "bg-[#0ecb81] text-white" : "bg-[#f6465d] text-white"}`}>
                {tab === "buy" ? "Buy" : "Sell"}
              </Link>
            </div>
          </div>
        ))}
        {ads.length === 0 && <Empty emoji="🤝" text="No offers found" />}
      </div>
      <div className={`${card} mt-4 p-4`}>
        <p className="text-sm font-black">🛡️ P2P safety tips</p>
        <ul className={`mt-2 list-disc space-y-1 pl-5 text-xs ${sub}`}>
          <li>Never send money outside the platform</li>
          <li>Do not release coins until payment is confirmed</li>
          <li>Report suspicious offers</li>
        </ul>
      </div>
    </Page>
  );
}

export function CexP2PDetail({ id }: { id: string }) {
  const { base } = useDemo();
  const { card, sub, input } = useSkin();
  const ad = P2P_ADS.find((a) => a.id === id) ?? P2P_ADS[0];
  const [amount, setAmount] = useState("");
  const [step, setStep] = useState(0);
  const recv = (parseFloat(amount) || 0) / ad.price;
  return (
    <Page narrow>
      <PageHead t="🤝 P2P Order" sub={`Order #${ad.id.toUpperCase()}`} />
      {step === 0 && (
        <div className={`${card} p-5`}>
          <div className="flex items-center justify-between">
            <div><p className="text-sm font-black">{ad.trader}</p><p className={`text-[11px] ${sub}`}>{bn(ad.trades)} trades • {bn(ad.rate.toFixed(1))}%</p></div>
            <p className="text-xl font-black text-[#f0b90b]">{bn(ad.price.toLocaleString("en-US"))} <span className="text-xs">BDT/{ad.coin}</span></p>
          </div>
          <div className="mt-4">
            <label className={`text-xs ${sub}`}>Amount in BDT (minimum {bn(ad.min.toLocaleString("en-US"))})</label>
            <input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" placeholder="e.g. 10000" className={`${input} mt-1`} />
            {recv > 0 && <p className="mt-1 text-xs text-emerald-400">You will receive: ≈ {recv.toFixed(4)} {ad.coin}</p>}
          </div>
          <p className={`mt-3 text-xs ${sub}`}>💳 Payment: {ad.pay.join(", ")}</p>
          <button onClick={() => parseFloat(amount) >= ad.min && setStep(1)} className="mt-4 w-full rounded-xl bg-[#f0b90b] py-3 text-sm font-black text-black">➡️ Place order</button>
        </div>
      )}
      {step === 1 && (
        <div className={`${card} p-5 text-center`}>
          <p className="text-5xl">⏳</p>
          <p className="mt-2 text-lg font-black">Make payment</p>
          <p className={`mt-1 text-xs ${sub}`}>Send <b className="text-white">{bn(amount)} BDT</b> to the {ad.pay[0]} number<br />then tap Confirm below</p>
          <div className="mx-auto mt-3 max-w-xs rounded-xl bg-white/5 p-4">
            <p className={`text-[11px] ${sub}`}>Merchant {ad.pay[0]} number</p>
            <p className="text-xl font-black tracking-widest">01XXXXXXXXX</p>
            <p className={`mt-1 text-[10px] ${sub}`}>Reference: {ad.id.toUpperCase()}</p>
          </div>
          <button onClick={() => setStep(2)} className="mt-4 w-full rounded-xl bg-[#0ecb81] py-3 text-sm font-black text-white">✅ I have paid</button>
          <button onClick={() => setStep(0)} className={`mt-2 text-xs ${sub} underline`}>Cancel</button>
        </div>
      )}
      {step === 2 && (
        <div className={`${card} p-5 text-center`}>
          <p className="text-5xl">🎉</p>
          <p className="mt-2 text-lg font-black text-emerald-400">Order completed!</p>
          <p className={`mt-1 text-xs ${sub}`}>{recv.toFixed(4)} {ad.coin} added to your funding wallet (demo)</p>
          <Link href={`${base}/p2p`} className="mt-4 inline-block rounded-xl bg-white/10 px-6 py-2.5 text-sm font-bold">← Back to P2P</Link>
        </div>
      )}
    </Page>
  );
}

/* ================= CONVERT ================= */

export function CexConvert() {
  const coins = useCexCoins();
  const { card, sub, input } = useSkin();
  const [from, setFrom] = useState("USDT");
  const [to, setTo] = useState("BTC");
  const [amount, setAmount] = useState("");
  const [done, setDone] = useState(false);
  const [bal, setBal] = useCexBalances();
  const rate = coinOf(from, coins).price / coinOf(to, coins).price;
  const out = (parseFloat(amount) || 0) * rate;

  function swap() {
    const a = parseFloat(amount);
    if (!a || a <= 0) return;
    if ((bal[from] ?? 0) < a) { alert(`${from} balance too low!`); return; }
    const nb = { ...bal };
    nb[from] -= a;
    nb[to] = (nb[to] ?? 0) + out;
    setBal(nb);
    setDone(true);
    setTimeout(() => setDone(false), 2500);
    setAmount("");
  }

  const CoinSel = ({ v, set }: { v: string; set: (x: string) => void }) => (
    <div className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2">
      <CoinIcon code={v} size={30} />
      <select value={v} onChange={(e) => set(e.target.value)} className="bg-transparent text-sm font-black text-white outline-none [&>option]:text-black">
        {coins.map((c) => <option key={c.code} value={c.code}>{c.code}</option>)}
      </select>
    </div>
  );

  return (
    <Page narrow>
      <PageHead t="🔄 Convert" sub="Swap from one coin to another in 1 click — zero fees (demo)" />
      <div className={`${card} p-5`}>
        <label className={`text-xs ${sub}`}>From</label>
        <div className="mt-1 flex gap-2">
          <input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" placeholder="0.00" className={input} />
          <CoinSel v={from} set={setFrom} />
        </div>
        <p className={`mt-1 text-right text-[11px] ${sub}`}>Balance: {bn((bal[from] ?? 0).toFixed(4))} {from}</p>
        <div className="my-1 flex justify-center">
          <button onClick={() => { setFrom(to); setTo(from); }} className="grid h-10 w-10 place-items-center rounded-full bg-[#f0b90b] text-lg font-black text-black transition hover:rotate-180">⇅</button>
        </div>
        <label className={`text-xs ${sub}`}>You will receive (approx.)</label>
        <div className="mt-1 flex gap-2">
          <input value={out ? out.toFixed(6) : ""} readOnly placeholder="0.00" className={`${input} opacity-70`} />
          <CoinSel v={to} set={setTo} />
        </div>
        <div className={`mt-2 flex justify-between text-xs ${sub}`}>
          <span>Rate</span><span>1 {from} ≈ {rate < 0.01 ? rate.toFixed(6) : rate.toFixed(4)} {to}</span>
        </div>
        <button onClick={swap} className="mt-4 w-full rounded-xl bg-[#f0b90b] py-3 text-sm font-black text-black transition hover:brightness-110">🔄 Convert</button>
        {done && <p className="mt-2 rounded-xl bg-emerald-500/15 py-2 text-center text-xs font-bold text-emerald-400">✅ Convert successful! (Demo)</p>}
      </div>
    </Page>
  );
}

/* ================= DEPOSIT / WITHDRAW ================= */

export function CexDepositCrypto() {
  const coins = useCexCoins();
  const { card, sub, input } = useSkin();
  const [coin, setCoin] = useState("USDT");
  const [net, setNet] = useState("TRC20");
  const [done, setDone] = useState(false);
  const addr = useMemo(() => {
    const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
    let s = net === "TRC20" ? "T" : "0x";
    for (let i = 0; i < 30; i++) s += chars[Math.floor(seeded(coin + net + i) * chars.length)];
    return s;
  }, [coin, net]);
  return (
    <Page narrow>
      <PageHead t="📥 Crypto Deposit" sub="Send coins from outside" />
      <div className={`${card} p-5`}>
        <div className="grid grid-cols-2 gap-2">
          <div><label className={`text-xs ${sub}`}>Coin</label>
            <select value={coin} onChange={(e) => setCoin(e.target.value)} className={`${input} mt-1 [&>option]:text-black`}>
              {coins.map((c) => <option key={c.code} value={c.code}>{c.code} — {c.bn}</option>)}
            </select></div>
          <div><label className={`text-xs ${sub}`}>Network</label>
            <select value={net} onChange={(e) => setNet(e.target.value)} className={`${input} mt-1 [&>option]:text-black`}>
              {["TRC20", "BEP20", "ERC20"].map((n) => <option key={n}>{n}</option>)}
            </select></div>
        </div>
        <div className="mx-auto mt-4 grid h-44 w-44 place-items-center rounded-2xl bg-white p-2">
          <div className="grid h-full w-full place-items-center rounded-xl bg-[repeating-conic-gradient(#000_0_25%,#fff_0_50%)] bg-[length:20px_20px] text-4xl">◈</div>
        </div>
        <p className={`mt-2 text-center text-[11px] ${sub}`}>Scan the QR code (demo)</p>
        <label className={`mt-3 text-xs ${sub}`}>Deposit address</label>
        <div className="mt-1 flex gap-2">
          <input value={addr} readOnly className={`${input} font-mono !text-[11px]`} />
          <button onClick={() => { navigator.clipboard?.writeText(addr).catch(() => {}); setDone(true); setTimeout(() => setDone(false), 1500); }} className="shrink-0 rounded-xl bg-[#f0b90b] px-4 text-sm font-black text-black">📋</button>
        </div>
        {done && <p className="mt-1 text-center text-xs text-emerald-400">✅ Copied!</p>}
        <div className={`mt-4 rounded-xl bg-red-500/10 p-3 text-[11px] leading-relaxed text-red-300`}>
          ⚠️ Only send <b>{coin}</b> ({net}). Sending on the wrong network will lose your coins!
        </div>
      </div>
    </Page>
  );
}

export function CexDepositFiat() {
  const { card, sub, input } = useSkin();
  const [method, setMethod] = useState("bKash");
  const [amount, setAmount] = useState("");
  const [trx, setTrx] = useState("");
  const [step, setStep] = useState(0);
  return (
    <Page narrow>
      <PageHead t="💰 Fiat Deposit" sub="Deposit with bKash/Nagad/Rocket" />
      {step === 0 && (
        <div className={`${card} p-5`}>
          <label className={`text-xs ${sub}`}>Method</label>
          <div className="mt-1 grid grid-cols-3 gap-2">
            {[["bKash", "🩷"], ["Nagad", "🧡"], ["Rocket", "💜"]].map(([m, e]) => (
              <button key={m} onClick={() => setMethod(m)} className={`rounded-xl border-2 p-3 text-sm font-black ${method === m ? "border-[#f0b90b] bg-[#f0b90b]/10" : "border-white/10"}`}>{e}<br />{m}</button>
            ))}
          </div>
          <label className={`mt-3 block text-xs ${sub}`}>Amount in BDT (minimum 500 BDT)</label>
          <input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" placeholder="e.g. 5000" className={`${input} mt-1`} />
          {parseFloat(amount) >= 500 && <p className="mt-1 text-xs text-emerald-400">You will receive: ≈ {(parseFloat(amount) / USD_BDT).toFixed(2)} USDT</p>}
          <button onClick={() => parseFloat(amount) >= 500 && setStep(1)} className="mt-4 w-full rounded-xl bg-[#f0b90b] py-3 text-sm font-black text-black">➡️ Next</button>
        </div>
      )}
      {step === 1 && (
        <div className={`${card} p-5 text-center`}>
          <p className="text-5xl">📲</p>
          <p className="mt-2 font-black">Send <span className="text-[#f0b90b]">{bn(amount)} BDT</span> to the {method} number</p>
          <div className="mx-auto mt-3 max-w-xs rounded-xl bg-white/5 p-4">
            <p className={`text-[11px] ${sub}`}>Merchant {method} (personal)</p>
            <p className="text-xl font-black tracking-widest">01XXXXXXXXX</p>
          </div>
          <label className={`mt-3 block text-left text-xs ${sub}`}>Enter TrxID</label>
          <input value={trx} onChange={(e) => setTrx(e.target.value)} placeholder="e.g. 9HX7K2LM4P" className={`${input} mt-1 font-mono`} />
          <button onClick={() => trx.trim().length >= 6 && setStep(2)} className="mt-4 w-full rounded-xl bg-[#0ecb81] py-3 text-sm font-black text-white">✅ Submit</button>
          <button onClick={() => setStep(0)} className={`mt-2 text-xs ${sub} underline`}>← Go back</button>
        </div>
      )}
      {step === 2 && (
        <div className={`${card} p-5 text-center`}>
          <p className="text-5xl">⏳</p>
          <p className="mt-2 text-lg font-black">Request pending</p>
          <p className={`mt-1 text-xs ${sub}`}>{bn(amount)} BDT • {method} • TrxID: <span className="font-mono text-white">{trx}</span><br />After verification, USDT will be added in 5–15 minutes (demo)</p>
        </div>
      )}
    </Page>
  );
}

export function CexWithdraw() {
  const coins = useCexCoins();
  const { card, sub, input } = useSkin();
  const [coin, setCoin] = useState("USDT");
  const [addr, setAddr] = useState("");
  const [amount, setAmount] = useState("");
  const [code2fa, setCode2fa] = useState("");
  const [done, setDone] = useState(false);
  const fee = coin === "USDT" ? 1 : 0.0005;
  const recv = Math.max(0, (parseFloat(amount) || 0) - fee);
  return (
    <Page narrow>
      <PageHead t="📤 Withdraw" sub="Send coins to an outside wallet" />
      <div className={`${card} p-5`}>
        <label className={`text-xs ${sub}`}>Coin</label>
        <select value={coin} onChange={(e) => setCoin(e.target.value)} className={`${input} mt-1 [&>option]:text-black`}>
          {coins.map((c) => <option key={c.code} value={c.code}>{c.code} — {c.bn}</option>)}
        </select>
        <label className={`mt-3 block text-xs ${sub}`}>Recipient address</label>
        <input value={addr} onChange={(e) => setAddr(e.target.value)} placeholder="0x... or T..." className={`${input} mt-1 font-mono !text-xs`} />
        <label className={`mt-3 block text-xs ${sub}`}>Amount</label>
        <input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" placeholder="0.00" className={`${input} mt-1`} />
        <div className={`mt-2 space-y-1 text-xs ${sub}`}>
          <div className="flex justify-between"><span>Network fee</span><span>{fee} {coin}</span></div>
          <div className="flex justify-between"><span>You will receive</span><b className="text-white">{recv.toFixed(6)} {coin}</b></div>
        </div>
        <label className={`mt-3 block text-xs ${sub}`}>🔐 2FA code</label>
        <input value={code2fa} onChange={(e) => setCode2fa(e.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" placeholder="6-digit code" className={`${input} mt-1 text-center tracking-[0.4em]`} />
        <button onClick={() => addr.length > 10 && parseFloat(amount) > fee && code2fa.length === 6 && setDone(true)} className="mt-4 w-full rounded-xl bg-[#f6465d] py-3 text-sm font-black text-white">📤 Withdraw</button>
        {done && <p className="mt-2 rounded-xl bg-emerald-500/15 py-2 text-center text-xs font-bold text-emerald-400">✅ Withdrawal request received! (Demo)</p>}
      </div>
    </Page>
  );
}

/* ================= WALLETS ================= */

function WalletShell({ t, sub, children }: { t: string; sub?: string; children: React.ReactNode }) {
  const { base } = useDemo();
  const tabs = [["", "Overview"], ["spot", "Spot"], ["futures", "Futures"], ["funding", "Funding"]];
  return (
    <Page>
      <PageHead t={t} sub={sub} />
      <div className="mb-3 flex gap-1.5 overflow-x-auto">
        {tabs.map(([href, label]) => (
          <Link key={href} href={href ? `${base}/wallet/${href}` : `${base}/wallet`}
            className={`whitespace-nowrap rounded-xl px-4 py-2 text-xs font-black ${t.includes(label) ? "bg-[#f0b90b] text-black" : "bg-white/5 text-slate-400"}`}>{label}</Link>
        ))}
      </div>
      {children}
    </Page>
  );
}
