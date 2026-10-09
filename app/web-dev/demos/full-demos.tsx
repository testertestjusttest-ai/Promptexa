"use client";

import { useState } from "react";
import Link from "next/link";

/** DigiPlyra demo shell — support banner on top, demo notice at bottom. */
export function DemoShell({ name, type, children }: { name: string; type: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#0b1120]">
      <div className="border-b border-[#d7ff3f]/25 bg-[#060913] px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-bold text-white">
            🖥️ <span className="text-[#d7ff3f]">DigiPlyra</span> ডেমো প্রিভিউ
            <span className="ml-2 font-normal text-slate-400">• {type}</span>
          </p>
          <div className="flex items-center gap-2">
            <span className="hidden text-[11px] text-slate-400 sm:inline">📞 ২৪/৭ সাপোর্ট • আপনার পছন্দমতো বানিয়ে দেওয়া হবে</span>
            <Link href="/web-dev#quote" className="rounded-lg bg-[#d7ff3f] px-3 py-1.5 text-[11px] font-black text-black">
              📝 এরকম সাইট চাই
            </Link>
          </div>
        </div>
      </div>
      <div className="min-h-[60vh]">{children}</div>
      <div className="border-t border-white/10 bg-black/50 px-4 py-6 text-center">
        <p className="mx-auto max-w-xl text-sm leading-relaxed text-slate-300">
          💡 এটি শুধু একটি <b className="text-white">ডেমো</b> — আপনার ব্যবসার নাম, লোগো, ছবি ও
          কনটেন্ট দিয়ে <b className="text-[#d7ff3f]">আপনার পছন্দমতো</b> প্রফেশনাল ওয়েবসাইট
          বানিয়ে দেওয়া হবে।
        </p>
        <Link href="/web-dev#quote" className="btn-vault mt-3 inline-flex !py-2.5 text-sm">
          📝 ফ্রি কোট নিন
        </Link>
      </div>
    </div>
  );
}

