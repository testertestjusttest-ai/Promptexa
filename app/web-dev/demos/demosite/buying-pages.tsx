"use client";

/** Buying house layout — garment sourcing agency demo (light corporate).
 * Photo-first website (showroom/factory/product photography), quality,
 * clients, gallery and blog pages, RFQ flow, and a SewSync-style
 * operations admin (production monitor, PO tracker, workers, materials).
 * All demo data is browser-local.
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toBnDigits } from "@/lib/format";
import { useDemo } from "./store";
import { Page, SectionTitle, Back, Btn, Field, Area, Empty, Stars } from "./ui";

/* ---------------- helpers ---------------- */

const IMG = (n: string) => `/bh-img/${n}`;
const card = "rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_2px_18px_rgba(15,23,42,0.05)]";
const sub = "text-slate-500";
const htx = "text-slate-900";

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

/** SVG progress ring (admin gauges + PO progress). */
export function Ring({ pct, size = 88, stroke = 9, color = "#0284c7", track = "#e2e8f0", children }: {
  pct: number; size?: number; stroke?: number; color?: string; track?: string; children?: React.ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative inline-flex shrink-0 items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke={track} strokeWidth={stroke} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c - (c * Math.min(100, Math.max(0, pct))) / 100} className="transition-all duration-1000" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  );
}

const BH_EMAIL = "sales@texbridge.com.bd";
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
  { n: "গ্রীন নিট কম্পোজিট", loc: "গাজীপুর", cap: "১২ লাখ পিস/মাস", img: "factory-1.webp", spec: ["নিট", "টি-শার্ট", "পোলো"], cert: ["WRAP", "BSCI", "OEKO-TEX"] },
  { n: "ঢাকা ডেনিম ওয়ার্কস", loc: "নারায়ণগঞ্জ", cap: "৬ লাখ পিস/মাস", img: "cat-3.webp", spec: ["ডেনিম", "জিন্স", "জ্যাকেট"], cert: ["BSCI", "SEDEX"] },
  { n: "স্কাই ওভেন ইন্ডাস্ট্রিজ", loc: "আশুলিয়া, সাভার", cap: "৮ লাখ পিস/মাস", img: "cat-2.webp", spec: ["ওভেন", "ফরমাল শার্ট"], cert: ["WRAP", "ACCORD"] },
  { n: "নর্দান সোয়েটার লিমিটেড", loc: "উত্তরা, ঢাকা", cap: "৪ লাখ পিস/মাস", img: "cat-4.webp", spec: ["সোয়েটার", "কার্ডিগান"], cert: ["BSCI", "GRS"] },
  { n: "প্যাসিফিক অ্যাপারেলস", loc: "চট্টগ্রাম", cap: "১০ লাখ পিস/মাস", img: "factory-3.webp", spec: ["নিট", "হুডি", "কিডস"], cert: ["SEDEX", "OEKO-TEX"] },
  { n: "রয়েল টেক্সটাইল মিলস", loc: "টঙ্গী", cap: "৫ লাখ পিস/মাস", img: "hero.webp", spec: ["ওভেন", "ক্যাজুয়াল"], cert: ["WRAP", "BSCI"] },
];

const SVC_IMG: Record<string, string> = {
  s0: "hero.webp", s1: "cat-2.webp", s2: "factory-2.webp",
  s3: "cat-1.webp", s4: "factory-1.webp", s5: "factory-3.webp",
};

const BRANDS = ["H&M", "ZARA", "Walmart", "C&A", "TESCO", "DECATHLON", "UNIQLO", "adidas", "NEXT", "MANGO", "Primark", "M&S"];

const TESTIMONIALS = [
  { n: "Markus Weber", c: "🇩🇪 জার্মানি — রিটেইল চেইন", t: "তিন বছর ধরে টেক্সব্রিজের সাথে কাজ করছি। QC রিপোর্ট এত ডিটেইলড যে আমাদের নিজস্ব ইন্সপেকশনের খরচ অর্ধেক কমে গেছে।", r: 5 },
  { n: "Sarah Collins", c: "🇬🇧 যুক্তরাজ্য — ফ্যাশন ব্র্যান্ড", t: "স্যাম্পল ডেভেলপমেন্টের স্পিড অসাধারণ — ৭ দিনে PP স্যাম্পল হাতে পেয়েছি। প্রতিটি শিপমেন্ট অন-টাইম।", r: 5 },
  { n: "David Kim", c: "🇺🇸 আমেরিকা — ই-কমার্স সেলার", t: "ছোট অর্ডার (৩,০০০ পিস) দিয়েও প্রিমিয়াম সার্ভিস পেয়েছি। প্রাইস নেগোসিয়েশনে তারা আমাদের ১২% খরচ বাঁচিয়েছে।", r: 4.5 },
];

