import type { MetadataRoute } from "next";
import { fetchPublishedPosts } from "@/lib/agency-news";
import { DEMO_DEFS } from "@/app/web-dev/demos/demosite/defs";

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
  "/demos",
  "/movies",
  "/topup",
  "/chat",
  "/faq",
  "/shop/catalog",
];

/** Standalone demo routes with their own pages (not in DEMO_DEFS). */
const STANDALONE_DEMO_ROUTES = [
  "/demofitnesscourse",
];

/**
 * Sitemap (Phase 5): static routes + published news articles + all demo routes.
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
  // Demo routes: every DemoSite demo lives at /demo<slug> (e.g. /democleaning).
  // Imported from the same defs the demo pages use, so new demos appear here
  // automatically instead of needing a manual sitemap edit.
  const demoEntries: MetadataRoute.Sitemap = DEMO_DEFS.map((d) => ({
    url: `${BASE}/demo${d.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));
  // Standalone demos (own routes, not DemoSite defs): FitForm lives at
  // /demofitnesscourse with its own pages, so it needs a manual entry —
  // otherwise the /demos gallery links to a route no crawler ever sees.
  const standaloneEntries: MetadataRoute.Sitemap = STANDALONE_DEMO_ROUTES.map((r) => ({
    url: `${BASE}${r}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));
  return [...staticEntries, ...newsEntries, ...demoEntries, ...standaloneEntries];
}
