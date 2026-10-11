"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { toBnDigits } from "@/lib/format";
import { useDemo } from "./store";
import { Back, Empty, Field, Page, SectionTitle } from "./ui";
import { fmtUSD, fmtPct, priceSeries, ChangeBadge, Spark, CoinIcon, CoinRow, TickerTape, TradeChart, OrderBook, useCexBalances, balTotalUSD, bn, USD_BDT, CEX_COINS, coinOf, seeded, P2P_ADS, useSkin, useLocal, PageHead, CexOrder } from "./cex-shared";

export function CexHome() {
  const { def, base } = useDemo();
  const { card, sub } = useSkin();
  const gainers = [...CEX_COINS].sort((a, b) => b.change - a.change).slice(0, 4);
  const losers = [...CEX_COINS].sort((a, b) => a.change - b.change).slice(0, 4);
  return (
    <div>
      {/* hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#1a1f2e] via-[#0d1117] to-[#0d1117] px-4 py-12 sm:py-16">
        <div className="pointer-events-none absolute -right-10 -top-10 text-[180px] opacity-10">₿</div>
        <div className="relative mx-auto max-w-6xl">
          <p className="inline-block rounded-full bg-[#f0b90b]/15 px-3 py-1 text-[11px] font-black text-[#f0b90b]">🚀 বাংলাদেশের #১ ক্রিপ্টো এক্সচেঞ্জ (ডেমো)</p>
          <h1 className="mt-3 max-w-xl text-3xl font-black leading-tight text-white sm:text-5xl">
            {def.heroTitle || "ক্রিপ্টো ট্রেডিং এখন হাতের মুঠোয়"}
          </h1>
          <p className="mt-2 max-w-lg text-sm text-slate-400">{def.heroSub || "স্পট, ফিউচার্স, P2P — ৩৫০+ কয়েনে ট্রেড করুন সর্বনিম্ন ফিতে।"}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link href={`${base}/signup`} className="rounded-xl bg-[#f0b90b] px-8 py-3 text-sm font-black text-black transition hover:brightness-110">🎁 ফ্রি অ্যাকাউন্ট খুলুন</Link>
            <Link href={`${base}/trade/BTCUSDT`} className="rounded-xl border border-white/20 px-8 py-3 text-sm font-bold text-white transition hover:bg-white/10">📈 ট্রেড শুরু করুন</Link>
          </div>
          <div className="mt-6 grid max-w-lg grid-cols-3 gap-2 text-center">
            {[["৩৫০+", "কয়েন"], ["১২০M+", "ইউজার"], ["০.১%", "ট্রেডিং ফি"]].map(([v, t]) => (
              <div key={t} className="rounded-xl bg-white/5 p-3"><p className="text-lg font-black text-[#f0b90b]">{v}</p><p className="text-[11px] text-slate-400">{t}</p></div>
            ))}
          </div>
        </div>
      </div>
      <TickerTape />
      <Page>
        <SectionTitle t="🔥 টপ গেইনার" link={`${base}/markets`} linkLabel="সব মার্কেট →" />
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {gainers.map((c) => <CoinRow key={c.code} code={c.code} />)}
        </div>
        <div className="mt-6">
          <SectionTitle t="📉 টপ লুজার" link={`${base}/markets`} linkLabel="সব মার্কেট →" />
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {losers.map((c) => <CoinRow key={c.code} code={c.code} />)}
          </div>
        </div>
        {/* services */}
        <div className="mt-8">
          <SectionTitle t="⚡ সার্ভিসসমূহ" />
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              ["📊", "স্পট ট্রেডিং", "/trade/BTCUSDT", "৩৫০+ পেয়ারে ট্রেড"],
              ["⚡", "ফিউচার্স", "/futures", "১২৫x পর্যন্ত লিভারেজ"],
              ["🤝", "P2P ট্রেডিং", "/p2p", "বিকাশ/নগদে কেনাবেচা"],
              ["🔄", "কনভার্ট", "/convert", "১ ক্লিকে সোয়াপ"],
              ["🌱", "আর্ন / স্টেকিং", "/earn", "৯.৪% পর্যন্ত APY"],
              ["🚀", "লঞ্চপ্যাড", "/launchpad", "নতুন টোকেন সেল"],
              ["🎨", "NFT মার্কেট", "/nft", "ডিজিটাল আর্ট"],
              ["🎓", "অ্যাকাডেমি", "/academy", "ফ্রি শিখুন"],
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
          <SectionTitle t="📋 জনপ্রিয় পেয়ার" link={`${base}/markets`} linkLabel="সব দেখুন →" />
          <div className={`${card} overflow-hidden`}>
            {CEX_COINS.slice(0, 6).map((c) => (
              <Link key={c.code} href={`${base}/trade/${c.code}USDT`} className="flex items-center gap-3 border-b border-white/5 p-3 transition last:border-0 hover:bg-white/5">
                <CoinIcon code={c.code} size={34} />
                <div className="flex-1"><p className="text-sm font-black">{c.code}/USDT</p><p className="text-[11px] opacity-50">ভলিউম {c.vol}</p></div>
                <Spark code={c.code} w={80} h={28} />
                <div className="text-right"><p className="text-sm font-black">${fmtUSD(c.price)}</p><ChangeBadge v={c.change} /></div>
              </Link>
            ))}
          </div>
        </div>
        {/* CTA */}
        <div className="mt-8 rounded-2xl bg-gradient-to-r from-[#f0b90b] to-[#d49a06] p-6 text-center text-black sm:p-8">
          <p className="text-2xl font-black">🎁 নতুন ইউজারদের জন্য ১০০ USDT বোনাস!</p>
          <p className="mt-1 text-sm font-bold opacity-80">সাইন আপ + KYC করলেই ওয়েলকাম রিওয়ার্ড (ডেমো)</p>
          <Link href={`${base}/signup`} className="mt-4 inline-block rounded-xl bg-black px-8 py-3 text-sm font-black text-[#f0b90b]">এখনই শুরু করুন</Link>
        </div>
      </Page>
    </div>
  );
}

