"use client";

import { useEffect, useMemo, useState } from "react";
import { useLang } from "@/lib/i18n";
import MotionBg from "@/components/MotionBg";

type QA = { q: string; a: string; keys: string[]; cat: string };

const BANK: QA[] = [
  { cat: "🌐 ওয়েবসাইট সার্ভিস", q: "ওয়েবসাইট বানাতে কত টাকা লাগবে?", a: "ডেমোর ধরন অনুযায়ী দাম ভিন্ন — প্রতিটি ডেমো কার্ডে দাম লেখা আছে। আপনার চাহিদা অনুযায়ী কাস্টম কোটের জন্য /web-dev পেজের ফর্মটি পূরণ করুন, ২৪ ঘণ্টার মধ্যে আমরা জানিয়ে দেবো।", keys: ["দাম", "খরচ", "টাকা", "প্রাইস", "কত", "price", "cost"] },
  { cat: "🌐 ওয়েবসাইট সার্ভিস", q: "ওয়েবসাইট ডেলিভারি পেতে কতদিন লাগবে?", a: "সাধারণত ৭–১৪ দিন। আপনার কনটেন্ট (ছবি, লেখা) দ্রুত দিলে আরও তাড়াতাড়ি ডেলিভারি সম্ভব।", keys: ["দিন", "সময়", "ডেলিভারি", "কতদিন", "delivery", "time"] },
  { cat: "🌐 ওয়েবসাইট সার্ভিস", q: "ডেমো মানে কী? আমার সাইট কি এরকমই হবে?", a: "ডেমো শুধু নমুনা — আপনার ব্যবসার নাম, লোগো, ছবি ও কনটেন্ট দিয়ে আপনার পছন্দমতো ১০০% কাস্টমাইজ করে বানিয়ে দেওয়া হবে। ডেমোর প্রতিটা বাটন ঘেঁটে দেখুন, এরকমই কাজ করবে আপনার সাইটে।", keys: ["ডেমো", "নমুনা", "demo"] },
  { cat: "🌐 ওয়েবসাইট সার্ভিস", q: "ওয়েবসাইটের সাথে কী কী সাপোর্ট পাবো?", a: "ডোমেইন সেটআপ, হোস্টিং, বিকাশ/নগদ পেমেন্ট ইন্টিগ্রেশন, গুগল SEO, ফেসবুক পিক্সেল, বাংলায় ট্রেনিং এবং ফ্রি টেকনিক্যাল সাপোর্ট — সবই আমরা করে দিই।", keys: ["সাপোর্ট", "সাহায্য", "support", "হেল্প"] },
  { cat: "💰 আয় ও রিওয়ার্ড", q: "আর্ন পেজে কীভাবে টাকা আয় করবো?", a: "\"Earn Now\" চাপুন → ২০টি কার্ড আসবে। প্রতিটি কার্ডে ক্লিক করলে অ্যাড খুলবে, ১৫ সেকেন্ড পর কার্ডে ✓ পড়বে। ২০টি শেষ হলে একসাথে ২০ টাকা বোনাস ওয়ালেটে নিন! প্রতি রাউন্ড ১ ঘণ্টা।", keys: ["আয়", "আর্ন", "রিওয়ার্ড", "বোনাস", "কার্ড", "earn", "reward"] },
  { cat: "💰 আয় ও রিওয়ার্ড", q: "টাকা কখন তুলতে পারবো? (উইথড্র)", a: "ওয়ালেটে সর্বনিম্ন ৫০০ টাকা হলেই উইথড্র করা যায়। আর্ন পেজের উইথড্র ফর্মে বিকাশ/নগদ/রকেট নম্বর দিন — অ্যাডমিন যাচাই করে পাঠিয়ে দেবে।", keys: ["উইথড্র", "তুলতে", "টাকা তোলা", "withdraw", "বিকাশ"] },
  { cat: "💰 আয় ও রিওয়ার্ড", q: "রেফার করে কী পাবো?", a: "আপনার রেফারেল লিংকে কেউ জয়েন করে প্রথম কেনাকাটা করলেই আপনি ২০ টাকা বোনাস পাবেন। লিংক পাবেন আর্ন পেজে।", keys: ["রেফার", "refer", "বন্ধু"] },
  { cat: "🛒 কেনাকাটা", q: "পেমেন্ট কীভাবে করবো?", a: "কার্ড/মোবাইল ব্যাংকিং (SSLCommerz) দিয়ে সরাসরি, অথবা বিকাশ/নগদ/রকেটে ম্যানুয়ালি টাকা পাঠিয়ে TrxID সাবমিট করুন — অ্যাডমিন কনফার্ম করলেই ডেলিভারি।", keys: ["পেমেন্ট", "বিকাশ", "নগদ", "payment", "trx"] },
  { cat: "🛒 কেনাকাটা", q: "APK/ফাইল কীভাবে ডাউনলোড করবো?", a: "পেমেন্ট কনফার্ম হলে ড্যাশবোর্ডে ডাউনলোড বাটন আসবে। লিংক একবার ব্যবহারযোগ্য ও ৭ দিন মেয়াদি — সময়মতো ডাউনলোড করে নিন।", keys: ["apk", "ডাউনলোড", "ফাইল", "download", "ইনস্টল"] },
  { cat: "🛒 কেনাকাটা", q: "রিফান্ড পাবো কি?", a: "ডিজিটাল প্রোডাক্টে সাধারণত রিফান্ড হয় না, তবে ভুল প্রোডাক্ট বা ডেলিভারি সমস্যা হলে সাপোর্টে জানান — আমরা সমাধান করে দেবো।", keys: ["রিফান্ড", "ফেরত", "refund"] },
  { cat: "🎮 ID বাজার", q: "ID কেনাবেচা কি নিরাপদ?", a: "১০০% এসক্রো সিস্টেম — ক্রেতার টাকা আগে অ্যাডমিনের কাছে জমা থাকে। ID বুঝে পেয়ে কনফার্ম করলেই বিক্রেতা টাকা পায়। বিক্রেতাকে সরাসরি টাকা দেবেন না!", keys: ["নিরাপদ", "এসক্রো", "প্রতারণা", "safe", "escrow"] },
  { cat: "🎮 ID বাজার", q: "ID বিক্রিতে অ্যাডমিন ফি কত?", a: "মাত্র ২% — বিক্রি সম্পন্ন হলে দামের ২% কেটে বাকি টাকা বিক্রেতাকে দেওয়া হয়।", keys: ["ফি", "কমিশন", "fee", "২%"] },
  { cat: "👤 অ্যাকাউন্ট", q: "লগইন করতে পারছি না, কী করবো?", a: "পাসওয়ার্ড ভুলে গেলে লগইন পেজের 'পাসওয়ার্ড ভুলে গেছেন?' অপশন ব্যবহার করুন। তাও না হলে WhatsApp সাপোর্টে মেসেজ দিন।", keys: ["লগইন", "পাসওয়ার্ড", "login", "password"] },
  { cat: "👤 অ্যাকাউন্ট", q: "সাপোর্টের সাথে কীভাবে যোগাযোগ করবো?", a: "সাইটের ডান-নিচে সবুজ WhatsApp বাটনে ক্লিক করুন — প্রতিদিন সকাল ৯টা থেকে রাত ১১টা পর্যন্ত সাপোর্ট পাবেন।", keys: ["যোগাযোগ", "সাপোর্ট", "whatsapp", "হোয়াটসঅ্যাপ", "ফোন"] },
];

