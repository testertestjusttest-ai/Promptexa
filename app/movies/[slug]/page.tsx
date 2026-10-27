import { notFound } from "next/navigation";
import { getMovieBySlug, bumpMovieViews } from "@/lib/movies";
import { getAdsConfig, activeMovieSlots } from "@/lib/catalog";
import MoviesBlue from "../_components/MoviesBlue";
import MovieDetailClient from "./MovieDetailClient";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const m = await getMovieBySlug(slug);
  return {
    title: m ? `${m.title} — Watch & Download` : "Movie",
    description: m
      ? `Watch or download ${m.title} instantly.`
      : "Watch & download movies instantly.",
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

  const hasLinks =
    !!movie.video_url ||
    !!movie.download_url ||
    (movie.watch_links ?? []).length > 0 ||
    (movie.download_links ?? []).length > 0;

  return (
    <MoviesBlue>
      <MovieDetailClient
        movie={{
          title: movie.title,
          slug: movie.slug,
          poster_url: movie.poster_url,
          description: movie.description,
          year: movie.year,
          genre: movie.genre,
          quality: movie.quality,
          views: movie.views,
          hasLinks,
        }}
        ads={detailAds.map((s) => ({ id: s.id, code: s.code }))}
      />
    </MoviesBlue>
  );
}
