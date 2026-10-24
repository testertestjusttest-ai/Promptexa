"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useDemo } from "./store";
import { Back, Empty, Field, Page, SectionTitle } from "./ui";
import { fmtUSD, fmtPct, priceSeries, ChangeBadge, Spark, CoinIcon, CoinRow, TickerTape, TradeChart, OrderBook, useCexBalances, balTotalUSD, bn, fmtBDT, useCexCoins, coinOf, LAUNCHPADS, EARN_PRODUCTS, NFTS, ANNOUNCEMENTS, FAQS, BLOGS, ACADEMY, useSkin, useLocal, Stat, PageHead, CexOrder, WalletShell } from "./cex-shared";

export function CexWallet() {
  const coins = useCexCoins();
  const { base } = useDemo();
  const { card, sub } = useSkin();
  const [bal] = useCexBalances();
  const total = balTotalUSD(bal, coins);
  const wallets = [
    ["📊", "Spot Wallet", total * 0.6, "/wallet/spot", "Trading balance"],
    ["⚡", "Futures Wallet", total * 0.25, "/wallet/futures", "Margin balance"],
    ["💼", "Funding Wallet", total * 0.15, "/wallet/funding", "P2P & payments"],
  ];
  return (
    <WalletShell t="👛 Wallet Overview">
      <div className="rounded-2xl bg-gradient-to-br from-[#f0b90b] to-[#b57e04] p-5 text-black">
        <p className="text-xs font-bold opacity-70">Total assets (approx.)</p>
        <p className="mt-1 text-3xl font-black">${fmtUSD(total)}</p>
        <p className="text-sm font-bold opacity-70">≈ {fmtBDT(total)} BDT</p>
        <div className="mt-3 flex gap-2">
          <Link href={`${base}/deposit`} className="flex-1 rounded-xl bg-black/85 py-2.5 text-center text-xs font-black text-[#f0b90b]">📥 Deposit</Link>
          <Link href={`${base}/withdraw`} className="flex-1 rounded-xl bg-black/85 py-2.5 text-center text-xs font-black text-[#f0b90b]">📤 Withdraw</Link>
          <Link href={`${base}/convert`} className="flex-1 rounded-xl bg-black/85 py-2.5 text-center text-xs font-black text-[#f0b90b]">🔄 Convert</Link>
        </div>
      </div>
      <div className="mt-3 space-y-2">
        {wallets.map(([e, t, v, href, d]) => (
          <Link key={href} href={`${base}${href}`} className={`${card} flex items-center gap-3 p-4 transition hover:border-[#f0b90b]/40`}>
            <span className="text-3xl">{e}</span>
            <div className="flex-1"><p className="text-sm font-black">{t}</p><p className={`text-[11px] ${sub}`}>{d}</p></div>
            <div className="text-right"><p className="font-black">${fmtUSD(v as number)}</p><span className="text-xs opacity-50">→</span></div>
          </Link>
        ))}
      </div>
    </WalletShell>
  );
}

function CoinBalances({ filter }: { filter?: (code: string) => boolean }) {
  const coins = useCexCoins();
  const { card, sub } = useSkin();
  const [bal] = useCexBalances();
  const rows = Object.entries(bal).filter(([c]) => !filter || filter(c));
  return (
    <div className={`${card} overflow-hidden`}>
      {rows.map(([code, q]) => {
        const c = coinOf(code, coins);
        const v = q * c.price;
        return (
          <div key={code} className="flex items-center gap-3 border-b border-white/5 p-3 last:border-0">
            <CoinIcon code={code} size={34} />
            <div className="flex-1"><p className="text-sm font-black">{code}</p><p className={`text-[11px] ${sub}`}>{c.bn}</p></div>
            <div className="text-right"><p className="text-sm font-black">{bn(q.toFixed(q < 1 ? 4 : 2))}</p><p className={`text-[11px] ${sub}`}>${fmtUSD(v)}</p></div>
          </div>
        );
      })}
      {rows.length === 0 && <p className={`p-6 text-center text-xs ${sub}`}>No balance</p>}
    </div>
  );
}

export function CexSpotWallet() {
  const { base } = useDemo();
  return (
    <WalletShell t="📊 Spot Wallet" sub="Available balance for trading">
      <CoinBalances />
      <Link href={`${base}/trade/BTCUSDT`} className="mt-3 block rounded-xl bg-[#f0b90b] py-3 text-center text-sm font-black text-black">📈 Trade</Link>
    </WalletShell>
  );
}

export function CexFuturesWallet() {
  const { base } = useDemo();
  const { card, sub } = useSkin();
  return (
    <WalletShell t="⚡ Futures Wallet" sub="Margin trading balance">
      <div className={`${card} p-4`}>
        <div className="flex justify-between text-sm"><span className={sub}>Total margin</span><b>$25,000.00</b></div>
        <div className="mt-2 flex justify-between text-sm"><span className={sub}>Used</span><b>$4,200.00</b></div>
        <div className="mt-2 flex justify-between text-sm"><span className={sub}>Available</span><b className="text-emerald-400">$20,800.00</b></div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full w-[17%] rounded-full bg-[#f0b90b]" /></div>
      </div>
      <Link href={`${base}/futures`} className="mt-3 block rounded-xl bg-[#f0b90b] py-3 text-center text-sm font-black text-black">⚡ Futures trade</Link>
    </WalletShell>
  );
}

export function CexFundingWallet() {
  const { base } = useDemo();
  return (
    <WalletShell t="💼 Funding Wallet" sub="For P2P & payments">
      <CoinBalances filter={(c) => c === "USDT"} />
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Link href={`${base}/p2p`} className="rounded-xl bg-[#0ecb81] py-3 text-center text-sm font-black text-white">🤝 P2P trade</Link>
        <Link href={`${base}/deposit-fiat`} className="rounded-xl bg-white/10 py-3 text-center text-sm font-black">💰 Fiat deposit</Link>
      </div>
    </WalletShell>
  );
}

/* ================= HISTORIES ================= */

export function CexTxHistory() {
  const { card, sub } = useSkin();
  const [tab, setTab] = useState<"all" | "dep" | "wd">("all");
  const txs = [
    { t: "📥", n: "USDT deposit (TRC20)", d: "11 October, 3:45 PM", a: "+500.00 USDT", s: "✅ Completed", dep: true },
    { t: "📤", n: "BTC withdrawal", d: "10 October, 11:20 AM", a: "-0.05 BTC", s: "✅ Completed", dep: false },
    { t: "📥", n: "Fiat deposit (bKash)", d: "9 October, 5:10 PM", a: "+12,100 BDT", s: "✅ Completed", dep: true },
    { t: "📤", n: "ETH withdrawal", d: "7 October, 9:05 AM", a: "-1.2 ETH", s: "⏳ Processing", dep: false },
    { t: "📥", n: "USDT deposit (BEP20)", d: "5 October, 2:30 PM", a: "+1,000.00 USDT", s: "✅ Completed", dep: true },
  ].filter((x) => tab === "all" || (tab === "dep" ? x.dep : !x.dep));
  return (
    <Page>
      <PageHead t="🧾 Transaction History" sub="Deposit & withdrawal records" />
      <div className="mb-3 flex gap-1.5">
        {([["all", "All"], ["dep", "📥 Deposit"], ["wd", "📤 Withdraw"]] as const).map(([v, t]) => (
          <button key={v} onClick={() => setTab(v)} className={`rounded-xl px-4 py-2 text-xs font-black ${tab === v ? "bg-[#f0b90b] text-black" : "bg-white/5 text-slate-400"}`}>{t}</button>
        ))}
      </div>
      <div className={`${card} divide-y divide-white/5`}>
        {txs.map((x, i) => (
          <div key={i} className="flex items-center gap-3 p-3">
            <span className="text-2xl">{x.t}</span>
            <div className="flex-1"><p className="text-sm font-bold">{x.n}</p><p className={`text-[11px] ${sub}`}>{x.d}</p></div>
            <div className="text-right"><p className={`text-sm font-black ${x.dep ? "text-emerald-400" : "text-white"}`}>{x.a}</p><p className="text-[11px] text-emerald-400">{x.s}</p></div>
          </div>
        ))}
      </div>
    </Page>
  );
}

export function CexSpotOrders() {
  const { card, sub } = useSkin();
  const [orders] = useLocal<CexOrder[]>("spot_orders", []);
  const [tab, setTab] = useState<"open" | "done">("done");
  return (
    <Page>
      <PageHead t="📝 Spot order history" />
      <div className="mb-3 flex gap-1.5">
        {(["open", "done"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`rounded-xl px-4 py-2 text-xs font-black ${tab === t ? "bg-[#f0b90b] text-black" : "bg-white/5 text-slate-400"}`}>{t === "open" ? "⏳ Open" : "✅ Completed"}</button>
        ))}
      </div>
      {orders.length === 0 ? <div className={card}><Empty emoji="📝" text="No orders" /></div> : (
        <div className="space-y-2">
          {orders.map((o) => (
            <div key={o.id} className={`${card} p-3`}>
              <div className="flex justify-between text-sm"><b className={o.side === "buy" ? "text-[#0ecb81]" : "text-[#f6465d]"}>{o.side === "buy" ? "🟢 Buy" : "🔴 Sell"}</b><b>{o.pair}</b></div>
              <div className={`mt-1 flex justify-between text-xs ${sub}`}><span>{o.type} • {o.qty} @ ${fmtUSD(o.price)}</span><b className="text-white">${fmtUSD(o.total)}</b></div>
              <p className="mt-1 text-[11px] text-emerald-400">{o.status}</p>
            </div>
          ))}
        </div>
      )}
    </Page>
  );
}