function Toast({ msg }: { msg: string }) {
  if (!msg) return null;
  return (
    <div className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 animate-pulse rounded-2xl bg-[#d7ff3f] px-6 py-3 text-sm font-black text-black shadow-2xl">
      {msg}
    </div>
  );
}

/* ---------------- 1. Restaurant ---------------- */
export function FullRestaurant() {
  const cats = ["সব", "পিজ্জা", "বার্গার", "ডেজার্ট"] as const;
  const items = [
    { n: "চিকেন পিজ্জা", c: "পিজ্জা", p: 350, e: "🍕" },
    { n: "বিফ বার্গার", c: "বার্গার", p: 220, e: "🍔" },
    { n: "চকলেট কেক", c: "ডেজার্ট", p: 450, e: "🍰" },
    { n: "ভেজি পিজ্জা", c: "পিজ্জা", p: 300, e: "🍕" },
    { n: "চিজ বার্গার", c: "বার্গার", p: 250, e: "🍔" },
    { n: "আইসক্রিম", c: "ডেজার্ট", p: 150, e: "🍨" },
  ];
  const [cat, setCat] = useState<(typeof cats)[number]>("সব");
  const [cart, setCart] = useState(0);
  const [toast, setToast] = useState("");
  const show = items.filter((i) => cat === "সব" || i.c === cat);
  function add(n: string) {
    setCart((c) => c + 1);
    setToast(`✅ ${n} কার্টে যোগ হয়েছে!`);
    setTimeout(() => setToast(""), 1800);
  }
  return (
    <div className="bg-[#0a0a12] text-white">
      <Toast msg={toast} />
      <div className="flex items-center justify-between px-5 py-4">
        <span className="text-lg font-black">🍔 স্বাদের ঠিকানা</span>
        <span className="rounded-full bg-white/10 px-4 py-1.5 text-sm font-bold">🛒 কার্ট ({cart})</span>
      </div>
      <div className="bg-gradient-to-br from-orange-600 via-red-600 to-amber-700 px-5 py-10">
        <p className="text-3xl font-black">ঘরেই পান<br />রেস্টুরেন্টের স্বাদ 🔥</p>
        <p className="mt-2 opacity-90">৩০ মিনিটে হোম ডেলিভারি • বিকাশে পেমেন্ট</p>
      </div>
      <div className="flex gap-2 overflow-x-auto px-5 py-4">
        {cats.map((c) => (
          <button key={c} onClick={() => setCat(c)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold ${cat === c ? "bg-orange-500 text-white" : "bg-white/10 text-slate-300"}`}>{c}</button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 px-5 pb-6 sm:grid-cols-3">
        {show.map((i) => (
          <div key={i.n} className="rounded-2xl bg-white/5 p-4 text-center">
            <div className="text-4xl">{i.e}</div>
            <p className="mt-2 text-sm font-bold">{i.n}</p>
            <p className="text-amber-300 font-bold">৳{i.p}</p>
            <button onClick={() => add(i.n)} className="mt-2 w-full rounded-xl bg-orange-500 py-2 text-sm font-bold hover:bg-orange-400">+ যোগ করুন</button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- 2. Fashion ---------------- */
export function FullFashion() {
  const cats = ["সব", "শাড়ি", "পাঞ্জাবি", "জুতা"] as const;
  const items = [
    { n: "জামদানি শাড়ি", c: "শাড়ি", p: 2500, e: "🥻" },
    { n: "সিল্ক শাড়ি", c: "শাড়ি", p: 1800, e: "👘" },
    { n: "কটন পাঞ্জাবি", c: "পাঞ্জাবি", p: 1200, e: "👔" },
    { n: "স্লিম পাঞ্জাবি", c: "পাঞ্জাবি", p: 1500, e: "🤵" },
    { n: "স্নিকার্স", c: "জুতা", p: 2200, e: "👟" },
    { n: "লোফার", c: "জুতা", p: 1900, e: "👞" },
  ];
  const [cat, setCat] = useState<(typeof cats)[number]>("সব");
  const [cart, setCart] = useState<string[]>([]);
  const [toast, setToast] = useState("");
  const show = items.filter((i) => cat === "সব" || i.c === cat);
  return (
    <div className="bg-white text-slate-800">
      <Toast msg={toast} />
      <div className="flex items-center justify-between bg-gradient-to-r from-pink-600 to-fuchsia-600 px-5 py-4 text-white">
        <span className="text-lg font-black">👗 স্টাইল হাব</span>
        <span className="rounded-full bg-white/20 px-4 py-1.5 text-sm font-bold">🛒 {cart.length}টি</span>
      </div>
      <p className="bg-pink-50 px-5 py-2 text-center text-sm font-bold text-pink-700">🎉 ঈদ অফার — ৫০% পর্যন্ত ছাড়!</p>
      <div className="flex gap-2 px-5 py-4">
        {cats.map((c) => (
          <button key={c} onClick={() => setCat(c)}
            className={`rounded-full px-4 py-2 text-sm font-bold ${cat === c ? "bg-pink-600 text-white" : "bg-slate-100 text-slate-600"}`}>{c}</button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 px-5 pb-6 sm:grid-cols-3">
        {show.map((i) => (
          <div key={i.n} className="overflow-hidden rounded-2xl border border-slate-200">
            <div className="grid h-28 place-items-center bg-gradient-to-br from-pink-100 to-fuchsia-100 text-5xl">{i.e}</div>
            <div className="p-3">
              <p className="text-sm font-bold">{i.n}</p>
              <p className="font-black text-pink-600">৳{i.p.toLocaleString("en-IN")}</p>
              <button onClick={() => { setCart((c) => [...c, i.n]); setToast(`✅ ${i.n} কার্টে!`); setTimeout(() => setToast(""), 1500); }}
                className="mt-2 w-full rounded-xl bg-pink-600 py-2 text-sm font-bold text-white hover:bg-pink-500">কার্টে নিন</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- 3. Portfolio ---------------- */
export function FullPortfolio() {
  const shots = [
    { e: "🌅", t: "সূর্যোদয় — কক্সবাজার" }, { e: "👰", t: "বিয়ে — ঢাকা" },
    { e: "🎭", t: "নাটক — শিল্পকলা" }, { e: "🏙️", t: "শহর — রাত" },
    { e: "🌊", t: "সাগর — সেন্টমার্টিন" }, { e: "🎪", t: "মেলা — গ্রাম" },
  ];
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="bg-[#0a0a12] px-5 py-8 text-white">
      <p className="text-center text-[11px] tracking-[0.35em] text-slate-400">📸 লেন্স ও আলো</p>
      <p className="mt-2 text-center text-2xl font-black">মুহূর্তগুলো ধরে রাখি<br />চিরদিনের জন্য</p>
      <p className="mt-2 text-center text-xs text-slate-500">👆 যেকোনো ছবিতে ক্লিক করে বড় করে দেখুন</p>
      <div className="mx-auto mt-6 grid max-w-3xl grid-cols-3 gap-2">
        {shots.map((s, i) => (
          <button key={i} onClick={() => setOpen(i)}
            className="grid h-28 place-items-center rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 text-4xl transition hover:scale-105">{s.e}</button>
        ))}
      </div>
      {open !== null && (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-black/90 p-6" onClick={() => setOpen(null)}>
          <div className="text-center">
            <div className="grid h-64 w-64 place-items-center rounded-3xl bg-gradient-to-br from-slate-700 to-slate-900 text-8xl">{shots[open].e}</div>
            <p className="mt-4 font-bold text-white">{shots[open].t}</p>
            <p className="mt-1 text-xs text-slate-400">বন্ধ করতে যেকোনো জায়গায় ক্লিক করুন</p>
          </div>
        </div>
      )}
      <div className="mx-auto mt-6 max-w-md rounded-2xl bg-white/5 p-4 text-center">
        <p className="text-sm font-bold">📅 বুকিং করুন</p>
        <p className="mt-1 text-xs text-slate-400">৫০০+ ইভেন্ট • ⭐ ৪.৯ রেটিং</p>
        <button onClick={() => alert("ডেমো: বুকিং ফর্ম এখানে আসবে")} className="mt-3 rounded-xl bg-white px-6 py-2 text-sm font-bold text-black">বুক করুন</button>
      </div>
    </div>
  );
}

/* ---------------- 4. News ---------------- */
export function FullNews() {
  const cats = ["সব", "জাতীয়", "খেলা", "প্রযুক্তি"] as const;
  const news = [
    { c: "খেলা", e: "🏏", t: "বাংলাদেশের ঐতিহাসিক জয়!", time: "২ ঘণ্টা আগে" },
    { c: "প্রযুক্তি", e: "💻", t: "নতুন প্রযুক্তি পার্ক উদ্বোধন", time: "৫ ঘণ্টা আগে" },
    { c: "জাতীয়", e: "🏛️", t: "পদ্মা সেতুতে নতুন রেকর্ড", time: "৮ ঘণ্টা আগে" },
    { c: "খেলা", e: "⚽", t: "ফুটবলে বাংলাদেশের জয়", time: "১০ ঘণ্টা আগে" },
    { c: "প্রযুক্তি", e: "📱", t: "৫জি সেবা সম্প্রসারণ", time: "১২ ঘণ্টা আগে" },
  ];
  const [cat, setCat] = useState<(typeof cats)[number]>("সব");
  const [read, setRead] = useState<string | null>(null);
  const show = news.filter((n) => cat === "সব" || n.c === cat);
  return (
    <div className="bg-white text-slate-800">
      <div className="bg-red-600 px-5 py-3 text-white">
        <span className="text-xl font-black">খবর ২৪</span>
        <span className="ml-2 animate-pulse rounded bg-white/25 px-2 py-0.5 text-xs font-bold">🔴 লাইভ</span>
      </div>
      <div className="flex gap-2 bg-slate-100 px-4 py-2">
        {cats.map((c) => (
          <button key={c} onClick={() => setCat(c)}
            className={`rounded-full px-3 py-1 text-xs font-bold ${cat === c ? "bg-red-600 text-white" : "bg-white text-slate-600"}`}>{c}</button>
        ))}
      </div>
      <div className="space-y-2 p-4">
        {show.map((n, i) => (
          <button key={i} onClick={() => setRead(read === n.t ? null : n.t)} className="flex w-full items-center gap-3 rounded-2xl bg-slate-50 p-3 text-left hover:bg-slate-100">
            <span className="text-3xl">{n.e}</span>
            <span>
              <p className="text-sm font-bold">{n.t}</p>
              <p className="text-[11px] text-slate-400">{n.c} • {n.time} {read === n.t ? "▲" : "▼"}</p>
              {read === n.t && <p className="mt-1 text-xs text-slate-500">এটি ডেমো নিউজ — ক্লিক করে পুরো খবর পড়া যাবে। আপনার নিউজ পোর্টালে এখানে আসল খবর থাকবে।</p>}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------------- 5. Real estate ---------------- */
export function FullRealEstate() {
  const props = [
    { n: "গুলশান লাক্সারি ফ্ল্যাট", loc: "গুলশান, ঢাকা", price: 185, e: "🏢", beds: 4 },
    { n: "উত্তরা ডুপ্লেক্স", loc: "উত্তরা, ঢাকা", price: 95, e: "🏡", beds: 5 },
    { n: "মিরপুর ফ্যামিলি ফ্ল্যাট", loc: "মিরপুর, ঢাকা", price: 65, e: "🏠", beds: 3 },
    { n: "বনানী পেন্টহাউস", loc: "বনানী, ঢাকা", price: 250, e: "🌆", beds: 5 },
  ];
  const [max, setMax] = useState(999);
  const [toast, setToast] = useState("");
  const show = props.filter((p) => p.price <= max);
  return (
    <div className="bg-white text-slate-800">
      <Toast msg={toast} />
      <div className="bg-gradient-to-br from-blue-700 to-indigo-900 px-5 py-8 text-white">
        <p className="text-2xl font-black">🏠 স্বপ্ন নিবাস</p>
        <p className="mt-1 text-sm opacity-80">আপনার স্বপ্নের ঠিকানা খুঁজুন</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {[["সব", 999], ["১ কোটির নিচে", 100], ["৭০ লাখের নিচে", 70]].map(([l, v]) => (
            <button key={l as string} onClick={() => setMax(v as number)}
              className={`rounded-full px-4 py-1.5 text-xs font-bold ${max === v ? "bg-amber-400 text-black" : "bg-white/20 text-white"}`}>{l}</button>
          ))}
        </div>
      </div>
      <div className="grid gap-3 p-4 sm:grid-cols-2">
        {show.map((p) => (
          <div key={p.n} className="overflow-hidden rounded-2xl border border-slate-200">
            <div className="grid h-32 place-items-center bg-gradient-to-br from-blue-100 to-indigo-200 text-6xl">{p.e}</div>
            <div className="p-4">
              <p className="font-bold">{p.n}</p>
              <p className="text-xs text-slate-500">📍 {p.loc} • 🛏️ {p.beds} বেড</p>
              <p className="mt-1 text-lg font-black text-blue-700">৳{p.price} লাখ</p>
              <button onClick={() => { setToast(`✅ ${p.n}-এ ভিজিট বুক হয়েছে! কল পাবেন।`); setTimeout(() => setToast(""), 2000); }}
                className="mt-2 w-full rounded-xl bg-blue-700 py-2 text-sm font-bold text-white hover:bg-blue-600">📅 ভিজিট বুক করুন</button>
            </div>
          </div>
        ))}
        {show.length === 0 && <p className="col-span-2 py-8 text-center text-slate-400">এই বাজেটে কোনো প্রপার্টি নেই</p>}
      </div>
    </div>
  );
}

/* ---------------- 6. Gym ---------------- */
export function FullGym() {
  const plans = [
    { n: "মাসিক", p: "৳১,৫০০", f: ["সব ইকুইপমেন্ট", "লকার"] },
    { n: "৬ মাস", p: "৳৭,০০০", f: ["সব ইকুইপমেন্ট", "ডায়েট চার্ট", "ট্রেইনার"] },
    { n: "বাৎসরিক", p: "৳১২,০০০", f: ["সব সুবিধা", "পার্সোনাল ট্রেইনার", "সাপ্লিমেন্ট ছাড়"] },
  ];
  const [sel, setSel] = useState(1);
  const [toast, setToast] = useState("");
  return (
    <div className="bg-[#0a0a12] px-5 py-8 text-white">
      <Toast msg={toast} />
      <p className="text-center text-2xl font-black">💪 পাওয়ার জিম</p>
      <p className="mt-1 text-center text-xs tracking-widest text-red-400">NO PAIN • NO GAIN</p>
      <p className="mt-4 text-center text-sm text-slate-400">👆 প্ল্যান সিলেক্ট করুন</p>
      <div className="mx-auto mt-4 grid max-w-3xl gap-3 sm:grid-cols-3">
        {plans.map((pl, i) => (
          <button key={pl.n} onClick={() => setSel(i)}
            className={`rounded-2xl border-2 p-5 text-left transition ${sel === i ? "border-red-500 bg-red-600/15 shadow-[0_0_24px_rgba(239,68,68,0.35)]" : "border-white/10 bg-white/5"}`}>
            <p className="font-black">{pl.n}</p>
            <p className="mt-1 text-2xl font-black text-red-400">{pl.p}</p>
            <ul className="mt-2 space-y-1 text-xs text-slate-300">{pl.f.map((f) => <li key={f}>✓ {f}</li>)}</ul>
            {sel === i && <p className="mt-2 text-xs font-bold text-red-300">● সিলেক্টেড</p>}
          </button>
        ))}
      </div>
      <div className="mt-6 text-center">
        <button onClick={() => { setToast(`🎉 ${plans[sel].n} প্ল্যানে জয়েন সফল! (ডেমো)`); setTimeout(() => setToast(""), 2000); }}
          className="rounded-2xl bg-red-600 px-10 py-3 font-black hover:bg-red-500">🔥 {plans[sel].n} প্ল্যানে জয়েন করুন</button>
      </div>
    </div>
  );
}

/* ---------------- 7. Travel ---------------- */
export function FullTravel() {
  const dests = [
    { n: "কক্সবাজার", p: 9000, e: "🏖️" }, { n: "সাজেক", p: 13000, e: "🏔️" }, { n: "মালদ্বীপ", p: 85000, e: "🌊" },
  ];
  const [d, setD] = useState(0);
  const [guests, setGuests] = useState(2);
  const [done, setDone] = useState(false);
  const total = dests[d].p * guests;
  return (
    <div className="bg-white text-slate-800">
      <div className="bg-gradient-to-br from-teal-500 via-cyan-600 to-blue-700 px-5 py-8 text-white">
        <p className="text-2xl font-black">✈️ ঘুরে আসি</p>
        <p className="text-sm opacity-90">পৃথিবী ঘুরে দেখুন — বুকিং ২ মিনিটে!</p>
      </div>
      <div className="mx-auto max-w-xl space-y-4 p-5">
        <div>
          <p className="mb-2 text-sm font-bold">📍 গন্তব্য বেছে নিন</p>
          <div className="grid grid-cols-3 gap-2">
            {dests.map((x, i) => (
              <button key={x.n} onClick={() => { setD(i); setDone(false); }}
                className={`rounded-2xl border-2 p-3 text-center ${d === i ? "border-teal-500 bg-teal-50" : "border-slate-200"}`}>
                <div className="text-3xl">{x.e}</div>
                <p className="mt-1 text-xs font-bold">{x.n}</p>
                <p className="text-xs text-teal-700">৳{x.p.toLocaleString("en-IN")}</p>
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
          <p className="text-sm font-bold">👥 অতিথি সংখ্যা</p>
          <div className="flex items-center gap-3">
            <button onClick={() => setGuests((g) => Math.max(1, g - 1))} className="grid h-8 w-8 place-items-center rounded-full bg-white text-lg font-bold shadow">−</button>
            <span className="text-lg font-black">{guests}</span>
            <button onClick={() => setGuests((g) => Math.min(10, g + 1))} className="grid h-8 w-8 place-items-center rounded-full bg-white text-lg font-bold shadow">+</button>
          </div>
        </div>
        <div className="flex items-center justify-between rounded-2xl bg-teal-600 p-4 text-white">
          <p className="font-bold">মোট খরচ</p>
          <p className="text-2xl font-black">৳{total.toLocaleString("en-IN")}</p>
        </div>
        {done ? (
          <p className="rounded-2xl bg-emerald-50 p-4 text-center text-sm font-bold text-emerald-700">✅ বুকিং সফল! (ডেমো) — আমাদের টিম কল করবে।</p>
        ) : (
          <button onClick={() => setDone(true)} className="w-full rounded-2xl bg-teal-600 py-3.5 font-black text-white hover:bg-teal-500">🎫 এখনই বুক করুন</button>
        )}
      </div>
    </div>
  );
}

/* ---------------- 8. SaaS ---------------- */
export function FullSaas() {
  const [yearly, setYearly] = useState(false);
  const plans = [
    { n: "বেসিক", m: 990, f: ["১০০ অর্ডার/মাস", "ইমেইল সাপোর্ট"] },
    { n: "প্রো", m: 2990, f: ["আনলিমিটেড অর্ডার", "২৪/৭ সাপোর্ট", "API অ্যাক্সেস"], hot: true },
    { n: "এন্টারপ্রাইজ", m: 9990, f: ["ডেডিকেটেড সার্ভার", "পার্সোনাল ম্যানেজার"] },
  ];
  const price = (m: number) => yearly ? Math.round(m * 10) : m;
  return (
    <div className="bg-[#0a0a12] px-5 py-8 text-white">
      <p className="text-center text-2xl font-black">☁️ ক্লাউড সেবা</p>
      <p className="mt-1 text-center text-sm text-slate-400">ব্যবসা চালান অটোপাইলটে</p>
      <div className="mt-4 flex justify-center">
        <div className="flex rounded-full bg-white/10 p-1 text-sm font-bold">
          <button onClick={() => setYearly(false)} className={`rounded-full px-5 py-1.5 ${!yearly ? "bg-indigo-600 text-white" : "text-slate-400"}`}>মাসিক</button>
          <button onClick={() => setYearly(true)} className={`rounded-full px-5 py-1.5 ${yearly ? "bg-indigo-600 text-white" : "text-slate-400"}`}>বাৎসরিক <span className="text-[10px] text-emerald-300">−১৭%</span></button>
        </div>
      </div>
      <div className="mx-auto mt-6 grid max-w-3xl gap-3 sm:grid-cols-3">
        {plans.map((p) => (
          <div key={p.n} className={`rounded-2xl border p-5 ${p.hot ? "border-indigo-500 bg-indigo-600/15 shadow-[0_0_24px_rgba(99,102,241,0.3)]" : "border-white/10 bg-white/5"}`}>
            {p.hot && <span className="rounded-full bg-indigo-600 px-2.5 py-0.5 text-[10px] font-bold">🔥 জনপ্রিয়</span>}
            <p className="mt-2 font-black">{p.n}</p>
            <p className="mt-1"><span className="text-2xl font-black">৳{price(p.m).toLocaleString("en-IN")}</span><span className="text-xs text-slate-400">/{yearly ? "বছর" : "মাস"}</span></p>
            <ul className="mt-3 space-y-1 text-xs text-slate-300">{p.f.map((f) => <li key={f}>✓ {f}</li>)}</ul>
            <button onClick={() => alert(`ডেমো: ${p.n} প্ল্যান সিলেক্ট হয়েছে`)} className="mt-4 w-full rounded-xl bg-indigo-600 py-2 text-sm font-bold hover:bg-indigo-500">শুরু করুন</button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- 9. Salon ---------------- */
export function FullSalon() {
  const services = [
    { n: "হেয়ার কাট + স্পা", p: 800, e: "💇", t: "৪৫ মিনিট" },
    { n: "ব্রাইডাল ফেসিয়াল", p: 1500, e: "💆", t: "৯০ মিনিট" },
    { n: "ম্যানিকিউর + পেডিকিউর", p: 900, e: "💅", t: "৬০ মিনিট" },
    { n: "হেয়ার কালার", p: 2000, e: "🎨", t: "১২০ মিনিট" },
  ];
  const [booked, setBooked] = useState<string | null>(null);
  return (
    <div className="bg-white text-slate-800">
      <div className="bg-gradient-to-br from-rose-400 via-pink-500 to-fuchsia-600 px-5 py-8 text-white">
        <p className="text-2xl font-black">💅 রূপচর্চা বিউটি পার্লার</p>
        <p className="text-sm opacity-90">এক্সপার্ট বিউটিশিয়ান • প্রিমিয়াম প্রোডাক্ট</p>
      </div>
      <div className="mx-auto max-w-xl space-y-3 p-5">
        {services.map((s) => (
          <div key={s.n} className="flex items-center gap-3 rounded-2xl border border-rose-100 bg-rose-50/50 p-4">
            <span className="text-4xl">{s.e}</span>
            <div className="flex-1">
              <p className="font-bold">{s.n}</p>
              <p className="text-xs text-slate-500">⏱️ {s.t} • <b className="text-rose-600">৳{s.p}</b></p>
            </div>
            <button onClick={() => setBooked(s.n)}
              className={`rounded-xl px-4 py-2 text-sm font-bold ${booked === s.n ? "bg-emerald-500 text-white" : "bg-rose-500 text-white hover:bg-rose-400"}`}>
              {booked === s.n ? "✓ বুকড" : "বুক করুন"}
            </button>
          </div>
        ))}
        {booked && <p className="rounded-2xl bg-emerald-50 p-4 text-center text-sm font-bold text-emerald-700">✅ "{booked}" বুকিং সফল! (ডেমো) — কনফার্মেশন SMS পাবেন।</p>}
      </div>
    </div>
  );
}

/* ---------------- 10. Gadget ---------------- */
export function FullGadget() {
  const items = [
    { n: "স্মার্টফোন X", p: 25990, e: "📱", emi: "৳২,১৬৬/মাস" },
    { n: "ল্যাপটপ প্রো", p: 75990, e: "💻", emi: "৳৬,৩৩৩/মাস" },
    { n: "এয়ারবাডস", p: 2990, e: "🎧", emi: "৳২৫০/মাস" },
    { n: "স্মার্টওয়াচ", p: 8990, e: "⌚", emi: "৳৭৫০/মাস" },
  ];
  const [cart, setCart] = useState<string[]>([]);
  const [toast, setToast] = useState("");
  return (
    <div className="bg-[#0a0a12] text-white">
      <Toast msg={toast} />
      <div className="flex items-center justify-between bg-gradient-to-r from-cyan-600 to-blue-700 px-5 py-4">
        <span className="text-lg font-black">🔌 টেক জোন</span>
        <span className="rounded-full bg-white/20 px-4 py-1.5 text-sm font-bold">🛒 {cart.length}</span>
      </div>
      <p className="bg-cyan-500/10 px-5 py-2 text-center text-xs text-cyan-300">⚡ ০% EMI • অফিসিয়াল ওয়ারেন্টি • ২৪ ঘণ্টায় ডেলিভারি</p>
      <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-4">
        {items.map((i) => (
          <div key={i.n} className="rounded-2xl bg-white/5 p-4 text-center">
            <div className="text-5xl">{i.e}</div>
            <p className="mt-2 text-sm font-bold">{i.n}</p>
            <p className="font-black text-cyan-300">৳{i.p.toLocaleString("en-IN")}</p>
            <p className="text-[11px] text-slate-400">EMI {i.emi}</p>
            <button onClick={() => { setCart((c) => [...c, i.n]); setToast(`✅ ${i.n} কার্টে!`); setTimeout(() => setToast(""), 1500); }}
              className="mt-2 w-full rounded-xl bg-cyan-600 py-2 text-sm font-bold hover:bg-cyan-500">+ কার্ট</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export const FULL_DEMOS: Record<string, () => React.ReactNode> = {
  restaurant: FullRestaurant,
  fashion: FullFashion,
  portfolio: FullPortfolio,
  news: FullNews,
  realestate: FullRealEstate,
  gym: FullGym,
  travel: FullTravel,
  saas: FullSaas,
  salon: FullSalon,
  gadget: FullGadget,
};
