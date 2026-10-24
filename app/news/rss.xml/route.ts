import { fetchPublishedPosts } from "@/lib/agency-news";

function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** RSS feed (Phase 5): published posts only; a valid empty feed when nothing is published. */
export async function GET() {
  const { posts } = await fetchPublishedPosts(50);
  const items = posts
    .map(
      (p) => `    <item>
      <title>${escapeXml(p.title_en)}</title>
      <link>https://promptexa.vercel.app/news/${escapeXml(p.slug)}</link>
      <guid>https://promptexa.vercel.app/news/${escapeXml(p.slug)}</guid>
      ${p.published_at ? `<pubDate>${new Date(p.published_at).toUTCString()}</pubDate>` : ""}
      <description>${escapeXml(p.excerpt_en ?? p.title_en)}</description>
      ${p.category ? `<category>${escapeXml(p.category.name_en)}</category>` : ""}
    </item>`,
    )
    .join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>DigiPlyra News</title>
    <link>https://promptexa.vercel.app/news</link>
    <description>Website tips, agency updates and tech news from DigiPlyra.</description>
    <language>en</language>
${items}
  </channel>
</rss>`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