export function CexFuturesOrders() {
  const { card, sub } = useSkin();
  const [orders, setOrders] = useLocal<CexOrder[]>("fut_orders", []);
  return (
    <Page>
      <PageHead t="⚡ Futures order history" />
      {orders.length === 0 ? <div className={card}><Empty emoji="⚡" text="No futures orders" /></div> : (
        <div className="space-y-2">
          {orders.map((o) => (
            <div key={o.id} className={`${card} p-3`}>
              <div className="flex justify-between text-sm"><b>{o.type}</b><b>{o.pair}</b></div>
              <div className={`mt-1 flex justify-between text-xs ${sub}`}><span>{o.qty} @ ${fmtUSD(o.price)}</span><b className="text-emerald-400">PnL: +${fmtUSD(o.total * 0.02)}</b></div>
              <button onClick={() => setOrders(orders.filter((x) => x.id !== o.id))} className="mt-2 rounded-lg bg-red-500/15 px-3 py-1.5 text-[11px] font-bold text-red-400">❌ Close position</button>
            </div>
          ))}
        </div>
      )}
    </Page>
  );
}

export function CexTradeHistory() {
  const { card, sub } = useSkin();
  const [spot] = useLocal<CexOrder[]>("spot_orders", []);
  const [fut] = useLocal<CexOrder[]>("fut_orders", []);
  const all = [...spot, ...fut].sort((a, b) => b.date - a.date);
  const totalVol = all.reduce((s, o) => s + o.total, 0);
  return (
    <Page>
      <PageHead t="📜 Trade history" sub="Complete record across all markets" />
      <div className="mb-3 grid grid-cols-3 gap-2">
        <Stat e="📊" v={bn(all.length)} t="Total trades" />
        <Stat e="💵" v={`$${fmtUSD(totalVol)}`} t="Total volume" />
        <Stat e="💰" v={`$${fmtUSD(totalVol * 0.001)}`} t="Total fees" />
      </div>
      {all.length === 0 ? <div className={card}><Empty emoji="📜" text="You haven't traded yet" /></div> : (
        <div className="space-y-2">
          {all.map((o) => (
            <div key={o.id} className={`${card} flex items-center justify-between p-3 text-xs`}>
              <span><b>{o.pair}</b> <span className={o.side === "buy" ? "text-[#0ecb81]" : "text-[#f6465d]"}>{o.side === "buy" ? "Buy" : "Sell"}</span></span>
              <span className={sub}>{new Date(o.date).toLocaleDateString("en-US")}</span>
              <b>${fmtUSD(o.total)}</b>
            </div>
          ))}
        </div>
      )}
    </Page>
  );
}

/* ================= SECURITY / ACCOUNT ================= */

export function Cex2FA() {
  const { card, sub, input } = useSkin();
  const [code, setCode] = useState("");
  const [done, setDone] = useState(false);
  const [enabled, setEnabled] = useLocal("2fa_on", false);
  return (
    <Page narrow>
      <PageHead t="🔐 2FA setup" sub="Increase security with Google Authenticator" />
      {enabled ? (
        <div className={`${card} p-5 text-center`}>
          <p className="text-5xl">✅</p>
          <p className="mt-2 text-lg font-black text-emerald-400">2FA is on</p>
          <p className={`mt-1 text-xs ${sub}`}>Your account is extra secure</p>
          <button onClick={() => setEnabled(false)} className="mt-4 rounded-xl bg-red-500/15 px-6 py-2.5 text-sm font-bold text-red-400">Turn off 2FA</button>
        </div>
      ) : !done ? (
        <div className={`${card} p-5`}>
          <p className={`text-xs ${sub}`}>1. Scan this QR in the Google Authenticator app (demo)</p>
          <div className="mx-auto mt-3 grid h-40 w-40 place-items-center rounded-2xl bg-white p-2">
            <div className="grid h-full w-full place-items-center rounded-xl bg-[repeating-conic-gradient(#000_0_25%,#fff_0_50%)] bg-[length:18px_18px] text-3xl">◈</div>
          </div>
          <p className={`mt-3 text-xs ${sub}`}>2. Enter the app's 6-digit code</p>
          <input value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" placeholder="000000" className={`${input} mt-1 text-center text-2xl tracking-[0.4em]`} />
          <button onClick={() => code.length === 6 && setDone(true)} className="mt-4 w-full rounded-xl bg-[#f0b90b] py-3 text-sm font-black text-black">✅ Verify</button>
        </div>
      ) : (
        <div className={`${card} p-5 text-center`}>
          <p className="text-5xl">🎉</p>
          <p className="mt-2 text-lg font-black text-emerald-400">2FA is on!</p>
          <button onClick={() => { setEnabled(true); setDone(false); }} className="mt-4 w-full rounded-xl bg-[#f0b90b] py-3 text-sm font-black text-black">Done</button>
        </div>
      )}
    </Page>
  );
}

