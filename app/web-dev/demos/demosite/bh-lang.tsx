"use client";

/** Buying-house language system — English is the default; switching to
 * Bangla flips the ENTIRE buying-house site + admin to Bangla.
 * Persisted in localStorage ("texbridge_lang"). Other demo layouts never
 * mount the provider, so the context default keeps them untouched.
 */

import { createContext, useContext, useEffect, useState } from "react";
import { toBnDigits } from "@/lib/format";

export type BhLang = "en" | "bn";

export interface BhCtx {
  lang: BhLang;
  setLang: (l: BhLang) => void;
  /** pick a string by language */
  tx: (bn: string, en: string) => string;
  /** number formatting: Bangla digits in bn, Latin in en */
  num: (v: number | string) => string;
  /** convert embedded Bangla digits in a string to Latin when lang=en */
  dg: (s: string) => string;
}

const BN_DIGITS = "০১২৩৪৫৬৭৮৯";
export const toEnDigits = (s: string) => s.replace(/[০-৯]/g, (d) => String(BN_DIGITS.indexOf(d)));

const Ctx = createContext<BhCtx>({
  lang: "bn",
  setLang: () => {},
  tx: (bn) => bn,
  num: (v) => toBnDigits(v as number),
  dg: (s) => s,
});

export function BhLangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<BhLang>("en");
  useEffect(() => {
    try {
      const v = localStorage.getItem("texbridge_lang");
      if (v === "bn" || v === "en") setLangState(v);
    } catch { /* ignore */ }
  }, []);
  const setLang = (l: BhLang) => {
    setLangState(l);
    try { localStorage.setItem("texbridge_lang", l); } catch { /* ignore */ }
  };
  const value: BhCtx = {
    lang,
    setLang,
    tx: (bn, en) => (lang === "en" ? en : bn),
    num: (v) => (lang === "en" ? String(v) : toBnDigits(v as number)),
    dg: (s) => (lang === "en" ? toEnDigits(s) : s),
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
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

export const RFQ_STATUS_EN: Record<string, string> = {
  "নতুন": "New",
  "কোটেশন পাঠানো হয়েছে": "Quotation Sent",
  "স্যাম্পল চলছে": "Sampling in Progress",
  "কনফার্ম": "Confirmed",
  "শিপড": "Shipped",
  "বাতিল": "Cancelled",
};
