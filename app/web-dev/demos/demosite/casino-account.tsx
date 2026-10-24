"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { toBnDigits } from "@/lib/format";
import { useDemo } from "./store";
import { Back, Empty, Field, Page, SectionTitle } from "./ui";
import { bn, money, GOLD, useSkin, useBetSlip, PROMOS, BLOG_POSTS, FAQS, fmtTime, type SportId, type CasiMatch } from "./casino-data";

export function CasinoLogin() {
  const { base, store, card } = useSkin();
  const [phone, setPhone] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  if (store.user) return (
    <Page narrow>
      <div className="py-10 text-center">
        <p className="text-5xl">👋</p>
        <p className="mt-2 font-black">You are already logged in</p>
        <Link href={`${base}/account`} className="mt-3 inline-block rounded-xl bg-[#f5c518] px-6 py-2.5 text-sm font-black text-black">👤 Account</Link>
      </div>
    </Page>
  );
  function go() {
    setErr("");
    const e = store.login(phone, pass);
    if (e) setErr(e);
    else window.location.href = base;
  }
  return (
    <Page narrow>
      <Back href={base} label="Home" />
      <div className={`${card} p-6`}>
        <p className="text-center text-5xl">🔑</p>
        <h1 className="mt-2 text-center text-xl font-black">Login</h1>
        <div className="mt-4 space-y-2.5">
          <Field value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="📱 Mobile number (01XXXXXXXXX)" inputMode="numeric" />
          <Field value={pass} onChange={(e) => setPass(e.target.value)} placeholder="🔒 Password" type="password" />
        </div>
        {err && <p className="mt-2 rounded-xl bg-red-500/10 px-3 py-2 text-xs font-bold text-red-300">⚠️ {err}</p>}
        <button onClick={go} className="mt-4 w-full rounded-xl bg-[#f5c518] py-3 font-black text-black">🔓 Log in</button>
        <p className="mt-3 text-center text-xs text-slate-400">No account? <Link href={`${base}/signup`} className="font-bold text-[#f5c518] underline">Sign up</Link> — 5,000 credits bonus!</p>
      </div>
    </Page>
  );
}

export function CasinoSignup() {
  const { base, store, card } = useSkin();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [ok, setOk] = useState(false);
  function go() {
    setErr("");
    const e = store.signup(name, phone, pass);
    if (e) setErr(e);
    else setOk(true);
  }
  if (ok) return (
    <Page narrow>
      <div className="py-10 text-center">
        <p className="text-6xl">🎉</p>
        <h1 className="mt-3 text-2xl font-black text-emerald-400">Welcome!</h1>
        <p className="mt-1 text-sm text-slate-400">🎁 5,000 credits signup bonus added!</p>
        <div className="mt-5 flex justify-center gap-2">
          <Link href={`${base}/casino`} className="rounded-xl bg-[#f5c518] px-5 py-2.5 text-sm font-black text-black">🎰 Start playing</Link>
          <Link href={`${base}/deposit`} className="rounded-xl border border-white/20 px-5 py-2.5 text-sm font-bold">💰 Deposit</Link>
        </div>
      </div>
    </Page>
  );
  return (
    <Page narrow>
      <Back href={base} label="Home" />
      <div className={`${card} p-6`}>
        <p className="text-center text-5xl">🎁</p>
        <h1 className="mt-2 text-center text-xl font-black">Sign up</h1>
        <p className="mt-1 text-center text-xs text-[#f5c518]">5,000 credits welcome bonus free!</p>
        <div className="mt-4 space-y-2.5">
          <Field value={name} onChange={(e) => setName(e.target.value)} placeholder="👤 Your name" />
          <Field value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="📱 Mobile number (01XXXXXXXXX)" inputMode="numeric" />
          <Field value={pass} onChange={(e) => setPass(e.target.value)} placeholder="🔒 Password (at least 4 characters)" type="password" />
        </div>
        {err && <p className="mt-2 rounded-xl bg-red-500/10 px-3 py-2 text-xs font-bold text-red-300">⚠️ {err}</p>}
        <button onClick={go} className="mt-4 w-full rounded-xl bg-[#f5c518] py-3 font-black text-black">✨ Open account</button>
        <p className="mt-3 text-center text-xs text-slate-400">Already have an account? <Link href={`${base}/login`} className="font-bold text-[#f5c518] underline">Log in</Link></p>
        <p className="mt-2 text-center text-[10px] text-slate-500">18+ • Play responsibly</p>
      </div>
    </Page>
  );
}

export function CasinoWallet() {
  const { base, store, card, sub } = useSkin();
  const [amt, setAmt] = useState("");
  const [msg, setMsg] = useState("");
  function quickTopup() {
    const v = parseInt(amt);
    if (!v || v < 10) { setMsg("Minimum 10 credits"); return; }
    store.topUp(v);
    setMsg(`✅ ${money(v)} demo balance added`);
    setAmt("");
  }
  return (
    <Page>
      <Back href={base} label="Home" />
      <SectionTitle t="👛 Wallet" />
      <div className="rounded-3xl border border-[#f5c518]/30 bg-gradient-to-br from-[#1a1405] to-[#0b1120] p-6 text-center">
        <p className={`text-xs ${sub}`}>Total balance</p>
        <p className="mt-1 text-4xl font-black text-[#f5c518]">{money(store.wallet)}</p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Link href={`${base}/deposit`} className="rounded-xl bg-[#f5c518] py-3 text-sm font-black text-black">💰 Deposit</Link>
          <Link href={`${base}/withdraw`} className="rounded-xl border border-white/20 py-3 text-sm font-black">💸 Withdraw</Link>
        </div>
      </div>
      <div className={`${card} mt-3 p-4`}>
        <p className="text-sm font-black">⚡ Quick demo top-up</p>
        <p className={`mt-0.5 text-[11px] ${sub}`}>Get demo balance free (not real money)</p>
        <div className="mt-2 flex gap-2">
          <input value={amt} onChange={(e) => setAmt(e.target.value.replace(/\D/g, ""))} inputMode="numeric" placeholder="Amount in credits"
            className="flex-1 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-white outline-none placeholder:text-slate-500" />
          <button onClick={quickTopup} className="rounded-xl bg-emerald-500 px-5 font-black text-white">＋</button>
        </div>
        <div className="mt-2 flex gap-1.5">
          {[500, 1000, 5000].map((v) => (
            <button key={v} onClick={() => { store.topUp(v); setMsg(`✅ ${money(v)} added`); }} className="flex-1 rounded-lg bg-white/5 py-1.5 text-xs font-bold hover:bg-white/10">＋{bn(v)}</button>
          ))}
        </div>
        {msg && <p className="mt-2 text-xs font-bold text-emerald-300">{msg}</p>}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Link href={`${base}/transactions`} className={`${card} p-4 text-center text-sm font-bold hover:border-[#f5c518]/50`}>📜<br />Transaction history</Link>
        <Link href={`${base}/bet-history`} className={`${card} p-4 text-center text-sm font-bold hover:border-[#f5c518]/50`}>🧾<br />Bet history</Link>
      </div>
    </Page>
  );
}

