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
