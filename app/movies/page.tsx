import Link from "next/link";
import { getMovies } from "@/lib/movies";
import { getAdsConfig, activeMovieSlots } from "@/lib/catalog";
import AdSlot from "@/components/AdSlot";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "মুভি দেখুন ও ডাউনলোড করুন — DigiPlyra",
  description: "পছন্দের মুভি সরাসরি দেখুন অথবা ডাউনলোড করুন।",
};

export default async function MoviesPage() {
  const [movies, ads] = await Promise.all([getMovies(), getAdsConfig()]);
  const topAds = activeMovieSlots(ads, "movie_list");

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="text-center">
        <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">
          🎬 মুভি <span className="text-[#d7ff3f]">জোন</span>
        </h1>
        <p className="mx-auto mt-2 max-w-xl text-sm text-slate-400">
          পছন্দের মুভি সরাসরি দেখুন অথবা ডাউনলোড করে রাখুন — সম্পূর্ণ ফ্রি
        </p>
      </div>

      {topAds.map((s) => (
        <div key={s.id} className="mt-6">
          <AdSlot code={s.code} />
        </div>
      ))}

      {movies.length === 0 ? (
        <div className="glass mx-auto mt-10 max-w-md rounded-3xl p-10 text-center">
          <div className="text-5xl">🎬</div>
          <p className="mt-4 font-bold text-white">শীঘ্রই আসছে</p>
          <p className="mt-1 text-sm text-slate-500">
            মুভি যোগ করা হচ্ছে — একটু পরে আবার আসুন।
          </p>
          <Link href="/shop" className="btn-ghost mt-6 inline-flex text-sm">
            শপে ঘুরে আসুন
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-5">
          {movies.map((m) => (
            <Link
              key={m.id}
              href={`/movies/${m.slug}`}
              className="glass card-hover group overflow-hidden rounded-2xl"
            >
              <div className="relative aspect-[2/3] overflow-hidden bg-white/5">
                {m.poster_url ? (
                  <img
                    src={m.poster_url}
                    alt={m.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="grid h-full w-full place-items-center text-5xl">
                    🎬
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                {m.is_featured && (
                  <span className="absolute left-2 top-2 rounded-full bg-[#d7ff3f] px-2.5 py-1 text-[10px] font-bold text-black">
                    ⭐ ফিচার্ড
                  </span>
                )}
                <div className="absolute inset-x-0 bottom-0 p-3">
                  <p className="truncate font-display text-sm font-bold text-white">
                    {m.title}
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-400">
                    {[m.year, m.genre].filter(Boolean).join(" • ") || " "}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between px-3 py-2.5">
                <span className="text-[11px] text-slate-500">
                  👁 {m.views} বার দেখা
                </span>
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#d7ff3f]/10 text-sm text-[#d7ff3f] transition group-hover:bg-[#d7ff3f] group-hover:text-black">
                  ▶
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
