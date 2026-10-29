/**
 * Customer reviews — a curated-feel collection of 240 reviews generated from
 * realistic name + text pools (deterministic, stable order). Each language
 * has its own pool with the SAME seed order, so the same review slot shows
 * the same person/product/stars in every language — only the language of
 * the name and text changes. EN texts use generic payment wording (no
 * Bangladesh payment-brand names) so the default English view carries no
 * Bangladesh tells; the BN pool keeps the original wording.
 */

export type Review = { name: string; text: string; stars: number; product: string };

const FIRST = [
  "রাহাত", "নুসরাত", "তানভীর", "মিম", "সাকিব", "ফারিয়া", "রিফাত", "তানিয়া",
  "নাইম", "সুমাইয়া", "আরিফ", "জান্নাত", "হাসান", "প্রিয়া", "রাকিব", "শারমিন",
  "ইমরান", "লামিয়া", "সজীব", "অর্পিতা", "ফাহিম", "নাবিলা", "তৌহিদ", "রিয়া",
  "মেহেদী", "সাদিয়া", "জুবায়ের", "তাসনিম", "রনি", "ইশরাত", "শাকিল", "মারিয়া",
  "অনিক", "দিপা", "কামরুল", "হুমায়রা", "বিপ্লব", "সানজিদা", "পারভেজ", "নোভা",
];

// Latin transliterations of FIRST, same order.
const FIRST_EN = [
  "Rahat", "Nusrat", "Tanvir", "Mim", "Sakib", "Faria", "Rifat", "Tania",
  "Naim", "Sumaiya", "Arif", "Jannat", "Hasan", "Priya", "Rakib", "Sharmin",
  "Imran", "Lamia", "Sajib", "Arpita", "Fahim", "Nabila", "Touhid", "Riya",
  "Mehedi", "Sadia", "Zubayer", "Tasnim", "Rony", "Ishrat", "Shakil", "Maria",
  "Anik", "Dipa", "Kamrul", "Humaira", "Biplab", "Sanjida", "Parvez", "Nova",
];

// Devanagari transliterations of FIRST, same order (draft quality).
const FIRST_HI = [
  "राहत", "नुसरत", "तनवीर", "मीम", "साकिब", "फ़ारिया", "रिफ़ात", "तानिया",
  "नाइम", "सुमैया", "आरिफ़", "जन्नत", "हसन", "प्रिया", "राकिब", "शारमीन",
  "इमरान", "लामिया", "सजीब", "अर्पिता", "फ़हीम", "नाबिला", "तौहीद", "रिया",
  "मेहदी", "सादिया", "जुबैर", "तसनीम", "रॉनी", "इशरत", "शाकिल", "मारिया",
  "अनिक", "दीपा", "कमरुल", "हुमैरा", "बिप्लब", "सानज़िदा", "परवेज़", "नोवा",
];

const LAST = ["H.", "J.", "K.", "R.", "S.", "A.", "M.", "T.", "N.", "F."];

const PRODUCTS = [
  "CapCut Pro", "Canva Pro", "YouTube Premium", "Netflix", "Spotify Premium",
  "ChatGPT Plus", "Prime Video", "Disney+ Hotstar",
];

