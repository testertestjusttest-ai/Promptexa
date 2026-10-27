"use client";

import Link from "next/link";
import { useLang } from "@/lib/i18n";
import { toBnDigits } from "@/lib/format";
import type { MovieLink, MovieUnlockSettings } from "@/lib/movies";
import UnlockFlow from "../_components/UnlockFlow";

export default function UnlockPageClient({
  movie,
  storedWatch,
  storedDl,
  settings,
}: {
  movie: {
    title: string;
    slug: string;
    year: number | null;
    poster_url: string | null;
    video_url: string | null;
    download_url: string | null;
  };
  storedWatch: MovieLink[];
  storedDl: MovieLink[];
  settings: MovieUnlockSettings;
}) {
  const { lang, t } = useLang();
  const digits = (n: string | number) => (lang === "bn" ? toBnDigits(n) : String(n));

  const watchLinks: MovieLink[] =
    storedWatch.length > 0
      ? storedWatch
      : movie.video_url
        ? [{ label: t("mv_unl_fallback_watch"), url: movie.video_url }]
        : [];
  const downloadLinks: MovieLink[] =
    storedDl.length > 0
      ? storedDl
      : movie.download_url
        ? [{ label: t("mv_unl_fallback_dl"), url: movie.download_url }]
        : [];

  return (
    <div className="mx-auto max-w-2xl px-3 py-6 sm:px-6">
      <Link
        href={`/movies/${movie.slug}`}
        className="text-sm font-medium text-blue-100 hover:text-white"
      >
        ← {movie.title}
      </Link>
      <h1 className="mt-3 text-xl font-extrabold text-white sm:text-2xl">
        🔓 {movie.title}
        {movie.year ? (
          <span className="ml-2 text-sm font-medium text-blue-100/70">{movie.year}</span>
        ) : null}
      </h1>
      <p className="mt-1 text-sm text-blue-100/70">
        {lang === "bn" ? (
          <>
            {digits(settings.ad_count)}
            {t("mv_unl_sub")}
          </>
        ) : (
          <>
            {digits(settings.ad_count)} {t("mv_unl_sub")}
          </>
        )}
      </p>

      <UnlockFlow
        posterUrl={movie.poster_url}
        watchLinks={watchLinks}
        downloadLinks={downloadLinks}
        adCount={settings.ad_count}
        adLinks={settings.ad_links}
      />
    </div>
  );
}
