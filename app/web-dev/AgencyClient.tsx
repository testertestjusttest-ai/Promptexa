"use client";

/**
 * DigiPlyra agency homepage — Phase 1 proof-of-concept.
 *
 * This REPLACES the old Bangla-first WebDevClient as the site homepage
 * (app/page.tsx). WebDevClient.tsx is kept in the repo untouched — nothing
 * is deleted in this transformation, the old pitch is simply no longer the
 * front door.
 *
 * Language: English by default, zero Bangla words in the default view.
 * Bangla + Hindi come from the hamburger drawer (Language section below)
 * and, in later phases, from Settings — never from a header pill.
 * Trilingual coverage in Phase 1: navigation, hero, section headings,
 * package names and CTAs. Deeper body copy falls back to English in
 * Bangla/Hindi views until its phase lands (see the transformation plan).
 *
 * Honesty rules baked in:
 * - No invented client counts, revenue or team size. The stats shown are
 *   the real demo count (DEMOS.length), the standing 30-page minimum for
 *   handed-over sites, and the 7–14 day delivery promise.
 * - Prices are the official ones: Starter 4,999 / Business 12,999 /
 *   Premium 29,999 Tk, "from". 50% advance, balance before delivery.
 * - The digital store is NOT deleted: it stays as a section, linked below
 *   (/shop), with its own checkout, dashboard and admin intact.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { AgencyLangProvider, AgencyLangSwitcher, useAgencyLang } from "@/lib/agency-lang";
import { DEMOS } from "./demos/demos";

/* [en, bn, hi] — keep the tuple order fixed everywhere. */
type Tr = [string, string, string];
const S: Record<string, Tr> = {
  navDemos: ["Live demos", "লাইভ ডেমো", "लाइव डेमो"],
  navStore: ["Digital store", "ডিজিটাল স্টোর", "डिजिटल स्टोर"],
  navNews: ["News", "নিউজ", "समाचार"],
  navQuote: ["Free quote", "ফ্রি কোট", "मुफ़्त कोट"],
  drawerMenu: ["Menu", "মেনু", "मेनू"],
  drawerLanguage: ["Language", "ভাষা", "भाषा"],
  drawerClose: ["Close", "বন্ধ", "बंद करें"],
  heroBadge: ["Website design agency", "ওয়েবসাইট ডিজাইন এজেন্সি", "वेबसाइट डिज़ाइन एजेंसी"],
  heroTitleA: ["We build websites", "আমরা এমন ওয়েবসাইট বানাই", "हम ऐसी वेबसाइट बनाते हैं"],
  heroTitleB: ["that sell.", "যা বিক্রি বাড়ায়।", "जो बिक्री बढ़ाती है।"],
  heroSub: [
    "Pick a live demo, tell us what to change, and get a complete website — design, admin panel, payments and SEO included.",
    "একটি লাইভ ডেমো বেছে নিন, কী বদলাতে চান জানান, আর সম্পূর্ণ ওয়েবসাইট পান — ডিজাইন, অ্যাডমিন প্যানেল, পেমেন্ট ও SEO সহ।",
    "एक लाइव डेमो चुनें, बताएं क्या बदलना है, और पूरी वेबसाइट पाएं — डिज़ाइन, एडमिन पैनल, पेमेंट और SEO सहित।",
  ],
  ctaDemos: ["See live demos", "লাইভ ডেমো দেখুন", "लाइव डेमो देखें"],
  ctaQuote: ["Get a free quote", "ফ্রি কোট নিন", "मुफ़्त कोट पाएं"],
  statDemos: ["live demo designs", "টি লাইভ ডেমো ডিজাইন", "लाइव डेमो डिज़ाइन"],
  statPages: ["pages in every site", "পেজ প্রতি সাইটে", "हर साइट में पेज"],
  statDelivery: ["days delivery", "দিনে ডেলিভারি", "दिन में डिलीवरी"],
  servicesTitle: ["What we build", "আমরা যা বানাই", "हम क्या बनाते हैं"],
  servicesSub: [
    "Any kind of website, built to your requirements — start from a demo or from scratch.",
    "যেকোনো ধরনের ওয়েবসাইট, আপনার চাহিদা মতো — ডেমো থেকে শুরু করুন বা একদম নতুন করে।",
    "किसी भी तरह की वेबसाइट, आपकी ज़रूरत के हिसाब से — डेमो से शुरू करें या बिल्कुल नई बनवाएं।",
  ],
  packagesTitle: ["Packages & pricing", "প্যাকেজ ও প্রাইস", "पैकेज और कीमत"],
  packagesSub: [
    "Transparent starting prices. Every handed-over site has 30+ pages, a full admin panel, and mobile + desktop design.",
    "স্বচ্ছ শুরুর প্রাইস। প্রতিটি হ্যান্ডওভার করা সাইটে ৩০+ পেজ, সম্পূর্ণ অ্যাডমিন প্যানেল, আর মোবাইল + ডেস্কটপ ডিজাইন থাকে।",
    "पारदर्शी शुरुआती कीमतें। हर दी गई साइट में 30+ पेज, पूरा एडमिन पैनल और मोबाइल + डेस्कटॉप डिज़ाइन होता है।",
  ],
  popular: ["Most popular", "সবচেয়ে জনপ্রিয়", "सबसे लोकप्रिय"],
  from: ["from", "থেকে শুরু", "से शुरू"],
  advanceNote: [
    "50% advance to start, balance before delivery. Delivery in 7–14 days.",
    "শুরু করতে ৫০% অ্যাডভান্স, ডেলিভারির আগে বাকি টাকা। ৭–১৪ দিনে ডেলিভারি।",
    "शुरू करने के लिए 50% एडवांस, डिलीवरी से पहले बाकी रकम। 7–14 दिन में डिलीवरी।",
  ],
  processTitle: ["How it works", "যেভাবে কাজ করি", "हम कैसे काम करते हैं"],
  showcaseTitle: ["Live demo gallery", "লাইভ ডেমো গ্যালারি", "लाइव डेमो गैलरी"],
  showcaseSub: [
    "Open any demo — it feels like a real website, because that is what your site will feel like too.",
    "যেকোনো ডেমো খুলুন — আসল ওয়েবসাইটের মতো লাগবে, কারণ আপনার সাইটও ঠিক এমনই লাগবে।",
    "कोई भी डेमो खोलें — यह असली वेबसाइट जैसा लगेगा, क्योंकि आपकी साइट भी ऐसी ही लगेगी।",
  ],
  seeAll: ["See all demos", "সব ডেমো দেখুন", "सभी डेमो देखें"],
  openDemo: ["Open demo", "ডেমো খুলুন", "डेमो खोलें"],
  storeTitle: ["DigiPlyra digital store", "DigiPlyra ডিজিটাল স্টোর", "DigiPlyra डिजिटल स्टोर"],
  storeSub: [
    "The original digital-products store stays here as a section — premium subscriptions, top-up, movies and the ID market, with the same checkout and admin.",
    "আসল ডিজিটাল প্রোডাক্ট স্টোর এখানেই একটি সেকশন হিসেবে থাকছে — প্রিমিয়াম সাবস্ক্রিপশন, টপ-আপ, মুভি আর ID বাজার, একই চেকআউট ও অ্যাডমিনসহ।",
    "मूल डिजिटल-प्रोडक्ट स्टोर यहीं एक सेक्शन के रूप में रहेगा — प्रीमियम सब्सक्रिप्शन, टॉप-अप, मूवी और ID मार्केट, उसी चेकआउट और एडमिन के साथ।",
  ],
  storeCta: ["Visit the store", "স্টোরে যান", "स्टोर पर जाएं"],
  newsTitle: ["DigiPlyra news", "DigiPlyra নিউজ", "DigiPlyra समाचार"],
  newsSub: [
    "Website tips, agency updates and tech news — fresh stories published every day.",
    "ওয়েবসাইট টিপস, এজেন্সি আপডেট আর টেক নিউজ — প্রতিদিন নতুন খবর প্রকাশিত হয়।",
    "वेबसाइट टिप्स, एजेंसी अपडेट और टेक न्यूज़ — हर दिन नई खबरें प्रकाशित होती हैं।",
  ],
  newsCta: ["Read the news", "নিউজ পড়ুন", "समाचार पढ़ें"],
  quoteTitle: ["Free quote request", "ফ্রি কোট রিকোয়েস্ট", "मुफ़्त कोट अनुरोध"],
  quoteSub: [
    "Tell us what you need — we reply within 24 hours.",
    "কী চান জানান — ২৪ ঘণ্টার মধ্যে উত্তর পাবেন।",
    "बताएं आपको क्या चाहिए — 24 घंटे के अंदर जवाब मिलेगा।",
  ],
  fName: ["Your name *", "আপনার নাম *", "आपका नाम *"],
  fPhone: ["Mobile number *", "মোবাইল নম্বর *", "मोबाइल नंबर *"],
  fType: ["What kind of website? *", "কী ধরনের ওয়েবসাইট চান? *", "किस तरह की वेबसाइट चाहिए? *"],
  fBudget: ["Approximate budget", "আনুমানিক বাজেট", "अनुमानित बजट"],
  fFeatures: ["What features do you need?", "কী কী ফিচার লাগবে?", "कौन-से फ़ीचर चाहिए?"],
  fDetails: ["Details", "বিস্তারিত লিখুন", "विवरण लिखें"],
  fSubmit: ["Ask for a free quote", "ফ্রি কোট চান", "मुफ़्त कोट मांगें"],
  fSending: ["Sending...", "পাঠানো হচ্ছে...", "भेजा जा रहा है..."],
};

