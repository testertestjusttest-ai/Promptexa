"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/lib/i18n";
import { toBnDigits } from "@/lib/format";
import type { MovieLink } from "@/lib/movies";

const VERIFY_MS = 3000;
const COOLDOWN_S = 15;

/**
 * 10 ad-CARD unlock grid (MovieLinkBD style, blue theme).
 * Each card shows the movie poster. Tap a card → ad opens in a new tab →
 * 3s verify animation → card flips to ✅ → 15s cooldown before the next
 * card can be tapped. When all cards are done, a DIRECT watch button +
 * separate quality buttons (and same for download) unlock with animation.
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
  const { lang, t } = useLang();
  const digits = (n: string | number) => (lang === "bn" ? toBnDigits(n) : String(n));
  const [doneMap, setDoneMap] = useState<Record<number, boolean>>({});
  const [verifying, setVerifying] = useState<number | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const doneCount = Object.keys(doneMap).length;
  const unlocked = doneCount >= adCount;
  const firstPending = Array.from({ length: adCount }, (_, i) => i).find(
    (i) => !doneMap[i] && verifying !== i
  );
  const locked = verifying !== null || cooldown > 0;

  useEffect(() => {
    if (cooldown <= 0) return;
    const tmr = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(tmr);
  }, [cooldown]);

  function clickCard(i: number) {
    if (doneMap[i] || locked) return;
    const url = adLinks.length > 0 ? adLinks[i % adLinks.length] : "";
    if (url) window.open(url, "_blank", "noopener,noreferrer");
    setVerifying(i);
    setTimeout(() => {
      setDoneMap((m) => ({ ...m, [i]: true }));
      setVerifying(null);
      setCooldown(COOLDOWN_S);
    }, VERIFY_MS);
  }

  const watchBtns = watchLinks.slice(0, 4);
  const dlBtns = downloadLinks.slice(0, 4);

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
            {t("mv_unl_progress")}{" "}
            <span className="text-yellow-300">
              {digits(doneCount)}/{digits(adCount)}
            </span>
          </p>
          <p className="text-xs text-blue-100/60">{t("mv_unl_progress_note")}</p>
        </div>
        <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 transition-all duration-700"
            style={{ width: `${(doneCount / adCount) * 100}%` }}
          />
        </div>
        {cooldown > 0 && !unlocked && (
          <p className="mt-2 text-center text-sm font-bold text-yellow-300">
            {t("mv_unl_cool_pre")}
            {digits(cooldown)}
            {t("mv_unl_cool_post")}
          </p>
        )}
      </div>

      {/* ad cards */}
      {!unlocked && (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: adCount }, (_, i) => i).map((i) => {
            const done = !!doneMap[i];
            const isVerifying = verifying === i;
            const isNext = !done && !isVerifying && firstPending === i && cooldown === 0;
            const url = adLinks.length > 0 ? adLinks[i % adLinks.length] : "";
            const disabled = done || locked;
            return (
              <button
                key={i}
                onClick={() => clickCard(i)}
                disabled={disabled}
                style={{ animationDelay: `${Math.min(i, 10) * 60}ms` }}
                className={`ad-card group relative overflow-hidden rounded-xl text-left ring-1 transition-transform duration-300 ${
                  done
                    ? "ring-green-400/60"
                    : "ring-white/15 hover:scale-[1.04] hover:ring-yellow-300/70"
                } ${isNext ? "ad-card-next ring-yellow-300" : ""} ${
                  disabled && !done ? "opacity-70" : ""
                }`}
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
                    {done ? t("mv_unl_done") : `${t("mv_unl_ad")} ${digits(i + 1)}`}
                  </p>
                  {!done && !isVerifying && cooldown === 0 && (
                    <p className="text-[10px] text-yellow-300">{t("mv_unl_tap")}</p>
                  )}
                  {!done && !isVerifying && cooldown > 0 && (
                    <p className="text-[10px] text-blue-100/70">
                      {t("mv_unl_wait_pre")}
                      {digits(cooldown)}
                      {t("mv_unl_wait_post")}
                    </p>
                  )}
                </div>
                {isVerifying && (
                  <div className="absolute inset-0 grid place-items-center bg-black/70">
                    <div className="flex flex-col items-center gap-2">
                      <div className="spinner" />
                      <p className="text-[10px] font-bold text-yellow-300">
                        {t("mv_unl_verifying")}
                      </p>
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
                    {t("mv_unl_demo")}
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
            <h2 className="mt-3 text-xl font-extrabold text-white">
              {t("mv_unl_all_done")}
            </h2>
            <p className="mt-1 text-sm text-blue-100/70">{t("mv_unl_watch_hint")}</p>
          </div>

          {watchBtns.length > 0 && (
            <>
              <h3 className="mt-6 text-sm font-extrabold uppercase tracking-wide text-yellow-300">
                🎬 Watch
              </h3>
              <div className="mt-2 grid gap-2.5">
                {watchBtns.map((l, i) => (
                  <a
                    key={i}
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ animationDelay: `${i * 80}ms` }}
                    className="ad-card flex items-center justify-between rounded-2xl bg-[#0b84ff] px-5 py-4 font-extrabold text-white shadow-lg shadow-blue-900/50 transition hover:bg-[#006fe0]"
                  >
                    <span className="text-base">▶ WATCH NOW</span>
                    <span className="rounded-lg bg-black/30 px-3 py-1.5 text-sm tracking-wide">
                      {l.label}
                    </span>
                  </a>
                ))}
              </div>
            </>
          )}

          {dlBtns.length > 0 && (
            <>
              <h3 className="mt-6 text-sm font-extrabold uppercase tracking-wide text-yellow-300">
                ⬇ Download
              </h3>
              <div className="mt-2 grid gap-2.5">
                {dlBtns.map((l, i) => (
                  <a
                    key={i}
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ animationDelay: `${i * 80}ms` }}
                    className="ad-card flex items-center justify-between rounded-2xl border border-white/25 bg-white/10 px-5 py-4 font-extrabold text-white transition hover:bg-white/20"
                  >
                    <span className="text-base">⬇ DOWNLOAD NOW</span>
                    <span className="rounded-lg bg-black/30 px-3 py-1.5 text-sm tracking-wide">
                      {l.label}
                    </span>
                  </a>
                ))}
              </div>
            </>
          )}

          <p className="mt-5 text-center text-xs text-blue-100/60">
            {t("mv_unl_tab_note")}
          </p>
        </div>
      )}

      {!unlocked && (
        <p className="mt-4 text-center text-xs text-blue-100/60">
          {t("mv_unl_tip_pre")}
          {digits(COOLDOWN_S)}
          {t("mv_unl_tip_post")}
        </p>
      )}
    </>
  );
}
