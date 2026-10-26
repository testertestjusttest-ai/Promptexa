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

/**
 * Plan labels are admin-entered Bangla ("১ মাস", "১২ মাস", "১ বছর",
 * "আজীবন"). Translate the common duration patterns for EN/HI views;
 * unknown/English labels pass through. BN view returns the label as-is.
 */
export function translatePlanLabel(label: string, lang: string): string {
  if (lang === "bn") return label;
  const BN_DIGIT = "০১২৩৪৫৬৭৮৯";
  const latin = label
    .replace(/[০-৯]/g, (d) => String(BN_DIGIT.indexOf(d)))
    .trim();
  const num = (unit: string, en: string, hi: string) => {
    const m = latin.match(new RegExp(`^(\\d+)\\s*${unit}`));
    if (!m) return null;
    const n = Number(m[1]);
    return lang === "hi" ? `${n} ${hi}` : `${n} ${en}${n > 1 ? "s" : ""}`;
  };
  return (
    num("মাস", "month", "महीना") ??
    num("বছর", "year", "साल") ??
    num("দিন", "day", "दिन") ??
    (latin.includes("আজীবন") ? (lang === "hi" ? "आजीवन" : "Lifetime") : latin)
  );
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

/** Order-status display label per language (dashboard + order history). */
export const ORDER_STATUS_EN: Record<string, string> = {
  pending: "Pending",
  payment_pending: "Payment Processing",
  paid: "Payment Complete",
  delivered: "Delivered",
  keys_pending: "Key Being Prepared",
  service_pending: "Service Order",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

export const ORDER_STATUS_HI: Record<string, string> = {
  pending: "लंबित",
  payment_pending: "भुगतान प्रक्रिया में है",
  paid: "भुगतान पूरा हो गया",
  delivered: "डिलीवर हो गया",
  keys_pending: "की तैयार की जा रही है",
  service_pending: "सर्विस ऑर्डर",
  cancelled: "रद्द कर दिया गया",
  refunded: "रिफ़ंड हो गया",
};

export function orderStatusLabel(status: string, lang: string): string {
  if (lang === "hi") return ORDER_STATUS_HI[status] ?? status;
  if (lang === "en") return ORDER_STATUS_EN[status] ?? status;
  return ORDER_STATUS_BN[status] ?? status;
}

/** Dashboard/order-history price: Bangla Tk in BN view; USD equivalent +
 *  the Tk amount actually charged in EN/HI views (same rule as checkout). */
export function displayPrice(amountBdt: number, lang: string): string {
  if (lang === "bn") return formatBDT(amountBdt);
  return `${formatUSD(amountBdt)} (${formatTk(amountBdt)})`;
}

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

/** Payment-method display name per language. Brand names are the checkout
 *  payment options in every language — Bangla script in BN view, the
 *  brands' Latin spellings (bKash/Nagad/Rocket) in EN/HI views, so the
 *  default English view carries no Bangla script. */
export function paymentMethodLabel(method: string, lang: string): string {
  if (lang === "bn") return PAYMENT_METHOD_BN[method] ?? method;
  if (method === "sslcommerz") return lang === "hi" ? "कार्ड / मोबाइल बैंकिंग" : "Card / Mobile Banking";
  if (method === "wallet") return lang === "hi" ? "वॉलेट बैलेंस" : "Wallet Balance";
  const LATIN: Record<string, string> = { bkash: "bKash", nagad: "Nagad", rocket: "Rocket" };
  return LATIN[method] ?? method;
}

/** How the customer should send money, per language. */
export function paymentKindLabel(kind: string | null | undefined, lang: string): string {
  if (lang === "bn") return paymentKindBn(kind);
  const k = kind || "sendmoney";
  if (lang === "hi") {
    return k === "cashout" ? "कैश आउट" : k === "sendmoney" ? "सेंड मनी" : "भुगतान";
  }
  return k === "cashout" ? "Cash Out" : k === "sendmoney" ? "Send Money" : "Payment";
}

/** A manual payment method is live when it has a number and isn't switched off. */
export function isPaymentMethodLive(
  info: { number?: string; enabled?: boolean } | string | null | undefined
): boolean {
  if (!info) return false;
  if (typeof info === "string") return info.trim() !== "";
  return !!(info.number && info.number.trim() && info.enabled !== false);
}

/** Relative time; lang defaults to "bn" (all existing callers). EN/HI
 *  views pass their language so public pages carry no Bangla script. */
export function timeAgo(iso: string, lang?: string): string {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (lang === "en") {
    if (s < 60) return "just now";
    const m = Math.floor(s / 60);
    if (m < 60) return `${m} min ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h} hour${h > 1 ? "s" : ""} ago`;
    const d = Math.floor(h / 24);
    if (d < 30) return `${d} day${d > 1 ? "s" : ""} ago`;
    return new Date(iso).toLocaleDateString("en-US");
  }
  if (lang === "hi") {
    if (s < 60) return "अभी";
    const m = Math.floor(s / 60);
    if (m < 60) return `${m} मिनट पहले`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h} घंटे पहले`;
    const d = Math.floor(h / 24);
    if (d < 30) return `${d} दिन पहले`;
    return new Date(iso).toLocaleDateString("hi-IN");
  }
  if (s < 60) return "এইমাত্র";
  const m = Math.floor(s / 60);
  if (m < 60) return `${toBnDigits(m)} মিনিট আগে`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${toBnDigits(h)} ঘণ্টা আগে`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${toBnDigits(d)} দিন আগে`;
  return new Date(iso).toLocaleDateString("bn-BD");
}
