import { createClient } from "./supabase/server";
import type { Category, Product, Slide } from "./types";

/** product_id → unused key count (public-safe RPC, no key text exposed) */
async function getStockMap(): Promise<Record<string, number>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("get_product_stock");
    if (error || !data) return {};
    const map: Record<string, number> = {};
    for (const row of data as { product_id: string; stock: number }[]) {
      map[row.product_id] = row.stock;
    }
    return map;
  } catch {
    return {};
  }
}

/** Safe catalogue reads — return [] when DB/env is unavailable (build-safe). */
export async function getCategories(): Promise<Category[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("sort");
    if (error) throw error;
    return (data ?? []) as Category[];
  } catch {
    return [];
  }
}

export async function getProducts(featuredOnly = false): Promise<Product[]> {
  try {
    const supabase = await createClient();
    let q = supabase
      .from("products")
      .select(
        "*, category:categories(*), plans!inner(*)"
      )
      .eq("is_active", true)
      .eq("plans.is_active", true)
      .order("sort");
    if (featuredOnly) q = q.eq("is_featured", true);
    const { data, error } = await q;
    if (error) throw error;
    const products = (data ?? []) as Product[];
    const stock = await getStockMap();
    // sort plans inside each product + attach stock
    for (const p of products) {
      p.plans = (p.plans ?? []).sort((a, b) => a.sort - b.sort);
      if (stock[p.id] !== undefined) p.stock = stock[p.id];
    }
    return products;
  } catch {
    return [];
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select("*, category:categories(*), plans(*)")
      .eq("slug", slug)
      .eq("is_active", true)
      .single();
    if (error || !data) return null;
    const product = data as Product;
    product.plans = (product.plans ?? [])
      .filter((p) => p.is_active !== false)
      .sort((a, b) => a.sort - b.sort);
    const stock = await getStockMap();
    if (stock[product.id] !== undefined) product.stock = stock[product.id];
    return product;
  } catch {
    return null;
  }
}

export async function getSlides(): Promise<Slide[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("slides")
      .select("*")
      .eq("is_active", true)
      .order("sort");
    if (error) throw error;
    return (data ?? []) as Slide[];
  } catch {
    return [];
  }
}

export type AdPlacement =
  | "home_top"
  | "home_bottom"
  | "product_page"
  | "popup"
  | "sitewide"
  | "earn_top"
  | "earn_bottom";

export interface AdSlotDef {
  id: string;
  name: string;
  placement: AdPlacement;
  code: string;
  enabled: boolean;
}

export interface AdsConfig {
  master_enabled: boolean;
  slots: AdSlotDef[];
}

const DEFAULT_ADS: AdsConfig = {
  master_enabled: true,
  slots: [
    { id: "home_top", name: "হোম পেজ — উপরে", placement: "home_top", code: "", enabled: true },
    { id: "home_bottom", name: "হোম পেজ — নিচে", placement: "home_bottom", code: "", enabled: true },
    { id: "product_page", name: "প্রোডাক্ট পেজ", placement: "product_page", code: "", enabled: true },
    { id: "popup", name: "পপআপ", placement: "popup", code: "", enabled: false },
    { id: "earn_top", name: "আয় পেজ — উপরে", placement: "earn_top", code: "", enabled: true },
    { id: "earn_bottom", name: "আয় পেজ — নিচে", placement: "earn_bottom", code: "", enabled: true },
    {
      id: "monetag_3524319",
      name: "Monetag Zone 3524319",
      placement: "sitewide",
      code: '<script data-cfasync="false" async type="text/javascript" src="//3nbf4.com/act/files/tag.min.js?z=3524319"></script>',
      enabled: true,
    },
    { id: "monetag_tag_292918", name: "Monetag Tag 292918", placement: "sitewide", code: '<script src="https://quge5.com/88/tag.min.js" data-zone="292918" async data-cfasync="false"></script>', enabled: false },
    { id: "monetag_tag_11989815", name: "Monetag Tag 11989815", placement: "sitewide", code: '<script>(function(s){s.dataset.zone=\'11989815\',s.src=\'https://al5sm.com/tag.min.js\'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement(\'script\')))</script>', enabled: false },
    { id: "monetag_tag_11989823", name: "Monetag Tag 11989823", placement: "sitewide", code: '<script src="https://5gvci.com/act/files/tag.min.js?z=11989823" data-cfasync="false" async></script>', enabled: false },
    { id: "monetag_tag_11989833", name: "Monetag Tag 11989833", placement: "sitewide", code: '<script>(function(s){s.dataset.zone=\'11989833\',s.src=\'https://nap5k.com/tag.min.js\'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement(\'script\')))</script>', enabled: false },
    { id: "monetag_vignette_11989834", name: "Monetag Vignette 11989834", placement: "sitewide", code: '<script>(function(s){s.dataset.zone=\'11989834\',s.src=\'https://n6wxm.com/vignette.min.js\'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement(\'script\')))</script>', enabled: false },
    { id: "monetag_smartlink_11989836", name: "Monetag SmartLink 11989836", placement: "sitewide", code: '<!-- Monetag SmartLink: https://uplcm.com/4/11989836 -->', enabled: false },
  ],
};