const PACKAGES = [
  {
    key: "starter",
    name: ["Starter", "স্টার্টার", "स्टार्टर"] as Tr,
    price: 4999,
    desc: ["For small businesses & portfolios", "ছোট ব্যবসা / পোর্টফোলিওর জন্য", "छोटे बिज़नेस / पोर्टफ़ोलियो के लिए"] as Tr,
    features: ["30+ pages", "Mobile responsive", "WhatsApp button", "Basic SEO", "1 month free support"],
  },
  {
    key: "business",
    name: ["Business", "বিজনেস", "बिज़नेस"] as Tr,
    price: 12999,
    desc: ["For e-commerce & companies", "ই-কমার্স / কোম্পানির জন্য", "ई-कॉमर्स / कंपनियों के लिए"] as Tr,
    features: ["30+ pages", "Full admin panel", "Payment gateway", "Advanced SEO", "3 months free support"],
    hot: true,
  },
  {
    key: "premium",
    name: ["Premium", "প্রিমিয়াম", "प्रीमियम"] as Tr,
    price: 29999,
    desc: ["For custom web apps & marketplaces", "কাস্টম ওয়েব অ্যাপ / মার্কেটপ্লেস", "कस्टम वेब ऐप / मार्केटप्लेस"] as Tr,
    features: ["30+ pages", "Custom design + features", "Mobile app (PWA)", "Live chat system", "6 months free support"],
  },
];

