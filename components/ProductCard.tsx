import Link from "next/link";
import type { Product } from "@/lib/types";
import { formatBDT } from "@/lib/format";
import { isSoldOut } from "@/lib/types";

export default function ProductCard({ product }: { product: Product }) {
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
      className={`glass card-hover group relative flex flex-col overflow-hidden rounded-2xl p-4 sm:p-5 ${
        soldOut ? "opacity-75" : ""
      }`}
    >
      {product.image_url ? (
        <div className="relative -mx-4 -mt-4 mb-1 h-40 overflow-hidden sm:-mx-5 sm:-mt-5">
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b1120] via-transparent to-transparent" />
        </div>
      ) : null}

      <div className="flex items-start justify-between gap-2">
        <span
          className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-2xl"
          style={{
            background: product.badge_bg,
            boxShadow: `0 8px 28px -8px ${product.badge_bg}`,
          }}
        >
          {product.badge}
        </span>
        <span className="flex flex-col items-end gap-1.5">
          {soldOut ? (
            <span className="rounded-full bg-red-500/20 px-3 py-1 text-[11px] font-bold text-red-300 backdrop-blur">
              স্টক শেষ
            </span>
          ) : (
            <>
              {hasDiscount && (
                <span className="rounded-full bg-[#f43f5e]/15 px-2.5 py-1 text-[11px] font-bold text-[#fda4af]">
                  ছাড় চলছে
                </span>
              )}
              {product.is_featured && (
                <span className="chip chip-lime">জনপ্রিয়</span>
              )}
            </>
          )}
        </span>
      </div>

      <h3 className="mt-4 font-display text-lg font-bold text-white transition group-hover:text-[#d7ff3f]">
        {product.name}
      </h3>
      <p className="mt-1 line-clamp-2 text-sm text-slate-400">
        {product.tagline_bn}
      </p>

      {plans.length > 0 && (
        <div className="mb-4 mt-3 flex flex-wrap gap-1.5">
          {plans.slice(0, 3).map((p) => (
            <span
              key={p.id}
              className="rounded-md bg-white/5 px-2 py-1 text-[11px] font-medium text-slate-300"
            >
              {p.label_bn}
            </span>
          ))}
        </div>
      )}

      <div className="mt-auto flex items-end justify-between border-t border-white/5 pt-4">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-slate-500">
            শুরু মাত্র
          </p>
          <p className="font-display text-xl font-bold text-[#d7ff3f]">
            {formatBDT(minPrice)}
          </p>
        </div>
        <span
          className={`grid h-10 w-10 place-items-center rounded-xl transition ${
            soldOut
              ? "bg-white/5 text-slate-500"
              : "bg-[#d7ff3f]/10 text-[#d7ff3f] group-hover:bg-[#d7ff3f] group-hover:text-[#060913]"
          }`}
        >
          {soldOut ? "✕" : "→"}
        </span>
      </div>
    </Link>
  );
}
