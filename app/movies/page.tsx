import Link from "next/link";
import { getMovies } from "@/lib/movies";
import { getAdsConfig, activeMovieSlots } from "@/lib/catalog";
import AdSlot from "@/components/AdSlot";
import MoviesBlue, { formatViews } from "./_components/MoviesBlue";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "মুভি দেখুন ও ডাউনলোড করুন — DigiPlyra",
  description: "পছন্দের মুভি সরাসরি দেখুন অথবা ডাউনলোড করুন।",
};

export default async function MoviesPage() {
  const [movies, ads] = await Promise.all([getMovies(), getAdsConfig()]);
  const topAds = activeMovieSlots(ads, "movie_list");

  return (
    <MoviesBlue>
      <div className="mx-auto max-w-7xl px-3 py-6 sm:px-6">
        {/* logo bar */}
        <div className="text-center">
          <div className="text-4xl font-black tracking-tight text-white drop-shadow-[0_3px_0_rgba(0,0,0,0.35)] sm:text-5xl">
            মুভি<span className="text-[#8dbcff]">জোন</span>
          </div>
          <p className="mt-1 text-sm text-blue-100">
            ১০০% ফ্রি মুভি — সরাসরি দেখুন ও ডাউনলোড করুন
          </p>
        </div>

        {topAds.map((s) => (
          <div key={s.id} className="mt-6">
            <AdSlot code={s.code} />
          </div>
        ))}

        <h2 className="mt-8 text-lg font-extrabold uppercase tracking-wide text-yellow-300">
          🎬 আজকের সিলেকশন
        </h2>

        {movies.length === 0 ? (
          <div className="mx-auto mt-8 max-w-md rounded-2xl bg-black/25 p-10 text-center ring-1 ring-white/10">
            <div className="text-5xl">🎬</div>
            <p className="mt-4 font-bold text-white">শীঘ্রই আসছে</p>
            <p className="mt-1 text-sm text-blue-100/80">
              মুভি যোগ করা হচ্ছে — একটু পরে আবার আসুন।
            </p>
            <Link
              href="/shop"
              className="mt-6 inline-flex rounded-xl bg-white/10 px-5 py-2.5 text-sm font-bold text-white ring-1 ring-white/20 hover:bg-white/20"
            >
              শপে ঘুরে আসুন
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
                      ⭐ ফিচার্ড
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
    </MoviesBlue>
  );
}
