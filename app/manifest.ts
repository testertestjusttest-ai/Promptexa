import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "DigiPlyra — অরিজিনাল প্রিমিয়াম সাবস্ক্রিপশন",
    short_name: "DigiPlyra",
    description:
      "CapCut Pro, Canva Pro, YouTube Premium সহ সব জনপ্রিয় অ্যাপের অরিজিনাল প্রিমিয়াম সাবস্ক্রিপশন — সবচেয়ে কম দামে, দ্রুত ডেলিভারি।",
    start_url: "/",
    display: "standalone",
    background_color: "#060913",
    theme_color: "#060913",
    lang: "bn",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
