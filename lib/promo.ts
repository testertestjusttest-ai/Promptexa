/**
 * Promo code validation — shared by the public validate API and /api/checkout.
 * Discount is always percent-based, computed server-side from DB prices.
 */

export type PromoRow = {
  id: string;
  code: string;
  label_bn: string | null;
  discount_percent: number;
  max_uses: number | null;
  used_count: number;
  min_order_bdt: number;
  expires_at: string | null;
  is_active: boolean;
};

/** Normalize to a safe uppercase code: letters+digits only, max 24 chars. */
export function normalizePromoCode(raw: string): string {
  return (raw || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 24);
}

// Loose structural type — accepts the real Supabase client (thenable builders).
type Db = { from: (t: string) => any };

export async function getValidPromo(
  svc: Db,
  code: string,
  totalBdt: number
): Promise<
  | { ok: true; promo: PromoRow; discount_bdt: number }
  | { ok: false; error: string }
> {
  const norm = normalizePromoCode(code);
  if (!norm) return { ok: false, error: "প্রোমো কোড দিন" };
  const { data: promo } = await svc
    .from("promo_codes")
    .select("*")
    .eq("code", norm)
    .single();
  if (!promo || !promo.is_active)
    return { ok: false, error: "ভুল বা নিষ্ক্রিয় প্রোমো কোড" };
  if (promo.expires_at && new Date(promo.expires_at) < new Date())
    return { ok: false, error: "এই কোডের মেয়াদ শেষ হয়ে গেছে" };
  if (promo.max_uses != null && promo.used_count >= promo.max_uses)
    return { ok: false, error: "এই কোডের ব্যবহার সীমা শেষ" };
  if (totalBdt < (promo.min_order_bdt || 0))
    return {
      ok: false,
      error: `কমপক্ষে ${promo.min_order_bdt} টাকার অর্ডারে প্রযোজ্য`,
    };
  const discount_bdt = Math.floor((totalBdt * promo.discount_percent) / 100);
  if (discount_bdt <= 0)
    return { ok: false, error: "এই অর্ডারে ছাড় প্রযোজ্য নয়" };
  return { ok: true, promo, discount_bdt };
}
