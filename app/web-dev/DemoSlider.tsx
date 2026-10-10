"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { DEMOS } from "./demos/demos";

const AUTOPLAY_MS = 4500;

/** Auto-playing showcase slider of the 10 live demos. */
export default function DemoSlider() {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef<number | null>(null);
  const n = DEMOS.length;

  const go = useCallback((d: number) => setIdx((i) => (i + d + n) % n), [n]);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % n), AUTOPLAY_MS);
    return () => clearInterval(t);
  }, [paused, n]);

  const d = DEMOS[idx];

  return (
    <div
      className="mt-10 overflow-hidden rounded-3xl border border-white/10 bg-[#0b1120]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
        touchX.current = null;
      }}
    >
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
        <p className="text-sm font-black text-white">
          🎬 <span className="text-[#d7ff3f]">লাইভ ডেমো</span> শোকেস
        </p>
        <div className="flex items-center gap-2">
          <button onClick={() => go(-1)} aria-label="আগের" className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white transition hover:bg-[#d7ff3f] hover:text-black">‹</button>
          <span className="text-xs font-bold text-slate-400">{idx + 1} / {n}</span>
          <button onClick={() => go(1)} aria-label="পরের" className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white transition hover:bg-[#d7ff3f] hover:text-black">›</button>
        </div>
      </div>

      <div key={d.slug} className="demo-slide-active grid md:grid-cols-2">
        {/* preview */}
        <div className="relative">
          <div className="flex items-center gap-1.5 border-b border-white/10 bg-black/40 px-4 py-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            <span className="ml-2 truncate rounded-md bg-white/10 px-3 py-1 font-mono text-[11px] text-slate-400">
              demo.digiplyra.com/{d.slug}
            </span>
          </div>
          <div className="pointer-events-none max-h-[320px] overflow-hidden [&_*]:!cursor-default">
            {d.render()}
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#0b1120] to-transparent" />
        </div>
        {/* info */}
        <div className="flex flex-col justify-center p-6 sm:p-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#d7ff3f]">{d.type}</p>
          <h3 className="font-display mt-2 text-2xl font-black text-white sm:text-3xl">{d.name}</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">{d.desc}</p>
          <p className="mt-3 inline-flex w-fit rounded-full bg-[#d7ff3f]/15 px-4 py-1.5 text-sm font-black text-[#d7ff3f]">
            {d.price}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href={`/web-dev/demo/${d.slug}`} className="btn-vault inline-flex !px-6 !py-3 text-sm">
              👁️ লাইভ ডেমো দেখুন
            </Link>
            <Link href="/web-dev#quote" className="inline-flex items-center rounded-xl border border-white/20 px-6 py-3 text-sm font-bold text-white transition hover:border-[#d7ff3f]/60">
              📝 এরকম সাইট চাই
            </Link>
          </div>
        </div>
      </div>

      {/* dots */}
      <div className="flex items-center justify-center gap-1.5 border-t border-white/10 px-4 py-3">
        {DEMOS.map((x, i) => (
          <button
            key={x.slug}
            onClick={() => setIdx(i)}
            aria-label={x.name}
            className={`h-2 rounded-full transition-all ${i === idx ? "w-7 bg-[#d7ff3f]" : "w-2 bg-white/25 hover:bg-white/50"}`}
          />
        ))}
      </div>
    </div>
  );
}