const TEXTS = [
  "অর্ডারের {t} মিনিটের মধ্যে ডেলিভারি পেয়েছি। একদম অরিজিনাল, ধন্যবাদ!",
  "দাম অন্য পেজের চেয়ে অনেক কম। সাপোর্টও খুব ভালো — রাতে মেসেজ দিলেও রিপ্লাই পেয়েছি।",
  "প্রথমে সন্দেহ ছিল, কিন্তু পেমেন্টের পরপরই অ্যাকাউন্ট পেয়ে গেছি। ১০০% ট্রাস্টেড।",
  "{p} নিয়েছি, সব ফিচার ঠিকমতো কাজ করছে। আবার কিনব ইনশাআল্লাহ।",
  "বন্ধুর রেফারেন্সে কিনলাম। ডেলিভারি ফাস্ট, সার্ভিস প্রিমিয়াম।",
  "বিকাশে পেমেন্ট করে {t} মিনিটে পেয়ে গেছি। খুবই স্মুথ এক্সপেরিয়েন্স।",
  "কাস্টমার সাপোর্ট অসাধারণ — সব প্রশ্নের উত্তর ধৈর্য ধরে দিয়েছে।",
  "এত কম দামে অরিজিনাল {p} পাবো ভাবিনি। সত্যিই সেরা শপ!",
  "দ্বিতীয়বার কিনলাম, এবারও {t} মিনিটে ডেলিভারি। কখনো হতাশ হইনি।",
  "অ্যাকাউন্টে কোনো সমস্যা হলে সাথে সাথে রিপ্লেসমেন্ট দেয় — বেস্ট সার্ভিস।",
  "পরিবারের সবার জন্য নিয়েছি। পেমেন্ট থেকে অ্যাক্টিভেশন — সব স্মুথ।",
  "রাত ১২টায় অর্ডার করেছিলাম, সকালেই ডেলিভারি পেয়েছি। ইম্প্রেসিভ!",
  "{p}-এর ফুল ভার্সন পেয়েছি, কোনো লিমিটেশন নেই। রেকমেন্ড করছি সবাইকে।",
  "অনেক পেজ ঘুরে এখানে এসেছি — দাম আর সার্ভিস দুটোতেই সেরা।",
  "ট্রানজেকশন আইডি দেওয়ার {t} মিনিট পরেই প্রোডাক্ট হাতে পেয়েছি।",
  "সাপোর্টে ভাইয়াটা খুব হেল্পফুল। সেটআপে সমস্যা হচ্ছিল, ভিডিও কলে বুঝিয়ে দিয়েছে!",
  "ফেক সেলার থেকে ঠকে এখানে এসেছি — এখানে ১০০% জেনুইন পেয়েছি।",
  "দাম, সার্ভিস, ব্যবহার — তিনটাতেই ৫ স্টার। বন্ধুদেরও রেফার করেছি।",
  "{p} কিনে ভিডিও এডিটিং শিখছি, লাইফ চেঞ্জিং এক্সপেরিয়েন্স!",
  "পেমেন্ট মেথড অনেকগুলো — বিকাশ, নগদ, রকেট সব আছে। খুব সুবিধা।",
];

const TEXTS_EN = [
  "Got delivery within {t} minutes of ordering. Totally original, thank you!",
  "Prices are much lower than other pages. Support is great too — I got a reply even when I messaged at night.",
  "I was skeptical at first, but I got my account right after payment. 100% trusted.",
  "Got {p}, all features work perfectly. Will buy again, God willing.",
  "Bought on a friend's recommendation. Fast delivery, premium service.",
  "Paid with mobile banking and got it in {t} minutes. Very smooth experience.",
  "Customer support is excellent — they answered every question patiently.",
  "Never thought I'd get original {p} at such a low price. Truly the best shop!",
  "Second time buying, delivery in {t} minutes again. Never disappointed.",
  "If there's any issue with the account, they replace it right away — best service.",
  "Bought for the whole family. From payment to activation — all smooth.",
  "Ordered at midnight, got delivery by morning. Impressive!",
  "Got the full version of {p}, no limitations. Recommending it to everyone.",
  "Visited many pages before coming here — best in both price and service.",
  "Got the product {t} minutes after sharing the transaction ID.",
  "The support person was very helpful. I was stuck on setup, and he explained it over a video call!",
  "Came here after being cheated by a fake seller — got 100% genuine here.",
  "Price, service, experience — 5 stars on all three. Referred my friends too.",
  "Bought {p} and learning video editing — a life-changing experience!",
  "Many payment methods — card and mobile wallet all available. Very convenient.",
];

