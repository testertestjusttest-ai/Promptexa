import type { Metadata, Viewport } from "next";
import { Hind_Siliguri, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import PwaInit from "@/components/PwaInit";
import AdSlot from "@/components/AdSlot";
import { getAdsConfig, activeSlots } from "@/lib/catalog";

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
  title: "DigiPlyra — অরিজিনাল প্রিমিয়াম সাবস্ক্রিপশন",
  description:
    "CapCut Pro, Canva Pro, YouTube Premium সহ সব জনপ্রিয় অ্যাপের অরিজিনাল প্রিমিয়াম সাবস্ক্রিপশন — সবচেয়ে কম দামে, দ্রুত ডেলিভারি।",
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
  return (
    <html lang="bn">
      <body
        className={`${hindSiliguri.variable} ${spaceGrotesk.variable} vault-bg min-h-screen`}
      >
        <CartProvider>
          <Navbar />
          <main className="relative">{children}</main>
          <Footer />
          <CartDrawer />
          <PwaInit />
          {sitewide.map((slot) => (
            <AdSlot key={slot.id} code={slot.code} label="" />
          ))}
        </CartProvider>
      </body>
    </html>
  );
}