/** Faithful English rendering of BANK — same order, same facts, no new claims. */
const BANK_EN: QA[] = [
  { cat: "🌐 Website Services", q: "How much does it cost to build a website?", a: "Prices vary by demo type — each demo card shows its price. For a custom quote for your needs, fill in the form on the /web-dev page and we will let you know within 24 hours.", keys: ["price", "cost", "how much", "website"] },
  { cat: "🌐 Website Services", q: "How long does website delivery take?", a: "Usually 7–14 days. If you provide your content (images, text) quickly, delivery can be even faster.", keys: ["days", "time", "delivery", "how long"] },
  { cat: "🌐 Website Services", q: "What does demo mean? Will my site look like this?", a: "A demo is only a sample — your site will be built 100% customized with your business name, logo, images and content, just the way you like. Try every button on the demo; your site will work the same way.", keys: ["demo", "sample"] },
  { cat: "🌐 Website Services", q: "What support comes with the website?", a: "Domain setup, hosting, bKash/Nagad payment integration, Google SEO, Facebook Pixel, training in Bangla and free technical support — we do it all.", keys: ["support", "help"] },
  { cat: "💰 Earnings & Rewards", q: "How do I earn money on the Earn page?", a: "Tap \"Earn Now\" → 20 cards will appear. Clicking each card opens an ad; after 15 seconds the card gets a ✓. When all 20 are done, take a 20 Tk bonus into your wallet at once! Each round lasts 1 hour.", keys: ["earn", "reward", "bonus", "card", "money"] },
  { cat: "💰 Earnings & Rewards", q: "When can I withdraw money?", a: "You can withdraw once your wallet reaches a minimum of 500 Tk. Enter your bKash/Nagad/Rocket number in the withdraw form on the Earn page — the admin will verify and send it.", keys: ["withdraw", "bkash", "money"] },
  { cat: "💰 Earnings & Rewards", q: "What do I get for referring?", a: "When someone joins through your referral link and makes their first purchase, you get a 20 Tk bonus. You will find the link on the Earn page.", keys: ["refer", "referral", "friend"] },
  { cat: "🛒 Shopping", q: "How do I pay?", a: "Pay directly by card/mobile banking (SSLCommerz), or send money manually via bKash/Nagad/Rocket and submit the TrxID — delivery follows once the admin confirms.", keys: ["payment", "bkash", "nagad", "trx"] },
  { cat: "🛒 Shopping", q: "How do I download an APK/file?", a: "Once payment is confirmed, a download button appears on your dashboard. The link is single-use and valid for 7 days — download it in time.", keys: ["apk", "download", "file", "install"] },
  { cat: "🛒 Shopping", q: "Will I get a refund?", a: "Digital products are generally not refundable, but if you got the wrong product or there is a delivery problem, tell support — we will sort it out.", keys: ["refund"] },
  { cat: "🎮 ID Marketplace", q: "Is buying and selling IDs safe?", a: "100% escrow system — the buyer's money is held with the admin first. The seller gets paid only after the buyer receives the ID and confirms. Never pay the seller directly!", keys: ["safe", "escrow", "fraud"] },
  { cat: "🎮 ID Marketplace", q: "What is the admin fee for selling an ID?", a: "Only 2% — once a sale is complete, 2% of the price is deducted and the rest is given to the seller.", keys: ["fee", "commission", "2%"] },
  { cat: "👤 Account", q: "I can't log in — what do I do?", a: "If you forgot your password, use the 'Forgot password?' option on the login page. If that still doesn't work, message WhatsApp support.", keys: ["login", "password"] },
  { cat: "👤 Account", q: "How do I contact support?", a: "Click the green WhatsApp button at the bottom-right of the site — support is available every day from 9 AM to 11 PM.", keys: ["contact", "support", "whatsapp", "phone"] },
];

