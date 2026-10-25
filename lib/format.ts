const BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

/** 1234567 -> "১২,৩৪,৫৬৭" */
export function toBnDigits(input: string | number): string {
  return String(input).replace(/[0-9]/g, (d) => BN_DIGITS[Number(d)]);
}

/** 1999 -> "১,৯৯৯ টাকা" (৳ glyph renders like ৮ on some phones — use the word) */
export function formatBDT(amount: number): string {
  const grouped = amount.toLocaleString("en-IN");
  return `${toBnDigits(grouped)} টাকা`;
}

/**
 * Public USD display rate: 1 USD = 123.71 BDT (Bangladesh Bank spot reference
 * rate, 25 Oct 2026). Public USD figures are converted equivalents of the Tk
 * price — never invented round prices. BD checkout settlement stays in Tk.
 */
export const BDT_PER_USD = 123.71;

/** 1999 -> "$16.16" (converted equivalent at BDT_PER_USD, 2 decimals) */
export function formatUSD(amountBdt: number): string {
  return `$${(amountBdt / BDT_PER_USD).toFixed(2)}`;
}

/** 1999 -> "1,999 Tk" (Latin digits, for EN/HI views where the Tk amount
 *  actually charged must still be shown, e.g. the manual-pay amount). */
export function formatTk(amountBdt: number): string {
  return `${amountBdt.toLocaleString("en-US")} Tk`;
}

/** "DP-20261008-A1B2" style order numbers */
export function generateOrderNumber(): string {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(
    d.getDate()
  ).padStart(2, "0")}`;
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `DP-${ymd}-${rand}`;
}

export const ORDER_STATUS_BN: Record<string, string> = {
  pending: "অপেক্ষমাণ",
  payment_pending: "পেমেন্ট প্রক্রিয়াধীন",
  paid: "পেমেন্ট সম্পন্ন",
  delivered: "ডেলিভারি সম্পন্ন",
  keys_pending: "কী প্রস্তুত হচ্ছে",
  service_pending: "সার্ভিস অর্ডার",
  cancelled: "বাতিল",
  refunded: "রিফান্ডেড",
};

export const PAYMENT_METHOD_BN: Record<string, string> = {
  sslcommerz: "কার্ড / মোবাইল ব্যাংকিং",
  bkash: "বিকাশ",
  nagad: "নগদ",
  rocket: "রকেট",
  wallet: "ওয়ালেট ব্যালেন্স",
};

/** How the customer should send money to a manual payment number. */
export const PAYMENT_KIND_BN: Record<string, string> = {
  sendmoney: "সেন্ড মানি",
  payment: "পেমেন্ট",
  cashout: "ক্যাশ আউট",
  merchant: "পেমেন্ট", // legacy value → পেমেন্ট
};

export function paymentKindBn(kind?: string | null): string {
  return PAYMENT_KIND_BN[kind || ""] || "পেমেন্ট";
}

/** A manual payment method is live when it has a number and isn't switched off. */
export function isPaymentMethodLive(
  info: { number?: string; enabled?: boolean } | string | null | undefined
): boolean {
  if (!info) return false;
  if (typeof info === "string") return info.trim() !== "";
  return !!(info.number && info.number.trim() && info.enabled !== false);
}

export function timeAgo(iso: string): string {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "এইমাত্র";
  const m = Math.floor(s / 60);
  if (m < 60) return `${toBnDigits(m)} মিনিট আগে`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${toBnDigits(h)} ঘণ্টা আগে`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${toBnDigits(d)} দিন আগে`;
  return new Date(iso).toLocaleDateString("bn-BD");
}
