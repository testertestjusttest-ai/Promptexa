"use client";

/** Buying house layout — garment sourcing agency demo.
 * Unique animated homepage (count-up stats, live order tracker mock,
 * country marquee, scroll reveals), corporate pages, RFQ flow and a
 * professional business admin. All demo data is browser-local.
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toBnDigits } from "@/lib/format";
import { useDemo } from "./store";
import { Page, SectionTitle, Back, Btn, Field, Area, Empty, Stars } from "./ui";

/* ---------------- helpers ---------------- */

const card = "rounded-3xl border border-white/10 bg-white/[0.04] p-5";
const sub = "text-slate-400";

function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ob = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVis(true); ob.disconnect(); } },
      { threshold: 0.1 }
    );
    ob.observe(el);
    return () => ob.disconnect();
  }, []);
  return (
    <div ref={ref} className={`${className} transition-all duration-700 ${vis ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

function CountUp({ to, suffix = "" }: { to: number; suffix?: string }) {
  const [v, setV] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let started = false;
    const ob = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !started) {
          started = true;
          const t0 = performance.now();
          const tick = (t: number) => {
            const p = Math.min(1, (t - t0) / 1500);
            setV(Math.round(to * (1 - Math.pow(1 - p, 3))));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
          ob.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    ob.observe(el);
    return () => ob.disconnect();
  }, [to]);
  return <span ref={ref}>{toBnDigits(v.toLocaleString("en-IN"))}{suffix}</span>;
}

const COUNTRIES = ["🇩🇪 জার্মানি", "🇺🇸 আমেরিকা", "🇬🇧 যুক্তরাজ্য", "🇫🇷 ফ্রান্স", "🇪🇸 স্পেন", "🇮🇹 ইতালি", "🇳🇱 নেদারল্যান্ডস", "🇸🇪 সুইডেন", "🇯🇵 জাপান", "🇦🇺 অস্ট্রেলিয়া", "🇨🇦 কানাডা", "🇵🇱 পোল্যান্ড"];

const PROCESS = [
  ["📩", "RFQ ও কোটেশন", "আপনার টেক-প্যাক পাঠান — ৪৮ ঘণ্টায় সেরা ফ্যাক্টরি রেটসহ কোটেশন।"],
  ["🧪", "স্যাম্পল ডেভেলপমেন্ট", "PP স্যাম্পল, ফিট স্যাম্পল ও কাউন্টার স্যাম্পল — অনুমোদন পর্যন্ত রিভিশন।"],
  ["🏭", "প্রোডাকশন", "অর্ডার কনফার্মের পর যাচাইকৃত ফ্যাক্টরিতে উৎপাদন — সাপ্তাহিক আপডেট।"],
  ["🔍", "কোয়ালিটি কন্ট্রোল", "ইনলাইন, মিডলাইন ও ফাইনাল (AQL 2.5) ইন্সপেকশন — রিপোর্টসহ।"],
  ["📦", "প্যাকিং ও বুকিং", "কার্টন প্যাকিং, ফ্রেইট বুকিং ও ডকুমেন্টেশন (BL, ইনভয়েস, প্যাকিং লিস্ট)।"],
  ["🚢", "শিপমেন্ট", "অন-টাইম শিপমেন্ট — পোর্ট থেকে আপনার গন্তব্য পর্যন্ত ট্র্যাকিং আপডেট।"],
] as const;

const FACTORIES = [
  { n: "গ্রীন নিট কম্পোজিট", loc: "গাজীপুর", cap: "১২ লাখ পিস/মাস", e: "🧶", spec: ["নিট", "টি-শার্ট", "পোলো"], cert: ["WRAP", "BSCI", "OEKO-TEX"] },
  { n: "ঢাকা ডেনিম ওয়ার্কস", loc: "নারায়ণগঞ্জ", cap: "৬ লাখ পিস/মাস", e: "👖", spec: ["ডেনিম", "জিন্স", "জ্যাকেট"], cert: ["BSCI", "SEDEX"] },
  { n: "স্কাই ওভেন ইন্ডাস্ট্রিজ", loc: "আশুলিয়া, সাভার", cap: "৮ লাখ পিস/মাস", e: "👔", spec: ["ওভেন", "ফরমাল শার্ট"], cert: ["WRAP", "ACCORD"] },
  { n: "নর্দান সোয়েটার লিমিটেড", loc: "উত্তরা, ঢাকা", cap: "৪ লাখ পিস/মাস", e: "🧥", spec: ["সোয়েটার", "কার্ডিগান"], cert: ["BSCI", "GRS"] },
  { n: "প্যাসিফিক অ্যাপারেলস", loc: "চট্টগ্রাম", cap: "১০ লাখ পিস/মাস", e: "🎽", spec: ["নিট", "হুডি", "কিডস"], cert: ["SEDEX", "OEKO-TEX"] },
  { n: "রয়েল টেক্সটাইল মিলস", loc: "টঙ্গী", cap: "৫ লাখ পিস/মাস", e: "🧵", spec: ["ওভেন", "ক্যাজুয়াল"], cert: ["WRAP", "BSCI"] },
];

const TESTIMONIALS = [
  { n: "Markus Weber", c: "🇩🇪 জার্মানি — রিটেইল চেইন", t: "তিন বছর ধরে টেক্সব্রিজের সাথে কাজ করছি। QC রিপোর্ট এত ডিটেইলড যে আমাদের নিজস্ব ইন্সপেকশনের খরচ অর্ধেক কমে গেছে।", r: 5 },
  { n: "Sarah Collins", c: "🇬🇧 যুক্তরাজ্য — ফ্যাশন ব্র্যান্ড", t: "স্যাম্পল ডেভেলপমেন্টের স্পিড অসাধারণ — ৭ দিনে PP স্যাম্পল হাতে পেয়েছি। প্রতিটি শিপমেন্ট অন-টাইম।", r: 5 },
  { n: "David Kim", c: "🇺🇸 আমেরিকা — ই-কমার্স সেলার", t: "ছোট অর্ডার (৩,০০০ পিস) দিয়েও প্রিমিয়াম সার্ভিস পেয়েছি। প্রাইস নেগোসিয়েশনে তারা আমাদের ১২% খরচ বাঁচিয়েছে।", r: 4.5 },
];

/* ---------------- RFQ storage (browser-local) ---------------- */

export type Rfq = { id: string; company: string; name: string; country: string; product: string; qty: string; price: string; status: string; date: string };

const SEED_RFQS: Rfq[] = [
  { id: "RFQ-1042", company: "EuroStyle GmbH", name: "Markus Weber", country: "জার্মানি", product: "নিট টি-শার্ট", qty: "৫০,০০০ পিস", price: "$1.85/pc", status: "কোটেশন পাঠানো হয়েছে", date: "আজ" },
  { id: "RFQ-1041", company: "London Apparel Ltd", name: "Sarah Collins", country: "যুক্তরাজ্য", product: "হুডি", qty: "২০,০০০ পিস", price: "$4.20/pc", status: "স্যাম্পল চলছে", date: "গতকাল" },
  { id: "RFQ-1040", company: "Kim Trading Co.", name: "David Kim", country: "আমেরিকা", product: "ডেনিম জিন্স", qty: "৩০,০০০ পিস", price: "$5.60/pc", status: "কনফার্ম", date: "২ দিন আগে" },
  { id: "RFQ-1039", company: "Nordic Wear AB", name: "Elin Svensson", country: "সুইডেন", product: "সোয়েটার", qty: "১৫,০০০ পিস", price: "$6.10/pc", status: "নতুন", date: "২ দিন আগে" },
  { id: "RFQ-1038", company: "Tokyo Fashion KK", name: "Yuki Tanaka", country: "জাপান", product: "ফরমাল শার্ট", qty: "২৫,০০০ পিস", price: "$3.40/pc", status: "শিপড", date: "৫ দিন আগে" },
];

export function loadRfqs(): Rfq[] {
  try {
    const raw = localStorage.getItem("texbridge_rfqs");
    const mine: Rfq[] = raw ? JSON.parse(raw) : [];
    return [...mine, ...SEED_RFQS];
  } catch {
    return SEED_RFQS;
  }
}

function saveRfq(r: Rfq) {
  try {
    const raw = localStorage.getItem("texbridge_rfqs");
    const mine: Rfq[] = raw ? JSON.parse(raw) : [];
    localStorage.setItem("texbridge_rfqs", JSON.stringify([r, ...mine]));
  } catch { /* ignore */ }
}

/* ---------------- HOME ---------------- */

export function BhHome() {
  const { def, base } = useDemo();
  const stats: [number, string, string][] = [
    [120, "+", "যাচাইকৃত ফ্যাক্টরি"],
    [40, "+", "দেশে রপ্তানি"],
    [1500, "+", "অর্ডার সম্পন্ন"],
    [98, "%", "অন-টাইম শিপমেন্ট"],
  ];
  return (
    <>
      {/* HERO */}
      <div className="relative overflow-hidden text-white">
        <div className={`absolute inset-0 bg-gradient-to-br ${def.grad}`} />
        <div className="pointer-events-none absolute inset-0 opacity-[0.13]" style={{ backgroundImage: "linear-gradient(#ffffff33 1px, transparent 1px), linear-gradient(90deg, #ffffff33 1px, transparent 1px)", backgroundSize: "42px 42px" }} aria-hidden />
        <div className="bh-blob pointer-events-none absolute -left-20 top-10 h-72 w-72 rounded-full bg-cyan-300/20 blur-[90px]" aria-hidden />
        <div className="bh-blob pointer-events-none absolute -right-10 bottom-0 h-80 w-80 rounded-full bg-indigo-400/20 blur-[100px]" style={{ animationDelay: "-6s" }} aria-hidden />

        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 pb-10 pt-12 sm:pt-16 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-[11px] font-black backdrop-blur">
              <span className="relative flex h-2 w-2"><span className="absolute h-full w-full animate-ping rounded-full bg-emerald-300" /><span className="h-2 w-2 rounded-full bg-emerald-300" /></span>
              ISO-সার্টিফাইড সোর্সিং পার্টনার — ঢাকা, বাংলাদেশ
            </span>
            <h1 className="mt-5 text-4xl font-black leading-[1.08] sm:text-5xl">
              {def.heroTitle}
              <span className="mt-2 block bg-gradient-to-r from-cyan-200 via-sky-300 to-indigo-200 bg-clip-text text-transparent">ঝামেলাহীন, প্রতিটি ধাপে QC সহ</span>
            </h1>
            <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-white/80">
              ফ্যাক্টরি সিলেকশন থেকে শিপমেন্ট — একজন ডেডিকেটেড মার্চেন্ডাইজার আপনার প্রতিটি অর্ডারের পাশে।
              স্যাম্পল, প্রোডাকশন আপডেট আর AQL ইন্সপেকশন রিপোর্ট — সব এক জায়গায়।
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={`${base}/rfq`} className="rounded-2xl bg-white px-6 py-3.5 text-sm font-black text-slate-900 shadow-[0_12px_30px_rgba(0,0,0,0.35)] transition hover:-translate-y-0.5">📩 RFQ পাঠান — ফ্রি কোটেশন</Link>
              <Link href={`${base}/services`} className="rounded-2xl border border-white/30 bg-white/10 px-6 py-3.5 text-sm font-bold backdrop-blur transition hover:bg-white/20">🛠️ সার্ভিস দেখুন</Link>
            </div>
            <div className="mt-7 flex flex-wrap gap-x-5 gap-y-1.5 text-xs font-bold text-white/75">
              <span>✓ WRAP / BSCI সার্টিফাইড ফ্যাক্টরি</span>
              <span>✓ ৪৮ ঘণ্টায় কোটেশন</span>
              <span>✓ AQL 2.5 ইন্সপেকশন</span>
            </div>
          </div>

          {/* live order tracker mock */}
          <div className="relative mx-auto w-full max-w-[440px]">
            <div className="relative rounded-3xl border border-white/15 bg-[#0b1220]/90 p-5 shadow-[0_30px_70px_rgba(0,0,0,0.5)] backdrop-blur">
              <div className="flex items-center justify-between">
                <p className="text-sm font-black">📦 লাইভ অর্ডার ট্র্যাকার</p>
                <span className="flex items-center gap-1 rounded-full bg-red-500 px-2.5 py-1 text-[9px] font-black"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" /> LIVE</span>
              </div>
              {[
                ["#PO-8841 • টি-শার্ট — EuroStyle 🇩🇪", "প্রোডাকশনে", 72, "bg-sky-400"],
                ["#PO-8836 • হুডি — London Apparel 🇬🇧", "ফাইনাল QC", 91, "bg-emerald-400"],
                ["#PO-8829 • ডেনিম — Kim Trading 🇺🇸", "শিপড 🚢", 100, "bg-indigo-400"],
              ].map(([t, s, p, c]) => (
                <div key={t as string} className="mt-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white/85">{t}</span>
                    <span className="font-black text-white">{s} • {toBnDigits(p as number)}%</span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/10">
                    <div className={`bh-bar h-full rounded-full ${c}`} style={{ ["--w" as string]: `${p}%` }} />
                  </div>
                </div>
              ))}
              <div className="mt-5 grid grid-cols-3 gap-2 text-center">
                {[["৩৮", "চলমান অর্ডার"], ["১২", "এই সপ্তাহে শিপমেন্ট"], ["৪.৯", "বায়ার রেটিং ⭐"]].map(([v, t]) => (
                  <div key={t} className="rounded-2xl bg-white/5 px-2 py-2.5 ring-1 ring-white/10">
                    <p className="font-black text-white">{v}</p>
                    <p className="text-[9px] font-bold text-white/55">{t}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="bh-float absolute -left-3 top-10 hidden rounded-2xl border border-white/15 bg-[#0d1526]/95 px-3.5 py-2.5 shadow-2xl sm:block">
              <p className="text-[10px] font-bold text-white/55">🔍 ফাইনাল QC</p>
              <p className="text-sm font-black text-emerald-300">পাস ✓ AQL 2.5</p>
            </div>
            <div className="bh-float absolute -right-2 bottom-12 hidden rounded-2xl border border-white/15 bg-[#0d1526]/95 px-3.5 py-2.5 shadow-2xl sm:block" style={{ animationDelay: "-3s" }}>
              <p className="text-[10px] font-bold text-white/55">💰 বায়ারের সাশ্রয়</p>
              <p className="text-sm font-black text-cyan-300">গড়ে ১২% কম খরচ</p>
            </div>
          </div>
        </div>

        {/* counters */}
        <div className="relative border-t border-white/10 bg-black/25">
          <div className="mx-auto grid max-w-6xl grid-cols-2 divide-x divide-white/10 px-4 sm:grid-cols-4">
            {stats.map(([v, suf, t]) => (
              <div key={t} className="px-4 py-5 text-center">
                <p className="text-2xl font-black sm:text-3xl"><CountUp to={v} suffix={suf} /></p>
                <p className="mt-0.5 text-[11px] font-bold text-white/60">{t}</p>
              </div>
            ))}
          </div>
        </div>
        <style>{`
          @keyframes bh-blob { 0%,100% { transform: translate(0,0) scale(1) } 50% { transform: translate(24px,-18px) scale(1.12) } }
          .bh-blob { animation: bh-blob 11s ease-in-out infinite }
          @keyframes bh-float { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-9px) } }
          .bh-float { animation: bh-float 5s ease-in-out infinite }
          @keyframes bh-bar { from { width: 0 } to { width: var(--w) } }
          .bh-bar { animation: bh-bar 1.6s cubic-bezier(.22,1,.36,1) both }
          @keyframes bh-marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }
          .bh-marquee { animation: bh-marquee 30s linear infinite }
        `}</style>
      </div>

      {/* country marquee */}
      <div className="border-b border-white/5 bg-black/30 py-3">
        <div className="overflow-hidden" aria-hidden>
          <div className="bh-marquee flex w-max gap-10">
            {[...COUNTRIES, ...COUNTRIES].map((c, i) => (
              <span key={i} className="whitespace-nowrap text-sm font-bold text-slate-300">{c}</span>
            ))}
          </div>
        </div>
        <p className="mt-2 text-center text-[11px] font-bold text-slate-500">🌍 যেসব দেশে আমাদের বায়াররা রপ্তানি নিচ্ছেন</p>
      </div>

      <Page>
        {/* services */}
        <Reveal>
          <SectionTitle t="🛠️ আমাদের সার্ভিস" sub="এন্ড-টু-এন্ড সোর্সিং সলিউশন" link={`${base}/services`} />
        </Reveal>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {def.services.map((s, i) => (
            <Reveal key={s.id} delay={i * 70}>
              <Link href={`${base}/s/${s.id}`} className={`${card} group block h-full transition hover:-translate-y-1 hover:border-sky-400/40`}>
                <p className="text-4xl">{s.e}</p>
                <p className="mt-3 font-black text-white">{s.n}</p>
                <p className={`mt-1 line-clamp-2 text-sm ${sub}`}>{s.desc}</p>
                <p className="mt-3 text-xs font-black text-sky-300">বিস্তারিত দেখুন →</p>
              </Link>
            </Reveal>
          ))}
        </div>

        {/* products */}
        <Reveal className="mt-12">
          <SectionTitle t="👕 প্রোডাক্ট ক্যাটাগরি" sub="সবচেয়ে বেশি চাহিদার আইটেম" link={`${base}/products`} />
        </Reveal>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {def.products.slice(0, 8).map((p, i) => (
            <Reveal key={p.id} delay={i * 60}>
              <Link href={`${base}/p/${p.id}`} className={`${card} group block h-full !p-0 overflow-hidden transition hover:-translate-y-1 hover:border-sky-400/40`}>
                <div className={`flex h-28 items-center justify-center bg-gradient-to-br ${def.grad} text-6xl`}>{p.e}</div>
                <div className="p-4">
                  <p className="font-black text-white">{p.n}</p>
                  <p className={`text-xs ${sub}`}>{p.c} • MOQ ১,০০০ পিস</p>
                  <p className="mt-2 text-sm font-black text-sky-300">FOB {toBnDigits(p.p)} টাকা<span className="text-[11px] text-slate-400">/পিস থেকে</span></p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>

        {/* process */}
        <Reveal className="mt-12">
          <SectionTitle t="⚙️ যেভাবে কাজ করি" sub="RFQ থেকে শিপমেন্ট — ৬ ধাপ" link={`${base}/process`} />
        </Reveal>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PROCESS.map(([e, t, d], i) => (
            <Reveal key={t} delay={i * 70}>
              <div className={`${card} relative h-full overflow-hidden`}>
                <span className="absolute -right-2 -top-4 text-[76px] font-black text-white/[0.05]">{toBnDigits(i + 1)}</span>
                <p className="text-3xl">{e}</p>
                <p className="mt-2 font-black text-white">{t}</p>
                <p className={`mt-1 text-sm ${sub}`}>{d}</p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* why us + testimonials */}
        <div className="mt-12 grid gap-4 lg:grid-cols-2">
          <Reveal>
            <div className={`${card} h-full`}>
              <p className="text-lg font-black text-white">🏆 কেন টেক্সব্রিজ?</p>
              <ul className="mt-3 space-y-3">
                {[
                  ["🏭", "যাচাইকৃত ফ্যাক্টরি নেটওয়ার্ক", "প্রতিটি ফ্যাক্টরি অডিট-পাস ও কমপ্লায়েন্স-যাচাই করা।"],
                  ["👤", "ডেডিকেটেড মার্চেন্ডাইজার", "প্রতিটি বায়ারের জন্য একজন নির্দিষ্ট মার্চেন্ডাইজার — সরাসরি যোগাযোগ।"],
                  ["🔍", "স্বচ্ছ QC রিপোর্ট", "ছবি-ভিডিওসহ ইনলাইন ও ফাইনাল ইন্সপেকশন রিপোর্ট প্রতিটি অর্ডারে।"],
                  ["💰", "সেরা প্রাইস গ্যারান্টি", "একাধিক ফ্যাক্টরির কোটেশন তুলনা করে সবচেয়ে ভালো রেট।"],
                ].map(([e, t, d]) => (
                  <li key={t} className="flex gap-3">
                    <span className="text-2xl">{e}</span>
                    <span><b className="text-white">{t}</b><br /><span className={`text-sm ${sub}`}>{d}</span></span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
          <div className="space-y-3">
            {TESTIMONIALS.map((x, i) => (
              <Reveal key={x.n} delay={i * 80}>
                <div className={card}>
                  <Stars rating={x.r} />
                  <p className="mt-2 text-sm leading-relaxed text-slate-200">“{x.t}”</p>
                  <p className="mt-2 text-xs font-black text-white">{x.n} <span className={`font-bold ${sub}`}>• {x.c}</span></p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* CTA */}
        <Reveal className="mt-12">
          <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${def.grad} p-8 text-center text-white sm:p-10`}>
            <p className="text-2xl font-black sm:text-3xl">আপনার পরের অর্ডারটা আমাদের দিয়ে শুরু করুন</p>
            <p className="mx-auto mt-2 max-w-xl text-sm text-white/80">টেক-প্যাক বা শুধু আইডিয়া পাঠালেই হবে — ৪৮ ঘণ্টায় ফ্যাক্টরি-যাচাই করা কোটেশন পাচ্ছেন, সম্পূর্ণ ফ্রি।</p>
            <Link href={`${base}/rfq`} className="mt-5 inline-block rounded-2xl bg-white px-7 py-3.5 text-sm font-black text-slate-900 shadow-xl transition hover:-translate-y-0.5">📩 ফ্রি কোটেশন নিন</Link>
          </div>
        </Reveal>
      </Page>
    </>
  );
}

