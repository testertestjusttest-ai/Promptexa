import { getCategories, getProducts } from "@/lib/catalog";
import { SectionHeading } from "@/components/Section";
import ShopClient from "../ShopClient";

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
      <SectionHeading
        kicker="শপ"
        title="সব প্রিমিয়াম প্রোডাক্ট"
        sub="অরিজিনাল সাবস্ক্রিপশন — দ্রুত ডেলিভারি গ্যারান্টি"
      />
      <ShopClient
        products={products}
        categories={categories}
        initialCat={params.cat ?? "all"}
      />
    </div>
  );
}
