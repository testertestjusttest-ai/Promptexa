import type { MetadataRoute } from "next";

const BASE = "https://promptexa.vercel.app";

const STATIC_ROUTES = [
  "",
  "/shop",
  "/earn",
  "/marketplace",
  "/marketplace/sell",
  "/web-dev",
  "/dashboard",
  "/auth/login",
  "/auth/signup",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return STATIC_ROUTES.map((r) => ({
    url: `${BASE}${r}`,
    lastModified: now,
    changeFrequency: r === "" ? "daily" : "weekly",
    priority: r === "" ? 1 : 0.7,
  }));
}
