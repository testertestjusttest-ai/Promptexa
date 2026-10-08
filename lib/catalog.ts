import { createClient } from "./supabase/server";
import type { Category, Product } from "./types";

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
    // sort plans inside each product
    for (const p of products) {
      p.plans = (p.plans ?? []).sort((a, b) => a.sort - b.sort);
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
    return product;
  } catch {
    return null;
  }
}

export async function getPaymentNumbers(): Promise<Record<string, string>> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "payment_numbers")
      .single();
    return (data?.value as Record<string, string>) ?? {};
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