export function DepositHome() {
  const { base, card, sub } = useSkin();
  const methods = [
    { h: "/deposit/bkash", e: "🩷", t: "bKash", d: "Instant • Free of charge" },
    { h: "/deposit/nagad", e: "🧡", t: "Nagad", d: "Instant • Free of charge" },
    { h: "/deposit/rocket", e: "💜", t: "Rocket", d: "Instant • Free of charge" },
    { h: "/deposit/card", e: "💳", t: "Card", d: "Visa/Mastercard" },
  ];
  return (
    <Page narrow>
      <Back href={`${base}/wallet`} label="Wallet" />
      <SectionTitle t="💰 Deposit" sub="Choose a method" />
      <div className="space-y-2.5">
        {methods.map((m) => (
          <Link key={m.h} href={`${base}${m.h}`} className={`${card} flex items-center gap-3 p-4 transition hover:border-[#f5c518]/50`}>
            <span className="text-4xl">{m.e}</span>
            <div className="flex-1"><p className="font-black">{m.t}</p><p className={`text-xs ${sub}`}>{m.d}</p></div>
            <span className="text-slate-500">→</span>
          </Link>
        ))}
      </div>
      <p className="mt-3 text-center text-[11px] text-slate-500">🔒 Demo payment — no real money will be charged</p>
    </Page>
  );
}

function DepositForm({ method, emoji, number, color }: { method: string; emoji: string; number: string; color: string }) {
  const { base, store, card, sub } = useSkin();
  const [amt, setAmt] = useState("");
  const [trx, setTrx] = useState("");
  const [err, setErr] = useState("");
  const [ok, setOk] = useState(false);
  function submit() {
    setErr("");
    const v = parseInt(amt);
    if (!v || v < 100) return setErr("Deposit at least 100 credits");
    if (trx.trim().length < 6) return setErr("Enter a correct TrxID");
    store.placeDeposit({ amount: v, method, trxId: trx.trim() });
    store.topUp(v); // demo: instant credit
    setOk(true);
  }
  if (ok) return (
    <Page narrow>
      <div className="py-10 text-center">
        <p className="text-6xl">{emoji}</p>
        <h1 className="mt-3 text-2xl font-black text-emerald-400">Deposit successful!</h1>
        <p className={`mt-1 text-sm ${sub}`}>{money(parseInt(amt))} added to your balance</p>
        <Link href={`${base}/wallet`} className="mt-5 inline-block rounded-xl px-6 py-2.5 text-sm font-black text-black" style={{ background: color }}>👛 Go to wallet</Link>
      </div>
    </Page>
  );
  return (
    <Page narrow>
      <Back href={`${base}/deposit`} label="Deposit" />
      <div className={`${card} p-5`}>
        <p className="text-center text-5xl">{emoji}</p>
        <h1 className="mt-2 text-center text-lg font-black">{method} deposit</h1>
        <div className="mt-4 rounded-2xl p-4 text-center" style={{ background: `${color}18`, border: `1px solid ${color}55` }}>
          <p className={`text-xs ${sub}`}>Send money to this number</p>
          <p className="mt-1 text-2xl font-black tracking-widest" style={{ color }}>{number}</p>
          <p className={`mt-1 text-[11px] ${sub}`}>👆 Tap to copy</p>
        </div>
        <div className="mt-4 space-y-2.5">
          <input value={amt} onChange={(e) => setAmt(e.target.value.replace(/\D/g, ""))} inputMode="numeric" placeholder="💰 Amount in credits (minimum 100)"
            className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-500" />
          <input value={trx} onChange={(e) => setTrx(e.target.value)} placeholder="🧾 TrxID (transaction ID)"
            className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-500" />
        </div>
        {err && <p className="mt-2 rounded-xl bg-red-500/10 px-3 py-2 text-xs font-bold text-red-300">⚠️ {err}</p>}
        <button onClick={submit} className="mt-4 w-full rounded-xl py-3.5 font-black text-black" style={{ background: color }}>✅ Submit</button>
        <p className="mt-2 text-center text-[11px] text-slate-500">Demo — balance is added without TrxID verification</p>
      </div>
    </Page>
  );
}

