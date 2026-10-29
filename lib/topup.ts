export type TopUpPackage = {
  id: string;
  name: string;
  kind: string;
  diamonds: number;
  bonus: number;
  price_bdt: number;
  old_price_bdt: number | null;
  badge: string | null;
  sort: number;
  is_active: boolean;
};

export type TopUpOrder = {
  id: string;
  player_uid: string;
  phone: string;
  package_name: string;
  diamonds: number;
  price_bdt: number;
  payment_method: string;
  sender_number: string;
  trx_id: string;
  status: "pending" | "approved" | "delivered" | "rejected";
  admin_note: string | null;
  created_at: string;
};

/** Free Fire UID: numeric, 6–12 digits */
export function isValidUid(uid: string): boolean {
  return /^[0-9]{6,12}$/.test(uid.trim());
}

export function topupStatusBn(s: string): string {
  switch (s) {
    case "pending":
      return "⏳ পেমেন্ট যাচাই চলছে";
    case "approved":
      return "✅ পেমেন্ট কনফার্মড";
    case "delivered":
      return "🎉 ডেলিভারড";
    case "rejected":
      return "❌ বাতিল";
    default:
      return s;
  }
}

const BN_DIGITS = "০১২৩৪৫৬৭৮৯";

/** Bangla digits → Latin digits (names/badges are stored in Bangla in the DB). */
function latinDigits(s: string): string {
  return s.replace(/[০-৯]/g, (d) => String(BN_DIGITS.indexOf(d)));
}

/**
 * Render-layer translation of a stored top-up package name for EN/HI views.
 * BN view returns the stored name unchanged; unknown names pass through with
 * Latin digits only, so no new package name is ever invented.
 */
export function translateTopupPackageName(name: string, lang: string): string {
  if (lang === "bn") return name;
  const hi = lang === "hi";
  let s = latinDigits(name);
  s = s.replace(/স্পেশাল এয়ারড্রপ প্যাক/g, hi ? "स्पेशल एयरड्रॉप पैक" : "Special Airdrop Pack");
  s = s.replace(/ডায়মন্ড/g, hi ? "डायमंड" : "diamonds");
  s = s.replace(/মেম্বারশিপ/g, hi ? "मेंबरशिप" : "Membership");
  s = s.replace(/কম্বো/g, hi ? "कॉम्बो" : "Combo");
  s = s.replace(/অফার/g, hi ? "ऑफर" : "Offer");
  return s;
}

const TOPUP_BADGE_EN: Record<string, string> = {
  "জনপ্রিয়": "Popular",
  "বেস্ট ভ্যালু": "Best Value",
  "হোলসেল": "Wholesale",
  "সাশ্রয়ী": "Budget-Friendly",
  "নতুন": "New",
  "নতুন অফার": "New Offer",
  "কম্বো অফার": "Combo Offer",
};

const TOPUP_BADGE_HI: Record<string, string> = {
  "জনপ্রিয়": "लोकप्रिय",
  "বেস্ট ভ্যালু": "बेस्ट वैल्यू",
  "হোলসেল": "होलसेल",
  "সাশ্রয়ী": "किफायती",
  "নতুন": "नया",
  "নতুন অফার": "नया ऑफर",
  "কম্বো অফার": "कॉम्बो ऑफर",
};

/**
 * Render-layer translation of a stored package badge for EN/HI views.
 * Any leading emoji is preserved; an unknown badge passes through with Latin
 * digits only. BN view returns the stored badge unchanged.
 */
export function translateTopupBadge(badge: string, lang: string): string {
  if (lang === "bn") return badge;
  const prefix = badge.match(/^[^\p{L}\p{N}]+/u)?.[0] ?? "";
  const rest = badge.slice(prefix.length).trim();
  const map = lang === "hi" ? TOPUP_BADGE_HI : TOPUP_BADGE_EN;
  const translated = map[rest] ?? latinDigits(rest);
  return prefix ? `${prefix.trimEnd()} ${translated}` : translated;
}

export function payMethodBn(m: string): string {
  const k = m.toLowerCase();
  if (k.includes("bkash")) return "বিকাশ";
  if (k.includes("nagad")) return "নগদ";
  if (k.includes("rocket")) return "রকেট";
  return m;
}
