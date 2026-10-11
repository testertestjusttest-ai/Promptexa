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
        <p className="mt-2 font-black">ইতিমধ্যে লগইন আছেন</p>
        <Link href={`${base}/account`} className="mt-3 inline-block rounded-xl bg-[#f5c518] px-6 py-2.5 text-sm font-black text-black">👤 অ্যাকাউন্ট</Link>
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
      <Back href={base} label="হোম" />
      <div className={`${card} p-6`}>
        <p className="text-center text-5xl">🔑</p>
        <h1 className="mt-2 text-center text-xl font-black">লগইন</h1>
        <div className="mt-4 space-y-2.5">
          <Field value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="📱 মোবাইল নম্বর (01XXXXXXXXX)" inputMode="numeric" />
          <Field value={pass} onChange={(e) => setPass(e.target.value)} placeholder="🔒 পাসওয়ার্ড" type="password" />
        </div>
        {err && <p className="mt-2 rounded-xl bg-red-500/10 px-3 py-2 text-xs font-bold text-red-300">⚠️ {err}</p>}
        <button onClick={go} className="mt-4 w-full rounded-xl bg-[#f5c518] py-3 font-black text-black">🔓 লগইন করুন</button>
        <p className="mt-3 text-center text-xs text-slate-400">অ্যাকাউন্ট নেই? <Link href={`${base}/signup`} className="font-bold text-[#f5c518] underline">সাইন আপ করুন</Link> — ৫,০০০ টাকা বোনাস!</p>
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
        <h1 className="mt-3 text-2xl font-black text-emerald-400">স্বাগতম!</h1>
        <p className="mt-1 text-sm text-slate-400">🎁 ৫,০০০ টাকা সাইনআপ বোনাস যোগ হয়েছে!</p>
        <div className="mt-5 flex justify-center gap-2">
          <Link href={`${base}/casino`} className="rounded-xl bg-[#f5c518] px-5 py-2.5 text-sm font-black text-black">🎰 খেলা শুরু</Link>
          <Link href={`${base}/deposit`} className="rounded-xl border border-white/20 px-5 py-2.5 text-sm font-bold">💰 ডিপোজিট</Link>
        </div>
      </div>
    </Page>
  );
  return (
    <Page narrow>
      <Back href={base} label="হোম" />
      <div className={`${card} p-6`}>
        <p className="text-center text-5xl">🎁</p>
        <h1 className="mt-2 text-center text-xl font-black">সাইন আপ</h1>
        <p className="mt-1 text-center text-xs text-[#f5c518]">৫,০০০ টাকা ওয়েলকাম বোনাস ফ্রি!</p>
        <div className="mt-4 space-y-2.5">
          <Field value={name} onChange={(e) => setName(e.target.value)} placeholder="👤 আপনার নাম" />
          <Field value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="📱 মোবাইল নম্বর (01XXXXXXXXX)" inputMode="numeric" />
          <Field value={pass} onChange={(e) => setPass(e.target.value)} placeholder="🔒 পাসওয়ার্ড (কমপক্ষে ৪ অক্ষর)" type="password" />
        </div>
        {err && <p className="mt-2 rounded-xl bg-red-500/10 px-3 py-2 text-xs font-bold text-red-300">⚠️ {err}</p>}
        <button onClick={go} className="mt-4 w-full rounded-xl bg-[#f5c518] py-3 font-black text-black">✨ অ্যাকাউন্ট খুলুন</button>
        <p className="mt-3 text-center text-xs text-slate-400">অ্যাকাউন্ট আছে? <Link href={`${base}/login`} className="font-bold text-[#f5c518] underline">লগইন করুন</Link></p>
        <p className="mt-2 text-center text-[10px] text-slate-500">১৮+ • দায়িত্বশীলভাবে খেলুন</p>
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
    if (!v || v < 10) { setMsg("কমপক্ষে ১০ টাকা"); return; }
    store.topUp(v);
    setMsg(`✅ ${money(v)} ডেমো ব্যালেন্স যোগ হয়েছে`);
    setAmt("");
  }
  return (
    <Page>
      <Back href={base} label="হোম" />
      <SectionTitle t="👛 ওয়ালেট" />
      <div className="rounded-3xl border border-[#f5c518]/30 bg-gradient-to-br from-[#1a1405] to-[#0b1120] p-6 text-center">
        <p className={`text-xs ${sub}`}>মোট ব্যালেন্স</p>
        <p className="mt-1 text-4xl font-black text-[#f5c518]">{money(store.wallet)}</p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Link href={`${base}/deposit`} className="rounded-xl bg-[#f5c518] py-3 text-sm font-black text-black">💰 ডিপোজিট</Link>
          <Link href={`${base}/withdraw`} className="rounded-xl border border-white/20 py-3 text-sm font-black">💸 উইথড্র</Link>
        </div>
      </div>
      <div className={`${card} mt-3 p-4`}>
        <p className="text-sm font-black">⚡ কুইক ডেমো টপ-আপ</p>
        <p className={`mt-0.5 text-[11px] ${sub}`}>ডেমো ব্যালেন্স ফ্রিতে নিন (আসল টাকা নয়)</p>
        <div className="mt-2 flex gap-2">
          <input value={amt} onChange={(e) => setAmt(e.target.value.replace(/\D/g, ""))} inputMode="numeric" placeholder="টাকার পরিমাণ"
            className="flex-1 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-white outline-none placeholder:text-slate-500" />
          <button onClick={quickTopup} className="rounded-xl bg-emerald-500 px-5 font-black text-white">＋</button>
        </div>
        <div className="mt-2 flex gap-1.5">
          {[500, 1000, 5000].map((v) => (
            <button key={v} onClick={() => { store.topUp(v); setMsg(`✅ ${money(v)} যোগ হয়েছে`); }} className="flex-1 rounded-lg bg-white/5 py-1.5 text-xs font-bold hover:bg-white/10">＋{bn(v)}</button>
          ))}
        </div>
        {msg && <p className="mt-2 text-xs font-bold text-emerald-300">{msg}</p>}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Link href={`${base}/transactions`} className={`${card} p-4 text-center text-sm font-bold hover:border-[#f5c518]/50`}>📜<br />লেনদেন হিস্ট্রি</Link>
        <Link href={`${base}/bet-history`} className={`${card} p-4 text-center text-sm font-bold hover:border-[#f5c518]/50`}>🧾<br />বাজির হিস্ট্রি</Link>
      </div>
    </Page>
  );
}

