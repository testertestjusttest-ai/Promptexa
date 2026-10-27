import { getMovies } from "@/lib/movies";
import { getAdsConfig, activeMovieSlots } from "@/lib/catalog";
import MoviesBlue from "./_components/MoviesBlue";
import MoviesListClient from "./MoviesListClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Watch & Download Movies — DigiPlyra",
  description: "Watch your favourite movies instantly, or download them.",
};

export default async function MoviesPage() {
  const [movies, ads] = await Promise.all([getMovies(), getAdsConfig()]);
  const topAds = activeMovieSlots(ads, "movie_list");

  return (
    <MoviesBlue>
      <MoviesListClient
        movies={movies.map((m) => ({
          id: m.id,
          slug: m.slug,
          title: m.title,
          poster_url: m.poster_url,
          year: m.year,
          genre: m.genre,
          quality: m.quality,
          is_featured: m.is_featured,
          views: m.views,
        }))}
        ads={topAds.map((s) => ({ id: s.id, code: s.code }))}
      />
    </MoviesBlue>
  );
}
