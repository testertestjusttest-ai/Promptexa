"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatBDT, toBnDigits } from "@/lib/format";
import WebDevHeroBg from "./WebDevHeroBg";
import DemoSlider from "./DemoSlider";
import { DEMOS } from "./demos/demos";

const PACKAGES = [
  {
    name: "স্টার্টার",
    price: 4999,
    desc: "ছোট ব্যবসা / পোর্টফোলিওর জন্য",
    features: ["৫ পেজ পর্যন্ত", "মোবাইল রেসপন্সিভ", "WhatsApp বাটন", "বেসিক SEO", "১ মাস ফ্রি সাপোর্ট"],
  },
  {
    name: "বিজনেস",
    price: 12999,
    desc: "ই-কমার্স / কোম্পানির জন্য (জনপ্রিয়)",
    features: ["আনলিমিটেড পেজ", "অ্যাডমিন প্যানেল", "পেমেন্ট গেটওয়ে", "অ্যাডভান্সড SEO", "৩ মাস ফ্রি সাপোর্ট"],
    hot: true,
  },
  {
    name: "প্রিমিয়াম",
    price: 29999,
    desc: "কাস্টম ওয়েব অ্যাপ / মার্কেটপ্লেস",
    features: ["কাস্টম ডিজাইন + ফিচার", "মোবাইল অ্যাপ (PWA)", "লাইভ চ্যাট সিস্টেম", "পারফরম্যান্স অপটিমাইজ", "৬ মাস ফ্রি সাপোর্ট"],
  },
];

const SITE_TYPES = ["বিজনেস ওয়েবসাইট", "ই-কমার্স শপ", "পোর্টফোলিও", "ব্লগ / নিউজ", "মার্কেটপ্লেস", "অন্যান্য"];

const TECH = ["⚡ Next.js", "🎨 Tailwind", "📱 PWA", "🔍 SEO", "💳 পেমেন্ট গেটওয়ে", "🌍 বহুভাষিক", "🛡️ সিকিউর", "🚀 ফাস্ট লোডিং"];

