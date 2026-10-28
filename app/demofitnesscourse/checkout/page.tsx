import type { Metadata } from "next";
import { CheckoutView } from "../_views";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Checkout (Demo) — FitForm",
  description: "FitForm demo checkout in test mode — no real payment is processed.",
};

export default function Page() {
  return <CheckoutView />;
}
