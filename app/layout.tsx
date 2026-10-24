import type { Metadata, Viewport } from "next";
import { Hind_Siliguri, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart";
import ConditionalChrome from "@/components/ConditionalChrome";
import PwaInit from "@/components/PwaInit";
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
    default: "DigiPlyra — Original premium subscriptions & website agency",
    template: "%s — DigiPlyra",
  },
  description:
    "Original premium subscriptions (CapCut Pro, Canva Pro, YouTube Premium and more) at the lowest price with fast delivery — plus a website agency that builds professional websites in 7–14 days. Secure escrow for Free Fire ID trading.",
  keywords: [
    "DigiPlyra", "CapCut Pro", "Canva Pro", "YouTube Premium", "Netflix Bangladesh",
    "premium subscription", "Free Fire ID", "buy Free Fire ID", "FF ID market",
    "digital products Bangladesh", "bKash payment", "build a website",
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
    locale: "en_US",
    alternateLocale: ["bn_BD", "hi_IN"],
    siteName: "DigiPlyra",
    title: "DigiPlyra — Original premium subscriptions & website agency",
    description:
      "Original premium subscriptions at the lowest price + secure escrow for Free Fire ID trading.",
    images: [{ url: "/logo.jpg", width: 512, height: 512, alt: "DigiPlyra" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "DigiPlyra — Original premium subscriptions",
    description: "Original premium subscriptions at the lowest price + secure FF ID market.",
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
    <html lang="en">
      <body
        className={`${hindSiliguri.variable} ${spaceGrotesk.variable} vault-bg min-h-screen`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <LangProvider>
        <CartProvider>
          <PwaInit />
          <ConditionalChrome sitewide={sitewide.map((s) => ({ id: s.id, code: s.code }))}>
            {children}
          </ConditionalChrome>
        </CartProvider>
        </LangProvider>
      </body>
    </html>
  );
}
