"use client";

/** DemoSite FINTECH layouts — invest, exchange, wallet.
 * Browser-local data only; nothing touches the real DigiPlyra DB or admin.
 * All money movements are simulated demos.
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDemo } from "./store";
import type { DemoInvestPlan, DemoRate, DemoCoin } from "./types";
import { Price, SectionTitle, Empty, Back, Page, Hero, themeOf, bannerSlides } from "./ui";
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

const bn = (n: number) => Math.round(n).toLocaleString("en-IN");

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
          <p className="text-4xl font-black" style={{ color: def.accent }}>{plan.dailyRoi.toFixed(2)}<span className="text-lg">%</span></p>
          <p className="text-xs opacity-60">Daily profit</p>
        </div>
        <div className="text-right">
          <p className="text-xl font-black">{bn(plan.roi)}%</p>
          <p className="text-xs opacity-60">Total / {plan.duration}</p>
        </div>
      </div>
      <div className="mt-3 space-y-1 text-xs opacity-70">
        <p>💰 Minimum: {bn(plan.min)} Tk</p>
        <p>💰 Maximum: {bn(plan.max)} Tk</p>
        <p>⏱️ Duration: {plan.duration}</p>
      </div>
      <span className="btn-demo mt-4 block text-center" style={{ background: def.accent }}>Invest now</span>
    </Link>
  );
}

export function InvestHome() {
  const { def, base, store } = useDemo();
  const banners = bannerSlides();
  const { card, sub } = useSkin();
  const plans = def.investPlans ?? [];
  const totalInvested = store.investments.reduce((s, x) => s + x.amount, 0);
  return (
    <div>
      <Hero
        accent={def.accent}
        slides={[{ img: def.heroImg, emoji: def.heroEmoji, title: def.heroTitle, sub: def.heroSub, cta: "📈 Start investing", href: "/plans", grad: def.grad }, ...banners]}
      />
      <Page>
        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            ["📊", "Tiered plans", "Starter to Premium"],
            ["⏱️", "Flexible terms", "15–120 days"],
            ["🛡️", "Demo only", "No real money"],
          ].map(([e, v, t]) => (
            <div key={t} className={`${card} p-4`}>
              <p className="text-2xl">{e}</p>
              <p className="mt-1 text-lg font-black" style={{ color: def.accent }}>{v}</p>
              <p className={`text-[11px] ${sub}`}>{t}</p>
            </div>
          ))}
        </div>
        <div className="mt-8">
          <SectionTitle t="📈 Investment plans" sub="Choose by your budget" link={`${base}/plans`} />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {plans.slice(0, 3).map((p) => <PlanCard key={p.id} plan={p} />)}
          </div>
        </div>
        <div className={`mt-8 ${card} p-5`}>
          <SectionTitle t="❓ How it works" />
          <div className="grid gap-3 sm:grid-cols-4">
            {[
              ["1️⃣", "Choose a plan", "Select a plan by budget"],
              ["2️⃣", "Deposit money", "Secure payment via bKash/Nagad"],
              ["3️⃣", "Earn profit", "Principal + profit back at term end"],
              ["4️⃣", "Withdraw", "Withdraw money anytime"],
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
            <p className={`text-xs ${sub}`}>Your total investment</p>
            <p className="mt-1 text-2xl font-black" style={{ color: def.accent }}>{bn(totalInvested)} Tk</p>
            <p className="mt-1 text-xs font-bold opacity-70">View dashboard →</p>
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
      <Back href={def.layout ? `/demo${def.slug}` : "/"} label="Home" />
      <SectionTitle t="📈 All investment plans" sub={`${bn(plans.length)} plans`} />
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
  if (!plan) return <Page narrow><Empty emoji="🔍" text="Plan not found" /></Page>;
  const amt = parseInt(amount.replace(/[^0-9]/g, ""), 10) || 0;
  const profit = Math.round((amt * plan.roi) / 100);
  const go = () => {
    if (amt < plan.min) { setErr(`You must invest at least ${bn(plan.min)} Tk`); return; }
    if (amt > plan.max) { setErr(`You can invest at most ${bn(plan.max)} Tk`); return; }
    const rec = store.placeInvestment({ planId: plan.id, planName: plan.n, amount: amt, roi: plan.roi, duration: plan.duration });
    router.push(`${base}/success/${rec.id}`);
  };
  return (
    <Page narrow>
      <Back href={`${base}/plans`} label="Plans" />
      <div className={`${card} p-6 text-center`}>
        <span className="grid h-20 w-20 mx-auto place-items-center rounded-3xl text-5xl" style={{ background: `${def.accent}1a` }}>{plan.e}</span>
        <h1 className="mt-3 text-2xl font-black">{plan.n}</h1>
        <p className={`mt-1 text-sm ${sub}`}>{plan.desc}</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className={`rounded-xl p-3 ${def.dark ? "bg-white/5" : "bg-slate-50"}`}>
            <p className="text-3xl font-black" style={{ color: def.accent }}>{plan.dailyRoi.toFixed(2)}%</p>
            <p className={`text-[11px] ${sub}`}>Daily profit</p>
          </div>
          <div className={`rounded-xl p-3 ${def.dark ? "bg-white/5" : "bg-slate-50"}`}>
            <p className="text-3xl font-black">{bn(plan.roi)}%</p>
            <p className={`text-[11px] ${sub}`}>Total / {plan.duration}</p>
          </div>
        </div>
        <div className={`mt-4 grid grid-cols-2 gap-2 text-sm`}>
          <div className={`rounded-xl p-3 ${def.dark ? "bg-white/5" : "bg-slate-50"}`}>
            <p className={`text-[11px] ${sub}`}>Minimum</p><p className="font-black">{bn(plan.min)} Tk</p>
          </div>
          <div className={`rounded-xl p-3 ${def.dark ? "bg-white/5" : "bg-slate-50"}`}>
            <p className={`text-[11px] ${sub}`}>Maximum</p><p className="font-black">{bn(plan.max)} Tk</p>
          </div>
        </div>
      </div>
      <div className={`${card} mt-4 p-5`}>
        <p className="text-sm font-black">💰 Investment amount</p>
        <FInput dark={def.dark} value={amount} onChange={(e) => { setAmount(e.target.value); setErr(""); }} placeholder={`${bn(plan.min)} – ${bn(plan.max)} Tk`} inputMode="numeric" className="mt-2" />
        {amt > 0 && (
          <div className={`mt-3 rounded-xl p-3 text-sm ${def.dark ? "bg-white/5" : "bg-slate-50"}`}>
            <p>Investment: <b>{bn(amt)} Tk</b></p>
            <p>Daily earnings: <b style={{ color: def.accent }}>+{bn(Math.round(amt * plan.dailyRoi / 100))} Tk/Enter</b></p>
            <p>Total profit: <b className="text-emerald-500">+{bn(profit)} Tk</b> ({plan.duration})</p>
            <p>Total return: <b>{bn(amt + profit)} Tk</b></p>
          </div>
        )}
        {err && <p className="mt-2 text-xs font-bold text-red-500">{err}</p>}
        <button onClick={go} className="btn-demo mt-4 w-full" style={{ background: def.accent }}>✅ Confirm investment</button>
        <p className={`mt-2 text-center text-[11px] ${sub}`}>Demo site — no real money is transacted</p>
      </div>
    </Page>
  );
}

export function InvestSuccess({ id }: { id: string }) {
  const { def, base, store } = useDemo();
  const { card } = useSkin();
  const inv = store.investments.find((x) => x.id === id);
  if (!inv) return <Page narrow><Empty emoji="🔍" text="Record not found" /></Page>;
  return (
    <Page narrow>
      <div className={`${card} p-8 text-center`}>
        <p className="text-6xl">🎉</p>
        <h1 className="mt-3 text-2xl font-black">Investment successful!</h1>
        <p className="mt-2 text-sm opacity-70">Your {bn(inv.amount)} Tk has been invested in {inv.planName}</p>
        <div className={`mt-4 rounded-xl p-4 text-left text-sm ${def.dark ? "bg-white/5" : "bg-slate-50"}`}>
          <p>🆔 ID: <b>{inv.id}</b></p>
          <p>📈 Expected profit: <b style={{ color: def.accent }}>+{bn(Math.round(inv.amount * inv.roi / 100))} Tk</b></p>
          <p>⏱️ Duration: {inv.duration}</p>
          <p>📌 Status: {inv.status}</p>
        </div>
        <Link href={`${base}/dashboard`} className="btn-demo mt-5 inline-block w-full" style={{ background: def.accent }}>View dashboard</Link>
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
      <SectionTitle t="💼 My investments" sub={store.user ? `${store.user.name}` : "Demo dashboard"} />
      <div className="grid grid-cols-2 gap-2">
        <div className={`${card} p-4 text-center`}>
          <p className={`text-[11px] ${sub}`}>Total investment</p>
          <p className="mt-1 text-xl font-black" style={{ color: def.accent }}>{bn(total)} Tk</p>
        </div>
        <div className={`${card} p-4 text-center`}>
          <p className={`text-[11px] ${sub}`}>Expected profit</p>
          <p className="mt-1 text-xl font-black text-emerald-500">+{bn(earnings)} Tk</p>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        {invs.length === 0 && <Empty emoji="📭" text="No investments yet" />}
        {invs.map((v) => (
          <div key={v.id} className={`${card} p-4`}>
            <div className="flex items-center justify-between">
              <p className="font-black">{v.planName}</p>
              <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-black text-emerald-500">{v.status}</span>
            </div>
            <p className={`mt-1 text-xs ${sub}`}>{v.id} • {new Date(v.date).toLocaleDateString("en-GB")}</p>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span>Investment: <b>{bn(v.amount)} Tk</b></span>
              <span>Profit: <b className="text-emerald-500">+{bn(Math.round(v.amount * v.roi / 100))}</b></span>
            </div>
          </div>
        ))}
      </div>
      <Link href={`${base}/plans`} className="btn-demo mt-5 block text-center" style={{ background: def.accent }}>+ New investment</Link>
    </Page>
  );
}

export function InvestHow() {
  const { def } = useDemo();
  const { card, sub } = useSkin();
  return (
    <Page narrow>
      <SectionTitle t="❓ How it works" />
      <div className="space-y-3">
        {[
          ["📝", "Open an account", "Register free with your mobile number."],
          ["📈", "Choose a plan", "Select a plan by your budget and goal."],
          ["💳", "Pay", "Pay securely via bKash, Nagad, Rocket or card."],
          ["💰", "Enjoy your profit", "Principal + profit goes straight to your account at term end."],
        ].map(([e, t, d]) => (
          <div key={t} className={`${card} flex gap-3 p-4`}>
            <span className="text-3xl">{e}</span>
            <div><p className="font-black">{t}</p><p className={`mt-1 text-xs ${sub}`}>{d}</p></div>
          </div>
        ))}
      </div>
      <p className={`mt-4 rounded-xl p-3 text-center text-[11px] ${sub} ${def.dark ? "bg-white/5" : "bg-slate-50"}`}>
        ⚠️ This is a demo website — do not invest real money here.
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
      <p className="text-sm font-black">💱 Currency converter</p>
      <div className={`mt-3 grid ${compact ? "grid-cols-1" : "grid-cols-2"} gap-3`}>
        <div>
          <label className={`text-[11px] ${sub}`}>You send</label>
          <div className="flex gap-2">
            <FSelect dark={def.dark} value={from} onChange={(e) => setFrom(e.target.value)} className="!w-28">
              {rates.map((r) => <option key={r.code} value={r.code}>{r.e} {r.code}</option>)}
              <option value="BDT">🇧🇩 BDT</option>
            </FSelect>
            <FInput dark={def.dark} value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" placeholder="Amount" />
          </div>
        </div>
        <div>
          <label className={`text-[11px] ${sub}`}>You receive</label>
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
        Exchange →
      </button>
    </div>
  );
}

export function ExchangeHome() {
  const { def, base, store } = useDemo();
  const banners = bannerSlides();
  const { card, sub } = useSkin();
  const rates = def.rates ?? [];
  return (
    <div>
      <Hero
        accent={def.accent}
        slides={[{ img: def.heroImg, emoji: def.heroEmoji, title: def.heroTitle, sub: def.heroSub, cta: "💱 Exchange now", href: "/exchange", grad: def.grad }, ...banners]}
      />
      <Page>
        <RateTicker />
        <div className="mt-4"><Converter /></div>
        <div className="mt-6">
          <SectionTitle t="📊 Today's rates" link={`${base}/rates`} />
          <div className={`${card} divide-y ${def.dark ? "divide-white/10" : "divide-slate-100"}`}>
            {rates.slice(0, 5).map((r) => (
              <div key={r.code} className="flex items-center gap-3 p-3">
                <span className="text-2xl">{r.e}</span>
                <div className="flex-1">
                  <p className="text-sm font-black">{r.code} <span className={`text-[11px] font-normal ${sub}`}>{r.name}</span></p>
                </div>
                <div className="text-right text-xs">
                  <p>Buy: <b style={{ color: def.accent }}>{bn(r.buy)}</b></p>
                  <p className={sub}>Sell: {bn(r.sell)}</p>
                </div>
                <span className={`text-[11px] font-black ${r.change >= 0 ? "text-emerald-500" : "text-red-500"}`}>{r.change >= 0 ? "▲" : "▼"}{Math.abs(r.change)}%</span>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-6 grid grid-cols-3 gap-2 text-center">
          {[["⚡", "In 5 minutes", "Delivery"], ["🛡️", "100%", "Safe"], ["💬", "24/7", "Support"]].map(([e, v, t]) => (
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
      <Back href={`/demo${def.slug}`} label="Home" />
      <SectionTitle t="📊 Live exchange rates" sub="Updated every minute (demo)" />
      <div className={`${card} divide-y overflow-hidden ${def.dark ? "divide-white/10" : "divide-slate-100"}`}>
        <div className={`grid grid-cols-4 gap-2 p-3 text-[11px] font-black uppercase ${sub}`}>
          <span>Currency</span><span className="text-right">We buy</span><span className="text-right">We sell</span><span className="text-right">Change</span>
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
      <p className={`mt-3 text-center text-[11px] ${sub}`}>Demo rates — verify with support before any real transaction</p>
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
    if (amt <= 0) { setErr("Enter a valid amount"); return; }
    if (from === to) { setErr("Choose two different currencies"); return; }
    setErr(""); setStep(1);
  };
  const confirm = () => {
    if (name.trim().length < 3) { setErr("Enter your name"); return; }
    if (!/^01[3-9]\d{8}$/.test(phone.trim())) { setErr("Enter a valid mobile number"); return; }
    if (!account.trim()) { setErr("Enter the recipient's account/wallet address"); return; }
    const rec = store.placeExchange({ from, to, amount: amt, result: Math.round(result * 100) / 100, name: name.trim(), phone: phone.trim() });
    router.push(`${base}/success/${rec.id}`);
  };
  return (
    <Page narrow>
      <Back href={`/demo${def.slug}`} label="Home" />
      <SectionTitle t="💱 Exchange order" sub={step === 0 ? "Step 1: Amount" : "Step 2: Details & confirm"} />
      {step === 0 && (
        <div className={`${card} space-y-3 p-5`}>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={`text-[11px] ${sub}`}>You give</label>
              <FSelect dark={def.dark} value={from} onChange={(e) => setFrom(e.target.value)}>
                {rates.map((r) => <option key={r.code} value={r.code}>{r.e} {r.code}</option>)}
                <option value="BDT">🇧🇩 BDT</option>
              </FSelect>
            </div>
            <div>
              <label className={`text-[11px] ${sub}`}>You take</label>
              <FSelect dark={def.dark} value={to} onChange={(e) => setTo(e.target.value)}>
                <option value="BDT">🇧🇩 BDT</option>
                {rates.map((r) => <option key={r.code} value={r.code}>{r.e} {r.code}</option>)}
              </FSelect>
            </div>
          </div>
          <div>
            <label className={`text-[11px] ${sub}`}>Amount ({from})</label>
            <FInput dark={def.dark} value={amount} onChange={(e) => { setAmount(e.target.value); setErr(""); }} inputMode="decimal" placeholder="0.00" />
          </div>
          {amt > 0 && from !== to && (
            <div className={`rounded-xl p-4 text-center ${def.dark ? "bg-white/5" : "bg-slate-50"}`}>
              <p className={`text-[11px] ${sub}`}>You will receive</p>
              <p className="text-3xl font-black" style={{ color: def.accent }}>{result.toLocaleString("en-IN", { maximumFractionDigits: 2 })} {to}</p>
              <p className={`mt-1 text-[11px] ${sub}`}>Rate: 1 {from} = {(from === "BDT" ? 1 / (rTo?.sell ?? 1) : (rFrom?.buy ?? 0) / (to === "BDT" ? 1 : rTo?.sell ?? 1)).toFixed(4)} {to}</p>
            </div>
          )}
          {err && <p className="text-xs font-bold text-red-500">{err}</p>}
          <button onClick={next} className="btn-demo w-full" style={{ background: def.accent }}>Next →</button>
        </div>
      )}
      {step === 1 && (
        <div className={`${card} space-y-3 p-5`}>
          <div className={`rounded-xl p-3 text-sm ${def.dark ? "bg-white/5" : "bg-slate-50"}`}>
            <p><b>{amt} {from}</b> → <b style={{ color: def.accent }}>{result.toLocaleString("en-IN", { maximumFractionDigits: 2 })} {to}</b></p>
          </div>
          <FInput dark={def.dark} value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
          <FInput dark={def.dark} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Mobile number (01XXXXXXXXX)" inputMode="tel" />
          <FInput dark={def.dark} value={account} onChange={(e) => setAccount(e.target.value)} placeholder={to === "BDT" ? "bKash/Nagad number" : `${to} wallet address`} />
          {err && <p className="text-xs font-bold text-red-500">{err}</p>}
          <div className="flex gap-2">
            <button onClick={() => setStep(0)} className="btn-demo-ghost flex-1">← Go back</button>
            <button onClick={confirm} className="btn-demo flex-1" style={{ background: def.accent }}>✅ Confirm</button>
          </div>
          <p className={`text-center text-[11px] ${sub}`}>Demo site — no real money is transacted</p>
        </div>
      )}
    </Page>
  );
}

export function ExchangeSuccess({ id }: { id: string }) {
  const { def, base, store } = useDemo();
  const { card } = useSkin();
  const ex = store.exchanges.find((x) => x.id === id);
  if (!ex) return <Page narrow><Empty emoji="🔍" text="Record not found" /></Page>;
  return (
    <Page narrow>
      <div className={`${card} p-8 text-center`}>
        <p className="text-6xl">✅</p>
        <h1 className="mt-3 text-2xl font-black">Order received!</h1>
        <p className="mt-2 text-sm opacity-70">{ex.amount} {ex.from} → {ex.result} {ex.to}</p>
        <div className={`mt-4 rounded-xl p-4 text-left text-sm ${def.dark ? "bg-white/5" : "bg-slate-50"}`}>
          <p>🆔 Tracking: <b>{ex.id}</b></p>
          <p>📌 Status: {ex.status}</p>
          <p>⏱️ Completed within 5–30 minutes (demo)</p>
        </div>
        <Link href={`${base}/track?id=${ex.id}`} className="btn-demo mt-5 inline-block w-full" style={{ background: def.accent }}>Track</Link>
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
      <Back href={`/demo${def.slug}`} label="Home" />
      <SectionTitle t="📍 Track exchange" />
      <div className={`${card} p-5`}>
        <div className="flex gap-2">
          <FInput dark={def.dark} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tracking ID (e.g. EX-...)" />
          <button onClick={search} className="btn-demo shrink-0" style={{ background: def.accent }}>Search</button>
        </div>
        {found === null && <p className="mt-3 text-center text-sm font-bold text-red-500">Record not found</p>}
        {found && (
          <div className={`mt-4 rounded-xl p-4 text-sm ${def.dark ? "bg-white/5" : "bg-slate-50"}`}>
            <p>🆔 {found.id}</p>
            <p className="mt-1"><b>{found.amount} {found.from}</b> → <b style={{ color: def.accent }}>{found.result} {found.to}</b></p>
            <p className="mt-1">📌 Status: {found.status}</p>
            <p className={`text-xs ${sub}`}>{new Date(found.date).toLocaleString("en-GB")}</p>
          </div>
        )}
      </div>
      {store.exchanges.length > 0 && (
        <div className="mt-4">
          <SectionTitle t="🕘 Recent orders" />
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

const DEMO_BALANCES: Record<string, number> = { BTC: 0.245, ETH: 3.8, USDT: 1250, BNB: 12.5, SOL: 45.2, TRX: 8500 };

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
  const { def, base, store } = useDemo();
  const banners = bannerSlides();
  const { card, sub } = useSkin();
  const coins = def.coins ?? [];
  const portfolio = coins.reduce((s, c) => s + (DEMO_BALANCES[c.code] ?? 0) * c.price, 0);
  return (
    <div>
      <Hero
        accent={def.accent}
        slides={[{ img: def.heroImg, emoji: def.heroEmoji, title: def.heroTitle, sub: def.heroSub, cta: "👛 Open wallet", href: "/wallet", grad: def.grad }, ...banners]}
      />
      <Page>
        <div className={`${card} p-5 text-center`}>
          <p className={`text-[11px] ${sub}`}>Total portfolio (demo)</p>
          <p className="mt-1 text-3xl font-black" style={{ color: def.accent }}>${bn(portfolio)}</p>
          <Link href={`${base}/wallet`} className="btn-demo mt-3 inline-block" style={{ background: def.accent }}>Dashboard →</Link>
        </div>
        <div className="mt-6">
          <SectionTitle t="🪙 Supported coins" />
          <div className="space-y-2">
            {coins.map((c) => <CoinRow key={c.code} coin={c} />)}
          </div>
        </div>
        <div className="mt-6 grid grid-cols-3 gap-2 text-center">
          {[["🔐", "Secure", "2-layer security"], ["⚡", "Fast", "Transfer in seconds"], ["🌍", "Global", "150+ countries"]].map(([e, v, t]) => (
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
      <SectionTitle t="👛 My wallet" sub={store.user ? store.user.name : "Demo wallet"} />
      <div className={`${card} p-6 text-center`} style={{ background: `linear-gradient(135deg, ${def.accent}22, transparent)` }}>
        <p className={`text-[11px] ${sub}`}>Total balance</p>
        <p className="mt-1 text-4xl font-black">${bn(portfolio)}</p>
        <div className="mt-4 flex gap-2">
          <Link href={`${base}/send`} className="btn-demo flex-1" style={{ background: def.accent }}>📤 Send</Link>
          <Link href={`${base}/receive`} className="btn-demo-ghost flex-1">📥 Receive</Link>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        {coins.map((c) => <CoinRow key={c.code} coin={c} />)}
      </div>
      <div className="mt-6">
        <SectionTitle t="🕘 Transaction history" />
        {store.coinTxs.length === 0 && <Empty emoji="📭" text="No transactions yet" />}
        <div className="space-y-2">
          {store.coinTxs.map((t) => (
            <div key={t.id} className={`${card} flex items-center gap-3 p-3`}>
              <span className={`grid h-10 w-10 place-items-center rounded-full text-lg ${t.kind === "send" ? "bg-red-500/15" : "bg-emerald-500/15"}`}>
                {t.kind === "send" ? "📤" : "📥"}
              </span>
              <div className="flex-1 text-sm">
                <p className="font-bold">{t.kind === "send" ? "Sent" : "Received"} — {t.amount} {t.coin}</p>
                <p className={`text-[11px] ${sub}`}>{t.addr.slice(0, 18)}... • {new Date(t.date).toLocaleString("en-GB")}</p>
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
    if (addr.trim().length < 10) { setErr("Enter a valid wallet address"); return; }
    if (amt <= 0) { setErr("Enter a valid amount"); return; }
    if (amt > bal) { setErr(`Insufficient balance (have ${bal} ${coin})`); return; }
    const rec = store.placeCoinTx({ kind: "send", coin, amount: amt, addr: addr.trim() });
    router.push(`${base}/wallet`);
  };
  return (
    <Page narrow>
      <Back href={`${base}/wallet`} label="Wallet" />
      <SectionTitle t="📤 Send coins" />
      <div className={`${card} space-y-3 p-5`}>
        <div>
          <label className={`text-[11px] ${sub}`}>Coin</label>
          <FSelect dark={def.dark} value={coin} onChange={(e) => setCoin(e.target.value)}>
            {coins.map((c) => <option key={c.code} value={c.code}>{c.e} {c.code} — Balance {DEMO_BALANCES[c.code] ?? 0}</option>)}
          </FSelect>
        </div>
        <div>
          <label className={`text-[11px] ${sub}`}>Recipient address</label>
          <FInput dark={def.dark} value={addr} onChange={(e) => { setAddr(e.target.value); setErr(""); }} placeholder="0x... or bc1..." />
        </div>
        <div>
          <label className={`text-[11px] ${sub}`}>Amount</label>
          <FInput dark={def.dark} value={amount} onChange={(e) => { setAmount(e.target.value); setErr(""); }} inputMode="decimal" placeholder="0.00" />
        </div>
        {err && <p className="text-xs font-bold text-red-500">{err}</p>}
        <button onClick={send} className="btn-demo w-full" style={{ background: def.accent }}>📤 Send</button>
        <p className={`text-center text-[11px] ${sub}`}>Demo wallet — no real crypto is sent</p>
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
      <Back href={`${base}/wallet`} label="Wallet" />
      <SectionTitle t="📥 Receive coins" />
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
        <button onClick={copy} className="btn-demo mt-3 w-full" style={{ background: def.accent }}>{copied ? "✅ Copied!" : "📋 Copy address"}</button>
        <button onClick={simulate} className="btn-demo-ghost mt-2 w-full">🎁 Demo: 0.01 {coin} Receive</button>
        <p className={`mt-2 text-[11px] ${sub}`}>Send only {coin} — other coins will be lost (demo)</p>
      </div>
    </Page>
  );
}

/* ================= Shared DEPOSIT flow (invest / exchange / wallet) ================= */

