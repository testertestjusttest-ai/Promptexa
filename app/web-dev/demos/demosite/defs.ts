/** DemoSite definitions for all demos — data-driven multi-page websites.
 * Engine demos (41) are converted automatically; the 10 hand-crafted demos
 * are defined manually below. Everything is demo content (browser-local).
 */

import { ENGINE_DEFS, type EngineItem } from "../engine-data";
import type { DemoGalleryItem, DemoNewsItem, DemoProduct, DemoServiceItem, DemoSiteDef, DemoTheme } from "./types";
import { DEMO_IMGS } from "./demo-img";

const CONTACT = "০১৮৩৩৪০২৫৮৬";
const ADDRESS = "বাড়ি ১২, রোড ৫, ধানমন্ডি, ঢাকা-১২০৫";
const HOURS = "প্রতিদিন সকাল ৯টা – রাত ১০টা";

const aboutFor = (name: string, type: string, desc: string) =>
  `${name} — ${type}। ${desc} আমরা প্রতিটি গ্রাহককে সেরা মান, সৎ দাম আর আন্তরিক সেবা দিতে প্রতিশ্রুতিবদ্ধ। আপনার আস্থাই আমাদের সবচেয়ে বড় অর্জন।`;

const DESCS = [
  (n: string, shop: string) => `${n} — ${shop}-এর বেস্টসেলার। যত্নে বাছাই করা মানসম্মত পণ্য, সারাদেশে হোম ডেলিভারি।`,
  (n: string) => `প্রিমিয়াম কোয়ালিটির ${n}। অরিজিনাল পণ্যের নিশ্চয়তা, সহজ রিটার্ন পলিসি।`,
  (n: string) => `${n} এখন অনলাইনে! স্টক সীমিত — আজই অর্ডার করুন, দ্রুত ডেলিভারি পান।`,
  (n: string) => `গ্রাহকদের সবচেয়ে পছন্দের ${n}। সেরা দামে, যত্নে প্যাকেজিং করে পৌঁছে যাবে আপনার দরজায়।`,
];

function enrichProducts(shopName: string, items: EngineItem[], priceNote?: string): DemoProduct[] {
  return items.map((it, i) => ({
    id: `p${i}`,
    n: it.n,
    p: it.p,
    e: it.e,
    c: it.c,
    desc: DESCS[i % DESCS.length](it.n, shopName),
    rating: 4 + ((i * 7 + it.n.length) % 10) / 10,
    reviews: 18 + ((i * 37) % 480),
    stock: 4 + ((i * 13) % 40),
    oldPrice: i % 3 === 0 ? Math.round(it.p * 1.25) : undefined,
    priceNote,
  }));
}

function toServices(items: EngineItem[]): DemoServiceItem[] {
  const durs = ["৩০ মিনিট", "৪৫ মিনিট", "১ ঘণ্টা", "২ ঘণ্টা", "সারাদিন"];
  return items.map((it, i) => ({
    id: `s${i}`,
    n: it.n,
    p: it.p,
    e: it.e,
    desc: `${it.n} — অভিজ্ঞ টিম, মানসম্মত সেবা। বুকিং করলেই নির্ধারিত সময়ে সেবা পৌঁছে যাবে।`,
    duration: durs[i % durs.length],
    rating: 4 + ((i * 5) % 10) / 10,
  }));
}

function toGallery(items: EngineItem[]): DemoGalleryItem[] {
  return items.map((it, i) => ({ id: `g${i}`, e: it.e, t: it.n, c: it.c === "সব" ? "গ্যালারি" : it.c }));
}

function baseDef(d: {
  slug: string; name: string; type: string; layout: DemoSiteDef["layout"];
  logoEmoji: string; accent: string; dark: boolean; grad: string;
  heroTitle: string; heroSub: string; heroEmoji: string; cats: string[]; desc: string;
  priceNote?: string;
}): Omit<DemoSiteDef, "products" | "services" | "gallery" | "news"> {
  return {
    ...d,
    about: aboutFor(d.name, d.type, d.desc),
    contact: CONTACT,
    address: ADDRESS,
    hours: HOURS,
  };
}

