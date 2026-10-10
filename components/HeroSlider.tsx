"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Slide } from "@/lib/types";

const FALLBACK: Slide[] = [
  {
    id: "f1",
    title_bn: "অরিজিনাল প্রিমিয়াম সাবস্ক্রিপশন",
    subtitle_bn: "CapCut Pro, Canva Pro, YouTube Premium — সবচেয়ে কম দামে, দ্রুত ডেলিভারি।",
    cta_text: "🛍️ এখনই কিনুন",
    cta_link: "/shop",
    image_url: null,
    bg_from: "#8b5cf6",
    bg_to: "#d7ff3f",
    sort: 1,
    is_active: true,
  },
];

export default function HeroSlider({ slides }: { slides: Slide[] }) {
  const list = slides.length > 0 ? slides : FALLBACK;
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const go = useCallback(
    (n: number) => setIdx(((n % list.length) + list.length) % list.length),
    [list.length]
  );

  useEffect(() => {
    if (paused || list.length < 2) return;
    timer.current = setInterval(() => go(idx + 1), 5000);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [idx, paused, go, list.length]);

  // touch swipe
  const touchX = useRef<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    touchX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (dx > 40) go(idx - 1);
    else if (dx < -40) go(idx + 1);
    touchX.current = null;
  };

  return (
    <section
      className="relative overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div
        className="flex transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{ transform: `translateX(-${idx * 100}%)` }}
      >
        {list.map((s) => (
          <div key={s.id} className="w-full shrink-0">
            <div className="relative">
              <div className="dot-grid absolute inset-0" />
              {/* video-like animated background */}
              <div className="animate-aurora-a pointer-events-none absolute -left-20 top-0 h-96 w-96 rounded-full bg-violet-600/25 blur-[110px]" />
              <div className="animate-aurora-b pointer-events-none absolute -right-16 bottom-0 h-[420px] w-[420px] rounded-full bg-[#d7ff3f]/15 blur-[120px]" />
              <div className="animate-aurora-c pointer-events-none absolute left-1/3 top-1/4 h-72 w-72 rounded-full bg-cyan-500/15 blur-[100px]" />
              <div className="animate-sweep pointer-events-none absolute inset-y-0 w-1/4 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
              {/* floating editing/product elements */}
              <div className="pointer-events-none absolute inset-0 hidden overflow-hidden sm:block" aria-hidden>
                {[
                  ["✂️", "8%", "18%", "0s", "CapCut"],
                  ["🎨", "88%", "12%", "-2s", "Canva"],
                  ["▶️", "82%", "68%", "-4s", "YouTube"],
                  ["🎬", "12%", "72%", "-1s", ""],
                  ["🎧", "70%", "30%", "-3s", ""],
                  ["📱", "22%", "38%", "-5s", ""],
                ].map(([e, left, top, delay, label], i) => (
                  <div key={i} className="animate-float-slow absolute text-center" style={{ left, top, animationDelay: delay }}>
                    <span className="text-4xl drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]">{e}</span>
                    {label && <p className="mt-1 rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">{label}</p>}
                  </div>
                ))}
              </div>
              <div
                className="absolute inset-0 opacity-25"
                style={{
                  background: `radial-gradient(800px 400px at 20% 20%, ${s.bg_from}, transparent 65%), radial-gradient(700px 380px at 85% 80%, ${s.bg_to}, transparent 60%)`,
                }}
              />
              {s.image_url && (
                <img
                  src={s.image_url}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover opacity-30"
                />
              )}
              <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
                <div className="max-w-3xl">
                  <span className="chip chip-lime">✦ DigiPlyra</span>
                  <h1 className="mt-5 font-display text-4xl font-bold leading-[1.15] text-white sm:text-6xl">
                    {s.title_bn}
                  </h1>
                  {s.subtitle_bn && (
                    <p className="mt-4 max-w-xl text-lg text-slate-300">{s.subtitle_bn}</p>
                  )}
                  <div className="mt-8 flex flex-wrap gap-3">
                    <Link href={s.cta_link} className="btn-vault text-base">
                      {s.cta_text}
                    </Link>
                    <Link href="/shop" className="btn-ghost text-base">
                      সব প্রোডাক্ট
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {list.length > 1 && (
        <>
          <button
            onClick={() => go(idx - 1)}
            aria-label="আগের স্লাইড"
            className="absolute left-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-black/40 text-white backdrop-blur transition hover:border-[#d7ff3f]/60 sm:grid"
          >
            ←
          </button>
          <button
            onClick={() => go(idx + 1)}
            aria-label="পরের স্লাইড"
            className="absolute right-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-black/40 text-white backdrop-blur transition hover:border-[#d7ff3f]/60 sm:grid"
          >
            →
          </button>
          <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2">
            {list.map((s, i) => (
              <button
                key={s.id}
                onClick={() => go(i)}
                aria-label={`স্লাইড ${i + 1}`}
                className={`h-2 rounded-full transition-all ${
                  i === idx ? "w-8 bg-[#d7ff3f]" : "w-2 bg-white/25 hover:bg-white/50"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