export function DepositHome() {
  const { base, card, sub } = useSkin();
  const methods = [
    { h: "/deposit/bkash", e: "🩷", t: "বিকাশ", d: "ইনস্ট্যান্ট • চার্জ ফ্রি" },
    { h: "/deposit/nagad", e: "🧡", t: "নগদ", d: "ইনস্ট্যান্ট • চার্জ ফ্রি" },
    { h: "/deposit/rocket", e: "💜", t: "রকেট", d: "ইনস্ট্যান্ট • চার্জ ফ্রি" },
    { h: "/deposit/card", e: "💳", t: "কার্ড", d: "ভিসা/মাস্টারকার্ড" },
  ];
  return (
    <Page narrow>
      <Back href={`${base}/wallet`} label="ওয়ালেট" />
      <SectionTitle t="💰 ডিপোজিট" sub="মাধ্যম বেছে নিন" />
      <div className="space-y-2.5">
        {methods.map((m) => (
          <Link key={m.h} href={`${base}${m.h}`} className={`${card} flex items-center gap-3 p-4 transition hover:border-[#f5c518]/50`}>
            <span className="text-4xl">{m.e}</span>
            <div className="flex-1"><p className="font-black">{m.t}</p><p className={`text-xs ${sub}`}>{m.d}</p></div>
            <span className="text-slate-500">→</span>
          </Link>
        ))}
      </div>
      <p className="mt-3 text-center text-[11px] text-slate-500">🔒 ডেমো পেমেন্ট — আসল টাকা কাটা হবে না</p>
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
    if (!v || v < 100) return setErr("কমপক্ষে ১০০ টাকা ডিপোজিট করুন");
    if (trx.trim().length < 6) return setErr("সঠিক TrxID দিন");
    store.placeDeposit({ amount: v, method, trxId: trx.trim() });
    store.topUp(v); // demo: instant credit
    setOk(true);
  }
  if (ok) return (
    <Page narrow>
      <div className="py-10 text-center">
        <p className="text-6xl">{emoji}</p>
        <h1 className="mt-3 text-2xl font-black text-emerald-400">ডিপোজিট সফল!</h1>
        <p className={`mt-1 text-sm ${sub}`}>{money(parseInt(amt))} ব্যালেন্সে যোগ হয়েছে</p>
        <Link href={`${base}/wallet`} className="mt-5 inline-block rounded-xl px-6 py-2.5 text-sm font-black text-black" style={{ background: color }}>👛 ওয়ালেটে যান</Link>
      </div>
    </Page>
  );
  return (
    <Page narrow>
      <Back href={`${base}/deposit`} label="ডিপোজিট" />
      <div className={`${card} p-5`}>
        <p className="text-center text-5xl">{emoji}</p>
        <h1 className="mt-2 text-center text-lg font-black">{method} ডিপোজিট</h1>
        <div className="mt-4 rounded-2xl p-4 text-center" style={{ background: `${color}18`, border: `1px solid ${color}55` }}>
          <p className={`text-xs ${sub}`}>এই নম্বরে সেন্ড মানি করুন</p>
          <p className="mt-1 text-2xl font-black tracking-widest" style={{ color }}>{number}</p>
          <p className={`mt-1 text-[11px] ${sub}`}>👆 ট্যাপ করে কপি করুন</p>
        </div>
        <div className="mt-4 space-y-2.5">
          <input value={amt} onChange={(e) => setAmt(e.target.value.replace(/\D/g, ""))} inputMode="numeric" placeholder="💰 টাকার পরিমাণ (কমপক্ষে ১০০)"
            className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-500" />
          <input value={trx} onChange={(e) => setTrx(e.target.value)} placeholder="🧾 TrxID (লেনদেন আইডি)"
            className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-500" />
        </div>
        {err && <p className="mt-2 rounded-xl bg-red-500/10 px-3 py-2 text-xs font-bold text-red-300">⚠️ {err}</p>}
        <button onClick={submit} className="mt-4 w-full rounded-xl py-3.5 font-black text-black" style={{ background: color }}>✅ সাবমিট করুন</button>
        <p className="mt-2 text-center text-[11px] text-slate-500">ডেমো — TrxID যাচাই ছাড়াই ব্যালেন্স যোগ হবে</p>
      </div>
    </Page>
  );
}

