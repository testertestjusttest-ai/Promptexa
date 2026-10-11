"use client";

/** DemoSite FINTECH layouts — invest, exchange, wallet.
 * Browser-local data only; nothing touches the real DigiPlyra DB or admin.
 * All money movements are simulated demos.
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toBnDigits } from "@/lib/format";
import { useDemo } from "./store";
import type { DemoInvestPlan, DemoRate, DemoCoin } from "./types";
import { Price, SectionTitle, Empty, Back, Page, Hero, themeOf } from "./ui";
import { ShopLogin, ShopSignup, ShopAccount, ShopAbout, ShopContact } from "./shop-pages";

export const InvestLogin = ShopLogin;
export const InvestSignup = ShopSignup;
export const InvestAccount = ShopAccount;
export const InvestAbout = ShopAbout;
export const InvestContact = ShopContact;
export const ExchangeLogin = ShopLogin;
export const ExchangeSignup = ShopSignup;
export const ExchangeAccount = ShopAccount;
export const ExchangeAbout = ShopAbout;
export const ExchangeContact = ShopContact;
export const WalletLogin = ShopLogin;
export const WalletSignup = ShopSignup;
export const WalletAccount = ShopAccount;
export const WalletAbout = ShopAbout;
export const WalletContact = ShopContact;

const bn = (n: number) => toBnDigits(Math.round(n).toLocaleString("en-IN"));

function useSkin() {
  const { def } = useDemo();
  const theme = themeOf(def);
  const radius = theme === "split" ? "rounded-none" : theme === "minimal" ? "rounded-xl" : theme === "bold" ? "rounded-lg" : theme === "playful" ? "rounded-3xl" : "rounded-2xl";
  return {
    dark: def.dark,
    accent: def.accent,
    theme,
    radius,
    card: `${radius} border ${def.dark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"}`,
    sub: def.dark ? "text-slate-400" : "text-slate-500",
  };
}

function FInput(props: React.InputHTMLAttributes<HTMLInputElement> & { dark: boolean }) {
  const { dark, ...rest } = props;
  return (
    <input
      {...rest}
      className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none ${dark ? "border-white/15 bg-white/5 text-white placeholder:text-slate-500" : "border-slate-200 bg-white placeholder:text-slate-400"} ${props.className ?? ""}`}
    />
  );
}

function FSelect(props: React.SelectHTMLAttributes<HTMLSelectElement> & { dark: boolean }) {
  const { dark, ...rest } = props;
  return (
    <select
      {...rest}
      className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none ${dark ? "border-white/15 bg-white/5 text-white" : "border-slate-200 bg-white"} ${props.className ?? ""}`}
    />
  );
}

/* ================= INVEST layout ================= */

function PlanCard({ plan }: { plan: DemoInvestPlan }) {
  const { def, base } = useDemo();
  const { card, radius } = useSkin();
  return (
    <Link href={`${base}/plan/${plan.id}`} className={`${card} group block p-5 transition hover:-translate-y-1 hover:shadow-xl`}>
      <div className="flex items-start justify-between">
        <span className={`grid h-14 w-14 place-items-center ${radius} text-3xl`} style={{ background: `${def.accent}1a` }}>{plan.e}</span>
        {plan.tag && <span className="rounded-full px-3 py-1 text-[10px] font-black text-white" style={{ background: def.accent }}>{plan.tag}</span>}
      </div>
      <p className="mt-3 text-lg font-black">{plan.n}</p>
      <div className="mt-2 flex items-end justify-between">
        <div>
          <p className="text-4xl font-black" style={{ color: def.accent }}>{toBnDigits(plan.dailyRoi.toFixed(2))}<span className="text-lg">%</span></p>
          <p className="text-xs opacity-60">দৈনিক মুনাফা</p>
        </div>
        <div className="text-right">
          <p className="text-xl font-black">{bn(plan.roi)}%</p>
          <p className="text-xs opacity-60">মোট / {plan.duration}</p>
        </div>
      </div>
      <div className="mt-3 space-y-1 text-xs opacity-70">
        <p>💰 সর্বনিম্ন: {bn(plan.min)} টাকা</p>
        <p>💰 সর্বোচ্চ: {bn(plan.max)} টাকা</p>
        <p>⏱️ মেয়াদ: {plan.duration}</p>
      </div>
      <span className="btn-demo mt-4 block text-center" style={{ background: def.accent }}>বিনিয়োগ করুন</span>
    </Link>
  );
}

export function InvestHome() {
  const { def, base, store } = useDemo();
  const { card, sub } = useSkin();
  const plans = def.investPlans ?? [];
  const totalInvested = store.investments.reduce((s, x) => s + x.amount, 0);
  return (
    <div>
      <Hero
        accent={def.accent}
        slides={[{ img: def.heroImg, emoji: def.heroEmoji, title: def.heroTitle, sub: def.heroSub, cta: "📈 বিনিয়োগ শুরু করুন", href: "/plans", grad: def.grad }]}
      />
      <Page>
        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            ["👥", "৫০,০০০+", "বিনিয়োগকারী"],
            ["💸", "১২ কোটি+", "বিতরণকৃত মুনাফা"],
            ["🛡️", "১০০%", "নিরাপদ"],
          ].map(([e, v, t]) => (
            <div key={t} className={`${card} p-4`}>
              <p className="text-2xl">{e}</p>
              <p className="mt-1 text-lg font-black" style={{ color: def.accent }}>{v}</p>
              <p className={`text-[11px] ${sub}`}>{t}</p>
            </div>
          ))}
        </div>
        <div className="mt-8">
          <SectionTitle t="📈 বিনিয়োগ প্ল্যান" sub="আপনার বাজেট অনুযায়ী বেছে নিন" link={`${base}/plans`} />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {plans.slice(0, 3).map((p) => <PlanCard key={p.id} plan={p} />)}
          </div>
        </div>
        <div className={`mt-8 ${card} p-5`}>
          <SectionTitle t="❓ কিভাবে কাজ করে" />
          <div className="grid gap-3 sm:grid-cols-4">
            {[
              ["1️⃣", "প্ল্যান বেছে নিন", "বাজেট অনুযায়ী প্ল্যান সিলেক্ট করুন"],
              ["2️⃣", "টাকা জমা দিন", "বিকাশ/নগদে নিরাপদ পেমেন্ট"],
              ["3️⃣", "মুনাফা পান", "মেয়াদ শেষে লাভসহ ফেরত"],
              ["4️⃣", "উত্তোলন করুন", "যেকোনো সময় টাকা তুলুন"],
            ].map(([e, t, d]) => (
              <div key={t} className="text-center">
                <p className="text-3xl">{e}</p>
                <p className="mt-2 text-sm font-black">{t}</p>
                <p className={`mt-1 text-xs ${sub}`}>{d}</p>
              </div>
            ))}
          </div>
        </div>
        {totalInvested > 0 && (
          <Link href={`${base}/dashboard`} className={`${card} mt-6 block p-5 text-center`}>
            <p className={`text-xs ${sub}`}>আপনার মোট বিনিয়োগ</p>
            <p className="mt-1 text-2xl font-black" style={{ color: def.accent }}>{bn(totalInvested)} টাকা</p>
            <p className="mt-1 text-xs font-bold opacity-70">ড্যাশবোর্ড দেখুন →</p>
          </Link>
        )}
      </Page>
    </div>
  );
}

