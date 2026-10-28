"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLang } from "@/lib/i18n";

const WAIT_SECS = 5;

/**
 * Ad-gated step: shows step instructions + countdown, then unlocks
 * the continue button. Ads render around this component (server-side).
 * Title/description/button copy come from the mv_wd_* keys by flow
 * (watch vs download) and step — the server pages pass no copy.
 */
export default function StepGate({
  step,
  totalSteps,
  kind,
  nextHref,
  icon = "➡",
}: {
  step: number;
  totalSteps: number;
  kind: "watch" | "download";
  nextHref: string;
  icon?: string;
}) {
  const { t } = useLang();
  const [secs, setSecs] = useState(WAIT_SECS);

  useEffect(() => {
    if (secs <= 0) return;
    const t = setTimeout(() => setSecs((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secs]);

  const title =
    kind === "watch"
      ? step === 1
        ? t("mv_wd_watch_t1")
        : t("mv_wd_last_t")
      : step === 1
        ? t("mv_wd_dl_t1")
        : t("mv_wd_last_t");
  const desc =
    kind === "watch"
      ? step === 1
        ? t("mv_wd_watch_d1")
        : t("mv_wd_watch_d2")
      : step === 1
        ? t("mv_wd_dl_d1")
        : t("mv_wd_dl_d2");
  const nextLabel =
    step === 1
      ? t("mv_wd_next")
      : kind === "watch"
        ? t("mv_wd_watch_next2")
        : t("mv_wd_dl_next2");

  return (
    <div className="glass mx-auto mt-6 max-w-xl rounded-3xl p-6 text-center sm:p-8">
      <div className="flex items-center justify-center gap-2">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <span
            key={i}
            className={`h-2 w-10 rounded-full ${i < step ? "bg-[#d7ff3f]" : "bg-white/10"}`}
          />
        ))}
      </div>
      <p className="mt-3 text-xs font-bold uppercase tracking-widest text-slate-500">
        {t("mv_wd_step")} {step} / {totalSteps}
      </p>
      <h2 className="font-display mt-2 text-xl font-bold text-white">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-400">
        {desc}
      </p>

      {secs > 0 ? (
        <div className="mx-auto mt-6 flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#d7ff3f]/30 font-display text-2xl font-bold text-[#d7ff3f]">
          {secs}
        </div>
      ) : (
        <Link href={nextHref} className="btn-vault mt-6 inline-flex w-full text-base">
          {icon} {nextLabel}
        </Link>
      )}
      {secs > 0 && (
        <p className="mt-3 text-xs text-slate-600">
          {t("mv_wd_wait_pre")}
          {secs}
          {t("mv_wd_wait_post")}
        </p>
      )}
    </div>
  );
}
