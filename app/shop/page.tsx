import { activeSlots, getAdsConfig, getCategories, getProducts, getSlides, getStoreInfo } from "@/lib/catalog";
import ShopHomeClient from "./ShopHomeClient";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [featured, allActive, categories, store, slides, ads] = await Promise.all([
    getProducts(true),
    getProducts(false),
    getCategories(),
    getStoreInfo(),
    getSlides(),
    getAdsConfig(),
  ]);
  // Always show 4: featured first, then fill with other active products
  const seen = new Set(featured.map((p) => p.id));
  const showcase = [...featured];
  for (const p of allActive) {
    if (showcase.length >= 4) break;
    if (!seen.has(p.id)) showcase.push(p);
  }

  return (
    <ShopHomeClient
      showcase={showcase}
      categories={categories}
      storeNotice={store.notice_bn}
      slides={slides}
      topSlots={activeSlots(ads, "home_top")}
      bottomSlots={activeSlots(ads, "home_bottom")}
      popupSlots={activeSlots(ads, "popup")}
    />
  );
}
