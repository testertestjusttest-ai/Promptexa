import type { Metadata } from "next";
import WebDevClient from "./web-dev/WebDevClient";

export const metadata: Metadata = {
  title: "DigiPlyra — প্রফেশনাল ওয়েবসাইট বানিয়ে নিন",
  description:
    "DigiPlyra টিমের মাধ্যমে প্রফেশনাল ওয়েবসাইট বানিয়ে নিন — ১০টি লাইভ ডেমো দেখুন, প্যাকেজ বেছে নিন, ফ্রি কোটের জন্য ফর্ম পূরণ করুন।",
  alternates: { canonical: "https://promptexa.vercel.app/" },
};

export default function HomePage() {
  return <WebDevClient />;
}
