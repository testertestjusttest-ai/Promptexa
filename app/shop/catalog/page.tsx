import { getCategories, getProducts } from "@/lib/catalog";
import ShopClient, { CatalogHeading } from "../ShopClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "All Products",
  description:
    "Browse every premium subscription in the DigiPlyra catalog — CapCut Pro, Canva Pro, YouTube Premium, Spotify Premium and more.",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "DigiPlyra",
    url: "https://promptexa.vercel.app/shop/catalog",
    title: "All Products — DigiPlyra",
    description:
      "Browse every premium subscription in the DigiPlyra catalog — CapCut Pro, Canva Pro, YouTube Premium, Spotify Premium and more.",
  },
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>;
}) {
  const params = await searchParams;
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <CatalogHeading />
      <ShopClient
        products={products}
        categories={categories}
        initialCat={params.cat ?? "all"}
      />
    </div>
  );
}
