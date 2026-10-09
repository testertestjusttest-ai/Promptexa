import type { Metadata } from "next";
import EarnClient from "./EarnClient";
import { getAdsConfig, activeSlots } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "আয় করুন — DigiPlyra",
  description: "অ্যাড দেখে ও বন্ধুদের রেফার করে টাকা আয় করুন",
};

export default async function EarnPage() {
  const ads = await getAdsConfig();
  const top = activeSlots(ads, "earn_top").map((s) => s.code);
  const bottom = activeSlots(ads, "earn_bottom").map((s) => s.code);
  return <EarnClient earnTopAds={top} earnBottomAds={bottom} />;
}
