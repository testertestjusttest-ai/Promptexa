import Link from "next/link";
import type { Product } from "@/lib/types";
import { formatBDT } from "@/lib/format";

export default function ProductCard({ product }: { product: Product }) {
  const plans = product.plans ?? [];
  const minPrice = plans.length ? Math.min(...plans.map((p) => p.price_bdt)) : 0;
  const hasDiscount = plans.some(
    (p) => p.old_price_bdt && p.old_price_bdt > p.price_bdt
  );

  return (
    <Link
      href={`/product/${product.slug}`}
      className="glass card-hover group relative flex flex-col overflow-hidden rounded-2xl p-5"
    >
      {hasDiscount && (
        <span className="absolute right-4 top-4 rounded-full bg-[#f43f5e]/15 px-2.5 py-1 text-[11px] font-bold text-[#fda4af]">
          ছাড় চলছে
        </span>
      )}
      <div className="flex items-start justify-between">
        <span
          className="grid h-14 w-14 place-items-center rounded-2xl text-2xl"
          style={{
            background: product.badge_bg,
            boxShadow: `0 8px 28px -8px ${product.badge_bg}`,
          }}
        >
          {product.badge}
        </span>
        {product.is_featured && <span className="chip chip-lime">জনপ্রিয়</span>}
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
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#d7ff3f]/10 text-[#d7ff3f] transition group-hover:bg-[#d7ff3f] group-hover:text-[#060913]">
          →
        </span>
      </div>
    </Link>
  );
}