/** Normalize old flat ads config (v2) into the slot structure. */
function normalizeAds(raw: unknown): AdsConfig {
  const v = (raw ?? {}) as Record<string, unknown>;
  if (Array.isArray(v.slots)) {
    return {
      master_enabled: v.master_enabled !== false,
      slots: (v.slots as AdSlotDef[]).filter((s) => s && typeof s.id === "string"),
    };
  }
  // legacy flat shape → slots
  const str = (k: string) => (typeof v[k] === "string" ? (v[k] as string) : "");
  return {
    master_enabled: v.enabled !== false,
    slots: DEFAULT_ADS.slots.map((s) =>
      s.id === "monetag_3524319"
        ? s
        : { ...s, code: str(s.placement === "popup" ? "popup" : s.id) }
    ),
  };
}

export async function getAdsConfig(): Promise<AdsConfig> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "ads")
      .single();
    return normalizeAds(data?.value);
  } catch {
    return DEFAULT_ADS;
  }
}

/** Slots currently allowed to render (master on + slot enabled + has code). */
export function activeSlots(ads: AdsConfig, placement: AdPlacement): AdSlotDef[] {
  if (!ads.master_enabled) return [];
  return ads.slots.filter((s) => s.placement === placement && s.enabled && s.code.trim() !== "");
}

export type PaymentNumberInfo = {
  number: string;
  kind: "merchant" | "sendmoney";
  image: string;
};

/** Normalize legacy string values → { number, kind, image }. */
export function normalizePaymentNumbers(
  raw: Record<string, unknown>
): Record<string, PaymentNumberInfo> {
  const out: Record<string, PaymentNumberInfo> = {};
  for (const [k, v] of Object.entries(raw ?? {})) {
    if (typeof v === "string") {
      out[k] = { number: v, kind: "merchant", image: "" };
    } else if (v && typeof v === "object") {
      const o = v as Record<string, unknown>;
      out[k] = {
        number: String(o.number ?? ""),
        kind: o.kind === "sendmoney" ? "sendmoney" : "merchant",
        image: String(o.image ?? ""),
      };
    }
  }
  return out;
}

export async function getPaymentNumbers(): Promise<Record<string, PaymentNumberInfo>> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "payment_numbers")
      .single();
    return normalizePaymentNumbers((data?.value as Record<string, unknown>) ?? {});
  } catch {
    return {};
  }
}

export async function getStoreInfo(): Promise<{
  name: string;
  tagline: string;
  support_whatsapp: string;
  notice_bn: string;
}> {
  const fallback = {
    name: "DigiPlyra",
    tagline: "অরিজিনাল প্রিমিয়াম সাবস্ক্রিপশন, সবচেয়ে কম দামে",
    support_whatsapp: "",
    notice_bn: "ডেলিভারি সাধারণত পেমেন্টের ৫–৩০ মিনিটের মধ্যে সম্পন্ন হয়।",
  };
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "store")
      .single();
    return { ...fallback, ...((data?.value as object) ?? {}) };
  } catch {
    return fallback;
  }
}
