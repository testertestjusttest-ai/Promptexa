"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const WAIT_SECS = 5;

/**
 * Ad-gated step: shows step instructions + countdown, then unlocks
 * the continue button. Ads render around this component (server-side).
 */
export default function StepGate({
  step,
  totalSteps,
  title,
  desc,
  nextHref,
  nextLabel,
  icon = "➡",
}: {
  step: number;
  totalSteps: number;
  title: string;
  desc: string;
  nextHref: string;
  nextLabel: string;
  icon?: string;
}) {
  const [secs, setSecs] = useState(WAIT_SECS);

  useEffect(() => {
    if (secs <= 0) return;
    const t = setTimeout(() => setSecs((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secs]);

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
        ধাপ {step} / {totalSteps}
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
          ⏳ {secs} সেকেন্ড অপেক্ষা করুন, তারপর বাটন আসবে
        </p>
      )}
    </div>
  );
}
