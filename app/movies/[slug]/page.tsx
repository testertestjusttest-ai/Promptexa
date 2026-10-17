import Link from "next/link";
import { notFound } from "next/navigation";
import { getMovieBySlug, bumpMovieViews } from "@/lib/movies";
import { getAdsConfig, activeMovieSlots } from "@/lib/catalog";
import AdSlot from "@/components/AdSlot";
import MoviesBlue, { formatViews } from "../_components/MoviesBlue";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const m = await getMovieBySlug(slug);
  return {
    title: m ? `${m.title} — দেখুন ও ডাউনলোড করুন` : "মুভি",
  };
}

export default async function MovieDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const movie = await getMovieBySlug(slug);
  if (!movie) notFound();
  const ads = await getAdsConfig();
  const detailAds = activeMovieSlots(ads, "movie_detail");
  bumpMovieViews(movie.id);

  const hasVideo = !!movie.video_url;
  const hasDownload = !!movie.download_url;
  const hasLinks =
    hasVideo ||
    hasDownload ||
    (movie.watch_links ?? []).length > 0 ||
    (movie.download_links ?? []).length > 0;

  return (
    <MoviesBlue>
      <div className="mx-auto max-w-5xl px-3 py-6 sm:px-6">
        <Link
          href="/movies"
          className="text-sm font-medium text-blue-100 hover:text-white"
        >
          ← সব মুভি
        </Link>

        <div className="mt-4 overflow-hidden rounded-2xl bg-black/25 ring-1 ring-white/10">
          <div className="grid gap-6 p-5 sm:grid-cols-3 sm:p-7">
            <div className="mx-auto w-44 sm:w-full">
              <div className="aspect-[2/3] overflow-hidden rounded-lg bg-black/40 ring-1 ring-white/10">
                {movie.poster_url ? (
                  <img
                    src={movie.poster_url}
                    alt={movie.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="grid h-full w-full place-items-center text-6xl">🎬</div>
                )}
              </div>
            </div>
            <div className="sm:col-span-2">
              <h1 className="text-2xl font-extrabold text-white sm:text-3xl">
                {movie.title}
              </h1>
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                {movie.year && (
                  <span className="rounded-full bg-black/30 px-3 py-1 font-medium text-blue-50">
                    📅 {movie.year}
                  </span>
                )}
                {movie.genre && (
                  <span className="rounded-full bg-black/30 px-3 py-1 font-medium text-blue-50">
                    🎭 {movie.genre}
                  </span>
                )}
                {movie.quality && (
                  <span className="rounded-full bg-black/30 px-3 py-1 font-mono font-bold text-yellow-300">
                    {movie.quality}
                  </span>
                )}
                <span className="rounded-full bg-black/30 px-3 py-1 font-medium text-blue-50">
                  👁 {formatViews(movie.views)} বার দেখা
                </span>
              </div>
              {movie.description && (
                <p className="mt-4 text-sm leading-relaxed text-blue-50/80">
                  {movie.description}
                </p>
              )}

              {hasLinks ? (
                <Link
                  href={`/movies/${movie.slug}/unlock`}
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#0b84ff] px-6 py-3.5 text-base font-extrabold text-white transition hover:bg-[#006fe0]"
                >
                  🔓 মুভি আনলক করুন
                </Link>
              ) : (
                <p className="text-sm text-blue-100/70">
                  এই মুভির লিংক এখনো যোগ করা হয়নি — শীঘ্রই আসছে।
                </p>
              )}
              <p className="mt-4 text-xs text-blue-100/60">
                ℹ️ কয়েকটা এড দেখলেই দেখা ও ডাউনলোড লিংক আনলক হয়ে যাবে — প্রতিটা
                ধাপে নির্দেশনা দেওয়া থাকবে।
              </p>
            </div>
          </div>
        </div>

        {detailAds.map((s) => (
          <div key={s.id} className="mt-6">
            <AdSlot code={s.code} />
          </div>
        ))}
      </div>
    </MoviesBlue>
  );
}
