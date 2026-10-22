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
import { useBh, BhLogo, CAT_EN, RFQ_STATUS_EN, EN_NAME, EN_HERO_TITLE, EN_ADDRESS, EN_HOURS, EN_ABOUT } from "./bh-lang";
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
  const bh = useBh();
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
  return <span ref={ref}>{bh.num(v.toLocaleString("en-IN"))}{suffix}</span>;
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

/* ---------------- English content (language toggle) ---------------- */

const COUNTRIES_EN = ["🇩🇪 Germany", "🇺🇸 USA", "🇬🇧 United Kingdom", "🇫🇷 France", "🇪🇸 Spain", "🇮🇹 Italy", "🇳🇱 Netherlands", "🇸🇪 Sweden", "🇯🇵 Japan", "🇦🇺 Australia", "🇨🇦 Canada", "🇵🇱 Poland"];

const PROCESS_EN = [
  ["📩", "RFQ & Quotation", "Send your tech-pack — receive a factory-verified quotation within 48 hours."],
  ["🧪", "Sample Development", "PP, fit and counter samples — revised until you approve."],
  ["🏭", "Production", "Production at verified factories after confirmation — weekly updates."],
  ["🔍", "Quality Control", "Inline, midline and final (AQL 2.5) inspections — with full reports."],
  ["📦", "Packing & Booking", "Carton packing, freight booking and documentation (BL, invoice, packing list)."],
  ["🚢", "Shipment", "On-time shipment — tracking updates from port to your destination."],
] as const;

const FACTORIES_EN = [
  { n: "Green Knit Composite", loc: "Gazipur", cap: "1.2M pcs/month", img: "factory-1.webp", spec: ["Knit", "T-Shirts", "Polo"], cert: ["WRAP", "BSCI", "OEKO-TEX"] },
  { n: "Dhaka Denim Works", loc: "Narayanganj", cap: "600K pcs/month", img: "cat-3.webp", spec: ["Denim", "Jeans", "Jackets"], cert: ["BSCI", "SEDEX"] },
  { n: "Sky Woven Industries", loc: "Ashulia, Savar", cap: "800K pcs/month", img: "cat-2.webp", spec: ["Woven", "Formal Shirts"], cert: ["WRAP", "ACCORD"] },
  { n: "Northern Sweater Ltd", loc: "Uttara, Dhaka", cap: "400K pcs/month", img: "cat-4.webp", spec: ["Sweaters", "Cardigans"], cert: ["BSCI", "GRS"] },
  { n: "Pacific Apparels", loc: "Chattogram", cap: "1M pcs/month", img: "factory-3.webp", spec: ["Knit", "Hoodies", "Kids"], cert: ["SEDEX", "OEKO-TEX"] },
  { n: "Royal Textile Mills", loc: "Tongi", cap: "500K pcs/month", img: "hero.webp", spec: ["Woven", "Casual"], cert: ["WRAP", "BSCI"] },
];

const TESTIMONIALS_EN = [
  { n: "Markus Weber", c: "🇩🇪 Germany — Retail Chain", t: "Working with TexBridge for three years. Their QC reports are so detailed that our own inspection cost dropped by half.", r: 5 },
  { n: "Sarah Collins", c: "🇬🇧 United Kingdom — Fashion Brand", t: "Sample development speed is outstanding — the PP sample was in my hands within 7 days. Every shipment on time.", r: 5 },
  { n: "David Kim", c: "🇺🇸 USA — E-commerce Seller", t: "Even with a small 3,000-piece order I received premium service. Their price negotiation saved us 12%.", r: 4.5 },
];

const BLOG_POSTS_EN = [
  {
    id: "b1", img: "hero.webp", cat: "Trends", date: "October 15, 2026", read: "5 min read",
    t: "5 Big Trends in Garment Sourcing for 2026",
    ex: "Sustainable fabrics, low MOQs, digital sampling — where buyer demand is heading this year.",
    body: ["Fashion buyers worldwide now weigh sustainability, traceability and speed as heavily as price. Demand for recycled cotton and organic fabrics has nearly doubled year over year.", "Low minimum orders are going mainstream: factories that once refused anything under 10,000 pieces now accept 1,000–3,000-piece orders, driven by e-commerce brands. Digital 3D sampling has cut sample lead time from 14 days to 5.", "At TexBridge we keep a dedicated factory panel for each trend — so every buyer gets the right partner for their market."],
  },
  {
    id: "b2", img: "factory-1.webp", cat: "Guide", date: "October 8, 2026", read: "7 min read",
    t: "Choosing the Right Factory: A 7-Step Checklist",
    ex: "Compliance, capacity, machinery, finance — what to verify before you place an order.",
    body: ["Choosing the right factory is half the battle. Step one: verify compliance certificates (WRAP/BSCI/SEDEX) are current. Step two: check real experience in your product category — not just machine counts, but order history in similar styles.", "Step three: compare capacity against current bookings — an overbooked factory means delays. Step four: sample room and QC team size. Step five: financial stability and sub-contracting policy. Step six: communication speed — do they reply within 24 hours? Step seven: feedback from reference buyers.", "Every TexBridge partner factory passes all seven steps before joining the panel, and is re-audited every year."],
  },
  {
    id: "b3", img: "factory-2.webp", cat: "Quality", date: "October 1, 2026", read: "4 min read",
    t: "What Is AQL Inspection — and Why It Matters",
    ex: "What AQL 2.5 means, how sample sizes are set, and what the report includes.",
    body: ["AQL (Acceptable Quality Limit) is a statistical sampling method — instead of checking every piece, a defined sample is inspected to judge the whole shipment. AQL 2.5 allows on average up to 2.5 major defects per 100 pieces.", "An inspection covers measurement checks, stitching and finishing, colour shade matching, and packing/carton audits. Photo-documented reports reach the buyer before shipment.", "At TexBridge, inline inspections (at 20% and 80%) plus a final AQL 2.5 inspection are mandatory on every order — at no extra charge."],
  },
];

const PROD_EN: Record<string, { n: string; desc: string }> = {
  p0: { n: "Basic T-Shirt", desc: "100% cotton, 160 GSM. Our most-ordered staple for EU/US basics programs, available in 40+ colours." },
  p1: { n: "Premium Polo Shirt", desc: "Piqué knit polo, 220 GSM, with embroidered-logo support and reinforced collar." },
  p2: { n: "Hoodie", desc: "Brushed fleece hoodie, 320 GSM, kangaroo pocket and double-lined hood." },
  p3: { n: "Kids Set", desc: "Two-piece kids set in OEKO-TEX certified fabrics, ages 2–12, soft-hand print." },
  p4: { n: "Formal Shirt", desc: "Wrinkle-free formal shirt in 40s poplin with a tailored, modern fit." },
  p5: { n: "Casual Shirt", desc: "Yarn-dyed casual shirt, garment-washed for softness, seasonal checks and solids." },
  p6: { n: "Slim Fit Jeans", desc: "Stretch denim, 12 oz, five-pocket slim fit with premium stitching." },
  p7: { n: "Denim Jacket", desc: "Classic trucker jacket with stone and enzyme wash options." },
  p8: { n: "Wool Sweater", desc: "Wool-blend pullover, 7 gauge, anti-pilling finish for winter programs." },
  p9: { n: "Cardigan", desc: "Button-front cardigan in a soft-touch acrylic blend, fine gauge knit." },
};

const SVC_EN: Record<string, { n: string; desc: string }> = {
  s0: { n: "Sourcing & Merchandising", desc: "Dedicated merchandisers match your tech-pack with the right factory from our 120+ audited network, with weekly production updates." },
  s1: { n: "Product Development", desc: "Tech-pack analysis, pattern support and PP/fit samples in 7–10 days, including fabric and trim sourcing." },
  s2: { n: "Quality Control (QC)", desc: "Inline checks at 20% and 80% plus a final AQL 2.5 inspection, with photo–video reports on every order." },
  s3: { n: "Price Negotiation", desc: "Multi-factory quote comparison and costing breakdowns that save buyers 8–12% on average." },
  s4: { n: "Compliance & Audit Support", desc: "WRAP / BSCI / SEDEX audit preparation and corrective-action follow-up for partner factories." },
  s5: { n: "Shipment & Logistics", desc: "Freight coordination, export documentation and packing supervision through to delivery." },
};

const SVC_DUR_EN: Record<string, string> = {
  s0: "Continuous", s1: "Sample in 7–10 days", s2: "AQL 2.5 Standard",
  s3: "Save 8–12% on average", s4: "WRAP / BSCI / SEDEX", s5: "Door-to-Port",
};

const SVC_POINTS_EN: Record<string, string[]> = {
  s0: ["Matching from a 120+ factory database", "Dedicated merchandiser", "Weekly production updates", "Time & Action (T&A) plan"],
  s1: ["Tech-pack analysis & pattern support", "PP / fit / shipment samples", "Fabric & trim sourcing", "Size-set & colour approval"],
  s2: ["Inline inspection (20% & 80%)", "Final inspection — AQL 2.5", "Detailed photo–video reports", "Lab test coordination (SGS / BV / Intertek)"],
  s3: ["Multi-factory quote comparison", "Costing breakdown analysis", "8–12% average savings", "Transparent commission — no hidden charges"],
  s4: ["WRAP / BSCI / SEDEX audit preparation", "Factory compliance verification", "Corrective action plan (CAP) support", "Annual re-audit monitoring"],
  s5: ["Freight forwarder coordination", "Export documentation", "Carton & packing supervision", "Tracking updates until delivery"],
};