export function InvestPlans() {
  const { def } = useDemo();
  const plans = def.investPlans ?? [];
  return (
    <Page>
      <Back href={def.layout ? `/demo${def.slug}` : "/"} label="হোম" />
      <SectionTitle t="📈 সব বিনিয়োগ প্ল্যান" sub={`${bn(plans.length)}টি প্ল্যান`} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((p) => <PlanCard key={p.id} plan={p} />)}
      </div>
    </Page>
  );
}

export function InvestDetail({ id }: { id: string }) {
  const { def, base, store } = useDemo();
  const router = useRouter();
  const { card, sub } = useSkin();
  const plan = (def.investPlans ?? []).find((p) => p.id === id);
  const [amount, setAmount] = useState("");
  const [err, setErr] = useState("");
  if (!plan) return <Page narrow><Empty emoji="🔍" text="প্ল্যান পাওয়া যায়নি" /></Page>;
  const amt = parseInt(amount.replace(/[^0-9]/g, ""), 10) || 0;
  const profit = Math.round((amt * plan.roi) / 100);
  const go = () => {
    if (amt < plan.min) { setErr(`সর্বনিম্ন ${bn(plan.min)} টাকা বিনিয়োগ করতে হবে`); return; }
    if (amt > plan.max) { setErr(`সর্বোচ্চ ${bn(plan.max)} টাকা বিনিয়োগ করা যাবে`); return; }
    const rec = store.placeInvestment({ planId: plan.id, planName: plan.n, amount: amt, roi: plan.roi, duration: plan.duration });
    router.push(`${base}/success/${rec.id}`);
  };
  return (
    <Page narrow>
      <Back href={`${base}/plans`} label="প্ল্যানসমূহ" />
      <div className={`${card} p-6 text-center`}>
        <span className="grid h-20 w-20 mx-auto place-items-center rounded-3xl text-5xl" style={{ background: `${def.accent}1a` }}>{plan.e}</span>
        <h1 className="mt-3 text-2xl font-black">{plan.n}</h1>
        <p className={`mt-1 text-sm ${sub}`}>{plan.desc}</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className={`rounded-xl p-3 ${def.dark ? "bg-white/5" : "bg-slate-50"}`}>
            <p className="text-3xl font-black" style={{ color: def.accent }}>{toBnDigits(plan.dailyRoi.toFixed(2))}%</p>
            <p className={`text-[11px] ${sub}`}>দৈনিক মুনাফা</p>
          </div>
          <div className={`rounded-xl p-3 ${def.dark ? "bg-white/5" : "bg-slate-50"}`}>
            <p className="text-3xl font-black">{bn(plan.roi)}%</p>
            <p className={`text-[11px] ${sub}`}>মোট / {plan.duration}</p>
          </div>
        </div>
        <div className={`mt-4 grid grid-cols-2 gap-2 text-sm`}>
          <div className={`rounded-xl p-3 ${def.dark ? "bg-white/5" : "bg-slate-50"}`}>
            <p className={`text-[11px] ${sub}`}>সর্বনিম্ন</p><p className="font-black">{bn(plan.min)} টাকা</p>
          </div>
          <div className={`rounded-xl p-3 ${def.dark ? "bg-white/5" : "bg-slate-50"}`}>
            <p className={`text-[11px] ${sub}`}>সর্বোচ্চ</p><p className="font-black">{bn(plan.max)} টাকা</p>
          </div>
        </div>
      </div>
      <div className={`${card} mt-4 p-5`}>
        <p className="text-sm font-black">💰 বিনিয়োগের পরিমাণ</p>
        <FInput dark={def.dark} value={amount} onChange={(e) => { setAmount(e.target.value); setErr(""); }} placeholder={`${bn(plan.min)} – ${bn(plan.max)} টাকা`} inputMode="numeric" className="mt-2" />
        {amt > 0 && (
          <div className={`mt-3 rounded-xl p-3 text-sm ${def.dark ? "bg-white/5" : "bg-slate-50"}`}>
            <p>বিনিয়োগ: <b>{bn(amt)} টাকা</b></p>
            <p>দৈনিক আয়: <b style={{ color: def.accent }}>+{bn(Math.round(amt * plan.dailyRoi / 100))} টাকা/দিন</b></p>
            <p>মোট মুনাফা: <b className="text-emerald-500">+{bn(profit)} টাকা</b> ({plan.duration})</p>
            <p>মোট ফেরত: <b>{bn(amt + profit)} টাকা</b></p>
          </div>
        )}
        {err && <p className="mt-2 text-xs font-bold text-red-500">{err}</p>}
        <button onClick={go} className="btn-demo mt-4 w-full" style={{ background: def.accent }}>✅ বিনিয়োগ কনফার্ম করুন</button>
        <p className={`mt-2 text-center text-[11px] ${sub}`}>ডেমো সাইট — আসল টাকা লেনদেন হয় না</p>
      </div>
    </Page>
  );
}

