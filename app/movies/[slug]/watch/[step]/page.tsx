import Link from "next/link";
import { notFound } from "next/navigation";
import { getMovieBySlug, isDirectVideo } from "@/lib/movies";
import { getAdsConfig, activeMovieSlots } from "@/lib/catalog";
import AdSlot from "@/components/AdSlot";
import StepGate from "../../_components/StepGate";
import PreRollPlayer from "../../_components/PreRollPlayer";
import PlayerNote from "../../_components/PlayerNote";
import MoviesBlue from "../../../_components/MoviesBlue";

export const dynamic = "force-dynamic";

const TOTAL_STEPS = 3;

export default async function WatchStepPage({
  params,
}: {
  params: Promise<{ slug: string; step: string }>;
}) {
  const { slug, step } = await params;
  const movie = await getMovieBySlug(slug);
  if (!movie || !movie.video_url) notFound();
  const ads = await getAdsConfig();
  const stepAds = activeMovieSlots(ads, "movie_step");
  const playerAds = activeMovieSlots(ads, "movie_player");

  // ---------- final: player ----------
  if (step === "player") {
    const direct = isDirectVideo(movie.video_url);
    return (
      <MoviesBlue>
        <div className="mx-auto max-w-5xl px-3 py-6 sm:px-6">
          <Link
            href={`/movies/${movie.slug}`}
            className="text-sm font-medium text-blue-100 hover:text-white"
          >
            ← {movie.title}
          </Link>
          <h1 className="mt-3 text-xl font-extrabold text-white sm:text-2xl">
            ▶ {movie.title}
            {movie.year ? (
              <span className="ml-2 text-sm font-medium text-blue-100/70">{movie.year}</span>
            ) : null}
          </h1>

          {playerAds.map((s) => (
            <div key={s.id} className="mt-4">
              <AdSlot code={s.code} />
            </div>
          ))}

          <div className="mt-4 overflow-hidden rounded-2xl bg-black ring-1 ring-white/15">
            <PreRollPlayer
              videoUrl={movie.video_url}
              posterUrl={movie.poster_url}
              title={movie.title}
              adCodes={playerAds.map((s) => s.code)}
              direct={direct}
            />
          </div>
          <PlayerNote />

          {playerAds.map((s) => (
            <div key={`b-${s.id}`} className="mt-4">
              <AdSlot code={s.code} />
            </div>
          ))}
        </div>
      </MoviesBlue>
    );
  }

  // ---------- gated steps 1 & 2 ----------
  const n = Number(step);
  if (n !== 1 && n !== 2) notFound();
  const isLast = n === 2;

  return (
    <MoviesBlue>
      <div className="mx-auto max-w-3xl px-3 py-6 sm:px-6">
        <Link
          href={`/movies/${movie.slug}`}
          className="text-sm font-medium text-blue-100 hover:text-white"
        >
          ← {movie.title}
        </Link>

        {stepAds.map((s) => (
          <div key={s.id} className="mt-4">
            <AdSlot code={s.code} />
          </div>
        ))}

        <StepGate
          step={n}
          totalSteps={TOTAL_STEPS}
          kind="watch"
          nextHref={isLast ? `/movies/${movie.slug}/watch/player` : `/movies/${movie.slug}/watch/2`}
        />

        {stepAds.map((s) => (
          <div key={`b-${s.id}`} className="mt-4">
            <AdSlot code={s.code} />
          </div>
        ))}
      </div>
    </MoviesBlue>
  );
}
