export const DEAL_BN: Record<string, string> = {
  awaiting_payment: "পেমেন্ট বাকি",
  paid_to_admin: "অ্যাডমিনের কাছে টাকা ✅",
  id_delivered: "আইডি বুঝিয়ে দেওয়া হয়েছে",
  completed: "সম্পন্ন ✅",
  disputed: "বিরোধ চলছে ⚠️",
  refunded: "রিফান্ডেড",
  cancelled: "বাতিল",
};

export const DEAL_STEPS = [
  "ক্রেতা অ্যাডমিনকে পেমেন্ট করে",
  "বিক্রেতা ক্রেতাকে আইডি বুঝিয়ে দেয়",
  "ক্রেতা 'আইডি পেয়েছি' কনফার্ম করে",
  "অ্যাডমিন বিক্রেতাকে টাকা দেয় ✅",
];

export const DEAL_EN: Record<string, string> = {
  awaiting_payment: "Payment pending",
  paid_to_admin: "Money with admin ✅",
  id_delivered: "ID delivered",
  completed: "Completed ✅",
  disputed: "Disputed ⚠️",
  refunded: "Refunded",
  cancelled: "Cancelled",
};

export const DEAL_HI: Record<string, string> = {
  awaiting_payment: "भुगतान बाकी",
  paid_to_admin: "पैसा एडमिन के पास ✅",
  id_delivered: "आईडी दे दी गई",
  completed: "पूरा ✅",
  disputed: "विवाद चल रहा है ⚠️",
  refunded: "रिफ़ंड किया गया",
  cancelled: "रद्द",
};

export const DEAL_STEPS_EN = [
  "Buyer pays the admin",
  "Seller hands the ID to the buyer",
  "Buyer confirms 'ID received'",
  "Admin pays the seller ✅",
];

export const DEAL_STEPS_HI = [
  "खरीदार एडमिन को भुगतान करता है",
  "विक्रेता खरीदार को आईडी देता है",
  "खरीदार 'आईडी मिल गई' कन्फ़र्म करता है",
  "एडमिन विक्रेता को पैसा देता है ✅",
];

/** Deal status label / escrow steps in the viewer's language (BN default). */
export function dealStatusLabel(status: string, lang: string): string {
  if (lang === "en") return DEAL_EN[status] ?? status;
  if (lang === "hi") return DEAL_HI[status] ?? status;
  return DEAL_BN[status] ?? status;
}

export function dealSteps(lang: string): string[] {
  if (lang === "en") return DEAL_STEPS_EN;
  if (lang === "hi") return DEAL_STEPS_HI;
  return DEAL_STEPS;
}