export function DepositBkash() { return <DepositForm method="বিকাশ" emoji="🩷" number="০১৭XX-XXXXXX" color="#e2136e" />; }
export function DepositNagad() { return <DepositForm method="নগদ" emoji="🧡" number="০১৮XX-XXXXXX" color="#f6921e" />; }
export function DepositRocket() { return <DepositForm method="রকেট" emoji="💜" number="০১৯XX-XXXXXX" color="#8c3494" />; }
export function DepositCard() {
  const { base, store, card, sub } = useSkin();
  const [amt, setAmt] = useState("");
  const [num, setNum] = useState("");
  const [err, setErr] = useState("");
  const [ok, setOk] = useState(false);
  function submit() {
    setErr("");
    const v = parseInt(amt);
    if (!v || v < 100) return setErr("কমপক্ষে ১০০ টাকা");
    if (num.replace(/\D/g, "").length < 12) return setErr("সঠিক কার্ড নম্বর দিন");
    store.placeDeposit({ amount: v, method: "কার্ড", trxId: "CARD-" + num.replace(/\D/g, "").slice(-4) });
    store.topUp(v);
    setOk(true);
  }
  if (ok) return (
    <Page narrow>
      <div className="py-10 text-center">
        <p className="text-6xl">💳</p>
        <h1 className="mt-3 text-2xl font-black text-emerald-400">পেমেন্ট সফল!</h1>
        <p className={`mt-1 text-sm ${sub}`}>{money(parseInt(amt))} যোগ হয়েছে</p>
        <Link href={`${base}/wallet`} className="mt-5 inline-block rounded-xl bg-[#f5c518] px-6 py-2.5 text-sm font-black text-black">👛 ওয়ালেটে যান</Link>
      </div>
    </Page>
  );
  return (
    <Page narrow>
      <Back href={`${base}/deposit`} label="ডিপোজিট" />
      <div className={`${card} p-5`}>
        <p className="text-center text-5xl">💳</p>
        <h1 className="mt-2 text-center text-lg font-black">কার্ড পেমেন্ট</h1>
        <div className="mt-4 space-y-2.5">
          <input value={amt} onChange={(e) => setAmt(e.target.value.replace(/\D/g, ""))} inputMode="numeric" placeholder="💰 টাকার পরিমাণ"
            className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-500" />
          <input value={num} onChange={(e) => setNum(e.target.value)} inputMode="numeric" placeholder="💳 কার্ড নম্বর"
            className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-500" />
          <div className="grid grid-cols-2 gap-2.5">
            <input placeholder="MM/YY" className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-500" />
            <input placeholder="CVV" inputMode="numeric" className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-500" />
          </div>
        </div>
        {err && <p className="mt-2 rounded-xl bg-red-500/10 px-3 py-2 text-xs font-bold text-red-300">⚠️ {err}</p>}
        <button onClick={submit} className="mt-4 w-full rounded-xl bg-[#f5c518] py-3.5 font-black text-black">🔒 পে করুন (ডেমো)</button>
      </div>
    </Page>
  );
}

export function Withdraw() {
  const { base, store, card, sub } = useSkin();
  const [amt, setAmt] = useState("");
  const [method, setMethod] = useState("বিকাশ");
  const [num, setNum] = useState("");
  const [err, setErr] = useState("");
  const [ok, setOk] = useState(false);
  function submit() {
    setErr("");
    const v = parseInt(amt);
    if (!v || v < 500) return setErr("কমপক্ষে ৫০০ টাকা উইথড্র করুন");
    if (v > store.wallet) return setErr("ব্যালেন্স অপর্যাপ্ত");
    if (!/^01[3-9]\d{8}$/.test(num.trim())) return setErr("সঠিক মোবাইল নম্বর দিন");
    store.payWithWallet(v, `💸 উইথড্র (${method})`);
    setOk(true);
  }
  if (ok) return (
    <Page narrow>
      <div className="py-10 text-center">
        <p className="text-6xl">💸</p>
        <h1 className="mt-3 text-2xl font-black text-emerald-400">রিকোয়েস্ট গৃহীত!</h1>
        <p className={`mt-1 text-sm ${sub}`}>{money(parseInt(amt))} — {method} ({num}) এ পাঠানো হবে (ডেমো)</p>
        <Link href={`${base}/transactions`} className="mt-5 inline-block rounded-xl bg-[#f5c518] px-6 py-2.5 text-sm font-black text-black">📜 লেনদেন দেখুন</Link>
      </div>
    </Page>
  );
  return (
    <Page narrow>
      <Back href={`${base}/wallet`} label="ওয়ালেট" />
      <SectionTitle t="💸 উইথড্র" sub={`ব্যালেন্স: ${money(store.wallet)}`} />
      <div className={`${card} space-y-2.5 p-5`}>
        <div className="grid grid-cols-3 gap-1.5">
          {["বিকাশ", "নগদ", "রকেট"].map((m) => (
            <button key={m} onClick={() => setMethod(m)} className={`rounded-xl py-2.5 text-sm font-black ${method === m ? "bg-[#f5c518] text-black" : "bg-white/5"}`}>{m}</button>
          ))}
        </div>
        <input value={amt} onChange={(e) => setAmt(e.target.value.replace(/\D/g, ""))} inputMode="numeric" placeholder="💰 টাকার পরিমাণ (কমপক্ষে ৫০০)"
          className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-500" />
        <input value={num} onChange={(e) => setNum(e.target.value)} inputMode="numeric" placeholder="📱 অ্যাকাউন্ট নম্বর (01XXXXXXXXX)"
          className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-500" />
        {err && <p className="rounded-xl bg-red-500/10 px-3 py-2 text-xs font-bold text-red-300">⚠️ {err}</p>}
        <button onClick={submit} className="w-full rounded-xl bg-[#f5c518] py-3.5 font-black text-black">💸 উইথড্র রিকোয়েস্ট</button>
        <p className={`text-center text-[11px] ${sub}`}>⏱️ ডেমোতে সাথে সাথে প্রসেস হয়</p>
      </div>
    </Page>
  );
}

