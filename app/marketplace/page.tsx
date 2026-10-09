import type { Metadata } from "next";
import MarketClient from "./MarketClient";

export const metadata: Metadata = {
  title: "Free Fire ID বাজার — DigiPlyra",
  description: "নিরাপদ এসক্রো সিস্টেমে Free Fire ID বেচাকেনা করুন",
};

export default function MarketplacePage() {
  return <MarketClient />;
}