export function DepositBkash() { return <DepositForm method="bKash" emoji="🩷" number="017XX-XXXXXX" color="#e2136e" />; }
export function DepositNagad() { return <DepositForm method="Nagad" emoji="🧡" number="018XX-XXXXXX" color="#f6921e" />; }
export function DepositRocket() { return <DepositForm method="Rocket" emoji="💜" number="019XX-XXXXXX" color="#8c3494" />; }
export function DepositCard() {
  const { base, store, card, sub } = useSkin();
  const [amt, setAmt] = useState("");
  const [num, setNum] = useState("");
  const [err, setErr] = useState("");
  const [ok, setOk] = useState(false);
  function submit() {
    setErr("");
    const v = parseInt(amt);
    if (!v || v < 100) return setErr("Minimum 100 credits");
    if (num.replace(/\D/g, "").length < 12) return setErr("Enter a correct card number");
    store.placeDeposit({ amount: v, method: "Card", trxId: "CARD-" + num.replace(/\D/g, "").slice(-4) });
    store.topUp(v);
    setOk(true);
  }
  if (ok) return (
    <Page narrow>
      <div className="py-10 text-center">
        <p className="text-6xl">💳</p>
        <h1 className="mt-3 text-2xl font-black text-emerald-400">Payment successful!</h1>
        <p className={`mt-1 text-sm ${sub}`}>{money(parseInt(amt))} added</p>
        <Link href={`${base}/wallet`} className="mt-5 inline-block rounded-xl bg-[#f5c518] px-6 py-2.5 text-sm font-black text-black">👛 Go to wallet</Link>
      </div>
    </Page>
  );
  return (
    <Page narrow>
      <Back href={`${base}/deposit`} label="Deposit" />
      <div className={`${card} p-5`}>
        <p className="text-center text-5xl">💳</p>
        <h1 className="mt-2 text-center text-lg font-black">Card payment</h1>
        <div className="mt-4 space-y-2.5">
          <input value={amt} onChange={(e) => setAmt(e.target.value.replace(/\D/g, ""))} inputMode="numeric" placeholder="💰 Amount in credits"
            className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-500" />
          <input value={num} onChange={(e) => setNum(e.target.value)} inputMode="numeric" placeholder="💳 Card number"
            className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-500" />
          <div className="grid grid-cols-2 gap-2.5">
            <input placeholder="MM/YY" className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-500" />
            <input placeholder="CVV" inputMode="numeric" className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-500" />
          </div>
        </div>
        {err && <p className="mt-2 rounded-xl bg-red-500/10 px-3 py-2 text-xs font-bold text-red-300">⚠️ {err}</p>}
        <button onClick={submit} className="mt-4 w-full rounded-xl bg-[#f5c518] py-3.5 font-black text-black">🔒 Pay (demo)</button>
      </div>
    </Page>
  );
}

export function Withdraw() {
  const { base, store, card, sub } = useSkin();
  const [amt, setAmt] = useState("");
  const [method, setMethod] = useState("bKash");
  const [num, setNum] = useState("");
  const [err, setErr] = useState("");
  const [ok, setOk] = useState(false);
  function submit() {
    setErr("");
    const v = parseInt(amt);
    if (!v || v < 500) return setErr("Withdraw at least 500 credits");
    if (v > store.wallet) return setErr("Insufficient balance");
    if (!/^01[3-9]\d{8}$/.test(num.trim())) return setErr("Enter a correct mobile number");
    store.payWithWallet(v, `💸 Withdraw (${method})`);
    setOk(true);
  }
  if (ok) return (
    <Page narrow>
      <div className="py-10 text-center">
        <p className="text-6xl">💸</p>
        <h1 className="mt-3 text-2xl font-black text-emerald-400">Request received!</h1>
        <p className={`mt-1 text-sm ${sub}`}>{money(parseInt(amt))} — will be sent to {method} ({num}) (demo)</p>
        <Link href={`${base}/transactions`} className="mt-5 inline-block rounded-xl bg-[#f5c518] px-6 py-2.5 text-sm font-black text-black">📜 See transactions</Link>
      </div>
    </Page>
  );
  return (
    <Page narrow>
      <Back href={`${base}/wallet`} label="Wallet" />
      <SectionTitle t="💸 Withdraw" sub={`Balance: ${money(store.wallet)}`} />
      <div className={`${card} space-y-2.5 p-5`}>
        <div className="grid grid-cols-3 gap-1.5">
          {["bKash", "Nagad", "Rocket"].map((m) => (
            <button key={m} onClick={() => setMethod(m)} className={`rounded-xl py-2.5 text-sm font-black ${method === m ? "bg-[#f5c518] text-black" : "bg-white/5"}`}>{m}</button>
          ))}
        </div>
        <input value={amt} onChange={(e) => setAmt(e.target.value.replace(/\D/g, ""))} inputMode="numeric" placeholder="💰 Amount in credits (minimum 500)"
          className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-500" />
        <input value={num} onChange={(e) => setNum(e.target.value)} inputMode="numeric" placeholder="📱 Account number (01XXXXXXXXX)"
          className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-500" />
        {err && <p className="rounded-xl bg-red-500/10 px-3 py-2 text-xs font-bold text-red-300">⚠️ {err}</p>}
        <button onClick={submit} className="w-full rounded-xl bg-[#f5c518] py-3.5 font-black text-black">💸 Withdraw request</button>
        <p className={`text-center text-[11px] ${sub}`}>⏱️ Processed instantly in the demo</p>
      </div>
    </Page>
  );
}

export function Transactions() {
  const { base, store, card, sub } = useSkin();
  return (
    <Page>
      <Back href={`${base}/wallet`} label="Wallet" />
      <SectionTitle t="📜 Transaction History" sub={`${bn(store.txs.length)} transactions`} />
      {store.txs.length === 0 ? <Empty emoji="📜" text="No transactions yet" /> : (
        <div className="space-y-1.5">
          {store.txs.map((t, i) => (
            <div key={i} className={`${card} flex items-center justify-between p-3 text-sm`}>
              <div><p className="font-bold">{t.label}</p><p className={`text-[11px] ${sub}`}>{fmtTime(t.date)}</p></div>
              <b className={t.amount >= 0 ? "text-emerald-300" : "text-red-300"}>{t.amount >= 0 ? "+" : ""}{money(t.amount)}</b>
            </div>
          ))}
        </div>
      )}
      {store.deposits.length > 0 && (<>
        <p className="mb-2 mt-5 text-sm font-black text-[#f5c518]">💰 Deposit requests</p>
        <div className="space-y-1.5">
          {store.deposits.map((d) => (
            <div key={d.id} className={`${card} flex items-center justify-between p-3 text-sm`}>
              <div><p className="font-bold">{d.method} — {d.trxId}</p><p className={`text-[11px] ${sub}`}>{fmtTime(d.date)}</p></div>
              <div className="text-right"><b className="text-emerald-300">+{money(d.amount)}</b><p className={`text-[11px] ${sub}`}>{d.status}</p></div>
            </div>
          ))}
        </div>
      </>)}
    </Page>
  );
}

