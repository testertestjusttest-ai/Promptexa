"use client";

/** Shared UI bits for DemoSite pages. */

import Link from "next/link";
import { useEffect, useState } from "react";
import { toBnDigits } from "@/lib/format";
import type { DemoProduct } from "./types";
import { useDemo } from "./store";

export function Price({ v, accent, big, note }: { v: number; accent?: string; big?: boolean; note?: string }) {
  return (
    <span>
      <span className={big ? "text-2xl font-black" : "font-black"} style={accent ? { color: accent } : undefined}>
        {toBnDigits(v.toLocaleString("en-IN"))} টাকা
      </span>
      {note && <span className="text-xs opacity-60"> {note}</span>}
    </span>
  );
}

export function Stars({ rating, reviews }: { rating: number; reviews?: number }) {
  return (
    <span className="text-xs">
      <span className="text-amber-400">{"★".repeat(Math.round(rating))}{"☆".repeat(5 - Math.round(rating))}</span>
      <span className="ml-1 opacity-60">
        {toBnDigits(rating.toFixed(1))}{reviews !== undefined && ` (${toBnDigits(reviews.toLocaleString("en-IN"))})`}
      </span>
    </span>
  );
}

export function Field(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-white/40 ${props.className ?? ""}`}
    />
  );
}

export function Area(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-white/40 ${props.className ?? ""}`}
    />
  );
}

export function Btn({ children, onClick, accent, ghost, small }: {
  children: React.ReactNode;
  onClick?: () => void;
  accent: string;
  ghost?: boolean;
  small?: boolean;
}) {
  if (ghost)
    return (
      <button onClick={onClick} className={`btn-demo-ghost ${small ? "!px-4 !py-2 !text-[13px]" : ""}`}>
        {children}
      </button>
    );
  return (
    <button onClick={onClick} className={`btn-demo ${small ? "!px-4 !py-2 !text-[13px]" : ""}`} style={{ background: accent }}>
      {children}
    </button>
  );
}

export function SectionTitle({ t, sub, link, linkLabel }: { t: string; sub?: string; link?: string; linkLabel?: string }) {
  return (
    <div className="mb-3 flex items-end justify-between">
      <div>
        <h2 className="text-lg font-black">{t}</h2>
        {sub && <p className="text-xs opacity-60">{sub}</p>}
      </div>
      {link && (
        <Link href={link} className="text-xs font-bold opacity-70 hover:opacity-100">
          {linkLabel ?? "সব দেখুন →"}
        </Link>
      )}
    </div>
  );
}

export function Empty({ emoji, text }: { emoji: string; text: string }) {
  return (
    <div className="py-14 text-center">
      <p className="text-5xl">{emoji}</p>
      <p className="mt-3 text-sm opacity-60">{text}</p>
    </div>
  );
}

/** Product card → links to product page. */
export function ProductCard({ p }: { p: DemoProduct }) {
  const { def, base } = useDemo();
  const off = p.oldPrice ? Math.round((1 - p.p / p.oldPrice) * 100) : 0;
  return (
    <Link
      href={`${base}/p/${p.id}`}
      className={`group overflow-hidden rounded-2xl border transition hover:-translate-y-1 hover:shadow-xl ${
        def.dark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"
      }`}
    >
      <div className={`relative h-36 overflow-hidden ${def.dark ? "bg-white/[0.03]" : "bg-slate-100"}`}>
        {p.img ? (
          <img src={p.img} alt={p.n} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        ) : (
          <div className="grid h-full place-items-center text-5xl">{p.e}</div>
        )}
        {off > 0 && (
          <span className="absolute left-2 top-2 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-black text-white">
            −{toBnDigits(off)}%
          </span>
        )}
      </div>
      <div className="p-3">
        <p className="truncate text-sm font-bold">{p.n}</p>
        <Stars rating={p.rating} reviews={p.reviews} />
        <div className="mt-1 flex items-center gap-2">
          <Price v={p.p} accent={def.accent} note={p.priceNote ?? def.priceNote} />
          {p.oldPrice && (
            <span className="text-xs opacity-50 line-through">{toBnDigits(p.oldPrice.toLocaleString("en-IN"))} টাকা</span>
          )}
        </div>
      </div>
    </Link>
  );
}

