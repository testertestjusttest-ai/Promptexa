"use client";

import { useState } from "react";
import type { MovieLink } from "@/lib/movies";

/**
 * 10-ad click gate → unlocks watch + download buttons.
 * Each step: user taps the ad (opens admin's direct link in a new tab),
 * then taps "next". After adCount steps the links reveal.
 */
export default function UnlockFlow({
  watchLinks,
  downloadLinks,
  adCount,
  adLinks,
}: {
  watchLinks: MovieLink[];
  downloadLinks: MovieLink[];
  adCount: number;
  adLinks: string[];
}) {
  const [step, setStep] = useState(0);
  const [adOpened, setAdOpened] = useState(false);
  const unlocked = step >= adCount;
  const adUrl = adLinks.length > 0 ? adLinks[step % adLinks.length] : "";

  function openAd() {
    if (adUrl) window.open(adUrl, "_blank", "noopener,noreferrer");
    setAdOpened(true);
  }

  function next() {
    setStep((s) => s + 1);
    setAdOpened(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (unlocked) {
    return (
      <div className="mt-4 rounded-2xl bg-black/25 p-5 ring-1 ring-white/10 sm:p-7">
        <div className="text-center">
          <div className="text-5xl">🎉</div>
          <h2 className="mt-3 text-xl font-extrabold text-white">আনলক হয়ে গেছে!</h2>
          <p className="mt-1 text-sm text-blue-100/70">
            নিচের বাটনগুলো থেকে দেখুন বা ডাউনলোড করুন
          </p>
        </div>

        {watchLinks.length > 0 && (
          <>
            <h3 className="mt-6 text-sm font-extrabold uppercase tracking-wide text-yellow-300">
              🎬 ভিডিও দেখুন
            </h3>
            <div className="mt-2 grid gap-2.5">
              {watchLinks.map((l, i) => (
                <a
                  key={i}
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#0b84ff] px-6 py-3.5 text-base font-extrabold text-white transition hover:bg-[#006fe0]"
                >
                  ▶ {l.label}
                </a>
              ))}
            </div>
          </>
        )}

        {downloadLinks.length > 0 && (
          <>
            <h3 className="mt-6 text-sm font-extrabold uppercase tracking-wide text-yellow-300">
              ⬇ ডাউনলোড করুন
            </h3>
            <div className="mt-2 grid gap-2.5">
              {downloadLinks.map((l, i) => (
                <a
                  key={i}
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-6 py-3.5 text-base font-extrabold text-white transition hover:bg-white/20"
                >
                  ⬇ {l.label}
                </a>
              ))}
            </div>
          </>
        )}

        <p className="mt-5 text-center text-xs text-blue-100/60">
          লিংক নতুন ট্যাবে খুলবে — টেরাবক্স লিংকে অ্যাপ না থাকলে ইনস্টল করতে বলবে
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-2xl bg-black/25 p-5 text-center ring-1 ring-white/10 sm:p-7">
      <p className="text-xs font-bold uppercase tracking-widest text-blue-100/60">
        এড {step + 1} / {adCount}
      </p>
      <div className="mx-auto mt-2 h-2 max-w-xs overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-yellow-400 transition-all duration-500"
          style={{ width: `${(step / adCount) * 100}%` }}
        />
      </div>

      <div className="mx-auto mt-5 max-w-sm rounded-xl bg-white/5 p-5 ring-1 ring-white/10">
        <p className="text-[10px] uppercase tracking-widest text-blue-100/50">স্পন্সরড এড</p>
        <div className="mt-2 text-4xl">📢</div>
        <p className="mt-2 text-sm text-blue-50/80">
          মুভি আনলক করতে {adCount}টা এড দেখুন — নিচের বাটনে ক্লিক করলেই এড
          খুলবে
        </p>
        {!adUrl && (
          <p className="mt-2 text-xs text-yellow-300">
            ⚠️ অ্যাডমিন এখনো এড লিংক সেট করেননি — তবুও এগোতে পারবেন
          </p>
        )}
        {!adOpened ? (
          <button
            onClick={openAd}
            className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-yellow-400 px-6 py-3.5 text-base font-extrabold text-black transition hover:bg-yellow-300"
          >
            👆 এডটি দেখুন
          </button>
        ) : (
          <div>
            <p className="mt-4 text-sm font-bold text-green-300">
              ✅ এড খুলেছে — এবার পরের ধাপে যান
            </p>
            <button
              onClick={next}
              className="mt-3 inline-flex w-full items-center justify-center rounded-xl bg-[#0b84ff] px-6 py-3.5 text-base font-extrabold text-white transition hover:bg-[#006fe0]"
            >
              {step + 1 === adCount ? "🔓 আনলক করুন" : "পরের এড →"}
            </button>
          </div>
        )}
      </div>
      <p className="mt-4 text-xs text-blue-100/60">
        এড নতুন ট্যাবে খুলবে — দেখে ফিরে এসে পরের ধাপ চাপুন
      </p>
    </div>
  );
}
