import type { Metadata } from "next";
import { Hind_Siliguri, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";

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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
        </CartProvider>
      </body>
    </html>
  );
}
