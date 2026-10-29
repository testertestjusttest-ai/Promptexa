/**
 * Demo def-data localization (deep Americanization slice).
 *
 * Demo page bodies render def fields verbatim. Most def content (names,
 * hero text, products, services) is already English-first via the agency
 * overrides in agency-demo-overrides.ts — every demo route applies them —
 * so a per-demo overlay here would only duplicate or downgrade that copy
 * (tried for cafe in commit cd14943c and reverted for exactly that reason).
 *
 * The ONE def surface the overrides still leave Bangla is the shared
 * contact block: defs.ts CONTACT / ADDRESS / HOURS render verbatim on
 * demo contact, about, FAQ and chrome-footer surfaces. This module maps
 * exactly those three shared values to faithful English in the EN/HI view:
 * - "bn" -> the original def, untouched (BN view is byte-identical).
 * - "en" or "hi" -> the English contact block (Hindi falls back to
 *   English, same rule as demo-lang.tsx).
 * - A def whose contact block already differs (custom values, or a demo
 *   with its own language system) is returned untouched: matching is by
 *   exact string equality, never by guessing.
 * - "buyinghouse" is excluded: its bh-lang system already owns its
 *   contact rendering (including its own EN_ADDRESS/EN_HOURS).
 *
 * Pure function, no React imports — safe to import from server components
 * as well as the client store (see store.tsx liveDef).
 */

import type { DemoSiteDef } from "./types";

/** Exact shared values from defs.ts (CONTACT / ADDRESS / HOURS). */
const BN_CONTACT = "০১৮৩৩৪০২৫৮৬";
const BN_ADDRESS = "বাড়ি ১২, রোড ৫, ধানমন্ডি, ঢাকা-১২০৫";
const BN_HOURS = "প্রতিদিন সকাল ৯টা – রাত ১০টা";

/** Faithful English equivalents (same number, same address, same hours). */
const EN_CONTACT = "01833402586";
const EN_ADDRESS = "House 12, Road 5, Dhanmondi, Dhaka 1205";
const EN_HOURS = "Every day, 9 AM – 10 PM";

/**
 * Returns the def localized for `lang`. Returns the SAME object when
 * lang is "bn", when the demo is buyinghouse, or when the def carries no
 * shared Bangla contact block — so untouched demos can never regress.
 */
export function localizeDemoDef(def: DemoSiteDef, lang: string): DemoSiteDef {
  if (lang === "bn") return def;
  if (def.slug === "buyinghouse") return def;
  if (
    def.contact !== BN_CONTACT &&
    def.address !== BN_ADDRESS &&
    def.hours !== BN_HOURS
  ) {
    return def;
  }
  return {
    ...def,
    contact: def.contact === BN_CONTACT ? EN_CONTACT : def.contact,
    address: def.address === BN_ADDRESS ? EN_ADDRESS : def.address,
    hours: def.hours === BN_HOURS ? EN_HOURS : def.hours,
  };
}
