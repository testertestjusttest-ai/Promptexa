"use client";

import { useEffect, useMemo, useState } from "react";
import type { Category, Product } from "@/lib/types";
import ProductCard from "@/components/ProductCard";

export default function ShopClient({
  products,
  categories,
  initialCat,
}: {
  products: Product[];
  categories: Category[];
  initialCat: string;
}) {
  const [cat, setCat] = useState(initialCat);
  const [query, setQuery] = useState("");

  useEffect(() => {
    setCat(initialCat);
  }, [initialCat]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      const okCat = cat === "all" || p.category?.slug === cat;
      const okQ =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.tagline_bn.includes(query.trim());
      return okCat && okQ;
    });
  }, [products, cat, query]);

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCat("all")}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              cat === "all"
                ? "bg-[#d7ff3f] text-[#060913]"
                : "bg-white/5 text-slate-300 hover:bg-white/10"
            }`}
          >
            সবগুলো
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCat(c.slug)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                cat === c.slug
                  ? "bg-[#d7ff3f] text-[#060913]"
                  : "bg-white/5 text-slate-300 hover:bg-white/10"
              }`}
            >
              {c.icon} {c.name_bn}
            </button>
          ))}
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="🔍 প্রোডাক্ট খুঁজুন..."
          className="field max-w-xs"
        />
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <div className="glass mx-auto max-w-md rounded-2xl p-10 text-center">
          <div className="text-5xl">🔍</div>
          <p className="mt-4 font-bold text-white">কিছু পাওয়া যায়নি</p>
          <p className="mt-1 text-sm text-slate-400">
            অন্য ক্যাটাগরি বা সার্চ টার্ম চেষ্টা করুন।
          </p>
        </div>
      )}
    </div>
  );
}
