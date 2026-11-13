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
    slug: "buyinghouse", name: "টেক্সব্রিজ সোর্সিং", type: "গার্মেন্টস বায়িং হাউস", layout: "buyinghouse",
    logoEmoji: "🧵", accent: "#0284c7", dark: false, grad: "from-sky-600 via-blue-700 to-indigo-900",
    heroTitle: "বাংলাদেশ থেকে বিশ্বমানের গার্মেন্টস সোর্সিং", heroSub: "১২০+ যাচাইকৃত ফ্যাক্টরি • ৪০+ দেশে রপ্তানি", heroEmoji: "🏭",
    cats: ["সব", "নিট", "ওভেন", "ডেনিম", "সোয়েটার"], desc: "আন্তর্জাতিক বায়ারদের জন্য এন্ড-টু-এন্ড গার্মেন্টস সোর্সিং — ফ্যাক্টরি থেকে শিপমেন্ট পর্যন্ত QCসহ।",
    items: [
      { n: "বেসিক টি-শার্ট", c: "নিট", p: 380, e: "👕" }, { n: "প্রিমিয়াম পোলো শার্ট", c: "নিট", p: 520, e: "👔" },
      { n: "হুডি", c: "নিট", p: 780, e: "🧥" }, { n: "কিডস সেট", c: "নিট", p: 420, e: "🧒" },
      { n: "ফরমাল শার্ট", c: "ওভেন", p: 640, e: "👔" }, { n: "ক্যাজুয়াল শার্ট", c: "ওভেন", p: 580, e: "👕" },
      { n: "স্লিম ফিট জিন্স", c: "ডেনিম", p: 950, e: "👖" }, { n: "ডেনিম জ্যাকেট", c: "ডেনিম", p: 1450, e: "🧥" },
      { n: "উল সোয়েটার", c: "সোয়েটার", p: 890, e: "🧶" }, { n: "কার্ডিগান", c: "সোয়েটার", p: 820, e: "🧥" },
    ],
    services: [
      { n: "সোর্সিং ও মার্চেন্ডাইজিং", p: 0, e: "🧭", t: "কন্টিনিউয়াস" }, { n: "প্রোডাক্ট ডেভেলপমেন্ট", p: 0, e: "✂️", t: "৭–১০ দিনে স্যাম্পল" },
      { n: "কোয়ালিটি কন্ট্রোল (QC)", p: 0, e: "🔍", t: "AQL 2.5 স্ট্যান্ডার্ড" }, { n: "প্রাইস নেগোসিয়েশন", p: 0, e: "💰", t: "গড়ে ৮–১২% সাশ্রয়" },
      { n: "কমপ্লায়েন্স ও অডিট সাপোর্ট", p: 0, e: "📋", t: "WRAP / BSCI / SEDEX" }, { n: "শিপমেন্ট ও লজিস্টিকস", p: 0, e: "🚢", t: "ডোর-টু-পোর্ট" },
    ],
  }),
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
  hand({
    slug: "nursery", name: "গ্রিনলিফ নার্সারি", type: "প্ল্যান্ট নার্সারি ও গার্ডেন শপ", layout: "shop",
    logoEmoji: "🌿", accent: "#16a34a", dark: false, grad: "from-green-600 via-emerald-700 to-teal-800",
    heroTitle: "বাসায় আনুন সবুজের ছোঁয়া", heroSub: "ইনডোর-আউটডোর গাছ • টব • যত্নের সবকিছু", heroEmoji: "🌿",
    cats: ["সব", "ইনডোর", "আউটডোর", "টব ও যত্ন"], desc: "সতেজ গাছ, টব আর গার্ডেনিং সরঞ্জাম — সারাদেশে হোম ডেলিভারি।",
    items: [
      { n: "মনস্টেরা", c: "ইনডোর", p: 850, e: "🪴" }, { n: "স্নেক প্ল্যান্ট", c: "ইনডোর", p: 450, e: "🌱" },
      { n: "মানি প্ল্যান্ট", c: "ইনডোর", p: 350, e: "🍃" }, { n: "গাঁদা ফুলের চারা", c: "আউটডোর", p: 120, e: "🌼" },
      { n: "জবা গাছ", c: "আউটডোর", p: 280, e: "🌺" }, { n: "গোলাপ চারা", c: "আউটডোর", p: 320, e: "🌹" },
      { n: "টেরাকোটা টব", c: "টব ও যত্ন", p: 380, e: "🏺" }, { n: "পটিং মিক্স (৫ কেজি)", c: "টব ও যত্ন", p: 450, e: "🪱" },
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

/* ================= AURELIA — luxury jewelry (hand-built, English) =================
 * Recreation of the Laravel AURELIA site (aurelia-jewelry.rf.gd) as a
 * dedicated "jewelry" layout with its own pages (jewelry-pages.tsx) and
 * photo route (/jw-img). Prices are USD, content is English — the def is
 * written out in full (not via hand()) to keep it faithful. */

const AURELIA_DEF: DemoSiteDef = {
  slug: "jewelry", name: "AURELIA", type: "লাক্সারি জুয়েলারি শপ", layout: "jewelry",
  logoEmoji: "💎", accent: "#c9a24b", dark: true, grad: "from-amber-500 via-yellow-600 to-amber-800",
  heroTitle: "Jewelry that outlives the moment it marks.",
  heroSub: "Hand-finished rings, necklaces and bespoke commissions — designed in our atelier, made to be inherited.",
  heroEmoji: "💎",
  cats: ["All", "Rings", "Necklaces", "Earrings", "Bracelets", "Bespoke"],
  products: [
    { id: "p0", n: "The Aurelia Solitaire", p: 2450, e: "💍", c: "Rings", img: "/jw-img/hero.webp", rating: 5.0, reviews: 214, stock: 3, desc: "Our signature piece: a brilliant-cut 1.2ct diamond cradled in hand-polished 18k gold. Cut for maximum fire, set for a lifetime." },
    { id: "p1", n: "Emerald Pendant Necklace", p: 1890, e: "📿", c: "Necklaces", img: "/jw-img/necklace.webp", rating: 4.9, reviews: 156, stock: 5, desc: "A deep-green Colombian emerald suspended from a fine 18k gold chain. Quietly dramatic, unmistakably Aurelia." },
    { id: "p2", n: "Cascade Diamond Earrings", p: 1275, e: "✨", c: "Earrings", img: "/jw-img/earrings.webp", rating: 4.9, reviews: 188, stock: 8, desc: "Hand-matched diamonds in a flowing cascade setting that catches light with every movement." },
    { id: "p3", n: "Heritage Gold Bangle", p: 980, e: "🪙", c: "Bracelets", img: "/jw-img/bracelet.webp", rating: 4.8, reviews: 97, stock: 6, desc: "A sculpted 18k gold bangle traced with pavé diamonds — an heirloom silhouette with a modern edge." },
    { id: "p4", n: "Sapphire Royale Ring", p: 3150, e: "💎", c: "Rings", img: "/jw-img/ring.webp", rating: 5.0, reviews: 132, stock: 2, desc: "A Ceylon sapphire flanked by twin diamonds in white gold. Royal colour, contemporary cut." },
    { id: "p5", n: "Bespoke Atelier Commission", p: 5000, e: "✦", c: "Bespoke", img: "/jw-img/craft.webp", rating: 5.0, reviews: 64, stock: 1, priceNote: "from", desc: "Your story, our bench. A one-of-one piece designed with our master jeweller from first sketch to final polish." },
  ],
  services: [],
  gallery: [],
  news: [],
  about: "Aurelia began in 1998 as a two-person workshop restoring antique pieces for London dealers. Today our atelier designs its own collections and bespoke commissions for clients in thirty countries — but every piece is still finished the way the first ones were: by hand, under the lamp, one at a time.",
  contact: "+44 20 7946 0000",
  address: "12 Hatton Garden, London EC1N 8JR",
  hours: "Mon – Sat · 10:00 AM – 6:00 PM",
  theme: "elegant",
};

/* ================= SPARKLECLEAN — home cleaning service (2026-10-25) =================
 * Modelled on the real Bangladeshi original Sheba.xyz "Clean My Home"
 * (Home Deep Cleaning, Home Light Cleaning, Office Cleaning, Kitchen Hood,
 * Pest Control, Tank Cleaning) — and built better within the engine:
 * transparent per-service pricing with durations and what's included,
 * category filtering (Deep Clean / Regular / Kitchen & Bath / Furniture /
 * Office), online booking, and a visitor-editable admin. All content is
 * English by default; no invented customer counts, reviews or ratings
 * beyond the demo's own per-service star display. */

const CLEANING_DEF: DemoSiteDef = {
  slug: "cleaning", name: "SparkleClean", type: "Home Cleaning Service", layout: "service",
  logoEmoji: "✨", accent: "#0ea5e9", dark: false, grad: "from-sky-500 via-cyan-600 to-teal-700",
  heroTitle: "A spotless home, without lifting a finger",
  heroSub: "Verified cleaners • All equipment included • Book in 2 minutes",
  heroEmoji: "✨",
  cats: ["All"],
  products: [],
  services: [
    { id: "s0", n: "Full Home Deep Cleaning", p: 3500, e: "🏠", c: "Deep Clean", duration: "3 hours", rating: 4.9, desc: "Every room, top to bottom: dusting, mopping, cobweb removal, fans, switchboards and windows. Our team brings all equipment and eco-friendly supplies." },
    { id: "s1", n: "Regular Home Cleaning", p: 1200, e: "🧹", c: "Regular", duration: "2 hours", rating: 4.8, desc: "Weekly or bi-weekly tidy-up: sweeping, mopping, dusting and a bathroom wipe-down that keeps your home fresh between deep cleans." },
    { id: "s2", n: "Kitchen Deep Clean", p: 1800, e: "🍳", c: "Kitchen & Bath", duration: "2 hours", rating: 4.9, desc: "Degreased stove and hood, scrubbed tiles and sink, cabinets cleaned inside and out. Food-safe cleaners only." },
    { id: "s3", n: "Bathroom Deep Clean", p: 900, e: "🚿", c: "Kitchen & Bath", duration: "1 hour", rating: 4.8, desc: "Descaled fittings, scrubbed tiles and grout, disinfected toilet and basin. Your bathroom smells fresh for days." },
    { id: "s4", n: "Sofa & Carpet Shampoo", p: 1500, e: "🛋️", c: "Furniture", duration: "2 hours", rating: 4.8, desc: "Deep-extraction shampoo for sofas, mattresses and carpets, with stain treatment included. Dries within a few hours." },
    { id: "s5", n: "Move-In / Move-Out Clean", p: 4500, e: "📦", c: "Deep Clean", duration: "4 hours", rating: 4.9, desc: "Empty-home deep clean before you move in or hand over the keys: walls, floors, fixtures and balconies." },
    { id: "s6", n: "Office Cleaning", p: 2500, e: "🏢", c: "Office", duration: "3 hours", rating: 4.7, desc: "Desks, floors, meeting rooms and washrooms cleaned before your team arrives. Daily, weekly or one-off plans." },
  ],
  gallery: [],
  news: [],
  about: "SparkleClean is a home cleaning service for busy households in Dhaka. Book online, pick your date and time slot, and a verified two-person team arrives with all the equipment and supplies — you pay after the work is done and checked. Every service has a fixed upfront price: no hourly surprises, no hidden charges.",
  contact: "01833402586",
  address: "House 12, Road 5, Dhanmondi, Dhaka 1205",
  hours: "Open daily, 8:00 AM – 8:00 PM",
  priceNote: "Prices in Tk. All equipment and supplies included.",
  theme: "minimal",
};

/* ================= PAINTPRO — home painting service (2026-10-26) =================
 * Modelled on the real Bangladeshi original Sheba.xyz "Painting Service"
 * (Painting & Renovation: Wall Pasting & Paint Job, Furniture Paint) — and
 * built better within the engine: transparent per-job pricing with durations
 * and what's included, category filtering (Interior / Exterior / Wood &
 * Finish / Protection), online booking, and a visitor-editable admin. All
 * content is English by default; no invented customer counts, reviews or
 * ratings beyond the demo's own per-service star display. */

const PAINTING_DEF: DemoSiteDef = {
  slug: "painting", name: "PaintPro", type: "Home Painting Service", layout: "service",
  logoEmoji: "🎨", accent: "#6d28d9", dark: false, grad: "from-violet-600 via-indigo-600 to-blue-700",
  heroTitle: "Fresh walls, zero hassle — painted in days, not weeks",
  heroSub: "Verified painters • Paint + labour included • Free colour consultation",
  heroEmoji: "🎨",
  cats: ["All"],
  products: [],
  services: [
    { id: "s0", n: "Full Home Painting (2-Bedroom)", p: 18000, e: "🏠", c: "Interior", duration: "3 days", rating: 4.9, desc: "Every wall, ceiling and trim in a 2-bedroom home: surface prep, primer and two coats of premium washable paint. Furniture covered and masked — you come back to a finished home." },
    { id: "s1", n: "Single Room Painting", p: 6500, e: "🛏️", c: "Interior", duration: "1 day", rating: 4.8, desc: "One room, fully refreshed: crack filling, primer and two coats in the colour of your choice. Perfect for a bedroom makeover or a rental refresh." },
    { id: "s2", n: "Designer Texture Wall", p: 4500, e: "✨", c: "Interior", duration: "1 day", rating: 4.9, desc: "One feature wall in a designer finish — metallic, stone, or geometric texture. Our colour consultant helps you pick a shade that suits your light." },
    { id: "s3", n: "Ceiling Painting", p: 3500, e: "⬜", c: "Interior", duration: "1 day", rating: 4.7, desc: "Stain-free, even ceilings: old stains sealed, two coats of bright white, clean edges where wall meets ceiling." },
    { id: "s4", n: "Wood & Furniture Polish", p: 5500, e: "🪑", c: "Wood & Finish", duration: "2 days", rating: 4.8, desc: "Doors, cabinets and wooden furniture sanded, sealed and polished to a rich finish — lacquer or hand-rubbed polish, your choice." },
    { id: "s5", n: "Exterior Wall Painting", p: 12000, e: "🏡", c: "Exterior", duration: "2 days", rating: 4.8, desc: "Weather-shield exterior paint for house fronts and boundary walls: pressure wash, crack repair, primer and two weatherproof coats." },
    { id: "s6", n: "Waterproofing & Damp Treatment", p: 8000, e: "🛡️", c: "Protection", duration: "2 days", rating: 4.9, desc: "Damp patches treated at the source: waterproof coating for leak-prone walls and roofs, with a written treatment note on completion." },
  ],
  gallery: [],
  news: [],
  about: "PaintPro is a home painting service for busy households in Dhaka. Book online, pick your date, and a verified two-person painting team arrives with all paint, tools and covers — you pay after the work is done and checked. Every job has a fixed upfront price: no per-litre surprises, no hidden charges.",
  contact: "01833402586",
  address: "House 12, Road 5, Dhanmondi, Dhaka 1205",
  hours: "Open daily, 8:00 AM – 8:00 PM",
  priceNote: "Prices in Tk. Paint, primer and labour included.",
  theme: "minimal",
};

/* ================= PESTGUARD — pest control service (2026-10-27) =================
 * Modelled on the common Bangladeshi home-service pest-control offering
 * (general pest control, termite, mosquito, rodent and bed-bug treatments) —
 * and built better within the engine: transparent per-job pricing with
 * durations and what's included, category filtering (General / Kitchen /
 * Termite / Outdoor / Rodent), online booking, and a visitor-editable admin.
 * All content is English by default; no invented customer counts, reviews or
 * ratings beyond the demo's own per-service star display. */

const PESTCONTROL_DEF: DemoSiteDef = {
  slug: "pestcontrol", name: "PestGuard", type: "Pest Control Service", layout: "service",
  logoEmoji: "🛡️", accent: "#15803d", dark: false, grad: "from-emerald-600 via-green-600 to-lime-700",
  heroTitle: "Pests gone, home safe — treated in a day, not weeks",
  heroSub: "Licensed technicians • Child- & pet-safe products • Free inspection",
  heroEmoji: "🛡️",
  cats: ["All"],
  products: [],
  services: [
    { id: "s0", n: "General Pest Control (2-Bedroom Home)", p: 2500, e: "🏠", c: "General", duration: "2 hours", rating: 4.9, desc: "Whole-home spray for crawling insects: skirting boards, drains, kitchen corners and balconies treated with child- and pet-safe products. You return to a pest-free home the same day." },
    { id: "s1", n: "Cockroach Control (Kitchen)", p: 1500, e: "🪳", c: "Kitchen", duration: "1 hour", rating: 4.8, desc: "Gel-bait and crack-and-crevice treatment for kitchens: no smell, no need to empty every cabinet, and the treatment keeps working for weeks after the visit." },
    { id: "s2", n: "Termite Treatment", p: 6000, e: "🐜", c: "Termite", duration: "3 hours", rating: 4.9, desc: "Termite inspection plus soil and wood treatment for infested areas, with a written treatment note on completion and advice on keeping them away." },
    { id: "s3", n: "Mosquito Fogging & Larvicide", p: 1200, e: "🦟", c: "Outdoor", duration: "1 hour", rating: 4.7, desc: "Fogging for yards, balconies and stairwells plus larvicide for standing water — timed for the evening when mosquitoes are most active." },
    { id: "s4", n: "Rodent Control", p: 1800, e: "🐭", c: "Rodent", duration: "2 hours", rating: 4.8, desc: "Traps and sealed entry points for rats and mice: entry holes closed, droppings cleared, and a follow-up check booked before the technician leaves." },
    { id: "s5", n: "Bed Bug Treatment", p: 3500, e: "🛏️", c: "General", duration: "2 hours", rating: 4.8, desc: "Mattresses, bed frames and furniture treated in two passes, with a preparation checklist sent before the visit so one treatment is enough." },
    { id: "s6", n: "Office / Commercial Pest Control", p: 4500, e: "🏢", c: "General", duration: "3 hours", rating: 4.8, desc: "After-hours treatment for offices, shops and restaurants: scheduled outside working hours, with a service report for your records." },
  ],
  gallery: [],
  news: [],
  about: "PestGuard is a pest control service for busy households in Dhaka. Book online, pick your date, and a licensed two-person team arrives with all products and equipment — you pay after the work is done and checked. Every job has a fixed upfront price: no per-room surprises, no hidden charges.",
  contact: "01833402586",
  address: "House 12, Road 5, Dhanmondi, Dhaka 1205",
  hours: "Open daily, 8:00 AM – 8:00 PM",
  priceNote: "Prices in Tk. Inspection free; products included.",
  theme: "minimal",
};

/* ================= FIXPOINT — appliance repair service (2026-10-28) =================
 * Modelled on the real home-service appliance-repair offering (Urban Company /
 * Sheba-style: refrigerator, washing machine, AC, microwave, dishwasher and TV
 * repair with home visits, fixed labour charges and genuine parts) — and built
 * better within the engine: transparent per-job pricing with durations and
 * what's included, category filtering (Cooling / Laundry / Kitchen / Heating /
 * Electronics), free inspection, online booking, and a visitor-editable admin.
 * All content is English by default; no invented customer counts, reviews or
 * ratings beyond the demo's own per-service star display. */

const APPLIANCEREPAIR_DEF: DemoSiteDef = {
  slug: "appliancerepair", name: "FixPoint", type: "Appliance Repair Service", layout: "service",
  logoEmoji: "🔧", accent: "#0369a1", dark: false, grad: "from-sky-600 via-blue-600 to-indigo-700",
  heroTitle: "Broken appliance? Fixed today — at your home",
  heroSub: "Verified technicians • Genuine parts • Free inspection",
  heroEmoji: "🔧",
  cats: ["All"],
  products: [],
  services: [
    { id: "s0", n: "Refrigerator Repair", p: 1500, e: "🧊", c: "Cooling", duration: "2 hours", rating: 4.9, desc: "Not cooling, leaking or noisy fridge fixed at home: gas check, thermostat, compressor and door-seal diagnosis, with genuine parts quoted before any work starts." },
    { id: "s1", n: "Washing Machine Repair", p: 1200, e: "👕", c: "Laundry", duration: "2 hours", rating: 4.8, desc: "Drum, pump, drain and spin problems solved: the technician tests a full cycle before leaving, so you know it actually works." },
    { id: "s2", n: "AC Service & Repair", p: 2500, e: "❄️", c: "Cooling", duration: "2 hours", rating: 4.9, desc: "Split and window AC service, gas refill check and cooling repair: filters cleaned, outdoor unit inspected, and cooling tested on the spot." },
    { id: "s3", n: "Microwave Oven Repair", p: 1000, e: "🍲", c: "Kitchen", duration: "1 hour", rating: 4.7, desc: "Not heating, sparking or dead display: magnetron, door switch and control-board faults diagnosed, with a heating test before the visit ends." },
    { id: "s4", n: "Dishwasher Repair", p: 1500, e: "🍽️", c: "Kitchen", duration: "2 hours", rating: 4.8, desc: "Leaking, not draining or not cleaning: pump, hose and spray-arm faults fixed, then a full wash cycle run to prove the repair." },
    { id: "s5", n: "Water Heater / Geyser Repair", p: 1200, e: "🚿", c: "Heating", duration: "1 hour", rating: 4.8, desc: "No hot water, tripping or leaking geyser: heating element, thermostat and safety-valve check, with the tank tested at full heat." },
    { id: "s6", n: "LED TV Repair", p: 1800, e: "📺", c: "Electronics", duration: "2 hours", rating: 4.8, desc: "No picture, no sound or flickering screen: backlight, power-board and panel diagnosis at your home, with the set tested on live channels before sign-off." },
  ],
  gallery: [],
  news: [],
  about: "FixPoint is an appliance repair service for busy households in Dhaka. Book online, pick your date and time slot, and a verified technician arrives with tools and common parts — you pay after the repair is tested and working. Every job has a fixed upfront labour price: parts are quoted before fitting, no surprise charges.",
  contact: "01833402586",
  address: "House 12, Road 5, Dhanmondi, Dhaka 1205",
  hours: "Open daily, 8:00 AM – 8:00 PM",
  priceNote: "Prices in Tk. Inspection free; parts quoted before fitting.",
  theme: "minimal",
};


/* ================= MOVEMATE — packers & movers service (2026-10-29) =================
 * Modelled on the real home-service packers-and-movers offering (house and
 * office shifting, packing, furniture handling and intercity moves with a
 * crew + truck, fixed per-job prices) — and built better within the engine:
 * transparent per-job pricing with durations and what's included, category
 * filtering (Home / Office / Packing / Single Items / Long Distance / Labour),
 * online booking, and a visitor-editable admin.
 * All content is English by default; no invented customer counts, reviews or
 * ratings beyond the demo's own per-service star display. */

const MOVING_DEF: DemoSiteDef = {
  slug: "moving", name: "MoveMate", type: "Packers & Movers Service", layout: "service",
  logoEmoji: "📦", accent: "#ea580c", dark: false, grad: "from-amber-600 via-orange-600 to-red-700",
  heroTitle: "Moving day, without the stress — packed, moved, unpacked",
  heroSub: "Verified moving crew • Packing materials included • Careful handling",
  heroEmoji: "📦",
  cats: ["All"],
  products: [],
  services: [
    { id: "s0", n: "1-Bedroom Apartment Move", p: 7500, e: "🏠", c: "Home", duration: "4 hours", rating: 4.9, desc: "A full move for a 1-bedroom flat: packing, loading, transport across town, unloading and placing furniture in the right rooms — boxes, tape and wrapping included." },
    { id: "s1", n: "2-Bedroom House Move", p: 12000, e: "🏡", c: "Home", duration: "6 hours", rating: 4.9, desc: "House move with a bigger crew and truck: every room packed and labelled, furniture wrapped and reassembled, and the old place left clean and empty." },
    { id: "s2", n: "Office / Shop Move", p: 20000, e: "🏢", c: "Office", duration: "1 day", rating: 4.8, desc: "Office and shop shifting planned around your working hours: desks, computers and stock packed, labelled and set up at the new address, with a move plan agreed in advance." },
    { id: "s3", n: "Furniture & Appliance Move", p: 2500, e: "🛋️", c: "Single Items", duration: "2 hours", rating: 4.8, desc: "One heavy item, moved properly: sofa, bed, fridge or washing machine wrapped, carried by two people and placed exactly where you want it — no truck hire needed." },
    { id: "s4", n: "Packing-Only Service", p: 4500, e: "📦", c: "Packing", duration: "3 hours", rating: 4.9, desc: "You have the truck, we do the packing: fragile items wrapped, boxes labelled room by room, and an inventory list handed over before the crew leaves." },
    { id: "s5", n: "Intercity Move", p: 18000, e: "🚚", c: "Long Distance", duration: "1 day", rating: 4.8, desc: "City-to-city moving with a covered truck: loading, long-distance transport and unloading at the new home, with the arrival time confirmed before departure." },
    { id: "s6", n: "Loading & Unloading Labour", p: 3000, e: "💪", c: "Labour", duration: "2 hours", rating: 4.7, desc: "Extra hands when you need them: a two-person crew to load or unload your own truck, with trolleys and straps so heavy items move safely." },
  ],
  gallery: [],
  news: [],
  about: "MoveMate is a packers and movers service for busy households in Dhaka. Book online, pick your date, and a verified crew arrives with packing materials and a truck — you pay after everything is delivered and placed. Every job has a fixed upfront price: no per-box surprises, no hidden charges.",
  contact: "01833402586",
  address: "House 12, Road 5, Dhanmondi, Dhaka 1205",
  hours: "Open daily, 8:00 AM – 8:00 PM",
  priceNote: "Prices in Tk. Packing materials included; truck size confirmed before the move.",
  theme: "minimal",
};

/* ================= SAFENEST — home security & CCTV installation service (2026-10-30) =================
 * Modelled on the real home-security installer offering (camera kits, smart
 * locks, alarms, video doorbells and intercoms with professional fitting and
 * phone alerts) — and built better within the engine: transparent per-job
 * pricing with durations and what's included, category filtering (Cameras /
 * Smart Home / Security / Care / Planning), online booking, and a
 * visitor-editable admin.
 * All content is English by default; no invented customer counts, reviews or
 * ratings beyond the demo's own per-service star display. */

const SECURITY_DEF: DemoSiteDef = {
  slug: "security", name: "SafeNest", type: "Home Security Service", layout: "service",
  logoEmoji: "🛡️", accent: "#0f766e", dark: false, grad: "from-teal-600 via-emerald-600 to-slate-800",
  heroTitle: "Your home, watched over — day and night",
  heroSub: "Licensed installers • HD cameras • Alerts on your phone",
  heroEmoji: "🛡️",
  cats: ["All"],
  products: [],
  services: [
    { id: "s0", n: "CCTV Camera Kit (4 Cameras)", p: 15000, e: "📹", c: "Cameras", duration: "4 hours", rating: 4.9, desc: "Four HD cameras with night vision, a recorder and phone viewing: fitted, angled to cover every entrance, and tested with you before the installer leaves." },
    { id: "s1", n: "Smart Door Lock Installation", p: 8000, e: "🔐", c: "Smart Home", duration: "2 hours", rating: 4.8, desc: "Keypad or fingerprint lock fitted to your existing door: set codes for family members, get entry alerts on your phone, and keep a spare key as backup." },
    { id: "s2", n: "Video Doorbell Installation", p: 6500, e: "🔔", c: "Smart Home", duration: "1 hour", rating: 4.9, desc: "See and talk to visitors from your phone, anywhere: doorbell wired or battery-fitted, motion alerts set up, and the app configured on your phone." },
    { id: "s3", n: "Burglar Alarm System", p: 12000, e: "🚨", c: "Security", duration: "3 hours", rating: 4.8, desc: "Door and window sensors plus a loud siren and phone alerts: the system is armed and tested zone by zone, and everyone in the house is shown how to use it." },
    { id: "s4", n: "Video Intercom System", p: 9000, e: "📞", c: "Security", duration: "3 hours", rating: 4.7, desc: "Gate or door intercom with a video screen inside: buzz visitors in without going to the door, with indoor units fitted in the rooms you choose." },
    { id: "s5", n: "Annual Maintenance & Support", p: 4500, e: "🛠️", c: "Care", duration: "2 hours", rating: 4.9, desc: "A yearly visit that keeps everything working: cameras cleaned and re-angled, firmware updated, batteries replaced, and any fault fixed on the spot." },
    { id: "s6", n: "Security Survey & Consultation", p: 1500, e: "🔍", c: "Planning", duration: "1 hour", rating: 4.8, desc: "A walk-through of your home's weak points — entrances, blind spots, lighting — ending in a written plan with exact camera positions and a fixed quote." },
  ],
  gallery: [],
  news: [],
  about: "SafeNest is a home security installation service for households in Dhaka. Book online, pick your date, and a licensed installer fits your cameras, locks or alarm — you pay after everything is tested and working. Every job has a fixed upfront price: equipment and fitting quoted together, no surprise charges.",
  contact: "01833402586",
  address: "House 12, Road 5, Dhanmondi, Dhaka 1205",
  hours: "Open daily, 8:00 AM – 8:00 PM",
  priceNote: "Prices in Tk. Equipment + fitting included; 1-year installation warranty.",
  theme: "minimal",
};


/* ================= GREENSCAPE — gardening & landscaping service (2026-10-31) =================
 * Modelled on the real gardening-service offering (lawn mowing, hedge
 * trimming, planting, tree pruning, cleanups and garden design with fixed
 * per-job pricing) — and built better within the engine: transparent per-job
 * pricing with durations and what's included, category filtering (Lawn /
 * Trimming / Design / Trees / Watering / Care / Planting), online booking,
 * and a visitor-editable admin.
 * All content is English by default; no invented customer counts, reviews or
 * ratings beyond the demo's own per-service star display. */

const GARDENING_DEF: DemoSiteDef = {
  slug: "gardening", name: "GreenScape", type: "Gardening & Landscaping Service", layout: "service",
  logoEmoji: "🌿", accent: "#15803d", dark: false, grad: "from-green-600 via-emerald-600 to-lime-800",
  heroTitle: "Your garden, kept beautiful all year",
  heroSub: "Trained gardeners • Fixed prices • Green waste taken away",
  heroEmoji: "🌿",
  cats: ["All"],
  products: [],
  services: [
    { id: "s0", n: "Lawn Mowing & Edging", p: 1200, e: "🌱", c: "Lawn", duration: "1 hour", rating: 4.9, desc: "Mow, edge and blow: a crisp lawn edge, clippings bagged or mulched to your choice, and paths swept clean before the crew leaves." },
    { id: "s1", n: "Hedge Trimming", p: 2000, e: "✂️", c: "Trimming", duration: "2 hours", rating: 4.8, desc: "Hedges and shrubs shaped evenly and tidied to the height you choose: clippings collected and hauled away, no mess left behind." },
    { id: "s2", n: "Garden Design & Planting", p: 15000, e: "🌸", c: "Design", duration: "2 days", rating: 4.9, desc: "A full redesign for a tired garden: layout plan, new lawn or beds, and plants chosen for your sunlight and soil — quoted in writing before work starts." },
    { id: "s3", n: "Tree Pruning", p: 3500, e: "🌳", c: "Trees", duration: "3 hours", rating: 4.8, desc: "Dead and overgrown branches cut back safely, the tree's shape kept natural, and all branches chipped and removed from your garden." },
    { id: "s4", n: "Irrigation System Setup", p: 8000, e: "💧", c: "Watering", duration: "4 hours", rating: 4.7, desc: "Drip lines and sprinklers fitted to your beds and lawn, timer set for early mornings, and every zone tested with you before handover." },
    { id: "s5", n: "Seasonal Garden Cleanup", p: 4500, e: "🍂", c: "Care", duration: "3 hours", rating: 4.9, desc: "Leaves cleared, beds cut back, weeds pulled and paths washed: the once-a-season reset that leaves the garden ready for the months ahead." },
    { id: "s6", n: "Flower Bed Planting", p: 2500, e: "🌷", c: "Planting", duration: "2 hours", rating: 4.8, desc: "Beds weeded, soil enriched and planted with seasonal flowers: marigolds, roses and hibiscus arranged by colour and height, then watered in." },
  ],
  gallery: [],
  news: [],
  about: "GreenScape is a gardening and landscaping service for households in Dhaka. Book online, pick your date, and a trained crew mows, trims, plants or redesigns your garden — you pay after the work is checked and finished. Every job has a fixed upfront price: labour and green-waste removal quoted together, no surprise charges.",
  contact: "01833402586",
  address: "House 12, Road 5, Dhanmondi, Dhaka 1205",
  hours: "Open daily, 8:00 AM – 8:00 PM",
  priceNote: "Prices in Tk. Green-waste removal included; 30-day plant replacement guarantee.",
  theme: "minimal",
};

/* ================= SUNVOLT — solar panel installation service (2026-11-01) =================
 * Modelled on the real solar-installer offering (rooftop survey, home solar
 * kits by size, solar water heating, inverter/battery work and annual panel
 * care with fixed per-job pricing) — and built better within the engine:
 * transparent per-job pricing with durations and what's included, category
 * filtering (Survey / Home Systems / Water Heating / Power / Care), online
 * booking, and a visitor-editable admin.
 * All content is English by default; no invented customer counts, reviews or
 * ratings beyond the demo's own per-service star display. */

const SOLAR_DEF: DemoSiteDef = {
  slug: "solar", name: "SunVolt", type: "Solar Panel Installation Service", layout: "service",
  logoEmoji: "☀️", accent: "#d97706", dark: false, grad: "from-amber-500 via-yellow-500 to-orange-700",
  heroTitle: "Sunshine in, bills down — solar on your roof",
  heroSub: "Free rooftop survey • Fixed prices • Panels, inverter and battery in one visit",
  heroEmoji: "☀️",
  cats: ["All"],
  products: [],
  services: [
    { id: "s0", n: "Rooftop Solar Survey & Design", p: 1500, e: "📐", c: "Survey", duration: "2 hours", rating: 4.9, desc: "A technician measures your roof, checks shading through the day and sizes the system for your actual usage — you get a written plan and a fixed quote before any work starts." },
    { id: "s1", n: "1kW Home Solar System", p: 85000, e: "🏠", c: "Home Systems", duration: "1 day", rating: 4.8, desc: "A complete small-home kit: panels, inverter, wiring and safety switches, fitted and tested in a day — enough to run lights, fans and a TV from the sun." },
    { id: "s2", n: "3kW Home Solar System", p: 210000, e: "🏡", c: "Home Systems", duration: "2 days", rating: 4.9, desc: "The family-home standard: panels, inverter and battery backup sized for a fridge, fans, lights and daily appliances, with a monitoring app set up for you." },
    { id: "s3", n: "5kW Home Solar System", p: 320000, e: "🏘️", c: "Home Systems", duration: "3 days", rating: 4.9, desc: "A full-home system for larger households: more panels, a bigger inverter and battery bank, wired so essential loads keep running during a power cut." },
    { id: "s4", n: "Solar Water Heater Installation", p: 45000, e: "🚿", c: "Water Heating", duration: "4 hours", rating: 4.8, desc: "A rooftop solar water heater plumbed into your existing lines: hot water from the sun, with the electric backup wired and explained before handover." },
    { id: "s5", n: "Inverter & Battery Replacement", p: 12000, e: "🔋", c: "Power", duration: "2 hours", rating: 4.7, desc: "A tired inverter or battery swapped for a matched replacement: old unit removed, the new one wired, charged and load-tested with you watching." },
    { id: "s6", n: "Annual Panel Cleaning & Check", p: 4500, e: "🧽", c: "Care", duration: "2 hours", rating: 4.9, desc: "Panels washed, mounts and cables inspected, and output measured against the install day: a written health report, and any fault quoted before repair." },
  ],
  gallery: [],
  news: [],
  about: "SunVolt is a solar panel installation service for households and small businesses in Dhaka. Book online, get a free survey and a fixed written quote, and a trained crew installs panels, inverter and battery — you pay after the system is tested and running. Every job has a fixed upfront price: labour and standard parts quoted together, no surprise charges.",
  contact: "01833402586",
  address: "House 12, Road 5, Dhanmondi, Dhaka 1205",
  hours: "Open daily, 8:00 AM – 8:00 PM",
  priceNote: "Prices in Tk. Survey fee adjusted against any system order; 5-year workmanship warranty on installations.",
  theme: "minimal",
};

const LOCKSMITH_DEF: DemoSiteDef = {
  slug: "locksmith", name: "LockKey", type: "Locksmith & Key Service", layout: "service",
  logoEmoji: "🔑", accent: "#b45309", dark: false, grad: "from-amber-600 via-yellow-600 to-stone-800",
  heroTitle: "Locked out? Back inside fast — day or night",
  heroSub: "24/7 emergency call-out • Non-destructive entry • Fixed prices agreed before work starts",
  heroEmoji: "🔑",
  cats: ["All"],
  products: [],
  services: [
    { id: "s0", n: "Emergency Home Lockout", p: 1500, e: "🚪", c: "Emergency", duration: "30 minutes", rating: 4.9, desc: "Locked out of your home at any hour: a technician comes to you and opens the door without damage wherever possible — no drilling unless the lock itself is broken." },
    { id: "s1", n: "Lock Installation & Replacement", p: 2500, e: "🔒", c: "Locks", duration: "1 hour", rating: 4.8, desc: "New deadbolts, knob locks and padlocks fitted and aligned properly: old hardware removed, the new lock tested with you, and spare keys cut on the spot." },
    { id: "s2", n: "Key Cutting & Duplication", p: 300, e: "🔑", c: "Keys", duration: "15 minutes", rating: 4.9, desc: "Precise copies of house, office, padlock and cabinet keys cut while you wait — including high-security keys where the original card is presented." },
    { id: "s3", n: "Smart Lock Installation", p: 6500, e: "📱", c: "Smart", duration: "2 hours", rating: 4.8, desc: "Keypad, fingerprint or phone-controlled locks fitted to your door, codes and app set up with you, and every entry method tested before handover." },
    { id: "s4", n: "Car Key Cutting & Programming", p: 4500, e: "🚗", c: "Car Keys", duration: "1 hour", rating: 4.7, desc: "Replacement car keys cut and programmed at your location — no towing to a dealer. Lost keys deleted from the car where the system allows it." },
    { id: "s5", n: "Safe Installation & Opening", p: 5000, e: "🗄️", c: "Safes", duration: "2 hours", rating: 4.8, desc: "Home and office safes bolted in place, combination or digital locks set, and locked-out safes opened with the least damage the safe allows." },
    { id: "s6", n: "Rekeying & Master Key Systems", p: 1800, e: "🗝️", c: "Commercial", duration: "1 hour", rating: 4.9, desc: "One key for many doors, or old keys made useless after a move: cylinders re-pinned on site, new keys issued, and a written key record left with you." },
  ],
  gallery: [],
  news: [],
  about: "LockKey is a locksmith and key service for households and small businesses in Dhaka. Book online or call any time — a mobile technician comes to your door with cutting and programming equipment, so most jobs finish in a single visit. Every job has a fixed upfront price agreed before work starts: labour and standard parts quoted together, no surprise charges.",
  contact: "01833402586",
  address: "House 12, Road 5, Dhanmondi, Dhaka 1205",
  hours: "Open 24 hours, every day",
  priceNote: "Prices in Tk. Emergency call-out included in the lockout price; parts quoted before fitting.",
  theme: "minimal",
};

/* Modelled on real Bangladeshi couriers (inside-city parcels roughly
 * 60 Tk up to 500g, outside-Dhaka roughly 110–130 Tk, COD around 1%,
 * documents roughly 15–40 Tk) — and built better within the engine:
 * transparent per-service prices with weight, zone and delivery time,
 * category filtering (Parcel / Express / Documents / E-commerce /
 * Large / International), online booking, live-tracking framing, and
 * a visitor-editable admin. All content is English by default; no
 * invented customer counts or coverage claims beyond the demo's own
 * per-service star display. */

const COURIER_DEF: DemoSiteDef = {
  slug: "courier", name: "ParcelPro", type: "Courier & Parcel Delivery Service", layout: "service",
  logoEmoji: "📦", accent: "#0e7490", dark: false, grad: "from-cyan-600 via-sky-600 to-slate-800",
  heroTitle: "Parcels picked up, tracked, delivered — across the city and the country",
  heroSub: "Door-to-door pickup • Live tracking • Cash on delivery • Fixed prices by weight and zone",
  heroEmoji: "📦",
  cats: ["All"],
  products: [],
  services: [
    { id: "s0", n: "Same-City Parcel Delivery", p: 60, e: "📦", c: "Parcel", duration: "Same day", rating: 4.9, desc: "Door-to-door delivery inside the city for parcels up to 1 kg: pickup from your home or shop, live tracking from pickup to doorstep, and a photo proof of delivery." },
    { id: "s1", n: "Nationwide Parcel Delivery", p: 120, e: "🚚", c: "Parcel", duration: "2–3 days", rating: 4.8, desc: "Parcels up to 1 kg sent to any district: booked online, tracked at every hub, and delivered to the door — 20 Tk per extra kg, quoted before you book." },
    { id: "s2", n: "Express Same-Day Courier", p: 250, e: "⚡", c: "Express", duration: "Within 6 hours", rating: 4.9, desc: "Urgent parcels and documents across the city in hours, not days: a dedicated rider, priority handling, and delivery confirmed by phone and tracking." },
    { id: "s3", n: "Document & Envelope Delivery", p: 40, e: "✉️", c: "Documents", duration: "Next day", rating: 4.8, desc: "Letters, certificates, contracts and small envelopes delivered sealed and signed for: the receiver signs on delivery, and you get the confirmation the same day." },
    { id: "s4", n: "E-commerce COD Delivery", p: 90, e: "💵", c: "E-commerce", duration: "1–2 days", rating: 4.7, desc: "For online sellers: cash collected from the buyer on delivery, a 1% COD charge on the collected amount, and fast payout to your account after delivery." },
    { id: "s5", n: "Fragile & Large Parcel", p: 350, e: "🛡️", c: "Large", duration: "2–3 days", rating: 4.8, desc: "Glassware, electronics and parcels up to 10 kg: packed with protection, marked fragile at every hub, and handled separately from standard parcels." },
    { id: "s6", n: "International Document Express", p: 1500, e: "✈️", c: "International", duration: "3–5 days", rating: 4.7, desc: "Documents sent abroad by air express: customs forms filled with you, tracking across borders, and delivery confirmation from the destination courier." },
  ],
  gallery: [],
  news: [],
  about: "ParcelPro is a courier and parcel delivery service for households and online sellers in Dhaka. Book online or call — a rider picks up from your door, every parcel is tracked from pickup to delivery, and every service has a fixed upfront price agreed before booking: weight, zone and delivery time quoted together, no surprise charges.",
  contact: "01833402586",
  address: "House 12, Road 5, Dhanmondi, Dhaka 1205",
  hours: "Open daily, 9:00 AM – 10:00 PM",
  priceNote: "Prices in Tk per parcel up to 1 kg unless stated. COD charge 1% of the collected amount on e-commerce deliveries.",
  theme: "minimal",
};
/* Modelled on real photography studios (Kelxshot Studios, Sissel Studio,
 * WTL Photography Studio, Candid Studios, Jenya Johnston, Calla Esse) —
 * wedding collections with two photographers, preview galleries and album
 * options; portrait/headshot and family sessions by the hour with edited
 * photo counts; event coverage by the hour; engagement shoots; prints and
 * albums as add-ons; private online galleries and a booking deposit — and
 * built better within the engine: transparent per-service prices, online
 * booking, and a visitor-editable admin. All content is English by
 * default; no invented customer counts or coverage claims beyond the
 * demo's own per-service star display. */

const PHOTOGRAPHY_DEF: DemoSiteDef = {
  slug: "photography", name: "LensCraft", type: "Photography Studio", layout: "service",
  logoEmoji: "📷", accent: "#b45309", dark: false, grad: "from-amber-600 via-orange-600 to-stone-800",
  heroTitle: "Every moment, beautifully kept forever",
  heroSub: "Weddings • Portraits • Events • Family — edited photos, private gallery, albums & prints",
  heroEmoji: "📷",
  cats: ["All"],
  products: [],
  services: [
    { id: "s0", n: "Wedding Day Photography", p: 45000, e: "💍", c: "Wedding", duration: "Full day", rating: 4.9, desc: "Full-day coverage from getting ready to the last dance: two photographers, 500+ edited photos in a private online gallery, and a preview set within 2 days." },
    { id: "s1", n: "Engagement & Pre-Wedding Shoot", p: 8000, e: "💕", c: "Wedding", duration: "2 hours", rating: 4.9, desc: "A relaxed two-hour shoot at the location of your choice: one photographer, 40 edited photos, two outfits, and a private gallery to share with family." },
    { id: "s2", n: "Portrait & Headshot Session", p: 3500, e: "🧑", c: "Portrait", duration: "1 hour", rating: 4.8, desc: "Studio or outdoor portraits for work, profiles and portfolios: one hour, two outfits, 10 retouched photos, and a print-ready file with every image." },
    { id: "s3", n: "Family & Group Portraits", p: 5000, e: "👨‍👩‍👧", c: "Portrait", duration: "1 hour", rating: 4.8, desc: "Family groups of up to eight people, guided posing included: one hour at your home or outdoors, 15 edited photos, and a private gallery for the whole family." },
    { id: "s4", n: "Event & Party Coverage", p: 12000, e: "🎉", c: "Event", duration: "4 hours", rating: 4.7, desc: "Birthdays, corporate events and celebrations covered end to end: one photographer for four hours, 150+ edited photos, and a shareable online gallery." },
    { id: "s5", n: "Product & Food Photography", p: 6000, e: "🍽️", c: "Studio", duration: "Half day", rating: 4.8, desc: "Clean studio shots for shops, menus and catalogues: styled sets, 20 edited photos with white-background files, and a print-ready file with every image." },
    { id: "s6", n: "Wedding Album & Prints", p: 9500, e: "📖", c: "Studio", duration: "2 weeks", rating: 4.9, desc: "A 30-page premium lay-flat album designed from your wedding gallery, plus 20 fine-art prints: proofed with you before printing, delivered to your door." },
  ],
  gallery: [],
  news: [],
  about: "LensCraft is a photography studio in Dhaka for weddings, portraits, events and families. Book online or call — a photographer plans the shoot with you, every photo is professionally edited, and your images arrive in a private online gallery with prints and albums available: fixed prices agreed before booking, no surprise charges.",
  contact: "01833402586",
  address: "House 12, Road 5, Dhanmondi, Dhaka 1205",
  hours: "Open daily, 9:00 AM – 10:00 PM",
  priceNote: "Prices in Tk per session. 50% advance confirms your booking; edited photos delivered in a private online gallery within 7 days.",
  theme: "elegant",
};
/* ================= MOTORCARE — auto repair & car service (2026-11-07) =================
 * Modelled on the real auto-care chains (Firestone Complete Auto Care,
 * Meineke, Midas) — oil changes, brake inspection and repair, tire
 * rotation and balancing, wheel alignment, battery testing and
 * replacement, engine diagnostics, AC service, multi-point inspection —
 * and built better within the engine: transparent per-service prices with
 * durations and what's included, category filtering (Maintenance / Brakes /
 * Tires / Electrical / Diagnostics / Comfort), online booking, and a
 * visitor-editable admin. All content is English by default; no invented
 * customer counts or coverage claims beyond the demo's own per-service
 * star display. */

const AUTOREPAIR_DEF: DemoSiteDef = {
  slug: "autorepair", name: "MotorCare", type: "Auto Repair & Car Service", layout: "service",
  logoEmoji: "🚗", accent: "#b91c1c", dark: false, grad: "from-red-700 via-zinc-700 to-zinc-900",
  heroTitle: "Your car, fixed right — back on the road today",
  heroSub: "Oil change • Brakes • Tires • Diagnostics — genuine parts, fixed prices, same-day service",
  heroEmoji: "🚗",
  cats: ["All"],
  products: [],
  services: [
    { id: "s0", n: "Engine Oil & Filter Change", p: 2500, e: "🛢️", c: "Maintenance", duration: "45 minutes", rating: 4.9, desc: "Engine oil and filter replaced with the grade your car needs, plus a free multi-point check of fluids, belts, lights and tire pressure — done while you wait." },
    { id: "s1", n: "Brake Pad Replacement", p: 4500, e: "🛑", c: "Brakes", duration: "2 hours", rating: 4.8, desc: "Brake pads replaced per axle with rotors checked and a free brake inspection first: stopping power tested on the road with you before handover." },
    { id: "s2", n: "Tire Rotation & Balancing", p: 1200, e: "🛞", c: "Tires", duration: "1 hour", rating: 4.8, desc: "All four tires rotated and balanced for even wear and a smoother ride: tread and pressure checked, and the spare inspected while the car is up." },
    { id: "s3", n: "Wheel Alignment", p: 2000, e: "🎯", c: "Tires", duration: "1 hour", rating: 4.9, desc: "Four-wheel alignment on a laser aligner: steering centred, tire wear evened out, and a before-and-after printout handed to you with the keys." },
    { id: "s4", n: "Battery Check & Replacement", p: 6500, e: "🔋", c: "Electrical", duration: "45 minutes", rating: 4.8, desc: "Battery tested free, terminals cleaned, and a new battery fitted with the right rating for your car — old battery taken away, 1-year battery warranty included." },
    { id: "s5", n: "Engine Diagnostics", p: 1800, e: "🔍", c: "Diagnostics", duration: "1 hour", rating: 4.7, desc: "A full computer scan for warning lights, rough idling or poor mileage: the fault code explained in plain words, with a fixed repair quote before any work starts." },
    { id: "s6", n: "AC Service & Gas Refill", p: 3500, e: "❄️", c: "Comfort", duration: "2 hours", rating: 4.8, desc: "AC gas topped up or refilled, cabin filter replaced, and cooling tested vent by vent: leaks checked first, so the cold air stays cold all summer." },
  ],
  gallery: [],
  news: [],
  about: "MotorCare is a car repair and servicing workshop in Dhaka. Book online or call — a mechanic inspects your car, quotes a fixed price before any work starts, and fits genuine parts: every job has a fixed upfront price agreed before booking, no surprise charges.",
  contact: "01833402586",
  address: "House 12, Road 5, Dhanmondi, Dhaka 1205",
  hours: "Open daily, 8:00 AM – 8:00 PM",
  priceNote: "Prices in Tk. Genuine parts + labour included; 6-month service warranty on every job.",
  theme: "minimal",
};
const CATERING_DEF: DemoSiteDef = {
  slug: "catering", name: "FeastHouse", type: "Catering & Event Food Service", layout: "service",
  logoEmoji: "🍽️", accent: "#92400e", dark: false, grad: "from-amber-700 via-stone-700 to-stone-900",
  heroTitle: "Great food, beautifully served — for every celebration",
  heroSub: "Wedding buffets • Corporate lunches • Drop-off catering — fixed prices, tastings before you book, setup and service included",
  heroEmoji: "🍽️",
  cats: ["All"],
  products: [],
  services: [
    { id: "s0", n: "Wedding Buffet (100 Guests)", p: 85000, e: "💒", c: "Wedding", duration: "Full day", rating: 4.9, desc: "A full dinner buffet for up to 100 guests: hot and cold hors d'oeuvres, salads, two entrées, sides and a dessert table, with cake cutting included — plus an onsite chef and 1 server per 30 guests for a 4-hour event." },
    { id: "s1", n: "Corporate Lunch (50 Guests)", p: 25000, e: "🏢", c: "Corporate", duration: "2 hours", rating: 4.8, desc: "A hot buffet or boxed lunches for up to 50 people: salads, mains and drinks delivered hot, set up and cleared away — order by 5 PM the day before and lunch is ready on time." },
    { id: "s2", n: "Birthday Party Package", p: 12000, e: "🎂", c: "Party", duration: "3 hours", rating: 4.9, desc: "Food, cake table and drinks for up to 30 guests: a kid-friendly menu, themed table setup and a server on site, so the host enjoys the party instead of running it." },
    { id: "s3", n: "Drop-Off Catering", p: 8000, e: "📦", c: "Drop-off", duration: "1 hour", rating: 4.8, desc: "Hot food delivered in insulated boxes for up to 25 people — no staff, no setup: mains, rice, salad and drinks, ready to serve the moment it arrives." },
    { id: "s4", n: "Cocktail & Canapé Reception", p: 18000, e: "🥂", c: "Reception", duration: "3 hours", rating: 4.8, desc: "Passed canapés, a live carving station and a dessert table for up to 40 guests, with a bartender on request — the polished start to a wedding, launch or anniversary evening." },
    { id: "s5", n: "BBQ & Live Grill Station", p: 30000, e: "🔥", c: "Live station", duration: "4 hours", rating: 4.9, desc: "A live grill station for up to 60 guests: kebabs, grilled chicken and fish cooked to order in front of your guests, with salads, breads and sauces — the centrepiece of an outdoor party." },
    { id: "s6", n: "Dessert & Cake Table", p: 6500, e: "🍰", c: "Dessert", duration: "2 hours", rating: 4.8, desc: "A styled dessert table for up to 40 guests: cakes, pastries, fruit and sweets arranged to match your theme — including cutting and serving your own celebration cake." },
  ],
  gallery: [],
  news: [],
  about: "FeastHouse is a catering and event food service in Dhaka. Every event starts with a free tasting and a written quote: tell us the occasion, the guest count and the budget, and you get a fixed price listing exactly what is included — food, staffing, setup and breakdown — before you pay anything.",
  contact: "01833402586",
  address: "House 12, Road 5, Dhanmondi, Dhaka 1205",
  hours: "Open daily, 8:00 AM – 8:00 PM",
  priceNote: "Prices in Tk. Food, staffing, setup and breakdown included; final quote confirmed in writing before booking.",
  theme: "minimal",
};
const HOMECARE_DEF: DemoSiteDef = {
  slug: "homecare", name: "CareHaven", type: "Home Care & Senior Care Service", layout: "service",
  logoEmoji: "🏠", accent: "#0f766e", dark: false, grad: "from-teal-700 via-emerald-800 to-slate-900",
  heroTitle: "Care at home, with a kind hand — every day",
  heroSub: "Personal care • Companionship • Meal preparation • Medication reminders — trained caregivers, fixed prices, care plans made with your family",
  heroEmoji: "🏠",
  cats: ["All"],
  products: [],
  services: [
    { id: "s0", n: "Personal Care Visit", p: 1500, e: "🛁", c: "Personal care", duration: "2 hours", rating: 4.9, desc: "Help with bathing, dressing, grooming and getting up in the morning — a trained caregiver, the same familiar face whenever possible, at a time your family chooses." },
    { id: "s1", n: "Companionship & Conversation", p: 1000, e: "💬", c: "Companionship", duration: "2 hours", rating: 4.9, desc: "Friendly company at home: conversation, reading together, a walk around the block or a game of cards — so no day feels long or lonely." },
    { id: "s2", n: "Meal Preparation", p: 1200, e: "🍲", c: "Meals", duration: "2 hours", rating: 4.8, desc: "Groceries bought and fresh meals cooked to the diet the doctor ordered, served on time — with the kitchen left clean and the next meal planned." },
    { id: "s3", n: "Medication Reminders & Health Checks", p: 1800, e: "💊", c: "Health", duration: "1 hour", rating: 4.8, desc: "Medicines set out and reminded on schedule, blood pressure and sugar checked and written down — and the family told at once if anything looks off." },
    { id: "s4", n: "Mobility & Fall-Prevention Support", p: 2000, e: "🚶", c: "Mobility", duration: "2 hours", rating: 4.9, desc: "Safe help standing, walking and moving around the house: a steady arm, the right walker or wheelchair, and the home checked for trip hazards." },
    { id: "s5", n: "Dementia & Memory Care", p: 3500, e: "🧠", c: "Memory care", duration: "4 hours", rating: 4.9, desc: "Calm, patient care for memory loss: familiar routines kept, gentle reminders, and a caregiver trained to handle confusion without distress." },
    { id: "s6", n: "Respite Care (Full Day)", p: 4500, e: "🌿", c: "Respite", duration: "Full day", rating: 4.8, desc: "A full day of care while the family caregiver rests: personal care, meals, medication reminders and company, with a written note on how the day went." },
  ],
  gallery: [],
  news: [],
  about: "CareHaven is a home care service in Dhaka. Every family starts with a free care assessment at home: tell us what your loved one needs, and you get a written care plan listing exactly what is included — personal care, companionship, meals and medication reminders — before you pay anything.",
  contact: "01833402586",
  address: "House 12, Road 5, Dhanmondi, Dhaka 1205",
  hours: "Open daily, 8:00 AM – 8:00 PM",
  priceNote: "Prices in Tk. Caregiver, travel and care-plan review included; final quote confirmed in writing before booking.",
  theme: "minimal",
};
const ROOFING_DEF: DemoSiteDef = {
  slug: "roofing", name: "RoofGuard", type: "Roofing & Roof Repair Service", layout: "service",
  logoEmoji: "🏡", accent: "#7c2d12", dark: false, grad: "from-orange-800 via-stone-700 to-stone-900",
  heroTitle: "Leaks stopped, roofs rebuilt — rain or shine",
  heroSub: "Roof replacement • Leak repair • Gutters & skylights — free inspection, fixed prices, work guaranteed",
  heroEmoji: "🏡",
  cats: ["All"],
  products: [],
  services: [
    { id: "s0", n: "Roof Inspection & Leak Detection", p: 1500, e: "🔍", c: "Inspection", duration: "1 hour", rating: 4.9, desc: "A full roof check — shingles, flashing, gutters and attic — with photos of every problem found and a written report on what to fix first." },
    { id: "s1", n: "Leak Repair", p: 3500, e: "💧", c: "Repair", duration: "Half day", rating: 4.9, desc: "Leaks traced to the source and sealed: flashing resealed, cracked tiles replaced, pipe boots fixed — so the drip stops for good." },
    { id: "s2", n: "Shingle Repair & Replacement", p: 8000, e: "🧱", c: "Repair", duration: "1 day", rating: 4.8, desc: "Wind- or hail-damaged shingles replaced to match your roof: colour-matched, sealed and nailed to manufacturer spec." },
    { id: "s3", n: "Gutter Installation & Repair", p: 6500, e: "🌧️", c: "Gutters", duration: "1 day", rating: 4.8, desc: "Seamless gutters fitted or repaired, downpipes re-routed and guards added — rainwater flows away from your walls, not into them." },
    { id: "s4", n: "Skylight Installation & Repair", p: 12000, e: "☀️", c: "Skylight", duration: "1 day", rating: 4.8, desc: "A new skylight fitted with a watertight flashing kit, or a leaking one resealed — natural light in, rain kept out." },
    { id: "s5", n: "Waterproofing & Roof Coating", p: 15000, e: "🛡️", c: "Protection", duration: "2 days", rating: 4.9, desc: "A protective waterproof coating over the whole roof: stops damp at the source and adds years to the roof's life." },
    { id: "s6", n: "Full Roof Replacement", p: 120000, e: "🏠", c: "Replacement", duration: "3–5 days", rating: 4.9, desc: "The old roof stripped off and a new one built properly: decking, underlayment, flashing and ventilation, with a written warranty on the work." },
  ],
  gallery: [],
  news: [],
  about: "RoofGuard is a roofing and roof repair service in Dhaka. Every job starts with a free roof inspection: tell us the leak, the damage or the roof you want, and you get a fixed price listing exactly what is included — materials, labour and cleanup — before you pay anything.",
  contact: "01833402586",
  address: "House 12, Road 5, Dhanmondi, Dhaka 1205",
  hours: "Open daily, 8:00 AM – 8:00 PM",
  priceNote: "Prices in Tk. Materials, labour and cleanup included; final quote confirmed in writing before booking.",
  theme: "minimal",
};
const DRIVING_DEF: DemoSiteDef = {
  slug: "driving", name: "DriveReady", type: "Driving School & Lessons", layout: "service",
  logoEmoji: "🚗", accent: "#1d4ed8", dark: false, grad: "from-blue-800 via-slate-800 to-slate-900",
  heroTitle: "From first lesson to licence — drive with confidence",
  heroSub: "Beginner lessons • Intensive courses • Mock tests — patient instructors, dual-control cars, fixed prices, test-day car included",
  heroEmoji: "🚗",
  cats: ["All"],
  products: [],
  services: [
    { id: "s0", n: "First-Time Beginner Lesson", p: 1500, e: "🚗", c: "Lessons", duration: "2 hours", rating: 4.9, desc: "Your very first time behind the wheel: cockpit drill, moving off and stopping, steering and clutch control — a calm instructor beside you in a dual-control car, on quiet roads." },
    { id: "s1", n: "10-Lesson Beginner Package", p: 12000, e: "📚", c: "Packages", duration: "10 lessons", rating: 4.9, desc: "Ten structured lessons that take you from first drive to test standard: junctions, roundabouts, parking and dual carriageways, with a progress card after every lesson." },
    { id: "s2", n: "Intensive Course (2 Weeks)", p: 25000, e: "⚡", c: "Intensive", duration: "2 weeks", rating: 4.8, desc: "Learn to drive in two focused weeks: 4 hours a day, Monday to Friday, with your practical test booked at the end — the fastest route from beginner to licence." },
    { id: "s3", n: "Mock Driving Test", p: 2000, e: "📝", c: "Test prep", duration: "1 hour", rating: 4.9, desc: "A full dress rehearsal of the real test: the same routes, the same marking, a written report on every fault — so test day holds no surprises." },
    { id: "s4", n: "Refresher Course for Licence Holders", p: 5000, e: "🔄", c: "Refresher", duration: "5 lessons", rating: 4.8, desc: "Back behind the wheel after years away, or new to driving here: rebuild confidence, parking and motorway skills with a patient instructor at your pace." },
    { id: "s5", n: "Automatic Car Lessons", p: 3000, e: "⚙️", c: "Lessons", duration: "2 hours", rating: 4.9, desc: "Learn in an automatic: no gears, no clutch, no stalling — just steering, observation and road sense, in a modern automatic car." },
    { id: "s6", n: "Test-Day Car Hire", p: 4500, e: "🎓", c: "Test day", duration: "Half day", rating: 4.9, desc: "Take your test in our dual-control car: a warm-up lesson before the test, the car waiting at the test centre, and your instructor there to wish you luck." },
  ],
  gallery: [],
  news: [],
  about: "DriveReady is a driving school in Dhaka. Every learner starts with a free assessment lesson: tell us your experience, and you get a written plan listing exactly what is included — lessons, mock tests and test-day car — before you pay anything.",
  contact: "01833402586",
  address: "House 12, Road 5, Dhanmondi, Dhaka 1205",
  hours: "Open daily, 8:00 AM – 8:00 PM",
  priceNote: "Prices in Tk. Instructor, dual-control car and fuel included; test fees are paid to the licensing authority, not to us.",
  theme: "minimal",
};
const PETGROOMING_DEF: DemoSiteDef = {
  slug: "petgrooming", name: "PawSpa", type: "Pet Grooming & Spa Service", layout: "service",
  logoEmoji: "🐾", accent: "#0f766e", dark: false, grad: "from-teal-800 via-stone-700 to-stone-900",
  heroTitle: "A fresh, happy pet — groomed with gentle hands",
  heroSub: "Baths • Full haircuts • Nail & paw care — gentle groomers, fixed prices, dogs and cats welcome",
  heroEmoji: "🐾",
  cats: ["All"],
  products: [],
  services: [
    { id: "s0", n: "Bath & Brush", p: 1200, e: "🛁", c: "Bath", duration: "1 hour", rating: 4.9, desc: "A warm bath with a gentle pet shampoo, blow-dry and full brush-out — coat clean, soft and tangle-free, with ears wiped and paws checked." },
    { id: "s1", n: "Bath & Full Haircut", p: 2500, e: "✂️", c: "Haircut", duration: "2 hours", rating: 4.9, desc: "Everything in the bath, plus a full-body cut to your breed's style: face, paws and sanitary trim, brushing and light de-matting included." },
    { id: "s2", n: "Puppy's First Groom", p: 1500, e: "🐶", c: "Puppy", duration: "1 hour", rating: 4.9, desc: "A slow, gentle first visit for puppies up to 5 months: a warm bath, 15 minutes of brushing, a nail trim and lots of treats — so grooming feels safe from day one." },
    { id: "s3", n: "Nail Trim & Paw Care", p: 800, e: "🐾", c: "Nails", duration: "30 min", rating: 4.8, desc: "Nails trimmed and filed smooth so they stop catching and splitting, with paw pads checked and trimmed — walk in, walk out in half an hour." },
    { id: "s4", n: "De-Shedding Treatment", p: 1800, e: "🧹", c: "Coat care", duration: "1.5 hours", rating: 4.8, desc: "A deep de-shedding bath and brush-out that lifts out loose undercoat — less hair on your sofa, a lighter coat on your dog, and calmer skin underneath." },
    { id: "s5", n: "Teeth Brushing & Ear Cleaning", p: 1000, e: "🦷", c: "Care", duration: "45 min", rating: 4.8, desc: "Teeth brushed with pet-safe toothpaste and ears gently cleaned — fresher breath, healthier gums, and ears checked for redness or mites." },
    { id: "s6", n: "Flea & Tick Bath", p: 2000, e: "🛡️", c: "Treatment", duration: "1 hour", rating: 4.9, desc: "A medicated flea and tick bath that kills fleas on contact, followed by a soothing rinse — for pets that have picked up fleas on walks or at the park." },
  ],
  gallery: [],
  news: [],
  about: "PawSpa is a pet grooming and spa service in Dhaka. Every visit starts with a coat and skin check: tell us your pet's breed, age and temperament, and you get a fixed price listing exactly what is included — bath, cut, nails and care — before you pay anything.",
  contact: "01833402586",
  address: "House 12, Road 5, Dhanmondi, Dhaka 1205",
  hours: "Open daily, 8:00 AM – 8:00 PM",
  priceNote: "Prices in Tk. Shampoo, grooming and cleanup included; final quote confirmed in writing before booking.",
  theme: "minimal",
};
export const DEMO_DEFS: DemoSiteDef[] = [...HAND_DEFS, AURELIA_DEF, CLEANING_DEF, PAINTING_DEF, PESTCONTROL_DEF, APPLIANCEREPAIR_DEF, MOVING_DEF, SECURITY_DEF, GARDENING_DEF, SOLAR_DEF, LOCKSMITH_DEF, COURIER_DEF, PHOTOGRAPHY_DEF, AUTOREPAIR_DEF, CATERING_DEF, HOMECARE_DEF, ROOFING_DEF, DRIVING_DEF, PETGROOMING_DEF, ...ENGINE_CONVERTED, ...FINTECH_DEFS];

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
