import Link from "next/link";
import { notFound } from "next/navigation";
import { getMovieBySlug, bumpMovieViews } from "@/lib/movies";
import { getAdsConfig, activeSlots } from "@/lib/catalog";
import AdSlot from "@/components/AdSlot";

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
  const detailAds = activeSlots(ads, "movie_detail");
  bumpMovieViews(movie.id);

  const hasVideo = !!movie.video_url;
  const hasDownload = !!movie.download_url;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <Link href="/movies" className="text-sm font-medium text-slate-400 hover:text-[#d7ff3f]">
        ← সব মুভি
      </Link>

      <div className="glass mt-4 overflow-hidden rounded-3xl">
        <div className="grid gap-6 p-6 sm:grid-cols-3 sm:p-8">
          <div className="mx-auto w-44 sm:w-full">
            <div className="aspect-[2/3] overflow-hidden rounded-2xl bg-white/5">
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
            <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">
              {movie.title}
            </h1>
            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              {movie.year && (
                <span className="rounded-full bg-white/5 px-3 py-1 font-medium text-slate-300">
                  📅 {movie.year}
                </span>
              )}
              {movie.genre && (
                <span className="rounded-full bg-white/5 px-3 py-1 font-medium text-slate-300">
                  🎭 {movie.genre}
                </span>
              )}
              <span className="rounded-full bg-white/5 px-3 py-1 font-medium text-slate-300">
                👁 {movie.views} বার দেখা
              </span>
            </div>
            {movie.description && (
              <p className="mt-4 text-sm leading-relaxed text-slate-400">
                {movie.description}
              </p>
            )}

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {hasVideo ? (
                <Link
                  href={`/movies/${movie.slug}/watch/1`}
                  className="btn-vault flex items-center justify-center gap-2 !py-3.5 text-base"
                >
                  ▶ মুভি দেখুন
                </Link>
              ) : null}
              {hasDownload ? (
                <Link
                  href={`/movies/${movie.slug}/download/1`}
                  className="flex items-center justify-center gap-2 rounded-2xl border border-[#d7ff3f]/30 bg-[#d7ff3f]/10 px-6 py-3.5 text-base font-bold text-[#d7ff3f] transition hover:bg-[#d7ff3f]/20"
                >
                  ⬇ ডাউনলোড
                </Link>
              ) : null}
            </div>
            {!hasVideo && !hasDownload && (
              <p className="mt-4 text-sm text-slate-500">
                এই মুভির লিংক এখনো যোগ করা হয়নি — শীঘ্রই আসছে।
              </p>
            )}
            <p className="mt-4 text-xs text-slate-600">
              ℹ️ দেখা বা ডাউনলোডের আগে কয়েকটি ছোট ধাপ পার হতে হবে — প্রতিটা
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
  );
}
