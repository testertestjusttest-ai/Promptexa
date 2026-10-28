import type { Metadata } from "next";
import WebDevClient from "./WebDevClient";

export const metadata: Metadata = {
  title: "Build a Website — DigiPlyra",
  description: "Get a professional website built by the DigiPlyra team",
  alternates: { canonical: "https://promptexa.vercel.app/" },
};

export default function WebDevPage() {
  return <WebDevClient />;
}
