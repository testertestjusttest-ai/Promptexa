"use client";

import { useState } from "react";
import { REVIEWS, REVIEW_COUNT, REVIEW_AVG } from "@/lib/reviews";
import { toBnDigits } from "@/lib/format";

const PAGE = 12;

function Stars({ n }: { n: number }) {
  return (
    <span className="text-sm tracking-tight text-amber-300">
      {"★".repeat(n)}
      <span className="text-slate-600">{"★".repeat(5 - n)}</span>
    </span>
  );
}

export default function ReviewsSection() {
  const [shown, setShown] = useState(6);
  const [expanded, setExpanded] = useState(false);

  const visible = REVIEWS.slice(0, shown);

  return (
    <div>
      {/* summary */}
      <div className="mb-8 flex flex-wrap items-center justify-center gap-4">
        <div className="glass rounded-2xl px-6 py-4 text-center">
          <p className="font-display text-3xl font-bold text-[#d7ff3f]">{toBnDigits(REVIEW_AVG)}</p>
          <Stars n={5} />
          <p className="mt-1 text-xs text-slate-400">{toBnDigits(REVIEW_COUNT)}+ ভেরিফাইড রিভিউ</p>
        </div>
        <div className="glass rounded-2xl px-6 py-4 text-center">
          <p className="font-display text-3xl font-bold text-white">{toBnDigits("98")}%</p>
          <p className="mt-1 text-xs text-slate-400">কাস্টমার সন্তুষ্টি</p>
        </div>
        <div className="glass rounded-2xl px-6 py-4 text-center">
          <p className="font-display text-3xl font-bold text-white">{toBnDigits("5000")}+</p>
          <p className="mt-1 text-xs text-slate-400">সফল ডেলিভারি</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((r, i) => (
          <div key={i} className="glass rounded-2xl p-5 transition hover:border-[#d7ff3f]/30">
            <div className="flex items-center justify-between">
              <Stars n={r.stars} />
              <span className="rounded-full bg-white/5 px-2.5 py-1 text-[10px] font-semibold text-slate-400">
                ✓ ভেরিফাইড ক্রেতা
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">“{r.text}”</p>
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm font-bold text-[#d7ff3f]">— {r.name}</p>
              <p className="text-[11px] text-slate-500">{r.product}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        {!expanded ? (
          <button
            onClick={() => { setExpanded(true); setShown(PAGE); }}
            className="btn-vault !px-8 !py-3 text-sm"
          >
            📖 সব {toBnDigits(REVIEW_COUNT)}টি রিভিউ দেখুন
          </button>
        ) : (
          <div className="space-y-3">
            {shown < REVIEW_COUNT && (
              <button
                onClick={() => setShown((s) => Math.min(s + 24, REVIEW_COUNT))}
                className="btn-vault !px-8 !py-3 text-sm"
              >
                আরও দেখুন ({toBnDigits(shown)}/{toBnDigits(REVIEW_COUNT)})
              </button>
            )}
            <div>
              <button
                onClick={() => { setExpanded(false); setShown(6); }}
                className="text-sm font-semibold text-slate-400 hover:text-white"
              >
                ▲ সংক্ষেপ করুন
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
