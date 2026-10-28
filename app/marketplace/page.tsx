import type { Metadata } from "next";
import MarketClient from "./MarketClient";

export const metadata: Metadata = {
  title: "Free Fire ID Market",
  description: "Buy & sell Free Fire IDs safely with an escrow system",
};

export default function MarketplacePage() {
  return <MarketClient />;
}
