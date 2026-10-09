import type { Metadata, Viewport } from "next";
import { Hind_Siliguri, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import PwaInit from "@/components/PwaInit";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import AdSlot from "@/components/AdSlot";
import { getAdsConfig, activeSlots } from "@/lib/catalog";
import { LangProvider } from "@/lib/i18n";

const hindSiliguri = Hind_Siliguri({
  subsets: ["bengali", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://promptexa.vercel.app"),
  title: {
    default: "DigiPlyra — অরিজিনাল প্রিমিয়াম সাবস্ক্রিপশন ও Free Fire ID বাজার",
    template: "%s — DigiPlyra",
  },
  description:
    "CapCut Pro, Canva Pro, YouTube Premium সহ সব জনপ্রিয় অ্যাপের অরিজিনাল প্রিমিয়াম সাবস্ক্রিপশন — সবচেয়ে কম দামে, দ্রুত ডেলিভারি। নিরাপদ এসক্রোতে Free Fire ID কিনুন-বেচুন।",
  keywords: [
    "DigiPlyra", "CapCut Pro", "Canva Pro", "YouTube Premium", "Netflix Bangladesh",
    "প্রিমিয়াম সাবস্ক্রিপশন", "Free Fire ID", "ফ্রি ফায়ার আইডি কেনা", "FF ID বাজার",
    "digital products Bangladesh", "bKash payment", "ওয়েবসাইট বানানো",
  ],
  authors: [{ name: "DigiPlyra" }],
  creator: "DigiPlyra",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/favicon.png",
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "DigiPlyra",
  },
  openGraph: {
    type: "website",
    locale: "bn_BD",
    alternateLocale: ["en_US"],
    siteName: "DigiPlyra",
    title: "DigiPlyra — অরিজিনাল প্রিমিয়াম সাবস্ক্রিপশন ও Free Fire ID বাজার",
    description:
      "সবচেয়ে কম দামে অরিজিনাল প্রিমিয়াম সাবস্ক্রিপশন + নিরাপদ এসক্রোতে Free Fire ID বাজার।",
    images: [{ url: "/logo.jpg", width: 512, height: 512, alt: "DigiPlyra" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "DigiPlyra — অরিজিনাল প্রিমিয়াম সাবস্ক্রিপশন",
    description: "সবচেয়ে কম দামে অরিজিনাল প্রিমিয়াম সাবস্ক্রিপশন ও নিরাপদ FF ID বাজার।",
    images: ["/logo.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export const viewport: Viewport = {
  themeColor: "#060913",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sitewide = activeSlots(await getAdsConfig(), "sitewide");
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: "DigiPlyra",
        url: "https://promptexa.vercel.app",
        logo: "https://promptexa.vercel.app/logo.jpg",
        sameAs: [],
      },
      {
        "@type": "WebSite",
        name: "DigiPlyra",
        url: "https://promptexa.vercel.app",
        inLanguage: ["bn", "en"],
        potentialAction: {
          "@type": "SearchAction",
          target: "https://promptexa.vercel.app/shop?q={query}",
          "query-input": "required name=query",
        },
      },
    ],
  };
  return (
    <html lang="bn">
      <body
        className={`${hindSiliguri.variable} ${spaceGrotesk.variable} vault-bg min-h-screen`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <LangProvider>
        <CartProvider>
          <Navbar />
          <main className="relative">{children}</main>
          <Footer />
          <CartDrawer />
          <PwaInit />
          <WhatsAppFloat />
          {sitewide.map((slot) => (
            <AdSlot key={slot.id} code={slot.code} label="" />
          ))}
        </CartProvider>
        </LangProvider>
      </body>
    </html>
  );
}