export function InvestSuccess({ id }: { id: string }) {
  const { def, base, store } = useDemo();
  const { card } = useSkin();
  const inv = store.investments.find((x) => x.id === id);
  if (!inv) return <Page narrow><Empty emoji="🔍" text="রেকর্ড পাওয়া যায়নি" /></Page>;
  return (
    <Page narrow>
      <div className={`${card} p-8 text-center`}>
        <p className="text-6xl">🎉</p>
        <h1 className="mt-3 text-2xl font-black">বিনিয়োগ সফল!</h1>
        <p className="mt-2 text-sm opacity-70">আপনার {bn(inv.amount)} টাকা {inv.planName}-এ বিনিয়োগ হয়েছে</p>
        <div className={`mt-4 rounded-xl p-4 text-left text-sm ${def.dark ? "bg-white/5" : "bg-slate-50"}`}>
          <p>🆔 আইডি: <b>{inv.id}</b></p>
          <p>📈 প্রত্যাশিত মুনাফা: <b style={{ color: def.accent }}>+{bn(Math.round(inv.amount * inv.roi / 100))} টাকা</b></p>
          <p>⏱️ মেয়াদ: {inv.duration}</p>
          <p>📌 স্ট্যাটাস: {inv.status}</p>
        </div>
        <Link href={`${base}/dashboard`} className="btn-demo mt-5 inline-block w-full" style={{ background: def.accent }}>ড্যাশবোর্ড দেখুন</Link>
      </div>
    </Page>
  );
}

export function InvestDashboard() {
  const { def, base, store } = useDemo();
  const { card, sub } = useSkin();
  const invs = store.investments;
  const total = invs.reduce((s, x) => s + x.amount, 0);
  const earnings = invs.reduce((s, x) => s + Math.round(x.amount * x.roi / 100), 0);
  return (
    <Page>
      <SectionTitle t="💼 আমার বিনিয়োগ" sub={store.user ? `${store.user.name}` : "ডেমো ড্যাশবোর্ড"} />
      <div className="grid grid-cols-2 gap-2">
        <div className={`${card} p-4 text-center`}>
          <p className={`text-[11px] ${sub}`}>মোট বিনিয়োগ</p>
          <p className="mt-1 text-xl font-black" style={{ color: def.accent }}>{bn(total)} টাকা</p>
        </div>
        <div className={`${card} p-4 text-center`}>
          <p className={`text-[11px] ${sub}`}>প্রত্যাশিত মুনাফা</p>
          <p className="mt-1 text-xl font-black text-emerald-500">+{bn(earnings)} টাকা</p>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        {invs.length === 0 && <Empty emoji="📭" text="এখনো কোনো বিনিয়োগ নেই" />}
        {invs.map((v) => (
          <div key={v.id} className={`${card} p-4`}>
            <div className="flex items-center justify-between">
              <p className="font-black">{v.planName}</p>
              <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-black text-emerald-500">{v.status}</span>
            </div>
            <p className={`mt-1 text-xs ${sub}`}>{v.id} • {new Date(v.date).toLocaleDateString("bn-BD")}</p>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span>বিনিয়োগ: <b>{bn(v.amount)} টাকা</b></span>
              <span>লাভ: <b className="text-emerald-500">+{bn(Math.round(v.amount * v.roi / 100))}</b></span>
            </div>
          </div>
        ))}
      </div>
      <Link href={`${base}/plans`} className="btn-demo mt-5 block text-center" style={{ background: def.accent }}>+ নতুন বিনিয়োগ</Link>
    </Page>
  );
}

export function InvestHow() {
  const { def } = useDemo();
  const { card, sub } = useSkin();
  return (
    <Page narrow>
      <SectionTitle t="❓ কিভাবে কাজ করে" />
      <div className="space-y-3">
        {[
          ["📝", "অ্যাকাউন্ট খুলুন", "মোবাইল নম্বর দিয়ে ফ্রি রেজিস্ট্রেশন করুন।"],
          ["📈", "প্ল্যান বেছে নিন", "আপনার বাজেট ও লক্ষ্য অনুযায়ী প্ল্যান সিলেক্ট করুন।"],
          ["💳", "পেমেন্ট করুন", "বিকাশ, নগদ, রকেট বা কার্ডে নিরাপদে পেমেন্ট।"],
          ["💰", "মুনাফা উপভোগ করুন", "মেয়াদ শেষে আসল + মুনাফা সরাসরি আপনার অ্যাকাউন্টে।"],
        ].map(([e, t, d]) => (
          <div key={t} className={`${card} flex gap-3 p-4`}>
            <span className="text-3xl">{e}</span>
            <div><p className="font-black">{t}</p><p className={`mt-1 text-xs ${sub}`}>{d}</p></div>
          </div>
        ))}
      </div>
      <p className={`mt-4 rounded-xl p-3 text-center text-[11px] ${sub} ${def.dark ? "bg-white/5" : "bg-slate-50"}`}>
        ⚠️ এটি একটি ডেমো ওয়েবসাইট — এখানে আসল টাকা বিনিয়োগ করবেন না।
      </p>
    </Page>
  );
}

/* ================= EXCHANGE layout ================= */

