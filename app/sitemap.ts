import type { MetadataRoute } from "next";
import { fetchPublishedPosts } from "@/lib/agency-news";

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
  "/news",
];

/**
 * Sitemap (Phase 5): static routes + published news articles only.
 * Drafts never appear. If the news tables are not ready yet, the sitemap
 * degrades to the static routes instead of failing.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((r) => ({
    url: `${BASE}${r}`,
    lastModified: now,
    changeFrequency: r === "" || r === "/news" ? "daily" : "weekly",
    priority: r === "" ? 1 : r === "/news" ? 0.8 : 0.7,
  }));
  const { posts } = await fetchPublishedPosts(500);
  const newsEntries: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${BASE}/news/${p.slug}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : now,
    changeFrequency: "weekly",
    priority: 0.6,
  }));
  return [...staticEntries, ...newsEntries];
}
