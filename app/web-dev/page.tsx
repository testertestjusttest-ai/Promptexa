import type { Metadata } from "next";
import WebDevClient from "./WebDevClient";

export const metadata: Metadata = {
  title: "ওয়েবসাইট বানান — DigiPlyra",
  description: "DigiPlyra টিমের মাধ্যমে প্রফেশনাল ওয়েবসাইট বানিয়ে নিন",
};

export default function WebDevPage() {
  return <WebDevClient />;
}
