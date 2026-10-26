import { getCategories, getProducts } from "@/lib/catalog";
import ShopClient, { CatalogHeading } from "../ShopClient";

export const dynamic = "force-dynamic";

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