const SERVICES: { icon: string; name: Tr; desc: string }[] = [
  { icon: "🏢", name: ["Business website", "ব্যবসায়িক ওয়েবসাইট", "बिज़नेस वेबसाइट"], desc: "Company profile, services, gallery, contact and quote forms." },
  { icon: "🛍️", name: ["E-commerce shop", "ই-কমার্স শপ", "ई-कॉमर्स शॉप"], desc: "Products, cart, checkout, secure payments and order tracking." },
  { icon: "📅", name: ["Booking website", "বুকিং ওয়েবসাইট", "बुकिंग वेबसाइट"], desc: "Services, slots, appointments and customer reminders." },
  { icon: "📰", name: ["News & blog", "নিউজ ও ব্লগ", "न्यूज़ और ब्लॉग"], desc: "Articles, categories, search and SEO-ready publishing." },
  { icon: "🤝", name: ["Marketplace", "মার্কেটপ্লেস", "मार्केटप्लेस"], desc: "Multi-seller listings, escrow-style orders and seller dashboards." },
  { icon: "⚙️", name: ["Custom web app", "কাস্টম ওয়েব অ্যাপ", "कस्टम वेब ऐप"], desc: "Dashboards, wallets, exchanges and anything custom-built." },
];

const PROCESS: { icon: string; title: Tr; desc: string }[] = [
  { icon: "📝", title: ["Request", "রিকোয়েস্ট", "अनुरोध"], desc: "Fill in the form — what kind of site do you want?" },
  { icon: "📞", title: ["Discussion", "আলোচনা", "बातचीत"], desc: "We call you and understand every detail." },
  { icon: "💰", title: ["Quote & payment", "কোট ও পেমেন্ট", "कोट और पेमेंट"], desc: "Final price agreed, then 50% advance to start." },
  { icon: "🚀", title: ["Delivery", "ডেলিভারি", "डिलीवरी"], desc: "Site live in 7–14 days, plus free support." },
];