const PROD_NAME_EN: Record<string, string> = {
  "নিট টি-শার্ট": "Knit T-Shirt", "হুডি": "Hoodie", "ডেনিম জিন্স": "Denim Jeans", "সোয়েটার": "Sweater", "ফরমাল শার্ট": "Formal Shirt",
};
const COUNTRY_EN: Record<string, string> = {
  "জার্মানি": "Germany", "যুক্তরাজ্য": "United Kingdom", "আমেরিকা": "USA", "সুইডেন": "Sweden", "জাপান": "Japan",
  "🇩🇪 জার্মানি": "🇩🇪 Germany", "🇬🇧 যুক্তরাজ্য": "🇬🇧 United Kingdom", "🇺🇸 আমেরিকা": "🇺🇸 USA", "🇸🇪 সুইডেন": "🇸🇪 Sweden",
};

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
  const bh = useBh();
  const stats: [number, string, string][] = bh.lang === "en"
    ? [[120, "+", "Verified Factories"], [40, "+", "Export Countries"], [1500, "+", "Orders Completed"], [98, "%", "On-Time Shipment"]]
    : [[120, "+", "যাচাইকৃত ফ্যাক্টরি"], [40, "+", "দেশে রপ্তানি"], [1500, "+", "অর্ডার সম্পন্ন"], [98, "%", "অন-টাইম শিপমেন্ট"]];
  return (
    <>
      {/* HERO — photo first, stats, then headline text (order per user) */}
      <div className="relative overflow-hidden bg-gradient-to-b from-sky-50 via-white to-white">
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-sky-100 blur-3xl" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-4 pb-12 pt-8 sm:pt-10">
          {/* 1) showroom photo */}
          <div className="relative">
            <div className="relative overflow-hidden rounded-[28px] shadow-[0_30px_60px_rgba(15,23,42,0.18)] ring-1 ring-slate-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={def.heroImg ?? IMG("hero.webp")} alt={bh.tx(def.name, EN_NAME)} className="h-[300px] w-full object-cover sm:h-[440px]" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/70 to-transparent p-4 pt-14">
                <p className="text-sm font-black text-white">{bh.tx("🏭 শোরুম ও স্যাম্পল রুম — ঢাকা হেড অফিস", "🏭 Showroom & Sample Room — Dhaka Head Office")}</p>
                <p className="text-xs text-white/75">{bh.tx("প্রতিটি কালেকশনের লাইভ স্যাম্পল বায়ারের জন্য প্রস্তুত", "Live samples of every collection, ready for buyers")}</p>
              </div>
            </div>
            <div className="bh-float absolute -left-3 top-8 hidden rounded-2xl border border-slate-200 bg-white/95 px-3.5 py-2.5 shadow-xl backdrop-blur sm:block">
              <p className="text-[10px] font-bold text-slate-400">{bh.tx("🔍 ফাইনাল QC", "🔍 Final QC")}</p>
              <p className="text-sm font-black text-emerald-600">{bh.tx("পাস ✓ AQL 2.5", "Passed ✓ AQL 2.5")}</p>
            </div>
            <div className="bh-float absolute -right-2 bottom-16 hidden rounded-2xl border border-slate-200 bg-white/95 px-3.5 py-2.5 shadow-xl backdrop-blur sm:block" style={{ animationDelay: "-3s" }}>
              <p className="text-[10px] font-bold text-slate-400">{bh.tx("🚢 এই সপ্তাহে শিপমেন্ট", "🚢 Shipping This Week")}</p>
              <p className="text-sm font-black text-sky-700">{bh.tx("১২টি অর্ডার • অন-টাইম", "12 orders • On-time")}</p>
            </div>
          </div>

          {/* 2) stats band */}
          <div className="mt-6 grid grid-cols-2 gap-3 rounded-3xl border border-slate-200 bg-white p-3 shadow-[0_2px_18px_rgba(15,23,42,0.05)] sm:grid-cols-4">
            {stats.map(([v, suf, t]) => (
              <div key={t} className="px-4 py-3 text-center">
                <p className="text-2xl font-black text-sky-700 sm:text-3xl"><CountUp to={v} suffix={suf} /></p>
                <p className="mt-0.5 text-[11px] font-bold text-slate-500">{t}</p>
              </div>
            ))}
          </div>

          {/* 3) headline text — below photo and stats */}
          <div className="mt-10 max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white px-3.5 py-1.5 text-[11px] font-black text-sky-700 shadow-sm">
              <span className="relative flex h-2 w-2"><span className="absolute h-full w-full animate-ping rounded-full bg-emerald-400" /><span className="h-2 w-2 rounded-full bg-emerald-500" /></span>
              {bh.tx("গার্মেন্টস বায়িং হাউস — ঢাকা, বাংলাদেশ", "Garments Buying House — Dhaka, Bangladesh")}
            </span>
            <h1 className={`mt-5 text-4xl font-black leading-[1.1] sm:text-5xl ${htx}`}>
              {bh.tx(def.heroTitle, EN_HERO_TITLE)}
              <span className="mt-2 block text-sky-600">{bh.tx("ঝামেলাহীন, প্রতিটি ধাপে QC সহ", "Hassle-free, with QC at every step")}</span>
            </h1>
            <p className={`mt-4 max-w-lg text-[15px] leading-relaxed ${sub}`}>
              {bh.tx("ফ্যাক্টরি সিলেকশন থেকে শিপমেন্ট — একজন ডেডিকেটেড মার্চেন্ডাইজার আপনার প্রতিটি অর্ডারের পাশে। স্যাম্পল, প্রোডাকশন আপডেট আর AQL ইন্সপেকশন রিপোর্ট — সব এক জায়গায়।", "From factory selection to shipment — a dedicated merchandiser stays with every one of your orders. Samples, production updates and AQL inspection reports — all in one place.")}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={`${base}/rfq`} className="rounded-2xl bg-sky-600 px-6 py-3.5 text-sm font-black text-white shadow-[0_12px_28px_rgba(2,132,199,0.35)] transition hover:-translate-y-0.5 hover:bg-sky-700">{bh.tx("📩 Request a Quote — ফ্রি", "📩 Request a Quote — Free")}</Link>
              <Link href={`${base}/products`} className="rounded-2xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 transition hover:border-sky-400 hover:text-sky-700">{bh.tx("👕 প্রোডাক্ট দেখুন", "👕 View Products")}</Link>
            </div>
            <div className="mt-7 flex flex-wrap gap-x-5 gap-y-1.5 text-xs font-bold text-slate-500">
              <span>{bh.tx("✓ WRAP / BSCI সার্টিফাইড ফ্যাক্টরি", "✓ WRAP / BSCI Certified Factories")}</span>
              <span>{bh.tx("✓ ৪৮ ঘণ্টায় কোটেশন", "✓ Quotation in 48 Hours")}</span>
              <span>{bh.tx("✓ AQL 2.5 ইন্সপেকশন", "✓ AQL 2.5 Inspection")}</span>
            </div>
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
            {(bh.lang === "en" ? [...COUNTRIES_EN, ...COUNTRIES_EN] : [...COUNTRIES, ...COUNTRIES]).map((c, i) => (
              <span key={i} className="whitespace-nowrap text-sm font-bold text-slate-500">{c}</span>
            ))}
          </div>
        </div>
        <p className="mt-2 text-center text-[11px] font-bold text-slate-400">{bh.tx("🌍 যেসব দেশে আমাদের বায়াররা রপ্তানি নিচ্ছেন", "🌍 Countries our buyers export to")}</p>
      </div>

      <Page>
        {/* services with photos */}
        <Reveal>
          <SectionTitle t={bh.tx("🛠️ আমাদের সার্ভিস", "🛠️ Our Services")} sub={bh.tx("সম্পূর্ণ সোর্সিং সলিউশন", "Complete Sourcing Solutions")} link={`${base}/services`} linkLabel={bh.tx("সব দেখুন →", "View All →")} />
        </Reveal>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {def.services.map((s, i) => (
            <Reveal key={s.id} delay={i * 70}>
              <Link href={`${base}/s/${s.id}`} className="group block h-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_2px_18px_rgba(15,23,42,0.05)] transition hover:-translate-y-1 hover:shadow-xl">
                <div className="relative h-36 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={IMG(SVC_IMG[s.id] ?? "hero.webp")} alt={bh.tx(s.n, SVC_EN[s.id]?.n ?? s.n)} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                  <span className="absolute bottom-3 left-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/95 text-xl shadow">{s.e}</span>
                </div>
                <div className="p-4">
                  <p className={`font-black ${htx}`}>{bh.tx(s.n, SVC_EN[s.id]?.n ?? s.n)}</p>
                  <p className={`mt-1 line-clamp-2 text-sm ${sub}`}>{bh.tx(s.desc, SVC_EN[s.id]?.desc ?? s.desc)}</p>
                  <p className="mt-3 text-xs font-black text-sky-600">{bh.tx("বিস্তারিত দেখুন →", "See Details →")}</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>

        {/* categories */}
        <Reveal className="mt-12">
          <SectionTitle t={bh.tx("🧥 প্রোডাক্ট ক্যাটাগরি", "🧥 Product Categories")} sub={bh.tx("পোশাক ও মার্চেন্ডাইজের বিশাল সংগ্রহ", "Wide Range of Apparel & Merchandise")} link={`${base}/products`} linkLabel={bh.tx("সব দেখুন →", "View All →")} />
        </Reveal>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {def.cats.filter((c) => c !== "সব").map((c, i) => (
            <Reveal key={c} delay={i * 60}>
              <Link href={`${base}/products`} className="group relative block h-44 overflow-hidden rounded-3xl shadow-md">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={def.catImgs?.[c] ?? IMG("hero.webp")} alt={bh.tx(c, CAT_EN[c] ?? c)} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                <span className="absolute inset-0 bg-gradient-to-t from-slate-900/75 via-slate-900/10 to-transparent" />
                <span className="absolute bottom-3 left-4 text-lg font-black text-white">{bh.tx(c, CAT_EN[c] ?? c)}</span>
                <span className="absolute bottom-3 right-4 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-black text-slate-800">{bh.tx("দেখুন →", "View →")}</span>
              </Link>
            </Reveal>
          ))}
        </div>

        {/* products row */}
        <Reveal className="mt-12">
          <SectionTitle t={bh.tx("🔥 জনপ্রিয় প্রোডাক্ট", "🔥 Popular Products")} sub={bh.tx("বায়ারদের সবচেয়ে বেশি অর্ডার", "Most Ordered by Buyers")} link={`${base}/products`} linkLabel={bh.tx("সব দেখুন →", "View All →")} />
        </Reveal>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {def.products.slice(0, 8).map((p, i) => (
            <Reveal key={p.id} delay={i * 50}>
              <Link href={`${base}/p/${p.id}`} className="group block h-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_2px_18px_rgba(15,23,42,0.05)] transition hover:-translate-y-1 hover:shadow-xl">
                {p.img ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.img} alt={bh.tx(p.n, PROD_EN[p.id]?.n ?? p.n)} className="h-36 w-full object-cover transition duration-500 group-hover:scale-105" />
                ) : (
                  <div className={`flex h-36 items-center justify-center bg-gradient-to-br ${def.grad} text-6xl`}>{p.e}</div>
                )}
                <div className="p-4">
                  <p className={`font-black ${htx}`}>{bh.tx(p.n, PROD_EN[p.id]?.n ?? p.n)}</p>
                  <p className={`text-xs ${sub}`}>{bh.tx(p.c, CAT_EN[p.c] ?? p.c)} • MOQ {bh.num("1,000")} {bh.tx("পিস", "pcs")}</p>
                  <p className="mt-2 text-sm font-black text-sky-700">FOB {bh.num(p.p)} {bh.tx("টাকা", "BDT")}<span className="text-[11px] text-slate-400">{bh.tx("/পিস থেকে", "/pc")}</span></p>
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
              <img src={IMG("factory-1.webp")} alt={bh.tx("ফ্যাক্টরি", "Factory")} className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute bottom-0 w-full bg-gradient-to-t from-slate-900/80 to-transparent p-5 pt-16">
                <p className="font-black text-white">{bh.tx("পার্টনার ফ্যাক্টরি — সুইং ফ্লোর", "Partner Factory — Sewing Floor")}</p>
                <p className="text-xs text-white/75">{bh.tx("প্রতিটি লাইনে আমাদের নিজস্ব QC সুপারভাইজার", "Our own QC supervisor on every line")}</p>
              </div>
            </div>
          </Reveal>
          <Reveal delay={100} className="h-full">
            <div className={`${card} h-full`}>
              <p className={`text-lg font-black ${htx}`}>{bh.tx("🏆 কেন টেক্সব্রিজ?", "🏆 Why TexBridge?")}</p>
              <ul className="mt-3 space-y-3.5">
                {(bh.lang === "en" ? [
                  ["🏭", "Verified Factory Network", "Every factory is audit-passed and compliance-checked."],
                  ["👤", "Dedicated Merchandiser", "A named merchandiser for every buyer — direct communication."],
                  ["🔍", "Transparent QC Reports", "Inline and final inspection reports with photos and videos on every order."],
                  ["💰", "Best Price Guarantee", "Quotes compared across multiple factories for the best rate."],
                ] : [
                  ["🏭", "যাচাইকৃত ফ্যাক্টরি নেটওয়ার্ক", "প্রতিটি ফ্যাক্টরি অডিট-পাস ও কমপ্লায়েন্স-যাচাই করা।"],
                  ["👤", "ডেডিকেটেড মার্চেন্ডাইজার", "প্রতিটি বায়ারের জন্য নির্দিষ্ট মার্চেন্ডাইজার — সরাসরি যোগাযোগ।"],
                  ["🔍", "স্বচ্ছ QC রিপোর্ট", "ছবি-ভিডিওসহ ইনলাইন ও ফাইনাল ইন্সপেকশন রিপোর্ট প্রতিটি অর্ডারে।"],
                  ["💰", "সেরা প্রাইস গ্যারান্টি", "একাধিক ফ্যাক্টরির কোটেশন তুলনা করে সবচেয়ে ভালো রেট।"],
                ]).map(([e, t, d]) => (
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
          <SectionTitle t={bh.tx("🏭 আমাদের প্রোডাকশন", "🏭 Our Production")} sub={bh.tx("প্রোডাকশনের ভেতরের চিত্র", "Inside Our Production")} link={`${base}/factories`} linkLabel={bh.tx("সব দেখুন →", "View All →")} />
        </Reveal>
        <div className="grid gap-3 sm:grid-cols-3">
          {(bh.lang === "en" ? [["factory-1.webp", "Sewing Section", "Skilled Workforce"], ["factory-2.webp", "Quality Inspection", "100% Checked"], ["factory-3.webp", "Packing & Shipment", "Ready for the Global Market"]] : [["factory-1.webp", "সুইং সেকশন", "দক্ষ ওয়ার্কফোর্স"], ["factory-2.webp", "কোয়ালিটি ইন্সপেকশন", "১০০% চেকড"], ["factory-3.webp", "প্যাকিং ও শিপমেন্ট", "গ্লোবাল মার্কেটের জন্য প্রস্তুত"]]).map(([img, t, d], i) => (
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
            <p className={`text-sm font-black uppercase tracking-widest ${sub}`}>{bh.tx("🤝 শীর্ষ ব্র্যান্ডদের আস্থা", "🤝 Trusted by Leading Brands")}</p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
              {BRANDS.slice(0, 8).map((b) => (
                <span key={b} className="text-lg font-black tracking-wide text-slate-400 transition hover:text-slate-700">{b}</span>
              ))}
            </div>
            <Link href={`${base}/clients`} className="mt-4 inline-block text-xs font-black text-sky-600">{bh.tx("সব ক্লায়েন্ট দেখুন →", "View All Clients →")}</Link>
          </div>
        </Reveal>

        {/* testimonials */}
        <Reveal className="mt-12">
          <SectionTitle t={bh.tx("⭐ ক্লায়েন্টরা যা বলছেন", "⭐ What Our Clients Say")} sub={bh.tx("বায়ারদের অভিজ্ঞতা", "Client Testimonials")} link={`${base}/clients`} linkLabel={bh.tx("সব দেখুন →", "View All →")} />
        </Reveal>
        <div className="grid gap-4 md:grid-cols-3">
          {(bh.lang === "en" ? TESTIMONIALS_EN : TESTIMONIALS).map((x, i) => (
            <Reveal key={x.n} delay={i * 80}>
              <div className={`${card} h-full`}>
                <Stars rating={x.r} en={bh.lang === "en"} />
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
            <p className="text-2xl font-black sm:text-3xl">{bh.tx("আপনার পরবর্তী কালেকশন শুরু করতে প্রস্তুত?", "Ready to Start Your Next Collection?")}</p>
            <p className="mx-auto mt-2 max-w-xl text-sm text-white/85">{bh.tx("টেক-প্যাক বা শুধু আইডিয়া পাঠালেই হবে — ৪৮ ঘণ্টায় ফ্যাক্টরি-যাচাই করা কোটেশন পাচ্ছেন, সম্পূর্ণ ফ্রি।", "Just send a tech-pack — or even an idea. Get a factory-verified quotation within 48 hours, completely free.")}</p>
            <Link href={`${base}/rfq`} className="mt-5 inline-block rounded-2xl bg-white px-7 py-3.5 text-sm font-black text-slate-900 shadow-xl transition hover:-translate-y-0.5">{bh.tx("📩 ফ্রি কোটেশন নিন", "📩 Get a Free Quote")}</Link>
          </div>
        </Reveal>
      </Page>
    </>
  );
}

/* ---------------- SERVICES ---------------- */

export function BhServices() {
  const { def, base } = useDemo();
  const bh = useBh();
  return (
    <Page>
      <Back href={base} label={bh.tx("হোম", "Home")} />
      <SectionTitle t={bh.tx("🛠️ আমাদের সার্ভিস", "🛠️ Our Services")} sub={bh.tx("এন্ড-টু-এন্ড সোর্সিং সলিউশন", "End-to-End Sourcing Solutions")} />
      <div className="grid gap-4 sm:grid-cols-2">
        {def.services.map((s) => (
          <Link key={s.id} href={`${base}/s/${s.id}`} className="group flex gap-4 overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_2px_18px_rgba(15,23,42,0.05)] transition hover:-translate-y-1 hover:shadow-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={IMG(SVC_IMG[s.id] ?? "hero.webp")} alt={bh.tx(s.n, SVC_EN[s.id]?.n ?? s.n)} className="h-28 w-32 shrink-0 rounded-2xl object-cover" />
            <div className="min-w-0">
              <p className={`font-black ${htx}`}>{s.e} {bh.tx(s.n, SVC_EN[s.id]?.n ?? s.n)}</p>
              <p className={`mt-1 line-clamp-2 text-sm ${sub}`}>{bh.tx(s.desc, SVC_EN[s.id]?.desc ?? s.desc)}</p>
              <p className="mt-2 flex items-center gap-3 text-xs font-bold">
                <span className="text-amber-500">⭐ {bh.num(s.rating)}</span>
                <span className={sub}>⏱️ {bh.tx(s.duration, SVC_DUR_EN[s.id] ?? s.duration)}</span>
                <span className="text-sky-600">{bh.tx("বিস্তারিত →", "Details →")}</span>
              </p>
            </div>
          </Link>
        ))}
      </div>
      <div className={`mt-6 rounded-3xl bg-gradient-to-br ${def.grad} p-6 text-center text-white`}>
        <p className="text-lg font-black">{bh.tx("কাস্টম সার্ভিস লাগবে?", "Need a Custom Service?")}</p>
        <p className="mt-1 text-sm text-white/85">{bh.tx("প্রাইভেট লেবেল, কাস্টম প্যাকেজিং, ছোট অর্ডার — আলোচনা করুন আমাদের টিমের সাথে।", "Private label, custom packaging, small orders — talk to our team.")}</p>
        <Link href={`${base}/rfq`} className="mt-4 inline-block rounded-xl bg-white px-5 py-2.5 text-sm font-black text-slate-900">{bh.tx("📩 RFQ পাঠান", "📩 Send an RFQ")}</Link>
      </div>
    </Page>
  );
}

export function BhServiceDetail({ id }: { id: string }) {
  const { def, base } = useDemo();
  const bh = useBh();
  const s = def.services.find((x) => x.id === id);
  if (!s) return <Page><Empty emoji="🔍" text={bh.tx("সার্ভিসটি পাওয়া যায়নি", "Service not found")} /></Page>;
  const pointsBn: Record<string, string[]> = {
    s0: ["১২০+ ফ্যাক্টরির ডেটাবেস থেকে ম্যাচিং", "ডেডিকেটেড মার্চেন্ডাইজার", "সাপ্তাহিক প্রোডাকশন আপডেট", "টাইম অ্যান্ড অ্যাকশন (T&A) প্ল্যান"],
    s1: ["টেক-প্যাক বিশ্লেষণ ও প্যাটার্ন সাপোর্ট", "PP / ফিট / শিপমেন্ট স্যাম্পল", "ফ্যাব্রিক ও ট্রিমস সোর্সিং", "সাইজ-সেট ও কালার অনুমোদন"],
    s2: ["ইনলাইন ইন্সপেকশন (২০% ও ৮০%)", "ফাইনাল ইন্সপেকশন — AQL 2.5", "ছবি-ভিডিওসহ ডিটেইল রিপোর্ট", "ল্যাব টেস্ট সমন্বয় (SGS / BV / Intertek)"],
    s3: ["একাধিক ফ্যাক্টরির কোটেশন তুলনা", "কস্টিং ব্রেকডাউন বিশ্লেষণ", "গড়ে ৮–১২% সাশ্রয়", "স্বচ্ছ কমিশন — কোনো লুকানো চার্জ নয়"],
    s4: ["WRAP / BSCI / SEDEX অডিট প্রস্তুতি", "ফ্যাক্টরি কমপ্লায়েন্স যাচাই", "সংশোধনী পরিকল্পনা (CAP) সাপোর্ট", "বার্ষিক রি-অডিট মনিটরিং"],
    s5: ["ফ্রেইট ফরওয়ার্ডার সমন্বয়", "এক্সপোর্ট ডকুমেন্টেশন", "কার্টন ও প্যাকিং সুপারভিশন", "ডেলিভারি পর্যন্ত ট্র্যাকিং আপডেট"],
  };
  return (
    <Page>
      <Back href={`${base}/services`} label={bh.tx("সব সার্ভিস", "All Services")} />
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_2px_18px_rgba(15,23,42,0.05)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={IMG(SVC_IMG[s.id] ?? "hero.webp")} alt={bh.tx(s.n, SVC_EN[s.id]?.n ?? s.n)} className="h-56 w-full object-cover sm:h-72" />
        <div className="p-6">
          <h1 className={`text-2xl font-black ${htx}`}>{s.e} {bh.tx(s.n, SVC_EN[s.id]?.n ?? s.n)}</h1>
          <p className={`mt-2 max-w-2xl leading-relaxed ${sub}`}>{bh.tx(s.desc, SVC_EN[s.id]?.desc ?? s.desc)}</p>
          <p className="mt-3 flex gap-4 text-sm font-bold">
            <span className="text-amber-500">⭐ {bh.tx("রেটিং", "Rating")} {bh.num(s.rating)}</span>
            <span className={sub}>⏱️ {bh.tx(s.duration, SVC_DUR_EN[s.id] ?? s.duration)}</span>
          </p>
        </div>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className={card}>
          <p className={`font-black ${htx}`}>{bh.tx("✅ যা যা পাচ্ছেন", "✅ What's Included")}</p>
          <ul className="mt-3 space-y-2.5">
            {((bh.lang === "en" ? SVC_POINTS_EN : pointsBn)[s.id] ?? (bh.lang === "en" ? SVC_POINTS_EN : pointsBn).s0).map((pt) => (
              <li key={pt} className="flex items-start gap-2 text-sm text-slate-600"><span className="text-emerald-500">✓</span>{pt}</li>
            ))}
          </ul>
        </div>
        <div className={`${card} text-center`}>
          <p className="text-4xl">💬</p>
          <p className={`mt-2 font-black ${htx}`}>{bh.tx("এই সার্ভিস নিয়ে আলোচনা করুন", "Discuss This Service")}</p>
          <p className={`mt-1 text-sm ${sub}`}>{bh.tx("আপনার প্রোডাক্ট ও পরিমাণ জানালে ৪৮ ঘণ্টায় কোটেশন দেব।", "Tell us your product and quantity — get a quotation within 48 hours.")}</p>
          <Link href={`${base}/rfq`} className="mt-4 inline-block rounded-xl px-5 py-3 text-sm font-black text-white" style={{ background: def.accent }}>{bh.tx("📩 RFQ পাঠান", "📩 Send an RFQ")}</Link>
          <p className={`mt-3 text-xs ${sub}`}>📞 {bh.dg(def.contact)}</p>
        </div>
      </div>
    </Page>
  );
}

/* ---------------- PRODUCTS ---------------- */

export function BhProducts() {
  const { def, base } = useDemo();
  const bh = useBh();
  const [cat, setCat] = useState("সব");
  const list = cat === "সব" ? def.products : def.products.filter((p) => p.c === cat);
  return (
    <Page>
      <Back href={base} label={bh.tx("হোম", "Home")} />
      <SectionTitle t={bh.tx("👕 প্রোডাক্ট ক্যাটালগ", "👕 Product Catalog")} sub={bh.tx("FOB প্রাইস প্রতি পিস — পরিমাণ অনুযায়ী পরিবর্তনশীল", "FOB price per piece — varies with quantity")} />
      <div className="mb-4 flex flex-wrap gap-2">
        {def.cats.map((c) => (
          <button key={c} onClick={() => setCat(c)} className={`rounded-full px-4 py-2 text-xs font-black transition ${cat === c ? "text-white shadow" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-sky-300"}`} style={cat === c ? { background: def.accent } : undefined}>{bh.tx(c, CAT_EN[c] ?? c)}</button>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((p) => (
          <Link key={p.id} href={`${base}/p/${p.id}`} className="group block overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_2px_18px_rgba(15,23,42,0.05)] transition hover:-translate-y-1 hover:shadow-xl">
            {p.img ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.img} alt={bh.tx(p.n, PROD_EN[p.id]?.n ?? p.n)} className="h-44 w-full object-cover transition duration-500 group-hover:scale-105" />
            ) : (
              <div className={`flex h-44 items-center justify-center bg-gradient-to-br ${def.grad} text-7xl`}>{p.e}</div>
            )}
            <div className="p-4">
              <p className={`font-black ${htx}`}>{bh.tx(p.n, PROD_EN[p.id]?.n ?? p.n)}</p>
              <p className={`mt-0.5 text-xs ${sub}`}>{bh.tx(p.c, CAT_EN[p.c] ?? p.c)} • MOQ {bh.num("1,000")} {bh.tx("পিস", "pcs")} • ⭐ {bh.num(p.rating)}</p>
              <div className="mt-2 flex items-center justify-between">
                <p className="font-black text-sky-700">FOB {bh.num(p.p)} {bh.tx("টাকা", "BDT")}<span className="text-[11px] text-slate-400">{bh.tx("/পিস", "/pc")}</span></p>
                <span className="text-xs font-black text-sky-600">{bh.tx("ইনকোয়ারি →", "Enquire →")}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
      {list.length === 0 && <Empty emoji="📦" text={bh.tx("এই ক্যাটাগরিতে প্রোডাক্ট নেই", "No products in this category")} />}
    </Page>
  );
}

export function BhProductDetail({ id }: { id: string }) {
  const { def, base } = useDemo();
  const bh = useBh();
  const p = def.products.find((x) => x.id === id);
  const [form, setForm] = useState({ name: "", phone: "", qty: "" });
  const [sent, setSent] = useState(false);
  if (!p) return <Page><Empty emoji="🔍" text={bh.tx("প্রোডাক্টটি পাওয়া যায়নি", "Product not found")} /></Page>;
  const specs: [string, string][] = bh.lang === "en"
    ? [
        ["Fabric", p.c === "ডেনিম" ? "100% cotton denim, 12 oz" : p.c === "সোয়েটার" ? "Acrylic / wool blend" : "100% cotton, 160–180 GSM"],
        ["Size Range", "XS – XXL (per buyer's chart)"],
        ["Colour", "Per buyer's Pantone"],
        ["MOQ", "1,000 pcs / colour"],
        ["Sample Time", "7–10 days"],
        ["Lead Time", "45–60 days (after confirmation)"],
      ]
    : [
        ["ফ্যাব্রিক", p.c === "ডেনিম" ? "১০০% কটন ডেনিম, ১২ oz" : p.c === "সোয়েটার" ? "অ্যাক্রিলিক / উল ব্লেন্ড" : "১০০% কটন, ১৬০–১৮০ GSM"],
        ["সাইজ রেঞ্জ", "XS – XXL (বায়ারের চার্ট অনুযায়ী)"],
        ["কালার", "বায়ারের প্যানটোন অনুযায়ী"],
        ["MOQ", "১,০০০ পিস / কালার"],
        ["স্যাম্পল সময়", "৭–১০ দিন"],
        ["লিড টাইম", "৪৫–৬০ দিন (কনফার্মেশনের পর)"],
      ];
  return (
    <Page>
      <Back href={`${base}/products`} label={bh.tx("সব প্রোডাক্ট", "All Products")} />
      <div className="grid gap-4 lg:grid-cols-2">
        {p.img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.img} alt={bh.tx(p.n, PROD_EN[p.id]?.n ?? p.n)} className="h-full min-h-[280px] w-full rounded-3xl object-cover shadow-md" />
        ) : (
          <div className={`flex min-h-[280px] items-center justify-center rounded-3xl bg-gradient-to-br ${def.grad} text-[120px]`}>{p.e}</div>
        )}
        <div className={card}>
          <p className="text-xs font-black uppercase tracking-widest text-sky-600">{bh.tx(p.c, CAT_EN[p.c] ?? p.c)}</p>
          <h1 className={`mt-1 text-2xl font-black ${htx}`}>{bh.tx(p.n, PROD_EN[p.id]?.n ?? p.n)}</h1>
          <div className="mt-2"><Stars rating={p.rating} reviews={p.reviews} en={bh.lang === "en"} /></div>
          <p className={`mt-3 leading-relaxed ${sub}`}>{bh.tx(p.desc, PROD_EN[p.id]?.desc ?? p.desc)}</p>
          <p className="mt-4 text-3xl font-black text-sky-700">FOB {bh.num(p.p)} {bh.tx("টাকা", "BDT")}<span className="text-sm text-slate-400">{bh.tx(" / পিস থেকে", " / pc")}</span></p>
          <div className="mt-4 space-y-1.5">
            {specs.map(([k, v]) => (
              <p key={k} className="flex justify-between gap-3 border-b border-slate-100 pb-1.5 text-sm"><span className={sub}>{k}</span><b className="text-right text-slate-700">{v}</b></p>
            ))}
          </div>
        </div>
      </div>
      <div className={`${card} mt-4`}>
        <p className={`font-black ${htx}`}>{bh.tx("📩 এই প্রোডাক্টের কোটেশন চান", "📩 Get a Quotation for This Product")}</p>
        {sent ? (
          <p className="mt-3 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700 ring-1 ring-emerald-200">{bh.tx("✅ ইনকোয়ারি পাঠানো হয়েছে! আমাদের মার্চেন্ডাইজার ২৪ ঘণ্টার মধ্যে যোগাযোগ করবেন।", "✅ Enquiry sent! Our merchandiser will contact you within 24 hours.")}</p>
        ) : (
          <form className="mt-3 grid gap-3 sm:grid-cols-3" onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
            <Field required placeholder={bh.tx("আপনার নাম / কোম্পানি", "Your name / company")} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Field required placeholder={bh.tx("WhatsApp / ফোন", "WhatsApp / Phone")} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <Field required placeholder={bh.tx("পরিমাণ (পিস)", "Quantity (pcs)")} value={form.qty} onChange={(e) => setForm({ ...form, qty: e.target.value })} />
            <div className="sm:col-span-3"><Btn accent={def.accent}>{bh.tx("📨 কোটেশন চান", "📨 Request Quotation")}</Btn></div>
          </form>
        )}
      </div>
    </Page>
  );
}

/* ---------------- PROCESS & QUALITY ---------------- */

export function BhProcess() {
  const { def, base } = useDemo();
  const bh = useBh();
  return (
    <Page>
      <Back href={base} label={bh.tx("হোম", "Home")} />
      <SectionTitle t={bh.tx("⚙️ আমাদের ওয়ার্ক প্রসেস", "⚙️ Our Work Process")} sub={bh.tx("প্রতিটি ধাপে স্বচ্ছতা ও আপডেট", "Transparency and updates at every step")} />
      <div className="space-y-3">
        {(bh.lang === "en" ? PROCESS_EN : PROCESS).map(([e, t, d], i) => (
          <Reveal key={t} delay={i * 40}>
            <div className={`${card} flex gap-4`}>
              <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${def.grad} text-2xl text-white`}>{e}</div>
              <div>
                <p className={`font-black ${htx}`}><span className="text-sky-600">{bh.tx("ধাপ", "Step")} {bh.num(i + 1)}:</span> {t}</p>
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
  const bh = useBh();
  const aql: [string, string, string][] = bh.lang === "en"
    ? [
        ["1,000 – 3,000 pcs", "50 pcs", "Up to 2"],
        ["3,001 – 10,000 pcs", "80 pcs", "Up to 3"],
        ["10,001 – 35,000 pcs", "125 pcs", "Up to 5"],
        ["35,000+ pcs", "200 pcs", "Up to 7"],
      ]
    : [
        ["১,০০০ – ৩,০০০ পিস", "৫০ পিস", "২টি পর্যন্ত"],
        ["৩,০০১ – ১০,০০০ পিস", "৮০ পিস", "৩টি পর্যন্ত"],
        ["১০,০০১ – ৩৫,০০০ পিস", "১২৫ পিস", "৫টি পর্যন্ত"],
        ["৩৫,০০০+ পিস", "২০০ পিস", "৭টি পর্যন্ত"],
      ];
  return (
    <Page>
      <Back href={base} label={bh.tx("হোম", "Home")} />
      <SectionTitle t={bh.tx("🔍 কোয়ালিটি কন্ট্রোল", "🔍 Quality Control")} sub={bh.tx("কোয়ালিটি আমাদের কাছে অপশন নয় — এটাই স্ট্যান্ডার্ড", "Quality is not an option — it's our standard")} />
      <div className="relative overflow-hidden rounded-3xl shadow-md">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={IMG("factory-2.webp")} alt="QC" className="h-60 w-full object-cover sm:h-80" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/75 via-slate-900/30 to-transparent" />
        <div className="absolute inset-y-0 left-0 flex max-w-md flex-col justify-center p-6">
          <p className="text-2xl font-black text-white">{bh.tx("প্রতিটি পিস, প্রতিটি ধাপে যাচাই", "Every piece, checked at every step")}</p>
          <p className="mt-2 text-sm text-white/85">{bh.tx("ফ্যাব্রিক ইন্সপেকশন থেকে ফাইনাল AQL — আমাদের নিজস্ব QC টিম প্রতিটি অর্ডারে ছবি-ভিডিওসহ রিপোর্ট পাঠায়।", "From fabric inspection to the final AQL — our in-house QC team sends photo–video reports on every order.")}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {(bh.lang === "en" ? [
          ["🧵", "Pre-Production", "Fabric and trims check, PP sample approval"],
          ["✂️", "During Production", "Inline checks at the 20% and 80% stages"],
          ["🔍", "Final Inspection", "AQL 2.5 random sampling — measurement, stitching, shade"],
          ["📦", "Packing Audit", "Carton, poly, label and weight verification"],
        ] : [
          ["🧵", "প্রি-প্রোডাকশন", "ফ্যাব্রিক ও ট্রিমস যাচাই, PP স্যাম্পল অনুমোদন"],
          ["✂️", "ডিউরিং প্রোডাকশন", "ইনলাইন চেক ২০% ও ৮০% পর্যায়ে"],
          ["🔍", "ফাইনাল ইন্সপেকশন", "AQL 2.5 র‍্যান্ডম স্যাম্পলিং — মেজারমেন্ট, স্টিচিং, শেড"],
          ["📦", "প্যাকিং অডিট", "কার্টন, পলি, লেবেল ও ওজন যাচাই"],
        ]).map(([e, t, d], i) => (
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
          <p className={`font-black ${htx}`}>{bh.tx("📊 AQL 2.5 স্যাম্পলিং টেবিল (সারসংক্ষেপ)", "📊 AQL 2.5 Sampling Table (Summary)")}</p>
          <table className="mt-3 w-full text-left text-sm">
            <thead><tr className="border-b border-slate-200 text-xs text-slate-400"><th className="pb-2">{bh.tx("লট সাইজ", "Lot Size")}</th><th className="pb-2">{bh.tx("স্যাম্পল", "Sample")}</th><th className="pb-2">{bh.tx("মেজর ডিফেক্ট সহনীয়", "Major Defects Allowed")}</th></tr></thead>
            <tbody>
              {aql.map(([a, b, c]) => (
                <tr key={a} className="border-b border-slate-100"><td className="py-2 font-bold text-slate-700">{a}</td><td className="py-2 text-slate-600">{b}</td><td className="py-2 text-slate-600">{c}</td></tr>
              ))}
            </tbody>
          </table>
          <p className={`mt-2 text-xs ${sub}`}>{bh.tx("স্ট্যান্ডার্ড", "Standard")}: ANSI/ASQ Z1.4, General Inspection Level II</p>
        </div>
        <div className={card}>
          <p className={`font-black ${htx}`}>{bh.tx("🧪 ল্যাব টেস্ট সমন্বয়", "🧪 Lab Test Coordination")}</p>
          <ul className="mt-3 space-y-2">
            {(bh.lang === "en" ? ["Colour fastness (wash / rubbing)", "Shrinkage & dimensional stability", "GSM & fabric composition", "Pilling & tear strength", "Nickel / AZO free — EU standard", "SGS / Bureau Veritas / Intertek reports"] : ["কালার ফাস্টনেস (ওয়াশ / রাবিং)", "শ্রিংকেজ ও ডাইমেনশন স্ট্যাবিলিটি", "GSM ও ফ্যাব্রিক কম্পোজিশন", "পিলিং ও টিয়ার স্ট্রেংথ", "নিকেল / AZO ফ্রি — EU স্ট্যান্ডার্ড", "SGS / Bureau Veritas / Intertek রিপোর্ট"]).map((x) => (
              <li key={x} className="flex items-start gap-2 text-sm text-slate-600"><span className="text-emerald-500">✓</span>{x}</li>
            ))}
          </ul>
          <Link href={`${base}/rfq`} className="mt-4 inline-block rounded-xl px-5 py-2.5 text-sm font-black text-white" style={{ background: def.accent }}>{bh.tx("📩 QCসহ কোটেশন নিন", "📩 Get a Quote with QC")}</Link>
        </div>
      </div>
    </Page>
  );
}

/* ---------------- FACTORIES & CLIENTS & GALLERY & BLOG ---------------- */

export function BhFactories() {
  const { def, base } = useDemo();
  const bh = useBh();
  return (
    <Page>
      <Back href={base} label={bh.tx("হোম", "Home")} />
      <SectionTitle t={bh.tx("🏭 পার্টনার ফ্যাক্টরি", "🏭 Partner Factories")} sub={bh.tx("সব ফ্যাক্টরি অডিট-যাচাই করা ও কমপ্লায়েন্স-সার্টিফাইড", "All factories are audit-verified and compliance-certified")} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(bh.lang === "en" ? FACTORIES_EN : FACTORIES).map((f, i) => (
          <Reveal key={f.n} delay={i * 60}>
            <div className="h-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_2px_18px_rgba(15,23,42,0.05)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={IMG(f.img)} alt={f.n} className="h-40 w-full object-cover" />
              <div className="p-4">
                <p className={`font-black ${htx}`}>{f.n}</p>
                <p className={`mt-1 text-xs ${sub}`}>📍 {bh.dg(f.loc)} • 🏭 {bh.tx("ক্যাপাসিটি", "Capacity")}: {bh.dg(f.cap)}</p>
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
  const bh = useBh();
  void def;
  return (
    <Page>
      <SectionTitle t={bh.tx("🤝 আমাদের ক্লায়েন্ট", "🤝 Our Clients")} sub={bh.tx("বিশ্বব্যাপী ব্র্যান্ডদের আস্থা", "Trusted by Global Brands")} />
      <div className={`${card} text-center`}>
        <p className={`mx-auto max-w-2xl text-sm leading-relaxed ${sub}`}>
          {bh.tx("ইউরোপ, আমেরিকা ও এশিয়ার শীর্ষ রিটেইল চেইন ও ফ্যাশন ব্র্যান্ডের বায়িং টিমের সাথে আমাদের দীর্ঘদিনের কাজের অভিজ্ঞতা রয়েছে।", "We have long-standing working relationships with the buying teams of leading retail chains and fashion brands across Europe, America and Asia.")}
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
        {(bh.lang === "en" ? TESTIMONIALS_EN : TESTIMONIALS).map((x) => (
          <div key={x.n} className={`${card} h-full`}>
            <Stars rating={x.r} en={bh.lang === "en"} />
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

const GALLERY_ITEMS_EN: [string, string, string][] = [
  ["hero.webp", "Showroom", "Sample Showroom — Dhaka"],
  ["factory-1.webp", "Factory", "Sewing Floor — Gazipur"],
  ["factory-2.webp", "Factory", "Final QC Table"],
  ["factory-3.webp", "Factory", "Packing & Warehouse"],
  ["cat-1.webp", "Product", "Knit Collection"],
  ["cat-2.webp", "Product", "Woven Shirt Collection"],
  ["cat-3.webp", "Product", "Denim Collection"],
  ["cat-4.webp", "Product", "Sweater Collection"],
];
const GAL_CAT_EN: Record<string, string> = { "সব": "All", "শোরুম": "Showroom", "ফ্যাক্টরি": "Factory", "প্রোডাক্ট": "Product" };

export function BhGallery() {
  const bh = useBh();
  const [cat, setCat] = useState("সব");
  const [sel, setSel] = useState<number | null>(null);
  const cats = ["সব", "শোরুম", "ফ্যাক্টরি", "প্রোডাক্ট"];
  const ITEMS = bh.lang === "en" ? GALLERY_ITEMS_EN : GALLERY_ITEMS;
  const list = ITEMS.map((g, i) => ({ g, i })).filter(({ g }) => cat === "সব" || g[1] === (bh.lang === "en" ? GAL_CAT_EN[cat] : cat));
  return (
    <Page>
      <SectionTitle t={bh.tx("🖼️ গ্যালারি", "🖼️ Gallery")} sub={bh.tx("আমাদের গ্যালারি", "Our Gallery")} />
      <div className="mb-4 flex flex-wrap gap-2">
        {cats.map((c) => (
          <button key={c} onClick={() => setCat(c)} className={`rounded-full px-4 py-2 text-xs font-black transition ${cat === c ? "bg-sky-600 text-white shadow" : "bg-white text-slate-600 ring-1 ring-slate-200"}`}>{bh.tx(c, GAL_CAT_EN[c] ?? c)}</button>
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
            <img src={IMG(ITEMS[sel][0])} alt={ITEMS[sel][2]} className="max-h-[70vh] w-full object-cover" />
            <div className="flex items-center justify-between p-4">
              <p className={`font-black ${htx}`}>{ITEMS[sel][2]}</p>
              <button onClick={() => setSel(null)} className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-black text-slate-700">{bh.tx("✕ বন্ধ করুন", "✕ Close")}</button>
            </div>
          </div>
        </div>
      )}
    </Page>
  );
}

export function BhBlog() {
  const { base } = useDemo();
  const bh = useBh();
  return (
    <Page>
      <SectionTitle t={bh.tx("📰 নিউজ ও ইনসাইটস", "📰 News & Insights")} sub={bh.tx("শিল্পের সর্বশেষ খবর ও বিশ্লেষণ", "News & Insights")} />
      <div className="grid gap-4 md:grid-cols-3">
        {(bh.lang === "en" ? BLOG_POSTS_EN : BLOG_POSTS).map((b) => (
          <Link key={b.id} href={`${base}/blog/${b.id}`} className="group block overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_2px_18px_rgba(15,23,42,0.05)] transition hover:-translate-y-1 hover:shadow-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={IMG(b.img)} alt={b.t} className="h-44 w-full object-cover transition duration-500 group-hover:scale-105" />
            <div className="p-4">
              <p className="flex items-center gap-2 text-[11px] font-black"><span className="rounded-full bg-sky-50 px-2.5 py-1 text-sky-700 ring-1 ring-sky-100">{b.cat}</span><span className={sub}>{b.date} • {b.read}{bh.tx(" পড়া", "")}</span></p>
              <p className={`mt-2 font-black leading-snug ${htx}`}>{b.t}</p>
              <p className={`mt-1 line-clamp-2 text-sm ${sub}`}>{b.ex}</p>
              <p className="mt-3 text-xs font-black text-sky-600">{bh.tx("আরও পড়ুন →", "Read More →")}</p>
            </div>
          </Link>
        ))}
      </div>
    </Page>
  );
}

export function BhBlogDetail({ id }: { id: string }) {
  const { base } = useDemo();
  const bh = useBh();
  const b = (bh.lang === "en" ? BLOG_POSTS_EN : BLOG_POSTS).find((x) => x.id === id) ?? BLOG_POSTS.find((x) => x.id === id);
  if (!b) return <Page><Empty emoji="🔍" text={bh.tx("আর্টিকেলটি পাওয়া যায়নি", "Article not found")} /></Page>;
  return (
    <Page narrow>
      <Back href={`${base}/blog`} label={bh.tx("সব আর্টিকেল", "All Articles")} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={IMG(b.img)} alt={b.t} className="h-56 w-full rounded-3xl object-cover shadow-md sm:h-72" />
      <p className="mt-4 flex items-center gap-2 text-[11px] font-black"><span className="rounded-full bg-sky-50 px-2.5 py-1 text-sky-700 ring-1 ring-sky-100">{b.cat}</span><span className={sub}>{b.date} • {b.read}{bh.tx(" পড়া", "")}</span></p>
      <h1 className={`mt-2 text-2xl font-black leading-snug sm:text-3xl ${htx}`}>{b.t}</h1>
      <div className="mt-4 space-y-4">
        {b.body.map((para, i) => <p key={i} className="leading-relaxed text-slate-600">{para}</p>)}
      </div>
      <div className={`${card} mt-6 text-center`}>
        <p className={`font-black ${htx}`}>{bh.tx("আপনার সোর্সিং নিয়ে সাহায্য লাগবে?", "Need help with your sourcing?")}</p>
        <Link href={`${base}/rfq`} className="mt-3 inline-block rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-black text-white">{bh.tx("📩 ফ্রি কোটেশন নিন", "📩 Get a Free Quote")}</Link>
      </div>
    </Page>
  );
}

/* ---------------- RFQ ---------------- */

export function BhRfq() {
  const { def, base } = useDemo();
  const bh = useBh();
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
        <h1 className={`mt-3 text-2xl font-black ${htx}`}>{bh.tx("RFQ সফলভাবে গৃহীত হয়েছে!", "RFQ Received Successfully!")}</h1>
        <p className={`mt-2 ${sub}`}>{bh.tx("আপনার RFQ নম্বর:", "Your RFQ number:")} <b className="text-sky-600">{done}</b><br />{bh.tx("আমাদের মার্চেন্ডাইজিং টিম ৪৮ ঘণ্টার মধ্যে ফ্যাক্টরি-যাচাই করা কোটেশন পাঠাবে।", "Our merchandising team will send a factory-verified quotation within 48 hours.")}</p>
        <div className="mt-5 flex justify-center gap-3">
          <Link href={base} className="rounded-xl bg-slate-100 px-5 py-2.5 text-sm font-bold text-slate-700 ring-1 ring-slate-200">{bh.tx("🏠 হোমে যান", "🏠 Go Home")}</Link>
          <Link href={`${base}/products`} className="rounded-xl px-5 py-2.5 text-sm font-black text-white" style={{ background: def.accent }}>{bh.tx("👕 প্রোডাক্ট দেখুন", "👕 View Products")}</Link>
        </div>
      </div>
    </Page>
  );
  return (
    <Page narrow>
      <Back href={base} label={bh.tx("হোম", "Home")} />
      <SectionTitle t={bh.tx("📩 RFQ পাঠান", "📩 Send an RFQ")} sub={bh.tx("Request a Quote — ৪৮ ঘণ্টায় উত্তর", "Request a Quote — reply within 48 hours")} />
      <form onSubmit={submit} className={`${card} grid gap-3`}>
        <Field required placeholder={bh.tx("কোম্পানির নাম *", "Company name *")} value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
        <div className="grid gap-3 sm:grid-cols-2">
          <Field required placeholder={bh.tx("আপনার নাম *", "Your name *")} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Field required placeholder={bh.tx("ইমেইল / WhatsApp *", "Email / WhatsApp *")} value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field required placeholder={bh.tx("দেশ *", "Country *")} value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
          <select className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none" value={form.product} onChange={(e) => setForm({ ...form, product: e.target.value })}>
            {def.cats.filter((c) => c !== "সব").map((c) => <option key={c} value={c}>{bh.tx(`${c} প্রোডাক্ট`, `${CAT_EN[c] ?? c} Products`)}</option>)}
            <option value="অন্যান্য">{bh.tx("অন্যান্য", "Other")}</option>
          </select>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field required placeholder={bh.tx("পরিমাণ (পিস) *", "Quantity (pcs) *")} value={form.qty} onChange={(e) => setForm({ ...form, qty: e.target.value })} />
          <Field placeholder={bh.tx("টার্গেট প্রাইস (যদি থাকে)", "Target price (if any)")} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
        </div>
        <Area placeholder={bh.tx("প্রোডাক্টের বিবরণ, ফ্যাব্রিক, GSM, সাইজ রেশিও ইত্যাদি...", "Product details, fabric, GSM, size ratio, etc...")} value={form.msg} onChange={(e) => setForm({ ...form, msg: e.target.value })} />
        <Btn accent={def.accent}>{bh.tx("📨 RFQ সাবমিট করুন", "📨 Submit RFQ")}</Btn>
        <p className={`text-center text-xs ${sub}`}>{bh.tx("সাবমিট করলেই আমাদের টিম আপনার সাথে যোগাযোগ করবে — কোনো চার্জ নেই।", "Once submitted, our team will contact you — no charges apply.")}</p>
      </form>
    </Page>
  );
}

/* ---------------- ABOUT / CONTACT / AUTH ---------------- */

export function BhAbout() {
  const { def, base } = useDemo();
  const bh = useBh();
  return (
    <Page>
      <Back href={base} label={bh.tx("হোম", "Home")} />
      <div className="grid items-center gap-5 lg:grid-cols-2">
        <div className="relative overflow-hidden rounded-3xl shadow-md">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={IMG("factory-1.webp")} alt={bh.tx("আমাদের ফ্যাক্টরি নেটওয়ার্ক", "Our factory network")} className="h-64 w-full object-cover sm:h-80" />
          <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-[11px] font-black text-slate-700">{bh.tx("স্থাপিত ২০১৫ — ঢাকা, বাংলাদেশ", "Established 2015 — Dhaka, Bangladesh")}</span>
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-sky-600">{bh.tx("আমাদের সম্পর্কে", "About Us")}</p>
          <h1 className={`mt-1 text-3xl font-black leading-tight ${htx}`}>{bh.tx(def.name, EN_NAME)} — {bh.tx("আপনার বিশ্বস্ত সোর্সিং পার্টনার", "Your Trusted Sourcing Partner")}</h1>
          <p className={`mt-3 leading-relaxed ${sub}`}>
            {bh.tx("২০১৫ সাল থেকে আমরা বিশ্বের ৪০+ দেশের বায়ারদের বাংলাদেশের সেরা গার্মেন্টস ফ্যাক্টরিগুলোর সাথে যুক্ত করে আসছি। আমাদের দর্শন একটাই:", "Since 2015 we have been connecting buyers from 40+ countries with Bangladesh's finest garment factories. Our philosophy is simple:")} <b className="text-slate-700">It is our business to grow your business.</b>
          </p>
          <p className={`mt-2 leading-relaxed ${sub}`}>
            {bh.tx("৩৫ জনের মার্চেন্ডাইজার ও QC টিম, ১২০+ যাচাইকৃত ফ্যাক্টরি নেটওয়ার্ক আর সম্পূর্ণ ডিজিটাল রিপোর্টিং — প্রতিটি অর্ডার স্বচ্ছ ও নিয়ন্ত্রিত।", "A 35-member merchandiser and QC team, a network of 120+ verified factories and fully digital reporting — every order stays transparent and under control.")}
          </p>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            {(bh.lang === "en" ? [["10+", "Years of Experience"], ["35", "Team Members"], ["120+", "Factories"]] : [["১০+", "বছরের অভিজ্ঞতা"], ["৩৫", "জনের টিম"], ["১২০+", "ফ্যাক্টরি"]]).map(([v, t]) => (
              <div key={t} className="rounded-2xl bg-sky-50 px-2 py-3 ring-1 ring-sky-100"><p className="text-xl font-black text-sky-700">{v}</p><p className={`text-[11px] font-bold ${sub}`}>{t}</p></div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {(bh.lang === "en" ? [
            ["🎯", "Our Mission", "To put Bangladeshi garments on every retail shelf in the world — at the right quality and the right price."],
            ["👁️", "Our Vision", "To be South Asia's most trusted sourcing partner."],
            ["💎", "Our Values", "Transparency, commitment to quality, punctuality — no compromise on these three."],
          ] : [
          ["🎯", "আমাদের মিশন", "বাংলাদেশের গার্মেন্টসকে বিশ্বের প্রতিটি রিটেইল শেলফে পৌঁছে দেওয়া — সঠিক মানে, সঠিক দামে।"],
          ["👁️", "আমাদের ভিশন", "দক্ষিণ এশিয়ার সবচেয়ে বিশ্বস্ত সোর্সিং পার্টনার হওয়া।"],
          ["💎", "আমাদের মূল্যবোধ", "স্বচ্ছতা, মানের প্রতি অঙ্গীকার, সময়ানুবর্তিতা — এই তিনে কোনো আপস নয়।"],
        ]).map(([e, t, d]) => (
          <div key={t} className={`${card} text-center`}>
            <p className="text-4xl">{e}</p>
            <p className={`mt-2 font-black ${htx}`}>{t}</p>
            <p className={`mt-1 text-sm ${sub}`}>{d}</p>
          </div>
        ))}
      </div>
      <div className={`mt-5 rounded-3xl bg-gradient-to-br ${def.grad} p-6 text-center text-white`}>
        <p className="text-lg font-black">{bh.tx("আমাদের টিমের সাথে কথা বলুন", "Talk to Our Team")}</p>
        <Link href={`${base}/contact`} className="mt-3 inline-block rounded-xl bg-white px-5 py-2.5 text-sm font-black text-slate-900">{bh.tx("📞 যোগাযোগ করুন", "📞 Contact Us")}</Link>
      </div>
    </Page>
  );
}

export function BhContact() {
  const { def, base } = useDemo();
  const bh = useBh();
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", msg: "" });
  return (
    <Page>
      <Back href={base} label={bh.tx("হোম", "Home")} />
      <SectionTitle t={bh.tx("📞 যোগাযোগ", "📞 Contact")} sub={bh.tx("যোগাযোগ করুন — ২৪ ঘণ্টায় উত্তর", "Get in Touch — reply within 24 hours")} />
      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-3">
          {(bh.lang === "en" ? [
            ["📍", "Head Office", EN_ADDRESS],
            ["📞", "Phone / WhatsApp", def.contact],
            ["✉️", "Email", BH_EMAIL],
            ["🕘", "Office Hours", EN_HOURS],
          ] : [
            ["📍", "হেড অফিস", def.address],
            ["📞", "ফোন / WhatsApp", def.contact],
            ["✉️", "ইমেইল", BH_EMAIL],
            ["🕘", "অফিস সময়", "শনি–বৃহস্পতি, সকাল ৯টা – সন্ধ্যা ৬টা"],
          ]).map(([e, t, v]) => (
            <div key={t} className={`${card} flex gap-3`}>
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-xl ring-1 ring-sky-100">{e}</span>
              <span><b className={`block text-sm ${htx}`}>{t}</b><span className={`text-sm ${sub}`}>{bh.dg(v)}</span></span>
            </div>
          ))}
          <div className="overflow-hidden rounded-3xl shadow-md">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={IMG("hero.webp")} alt={bh.tx("শোরুম", "Showroom")} className="h-40 w-full object-cover" />
          </div>
        </div>
        <div className={card}>
          <p className={`font-black ${htx}`}>{bh.tx("💬 মেসেজ পাঠান", "💬 Send a Message")}</p>
          {sent ? (
            <p className="mt-3 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700 ring-1 ring-emerald-200">{bh.tx("✅ মেসেজ পাঠানো হয়েছে! শীঘ্রই উত্তর পাবেন।", "✅ Message sent! We will reply soon.")}</p>
          ) : (
            <form className="mt-3 grid gap-3" onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
              <Field required placeholder={bh.tx("আপনার নাম", "Your name")} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <Field required placeholder={bh.tx("ইমেইল / ফোন", "Email / Phone")} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <Area required placeholder={bh.tx("আপনার মেসেজ...", "Your message...")} value={form.msg} onChange={(e) => setForm({ ...form, msg: e.target.value })} />
              <Btn accent={def.accent}>{bh.tx("📨 পাঠান", "📨 Send")}</Btn>
            </form>
          )}
        </div>
      </div>
    </Page>
  );
}

const AUTH_ERR_EN: Record<string, string> = {
  "আপনার নাম লিখুন": "Please enter your name",
  "সঠিক ১১ সংখ্যার মোবাইল নম্বর দিন": "Please enter a valid 11-digit mobile number",
  "পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের দিন": "Password must be at least 4 characters",
  "এই নম্বরে ইতিমধ্যে অ্যাকাউন্ট আছে — লগইন করুন": "An account already exists for this number — please log in",
  "এই নম্বরে অ্যাকাউন্ট নেই — সাইন আপ করুন": "No account for this number — please sign up",
  "পাসওয়ার্ড ভুল হয়েছে": "Incorrect password",
};

function useAuth() {
  const { store } = useDemo();
  const bh = useBh();
  return store.user;
}

export function BhLogin() {
  const { def, base } = useDemo();
  const bh = useBh();
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
        <p className={`mt-1 text-center text-sm ${sub}`}>{bh.tx("বায়ার অ্যাকাউন্টে লগইন করুন", "Log in to your buyer account")}</p>
        <form onSubmit={go} className="mt-5 grid gap-3">
          <Field required type="tel" placeholder={bh.tx("মোবাইল নম্বর (01xxxxxxxxx)", "Mobile number (01xxxxxxxxx)")} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Field required type="password" placeholder={bh.tx("পাসওয়ার্ড", "Password")} value={form.pass} onChange={(e) => setForm({ ...form, pass: e.target.value })} />
          {err && <p className="rounded-xl bg-rose-50 px-3 py-2 text-xs font-bold text-rose-600 ring-1 ring-rose-200">{bh.tx(err, AUTH_ERR_EN[err] ?? err)}</p>}
          <Btn accent={def.accent}>{bh.tx("🔐 লগইন", "🔐 Log In")}</Btn>
        </form>
        <p className={`mt-4 text-center text-sm ${sub}`}>{bh.tx("অ্যাকাউন্ট নেই?", "No account?")} <Link href={`${base}/signup`} className="font-black text-sky-600">{bh.tx("সাইন আপ করুন", "Sign Up")}</Link></p>
      </div>
    </Page>
  );
}

export function BhSignup() {
  const { def, base } = useDemo();
  const bh = useBh();
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
        <h1 className={`mt-2 text-center text-2xl font-black ${htx}`}>{bh.tx("বায়ার অ্যাকাউন্ট খুলুন", "Create a Buyer Account")}</h1>
        <p className={`mt-1 text-center text-sm ${sub}`}>{bh.tx("RFQ ট্র্যাক করুন, কোটেশন পান এক জায়গায়", "Track RFQs and get quotations in one place")}</p>
        <form onSubmit={go} className="mt-5 grid gap-3">
          <Field required placeholder={bh.tx("আপনার নাম", "Your name")} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Field required type="tel" placeholder={bh.tx("মোবাইল নম্বর (01xxxxxxxxx)", "Mobile number (01xxxxxxxxx)")} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Field required type="password" placeholder={bh.tx("পাসওয়ার্ড", "Password")} value={form.pass} onChange={(e) => setForm({ ...form, pass: e.target.value })} />
          {err && <p className="rounded-xl bg-rose-50 px-3 py-2 text-xs font-bold text-rose-600 ring-1 ring-rose-200">{bh.tx(err, AUTH_ERR_EN[err] ?? err)}</p>}
          <Btn accent={def.accent}>{bh.tx("✅ অ্যাকাউন্ট খুলুন", "✅ Create Account")}</Btn>
        </form>
        <p className={`mt-4 text-center text-sm ${sub}`}>{bh.tx("ইতিমধ্যে অ্যাকাউন্ট আছে?", "Already have an account?")} <Link href={`${base}/login`} className="font-black text-sky-600">{bh.tx("লগইন করুন", "Log In")}</Link></p>
      </div>
    </Page>
  );
}

export function BhAccount() {
  const { def, base } = useDemo();
  const bh = useBh();
  const { store } = useDemo();
  const router = useRouter();
  const id = useAuth();
  const [rfqs, setRfqs] = useState<Rfq[]>([]);
  useEffect(() => { setRfqs(loadRfqs()); }, []);
  if (!id) return (
    <Page narrow>
      <div className={`${card} mt-8 text-center`}>
        <p className="text-5xl">🔒</p>
        <p className={`mt-2 font-black ${htx}`}>{bh.tx("আগে লগইন করুন", "Please log in first")}</p>
        <Link href={`${base}/login`} className="mt-3 inline-block rounded-xl px-5 py-2.5 text-sm font-black text-white" style={{ background: def.accent }}>{bh.tx("🔐 লগইন", "🔐 Log In")}</Link>
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
        <button onClick={() => { store.logout(); router.push(base); }} className="rounded-xl bg-white/15 px-4 py-2 text-xs font-black">{bh.tx("🚪 লগআউট", "🚪 Log Out")}</button>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3">
        {(bh.lang === "en" ? [["📩", bh.num(list.length), "Total RFQs"], ["⏳", bh.num(list.filter((r) => r.status === "নতুন").length), "New"], ["✅", bh.num(list.filter((r) => r.status === "কনফার্ম").length), "Confirmed Orders"]] : [["📩", bh.num(list.length), "মোট RFQ"], ["⏳", bh.num(list.filter((r) => r.status === "নতুন").length), "নতুন"], ["✅", bh.num(list.filter((r) => r.status === "কনফার্ম").length), "কনফার্ম অর্ডার"]]).map(([e, v, t]) => (
          <div key={t} className={`${card} text-center`}><p className="text-xl">{e}</p><p className="mt-1 text-xl font-black text-sky-700">{v}</p><p className={`text-[11px] font-bold ${sub}`}>{t}</p></div>
        ))}
      </div>
      <div className={`${card} mt-4`}>
        <div className="mb-3 flex items-center justify-between">
          <p className={`font-black ${htx}`}>{bh.tx("📩 আমার RFQ সমূহ", "📩 My RFQs")}</p>
          <Link href={`${base}/rfq`} className="rounded-lg px-3 py-1.5 text-xs font-black text-white" style={{ background: def.accent }}>{bh.tx("+ নতুন RFQ", "+ New RFQ")}</Link>
        </div>
        <div className="space-y-2">
          {list.map((r) => (
            <div key={r.id} className="flex flex-wrap items-center gap-2 rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-100">
              <b className="text-sky-700">{r.id}</b>
              <span className="text-sm font-bold text-slate-700">{bh.tx(r.product, PROD_NAME_EN[r.product] ?? CAT_EN[r.product] ?? r.product)}</span>
              <span className={`text-xs ${sub}`}>{bh.dg(r.qty)}</span>
              <span className="ml-auto rounded-full bg-sky-50 px-2.5 py-1 text-[11px] font-black text-sky-700 ring-1 ring-sky-100">{bh.tx(r.status, RFQ_STATUS_EN[r.status] ?? r.status)}</span>
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

const PO_STAGES_EN = ["Sample", "Production", "QC", "Shipment"];

const WORKERS_EN = [
  { n: "Rafikul Islam", sec: "Cutting", shift: "Morning", present: true, eff: 92 },
  { n: "Sharmin Akter", sec: "Sewing Line A", shift: "Morning", present: true, eff: 78 },
  { n: "Md. Sumon", sec: "Sewing Line B", shift: "Morning", present: true, eff: 70 },
  { n: "Nazma Begum", sec: "Quality (QC)", shift: "Morning", present: true, eff: 95 },
  { n: "Tanvir Hasan", sec: "Packing", shift: "Afternoon", present: false, eff: 44 },
  { n: "Rumana Parvin", sec: "Finishing", shift: "Morning", present: true, eff: 85 },
];

const MATERIALS_EN = [
  { n: "Cotton Fabric 160 GSM", t: "Fabric", stock: "12,400 metres", s: "In Stock", p: "—" },
  { n: "Denim 12 oz", t: "Fabric", stock: "3,200 metres", s: "Low", p: "PO-3448" },
  { n: "Polyester Thread", t: "Trims", stock: "850 cones", s: "In Stock", p: "—" },
  { n: "Metal Buttons 20L", t: "Trims", stock: "0 pcs", s: "Shortage", p: "PO-3451" },
  { n: "Poly Bags (Printed)", t: "Packaging", stock: "40,000 pcs", s: "In Stock", p: "—" },
  { n: "Cartons 7-ply", t: "Packaging", stock: "1,100 pcs", s: "Low", p: "PO-3456" },
];

const ACTIVITY_EN: [string, string, string][] = [
  ["10:45 AM", "Sewing machine #12 maintenance completed", "emerald"],
  ["11:00 AM", "Cotton fabric rolls replenished", "sky"],
  ["11:15 AM", "5 workers moved to Sewing Line A", "violet"],
  ["12:30 PM", "PO-3451 midline QC report uploaded", "amber"],
  ["01:10 PM", "New RFQ received — Nordic Wear AB", "rose"],
];

const RFQ_DATE_EN: Record<string, string> = { "আজ": "Today", "গতকাল": "Yesterday", "এখনই": "Just now" };

export function BuyingAdmin() {
  const { def, store } = useDemo();
  const bh = useBh();
  const [tab, setTab] = useState("overview");
  const [rfqs, setRfqs] = useState<Rfq[]>([]);
  const [pos, setPos] = useState<Po[]>(SEED_POS);
  const [prods, setProds] = useState(def.products);
  const [np, setNp] = useState({ n: "", p: "", c: def.cats[1] ?? "নিট" });
  const [settings, setSettings] = useState({ siteName: def.name, heroTitle: def.heroTitle, heroSub: def.heroSub });
  const [saved, setSaved] = useState(false);

  useEffect(() => { setRfqs(loadRfqs()); }, []);

  const navItems: [string, string, string][] = [
    ["overview", "⊞", bh.tx("ওভারভিউ", "Overview")],
    ["orders", "🧾", bh.tx("অর্ডার (PO)", "Orders (PO)")],
    ["rfq", "📩", `RFQ (${bh.num(rfqs.length)})`],
    ["products", "👕", bh.tx("প্রোডাক্ট", "Products")],
    ["workers", "👷", bh.tx("ওয়ার্কার", "Workers")],
    ["materials", "🧵", bh.tx("ম্যাটেরিয়াল", "Materials")],
    ["settings", "⚙️", bh.tx("সেটিংস", "Settings")],
  ];
  const stages = bh.lang === "en" ? PO_STAGES_EN : PO_STAGES;
  const rfqDate = (d: string) => bh.lang === "en" ? (RFQ_DATE_EN[d] ?? bh.dg(d).replace(" দিন আগে", " days ago")) : d;

  const rfStatusCls = (s: string) =>
    s === "নতুন" ? "bg-rose-50 text-rose-600 ring-rose-200" :
    s === "শিপড" ? "bg-emerald-50 text-emerald-700 ring-emerald-200" :
    s === "কনফার্ম" ? "bg-sky-50 text-sky-700 ring-sky-200" : "bg-amber-50 text-amber-700 ring-amber-200";

  const dayBars: [string, number][] = (bh.lang === "en" ? [["Sat", 780], ["Sun", 920], ["Mon", 850], ["Tue", 970], ["Wed", 900], ["Thu", 880], ["Fri", 420]] : [["শনি", 780], ["রবি", 920], ["সোম", 850], ["মঙ্গল", 970], ["বুধ", 900], ["বৃহঃ", 880], ["শুক্র", 420]]);

  return (
    <Page>
      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-[#f7f8fc] shadow-[0_18px_50px_rgba(15,23,42,0.10)] lg:flex">
        {/* sidebar */}
        <aside className="hidden w-56 shrink-0 flex-col border-r border-slate-200 bg-white p-4 lg:flex">
          <p className="flex items-center gap-2 px-2 text-lg font-black text-slate-900"><BhLogo size={34} />{bh.tx(def.name, EN_NAME).split(" ")[0]}<span className="text-sky-600">Sync</span></p>
          <p className="px-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">{bh.tx("অপারেশনস প্যানেল", "Operations Panel")}</p>
          <nav className="mt-5 space-y-1">
            {navItems.map(([k, e, t]) => (
              <button key={k} onClick={() => setTab(k)} className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-bold transition ${tab === k ? "bg-slate-900 text-white shadow" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"}`}>
                <span>{e}</span>{t}
              </button>
            ))}
          </nav>
          <div className="mt-auto flex items-center gap-2.5 rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-100">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-600 text-xs font-black text-white">{bh.tx("অ্যা", "A")}</span>
            <span className="min-w-0"><b className="block truncate text-xs text-slate-800">{bh.tx("অ্যাডমিন", "Admin")}</b><span className="block truncate text-[11px] text-slate-400">{bh.dg(def.contact)}</span></span>
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
                  <h1 className="text-xl font-black text-slate-900 sm:text-2xl">{bh.tx("হ্যালো, অ্যাডমিন 👋", "Hello, Admin 👋")}</h1>
                  <p className="text-sm text-slate-500">{bh.tx(def.name, EN_NAME)} — {bh.tx("আজকের প্রোডাকশন ও অর্ডার সামারি", "Today's production & order summary")}</p>
                </div>
                <button className="rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-black text-white shadow" onClick={() => alert(bh.tx("ডেমোতে রিপোর্ট ডাউনলোড সিমুলেটেড।", "Report download is simulated in this demo."))}>{bh.tx("⬇️ রিপোর্ট ডাউনলোড", "⬇️ Download Report")}</button>
              </div>

              {/* stat cards */}
              <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                <div className="rounded-3xl border border-violet-100 bg-violet-50/70 p-4">
                  <p className="text-[11px] font-black text-violet-500">{bh.tx("🎯 প্রোডাকশন টার্গেট", "🎯 Production Target")}</p>
                  <p className="mt-1 text-2xl font-black text-slate-900">{bh.num(900)}<span className="text-slate-400">/{bh.num(1200)}</span></p>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-white"><div className="h-full w-[75%] rounded-full bg-violet-500" /></div>
                  <p className="mt-1.5 text-[11px] font-bold text-slate-500">{bh.num(75)}% {bh.tx("সম্পন্ন", "completed")}</p>
                </div>
                <div className="rounded-3xl border border-amber-100 bg-amber-50/70 p-4">
                  <p className="text-[11px] font-black text-amber-500">{bh.tx("🧵 অ্যাক্টিভ লাইন / মেশিন", "🧵 Active Lines / Machines")}</p>
                  <p className="mt-1 text-2xl font-black text-slate-900">{bh.num(45)}<span className="text-slate-400">/{bh.num(50)}</span></p>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-white"><div className="h-full w-[90%] rounded-full bg-amber-500" /></div>
                  <p className="mt-1.5 text-[11px] font-bold text-slate-500">{bh.num(90)}% {bh.tx("অ্যাক্টিভ", "active")}</p>
                </div>
                <div className="rounded-3xl border border-sky-100 bg-sky-50/70 p-4">
                  <p className="text-[11px] font-black text-sky-500">{bh.tx("👷 ওয়ার্কার উপস্থিতি", "👷 Worker Attendance")}</p>
                  <p className="mt-1 text-2xl font-black text-slate-900">{bh.num(120)}<span className="text-slate-400">/{bh.num(150)}</span></p>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-white"><div className="h-full w-[80%] rounded-full bg-sky-500" /></div>
                  <p className="mt-1.5 text-[11px] font-bold text-slate-500">{bh.num(80)}% {bh.tx("উপস্থিত", "present")}</p>
                </div>
                <div className="rounded-3xl border border-emerald-100 bg-emerald-50/70 p-4">
                  <p className="text-[11px] font-black text-emerald-500">{bh.tx("📦 ম্যাটেরিয়াল ইনভেন্টরি", "📦 Material Inventory")}</p>
                  <p className="mt-1 text-2xl font-black text-slate-900">{bh.num(30)} <span className="text-base text-slate-400">{bh.tx("ধরন", "types")}</span></p>
                  <p className="mt-2 text-[11px] font-bold text-slate-500">{bh.tx("ঘাটতিতে:", "Shortage:")} <b className="text-rose-500">{bh.num(5)} {bh.tx("ধরন", "types")}</b> • {bh.tx("চলতি অর্ডার: ১টি পেন্ডিং", "Running orders: 1 pending")}</p>
                  <button onClick={() => setTab("materials")} className="mt-1 text-[11px] font-black text-sky-600">{bh.tx("বিস্তারিত →", "Details →")}</button>
                </div>
              </div>

              {/* production flow */}
              <div className="rounded-3xl border border-slate-200 bg-white p-4">
                <div className="mb-3 flex items-center justify-between"><p className="font-black text-slate-900">{bh.tx("🔄 প্রোডাকশন ফ্লো", "🔄 Production Flow")}</p><span className="text-[11px] font-bold text-slate-400">{bh.tx("লাইভ আপডেট", "Live Updates")}</span></div>
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                  {(bh.lang === "en" ? [["✂️", "Cutting", "Running smoothly", "bg-emerald-50 text-emerald-600 ring-emerald-200"], ["🧵", "Sewing", "Delayed", "bg-rose-50 text-rose-600 ring-rose-200"], ["🔍", "QC", "Running smoothly", "bg-emerald-50 text-emerald-600 ring-emerald-200"], ["📦", "Packing", "Waiting for materials", "bg-amber-50 text-amber-600 ring-amber-200"]] : [["✂️", "কাটিং", "ঠিকঠাক চলছে", "bg-emerald-50 text-emerald-600 ring-emerald-200"], ["🧵", "সুইং", "বিলম্বিত", "bg-rose-50 text-rose-600 ring-rose-200"], ["🔍", "QC", "ঠিকঠাক চলছে", "bg-emerald-50 text-emerald-600 ring-emerald-200"], ["📦", "প্যাকেজিং", "ম্যাটেরিয়ালের অপেক্ষায়", "bg-amber-50 text-amber-600 ring-amber-200"]]).map(([e, t, s, cls]) => (
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
                        <span className="text-xl font-black text-slate-900">{bh.num(80)}%</span>
                      </Ring>
                      <p className="mt-2 text-xs font-black text-slate-700">{bh.tx("দৈনিক প্রোডাকশন ট্রেন্ড", "Daily Production Trend")}</p>
                      <p className="text-[11px] text-slate-400">{bh.tx("গতকাল ১১০০ পিস • আজ ১২০০ পিস", "Yesterday 1,100 pcs • Today 1,200 pcs")}</p>
                    </div>
                    <div className="min-w-[220px] flex-1">
                      <p className="text-xs font-black text-slate-700">{bh.tx("📈 সাপ্তাহিক আউটপুট (পিস)", "📈 Weekly Output (pcs)")}</p>
                      <div className="mt-3 flex h-28 items-end gap-2.5">
                        {dayBars.map(([d, v]) => (
                          <div key={d} className="flex flex-1 flex-col items-center gap-1">
                            <span className="text-[10px] font-black text-slate-500">{bh.num(v)}</span>
                            <div className="w-full rounded-t-lg bg-gradient-to-t from-sky-600 to-sky-400 transition-all" style={{ height: `${(v / 1000) * 100}%` }} />
                            <span className="text-[10px] font-bold text-slate-400">{d}</span>
                          </div>
                        ))}
                      </div>
                      <p className="mt-2 text-[11px] text-slate-400">{bh.tx("⬇️ মেশিন ডাউনটাইম আজ:", "⬇️ Machine downtime today:")} <b className="text-slate-600">{bh.tx("১২ ঘণ্টা", "12 hours")}</b> {bh.tx("(মেইনটেন্যান্স সময়সূচি অনুযায়ী)", "(as per maintenance schedule)")}</p>
                    </div>
                  </div>
                  <div className="mt-4 border-t border-slate-100 pt-3">
                    <p className="mb-2 text-xs font-black text-slate-700">{bh.tx("⏱️ ওয়ার্কার এফিশিয়েন্সি", "⏱️ Worker Efficiency")}</p>
                    <div className="flex flex-wrap gap-5">
                      {(bh.lang === "en" ? [["Cutting", 80, "#0ea5e9"], ["Sewing", 70, "#f59e0b"], ["Quality", 90, "#10b981"], ["Packing", 40, "#f43f5e"]] : [["কাটিং", 80, "#0ea5e9"], ["সুইং", 70, "#f59e0b"], ["কোয়ালিটি", 90, "#10b981"], ["প্যাকেজিং", 40, "#f43f5e"]]).map(([t, pct, c]) => (
                        <div key={t as string} className="text-center">
                          <Ring pct={pct as number} size={64} stroke={7} color={c as string}>
                            <span className="text-[11px] font-black text-slate-800">{bh.num(pct as number)}%</span>
                          </Ring>
                          <p className="mt-1 text-[11px] font-bold text-slate-500">{t as string}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* activity */}
                <div className="rounded-3xl border border-slate-200 bg-white p-4">
                  <p className="font-black text-slate-900">{bh.tx("🕐 সাম্প্রতিক কার্যকলাপ", "🕐 Recent Activity")}</p>
                  <div className="mt-3 space-y-3">
                    {(bh.lang === "en" ? ACTIVITY_EN : ACTIVITY).map(([time, txt, c]) => (
                      <div key={txt} className="flex gap-2.5">
                        <span className={`h-fit shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-black ring-1 ${c === "emerald" ? "bg-emerald-50 text-emerald-600 ring-emerald-100" : c === "sky" ? "bg-sky-50 text-sky-600 ring-sky-100" : c === "violet" ? "bg-violet-50 text-violet-600 ring-violet-100" : c === "amber" ? "bg-amber-50 text-amber-600 ring-amber-100" : "bg-rose-50 text-rose-600 ring-rose-100"}`}>{time}</span>
                        <p className="text-xs leading-relaxed text-slate-600">{txt}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 border-t border-slate-100 pt-3">
                    <p className="mb-2 text-xs font-black text-slate-700">{bh.tx("📩 সর্বশেষ RFQ", "📩 Latest RFQs")}</p>
                    {rfqs.slice(0, 2).map((r) => (
                      <p key={r.id} className="mb-1.5 flex items-center gap-2 text-xs"><b className="text-sky-700">{r.id}</b><span className="truncate text-slate-600">{r.company} — {bh.tx(r.product, PROD_NAME_EN[r.product] ?? CAT_EN[r.product] ?? r.product)}</span><span className={`ml-auto shrink-0 rounded-full px-2 py-0.5 text-[10px] font-black ring-1 ${rfStatusCls(r.status)}`}>{bh.tx(r.status, RFQ_STATUS_EN[r.status] ?? r.status)}</span></p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === "orders" && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="flex-1 text-xl font-black text-slate-900">{bh.tx("🧾 অর্ডার ট্র্যাকার (PO)", "🧾 Order Tracker (PO)")}</h2>
                <span className="rounded-full bg-white px-3 py-1.5 text-xs font-black text-slate-600 ring-1 ring-slate-200">{bh.tx("মোট মূল্য", "Total Value")}: $436,000</span>
              </div>
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {(bh.lang === "en" ? [["📂", bh.num(pos.length), "Total POs"], ["🔄", bh.num(pos.filter((p) => p.stage < 3).length), "In Progress"], ["🚢", bh.num(pos.filter((p) => p.stage >= 3).length), "At Shipment Stage"], ["📄", "44/56", "Documents Done"]] : [["📂", bh.num(pos.length), "মোট PO"], ["🔄", bh.num(pos.filter((p) => p.stage < 3).length), "চলমান"], ["🚢", bh.num(pos.filter((p) => p.stage >= 3).length), "শিপমেন্ট পর্যায়ে"], ["📄", "৪৪/৫৬", "ডকুমেন্ট সম্পন্ন"]]).map(([e, v, t]) => (
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
                          <p className="font-black text-slate-900">{po.id} <span className="ml-1 text-xs font-bold text-slate-400">{bh.tx(po.country, COUNTRY_EN[po.country] ?? po.country)}</span></p>
                          <p className="truncate text-sm text-slate-500">{po.buyer} • {bh.tx(po.product, PROD_NAME_EN[po.product] ?? po.product)} • {bh.dg(po.qty)}</p>
                        </div>
                        <Ring pct={pct} size={58} stroke={6} color="#0284c7"><span className="text-[11px] font-black text-slate-800">{bh.num(pct)}%</span></Ring>
                        <div className="text-right">
                          <p className="font-black text-slate-900">{po.value}</p>
                          <p className="text-[11px] font-bold text-slate-400">📄 {bh.tx("ডকুমেন্ট", "Documents")} {bh.dg(po.docs)}</p>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center">
                        {stages.map((s, i) => (
                          <div key={s} className={`flex items-center ${i < PO_STAGES.length - 1 ? "flex-1" : ""}`}>
                            <div className="flex flex-col items-center gap-1">
                              <span className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-black ${i < po.stage ? "bg-emerald-500 text-white" : i === po.stage ? "bg-sky-600 text-white ring-4 ring-sky-100" : "bg-slate-100 text-slate-400"}`}>{i < po.stage ? "✓" : bh.num(i + 1)}</span>
                              <span className={`whitespace-nowrap text-[10px] font-bold ${i === po.stage ? "text-sky-700" : "text-slate-400"}`}>{s}</span>
                            </div>
                            {i < PO_STAGES.length - 1 && <div className={`mx-1.5 mb-4 h-1 flex-1 rounded-full ${i < po.stage ? "bg-emerald-400" : "bg-slate-100"}`} />}
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
                        <span className="text-xs font-bold text-slate-400">{bh.tx("স্টেজ বদলান:", "Change stage:")}</span>
                        <select value={po.stage} onChange={(e) => setPos(pos.map((x) => x.id === po.id ? { ...x, stage: Number(e.target.value) } : x))} className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700">
                          {stages.map((s, i) => <option key={s} value={i}>{s}</option>)}
                        </select>
                        {po.stage >= 3 && <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-black text-emerald-600 ring-1 ring-emerald-200">{bh.tx("🚢 শিপমেন্টে", "🚢 Shipping")}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {tab === "rfq" && (
            <div className="space-y-4">
              <h2 className="text-xl font-black text-slate-900">{bh.tx("📩 RFQ ম্যানেজমেন্ট", "📩 RFQ Management")}</h2>
              <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white">
                <table className="w-full min-w-[680px] text-left text-sm">
                  <thead><tr className="border-b border-slate-100 text-xs text-slate-400"><th className="px-4 py-3">RFQ</th><th className="px-4 py-3">{bh.tx("কোম্পানি", "Company")}</th><th className="px-4 py-3">{bh.tx("প্রোডাক্ট", "Product")}</th><th className="px-4 py-3">{bh.tx("পরিমাণ", "Quantity")}</th><th className="px-4 py-3">{bh.tx("কোটেড প্রাইস", "Quoted Price")}</th><th className="px-4 py-3">{bh.tx("স্ট্যাটাস", "Status")}</th></tr></thead>
                  <tbody>
                    {rfqs.map((r) => (
                      <tr key={r.id} className="border-b border-slate-50">
                        <td className="px-4 py-3"><b className="text-sky-700">{r.id}</b><br /><span className="text-xs text-slate-400">{rfqDate(r.date)}</span></td>
                        <td className="px-4 py-3"><b className="text-slate-800">{r.company}</b><br /><span className="text-xs text-slate-400">{bh.tx(r.country, COUNTRY_EN[r.country] ?? r.country)}</span></td>
                        <td className="px-4 py-3 text-slate-600">{bh.tx(r.product, PROD_NAME_EN[r.product] ?? CAT_EN[r.product] ?? r.product)}</td>
                        <td className="px-4 py-3 text-slate-600">{bh.dg(r.qty)}</td>
                        <td className="px-4 py-3 font-bold text-slate-800">{bh.dg(r.price)}</td>
                        <td className="px-4 py-3">
                          <select value={r.status} onChange={(e) => setRfqs(rfqs.map((x) => x.id === r.id ? { ...x, status: e.target.value } : x))} className={`rounded-full px-2 py-1 text-[11px] font-black ring-1 ${rfStatusCls(r.status)}`}>
                            {["নতুন", "কোটেশন পাঠানো হয়েছে", "স্যাম্পল চলছে", "কনফার্ম", "শিপড", "বাতিল"].map((st) => <option key={st} value={st}>{bh.tx(st, RFQ_STATUS_EN[st] ?? st)}</option>)}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-slate-400">{bh.tx("💡 ওয়েবসাইট থেকে আসা নতুন RFQ এই তালিকার শুরুতেই দেখা যায়।", "💡 New RFQs from the website appear at the top of this list.")}</p>
            </div>
          )}

          {tab === "products" && (
            <div className="space-y-4">
              <h2 className="text-xl font-black text-slate-900">{bh.tx("👕 প্রোডাক্ট ম্যানেজমেন্ট", "👕 Product Management")}</h2>
              <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
                <form className="h-fit rounded-3xl border border-slate-200 bg-white p-4" onSubmit={(e) => { e.preventDefault(); if (!np.n.trim()) return; setProds([{ id: `bp${Date.now()}`, n: np.n, c: np.c, p: Number(np.p) || 0, rating: 4.5, reviews: 0, stock: 500, desc: bh.tx("নতুন প্রোডাক্ট", "New product"), e: "👕" }, ...prods]); setNp({ n: "", p: "", c: def.cats[1] ?? "নিট" }); }}>
                  <p className="mb-3 font-black text-slate-800">{bh.tx("➕ নতুন প্রোডাক্ট", "➕ New Product")}</p>
                  <div className="grid gap-2.5">
                    <Field placeholder={bh.tx("প্রোডাক্টের নাম", "Product name")} value={np.n} onChange={(e) => setNp({ ...np, n: e.target.value })} />
                    <Field placeholder={bh.tx("FOB প্রাইস (টাকা)", "FOB price (BDT)")} value={np.p} onChange={(e) => setNp({ ...np, p: e.target.value })} />
                    <select className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-800" value={np.c} onChange={(e) => setNp({ ...np, c: e.target.value })}>
                      {def.cats.filter((c) => c !== "সব").map((c) => <option key={c}>{bh.tx(c, CAT_EN[c] ?? c)}</option>)}
                    </select>
                    <Btn accent={def.accent}>{bh.tx("যোগ করুন", "Add")}</Btn>
                  </div>
                </form>
                <div className="space-y-2">
                  {prods.map((p) => (
                    <div key={p.id} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3">
                      {p.img ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.img} alt={bh.tx(p.n, PROD_EN[p.id]?.n ?? p.n)} className="h-11 w-11 rounded-xl object-cover" />
                      ) : (
                        <span className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-xl ${def.grad}`}>{p.e}</span>
                      )}
                      <div className="min-w-0 flex-1"><p className="truncate font-bold text-slate-800">{bh.tx(p.n, PROD_EN[p.id]?.n ?? p.n)}</p><p className="text-xs text-slate-400">{bh.tx(p.c, CAT_EN[p.c] ?? p.c)} • FOB {bh.num(p.p)} {bh.tx("টাকা", "BDT")}</p></div>
                      <button onClick={() => setProds(prods.filter((x) => x.id !== p.id))} className="rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-black text-rose-500 ring-1 ring-rose-100">{bh.tx("মুছুন", "Delete")}</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === "workers" && (
            <div className="space-y-4">
              <h2 className="text-xl font-black text-slate-900">{bh.tx("👷 ওয়ার্কার ম্যানেজমেন্ট", "👷 Worker Management")}</h2>
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {(bh.lang === "en" ? [["👥", "150", "Total Workers"], ["✅", "120", "Present Today"], ["❌", "25", "Absent"], ["🌴", "5", "On Leave"]] : [["👥", "১৫০", "মোট ওয়ার্কার"], ["✅", "১২০", "আজ উপস্থিত"], ["❌", "২৫", "অনুপস্থিত"], ["🌴", "৫", "ছুটিতে"]]).map(([e, v, t]) => (
                  <div key={t} className="rounded-3xl border border-slate-200 bg-white p-4 text-center"><p className="text-xl">{e}</p><p className="mt-1 text-lg font-black text-slate-900">{v}</p><p className="text-[11px] font-bold text-slate-400">{t}</p></div>
                ))}
              </div>
              <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white">
                <table className="w-full min-w-[620px] text-left text-sm">
                  <thead><tr className="border-b border-slate-100 text-xs text-slate-400"><th className="px-4 py-3">{bh.tx("ওয়ার্কার", "Worker")}</th><th className="px-4 py-3">{bh.tx("সেকশন", "Section")}</th><th className="px-4 py-3">{bh.tx("শিফট", "Shift")}</th><th className="px-4 py-3">{bh.tx("উপস্থিতি", "Attendance")}</th><th className="px-4 py-3">{bh.tx("এফিশিয়েন্সি", "Efficiency")}</th></tr></thead>
                  <tbody>
                    {(bh.lang === "en" ? WORKERS_EN : WORKERS).map((w) => (
                      <tr key={w.n} className="border-b border-slate-50">
                        <td className="px-4 py-3"><span className="mr-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 text-[11px] font-black text-sky-700">{w.n.charAt(0)}</span><b className="text-slate-800">{w.n}</b></td>
                        <td className="px-4 py-3 text-slate-600">{w.sec}</td>
                        <td className="px-4 py-3 text-slate-600">{w.shift}</td>
                        <td className="px-4 py-3">{w.present ? <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-black text-emerald-600 ring-1 ring-emerald-200">{bh.tx("উপস্থিত", "Present")}</span> : <span className="rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-black text-rose-600 ring-1 ring-rose-200">{bh.tx("অনুপস্থিত", "Absent")}</span>}</td>
                        <td className="px-4 py-3"><div className="flex items-center gap-2"><div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-sky-500" style={{ width: `${w.eff}%` }} /></div><b className="text-slate-700">{bh.num(w.eff)}%</b></div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === "materials" && (
            <div className="space-y-4">
              <h2 className="text-xl font-black text-slate-900">{bh.tx("🧵 ম্যাটেরিয়াল ইনভেন্টরি", "🧵 Material Inventory")}</h2>
              <div className="rounded-3xl border border-rose-200 bg-rose-50 p-4">
                <p className="font-black text-rose-700">{bh.tx("⚠️ ঘাটতি সতর্কতা", "⚠️ Shortage Alert")}</p>
                <p className="mt-1 text-sm text-rose-600">{bh.tx("মেটাল বাটন ২০L শেষ — PO-3451 (London Apparel হুডি) এর জন্য জরুরি অর্ডার প্রয়োজন। ডেনিম ১২ oz-ও কমে এসেছে।", "Metal buttons 20L are out of stock — an urgent order is needed for PO-3451 (London Apparel hoodies). Denim 12 oz is also running low.")}</p>
              </div>
              <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white">
                <table className="w-full min-w-[620px] text-left text-sm">
                  <thead><tr className="border-b border-slate-100 text-xs text-slate-400"><th className="px-4 py-3">{bh.tx("ম্যাটেরিয়াল", "Material")}</th><th className="px-4 py-3">{bh.tx("ধরন", "Type")}</th><th className="px-4 py-3">{bh.tx("স্টক", "Stock")}</th><th className="px-4 py-3">{bh.tx("স্ট্যাটাস", "Status")}</th><th className="px-4 py-3">{bh.tx("পেন্ডিং অর্ডার", "Pending Order")}</th></tr></thead>
                  <tbody>
                    {(bh.lang === "en" ? MATERIALS_EN : MATERIALS).map((m) => (
                      <tr key={m.n} className="border-b border-slate-50">
                        <td className="px-4 py-3 font-bold text-slate-800">{m.n}</td>
                        <td className="px-4 py-3 text-slate-600">{m.t}</td>
                        <td className="px-4 py-3 text-slate-600">{m.stock}</td>
                        <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-[11px] font-black ring-1 ${m.s === "পর্যাপ্ত" || m.s === "In Stock" ? "bg-emerald-50 text-emerald-600 ring-emerald-200" : m.s === "কম" || m.s === "Low" ? "bg-amber-50 text-amber-600 ring-amber-200" : "bg-rose-50 text-rose-600 ring-rose-200"}`}>{m.s}</span></td>
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
              <h2 className="text-xl font-black text-slate-900">{bh.tx("⚙️ সাইট সেটিংস", "⚙️ Site Settings")}</h2>
              <div className="max-w-xl rounded-3xl border border-slate-200 bg-white p-5">
                <p className="font-black text-slate-800">🌐 {bh.tx("ওয়েবসাইটের ভাষা", "Website Language")}</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-400">{bh.tx("ডিফল্ট ভাষা ইংলিশ। বাংলা সিলেক্ট করলে পুরো ওয়েবসাইট ও অ্যাডমিন প্যানেল সম্পূর্ণ বাংলায় দেখাবে।", "English is the default language. Select Bangla to switch the entire website and admin panel to Bangla.")}</p>
                <div className="mt-3 flex gap-2">
                  <button type="button" onClick={() => bh.setLang("en")} className={`rounded-xl px-5 py-2.5 text-sm font-black transition ${bh.lang === "en" ? "bg-sky-600 text-white shadow" : "bg-slate-100 text-slate-600 ring-1 ring-slate-200"}`}>English</button>
                  <button type="button" onClick={() => bh.setLang("bn")} className={`rounded-xl px-5 py-2.5 text-sm font-black transition ${bh.lang === "bn" ? "bg-sky-600 text-white shadow" : "bg-slate-100 text-slate-600 ring-1 ring-slate-200"}`}>বাংলা</button>
                </div>
              </div>
              <form className="max-w-xl rounded-3xl border border-slate-200 bg-white p-5" onSubmit={(e) => { e.preventDefault(); store.saveCustom({ siteName: settings.siteName, heroTitle: settings.heroTitle, heroSub: settings.heroSub }); setSaved(true); setTimeout(() => setSaved(false), 2500); }}>
                <div className="grid gap-3">
                  <label className="text-xs font-bold text-slate-500">{bh.tx("সাইটের নাম", "Site Name")}<Field value={settings.siteName} onChange={(e) => setSettings({ ...settings, siteName: e.target.value })} /></label>
                  <label className="text-xs font-bold text-slate-500">{bh.tx("হিরো শিরোনাম", "Hero Title")}<Field value={settings.heroTitle} onChange={(e) => setSettings({ ...settings, heroTitle: e.target.value })} /></label>
                  <label className="text-xs font-bold text-slate-500">{bh.tx("হিরো সাব-টাইটেল", "Hero Subtitle")}<Area value={settings.heroSub} onChange={(e) => setSettings({ ...settings, heroSub: e.target.value })} /></label>
                  <Btn accent={def.accent}>{saved ? bh.tx("✅ সেভ হয়েছে!", "✅ Saved!") : bh.tx("💾 সেভ করুন", "💾 Save")}</Btn>
                </div>
              </form>
              <p className="max-w-xl text-xs leading-relaxed text-slate-400">{bh.tx("সেটিংস বদলালে পুরো সাইটে (নাম, হিরো টেক্সট) সাথে সাথে প্রতিফলিত হয়।", "Settings changes reflect across the whole site (name, hero text) immediately.")} {bh.tx("কন্টাক্ট তথ্য", "Contact")}: {bh.dg(def.contact)} • {BH_EMAIL}</p>
            </div>
          )}
        </div>
      </div>
    </Page>
  );
}
