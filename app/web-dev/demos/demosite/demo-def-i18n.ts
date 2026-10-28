/**
 * Per-demo def-data translation (deep Americanization slice).
 *
 * Demo page bodies render def fields (name, hero text, categories, product /
 * service / gallery names) verbatim, so the gallery-layer EN translations
 * from earlier runs never reached the demo pages themselves. This module
 * adds English overlays, one demo at a time, and `localizeDemoDef` applies
 * them inside the DemositeProvider (see store.tsx) based on the demo's
 * client-side language:
 * - "bn" -> the original def, untouched (BN view is byte-identical).
 * - "en" or "hi" -> the overlay (Hindi falls back to English, same rule as
 *   demo-lang.tsx: strings not yet translated to Hindi render in English).
 * - A demo with no overlay entry renders exactly as before, in every language.
 *
 * Pure function, no React imports — safe to import from server components
 * (e.g. a demo page's generateMetadata) as well as the client store.
 */

import type { DemoSiteDef } from "./types";

export interface DemoDefEnOverlay {
  /** English demo name (must match the /demos gallery EN name). */
  name: string;
  type: string;
  /** English version of the engine def's `desc` (used for the About text). */
  desc: string;
  heroTitle: string;
  heroSub: string;
  /** Full English category list, same order as the def's `cats`. */
  cats: string[];
  /** Bangla category -> English category (for product/gallery `c` fields). */
  catMap: Record<string, string>;
  /** Bangla item name -> English item name (products, services, gallery). */
  itemNames: Record<string, string>;
}

/** English product-description templates, mirroring the Bangla DESCS in
 *  defs.ts (same index order) so descriptions stay consistent per product. */
const EN_DESCS = [
  (n: string, shop: string) =>
    `${n} — a bestseller at ${shop}. Carefully selected quality product, home delivery across the country.`,
  (n: string) =>
    `Premium-quality ${n}. Guaranteed original product, easy return policy.`,
  (n: string) =>
    `${n} now online! Limited stock — order today and get fast delivery.`,
  (n: string) =>
    `${n}, loved most by customers. At the best price, carefully packaged and delivered to your door.`,
];

const OVERLAYS: Record<string, DemoDefEnOverlay> = {
  cafe: {
    name: "Coffee House",
    type: "Cafe Website",
    desc: "A modern cafe site with a menu and online ordering.",
    heroTitle: "The address for the best coffee",
    heroSub: "Fresh brew • Home delivery",
    cats: ["All", "Coffee", "Food"],
    catMap: { "সব": "All", "কফি": "Coffee", "খাবার": "Food" },
    itemNames: {
      "ক্যাপাচিনো": "Cappuccino",
      "ক্যাফে ল্যাটে": "Cafe Latte",
      "এসপ্রেসো": "Espresso",
      "চকলেট কেক": "Chocolate Cake",
      "কুকিজ": "Cookies",
      "স্যান্ডউইচ": "Sandwich",
    },
  },
};

/**
 * Returns the def localized for `lang`. Returns the SAME object when
 * lang is "bn" or when the demo has no overlay — so untouched demos and
 * the BN view can never regress.
 */
export function localizeDemoDef(def: DemoSiteDef, lang: string): DemoSiteDef {
  if (lang === "bn") return def;
  const ov = OVERLAYS[def.slug];
  if (!ov) return def;
  const cat = (c: string) => ov.catMap[c] ?? c;
  const item = (n: string) => ov.itemNames[n] ?? n;
  return {
    ...def,
    name: ov.name,
    type: ov.type,
    heroTitle: ov.heroTitle,
    heroSub: ov.heroSub,
    cats: ov.cats,
    about:
      `${ov.name} — ${ov.type}. ${ov.desc} ` +
      `We are committed to giving every customer the best quality, honest prices and sincere service. ` +
      `Your trust is our greatest achievement.`,
    products: def.products.map((p, i) => ({
      ...p,
      n: item(p.n),
      c: cat(p.c),
      desc: EN_DESCS[i % EN_DESCS.length](item(p.n), ov.name),
    })),
    services: def.services.map((s) => ({ ...s, n: item(s.n) })),
    gallery: def.gallery.map((g) => ({ ...g, t: item(g.t), c: cat(g.c) })),
  };
}
