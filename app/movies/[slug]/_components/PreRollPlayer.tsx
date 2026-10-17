"use client";

import { useEffect, useRef, useState } from "react";

const PREROLL_SECONDS = 5;

/** Injects a raw ad code (scripts execute). Minimal wrapper for overlay use. */
function RawAd({ code }: { code: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !code.trim()) return;
    el.innerHTML = "";
    const tmp = document.createElement("div");
    tmp.innerHTML = code;
    tmp.querySelectorAll("script").forEach((old) => {
      const s = document.createElement("script");
      for (const attr of Array.from(old.attributes)) s.setAttribute(attr.name, attr.value);
      s.textContent = old.textContent;
      old.replaceWith(s);
    });
    el.appendChild(tmp);
    return () => {
      el.innerHTML = "";
    };
  }, [code]);
  if (!code.trim()) return null;
  return <div ref={ref} className="flex max-w-full justify-center overflow-hidden" />;
}

/**
 * Pre-roll ad gate for the movie player.
 * First play: shows the ad code OVER the player area with a forced
 * countdown, THEN loads the actual video/iframe.
 */
export default function PreRollPlayer({
  videoUrl,
  posterUrl,
  title,
  adCodes,
  direct,
}: {
  videoUrl: string;
  posterUrl?: string | null;
  title: string;
  adCodes: string[];
  direct: boolean;
}) {
  const [left, setLeft] = useState(PREROLL_SECONDS);
  const done = left <= 0;

  useEffect(() => {
    if (done) return;
    const t = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [left, done]);

  if (!done) {
    return (
      <div className="relative aspect-video w-full overflow-hidden bg-black">
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4 text-center">
          <p className="text-[10px] uppercase tracking-widest text-slate-500">বিজ্ঞাপন</p>
          {adCodes.map((c, i) => (
            <RawAd key={i} code={c} />
          ))}
          <div className="text-4xl font-bold tabular-nums text-[#d7ff3f]">{left}</div>
          <p className="text-sm text-slate-300">⏳ {left} সেকেন্ড পর ভিডিও শুরু হবে…</p>
          <div className="h-1 w-40 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-[#d7ff3f] transition-all duration-1000"
              style={{ width: `${((PREROLL_SECONDS - left) / PREROLL_SECONDS) * 100}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  return direct ? (
    <video
      src={videoUrl}
      controls
      autoPlay
      playsInline
      poster={posterUrl ?? undefined}
      className="aspect-video w-full bg-black"
    />
  ) : (
    <iframe
      src={videoUrl}
      className="aspect-video w-full bg-black"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      title={title}
    />
  );
}