/** Faithful Hindi rendering of BANK — same order, same facts, no new claims. */
const BANK_HI: QA[] = [
  { cat: "🌐 वेबसाइट सेवाएं", q: "वेबसाइट बनवाने में कितना खर्च आएगा?", a: "कीमत डेमो के प्रकार पर निर्भर करती है — हर डेमो कार्ड पर कीमत लिखी होती है। अपनी ज़रूरत के अनुसार कस्टम कोट के लिए /web-dev पेज का फ़ॉर्म भरें, 24 घंटे के भीतर हम बता देंगे।", keys: ["कीमत", "खर्च", "कितना", "price", "cost"] },
  { cat: "🌐 वेबसाइट सेवाएं", q: "वेबसाइट डिलीवरी में कितने दिन लगेंगे?", a: "आमतौर पर 7–14 दिन। अगर आप अपना कंटेंट (तस्वीरें, लेख) जल्दी दे दें तो डिलीवरी और भी तेज़ हो सकती है।", keys: ["दिन", "समय", "डिलीवरी", "delivery", "time"] },
  { cat: "🌐 वेबसाइट सेवाएं", q: "डेमो का क्या मतलब है? क्या मेरी साइट ऐसी ही होगी?", a: "डेमो सिर्फ़ एक नमूना है — आपकी साइट आपके बिज़नेस के नाम, लोगो, तस्वीरों और कंटेंट के साथ 100% कस्टमाइज़ करके बनाई जाएगी। डेमो का हर बटन आज़माकर देखें, आपकी साइट में भी वह ऐसे ही काम करेगा।", keys: ["डेमो", "नमूना", "demo"] },
  { cat: "🌐 वेबसाइट सेवाएं", q: "वेबसाइट के साथ क्या-क्या सपोर्ट मिलेगा?", a: "डोमेन सेटअप, होस्टिंग, bKash/Nagad पेमेंट इंटीग्रेशन, Google SEO, Facebook Pixel, बांग्ला में ट्रेनिंग और मुफ़्त टेक्निकल सपोर्ट — यह सब हम कर देते हैं।", keys: ["सपोर्ट", "मदद", "support"] },
  { cat: "💰 कमाई और रिवॉर्ड", q: "अर्न पेज पर पैसे कैसे कमाऊँ?", a: "\"Earn Now\" दबाएँ → 20 कार्ड आएँगे। हर कार्ड पर क्लिक करने से विज्ञापन खुलेगा, 15 सेकंड बाद कार्ड पर ✓ लग जाएगा। 20 पूरे होने पर एक साथ 20 टका बोनस वॉलेट में लें! हर राउंड 1 घंटे का होता है।", keys: ["कमाई", "अर्न", "रिवॉर्ड", "बोनस", "कार्ड", "earn", "reward"] },
  { cat: "💰 कमाई और रिवॉर्ड", q: "पैसे कब निकाल सकूँगा? (विड्रॉ)", a: "वॉलेट में कम से कम 500 टका होते ही विड्रॉ किया जा सकता है। अर्न पेज के विड्रॉ फ़ॉर्म में अपना bKash/Nagad/Rocket नंबर दें — एडमिन जाँचकर भेज देगा।", keys: ["विड्रॉ", "निकालना", "withdraw", "bkash"] },
  { cat: "💰 कमाई और रिवॉर्ड", q: "रेफ़र करने पर क्या मिलेगा?", a: "आपके रेफ़रल लिंक से कोई जुड़कर पहली खरीदारी करता है तो आपको 20 टका बोनस मिलेगा। लिंक अर्न पेज पर मिलेगा।", keys: ["रेफ़र", "refer", "दोस्त"] },
  { cat: "🛒 खरीदारी", q: "भुगतान कैसे करूँ?", a: "कार्ड/मोबाइल बैंकिंग (SSLCommerz) से सीधे, या bKash/Nagad/Rocket पर मैन्युअली पैसे भेजकर TrxID सबमिट करें — एडमिन के कन्फ़र्म करते ही डिलीवरी हो जाएगी।", keys: ["भुगतान", "bkash", "nagad", "payment", "trx"] },
  { cat: "🛒 खरीदारी", q: "APK/फ़ाइल कैसे डाउनलोड करूँ?", a: "भुगतान कन्फ़र्म होते ही डैशबोर्ड पर डाउनलोड बटन आ जाएगा। लिंक सिर्फ़ एक बार इस्तेमाल हो सकता है और 7 दिन तक वैध है — समय पर डाउनलोड कर लें।", keys: ["apk", "डाउनलोड", "फ़ाइल", "download", "इंस्टॉल"] },
  { cat: "🛒 खरीदारी", q: "क्या रिफ़ंड मिलेगा?", a: "डिजिटल प्रोडक्ट पर आमतौर पर रिफ़ंड नहीं होता, लेकिन गलत प्रोडक्ट या डिलीवरी की समस्या होने पर सपोर्ट को बताएँ — हम समाधान कर देंगे।", keys: ["रिफ़ंड", "वापसी", "refund"] },
  { cat: "🎮 ID बाज़ार", q: "ID की खरीद-बिक्री क्या सुरक्षित है?", a: "100% एस्क्रो सिस्टम — खरीदार का पैसा पहले एडमिन के पास जमा रहता है। ID मिलने और कन्फ़र्म करने पर ही विक्रेता को पैसा मिलता है। विक्रेता को सीधे पैसे न दें!", keys: ["सुरक्षित", "एस्क्रो", "धोखा", "safe", "escrow"] },
  { cat: "🎮 ID बाज़ार", q: "ID बेचने पर एडमिन फ़ीस कितनी है?", a: "सिर्फ़ 2% — बिक्री पूरी होने पर कीमत का 2% काटकर बाक़ी पैसा विक्रेता को दे दिया जाता है।", keys: ["फ़ीस", "कमीशन", "fee", "2%"] },
  { cat: "👤 खाता", q: "लॉगिन नहीं हो रहा है, क्या करूँ?", a: "पासवर्ड भूल गए हैं तो लॉगिन पेज पर 'पासवर्ड भूल गए?' विकल्प इस्तेमाल करें। फिर भी न हो तो WhatsApp सपोर्ट पर मैसेज करें।", keys: ["लॉगिन", "पासवर्ड", "login", "password"] },
  { cat: "👤 खाता", q: "सपोर्ट से कैसे संपर्क करूँ?", a: "साइट के नीचे-दाएँ हरे WhatsApp बटन पर क्लिक करें — हर दिन सुबह 9 बजे से रात 11 बजे तक सपोर्ट मिलेगा।", keys: ["संपर्क", "सपोर्ट", "whatsapp", "फ़ोन"] },
];