/* ================= 41 engine demos → auto ================= */

const ENGINE_CONVERTED: DemoSiteDef[] = ENGINE_DEFS.map((d) => {
  const b = baseDef({
    slug: d.slug, name: d.name, type: d.type, layout: d.layout,
    logoEmoji: d.heroEmoji, accent: d.accent, dark: true, grad: d.grad,
    heroTitle: d.heroTitle, heroSub: d.heroSub, heroEmoji: d.heroEmoji,
    cats: d.cats, desc: d.desc,
  });
  return {
    ...b,
    products: d.layout === "shop" || d.layout === "booking" ? enrichProducts(d.name, d.items) : [],
    services: d.layout === "service" ? toServices(d.items) : [],
    gallery: d.layout === "gallery" ? toGallery(d.items) : [],
    news: [],
  };
});

/* ================= 10 hand-crafted demos → manual ================= */

function hand(d: Parameters<typeof baseDef>[0] & {
  items?: EngineItem[];
  services?: { n: string; p: number; e: string; t: string }[];
  galleryItems?: { e: string; t: string }[];
  newsItems?: { t: string; e: string; c: string; time: string }[];
  priceNote?: string;
}): DemoSiteDef {
  const b = baseDef(d);
  return {
    ...b,
    products: d.items ? enrichProducts(d.name, d.items, d.priceNote) : [],
    services: (d.services ?? []).map((s, i) => ({
      id: `s${i}`, n: s.n, p: s.p, e: s.e,
      desc: `${s.n} — এক্সপার্ট টিমের যত্নে, প্রিমিয়াম মানের সেবা।`,
      duration: s.t, rating: 4.5 + ((i * 3) % 5) / 10,
    })),
    gallery: (d.galleryItems ?? []).map((g, i) => ({ id: `g${i}`, e: g.e, t: g.t, c: "গ্যালারি" })),
    news: (d.newsItems ?? []).map((n, i) => ({
      id: `a${i}`, t: n.t, e: n.e, c: n.c, time: n.time,
      body: `${n.t}\n\nএটি একটি ডেমো নিউজ আর্টিকেল। আপনার নিউজ পোর্টালে এখানে থাকবে পুরো খবর — বিস্তারিত প্রতিবেদন, ছবি, ভিডিও, সাংবাদিকের নাম ও প্রকাশের সময়।\n\nপাঠকরা খবরটি পড়ে শেয়ার করতে পারবেন, বুকমার্ক করতে পারবেন, মন্তব্য করতে পারবেন। ক্যাটাগরি অনুযায়ী খবর ব্রাউজ করা যাবে, সার্চ করা যাবে।\n\nএকটি প্রফেশনাল নিউজ পোর্টালে যেসব ফিচার থাকে — ব্রেকিং নিউজ টিকার, ট্রেন্ডিং, মতামত বিভাগ, আর্কাইভ — সবই এই ডেমোতে দেখানো হয়েছে।`,
    })),
  };
}

const NEWS_CATS = ["সব", "জাতীয়", "খেলা", "প্রযুক্তি"];

