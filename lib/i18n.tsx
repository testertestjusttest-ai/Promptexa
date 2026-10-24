"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

/** Phase 2: site-wide default is English; Bangla/Hindi only via drawer/Settings. */
export type Lang = "bn" | "en" | "hi";

const STR = {
  bn: {
    nav_home: "🏠 হোম",
    nav_shop: "🛍️ শপ",
    nav_earn: "💰 আয় করুন",
    nav_movies: "🎬 মুভি",
    nav_topup: "💎 টপ-আপ",
    nav_market: "🎮 ID বাজার",
    nav_webdev: "🌐 ওয়েবসাইট বানান",
    nav_dashboard: "📦 আমার অর্ডার",
    nav_login: "লগইন",
    nav_signup: "সাইন আপ",
    nav_logout: "লগআউট",
    nav_dashboard_btn: "ড্যাশবোর্ড",
    nav_faq: "❓ সাধারণ জিজ্ঞাসা",
    nav_demos: "🖥️ ডেমো",
    nav_chat: "💬 চ্যাট",
    ft_tagline: "বাংলাদেশের বিশ্বস্ত ডিজিটাল প্রোডাক্ট স্টোর। অরিজিনাল প্রিমিয়াম সাবস্ক্রিপশন — দ্রুত ডেলিভারি, নিরাপদ পেমেন্ট, ২৪/৭ সাপোর্ট।",
    ft_quick: "কুইক লিংক",
    ft_all_products: "সব প্রোডাক্ট",
    ft_my_orders: "আমার অর্ডার",
    ft_login: "লগইন / রেজিস্টার",
    ft_help: "সহায়তা",
    ft_delivery: "ডেলিভারি: পেমেন্টের ৫–৩০ মিনিটে",
    ft_support: "সাপোর্ট: প্রতিদিন সকাল ৯টা – রাত ১১টা",
    ft_payment: "পেমেন্ট: ১০০% নিরাপদ",
    ft_rights: "সর্বস্বত্ব সংরক্ষিত।",
    nb_title: "🔔 নোটিফিকেশন",
    nb_empty: "কোনো নোটিফিকেশন নেই",
    c_loading: "লোড হচ্ছে...",
    c_featured: "⭐ ফিচার্ড",
    c_views: "বার দেখা হয়েছে",
    c_call: "কল করুন",
    m_badge: "🔥 বাংলাদেশের সবচেয়ে নিরাপদ ID বাজার",
    m_title_a: "Free Fire",
    m_title_b: "ID বাজার",
    m_sub: "১০০% নিরাপদে ID বেচাকেনা — টাকা আগে অ্যাডমিনের কাছে জমা থাকে, আইডি হাতে পেয়ে কনফার্ম করলেই বিক্রেতা টাকা পায়। প্রতারণার কোনো সুযোগ নেই! 🛡️",
    m_sell: "📢 আমার ID বিক্রি করুন",
    m_browse: "🎮 ID দেখুন",
    m_listings: "বিক্রির জন্য ID",
    m_empty_t: "এখনো কোনো ID বিক্রির জন্য নেই",
    m_empty_s: "প্রথম বিক্রেতা হয়ে যান!",
    s_title: "📢 ID বিক্রির পোস্ট দিন",
    s_sub: "অ্যাডমিন যাচাই করে পোস্টটি লাইভ করবে। টাকা সরাসরি আপনার কাছে আসবে না — ক্রেতা অ্যাডমিনকে দেবে, আইডি বুঝিয়ে দিলে টাকা পাবেন। 🛡️",
    s_form_title: "টাইটেল *",
    s_price: "দাম (টাকা) *",
    s_uid: "Free Fire UID",
    s_phone: "📞 আপনার মোবাইল নম্বর *",
    s_phone_hint: "ক্রেতা এই নম্বরে কল করে কথা বলতে পারবে।",
    s_desc: "বিস্তারিত *",
    s_shots: "স্ক্রিনশট * (সর্বোচ্চ ৬টি)",
    s_submit: "📨 রিভিউয়ের জন্য পাঠান",
    s_sending: "পাঠানো হচ্ছে...",
    s_fee_note: "ℹ️ অ্যাডমিন ফি ২% — বিক্রি সম্পন্ন হলে দামের ২% ফি কেটে বাকি টাকা আপনাকে দেওয়া হবে।",
    d_escrow_title: "🛡️ নিরাপদ এসক্রো সিস্টেম",
    d_safety: "🛡️ নিরাপদ লেনদেনের নিয়ম: বিক্রেতার সাথে ফোনে কথা বলে ID যাচাই করুন, কিন্তু টাকা সরাসরি বিক্রেতাকে দেবেন না — সবসময় DigiPlyra এসক্রোর মাধ্যমে পেমেন্ট করুন। অ্যাডমিন টাকা হোল্ড করে রাখবে; ID বুঝে পেলে তবেই টাকা ছাড়া হবে। (অ্যাডমিন ফি ২%)",
    d_boost_t: "⭐ পোস্ট বুস্ট করুন",
    d_boost_d: "৩০ টাকা (ওয়ালেট থেকে) — ৩ দিন সবার উপরে ⭐ ফিচার্ড ব্যাজসহ দেখাবে। বেশি ভিউ = দ্রুত বিক্রি!",
    d_boost_b: "⭐ ৩০ টাকা দিয়ে বুস্ট করুন",
    d_boosting: "বুস্ট হচ্ছে...",
  },
  en: {
    nav_home: "🏠 Home",
    nav_shop: "🛍️ Shop",
    nav_earn: "💰 Earn",
    nav_movies: "🎬 Movies",
    nav_topup: "💎 Top-Up",
    nav_market: "🎮 ID Market",
    nav_webdev: "🌐 Build Website",
    nav_dashboard: "📦 My Orders",
    nav_login: "Login",
    nav_signup: "Sign up",
    nav_logout: "Logout",
    nav_dashboard_btn: "Dashboard",
    nav_faq: "❓ FAQ",
    nav_demos: "🖥️ Demos",
    nav_chat: "💬 Chat",
    ft_tagline: "Bangladesh's trusted digital product store. Original premium subscriptions — fast delivery, secure payment, 24/7 support.",
    ft_quick: "Quick Links",
    ft_all_products: "All Products",
    ft_my_orders: "My Orders",
    ft_login: "Login / Register",
    ft_help: "Help",
    ft_delivery: "Delivery: within 5–30 min of payment",
    ft_support: "Support: every day 9 AM – 11 PM",
    ft_payment: "Payment: 100% secure",
    ft_rights: "All rights reserved.",
    nb_title: "🔔 Notifications",
    nb_empty: "No notifications",
    c_loading: "Loading...",
    c_featured: "⭐ Featured",
    c_views: "views",
    c_call: "Call",
    m_badge: "🔥 Bangladesh's safest ID marketplace",
    m_title_a: "Free Fire",
    m_title_b: "ID Market",
    m_sub: "Buy & sell IDs with 100% safety — money stays with the admin first, the seller gets paid only after you confirm receiving the ID. No chance of fraud! 🛡️",
    m_sell: "📢 Sell My ID",
    m_browse: "🎮 Browse IDs",
    m_listings: "IDs for sale",
    m_empty_t: "No IDs for sale yet",
    m_empty_s: "Be the first seller!",
    s_title: "📢 Post Your ID for Sale",
    s_sub: "Admin will verify and publish your post. Money won't come to you directly — the buyer pays the admin, and you get paid after handing over the ID. 🛡️",
    s_form_title: "Title *",
    s_price: "Price (BDT) *",
    s_uid: "Free Fire UID",
    s_phone: "📞 Your mobile number *",
    s_phone_hint: "Buyers can call you on this number.",
    s_desc: "Details *",
    s_shots: "Screenshots * (max 6)",
    s_submit: "📨 Send for Review",
    s_sending: "Sending...",
    s_fee_note: "ℹ️ Admin fee 2% — when the sale completes, 2% is deducted and the rest is paid to you.",
    d_escrow_title: "🛡️ Secure Escrow System",
    d_safety: "🛡️ Safe trading rules: verify the ID by talking to the seller on the phone, but never pay the seller directly — always pay through DigiPlyra escrow. The admin holds the money; it's released only after you receive the ID. (Admin fee 2%)",
    d_boost_t: "⭐ Boost Your Post",
    d_boost_d: "30 BDT (from wallet) — shows at the top with a ⭐ Featured badge for 3 days. More views = faster sale!",
    d_boost_b: "⭐ Boost for 30 BDT",
    d_boosting: "Boosting...",
  },
  hi: {
    nav_home: "🏠 होम",
    nav_shop: "🛍️ शॉप",
    nav_earn: "💰 कमाएँ",
    nav_movies: "🎬 मूवी",
    nav_topup: "💎 टॉप-अप",
    nav_market: "🎮 आईडी मार्केट",
    nav_webdev: "🌐 वेबसाइट बनवाएँ",
    nav_dashboard: "📦 मेरे ऑर्डर",
    nav_login: "लॉगिन",
    nav_signup: "साइन अप",
    nav_logout: "लॉगआउट",
    nav_dashboard_btn: "डैशबोर्ड",
    nav_faq: "❓ अक्सर पूछे जाने वाले प्रश्न",
    nav_demos: "🖥️ डेमो",
    nav_chat: "💬 चैट",
    ft_tagline: "बांग्लादेश का विश्वसनीय डिजिटल प्रोडक्ट स्टोर। ओरिजिनल प्रीमियम सब्सक्रिप्शन — तेज़ डिलीवरी, सुरक्षित भुगतान, 24/7 सपोर्ट।",
    ft_quick: "क्विक लिंक",
    ft_all_products: "सभी प्रोडक्ट",
    ft_my_orders: "मेरे ऑर्डर",
    ft_login: "लॉगिन / रजिस्टर",
    ft_help: "सहायता",
    ft_delivery: "डिलीवरी: भुगतान के 5–30 मिनट के भीतर",
    ft_support: "सपोर्ट: हर दिन सुबह 9 बजे – रात 11 बजे",
    ft_payment: "भुगतान: 100% सुरक्षित",
    ft_rights: "सर्वाधिकार सुरक्षित।",
    nb_title: "🔔 नोटिफिकेशन",
    nb_empty: "कोई नोटिफिकेशन नहीं",
    c_loading: "लोड हो रहा है...",
    c_featured: "⭐ फ़ीचर्ड",
    c_views: "बार देखा गया",
    c_call: "कॉल करें",
    m_badge: "🔥 बांग्लादेश का सबसे सुरक्षित आईडी मार्केट",
    m_title_a: "Free Fire",
    m_title_b: "आईडी मार्केट",
    m_sub: "100% सुरक्षित आईडी खरीद-बिक्री — पैसा पहले एडमिन के पास रहता है, आईडी मिलने की पुष्टि के बाद ही विक्रेता को भुगतान मिलता है।",
    m_sell: "📢 मेरी आईडी बेचें",
    m_browse: "🎮 आईडी देखें",
    m_listings: "बिक्री के लिए आईडी",
    m_empty_t: "अभी बिक्री के लिए कोई आईडी नहीं है",
    m_empty_s: "पहले विक्रेता बनें!",
    s_title: "📢 अपनी आईडी बिक्री के लिए पोस्ट करें",
    s_sub: "एडमिन जाँच करके पोस्ट लाइव करेगा। पैसा सीधे आपके पास नहीं आएगा — खरीदार एडमिन को देगा, आईडी मिलने पर आपको भुगतान मिलेगा।",
    s_form_title: "टाइटल *",
    s_price: "कीमत (BDT) *",
    s_uid: "Free Fire UID",
    s_phone: "📞 आपका मोबाइल नंबर *",
    s_phone_hint: "खरीदार इस नंबर पर कॉल करके बात कर सकता है।",
    s_desc: "विवरण *",
    s_shots: "स्क्रीनशॉट * (अधिकतम 6)",
    s_submit: "📨 समीक्षा के लिए भेजें",
    s_sending: "भेजा जा रहा है...",
    s_fee_note: "ℹ️ एडमिन शुल्क 2% — बिक्री पूरी होने पर कीमत का 2% काटकर बाकी आपको दिया जाएगा।",
    d_escrow_title: "🛡️ सुरक्षित एस्क्रो सिस्टम",
    d_safety: "🛡️ सुरक्षित लेन-देन के नियम: विक्रेता से फ़ोन पर बात करके आईडी जाँचें, लेकिन पैसा सीधे विक्रेता को कभी न दें — हमेशा DigiPlyra एस्क्रो के माध्यम से भुगतान करें।",
    d_boost_t: "⭐ पोस्ट बूस्ट करें",
    d_boost_d: "30 BDT (वॉलेट से) — 3 दिन तक सबसे ऊपर ⭐ फ़ीचर्ड बैज के साथ दिखेगा।",
    d_boost_b: "⭐ 30 BDT में बूस्ट करें",
    d_boosting: "बूस्ट हो रहा है...",
  },
} as const;

