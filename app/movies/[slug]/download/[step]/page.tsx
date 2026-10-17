import Link from "next/link";
import { notFound } from "next/navigation";
import { getMovieBySlug } from "@/lib/movies";
import { getAdsConfig, activeMovieSlots } from "@/lib/catalog";
import AdSlot from "@/components/AdSlot";
import StepGate from "../../_components/StepGate";
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

          <div className="mx-auto mt-6 max-w-xl rounded-2xl bg-black/25 p-6 text-center ring-1 ring-white/10 sm:p-8">
            <div className="flex items-center justify-center gap-2">
              {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                <span key={i} className="h-2 w-10 rounded-full bg-yellow-400" />
              ))}
            </div>
            <div className="mt-4 text-5xl">✅</div>
            <h2 className="mt-3 text-xl font-extrabold text-white">
              ডাউনলোড লিংক রেডি!
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-blue-50/80">
              নিচের বাটনে ক্লিক করলে ডাউনলোড পেজ খুলবে। ফাইলটি আমাদের পার্টনার
              সার্ভারে রাখা আছে — সেখান থেকে ডাউনলোড হবে।
            </p>
            <a
              href={movie.download_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-[#0b84ff] px-6 py-3.5 text-base font-extrabold text-white transition hover:bg-[#006fe0]"
            >
              ⬇ ডাউনলোড শুরু করুন
            </a>
            <p className="mt-3 text-xs text-blue-100/60">
              নতুন ট্যাবে খুলবে — পপআপ ব্লক থাকলে Allow করুন
            </p>
          </div>

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
          title={n === 1 ? "⬇ ডাউনলোডের প্রস্তুতি" : "⚡ শেষ ধাপ!"}
          desc={
            n === 1
              ? "ডাউনলোড লিংক পেতে ২টা ছোট ধাপ পার হতে হবে। প্রথমে নিচের বিজ্ঞাপনটি দেখুন, কাউন্টডাউন শেষ হলে 'পরবর্তী ধাপ' চাপুন।"
              : "আর মাত্র একটা ধাপ! কাউন্টডাউন শেষ হলে বাটনে ক্লিক করলেই আপনার ডাউনলোড লিংক রেডি হয়ে যাবে।"
          }
          nextHref={isLast ? `/movies/${movie.slug}/download/ready` : `/movies/${movie.slug}/download/2`}
          nextLabel={isLast ? "🔗 ডাউনলোড লিংক নিন" : "পরবর্তী ধাপ →"}
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
