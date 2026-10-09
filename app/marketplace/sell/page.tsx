import type { Metadata } from "next";
import SellClient from "./SellClient";

export const metadata: Metadata = { title: "ID বিক্রি করুন — DigiPlyra" };

export default function SellPage() {
  return <SellClient />;
}