export function Promotions() {
  const { base, card, sub } = useSkin();
  return (
    <Page>
      <Back href={base} label="Home" />
      <SectionTitle t="🎁 Promotions" sub={`${bn(PROMOS.length)} offers`} />
      <div className="grid gap-3 sm:grid-cols-2">
        {PROMOS.map((p) => (
          <Link key={p.id} href={`${base}/promotions/${p.id}`} className={`${card} block overflow-hidden transition hover:border-[#f5c518]/50`}>
            <div className="bg-gradient-to-r from-[#1a1405] to-[#2a1f08] p-5 text-center">
              <p className="text-5xl">{p.e}</p>
              <p className="mt-2 font-black text-[#f5c518]">{p.t}</p>
            </div>
            <p className={`p-4 text-sm ${sub}`}>{p.d}</p>
          </Link>
        ))}
      </div>
    </Page>
  );
}

export function PromotionDetail({ id }: { id: string }) {
  const { base, card, sub } = useSkin();
  const p = PROMOS.find((x) => x.id === id);
  if (!p) return <Page narrow><Empty emoji="🔍" text="Offer not found" /></Page>;
  return (
    <Page narrow>
      <Back href={`${base}/promotions`} label="Promotions" />
      <div className={`${card} overflow-hidden`}>
        <div className="bg-gradient-to-r from-[#1a1405] to-[#2a1f08] p-8 text-center">
          <p className="text-6xl">{p.e}</p>
          <h1 className="mt-2 text-xl font-black text-[#f5c518]">{p.t}</h1>
        </div>
        <div className="p-5">
          <p className="text-sm leading-relaxed text-slate-300">{p.body}</p>
          <p className={`mt-3 text-[11px] ${sub}`}>📋 Terms apply • 18+ • Play responsibly</p>
          <Link href={`${base}/deposit`} className="mt-4 block w-full rounded-xl bg-[#f5c518] py-3 text-center font-black text-black">💰 Deposit to claim the offer</Link>
        </div>
      </div>
    </Page>
  );
}

const VIP_TIERS = [
  { n: "Bronze", e: "🥉", pts: "0", cb: "2%", perks: ["Weekly cashback", "Birthday bonus"] },
  { n: "Silver", e: "🥈", pts: "10,000", cb: "5%", perks: ["All Bronze benefits", "Free spins every month", "Faster withdrawals"] },
  { n: "Gold", e: "🥇", pts: "50,000", cb: "8%", perks: ["All Silver benefits", "20% reload bonus", "Personal manager"] },
  { n: "Platinum", e: "💠", pts: "200,000", cb: "12%", perks: ["All Gold benefits", "Exclusive tournaments", "Higher bet limits"] },
  { n: "Diamond", e: "💎", pts: "1,000,000", cb: "15%", perks: ["All Platinum benefits", "Luxury gifts", "VIP event invitations"] },
];

export function VipProgram() {
  const { base, card, sub, store } = useSkin();
  const pts = Math.round(store.wallet / 10) + store.gameHistory.length * 50;
  return (
    <Page>
      <Back href={base} label="Home" />
      <SectionTitle t="👑 VIP Programme" sub="Play, collect points, level up" />
      <div className="rounded-3xl border border-[#f5c518]/30 bg-gradient-to-br from-[#1a1405] to-[#0b1120] p-6 text-center">
        <p className="text-5xl">🥉</p>
        <p className="mt-2 text-lg font-black">Your tier: Bronze</p>
        <p className="mt-1 text-2xl font-black text-[#f5c518]">{bn(pts.toLocaleString("en-US"))} points</p>
        <div className="mx-auto mt-3 h-2.5 max-w-sm overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-[#f5c518]" style={{ width: `${Math.min(100, pts / 100)}%` }} />
        </div>
        <p className={`mt-1 text-[11px] ${sub}`}>{bn((10000 - pts).toLocaleString("en-US"))} more points to Silver</p>
      </div>
      <div className="mt-4 flex justify-center">
        <Link href={`${base}/vip/levels`} className="rounded-xl bg-[#f5c518] px-6 py-2.5 text-sm font-black text-black">📊 See all levels</Link>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        {[["🎮", "Points per bet"], ["💸", "Cashback"], ["🎁", "Exclusive bonuses"]].map(([e, t]) => (
          <div key={t} className={`${card} p-3`}><p className="text-2xl">{e}</p><p className="mt-1 text-[11px]">{t}</p></div>
        ))}
      </div>
    </Page>
  );
}

export function VipLevels() {
  const { base, card, sub } = useSkin();
  return (
    <Page>
      <Back href={`${base}/vip`} label="VIP" />
      <SectionTitle t="📊 VIP Levels" sub={`${bn(VIP_TIERS.length)} tiers`} />
      <div className="space-y-3">
        {VIP_TIERS.map((v, i) => (
          <div key={v.n} className={`${card} p-4 ${i === 0 ? "border-[#f5c518]/40" : ""}`}>
            <div className="flex items-center justify-between">
              <p className="text-lg font-black">{v.e} {v.n} {i === 0 && <span className="ml-1 rounded-full bg-[#f5c518]/20 px-2 py-0.5 text-[10px] text-[#f5c518]">Current</span>}</p>
              <div className="text-right"><p className="font-black text-emerald-300">{v.cb}</p><p className={`text-[10px] ${sub}`}>Cashback</p></div>
            </div>
            <p className={`mt-1 text-[11px] ${sub}`}>Required: {bn(v.pts)} points</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {v.perks.map((p) => <span key={p} className="rounded-full bg-white/5 px-2.5 py-1 text-[11px]">✨ {p}</span>)}
            </div>
          </div>
        ))}
      </div>
    </Page>
  );
}