const HAND_DEFS: DemoSiteDef[] = [
  hand({
    slug: "restaurant", name: "স্বাদের ঠিকানা", type: "রেস্টুরেন্ট ওয়েবসাইট", layout: "shop",
    logoEmoji: "🍔", accent: "#fb923c", dark: true, grad: "from-orange-600 via-red-600 to-amber-700",
    heroTitle: "ঘরেই পান রেস্টুরেন্টের স্বাদ", heroSub: "৩০ মিনিটে হোম ডেলিভারি", heroEmoji: "🍔",
    cats: ["সব", "পিজ্জা", "বার্গার", "ডেজার্ট"], desc: "মজাদার খাবার, দ্রুত ডেলিভারি — অনলাইনে অর্ডার করুন।",
    items: [
      { n: "চিকেন পিজ্জা", c: "পিজ্জা", p: 350, e: "🍕" }, { n: "বিফ বার্গার", c: "বার্গার", p: 220, e: "🍔" },
      { n: "চকলেট কেক", c: "ডেজার্ট", p: 450, e: "🍰" }, { n: "ভেজি পিজ্জা", c: "পিজ্জা", p: 300, e: "🍕" },
      { n: "চিজ বার্গার", c: "বার্গার", p: 250, e: "🍔" }, { n: "আইসক্রিম", c: "ডেজার্ট", p: 150, e: "🍨" },
    ],
  }),
  hand({
    slug: "fashion", name: "স্টাইল হাব", type: "ফ্যাশন ই-কমার্স", layout: "shop",
    logoEmoji: "👗", accent: "#db2777", dark: false, grad: "from-pink-600 to-fuchsia-600",
    heroTitle: "ঈদ কালেকশন ২০২৬", heroSub: "৫০% পর্যন্ত ছাড়!", heroEmoji: "👗",
    cats: ["সব", "শাড়ি", "পাঞ্জাবি", "জুতা"], desc: "ট্রেন্ডি পোশাক — সারাদেশে ক্যাশ অন ডেলিভারি।",
    items: [
      { n: "জামদানি শাড়ি", c: "শাড়ি", p: 2500, e: "🥻" }, { n: "সিল্ক শাড়ি", c: "শাড়ি", p: 1800, e: "👘" },
      { n: "কটন পাঞ্জাবি", c: "পাঞ্জাবি", p: 1200, e: "👔" }, { n: "স্লিম পাঞ্জাবি", c: "পাঞ্জাবি", p: 1500, e: "🤵" },
      { n: "স্নিকার্স", c: "জুতা", p: 2200, e: "👟" }, { n: "লোফার", c: "জুতা", p: 1900, e: "👞" },
    ],
  }),
  hand({
    slug: "gadget", name: "টেক জোন", type: "গ্যাজেট শপ", layout: "shop",
    logoEmoji: "🔌", accent: "#22d3ee", dark: true, grad: "from-cyan-600 to-blue-700",
    heroTitle: "লেটেস্ট গ্যাজেট", heroSub: "০% EMI • অফিসিয়াল ওয়ারেন্টি", heroEmoji: "🔌",
    cats: ["সব", "মোবাইল", "কম্পিউটার", "অ্যাকসেসরিজ"], desc: "অরিজিনাল গ্যাজেট — অফিসিয়াল ওয়ারেন্টিসহ।",
    items: [
      { n: "স্মার্টফোন X", c: "মোবাইল", p: 25990, e: "📱" }, { n: "ল্যাপটপ প্রো", c: "কম্পিউটার", p: 75990, e: "💻" },
      { n: "এয়ারবাডস", c: "অ্যাকসেসরিজ", p: 2990, e: "🎧" }, { n: "স্মার্টওয়াচ", c: "অ্যাকসেসরিজ", p: 8990, e: "⌚" },
      { n: "ট্যাবলেট", c: "মোবাইল", p: 18990, e: "📲" }, { n: "কিবোর্ড", c: "কম্পিউটার", p: 2500, e: "⌨️" },
    ],
  }),
  hand({
    slug: "portfolio", name: "লেন্স ও আলো", type: "ফটোগ্রাফার পোর্টফোলিও", layout: "gallery",
    logoEmoji: "📸", accent: "#e2e8f0", dark: true, grad: "from-slate-700 to-slate-900",
    heroTitle: "মুহূর্তগুলো ধরে রাখি", heroSub: "৫০০+ ইভেন্ট • ৪.৯ রেটিং", heroEmoji: "📸",
    cats: ["সব"], desc: "প্রফেশনাল ফটোগ্রাফি — বিয়ে, ইভেন্ট, পোর্ট্রেট।",
    galleryItems: [
      { e: "🌅", t: "সূর্যোদয় — কক্সবাজার" }, { e: "👰", t: "বিয়ে — ঢাকা" },
      { e: "🎭", t: "নাটক — শিল্পকলা" }, { e: "🏙️", t: "শহর — রাত" },
      { e: "🌊", t: "সাগর — সেন্টমার্টিন" }, { e: "🎪", t: "মেলা — গ্রাম" },
    ],
  }),
  hand({
    slug: "news", name: "খবর ২৪", type: "নিউজ পোর্টাল", layout: "news",
    logoEmoji: "📰", accent: "#ef4444", dark: false, grad: "from-red-600 to-rose-700",
    heroTitle: "সর্বশেষ খবর সবার আগে", heroSub: "২৪ ঘণ্টা লাইভ আপডেট", heroEmoji: "📰",
    cats: NEWS_CATS, desc: "নির্ভরযোগ্য সংবাদ — দ্রুত, নিরপেক্ষ।",
    newsItems: [
      { c: "খেলা", e: "🏏", t: "বাংলাদেশের ঐতিহাসিক জয়!", time: "২ ঘণ্টা আগে" },
      { c: "প্রযুক্তি", e: "💻", t: "নতুন প্রযুক্তি পার্ক উদ্বোধন", time: "৫ ঘণ্টা আগে" },
      { c: "জাতীয়", e: "🏛️", t: "পদ্মা সেতুতে নতুন রেকর্ড", time: "৮ ঘণ্টা আগে" },
      { c: "খেলা", e: "⚽", t: "ফুটবলে বাংলাদেশের জয়", time: "১০ ঘণ্টা আগে" },
      { c: "প্রযুক্তি", e: "📱", t: "৫জি সেবা সম্প্রসারণ", time: "১২ ঘণ্টা আগে" },
      { c: "জাতীয়", e: "🌾", t: "কৃষিতে নতুন সম্ভাবনা", time: "১৪ ঘণ্টা আগে" },
    ],
  }),
  hand({
    slug: "realestate", name: "স্বপ্ন নিবাস", type: "রিয়েল এস্টেট", layout: "booking",
    logoEmoji: "🏠", accent: "#f59e0b", dark: false, grad: "from-blue-700 to-indigo-900",
    heroTitle: "স্বপ্নের ঠিকানা", heroSub: "যাচাইকৃত প্রপার্টি • সহজ কিস্তি", heroEmoji: "🏠",
    cats: ["সব"], desc: "বিশ্বস্ত প্রপার্টি — ভিজিট বুক করে দেখুন।", priceNote: "লাখ",
    items: [
      { n: "গুলশান লাক্সারি ফ্ল্যাট", c: "ফ্ল্যাট", p: 185, e: "🏢" },
      { n: "উত্তরা ডুপ্লেক্স", c: "ডুপ্লেক্স", p: 95, e: "🏡" },
      { n: "মিরপুর ফ্যামিলি ফ্ল্যাট", c: "ফ্ল্যাট", p: 65, e: "🏠" },
      { n: "বনানী পেন্টহাউস", c: "পেন্টহাউস", p: 250, e: "🌆" },
    ],
  }),
  hand({
    slug: "gym", name: "পাওয়ার জিম", type: "জিম ও ফিটনেস", layout: "service",
    logoEmoji: "💪", accent: "#ef4444", dark: true, grad: "from-red-700 to-orange-900",
    heroTitle: "ফিট থাকুন, স্ট্রং থাকুন", heroSub: "সার্টিফাইড ট্রেইনার • আধুনিক ইকুইপমেন্ট", heroEmoji: "💪",
    cats: ["সব"], desc: "আপনার ফিটনেস যাত্রা শুরু হোক আজই।",
    services: [
      { n: "মাসিক মেম্বারশিপ", p: 1500, e: "🎫", t: "৩০ দিন" },
      { n: "৬ মাসের প্যাকেজ", p: 7000, e: "📅", t: "১৮০ দিন" },
      { n: "বাৎসরিক মেম্বারশিপ", p: 12000, e: "🏆", t: "৩৬৫ দিন" },
      { n: "পার্সোনাল ট্রেইনিং", p: 5000, e: "👨‍🏫", t: "১০ সেশন" },
    ],
  }),
  hand({
    slug: "travel", name: "ঘুরে আসি", type: "ট্রাভেল এজেন্সি", layout: "booking",
    logoEmoji: "✈️", accent: "#14b8a6", dark: false, grad: "from-teal-500 via-cyan-600 to-blue-700",
    heroTitle: "পৃথিবী ঘুরে দেখুন", heroSub: "কক্সবাজার থেকে মালদ্বীপ!", heroEmoji: "✈️",
    cats: ["সব"], desc: "সেরা ট্যুর প্যাকেজ — হোটেল, খাওয়া, গাইডসহ।", priceNote: "/জন",
    items: [
      { n: "কক্সবাজার প্যাকেজ", c: "ট্যুর", p: 9000, e: "🏖️" },
      { n: "সাজেক প্যাকেজ", c: "ট্যুর", p: 13000, e: "🏔️" },
      { n: "মালদ্বীপ প্যাকেজ", c: "ট্যুর", p: 85000, e: "🌊" },
      { n: "সুন্দরবন প্যাকেজ", c: "ট্যুর", p: 7500, e: "🌳" },
    ],
  }),
  hand({
    slug: "saas", name: "ক্লাউড সেবা", type: "টেক স্টার্টআপ (SaaS)", layout: "service",
    logoEmoji: "☁️", accent: "#818cf8", dark: true, grad: "from-indigo-600 to-purple-800",
    heroTitle: "ব্যবসা চালান অটোপাইলটে", heroSub: "৩০ দিন ফ্রি ট্রায়াল", heroEmoji: "☁️",
    cats: ["সব"], desc: "আপনার ব্যবসার জন্য স্মার্ট ক্লাউড সলিউশন।",
    services: [
      { n: "বেসিক প্ল্যান", p: 990, e: "📦", t: "প্রতি মাস" },
      { n: "প্রো প্ল্যান", p: 2990, e: "🚀", t: "প্রতি মাস" },
      { n: "এন্টারপ্রাইজ", p: 9990, e: "🏢", t: "প্রতি মাস" },
    ],
  }),
  hand({
    slug: "salon", name: "রূপচর্চা", type: "বিউটি পার্লার", layout: "service",
    logoEmoji: "💅", accent: "#f472b6", dark: false, grad: "from-rose-400 via-pink-500 to-fuchsia-600",
    heroTitle: "নিজেকে সাজান নতুন করে", heroSub: "এক্সপার্ট বিউটিশিয়ান • প্রিমিয়াম প্রোডাক্ট", heroEmoji: "💅",
    cats: ["সব"], desc: "রূপচর্চার সেরা ঠিকানা — বুকিং করুন অনলাইনে।",
    services: [
      { n: "হেয়ার কাট + স্পা", p: 800, e: "💇", t: "৪৫ মিনিট" },
      { n: "ব্রাইডাল ফেসিয়াল", p: 1500, e: "💆", t: "৯০ মিনিট" },
      { n: "ম্যানিকিউর + পেডিকিউর", p: 900, e: "💅", t: "৬০ মিনিট" },
      { n: "হেয়ার কালার", p: 2000, e: "🎨", t: "১২০ মিনিট" },
    ],
  }),
];

