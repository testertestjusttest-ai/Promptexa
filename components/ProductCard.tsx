"use client";

import Link from "next/link";
import type { Product } from "@/lib/types";
import { formatBDT, formatUSD } from "@/lib/format";
import { isSoldOut } from "@/lib/types";
import { useLang } from "@/lib/i18n";

/**
 * Compact professional product card — Daraz-style:
 * image with overlaid badges, 1-line title, price + CTA. No wasted rows.
 */
export default function ProductCard({ product }: { product: Product }) {
  const { lang, t } = useLang();
  const plans = product.plans ?? [];
  const minPrice = plans.length ? Math.min(...plans.map((p) => p.price_bdt)) : 0;
  const hasDiscount = plans.some(
    (p) => p.old_price_bdt && p.old_price_bdt > p.price_bdt
  );
  const soldOut = isSoldOut(product);

  return (
    <Link
      href={soldOut ? "#" : `/product/${product.slug}`}
      onClick={soldOut ? (e) => e.preventDefault() : undefined}
      className={`glass card-hover group relative flex flex-col overflow-hidden rounded-2xl ${
        soldOut ? "opacity-75" : ""
      }`}
    >
      {/* image / brand tile with overlaid badges */}
      <div className="relative h-32 shrink-0 overflow-hidden sm:h-36">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div
            className="grid h-full w-full place-items-center text-5xl"
            style={{ background: product.badge_bg }}
          >
            {product.badge}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b1120]/70 via-transparent to-transparent" />
        <div className="absolute left-2.5 top-2.5 flex gap-1.5">
          {hasDiscount && !soldOut && (
            <span className="rounded-full bg-[#f43f5e]/90 px-2.5 py-1 text-[10px] font-bold text-white shadow">
              {t("pc_discount")}
            </span>
          )}
          {product.is_featured && !soldOut && (
            <span className="rounded-full bg-[#d7ff3f]/90 px-2.5 py-1 text-[10px] font-bold text-black shadow">
              {t("pc_popular")}
            </span>
          )}
          {soldOut && (
            <span className="rounded-full bg-black/70 px-2.5 py-1 text-[10px] font-bold text-red-300">
              {t("pc_soldout")}
            </span>
          )}
        </div>
      </div>

      {/* body */}
      <div className="flex flex-1 flex-col p-3.5 sm:p-4">
        <h3 className="truncate font-display text-[15px] font-bold text-white transition group-hover:text-[#d7ff3f]">
          {product.name}
        </h3>
        {product.tagline_bn && lang === "bn" ? (
          <p className="mt-0.5 line-clamp-1 text-xs text-slate-400">
            {product.tagline_bn}
          </p>
        ) : null}

        <div className="mt-auto flex items-center justify-between pt-3">
          <div>
            <p className="text-[10px] uppercase tracking-wide text-slate-500">
              {t("pc_starting")}
            </p>
            <p className="font-display text-lg font-bold leading-tight text-[#d7ff3f]">
              {lang === "bn" ? formatBDT(minPrice) : formatUSD(minPrice)}
            </p>
          </div>
          <span
            className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl text-lg transition ${
              soldOut
                ? "bg-white/5 text-slate-500"
                : "bg-[#d7ff3f]/10 text-[#d7ff3f] group-hover:bg-[#d7ff3f] group-hover:text-[#060913]"
            }`}
          >
            {soldOut ? "✕" : "→"}
          </span>
        </div>
      </div>
    </Link>
  );
}
