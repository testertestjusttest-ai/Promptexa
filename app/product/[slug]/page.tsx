import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAdsConfig, getProductBySlug, getProducts } from "@/lib/catalog";
import ProductBuy from "./ProductBuy";
import AdSlot from "@/components/AdSlot";
import { activeSlots } from "@/lib/catalog";
import { ProductBreadcrumb, ProductDetails, RelatedProducts } from "./ProductChrome";

export const dynamic = "force-dynamic";

/** Per-product SEO (SEO queue item 1): product pages previously inherited
 *  the generic site title/description. Title uses the product name (the
 *  root template appends " — DigiPlyra"); description is the product's own
 *  stored description/tagline, truncated, never invented copy. */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  const raw = (product.description_bn || product.tagline_bn || "").trim();
  const description = raw.length > 160 ? `${raw.slice(0, 157).trimEnd()}…` : raw;
  const images = product.image_url ? [{ url: product.image_url, alt: product.name }] : undefined;
  return {
    title: product.name,
    description: description || undefined,
    openGraph: { title: product.name, description: description || undefined, images },
    twitter: { card: "summary_large_image", title: product.name, description: description || undefined, images: product.image_url ? [product.image_url] : undefined },
  };
}

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
      <ProductBreadcrumb name={product.name} />

      <div className="grid gap-10 lg:grid-cols-2">
        {/* left: info (chrome language-aware; copy renders as stored) */}
        <ProductDetails product={product} />

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

      <RelatedProducts products={related} />
    </div>
  );
}