export function Referral() {
  const { base, card, sub, store } = useSkin();
  const [copied, setCopied] = useState(false);
  const code = store.user ? `CP${store.user.phone.slice(-4)}` : "CP-DEMO";
  const link = `${base}/signup?ref=${code}`;
  return (
    <Page narrow>
      <Back href={base} label="Home" />
      <SectionTitle t="🤝 Referral" sub="Bring friends, win bonuses" />
      <div className={`${card} p-6 text-center`}>
        <p className="text-5xl">🎁</p>
        <p className="mt-2 font-black"><span className="text-[#f5c518]">500 credits</span> bonus per referral!</p>
        <p className={`mt-1 text-xs ${sub}`}>Bonus when a friend signs up and makes their first deposit</p>
        <div className="mt-4 rounded-2xl bg-black/40 p-4">
          <p className={`text-[11px] ${sub}`}>Your referral code</p>
          <p className="mt-1 text-3xl font-black tracking-widest text-[#f5c518]">{code}</p>
        </div>
        <button onClick={() => { try { navigator.clipboard.writeText(link); } catch {} setCopied(true); setTimeout(() => setCopied(false), 1500); }}
          className="mt-3 w-full rounded-xl bg-[#f5c518] py-3 font-black text-black">
          {copied ? "✅ Copied!" : "📋 Copy link"}
        </button>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          {[["0", "Total referrals"], ["0", "Pending"], ["0 credits", "Rewards"]].map(([v, t]) => (
            <div key={t} className="rounded-xl bg-white/5 p-3"><p className="font-black text-[#f5c518]">{v}</p><p className={`text-[10px] ${sub}`}>{t}</p></div>
          ))}
        </div>
      </div>
    </Page>
  );
}

export function CasinoAccount() {
  const { base, store, card, sub } = useSkin();
  if (!store.user) return (
    <Page narrow>
      <Back href={base} label="Home" />
      <div className={`${card} p-6 text-center`}>
        <p className="text-5xl">👤</p>
        <p className="mt-2 font-black">Log in</p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Link href={`${base}/login`} className="rounded-xl bg-[#f5c518] py-2.5 text-sm font-black text-black">🔑 Log in</Link>
          <Link href={`${base}/signup`} className="rounded-xl border border-white/20 py-2.5 text-sm font-bold">✨ Sign up</Link>
        </div>
      </div>
    </Page>
  );
  const u = store.user;
  const totalRounds = store.gameHistory.length;
  const gameWins = store.gameHistory.filter((g) => g.win > g.bet).length;
  const gamePL = store.gameHistory.reduce((a, g) => a + (g.win - g.bet), 0);
  const betWins = store.bets.filter((b) => b.status === "Won").length;
  const xp = totalRounds * 120 + store.bets.length * 350 + gameWins * 200;
  const levels = [
    { n: "Bronze", e: "🥉", at: 0, cash: "2%" },
    { n: "Silver", e: "🥈", at: 2000, cash: "4%" },
    { n: "Gold", e: "🥇", at: 6000, cash: "6%" },
    { n: "Platinum", e: "💠", at: 15000, cash: "8%" },
    { n: "Diamond", e: "💎", at: 40000, cash: "12%" },
  ];
  let li = 0;
  for (let i = 0; i < levels.length; i++) if (xp >= levels[i].at) li = i;
  const lvl = levels[li];
  const next = levels[li + 1];
  const pct = next ? Math.min(100, Math.round(((xp - lvl.at) / (next.at - lvl.at)) * 100)) : 100;
  const ring = 2 * Math.PI * 30;
  const menu = [
    [`${base}/wallet`, "👛", "Wallet", money(store.wallet)],
    [`${base}/deposit`, "💳", "Deposit", ""],
    [`${base}/withdraw`, "💸", "Withdraw", ""],
    [`${base}/my-bets`, "🧾", "My bets", `${bn(store.bets.length)}`],
    [`${base}/transactions`, "📜", "Transaction history", ""],
    [`${base}/casino/history`, "🎮", "Game history", `${bn(totalRounds)}`],
    [`${base}/games`, "🎰", "Game lobby", "2,000+"],
    [`${base}/promotions`, "🎁", "Promotions", ""],
    [`${base}/vip`, "👑", "VIP", lvl.n],
    [`${base}/referral`, "🤝", "Referral", "500 bonus"],
    [`${base}/account/settings`, "⚙️", "Settings", ""],
    [`${base}/account/kyc`, "🪪", "KYC Verification", ""],
    [`${base}/responsible-gaming`, "🛡️", "Responsible Gaming", ""],
    [`${base}/support`, "🎧", "Support", "24/7"],
  ] as const;
  return (
    <Page>
      <Back href={base} label="Home" />
      {/* profile hero with level ring */}
      <div className="relative overflow-hidden rounded-3xl border border-[#f5c518]/25 bg-gradient-to-br from-[#1a1405] via-[#141033] to-[#0b1120] p-5">
        <div className="pointer-events-none absolute -right-8 -top-8 text-[130px] opacity-[0.07]">👑</div>
        <div className="relative flex items-center gap-4">
          <div className="relative h-[76px] w-[76px] shrink-0">
            <svg viewBox="0 0 76 76" className="h-full w-full -rotate-90">
              <circle cx="38" cy="38" r="30" fill="none" stroke="#ffffff1a" strokeWidth="6" />
              <circle cx="38" cy="38" r="30" fill="none" stroke="#f5c518" strokeWidth="6" strokeLinecap="round"
                strokeDasharray={ring} strokeDashoffset={ring - (ring * pct) / 100} />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-3xl">{lvl.e}</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-lg font-black">{u.name}</p>
            <p className={`text-xs ${sub}`}>📱 {u.phone}</p>
            <p className="mt-1 inline-block rounded-full bg-[#f5c518]/15 px-2.5 py-0.5 text-[11px] font-black text-[#f5c518]">{lvl.e} {lvl.n} level • Cashback {lvl.cash}</p>
          </div>
          <button onClick={() => { store.logout(); window.location.href = base; }} className="rounded-xl bg-white/10 px-3 py-1.5 text-xs font-bold">🚪 Log out</button>
        </div>
        <div className="relative mt-4">
          <div className="flex justify-between text-[11px]">
            <span className={sub}>XP: <b className="text-white">{bn(xp.toLocaleString("en-IN"))}</b></span>
            <span className={sub}>{next ? `Next level (${next.n}) — ${bn((next.at - xp).toLocaleString("en-US"))} more XP` : "Max level! 🏆"}</span>
          </div>
          <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-[#f5c518] transition-all duration-700" style={{ width: `${pct}%` }} />
          </div>
        </div>
        {/* quick actions */}
        <div className="relative mt-4 grid grid-cols-4 gap-2">
          {[[`${base}/deposit`, "💳", "Deposit"], [`${base}/withdraw`, "💸", "Withdraw"], [`${base}/games`, "🎰", "Games"], [`${base}/promotions`, "🎁", "Bonuses"]].map(([h, e, t]) => (
            <Link key={t} href={h} className="rounded-2xl bg-black/35 py-2.5 text-center transition active:scale-95">
              <p className="text-xl">{e}</p><p className="mt-0.5 text-[11px] font-black">{t}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* stats */}
      <div className="mt-3 grid grid-cols-4 gap-2 text-center">
        <div className={`${card} p-3`}><p className="font-black text-[#f5c518]">{money(store.wallet)}</p><p className={`mt-0.5 text-[10px] ${sub}`}>Balance</p></div>
        <div className={`${card} p-3`}><p className="font-black">{bn(totalRounds)}</p><p className={`mt-0.5 text-[10px] ${sub}`}>Game rounds</p></div>
        <div className={`${card} p-3`}><p className="font-black text-emerald-300">{bn(gameWins + betWins)}</p><p className={`mt-0.5 text-[10px] ${sub}`}>Total wins</p></div>
        <div className={`${card} p-3`}><p className={`font-black ${gamePL >= 0 ? "text-emerald-300" : "text-red-300"}`}>{gamePL >= 0 ? "+" : "−"}{money(Math.abs(gamePL)).replace(" credits", "")}</p><p className={`mt-0.5 text-[10px] ${sub}`}>Game profit/loss</p></div>
      </div>

      <div className="mt-3 grid gap-1.5 sm:grid-cols-2">
        {menu.map(([h, e, t, v]) => (
          <Link key={t} href={h} className={`${card} flex items-center gap-3 p-3.5 transition hover:border-[#f5c518]/50 active:scale-[0.99]`}>
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/5 text-xl">{e}</span>
            <span className="flex-1 text-sm font-bold">{t}</span>
            {v && <span className="text-xs font-bold text-[#f5c518]">{v}</span>}
            <span className="text-slate-500">›</span>
          </Link>
        ))}
      </div>
    </Page>
  );
}

export function AccountSettings() {
  const { base, store, card, sub } = useSkin();
  const [name, setName] = useState(store.user?.name ?? "");
  const [saved, setSaved] = useState(false);
  const [notif, setNotif] = useState(true);
  const [sound, setSound] = useState(true);
  return (
    <Page narrow>
      <Back href={`${base}/account`} label="Account" />
      <SectionTitle t="⚙️ Settings" />
      <div className={`${card} space-y-3 p-4`}>
        <div>
          <p className="mb-1 text-xs font-bold text-slate-400">Name</p>
          <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-white outline-none" />
        </div>
        <div>
          <p className="mb-1 text-xs font-bold text-slate-400">Mobile</p>
          <p className="rounded-xl bg-white/5 px-4 py-2.5 text-sm text-slate-400">{store.user?.phone ?? "—"}</p>
        </div>
        {[
          ["🔔 Push notifications", notif, setNotif],
          ["🔊 Game sound", sound, setSound],
        ].map(([t, v, set]) => (
          <div key={t as string} className="flex items-center justify-between rounded-xl bg-white/[0.04] px-4 py-3">
            <span className="text-sm font-bold">{t as string}</span>
            <button onClick={() => (set as (b: boolean) => void)(!(v as boolean))}
              className={`h-7 w-12 rounded-full transition ${v ? "bg-[#f5c518]" : "bg-white/15"}`}>
              <span className={`block h-5 w-5 rounded-full bg-white transition ${v ? "ml-6" : "ml-1"}`} />
            </button>
          </div>
        ))}
        <button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 1500); }} className="w-full rounded-xl bg-[#f5c518] py-3 font-black text-black">
          {saved ? "✅ Saved!" : "💾 Save"}
        </button>
        <p className={`text-center text-[11px] ${sub}`}>Demo — settings are saved in your browser</p>
      </div>
    </Page>
  );
}

