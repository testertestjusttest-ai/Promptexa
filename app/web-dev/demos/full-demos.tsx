"use client";

import { useState } from "react";
import Link from "next/link";

/** DigiPlyra demo shell — slim browser chrome on top, pitch below the demo. */
export function DemoShell({ name, type, slug, children }: { name: string; type: string; slug: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#0b1120]">
      {/* slim browser chrome — feels like entering the real website */}
      <div className="sticky top-16 z-40 border-y border-white/10 bg-[#060913]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-3 py-2 sm:gap-3 sm:px-4">
          <Link href="/web-dev#demos" className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/10 text-sm text-white transition hover:bg-white/20" aria-label="পেছনে">
            ←
          </Link>
          <div className="flex min-w-0 flex-1 items-center gap-1.5 rounded-lg bg-white/[0.07] px-3 py-1.5">
            <span className="flex shrink-0 gap-1">
              <i className="h-2 w-2 rounded-full bg-red-400" />
              <i className="h-2 w-2 rounded-full bg-amber-300" />
              <i className="h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            <span className="truncate font-mono text-[11px] text-slate-400">demo.digiplyra.com/{slug}</span>
          </div>
          <span className="hidden shrink-0 rounded-full bg-[#d7ff3f]/15 px-2.5 py-1 text-[10px] font-black text-[#d7ff3f] sm:inline">
            ⓘ ডেমো
          </span>
          <Link href="/web-dev#quote" className="shrink-0 rounded-lg bg-[#d7ff3f] px-3 py-1.5 text-[11px] font-black text-black transition hover:brightness-110">
            📝 এরকম সাইট চাই
          </Link>
        </div>
      </div>

      {/* the website itself — full bleed, fully explorable */}
      <div className="min-h-[70vh]">{children}</div>

      {/* Why build with DigiPlyra — persuasive pitch inside the demo */}
      <div className="border-t border-[#d7ff3f]/20 bg-gradient-to-br from-[#0d1424] to-[#060913] px-4 py-8">
        <p className="text-center text-xl font-black text-white">
          🚀 কেন <span className="text-[#d7ff3f]">DigiPlyra</span> দিয়েই ওয়েবসাইট বানাবেন?
        </p>
        <p className="mx-auto mt-2 max-w-xl text-center text-xs leading-relaxed text-slate-400">
          উপরের ডেমোটা ঘেঁটে দেখলেন তো? আপনার ব্যবসার জন্য এরকমই — বরং এর চেয়েও ভালো —
          প্রফেশনাল ওয়েবসাইট আমরা বানিয়ে দেবো, <b className="text-slate-200">আপনার চাহিদা মতো ১০০% কাস্টমাইজড</b>।
        </p>
        <div className="mx-auto mt-5 grid max-w-3xl grid-cols-2 gap-2.5 sm:grid-cols-3">
          {[
            ["🎨", "পছন্দমতো ডিজাইন", "আপনার ব্র্যান্ডের রঙ, লোগো ও স্টাইলে"],
            ["📱", "মোবাইল রেসপন্সিভ", "ফোন-ট্যাব-ল্যাপটপ সবখানে পারফেক্ট"],
            ["⚡", "৭–১৪ দিনে ডেলিভারি", "দ্রুত কাজ, নিয়মিত আপডেট"],
            ["🛠️", "ফ্রি টেকনিক্যাল সাপোর্ট", "সমস্যা হলে আমরাই ঠিক করে দেবো"],
            ["💰", "স্বল্প খরচে প্রিমিয়াম", "বাজেট অনুযায়ী প্যাকেজ"],
            ["🔒", "নিরাপদ ও নির্ভরযোগ্য", "আপনার ডেটা সুরক্ষিত থাকবে"],
          ].map(([e, t, d]) => (
            <div key={t} className="rounded-2xl border border-white/10 bg-white/5 p-3.5">
              <p className="text-2xl">{e}</p>
              <p className="mt-1.5 text-xs font-black text-white">{t}</p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-slate-400">{d}</p>
            </div>
          ))}
        </div>
        <div className="mx-auto mt-4 max-w-3xl rounded-2xl border border-[#d7ff3f]/25 bg-[#d7ff3f]/5 p-4">
          <p className="text-center text-xs font-black text-[#d7ff3f]">💬 আমরা যা যা সাপোর্ট দিই</p>
          <div className="mt-2 flex flex-wrap justify-center gap-1.5">
            {["ডোমেইন সেটআপ", "হোস্টিং", "বিকাশ/নগদ পেমেন্ট", "অনলাইন অর্ডার সিস্টেম", "গুগল SEO", "ফেসবুক পিক্সেল", "বাংলায় ট্রেনিং", "আজীবন পরামর্শ"].map((s) => (
              <span key={s} className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold text-slate-200">✓ {s}</span>
            ))}
          </div>
        </div>
        <div className="mt-5 text-center">
          <Link href="/web-dev#quote" className="btn-vault inline-flex !px-10 !py-3.5 text-base font-black">
            📝 ফ্রি কোট নিন — আজই শুরু করুন
          </Link>
          <p className="mt-2 text-[11px] text-slate-500">💡 এটি শুধু একটি ডেমো — অর্ডার করলে আপনার নাম, ছবি ও কনটেন্ট দিয়ে বানিয়ে দেওয়া হবে।</p>
        </div>
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

/** Shared mini cart drawer — every demo cart fully works. */
function MiniCart({ items, onClose, onClear, accent }: {
  items: { n: string; p: number }[];
  onClose: () => void;
  onClear: () => void;
  accent: string;
}) {
  const [done, setDone] = useState(false);
  const total = items.reduce((s, i) => s + i.p, 0);
  return (
    <div className="fixed inset-0 z-[70] bg-black/70" onClick={onClose}>
      <div className="absolute bottom-0 left-0 right-0 mx-auto max-h-[75vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-[#101828] p-5 text-white" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between">
          <p className="font-black">🛒 আপনার কার্ট ({items.length})</p>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full bg-white/10">✕</button>
        </div>
        {done ? (
          <div className="py-8 text-center">
            <p className="text-5xl">🎉</p>
            <p className="mt-3 font-black text-emerald-300">অর্ডার সফল! (ডেমো)</p>
            <p className="mt-1 text-xs text-slate-400">আসল সাইটে এখানে পেমেন্ট অপশন আসবে।</p>
            <button onClick={() => { onClear(); onClose(); }} className="mt-4 rounded-xl bg-white/10 px-6 py-2 text-sm font-bold">ঠিক আছে</button>
          </div>
        ) : items.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">কার্ট খালি — কিছু যোগ করুন 🛒</p>
        ) : (
          <>
            <div className="space-y-2">
              {items.map((i, idx) => (
                <div key={idx} className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2.5">
                  <span className="text-sm font-bold">{i.n}</span>
                  <span className="text-sm font-black" style={{ color: accent }}>৳{i.p.toLocaleString("en-IN")}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
              <span className="font-bold">মোট</span>
              <span className="text-xl font-black" style={{ color: accent }}>৳{total.toLocaleString("en-IN")}</span>
            </div>
            <button onClick={() => setDone(true)} className="mt-4 w-full rounded-2xl py-3 font-black text-black" style={{ background: accent }}>
              ✅ অর্ডার কনফার্ম করুন
            </button>
          </>
        )}
      </div>
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
  const [cart, setCart] = useState<{ n: string; p: number }[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState("");
  const show = items.filter((i) => cat === "সব" || i.c === cat);
  function add(it: { n: string; p: number }) {
    setCart((c) => [...c, it]);
    setToast(`✅ ${it.n} কার্টে যোগ হয়েছে!`);
    setTimeout(() => setToast(""), 1500);
  }
  return (
    <div className="bg-[#0a0a12] text-white">
      <Toast msg={toast} />
      {cartOpen && <MiniCart items={cart} onClose={() => setCartOpen(false)} onClear={() => setCart([])} accent="#fb923c" />}
      <div className="flex items-center justify-between px-5 py-4">
        <span className="text-lg font-black">🍔 স্বাদের ঠিকানা</span>
        <button onClick={() => setCartOpen(true)} className="rounded-full bg-white/10 px-4 py-1.5 text-sm font-bold hover:bg-white/20">🛒 কার্ট ({cart.length})</button>
      </div>
      <div className="bg-gradient-to-br from-orange-600 via-red-600 to-amber-700 px-5 py-10">
        <p className="text-3xl font-black">ঘরেই পান<br />রেস্টুরেন্টের স্বাদ 🔥</p>
        <p className="mt-2 opacity-90">৩০ মিনিটে হোম ডেলিভারি • বিকাশে পেমেন্ট</p>
        <button onClick={() => setCat("সব")} className="mt-4 rounded-xl bg-white px-6 py-2.5 text-sm font-black text-orange-700">🍽️ মেনু দেখুন</button>
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
            <p className="font-bold text-amber-300">৳{i.p}</p>
            <button onClick={() => add(i)} className="mt-2 w-full rounded-xl bg-orange-500 py-2 text-sm font-bold hover:bg-orange-400">+ যোগ করুন</button>
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
  const [cart, setCart] = useState<{ n: string; p: number }[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState("");
  const show = items.filter((i) => cat === "সব" || i.c === cat);
  return (
    <div className="bg-white text-slate-800">
      <Toast msg={toast} />
      {cartOpen && <MiniCart items={cart} onClose={() => setCartOpen(false)} onClear={() => setCart([])} accent="#db2777" />}
      <div className="flex items-center justify-between bg-gradient-to-r from-pink-600 to-fuchsia-600 px-5 py-4 text-white">
        <span className="text-lg font-black">👗 স্টাইল হাব</span>
        <button onClick={() => setCartOpen(true)} className="rounded-full bg-white/20 px-4 py-1.5 text-sm font-bold hover:bg-white/30">🛒 {cart.length}টি</button>
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
              <button onClick={() => { setCart((c) => [...c, i]); setToast(`✅ ${i.n} কার্টে!`); setTimeout(() => setToast(""), 1500); }}
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
  const [booked, setBooked] = useState(false);
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
        {booked ? (
          <p className="mt-3 rounded-xl bg-emerald-500/15 px-4 py-2.5 text-sm font-bold text-emerald-300">✅ বুকিং রিকোয়েস্ট পাঠানো হয়েছে! (ডেমো)</p>
        ) : (
          <button onClick={() => setBooked(true)} className="mt-3 rounded-xl bg-white px-6 py-2 text-sm font-bold text-black hover:bg-slate-200">বুক করুন</button>
        )}
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
      <div className="flex items-center justify-between bg-white px-5 py-3 shadow-sm">
        <span className="text-lg font-black">✈️ ঘুরে আসি</span>
        <button onClick={() => setDone(false)} className="rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-5 py-2 text-sm font-bold text-white">বুক করুন</button>
      </div>
      <div className="bg-gradient-to-br from-teal-500 via-cyan-600 to-blue-700 px-5 py-8 text-white">
        <p className="text-2xl font-black">পৃথিবী ঘুরে দেখুন</p>
        <p className="text-sm opacity-90">কক্সবাজার থেকে মালদ্বীপ!</p>
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
          <div className="rounded-2xl bg-emerald-50 p-4 text-center">
            <p className="text-sm font-bold text-emerald-700">✅ বুকিং সফল! (ডেমো)</p>
            <p className="mt-1 text-xs text-slate-500">{dests[d].n} • {guests} জন • ৳{total.toLocaleString("en-IN")} — আমাদের টিম কল করবে।</p>
            <button onClick={() => setDone(false)} className="mt-2 text-xs font-bold text-teal-700 underline">নতুন বুকিং করুন</button>
          </div>
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
  const [started, setStarted] = useState<string | null>(null);
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
            <button onClick={() => setStarted(p.n)} className="mt-4 w-full rounded-xl bg-indigo-600 py-2 text-sm font-bold hover:bg-indigo-500">শুরু করুন</button>
          </div>
        ))}
      </div>
      {started && (
        <div className="mx-auto mt-5 max-w-md rounded-2xl bg-emerald-500/15 p-4 text-center">
          <p className="text-sm font-bold text-emerald-300">✅ "{started}" প্ল্যান সিলেক্ট হয়েছে! (ডেমো)</p>
          <p className="mt-1 text-xs text-slate-400">আসল সাইটে এখানে রেজিস্ট্রেশন ফর্ম আসবে।</p>
          <button onClick={() => setStarted(null)} className="mt-2 text-xs font-bold text-slate-300 underline">বন্ধ করুন</button>
        </div>
      )}
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
  const [cart, setCart] = useState<{ n: string; p: number }[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState("");
  return (
    <div className="bg-[#0a0a12] text-white">
      <Toast msg={toast} />
      {cartOpen && <MiniCart items={cart} onClose={() => setCartOpen(false)} onClear={() => setCart([])} accent="#22d3ee" />}
      <div className="flex items-center justify-between bg-gradient-to-r from-cyan-600 to-blue-700 px-5 py-4">
        <span className="text-lg font-black">🔌 টেক জোন</span>
        <button onClick={() => setCartOpen(true)} className="rounded-full bg-white/20 px-4 py-1.5 text-sm font-bold hover:bg-white/30">🛒 {cart.length}</button>
      </div>
      <p className="bg-cyan-500/10 px-5 py-2 text-center text-xs text-cyan-300">⚡ ০% EMI • অফিসিয়াল ওয়ারেন্টি • ২৪ ঘণ্টায় ডেলিভারি</p>
      <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-4">
        {items.map((i) => (
          <div key={i.n} className="rounded-2xl bg-white/5 p-4 text-center">
            <div className="text-5xl">{i.e}</div>
            <p className="mt-2 text-sm font-bold">{i.n}</p>
            <p className="font-black text-cyan-300">৳{i.p.toLocaleString("en-IN")}</p>
            <p className="text-[11px] text-slate-400">EMI {i.emi}</p>
            <button onClick={() => { setCart((c) => [...c, i]); setToast(`✅ ${i.n} কার্টে!`); setTimeout(() => setToast(""), 1500); }}
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