/* ================= 5 fintech demos (invest / exchange / wallet) ================= */

function fintech(d: Omit<DemoSiteDef, "products" | "services" | "gallery" | "news" | "about" | "contact" | "address" | "hours"> & { desc: string }): DemoSiteDef {
  const { desc, ...rest } = d;
  return {
    ...rest,
    products: [],
    services: [],
    gallery: [],
    news: [],
    about: aboutFor(d.name, d.type, desc),
    contact: CONTACT,
    address: ADDRESS,
    hours: HOURS,
  };
}

const FINTECH_DEFS: DemoSiteDef[] = [
  fintech({
    slug: "binancepro", name: "বাইন্যান্সপ্রো", type: "ক্রিপ্টো এক্সচেঞ্জ", layout: "crypto-exchange",
    logoEmoji: "🟡", accent: "#f0b90b", dark: true, grad: "from-yellow-600 to-amber-800",
    heroTitle: "ক্রিপ্টো ট্রেডিং এখন হাতের মুঠোয়", heroSub: "স্পট, ফিউচার্স, P2P — ৩৫০+ কয়েনে ট্রেড করুন সর্বনিম্ন ফিতে", heroEmoji: "₿",
    cats: ["সব"], desc: "বাইন্যান্স-স্টাইল প্রফেশনাল ক্রিপ্টো এক্সচেঞ্জ — ৬৬টি পেজের সম্পূর্ণ ডেমো।",
    theme: "aurora",
    coins: [
      { code: "BTC", name: "বিটকয়েন", price: 97400, change: 2.4, e: "₿" },
      { code: "ETH", name: "ইথেরিয়াম", price: 3420, change: 1.8, e: "Ξ" },
      { code: "BNB", name: "বিএনবি", price: 692, change: -0.8, e: "🟡" },
      { code: "SOL", name: "সোলানা", price: 214, change: 5.2, e: "◎" },
    ],
  }),
  fintech({
    slug: "investpro", name: "ইনভেস্টপ্রো", type: "বিনিয়োগ প্ল্যাটফর্ম", layout: "invest",
    logoEmoji: "📈", accent: "#10b981", dark: true, grad: "from-emerald-600 to-teal-800",
    heroTitle: "টাকা বাড়ান স্মার্ট বিনিয়োগে", heroSub: "মাসে ১২% পর্যন্ত মুনাফা • ৫০,০০০+ বিনিয়োগকারী", heroEmoji: "📈",
    cats: ["সব"], desc: "নিরাপদ ও লাভজনক বিনিয়োগ — ছোট থেকে বড় সব বাজেটের জন্য।",
    theme: "bold",
    investPlans: [
      { id: "starter", n: "স্টার্টার প্ল্যান", e: "🌱", min: 1000, max: 9999, roi: 8, dailyRoi: 0.27, duration: "৩০ দিন", desc: "নতুনদের জন্য — কম ঝুঁকিতে শুরু করুন।", tag: "জনপ্রিয়" },
      { id: "growth", n: "গ্রোথ প্ল্যান", e: "🚀", min: 10000, max: 99999, roi: 12, dailyRoi: 0.4, duration: "৬০ দিন", desc: "মাঝারি বাজেটে বেশি মুনাফা।", tag: "সেরা" },
      { id: "premium", n: "প্রিমিয়াম প্ল্যান", e: "💎", min: 100000, max: 1000000, roi: 18, dailyRoi: 0.6, duration: "৯০ দিন", desc: "বড় বিনিয়োগকারীদের জন্য সর্বোচ্চ রিটার্ন।" },
      { id: "flexi", n: "ফ্লেক্সি সেভিংস", e: "🪙", min: 500, max: 50000, roi: 5, dailyRoi: 0.17, duration: "যেকোনো সময়", desc: "যেকোনো সময় তুলুন — নমনীয় সঞ্চয়।" },
    ],
  }),
  fintech({
    slug: "agroinvest", name: "এগ্রোইনভেস্ট", type: "কৃষি বিনিয়োগ", layout: "invest",
    logoEmoji: "🌾", accent: "#84cc16", dark: false, grad: "from-lime-600 to-green-700",
    heroTitle: "কৃষিতে বিনিয়োগ, প্রকৃতির সাথে লাভ", heroSub: "ধান, মাছ, গবাদি — সরাসরি খামারে বিনিয়োগ", heroEmoji: "🌾",
    cats: ["সব"], desc: "কৃষি খামারে বিনিয়োগ করে প্রকৃত আয় করুন।",
    theme: "elegant",
    investPlans: [
      { id: "paddy", n: "ধান চাষ প্রকল্প", e: "🌾", min: 5000, max: 50000, roi: 15, dailyRoi: 0.42, duration: "৪ মাস", desc: "বোরো মৌসুমে ধান চাষে অংশীদার হোন।", tag: "সিজনাল" },
      { id: "fish", n: "মৎস্য খামার", e: "🐟", min: 10000, max: 200000, roi: 20, dailyRoi: 0.55, duration: "৬ মাস", desc: "পাঙ্গাশ ও তেলাপিয়া চাষ প্রকল্প।", tag: "জনপ্রিয়" },
      { id: "dairy", n: "ডেইরি ফার্ম", e: "🐄", min: 20000, max: 500000, roi: 22, dailyRoi: 0.61, duration: "১২ মাস", desc: "গাভী পালনে দীর্ঘমেয়াদি বিনিয়োগ।" },
    ],
  }),
  fintech({
    slug: "swiftex", name: "সুইফটএক্স", type: "কারেন্সি এক্সচেঞ্জ", layout: "exchange",
    logoEmoji: "💱", accent: "#3b82f6", dark: true, grad: "from-blue-600 to-indigo-800",
    heroTitle: "সব কারেন্সি, এক প্ল্যাটফর্মে", heroSub: "ডলার, ইউরো, ক্রিপ্টো — সেরা রেটে এক্সচেঞ্জ", heroEmoji: "💱",
    cats: ["সব"], desc: "দ্রুত ও নিরাপদ কারেন্সি এক্সচেঞ্জ — ৫ মিনিটে ডেলিভারি।",
    theme: "split",
    rates: [
      { code: "USD", name: "ইউএস ডলার", buy: 121.5, sell: 119.8, e: "💵", change: 0.3 },
      { code: "EUR", name: "ইউরো", buy: 131.2, sell: 129.4, e: "💶", change: -0.2 },
      { code: "GBP", name: "ব্রিটিশ পাউন্ড", buy: 153.8, sell: 151.5, e: "💷", change: 0.5 },
      { code: "BTC", name: "বিটকয়েন", buy: 8150000, sell: 7980000, e: "₿", change: 2.4 },
      { code: "ETH", name: "ইথেরিয়াম", buy: 385000, sell: 372000, e: "Ξ", change: 1.8 },
      { code: "USDT", name: "টিথার", buy: 122.0, sell: 120.5, e: "₮", change: 0.1 },
    ],
  }),
  fintech({
    slug: "payex", name: "পেএক্স", type: "মোবাইল ব্যাংকিং এক্সচেঞ্জ", layout: "exchange",
    logoEmoji: "📲", accent: "#f59e0b", dark: false, grad: "from-amber-500 to-orange-600",
    heroTitle: "বিকাশ ↔ নগদ ↔ রকেট", heroSub: "মোবাইল ব্যাংকিং ব্যালেন্স এক্সচেঞ্জ — ২% চার্জে", heroEmoji: "📲",
    cats: ["সব"], desc: "এক মোবাইল ব্যাংক থেকে আরেকটিতে টাকা পাঠান সহজে।",
    theme: "playful",
    rates: [
      { code: "BKASH", name: "বিকাশ", buy: 100, sell: 98, e: "🩷", change: 0 },
      { code: "NAGAD", name: "নগদ", buy: 100, sell: 98.2, e: "🧡", change: 0 },
      { code: "ROCKET", name: "রকেট", buy: 100, sell: 97.8, e: "💜", change: 0 },
      { code: "UPAY", name: "উপায়", buy: 100, sell: 98.1, e: "💚", change: 0 },
    ],
  }),
  fintech({
    slug: "cryptovault", name: "ক্রিপ্টোভল্ট", type: "ক্রিপ্টো ওয়ালেট", layout: "wallet",
    logoEmoji: "🔐", accent: "#8b5cf6", dark: true, grad: "from-violet-600 to-purple-800",
    heroTitle: "আপনার ক্রিপ্টো, সম্পূর্ণ নিরাপদ", heroSub: "বিটকয়েন, ইথেরিয়ামসহ ৫০+ কয়েন সাপোর্ট", heroEmoji: "🔐",
    cats: ["সব"], desc: "নিরাপদ ক্রিপ্টো ওয়ালেট — পাঠান, গ্রহণ করুন, ট্র্যাক করুন।",
    theme: "aurora",
    coins: [
      { code: "BTC", name: "বিটকয়েন", price: 67250, change: 2.4, e: "₿" },
      { code: "ETH", name: "ইথেরিয়াম", price: 3150, change: 1.8, e: "Ξ" },
      { code: "USDT", name: "টিথার", price: 1.0, change: 0.1, e: "₮" },
      { code: "BNB", name: "বিনান্স কয়েন", price: 585, change: -0.8, e: "🟡" },
    ],
  }),
  fintech({
    slug: "trustpay", name: "ট্রাস্টপে", type: "ট্রাস্ট ওয়ালেট স্টাইল", layout: "wallet",
    logoEmoji: "🛡️", accent: "#0ea5e9", dark: true, grad: "from-sky-600 to-blue-800",
    heroTitle: "সব কয়েন, এক ওয়ালেটে", heroSub: "সোয়াপ, স্টেকিং, DApp ব্রাউজার — সব এক অ্যাপে", heroEmoji: "🛡️",
    cats: ["সব"], desc: "ট্রাস্ট ওয়ালেট স্টাইলের মাল্টি-কয়েন ওয়ালেট — সোয়াপ ও স্টেকিংসহ।",
    theme: "minimal",
    coins: [
      { code: "BTC", name: "বিটকয়েন", price: 67250, change: 2.4, e: "₿" },
      { code: "ETH", name: "ইথেরিয়াম", price: 3150, change: 1.8, e: "Ξ" },
      { code: "USDT", name: "টিথার", price: 1.0, change: 0.1, e: "₮" },
      { code: "BNB", name: "বিনান্স কয়েন", price: 585, change: -0.8, e: "🟡" },
      { code: "SOL", name: "সোলানা", price: 142, change: 3.2, e: "◎" },
      { code: "TRX", name: "ট্রন", price: 0.12, change: 0.8, e: "🔺" },
    ],
  }),
  fintech({
    slug: "casinoplay", name: "ক্যাসিনোপ্লে", type: "ক্যাসিনো ও স্পোর্টস বেটিং", layout: "casino",
    logoEmoji: "🎰", accent: "#f5c518", dark: true, grad: "from-amber-600 to-yellow-800",
    heroTitle: "খেলুন, জিতুন, উপভোগ করুন", heroSub: "লাইভ স্পোর্টস বেটিং • ৫০০+ ক্যাসিনো গেম • তিন পাত্তি • ক্র্যাশ", heroEmoji: "🎰",
    cats: ["সব"], desc: "লাইভ ক্যাসিনো, স্পোর্টস বেটিং ও দেশি গেমের সেরা ডেমো প্ল্যাটফর্ম।",
    theme: "bold",
  }),
];

export const DEMO_DEFS: DemoSiteDef[] = [...HAND_DEFS, ...ENGINE_CONVERTED, ...FINTECH_DEFS];

/* Attach real photo assets (hero + category images) to every demo def. */
const THEMES: DemoTheme[] = ["aurora", "split", "minimal", "bold", "elegant", "playful"];
function themeForSlug(slug: string): DemoTheme {
  let h = 0;
  for (const ch of slug) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return THEMES[h % THEMES.length];
}
for (const d of DEMO_DEFS) {
  const im = DEMO_IMGS[d.slug];
  if (im) {
    d.heroImg = im.hero;
    d.catImgs = im.cats;
    for (const pr of d.products) {
      const u = im.cats[pr.c];
      if (u) pr.img = u;
    }
  }
  if (!d.theme) d.theme = themeForSlug(d.slug);
}

export function getDemoDef(slug: string): DemoSiteDef | undefined {
  return DEMO_DEFS.find((d) => d.slug === slug);
}