export function Kyc() {
  const { base, card, sub } = useSkin();
  const [step, setStep] = useState(0);
  const steps = ["📷 NID/passport photo", "🤳 Selfie", "✅ Done"];
  return (
    <Page narrow>
      <Back href={`${base}/account`} label="Account" />
      <SectionTitle t="🪪 KYC Verification" sub="Identity check (demo)" />
      <div className={`${card} p-5 text-center`}>
        <div className="mb-4 flex justify-center gap-2">
          {steps.map((s, i) => (
            <span key={s} className={`rounded-full px-3 py-1 text-[11px] font-bold ${i <= step ? "bg-[#f5c518] text-black" : "bg-white/10 text-slate-400"}`}>{s}</span>
          ))}
        </div>
        {step < 2 ? (
          <>
            <div className="mx-auto flex h-40 max-w-xs items-center justify-center rounded-2xl border-2 border-dashed border-white/20 text-5xl">
              {step === 0 ? "📷" : "🤳"}
            </div>
            <p className={`mt-2 text-xs ${sub}`}>{step === 0 ? "Take a photo of the front of your NID" : "Take a clear selfie of your face"}</p>
            <button onClick={() => setStep(step + 1)} className="mt-4 w-full rounded-xl bg-[#f5c518] py-3 font-black text-black">📤 Upload (demo)</button>
          </>
        ) : (
          <>
            <p className="text-6xl">✅</p>
            <p className="mt-2 font-black text-emerald-300">Verification complete!</p>
            <p className={`mt-1 text-xs ${sub}`}>Approved instantly in the demo</p>
          </>
        )}
      </div>
    </Page>
  );
}

export function ResponsibleGaming() {
  const { base, card } = useSkin();
  const [limit, setLimit] = useState("1000");
  const [saved, setSaved] = useState(false);
  return (
    <Page narrow>
      <Back href={base} label="Home" />
      <SectionTitle t="🛡️ Responsible Gaming" />
      <div className={`${card} p-5 text-sm leading-relaxed text-slate-300`}>
        <p>🎮 Play is for entertainment — not a way to earn. Follow these principles:</p>
        <ul className="mt-3 space-y-2">
          {["💰 Set a budget — never bet more than you can afford to lose", "⏰ Set a time limit", "😤 Don't raise your bets in anger after a loss", "🚫 Not for under-18s", "🆘 If it feels like a problem, take a break"].map((t) => (
            <li key={t} className="rounded-xl bg-white/[0.04] px-3 py-2">{t}</li>
          ))}
        </ul>
      </div>
      <div className={`${card} mt-3 p-4`}>
        <p className="text-sm font-black">📉 Daily bet limit (demo)</p>
        <div className="mt-2 flex gap-2">
          <input value={limit} onChange={(e) => setLimit(e.target.value.replace(/\D/g, ""))} inputMode="numeric"
            className="flex-1 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-white outline-none" />
          <button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 1500); }} className="rounded-xl bg-[#f5c518] px-5 font-black text-black">{saved ? "✅" : "Set"}</button>
        </div>
      </div>
    </Page>
  );
}

