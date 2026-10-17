import Link from "next/link";
import { notFound } from "next/navigation";
import { getMovieBySlug, isDirectVideo } from "@/lib/movies";
import { getAdsConfig, activeMovieSlots } from "@/lib/catalog";
import AdSlot from "@/components/AdSlot";
import StepGate from "../../_components/StepGate";
import PreRollPlayer from "../../_components/PreRollPlayer";

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
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <Link href={`/movies/${movie.slug}`} className="text-sm font-medium text-slate-400 hover:text-[#d7ff3f]">
          ← {movie.title}
        </Link>
        <h1 className="font-display mt-3 text-xl font-bold text-white sm:text-2xl">
          ▶ {movie.title}
          {movie.year ? <span className="ml-2 text-sm font-medium text-slate-500">{movie.year}</span> : null}
        </h1>

        {playerAds.map((s) => (
          <div key={s.id} className="mt-4">
            <AdSlot code={s.code} />
          </div>
        ))}

        <div className="glass mt-4 overflow-hidden rounded-3xl">
          <PreRollPlayer
            videoUrl={movie.video_url}
            posterUrl={movie.poster_url}
            title={movie.title}
            adCodes={playerAds.map((s) => s.code)}
            direct={direct}
          />
        </div>
        <p className="mt-3 text-center text-xs text-slate-600">
          ভিডিও না চললে পেজ রিফ্রেশ করুন অথবা ডাউনলোড করে দেখুন
        </p>

        {playerAds.map((s) => (
          <div key={`b-${s.id}`} className="mt-4">
            <AdSlot code={s.code} />
          </div>
        ))}
      </div>
    );
  }

  // ---------- gated steps 1 & 2 ----------
  const n = Number(step);
  if (n !== 1 && n !== 2) notFound();
  const isLast = n === 2;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Link href={`/movies/${movie.slug}`} className="text-sm font-medium text-slate-400 hover:text-[#d7ff3f]">
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
        title={n === 1 ? "📺 মুভি দেখার প্রস্তুতি" : "⚡ শেষ ধাপ!"}
        desc={
          n === 1
            ? "নিচে একটি ছোট বিজ্ঞাপন দেখুন। কাউন্টডাউন শেষ হলে 'পরবর্তী ধাপ' বাটনে ক্লিক করুন — এভাবেই আমাদের সাইট ফ্রি থাকে।"
            : "আর মাত্র একটা ধাপ! কাউন্টডাউন শেষ হলে নিচের বাটনে ক্লিক করলেই ভিডিও প্লেয়ার চালু হবে।"
        }
        nextHref={isLast ? `/movies/${movie.slug}/watch/player` : `/movies/${movie.slug}/watch/2`}
        nextLabel={isLast ? "🎬 প্লেয়ার চালু করুন" : "পরবর্তী ধাপ →"}
      />

      {stepAds.map((s) => (
        <div key={`b-${s.id}`} className="mt-4">
          <AdSlot code={s.code} />
        </div>
      ))}
    </div>
  );
}
