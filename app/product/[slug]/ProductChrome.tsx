"use client";

import Link from "next/link";
import { useLang } from "@/lib/i18n";
import { localizedProductCopy } from "@/lib/product-copy";
import type { Product } from "@/lib/types";
import ProductCard from "@/components/ProductCard";

/** Product-page chrome, language-aware (same pattern as /shop):
 *  breadcrumb, section headings and the category chip follow the drawer
 *  language. The product copy itself is stored Bangla-only in the
 *  database, so EN/HI views use the faithful translations in
 *  lib/product-copy.ts (falling back to the stored copy for any product
 *  without a map entry) until _en columns exist in the database. */
export function ProductBreadcrumb({ name }: { name: string }) {
  const { t } = useLang();
  return (
    <nav className="mb-8 text-sm text-slate-500">
      <Link href="/" className="hover:text-[#d7ff3f]">{t("nav_home")}</Link>
      <span className="mx-2">/</span>
      <Link href="/shop" className="hover:text-[#d7ff3f]">{t("nav_shop")}</Link>
      <span className="mx-2">/</span>
      <span className="text-slate-300">{name}</span>
    </nav>
  );
}

export function ProductDetails({ product }: { product: Product }) {
  const { lang, t } = useLang();
  const copy = localizedProductCopy(product, lang);
  return (
    <div>
      {product.image_url && (
        <div className="glass mb-6 overflow-hidden rounded-3xl">
          <img
            src={product.image_url}
            alt={product.name}
            className="max-h-80 w-full object-cover"
          />
        </div>
      )}
      <div className="flex items-center gap-5">
        <span
          className="grid h-20 w-20 place-items-center rounded-3xl text-4xl"
          style={{
            background: product.badge_bg,
            boxShadow: `0 12px 40px -10px ${product.badge_bg}`,
          }}
        >
          {product.badge}
        </span>
        <div>
          {product.category && (
            <span className="chip">
              {product.category.icon}{" "}
              {lang === "bn" ? product.category.name_bn : product.category.name_en || product.category.name_bn}
            </span>
          )}
          <h1 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">
            {product.name}
          </h1>
        </div>
      </div>

      <p className="mt-5 text-lg text-slate-300">{copy.tagline}</p>
      <p className="mt-3 leading-relaxed text-slate-400">{copy.description}</p>

      {copy.features.length > 0 && (
        <div className="mt-6">
          <h3 className="font-bold text-white">{t("pd_included")}</h3>
          <ul className="mt-3 space-y-2.5">
            {copy.features.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-sm text-slate-300">
                <span className="mt-0.5 text-[#d7ff3f]">✓</span> {f}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="glass mt-6 rounded-2xl border-l-2 border-l-[#d7ff3f] p-4">
        <p className="text-sm font-bold text-[#d7ff3f]">{t("pd_delivery")}</p>
        <p className="mt-1 text-sm leading-relaxed text-slate-400">
          {copy.delivery}
        </p>
      </div>
    </div>
  );
}

export function RelatedProducts({ products }: { products: Product[] }) {
  const { t } = useLang();
  if (products.length === 0) return null;
  return (
    <div className="mt-20">
      <h2 className="mb-6 font-display text-2xl font-bold text-white">
        {t("pd_related")}
      </h2>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
