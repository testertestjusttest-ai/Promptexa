import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchPublishedPostBySlug, fetchPublishedPosts, postUrl } from "@/lib/agency-news";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchPublishedPostBySlug(slug);
  if (!post) return { title: "Article not found — DigiPlyra News" };
  const title = post.seo_title || post.title_en;
  const description = post.seo_description || post.excerpt_en || post.title_en;
  const url = postUrl(slug);
  const hasBn = !!post.title_bn;
  const hasHi = !!post.title_hi;
  return {
    title: `${title} — DigiPlyra News`,
    description: description.slice(0, 160),
    keywords: post.seo_keywords ? post.seo_keywords.split(",").map((k) => k.trim()).filter(Boolean) : undefined,
    alternates: {
      canonical: url,
      languages: {
        en: url,
        ...(hasBn ? { "bn-BD": url } : {}),
        ...(hasHi ? { "hi-IN": url } : {}),
      },
    },
    openGraph: {
      type: "article",
      locale: "en_US",
      siteName: "DigiPlyra",
      url,
      title,
      description: description.slice(0, 200),
      ...(post.cover_image_url ? { images: [{ url: post.cover_image_url, alt: title }] } : {}),
      publishedTime: post.published_at ?? undefined,
      modifiedTime: post.updated_at ?? undefined,
      authors: [post.author_name],
    },
  };
}

/** Agency article page (Phase 5): published posts only, NewsArticle JSON-LD, agency label. */
export default async function NewsArticlePage({ params }: Props) {
  const { slug } = await params;
  const post = await fetchPublishedPostBySlug(slug);
  if (!post) notFound();

  const { posts } = await fetchPublishedPosts(10);
  const related = posts.filter((p) => p.slug !== slug).slice(0, 3);
  const body = post.body_en ?? "";
  const paragraphs = body.split(/\n+/).filter(Boolean);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: post.title_en,
    description: post.excerpt_en ?? post.title_en,
    ...(post.cover_image_url ? { image: [post.cover_image_url] } : {}),
    datePublished: post.published_at ?? undefined,
    dateModified: post.updated_at ?? undefined,
    author: { "@type": "Organization", name: post.author_name, url: "https://promptexa.vercel.app" },
    publisher: { "@type": "Organization", name: "DigiPlyra", url: "https://promptexa.vercel.app" },
    mainEntityOfPage: postUrl(slug),
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Link href="/news" className="text-sm font-bold text-[#d7ff3f]">← All news</Link>
      <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-bold">
        {post.category && <span className="rounded-full bg-white/10 px-3 py-1 text-slate-300">{post.category.name_en}</span>}
        {post.is_agency_post && <span className="rounded-full bg-[#d7ff3f]/20 px-3 py-1 text-[#d7ff3f]">DigiPlyra agency news</span>}
      </div>
      <h1 className="font-display mt-4 text-3xl font-black leading-tight text-white sm:text-4xl">{post.title_en}</h1>
      <p className="mt-3 text-sm text-slate-500">
        {post.published_at ? new Date(post.published_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : ""} · {post.author_name}
        {post.view_count > 0 ? ` · ${post.view_count} views` : ""}
      </p>
      {post.cover_image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={post.cover_image_url} alt={post.title_en} className="mt-6 w-full rounded-3xl object-cover" />
      )}
      {post.excerpt_en && <p className="mt-6 text-lg font-bold leading-relaxed text-slate-200">{post.excerpt_en}</p>}
      <div className="mt-4 space-y-4 text-base leading-relaxed text-slate-300">
        {paragraphs.map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>

      {related.length > 0 && (
        <div className="mt-12">
          <h2 className="font-display text-xl font-bold text-white">Related stories</h2>
          <div className="mt-4 space-y-3">
            {related.map((r) => (
              <Link key={r.slug} href={`/news/${r.slug}`} className="glass block rounded-2xl p-4 transition hover:brightness-110">
                <span className="font-bold text-white">{r.title_en}</span>
                {r.excerpt_en && <span className="mt-1 block text-sm text-slate-400">{r.excerpt_en.slice(0, 120)}</span>}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
