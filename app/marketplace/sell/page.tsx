import type { Metadata } from "next";
import SellClient from "./SellClient";

export const metadata: Metadata = {
  title: "Sell Your ID",
  description: "Post your Free Fire ID for sale — admin-verified escrow marketplace",
};

export default function SellPage() {
  return <SellClient />;
}
