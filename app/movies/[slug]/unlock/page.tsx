import { notFound } from "next/navigation";
import {
  getMovieBySlug,
  getMovieUnlockSettings,
  cleanMovieLinks,
} from "@/lib/movies";
import MoviesBlue from "../../_components/MoviesBlue";
import UnlockPageClient from "./UnlockPageClient";

export const dynamic = "force-dynamic";

export default async function MovieUnlockPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const movie = await getMovieBySlug(slug);
  if (!movie) notFound();
  const settings = await getMovieUnlockSettings();

  const storedWatch = cleanMovieLinks(movie.watch_links);
  const storedDl = cleanMovieLinks(movie.download_links);
  const hasWatch = storedWatch.length > 0 || !!movie.video_url;
  const hasDl = storedDl.length > 0 || !!movie.download_url;
  if (!hasWatch && !hasDl) notFound();

  return (
    <MoviesBlue>
      <UnlockPageClient
        movie={{
          title: movie.title,
          slug: movie.slug,
          year: movie.year,
          poster_url: movie.poster_url,
          video_url: movie.video_url,
          download_url: movie.download_url,
        }}
        storedWatch={storedWatch}
        storedDl={storedDl}
        settings={settings}
      />
    </MoviesBlue>
  );
}