export default function WebDevClient() {
  const ROTATE = ["ওয়েবসাইট", "ই-কমার্স শপ", "ক্যাসিনো সাইট", "ক্রিপ্টো এক্সচেঞ্জ", "নিউজ পোর্টাল", "বুকিং সাইট"];
  const [wordIdx, setWordIdx] = useState(0);
  useEffect(() => { const t = setInterval(() => setWordIdx((i) => (i + 1) % ROTATE.length), 2400); return () => clearInterval(t); }, []);
  const [form, setForm] = useState({ name: "", phone: "", site_type: SITE_TYPES[0], features: "", budget_range: "৫–১৫ হাজার", details: "" });
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    if (!form.name.trim()) return setMsg("⚠️ আপনার নাম দিন");
    if (!/^01[3-9]\d{8}$/.test(form.phone.trim())) return setMsg("⚠️ সঠিক মোবাইল নম্বর দিন");
    setSending(true);
    try {
      const res = await fetch("/api/services/web-dev", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "হয়নি");
      setMsg("🎉 রিকোয়েস্ট পাঠানো হয়েছে! আমাদের টিম শীঘ্রই কল করবে।");
      setForm({ name: "", phone: "", site_type: SITE_TYPES[0], features: "", budget_range: "৫–১৫ হাজার", details: "" });
    } catch (e) {
      setMsg(`⚠️ ${e instanceof Error ? e.message : "ব্যর্থ"}`);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      {/* hero — 2026 split design with live demo preview */}
      <div className="relative overflow-hidden rounded-[36px] border border-white/10 bg-[#070b16]">
        {/* mesh background */}
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <WebDevHeroBg />
          <div className="absolute inset-0 opacity-[0.16]" style={{ backgroundImage: "linear-gradient(#ffffff22 1px, transparent 1px), linear-gradient(90deg, #ffffff22 1px, transparent 1px)", backgroundSize: "44px 44px", maskImage: "radial-gradient(ellipse 90% 70% at 50% 0%, black 30%, transparent 75%)", WebkitMaskImage: "radial-gradient(ellipse 90% 70% at 50% 0%, black 30%, transparent 75%)" }} />
          <div className="absolute -left-24 top-1/3 h-72 w-72 rounded-full bg-[#d7ff3f]/10 blur-[100px]" />
          <div className="absolute -right-16 top-10 h-64 w-64 rounded-full bg-fuchsia-500/10 blur-[100px]" />
        </div>

        <div className="relative grid items-center gap-10 p-7 sm:p-10 lg:grid-cols-[1.05fr_0.95fr] lg:p-12">
          {/* left — copy */}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#d7ff3f] px-3.5 py-1.5 text-[11px] font-black text-black shadow-[0_6px_20px_rgba(215,255,63,0.35)]">
                <span className="relative flex h-2 w-2"><span className="absolute h-full w-full animate-ping rounded-full bg-black/50" /><span className="h-2 w-2 rounded-full bg-black" /></span>
                লাইভ — অর্ডার চলছে
              </span>
              <span className="rounded-full border border-white/20 bg-white/5 px-3.5 py-1.5 text-[11px] font-bold text-slate-300 backdrop-blur">✨ ১০০+ প্রজেক্ট ডেলিভারিড</span>
            </div>
            <h1 className="font-display mt-5 text-[34px] font-black leading-[1.12] text-white sm:text-5xl lg:text-[54px]">
              আপনার ব্যবসার
              <br />
              <span key={wordIdx} className="dp-word-in inline-block bg-gradient-to-r from-lime-300 via-[#d7ff3f] to-emerald-300 bg-clip-text text-transparent">{ROTATE[wordIdx]}</span>
              <br />
              বানিয়ে নিন আজই
            </h1>
            <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-slate-300">
              ডিজাইন, অ্যাডমিন প্যানেল, পেমেন্ট, ডোমেইন — সবসহ <b className="text-white">সম্পূর্ণ রেডি ওয়েবসাইট</b>।
              নিচের লাইভ ডেমোগুলো ঘুরে দেখুন — যেটা পছন্দ, সেটাই হবে আপনার সাইট।
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#demos" className="btn-vault inline-flex !px-7 !py-3.5 text-sm shadow-[0_10px_32px_rgba(215,255,63,0.35)]">
                🖥️ {toBnDigits(DEMOS.length)}টি লাইভ ডেমো দেখুন
              </a>
              <a href="#quote" className="inline-flex items-center rounded-xl border border-white/25 bg-white/5 px-7 py-3.5 text-sm font-bold text-white backdrop-blur transition hover:border-[#d7ff3f]/60 hover:bg-white/10">
                📝 ফ্রি কোট নিন
              </a>
            </div>
            {/* stats */}
            <div className="mt-8 grid max-w-md grid-cols-3 divide-x divide-white/10 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur">
              {[[`${toBnDigits(DEMOS.length)}+`, "লাইভ ডেমো"], ["৩০–৬০+", "পেজ প্রতি সাইটে"], ["৭–১৪ দিন", "ডেলিভারি"]].map(([v, t]) => (
                <div key={t} className="px-4 py-3 text-center">
                  <p className="font-display text-lg font-black text-white">{v}</p>
                  <p className="text-[10px] font-bold text-slate-400">{t}</p>
                </div>
              ))}
            </div>
          </div>

          {/* right — live preview */}
          <div className="relative mx-auto w-full max-w-[430px]">
            <div className="absolute -inset-6 rounded-[40px] bg-gradient-to-tr from-[#d7ff3f]/15 via-transparent to-fuchsia-500/15 blur-2xl" aria-hidden />
            <Link href="/demobinancepro" className="group relative block overflow-hidden rounded-3xl border border-white/15 bg-[#0b1120] shadow-[0_30px_80px_rgba(0,0,0,0.6)] transition duration-500 hover:-translate-y-1.5 hover:rotate-[0.5deg]">
              <div className="flex items-center gap-1.5 border-b border-white/10 bg-white/5 px-3.5 py-2.5">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400" /><span className="h-2.5 w-2.5 rounded-full bg-amber-300" /><span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                <span className="ml-2 flex-1 truncate rounded-md bg-black/40 px-2.5 py-1 text-[10px] text-slate-400">🔒 promptexa.vercel.app/demobinancepro</span>
                <span className="rounded bg-red-500 px-1.5 py-0.5 text-[9px] font-black text-white">LIVE</span>
              </div>
              <div className="pointer-events-none max-h-[340px] overflow-hidden [&_*]:!cursor-default">
                {DEMOS[0].render()}
              </div>
              <div className="flex items-center justify-between border-t border-white/10 px-4 py-3">
                <div>
                  <p className="text-sm font-black text-white">{DEMOS[0].name}</p>
                  <p className="text-[11px] text-slate-400">{DEMOS[0].type} • ৬৬+ পেজ</p>
                </div>
                <span className="rounded-full bg-[#d7ff3f] px-3.5 py-1.5 text-[11px] font-black text-black">ডেমো খুলুন →</span>
              </div>
            </Link>
            {/* floating glass cards */}
            <div className="animate-float-slow absolute -left-4 top-16 hidden rounded-2xl border border-white/15 bg-[#0d1424]/90 px-3.5 py-2.5 shadow-2xl backdrop-blur sm:block" style={{ ["--tilt" as any]: "-4deg" }}>
              <p className="text-[10px] font-bold text-slate-400">💰 নতুন অর্ডার</p>
              <p className="text-sm font-black text-white">#১০২৪ • ১,২৫০ টাকা</p>
            </div>
            <div className="animate-float-slow absolute -right-3 bottom-20 hidden rounded-2xl border border-white/15 bg-[#0d1424]/90 px-3.5 py-2.5 shadow-2xl backdrop-blur sm:block" style={{ ["--tilt" as any]: "4deg", animationDelay: "-2.5s" }}>
              <p className="text-[10px] font-bold text-slate-400">📈 আজকের বিক্রি</p>
              <p className="text-sm font-black text-emerald-300">+৩৪% বৃদ্ধি</p>
            </div>
          </div>
        </div>

        {/* marquee */}
        <div className="relative border-t border-white/10 bg-black/30 py-3">
          <div className="pointer-events-none overflow-hidden" aria-hidden>
            <div className="animate-marquee-x flex w-max gap-8">
              {[...TECH, ...TECH].map((t, i) => (
                <span key={i} className="whitespace-nowrap text-xs font-bold text-slate-300">{t}</span>
              ))}
            </div>
          </div>
        </div>
        <style>{`@keyframes dp-word { 0% { opacity: 0; transform: translateY(14px) } 100% { opacity: 1; transform: translateY(0) } } .dp-word-in { animation: dp-word .45s ease both }`}</style>
      </div>

      {/* demo showcase slider */}
      <DemoSlider />

      {/* bento features */}
      <div className="mt-14">
        <p className="text-center text-[11px] font-black uppercase tracking-[0.3em] text-[#d7ff3f]">কেন DigiPlyra</p>
        <h2 className="font-display mt-2 text-center text-2xl font-bold text-white sm:text-3xl">শুধু ওয়েবসাইট নয় — সম্পূর্ণ ব্যবসার সিস্টেম</h2>
        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* big admin card */}
          <div className="glass relative overflow-hidden rounded-3xl p-5 sm:col-span-2">
            <div className="pointer-events-none absolute -right-8 -top-8 text-[110px] opacity-10">⚙️</div>
            <p className="text-2xl">⚙️</p>
            <p className="mt-2 font-display text-lg font-bold text-white">শক্তিশালী অ্যাডমিন প্যানেল</p>
            <p className="mt-1 max-w-sm text-sm text-slate-400">প্রোডাক্ট, অর্ডার, কাস্টমার, রেভিনিউ — সবকিছু নিজে কন্ট্রোল করুন। কোড ছোঁয়ার দরকার নেই।</p>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              {[["১২,৪৫০", "আজকের বিক্রি (টাকা)"], ["৩৪", "নতুন অর্ডার"], ["৯৮%", "হ্যাপি ক্লায়েন্ট"]].map(([v, t]) => (
                <div key={t} className="rounded-xl bg-white/5 px-2 py-2.5 ring-1 ring-white/10">
                  <p className="font-black text-[#d7ff3f]">{v}</p>
                  <p className="text-[9px] font-bold text-slate-400">{t}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="glass rounded-3xl p-5">
            <p className="text-2xl">💳</p>
            <p className="mt-2 font-display text-lg font-bold text-white">সব পেমেন্ট</p>
            <p className="mt-1 text-sm text-slate-400">বিকাশ, নগদ, রকেট, কার্ড — অর্ডার এলেই পেমেন্ট সরাসরি আপনার কাছে।</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {["বিকাশ", "নগদ", "রকেট", "💳 কার্ড"].map((m) => <span key={m} className="rounded-full bg-white/8 px-2.5 py-1 text-[11px] font-bold text-slate-200 ring-1 ring-white/15">{m}</span>)}
            </div>
          </div>
          <div className="glass rounded-3xl p-5">
            <p className="text-2xl">🌐</p>
            <p className="mt-2 font-display text-lg font-bold text-white">নিজের ডোমেইন</p>
            <p className="mt-1 text-sm text-slate-400">আপনার নিজের .com ডোমেইনে সাইট চলবে — সম্পূর্ণ আপনার ব্র্যান্ডে, হোয়াইট-লেবেল।</p>
          </div>
          <div className="glass rounded-3xl p-5">
            <p className="text-2xl">📢</p>
            <p className="mt-2 font-display text-lg font-bold text-white">বিজ্ঞাপনে আয়</p>
            <p className="mt-1 text-sm text-slate-400">Adsterra / Monetag বিজ্ঞাপন বসিয়ে ভিজিটর থেকেও বাড়তি আয় করুন।</p>
          </div>
          <div className="glass rounded-3xl p-5">
            <p className="text-2xl">🔍</p>
            <p className="mt-2 font-display text-lg font-bold text-white">SEO রেডি</p>
            <p className="mt-1 text-sm text-slate-400">গুগলে খুঁজে পাওয়া সহজ — মেটা, সাইটম্যাপ, ফাস্ট লোডিং সব বিল্ট-ইন।</p>
          </div>
          <div className="glass relative overflow-hidden rounded-3xl p-5 sm:col-span-2">
            <div className="pointer-events-none absolute -right-8 -top-8 text-[110px] opacity-10">🎰</div>
            <p className="text-2xl">🎰</p>
            <p className="mt-2 font-display text-lg font-bold text-white">ক্যাসিনো / এক্সচেঞ্জের মতো বড় প্রজেক্টও</p>
            <p className="mt-1 max-w-sm text-sm text-slate-400">২,০০০+ নিজস্ব গেম, লাইভ বেটিং, ট্রেডিং — ৬০+ পেজের মেগা প্ল্যাটফর্মও বানিয়ে দিই। গেমের উইন-চান্স (RTP) পর্যন্ত ওনার নিজে কন্ট্রোল করতে পারে।</p>
            <Link href="/democasinoplay" className="mt-3 inline-block rounded-full bg-[#d7ff3f]/15 px-4 py-1.5 text-xs font-black text-[#d7ff3f] ring-1 ring-[#d7ff3f]/40">🎰 ক্যাসিনো ডেমো দেখুন →</Link>
          </div>
        </div>
      </div>

      {/* packages */}
      <h2 className="font-display mt-12 text-center text-2xl font-bold text-white">💎 প্যাকেজ ও আনুমানিক প্রাইস</h2>
      <div className="mt-6 grid gap-5 md:grid-cols-3">
        {PACKAGES.map((p) => (
          <div key={p.name} className={`glass rounded-3xl p-6 ${p.hot ? "ring-2 ring-[#d7ff3f]/60" : ""}`}>
            {p.hot && (
              <span className="mb-3 inline-block rounded-full bg-[#d7ff3f] px-3 py-1 text-xs font-bold text-black">
                🔥 জনপ্রিয়
              </span>
            )}
            <h3 className="font-display text-xl font-bold text-white">{p.name}</h3>
            <p className="mt-1 text-xs text-slate-500">{p.desc}</p>
            <p className="font-display mt-3 text-3xl font-bold text-[#d7ff3f]">{formatBDT(p.price)}</p>
            <p className="text-[11px] text-slate-500">থেকে শুরু</p>
            <ul className="mt-4 space-y-2">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-slate-300">
                  <span className="text-[#d7ff3f]">✓</span> {f}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* process */}
      <h2 className="font-display mt-12 text-center text-2xl font-bold text-white">⚙️ যেভাবে কাজ করি</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        {[
          ["📝", "রিকোয়েস্ট", "ফর্ম পূরণ করুন — কী ধরনের সাইট চান"],
          ["📞", "আলোচনা", "আমাদের টিম কল করে ডিটেইল বুঝে নেবে"],
          ["💰", "কোট ও পেমেন্ট", "ফাইনাল প্রাইস ঠিক করে ৫০% অ্যাডভান্স"],
          ["🚀", "ডেলিভারি", "৭–১৪ দিনে সাইট লাইভ + সাপোর্ট"],
        ].map(([icon, t, d], i) => (
          <div key={t} className="glass rounded-2xl p-5 text-center">
            <div className="text-3xl">{icon}</div>
            <p className="mt-2 text-sm font-bold text-white">
              {toBnDigits(i + 1)}. {t}
            </p>
            <p className="mt-1 text-xs text-slate-400">{d}</p>
          </div>
        ))}
      </div>

      {/* demo gallery */}
      <div id="demos" className="mt-14 scroll-mt-24">
        <h2 className="font-display text-center text-2xl font-bold text-white">🖥️ লাইভ ডেমো গ্যালারি</h2>
        <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-slate-400">
          {DEMOS.length} ধরনের প্রফেশনাল ওয়েবসাইটের ডেমো — কার্ডে ক্লিক করলে পুরো ডেমো দেখতে পারবেন।
          আপনার ব্যবসার জন্য এরকম সাইট বানিয়ে দেব!
        </p>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {DEMOS.slice(0, 9).map((d) => (
            <Link key={d.slug} href={`/demo${d.slug}`} className="tilt-card group block overflow-hidden rounded-3xl border border-white/10 bg-[#0b1120] transition hover:border-[#d7ff3f]/40">
              <div className="pointer-events-none max-h-[300px] overflow-hidden [&_*]:!cursor-default">
                {d.render()}
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-white">{d.name}</p>
                  <span className="rounded-full bg-[#d7ff3f]/15 px-2.5 py-1 text-[10px] font-bold text-[#d7ff3f]">{d.price}</span>
                </div>
                <p className="mt-1 text-xs text-slate-400">{d.type}</p>
                <p className="mt-1 line-clamp-1 text-xs text-slate-500">{d.desc}</p>
                <span className="mt-2.5 block rounded-xl bg-[#d7ff3f]/10 px-3 py-2 text-center text-xs font-black text-[#d7ff3f] ring-1 ring-[#d7ff3f]/30 transition group-hover:bg-[#d7ff3f]/20">
                  👁️ ডেমো ওয়েবসাইট দেখতে ক্লিক করুন
                </span>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link href="/demos" className="btn-vault inline-flex !px-10 !py-3.5 text-base">
            🖥️ সব {DEMOS.length}টি ডেমো দেখুন →
          </Link>
        </div>
      </div>

      {/* quote form */}
      <div id="quote" className="glass mt-12 scroll-mt-24 rounded-3xl p-6 sm:p-8">
        <h2 className="font-display text-2xl font-bold text-white">📋 ফ্রি কোট রিকোয়েস্ট</h2>
        <p className="mt-1 text-sm text-slate-400">ফর্মটি পূরণ করুন — ২৪ ঘণ্টার মধ্যে কল পাবেন।</p>
        <form onSubmit={submit} className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm text-slate-300">আপনার নাম *</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="field" placeholder="নাম" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-slate-300">মোবাইল নম্বর *</label>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="field" placeholder="01XXXXXXXXX" inputMode="numeric" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-slate-300">কী ধরনের ওয়েবসাইট চান? *</label>
            <select value={form.site_type} onChange={(e) => setForm({ ...form, site_type: e.target.value })} className="field">
              {SITE_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-slate-300">আনুমানিক বাজেট</label>
            <select value={form.budget_range} onChange={(e) => setForm({ ...form, budget_range: e.target.value })} className="field">
              {["৫ হাজারের নিচে", "৫–১৫ হাজার", "১৫–৩০ হাজার", "৩০ হাজার+"].map((b) => <option key={b}>{b}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm text-slate-300">কী কী ফিচার লাগবে?</label>
            <input value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} className="field" placeholder="যেমন: অনলাইন পেমেন্ট, লাইভ চ্যাট, বাংলা ভাষা..." />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm text-slate-300">বিস্তারিত লিখুন</label>
            <textarea value={form.details} onChange={(e) => setForm({ ...form, details: e.target.value })} className="field min-h-[100px]" placeholder="আপনার ব্যবসা / আইডিয়া সম্পর্কে বিস্তারিত..." maxLength={2000} />
          </div>
          {msg && <p className="sm:col-span-2 rounded-xl bg-[#d7ff3f]/10 px-4 py-3 text-sm text-[#d7ff3f]">{msg}</p>}
          <button type="submit" disabled={sending} className="btn-vault sm:col-span-2 !py-3.5 text-base">
            {sending ? "পাঠানো হচ্ছে..." : "📨 ফ্রি কোট চান"}
          </button>
        </form>
      </div>
    </div>
  );
}
