"use client";

/**
 * Conditional site chrome — hides ALL DigiPlyra branding on client routes (/c/*).
 * Client sites are 100% white-label: no navbar, footer, cart drawer, WhatsApp, or ads.
 */

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import AdSlot from "@/components/AdSlot";

export default function ConditionalChrome({
  children,
  sitewide,
}: {
  children: React.ReactNode;
  sitewide: { id: string; code: string }[];
}) {
  const path = usePathname();
  const isClient = path?.startsWith("/c/") || path === "/c";

  if (isClient) {
    // Pure white-label: only the client's site, nothing else.
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main className="relative">{children}</main>
      <Footer />
      <CartDrawer />
      <WhatsAppFloat />
      {sitewide.map((slot) => (
        <AdSlot key={slot.id} code={slot.code} label="" />
      ))}
    </>
  );
}