export function CexKyc() {
  const { card, sub, input } = useSkin();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ name: "", nid: "", dob: "" });
  const [, setStatus] = useLocal("kyc_status", "none");
  const F = (k: keyof typeof form, ph: string) => (
    <input value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} placeholder={ph} className={`${input} mt-2`} />
  );
  return (
    <Page narrow>
      <PageHead t="🪪 KYC verification" sub="Identity verification — done in 10 minutes" />
      <div className="mb-3 flex gap-1">
        {["Info", "Documents", "Selfie"].map((t, i) => (
          <div key={t} className={`flex-1 rounded-xl py-2 text-center text-[11px] font-black ${step >= i ? "bg-[#f0b90b] text-black" : "bg-white/5 text-slate-500"}`}>{bn(i + 1)}. {t}</div>
        ))}
      </div>
      {step === 0 && (
        <div className={`${card} p-5`}>
          {F("name", "Full name (as on NID)")}
          {F("nid", "NID number (10/17 digits)")}
          {F("dob", "Date of birth (DD/MM/YYYY)")}
          <button onClick={() => form.name.length >= 3 && form.nid.length >= 10 && setStep(1)} className="mt-4 w-full rounded-xl bg-[#f0b90b] py-3 text-sm font-black text-black">➡️ Next</button>
        </div>
      )}
      {step === 1 && (
        <div className={`${card} p-5`}>
          <p className={`text-xs ${sub}`}>Upload front and back photos of your NID (demo)</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {["Front side", "Back side"].map((t) => (
              <button key={t} className="grid h-28 place-items-center rounded-xl border-2 border-dashed border-white/20 text-3xl transition hover:border-[#f0b90b]/60">📷<span className="sr-only">{t}</span></button>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <button onClick={() => setStep(0)} className="flex-1 rounded-xl bg-white/10 py-3 text-sm font-bold">← Back</button>
            <button onClick={() => setStep(2)} className="flex-[2] rounded-xl bg-[#f0b90b] py-3 text-sm font-black text-black">➡️ Next</button>
          </div>
        </div>
      )}
      {step === 2 && (
        <div className={`${card} p-5 text-center`}>
          <p className={`text-xs ${sub}`}>Take a photo of your face — without glasses, in good light (demo)</p>
          <button className="mx-auto mt-3 grid h-36 w-36 place-items-center rounded-full border-2 border-dashed border-white/20 text-5xl">🤳</button>
          <button onClick={() => { setStatus("pending"); setStep(3); }} className="mt-4 w-full rounded-xl bg-[#f0b90b] py-3 text-sm font-black text-black">✅ Submit</button>
        </div>
      )}
      {step === 3 && (
        <div className={`${card} p-5 text-center`}>
          <p className="text-5xl">⏳</p>
          <p className="mt-2 text-lg font-black">Verification in progress...</p>
          <p className={`mt-1 text-xs ${sub}`}>You will hear the result within 10–30 minutes (demo)</p>
        </div>
      )}
    </Page>
  );
}

export function CexKycStatus() {
  const { base } = useDemo();
  const { card, sub } = useSkin();
  const [status, setStatus] = useLocal("kyc_status", "none");
  return (
    <Page narrow>
      <PageHead t="🪪 KYC status" />
      <div className={`${card} p-5 text-center`}>
        {status === "none" && (<><p className="text-5xl">📝</p><p className="mt-2 font-black">You haven't done KYC yet</p>
          <Link href={`${base}/kyc`} className="mt-4 inline-block rounded-xl bg-[#f0b90b] px-8 py-3 text-sm font-black text-black">Start KYC</Link></>)}
        {status === "pending" && (<><p className="text-5xl">⏳</p><p className="mt-2 font-black text-amber-400">Under review</p><p className={`mt-1 text-xs ${sub}`}>Documents under review...</p>
          <button onClick={() => setStatus("verified")} className="mt-3 text-xs underline opacity-60">(Demo: complete verification)</button></>)}
        {status === "verified" && (<><p className="text-5xl">✅</p><p className="mt-2 font-black text-emerald-400">Verified!</p><p className={`mt-1 text-xs ${sub}`}>All features unlocked 🎉</p></>)}
      </div>
    </Page>
  );
}

export function CexSecurity() {
  const { base } = useDemo();
  const { card, sub } = useSkin();
  const [enabled] = useLocal("2fa_on", false);
  return (
    <Page>
      <PageHead t="🛡️ Security settings" />
      <div className="space-y-2">
        <Link href={`${base}/2fa`} className={`${card} flex items-center gap-3 p-4`}>
          <span className="text-2xl">🔐</span>
          <div className="flex-1"><p className="text-sm font-black">Two-factor authentication</p><p className={`text-[11px] ${sub}`}>{enabled ? "✅ On" : "❌ Off — turn on"}</p></div>
          <span className="opacity-40">→</span>
        </Link>
        {[
          ["🔑", "Change password", "Last changed: 30 days ago"],
          ["📱", "Device management", "Logged in on 2 devices"],
          ["📧", "Email verification", "✅ Verified"],
          ["🚨", "Anti-phishing code", "Set a security code for emails"],
          ["📋", "Login history", "See the last 10 logins"],
        ].map(([e, t, d]) => (
          <button key={t} onClick={() => alert("Demo — coming soon")} className={`${card} flex w-full items-center gap-3 p-4 text-left transition hover:border-[#f0b90b]/40`}>
            <span className="text-2xl">{e}</span>
            <div className="flex-1"><p className="text-sm font-black">{t}</p><p className={`text-[11px] ${sub}`}>{d}</p></div>
            <span className="opacity-40">→</span>
          </button>
        ))}
      </div>
    </Page>
  );
}

export function CexApi() {
  const { card, sub, input } = useSkin();
  const [keys, setKeys] = useLocal<{ id: string; name: string; date: number }[]>("api_keys", []);
  const [name, setName] = useState("");
  const [show, setShow] = useState<string | null>(null);
  function create() {
    if (!name.trim()) return;
    const id = `ak_${Math.random().toString(36).slice(2, 10)}`;
    setKeys([{ id, name: name.trim(), date: Date.now() }, ...keys]);
    setName("");
    setShow(id);
  }
  return (
    <Page>
      <PageHead t="🔌 API management" sub="For bots & third-party apps" />
      <div className={`${card} p-4`}>
        <p className="text-sm font-black">＋ New API key</p>
        <div className="mt-2 flex gap-2">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Key name (e.g. trading bot)" className={input} />
          <button onClick={create} className="shrink-0 rounded-xl bg-[#f0b90b] px-5 text-sm font-black text-black">Create</button>
        </div>
        {show && (
          <div className="mt-3 rounded-xl bg-amber-500/10 p-3">
            <p className="text-xs font-bold text-amber-300">⚠️ The secret key is shown only once — copy it now!</p>
            <p className="mt-1 break-all font-mono text-xs text-white">{show}{"x".repeat(24)}</p>
            <button onClick={() => setShow(null)} className="mt-2 text-xs underline opacity-70">Hide</button>
          </div>
        )}
      </div>
      <div className="mt-3 space-y-2">
        {keys.map((k) => (
          <div key={k.id} className={`${card} flex items-center gap-3 p-3`}>
            <span className="text-2xl">🔑</span>
            <div className="flex-1"><p className="text-sm font-bold">{k.name}</p><p className={`font-mono text-[11px] ${sub}`}>{k.id}••••••••</p></div>
            <button onClick={() => setKeys(keys.filter((x) => x.id !== k.id))} className="rounded-lg bg-red-500/15 px-3 py-1.5 text-xs font-bold text-red-400">🗑 Delete</button>
          </div>
        ))}
        {keys.length === 0 && <div className={card}><Empty emoji="🔌" text="No API keys" /></div>}
      </div>
    </Page>
  );
}

/* ================= REFERRAL ================= */

export function CexReferral() {
  const { base } = useDemo();
  const { card, sub } = useSkin();
  return (
    <Page>
      <PageHead t="🎁 Referral programme" sub="Bring friends — earn 40% of their trading fees" />
      <div className="grid gap-2 sm:grid-cols-3">
        <Stat e="💰" v="40%" t="Commission rate" />
        <Stat e="👥" v="12,450" t="Total referrers" />
        <Stat e="🏆" v="$2.4M" t="Bonuses distributed" />
      </div>
      <div className={`${card} mt-3 p-5`}>
        <p className="text-sm font-black">📋 How does it work?</p>
        <ol className={`mt-2 list-decimal space-y-2 pl-5 text-xs ${sub}`}>
          <li>Share your referral link with friends</li>
          <li>When a friend signs up and trades, you earn <b className="text-white">40% commission</b></li>
          <li>Your friend gets a <b className="text-white">100 USDT welcome bonus</b> (demo)</li>
          <li>Commission is added to your wallet automatically every day</li>
        </ol>
        <Link href={`${base}/referral-dash`} className="mt-4 block rounded-xl bg-[#f0b90b] py-3 text-center text-sm font-black text-black">📊 My referral dashboard</Link>
      </div>
    </Page>
  );
}

export function CexReferralDash() {
  const { card, sub, input } = useSkin();
  const [copied, setCopied] = useState(false);
  const link = "https://demo-exchange.com/ref/USER12345";
  return (
    <Page>
      <PageHead t="📊 Referral dashboard" />
      <div className="grid grid-cols-3 gap-2">
        <Stat e="👥" v={bn(24)} t="Total referrals" />
        <Stat e="💰" v="$186" t="Total earnings" />
        <Stat e="📅" v="$12" t="Today's earnings" />
      </div>
      <div className={`${card} mt-3 p-4`}>
        <p className="text-sm font-black">🔗 Your referral link</p>
        <div className="mt-2 flex gap-2">
          <input value={link} readOnly className={`${input} font-mono !text-xs`} />
          <button onClick={() => { navigator.clipboard?.writeText(link).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 1500); }} className="shrink-0 rounded-xl bg-[#f0b90b] px-4 text-sm font-black text-black">{copied ? "✅" : "📋"}</button>
        </div>
        <div className="mt-3 grid grid-cols-4 gap-2">
          {["📘 Facebook", "✈️ Telegram", "💬 WhatsApp", "𝕏 Twitter"].map((s) => (
            <button key={s} onClick={() => alert("Demo — sharing soon")} className="rounded-xl bg-white/5 py-2.5 text-xs font-bold hover:bg-white/10">{s}</button>
          ))}
        </div>
      </div>
      <div className={`${card} mt-3 p-4`}>
        <p className="text-sm font-black">🕘 Recent referrals</p>
        <div className="mt-2 space-y-1.5 text-xs">
          {[["Rahim ***", "11 October", "$8.50"], ["Karim ***", "10 October", "$5.20"], ["Sumi ***", "9 October", "$12.00"]].map(([n, d, a]) => (
            <div key={n} className="flex justify-between rounded-lg bg-white/[0.03] px-3 py-2"><span>{n} <span className={sub}>• {d}</span></span><b className="text-emerald-400">+{a}</b></div>
          ))}
        </div>
      </div>
    </Page>
  );
}

/* ================= LAUNCHPAD ================= */

export function CexLaunchpad() {
  const { base } = useDemo();
  const { card, sub } = useSkin();
  return (
    <Page>
      <PageHead t="🚀 Launchpad" sub="Join new token sales early" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {LAUNCHPADS.map((p) => (
          <Link key={p.id} href={`${base}/launchpad/${p.id}`} className={`${card} block p-5 transition hover:-translate-y-1 hover:border-[#f0b90b]/40`}>
            <div className="flex items-center gap-3">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-[#f0b90b]/15 text-3xl">{p.e}</span>
              <div><p className="font-black">{p.n}</p><p className={`text-[11px] ${sub}`}>Price: {p.price}</p></div>
            </div>
            <p className={`mt-2 text-xs ${sub}`}>{p.desc}</p>
            <div className="mt-3">
              <div className="flex justify-between text-[11px]"><span className={sub}>Goal: {p.goal}</span><b className="text-[#f0b90b]">{bn(p.progress)}%</b></div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-[#f0b90b]" style={{ width: `${p.progress}%` }} /></div>
            </div>
            <p className="mt-2 text-[11px] font-bold text-amber-300">⏳ {p.ends}</p>
          </Link>
        ))}
      </div>
    </Page>
  );
}

export function CexLaunchpadDetail({ id }: { id: string }) {
  const { card, sub, input } = useSkin();
  const p = LAUNCHPADS.find((x) => x.id === id) ?? LAUNCHPADS[0];
  const [amount, setAmount] = useState("");
  const [done, setDone] = useState(false);
  return (
    <Page narrow>
      <PageHead t={`🚀 ${p.n}`} sub="Token sale" />
      <div className={`${card} p-5 text-center`}>
        <p className="text-6xl">{p.e}</p>
        <p className="mt-2 text-xl font-black">{p.n}</p>
        <p className={`mt-1 text-xs ${sub}`}>{p.desc}</p>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          {[["Price", p.price], ["Goal", p.goal], ["Ends", p.ends]].map(([t, v]) => (
            <div key={t} className="rounded-xl bg-white/5 p-2"><p className={`text-[10px] ${sub}`}>{t}</p><p className="text-xs font-black">{v}</p></div>
          ))}
        </div>
        <div className="mt-3">
          <div className="flex justify-between text-[11px]"><span className={sub}>Progress</span><b className="text-[#f0b90b]">{bn(p.progress)}%</b></div>
          <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-[#f0b90b]" style={{ width: `${p.progress}%` }} /></div>
        </div>
        <label className={`mt-4 block text-left text-xs ${sub}`}>Participation amount (USDT)</label>
        <input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" placeholder="Minimum 10 USDT" className={`${input} mt-1`} />
        <button onClick={() => parseFloat(amount) >= 10 && setDone(true)} className="mt-3 w-full rounded-xl bg-[#f0b90b] py-3 text-sm font-black text-black">🎯 Participate</button>
        {done && <p className="mt-2 rounded-xl bg-emerald-500/15 py-2 text-center text-xs font-bold text-emerald-400">✅ You have participated successfully! (Demo)</p>}
      </div>
    </Page>
  );
}

/* ================= EARN / SAVINGS ================= */

export function CexEarn() {
  const { base } = useDemo();
  const { card, sub } = useSkin();
  return (
    <Page>
      <PageHead t="🌱 Earn (staking)" sub="Earn passive returns by holding coins" />
      <div className="mb-3 grid grid-cols-3 gap-2">
        <Stat e="💰" v="$4.2B" t="Total staked" />
        <Stat e="👥" v="2.1M" t="Users" />
        <Stat e="📈" v="9.4%" t="Highest APY" />
      </div>
      <div className="space-y-2">
        {EARN_PRODUCTS.map((p) => (
          <Link key={p.id} href={`${base}/earn/${p.id}`} className={`${card} flex items-center gap-3 p-4 transition hover:border-[#f0b90b]/40`}>
            <span className="grid h-12 w-12 place-items-center rounded-full bg-white/5 text-2xl">{p.e}</span>
            <div className="flex-1"><p className="text-sm font-black">{p.coin} staking</p><p className={`text-[11px] ${sub}`}>{p.type} • minimum {p.min}</p></div>
            <div className="text-right"><p className="text-lg font-black text-emerald-400">{bn(p.apy)}%</p><p className={`text-[10px] ${sub}`}>APY</p></div>
            <span className="opacity-40">→</span>
          </Link>
        ))}
      </div>
    </Page>
  );
}

export function CexEarnDetail({ id }: { id: string }) {
  const { card, sub, input } = useSkin();
  const p = EARN_PRODUCTS.find((x) => x.id === id) ?? EARN_PRODUCTS[0];
  const [amount, setAmount] = useState("");
  const [done, setDone] = useState(false);
  const daily = ((parseFloat(amount) || 0) * p.apy) / 100 / 365;
  return (
    <Page narrow>
      <PageHead t={`🌱 ${p.coin} staking`} sub={`${p.type} • ${bn(p.apy)}% APY`} />
      <div className={`${card} p-5`}>
        <div className="flex items-center gap-3">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-white/5 text-3xl">{p.e}</span>
          <div><p className="text-4xl font-black text-emerald-400">{bn(p.apy)}%</p><p className={`text-xs ${sub}`}>Annual return (APY)</p></div>
        </div>
        <label className={`mt-4 block text-xs ${sub}`}>Stake amount (minimum {p.min})</label>
        <input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" placeholder="0.00" className={`${input} mt-1`} />
        {daily > 0 && <p className="mt-1 text-xs text-emerald-400">📅 Estimated daily return: {daily.toFixed(6)} {p.coin}</p>}
        <div className={`mt-3 space-y-1 text-xs ${sub}`}>
          <div className="flex justify-between"><span>Term</span><b className="text-white">{p.type}</b></div>
          <div className="flex justify-between"><span>Reward distribution</span><b className="text-white">Daily</b></div>
          <div className="flex justify-between"><span>Early redemption</span><b className="text-white">{p.type === "Flexible" ? "Any time" : "At term end"}</b></div>
        </div>
        <button onClick={() => parseFloat(amount) > 0 && setDone(true)} className="mt-4 w-full rounded-xl bg-[#f0b90b] py-3 text-sm font-black text-black">🌱 Stake</button>
        {done && <p className="mt-2 rounded-xl bg-emerald-500/15 py-2 text-center text-xs font-bold text-emerald-400">✅ Staking started! You will earn rewards daily (demo)</p>}
      </div>
    </Page>
  );
}

export function CexSavings() {
  const { card, sub } = useSkin();
  const [tab, setTab] = useState<"flex" | "lock">("flex");
  const rows = EARN_PRODUCTS.filter((p) => (tab === "flex" ? p.type === "Flexible" : p.type !== "Flexible"));
  return (
    <Page>
      <PageHead t="🏦 Savings" sub="Save safely, earn regularly" />
      <div className="mb-3 flex gap-1.5">
        {(["flex", "lock"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`rounded-xl px-5 py-2 text-xs font-black ${tab === t ? "bg-[#f0b90b] text-black" : "bg-white/5 text-slate-400"}`}>{t === "flex" ? "💧 Flexible" : "🔒 Locked"}</button>
        ))}
      </div>
      <div className="space-y-2">
        {rows.map((p) => (
          <div key={p.id} className={`${card} flex items-center gap-3 p-4`}>
            <span className="grid h-12 w-12 place-items-center rounded-full bg-white/5 text-2xl">{p.e}</span>
            <div className="flex-1"><p className="text-sm font-black">{p.coin}</p><p className={`text-[11px] ${sub}`}>{p.type}</p></div>
            <div className="text-right"><p className="text-lg font-black text-emerald-400">{bn(p.apy)}%</p><p className={`text-[10px] ${sub}`}>APY</p></div>
          </div>
        ))}
      </div>
      <p className={`mt-3 text-center text-[11px] ${sub}`}>💡 Flexible Savings can be withdrawn at any time</p>
    </Page>
  );
}

/* ================= NFT ================= */

export function CexNft() {
  const { base } = useDemo();
  const { card, sub, input } = useSkin();
  const [q, setQ] = useState("");
  const list = NFTS.filter((n) => !q || n.n.includes(q));
  return (
    <Page>
      <PageHead t="🎨 NFT Marketplace" sub="Digital art by Bangladeshi artists" />
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="🔍 Search NFTs" className={`${input} mb-3`} />
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {list.map((n) => (
          <Link key={n.id} href={`${base}/nft/${n.id}`} className={`${card} group overflow-hidden transition hover:-translate-y-1 hover:border-[#f0b90b]/40`}>
            <div className="grid h-36 place-items-center bg-gradient-to-br from-[#1a1f2e] to-[#0d1117] text-6xl transition group-hover:scale-110">{n.e}</div>
            <div className="p-3">
              <p className="truncate text-sm font-black">{n.n}</p>
              <p className={`text-[11px] ${sub}`}>🎨 {n.artist}</p>
              <p className="mt-1 text-sm font-black text-[#f0b90b]">{n.price} {n.coin}</p>
            </div>
          </Link>
        ))}
      </div>
    </Page>
  );
}

export function CexNftDetail({ id }: { id: string }) {
  const { card, sub } = useSkin();
  const n = NFTS.find((x) => x.id === id) ?? NFTS[0];
  const [done, setDone] = useState(false);
  const [bid, setBid] = useState("");
  return (
    <Page narrow>
      <PageHead t="🎨 NFT details" />
      <div className={`${card} overflow-hidden`}>
        <div className="grid h-64 place-items-center bg-gradient-to-br from-[#1a1f2e] to-[#0d1117] text-8xl">{n.e}</div>
        <div className="p-5">
          <p className="text-xl font-black">{n.n}</p>
          <p className={`mt-1 text-xs ${sub}`}>🎨 Artist: <b className="text-white">{n.artist}</b> • ✅ Verified</p>
          <div className="mt-3 grid grid-cols-2 gap-2 text-center">
            <div className="rounded-xl bg-white/5 p-3"><p className={`text-[10px] ${sub}`}>Current price</p><p className="text-lg font-black text-[#f0b90b]">{n.price} {n.coin}</p><p className={`text-[10px] ${sub}`}>≈ {fmtBDT(n.price * 3420)} BDT</p></div>
            <div className="rounded-xl bg-white/5 p-3"><p className={`text-[10px] ${sub}`}>Highest bid</p><p className="text-lg font-black">{(n.price * 0.92).toFixed(2)} {n.coin}</p><p className={`text-[10px] ${sub}`}>12 bids</p></div>
          </div>
          <div className="mt-3 flex gap-2">
            <input value={bid} onChange={(e) => setBid(e.target.value)} type="number" placeholder="Bid (ETH)" className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500" />
            <button onClick={() => parseFloat(bid) > 0 && setDone(true)} className="shrink-0 rounded-xl bg-white/10 px-5 text-sm font-black">🔨 Bid</button>
          </div>
          <button onClick={() => setDone(true)} className="mt-2 w-full rounded-xl bg-[#f0b90b] py-3 text-sm font-black text-black">🛒 Buy now</button>
          {done && <p className="mt-2 rounded-xl bg-emerald-500/15 py-2 text-center text-xs font-bold text-emerald-400">✅ Success! The NFT is in your collection (demo)</p>}
        </div>
      </div>
    </Page>
  );
}

/* ================= ANNOUNCEMENTS / SUPPORT / FAQ ================= */

export function CexAnnounce() {
  const { base } = useDemo();
  const { card, sub } = useSkin();
  return (
    <Page>
      <PageHead t="📢 Announcements" sub="Latest platform updates" />
      <div className="space-y-2">
        {ANNOUNCEMENTS.map((a) => (
          <Link key={a.id} href={`${base}/announcement/${a.id}`} className={`${card} block p-4 transition hover:border-[#f0b90b]/40`}>
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#f0b90b]/15 text-xl">📢</span>
              <div><p className="text-sm font-black">{a.t}</p><p className={`mt-0.5 text-[11px] ${sub}`}>{a.d}</p></div>
              <span className="ml-auto shrink-0 opacity-40">→</span>
            </div>
          </Link>
        ))}
      </div>
    </Page>
  );
}

export function CexAnnounceDetail({ id }: { id: string }) {
  const { card, sub } = useSkin();
  const a = ANNOUNCEMENTS.find((x) => x.id === id) ?? ANNOUNCEMENTS[0];
  return (
    <Page narrow>
      <PageHead t="📢 Announcements" />
      <div className={`${card} p-5`}>
        <p className="text-lg font-black">{a.t}</p>
        <p className={`mt-1 text-[11px] ${sub}`}>📅 {a.d}</p>
        <p className="mt-3 text-sm leading-relaxed">{a.body}</p>
      </div>
    </Page>
  );
}

export function CexSupport() {
  const { card, sub, input } = useSkin();
  const [done, setDone] = useState(false);
  const [topic, setTopic] = useState("Trading");
  const [msg, setMsg] = useState("");
  return (
    <Page>
      <PageHead t="🎧 Support Centre" sub="24/7 support" />
      <div className="grid gap-2 sm:grid-cols-3">
        <Stat e="💬" v="24/7" t="Live chat" />
        <Stat e="⚡" v="~5 minutes" t="Average response" />
        <Stat e="😊" v="98%" t="Satisfaction" />
      </div>
      <div className={`${card} mt-3 p-5`}>
        <p className="text-sm font-black">🎫 Open a support ticket</p>
        <label className={`mt-3 block text-xs ${sub}`}>Topic</label>
        <select value={topic} onChange={(e) => setTopic(e.target.value)} className={`${input} mt-1 [&>option]:text-black`}>
          {["Trading", "Deposit/Withdraw", "KYC", "P2P", "Security", "Other"].map((t) => <option key={t}>{t}</option>)}
        </select>
        <label className={`mt-3 block text-xs ${sub}`}>Write details</label>
        <textarea value={msg} onChange={(e) => setMsg(e.target.value)} rows={4} placeholder="Describe your issue in detail..." className={`${input} mt-1`} />
        <button onClick={() => msg.trim().length > 10 && setDone(true)} className="mt-3 w-full rounded-xl bg-[#f0b90b] py-3 text-sm font-black text-black">📨 Send ticket</button>
        {done && <p className="mt-2 rounded-xl bg-emerald-500/15 py-2 text-center text-xs font-bold text-emerald-400">✅ Ticket #SUP{Math.floor(1000 + Math.random() * 9000)} created! We will contact you soon (demo)</p>}
      </div>
      <div className={`${card} mt-3 p-4`}>
        <p className="text-sm font-black">📞 Contact directly</p>
        <p className={`mt-1 text-xs ${sub}`}>Hotline: <b className="text-white">01833402586</b> (9 AM – 10 PM)<br />Email: support@demo-exchange.com</p>
      </div>
    </Page>
  );
}

export function CexFaq() {
  const { card, sub, input } = useSkin();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<number | null>(0);
  const list = FAQS.filter((f) => !q || f.q.includes(q) || f.a.includes(q));
  return (
    <Page>
      <PageHead t="❓ Frequently asked questions" />
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="🔍 Search questions" className={`${input} mb-3`} />
      <div className="space-y-2">
        {list.map((f, i) => (
          <div key={i} className={card}>
            <button onClick={() => setOpen(open === i ? null : i)} className="flex w-full items-center justify-between p-4 text-left">
              <span className="text-sm font-black">{f.q}</span>
              <span className="text-[#f0b90b]">{open === i ? "−" : "+"}</span>
            </button>
            {open === i && <p className={`px-4 pb-4 text-xs leading-relaxed ${sub}`}>{f.a}</p>}
          </div>
        ))}
      </div>
    </Page>
  );
}

/* ================= FEES / API DOCS / LEGAL ================= */

export function CexFees() {
  const { card, sub } = useSkin();
  return (
    <Page>
      <PageHead t="💸 Fee structure" sub="Transparent & lowest fees" />
      <div className={`${card} overflow-hidden`}>
        <p className="border-b border-white/10 p-3 text-sm font-black">📊 Spot trading fees</p>
        {[["Maker", "0.10%", "0.075%"], ["Taker", "0.10%", "0.075%"]].map(([t, s, bnb]) => (
          <div key={t} className="grid grid-cols-3 border-b border-white/5 p-3 text-sm last:border-0">
            <span>{t}</span><span className="text-center font-bold">{s}</span><span className="text-right font-bold text-[#f0b90b]">{bnb} <span className={`text-[10px] ${sub}`}>in BNB</span></span>
          </div>
        ))}
      </div>
      <div className={`${card} mt-3 overflow-hidden`}>
        <p className="border-b border-white/10 p-3 text-sm font-black">⚡ Futures fees</p>
        {[["Maker", "0.02%"], ["Taker", "0.05%"]].map(([t, s]) => (
          <div key={t} className="grid grid-cols-2 border-b border-white/5 p-3 text-sm last:border-0"><span>{t}</span><span className="text-right font-bold">{s}</span></div>
        ))}
      </div>
      <div className={`${card} mt-3 overflow-hidden`}>
        <p className="border-b border-white/10 p-3 text-sm font-black">📥📤 Deposit / Withdraw</p>
        {[["Crypto deposit", "Free"], ["USDT withdrawal (TRC20)", "1 USDT"], ["BTC withdrawal", "0.0005 BTC"], ["Fiat deposit", "Free"]].map(([t, s]) => (
          <div key={t} className="grid grid-cols-2 border-b border-white/5 p-3 text-sm last:border-0"><span>{t}</span><span className="text-right font-bold text-emerald-400">{s}</span></div>
        ))}
      </div>
      <p className={`mt-3 rounded-xl bg-[#f0b90b]/10 p-3 text-center text-xs font-bold text-[#f0b90b]`}>💡 25% off when you pay fees with BNB!</p>
    </Page>
  );
}

export function CexApiDocs() {
  const { card, sub } = useSkin();
  return (
    <Page>
      <PageHead t="📚 API documentation" sub="REST + WebSocket for developers" />
      <div className="space-y-2">
        {[
          ["🔌 REST API", "Spot/futures orders, balances, history — all endpoints", "GET /api/v3/ticker/price"],
          ["📡 WebSocket", "Real-time prices, order book, trade stream", "wss://stream.demo/v1/ws"],
          ["🤖 SDK", "Python, Node.js, PHP — official libraries", "pip install demo-exchange"],
        ].map(([t, d, code]) => (
          <div key={t} className={`${card} p-4`}>
            <p className="text-sm font-black">{t}</p>
            <p className={`mt-1 text-xs ${sub}`}>{d}</p>
            <code className="mt-2 block rounded-lg bg-black/60 p-2 font-mono text-[11px] text-emerald-300">{code}</code>
          </div>
        ))}
      </div>
    </Page>
  );
}

function LegalPage({ t, body }: { t: string; body: string[] }) {
  const { card } = useSkin();
  return (
    <Page narrow>
      <PageHead t={t} />
      <div className={`${card} space-y-3 p-5 text-xs leading-relaxed opacity-80`}>
        {body.map((p, i) => <p key={i}>{p}</p>)}
      </div>
    </Page>
  );
}

export function CexTerms() {
  return <LegalPage t="📜 Terms" body={[
    "1. This platform is a demo — no real crypto or money is traded here.",
    "2. Users must be at least 18 years old.",
    "3. One person may not open more than one account.",
    "4. Accounts may be temporarily suspended for suspicious activity.",
    "5. Crypto trading carries a big risk of loss — trade at your own risk.",
    "6. The platform reserves the right to change these terms at any time.",
  ]} />;
}

export function CexPrivacy() {
  return <LegalPage t="🔒 Privacy policy" body={[
    "1. Your personal information (name, NID, mobile) is used only for KYC verification.",
    "2. Data is not sold to third parties.",
    "3. Passwords are encrypted — we cannot see them.",
    "4. Keeping 2FA on keeps your account extra secure.",
    "5. To delete your data, email support@demo-exchange.com.",
  ]} />;
}

export function CexCareers() {
  const { card, sub } = useSkin();
  const jobs = [
    ["💻", "Senior Blockchain Developer", "Full-time • Dhaka/Remote", "80K–120K BDT"],
    ["🎨", "UI/UX Designer", "Full-time • Remote", "60K–90K BDT"],
    ["📣", "Marketing Manager", "Full-time • Dhaka", "50K–80K BDT"],
    ["🎧", "Customer Support (Bangla)", "Shift • Dhaka", "30K–45K BDT"],
  ];
  return (
    <Page>
      <PageHead t="💼 Careers" sub="Build your future with us" />
      <div className="space-y-2">
        {jobs.map(([e, t, d, s]) => (
          <button key={t} onClick={() => alert("Demo — applications soon")} className={`${card} flex w-full items-center gap-3 p-4 text-left transition hover:border-[#f0b90b]/40`}>
            <span className="text-3xl">{e}</span>
            <div className="flex-1"><p className="text-sm font-black">{t}</p><p className={`text-[11px] ${sub}`}>{d}</p></div>
            <div className="text-right"><p className="text-sm font-black text-[#f0b90b]">{s}</p><p className="text-[11px] text-emerald-400">Apply →</p></div>
          </button>
        ))}
      </div>
    </Page>
  );
}

/* ================= BLOG / ACADEMY ================= */

export function CexBlog() {
  const { base } = useDemo();
  const { card, sub } = useSkin();
  return (
    <Page>
      <PageHead t="📰 Blog" sub="Market analysis & insights" />
      <div className="space-y-2">
        {BLOGS.map((b) => (
          <Link key={b.id} href={`${base}/blog/${b.id}`} className={`${card} flex gap-3 p-4 transition hover:border-[#f0b90b]/40`}>
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[#f0b90b]/15 text-3xl">{b.e}</span>
            <div className="flex-1"><p className="text-sm font-black">{b.t}</p><p className={`mt-1 line-clamp-2 text-xs ${sub}`}>{b.body}</p><p className={`mt-1 text-[10px] ${sub}`}>📅 {b.d} • 5 min read</p></div>
            <span className="self-center opacity-40">→</span>
          </Link>
        ))}
      </div>
    </Page>
  );
}

export function CexBlogDetail({ id }: { id: string }) {
  const { card, sub } = useSkin();
  const b = BLOGS.find((x) => x.id === id) ?? BLOGS[0];
  return (
    <Page narrow>
      <PageHead t="📰 Blog" />
      <div className={`${card} p-5`}>
        <p className="text-5xl">{b.e}</p>
        <p className="mt-2 text-xl font-black">{b.t}</p>
        <p className={`mt-1 text-[11px] ${sub}`}>📅 {b.d} • ✍️ Research team</p>
        <p className="mt-3 text-sm leading-relaxed">{b.body}</p>
        <p className="mt-3 text-sm leading-relaxed opacity-70">Do your own research before investing (DYOR). This article is not financial advice — demo content.</p>
      </div>
    </Page>
  );
}

export function CexAcademy() {
  const { base } = useDemo();
  const { card, sub } = useSkin();
  const [level, setLevel] = useState("All");
  const list = ACADEMY.filter((a) => level === "All" || a.level === level);
  return (
    <Page>
      <PageHead t="🎓 Academy" sub="Learn crypto for free" />
      <div className="mb-3 flex gap-1.5">
        {["All", "Beginner", "Intermediate", "Advanced"].map((l) => (
          <button key={l} onClick={() => setLevel(l)} className={`rounded-xl px-4 py-2 text-xs font-black ${level === l ? "bg-[#f0b90b] text-black" : "bg-white/5 text-slate-400"}`}>{l}</button>
        ))}
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {list.map((a) => (
          <Link key={a.id} href={`${base}/academy/${a.id}`} className={`${card} block p-4 transition hover:border-[#f0b90b]/40`}>
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#f0b90b]/15 text-2xl">{a.e}</span>
              <div><p className="text-sm font-black">{a.t}</p><span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-400">{a.level}</span></div>
            </div>
          </Link>
        ))}
      </div>
    </Page>
  );
}

export function CexAcademyDetail({ id }: { id: string }) {
  const { card, sub } = useSkin();
  const a = ACADEMY.find((x) => x.id === id) ?? ACADEMY[0];
  const [done, setDone] = useLocal(`academy_done_${a.id}`, false);
  return (
    <Page narrow>
      <PageHead t="🎓 Academy" />
      <div className={`${card} p-5`}>
        <p className="text-5xl">{a.e}</p>
        <p className="mt-2 text-xl font-black">{a.t}</p>
        <span className="mt-1 inline-block rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-400">{a.level}</span>
        <p className="mt-3 text-sm leading-relaxed">{a.body}</p>
        <button onClick={() => setDone(!done)} className={`mt-4 w-full rounded-xl py-3 text-sm font-black ${done ? "bg-emerald-500/20 text-emerald-400" : "bg-[#f0b90b] text-black"}`}>
          {done ? "✅ Done!" : "📖 Finished reading — mark as done"}
        </button>
      </div>
    </Page>
  );
}

/* ================= ALERTS / WATCHLIST / PORTFOLIO / TAX / NOTIFS ================= */

export function CexAlerts() {
  const coins = useCexCoins();
  const { card, sub, input } = useSkin();
  const [alerts, setAlerts] = useLocal<{ id: string; coin: string; cond: string; price: number }[]>("alerts", []);
  const [coin, setCoin] = useState("BTC");
  const [cond, setCond] = useState<"above" | "below">("above");
  const [price, setPrice] = useState("");
  function add() {
    const p = parseFloat(price);
    if (!p) return;
    setAlerts([{ id: `al${Date.now()}`, coin, cond, price: p }, ...alerts].slice(0, 20));
    setPrice("");
  }
  return (
    <Page>
      <PageHead t="🔔 Price alerts" sub="Notifications when the price hits your target" />
      <div className={`${card} p-4`}>
        <p className="text-sm font-black">＋ New alert</p>
        <div className="mt-2 grid grid-cols-3 gap-2">
          <select value={coin} onChange={(e) => setCoin(e.target.value)} className={`${input} [&>option]:text-black`}>{coins.map((c) => <option key={c.code} value={c.code}>{c.code}</option>)}</select>
          <select value={cond} onChange={(e) => setCond(e.target.value as any)} className={`${input} [&>option]:text-black`}>
            <option value="above">⬆️ If it goes above</option>
            <option value="below">⬇️ If it falls below</option>
          </select>
          <input value={price} onChange={(e) => setPrice(e.target.value)} type="number" placeholder="Price ($)" className={input} />
        </div>
        <p className={`mt-1 text-[11px] ${sub}`}>Current: ${fmtUSD(coinOf(coin, coins).price)}</p>
        <button onClick={add} className="mt-2 w-full rounded-xl bg-[#f0b90b] py-2.5 text-sm font-black text-black">🔔 Set alert</button>
      </div>
      <div className="mt-3 space-y-2">
        {alerts.map((a) => (
          <div key={a.id} className={`${card} flex items-center gap-3 p-3`}>
            <CoinIcon code={a.coin} size={32} />
            <div className="flex-1"><p className="text-sm font-black">{a.coin}/USDT</p><p className={`text-[11px] ${sub}`}>{a.cond === "above" ? "⬆️ Above" : "⬇️ Below"} ${fmtUSD(a.price)}</p></div>
            <button onClick={() => setAlerts(alerts.filter((x) => x.id !== a.id))} className="text-red-400">🗑</button>
          </div>
        ))}
        {alerts.length === 0 && <div className={card}><Empty emoji="🔔" text="No alerts set" /></div>}
      </div>
    </Page>
  );
}

export function CexWatchlist() {
  const coins = useCexCoins();
  const { card, sub } = useSkin();
  const [list, setList] = useLocal<string[]>("watchlist", ["BTC", "ETH", "SOL"]);
  const [adding, setAdding] = useState(false);
  const rest = coins.filter((c) => !list.includes(c.code));
  return (
    <Page>
      <PageHead t="⭐ Watchlist" sub="Track your favourite coins" />
      <div className="space-y-2">
        {list.map((code) => (
          <div key={code} className={`${card} p-1 pr-2`}><div className="flex items-center"><div className="flex-1"><CoinRow code={code} /></div>
            <button onClick={() => setList(list.filter((c) => c !== code))} className="ml-1 shrink-0 rounded-lg bg-white/5 px-2.5 py-2 text-sm">⭐</button></div></div>
        ))}
        {list.length === 0 && <div className={card}><Empty emoji="⭐" text="Watchlist is empty" /></div>}
      </div>
      <button onClick={() => setAdding(!adding)} className="mt-3 w-full rounded-xl bg-white/10 py-3 text-sm font-black">＋ Add coins</button>
      {adding && (
        <div className="mt-2 grid grid-cols-3 gap-2">
          {rest.map((c) => (
            <button key={c.code} onClick={() => { setList([...list, c.code]); }} className={`${card} p-3 text-center transition hover:border-[#f0b90b]/40`}>
              <p className="text-2xl">{c.e}</p><p className="mt-1 text-xs font-black">{c.code}</p>
            </button>
          ))}
        </div>
      )}
    </Page>
  );
}

export function CexPortfolio() {
  const coins = useCexCoins();
  const { card, sub } = useSkin();
  const [bal] = useCexBalances();
  const rows = Object.entries(bal).map(([code, q]) => ({ code, q, v: q * coinOf(code, coins).price })).filter((r) => r.v > 0.01).sort((a, b) => b.v - a.v);
  const total = rows.reduce((s, r) => s + r.v, 0);
  const R = 70, C = 2 * Math.PI * R;
  let acc = 0;
  const colors = ["#f0b90b", "#0ecb81", "#3b82f6", "#a855f7", "#f6465d", "#14b8a6"];
  return (
    <Page>
      <PageHead t="💼 Portfolio tracker" sub="Asset allocation" />
      <div className={`${card} flex flex-col items-center gap-4 p-5 sm:flex-row`}>
        <div className="relative">
          <svg width="170" height="170" viewBox="0 0 170 170">
            {rows.map((r, i) => {
              const frac = r.v / total;
              const dash = `${frac * C} ${C}`;
              const rot = (acc / total) * 360;
              acc += r.v;
              return <circle key={r.code} cx="85" cy="85" r={R} fill="none" stroke={colors[i % colors.length]} strokeWidth="22" strokeDasharray={dash} transform={`rotate(${rot - 90} 85 85)`} />;
            })}
            <text x="85" y="82" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="900">${fmtUSD(total)}</text>
            <text x="85" y="100" textAnchor="middle" fill="#888" fontSize="10">Total</text>
          </svg>
        </div>
        <div className="w-full flex-1 space-y-1.5">
          {rows.map((r, i) => (
            <div key={r.code} className="flex items-center gap-2 text-xs">
              <span className="h-3 w-3 rounded-full" style={{ background: colors[i % colors.length] }} />
              <b>{r.code}</b>
              <span className={sub}>{bn(r.q.toFixed(4))}</span>
              <b className="ml-auto">${fmtUSD(r.v)}</b>
              <span className={sub}>{bn(((r.v / total) * 100).toFixed(1))}%</span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <Stat e="💵" v={`$${fmtUSD(total)}`} t="Total value" />
        <Stat e="📈" v="+$1,240" t="Total profit (demo)" />
        <Stat e="📊" v="+5.2%" t="Return" />
      </div>
    </Page>
  );
}

export function CexTax() {
  const { card, sub } = useSkin();
  const [year, setYear] = useState("2026");
  const [done, setDone] = useState(false);
  return (
    <Page narrow>
      <PageHead t="🧾 Tax report" sub="Download trading reports" />
      <div className={`${card} p-5`}>
        <label className={`text-xs ${sub}`}>Financial year</label>
        <select value={year} onChange={(e) => setYear(e.target.value)} className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none [&>option]:text-black">
          {["2026", "2025", "2024"].map((y) => <option key={y}>{y}</option>)}
        </select>
        <div className="mt-4 space-y-2 text-sm">
          {[["Total trades", "48"], ["Total profit", "$1,240.50"], ["Total loss", "$320.00"], ["Net profit", "$920.50"]].map(([t, v]) => (
            <div key={t} className="flex justify-between rounded-lg bg-white/[0.03] px-3 py-2"><span className={sub}>{t}</span><b>{t === "Net profit" || t === "Total profit" ? <span className="text-emerald-400">{v}</span> : v}</b></div>
          ))}
        </div>
        <button onClick={() => setDone(true)} className="mt-4 w-full rounded-xl bg-[#f0b90b] py-3 text-sm font-black text-black">📥 Download PDF</button>
        {done && <p className="mt-2 rounded-xl bg-emerald-500/15 py-2 text-center text-xs font-bold text-emerald-400">✅ Report ready! (Demo)</p>}
        <p className={`mt-2 text-center text-[10px] ${sub}`}>💡 Talk to a tax adviser — this is only a calculation</p>
      </div>
    </Page>
  );
}

export function CexNotifs() {
  const { card, sub } = useSkin();
  const [read, setRead] = useLocal<string[]>("notif_read", []);
  const notifs = [
    { id: "n1", e: "📈", t: "BTC passed $97,000!", d: "10 minutes ago", b: "BTC on your watchlist made a new high." },
    { id: "n2", e: "🎁", t: "You received a 100 USDT bonus", d: "2 hours ago", b: "The welcome bonus has been added to your spot wallet." },
    { id: "n3", e: "🚀", t: "New listing: NVC/USDT", d: "5 hours ago", b: "NovaChain is now trading on the spot market." },
    { id: "n4", e: "🌱", t: "Staking reward: 0.0012 ETH", d: "1 day ago", b: "Daily reward from your ETH staking." },
    { id: "n5", e: "⚠️", t: "System upgrade 14 October", d: "2 days ago", b: "Futures trading will be paused 2–4 AM." },
  ];
  return (
    <Page>
      <div className="mb-4 flex items-center justify-between">
        <SectionTitle t="🔔 Notifications" />
        <button onClick={() => setRead(notifs.map((n) => n.id))} className={`text-xs font-bold ${sub} underline`}>Mark all as read</button>
      </div>
      <div className="space-y-2">
        {notifs.map((n) => {
          const isNew = !read.includes(n.id);
          return (
            <button key={n.id} onClick={() => !read.includes(n.id) && setRead([...read, n.id])} className={`${card} flex w-full gap-3 p-4 text-left ${isNew ? "border-[#f0b90b]/40" : "opacity-70"}`}>
              <span className="text-2xl">{n.e}</span>
              <div className="flex-1"><p className="text-sm font-black">{isNew && <span className="mr-1 inline-block h-2 w-2 rounded-full bg-[#f0b90b]" />}{n.t}</p>
                <p className={`mt-0.5 text-xs ${sub}`}>{n.b}</p><p className={`mt-1 text-[10px] ${sub}`}>{n.d}</p></div>
            </button>
          );
        })}
      </div>
    </Page>
  );
}

/* ================= COIN DETAIL ================= */

export function CexCoinDetail({ code }: { code: string }) {
  const coins = useCexCoins();
  const { base } = useDemo();
  const { card, sub } = useSkin();
  const c = coinOf(code, coins);
  const [wl, setWl] = useLocal<string[]>("watchlist", ["BTC", "ETH", "SOL"]);
  const inWl = wl.includes(c.code);
  return (
    <div>
      <TickerTape />
      <Page>
        <Back href={base} label="Home" />
        <div className={`${card} p-5`}>
          <div className="flex items-center gap-3">
            <CoinIcon code={c.code} size={52} />
            <div className="flex-1">
              <p className="text-xl font-black">{c.name}</p>
              <p className={`text-xs ${sub}`}>{c.code}/USDT</p>
            </div>
            <button onClick={() => setWl(inWl ? wl.filter((x) => x !== c.code) : [...wl, c.code])} className={`rounded-xl px-4 py-2 text-sm font-black ${inWl ? "bg-[#f0b90b] text-black" : "bg-white/10"}`}>{inWl ? "⭐ Saved" : "☆ Watchlist"}</button>
          </div>
          <div className="mt-3 flex items-end gap-3">
            <p className="text-3xl font-black">${fmtUSD(c.price)}</p>
            <ChangeBadge v={c.change} big />
          </div>
          <p className={`text-xs ${sub}`}>≈ {fmtBDT(c.price)} BDT</p>
          <div className="mt-4"><TradeChart code={c.code} height={200} /></div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
            {[["24h high", `$${fmtUSD(c.high)}`], ["24h low", `$${fmtUSD(c.low)}`], ["24h volume", c.vol], ["Market cap", `$${fmtUSD(c.price * 19700000)}`]].map(([t, v]) => (
              <div key={t} className="rounded-xl bg-white/[0.03] p-2.5"><p className={`text-[10px] ${sub}`}>{t}</p><p className="text-xs font-black">{v}</p></div>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <Link href={`${base}/trade/${c.code}USDT`} className="rounded-xl bg-[#0ecb81] py-3 text-center text-sm font-black text-white">📊 Trade</Link>
            <Link href={`${base}/convert`} className="rounded-xl bg-white/10 py-3 text-center text-sm font-black">🔄 Convert</Link>
            <Link href={`${base}/earn`} className="rounded-xl bg-white/10 py-3 text-center text-sm font-black">🌱 Earn</Link>
          </div>
        </div>
        <div className={`${card} mt-3 p-5`}>
          <p className="text-sm font-black">ℹ️ About {c.name}</p>
          <p className={`mt-2 text-xs leading-relaxed ${sub}`}>
            {c.code === "BTC" && "Bitcoin is the world's first and largest cryptocurrency — known as digital gold. Maximum supply: 21 million."}
            {c.code === "ETH" && "Ethereum is a smart-contract platform — the heart of DeFi and NFTs."}
            {c.code === "BNB" && "BNB is this exchange's native token — with benefits including 25% off fees."}
            {c.code === "USDT" && "Tether is a dollar-pegged stablecoin — 1 USDT ≈ 1 dollar. The base currency for trading."}
            {!["BTC", "ETH", "BNB", "USDT"].includes(c.code) && `${c.name} is a popular cryptocurrency — tradable on spot, futures and P2P.`}
          </p>
        </div>
      </Page>
    </div>
  );
}