function RateTicker() {
  const { def } = useDemo();
  const rates = def.rates ?? [];
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/30 py-2">
      <div className="flex animate-marquee gap-8 whitespace-nowrap px-4 text-xs font-bold">
        {rates.map((r) => (
          <span key={r.code} className="flex items-center gap-1.5">
            <span>{r.e}</span> {r.code}: <span style={{ color: def.accent }}>{bn(r.buy)}</span>
            <span className={r.change >= 0 ? "text-emerald-400" : "text-red-400"}>{r.change >= 0 ? "▲" : "▼"}{Math.abs(r.change)}%</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function Converter({ compact }: { compact?: boolean }) {
  const { def, base } = useDemo();
  const router = useRouter();
  const { card, sub } = useSkin();
  const rates = def.rates ?? [];
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("BDT");
  const [amount, setAmount] = useState("100");
  const rFrom = rates.find((r) => r.code === from);
  const rTo = rates.find((r) => r.code === to);
  const amt = parseFloat(amount) || 0;
  // convert via BDT
  const inBdt = from === "BDT" ? amt : amt * (rFrom?.buy ?? 0);
  const result = to === "BDT" ? inBdt : inBdt / (rTo?.sell ?? 1);
  const go = () => {
    if (amt <= 0 || from === to) return;
    router.push(`${base}/exchange?from=${from}&to=${to}&amount=${amt}`);
  };
  return (
    <div className={`${card} p-5`}>
      <p className="text-sm font-black">💱 কারেন্সি কনভার্টার</p>
      <div className={`mt-3 grid ${compact ? "grid-cols-1" : "grid-cols-2"} gap-3`}>
        <div>
          <label className={`text-[11px] ${sub}`}>পাঠাবেন</label>
          <div className="flex gap-2">
            <FSelect dark={def.dark} value={from} onChange={(e) => setFrom(e.target.value)} className="!w-28">
              {rates.map((r) => <option key={r.code} value={r.code}>{r.e} {r.code}</option>)}
              <option value="BDT">🇧🇩 BDT</option>
            </FSelect>
            <FInput dark={def.dark} value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" placeholder="পরিমাণ" />
          </div>
        </div>
        <div>
          <label className={`text-[11px] ${sub}`}>পাবেন</label>
          <div className="flex gap-2">
            <FSelect dark={def.dark} value={to} onChange={(e) => setTo(e.target.value)} className="!w-28">
              <option value="BDT">🇧🇩 BDT</option>
              {rates.map((r) => <option key={r.code} value={r.code}>{r.e} {r.code}</option>)}
            </FSelect>
            <div className={`grid flex-1 place-items-center rounded-2xl border px-4 py-3 text-sm font-black ${def.dark ? "border-white/15 bg-white/5" : "border-slate-200 bg-slate-50"}`}>
              {amt > 0 && from !== to ? <><span style={{ color: def.accent }}>{result.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span> {to}</> : "—"}
            </div>
          </div>
        </div>
      </div>
      <button onClick={go} disabled={amt <= 0 || from === to} className="btn-demo mt-4 w-full disabled:opacity-40" style={{ background: def.accent }}>
        এক্সচেঞ্জ করুন →
      </button>
    </div>
  );
}

export function ExchangeHome() {
  const { def, base } = useDemo();
  const { card, sub } = useSkin();
  const rates = def.rates ?? [];
  return (
    <div>
      <Hero
        accent={def.accent}
        slides={[{ img: def.heroImg, emoji: def.heroEmoji, title: def.heroTitle, sub: def.heroSub, cta: "💱 এখনই এক্সচেঞ্জ করুন", href: "/exchange", grad: def.grad }]}
      />
      <Page>
        <RateTicker />
        <div className="mt-4"><Converter /></div>
        <div className="mt-6">
          <SectionTitle t="📊 আজকের রেট" link={`${base}/rates`} />
          <div className={`${card} divide-y ${def.dark ? "divide-white/10" : "divide-slate-100"}`}>
            {rates.slice(0, 5).map((r) => (
              <div key={r.code} className="flex items-center gap-3 p-3">
                <span className="text-2xl">{r.e}</span>
                <div className="flex-1">
                  <p className="text-sm font-black">{r.code} <span className={`text-[11px] font-normal ${sub}`}>{r.name}</span></p>
                </div>
                <div className="text-right text-xs">
                  <p>ক্রয়: <b style={{ color: def.accent }}>{bn(r.buy)}</b></p>
                  <p className={sub}>বিক্রয়: {bn(r.sell)}</p>
                </div>
                <span className={`text-[11px] font-black ${r.change >= 0 ? "text-emerald-500" : "text-red-500"}`}>{r.change >= 0 ? "▲" : "▼"}{Math.abs(r.change)}%</span>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-6 grid grid-cols-3 gap-2 text-center">
          {[["⚡", "৫ মিনিটে", "ডেলিভারি"], ["🛡️", "১০০%", "নিরাপদ"], ["💬", "২৪/৭", "সাপোর্ট"]].map(([e, v, t]) => (
            <div key={t} className={`${card} p-4`}>
              <p className="text-2xl">{e}</p>
              <p className="mt-1 text-sm font-black">{v}</p>
              <p className={`text-[11px] ${sub}`}>{t}</p>
            </div>
          ))}
        </div>
      </Page>
    </div>
  );
}

export function ExchangeRates() {
  const { def } = useDemo();
  const { card, sub } = useSkin();
  const rates = def.rates ?? [];
  return (
    <Page>
      <Back href={`/demo${def.slug}`} label="হোম" />
      <SectionTitle t="📊 লাইভ এক্সচেঞ্জ রেট" sub="প্রতি মিনিটে আপডেট (ডেমো)" />
      <div className={`${card} divide-y overflow-hidden ${def.dark ? "divide-white/10" : "divide-slate-100"}`}>
        <div className={`grid grid-cols-4 gap-2 p-3 text-[11px] font-black uppercase ${sub}`}>
          <span>কারেন্সি</span><span className="text-right">আমরা কিনি</span><span className="text-right">আমরা বেচি</span><span className="text-right">পরিবর্তন</span>
        </div>
        {rates.map((r) => (
          <div key={r.code} className="grid grid-cols-4 items-center gap-2 p-3 text-sm">
            <span className="font-bold">{r.e} {r.code}</span>
            <span className="text-right">{bn(r.sell)}</span>
            <span className="text-right font-black" style={{ color: def.accent }}>{bn(r.buy)}</span>
            <span className={`text-right text-xs font-black ${r.change >= 0 ? "text-emerald-500" : "text-red-500"}`}>{r.change >= 0 ? "▲" : "▼"}{Math.abs(r.change)}%</span>
          </div>
        ))}
      </div>
      <p className={`mt-3 text-center text-[11px] ${sub}`}>ডেমো রেট — আসল লেনদেনের আগে সাপোর্টে যাচাই করুন</p>
    </Page>
  );
}

export function ExchangeFlow() {
  const { def, base, store } = useDemo();
  const router = useRouter();
  const { card, sub } = useSkin();
  const rates = def.rates ?? [];
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("BDT");
  const [amount, setAmount] = useState("");
  const [name, setName] = useState(store.user?.name ?? "");
  const [phone, setPhone] = useState(store.user?.phone ?? "");
  const [account, setAccount] = useState("");
  const [step, setStep] = useState(0);
  const [err, setErr] = useState("");
  const amt = parseFloat(amount) || 0;
  const rFrom = rates.find((r) => r.code === from);
  const rTo = rates.find((r) => r.code === to);
  const inBdt = from === "BDT" ? amt : amt * (rFrom?.buy ?? 0);
  const result = to === "BDT" ? inBdt : inBdt / (rTo?.sell ?? 1);
  const next = () => {
    if (amt <= 0) { setErr("সঠিক পরিমাণ দিন"); return; }
    if (from === to) { setErr("দুটি আলাদা কারেন্সি বেছে নিন"); return; }
    setErr(""); setStep(1);
  };
  const confirm = () => {
    if (name.trim().length < 3) { setErr("আপনার নাম দিন"); return; }
    if (!/^01[3-9]\d{8}$/.test(phone.trim())) { setErr("সঠিক মোবাইল নম্বর দিন"); return; }
    if (!account.trim()) { setErr("গ্রহীতার অ্যাকাউন্ট/ওয়ালেট ঠিকানা দিন"); return; }
    const rec = store.placeExchange({ from, to, amount: amt, result: Math.round(result * 100) / 100, name: name.trim(), phone: phone.trim() });
    router.push(`${base}/success/${rec.id}`);
  };
  return (
    <Page narrow>
      <Back href={`/demo${def.slug}`} label="হোম" />
      <SectionTitle t="💱 এক্সচেঞ্জ অর্ডার" sub={step === 0 ? "ধাপ ১: পরিমাণ" : "ধাপ ২: তথ্য ও কনফার্ম"} />
      {step === 0 && (
        <div className={`${card} space-y-3 p-5`}>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={`text-[11px] ${sub}`}>দিবেন</label>
              <FSelect dark={def.dark} value={from} onChange={(e) => setFrom(e.target.value)}>
                {rates.map((r) => <option key={r.code} value={r.code}>{r.e} {r.code}</option>)}
                <option value="BDT">🇧🇩 BDT</option>
              </FSelect>
            </div>
            <div>
              <label className={`text-[11px] ${sub}`}>নিবেন</label>
              <FSelect dark={def.dark} value={to} onChange={(e) => setTo(e.target.value)}>
                <option value="BDT">🇧🇩 BDT</option>
                {rates.map((r) => <option key={r.code} value={r.code}>{r.e} {r.code}</option>)}
              </FSelect>
            </div>
          </div>
          <div>
            <label className={`text-[11px] ${sub}`}>পরিমাণ ({from})</label>
            <FInput dark={def.dark} value={amount} onChange={(e) => { setAmount(e.target.value); setErr(""); }} inputMode="decimal" placeholder="0.00" />
          </div>
          {amt > 0 && from !== to && (
            <div className={`rounded-xl p-4 text-center ${def.dark ? "bg-white/5" : "bg-slate-50"}`}>
              <p className={`text-[11px] ${sub}`}>আপনি পাবেন</p>
              <p className="text-3xl font-black" style={{ color: def.accent }}>{result.toLocaleString("en-IN", { maximumFractionDigits: 2 })} {to}</p>
              <p className={`mt-1 text-[11px] ${sub}`}>রেট: ১ {from} = {(from === "BDT" ? 1 / (rTo?.sell ?? 1) : (rFrom?.buy ?? 0) / (to === "BDT" ? 1 : rTo?.sell ?? 1)).toFixed(4)} {to}</p>
            </div>
          )}
          {err && <p className="text-xs font-bold text-red-500">{err}</p>}
          <button onClick={next} className="btn-demo w-full" style={{ background: def.accent }}>পরবর্তী →</button>
        </div>
      )}
      {step === 1 && (
        <div className={`${card} space-y-3 p-5`}>
          <div className={`rounded-xl p-3 text-sm ${def.dark ? "bg-white/5" : "bg-slate-50"}`}>
            <p><b>{amt} {from}</b> → <b style={{ color: def.accent }}>{result.toLocaleString("en-IN", { maximumFractionDigits: 2 })} {to}</b></p>
          </div>
          <FInput dark={def.dark} value={name} onChange={(e) => setName(e.target.value)} placeholder="আপনার নাম" />
          <FInput dark={def.dark} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="মোবাইল নম্বর (01XXXXXXXXX)" inputMode="tel" />
          <FInput dark={def.dark} value={account} onChange={(e) => setAccount(e.target.value)} placeholder={to === "BDT" ? "বিকাশ/নগদ নম্বর" : `${to} ওয়ালেট ঠিকানা`} />
          {err && <p className="text-xs font-bold text-red-500">{err}</p>}
          <div className="flex gap-2">
            <button onClick={() => setStep(0)} className="btn-demo-ghost flex-1">← ফিরে যান</button>
            <button onClick={confirm} className="btn-demo flex-1" style={{ background: def.accent }}>✅ কনফার্ম করুন</button>
          </div>
          <p className={`text-center text-[11px] ${sub}`}>ডেমো সাইট — আসল টাকা লেনদেন হয় না</p>
        </div>
      )}
    </Page>
  );
}

export function ExchangeSuccess({ id }: { id: string }) {
  const { def, base, store } = useDemo();
  const { card } = useSkin();
  const ex = store.exchanges.find((x) => x.id === id);
  if (!ex) return <Page narrow><Empty emoji="🔍" text="রেকর্ড পাওয়া যায়নি" /></Page>;
  return (
    <Page narrow>
      <div className={`${card} p-8 text-center`}>
        <p className="text-6xl">✅</p>
        <h1 className="mt-3 text-2xl font-black">অর্ডার গৃহীত!</h1>
        <p className="mt-2 text-sm opacity-70">{ex.amount} {ex.from} → {ex.result} {ex.to}</p>
        <div className={`mt-4 rounded-xl p-4 text-left text-sm ${def.dark ? "bg-white/5" : "bg-slate-50"}`}>
          <p>🆔 ট্র্যাকিং: <b>{ex.id}</b></p>
          <p>📌 স্ট্যাটাস: {ex.status}</p>
          <p>⏱️ ৫–৩০ মিনিটের মধ্যে সম্পন্ন হবে (ডেমো)</p>
        </div>
        <Link href={`${base}/track?id=${ex.id}`} className="btn-demo mt-5 inline-block w-full" style={{ background: def.accent }}>ট্র্যাক করুন</Link>
      </div>
    </Page>
  );
}

export function ExchangeTrack() {
  const { def, base, store } = useDemo();
  const { card, sub } = useSkin();
  const [q, setQ] = useState("");
  const [found, setFound] = useState<typeof store.exchanges[number] | null | undefined>(undefined);
  const search = () => {
    const f = store.exchanges.find((x) => x.id.toLowerCase() === q.trim().toLowerCase());
    setFound(f ?? null);
  };
  return (
    <Page narrow>
      <Back href={`/demo${def.slug}`} label="হোম" />
      <SectionTitle t="📍 এক্সচেঞ্জ ট্র্যাক" />
      <div className={`${card} p-5`}>
        <div className="flex gap-2">
          <FInput dark={def.dark} value={q} onChange={(e) => setQ(e.target.value)} placeholder="ট্র্যাকিং আইডি (যেমন EX-...)" />
          <button onClick={search} className="btn-demo shrink-0" style={{ background: def.accent }}>খুঁজুন</button>
        </div>
        {found === null && <p className="mt-3 text-center text-sm font-bold text-red-500">রেকর্ড পাওয়া যায়নি</p>}
        {found && (
          <div className={`mt-4 rounded-xl p-4 text-sm ${def.dark ? "bg-white/5" : "bg-slate-50"}`}>
            <p>🆔 {found.id}</p>
            <p className="mt-1"><b>{found.amount} {found.from}</b> → <b style={{ color: def.accent }}>{found.result} {found.to}</b></p>
            <p className="mt-1">📌 স্ট্যাটাস: {found.status}</p>
            <p className={`text-xs ${sub}`}>{new Date(found.date).toLocaleString("bn-BD")}</p>
          </div>
        )}
      </div>
      {store.exchanges.length > 0 && (
        <div className="mt-4">
          <SectionTitle t="🕘 সাম্প্রতিক অর্ডার" />
          <div className="space-y-2">
            {store.exchanges.slice(0, 5).map((x) => (
              <Link key={x.id} href={`${base}/track`} className={`${card} block p-3 text-sm`}>
                <b>{x.amount} {x.from} → {x.result} {x.to}</b>
                <p className={`text-xs ${sub}`}>{x.id} • {x.status}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </Page>
  );
}

/* ================= WALLET layout ================= */

const DEMO_BALANCES: Record<string, number> = { BTC: 0.245, ETH: 3.8, USDT: 1250, BNB: 12.5 };

function CoinRow({ coin }: { coin: DemoCoin }) {
  const { def } = useDemo();
  const { card, sub } = useSkin();
  const bal = DEMO_BALANCES[coin.code] ?? 0;
  return (
    <div className={`${card} flex items-center gap-3 p-4`}>
      <span className="grid h-12 w-12 place-items-center rounded-full text-2xl" style={{ background: `${def.accent}1a` }}>{coin.e}</span>
      <div className="flex-1">
        <p className="text-sm font-black">{coin.code} <span className={`font-normal ${sub}`}>{coin.name}</span></p>
        <p className={`text-[11px] ${sub}`}>${coin.price.toLocaleString("en-IN")} <span className={coin.change >= 0 ? "text-emerald-500" : "text-red-500"}>{coin.change >= 0 ? "▲" : "▼"}{Math.abs(coin.change)}%</span></p>
      </div>
      <div className="text-right">
        <p className="text-sm font-black">{bal} {coin.code}</p>
        <p className={`text-[11px] ${sub}`}>${bn(bal * coin.price)}</p>
      </div>
    </div>
  );
}

export function WalletHome() {
  const { def, base } = useDemo();
  const { card, sub } = useSkin();
  const coins = def.coins ?? [];
  const portfolio = coins.reduce((s, c) => s + (DEMO_BALANCES[c.code] ?? 0) * c.price, 0);
  return (
    <div>
      <Hero
        accent={def.accent}
        slides={[{ img: def.heroImg, emoji: def.heroEmoji, title: def.heroTitle, sub: def.heroSub, cta: "👛 ওয়ালেট খুলুন", href: "/wallet", grad: def.grad }]}
      />
      <Page>
        <div className={`${card} p-5 text-center`}>
          <p className={`text-[11px] ${sub}`}>মোট পোর্টফোলিও (ডেমো)</p>
          <p className="mt-1 text-3xl font-black" style={{ color: def.accent }}>${bn(portfolio)}</p>
          <Link href={`${base}/wallet`} className="btn-demo mt-3 inline-block" style={{ background: def.accent }}>ড্যাশবোর্ড →</Link>
        </div>
        <div className="mt-6">
          <SectionTitle t="🪙 সাপোর্টেড কয়েন" />
          <div className="space-y-2">
            {coins.map((c) => <CoinRow key={c.code} coin={c} />)}
          </div>
        </div>
        <div className="mt-6 grid grid-cols-3 gap-2 text-center">
          {[["🔐", "সিকিউর", "২-স্তর নিরাপত্তা"], ["⚡", "দ্রুত", "সেকেন্ডে ট্রান্সফার"], ["🌍", "গ্লোবাল", "১৫০+ দেশ"]].map(([e, v, t]) => (
            <div key={t} className={`${card} p-4`}>
              <p className="text-2xl">{e}</p>
              <p className="mt-1 text-sm font-black">{v}</p>
              <p className={`text-[11px] ${sub}`}>{t}</p>
            </div>
          ))}
        </div>
      </Page>
    </div>
  );
}

export function WalletDash() {
  const { def, base, store } = useDemo();
  const { card, sub } = useSkin();
  const coins = def.coins ?? [];
  const portfolio = coins.reduce((s, c) => s + (DEMO_BALANCES[c.code] ?? 0) * c.price, 0);
  return (
    <Page>
      <SectionTitle t="👛 আমার ওয়ালেট" sub={store.user ? store.user.name : "ডেমো ওয়ালেট"} />
      <div className={`${card} p-6 text-center`} style={{ background: `linear-gradient(135deg, ${def.accent}22, transparent)` }}>
        <p className={`text-[11px] ${sub}`}>মোট ব্যালেন্স</p>
        <p className="mt-1 text-4xl font-black">${bn(portfolio)}</p>
        <div className="mt-4 flex gap-2">
          <Link href={`${base}/send`} className="btn-demo flex-1" style={{ background: def.accent }}>📤 সেন্ড</Link>
          <Link href={`${base}/receive`} className="btn-demo-ghost flex-1">📥 রিসিভ</Link>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        {coins.map((c) => <CoinRow key={c.code} coin={c} />)}
      </div>
      <div className="mt-6">
        <SectionTitle t="🕘 লেনদেন হিস্ট্রি" />
        {store.coinTxs.length === 0 && <Empty emoji="📭" text="এখনো কোনো লেনদেন নেই" />}
        <div className="space-y-2">
          {store.coinTxs.map((t) => (
            <div key={t.id} className={`${card} flex items-center gap-3 p-3`}>
              <span className={`grid h-10 w-10 place-items-center rounded-full text-lg ${t.kind === "send" ? "bg-red-500/15" : "bg-emerald-500/15"}`}>
                {t.kind === "send" ? "📤" : "📥"}
              </span>
              <div className="flex-1 text-sm">
                <p className="font-bold">{t.kind === "send" ? "পাঠানো" : "গৃহীত"} — {t.amount} {t.coin}</p>
                <p className={`text-[11px] ${sub}`}>{t.addr.slice(0, 18)}... • {new Date(t.date).toLocaleString("bn-BD")}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Page>
  );
}

export function WalletSend() {
  const { def, base, store } = useDemo();
  const router = useRouter();
  const { card, sub } = useSkin();
  const coins = def.coins ?? [];
  const [coin, setCoin] = useState(coins[0]?.code ?? "BTC");
  const [addr, setAddr] = useState("");
  const [amount, setAmount] = useState("");
  const [err, setErr] = useState("");
  const bal = DEMO_BALANCES[coin] ?? 0;
  const amt = parseFloat(amount) || 0;
  const send = () => {
    if (addr.trim().length < 10) { setErr("সঠিক ওয়ালেট ঠিকানা দিন"); return; }
    if (amt <= 0) { setErr("সঠিক পরিমাণ দিন"); return; }
    if (amt > bal) { setErr(`অপর্যাপ্ত ব্যালেন্স (আছে ${bal} ${coin})`); return; }
    const rec = store.placeCoinTx({ kind: "send", coin, amount: amt, addr: addr.trim() });
    router.push(`${base}/wallet`);
  };
  return (
    <Page narrow>
      <Back href={`${base}/wallet`} label="ওয়ালেট" />
      <SectionTitle t="📤 কয়েন পাঠান" />
      <div className={`${card} space-y-3 p-5`}>
        <div>
          <label className={`text-[11px] ${sub}`}>কয়েন</label>
          <FSelect dark={def.dark} value={coin} onChange={(e) => setCoin(e.target.value)}>
            {coins.map((c) => <option key={c.code} value={c.code}>{c.e} {c.code} — ব্যালেন্স {DEMO_BALANCES[c.code] ?? 0}</option>)}
          </FSelect>
        </div>
        <div>
          <label className={`text-[11px] ${sub}`}>গ্রহীতার ঠিকানা</label>
          <FInput dark={def.dark} value={addr} onChange={(e) => { setAddr(e.target.value); setErr(""); }} placeholder="0x... বা bc1..." />
        </div>
        <div>
          <label className={`text-[11px] ${sub}`}>পরিমাণ</label>
          <FInput dark={def.dark} value={amount} onChange={(e) => { setAmount(e.target.value); setErr(""); }} inputMode="decimal" placeholder="0.00" />
        </div>
        {err && <p className="text-xs font-bold text-red-500">{err}</p>}
        <button onClick={send} className="btn-demo w-full" style={{ background: def.accent }}>📤 পাঠান</button>
        <p className={`text-center text-[11px] ${sub}`}>ডেমো ওয়ালেট — আসল ক্রিপ্টো পাঠানো হয় না</p>
      </div>
    </Page>
  );
}

export function WalletReceive() {
  const { def, base, store } = useDemo();
  const { card, sub } = useSkin();
  const coins = def.coins ?? [];
  const [coin, setCoin] = useState(coins[0]?.code ?? "BTC");
  const addr = useMemo(() => {
    const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
    let a = coin === "BTC" ? "bc1q" : "0x";
    for (let i = 0; i < 28; i++) a += chars[Math.floor(Math.random() * chars.length)];
    return a;
  }, [coin]);
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(addr); } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  const simulate = () => {
    store.placeCoinTx({ kind: "receive", coin, amount: 0.01, addr: "demo-faucet" });
  };
  return (
    <Page narrow>
      <Back href={`${base}/wallet`} label="ওয়ালেট" />
      <SectionTitle t="📥 কয়েন গ্রহণ করুন" />
      <div className={`${card} p-6 text-center`}>
        <FSelect dark={def.dark} value={coin} onChange={(e) => setCoin(e.target.value)} className="mb-4">
          {coins.map((c) => <option key={c.code} value={c.code}>{c.e} {c.code}</option>)}
        </FSelect>
        <div className={`mx-auto grid h-44 w-44 place-items-center rounded-2xl ${def.dark ? "bg-white" : "bg-slate-900"} p-2`}>
          <div className="grid h-full w-full grid-cols-7 gap-0.5">
            {Array.from({ length: 49 }).map((_, i) => (
              <span key={i} className={`rounded-[2px] ${(i * 7 + addr.charCodeAt(i % addr.length)) % 3 === 0 ? (def.dark ? "bg-slate-900" : "bg-white") : "bg-transparent"}`} />
            ))}
          </div>
        </div>
        <p className={`mt-4 break-all rounded-xl p-3 font-mono text-xs ${def.dark ? "bg-white/5" : "bg-slate-50"}`}>{addr}</p>
        <button onClick={copy} className="btn-demo mt-3 w-full" style={{ background: def.accent }}>{copied ? "✅ কপি হয়েছে!" : "📋 ঠিকানা কপি করুন"}</button>
        <button onClick={simulate} className="btn-demo-ghost mt-2 w-full">🎁 ডেমো: ০.০১ {coin} গ্রহণ করুন</button>
        <p className={`mt-2 text-[11px] ${sub}`}>শুধুমাত্র {coin} পাঠাবেন — অন্য কয়েন হারিয়ে যাবে (ডেমো)</p>
      </div>
    </Page>
  );
}

/* ================= Shared DEPOSIT flow (invest / exchange / wallet) ================= */

const DEPOSIT_METHODS = [
  { id: "bkash", n: "বিকাশ", e: "🩷", num: "01XXX-XXXXXX" },
  { id: "nagad", n: "নগদ", e: "🧡", num: "01XXX-XXXXXX" },
  { id: "rocket", n: "রকেট", e: "💜", num: "01XXX-XXXXXX" },
  { id: "card", n: "কার্ড", e: "💳", num: "অনলাইন পেমেন্ট" },
];

export function FinDeposit() {
  const { def, base, store } = useDemo();
  const { card, sub } = useSkin();
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("bkash");
  const [trxId, setTrxId] = useState("");
  const [err, setErr] = useState("");
  const [done, setDone] = useState<string | null>(null);
  const amt = parseInt(amount.replace(/[^0-9]/g, ""), 10) || 0;
  const m = DEPOSIT_METHODS.find((x) => x.id === method)!;

  const submit = () => {
    if (amt < 100) { setErr("সর্বনিম্ন ১০০ টাকা ডিপোজিট করুন"); return; }
    if (method !== "card" && trxId.trim().length < 6) { setErr("পেমেন্টের TrxID দিন"); return; }
    const rec = store.placeDeposit({ amount: amt, method: m.n, trxId: trxId.trim() || "CARD" });
    setDone(rec.id);
  };

  if (done) {
    const rec = store.deposits.find((d) => d.id === done);
    return (
      <Page narrow>
        <div className={`${card} p-8 text-center`}>
          <p className="text-6xl">⏳</p>
          <h1 className="mt-3 text-2xl font-black">ডিপোজিট রিকোয়েস্ট গৃহীত!</h1>
          <p className="mt-2 text-sm opacity-70">{bn(amt)} টাকা — {m.n}</p>
          <div className={`mt-4 rounded-xl p-4 text-left text-sm ${def.dark ? "bg-white/5" : "bg-slate-50"}`}>
            <p>🆔 আইডি: <b>{done}</b></p>
            <p>📌 স্ট্যাটাস: <b className="text-amber-500">{rec?.status ?? "পেন্ডিং"}</b></p>
            <p className={`mt-1 text-xs ${sub}`}>যাচাইয়ের পর ব্যালেন্সে যোগ হবে (ডেমো)</p>
          </div>
          <Link href={base} className="btn-demo mt-5 inline-block w-full" style={{ background: def.accent }}>হোমে ফিরুন</Link>
        </div>
      </Page>
    );
  }

  return (
    <Page narrow>
      <Back href={base} label="হোম" />
      <SectionTitle t="💰 ডিপোজিট করুন" sub="ব্যালেন্সে টাকা যোগ করুন" />
      <div className={`${card} p-5`}>
        <p className="text-sm font-black">💵 পরিমাণ</p>
        <FInput dark={def.dark} value={amount} onChange={(e) => { setAmount(e.target.value); setErr(""); }} inputMode="numeric" placeholder="যেমন: ৫০০০" className="mt-2" />
        <p className="mt-4 text-sm font-black">📲 পেমেন্ট মাধ্যম</p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {DEPOSIT_METHODS.map((x) => (
            <button
              key={x.id}
              onClick={() => setMethod(x.id)}
              className={`rounded-2xl border p-3 text-left transition ${method === x.id ? "ring-2" : "opacity-70 hover:opacity-100"} ${def.dark ? "border-white/15 bg-white/5" : "border-slate-200 bg-white"}`}
              style={method === x.id ? ({ "--tw-ring-color": def.accent } as any) : undefined}
            >
              <p className="text-xl">{x.e}</p>
              <p className="mt-1 text-sm font-black">{x.n}</p>
            </button>
          ))}
        </div>
        <div className={`mt-3 rounded-xl p-3 text-sm ${def.dark ? "bg-white/5" : "bg-slate-50"}`}>
          <p>📞 {m.n} নম্বর: <b>{def.contact}</b></p>
          <p className={`mt-1 text-xs ${sub}`}>উপরের নম্বরে {amt > 0 ? bn(amt) : "___"} টাকা পাঠিয়ে TrxID দিন</p>
        </div>
        {method !== "card" && (
          <div className="mt-3">
            <p className="text-sm font-black">🔑 TrxID</p>
            <FInput dark={def.dark} value={trxId} onChange={(e) => { setTrxId(e.target.value); setErr(""); }} placeholder="যেমন: 9HX7K2LMN1" className="mt-2" />
          </div>
        )}
        {err && <p className="mt-2 text-xs font-bold text-red-500">{err}</p>}
        <button onClick={submit} className="btn-demo mt-4 w-full" style={{ background: def.accent }}>
          ✅ {amt > 0 ? `${bn(amt)} টাকা ` : ""}ডিপোজিট কনফার্ম
        </button>
        <p className={`mt-2 text-center text-[11px] ${sub}`}>ডেমো সাইট — আসল টাকা লেনদেন হয় না</p>
      </div>
      {store.deposits.length > 0 && (
        <div className="mt-4">
          <SectionTitle t="🕘 ডিপোজিট হিস্ট্রি" />
          <div className="space-y-2">
            {store.deposits.slice(0, 5).map((d) => (
              <div key={d.id} className={`${card} flex items-center justify-between p-3 text-sm`}>
                <div>
                  <p className="font-bold">{bn(d.amount)} টাকা <span className={`font-normal ${sub}`}>• {d.method}</span></p>
                  <p className={`text-[11px] ${sub}`}>{d.id}</p>
                </div>
                <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[10px] font-black text-amber-500">{d.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Page>
  );
}
