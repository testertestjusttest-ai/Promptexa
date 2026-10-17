"use client";

import { useState } from "react";
import type { MovieLink } from "@/lib/movies";

const VERIFY_MS = 3000;

/**
 * 10 ad-CARD unlock grid (MovieLinkBD style, blue theme).
 * Each card shows the movie poster. Tap a card → ad opens in a new tab →
 * 3s verify animation → card flips to ✅. When all cards are done,
 * quality-wise watch (4) + download (4) buttons unlock with animation.
 */
export default function UnlockFlow({
  posterUrl,
  watchLinks,
  downloadLinks,
  adCount,
  adLinks,
}: {
  posterUrl: string | null;
  watchLinks: MovieLink[];
  downloadLinks: MovieLink[];
  adCount: number;
  adLinks: string[];
}) {
  const [doneMap, setDoneMap] = useState<Record<number, boolean>>({});
  const [verifying, setVerifying] = useState<number | null>(null);
  const doneCount = Object.keys(doneMap).length;
  const unlocked = doneCount >= adCount;
  const firstPending = Array.from({ length: adCount }, (_, i) => i).find(
    (i) => !doneMap[i] && verifying !== i
  );

  function clickCard(i: number) {
    if (doneMap[i] || verifying !== null) return;
    const url = adLinks.length > 0 ? adLinks[i % adLinks.length] : "";
    if (url) window.open(url, "_blank", "noopener,noreferrer");
    setVerifying(i);
    setTimeout(() => {
      setDoneMap((m) => ({ ...m, [i]: true }));
      setVerifying(null);
    }, VERIFY_MS);
  }

  return (
    <>
      <style>{`
        @keyframes cardIn { from { opacity: 0; transform: translateY(14px) scale(.97); } to { opacity: 1; transform: none; } }
        @keyframes popIn { 0% { transform: scale(.4); opacity: 0; } 60% { transform: scale(1.15); } 100% { transform: scale(1); opacity: 1; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes glowPulse { 0%,100% { box-shadow: 0 0 0 0 rgba(250,204,21,.55); } 50% { box-shadow: 0 0 0 7px rgba(250,204,21,0); } }
        .ad-card { animation: cardIn .45s both; }
        .ad-card-done { animation: popIn .35s both; }
        .ad-card-next { animation: glowPulse 1.6s infinite; }
        .spinner { width: 34px; height: 34px; border-radius: 9999px; border: 3px solid rgba(255,255,255,.25); border-top-color: #facc15; animation: spin .8s linear infinite; }
      `}</style>

      {/* progress */}
      <div className="mt-4 rounded-2xl bg-black/25 p-4 ring-1 ring-white/10">
        <div className="flex items-center justify-between text-sm">
          <p className="font-bold text-white">
            📢 এড দেখুন <span className="text-yellow-300">{doneCount}/{adCount}</span>
          </p>
          <p className="text-xs text-blue-100/60">সবগুলো শেষ হলে লিংক খুলবে</p>
        </div>
        <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 transition-all duration-700"
            style={{ width: `${(doneCount / adCount) * 100}%` }}
          />
        </div>
      </div>

      {/* ad cards */}
      {!unlocked && (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: adCount }).map((_, i) => {
            const done = !!doneMap[i];
            const isVerifying = verifying === i;
            const isNext = !done && !isVerifying && firstPending === i;
            const url = adLinks.length > 0 ? adLinks[i % adLinks.length] : "";
            return (
              <button
                key={i}
                onClick={() => clickCard(i)}
                disabled={done || isVerifying}
                style={{ animationDelay: `${Math.min(i, 10) * 60}ms` }}
                className={`ad-card group relative overflow-hidden rounded-xl text-left ring-1 transition-transform duration-300 ${
                  done
                    ? "ring-green-400/60"
                    : "ring-white/15 hover:scale-[1.04] hover:ring-yellow-300/70"
                } ${isNext ? "ad-card-next ring-yellow-300" : ""}`}
              >
                <div className="aspect-[3/4] bg-black/40">
                  {posterUrl ? (
                    <img
                      src={posterUrl}
                      alt=""
                      loading="lazy"
                      className={`h-full w-full object-cover ${done ? "opacity-40 saturate-50" : ""}`}
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center text-4xl">🎬</div>
                  )}
                </div>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-2 pt-6">
                  <p className="text-xs font-extrabold text-white">
                    {done ? "✅ সম্পন্ন" : `📢 এড ${i + 1}`}
                  </p>
                  {!done && !isVerifying && (
                    <p className="text-[10px] text-yellow-300">ট্যাপ করে এড দেখুন</p>
                  )}
                </div>
                {isVerifying && (
                  <div className="absolute inset-0 grid place-items-center bg-black/70">
                    <div className="flex flex-col items-center gap-2">
                      <div className="spinner" />
                      <p className="text-[10px] font-bold text-yellow-300">যাচাই হচ্ছে…</p>
                    </div>
                  </div>
                )}
                {done && (
                  <div className="ad-card-done absolute inset-0 grid place-items-center bg-green-500/15">
                    <span className="text-4xl drop-shadow-lg">✅</span>
                  </div>
                )}
                {!url && !done && !isVerifying && (
                  <span className="absolute right-1.5 top-1.5 rounded bg-black/60 px-1.5 py-0.5 text-[9px] text-blue-100/70">
                    ডেমো
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* unlocked links */}
      {unlocked && (
        <div className="ad-card mt-4 rounded-2xl bg-black/25 p-5 ring-1 ring-yellow-300/30 sm:p-7">
          <div className="text-center">
            <div className="ad-card-done text-5xl">🎉</div>
            <h2 className="mt-3 text-xl font-extrabold text-white">সব এড সম্পন্ন!</h2>
            <p className="mt-1 text-sm text-blue-100/70">
              কোয়ালিটি বেছে নিয়ে দেখুন বা ডাউনলোড করুন
            </p>
          </div>

          {watchLinks.length > 0 && (
            <>
              <h3 className="mt-6 text-sm font-extrabold uppercase tracking-wide text-yellow-300">
                🎬 ভিডিও দেখুন
              </h3>
              <div className="mt-2 grid gap-2.5 sm:grid-cols-2">
                {watchLinks.slice(0, 4).map((l, i) => (
                  <a
                    key={i}
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ animationDelay: `${i * 80}ms` }}
                    className="ad-card flex items-center justify-center gap-2 rounded-xl bg-[#0b84ff] px-4 py-3.5 text-base font-extrabold text-white transition hover:bg-[#006fe0]"
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
              <div className="mt-2 grid gap-2.5 sm:grid-cols-2">
                {downloadLinks.slice(0, 4).map((l, i) => (
                  <a
                    key={i}
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ animationDelay: `${i * 80}ms` }}
                    className="ad-card flex items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-3.5 text-base font-extrabold text-white transition hover:bg-white/20"
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
      )}

      {!unlocked && (
        <p className="mt-4 text-center text-xs text-blue-100/60">
          💡 প্রতিটা কার্ডে ট্যাপ করুন — এড নতুন ট্যাবে খুলবে, ফিরে এসে দেখুন কার্ড ✅ হয়ে গেছে
        </p>
      )}
    </>
  );
}