/** Breadcrumb-ish back link. */
export function Back({ href, label }: { href: string; label?: string }) {
  return (
    <Link href={href} className="mb-3 inline-block text-xs font-bold opacity-60 hover:opacity-100">
      ← {label ?? "ফিরে যান"}
    </Link>
  );
}

/** Page container. */
export function Page({ children, narrow }: { children: React.ReactNode; narrow?: boolean }) {
  return <div className={`mx-auto w-full ${narrow ? "max-w-xl" : "max-w-6xl"} px-4 py-6`}>{children}</div>;
}

/** Auth guard hint — prompts login but doesn't block. */
export function LoginHint() {
  const { base, def } = useDemo();
  return (
    <div className={`rounded-2xl p-4 text-center text-sm ${def.dark ? "bg-white/5" : "bg-slate-50"}`}>
      💡 <Link href={`${base}/login`} className="font-bold underline">লগইন</Link> করলে অর্ডার হিস্ট্রি ও ওয়ালেট সুবিধা পাবেন
    </div>
  );
}

/* ================= Hero slider — auto RTL (right → left) ================= */

export interface HeroSlide {
  img?: string;
  emoji: string;
  title: string;
  sub: string;
  cta?: string;
  href?: string;
  grad?: string;
}

export function HeroSlider({ slides, accent }: { slides: HeroSlide[]; accent: string }) {
  const { base } = useDemo();
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = slides.length;
  useEffect(() => {
    if (paused || n < 2) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % n), 4000);
    return () => clearInterval(t);
  }, [paused, n]);
  if (n === 0) return null;
  const s = slides[idx];
  return (
    <div
      className="relative overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
    >
      {/* track slides right → left */}
      <div className="flex transition-transform duration-700 ease-in-out" style={{ transform: `translateX(-${idx * 100}%)` }}>
        {slides.map((sl, i) => (
          <div key={i} className="relative w-full shrink-0">
            <div className={`relative overflow-hidden bg-gradient-to-br ${sl.grad ?? "from-slate-800 to-slate-900"}`}>
              {sl.img && (
                <img src={sl.img} alt="" className="absolute inset-0 h-full w-full object-cover" loading={i === 0 ? "eager" : "lazy"} />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/25" />
              <div className="relative mx-auto flex max-w-6xl items-center gap-4 px-4 py-12 sm:py-16">
                <div className="flex-1">
                  <p className="text-4xl sm:text-5xl">{sl.emoji}</p>
                  <h1 className="mt-2 text-2xl font-black text-white drop-shadow-lg sm:text-4xl">{sl.title}</h1>
                  <p className="mt-1 text-sm text-white/85 drop-shadow sm:text-base">{sl.sub}</p>
                  {sl.cta && (
                    <Link
                      href={sl.href?.startsWith("http") ? sl.href : `${base}${sl.href ?? ""}`}
                      className="btn-demo mt-4 inline-block !px-8 !py-3"
                      style={{ background: accent }}
                    >
                      {sl.cta}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {n > 1 && (
        <>
          <button
            onClick={() => setIdx((idx - 1 + n) % n)}
            aria-label="আগের"
            className="absolute left-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-black/40 text-lg text-white backdrop-blur transition hover:bg-black/60"
          >
            ‹
          </button>
          <button
            onClick={() => setIdx((idx + 1) % n)}
            aria-label="পরের"
            className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-black/40 text-lg text-white backdrop-blur transition hover:bg-black/60"
          >
            ›
          </button>
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                aria-label={`স্লাইড ${i + 1}`}
                className={`h-2 rounded-full transition-all ${i === idx ? "w-6 bg-white" : "w-2 bg-white/40 hover:bg-white/70"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