/* ================= MARKETS ================= */

export function CexMarkets() {
  const { base } = useDemo();
  const { card, sub, input } = useSkin();
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"vol" | "gain" | "price">("vol");
  const [tab, setTab] = useState<"spot" | "futures">("spot");
  const list = useMemo(() => {
    let l = CEX_COINS.filter((c) => !q || (c.code + c.bn + c.name).toLowerCase().includes(q.toLowerCase()));
    if (sort === "gain") l = [...l].sort((a, b) => b.change - a.change);
    else if (sort === "price") l = [...l].sort((a, b) => b.price - a.price);
    return l;
  }, [q, sort]);
  return (
    <div>
      <TickerTape />
      <Page>
        <PageHead t="📊 মার্কেটস" sub="সব ট্রেডিং পেয়ার — লাইভ দাম (ডেমো)" />
        <div className="flex gap-1.5">
          {(["spot", "futures"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`rounded-xl px-4 py-2 text-xs font-black ${tab === t ? "bg-[#f0b90b] text-black" : "bg-white/5 text-slate-400"}`}>
              {t === "spot" ? "📊 স্পট" : "⚡ ফিউচার্স"}
            </button>
          ))}
        </div>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="🔍 কয়েন খুঁজুন (BTC, ইথেরিয়াম...)" className={input} />
          <div className="flex gap-1.5">
            {([["vol", "ভলিউম"], ["gain", "গেইনার"], ["price", "দাম"]] as const).map(([v, t]) => (
              <button key={v} onClick={() => setSort(v)} className={`whitespace-nowrap rounded-xl px-3 py-2 text-xs font-bold ${sort === v ? "bg-[#f0b90b] text-black" : "bg-white/5 text-slate-400"}`}>{t}</button>
            ))}
          </div>
        </div>
        <div className={`${card} mt-3 overflow-hidden`}>
          <div className="grid grid-cols-4 gap-2 border-b border-white/10 p-3 text-[10px] font-bold opacity-40">
            <span>পেয়ার</span><span className="text-right">দাম</span><span className="text-right">২৪ঘ %</span><span className="text-right">চার্ট</span>
          </div>
          {list.map((c) => (
            <Link key={c.code} href={`${base}/${tab === "spot" ? "trade" : "futures"}/${c.code}USDT`} className="grid grid-cols-4 items-center gap-2 border-b border-white/5 p-3 transition last:border-0 hover:bg-white/5">
              <span className="flex items-center gap-2"><CoinIcon code={c.code} size={30} /><span><b className="text-sm">{c.code}</b><span className="text-[11px] opacity-50">/USDT</span><p className="text-[10px] opacity-40">{c.bn}</p></span></span>
              <span className="text-right text-sm font-black">${fmtUSD(c.price)}</span>
              <span className="text-right"><ChangeBadge v={c.change} /></span>
              <span className="flex justify-end"><Spark code={c.code} w={72} h={26} /></span>
            </Link>
          ))}
          {list.length === 0 && <Empty emoji="🔍" text="কোনো কয়েন পাওয়া যায়নি" />}
        </div>
        <p className={`mt-2 text-center text-[11px] ${sub}`}>💡 দাম ডেমো — আসল মার্কেট দাম নয়</p>
      </Page>
    </div>
  );
}

/* ================= SPOT TRADING ================= */