const DEPOSIT_METHODS = [
  { id: "bkash", n: "bKash", e: "🩷", num: "01XXX-XXXXXX" },
  { id: "nagad", n: "Nagad", e: "🧡", num: "01XXX-XXXXXX" },
  { id: "rocket", n: "Rocket", e: "💜", num: "01XXX-XXXXXX" },
  { id: "card", n: "Card", e: "💳", num: "Online payment" },
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
    if (amt < 100) { setErr("Deposit at least 100 Tk"); return; }
    if (method !== "card" && trxId.trim().length < 6) { setErr("Enter the payment TrxID"); return; }
    const rec = store.placeDeposit({ amount: amt, method: m.n, trxId: trxId.trim() || "CARD" });
    setDone(rec.id);
  };

  if (done) {
    const rec = store.deposits.find((d) => d.id === done);
    return (
      <Page narrow>
        <div className={`${card} p-8 text-center`}>
          <p className="text-6xl">⏳</p>
          <h1 className="mt-3 text-2xl font-black">Deposit request received!</h1>
          <p className="mt-2 text-sm opacity-70">{bn(amt)} Tk — {m.n}</p>
          <div className={`mt-4 rounded-xl p-4 text-left text-sm ${def.dark ? "bg-white/5" : "bg-slate-50"}`}>
            <p>🆔 ID: <b>{done}</b></p>
            <p>📌 Status: <b className="text-amber-500">{rec?.status ?? "Pending"}</b></p>
            <p className={`mt-1 text-xs ${sub}`}>Added to balance after verification (demo)</p>
          </div>
          <Link href={base} className="btn-demo mt-5 inline-block w-full" style={{ background: def.accent }}>Back to home</Link>
        </div>
      </Page>
    );
  }

  return (
    <Page narrow>
      <Back href={base} label="Home" />
      <SectionTitle t="💰 Deposit" sub="Add money to your balance" />
      <div className={`${card} p-5`}>
        <p className="text-sm font-black">💵 Amount</p>
        <FInput dark={def.dark} value={amount} onChange={(e) => { setAmount(e.target.value); setErr(""); }} inputMode="numeric" placeholder="e.g. 5000" className="mt-2" />
        <p className="mt-4 text-sm font-black">📲 Payment method</p>
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
          <p>📞 {m.n} number: <b>{def.contact}</b></p>
          <p className={`mt-1 text-xs ${sub}`}>To the number above, send {amt > 0 ? bn(amt) : "___"} Tk and enter the TrxID</p>
        </div>
        {method !== "card" && (
          <div className="mt-3">
            <p className="text-sm font-black">🔑 TrxID</p>
            <FInput dark={def.dark} value={trxId} onChange={(e) => { setTrxId(e.target.value); setErr(""); }} placeholder="e.g. 9HX7K2LMN1" className="mt-2" />
          </div>
        )}
        {err && <p className="mt-2 text-xs font-bold text-red-500">{err}</p>}
        <button onClick={submit} className="btn-demo mt-4 w-full" style={{ background: def.accent }}>
          ✅ {amt > 0 ? `${bn(amt)} Tk ` : ""}Deposit Confirm
        </button>
        <p className={`mt-2 text-center text-[11px] ${sub}`}>Demo site — no real money is transacted</p>
      </div>
      {store.deposits.length > 0 && (
        <div className="mt-4">
          <SectionTitle t="🕘 Deposit history" />
          <div className="space-y-2">
            {store.deposits.slice(0, 5).map((d) => (
              <div key={d.id} className={`${card} flex items-center justify-between p-3 text-sm`}>
                <div>
                  <p className="font-bold">{bn(d.amount)} Tk <span className={`font-normal ${sub}`}>• {d.method}</span></p>
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
