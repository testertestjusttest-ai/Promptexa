import type { Metadata } from "next";
import EarnClient from "./EarnClient";

export const metadata: Metadata = {
  title: "আয় করুন — DigiPlyra",
  description: "অ্যাড দেখে ও বন্ধুদের রেফার করে টাকা আয় করুন",
};

export default function EarnPage() {
  return <EarnClient />;
}