/* ============================== INFO & SUPPORT ============================== */

export function CasinoAbout() {
  const { base, def, card, sub } = useSkin();
  return (
    <Page>
      <Back href={base} label="Home" />
      <SectionTitle t="ℹ️ About us" />
      <div className="rounded-3xl border border-[#f5c518]/25 bg-gradient-to-br from-[#1a1405] to-[#0b1120] p-6 text-center">
        <p className="text-6xl">{def.logoEmoji}</p>
        <h1 className="mt-2 text-2xl font-black">{def.name}</h1>
        <p className="mt-1 text-sm text-[#f5c518]">{def.type}</p>
      </div>
      <div className={`${card} mt-3 p-5 text-sm leading-relaxed text-slate-300`}>
        <p>{def.about}</p>
        <p className="mt-3">We are a demo of a modern gaming platform built for players in Bangladesh — live sports betting, 500+ casino games, desi games including Teen Patti and Andar Bahar, and fast deposit-withdrawal features.</p>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
        {[["🎮", "500+", "Games"], ["👥", "50K+", "Players"], ["⚡", "5 minutes", "Payments"], ["🎧", "24/7", "Support"]].map(([e, v, t]) => (
          <div key={t} className={`${card} p-4`}><p className="text-2xl">{e}</p><p className="mt-1 font-black text-[#f5c518]">{v}</p><p className={`text-[11px] ${sub}`}>{t}</p></div>
        ))}
      </div>
      <div className={`${card} mt-3 border-amber-500/30 bg-amber-500/5 p-4 text-center text-xs text-amber-200`}>
        ⚠️ This is a demo website — all balances and games are virtual, not real money.
      </div>
    </Page>
  );
}

export function CasinoContact() {
  const { base, def, card, sub } = useSkin();
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");
  const [sent, setSent] = useState(false);
  return (
    <Page narrow>
      <Back href={base} label="Home" />
      <SectionTitle t="📞 Contact" />
      <div className={`${card} p-5`}>
        <div className="space-y-2 text-sm">
          <p>📱 <b className="text-[#f5c518]">{def.contact}</b></p>
          <p>📍 {def.address}</p>
          <p>🕐 {def.hours}</p>
          <p>✉️ support@{def.slug}.com</p>
        </div>
        <a href={`https://wa.me/8801833402586?text=${encodeURIComponent("Hello! I need help")}`} target="_blank" rel="noreferrer"
          className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 font-black text-white">
          💬 Message us on WhatsApp
        </a>
      </div>
      <div className={`${card} mt-3 p-5`}>
        <p className="mb-3 font-black">✉️ Send a message</p>
        {sent ? <p className="py-6 text-center font-black text-emerald-300">✅ Message sent! We will get in touch soon.</p> : (
          <>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name"
              className="mb-2 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-white outline-none placeholder:text-slate-500" />
            <textarea value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Your message..." rows={4}
              className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-white outline-none placeholder:text-slate-500" />
            <button onClick={() => { if (name.trim() && msg.trim()) setSent(true); }} className="mt-3 w-full rounded-xl bg-[#f5c518] py-3 font-black text-black">📨 Send</button>
          </>
        )}
        <p className={`mt-2 text-center text-[11px] ${sub}`}>Demo form — in reality it would go to the support team</p>
      </div>
    </Page>
  );
}

export function CasinoFaq() {
  const { base, card, sub } = useSkin();
  const [open, setOpen] = useState<number | null>(0);
  const [q, setQ] = useState("");
  const list = FAQS.filter((f) => !q || f.q.includes(q) || f.a.includes(q));
  return (
    <Page narrow>
      <Back href={base} label="Home" />
      <SectionTitle t="❓ Frequently Asked Questions" />
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="🔍 Search questions..."
        className="mb-3 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white outline-none placeholder:text-slate-500" />
      <div className="space-y-2">
        {list.map((f, i) => (
          <div key={f.q} className={`${card} overflow-hidden`}>
            <button onClick={() => setOpen(open === i ? null : i)} className="flex w-full items-center justify-between p-4 text-left text-sm font-bold">
              {f.q}<span className="text-[#f5c518]">{open === i ? "−" : "+"}</span>
            </button>
            {open === i && <p className={`px-4 pb-4 text-sm ${sub}`}>{f.a}</p>}
          </div>
        ))}
        {list.length === 0 && <Empty emoji="🔍" text="Question not found" />}
      </div>
    </Page>
  );
}

export function Terms() {
  const { base, card } = useSkin();
  const secs = [
    ["1. General", "By using this platform you agree to these terms. This is a demo website — all transactions are virtual."],
    ["2. Age limit", "The platform is prohibited for under-18s."],
    ["3. Account", "One person may open one account. Accounts with false information may be closed."],
    ["4. Bet settlement", "Bets are settled on official results. Bets on cancelled events are refundable."],
    ["5. Bonuses", "All bonuses carry wagering conditions — withdrawals are not possible until the conditions are met."],
    ["6. Responsible gaming", "Use bet limits to avoid addiction. Contact support if you have a problem."],
  ];
  return (
    <Page narrow>
      <Back href={base} label="Home" />
      <SectionTitle t="📜 Terms & Conditions" sub="Last updated: October 2026" />
      <div className="space-y-2.5">
        {secs.map(([t, d]) => (
          <div key={t} className={`${card} p-4`}><p className="font-black text-[#f5c518]">{t}</p><p className="mt-1 text-sm text-slate-300">{d}</p></div>
        ))}
      </div>
    </Page>
  );
}

