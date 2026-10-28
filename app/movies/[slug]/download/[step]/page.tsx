import Link from "next/link";
import { notFound } from "next/navigation";
import { getMovieBySlug } from "@/lib/movies";
import { getAdsConfig, activeMovieSlots } from "@/lib/catalog";
import AdSlot from "@/components/AdSlot";
import StepGate from "../../_components/StepGate";
import DownloadReady from "../../_components/DownloadReady";
import MoviesBlue from "../../../_components/MoviesBlue";

export const dynamic = "force-dynamic";

const TOTAL_STEPS = 3;

export default async function DownloadStepPage({
  params,
}: {
  params: Promise<{ slug: string; step: string }>;
}) {
  const { slug, step } = await params;
  const movie = await getMovieBySlug(slug);
  if (!movie || !movie.download_url) notFound();
  const ads = await getAdsConfig();
  const stepAds = activeMovieSlots(ads, "movie_step");

  // ---------- final: download link ready ----------
  if (step === "ready") {
    return (
      <MoviesBlue>
        <div className="mx-auto max-w-3xl px-3 py-6 sm:px-6">
          <Link
            href={`/movies/${movie.slug}`}
            className="text-sm font-medium text-blue-100 hover:text-white"
          >
            ← {movie.title}
          </Link>

          <DownloadReady downloadUrl={movie.download_url} totalSteps={TOTAL_STEPS} />

          {stepAds.map((s) => (
            <div key={s.id} className="mt-4">
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
          kind="download"
          nextHref={isLast ? `/movies/${movie.slug}/download/ready` : `/movies/${movie.slug}/download/2`}
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