export function CexSpot({ pair }: { pair?: string }) {
  const { base } = useDemo();
  const { card, sub, input } = useSkin();
  const code = (pair || "BTCUSDT").replace("USDT", "");
  const c = coinOf(code);
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [otype, setOtype] = useState("লিমিট");
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
    if (side === "buy" && (bal.USDT ?? 0) < t) { alert("USDT ব্যালেন্স কম!"); return; }
    if (side === "sell" && (bal[code] ?? 0) < qn) { alert(`${code} ব্যালেন্স কম!`); return; }
    const nb = { ...bal };
    if (side === "buy") { nb.USDT -= t; nb[code] = (nb[code] ?? 0) + qn; }
    else { nb[code] -= qn; nb.USDT = (nb.USDT ?? 0) + t; }
    setBal(nb);
    const newOrder: CexOrder = { id: `SP${Date.now()}`, pair: `${code}/USDT`, side, type: otype, price: p, qty: qn, total: t, date: Date.now(), status: "✅ সম্পন্ন" };
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
            <p className="text-[11px] opacity-50">২৪ঘ হাই ${fmtUSD(c.high)} • লো ${fmtUSD(c.low)} • ভলিউম {c.vol}</p>
          </div>
          <span className={`text-xl font-black ${c.change >= 0 ? "text-[#0ecb81]" : "text-[#f6465d]"}`}>${fmtUSD(c.price)}</span>
          <ChangeBadge v={c.change} big />
          <Link href={`${base}/coin/${code}`} className="ml-auto rounded-lg bg-white/5 px-3 py-1.5 text-xs font-bold hover:bg-white/10">📄 কয়েন তথ্য</Link>
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
            <p className="mt-3 text-xs font-black opacity-60">🕘 সাম্প্রতিক ট্রেড</p>
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
            <p className="px-2 py-1 text-xs font-black opacity-60">📖 অর্ডার বুক <span className="font-normal">(লাইভ ডেমো)</span></p>
            <OrderBook code={code} />
          </div>
          {/* buy/sell panel */}
          <div className={`${card} p-3`}>
            <div className="grid grid-cols-2 gap-1 rounded-xl bg-white/5 p-1">
              {(["buy", "sell"] as const).map((s) => (
                <button key={s} onClick={() => setSide(s)} className={`rounded-lg py-2 text-sm font-black ${side === s ? (s === "buy" ? "bg-[#0ecb81] text-white" : "bg-[#f6465d] text-white") : "text-slate-400"}`}>
                  {s === "buy" ? "🟢 কিনুন" : "🔴 বিক্রি"}
                </button>
              ))}
            </div>
            <div className="mt-2 flex gap-1.5">
              {["লিমিট", "মার্কেট", "স্টপ-লিমিট"].map((t) => (
                <button key={t} onClick={() => setOtype(t)} className={`flex-1 rounded-lg py-1.5 text-[11px] font-bold ${otype === t ? "bg-white/15 text-white" : "text-slate-500"}`}>{t}</button>
              ))}
            </div>
            <div className="mt-3 space-y-2">
              <div>
                <label className={`text-[11px] ${sub}`}>দাম (USDT)</label>
                <input value={price} onChange={(e) => setPrice(e.target.value)} type="number" className={input} />
              </div>
              <div>
                <label className={`text-[11px] ${sub}`}>পরিমাণ ({code})</label>
                <input value={qty} onChange={(e) => setQty(e.target.value)} type="number" placeholder="0.00" className={input} />
              </div>
              <div className="flex gap-1.5">
                {[25, 50, 75, 100].map((p) => (
                  <button key={p} onClick={() => setQty(String((((bal.USDT ?? 0) * p) / 100 / (parseFloat(price) || 1)).toFixed(6)))} className="flex-1 rounded-lg bg-white/5 py-1.5 text-[11px] font-bold text-slate-400 hover:bg-white/10">{p}%</button>
                ))}
              </div>
              <div className={`flex justify-between text-xs ${sub}`}><span>মোট</span><b className="text-white">${fmtUSD(total)} USDT</b></div>
              <div className={`flex justify-between text-[11px] ${sub}`}><span>ব্যালেন্স</span><span>{bn((bal.USDT ?? 0).toLocaleString("en-US", { maximumFractionDigits: 2 }))} USDT • {bn((bal[code] ?? 0).toFixed(4))} {code}</span></div>
              <button onClick={submit} className={`w-full rounded-xl py-3 text-sm font-black text-white transition hover:brightness-110 ${side === "buy" ? "bg-[#0ecb81]" : "bg-[#f6465d]"}`}>
                {side === "buy" ? `🟢 ${code} কিনুন` : `🔴 ${code} বিক্রি করুন`}
              </button>
              {done && <p className="rounded-xl bg-emerald-500/15 py-2 text-center text-xs font-bold text-emerald-400">✅ অর্ডার সম্পন্ন! (ডেমো)</p>}
            </div>
          </div>
        </div>
        {/* my orders */}
        <div className={`${card} mt-2 p-3`}>
          <p className="text-xs font-black opacity-60">📝 আমার স্পট অর্ডার</p>
          {orders.length === 0 ? <p className={`py-4 text-center text-xs ${sub}`}>এখনো অর্ডার নেই — উপরে থেকে ট্রেড করুন</p> : (
            <div className="mt-2 space-y-1.5">
              {orders.slice(0, 5).map((o) => (
                <div key={o.id} className="flex items-center justify-between rounded-lg bg-white/[0.03] px-3 py-2 text-xs">
                  <span><b className={o.side === "buy" ? "text-[#0ecb81]" : "text-[#f6465d]"}>{o.side === "buy" ? "কিনুন" : "বিক্রি"}</b> {o.pair}</span>
                  <span className="opacity-60">{o.qty} @ ${fmtUSD(o.price)}</span>
                  <span className="font-bold">${fmtUSD(o.total)}</span>
                  <span className="text-emerald-400">{o.status}</span>
                </div>
              ))}
              <Link href={`${base}/orders/spot`} className="block text-center text-xs font-bold text-[#f0b90b]">সব অর্ডার দেখুন →</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ================= FUTURES ================= */

export function CexFutures({ pair }: { pair?: string }) {
  const { base } = useDemo();
  const { card, sub, input } = useSkin();
  const code = (pair || "BTCUSDT").replace("USDT", "");
  const c = coinOf(code);
  const [side, setSide] = useState<"long" | "short">("long");
  const [lev, setLev] = useState(10);
  const [qty, setQty] = useState("");
  const [orders, setOrders] = useLocal<CexOrder[]>("fut_orders", []);
  const [done, setDone] = useState(false);

  function submit() {
    const qn = parseFloat(qty);
    if (!qn || qn <= 0) return;
    const t = c.price * qn;
    const newOrder: CexOrder = { id: `FU${Date.now()}`, pair: `${code}/USDT`, side: side === "long" ? "buy" : "sell", type: `${lev}x ${side === "long" ? "লং" : "শর্ট"}`, price: c.price, qty: qn, total: t, date: Date.now(), status: "✅ ওপেন" };
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
          <span className={`ml-auto text-[11px] ${sub}`}>💰 ফান্ডিং রেট: <b className="text-emerald-400">0.0100%</b></span>
        </div>
        <div className="grid gap-2 lg:grid-cols-[1fr_280px_300px]">
          <div className={`${card} p-3`}>
            <TradeChart code={code} height={260} />
            <div className="mt-2 grid grid-cols-4 gap-2 text-center text-[11px]">
              {[["24h হাই", `$${fmtUSD(c.high)}`], ["24h লো", `$${fmtUSD(c.low)}`], ["24h ভলিউম", c.vol], ["ওপেন ইন্টারেস্ট", "২.৪B"]].map(([t, v]) => (
                <div key={t} className="rounded-lg bg-white/[0.03] p-2"><p className="opacity-50">{t}</p><p className="font-bold">{v}</p></div>
              ))}
            </div>
          </div>
          <div className={`${card} p-2`}>
            <p className="px-2 py-1 text-xs font-black opacity-60">📖 অর্ডার বুক</p>
            <OrderBook code={code} />
          </div>
          <div className={`${card} p-3`}>
            <div className="mb-2 flex items-center justify-between">
              <span className={`text-xs ${sub}`}>লিভারেজ</span>
              <span className="rounded-lg bg-[#f0b90b]/20 px-2 py-1 text-xs font-black text-[#f0b90b]">{bn(lev)}x</span>
            </div>
            <input type="range" min={1} max={125} value={lev} onChange={(e) => setLev(+e.target.value)} className="w-full accent-[#f0b90b]" />
            <div className="mt-2 grid grid-cols-2 gap-1 rounded-xl bg-white/5 p-1">
              {(["long", "short"] as const).map((s) => (
                <button key={s} onClick={() => setSide(s)} className={`rounded-lg py-2 text-sm font-black ${side === s ? (s === "long" ? "bg-[#0ecb81] text-white" : "bg-[#f6465d] text-white") : "text-slate-400"}`}>
                  {s === "long" ? "🟢 লং / কিনুন" : "🔴 শর্ট / বিক্রি"}
                </button>
              ))}
            </div>
            <div className="mt-3 space-y-2">
              <div><label className={`text-[11px] ${sub}`}>পরিমাণ ({code})</label><input value={qty} onChange={(e) => setQty(e.target.value)} type="number" placeholder="0.00" className={input} /></div>
              <div className={`flex justify-between text-xs ${sub}`}><span>মার্জিন প্রয়োজন</span><b className="text-white">${fmtUSD((c.price * (parseFloat(qty) || 0)) / lev)}</b></div>
              <div className={`flex justify-between text-[11px] ${sub}`}><span>লিকুইডেশন প্রাইস (আনুমানিক)</span><span className="text-red-400">${fmtUSD(c.price * (side === "long" ? 1 - 0.9 / lev : 1 + 0.9 / lev))}</span></div>
              <button onClick={submit} className={`w-full rounded-xl py-3 text-sm font-black text-white ${side === "long" ? "bg-[#0ecb81]" : "bg-[#f6465d]"}`}>
                {side === "long" ? `🟢 লং ওপেন করুন (${bn(lev)}x)` : `🔴 শর্ট ওপেন করুন (${bn(lev)}x)`}
              </button>
              {done && <p className="rounded-xl bg-emerald-500/15 py-2 text-center text-xs font-bold text-emerald-400">✅ পজিশন ওপেন! (ডেমো)</p>}
              <p className={`text-center text-[10px] ${sub}`}>⚠️ ফিউচার্সে বড় ক্ষতির ঝুঁকি আছে — ডেমোতে নিরাপদে শিখুন</p>
            </div>
          </div>
        </div>
        <div className={`${card} mt-2 p-3`}>
          <div className="flex items-center justify-between">
            <p className="text-xs font-black opacity-60">📝 ওপেন পজিশন</p>
            <Link href={`${base}/orders/futures`} className="text-xs font-bold text-[#f0b90b]">সব দেখুন →</Link>
          </div>
          {orders.length === 0 ? <p className={`py-4 text-center text-xs ${sub}`}>কোনো ওপেন পজিশন নেই</p> : (
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
      <PageHead t="🤝 P2P ট্রেডিং" sub="সরাসরি ব্যবহারকারীর সাথে কেনাবেচা — এসক্রো সুরক্ষিত" />
      <div className={`${card} p-4`}>
        <div className="grid grid-cols-2 gap-1 rounded-xl bg-white/5 p-1">
          {(["buy", "sell"] as const).map((s) => (
            <button key={s} onClick={() => setTab(s)} className={`rounded-lg py-2.5 text-sm font-black ${tab === s ? "bg-[#f0b90b] text-black" : "text-slate-400"}`}>
              {s === "buy" ? "💰 কিনুন" : "💸 বিক্রি করুন"}
            </button>
          ))}
        </div>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <div className="flex gap-1.5">
            {["USDT", "BTC", "ETH"].map((cc) => (
              <button key={cc} onClick={() => setCoin(cc)} className={`rounded-xl px-4 py-2 text-xs font-black ${coin === cc ? "bg-white/15 text-white" : "bg-white/5 text-slate-400"}`}>{cc}</button>
            ))}
          </div>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="🔍 মার্চেন্ট খুঁজুন" className={input} />
        </div>
      </div>
      <div className="mt-3 space-y-2">
        {ads.map((a) => (
          <div key={a.id} className={`${card} p-4`}>
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-[#f0b90b]/15 text-lg">👤</span>
                <div>
                  <p className="text-sm font-black">{a.trader} <span className="text-[10px] font-normal text-emerald-400">● অনলাইন</span></p>
                  <p className={`text-[11px] ${sub}`}>{bn(a.trades)} ট্রেড • {bn(a.rate.toFixed(1))}% সফল</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-black text-[#f0b90b]">{bn(a.price.toLocaleString("en-IN"))} টাকা</p>
                <p className={`text-[11px] ${sub}`}>প্রতি {a.coin}</p>
              </div>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px]">
              <span className={`${sub}`}>লিমিট: {bn(a.min.toLocaleString("en-IN"))}–{bn(a.max.toLocaleString("en-IN"))} টাকা</span>
              {a.pay.map((p) => <span key={p} className="rounded-full bg-white/5 px-2 py-0.5 font-bold">{p}</span>)}
              <Link href={`${base}/p2p/${a.id}`} className={`ml-auto rounded-xl px-6 py-2 text-xs font-black ${tab === "buy" ? "bg-[#0ecb81] text-white" : "bg-[#f6465d] text-white"}`}>
                {tab === "buy" ? "কিনুন" : "বিক্রি করুন"}
              </Link>
            </div>
          </div>
        ))}
        {ads.length === 0 && <Empty emoji="🤝" text="কোনো অফার পাওয়া যায়নি" />}
      </div>
      <div className={`${card} mt-4 p-4`}>
        <p className="text-sm font-black">🛡️ P2P নিরাপত্তা টিপস</p>
        <ul className={`mt-2 list-disc space-y-1 pl-5 text-xs ${sub}`}>
          <li>কখনো প্ল্যাটফর্মের বাইরে টাকা পাঠাবেন না</li>
          <li>পেমেন্ট কনফার্ম না হওয়া পর্যন্ত কয়েন রিলিজ করবেন না</li>
          <li>সন্দেহজনক অফার রিপোর্ট করুন</li>
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
      <PageHead t="🤝 P2P অর্ডার" sub={`অর্ডার #${ad.id.toUpperCase()}`} />
      {step === 0 && (
        <div className={`${card} p-5`}>
          <div className="flex items-center justify-between">
            <div><p className="text-sm font-black">{ad.trader}</p><p className={`text-[11px] ${sub}`}>{bn(ad.trades)} ট্রেড • {bn(ad.rate.toFixed(1))}%</p></div>
            <p className="text-xl font-black text-[#f0b90b]">{bn(ad.price.toLocaleString("en-IN"))} <span className="text-xs">টাকা/{ad.coin}</span></p>
          </div>
          <div className="mt-4">
            <label className={`text-xs ${sub}`}>টাকার পরিমাণ (সর্বনিম্ন {bn(ad.min.toLocaleString("en-IN"))})</label>
            <input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" placeholder="যেমন: 10000" className={`${input} mt-1`} />
            {recv > 0 && <p className="mt-1 text-xs text-emerald-400">পাবেন: ≈ {recv.toFixed(4)} {ad.coin}</p>}
          </div>
          <p className={`mt-3 text-xs ${sub}`}>💳 পেমেন্ট: {ad.pay.join(", ")}</p>
          <button onClick={() => parseFloat(amount) >= ad.min && setStep(1)} className="mt-4 w-full rounded-xl bg-[#f0b90b] py-3 text-sm font-black text-black">➡️ অর্ডার করুন</button>
        </div>
      )}
      {step === 1 && (
        <div className={`${card} p-5 text-center`}>
          <p className="text-5xl">⏳</p>
          <p className="mt-2 text-lg font-black">পেমেন্ট করুন</p>
          <p className={`mt-1 text-xs ${sub}`}>{ad.pay[0]} নম্বরে <b className="text-white">{bn(amount)} টাকা</b> পাঠান<br />তারপর নিচে কনফার্ম চাপুন</p>
          <div className="mx-auto mt-3 max-w-xs rounded-xl bg-white/5 p-4">
            <p className={`text-[11px] ${sub}`}>মার্চেন্ট {ad.pay[0]} নম্বর</p>
            <p className="text-xl font-black tracking-widest">01XXXXXXXXX</p>
            <p className={`mt-1 text-[10px] ${sub}`}>রেফারেন্স: {ad.id.toUpperCase()}</p>
          </div>
          <button onClick={() => setStep(2)} className="mt-4 w-full rounded-xl bg-[#0ecb81] py-3 text-sm font-black text-white">✅ পেমেন্ট করেছি</button>
          <button onClick={() => setStep(0)} className={`mt-2 text-xs ${sub} underline`}>বাতিল করুন</button>
        </div>
      )}
      {step === 2 && (
        <div className={`${card} p-5 text-center`}>
          <p className="text-5xl">🎉</p>
          <p className="mt-2 text-lg font-black text-emerald-400">অর্ডার সম্পন্ন!</p>
          <p className={`mt-1 text-xs ${sub}`}>{recv.toFixed(4)} {ad.coin} আপনার ফান্ডিং ওয়ালেটে যোগ হয়েছে (ডেমো)</p>
          <Link href={`${base}/p2p`} className="mt-4 inline-block rounded-xl bg-white/10 px-6 py-2.5 text-sm font-bold">← P2P-তে ফিরুন</Link>
        </div>
      )}
    </Page>
  );
}

/* ================= CONVERT ================= */

export function CexConvert() {
  const { card, sub, input } = useSkin();
  const [from, setFrom] = useState("USDT");
  const [to, setTo] = useState("BTC");
  const [amount, setAmount] = useState("");
  const [done, setDone] = useState(false);
  const [bal, setBal] = useCexBalances();
  const rate = coinOf(from).price / coinOf(to).price;
  const out = (parseFloat(amount) || 0) * rate;

  function swap() {
    const a = parseFloat(amount);
    if (!a || a <= 0) return;
    if ((bal[from] ?? 0) < a) { alert(`${from} ব্যালেন্স কম!`); return; }
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
        {CEX_COINS.map((c) => <option key={c.code} value={c.code}>{c.code}</option>)}
      </select>
    </div>
  );

  return (
    <Page narrow>
      <PageHead t="🔄 কনভার্ট" sub="১ ক্লিকে এক কয়েন থেকে আরেক কয়েনে — জিরো ফি (ডেমো)" />
      <div className={`${card} p-5`}>
        <label className={`text-xs ${sub}`}>থেকে</label>
        <div className="mt-1 flex gap-2">
          <input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" placeholder="0.00" className={input} />
          <CoinSel v={from} set={setFrom} />
        </div>
        <p className={`mt-1 text-right text-[11px] ${sub}`}>ব্যালেন্স: {bn((bal[from] ?? 0).toFixed(4))} {from}</p>
        <div className="my-1 flex justify-center">
          <button onClick={() => { setFrom(to); setTo(from); }} className="grid h-10 w-10 place-items-center rounded-full bg-[#f0b90b] text-lg font-black text-black transition hover:rotate-180">⇅</button>
        </div>
        <label className={`text-xs ${sub}`}>পাবেন (আনুমানিক)</label>
        <div className="mt-1 flex gap-2">
          <input value={out ? out.toFixed(6) : ""} readOnly placeholder="0.00" className={`${input} opacity-70`} />
          <CoinSel v={to} set={setTo} />
        </div>
        <div className={`mt-2 flex justify-between text-xs ${sub}`}>
          <span>রেট</span><span>1 {from} ≈ {rate < 0.01 ? rate.toFixed(6) : rate.toFixed(4)} {to}</span>
        </div>
        <button onClick={swap} className="mt-4 w-full rounded-xl bg-[#f0b90b] py-3 text-sm font-black text-black transition hover:brightness-110">🔄 কনভার্ট করুন</button>
        {done && <p className="mt-2 rounded-xl bg-emerald-500/15 py-2 text-center text-xs font-bold text-emerald-400">✅ কনভার্ট সফল! (ডেমো)</p>}
      </div>
    </Page>
  );
}

/* ================= DEPOSIT / WITHDRAW ================= */

export function CexDepositCrypto() {
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
      <PageHead t="📥 ক্রিপ্টো ডিপোজিট" sub="বাইরে থেকে কয়েন পাঠান" />
      <div className={`${card} p-5`}>
        <div className="grid grid-cols-2 gap-2">
          <div><label className={`text-xs ${sub}`}>কয়েন</label>
            <select value={coin} onChange={(e) => setCoin(e.target.value)} className={`${input} mt-1 [&>option]:text-black`}>
              {CEX_COINS.map((c) => <option key={c.code} value={c.code}>{c.code} — {c.bn}</option>)}
            </select></div>
          <div><label className={`text-xs ${sub}`}>নেটওয়ার্ক</label>
            <select value={net} onChange={(e) => setNet(e.target.value)} className={`${input} mt-1 [&>option]:text-black`}>
              {["TRC20", "BEP20", "ERC20"].map((n) => <option key={n}>{n}</option>)}
            </select></div>
        </div>
        <div className="mx-auto mt-4 grid h-44 w-44 place-items-center rounded-2xl bg-white p-2">
          <div className="grid h-full w-full place-items-center rounded-xl bg-[repeating-conic-gradient(#000_0_25%,#fff_0_50%)] bg-[length:20px_20px] text-4xl">◈</div>
        </div>
        <p className={`mt-2 text-center text-[11px] ${sub}`}>QR স্ক্যান করুন (ডেমো)</p>
        <label className={`mt-3 text-xs ${sub}`}>ডিপোজিট অ্যাড্রেস</label>
        <div className="mt-1 flex gap-2">
          <input value={addr} readOnly className={`${input} font-mono !text-[11px]`} />
          <button onClick={() => { navigator.clipboard?.writeText(addr).catch(() => {}); setDone(true); setTimeout(() => setDone(false), 1500); }} className="shrink-0 rounded-xl bg-[#f0b90b] px-4 text-sm font-black text-black">📋</button>
        </div>
        {done && <p className="mt-1 text-center text-xs text-emerald-400">✅ কপি হয়েছে!</p>}
        <div className={`mt-4 rounded-xl bg-red-500/10 p-3 text-[11px] leading-relaxed text-red-300`}>
          ⚠️ শুধুমাত্র <b>{coin}</b> ({net}) পাঠাবেন। ভুল নেটওয়ার্কে পাঠালে কয়েন হারিয়ে যাবে!
        </div>
      </div>
    </Page>
  );
}

export function CexDepositFiat() {
  const { card, sub, input } = useSkin();
  const [method, setMethod] = useState("বিকাশ");
  const [amount, setAmount] = useState("");
  const [trx, setTrx] = useState("");
  const [step, setStep] = useState(0);
  return (
    <Page narrow>
      <PageHead t="💰 ফিয়াট ডিপোজিট" sub="বিকাশ/নগদ/রকেট দিয়ে টাকা জমা দিন" />
      {step === 0 && (
        <div className={`${card} p-5`}>
          <label className={`text-xs ${sub}`}>মাধ্যম</label>
          <div className="mt-1 grid grid-cols-3 gap-2">
            {[["বিকাশ", "🩷"], ["নগদ", "🧡"], ["রকেট", "💜"]].map(([m, e]) => (
              <button key={m} onClick={() => setMethod(m)} className={`rounded-xl border-2 p-3 text-sm font-black ${method === m ? "border-[#f0b90b] bg-[#f0b90b]/10" : "border-white/10"}`}>{e}<br />{m}</button>
            ))}
          </div>
          <label className={`mt-3 block text-xs ${sub}`}>টাকার পরিমাণ (সর্বনিম্ন ৫০০ টাকা)</label>
          <input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" placeholder="যেমন: 5000" className={`${input} mt-1`} />
          {parseFloat(amount) >= 500 && <p className="mt-1 text-xs text-emerald-400">পাবেন: ≈ {(parseFloat(amount) / USD_BDT).toFixed(2)} USDT</p>}
          <button onClick={() => parseFloat(amount) >= 500 && setStep(1)} className="mt-4 w-full rounded-xl bg-[#f0b90b] py-3 text-sm font-black text-black">➡️ পরবর্তী</button>
        </div>
      )}
      {step === 1 && (
        <div className={`${card} p-5 text-center`}>
          <p className="text-5xl">📲</p>
          <p className="mt-2 font-black">{method} নম্বরে <span className="text-[#f0b90b]">{bn(amount)} টাকা</span> পাঠান</p>
          <div className="mx-auto mt-3 max-w-xs rounded-xl bg-white/5 p-4">
            <p className={`text-[11px] ${sub}`}>মার্চেন্ট {method} (পার্সোনাল)</p>
            <p className="text-xl font-black tracking-widest">01XXXXXXXXX</p>
          </div>
          <label className={`mt-3 block text-left text-xs ${sub}`}>TrxID দিন</label>
          <input value={trx} onChange={(e) => setTrx(e.target.value)} placeholder="যেমন: 9HX7K2LM4P" className={`${input} mt-1 font-mono`} />
          <button onClick={() => trx.trim().length >= 6 && setStep(2)} className="mt-4 w-full rounded-xl bg-[#0ecb81] py-3 text-sm font-black text-white">✅ সাবমিট করুন</button>
          <button onClick={() => setStep(0)} className={`mt-2 text-xs ${sub} underline`}>← ফিরে যান</button>
        </div>
      )}
      {step === 2 && (
        <div className={`${card} p-5 text-center`}>
          <p className="text-5xl">⏳</p>
          <p className="mt-2 text-lg font-black">রিকোয়েস্ট পেন্ডিং</p>
          <p className={`mt-1 text-xs ${sub}`}>{bn(amount)} টাকা • {method} • TrxID: <span className="font-mono text-white">{trx}</span><br />যাচাই করে ৫–১৫ মিনিটে USDT যোগ হবে (ডেমো)</p>
        </div>
      )}
    </Page>
  );
}

export function CexWithdraw() {
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
      <PageHead t="📤 উইথড্র" sub="কয়েন বাইরের ওয়ালেটে পাঠান" />
      <div className={`${card} p-5`}>
        <label className={`text-xs ${sub}`}>কয়েন</label>
        <select value={coin} onChange={(e) => setCoin(e.target.value)} className={`${input} mt-1 [&>option]:text-black`}>
          {CEX_COINS.map((c) => <option key={c.code} value={c.code}>{c.code} — {c.bn}</option>)}
        </select>
        <label className={`mt-3 block text-xs ${sub}`}>প্রাপকের অ্যাড্রেস</label>
        <input value={addr} onChange={(e) => setAddr(e.target.value)} placeholder="0x... বা T..." className={`${input} mt-1 font-mono !text-xs`} />
        <label className={`mt-3 block text-xs ${sub}`}>পরিমাণ</label>
        <input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" placeholder="0.00" className={`${input} mt-1`} />
        <div className={`mt-2 space-y-1 text-xs ${sub}`}>
          <div className="flex justify-between"><span>নেটওয়ার্ক ফি</span><span>{fee} {coin}</span></div>
          <div className="flex justify-between"><span>পাবেন</span><b className="text-white">{recv.toFixed(6)} {coin}</b></div>
        </div>
        <label className={`mt-3 block text-xs ${sub}`}>🔐 2FA কোড</label>
        <input value={code2fa} onChange={(e) => setCode2fa(e.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" placeholder="৬ সংখ্যার কোড" className={`${input} mt-1 text-center tracking-[0.4em]`} />
        <button onClick={() => addr.length > 10 && parseFloat(amount) > fee && code2fa.length === 6 && setDone(true)} className="mt-4 w-full rounded-xl bg-[#f6465d] py-3 text-sm font-black text-white">📤 উইথড্র করুন</button>
        {done && <p className="mt-2 rounded-xl bg-emerald-500/15 py-2 text-center text-xs font-bold text-emerald-400">✅ উইথড্র রিকোয়েস্ট গৃহীত! (ডেমো)</p>}
      </div>
    </Page>
  );
}

/* ================= WALLETS ================= */

function WalletShell({ t, sub, children }: { t: string; sub?: string; children: React.ReactNode }) {
  const { base } = useDemo();
  const tabs = [["", "ওভারভিউ"], ["spot", "স্পট"], ["futures", "ফিউচার্স"], ["funding", "ফান্ডিং"]];
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