export type TKey = keyof (typeof STR)["bn"];

const LangCtx = createContext<{ lang: Lang; setLang: (l: Lang) => void; t: (k: TKey) => string }>({
  lang: "en",
  setLang: () => {},
  t: (k) => STR.en[k] ?? k,
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("dp-lang");
      if (saved === "bn" || saved === "en" || saved === "hi") {
        setLangState(saved);
      } else {
        const nav = (navigator.language || "en").toLowerCase();
        setLangState(nav.startsWith("bn") ? "bn" : nav.startsWith("hi") ? "hi" : "en");
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      document.documentElement.lang = lang;
    } catch {}
  }, [lang]);

  function setLang(l: Lang) {
    setLangState(l);
    try {
      localStorage.setItem("dp-lang", l);
    } catch {}
  }

  const t = (k: TKey): string => (STR[lang] as Record<string, string>)[k] ?? STR.en[k] ?? k;

  return <LangCtx.Provider value={{ lang, setLang, t }}>{children}</LangCtx.Provider>;
}

export function useLang() {
  return useContext(LangCtx);
}

/** Language switcher for the hamburger drawer / Settings — the ONLY site-wide
 *  switch location in Phase 2. Never render a header pill. */
export function SiteLangSwitcher() {
  const { lang, setLang } = useLang();
  const opts: { id: Lang; label: string }[] = [
    { id: "en", label: "English" },
    { id: "bn", label: "বাংলা" },
    { id: "hi", label: "हिन्दी" },
  ];
  return (
    <div>
      <p className="mb-2 text-xs font-black uppercase tracking-wide text-slate-400">Language</p>
      <div className="flex gap-2">
        {opts.map((o) => (
          <button
            key={o.id}
            onClick={() => setLang(o.id)}
            className={`flex-1 rounded-xl py-2.5 text-sm font-black transition ${lang === o.id ? "bg-[#d7ff3f] text-black" : "bg-white/10 text-slate-200 hover:bg-white/15"}`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Deprecated header pill — kept only so old imports do not break. Phase 2
 *  Navbar does not render it; use SiteLangSwitcher in the drawer instead. */
export function LangToggle() {
  const { lang, setLang } = useLang();
  const next: Lang = lang === "en" ? "bn" : lang === "bn" ? "hi" : "en";
  return (
    <button
      onClick={() => setLang(next)}
      className="grid h-10 min-w-10 place-items-center rounded-xl border border-white/10 bg-white/5 px-2 text-sm font-bold text-slate-200 transition hover:border-[#d7ff3f]/50"
      aria-label="Language"
      title="English / বাংলা / हिन्दी"
    >
      {lang === "en" ? "বাং" : lang === "bn" ? "हिन्दी" : "EN"}
    </button>
  );
}
