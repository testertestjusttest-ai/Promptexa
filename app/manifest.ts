import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "DigiPlyra — Original Premium Subscriptions",
    short_name: "DigiPlyra",
    description:
      "Original premium subscriptions for all popular apps including CapCut Pro, Canva Pro, YouTube Premium — at the lowest prices, with fast delivery.",
    start_url: "/",
    display: "standalone",
    background_color: "#060913",
    theme_color: "#060913",
    lang: "en",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.jpg", sizes: "512x512", type: "image/jpeg", purpose: "any" },
      { src: "/icon-512.jpg", sizes: "512x512", type: "image/jpeg", purpose: "maskable" },
    ],
  };
}