const BLOG_POSTS = [
  {
    id: "b1", img: "hero.webp", cat: "ট্রেন্ড", date: "১৫ অক্টোবর ২০২৬", read: "৫ মিনিট",
    t: "গার্মেন্টস সোর্সিংয়ে ২০২৬ সালের ৫টি বড় ট্রেন্ড",
    ex: "সাসটেইনেবল ফ্যাব্রিক, ছোট MOQ, ডিজিটাল স্যাম্পলিং — এই বছরে বায়ারদের চাহিদা যেদিকে যাচ্ছে।",
    body: ["বিশ্বের ফ্যাশন বায়াররা এখন শুধু দাম নয় — সাসটেইনেবিলিটি, ট্রেসেবিলিটি আর স্পিডকেই সবচেয়ে বেশি গুরুত্ব দিচ্ছে। রিসাইকেলড কটন ও অর্গানিক ফ্যাব্রিকের চাহিদা গত বছরের তুলনায় প্রায় দ্বিগুণ।", "ছোট অর্ডার (MOQ) এখন মূলধারা: আগে যেখানে ১০,০০০ পিসের নিচে অর্ডার নেওয়া কঠিন ছিল, এখন অনেক ফ্যাক্টরি ১,০০০–৩,০০০ পিসেও রাজি — ই-কমার্স ব্র্যান্ডদের কারণে। ডিজিটাল 3D স্যাম্পলিং স্যাম্পলের সময় ১৪ দিন থেকে কমিয়ে ৫ দিনে এনেছে।", "টেক্সব্রিজে আমরা প্রতিটি ট্রেন্ডের জন্য আলাদা ফ্যাক্টরি প্যানেল রাখি — যাতে বায়ার তার বাজারের চাহিদা অনুযায়ী সঠিক পার্টনার পান।"],
  },
  {
    id: "b2", img: "factory-1.webp", cat: "গাইড", date: "৮ অক্টোবর ২০২৬", read: "৭ মিনিট",
    t: "সঠিক ফ্যাক্টরি বাছাইয়ের ৭ ধাপের চেকলিস্ট",
    ex: "কমপ্লায়েন্স, ক্যাপাসিটি, মেশিনারি, ফাইন্যান্স — অর্ডার দেওয়ার আগে যা যা যাচাই করবেন।",
    body: ["ভালো ফ্যাক্টরি বাছাই মানেই অর্ধেক সফলতা। প্রথম ধাপ: কমপ্লায়েন্স সার্টিফিকেট (WRAP/BSCI/SEDEX) হালনাগাদ আছে কিনা যাচাই করুন। দ্বিতীয়: আপনার প্রোডাক্ট ক্যাটাগরিতে ফ্যাক্টরির আসল অভিজ্ঞতা — শুধু মেশিনের সংখ্যা নয়, একই ধরনের অর্ডারের ইতিহাস দেখুন।", "তৃতীয় ধাপে ক্যাপাসিটি বনাম চলমান অর্ডারের অনুপাত বুঝুন — ওভারবুকড ফ্যাক্টরি মানেই ডিলে। চতুর্থ: স্যাম্পল রুম ও QC টিমের সাইজ। পঞ্চম: ফাইন্যান্সিয়াল স্থিতি ও সাব-কন্ট্রাক্ট নীতি। ষষ্ঠ: কমিউনিকেশনের গতি — ২৪ ঘণ্টায় রিপ্লাই দেয় কিনা। সপ্তম: রেফারেন্স বায়ারদের ফিডব্যাক।", "টেক্সব্রিজের প্রতিটি পার্টনার ফ্যাক্টরি এই ৭ ধাপ পেরিয়েই প্যানেলে আসে, এবং প্রতি বছর রি-অডিট হয়।"],
  },
  {
    id: "b3", img: "factory-2.webp", cat: "কোয়ালিটি", date: "১ অক্টোবর ২০২৬", read: "৪ মিনিট",
    t: "AQL ইন্সপেকশন কী এবং কেন এটি জরুরি",
    ex: "AQL 2.5 মানে কী, কীভাবে স্যাম্পল সাইজ ঠিক হয়, আর রিপোর্টে যা যা থাকে।",
    body: ["AQL (Acceptable Quality Limit) হলো পরিসংখ্যানভিত্তিক স্যাম্পলিং পদ্ধতি — পুরো লট না দেখে নির্দিষ্ট সংখ্যক পিস যাচাই করে পুরো শিপমেন্টের মান সম্পর্কে সিদ্ধান্ত নেওয়া হয়। AQL 2.5 মানে প্রতি ১০০ পিসে গড়ে সর্বোচ্চ ২.৫টি মেজর ডিফেক্ট গ্রহণযোগ্য।", "ইন্সপেকশনে থাকে: মেজারমেন্ট চেক, স্টিচিং ও ফিনিশিং, কালার শেড ম্যাচিং, প্যাকিং ও কার্টন অডিট। প্রতিটি ধাপের ছবিসহ রিপোর্ট বায়ারের কাছে যায় — শিপমেন্টের আগেই।", "টেক্সব্রিজে প্রতিটি অর্ডারে ইনলাইন (২০% ও ৮০%) এবং ফাইনাল AQL 2.5 ইন্সপেকশন বাধ্যতামূলক — কোনো অতিরিক্ত চার্জ ছাড়াই।"],
  },
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
      {/* HERO — photo split, light corporate */}
      <div className="relative overflow-hidden bg-gradient-to-b from-sky-50 via-white to-white">
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-sky-100 blur-3xl" aria-hidden />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 pb-12 pt-10 sm:pt-14 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white px-3.5 py-1.5 text-[11px] font-black text-sky-700 shadow-sm">
              <span className="relative flex h-2 w-2"><span className="absolute h-full w-full animate-ping rounded-full bg-emerald-400" /><span className="h-2 w-2 rounded-full bg-emerald-500" /></span>
              গার্মেন্টস বায়িং হাউস — ঢাকা, বাংলাদেশ
            </span>
            <h1 className={`mt-5 text-4xl font-black leading-[1.1] sm:text-5xl ${htx}`}>
              {def.heroTitle}
              <span className="mt-2 block text-sky-600">ঝামেলাহীন, প্রতিটি ধাপে QC সহ</span>
            </h1>
            <p className={`mt-4 max-w-lg text-[15px] leading-relaxed ${sub}`}>
              ফ্যাক্টরি সিলেকশন থেকে শিপমেন্ট — একজন ডেডিকেটেড মার্চেন্ডাইজার আপনার প্রতিটি অর্ডারের পাশে।
              স্যাম্পল, প্রোডাকশন আপডেট আর AQL ইন্সপেকশন রিপোর্ট — সব এক জায়গায়।
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={`${base}/rfq`} className="rounded-2xl bg-sky-600 px-6 py-3.5 text-sm font-black text-white shadow-[0_12px_28px_rgba(2,132,199,0.35)] transition hover:-translate-y-0.5 hover:bg-sky-700">📩 Request a Quote — ফ্রি</Link>
              <Link href={`${base}/products`} className="rounded-2xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 transition hover:border-sky-400 hover:text-sky-700">👕 প্রোডাক্ট দেখুন</Link>
            </div>
            <div className="mt-7 flex flex-wrap gap-x-5 gap-y-1.5 text-xs font-bold text-slate-500">
              <span>✓ WRAP / BSCI সার্টিফাইড ফ্যাক্টরি</span>
              <span>✓ ৪৮ ঘণ্টায় কোটেশন</span>
              <span>✓ AQL 2.5 ইন্সপেকশন</span>
            </div>
          </div>

          <div className="relative">
            <div className="relative overflow-hidden rounded-[28px] shadow-[0_30px_60px_rgba(15,23,42,0.18)] ring-1 ring-slate-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={def.heroImg ?? IMG("hero.webp")} alt={def.name} className="h-[320px] w-full object-cover sm:h-[400px]" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/70 to-transparent p-4 pt-14">
                <p className="text-sm font-black text-white">🏭 শোরুম ও স্যাম্পল রুম — ঢাকা হেড অফিস</p>
                <p className="text-xs text-white/75">প্রতিটি কালেকশনের লাইভ স্যাম্পল বায়ারের জন্য প্রস্তুত</p>
              </div>
            </div>
            <div className="bh-float absolute -left-3 top-8 hidden rounded-2xl border border-slate-200 bg-white/95 px-3.5 py-2.5 shadow-xl backdrop-blur sm:block">
              <p className="text-[10px] font-bold text-slate-400">🔍 ফাইনাল QC</p>
              <p className="text-sm font-black text-emerald-600">পাস ✓ AQL 2.5</p>
            </div>
            <div className="bh-float absolute -right-2 bottom-16 hidden rounded-2xl border border-slate-200 bg-white/95 px-3.5 py-2.5 shadow-xl backdrop-blur sm:block" style={{ animationDelay: "-3s" }}>
              <p className="text-[10px] font-bold text-slate-400">🚢 এই সপ্তাহে শিপমেন্ট</p>
              <p className="text-sm font-black text-sky-700">১২টি অর্ডার • অন-টাইম</p>
            </div>
          </div>
        </div>

        {/* stats band */}
        <div className="relative mx-auto max-w-6xl px-4 pb-10">
          <div className="grid grid-cols-2 gap-3 rounded-3xl border border-slate-200 bg-white p-3 shadow-[0_2px_18px_rgba(15,23,42,0.05)] sm:grid-cols-4">
            {stats.map(([v, suf, t]) => (
              <div key={t} className="px-4 py-3 text-center">
                <p className="text-2xl font-black text-sky-700 sm:text-3xl"><CountUp to={v} suffix={suf} /></p>
                <p className="mt-0.5 text-[11px] font-bold text-slate-500">{t}</p>
              </div>
            ))}
          </div>
        </div>
        <style>{`
          @keyframes bh-float { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-9px) } }
          .bh-float { animation: bh-float 5s ease-in-out infinite }
          @keyframes bh-marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }
          .bh-marquee { animation: bh-marquee 30s linear infinite }
        `}</style>
      </div>

      {/* country marquee */}
      <div className="border-y border-slate-100 bg-white py-3">
        <div className="overflow-hidden" aria-hidden>
          <div className="bh-marquee flex w-max gap-10">
            {[...COUNTRIES, ...COUNTRIES].map((c, i) => (
              <span key={i} className="whitespace-nowrap text-sm font-bold text-slate-500">{c}</span>
            ))}
          </div>
        </div>
        <p className="mt-2 text-center text-[11px] font-bold text-slate-400">🌍 যেসব দেশে আমাদের বায়াররা রপ্তানি নিচ্ছেন</p>
      </div>

      <Page>
        {/* services with photos */}
        <Reveal>
          <SectionTitle t="🛠️ আমাদের সার্ভিস" sub="Complete Sourcing Solutions" link={`${base}/services`} />
        </Reveal>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {def.services.map((s, i) => (
            <Reveal key={s.id} delay={i * 70}>
              <Link href={`${base}/s/${s.id}`} className="group block h-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_2px_18px_rgba(15,23,42,0.05)] transition hover:-translate-y-1 hover:shadow-xl">
                <div className="relative h-36 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={IMG(SVC_IMG[s.id] ?? "hero.webp")} alt={s.n} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                  <span className="absolute bottom-3 left-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/95 text-xl shadow">{s.e}</span>
                </div>
                <div className="p-4">
                  <p className={`font-black ${htx}`}>{s.n}</p>
                  <p className={`mt-1 line-clamp-2 text-sm ${sub}`}>{s.desc}</p>
                  <p className="mt-3 text-xs font-black text-sky-600">বিস্তারিত দেখুন →</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>

        {/* categories */}
        <Reveal className="mt-12">
          <SectionTitle t="🧥 প্রোডাক্ট ক্যাটাগরি" sub="Wide Range of Apparel & Merchandise" link={`${base}/products`} />
        </Reveal>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {def.cats.filter((c) => c !== "সব").map((c, i) => (
            <Reveal key={c} delay={i * 60}>
              <Link href={`${base}/products`} className="group relative block h-44 overflow-hidden rounded-3xl shadow-md">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={def.catImgs?.[c] ?? IMG("hero.webp")} alt={c} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                <span className="absolute inset-0 bg-gradient-to-t from-slate-900/75 via-slate-900/10 to-transparent" />
                <span className="absolute bottom-3 left-4 text-lg font-black text-white">{c}</span>
                <span className="absolute bottom-3 right-4 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-black text-slate-800">দেখুন →</span>
              </Link>
            </Reveal>
          ))}
        </div>

        {/* products row */}
        <Reveal className="mt-12">
          <SectionTitle t="🔥 জনপ্রিয় প্রোডাক্ট" sub="বায়ারদের সবচেয়ে বেশি অর্ডার" link={`${base}/products`} />
        </Reveal>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {def.products.slice(0, 8).map((p, i) => (
            <Reveal key={p.id} delay={i * 50}>
              <Link href={`${base}/p/${p.id}`} className="group block h-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_2px_18px_rgba(15,23,42,0.05)] transition hover:-translate-y-1 hover:shadow-xl">
                {p.img ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.img} alt={p.n} className="h-36 w-full object-cover transition duration-500 group-hover:scale-105" />
                ) : (
                  <div className={`flex h-36 items-center justify-center bg-gradient-to-br ${def.grad} text-6xl`}>{p.e}</div>
                )}
                <div className="p-4">
                  <p className={`font-black ${htx}`}>{p.n}</p>
                  <p className={`text-xs ${sub}`}>{p.c} • MOQ ১,০০০ পিস</p>
                  <p className="mt-2 text-sm font-black text-sky-700">FOB {toBnDigits(p.p)} টাকা<span className="text-[11px] text-slate-400">/পিস থেকে</span></p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>

        {/* why us with photo */}
        <div className="mt-12 grid items-stretch gap-4 lg:grid-cols-2">
          <Reveal className="h-full">
            <div className="relative h-full min-h-[280px] overflow-hidden rounded-3xl shadow-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={IMG("factory-1.webp")} alt="ফ্যাক্টরি" className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute bottom-0 w-full bg-gradient-to-t from-slate-900/80 to-transparent p-5 pt-16">
                <p className="font-black text-white">পার্টনার ফ্যাক্টরি — সুইং ফ্লোর</p>
                <p className="text-xs text-white/75">প্রতিটি লাইনে আমাদের নিজস্ব QC সুপারভাইজার</p>
              </div>
            </div>
          </Reveal>
          <Reveal delay={100} className="h-full">
            <div className={`${card} h-full`}>
              <p className={`text-lg font-black ${htx}`}>🏆 কেন টেক্সব্রিজ?</p>
              <ul className="mt-3 space-y-3.5">
                {[
                  ["🏭", "যাচাইকৃত ফ্যাক্টরি নেটওয়ার্ক", "প্রতিটি ফ্যাক্টরি অডিট-পাস ও কমপ্লায়েন্স-যাচাই করা।"],
                  ["👤", "ডেডিকেটেড মার্চেন্ডাইজার", "প্রতিটি বায়ারের জন্য নির্দিষ্ট মার্চেন্ডাইজার — সরাসরি যোগাযোগ।"],
                  ["🔍", "স্বচ্ছ QC রিপোর্ট", "ছবি-ভিডিওসহ ইনলাইন ও ফাইনাল ইন্সপেকশন রিপোর্ট প্রতিটি অর্ডারে।"],
                  ["💰", "সেরা প্রাইস গ্যারান্টি", "একাধিক ফ্যাক্টরির কোটেশন তুলনা করে সবচেয়ে ভালো রেট।"],
                ].map(([e, t, d]) => (
                  <li key={t} className="flex gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-xl ring-1 ring-sky-100">{e}</span>
                    <span><b className={htx}>{t}</b><br /><span className={`text-sm ${sub}`}>{d}</span></span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>

        {/* factory strip */}
        <Reveal className="mt-12">
          <SectionTitle t="🏭 আমাদের প্রোডাকশন" sub="Inside Our Production" link={`${base}/factories`} />
        </Reveal>
        <div className="grid gap-3 sm:grid-cols-3">
          {[["factory-1.webp", "সুইং সেকশন", "দক্ষ ওয়ার্কফোর্স"], ["factory-2.webp", "কোয়ালিটি ইন্সপেকশন", "১০০% চেকড"], ["factory-3.webp", "প্যাকিং ও শিপমেন্ট", "গ্লোবাল মার্কেটের জন্য প্রস্তুত"]].map(([img, t, d], i) => (
            <Reveal key={t} delay={i * 70}>
              <div className="group relative h-52 overflow-hidden rounded-3xl shadow-md">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={IMG(img)} alt={t} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                <span className="absolute inset-0 bg-gradient-to-t from-slate-900/70 to-transparent" />
                <span className="absolute bottom-3 left-4"><b className="text-white">{t}</b><br /><span className="text-xs text-white/75">{d}</span></span>
              </div>
            </Reveal>
          ))}
        </div>

        {/* clients wall */}
        <Reveal className="mt-12">
          <div className={`${card} !py-6 text-center`}>
            <p className={`text-sm font-black uppercase tracking-widest ${sub}`}>🤝 Trusted by Leading Brands</p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
              {BRANDS.slice(0, 8).map((b) => (
                <span key={b} className="text-lg font-black tracking-wide text-slate-400 transition hover:text-slate-700">{b}</span>
              ))}
            </div>
            <Link href={`${base}/clients`} className="mt-4 inline-block text-xs font-black text-sky-600">সব ক্লায়েন্ট দেখুন →</Link>
          </div>
        </Reveal>

        {/* testimonials */}
        <Reveal className="mt-12">
          <SectionTitle t="⭐ ক্লায়েন্টরা যা বলছেন" sub="What Our Clients Say" link={`${base}/clients`} />
        </Reveal>
        <div className="grid gap-4 md:grid-cols-3">
          {TESTIMONIALS.map((x, i) => (
            <Reveal key={x.n} delay={i * 80}>
              <div className={`${card} h-full`}>
                <Stars rating={x.r} />
                <p className="mt-2 text-sm leading-relaxed text-slate-600">“{x.t}”</p>
                <div className="mt-4 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-600 text-sm font-black text-white">{x.n.split(" ").map((w) => w[0]).join("")}</span>
                  <span><b className={`block text-sm ${htx}`}>{x.n}</b><span className={`text-xs ${sub}`}>{x.c}</span></span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* CTA */}
        <Reveal className="mt-12">
          <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${def.grad} p-8 text-center text-white sm:p-10`}>
            <p className="text-2xl font-black sm:text-3xl">Ready to Start Your Next Collection?</p>
            <p className="mx-auto mt-2 max-w-xl text-sm text-white/85">টেক-প্যাক বা শুধু আইডিয়া পাঠালেই হবে — ৪৮ ঘণ্টায় ফ্যাক্টরি-যাচাই করা কোটেশন পাচ্ছেন, সম্পূর্ণ ফ্রি।</p>
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
      <SectionTitle t="🛠️ আমাদের সার্ভিস" sub="End-to-End Sourcing Solutions" />
      <div className="grid gap-4 sm:grid-cols-2">
        {def.services.map((s) => (
          <Link key={s.id} href={`${base}/s/${s.id}`} className="group flex gap-4 overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_2px_18px_rgba(15,23,42,0.05)] transition hover:-translate-y-1 hover:shadow-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={IMG(SVC_IMG[s.id] ?? "hero.webp")} alt={s.n} className="h-28 w-32 shrink-0 rounded-2xl object-cover" />
            <div className="min-w-0">
              <p className={`font-black ${htx}`}>{s.e} {s.n}</p>
              <p className={`mt-1 line-clamp-2 text-sm ${sub}`}>{s.desc}</p>
              <p className="mt-2 flex items-center gap-3 text-xs font-bold">
                <span className="text-amber-500">⭐ {toBnDigits(s.rating)}</span>
                <span className={sub}>⏱️ {s.duration}</span>
                <span className="text-sky-600">বিস্তারিত →</span>
              </p>
            </div>
          </Link>
        ))}
      </div>
      <div className={`mt-6 rounded-3xl bg-gradient-to-br ${def.grad} p-6 text-center text-white`}>
        <p className="text-lg font-black">কাস্টম সার্ভিস লাগবে?</p>
        <p className="mt-1 text-sm text-white/85">প্রাইভেট লেবেল, কাস্টম প্যাকেজিং, ছোট অর্ডার — আলোচনা করুন আমাদের টিমের সাথে।</p>
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
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_2px_18px_rgba(15,23,42,0.05)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={IMG(SVC_IMG[s.id] ?? "hero.webp")} alt={s.n} className="h-56 w-full object-cover sm:h-72" />
        <div className="p-6">
          <h1 className={`text-2xl font-black ${htx}`}>{s.e} {s.n}</h1>
          <p className={`mt-2 max-w-2xl leading-relaxed ${sub}`}>{s.desc}</p>
          <p className="mt-3 flex gap-4 text-sm font-bold">
            <span className="text-amber-500">⭐ রেটিং {toBnDigits(s.rating)}</span>
            <span className={sub}>⏱️ {s.duration}</span>
          </p>
        </div>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className={card}>
          <p className={`font-black ${htx}`}>✅ যা যা পাচ্ছেন</p>
          <ul className="mt-3 space-y-2.5">
            {(points[s.id] ?? points.s0).map((pt) => (
              <li key={pt} className="flex items-start gap-2 text-sm text-slate-600"><span className="text-emerald-500">✓</span>{pt}</li>
            ))}
          </ul>
        </div>
        <div className={`${card} text-center`}>
          <p className="text-4xl">💬</p>
          <p className={`mt-2 font-black ${htx}`}>এই সার্ভিস নিয়ে আলোচনা করুন</p>
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
      <SectionTitle t="👕 প্রোডাক্ট ক্যাটালগ" sub="FOB প্রাইস প্রতি পিস — পরিমাণ অনুযায়ী পরিবর্তনশীল" />
      <div className="mb-4 flex flex-wrap gap-2">
        {def.cats.map((c) => (
          <button key={c} onClick={() => setCat(c)} className={`rounded-full px-4 py-2 text-xs font-black transition ${cat === c ? "text-white shadow" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-sky-300"}`} style={cat === c ? { background: def.accent } : undefined}>{c}</button>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((p) => (
          <Link key={p.id} href={`${base}/p/${p.id}`} className="group block overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_2px_18px_rgba(15,23,42,0.05)] transition hover:-translate-y-1 hover:shadow-xl">
            {p.img ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.img} alt={p.n} className="h-44 w-full object-cover transition duration-500 group-hover:scale-105" />
            ) : (
              <div className={`flex h-44 items-center justify-center bg-gradient-to-br ${def.grad} text-7xl`}>{p.e}</div>
            )}
            <div className="p-4">
              <p className={`font-black ${htx}`}>{p.n}</p>
              <p className={`mt-0.5 text-xs ${sub}`}>{p.c} • MOQ ১,০০০ পিস • ⭐ {toBnDigits(p.rating)}</p>
              <div className="mt-2 flex items-center justify-between">
                <p className="font-black text-sky-700">FOB {toBnDigits(p.p)} টাকা<span className="text-[11px] text-slate-400">/পিস</span></p>
                <span className="text-xs font-black text-sky-600">ইনকোয়ারি →</span>
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
        {p.img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.img} alt={p.n} className="h-full min-h-[280px] w-full rounded-3xl object-cover shadow-md" />
        ) : (
          <div className={`flex min-h-[280px] items-center justify-center rounded-3xl bg-gradient-to-br ${def.grad} text-[120px]`}>{p.e}</div>
        )}
        <div className={card}>
          <p className="text-xs font-black uppercase tracking-widest text-sky-600">{p.c}</p>
          <h1 className={`mt-1 text-2xl font-black ${htx}`}>{p.n}</h1>
          <div className="mt-2"><Stars rating={p.rating} reviews={p.reviews} /></div>
          <p className={`mt-3 leading-relaxed ${sub}`}>{p.desc}</p>
          <p className="mt-4 text-3xl font-black text-sky-700">FOB {toBnDigits(p.p)} টাকা<span className="text-sm text-slate-400"> / পিস থেকে</span></p>
          <div className="mt-4 space-y-1.5">
            {specs.map(([k, v]) => (
              <p key={k} className="flex justify-between gap-3 border-b border-slate-100 pb-1.5 text-sm"><span className={sub}>{k}</span><b className="text-right text-slate-700">{v}</b></p>
            ))}
          </div>
        </div>
      </div>
      <div className={`${card} mt-4`}>
        <p className={`font-black ${htx}`}>📩 এই প্রোডাক্টের কোটেশন চান</p>
        {sent ? (
          <p className="mt-3 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700 ring-1 ring-emerald-200">✅ ইনকোয়ারি পাঠানো হয়েছে! আমাদের মার্চেন্ডাইজার ২৪ ঘণ্টার মধ্যে যোগাযোগ করবেন।</p>
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

/* ---------------- PROCESS & QUALITY ---------------- */

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
              <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${def.grad} text-2xl text-white`}>{e}</div>
              <div>
                <p className={`font-black ${htx}`}><span className="text-sky-600">ধাপ {toBnDigits(i + 1)}:</span> {t}</p>
                <p className={`mt-1 text-sm leading-relaxed ${sub}`}>{d}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </Page>
  );
}

export function BhQuality() {
  const { def, base } = useDemo();
  const aql: [string, string, string][] = [
    ["১,০০০ – ৩,০০০ পিস", "৫০ পিস", "২টি পর্যন্ত"],
    ["৩,০০১ – ১০,০০০ পিস", "৮০ পিস", "৩টি পর্যন্ত"],
    ["১০,০০১ – ৩৫,০০০ পিস", "১২৫ পিস", "৫টি পর্যন্ত"],
    ["৩৫,০০০+ পিস", "২০০ পিস", "৭টি পর্যন্ত"],
  ];
  return (
    <Page>
      <Back href={base} label="হোম" />
      <SectionTitle t="🔍 কোয়ালিটি কন্ট্রোল" sub="Quality is not an option — it's our standard" />
      <div className="relative overflow-hidden rounded-3xl shadow-md">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={IMG("factory-2.webp")} alt="QC" className="h-60 w-full object-cover sm:h-80" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/75 via-slate-900/30 to-transparent" />
        <div className="absolute inset-y-0 left-0 flex max-w-md flex-col justify-center p-6">
          <p className="text-2xl font-black text-white">প্রতিটি পিস, প্রতিটি ধাপে যাচাই</p>
          <p className="mt-2 text-sm text-white/85">ফ্যাব্রিক ইন্সপেকশন থেকে ফাইনাল AQL — আমাদের নিজস্ব QC টিম প্রতিটি অর্ডারে ছবি-ভিডিওসহ রিপোর্ট পাঠায়।</p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["🧵", "প্রি-প্রোডাকশন", "ফ্যাব্রিক ও ট্রিমস যাচাই, PP স্যাম্পল অনুমোদন"],
          ["✂️", "ডিউরিং প্রোডাকশন", "ইনলাইন চেক ২০% ও ৮০% পর্যায়ে"],
          ["🔍", "ফাইনাল ইন্সপেকশন", "AQL 2.5 র‍্যান্ডম স্যাম্পলিং — মেজারমেন্ট, স্টিচিং, শেড"],
          ["📦", "প্যাকিং অডিট", "কার্টন, পলি, লেবেল ও ওজন যাচাই"],
        ].map(([e, t, d], i) => (
          <Reveal key={t} delay={i * 60}>
            <div className={`${card} h-full text-center`}>
              <p className="text-4xl">{e}</p>
              <p className={`mt-2 font-black ${htx}`}>{t}</p>
              <p className={`mt-1 text-sm ${sub}`}>{d}</p>
            </div>
          </Reveal>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className={card}>
          <p className={`font-black ${htx}`}>📊 AQL 2.5 স্যাম্পলিং টেবিল (সারসংক্ষেপ)</p>
          <table className="mt-3 w-full text-left text-sm">
            <thead><tr className="border-b border-slate-200 text-xs text-slate-400"><th className="pb-2">লট সাইজ</th><th className="pb-2">স্যাম্পল</th><th className="pb-2">মেজর ডিফেক্ট সহনীয়</th></tr></thead>
            <tbody>
              {aql.map(([a, b, c]) => (
                <tr key={a} className="border-b border-slate-100"><td className="py-2 font-bold text-slate-700">{a}</td><td className="py-2 text-slate-600">{b}</td><td className="py-2 text-slate-600">{c}</td></tr>
              ))}
            </tbody>
          </table>
          <p className={`mt-2 text-xs ${sub}`}>স্ট্যান্ডার্ড: ANSI/ASQ Z1.4, General Inspection Level II</p>
        </div>
        <div className={card}>
          <p className={`font-black ${htx}`}>🧪 ল্যাব টেস্ট সমন্বয়</p>
          <ul className="mt-3 space-y-2">
            {["কালার ফাস্টনেস (ওয়াশ / রাবিং)", "শ্রিংকেজ ও ডাইমেনশন স্ট্যাবিলিটি", "GSM ও ফ্যাব্রিক কম্পোজিশন", "পিলিং ও টিয়ার স্ট্রেংথ", "নিকেল / AZO ফ্রি — EU স্ট্যান্ডার্ড", "SGS / Bureau Veritas / Intertek রিপোর্ট"].map((x) => (
              <li key={x} className="flex items-start gap-2 text-sm text-slate-600"><span className="text-emerald-500">✓</span>{x}</li>
            ))}
          </ul>
          <Link href={`${base}/rfq`} className="mt-4 inline-block rounded-xl px-5 py-2.5 text-sm font-black text-white" style={{ background: def.accent }}>📩 QCসহ কোটেশন নিন</Link>
        </div>
      </div>
    </Page>
  );
}

/* ---------------- FACTORIES & CLIENTS & GALLERY & BLOG ---------------- */

export function BhFactories() {
  const { def, base } = useDemo();
  return (
    <Page>
      <Back href={base} label="হোম" />
      <SectionTitle t="🏭 পার্টনার ফ্যাক্টরি" sub="সব ফ্যাক্টরি অডিট-যাচাই করা ও কমপ্লায়েন্স-সার্টিফাইড" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FACTORIES.map((f, i) => (
          <Reveal key={f.n} delay={i * 60}>
            <div className="h-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_2px_18px_rgba(15,23,42,0.05)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={IMG(f.img)} alt={f.n} className="h-40 w-full object-cover" />
              <div className="p-4">
                <p className={`font-black ${htx}`}>{f.n}</p>
                <p className={`mt-1 text-xs ${sub}`}>📍 {f.loc} • 🏭 ক্যাপাসিটি: {f.cap}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {f.spec.map((s) => <span key={s} className="rounded-full bg-sky-50 px-2.5 py-1 text-[11px] font-bold text-sky-700 ring-1 ring-sky-100">{s}</span>)}
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {f.cert.map((c) => <span key={c} className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-100">✓ {c}</span>)}
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
      <p className={`mt-4 text-center text-xs ${sub}`}>আরও ১১৪+ ফ্যাক্টরি আমাদের নেটওয়ার্কে — আপনার প্রোডাক্ট অনুযায়ী সেরা ম্যাচ করে দেব।</p>
    </Page>
  );
}

export function BhClients() {
  const { def } = useDemo();
  void def;
  return (
    <Page>
      <SectionTitle t="🤝 আমাদের ক্লায়েন্ট" sub="Trusted by Global Brands" />
      <div className={`${card} text-center`}>
        <p className={`mx-auto max-w-2xl text-sm leading-relaxed ${sub}`}>
          ইউরোপ, আমেরিকা ও এশিয়ার শীর্ষ রিটেইল চেইন ও ফ্যাশন ব্র্যান্ডের বায়িং টিমের সাথে আমাদের দীর্ঘদিনের কাজের অভিজ্ঞতা রয়েছে।
        </p>
        <div className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {BRANDS.map((b) => (
            <div key={b} className="flex h-20 items-center justify-center rounded-2xl bg-slate-50 ring-1 ring-slate-100">
              <span className="text-base font-black tracking-wide text-slate-500">{b}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {TESTIMONIALS.map((x) => (
          <div key={x.n} className={`${card} h-full`}>
            <Stars rating={x.r} />
            <p className="mt-2 text-sm leading-relaxed text-slate-600">“{x.t}”</p>
            <div className="mt-4 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-600 text-sm font-black text-white">{x.n.split(" ").map((w) => w[0]).join("")}</span>
              <span><b className={`block text-sm ${htx}`}>{x.n}</b><span className={`text-xs ${sub}`}>{x.c}</span></span>
            </div>
          </div>
        ))}
      </div>
    </Page>
  );
}

const GALLERY_ITEMS: [string, string, string][] = [
  ["hero.webp", "শোরুম", "স্যাম্পল শোরুম — ঢাকা"],
  ["factory-1.webp", "ফ্যাক্টরি", "সুইং ফ্লোর — গাজীপুর"],
  ["factory-2.webp", "ফ্যাক্টরি", "ফাইনাল QC টেবিল"],
  ["factory-3.webp", "ফ্যাক্টরি", "প্যাকিং ও গুদাম"],
  ["cat-1.webp", "প্রোডাক্ট", "নিট কালেকশন"],
  ["cat-2.webp", "প্রোডাক্ট", "ওভেন শার্ট কালেকশন"],
  ["cat-3.webp", "প্রোডাক্ট", "ডেনিম কালেকশন"],
  ["cat-4.webp", "প্রোডাক্ট", "সোয়েটার কালেকশন"],
];

export function BhGallery() {
  const [cat, setCat] = useState("সব");
  const [sel, setSel] = useState<number | null>(null);
  const cats = ["সব", "শোরুম", "ফ্যাক্টরি", "প্রোডাক্ট"];
  const list = GALLERY_ITEMS.map((g, i) => ({ g, i })).filter(({ g }) => cat === "সব" || g[1] === cat);
  return (
    <Page>
      <SectionTitle t="🖼️ গ্যালারি" sub="Our Gallery" />
      <div className="mb-4 flex flex-wrap gap-2">
        {cats.map((c) => (
          <button key={c} onClick={() => setCat(c)} className={`rounded-full px-4 py-2 text-xs font-black transition ${cat === c ? "bg-sky-600 text-white shadow" : "bg-white text-slate-600 ring-1 ring-slate-200"}`}>{c}</button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {list.map(({ g, i }) => (
          <button key={i} onClick={() => setSel(i)} className="group relative h-48 overflow-hidden rounded-3xl text-left shadow-md">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={IMG(g[0])} alt={g[2]} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
            <span className="absolute inset-0 bg-gradient-to-t from-slate-900/70 to-transparent" />
            <span className="absolute bottom-3 left-3 text-sm font-black text-white">{g[2]}</span>
            <span className="absolute right-3 top-3 rounded-full bg-white/85 px-2 py-0.5 text-[10px] font-black text-slate-700">{g[1]}</span>
          </button>
        ))}
      </div>
      {sel !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/85 p-4" onClick={() => setSel(null)}>
          <div className="max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={IMG(GALLERY_ITEMS[sel][0])} alt={GALLERY_ITEMS[sel][2]} className="max-h-[70vh] w-full object-cover" />
            <div className="flex items-center justify-between p-4">
              <p className={`font-black ${htx}`}>{GALLERY_ITEMS[sel][2]}</p>
              <button onClick={() => setSel(null)} className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-black text-slate-700">✕ বন্ধ করুন</button>
            </div>
          </div>
        </div>
      )}
    </Page>
  );
}

export function BhBlog() {
  const { base } = useDemo();
  return (
    <Page>
      <SectionTitle t="📰 নিউজ ও ইনসাইটস" sub="News & Insights" />
      <div className="grid gap-4 md:grid-cols-3">
        {BLOG_POSTS.map((b) => (
          <Link key={b.id} href={`${base}/blog/${b.id}`} className="group block overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_2px_18px_rgba(15,23,42,0.05)] transition hover:-translate-y-1 hover:shadow-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={IMG(b.img)} alt={b.t} className="h-44 w-full object-cover transition duration-500 group-hover:scale-105" />
            <div className="p-4">
              <p className="flex items-center gap-2 text-[11px] font-black"><span className="rounded-full bg-sky-50 px-2.5 py-1 text-sky-700 ring-1 ring-sky-100">{b.cat}</span><span className={sub}>{b.date} • {b.read} পড়া</span></p>
              <p className={`mt-2 font-black leading-snug ${htx}`}>{b.t}</p>
              <p className={`mt-1 line-clamp-2 text-sm ${sub}`}>{b.ex}</p>
              <p className="mt-3 text-xs font-black text-sky-600">আরও পড়ুন →</p>
            </div>
          </Link>
        ))}
      </div>
    </Page>
  );
}

export function BhBlogDetail({ id }: { id: string }) {
  const { base } = useDemo();
  const b = BLOG_POSTS.find((x) => x.id === id);
  if (!b) return <Page><Empty emoji="🔍" text="আর্টিকেলটি পাওয়া যায়নি" /></Page>;
  return (
    <Page narrow>
      <Back href={`${base}/blog`} label="সব আর্টিকেল" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={IMG(b.img)} alt={b.t} className="h-56 w-full rounded-3xl object-cover shadow-md sm:h-72" />
      <p className="mt-4 flex items-center gap-2 text-[11px] font-black"><span className="rounded-full bg-sky-50 px-2.5 py-1 text-sky-700 ring-1 ring-sky-100">{b.cat}</span><span className={sub}>{b.date} • {b.read} পড়া</span></p>
      <h1 className={`mt-2 text-2xl font-black leading-snug sm:text-3xl ${htx}`}>{b.t}</h1>
      <div className="mt-4 space-y-4">
        {b.body.map((para, i) => <p key={i} className="leading-relaxed text-slate-600">{para}</p>)}
      </div>
      <div className={`${card} mt-6 text-center`}>
        <p className={`font-black ${htx}`}>আপনার সোর্সিং নিয়ে সাহায্য লাগবে?</p>
        <Link href={`${base}/rfq`} className="mt-3 inline-block rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-black text-white">📩 ফ্রি কোটেশন নিন</Link>
      </div>
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
        <h1 className={`mt-3 text-2xl font-black ${htx}`}>RFQ সফলভাবে গৃহীত হয়েছে!</h1>
        <p className={`mt-2 ${sub}`}>আপনার RFQ নম্বর: <b className="text-sky-600">{done}</b><br />আমাদের মার্চেন্ডাইজিং টিম ৪৮ ঘণ্টার মধ্যে ফ্যাক্টরি-যাচাই করা কোটেশন পাঠাবে।</p>
        <div className="mt-5 flex justify-center gap-3">
          <Link href={base} className="rounded-xl bg-slate-100 px-5 py-2.5 text-sm font-bold text-slate-700 ring-1 ring-slate-200">🏠 হোমে যান</Link>
          <Link href={`${base}/products`} className="rounded-xl px-5 py-2.5 text-sm font-black text-white" style={{ background: def.accent }}>👕 প্রোডাক্ট দেখুন</Link>
        </div>
      </div>
    </Page>
  );
  return (
    <Page narrow>
      <Back href={base} label="হোম" />
      <SectionTitle t="📩 RFQ পাঠান" sub="Request a Quote — ৪৮ ঘণ্টায় উত্তর" />
      <form onSubmit={submit} className={`${card} grid gap-3`}>
        <Field required placeholder="কোম্পানির নাম *" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
        <div className="grid gap-3 sm:grid-cols-2">
          <Field required placeholder="আপনার নাম *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Field required placeholder="ইমেইল / WhatsApp *" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field required placeholder="দেশ *" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
          <select className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none" value={form.product} onChange={(e) => setForm({ ...form, product: e.target.value })}>
            {def.cats.filter((c) => c !== "সব").map((c) => <option key={c} value={c}>{c} প্রোডাক্ট</option>)}
            <option value="অন্যান্য">অন্যান্য</option>
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

/* ---------------- ABOUT / CONTACT / AUTH ---------------- */

export function BhAbout() {
  const { def, base } = useDemo();
  return (
    <Page>
      <Back href={base} label="হোম" />
      <div className="grid items-center gap-5 lg:grid-cols-2">
        <div className="relative overflow-hidden rounded-3xl shadow-md">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={IMG("factory-1.webp")} alt="আমাদের ফ্যাক্টরি নেটওয়ার্ক" className="h-64 w-full object-cover sm:h-80" />
          <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-[11px] font-black text-slate-700">স্থাপিত ২০১৫ — ঢাকা, বাংলাদেশ</span>
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-sky-600">About Us</p>
          <h1 className={`mt-1 text-3xl font-black leading-tight ${htx}`}>{def.name} — আপনার বিশ্বস্ত সোর্সিং পার্টনার</h1>
          <p className={`mt-3 leading-relaxed ${sub}`}>
            ২০১৫ সাল থেকে আমরা বিশ্বের ৪০+ দেশের বায়ারদের বাংলাদেশের সেরা গার্মেন্টস ফ্যাক্টরিগুলোর সাথে যুক্ত করে আসছি।
            আমাদের দর্শন একটাই: <b className="text-slate-700">It is our business to grow your business.</b>
          </p>
          <p className={`mt-2 leading-relaxed ${sub}`}>
            ৩৫ জনের মার্চেন্ডাইজার ও QC টিম, ১২০+ যাচাইকৃত ফ্যাক্টরি নেটওয়ার্ক আর সম্পূর্ণ ডিজিটাল রিপোর্টিং — প্রতিটি অর্ডার স্বচ্ছ ও নিয়ন্ত্রিত।
          </p>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            {[["১০+", "বছরের অভিজ্ঞতা"], ["৩৫", "জনের টিম"], ["১২০+", "ফ্যাক্টরি"]].map(([v, t]) => (
              <div key={t} className="rounded-2xl bg-sky-50 px-2 py-3 ring-1 ring-sky-100"><p className="text-xl font-black text-sky-700">{v}</p><p className={`text-[11px] font-bold ${sub}`}>{t}</p></div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {[
          ["🎯", "আমাদের মিশন", "বাংলাদেশের গার্মেন্টসকে বিশ্বের প্রতিটি রিটেইল শেলফে পৌঁছে দেওয়া — সঠিক মানে, সঠিক দামে।"],
          ["👁️", "আমাদের ভিশন", "দক্ষিণ এশিয়ার সবচেয়ে বিশ্বস্ত সোর্সিং পার্টনার হওয়া।"],
          ["💎", "আমাদের মূল্যবোধ", "স্বচ্ছতা, মানের প্রতি অঙ্গীকার, সময়ানুবর্তিতা — এই তিনে কোনো আপস নয়।"],
        ].map(([e, t, d]) => (
          <div key={t} className={`${card} text-center`}>
            <p className="text-4xl">{e}</p>
            <p className={`mt-2 font-black ${htx}`}>{t}</p>
            <p className={`mt-1 text-sm ${sub}`}>{d}</p>
          </div>
        ))}
      </div>
      <div className={`mt-5 rounded-3xl bg-gradient-to-br ${def.grad} p-6 text-center text-white`}>
        <p className="text-lg font-black">আমাদের টিমের সাথে কথা বলুন</p>
        <Link href={`${base}/contact`} className="mt-3 inline-block rounded-xl bg-white px-5 py-2.5 text-sm font-black text-slate-900">📞 যোগাযোগ করুন</Link>
      </div>
    </Page>
  );
}

export function BhContact() {
  const { def, base } = useDemo();
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", msg: "" });
  return (
    <Page>
      <Back href={base} label="হোম" />
      <SectionTitle t="📞 যোগাযোগ" sub="Get in Touch — ২৪ ঘণ্টায় উত্তর" />
      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-3">
          {[
            ["📍", "হেড অফিস", def.address],
            ["📞", "ফোন / WhatsApp", def.contact],
            ["✉️", "ইমেইল", BH_EMAIL],
            ["🕘", "অফিস সময়", "শনি–বৃহস্পতি, সকাল ৯টা – সন্ধ্যা ৬টা"],
          ].map(([e, t, v]) => (
            <div key={t} className={`${card} flex gap-3`}>
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-xl ring-1 ring-sky-100">{e}</span>
              <span><b className={`block text-sm ${htx}`}>{t}</b><span className={`text-sm ${sub}`}>{v}</span></span>
            </div>
          ))}
          <div className="overflow-hidden rounded-3xl shadow-md">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={IMG("hero.webp")} alt="শোরুম" className="h-40 w-full object-cover" />
          </div>
        </div>
        <div className={card}>
          <p className={`font-black ${htx}`}>💬 মেসেজ পাঠান</p>
          {sent ? (
            <p className="mt-3 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700 ring-1 ring-emerald-200">✅ মেসেজ পাঠানো হয়েছে! শীঘ্রই উত্তর পাবেন।</p>
          ) : (
            <form className="mt-3 grid gap-3" onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
              <Field required placeholder="আপনার নাম" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <Field required placeholder="ইমেইল / ফোন" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <Area required placeholder="আপনার মেসেজ..." value={form.msg} onChange={(e) => setForm({ ...form, msg: e.target.value })} />
              <Btn accent={def.accent}>📨 পাঠান</Btn>
            </form>
          )}
        </div>
      </div>
    </Page>
  );
}

function useAuth() {
  const { store } = useDemo();
  return store.user;
}

export function BhLogin() {
  const { def, base } = useDemo();
  const { store } = useDemo();
  const router = useRouter();
  const [form, setForm] = useState({ phone: "", pass: "" });
  const [err, setErr] = useState("");
  function go(e: React.FormEvent) {
    e.preventDefault();
    const msg = store.login(form.phone, form.pass);
    if (!msg) router.push(`${base}/account`);
    else setErr(msg);
  }
  return (
    <Page narrow>
      <div className={`${card} mx-auto mt-8 max-w-md`}>
        <p className="text-center text-5xl">👋</p>
        <h1 className={`mt-2 text-center text-2xl font-black ${htx}`}>Welcome Back!</h1>
        <p className={`mt-1 text-center text-sm ${sub}`}>বায়ার অ্যাকাউন্টে লগইন করুন</p>
        <form onSubmit={go} className="mt-5 grid gap-3">
          <Field required type="tel" placeholder="মোবাইল নম্বর (01xxxxxxxxx)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Field required type="password" placeholder="পাসওয়ার্ড" value={form.pass} onChange={(e) => setForm({ ...form, pass: e.target.value })} />
          {err && <p className="rounded-xl bg-rose-50 px-3 py-2 text-xs font-bold text-rose-600 ring-1 ring-rose-200">{err}</p>}
          <Btn accent={def.accent}>🔐 লগইন</Btn>
        </form>
        <p className={`mt-4 text-center text-sm ${sub}`}>অ্যাকাউন্ট নেই? <Link href={`${base}/signup`} className="font-black text-sky-600">সাইন আপ করুন</Link></p>
      </div>
    </Page>
  );
}

export function BhSignup() {
  const { def, base } = useDemo();
  const { store } = useDemo();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", phone: "", pass: "" });
  const [err, setErr] = useState("");
  function go(e: React.FormEvent) {
    e.preventDefault();
    const msg = store.signup(form.name, form.phone, form.pass);
    if (!msg) router.push(`${base}/account`);
    else setErr(msg);
  }
  return (
    <Page narrow>
      <div className={`${card} mx-auto mt-8 max-w-md`}>
        <p className="text-center text-5xl">🏢</p>
        <h1 className={`mt-2 text-center text-2xl font-black ${htx}`}>বায়ার অ্যাকাউন্ট খুলুন</h1>
        <p className={`mt-1 text-center text-sm ${sub}`}>RFQ ট্র্যাক করুন, কোটেশন পান এক জায়গায়</p>
        <form onSubmit={go} className="mt-5 grid gap-3">
          <Field required placeholder="আপনার নাম" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Field required type="tel" placeholder="মোবাইল নম্বর (01xxxxxxxxx)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Field required type="password" placeholder="পাসওয়ার্ড" value={form.pass} onChange={(e) => setForm({ ...form, pass: e.target.value })} />
          {err && <p className="rounded-xl bg-rose-50 px-3 py-2 text-xs font-bold text-rose-600 ring-1 ring-rose-200">{err}</p>}
          <Btn accent={def.accent}>✅ অ্যাকাউন্ট খুলুন</Btn>
        </form>
        <p className={`mt-4 text-center text-sm ${sub}`}>ইতিমধ্যে অ্যাকাউন্ট আছে? <Link href={`${base}/login`} className="font-black text-sky-600">লগইন করুন</Link></p>
      </div>
    </Page>
  );
}

export function BhAccount() {
  const { def, base } = useDemo();
  const { store } = useDemo();
  const router = useRouter();
  const id = useAuth();
  const [rfqs, setRfqs] = useState<Rfq[]>([]);
  useEffect(() => { setRfqs(loadRfqs()); }, []);
  if (!id) return (
    <Page narrow>
      <div className={`${card} mt-8 text-center`}>
        <p className="text-5xl">🔒</p>
        <p className={`mt-2 font-black ${htx}`}>আগে লগইন করুন</p>
        <Link href={`${base}/login`} className="mt-3 inline-block rounded-xl px-5 py-2.5 text-sm font-black text-white" style={{ background: def.accent }}>🔐 লগইন</Link>
      </div>
    </Page>
  );
  const mine = rfqs.filter((r) => r.name === id.name || r.company === id.name);
  const list = mine.length ? mine : rfqs.slice(0, 3);
  return (
    <Page>
      <div className={`flex flex-wrap items-center gap-4 rounded-3xl bg-gradient-to-br ${def.grad} p-6 text-white`}>
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 text-2xl font-black">{id.name.charAt(0)}</span>
        <div className="min-w-0 flex-1">
          <p className="text-lg font-black">{id.name}</p>
          <p className="truncate text-sm text-white/80">📱 {id.phone}</p>
        </div>
        <button onClick={() => { store.logout(); router.push(base); }} className="rounded-xl bg-white/15 px-4 py-2 text-xs font-black">🚪 লগআউট</button>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3">
        {[["📩", toBnDigits(list.length), "মোট RFQ"], ["⏳", toBnDigits(list.filter((r) => r.status === "নতুন").length), "নতুন"], ["✅", toBnDigits(list.filter((r) => r.status === "কনফার্ম").length), "কনফার্ম অর্ডার"]].map(([e, v, t]) => (
          <div key={t} className={`${card} text-center`}><p className="text-xl">{e}</p><p className="mt-1 text-xl font-black text-sky-700">{v}</p><p className={`text-[11px] font-bold ${sub}`}>{t}</p></div>
        ))}
      </div>
      <div className={`${card} mt-4`}>
        <div className="mb-3 flex items-center justify-between">
          <p className={`font-black ${htx}`}>📩 আমার RFQ সমূহ</p>
          <Link href={`${base}/rfq`} className="rounded-lg px-3 py-1.5 text-xs font-black text-white" style={{ background: def.accent }}>+ নতুন RFQ</Link>
        </div>
        <div className="space-y-2">
          {list.map((r) => (
            <div key={r.id} className="flex flex-wrap items-center gap-2 rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-100">
              <b className="text-sky-700">{r.id}</b>
              <span className="text-sm font-bold text-slate-700">{r.product}</span>
              <span className={`text-xs ${sub}`}>{r.qty}</span>
              <span className="ml-auto rounded-full bg-sky-50 px-2.5 py-1 text-[11px] font-black text-sky-700 ring-1 ring-sky-100">{r.status}</span>
            </div>
          ))}
        </div>
      </div>
    </Page>
  );
}

/* ---------------- ADMIN — operations dashboard (SewSync-style) ---------------- */

type Po = { id: string; buyer: string; country: string; product: string; qty: string; value: string; stage: number; docs: string };
const PO_STAGES = ["স্যাম্পল", "প্রোডাকশন", "QC", "শিপমেন্ট"];
const PO_PCT = [22, 58, 84, 97, 100];
const SEED_POS: Po[] = [
  { id: "PO-3456", buyer: "EuroStyle GmbH", country: "🇩🇪 জার্মানি", product: "নিট টি-শার্ট", qty: "৫০,০০০ পিস", value: "$92,500", stage: 1, docs: "৯/১৪" },
  { id: "PO-3451", buyer: "London Apparel Ltd", country: "🇬🇧 যুক্তরাজ্য", product: "হুডি", qty: "২০,০০০ পিস", value: "$84,000", stage: 2, docs: "১২/১৪" },
  { id: "PO-3448", buyer: "Kim Trading Co.", country: "🇺🇸 আমেরিকা", product: "ডেনিম জিন্স", qty: "৩০,০০০ পিস", value: "$168,000", stage: 3, docs: "১৪/১৪" },
  { id: "PO-3460", buyer: "Nordic Wear AB", country: "🇸🇪 সুইডেন", product: "সোয়েটার", qty: "১৫,০০০ পিস", value: "$91,500", stage: 0, docs: "৪/১৪" },
];

const WORKERS = [
  { n: "রফিকুল ইসলাম", sec: "কাটিং", shift: "সকাল", present: true, eff: 92 },
  { n: "শারমিন আক্তার", sec: "সুইং লাইন A", shift: "সকাল", present: true, eff: 78 },
  { n: "মোঃ সুমন", sec: "সুইং লাইন B", shift: "সকাল", present: true, eff: 70 },
  { n: "নাজমা বেগম", sec: "কোয়ালিটি (QC)", shift: "সকাল", present: true, eff: 95 },
  { n: "তানভীর হাসান", sec: "প্যাকিং", shift: "বিকাল", present: false, eff: 44 },
  { n: "রুমানা পারভীন", sec: "ফিনিশিং", shift: "সকাল", present: true, eff: 85 },
];

const MATERIALS = [
  { n: "কটন ফ্যাব্রিক ১৬০ GSM", t: "ফ্যাব্রিক", stock: "১২,৪০০ মিটার", s: "পর্যাপ্ত", p: "—" },
  { n: "ডেনিম ১২ oz", t: "ফ্যাব্রিক", stock: "৩,২০০ মিটার", s: "কম", p: "PO-3448" },
  { n: "পলিয়েস্টার থ্রেড", t: "ট্রিমস", stock: "৮৫০ কোন", s: "পর্যাপ্ত", p: "—" },
  { n: "মেটাল বাটন ২০L", t: "ট্রিমস", stock: "০ পিস", s: "ঘাটতি", p: "PO-3451" },
  { n: "পলি ব্যাগ (প্রিন্টেড)", t: "প্যাকেজিং", stock: "৪০,০০০ পিস", s: "পর্যাপ্ত", p: "—" },
  { n: "কার্টন ৭-প্লাই", t: "প্যাকেজিং", stock: "১,১০০ পিস", s: "কম", p: "PO-3456" },
];

const ACTIVITY: [string, string, string][] = [
  ["১০:৪৫ AM", "সুইং মেশিন #১২-এর মেইনটেন্যান্স সম্পন্ন", "emerald"],
  ["১১:০০ AM", "কটন ফ্যাব্রিক রোল রিপ্লেনিশ করা হয়েছে", "sky"],
  ["১১:১৫ AM", "৫ জন ওয়ার্কার সিভ লাইন A-তে স্থানান্তর", "violet"],
  ["১২:৩০ PM", "PO-3451-এর মিডলাইন QC রিপোর্ট আপলোড", "amber"],
  ["০১:১০ PM", "নতুন RFQ এসেছে — Nordic Wear AB", "rose"],
];

export function BuyingAdmin() {
  const { def, store } = useDemo();
  const [tab, setTab] = useState("overview");
  const [rfqs, setRfqs] = useState<Rfq[]>([]);
  const [pos, setPos] = useState<Po[]>(SEED_POS);
  const [prods, setProds] = useState(def.products);
  const [np, setNp] = useState({ n: "", p: "", c: def.cats[1] ?? "নিট" });
  const [settings, setSettings] = useState({ siteName: def.name, heroTitle: def.heroTitle, heroSub: def.heroSub });
  const [saved, setSaved] = useState(false);

  useEffect(() => { setRfqs(loadRfqs()); }, []);

  const navItems: [string, string, string][] = [
    ["overview", "⊞", "ওভারভিউ"],
    ["orders", "🧾", "অর্ডার (PO)"],
    ["rfq", "📩", `RFQ (${toBnDigits(rfqs.length)})`],
    ["products", "👕", "প্রোডাক্ট"],
    ["workers", "👷", "ওয়ার্কার"],
    ["materials", "🧵", "ম্যাটেরিয়াল"],
    ["settings", "⚙️", "সেটিংস"],
  ];

  const rfStatusCls = (s: string) =>
    s === "নতুন" ? "bg-rose-50 text-rose-600 ring-rose-200" :
    s === "শিপড" ? "bg-emerald-50 text-emerald-700 ring-emerald-200" :
    s === "কনফার্ম" ? "bg-sky-50 text-sky-700 ring-sky-200" : "bg-amber-50 text-amber-700 ring-amber-200";

  const dayBars = [["শনি", 780], ["রবি", 920], ["সোম", 850], ["মঙ্গল", 970], ["বুধ", 900], ["বৃহঃ", 880], ["শুক্র", 420]] as const;

  return (
    <Page>
      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-[#f7f8fc] shadow-[0_18px_50px_rgba(15,23,42,0.10)] lg:flex">
        {/* sidebar */}
        <aside className="hidden w-56 shrink-0 flex-col border-r border-slate-200 bg-white p-4 lg:flex">
          <p className="flex items-center gap-2 px-2 text-lg font-black text-slate-900"><span className="text-2xl">{def.logoEmoji}</span>{def.name.split(" ")[0]}<span className="text-sky-600">Sync</span></p>
          <p className="px-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">অপারেশনস প্যানেল</p>
          <nav className="mt-5 space-y-1">
            {navItems.map(([k, e, t]) => (
              <button key={k} onClick={() => setTab(k)} className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-bold transition ${tab === k ? "bg-slate-900 text-white shadow" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"}`}>
                <span>{e}</span>{t}
              </button>
            ))}
          </nav>
          <div className="mt-auto flex items-center gap-2.5 rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-100">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-600 text-xs font-black text-white">অ্যা</span>
            <span className="min-w-0"><b className="block truncate text-xs text-slate-800">অ্যাডমিন</b><span className="block truncate text-[11px] text-slate-400">{def.contact}</span></span>
          </div>
        </aside>

        <div className="min-w-0 flex-1 p-4 sm:p-6">
          {/* mobile tabs */}
          <div className="mb-4 flex gap-1.5 overflow-x-auto pb-1 lg:hidden">
            {navItems.map(([k, e, t]) => (
              <button key={k} onClick={() => setTab(k)} className={`whitespace-nowrap rounded-full px-3.5 py-2 text-xs font-black transition ${tab === k ? "bg-slate-900 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200"}`}>{e} {t}</button>
            ))}
          </div>

          {tab === "overview" && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="min-w-0 flex-1">
                  <h1 className="text-xl font-black text-slate-900 sm:text-2xl">হ্যালো, অ্যাডমিন 👋</h1>
                  <p className="text-sm text-slate-500">{def.name} — আজকের প্রোডাকশন ও অর্ডার সামারি</p>
                </div>
                <button className="rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-black text-white shadow" onClick={() => alert("ডেমোতে রিপোর্ট ডাউনলোড সিমুলেটেড।")}>⬇️ রিপোর্ট ডাউনলোড</button>
              </div>

              {/* stat cards */}
              <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                <div className="rounded-3xl border border-violet-100 bg-violet-50/70 p-4">
                  <p className="text-[11px] font-black text-violet-500">🎯 প্রোডাকশন টার্গেট</p>
                  <p className="mt-1 text-2xl font-black text-slate-900">৯০০<span className="text-slate-400">/১২০০</span></p>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-white"><div className="h-full w-[75%] rounded-full bg-violet-500" /></div>
                  <p className="mt-1.5 text-[11px] font-bold text-slate-500">৭৫% সম্পন্ন</p>
                </div>
                <div className="rounded-3xl border border-amber-100 bg-amber-50/70 p-4">
                  <p className="text-[11px] font-black text-amber-500">🧵 অ্যাক্টিভ লাইন / মেশিন</p>
                  <p className="mt-1 text-2xl font-black text-slate-900">৪৫<span className="text-slate-400">/৫০</span></p>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-white"><div className="h-full w-[90%] rounded-full bg-amber-500" /></div>
                  <p className="mt-1.5 text-[11px] font-bold text-slate-500">৯০% অ্যাক্টিভ</p>
                </div>
                <div className="rounded-3xl border border-sky-100 bg-sky-50/70 p-4">
                  <p className="text-[11px] font-black text-sky-500">👷 ওয়ার্কার উপস্থিতি</p>
                  <p className="mt-1 text-2xl font-black text-slate-900">১২০<span className="text-slate-400">/১৫০</span></p>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-white"><div className="h-full w-[80%] rounded-full bg-sky-500" /></div>
                  <p className="mt-1.5 text-[11px] font-bold text-slate-500">৮০% উপস্থিত</p>
                </div>
                <div className="rounded-3xl border border-emerald-100 bg-emerald-50/70 p-4">
                  <p className="text-[11px] font-black text-emerald-500">📦 ম্যাটেরিয়াল ইনভেন্টরি</p>
                  <p className="mt-1 text-2xl font-black text-slate-900">৩০ <span className="text-base text-slate-400">ধরন</span></p>
                  <p className="mt-2 text-[11px] font-bold text-slate-500">ঘাটতিতে: <b className="text-rose-500">৫ ধরন</b> • চলতি অর্ডার: ১টি পেন্ডিং</p>
                  <button onClick={() => setTab("materials")} className="mt-1 text-[11px] font-black text-sky-600">বিস্তারিত →</button>
                </div>
              </div>

              {/* production flow */}
              <div className="rounded-3xl border border-slate-200 bg-white p-4">
                <div className="mb-3 flex items-center justify-between"><p className="font-black text-slate-900">🔄 প্রোডাকশন ফ্লো</p><span className="text-[11px] font-bold text-slate-400">লাইভ আপডেট</span></div>
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                  {[["✂️", "কাটিং", "ঠিকঠাক চলছে", "bg-emerald-50 text-emerald-600 ring-emerald-200"], ["🧵", "সুইং", "বিলম্বিত", "bg-rose-50 text-rose-600 ring-rose-200"], ["🔍", "QC", "ঠিকঠাক চলছে", "bg-emerald-50 text-emerald-600 ring-emerald-200"], ["📦", "প্যাকেজিং", "ম্যাটেরিয়ালের অপেক্ষায়", "bg-amber-50 text-amber-600 ring-amber-200"]].map(([e, t, s, cls]) => (
                    <div key={t} className="rounded-2xl border border-dashed border-slate-200 p-3.5 text-center">
                      <p className="text-2xl">{e}</p>
                      <p className="mt-1 text-sm font-black text-slate-800">{t}</p>
                      <span className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-black ring-1 ${cls}`}>{s}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 xl:grid-cols-3">
                {/* trend donut + weekly bars */}
                <div className="rounded-3xl border border-slate-200 bg-white p-4 xl:col-span-2">
                  <div className="flex flex-wrap gap-5">
                    <div className="text-center">
                      <Ring pct={80} size={118} stroke={13} color="#f59e0b">
                        <span className="text-xl font-black text-slate-900">৮০%</span>
                      </Ring>
                      <p className="mt-2 text-xs font-black text-slate-700">দৈনিক প্রোডাকশন ট্রেন্ড</p>
                      <p className="text-[11px] text-slate-400">গতকাল ১১০০ পিস • আজ ১২০০ পিস</p>
                    </div>
                    <div className="min-w-[220px] flex-1">
                      <p className="text-xs font-black text-slate-700">📈 সাপ্তাহিক আউটপুট (পিস)</p>
                      <div className="mt-3 flex h-28 items-end gap-2.5">
                        {dayBars.map(([d, v]) => (
                          <div key={d} className="flex flex-1 flex-col items-center gap-1">
                            <span className="text-[10px] font-black text-slate-500">{toBnDigits(v)}</span>
                            <div className="w-full rounded-t-lg bg-gradient-to-t from-sky-600 to-sky-400 transition-all" style={{ height: `${(v / 1000) * 100}%` }} />
                            <span className="text-[10px] font-bold text-slate-400">{d}</span>
                          </div>
                        ))}
                      </div>
                      <p className="mt-2 text-[11px] text-slate-400">⬇️ মেশিন ডাউনটাইম আজ: <b className="text-slate-600">১২ ঘণ্টা</b> (মেইনটেন্যান্স সময়সূচি অনুযায়ী)</p>
                    </div>
                  </div>
                  <div className="mt-4 border-t border-slate-100 pt-3">
                    <p className="mb-2 text-xs font-black text-slate-700">⏱️ ওয়ার্কার এফিশিয়েন্সি</p>
                    <div className="flex flex-wrap gap-5">
                      {[["কাটিং", 80, "#0ea5e9"], ["সুইং", 70, "#f59e0b"], ["কোয়ালিটি", 90, "#10b981"], ["প্যাকেজিং", 40, "#f43f5e"]].map(([t, pct, c]) => (
                        <div key={t as string} className="text-center">
                          <Ring pct={pct as number} size={64} stroke={7} color={c as string}>
                            <span className="text-[11px] font-black text-slate-800">{toBnDigits(pct as number)}%</span>
                          </Ring>
                          <p className="mt-1 text-[11px] font-bold text-slate-500">{t as string}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* activity */}
                <div className="rounded-3xl border border-slate-200 bg-white p-4">
                  <p className="font-black text-slate-900">🕐 সাম্প্রতিক কার্যকলাপ</p>
                  <div className="mt-3 space-y-3">
                    {ACTIVITY.map(([time, txt, c]) => (
                      <div key={txt} className="flex gap-2.5">
                        <span className={`h-fit shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-black ring-1 ${c === "emerald" ? "bg-emerald-50 text-emerald-600 ring-emerald-100" : c === "sky" ? "bg-sky-50 text-sky-600 ring-sky-100" : c === "violet" ? "bg-violet-50 text-violet-600 ring-violet-100" : c === "amber" ? "bg-amber-50 text-amber-600 ring-amber-100" : "bg-rose-50 text-rose-600 ring-rose-100"}`}>{time}</span>
                        <p className="text-xs leading-relaxed text-slate-600">{txt}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 border-t border-slate-100 pt-3">
                    <p className="mb-2 text-xs font-black text-slate-700">📩 সর্বশেষ RFQ</p>
                    {rfqs.slice(0, 2).map((r) => (
                      <p key={r.id} className="mb-1.5 flex items-center gap-2 text-xs"><b className="text-sky-700">{r.id}</b><span className="truncate text-slate-600">{r.company} — {r.product}</span><span className={`ml-auto shrink-0 rounded-full px-2 py-0.5 text-[10px] font-black ring-1 ${rfStatusCls(r.status)}`}>{r.status}</span></p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === "orders" && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="flex-1 text-xl font-black text-slate-900">🧾 অর্ডার ট্র্যাকার (PO)</h2>
                <span className="rounded-full bg-white px-3 py-1.5 text-xs font-black text-slate-600 ring-1 ring-slate-200">মোট মূল্য: $436,000</span>
              </div>
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {[["📂", toBnDigits(pos.length), "মোট PO"], ["🔄", toBnDigits(pos.filter((p) => p.stage < 3).length), "চলমান"], ["🚢", toBnDigits(pos.filter((p) => p.stage >= 3).length), "শিপমেন্ট পর্যায়ে"], ["📄", "৪৪/৫৬", "ডকুমেন্ট সম্পন্ন"]].map(([e, v, t]) => (
                  <div key={t} className="rounded-3xl border border-slate-200 bg-white p-4 text-center"><p className="text-xl">{e}</p><p className="mt-1 text-lg font-black text-slate-900">{v}</p><p className="text-[11px] font-bold text-slate-400">{t}</p></div>
                ))}
              </div>
              <div className="space-y-3">
                {pos.map((po) => {
                  const pct = PO_PCT[po.stage];
                  return (
                    <div key={po.id} className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-5">
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="font-black text-slate-900">{po.id} <span className="ml-1 text-xs font-bold text-slate-400">{po.country}</span></p>
                          <p className="truncate text-sm text-slate-500">{po.buyer} • {po.product} • {po.qty}</p>
                        </div>
                        <Ring pct={pct} size={58} stroke={6} color="#0284c7"><span className="text-[11px] font-black text-slate-800">{toBnDigits(pct)}%</span></Ring>
                        <div className="text-right">
                          <p className="font-black text-slate-900">{po.value}</p>
                          <p className="text-[11px] font-bold text-slate-400">📄 ডকুমেন্ট {po.docs}</p>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center">
                        {PO_STAGES.map((s, i) => (
                          <div key={s} className={`flex items-center ${i < PO_STAGES.length - 1 ? "flex-1" : ""}`}>
                            <div className="flex flex-col items-center gap-1">
                              <span className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-black ${i < po.stage ? "bg-emerald-500 text-white" : i === po.stage ? "bg-sky-600 text-white ring-4 ring-sky-100" : "bg-slate-100 text-slate-400"}`}>{i < po.stage ? "✓" : toBnDigits(i + 1)}</span>
                              <span className={`whitespace-nowrap text-[10px] font-bold ${i === po.stage ? "text-sky-700" : "text-slate-400"}`}>{s}</span>
                            </div>
                            {i < PO_STAGES.length - 1 && <div className={`mx-1.5 mb-4 h-1 flex-1 rounded-full ${i < po.stage ? "bg-emerald-400" : "bg-slate-100"}`} />}
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
                        <span className="text-xs font-bold text-slate-400">স্টেজ বদলান:</span>
                        <select value={po.stage} onChange={(e) => setPos(pos.map((x) => x.id === po.id ? { ...x, stage: Number(e.target.value) } : x))} className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700">
                          {PO_STAGES.map((s, i) => <option key={s} value={i}>{s}</option>)}
                        </select>
                        {po.stage >= 3 && <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-black text-emerald-600 ring-1 ring-emerald-200">🚢 শিপমেন্টে</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {tab === "rfq" && (
            <div className="space-y-4">
              <h2 className="text-xl font-black text-slate-900">📩 RFQ ম্যানেজমেন্ট</h2>
              <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white">
                <table className="w-full min-w-[680px] text-left text-sm">
                  <thead><tr className="border-b border-slate-100 text-xs text-slate-400"><th className="px-4 py-3">RFQ</th><th className="px-4 py-3">কোম্পানি</th><th className="px-4 py-3">প্রোডাক্ট</th><th className="px-4 py-3">পরিমাণ</th><th className="px-4 py-3">কোটেড প্রাইস</th><th className="px-4 py-3">স্ট্যাটাস</th></tr></thead>
                  <tbody>
                    {rfqs.map((r) => (
                      <tr key={r.id} className="border-b border-slate-50">
                        <td className="px-4 py-3"><b className="text-sky-700">{r.id}</b><br /><span className="text-xs text-slate-400">{r.date}</span></td>
                        <td className="px-4 py-3"><b className="text-slate-800">{r.company}</b><br /><span className="text-xs text-slate-400">{r.country}</span></td>
                        <td className="px-4 py-3 text-slate-600">{r.product}</td>
                        <td className="px-4 py-3 text-slate-600">{r.qty}</td>
                        <td className="px-4 py-3 font-bold text-slate-800">{r.price}</td>
                        <td className="px-4 py-3">
                          <select value={r.status} onChange={(e) => setRfqs(rfqs.map((x) => x.id === r.id ? { ...x, status: e.target.value } : x))} className={`rounded-full px-2 py-1 text-[11px] font-black ring-1 ${rfStatusCls(r.status)}`}>
                            {["নতুন", "কোটেশন পাঠানো হয়েছে", "স্যাম্পল চলছে", "কনফার্ম", "শিপড", "বাতিল"].map((s) => <option key={s}>{s}</option>)}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-slate-400">💡 ওয়েবসাইট থেকে আসা নতুন RFQ এই তালিকার শুরুতেই দেখা যায়।</p>
            </div>
          )}

          {tab === "products" && (
            <div className="space-y-4">
              <h2 className="text-xl font-black text-slate-900">👕 প্রোডাক্ট ম্যানেজমেন্ট</h2>
              <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
                <form className="h-fit rounded-3xl border border-slate-200 bg-white p-4" onSubmit={(e) => { e.preventDefault(); if (!np.n.trim()) return; setProds([{ id: `bp${Date.now()}`, n: np.n, c: np.c, p: Number(np.p) || 0, rating: 4.5, reviews: 0, stock: 500, desc: "নতুন প্রোডাক্ট", e: "👕" }, ...prods]); setNp({ n: "", p: "", c: def.cats[1] ?? "নিট" }); }}>
                  <p className="mb-3 font-black text-slate-800">➕ নতুন প্রোডাক্ট</p>
                  <div className="grid gap-2.5">
                    <Field placeholder="প্রোডাক্টের নাম" value={np.n} onChange={(e) => setNp({ ...np, n: e.target.value })} />
                    <Field placeholder="FOB প্রাইস (টাকা)" value={np.p} onChange={(e) => setNp({ ...np, p: e.target.value })} />
                    <select className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-800" value={np.c} onChange={(e) => setNp({ ...np, c: e.target.value })}>
                      {def.cats.filter((c) => c !== "সব").map((c) => <option key={c}>{c}</option>)}
                    </select>
                    <Btn accent={def.accent}>যোগ করুন</Btn>
                  </div>
                </form>
                <div className="space-y-2">
                  {prods.map((p) => (
                    <div key={p.id} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3">
                      {p.img ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.img} alt={p.n} className="h-11 w-11 rounded-xl object-cover" />
                      ) : (
                        <span className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-xl ${def.grad}`}>{p.e}</span>
                      )}
                      <div className="min-w-0 flex-1"><p className="truncate font-bold text-slate-800">{p.n}</p><p className="text-xs text-slate-400">{p.c} • FOB {toBnDigits(p.p)} টাকা</p></div>
                      <button onClick={() => setProds(prods.filter((x) => x.id !== p.id))} className="rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-black text-rose-500 ring-1 ring-rose-100">মুছুন</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === "workers" && (
            <div className="space-y-4">
              <h2 className="text-xl font-black text-slate-900">👷 ওয়ার্কার ম্যানেজমেন্ট</h2>
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {[["👥", "১৫০", "মোট ওয়ার্কার"], ["✅", "১২০", "আজ উপস্থিত"], ["❌", "২৫", "অনুপস্থিত"], ["🌴", "৫", "ছুটিতে"]].map(([e, v, t]) => (
                  <div key={t} className="rounded-3xl border border-slate-200 bg-white p-4 text-center"><p className="text-xl">{e}</p><p className="mt-1 text-lg font-black text-slate-900">{v}</p><p className="text-[11px] font-bold text-slate-400">{t}</p></div>
                ))}
              </div>
              <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white">
                <table className="w-full min-w-[620px] text-left text-sm">
                  <thead><tr className="border-b border-slate-100 text-xs text-slate-400"><th className="px-4 py-3">ওয়ার্কার</th><th className="px-4 py-3">সেকশন</th><th className="px-4 py-3">শিফট</th><th className="px-4 py-3">উপস্থিতি</th><th className="px-4 py-3">এফিশিয়েন্সি</th></tr></thead>
                  <tbody>
                    {WORKERS.map((w) => (
                      <tr key={w.n} className="border-b border-slate-50">
                        <td className="px-4 py-3"><span className="mr-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 text-[11px] font-black text-sky-700">{w.n.charAt(0)}</span><b className="text-slate-800">{w.n}</b></td>
                        <td className="px-4 py-3 text-slate-600">{w.sec}</td>
                        <td className="px-4 py-3 text-slate-600">{w.shift}</td>
                        <td className="px-4 py-3">{w.present ? <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-black text-emerald-600 ring-1 ring-emerald-200">উপস্থিত</span> : <span className="rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-black text-rose-600 ring-1 ring-rose-200">অনুপস্থিত</span>}</td>
                        <td className="px-4 py-3"><div className="flex items-center gap-2"><div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-sky-500" style={{ width: `${w.eff}%` }} /></div><b className="text-slate-700">{toBnDigits(w.eff)}%</b></div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === "materials" && (
            <div className="space-y-4">
              <h2 className="text-xl font-black text-slate-900">🧵 ম্যাটেরিয়াল ইনভেন্টরি</h2>
              <div className="rounded-3xl border border-rose-200 bg-rose-50 p-4">
                <p className="font-black text-rose-700">⚠️ ঘাটতি সতর্কতা</p>
                <p className="mt-1 text-sm text-rose-600">মেটাল বাটন ২০L শেষ — PO-3451 (London Apparel হুডি) এর জন্য জরুরি অর্ডার প্রয়োজন। ডেনিম ১২ oz-ও কমে এসেছে।</p>
              </div>
              <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white">
                <table className="w-full min-w-[620px] text-left text-sm">
                  <thead><tr className="border-b border-slate-100 text-xs text-slate-400"><th className="px-4 py-3">ম্যাটেরিয়াল</th><th className="px-4 py-3">ধরন</th><th className="px-4 py-3">স্টক</th><th className="px-4 py-3">স্ট্যাটাস</th><th className="px-4 py-3">পেন্ডিং অর্ডার</th></tr></thead>
                  <tbody>
                    {MATERIALS.map((m) => (
                      <tr key={m.n} className="border-b border-slate-50">
                        <td className="px-4 py-3 font-bold text-slate-800">{m.n}</td>
                        <td className="px-4 py-3 text-slate-600">{m.t}</td>
                        <td className="px-4 py-3 text-slate-600">{m.stock}</td>
                        <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-[11px] font-black ring-1 ${m.s === "পর্যাপ্ত" ? "bg-emerald-50 text-emerald-600 ring-emerald-200" : m.s === "কম" ? "bg-amber-50 text-amber-600 ring-amber-200" : "bg-rose-50 text-rose-600 ring-rose-200"}`}>{m.s}</span></td>
                        <td className="px-4 py-3 text-slate-600">{m.p}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === "settings" && (
            <div className="space-y-4">
              <h2 className="text-xl font-black text-slate-900">⚙️ সাইট সেটিংস</h2>
              <form className="max-w-xl rounded-3xl border border-slate-200 bg-white p-5" onSubmit={(e) => { e.preventDefault(); store.saveCustom({ siteName: settings.siteName, heroTitle: settings.heroTitle, heroSub: settings.heroSub }); setSaved(true); setTimeout(() => setSaved(false), 2500); }}>
                <div className="grid gap-3">
                  <label className="text-xs font-bold text-slate-500">সাইটের নাম<Field value={settings.siteName} onChange={(e) => setSettings({ ...settings, siteName: e.target.value })} /></label>
                  <label className="text-xs font-bold text-slate-500">হিরো শিরোনাম<Field value={settings.heroTitle} onChange={(e) => setSettings({ ...settings, heroTitle: e.target.value })} /></label>
                  <label className="text-xs font-bold text-slate-500">হিরো সাব-টাইটেল<Area value={settings.heroSub} onChange={(e) => setSettings({ ...settings, heroSub: e.target.value })} /></label>
                  <Btn accent={def.accent}>{saved ? "✅ সেভ হয়েছে!" : "💾 সেভ করুন"}</Btn>
                </div>
              </form>
              <p className="max-w-xl text-xs leading-relaxed text-slate-400">সেটিংস বদলালে পুরো সাইটে (নাম, হিরো টেক্সট) সাথে সাথে প্রতিফলিত হয়। কন্টাক্ট তথ্য: {def.contact} • {BH_EMAIL}</p>
            </div>
          )}
        </div>
      </div>
    </Page>
  );
}
