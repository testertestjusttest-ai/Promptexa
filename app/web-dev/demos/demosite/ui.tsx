"use client";

/** Shared UI bits for DemoSite pages. */

import Link from "next/link";
import { useEffect, useState } from "react";
import { toBnDigits } from "@/lib/format";
import type { DemoProduct, DemoTheme } from "./types";
import { useDemo } from "./store";

/** Resolve the demo's visual theme (defaults to aurora). */
export function themeOf(def: { theme?: DemoTheme }): DemoTheme {
  return def.theme ?? "aurora";
}

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

export function Stars({ rating, reviews, en = false }: { rating: number; reviews?: number; en?: boolean }) {
  const fmt = (v: string) => (en ? v : toBnDigits(v));
  return (
    <span className="text-xs">
      <span className="text-amber-400">{"★".repeat(Math.round(rating))}{"☆".repeat(5 - Math.round(rating))}</span>
      <span className="ml-1 opacity-60">
        {fmt(rating.toFixed(1))}{reviews !== undefined && ` (${fmt(reviews.toLocaleString("en-IN"))})`}
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
  const { def } = useDemo();
  const theme = themeOf(def);
  const linkEl = link && (
    <Link href={link} className="text-xs font-bold opacity-70 hover:opacity-100">
      {linkLabel ?? "সব দেখুন →"}
    </Link>
  );
  if (theme === "split")
    return (
      <div className="mb-3 flex items-end justify-between border-l-4 pl-3" style={{ borderColor: def.accent }}>
        <div>
          <h2 className="text-lg font-black uppercase tracking-wide">{t}</h2>
          {sub && <p className="text-xs opacity-60">{sub}</p>}
        </div>
        {linkEl}
      </div>
    );
  if (theme === "minimal")
    return (
      <div className="mb-4 text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.25em] opacity-50">{sub ?? "সংগ্রহ"}</p>
        <h2 className="mt-1 text-xl font-light">{t}</h2>
        <div className="mx-auto mt-2 h-px w-12 bg-current opacity-30" />
        {linkEl && <div className="mt-1">{linkEl}</div>}
      </div>
    );
  if (theme === "bold")
    return (
      <div className="mb-3 flex items-end justify-between">
        <h2 className="text-2xl font-black uppercase leading-none tracking-tight sm:text-3xl">{t}</h2>
        {linkEl}
      </div>
    );
  if (theme === "elegant")
    return (
      <div className="mb-4 text-center">
        <div className="flex items-center justify-center gap-3">
          <span className="h-px w-10 bg-current opacity-25" />
          <h2 className="font-serif text-2xl font-bold">{t}</h2>
          <span className="h-px w-10 bg-current opacity-25" />
        </div>
        {sub && <p className="mt-1 text-xs italic opacity-60">{sub}</p>}
        {linkEl && <div className="mt-1">{linkEl}</div>}
      </div>
    );
  if (theme === "playful")
    return (
      <div className="mb-3 flex items-end justify-between">
        <h2 className="rounded-full px-4 py-1.5 text-lg font-black text-white shadow-lg" style={{ background: def.accent }}>
          {t}
        </h2>
        {linkEl}
      </div>
    );
  return (
    <div className="mb-3 flex items-end justify-between">
      <div>
        <h2 className="text-lg font-black">{t}</h2>
        {sub && <p className="text-xs opacity-60">{sub}</p>}
      </div>
      {linkEl}
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

/** Product card → links to product page. Styled per demo theme. */
export function ProductCard({ p }: { p: DemoProduct }) {
  const { def, base } = useDemo();
  const theme = themeOf(def);
  const off = p.oldPrice ? Math.round((1 - p.p / p.oldPrice) * 100) : 0;
  const imgBlock = (h: string) => (
    <div className={`relative overflow-hidden ${h} ${def.dark ? "bg-white/[0.03]" : "bg-slate-100"}`}>
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
  );
  const body = (
    <div className="p-3">
      <p className={`truncate text-sm font-bold ${theme === "elegant" ? "font-serif text-[15px]" : ""}`}>{p.n}</p>
      <Stars rating={p.rating} reviews={p.reviews} />
      <div className="mt-1 flex items-center gap-2">
        <Price v={p.p} accent={def.accent} note={p.priceNote ?? def.priceNote} />
        {p.oldPrice && (
          <span className="text-xs opacity-50 line-through">{toBnDigits(p.oldPrice.toLocaleString("en-IN"))} টাকা</span>
        )}
      </div>
    </div>
  );
  const shell: Record<DemoTheme, string> = {
    aurora: `rounded-2xl border ${def.dark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"}`,
    split: `rounded-none border-2 border-l-8 ${def.dark ? "border-white/15 bg-white/[0.04]" : "border-slate-300 bg-white"}`,
    minimal: `rounded-xl ${def.dark ? "bg-white/[0.06]" : "bg-white shadow-[0_2px_16px_rgba(0,0,0,0.06)]"}`,
    bold: `rounded-lg border-4 ${def.dark ? "border-white/25 bg-black/40" : "border-slate-900 bg-white"}`,
    elegant: `rounded-xl border ${def.dark ? "border-amber-200/20 bg-white/[0.04]" : "border-stone-200 bg-[#fffdf8]"}`,
    playful: `rounded-3xl border-2 ${def.dark ? "border-white/15 bg-white/[0.06]" : "border-slate-200 bg-white"} hover:rotate-1`,
  };
  return (
    <Link
      href={`${base}/p/${p.id}`}
      className={`group block overflow-hidden transition hover:-translate-y-1 hover:shadow-xl ${shell[theme]}`}
      style={theme === "split" ? { borderLeftColor: def.accent } : undefined}
    >
      {imgBlock(theme === "minimal" ? "h-40" : "h-36")}
      {body}
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

/* ================= Themed hero — 6 distinct designs ================= */

function HeroCta({ s, accent }: { s: HeroSlide; accent: string }) {
  const { base } = useDemo();
  if (!s.cta) return null;
  return (
    <Link
      href={s.href?.startsWith("http") ? s.href : `${base}${s.href ?? ""}`}
      className="btn-demo mt-4 inline-block !px-8 !py-3"
      style={{ background: accent }}
    >
      {s.cta}
    </Link>
  );
}

/** Split hero — text left, image right. */
function SplitHero({ slides, accent }: { slides: HeroSlide[]; accent: string }) {
  const s = slides[0];
  const { def } = useDemo();
  return (
    <div className={`border-b-4 ${def.dark ? "border-white/10" : "border-slate-200"}`} style={{ borderColor: accent }}>
      <div className="mx-auto grid max-w-6xl items-center gap-6 px-4 py-10 sm:grid-cols-2 sm:py-14">
        <div>
          <p className="text-5xl">{s.emoji}</p>
          <h1 className="mt-3 text-3xl font-black uppercase leading-tight tracking-tight sm:text-4xl">{s.title}</h1>
          <p className="mt-2 text-sm opacity-70 sm:text-base">{s.sub}</p>
          <HeroCta s={s} accent={accent} />
        </div>
        <div className="relative overflow-hidden rounded-none shadow-2xl">
          {s.img ? (
            <img src={s.img} alt="" className="h-64 w-full object-cover sm:h-80" />
          ) : (
            <div className={`grid h-64 place-items-center bg-gradient-to-br ${s.grad ?? def.grad} text-7xl sm:h-80`}>{s.emoji}</div>
          )}
          <div className="absolute bottom-0 left-0 right-0 h-2" style={{ background: accent }} />
        </div>
      </div>
    </div>
  );
}

/** Minimal hero — centered, airy, no image background. */
function MinimalHero({ slides, accent }: { slides: HeroSlide[]; accent: string }) {
  const s = slides[0];
  return (
    <div className="px-4 py-14 text-center sm:py-20">
      <p className="text-[11px] font-bold uppercase tracking-[0.3em] opacity-50">✦ {s.sub} ✦</p>
      <h1 className="mx-auto mt-3 max-w-2xl text-3xl font-extralight leading-snug sm:text-5xl">{s.title}</h1>
      <div className="mx-auto mt-4 h-px w-16" style={{ background: accent }} />
      <HeroCta s={{ ...s, sub: "" }} accent={accent} />
    </div>
  );
}

/** Bold hero — full-bleed, huge type. */
function BoldHero({ slides, accent }: { slides: HeroSlide[]; accent: string }) {
  const s = slides[0];
  const { def } = useDemo();
  return (
    <div className="relative overflow-hidden bg-black text-white">
      {s.img && <img src={s.img} alt="" className="absolute inset-0 h-full w-full object-cover opacity-50" />}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:py-24">
        <p className="inline-block -rotate-2 px-3 py-1 text-sm font-black uppercase text-black" style={{ background: accent }}>
          {s.emoji} হট
        </p>
        <h1 className="mt-3 max-w-2xl text-4xl font-black uppercase leading-[1.05] tracking-tight sm:text-6xl">{s.title}</h1>
        <p className="mt-2 max-w-xl text-base text-white/75">{s.sub}</p>
        <HeroCta s={s} accent={accent} />
      </div>
    </div>
  );
}

/** Elegant hero — serif, soft, refined. */
function ElegantHero({ slides, accent }: { slides: HeroSlide[]; accent: string }) {
  const s = slides[0];
  const { def } = useDemo();
  return (
    <div className="relative overflow-hidden">
      {s.img && <img src={s.img} alt="" className="absolute inset-0 h-full w-full object-cover" />}
      <div className={`absolute inset-0 ${def.dark ? "bg-black/55" : "bg-white/45"} backdrop-blur-[1px]`} />
      <div className="relative mx-auto max-w-3xl px-4 py-16 text-center sm:py-20">
        <p className="text-4xl">{s.emoji}</p>
        <p className="mt-2 text-xs uppercase tracking-[0.35em] opacity-60">❦ ❦ ❦</p>
        <h1 className="mt-3 font-serif text-3xl font-bold leading-snug sm:text-5xl">{s.title}</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm italic opacity-75 sm:text-base">{s.sub}</p>
        <HeroCta s={s} accent={accent} />
      </div>
    </div>
  );
}

/** Playful hero — fun, colorful, chunky. */
function PlayfulHero({ slides, accent }: { slides: HeroSlide[]; accent: string }) {
  const s = slides[0];
  const { def } = useDemo();
  return (
    <div className={`relative overflow-hidden bg-gradient-to-br ${s.grad ?? def.grad} px-4 py-12 sm:py-16`}>
      <div className="pointer-events-none absolute -left-6 top-6 rotate-[-12deg] text-6xl opacity-30">{s.emoji}</div>
      <div className="pointer-events-none absolute -right-4 bottom-8 rotate-[15deg] text-5xl opacity-30">🎉</div>
      <div className="relative mx-auto max-w-3xl text-center">
        <p className="inline-grid h-20 w-20 rotate-6 place-items-center rounded-3xl bg-white/20 text-5xl shadow-xl backdrop-blur">{s.emoji}</p>
        <h1 className="mt-4 text-3xl font-black text-white drop-shadow-lg sm:text-5xl">{s.title}</h1>
        <p className="mx-auto mt-2 max-w-xl font-bold text-white/90 sm:text-lg">{s.sub}</p>
        <HeroCta s={s} accent={accent} />
      </div>
    </div>
  );
}

/** Themed hero — picks a distinct design per demo theme. */
export function Hero({ slides, accent }: { slides: HeroSlide[]; accent: string }) {
  const { def } = useDemo();
  const theme = themeOf(def);
  if (theme === "split") return <SplitHero slides={slides} accent={accent} />;
  if (theme === "minimal") return <MinimalHero slides={slides} accent={accent} />;
  if (theme === "bold") return <BoldHero slides={slides} accent={accent} />;
  if (theme === "elegant") return <ElegantHero slides={slides} accent={accent} />;
  if (theme === "playful") return <PlayfulHero slides={slides} accent={accent} />;
  return <HeroSlider slides={slides} accent={accent} />;
}

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
