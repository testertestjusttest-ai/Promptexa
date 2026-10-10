"use client";

/** Shared UI bits for DemoSite pages. */

import Link from "next/link";
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
      <div className={`relative grid h-32 place-items-center text-5xl ${def.dark ? "bg-white/[0.03]" : "bg-slate-50"}`}>
        {p.e}
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