/* ---------------- SERVICES ---------------- */

export function BhServices() {
  const { def, base } = useDemo();
  return (
    <Page>
      <Back href={base} label="হোম" />
      <SectionTitle t="🛠️ আমাদের সার্ভিস" sub="সোর্সিং থেকে শিপমেন্ট — সব এক ছাদের নিচে" />
      <div className="grid gap-3 sm:grid-cols-2">
        {def.services.map((s) => (
          <Link key={s.id} href={`${base}/s/${s.id}`} className={`${card} group block transition hover:-translate-y-1 hover:border-sky-400/40`}>
            <div className="flex items-start gap-4">
              <span className="text-5xl">{s.e}</span>
              <div>
                <p className="font-black text-white">{s.n}</p>
                <p className={`mt-1 text-sm ${sub}`}>{s.desc}</p>
                <p className="mt-2 flex items-center gap-3 text-xs font-bold">
                  <span className="text-amber-300">⭐ {toBnDigits(s.rating)}</span>
                  <span className={sub}>⏱️ {s.duration}</span>
                  <span className="text-sky-300">বিস্তারিত →</span>
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
      <div className={`mt-6 rounded-3xl bg-gradient-to-br ${def.grad} p-6 text-center text-white`}>
        <p className="text-lg font-black">কাস্টম সার্ভিস লাগবে?</p>
        <p className="mt-1 text-sm text-white/80">প্রাইভেট লেবেল, কাস্টম প্যাকেজিং, ছোট অর্ডার — আলোচনা করুন আমাদের টিমের সাথে।</p>
        <Link href={`${base}/rfq`} className="mt-4 inline-block rounded-xl bg-white px-5 py-2.5 text-sm font-black text-slate-900">📩 RFQ পাঠান</Link>
      </div>
    </Page>
  );
}

export function BhServiceDetail({ id }: { id: string }) {
  const { def, base } = useDemo();
  const s = def.services.find((x) => x.id === id);
  if (!s) return <Page><Empty emoji="🔍" text="সার্ভিসটি পাওয়া যায়নি" /></Page>;
  const points: Record<string, string[]> = {
    s0: ["১২০+ ফ্যাক্টরির ডেটাবেস থেকে ম্যাচিং", "ডেডিকেটেড মার্চেন্ডাইজার", "সাপ্তাহিক প্রোডাকশন আপডেট", "টাইম অ্যান্ড অ্যাকশন (T&A) প্ল্যান"],
    s1: ["টেক-প্যাক বিশ্লেষণ ও প্যাটার্ন সাপোর্ট", "PP / ফিট / শিপমেন্ট স্যাম্পল", "ফ্যাব্রিক ও ট্রিমস সোর্সিং", "সাইজ-সেট ও কালার অনুমোদন"],
    s2: ["ইনলাইন ইন্সপেকশন (২০% ও ৮০%)", "ফাইনাল ইন্সপেকশন — AQL 2.5", "ছবি-ভিডিওসহ ডিটেইল রিপোর্ট", "ল্যাব টেস্ট সমন্বয় (SGS / BV / Intertek)"],
    s3: ["একাধিক ফ্যাক্টরির কোটেশন তুলনা", "কস্টিং ব্রেকডাউন বিশ্লেষণ", "গড়ে ৮–১২% সাশ্রয়", "স্বচ্ছ কমিশন — কোনো লুকানো চার্জ নয়"],
    s4: ["WRAP / BSCI / SEDEX অডিট প্রস্তুতি", "ফ্যাক্টরি কমপ্লায়েন্স যাচাই", "সংশোধনী পরিকল্পনা (CAP) সাপোর্ট", "বার্ষিক রি-অডিট মনিটরিং"],
    s5: ["ফ্রেইট ফরওয়ার্ডার সমন্বয়", "এক্সপোর্ট ডকুমেন্টেশন", "কার্টন ও প্যাকিং সুপারভিশন", "ডেলিভারি পর্যন্ত ট্র্যাকিং আপডেট"],
  };
  return (
    <Page>
      <Back href={`${base}/services`} label="সব সার্ভিস" />
      <div className={card}>
        <p className="text-6xl">{s.e}</p>
        <h1 className="mt-3 text-2xl font-black text-white">{s.n}</h1>
        <p className={`mt-2 max-w-2xl leading-relaxed ${sub}`}>{s.desc}</p>
        <p className="mt-3 flex gap-4 text-sm font-bold">
          <span className="text-amber-300">⭐ রেটিং {toBnDigits(s.rating)}</span>
          <span className={sub}>⏱️ সার্ভিস টাইপ: {s.duration}</span>
        </p>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className={card}>
          <p className="font-black text-white">✅ যা যা পাচ্ছেন</p>
          <ul className="mt-3 space-y-2.5">
            {(points[s.id] ?? points.s0).map((pt) => (
              <li key={pt} className="flex items-start gap-2 text-sm text-slate-200"><span className="text-emerald-300">✓</span>{pt}</li>
            ))}
          </ul>
        </div>
        <div className={`${card} text-center`}>
          <p className="text-4xl">💬</p>
          <p className="mt-2 font-black text-white">এই সার্ভিস নিয়ে আলোচনা করুন</p>
          <p className={`mt-1 text-sm ${sub}`}>আপনার প্রোডাক্ট ও পরিমাণ জানালে ৪৮ ঘণ্টায় কোটেশন দেব।</p>
          <Link href={`${base}/rfq`} className="mt-4 inline-block rounded-xl px-5 py-3 text-sm font-black text-white" style={{ background: def.accent }}>📩 RFQ পাঠান</Link>
          <p className={`mt-3 text-xs ${sub}`}>📞 {def.contact}</p>
        </div>
      </div>
    </Page>
  );
}

/* ---------------- PRODUCTS ---------------- */

export function BhProducts() {
  const { def, base } = useDemo();
  const [cat, setCat] = useState("সব");
  const list = cat === "সব" ? def.products : def.products.filter((p) => p.c === cat);
  return (
    <Page>
      <Back href={base} label="হোম" />
      <SectionTitle t="👕 প্রোডাক্ট ক্যাটাগরি" sub="FOB প্রাইস প্রতি পিস — পরিমাণ অনুযায়ী পরিবর্তনশীল" />
      <div className="mb-4 flex flex-wrap gap-2">
        {def.cats.map((c) => (
          <button key={c} onClick={() => setCat(c)} className={`rounded-full px-4 py-2 text-xs font-black transition ${cat === c ? "text-white" : "bg-white/5 text-slate-300 ring-1 ring-white/15 hover:bg-white/10"}`} style={cat === c ? { background: def.accent } : undefined}>{c}</button>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((p) => (
          <Link key={p.id} href={`${base}/p/${p.id}`} className={`${card} group block !p-0 overflow-hidden transition hover:-translate-y-1 hover:border-sky-400/40`}>
            <div className={`flex h-36 items-center justify-center bg-gradient-to-br ${def.grad} text-7xl`}>{p.e}</div>
            <div className="p-4">
              <p className="font-black text-white">{p.n}</p>
              <p className={`mt-0.5 text-xs ${sub}`}>{p.c} • MOQ ১,০০০ পিস • ⭐ {toBnDigits(p.rating)}</p>
              <div className="mt-2 flex items-center justify-between">
                <p className="font-black text-sky-300">FOB {toBnDigits(p.p)} টাকা<span className="text-[11px] text-slate-400">/পিস</span></p>
                <span className="text-xs font-black text-sky-300">ইনকোয়ারি →</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
      {list.length === 0 && <Empty emoji="📦" text="এই ক্যাটাগরিতে প্রোডাক্ট নেই" />}
    </Page>
  );
}

export function BhProductDetail({ id }: { id: string }) {
  const { def, base } = useDemo();
  const p = def.products.find((x) => x.id === id);
  const [form, setForm] = useState({ name: "", phone: "", qty: "" });
  const [sent, setSent] = useState(false);
  if (!p) return <Page><Empty emoji="🔍" text="প্রোডাক্টটি পাওয়া যায়নি" /></Page>;
  const specs: [string, string][] = [
    ["ফ্যাব্রিক", p.c === "ডেনিম" ? "১০০% কটন ডেনিম, ১২ oz" : p.c === "সোয়েটার" ? "অ্যাক্রিলিক / উল ব্লেন্ড" : "১০০% কটন, ১৬০–১৮০ GSM"],
    ["সাইজ রেঞ্জ", "XS – XXL (বায়ারের চার্ট অনুযায়ী)"],
    ["কালার", "বায়ারের প্যানটোন অনুযায়ী"],
    ["MOQ", "১,০০০ পিস / কালার"],
    ["স্যাম্পল সময়", "৭–১০ দিন"],
    ["লিড টাইম", "৪৫–৬০ দিন (কনফার্মেশনের পর)"],
  ];
  return (
    <Page>
      <Back href={`${base}/products`} label="সব প্রোডাক্ট" />
      <div className="grid gap-4 lg:grid-cols-2">
        <div className={`flex min-h-[280px] items-center justify-center rounded-3xl bg-gradient-to-br ${def.grad} text-[120px]`}>{p.e}</div>
        <div className={card}>
          <p className={`text-xs font-black uppercase tracking-widest ${sub}`}>{p.c}</p>
          <h1 className="mt-1 text-2xl font-black text-white">{p.n}</h1>
          <div className="mt-2"><Stars rating={p.rating} reviews={p.reviews} /></div>
          <p className={`mt-3 leading-relaxed ${sub}`}>{p.desc}</p>
          <p className="mt-4 text-3xl font-black text-sky-300">FOB {toBnDigits(p.p)} টাকা<span className="text-sm text-slate-400"> / পিস থেকে</span></p>
          <div className="mt-4 space-y-1.5">
            {specs.map(([k, v]) => (
              <p key={k} className="flex justify-between gap-3 border-b border-white/5 pb-1.5 text-sm"><span className={sub}>{k}</span><b className="text-right text-slate-100">{v}</b></p>
            ))}
          </div>
        </div>
      </div>
      <div className={`${card} mt-4`}>
        <p className="font-black text-white">📩 এই প্রোডাক্টের কোটেশন চান</p>
        {sent ? (
          <p className="mt-3 rounded-2xl bg-emerald-400/10 px-4 py-3 text-sm font-bold text-emerald-300 ring-1 ring-emerald-400/30">✅ ইনকোয়ারি পাঠানো হয়েছে! আমাদের মার্চেন্ডাইজার ২৪ ঘণ্টার মধ্যে যোগাযোগ করবেন।</p>
        ) : (
          <form className="mt-3 grid gap-3 sm:grid-cols-3" onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
            <Field required placeholder="আপনার নাম / কোম্পানি" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Field required placeholder="WhatsApp / ফোন" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <Field required placeholder="পরিমাণ (পিস)" value={form.qty} onChange={(e) => setForm({ ...form, qty: e.target.value })} />
            <div className="sm:col-span-3"><Btn accent={def.accent}>📨 কোটেশন চান</Btn></div>
          </form>
        )}
      </div>
    </Page>
  );
}

/* ---------------- PROCESS & FACTORIES ---------------- */

export function BhProcess() {
  const { def, base } = useDemo();
  return (
    <Page>
      <Back href={base} label="হোম" />
      <SectionTitle t="⚙️ আমাদের ওয়ার্ক প্রসেস" sub="প্রতিটি ধাপে স্বচ্ছতা ও আপডেট" />
      <div className="space-y-3">
        {PROCESS.map(([e, t, d], i) => (
          <Reveal key={t} delay={i * 40}>
            <div className={`${card} flex gap-4`}>
              <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${def.grad} text-2xl`}>{e}</div>
              <div>
                <p className="font-black text-white"><span className="text-sky-300">ধাপ {toBnDigits(i + 1)}:</span> {t}</p>
                <p className={`mt-1 text-sm leading-relaxed ${sub}`}>{d}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
      <div className={`${card} mt-5`}>
        <p className="font-black text-white">🔍 QC চেকপয়েন্ট</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {["ফ্যাব্রিক ইন্সপেকশন (4-point)", "ইনলাইন চেক — ২০% ও ৮০%", "মেজারমেন্ট ও ফিটিং অডিট", "ফাইনাল AQL 2.5 র‍্যান্ডম চেক", "কার্টন ও প্যাকিং অডিট", "ল্যাব টেস্ট রিপোর্ট যাচাই"].map((x) => (
            <p key={x} className="rounded-xl bg-white/5 px-3 py-2.5 text-sm text-slate-200 ring-1 ring-white/10">✓ {x}</p>
          ))}
        </div>
      </div>
    </Page>
  );
}

export function BhFactories() {
  const { def, base } = useDemo();
  return (
    <Page>
      <Back href={base} label="হোম" />
      <SectionTitle t="🏭 পার্টনার ফ্যাক্টরি" sub="সব ফ্যাক্টরি অডিট-যাচাই করা ও কমপ্লায়েন্স-সার্টিফাইড" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {FACTORIES.map((f, i) => (
          <Reveal key={f.n} delay={i * 60}>
            <div className={`${card} h-full`}>
              <p className="text-5xl">{f.e}</p>
              <p className="mt-3 font-black text-white">{f.n}</p>
              <p className={`mt-1 text-xs ${sub}`}>📍 {f.loc} • 🏭 ক্যাপাসিটি: {f.cap}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {f.spec.map((s) => <span key={s} className="rounded-full bg-sky-400/10 px-2.5 py-1 text-[11px] font-bold text-sky-300 ring-1 ring-sky-400/25">{s}</span>)}
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {f.cert.map((c) => <span key={c} className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-[11px] font-bold text-emerald-300 ring-1 ring-emerald-400/25">✓ {c}</span>)}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
      <p className={`mt-4 text-center text-xs ${sub}`}>আরও ১১৪+ ফ্যাক্টরি আমাদের নেটওয়ার্কে — আপনার প্রোডাক্ট অনুযায়ী সেরা ম্যাচ করে দেব।</p>
    </Page>
  );
}

/* ---------------- RFQ ---------------- */

export function BhRfq() {
  const { def, base } = useDemo();
  const [form, setForm] = useState({ company: "", name: "", contact: "", country: "", product: def.cats[1] ?? "নিট", qty: "", price: "", msg: "" });
  const [done, setDone] = useState<string | null>(null);
  function submit(e: React.FormEvent) {
    e.preventDefault();
    const id = `RFQ-${1043 + Math.floor(Math.random() * 400)}`;
    saveRfq({ id, company: form.company || form.name, name: form.name, country: form.country, product: form.product, qty: form.qty, price: form.price || "—", status: "নতুন", date: "এখনই" });
    setDone(id);
  }
  if (done) return (
    <Page narrow>
      <div className={`${card} mt-8 text-center`}>
        <p className="text-6xl">🎉</p>
        <h1 className="mt-3 text-2xl font-black text-white">RFQ সফলভাবে গৃহীত হয়েছে!</h1>
        <p className={`mt-2 ${sub}`}>আপনার RFQ নম্বর: <b className="text-sky-300">{done}</b><br />আমাদের মার্চেন্ডাইজিং টিম ৪৮ ঘণ্টার মধ্যে ফ্যাক্টরি-যাচাই করা কোটেশন পাঠাবে।</p>
        <div className="mt-5 flex justify-center gap-3">
          <Link href={base} className="rounded-xl bg-white/10 px-5 py-2.5 text-sm font-bold text-white ring-1 ring-white/15">🏠 হোমে যান</Link>
          <Link href={`${base}/products`} className="rounded-xl px-5 py-2.5 text-sm font-black text-white" style={{ background: def.accent }}>👕 প্রোডাক্ট দেখুন</Link>
        </div>
      </div>
    </Page>
  );
  return (
    <Page narrow>
      <Back href={base} label="হোম" />
      <SectionTitle t="📩 RFQ পাঠান" sub="ফ্রি কোটেশন — ৪৮ ঘণ্টায় উত্তর" />
      <form onSubmit={submit} className={`${card} grid gap-3`}>
        <Field required placeholder="কোম্পানির নাম *" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
        <div className="grid gap-3 sm:grid-cols-2">
          <Field required placeholder="আপনার নাম *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Field required placeholder="ইমেইল / WhatsApp *" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field required placeholder="দেশ *" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
          <select className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white outline-none" value={form.product} onChange={(e) => setForm({ ...form, product: e.target.value })}>
            {def.cats.filter((c) => c !== "সব").map((c) => <option key={c} value={c} className="text-slate-900">{c} প্রোডাক্ট</option>)}
            <option value="অন্যান্য" className="text-slate-900">অন্যান্য</option>
          </select>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field required placeholder="পরিমাণ (পিস) *" value={form.qty} onChange={(e) => setForm({ ...form, qty: e.target.value })} />
          <Field placeholder="টার্গেট প্রাইস (যদি থাকে)" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
        </div>
        <Area placeholder="প্রোডাক্টের বিবরণ, ফ্যাব্রিক, GSM, সাইজ রেশিও ইত্যাদি..." value={form.msg} onChange={(e) => setForm({ ...form, msg: e.target.value })} />
        <Btn accent={def.accent}>📨 RFQ সাবমিট করুন</Btn>
        <p className={`text-center text-xs ${sub}`}>সাবমিট করলেই আমাদের টিম আপনার সাথে যোগাযোগ করবে — কোনো চার্জ নেই।</p>
      </form>
    </Page>
  );
}

/* ---------------- ABOUT & CONTACT ---------------- */

export function BhAbout() {
  const { def } = useDemo();
  return (
    <Page>
      <SectionTitle t={`ℹ️ ${def.name} সম্পর্কে`} sub={def.type} />
      <div className={card}>
        <p className="leading-relaxed text-slate-200">{def.about}</p>
        <p className={`mt-3 leading-relaxed ${sub}`}>
          ২০১৫ সাল থেকে আমরা ইউরোপ, আমেরিকা ও এশিয়ার বায়ারদের জন্য বাংলাদেশের সেরা ফ্যাক্টরিগুলো থেকে
          গার্মেন্টস সোর্সিং করে আসছি। আমাদের নিজস্ব QC টিম প্রতিটি অর্ডারের প্রতিটি ধাপ পর্যবেক্ষণ করে —
          তাই বায়ার পান নিশ্চিন্ত মান, সঠিক দাম আর অন-টাইম ডেলিভারি।
        </p>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[[120, "+", "ফ্যাক্টরি পার্টনার"], [40, "+", "দেশে রপ্তানি"], [1500, "+", "অর্ডার সম্পন্ন"], [60, "+", "রেগুলার বায়ার"]].map(([v, suf, t]) => (
          <div key={t as string} className={`${card} text-center`}>
            <p className="text-3xl font-black text-sky-300"><CountUp to={v as number} suffix={suf as string} /></p>
            <p className={`mt-1 text-xs ${sub}`}>{t}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[["👨‍💼", "রাকিব হাসান", "প্রতিষ্ঠাতা ও CEO"], ["👩‍💼", "নুসরাত জাহান", "হেড অব মার্চেন্ডাইজিং"], ["👨‍🔬", "তানভীর আহমেদ", "QC ম্যানেজার"], ["👩‍💻", "ফারিয়া ইসলাম", "বায়ার রিলেশনস"]].map(([e, n, r]) => (
          <div key={n} className={`${card} text-center`}>
            <p className="text-5xl">{e}</p>
            <p className="mt-2 font-black text-white">{n}</p>
            <p className={`text-xs ${sub}`}>{r}</p>
          </div>
        ))}
      </div>
    </Page>
  );
}

export function BhContact() {
  const { def, base } = useDemo();
  const [sent, setSent] = useState(false);
  return (
    <Page narrow>
      <SectionTitle t="📞 যোগাযোগ" sub="আমাদের টিম সবসময় প্রস্তুত" />
      <div className="grid gap-3">
        {[
          ["📱", "ফোন / WhatsApp", def.contact],
          ["📍", "ঠিকানা", def.address],
          ["🕘", "অফিস সময়", def.hours],
          ["✉️", "ইমেইল", "info@texbridge-demo.com"],
        ].map(([e, t, v]) => (
          <div key={t} className={`${card} flex items-center gap-4 !py-4`}>
            <span className="text-3xl">{e}</span>
            <div><p className={`text-xs ${sub}`}>{t}</p><p className="font-black text-white">{v}</p></div>
          </div>
        ))}
      </div>
      {sent ? (
        <p className="mt-4 rounded-2xl bg-emerald-400/10 px-4 py-3 text-center text-sm font-bold text-emerald-300 ring-1 ring-emerald-400/30">✅ বার্তা পাঠানো হয়েছে! শীঘ্রই উত্তর পাবেন।</p>
      ) : (
        <form className={`${card} mt-4 grid gap-3`} onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
          <Field required placeholder="আপনার নাম" />
          <Field required placeholder="ইমেইল / ফোন" />
          <Area required placeholder="আপনার বার্তা..." />
          <Btn accent={def.accent}>📨 বার্তা পাঠান</Btn>
        </form>
      )}
      <p className={`mt-4 text-center text-xs ${sub}`}>দ্রুত উত্তরের জন্য <Link href={`${base}/rfq`} className="font-bold text-sky-300 underline">RFQ ফর্ম</Link> ব্যবহার করুন।</p>
    </Page>
  );
}

/* ---------------- AUTH ---------------- */

export function BhLogin() {
  const { def, base, store } = useDemo();
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  return (
    <Page narrow>
      <div className={`${card} mt-6`}>
        <p className="text-center text-5xl">{def.logoEmoji}</p>
        <h1 className="mt-3 text-center text-xl font-black text-white">বায়ার লগইন</h1>
        <p className={`mt-1 text-center text-sm ${sub}`}>{def.name}-এ স্বাগতম</p>
        <form className="mt-5 grid gap-3" onSubmit={(e) => { e.preventDefault(); const r = store.login(phone.trim(), pass); if (r) setErr(r); else router.push(`${base}/account`); }}>
          <Field required placeholder="মোবাইল নম্বর" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <Field required type="password" placeholder="পাসওয়ার্ড" value={pass} onChange={(e) => setPass(e.target.value)} />
          {err && <p className="rounded-xl bg-red-400/10 px-3 py-2 text-sm font-bold text-red-300 ring-1 ring-red-400/25">{err}</p>}
          <Btn accent={def.accent}>🔐 লগইন করুন</Btn>
        </form>
        <p className={`mt-4 text-center text-sm ${sub}`}>অ্যাকাউন্ট নেই? <Link href={`${base}/signup`} className="font-bold text-sky-300 underline">সাইন আপ করুন</Link></p>
      </div>
    </Page>
  );
}

export function BhSignup() {
  const { def, base, store } = useDemo();
  const router = useRouter();
  const [f, setF] = useState({ name: "", phone: "", pass: "" });
  const [err, setErr] = useState("");
  return (
    <Page narrow>
      <div className={`${card} mt-6`}>
        <p className="text-center text-5xl">{def.logoEmoji}</p>
        <h1 className="mt-3 text-center text-xl font-black text-white">বায়ার অ্যাকাউন্ট খুলুন</h1>
        <p className={`mt-1 text-center text-sm ${sub}`}>RFQ ট্র্যাক ও অর্ডার আপডেট পেতে</p>
        <form className="mt-5 grid gap-3" onSubmit={(e) => { e.preventDefault(); const r = store.signup(f.name.trim(), f.phone.trim(), f.pass); if (r) setErr(r); else router.push(`${base}/account`); }}>
          <Field required placeholder="নাম / কোম্পানি" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
          <Field required placeholder="মোবাইল নম্বর" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
          <Field required type="password" placeholder="পাসওয়ার্ড" value={f.pass} onChange={(e) => setF({ ...f, pass: e.target.value })} />
          {err && <p className="rounded-xl bg-red-400/10 px-3 py-2 text-sm font-bold text-red-300 ring-1 ring-red-400/25">{err}</p>}
          <Btn accent={def.accent}>✅ অ্যাকাউন্ট খুলুন</Btn>
        </form>
        <p className={`mt-4 text-center text-sm ${sub}`}>ইতিমধ্যে অ্যাকাউন্ট আছে? <Link href={`${base}/login`} className="font-bold text-sky-300 underline">লগইন করুন</Link></p>
      </div>
    </Page>
  );
}

export function BhAccount() {
  const { def, base, store } = useDemo();
  const [rfqs, setRfqs] = useState<Rfq[]>([]);
  useEffect(() => { setRfqs(loadRfqs().filter((r) => r.date === "এখনই")); }, []);
  if (!store.user) return (
    <Page narrow>
      <div className={`${card} mt-6 text-center`}>
        <p className="text-5xl">🔒</p>
        <p className="mt-3 font-black text-white">আগে লগইন করুন</p>
        <p className={`mt-1 text-sm ${sub}`}>আপনার RFQ ও অর্ডার দেখতে লগইন প্রয়োজন</p>
        <Link href={`${base}/login`} className="mt-4 inline-block rounded-xl px-5 py-2.5 text-sm font-black text-white" style={{ background: def.accent }}>🔐 লগইন</Link>
      </div>
    </Page>
  );
  return (
    <Page>
      <SectionTitle t="👤 বায়ার অ্যাকাউন্ট" sub={store.user.name} />
      <div className={card}>
        <p className="font-black text-white">{store.user.name}</p>
        <p className={`text-sm ${sub}`}>📱 {store.user.phone}</p>
        <button onClick={() => store.logout()} className="mt-3 rounded-xl bg-red-400/10 px-4 py-2 text-xs font-black text-red-300 ring-1 ring-red-400/30">🚪 লগআউট</button>
      </div>
      <div className={`${card} mt-4`}>
        <p className="font-black text-white">📩 আমার পাঠানো RFQ</p>
        {rfqs.length === 0 ? (
          <p className={`mt-2 text-sm ${sub}`}>এখনো কোনো RFQ পাঠাননি। <Link href={`${base}/rfq`} className="font-bold text-sky-300 underline">এখনই পাঠান →</Link></p>
        ) : (
          <div className="mt-3 space-y-2">
            {rfqs.map((r) => (
              <div key={r.id} className="flex items-center justify-between rounded-xl bg-white/5 px-3.5 py-2.5 text-sm ring-1 ring-white/10">
                <span><b className="text-white">{r.id}</b> <span className={sub}>• {r.product} • {r.qty}</span></span>
                <span className="rounded-full bg-amber-400/15 px-2.5 py-1 text-[11px] font-black text-amber-300">{r.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Page>
  );
}

/* ---------------- PROFESSIONAL ADMIN ---------------- */

const MONTHLY_EXPORT = [
  ["জানু", 82], ["ফেব্রু", 95], ["মার্চ", 78], ["এপ্রি", 110], ["মে", 124], ["জুন", 98],
  ["জুলা", 132], ["আগ", 145], ["সেপ্টে", 121], ["অক্টো", 152], ["নভে", 138], ["ডিসে", 160],
];
const RFQ_STATUSES = ["নতুন", "কোটেশন পাঠানো হয়েছে", "স্যাম্পল চলছে", "কনফার্ম", "শিপড", "বাতিল"];
const BUYERS = [
  { co: "EuroStyle GmbH", country: "🇩🇪 জার্মানি", orders: 48, value: "$412K", since: "২০২২" },
  { co: "London Apparel Ltd", country: "🇬🇧 যুক্তরাজ্য", orders: 36, value: "$298K", since: "২০২১" },
  { co: "Kim Trading Co.", country: "🇺🇸 আমেরিকা", orders: 29, value: "$356K", since: "২০২৩" },
  { co: "Nordic Wear AB", country: "🇸🇪 সুইডেন", orders: 21, value: "$187K", since: "২০২২" },
  { co: "Tokyo Fashion KK", country: "🇯🇵 জাপান", orders: 17, value: "$164K", since: "২০২৩" },
  { co: "Iberia Moda SL", country: "🇪🇸 স্পেন", orders: 14, value: "$121K", since: "২০২৪" },
];

export function BuyingAdmin() {
  const { def, base, store } = useDemo();
  const [tab, setTab] = useState<"dash" | "rfq" | "products" | "buyers" | "settings">("dash");
  const [rfqs, setRfqs] = useState<Rfq[]>([]);
  const [products, setProducts] = useState(def.products);
  const [newP, setNewP] = useState({ n: "", c: def.cats[1] ?? "নিট", p: "" });
  const [siteName, setSiteName] = useState(store.custom.siteName ?? def.name);
  const [heroT, setHeroT] = useState(store.custom.heroTitle ?? def.heroTitle);
  const [heroS, setHeroS] = useState(store.custom.heroSub ?? def.heroSub);
  const [saved, setSaved] = useState(false);

  useEffect(() => { setRfqs(loadRfqs()); }, []);

  const acard = "rounded-3xl border border-white/10 bg-white/[0.04] p-5";
  const input = "w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-white outline-none placeholder:text-slate-500";
  const maxExport = Math.max(...MONTHLY_EXPORT.map((m) => m[1] as number));

  const stats: [string, string, string, string][] = [
    ["📩", "মোট RFQ", String(rfqs.length), "এই মাসে +১২"],
    ["🚢", "চলমান অর্ডার", "৩৮", "১২টি শিপমেন্ট এই সপ্তাহে"],
    ["💵", "এই মাসের রপ্তানি", "$152K", "গত মাসের চেয়ে +9.6%"],
    ["🏭", "ফ্যাক্টরি পার্টনার", "১২০+", "৬টি নতুন এই কোয়ার্টারে"],
  ];

  const tabs: [typeof tab, string][] = [
    ["dash", "📊 ড্যাশবোর্ড"], ["rfq", "📩 RFQ"], ["products", "👕 প্রোডাক্ট"], ["buyers", "🌍 বায়ার"], ["settings", "⚙️ সেটিংস"],
  ];

  return (
    <Page>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-white">🛠️ {def.name} — অ্যাডমিন</h1>
          <p className={`text-sm ${sub}`}>ব্যবসার সম্পূর্ণ কন্ট্রোল প্যানেল</p>
        </div>
        <Link href={base} className="rounded-xl bg-white/10 px-4 py-2 text-xs font-black text-white ring-1 ring-white/15">🌐 সাইট দেখুন →</Link>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {tabs.map(([k, label]) => (
          <button key={k} onClick={() => setTab(k)} className={`rounded-full px-4 py-2 text-xs font-black transition ${tab === k ? "text-white" : "bg-white/5 text-slate-300 ring-1 ring-white/15 hover:bg-white/10"}`} style={tab === k ? { background: def.accent } : undefined}>{label}</button>
        ))}
      </div>

      {tab === "dash" && (
        <>
          <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {stats.map(([e, t, v, d]) => (
              <div key={t} className={acard}>
                <p className="text-2xl">{e}</p>
                <p className="mt-2 text-2xl font-black text-white">{v}</p>
                <p className={`text-xs font-bold ${sub}`}>{t}</p>
                <p className="mt-1 text-[11px] font-bold text-emerald-300">{d}</p>
              </div>
            ))}
          </div>
          <div className={`${acard} mt-4`}>
            <div className="flex items-center justify-between">
              <p className="font-black text-white">📈 মাসভিত্তিক রপ্তানি (হাজার USD)</p>
              <span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-[11px] font-black text-emerald-300 ring-1 ring-emerald-400/25">+৯.৬% YoY</span>
            </div>
            <div className="mt-4 flex h-36 items-end gap-1.5 sm:gap-2.5">
              {MONTHLY_EXPORT.map(([m, v]) => (
                <div key={m as string} className="flex flex-1 flex-col items-center gap-1.5">
                  <span className="text-[10px] font-black text-sky-300">${toBnDigits(v as number)}K</span>
                  <div className={`w-full rounded-t-lg bg-gradient-to-t ${def.grad} transition-all duration-700`} style={{ height: `${((v as number) / maxExport) * 100}%` }} />
                  <span className={`text-[10px] ${sub}`}>{m}</span>
                </div>
              ))}
            </div>
          </div>
          <div className={`${acard} mt-4`}>
            <p className="font-black text-white">📩 সাম্প্রতিক RFQ</p>
            <div className="mt-3 space-y-2">
              {rfqs.slice(0, 4).map((r) => (
                <div key={r.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white/5 px-3.5 py-2.5 text-sm ring-1 ring-white/10">
                  <span><b className="text-white">{r.id}</b> <span className={sub}>• {r.company} ({r.country}) • {r.product} • {r.qty}</span></span>
                  <span className="rounded-full bg-sky-400/10 px-2.5 py-1 text-[11px] font-black text-sky-300 ring-1 ring-sky-400/25">{r.status}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {tab === "rfq" && (
        <div className={`${acard} mt-4 overflow-x-auto`}>
          <p className="font-black text-white">📩 সব RFQ ({toBnDigits(rfqs.length)}টি)</p>
          <table className="mt-3 w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className={`border-b border-white/10 text-xs ${sub}`}>
                <th className="pb-2 pr-3">RFQ</th><th className="pb-2 pr-3">কোম্পানি</th><th className="pb-2 pr-3">প্রোডাক্ট</th><th className="pb-2 pr-3">পরিমাণ</th><th className="pb-2">স্ট্যাটাস</th>
              </tr>
            </thead>
            <tbody>
              {rfqs.map((r, i) => (
                <tr key={r.id} className="border-b border-white/5">
                  <td className="py-2.5 pr-3 font-black text-white">{r.id}<br /><span className={`text-[11px] font-bold ${sub}`}>{r.date}</span></td>
                  <td className="py-2.5 pr-3 text-slate-200">{r.company}<br /><span className={`text-[11px] ${sub}`}>{r.name} • {r.country}</span></td>
                  <td className="py-2.5 pr-3 text-slate-200">{r.product}</td>
                  <td className="py-2.5 pr-3 text-slate-200">{r.qty}</td>
                  <td className="py-2.5">
                    <select value={r.status} onChange={(e) => setRfqs(rfqs.map((x, j) => (j === i ? { ...x, status: e.target.value } : x)))} className="rounded-lg border border-white/15 bg-[#131a2a] px-2 py-1.5 text-xs font-bold text-white outline-none">
                      {RFQ_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "products" && (
        <>
          <form className={`${acard} mt-4 grid gap-3 sm:grid-cols-4`} onSubmit={(e) => {
            e.preventDefault();
            if (!newP.n.trim() || !newP.p) return;
            setProducts([{ id: `p${Date.now()}`, n: newP.n.trim(), c: newP.c, p: Number(newP.p) || 0, e: "👕", desc: `${newP.n.trim()} — ${def.name}-এর ক্যাটালগ আইটেম।`, rating: 4.5, reviews: 0, stock: 1000 }, ...products]);
            setNewP({ n: "", c: def.cats[1] ?? "নিট", p: "" });
          }}>
            <input className={input} placeholder="প্রোডাক্টের নাম" value={newP.n} onChange={(e) => setNewP({ ...newP, n: e.target.value })} />
            <select className={`${input} [&>option]:text-slate-900`} value={newP.c} onChange={(e) => setNewP({ ...newP, c: e.target.value })}>
              {def.cats.filter((c) => c !== "সব").map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <input className={input} placeholder="FOB প্রাইস (টাকা/পিস)" inputMode="numeric" value={newP.p} onChange={(e) => setNewP({ ...newP, p: e.target.value })} />
            <Btn accent={def.accent}>➕ প্রোডাক্ট যোগ করুন</Btn>
          </form>
          <div className={`${acard} mt-4`}>
            <p className="font-black text-white">👕 ক্যাটালগ ({toBnDigits(products.length)}টি)</p>
            <div className="mt-3 space-y-2">
              {products.map((p) => (
                <div key={p.id} className="flex items-center justify-between gap-3 rounded-xl bg-white/5 px-3.5 py-2.5 text-sm ring-1 ring-white/10">
                  <span><span className="mr-2 text-xl">{p.e}</span><b className="text-white">{p.n}</b> <span className={sub}>• {p.c} • FOB {toBnDigits(p.p)} টাকা/পিস</span></span>
                  <button onClick={() => setProducts(products.filter((x) => x.id !== p.id))} className="rounded-lg bg-red-400/10 px-2.5 py-1.5 text-[11px] font-black text-red-300 ring-1 ring-red-400/25">🗑️ মুছুন</button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {tab === "buyers" && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {BUYERS.map((b) => (
            <div key={b.co} className={acard}>
              <p className="font-black text-white">{b.co}</p>
              <p className={`mt-0.5 text-xs ${sub}`}>{b.country} • ক্লায়েন্ট {b.since} থেকে</p>
              <div className="mt-3 flex gap-4 text-sm">
                <span><b className="text-sky-300">{toBnDigits(b.orders)}</b> <span className={sub}>অর্ডার</span></span>
                <span><b className="text-emerald-300">{b.value}</b> <span className={sub}>মোট মূল্য</span></span>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "settings" && (
        <div className={`${acard} mt-4 max-w-xl`}>
          <p className="font-black text-white">⚙️ সাইট সেটিংস</p>
          <div className="mt-3 grid gap-3">
            <label className={`text-xs font-bold ${sub}`}>কোম্পানির নাম<input className={`${input} mt-1`} value={siteName} onChange={(e) => setSiteName(e.target.value)} /></label>
            <label className={`text-xs font-bold ${sub}`}>হিরো টাইটেল<input className={`${input} mt-1`} value={heroT} onChange={(e) => setHeroT(e.target.value)} /></label>
            <label className={`text-xs font-bold ${sub}`}>হিরো সাবটাইটেল<input className={`${input} mt-1`} value={heroS} onChange={(e) => setHeroS(e.target.value)} /></label>
            <div>
              <Btn accent={def.accent} onClick={() => { store.saveCustom({ siteName: siteName.trim() || def.name, heroTitle: heroT.trim(), heroSub: heroS.trim() }); setSaved(true); setTimeout(() => setSaved(false), 2000); }}>💾 সেভ করুন</Btn>
              {saved && <span className="ml-3 text-sm font-bold text-emerald-300">✅ সেভ হয়েছে — সাইটে লাইভ দেখুন</span>}
            </div>
            <p className={`text-xs ${sub}`}>সেটিংস এই ব্রাউজারে সেভ থাকে — ক্লায়েন্ট হ্যান্ডওভারে তার নিজের অ্যাডমিন থেকে সব বদলাতে পারবেন।</p>
          </div>
        </div>
      )}
    </Page>
  );
}
