"use client";

import { useState } from "react";
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

/** Tiny floating website mockup for the hero. */
function MiniSite({ title, hue }: { title: string; hue: string }) {
  return (
    <div className="w-40 overflow-hidden rounded-xl border border-white/20 bg-[#0b1120]/90 shadow-2xl backdrop-blur-sm">
      <div className="flex items-center gap-1 bg-white/10 px-2 py-1.5">
        <span className="h-2 w-2 rounded-full bg-red-400" />
        <span className="h-2 w-2 rounded-full bg-amber-300" />
        <span className="h-2 w-2 rounded-full bg-emerald-400" />
      </div>
      <div className={`bg-gradient-to-br ${hue} px-2 py-3`}>
        <p className="text-[10px] font-black text-white">{title}</p>
        <div className="mt-1.5 h-1.5 w-3/4 rounded bg-white/70" />
        <div className="mt-1 h-1.5 w-1/2 rounded bg-white/40" />
      </div>
      <div className="grid grid-cols-3 gap-1 p-1.5">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-6 rounded bg-white/10" />
        ))}
      </div>
    </div>
  );
}

export default function WebDevClient() {
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
      {/* hero — video-like animated background */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10">
        <WebDevHeroBg />
        {/* floating mini website mockups */}
        <div className="pointer-events-none absolute inset-0 hidden overflow-hidden md:block" aria-hidden>
          <div className="animate-float-slow absolute left-[4%] top-[12%]" style={{ ["--tilt" as any]: "-8deg" }}>
            <MiniSite title="রেস্টুরেন্ট" hue="from-orange-400 to-red-500" />
          </div>
          <div className="animate-float-slow absolute right-[5%] top-[18%]" style={{ ["--tilt" as any]: "7deg", animationDelay: "-3s" }}>
            <MiniSite title="ফ্যাশন শপ" hue="from-pink-400 to-fuchsia-600" />
          </div>
          <div className="animate-float-slow absolute bottom-[10%] left-[10%]" style={{ ["--tilt" as any]: "5deg", animationDelay: "-5s" }}>
            <MiniSite title="নিউজ পোর্টাল" hue="from-sky-400 to-indigo-600" />
          </div>
          <div className="animate-float-slow absolute bottom-[14%] right-[9%]" style={{ ["--tilt" as any]: "-6deg", animationDelay: "-2s" }}>
            <MiniSite title="ট্রাভেল" hue="from-teal-300 to-emerald-600" />
          </div>
        </div>
        <div className="relative p-8 text-center sm:p-12">
          <span className="inline-block rounded-full bg-[#d7ff3f]/15 px-4 py-1.5 text-xs font-bold tracking-widest text-[#d7ff3f] ring-1 ring-[#d7ff3f]/40 backdrop-blur-sm">
            ✨ ১০০+ প্রজেক্ট ডেলিভারিড
          </span>
          <h1 className="font-display mt-4 text-3xl font-black text-white drop-shadow-[0_2px_16px_rgba(0,0,0,0.9)] sm:text-5xl">
            আপনার <span className="bg-gradient-to-r from-lime-300 via-[#d7ff3f] to-emerald-300 bg-clip-text text-transparent">ওয়েবসাইট</span> বানিয়ে নিন
          </h1>
          <p className="mx-auto mt-3 max-w-2xl rounded-2xl bg-black/55 px-5 py-3 text-sm leading-relaxed text-slate-200 backdrop-blur-md">
            DigiPlyra টিমের মাধ্যমে প্রফেশনাল ওয়েবসাইট — ডিজাইন থেকে ডেলিভারি পর্যন্ত সব দায়িত্ব আমাদের।
            নিচে <b className="text-white">১০টি লাইভ ডেমো</b> দেখুন অথবা কাস্টম কোটের জন্য ফর্ম পূরণ করুন।
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <a href="#demos" className="btn-vault inline-flex !px-8 !py-3 text-sm shadow-[0_0_24px_rgba(215,255,63,0.35)]">
              🖥️ ডেমো দেখুন
            </a>
            <a href="#quote" className="inline-flex rounded-xl border border-white/25 bg-black/45 px-8 py-3 text-sm font-bold text-white backdrop-blur-md transition hover:border-[#d7ff3f]/60">
              📝 কোট চান
            </a>
          </div>
          {/* scrolling tech marquee */}
          <div className="pointer-events-none relative mt-8 overflow-hidden rounded-xl" aria-hidden>
            <div className="animate-marquee-x flex w-max gap-3">
              {[...TECH, ...TECH].map((t, i) => (
                <span key={i} className="whitespace-nowrap rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold text-slate-200 backdrop-blur-sm ring-1 ring-white/15">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* demo showcase slider */}
      <DemoSlider />

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
