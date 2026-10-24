"use client";

/**
 * Conditional site chrome — Phase 2.
 * - Client routes (/c/*): 100% white-label, no DigiPlyra chrome at all.
 * - Demo routes (/demo* except the /demos gallery): demo-only chrome — the
 *   demo's own DemoShell bar is the chrome, so no main navbar, footer, cart
 *   drawer, WhatsApp float, or ads wrap the demo. This is what makes a demo
 *   feel like a standalone, original website instead of a page inside the store.
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
  // /demobakery, /demopharmacy, /demosalon, ... but NOT the /demos gallery
  // itself. NOTE: the old regex /^\/demo(?!s)/ excluded every demo slug
  // starting with "s" (salon, sweets, sports, ...) — do not regress it.
  const isDemo = !!path && path.startsWith("/demo") && path !== "/demos" && !path.startsWith("/demos/");

  if (isClient || isDemo) {
    // Pure white-label / demo-only: only the site itself, nothing else.
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
