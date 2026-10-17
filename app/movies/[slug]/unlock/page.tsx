import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getMovieBySlug,
  getMovieUnlockSettings,
  cleanMovieLinks,
  type MovieLink,
} from "@/lib/movies";
import MoviesBlue from "../../_components/MoviesBlue";
import UnlockFlow from "../_components/UnlockFlow";

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
  const watchLinks: MovieLink[] =
    storedWatch.length > 0
      ? storedWatch
      : movie.video_url
        ? [{ label: "ভিডিও দেখুন", url: movie.video_url }]
        : [];
  const downloadLinks: MovieLink[] =
    storedDl.length > 0
      ? storedDl
      : movie.download_url
        ? [{ label: "ডাউনলোড", url: movie.download_url }]
        : [];
  if (watchLinks.length === 0 && downloadLinks.length === 0) notFound();

  return (
    <MoviesBlue>
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
          {settings.ad_count}টা এড দেখলেই দেখা ও ডাউনলোড লিংক পেয়ে যাবেন
        </p>

        <UnlockFlow
          posterUrl={movie.poster_url}
          watchLinks={watchLinks}
          downloadLinks={downloadLinks}
          adCount={settings.ad_count}
          adLinks={settings.ad_links}
        />
      </div>
    </MoviesBlue>
  );
}
