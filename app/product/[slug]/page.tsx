import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdsConfig, getProductBySlug, getProducts } from "@/lib/catalog";
import ProductBuy from "./ProductBuy";
import ProductCard from "@/components/ProductCard";
import AdSlot from "@/components/AdSlot";
import { activeSlots } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [product, ads] = await Promise.all([getProductBySlug(slug), getAdsConfig()]);
  if (!product) notFound();

  const related = (await getProducts())
    .filter(
      (p) => p.id !== product.id && p.category?.slug === product.category?.slug
    )
    .slice(0, 3);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <nav className="mb-8 text-sm text-slate-500">
        <Link href="/" className="hover:text-[#d7ff3f]">হোম</Link>
        <span className="mx-2">/</span>
        <Link href="/shop" className="hover:text-[#d7ff3f]">শপ</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-300">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* left: info */}
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
                <span className="chip">{product.category.icon} {product.category.name_bn}</span>
              )}
              <h1 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">
                {product.name}
              </h1>
            </div>
          </div>

          <p className="mt-5 text-lg text-slate-300">{product.tagline_bn}</p>
          <p className="mt-3 leading-relaxed text-slate-400">{product.description_bn}</p>

          {product.features_bn.length > 0 && (
            <div className="mt-6">
              <h3 className="font-bold text-white">✨ যা যা পাবেন</h3>
              <ul className="mt-3 space-y-2.5">
                {product.features_bn.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-slate-300">
                    <span className="mt-0.5 text-[#d7ff3f]">✓</span> {f}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="glass mt-6 rounded-2xl border-l-2 border-l-[#d7ff3f] p-4">
            <p className="text-sm font-bold text-[#d7ff3f]">📦 ডেলিভারি তথ্য</p>
            <p className="mt-1 text-sm leading-relaxed text-slate-400">
              {product.delivery_note_bn}
            </p>
          </div>
        </div>

        {/* right: buy box */}
        <div>
          <ProductBuy product={product} />
        </div>
      </div>

      {activeSlots(ads, "product_page").map((slot) => (
        <div key={slot.id} className="mt-14">
          <AdSlot code={slot.code} />
        </div>
      ))}

      {related.length > 0 && (
        <div className="mt-20">
          <h2 className="mb-6 font-display text-2xl font-bold text-white">
            সম্পর্কিত প্রোডাক্ট
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
