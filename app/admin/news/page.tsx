import NewsAdminClient from "./NewsAdminClient";

export const dynamic = "force-dynamic";

export default function NewsAdminPage() {
  return (
    <div>
      <h2 className="mb-2 font-display text-xl font-bold text-white">📰 News</h2>
      <p className="mb-5 text-sm text-slate-500">
        Publish DigiPlyra News from here: posts, the daily 10-slot plan (slots 9–10 are agency stories),
        and categories. Published posts appear on /news with SEO metadata, JSON-LD and the RSS feed.
      </p>
      <NewsAdminClient />
    </div>
  );
}