const CHROME = {
  bn: {
    title: "❓ সাধারণ জিজ্ঞাসা",
    sub: "প্রশ্ন লিখুন — অটোমেটিক উত্তর পাবেন ⚡",
    greeting: "👋 আসসালামু আলাইকুম! আমি DigiPlyra সহকারী। আপনার প্রশ্ন লিখুন — সাথে সাথে উত্তর দেবো।",
    fallback: "😅 এই বিষয়ে তথ্য পাইনি। WhatsApp সাপোর্টে (ডান-নিচের সবুজ বাটন) জিজ্ঞেস করুন — সাথে সাথে সাহায্য পাবেন!",
    placeholder: "আপনার প্রশ্ন লিখুন… (যেমন: ওয়েবসাইটের দাম কত?)",
    send: "পাঠান ➤",
  },
  en: {
    title: "❓ Frequently Asked Questions",
    sub: "Type your question — get an instant answer ⚡",
    greeting: "👋 Hello! I'm the DigiPlyra assistant. Type your question — I'll answer right away.",
    fallback: "😅 I couldn't find information on this topic. Ask WhatsApp support (the green button at the bottom-right) — you'll get help right away!",
    placeholder: "Type your question… (e.g. How much does a website cost?)",
    send: "Send ➤",
  },
  hi: {
    title: "❓ सामान्य प्रश्न",
    sub: "प्रश्न लिखें — तुरंत उत्तर पाएँ ⚡",
    greeting: "👋 नमस्ते! मैं DigiPlyra सहायक हूँ। अपना प्रश्न लिखें — तुरंत उत्तर दूँगा।",
    fallback: "😅 इस विषय पर जानकारी नहीं मिली। WhatsApp सपोर्ट (नीचे-दाएँ हरा बटन) पर पूछें — तुरंत मदद मिलेगी!",
    placeholder: "अपना प्रश्न लिखें… (जैसे: वेबसाइट की कीमत कितनी है?)",
    send: "भेजें ➤",
  },
} as const;

