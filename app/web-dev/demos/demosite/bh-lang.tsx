"use client";

/** Buying-house language system — English is the default; switching to
 * Bangla flips the ENTIRE buying-house site + admin to Bangla.
 * Persisted in localStorage ("texbridge_lang"). Other demo layouts never
 * mount the provider, so the context default keeps them untouched.
 */

import { createContext, useContext, useEffect, useState } from "react";
import { toBnDigits } from "@/lib/format";

export type BhLang = "en" | "bn" | "hi";

export interface BhCtx {
  lang: BhLang;
  setLang: (l: BhLang) => void;
  /** pick a string by language — tx(bn, en, hi?) falls back to English for Hindi when hi is omitted */
  tx: (bn: string, en: string, hi?: string) => string;
  /** number formatting: Bangla digits in bn, Latin in en */
  num: (v: number | string) => string;
  /** convert embedded Bangla digits in a string to Latin when lang=en */
  dg: (s: string) => string;
}

const BN_DIGITS = "০১২৩৪৫৬৭৮৯";
export const toEnDigits = (s: string) => s.replace(/[০-৯]/g, (d) => String(BN_DIGITS.indexOf(d)));

const Ctx = createContext<BhCtx>({
  lang: "en",
  setLang: () => {},
  tx: (_bn, en) => en,
  num: (v) => String(v),
  dg: (s) => toEnDigits(s),
});

export function BhLangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<BhLang>("en");
  useEffect(() => {
    try {
      const v = localStorage.getItem("texbridge_lang");
      if (v === "bn" || v === "en" || v === "hi") setLangState(v);
    } catch { /* ignore */ }
  }, []);
  const setLang = (l: BhLang) => {
    setLangState(l);
    try { localStorage.setItem("texbridge_lang", l); } catch { /* ignore */ }
  };
  const value: BhCtx = {
    lang,
    setLang,
    tx: (bn, en, hi) => (lang === "en" ? en : lang === "hi" ? (hi ?? en) : bn),
    num: (v) => (lang === "en" || lang === "hi" ? String(v) : toBnDigits(v as number)),
    dg: (s) => (lang === "en" || lang === "hi" ? toEnDigits(s) : s),
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/** TexBridge brand mark — gradient monogram tile with a thread swoosh. */
export function BhLogo({ size = 38 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" role="img" aria-label="TexBridge logo" className="shrink-0" style={{ filter: "drop-shadow(0 4px 10px rgba(2,132,199,0.35))" }}>
      <defs>
        <linearGradient id="bhlogo-g" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#075985" />
          <stop offset="0.55" stopColor="#0284c7" />
          <stop offset="1" stopColor="#38bdf8" />
        </linearGradient>
      </defs>
      <rect x="1.5" y="1.5" width="45" height="45" rx="13" fill="url(#bhlogo-g)" />
      <rect x="1.5" y="1.5" width="45" height="45" rx="13" fill="none" stroke="#ffffff" strokeOpacity="0.35" strokeWidth="1" />
      <path d="M7 31.5 C 15 23.5, 26 37, 34 29.5 C 37 26.7, 39.5 25.8, 41.5 26.2" fill="none" stroke="#bae6fd" strokeWidth="2.1" strokeLinecap="round" opacity="0.95" />
      <text x="24" y="27.5" textAnchor="middle" fontSize="16.5" fontWeight="900" fill="#ffffff" letterSpacing="0.5" fontFamily="inherit">TB</text>
    </svg>
  );
}

export function useBh(): BhCtx {
  return useContext(Ctx);
}

/* ---- English versions of def-driven strings (defs.ts stays Bangla) ---- */

export const EN_NAME = "TexBridge Sourcing";
export const EN_HERO_TITLE = "World-Class Garment Sourcing from Bangladesh";
export const EN_HERO_SUB = "120+ verified factories • Exporting to 40+ countries";
export const EN_ADDRESS = "House 12, Road 5, Dhanmondi, Dhaka 1205, Bangladesh";
export const EN_HOURS = "Sat–Thu, 9:00 AM – 6:00 PM";
export const EN_ABOUT =
  "TexBridge Sourcing is a full-service garments buying house based in Dhaka, Bangladesh. Since 2015 we have connected buyers from 40+ countries with 120+ audited factories — covering sourcing, sampling, production follow-up, AQL quality control and shipment under one dedicated merchandising team.";

export const CAT_EN: Record<string, string> = {
  "সব": "All",
  "নিট": "Knit",
  "ওভেন": "Woven",
  "ডেনিম": "Denim",
  "সোয়েটার": "Sweater",
};

export const RFQ_STATUS_HI: Record<string, string> = {
  "নতুন": "नया",
  "কোটেশন পাঠানো হয়েছে": "कोटेशन भेजा गया",
  "স্যাম্পল চলছে": "सैंपलिंग जारी है",
  "কনফার্ম": "पुष्टि हो गई",
  "শিপড": "भेज दिया गया",
  "বাতিল": "रद्द किया गया",
};

export const CAT_HI: Record<string, string> = {
  "সব": "सभी",
  "নিট": "निट",
  "ওভেন": "वोवेन",
  "ডেনিম": "डेनिम",
  "সোয়েটার": "स्वेटर",
};

export const RFQ_STATUS_EN: Record<string, string> = {
  "নতুন": "New",
  "কোটেশন পাঠানো হয়েছে": "Quotation Sent",
  "স্যাম্পল চলছে": "Sampling in Progress",
  "কনফার্ম": "Confirmed",
  "শিপড": "Shipped",
  "বাতিল": "Cancelled",
};