export function Transactions() {
  const { base, store, card, sub } = useSkin();
  return (
    <Page>
      <Back href={`${base}/wallet`} label="ওয়ালেট" />
      <SectionTitle t="📜 লেনদেন হিস্ট্রি" sub={`${bn(store.txs.length)}টি লেনদেন`} />
      {store.txs.length === 0 ? <Empty emoji="📜" text="এখনো লেনদেন নেই" /> : (
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
        <p className="mb-2 mt-5 text-sm font-black text-[#f5c518]">💰 ডিপোজিট রিকোয়েস্ট</p>
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
      <Back href={base} label="হোম" />
      <SectionTitle t="🎁 প্রোমোশন" sub={`${bn(PROMOS.length)}টি অফার`} />
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
  if (!p) return <Page narrow><Empty emoji="🔍" text="অফার পাওয়া যায়নি" /></Page>;
  return (
    <Page narrow>
      <Back href={`${base}/promotions`} label="প্রোমোশন" />
      <div className={`${card} overflow-hidden`}>
        <div className="bg-gradient-to-r from-[#1a1405] to-[#2a1f08] p-8 text-center">
          <p className="text-6xl">{p.e}</p>
          <h1 className="mt-2 text-xl font-black text-[#f5c518]">{p.t}</h1>
        </div>
        <div className="p-5">
          <p className="text-sm leading-relaxed text-slate-300">{p.body}</p>
          <p className={`mt-3 text-[11px] ${sub}`}>📋 শর্ত প্রযোজ্য • ১৮+ • দায়িত্বশীলভাবে খেলুন</p>
          <Link href={`${base}/deposit`} className="mt-4 block w-full rounded-xl bg-[#f5c518] py-3 text-center font-black text-black">💰 ডিপোজিট করে অফার নিন</Link>
        </div>
      </div>
    </Page>
  );
}

const VIP_TIERS = [
  { n: "ব্রোঞ্জ", e: "🥉", pts: "০", cb: "২%", perks: ["সাপ্তাহিক ক্যাশব্যাক", "জন্মদিন বোনাস"] },
  { n: "সিলভার", e: "🥈", pts: "১০,০০০", cb: "৫%", perks: ["সব ব্রোঞ্জ সুবিধা", "প্রতি মাসে ফ্রি স্পিন", "দ্রুত উইথড্র"] },
  { n: "গোল্ড", e: "🥇", pts: "৫০,০০০", cb: "৮%", perks: ["সব সিলভার সুবিধা", "২০% রিলোড বোনাস", "পার্সোনাল ম্যানেজার"] },
  { n: "প্ল্যাটিনাম", e: "💠", pts: "২,০০,০০০", cb: "১২%", perks: ["সব গোল্ড সুবিধা", "এক্সক্লুসিভ টুর্নামেন্ট", "উচ্চ বেট লিমিট"] },
  { n: "ডায়মন্ড", e: "💎", pts: "১০,০০,০০০", cb: "১৫%", perks: ["সব প্ল্যাটিনাম সুবিধা", "লাক্সারি গিফট", "ভিআইপি ইভেন্ট আমন্ত্রণ"] },
];

export function VipProgram() {
  const { base, card, sub, store } = useSkin();
  const pts = Math.round(store.wallet / 10) + store.gameHistory.length * 50;
  return (
    <Page>
      <Back href={base} label="হোম" />
      <SectionTitle t="👑 ভিআইপি প্রোগ্রাম" sub="খেলুন, পয়েন্ট জমান, লেভেল বাড়ান" />
      <div className="rounded-3xl border border-[#f5c518]/30 bg-gradient-to-br from-[#1a1405] to-[#0b1120] p-6 text-center">
        <p className="text-5xl">🥉</p>
        <p className="mt-2 text-lg font-black">আপনার টিয়ার: ব্রোঞ্জ</p>
        <p className="mt-1 text-2xl font-black text-[#f5c518]">{bn(pts.toLocaleString("en-IN"))} পয়েন্ট</p>
        <div className="mx-auto mt-3 h-2.5 max-w-sm overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-[#f5c518]" style={{ width: `${Math.min(100, pts / 100)}%` }} />
        </div>
        <p className={`mt-1 text-[11px] ${sub}`}>সিলভার হতে আরো {bn((10000 - pts).toLocaleString("en-IN"))} পয়েন্ট</p>
      </div>
      <div className="mt-4 flex justify-center">
        <Link href={`${base}/vip/levels`} className="rounded-xl bg-[#f5c518] px-6 py-2.5 text-sm font-black text-black">📊 সব লেভেল দেখুন</Link>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        {[["🎮", "প্রতি বাজিতে পয়েন্ট"], ["💸", "ক্যাশব্যাক"], ["🎁", "এক্সক্লুসিভ বোনাস"]].map(([e, t]) => (
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
      <Back href={`${base}/vip`} label="ভিআইপি" />
      <SectionTitle t="📊 ভিআইপি লেভেল" sub={`${bn(VIP_TIERS.length)}টি টিয়ার`} />
      <div className="space-y-3">
        {VIP_TIERS.map((v, i) => (
          <div key={v.n} className={`${card} p-4 ${i === 0 ? "border-[#f5c518]/40" : ""}`}>
            <div className="flex items-center justify-between">
              <p className="text-lg font-black">{v.e} {v.n} {i === 0 && <span className="ml-1 rounded-full bg-[#f5c518]/20 px-2 py-0.5 text-[10px] text-[#f5c518]">বর্তমান</span>}</p>
              <div className="text-right"><p className="font-black text-emerald-300">{v.cb}</p><p className={`text-[10px] ${sub}`}>ক্যাশব্যাক</p></div>
            </div>
            <p className={`mt-1 text-[11px] ${sub}`}>প্রয়োজন: {bn(v.pts)} পয়েন্ট</p>
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
      <Back href={base} label="হোম" />
      <SectionTitle t="🤝 রেফারেল" sub="বন্ধু আনুন, বোনাস জিতুন" />
      <div className={`${card} p-6 text-center`}>
        <p className="text-5xl">🎁</p>
        <p className="mt-2 font-black">প্রতি রেফারে <span className="text-[#f5c518]">৫০০ টাকা</span> বোনাস!</p>
        <p className={`mt-1 text-xs ${sub}`}>বন্ধু সাইন আপ করে প্রথম ডিপোজিট করলেই বোনাস</p>
        <div className="mt-4 rounded-2xl bg-black/40 p-4">
          <p className={`text-[11px] ${sub}`}>আপনার রেফারেল কোড</p>
          <p className="mt-1 text-3xl font-black tracking-widest text-[#f5c518]">{code}</p>
        </div>
        <button onClick={() => { try { navigator.clipboard.writeText(link); } catch {} setCopied(true); setTimeout(() => setCopied(false), 1500); }}
          className="mt-3 w-full rounded-xl bg-[#f5c518] py-3 font-black text-black">
          {copied ? "✅ কপি হয়েছে!" : "📋 লিংক কপি করুন"}
        </button>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          {[["০", "মোট রেফার"], ["০", "পেন্ডিং"], ["০ টাকা", "আয়"]].map(([v, t]) => (
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
      <Back href={base} label="হোম" />
      <div className={`${card} p-6 text-center`}>
        <p className="text-5xl">👤</p>
        <p className="mt-2 font-black">লগইন করুন</p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Link href={`${base}/login`} className="rounded-xl bg-[#f5c518] py-2.5 text-sm font-black text-black">🔑 লগইন</Link>
          <Link href={`${base}/signup`} className="rounded-xl border border-white/20 py-2.5 text-sm font-bold">✨ সাইন আপ</Link>
        </div>
      </div>
    </Page>
  );
  const u = store.user;
  const menu = [
    [`${base}/wallet`, "👛", "ওয়ালেট", money(store.wallet)],
    [`${base}/my-bets`, "🧾", "আমার বাজি", `${bn(store.bets.length)}টি`],
    [`${base}/transactions`, "📜", "লেনদেন", ""],
    [`${base}/casino/history`, "🎮", "গেম হিস্ট্রি", `${bn(store.gameHistory.length)}টি`],
    [`${base}/promotions`, "🎁", "প্রোমোশন", ""],
    [`${base}/vip`, "👑", "ভিআইপি", "ব্রোঞ্জ"],
    [`${base}/referral`, "🤝", "রেফারেল", "৫০০ বোনাস"],
    [`${base}/account/settings`, "⚙️", "সেটিংস", ""],
    [`${base}/account/kyc`, "🪪", "KYC ভেরিফিকেশন", ""],
    [`${base}/support`, "🎧", "সাপোর্ট", ""],
  ] as const;
  return (
    <Page>
      <Back href={base} label="হোম" />
      <div className="rounded-3xl border border-[#f5c518]/25 bg-gradient-to-br from-[#1a1405] to-[#0b1120] p-5">
        <div className="flex items-center gap-3">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f5c518]/20 text-3xl">👤</span>
          <div><p className="font-black">{u.name}</p><p className={`text-xs ${sub}`}>{u.phone}</p></div>
          <button onClick={() => { store.logout(); window.location.href = base; }} className="ml-auto rounded-xl bg-white/10 px-3 py-1.5 text-xs font-bold">🚪 লগআউট</button>
        </div>
        <div className="mt-3 flex justify-between rounded-2xl bg-black/30 p-3 text-center">
          <div><p className="font-black text-[#f5c518]">{money(store.wallet)}</p><p className={`text-[10px] ${sub}`}>ব্যালেন্স</p></div>
          <div><p className="font-black">{bn(store.bets.length)}</p><p className={`text-[10px] ${sub}`}>বাজি</p></div>
          <div><p className="font-black text-emerald-300">{bn(store.bets.filter((b) => b.status === "জিতেছেন").length)}</p><p className={`text-[10px] ${sub}`}>জয়</p></div>
        </div>
      </div>
      <div className="mt-3 space-y-1.5">
        {menu.map(([h, e, t, v]) => (
          <Link key={t} href={h} className={`${card} flex items-center gap-3 p-3.5 transition hover:border-[#f5c518]/50`}>
            <span className="text-2xl">{e}</span><span className="flex-1 text-sm font-bold">{t}</span>
            {v && <span className="text-xs text-[#f5c518]">{v}</span>}
            <span className="text-slate-500">→</span>
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
      <Back href={`${base}/account`} label="অ্যাকাউন্ট" />
      <SectionTitle t="⚙️ সেটিংস" />
      <div className={`${card} space-y-3 p-4`}>
        <div>
          <p className="mb-1 text-xs font-bold text-slate-400">নাম</p>
          <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-white outline-none" />
        </div>
        <div>
          <p className="mb-1 text-xs font-bold text-slate-400">মোবাইল</p>
          <p className="rounded-xl bg-white/5 px-4 py-2.5 text-sm text-slate-400">{store.user?.phone ?? "—"}</p>
        </div>
        {[
          ["🔔 পুশ নোটিফিকেশন", notif, setNotif],
          ["🔊 গেম সাউন্ড", sound, setSound],
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
          {saved ? "✅ সেভ হয়েছে!" : "💾 সেভ করুন"}
        </button>
        <p className={`text-center text-[11px] ${sub}`}>ডেমো — সেটিংস ব্রাউজারে সংরক্ষিত হয়</p>
      </div>
    </Page>
  );
}

export function Kyc() {
  const { base, card, sub } = useSkin();
  const [step, setStep] = useState(0);
  const steps = ["📷 এনআইডি/পাসপোর্ট ছবি", "🤳 সেলফি", "✅ সম্পন্ন"];
  return (
    <Page narrow>
      <Back href={`${base}/account`} label="অ্যাকাউন্ট" />
      <SectionTitle t="🪪 KYC ভেরিফিকেশন" sub="পরিচয় যাচাই (ডেমো)" />
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
            <p className={`mt-2 text-xs ${sub}`}>{step === 0 ? "এনআইডির সামনের ছবি তুলুন" : "মুখের স্পষ্ট সেলফি তুলুন"}</p>
            <button onClick={() => setStep(step + 1)} className="mt-4 w-full rounded-xl bg-[#f5c518] py-3 font-black text-black">📤 আপলোড করুন (ডেমো)</button>
          </>
        ) : (
          <>
            <p className="text-6xl">✅</p>
            <p className="mt-2 font-black text-emerald-300">ভেরিফিকেশন সম্পন্ন!</p>
            <p className={`mt-1 text-xs ${sub}`}>ডেমোতে সাথে সাথে অনুমোদিত</p>
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
      <Back href={base} label="হোম" />
      <SectionTitle t="🛡️ দায়িত্বশীল গেমিং" />
      <div className={`${card} p-5 text-sm leading-relaxed text-slate-300`}>
        <p>🎮 খেলা বিনোদনের জন্য — আয়ের উপায় নয়। এই নীতিগুলো মেনে চলুন:</p>
        <ul className="mt-3 space-y-2">
          {["💰 বাজেট ঠিক করে খেলুন — হারানোর সামর্থ্যের বেশি বাজি ধরবেন না", "⏰ সময়সীমা নির্ধারণ করুন", "😤 হেরে গেলে রাগ করে বাজি বাড়াবেন না", "🚫 ১৮ বছরের কম বয়সীদের জন্য নয়", "🆘 সমস্যা মনে হলে বিরতি নিন"].map((t) => (
            <li key={t} className="rounded-xl bg-white/[0.04] px-3 py-2">{t}</li>
          ))}
        </ul>
      </div>
      <div className={`${card} mt-3 p-4`}>
        <p className="text-sm font-black">📉 দৈনিক বাজি সীমা (ডেমো)</p>
        <div className="mt-2 flex gap-2">
          <input value={limit} onChange={(e) => setLimit(e.target.value.replace(/\D/g, ""))} inputMode="numeric"
            className="flex-1 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-white outline-none" />
          <button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 1500); }} className="rounded-xl bg-[#f5c518] px-5 font-black text-black">{saved ? "✅" : "সেট"}</button>
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
      <Back href={base} label="হোম" />
      <SectionTitle t="ℹ️ আমাদের সম্পর্কে" />
      <div className="rounded-3xl border border-[#f5c518]/25 bg-gradient-to-br from-[#1a1405] to-[#0b1120] p-6 text-center">
        <p className="text-6xl">{def.logoEmoji}</p>
        <h1 className="mt-2 text-2xl font-black">{def.name}</h1>
        <p className="mt-1 text-sm text-[#f5c518]">{def.type}</p>
      </div>
      <div className={`${card} mt-3 p-5 text-sm leading-relaxed text-slate-300`}>
        <p>{def.about}</p>
        <p className="mt-3">আমরা বাংলাদেশের খেলোয়াড়দের জন্য তৈরি একটি আধুনিক গেমিং প্ল্যাটফর্মের ডেমো — লাইভ স্পোর্টস বেটিং, ৫০০+ ক্যাসিনো গেম, তিন পাত্তি, অন্দর বাহারসহ দেশি গেম, এবং দ্রুত ডিপোজিট-উইথড্র সুবিধা।</p>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
        {[["🎮", "৫০০+", "গেম"], ["👥", "৫০ক+", "খেলোয়াড়"], ["⚡", "৫ মিনিট", "পেমেন্ট"], ["🎧", "২৪/৭", "সাপোর্ট"]].map(([e, v, t]) => (
          <div key={t} className={`${card} p-4`}><p className="text-2xl">{e}</p><p className="mt-1 font-black text-[#f5c518]">{v}</p><p className={`text-[11px] ${sub}`}>{t}</p></div>
        ))}
      </div>
      <div className={`${card} mt-3 border-amber-500/30 bg-amber-500/5 p-4 text-center text-xs text-amber-200`}>
        ⚠️ এটি একটি ডেমো ওয়েবসাইট — সব ব্যালেন্স ও গেম ভার্চুয়াল, আসল টাকা নয়।
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
      <Back href={base} label="হোম" />
      <SectionTitle t="📞 যোগাযোগ" />
      <div className={`${card} p-5`}>
        <div className="space-y-2 text-sm">
          <p>📱 <b className="text-[#f5c518]">{def.contact}</b></p>
          <p>📍 {def.address}</p>
          <p>🕐 {def.hours}</p>
          <p>✉️ support@{def.slug}.com</p>
        </div>
        <a href={`https://wa.me/8801833402586?text=${encodeURIComponent("হ্যালো! সাহায্য দরকার")}`} target="_blank" rel="noreferrer"
          className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 font-black text-white">
          💬 WhatsApp-এ মেসেজ করুন
        </a>
      </div>
      <div className={`${card} mt-3 p-5`}>
        <p className="mb-3 font-black">✉️ মেসেজ পাঠান</p>
        {sent ? <p className="py-6 text-center font-black text-emerald-300">✅ মেসেজ পাঠানো হয়েছে! শীঘ্রই যোগাযোগ করা হবে।</p> : (
          <>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="আপনার নাম"
              className="mb-2 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-white outline-none placeholder:text-slate-500" />
            <textarea value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="আপনার বার্তা..." rows={4}
              className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-white outline-none placeholder:text-slate-500" />
            <button onClick={() => { if (name.trim() && msg.trim()) setSent(true); }} className="mt-3 w-full rounded-xl bg-[#f5c518] py-3 font-black text-black">📨 পাঠান</button>
          </>
        )}
        <p className={`mt-2 text-center text-[11px] ${sub}`}>ডেমো ফর্ম — বাস্তবে সাপোর্ট টিমের কাছে যাবে</p>
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
      <Back href={base} label="হোম" />
      <SectionTitle t="❓ সচরাচর জিজ্ঞাসা" />
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="🔍 প্রশ্ন খুঁজুন..."
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
        {list.length === 0 && <Empty emoji="🔍" text="প্রশ্ন পাওয়া যায়নি" />}
      </div>
    </Page>
  );
}

export function Terms() {
  const { base, card } = useSkin();
  const secs = [
    ["১. সাধারণ", "এই প্ল্যাটফর্ম ব্যবহার করে আপনি এই শর্তাবলীতে সম্মত হচ্ছেন। এটি একটি ডেমো ওয়েবসাইট — সব লেনদেন ভার্চুয়াল।"],
    ["২. বয়সসীমা", "১৮ বছরের কম বয়সীদের জন্য প্ল্যাটফর্ম নিষিদ্ধ।"],
    ["৩. অ্যাকাউন্ট", "একজন একটি অ্যাকাউন্ট খুলতে পারবেন। ভুয়া তথ্যে অ্যাকাউন্ট বন্ধ হতে পারে।"],
    ["৪. বাজি নিষ্পত্তি", "অফিসিয়াল ফলাফলের ভিত্তিতে বাজি নিষ্পত্তি হয়। বাতিল ইভেন্টের বাজি ফেরতযোগ্য।"],
    ["৫. বোনাস", "সব বোনাসে ওয়েজার শর্ত প্রযোজ্য — শর্ত পূরণ না হলে উইথড্র করা যাবে না।"],
    ["৬. দায়িত্বশীল গেমিং", "আসক্তি এড়াতে বাজি সীমা ব্যবহার করুন। সমস্যা হলে সাপোর্টে যোগাযোগ করুন।"],
  ];
  return (
    <Page narrow>
      <Back href={base} label="হোম" />
      <SectionTitle t="📜 শর্তাবলী" sub="সর্বশেষ আপডেট: অক্টোবর ২০২৬" />
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
    ["🔐 তথ্য সংগ্রহ", "আমরা শুধু অ্যাকাউন্টের জন্য প্রয়োজনীয় তথ্য (নাম, মোবাইল) সংরক্ষণ করি। ডেমোতে সব তথ্য আপনার ব্রাউজারেই থাকে।"],
    ["🎯 তথ্যের ব্যবহার", "অ্যাকাউন্ট পরিচালনা, লেনদেন হিস্ট্রি ও সাপোর্টের জন্য তথ্য ব্যবহৃত হয়।"],
    ["🚫 তৃতীয় পক্ষ", "আপনার তথ্য কখনো তৃতীয় পক্ষের কাছে বিক্রি করা হয় না।"],
    ["🍪 কুকি", "লগইন সেশন ও পছন্দ মনে রাখতে লোকাল স্টোরেজ ব্যবহৃত হয়।"],
    ["🗑️ তথ্য মুছুন", "অ্যাকাউন্ট মুছতে চাইলে সাপোর্টে যোগাযোগ করুন।"],
  ];
  return (
    <Page narrow>
      <Back href={base} label="হোম" />
      <SectionTitle t="🔒 প্রাইভেসি পলিসি" />
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
    { t: "🎉 নতুন গেম: জেট ফ্লাইট!", d: "আকাশে উড়ুন আর বড় জয় ধরুন — এখন লাইভ", time: "২ ঘণ্টা আগে" },
    { t: "⚽ বিপিএল স্পেশাল বুস্ট", d: "বিপিএল ম্যাচে মাল্টি বেটে ১৫% এক্সট্রা", time: "১ দিন আগে" },
    { t: "🔧 রাত ৩টায় মেইনটেন্যান্স", d: "৩০ মিনিটের জন্য গেম বন্ধ থাকবে", time: "২ দিন আগে" },
    { t: "👑 ভিআইপি ডায়মন্ড চালু", d: "নতুন সর্বোচ্চ টিয়ার — ১৫% ক্যাশব্যাক", time: "১ সপ্তাহ আগে" },
  ];
  return (
    <Page narrow>
      <Back href={base} label="হোম" />
      <SectionTitle t="📢 ঘোষণা" />
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
  const [cat, setCat] = useState("সব");
  const cats = ["সব", "কৌশল", "প্রিভিউ", "গাইড"];
  const list = BLOG_POSTS.filter((b) => cat === "সব" || b.c === cat);
  return (
    <Page>
      <Back href={base} label="হোম" />
      <SectionTitle t="📰 ব্লগ" sub="কৌশল, প্রিভিউ ও গাইড" />
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
  if (!b) return <Page narrow><Empty emoji="🔍" text="আর্টিকেল পাওয়া যায়নি" /></Page>;
  const related = BLOG_POSTS.filter((x) => x.id !== id).slice(0, 2);
  return (
    <Page narrow>
      <Back href={`${base}/blog`} label="ব্লগ" />
      <div className={`${card} p-6`}>
        <p className="text-5xl">{b.e}</p>
        <h1 className="mt-2 text-xl font-black">{b.t}</h1>
        <p className={`mt-1 text-xs ${sub}`}>{b.c} • {b.time}</p>
        <p className="mt-4 text-sm leading-relaxed text-slate-300">{b.body}</p>
        <p className="mt-4 rounded-xl bg-amber-500/10 p-3 text-[11px] text-amber-200">⚠️ ডেমো কনটেন্ট — দায়িত্বশীলভাবে খেলুন, ১৮+</p>
      </div>
      <p className="mb-2 mt-5 text-sm font-black text-[#f5c518]">📚 আরো পড়ুন</p>
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
    ["💰", "ডিপোজিট ও উইথড্র", "টাকা জমা ও তোলার নিয়ম"],
    ["🧾", "বাজি সংক্রান্ত", "বাজি ধরা, নিষ্পত্তি, অডস"],
    ["🎰", "গেম সমস্যা", "গেম আটকে গেলে করণীয়"],
    ["🎁", "বোনাস", "বোনাসের শর্ত ও দাবি"],
    ["👤", "অ্যাকাউন্ট", "লগইন, পাসওয়ার্ড, KYC"],
    ["🛡️", "নিরাপত্তা", "অ্যাকাউন্ট সুরক্ষা"],
  ].filter(([e, t, d]) => !q || t.includes(q) || d.includes(q));
  return (
    <Page>
      <Back href={base} label="হোম" />
      <SectionTitle t="🎧 সাপোর্ট সেন্টার" sub="২৪/৭ সাহায্য (ডেমো)" />
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="🔍 সমস্যা খুঁজুন..."
        className="mb-3 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white outline-none placeholder:text-slate-500" />
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {topics.map(([e, t, d]) => (
          <Link key={t} href={`${base}/faq`} className={`${card} block p-4 text-center transition hover:border-[#f5c518]/50`}>
            <p className="text-3xl">{e}</p><p className="mt-1 text-sm font-black">{t}</p><p className={`mt-0.5 text-[11px] ${sub}`}>{d}</p>
          </Link>
        ))}
      </div>
      <div className={`${card} mt-4 p-5 text-center`}>
        <p className="font-black">এখনো সমাধান পাননি?</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Link href={`${base}/contact`} className="rounded-xl bg-[#f5c518] py-2.5 text-sm font-black text-black">💬 লাইভ চ্যাট</Link>
          <a href="https://wa.me/8801833402586" target="_blank" rel="noreferrer" className="rounded-xl bg-emerald-500 py-2.5 text-sm font-black text-white">📱 WhatsApp</a>
        </div>
      </div>
    </Page>
  );
}