function findAnswer(query: string, bank: QA[]): QA | null {
  const q = query.toLowerCase();
  let best: QA | null = null;
  let bestScore = 0;
  for (const item of bank) {
    let score = 0;
    for (const k of item.keys) if (q.includes(k.toLowerCase())) score += k.length > 3 ? 2 : 1;
    // bonus for question-word overlap
    const qw = item.q.replace(/[?।]/g, "").split(/[\s,]+/);
    for (const w of qw) if (w.length > 3 && q.includes(w.toLowerCase())) score += 1;
    if (score > bestScore) { bestScore = score; best = item; }
  }
  return bestScore > 0 ? best : null;
}

export default function FaqPage() {
  const { lang } = useLang();
  const bank = lang === "en" ? BANK_EN : lang === "hi" ? BANK_HI : BANK;
  const chrome = CHROME[lang];
  const CATS = useMemo(() => [...new Set(bank.map((b) => b.cat))], [bank]);

  const [ask, setAsk] = useState("");
  const [chat, setChat] = useState<{ me: boolean; text: string }[]>(() => [
    { me: false, text: chrome.greeting },
  ]);
  const [openCat, setOpenCat] = useState<string>(CATS[0]);
  const [openQ, setOpenQ] = useState<number | null>(null);

  // Keep the visible bank + greeting in sync when the drawer language changes.
  useEffect(() => {
    setChat([{ me: false, text: CHROME[lang].greeting }]);
    setOpenCat([...new Set(bank.map((b) => b.cat))][0]);
    setOpenQ(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  function send() {
    const q = ask.trim();
    if (!q) return;
    const ans = findAnswer(q, bank);
    setChat((c) => [
      ...c,
      { me: true, text: q },
      { me: false, text: ans ? ans.a : chrome.fallback },
    ]);
    setAsk("");
  }

  const catItems = useMemo(() => bank.map((b, i) => ({ ...b, i })).filter((b) => b.cat === openCat), [bank, openCat]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 px-6 py-8 text-center">
        <MotionBg intensity="soft" />
        <h1 className="font-display relative text-3xl font-black text-white">{chrome.title}</h1>
        <p className="relative mt-2 text-sm text-slate-400">{chrome.sub}</p>
      </div>

      {/* Auto-answer ask box */}
      <div className="glass mt-6 rounded-3xl p-5">
        <div className="max-h-72 space-y-2.5 overflow-y-auto pr-1">
          {chat.map((m, i) => (
            <div key={i} className={`flex ${m.me ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${m.me ? "bg-[#d7ff3f] font-bold text-black" : "bg-white/10 text-slate-100"}`}>
                {m.text}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          <input
            value={ask}
            onChange={(e) => setAsk(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder={chrome.placeholder}
            className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-[#d7ff3f]/50"
          />
          <button onClick={send} className="btn-vault !px-5 !py-2.5 text-sm">{chrome.send}</button>
        </div>
      </div>

      {/* Category Q&A */}
      <div className="mt-8 flex flex-wrap gap-2">
        {CATS.map((c) => (
          <button key={c} onClick={() => { setOpenCat(c); setOpenQ(null); }}
            className={`rounded-full px-4 py-2 text-xs font-bold ${openCat === c ? "bg-[#d7ff3f] text-black" : "bg-white/10 text-slate-300"}`}>{c}</button>
        ))}
      </div>
      <div className="mt-4 space-y-2">
        {catItems.map((b) => (
          <div key={b.i} className="glass overflow-hidden rounded-2xl">
            <button onClick={() => setOpenQ(openQ === b.i ? null : b.i)} className="flex w-full items-center justify-between px-4 py-3.5 text-left">
              <span className="text-sm font-bold text-white">{b.q}</span>
              <span className="text-[#d7ff3f]">{openQ === b.i ? "▲" : "▼"}</span>
            </button>
            {openQ === b.i && <p className="border-t border-white/5 px-4 py-3.5 text-sm leading-relaxed text-slate-300">{b.a}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
