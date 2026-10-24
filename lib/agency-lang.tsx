"use client";

/**
 * Agency language system — Phase 1 of the DigiPlyra agency transformation.
 *
 * HARD RULE (user, 2026-10-24): the whole site is ENGLISH by default, with
 * NOT a single Bangla word in the default view. A language switch inside the
 * hamburger drawer and in Settings flips the ENTIRE site and admin to Bangla,
 * and Hindi is offered the same way. There is deliberately NO header pill:
 * the switcher component in this file is rendered only inside a drawer or a
 * Settings card, never in a navbar.
 *
 * Design:
 * - Default language is "en" — including the server render, so the default
 *   view can never flash Bangla while hydration catches up.
 * - The choice persists in localStorage ("dp-agency-lang"). On later phases
 *   the same key can be mirrored to the signed-in admin profile (see the
 *   transformation plan) so the admin default follows the user.
 * - Fallback rule: any string not yet translated to Bangla/Hindi falls back
 *   to English, never to another language's string. Phase 1 translates the
 *   agency homepage chrome + packages; full-site coverage is a later phase
 *   (see agency-transformation-plan.md).
 * - Digits: Bangla digits in "bn", Latin digits in "en" and "hi".
 *   Prices use the word "Tk" in English/Hindi views and "টাকা" in Bangla
 *   views. The ৳ glyph is never used (it renders like ৮ on some phones).
 */

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type AgencyLang = "en" | "bn" | "hi";

export const AGENCY_LANG_KEY = "dp-agency-lang";

const BN_DIGITS = "০১২৩৪৫৬৭৮৯";

export function toBnDigitsStr(input: string | number): string {
  return String(input).replace(/[0-9]/g, (d) => BN_DIGITS[Number(d)]);
}

export interface AgencyLangCtx {
  lang: AgencyLang;
  setLang: (l: AgencyLang) => void;
  /** Pick a string by language: English first, then Bangla, then Hindi. */
  tx: (en: string, bn: string, hi: string) => string;
  /** Format a number for the current language. */
  num: (v: number | string) => string;
  /** Format a BDT price for the current language ("4,999 Tk" / "৪,৯৯৯ টাকা"). */
  price: (amount: number) => string;
}

const Ctx = createContext<AgencyLangCtx>({
  lang: "en",
  setLang: () => {},
  tx: (en) => en,
  num: (v) => String(v),
  price: (amount) => `${amount.toLocaleString("en-US")} Tk`,
});

export function AgencyLangProvider({ children }: { children: ReactNode }) {
  // Default "en" on purpose: the default view must be English even before
  // any stored preference is read.
  const [lang, setLangState] = useState<AgencyLang>("en");

  useEffect(() => {
    try {
      const v = localStorage.getItem(AGENCY_LANG_KEY);
      if (v === "en" || v === "bn" || v === "hi") {
        setLangState(v);
        return;
      }
    } catch {
      /* ignore */
    }
    // No saved choice (new visitor): ask the server for the admin-set site
    // default (Phase 5, /api/public/site-language). Falls back to "en" on
    // any failure, so the default view is always English-first. A saved
    // visitor choice above always wins over the site default.
    fetch("/api/public/site-language")
      .then((r) => r.json())
      .then((d) => {
        if (d?.default_lang === "bn" || d?.default_lang === "hi") setLangState(d.default_lang);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    try {
      document.documentElement.lang = lang === "bn" ? "bn" : lang === "hi" ? "hi" : "en";
    } catch {
      /* ignore */
    }
  }, [lang]);

  const setLang = (l: AgencyLang) => {
    setLangState(l);
    try {
      localStorage.setItem(AGENCY_LANG_KEY, l);
    } catch {
      /* ignore */
    }
  };

  const value: AgencyLangCtx = {
    lang,
    setLang,
    tx: (en, bn, hi) => (lang === "bn" ? bn : lang === "hi" ? hi : en),
    num: (v) => (lang === "bn" ? toBnDigitsStr(v) : String(v)),
    price: (amount) =>
      lang === "bn"
        ? `${toBnDigitsStr(amount.toLocaleString("en-US"))} টাকা`
        : `${amount.toLocaleString("en-US")} Tk`,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAgencyLang(): AgencyLangCtx {
  return useContext(Ctx);
}

/**
 * Language switcher — render ONLY inside a hamburger drawer or a Settings
 * card. Never render this in a header/navbar (no header pill, per the user).
 */
export function AgencyLangSwitcher({ dark = true }: { dark?: boolean }) {
  const { lang, setLang } = useAgencyLang();
  const opts: { id: AgencyLang; label: string }[] = [
    { id: "en", label: "English" },
    { id: "bn", label: "বাংলা" },
    { id: "hi", label: "हिन्दी" },
  ];
  return (
    <div className="flex gap-2">
      {opts.map((o) => {
        const active = lang === o.id;
        return (
          <button
            key={o.id}
            onClick={() => setLang(o.id)}
            className={`flex-1 rounded-xl py-2.5 text-sm font-black transition ${
              active
                ? "bg-[#d7ff3f] text-black shadow-lg"
                : dark
                  ? "bg-white/10 text-white hover:bg-white/20"
                  : "bg-slate-100 text-slate-800 hover:bg-slate-200"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