export function Privacy() {
  const { base, card } = useSkin();
  const secs = [
    ["🔐 Data collection", "We only store the information needed for your account (name, mobile). In the demo, all data stays in your browser."],
    ["🎯 Use of data", "Data is used for account management, transaction history and support."],
    ["🚫 Third parties", "Your data is never sold to third parties."],
    ["🍪 Cookies", "Local storage is used to remember your login session and preferences."],
    ["🗑️ Delete data", "To delete your account, contact support."],
  ];
  return (
    <Page narrow>
      <Back href={base} label="Home" />
      <SectionTitle t="🔒 Privacy Policy" />
      <div className="space-y-2.5">
        {secs.map(([t, d]) => (
          <div key={t} className={`${card} p-4`}><p className="font-black text-[#f5c518]">{t}</p><p className="mt-1 text-sm text-slate-300">{d}</p></div>
        ))}
      </div>
    </Page>
  );
}

export function Announcements() {
  const { base, card, sub } = useSkin();
  const items = [
    { t: "🎉 New game: Jet Flight!", d: "Fly high and catch big wins — live now", time: "2 hours ago" },
    { t: "⚽ BPL Special Boost", d: "15% extra on multi bets in BPL matches", time: "1 day ago" },
    { t: "🔧 Maintenance at 3 AM", d: "Games will be down for 30 minutes", time: "2 days ago" },
    { t: "👑 VIP Diamond launched", d: "New top tier — 15% cashback", time: "1 week ago" },
  ];
  return (
    <Page narrow>
      <Back href={base} label="Home" />
      <SectionTitle t="📢 Announcements" />
      <div className="space-y-2">
        {items.map((a) => (
          <div key={a.t} className={`${card} p-4`}>
            <p className="font-black">{a.t}</p>
            <p className={`mt-1 text-sm ${sub}`}>{a.d}</p>
            <p className="mt-1 text-[11px] text-slate-500">{a.time}</p>
          </div>
        ))}
      </div>
    </Page>
  );
}

export function Blog() {
  const { base, card, sub } = useSkin();
  const [cat, setCat] = useState("All");
  const cats = ["All", "Strategy", "Preview", "Guide"];
  const list = BLOG_POSTS.filter((b) => cat === "All" || b.c === cat);
  return (
    <Page>
      <Back href={base} label="Home" />
      <SectionTitle t="📰 Blog" sub="Strategies, previews & guides" />
      <div className="mb-3 flex gap-1.5">
        {cats.map((c) => (
          <button key={c} onClick={() => setCat(c)} className={`rounded-full px-4 py-1.5 text-xs font-black ${cat === c ? "bg-[#f5c518] text-black" : "bg-white/5 text-slate-300"}`}>{c}</button>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {list.map((b) => (
          <Link key={b.id} href={`${base}/blog/${b.id}`} className={`${card} block p-5 transition hover:border-[#f5c518]/50`}>
            <p className="text-4xl">{b.e}</p>
            <p className="mt-2 font-black">{b.t}</p>
            <div className="mt-2 flex justify-between text-[11px]"><span className="rounded-full bg-[#f5c518]/15 px-2 py-0.5 text-[#f5c518]">{b.c}</span><span className={sub}>{b.time}</span></div>
          </Link>
        ))}
      </div>
    </Page>
  );
}

export function BlogDetail({ id }: { id: string }) {
  const { base, card, sub } = useSkin();
  const b = BLOG_POSTS.find((x) => x.id === id);
  if (!b) return <Page narrow><Empty emoji="🔍" text="Article not found" /></Page>;
  const related = BLOG_POSTS.filter((x) => x.id !== id).slice(0, 2);
  return (
    <Page narrow>
      <Back href={`${base}/blog`} label="Blog" />
      <div className={`${card} p-6`}>
        <p className="text-5xl">{b.e}</p>
        <h1 className="mt-2 text-xl font-black">{b.t}</h1>
        <p className={`mt-1 text-xs ${sub}`}>{b.c} • {b.time}</p>
        <p className="mt-4 text-sm leading-relaxed text-slate-300">{b.body}</p>
        <p className="mt-4 rounded-xl bg-amber-500/10 p-3 text-[11px] text-amber-200">⚠️ Demo content — play responsibly, 18+</p>
      </div>
      <p className="mb-2 mt-5 text-sm font-black text-[#f5c518]">📚 Read more</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {related.map((r) => (
          <Link key={r.id} href={`${base}/blog/${r.id}`} className={`${card} block p-4`}>
            <p className="text-3xl">{r.e}</p><p className="mt-1 text-sm font-bold">{r.t}</p>
          </Link>
        ))}
      </div>
    </Page>
  );
}

export function SupportCenter() {
  const { base, card, sub } = useSkin();
  const [q, setQ] = useState("");
  const topics = [
    ["💰", "Deposit & Withdraw", "Rules for adding and taking out credits"],
    ["🧾", "Betting", "Placing bets, settlement, odds"],
    ["🎰", "Game issues", "What to do if a game freezes"],
    ["🎁", "Bonuses", "Bonus terms and claims"],
    ["👤", "Account", "Login, password, KYC"],
    ["🛡️", "Security", "Account protection"],
  ].filter(([e, t, d]) => !q || t.includes(q) || d.includes(q));
  return (
    <Page>
      <Back href={base} label="Home" />
      <SectionTitle t="🎧 Support Centre" sub="24/7 help (demo)" />
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="🔍 Search issues..."
        className="mb-3 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white outline-none placeholder:text-slate-500" />
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {topics.map(([e, t, d]) => (
          <Link key={t} href={`${base}/faq`} className={`${card} block p-4 text-center transition hover:border-[#f5c518]/50`}>
            <p className="text-3xl">{e}</p><p className="mt-1 text-sm font-black">{t}</p><p className={`mt-0.5 text-[11px] ${sub}`}>{d}</p>
          </Link>
        ))}
      </div>
      <div className={`${card} mt-4 p-5 text-center`}>
        <p className="font-black">Still no solution?</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Link href={`${base}/contact`} className="rounded-xl bg-[#f5c518] py-2.5 text-sm font-black text-black">💬 Live chat</Link>
          <a href="https://wa.me/8801833402586" target="_blank" rel="noreferrer" className="rounded-xl bg-emerald-500 py-2.5 text-sm font-black text-white">📱 WhatsApp</a>
        </div>
      </div>
    </Page>
  );
}
