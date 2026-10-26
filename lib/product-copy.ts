import type { Lang } from "./i18n";
import type { Product } from "./types";

/**
 * English/Hindi translations of the product copy stored in the database
 * (tagline/description/features/delivery note are stored Bangla-only —
 * there are no _en columns yet, so this map is the bridge until the
 * database/admin gains _en fields).
 *
 * Each entry is a faithful translation of the copy live on the product
 * page on 2026-10-26 — no new claims added. If a product's stored copy
 * changes, or a product has no entry here, ProductDetails falls back to
 * the stored Bangla copy rather than showing a stale translation.
 */
type Copy = {
  tagline: string;
  description: string;
  features: string[];
  delivery: string;
};

const DELIVERY_EN =
  "As soon as your payment is confirmed, your account/license key will be delivered to your dashboard.";
const DELIVERY_HI =
  "पेमेंट कन्फर्म होते ही आपका अकाउंट/लाइसेंस की आपके डैशबोर्ड पर डिलीवर कर दिया जाएगा।";

const PRODUCT_COPY: Record<string, { en: Copy; hi: Copy }> = {
  "capcut-pro": {
    en: {
      tagline: "Pro video editing — no watermark, all premium effects",
      description:
        "Unlock all premium transitions, effects, AI tools, cloud storage and 4K export with CapCut Pro. No watermark on your videos. Activated directly on your own account.",
      features: [
        "All premium effects and transitions",
        "AI background remover and auto captions",
        "4K export, watermark-free",
        "100GB cloud storage",
        "Activation on your own email",
      ],
      delivery: DELIVERY_EN,
    },
    hi: {
      tagline: "प्रो वीडियो एडिटिंग — बिना वॉटरमार्क, सभी प्रीमियम इफ़ेक्ट",
      description:
        "CapCut Pro से सभी प्रीमियम ट्रांज़िशन, इफ़ेक्ट, AI टूल, क्लाउड स्टोरेज और 4K एक्सपोर्ट अनलॉक करें। आपके वीडियो पर कोई वॉटरमार्क नहीं होगा। आपके अपने अकाउंट पर सीधे एक्टिवेशन।",
      features: [
        "सभी प्रीमियम इफ़ेक्ट और ट्रांज़िशन",
        "AI बैकग्राउंड रिमूवर और ऑटो कैप्शन",
        "4K एक्सपोर्ट, वॉटरमार्क-मुक्त",
        "100GB क्लाउड स्टोरेज",
        "आपके अपने ईमेल पर एक्टिवेशन",
      ],
      delivery: DELIVERY_HI,
    },
  },
  "canva-pro": {
    en: {
      tagline: "Unlock all premium design templates and AI tools",
      description:
        "Get 600M+ premium stock photos and videos, Magic Studio AI tools, background remover, brand kit and 1TB cloud storage with Canva Pro. Activation via team invite.",
      features: [
        "610,000+ premium templates",
        "Magic Studio AI tools",
        "Background remover",
        "Brand kit and 1TB storage",
        "Fast activation via team link",
      ],
      delivery: DELIVERY_EN,
    },
    hi: {
      tagline: "डिज़ाइन के सभी प्रीमियम टेम्पलेट और AI टूल अनलॉक करें",
      description:
        "Canva Pro से 600M+ प्रीमियम स्टॉक फ़ोटो-वीडियो, Magic Studio AI टूल, बैकग्राउंड रिमूवर, ब्रांड किट और 1TB क्लाउड स्टोरेज पाएं। टीम इनवाइट के ज़रिए एक्टिवेशन।",
      features: [
        "610,000+ प्रीमियम टेम्पलेट",
        "Magic Studio AI टूल",
        "बैकग्राउंड रिमूवर",
        "ब्रांड किट और 1TB स्टोरेज",
        "टीम लिंक से तेज़ एक्टिवेशन",
      ],
      delivery: DELIVERY_HI,
    },
  },
  "youtube-premium": {
    en: {
      tagline: "Ad-free YouTube + background play",
      description:
        "Ad-free YouTube, background play, offline downloads and YouTube Music Premium — all together. An invite will be sent to your own Gmail.",
      features: [
        "100% ad-free experience",
        "Background and PiP play",
        "Offline downloads",
        "YouTube Music Premium included",
        "Activation on your own Gmail",
      ],
      delivery: DELIVERY_EN,
    },
    hi: {
      tagline: "बिना विज्ञापन वाला YouTube + बैकग्राउंड प्ले",
      description:
        "बिना विज्ञापन वाला YouTube, बैकग्राउंड प्ले, ऑफ़लाइन डाउनलोड और YouTube Music Premium — सब एक साथ। आपके अपने Gmail पर इनवाइट भेजा जाएगा।",
      features: [
        "100% बिना विज्ञापन का अनुभव",
        "बैकग्राउंड और PiP प्ले",
        "ऑफ़लाइन डाउनलोड",
        "YouTube Music Premium मुफ़्त",
        "अपने Gmail पर एक्टिवेशन",
      ],
      delivery: DELIVERY_HI,
    },
  },
  "spotify-premium": {
    en: {
      tagline: "Unlimited music, ad-free",
      description:
        "Listen to 100M+ songs on Spotify Premium ad-free, with offline downloads and unlimited skips. Delivered by upgrading your account.",
      features: [
        "Ad-free music",
        "Offline downloads",
        "Unlimited skips",
        "High-quality audio",
        "Fast account upgrade",
      ],
      delivery: DELIVERY_EN,
    },
    hi: {
      tagline: "बिना विज्ञापन के असीमित संगीत",
      description:
        "Spotify Premium पर 10 करोड़+ गाने बिना विज्ञापन के सुनें, ऑफ़लाइन डाउनलोड और असीमित स्किप के साथ। आपके अकाउंट को अपग्रेड करके डिलीवरी।",
      features: [
        "बिना विज्ञापन का संगीत",
        "ऑफ़लाइन डाउनलोड",
        "असीमित स्किप",
        "हाई-क्वालिटी ऑडियो",
        "तेज़ अकाउंट अपग्रेड",
      ],
      delivery: DELIVERY_HI,
    },
  },
  "microsoft-365": {
    en: {
      tagline: "Word, Excel, PowerPoint + 1TB OneDrive",
      description:
        "Genuine Microsoft 365 Personal — the latest versions of Word, Excel, PowerPoint and Outlook, plus 1TB OneDrive cloud storage. Activated directly on your Microsoft account.",
      features: [
        "Latest Word, Excel, PowerPoint",
        "1TB OneDrive storage",
        "PC + Mac + mobile",
        "60 minutes of Skype calls/month",
        "Genuine license key",
      ],
      delivery: DELIVERY_EN,
    },
    hi: {
      tagline: "Word, Excel, PowerPoint + 1TB OneDrive",
      description:
        "असली Microsoft 365 Personal — Word, Excel, PowerPoint और Outlook के नवीनतम संस्करणों के साथ 1TB OneDrive क्लाउड स्टोरेज। आपके Microsoft अकाउंट पर सीधे एक्टिवेशन।",
      features: [
        "नवीनतम Word, Excel, PowerPoint",
        "1TB OneDrive स्टोरेज",
        "PC + Mac + मोबाइल",
        "60 मिनट Skype कॉल/महीना",
        "असली लाइसेंस की",
      ],
      delivery: DELIVERY_HI,
    },
  },
  "picsart-gold": {
    en: {
      tagline: "All premium photo-editing features",
      description:
        "Unlock all premium filters, stickers and AI tools plus ad-free editing with Picsart Gold. Activated directly on your account.",
      features: [
        "All premium filters and effects",
        "AI background tools",
        "Ad-free experience",
        "Exclusive content",
        "Fast delivery",
      ],
      delivery: DELIVERY_EN,
    },
    hi: {
      tagline: "फ़ोटो एडिटिंग के सभी प्रीमियम फ़ीचर",
      description:
        "Picsart Gold से सभी प्रीमियम फ़िल्टर, स्टिकर और AI टूल तथा बिना विज्ञापन वाली एडिटिंग अनलॉक करें। आपके अकाउंट पर सीधे एक्टिवेशन।",
      features: [
        "सभी प्रीमियम फ़िल्टर और इफ़ेक्ट",
        "AI बैकग्राउंड टूल",
        "बिना विज्ञापन का अनुभव",
        "एक्सक्लूसिव कंटेंट",
        "तेज़ डिलीवरी",
      ],
      delivery: DELIVERY_HI,
    },
  },
};

/** Localised product copy for the drawer language.
 *  BN always returns the stored copy; EN/HI return the translation map
 *  entry when one exists, otherwise the stored copy (never empty). */
export function localizedProductCopy(product: Product, lang: Lang): Copy {
  const stored: Copy = {
    tagline: product.tagline_bn,
    description: product.description_bn,
    features: product.features_bn,
    delivery: product.delivery_note_bn,
  };
  if (lang === "bn") return stored;
  return PRODUCT_COPY[product.slug]?.[lang] ?? stored;
}
