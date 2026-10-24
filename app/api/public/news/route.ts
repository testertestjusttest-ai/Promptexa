import { NextResponse } from "next/server";
import { fetchPublishedPosts, fetchCategories } from "@/lib/agency-news";

/** Public news feed — published posts only. Empty (never 500) when tables are not ready. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const category = url.searchParams.get("category");
  const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit") ?? 50) || 50));
  const { posts, tables_ready } = await fetchPublishedPosts(limit);
  const { categories } = await fetchCategories();
  const filtered = category ? posts.filter((p) => p.category?.slug === category) : posts;
  return NextResponse.json({
    ok: true,
    tables_ready,
    posts: filtered.map((p) => ({
      slug: p.slug,
      title_en: p.title_en,
      title_bn: p.title_bn,
      title_hi: p.title_hi,
      excerpt_en: p.excerpt_en,
      cover_image_url: p.cover_image_url,
      is_agency_post: p.is_agency_post,
      published_at: p.published_at,
      category: p.category ? { slug: p.category.slug, name_en: p.category.name_en } : null,
    })),
    categories: categories.map((c) => ({ slug: c.slug, name_en: c.name_en })),
  });
}
