import type { Metadata } from "next";
import Link from "next/link";
import { fetchPublishedPosts, fetchCategories } from "@/lib/agency-news";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "News — DigiPlyra",
  description:
    "DigiPlyra News: website tips, agency updates and tech news. 10 stories a day, 2 about the agency.",
  alternates: { canonical: "https://promptexa.vercel.app/news" },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "DigiPlyra",
    url: "https://promptexa.vercel.app/news",
    title: "News — DigiPlyra",
    description: "Website tips, agency updates and tech news.",
  },
};

/**
 * Agency News index (Phase 5). Lists published posts only.
 * When no articles exist yet the page says so honestly — it never invents
 * news, and it never shows drafts. Daily publishing (10/day, 2 agency)
 * starts with the full agency launch, once the Phase 5 SQL has run.
 */
export default async function NewsPage({
  searchParams,
}: {
  searchParams?: Promise<{ category?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const { posts, tables_ready } = await fetchPublishedPosts(100);
  const { categories } = await fetchCategories();
  const active = params.category;
  const visible = active ? posts.filter((p) => p.category?.slug === active) : posts;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <p className="text-[11px] font-black uppercase tracking-[0.3em] text-[#d7ff3f]">DigiPlyra News</p>
      <h1 className="font-display mt-2 text-3xl font-black text-white sm:text-4xl">News</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-400">
        Website tips, agency updates and tech news — 10 stories a day, 2 of them about DigiPlyra
        itself. Every story is SEO-structured so people can find it.
      </p>

      {categories.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            href="/news"
            className={`rounded-full px-4 py-2 text-sm font-bold ${!active ? "bg-[#d7ff3f] text-black" : "bg-white/10 text-white"}`}
          >
            All
          </Link>
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/news?category=${c.slug}`}
              className={`rounded-full px-4 py-2 text-sm font-bold ${active === c.slug ? "bg-[#d7ff3f] text-black" : "bg-white/10 text-white"}`}
            >
              {c.name_en}
            </Link>
          ))}
        </div>
      )}

      {visible.length === 0 ? (
        <div className="glass mt-8 rounded-3xl p-6">
          <p className="font-display text-lg font-bold text-white">📰 No articles published yet</p>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">
            Daily publishing starts with the full agency launch: 10 stories a day, 2 of them about
            DigiPlyra. {!tables_ready && "The news database tables are not created yet — the site owner runs the Phase 5 SQL to switch publishing on."}
          </p>
          <ul className="mt-3 space-y-2 text-sm text-slate-300">
            <li>✓ 10 new stories every day — 8 website/tech stories + 2 about DigiPlyra</li>
            <li>✓ Every story SEO-structured: title, summary, keywords, category, publish time</li>
            <li>✓ Admin posting: the owner writes and publishes from the admin panel</li>
          </ul>
          <Link href="/#quote" className="mt-5 inline-block rounded-xl bg-[#d7ff3f] px-5 py-2.5 text-sm font-black text-black transition hover:brightness-110">
            Get a website like this →
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((p) => (
            <Link key={p.slug} href={`/news/${p.slug}`} className="glass overflow-hidden rounded-3xl transition hover:brightness-110">
              {p.cover_image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.cover_image_url} alt={p.title_en} className="h-40 w-full object-cover" />
              )}
              <div className="p-5">
                <div className="flex flex-wrap gap-2 text-[11px] font-bold">
                  {p.category && <span className="rounded-full bg-white/10 px-2 py-1 text-slate-300">{p.category.name_en}</span>}
                  {p.is_agency_post && <span className="rounded-full bg-[#d7ff3f]/20 px-2 py-1 text-[#d7ff3f]">DigiPlyra</span>}
                </div>
                <h2 className="font-display mt-3 text-lg font-bold leading-snug text-white">{p.title_en}</h2>
                {p.excerpt_en && <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-400">{p.excerpt_en}</p>}
                <p className="mt-3 text-xs text-slate-500">
                  {p.published_at ? new Date(p.published_at).toLocaleDateString("en-GB") : ""} · {p.author_name}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}

      <p className="mt-8 text-center text-xs text-slate-500">
        <Link href="/news/rss.xml" className="font-bold text-[#d7ff3f] underline">RSS feed</Link> · Back to{" "}
        <Link href="/" className="font-bold text-[#d7ff3f] underline">the homepage</Link>.
      </p>
    </div>
  );
}