const TEXTS_HI = [
  "ऑर्डर करने के {t} मिनट के भीतर डिलीवरी मिल गई। बिल्कुल ओरिजिनल, धन्यवाद!",
  "दाम दूसरे पेजों से काफी कम है। सपोर्ट भी बहुत अच्छा है — रात में मैसेज करने पर भी जवाब मिला।",
  "पहले शक था, लेकिन पेमेंट के तुरंत बाद अकाउंट मिल गया। 100% भरोसेमंद।",
  "{p} लिया है, सारे फीचर ठीक से काम कर रहे हैं। फिर से खरीदूँगा, इंशाअल्लाह।",
  "दोस्त की सलाह पर खरीदा। तेज़ डिलीवरी, प्रीमियम सर्विस।",
  "मोबाइल बैंकिंग से पेमेंट करके {t} मिनट में मिल गया। बहुत स्मूद अनुभव।",
  "कस्टमर सपोर्ट शानदार है — हर सवाल का धैर्य से जवाब दिया।",
  "इतनी कम कीमत में ओरिजिनल {p} मिलेगा, सोचा नहीं था। सच में सबसे अच्छा शॉप!",
  "दूसरी बार खरीदा, इस बार भी {t} मिनट में डिलीवरी। कभी निराश नहीं हुआ।",
  "अकाउंट में कोई दिक्कत हो तो तुरंत रिप्लेसमेंट देते हैं — बेस्ट सर्विस।",
  "पूरे परिवार के लिए लिया। पेमेंट से एक्टिवेशन तक — सब स्मूद।",
  "रात 12 बजे ऑर्डर किया था, सुबह तक डिलीवरी मिल गई। प्रभावशाली!",
  "{p} का फुल वर्शन मिला, कोई लिमिटेशन नहीं। सबको रेकमेंड कर रहा हूँ।",
  "कई पेज घूमकर यहाँ आया — दाम और सर्विस दोनों में सबसे अच्छा।",
  "ट्रांज़ैक्शन आईडी देने के {t} मिनट बाद ही प्रोडक्ट हाथ में मिल गया।",
  "सपोर्ट वाले भैया बहुत मददगार थे। सेटअप में दिक्कत हो रही थी, वीडियो कॉल पर समझा दिया!",
  "फ़ेक सेलर से ठगाकर यहाँ आया — यहाँ 100% असली मिला।",
  "दाम, सर्विस, अनुभव — तीनों में 5 स्टार। दोस्तों को भी रेफ़र किया है।",
  "{p} खरीदकर वीडियो एडिटिंग सीख रहा हूँ, लाइफ़-चेंजिंग अनुभव!",
  "कई पेमेंट मेथड हैं — कार्ड और मोबाइल वॉलेट सब कुछ है। बहुत सुविधाजनक।",
];

function seeded(i: number): number {
  let x = (i * 2654435761) % 4294967296;
  x ^= x << 13; x ^= x >>> 17; x ^= x << 5;
  return (x >>> 0) / 4294967296;
}

function buildReviews(first: string[], texts: string[]): Review[] {
  return Array.from({ length: 240 }, (_, i) => {
    const name = `${first[Math.floor(seeded(i * 3 + 1) * first.length)]} ${LAST[Math.floor(seeded(i * 5 + 2) * LAST.length)]}`;
    const product = PRODUCTS[Math.floor(seeded(i * 7 + 3) * PRODUCTS.length)];
    const text = texts[Math.floor(seeded(i * 11 + 4) * texts.length)]
      .replace("{p}", product)
      .replace("{t}", String(5 + Math.floor(seeded(i * 13 + 5) * 25)));
    const stars = seeded(i * 17 + 6) > 0.12 ? 5 : 4;
    return { name, text, stars, product };
  });
}

export const REVIEWS: Review[] = buildReviews(FIRST, TEXTS);
export const REVIEWS_EN: Review[] = buildReviews(FIRST_EN, TEXTS_EN);
export const REVIEWS_HI: Review[] = buildReviews(FIRST_HI, TEXTS_HI);

export const REVIEW_COUNT = REVIEWS.length;
export const REVIEW_AVG = (REVIEWS.reduce((s, r) => s + r.stars, 0) / REVIEWS.length).toFixed(1);
