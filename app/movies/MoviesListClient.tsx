"use client";

import Link from "next/link";
import { useLang } from "@/lib/i18n";
import AdSlot from "@/components/AdSlot";
import { formatViews } from "./_components/MoviesBlue";

export type MoviesListItem = {
  id: string;
  slug: string;
  title: string;
  poster_url: string | null;
  year: number | null;
  genre: string | null;
  quality: string | null;
  is_featured: boolean;
  views: number;
};

export default function MoviesListClient({
  movies,
  ads,
}: {
  movies: MoviesListItem[];
  ads: { id: string; code: string }[];
}) {
  const { t } = useLang();

  return (
    <div className="mx-auto max-w-7xl px-3 py-6 sm:px-6">
      {/* logo bar */}
      <div className="text-center">
        <div className="text-4xl font-black tracking-tight text-white drop-shadow-[0_3px_0_rgba(0,0,0,0.35)] sm:text-5xl">
          {t("mv_logo_1")}
          <span className="text-[#8dbcff]">{t("mv_logo_2")}</span>
        </div>
        <p className="mt-1 text-sm text-blue-100">{t("mv_tagline")}</p>
      </div>

      {ads.map((s) => (
        <div key={s.id} className="mt-6">
          <AdSlot code={s.code} />
        </div>
      ))}

      <h2 className="mt-8 text-lg font-extrabold uppercase tracking-wide text-yellow-300">
        {t("mv_today")}
      </h2>

      {movies.length === 0 ? (
        <div className="mx-auto mt-8 max-w-md rounded-2xl bg-black/25 p-10 text-center ring-1 ring-white/10">
          <div className="text-5xl">🎬</div>
          <p className="mt-4 font-bold text-white">{t("mv_empty_title")}</p>
          <p className="mt-1 text-sm text-blue-100/80">{t("mv_empty_text")}</p>
          <Link
            href="/shop"
            className="mt-6 inline-flex rounded-xl bg-white/10 px-5 py-2.5 text-sm font-bold text-white ring-1 ring-white/20 hover:bg-white/20"
          >
            {t("mv_shop")}
          </Link>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 lg:grid-cols-5">
          {movies.map((m) => (
            <Link key={m.id} href={`/movies/${m.slug}`} className="group">
              <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-black/30 ring-1 ring-white/10">
                {m.poster_url ? (
                  <img
                    src={m.poster_url}
                    alt={m.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="grid h-full w-full place-items-center text-5xl">🎬</div>
                )}
                {m.is_featured && (
                  <span className="absolute left-1.5 top-1.5 rounded bg-yellow-400 px-2 py-0.5 text-[10px] font-extrabold text-black">
                    {t("mv_featured")}
                  </span>
                )}
                {m.quality && (
                  <span className="absolute right-1.5 top-1.5 rounded bg-[#0b2545]/90 px-2 py-0.5 font-mono text-[10px] font-extrabold text-white ring-1 ring-white/25">
                    {m.quality}
                  </span>
                )}
              </div>
              <p className="mt-1.5 truncate text-sm font-bold text-white group-hover:underline">
                {m.title}
              </p>
              <div className="mt-0.5 flex items-center justify-between text-xs text-blue-100/80">
                <span className="truncate">
                  {[m.year, m.genre].filter(Boolean).join(" • ") || " "}
                </span>
                <span className="ml-2 shrink-0">👁 {formatViews(m.views)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
