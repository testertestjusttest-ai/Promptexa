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

export function payMethodBn(m: string): string {
  const k = m.toLowerCase();
  if (k.includes("bkash")) return "বিকাশ";
  if (k.includes("nagad")) return "নগদ";
  if (k.includes("rocket")) return "রকেট";
  return m;
}