/* English display names for the showcase (the demos themselves keep their
 * own names until their rework phase; this map only labels the cards). */
const SHOWCASE: { slug: string; name: string; type: string }[] = [
  { slug: "binancepro", name: "Crypto Exchange Pro", type: "Crypto exchange" },
  { slug: "buyinghouse", name: "TexBridge Sourcing", type: "Garments buying house" },
  { slug: "jewelry", name: "Aurelia Jewelry", type: "Luxury jewelry shop" },
  { slug: "restaurant", name: "Restaurant", type: "Food & restaurant" },
  { slug: "fashion", name: "Fashion Store", type: "Fashion shop" },
  { slug: "investpro", name: "Investment Platform", type: "Investment plans" },
  { slug: "swiftex", name: "Swift Exchange", type: "Money exchange" },
  { slug: "cryptovault", name: "Crypto Vault", type: "Wallet & vault" },
  { slug: "trustpay", name: "TrustPay Wallet", type: "Wallet & payments" },
];

const SITE_TYPES = ["Business website", "E-commerce shop", "Portfolio", "Blog / News", "Marketplace", "Other"];
const BUDGETS = ["Under 5,000", "5,000 – 15,000", "15,000 – 30,000", "30,000+"];

function AgencyHome() {
  const { lang, tx, price } = useAgencyLang();
  const t = (k: keyof typeof S) => tx(...S[k]);
  const ROTATE = ["business website", "online shop", "booking site", "news portal", "marketplace", "custom web app"];
  const [wordIdx, setWordIdx] = useState(0);
  const [drawer, setDrawer] = useState(false);
  useEffect(() => {
    const id = setInterval(() => setWordIdx((i) => (i + 1) % ROTATE.length), 2400);
    return () => clearInterval(id);
  }, []);
  const [form, setForm] = useState({ name: "", phone: "", site_type: SITE_TYPES[0], features: "", budget_range: BUDGETS[1], details: "" });
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    if (!form.name.trim()) return setMsg("Please enter your name.");
    if (!/^01[3-9]\d{8}$/.test(form.phone.trim())) return setMsg("Please enter a valid 11-digit mobile number.");
    setSending(true);
    try {
      const res = await fetch("/api/services/web-dev", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Failed");
      setMsg("Request sent! We will call you within 24 hours.");
      setForm({ name: "", phone: "", site_type: SITE_TYPES[0], features: "", budget_range: BUDGETS[1], details: "" });
    } catch (err) {
      setMsg(`Something went wrong: ${err instanceof Error ? err.message : "failed"}`);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      {/* agency bar — hamburger drawer holds nav + Language (no header pill) */}
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => setDrawer(true)}
          aria-label={t("drawerMenu")}
          className="grid h-11 w-11 place-items-center rounded-xl bg-white/10 text-xl text-white transition hover:scale-105 hover:bg-white/20"
        >
          ☰
        </button>
        <div className="leading-none">
          <p className="text-lg font-black tracking-tight text-white">DigiPlyra</p>
          <p className="mt-1 text-[9px] font-black uppercase tracking-[0.22em] text-[#d7ff3f]">Website Agency</p>
        </div>
        <div className="ml-auto flex gap-2">
          <Link href="/demos" className="hidden rounded-xl bg-white/10 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/20 sm:block">
            {t("navDemos")}
          </Link>
          <Link href="/#quote" className="rounded-xl bg-[#d7ff3f] px-4 py-2.5 text-sm font-black text-black transition hover:brightness-110">
            {t("navQuote")}
          </Link>
        </div>
      </div>

      {drawer && (
        <div className="fixed inset-0 z-[90]">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDrawer(false)} />
          <aside className="absolute left-0 top-0 flex h-full w-80 max-w-[85vw] flex-col overflow-y-auto bg-[#0d1424] text-white shadow-2xl">
            <div className="flex items-center justify-between p-5 pb-4">
              <span>
                <span className="block text-base font-black leading-tight">DigiPlyra</span>
                <span className="block text-[10px] font-bold uppercase tracking-widest text-[#d7ff3f]">Website Agency</span>
              </span>
              <button onClick={() => setDrawer(false)} aria-label={t("drawerClose")} className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-lg transition hover:scale-105">✕</button>
            </div>
            <div className="flex-1 px-4 pb-4">
              <p className="mb-1 mt-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">{t("drawerMenu")}</p>
              <nav className="space-y-1">
                {[
                  { label: t("navDemos"), href: "/demos" },
                  { label: t("navStore"), href: "/shop" },
                  { label: t("navNews"), href: "/news" },
                  { label: t("navQuote"), href: "/#quote" },
                ].map((l) => (
                  <Link key={l.href} href={l.href} onClick={() => setDrawer(false)} className="flex items-center justify-between rounded-xl px-4 py-3 font-bold transition hover:bg-white/10">
                    <span>{l.label}</span>
                    <span className="opacity-30">›</span>
                  </Link>
                ))}
              </nav>
              <p className="mb-1 mt-6 text-[11px] font-bold uppercase tracking-wider text-slate-400">{t("drawerLanguage")}</p>
              <AgencyLangSwitcher dark />
              <p className="mt-3 px-1 text-xs leading-relaxed text-slate-400">
                WhatsApp: 01833402586
              </p>
            </div>
          </aside>
        </div>
      )}

      {/* hero */}
      <div className="relative overflow-hidden rounded-[36px] border border-white/10 bg-[#070b16] shadow-[0_0_120px_rgba(215,255,63,0.07)]">
        <div className="relative p-7 sm:p-10 lg:p-12">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#d7ff3f] px-3.5 py-1.5 text-[11px] font-black text-black">
            {t("heroBadge")}
          </span>
          <h1 className="font-display mt-5 max-w-2xl text-[34px] font-black leading-[1.12] text-white sm:text-5xl">
            {t("heroTitleA")}{" "}
            {lang === "en" && (
              <span key={wordIdx} className="dp-word-in inline-block bg-gradient-to-r from-lime-300 via-[#d7ff3f] to-emerald-300 bg-clip-text text-transparent">
                {ROTATE[wordIdx]}
              </span>
            )}
            <br />
            {t("heroTitleB")}
          </h1>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-slate-300">{t("heroSub")}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/demos" className="btn-vault inline-flex !px-7 !py-3.5 text-sm">
              🖥️ {t("ctaDemos")}
            </Link>
            <Link href="/#quote" className="inline-flex items-center rounded-xl border border-white/25 bg-white/5 px-7 py-3.5 text-sm font-bold text-white backdrop-blur transition hover:border-[#d7ff3f]/60 hover:bg-white/10">
              📝 {t("ctaQuote")}
            </Link>
          </div>
          <div className="mt-8 grid max-w-lg grid-cols-3 divide-x divide-white/10 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur">
            {[
              [`${DEMOS.length}+`, t("statDemos")],
              ["30+", t("statPages")],
              ["7–14", t("statDelivery")],
            ].map(([v, label]) => (
              <div key={label} className="px-4 py-3 text-center">
                <p className="font-display text-lg font-black text-white">{v}</p>
                <p className="text-[10px] font-bold text-slate-400">{label}</p>
              </div>
            ))}
          </div>
        </div>
        <style>{`@keyframes dp-word { 0% { opacity: 0; transform: translateY(14px) } 100% { opacity: 1; transform: translateY(0) } } .dp-word-in { animation: dp-word .45s ease both }`}</style>
      </div>

      {/* services */}
      <h2 className="font-display mt-14 text-center text-2xl font-bold text-white sm:text-3xl">{t("servicesTitle")}</h2>
      <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-slate-400">{t("servicesSub")}</p>
      <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SERVICES.map((s) => (
          <div key={s.name[0]} className="glass rounded-3xl p-5">
            <p className="text-2xl">{s.icon}</p>
            <p className="mt-2 font-display text-lg font-bold text-white">{tx(...s.name)}</p>
            <p className="mt-1 text-sm text-slate-400">{s.desc}</p>
          </div>
        ))}
      </div>

      {/* packages */}
      <h2 className="font-display mt-14 text-center text-2xl font-bold text-white sm:text-3xl">💎 {t("packagesTitle")}</h2>
      <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-slate-400">{t("packagesSub")}</p>
      <div className="mt-6 grid gap-5 md:grid-cols-3">
        {PACKAGES.map((p) => (
          <div key={p.key} className={`glass rounded-3xl p-6 ${p.hot ? "ring-2 ring-[#d7ff3f]/60" : ""}`}>
            {p.hot && <span className="mb-3 inline-block rounded-full bg-[#d7ff3f] px-3 py-1 text-xs font-bold text-black">🔥 {t("popular")}</span>}
            <h3 className="font-display text-xl font-bold text-white">{tx(...p.name)}</h3>
            <p className="mt-1 text-xs text-slate-500">{tx(...p.desc)}</p>
            <p className="font-display mt-3 text-3xl font-bold text-[#d7ff3f]">{price(p.price)}</p>
            <p className="text-[11px] text-slate-500">{t("from")}</p>
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
      <p className="mt-4 text-center text-sm text-slate-400">{t("advanceNote")}</p>

      {/* process */}
      <h2 className="font-display mt-14 text-center text-2xl font-bold text-white sm:text-3xl">⚙️ {t("processTitle")}</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        {PROCESS.map((s, i) => (
          <div key={s.title[0]} className="glass rounded-2xl p-5 text-center">
            <div className="text-3xl">{s.icon}</div>
            <p className="mt-2 text-sm font-bold text-white">{i + 1}. {tx(...s.title)}</p>
            <p className="mt-1 text-xs text-slate-400">{s.desc}</p>
          </div>
        ))}
      </div>

      {/* demo showcase */}
      <div id="demos" className="mt-14 scroll-mt-24">
        <h2 className="font-display text-center text-2xl font-bold text-white sm:text-3xl">🖥️ {t("showcaseTitle")}</h2>
        <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-slate-400">{t("showcaseSub")}</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SHOWCASE.map((d) => (
            <Link key={d.slug} href={`/demo${d.slug}`} className="group block overflow-hidden rounded-3xl border border-white/10 bg-[#0b1120] transition hover:border-[#d7ff3f]/40">
              <div className="flex h-36 items-center justify-center bg-gradient-to-br from-[#12203a] to-[#0b1120] text-5xl">
                {d.slug === "jewelry" ? "💎" : d.slug === "buyinghouse" ? "🧵" : d.slug === "binancepro" ? "₿" : d.slug === "restaurant" ? "🍔" : d.slug === "fashion" ? "👗" : d.slug === "investpro" ? "📈" : d.slug === "swiftex" ? "💱" : d.slug === "cryptovault" ? "🔐" : "👛"}
              </div>
              <div className="p-4">
                <p className="font-bold text-white">{d.name}</p>
                <p className="mt-1 text-xs text-slate-400">{d.type}</p>
                <span className="mt-2.5 block rounded-xl bg-[#d7ff3f]/10 px-3 py-2 text-center text-xs font-black text-[#d7ff3f] ring-1 ring-[#d7ff3f]/30 transition group-hover:bg-[#d7ff3f]/20">
                  👁️ {t("openDemo")} →
                </span>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link href="/demos" className="btn-vault inline-flex !px-10 !py-3.5 text-base">
            🖥️ {t("seeAll")} →
          </Link>
        </div>
      </div>

      {/* store section + news teaser */}
      <div className="mt-14 grid gap-4 lg:grid-cols-2">
        <div className="glass rounded-3xl p-6">
          <p className="text-2xl">🛒</p>
          <p className="font-display mt-2 text-xl font-bold text-white">{t("storeTitle")}</p>
          <p className="mt-1 text-sm leading-relaxed text-slate-400">{t("storeSub")}</p>
          <Link href="/shop" className="mt-4 inline-block rounded-xl bg-[#d7ff3f] px-5 py-2.5 text-sm font-black text-black transition hover:brightness-110">
            {t("storeCta")} →
          </Link>
        </div>
        <div className="glass rounded-3xl p-6">
          <p className="text-2xl">📰</p>
          <p className="font-display mt-2 text-xl font-bold text-white">{t("newsTitle")}</p>
          <p className="mt-1 text-sm leading-relaxed text-slate-400">{t("newsSub")}</p>
          <Link href="/news" className="mt-4 inline-block rounded-xl bg-[#d7ff3f] px-5 py-2.5 text-sm font-black text-black transition hover:brightness-110">
            {t("newsCta")} →
          </Link>
        </div>
      </div>

      {/* quote form */}
      <div id="quote" className="glass mt-12 scroll-mt-24 rounded-3xl p-6 sm:p-8">
        <h2 className="font-display text-2xl font-bold text-white">📋 {t("quoteTitle")}</h2>
        <p className="mt-1 text-sm text-slate-400">{t("quoteSub")}</p>
        <form onSubmit={submit} className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm text-slate-300">{t("fName")}</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="field" placeholder="Name" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-slate-300">{t("fPhone")}</label>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="field" placeholder="01XXXXXXXXX" inputMode="numeric" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-slate-300">{t("fType")}</label>
            <select value={form.site_type} onChange={(e) => setForm({ ...form, site_type: e.target.value })} className="field">
              {SITE_TYPES.map((x) => <option key={x}>{x}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-slate-300">{t("fBudget")}</label>
            <select value={form.budget_range} onChange={(e) => setForm({ ...form, budget_range: e.target.value })} className="field">
              {BUDGETS.map((b) => <option key={b}>{b}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm text-slate-300">{t("fFeatures")}</label>
            <input value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} className="field" placeholder="e.g. online payment, live chat, Bangla language..." />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm text-slate-300">{t("fDetails")}</label>
            <textarea value={form.details} onChange={(e) => setForm({ ...form, details: e.target.value })} className="field min-h-[100px]" placeholder="About your business / idea..." maxLength={2000} />
          </div>
          {msg && <p className="sm:col-span-2 rounded-xl bg-[#d7ff3f]/10 px-4 py-3 text-sm text-[#d7ff3f]">{msg}</p>}
          <button type="submit" disabled={sending} className="btn-vault sm:col-span-2 !py-3.5 text-base">
            {sending ? t("fSending") : `📨 ${t("fSubmit")}`}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AgencyClient() {
  return (
    <AgencyLangProvider>
      <AgencyHome />
    </AgencyLangProvider>
  );
}
