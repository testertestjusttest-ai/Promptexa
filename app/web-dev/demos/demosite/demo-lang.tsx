"use client";

/**
 * Per-demo language provider — Phase 1, mounted ONLY by reworked demos
 * (bakery, salon so far). It deliberately does NOT change legacy demos:
 * when no provider is mounted, DemoSite chrome keeps its current Bangla
 * strings exactly as before (see chrome.tsx: useDemoLangOpt() returns null
 * and the old strings are used).
 *
 * Rules, same as the agency system (lib/agency-lang.tsx):
 * - Default is English. No Bangla word in a reworked demo's default view.
 * - Switch lives inside the demo's hamburger drawer (chrome.tsx) — never a
 *   header pill.
 * - Fallback: strings not yet translated to Hindi render in English.
 *   Full translation of shared engine page bodies (shop-pages, other-pages)
 *   is Phase 2 work; Phase 1 flips the def content, the shop/service nav,
 *   and the drawer switcher.
 */

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type DemoLang = "en" | "bn" | "hi";

export const DEMO_LANG_KEY = "dp-demo-lang";

export interface DemoLangCtx {
  lang: DemoLang;
  setLang: (l: DemoLang) => void;
  /** English-first pick: en -> en, bn -> bn, hi -> hi (hi falls back to en). */
  L: (en: string, bn: string, hi?: string) => string;
}

/** Null when no provider is mounted (legacy demo) — callers must fall back
 *  to the existing Bangla strings in that case. */
const Ctx = createContext<DemoLangCtx | null>(null);

export function DemoLangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<DemoLang>("en");
  useEffect(() => {
    try {
      const v = localStorage.getItem(DEMO_LANG_KEY);
      if (v === "en" || v === "bn" || v === "hi") setLangState(v);
    } catch {
      /* ignore */
    }
  }, []);
  const setLang = (l: DemoLang) => {
    setLangState(l);
    try {
      localStorage.setItem(DEMO_LANG_KEY, l);
    } catch {
      /* ignore */
    }
  };
  return (
    <Ctx.Provider
      value={{
        lang,
        setLang,
        L: (en, bn, hi) => (lang === "bn" ? bn : lang === "hi" ? (hi ?? en) : en),
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

/** Returns the demo language context, or null for legacy (unreworked) demos. */
export function useDemoLangOpt(): DemoLangCtx | null {
  return useContext(Ctx);
}

/** Language switcher for the demo drawer (never a header pill). */
export function DemoLangSwitcher({ accent }: { accent: string }) {
  const ctx = useDemoLangOpt();
  if (!ctx) return null;
  const opts: { id: DemoLang; label: string }[] = [
    { id: "en", label: "English" },
    { id: "bn", label: "বাংলা" },
    { id: "hi", label: "हिन्दी" },
  ];
  return (
    <div className="flex gap-2">
      {opts.map((o) => {
        const active = ctx.lang === o.id;
        return (
          <button
            key={o.id}
            onClick={() => ctx.setLang(o.id)}
            className="flex-1 rounded-xl py-2.5 text-sm font-black transition"
            style={active ? { background: accent, color: "#fff" } : undefined}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
