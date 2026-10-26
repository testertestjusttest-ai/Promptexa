import type { Demo } from "./demos";
import type { EngineDef } from "./engine-data";
import { ENGINE_DEFS } from "./engine-data";

/** Lightweight static mockup for gallery cards. */
function engineMockup(def: EngineDef) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/15 bg-[#0a0a12] shadow-2xl">
      <div className="flex items-center gap-1.5 bg-black/80 px-3 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
        <span className="ml-2 flex-1 truncate rounded-md bg-white/10 px-2 py-0.5 font-mono text-[10px] text-slate-400">demo.digiplyra.com/{def.slug}</span>
      </div>
      <div className={`bg-gradient-to-br ${def.grad} px-4 py-6 text-center`}>
        <div className="text-4xl">{def.heroEmoji}</div>
        <p className="mt-2 text-sm font-black text-white">{def.name}</p>
        <p className="mt-0.5 text-[10px] text-white/80">{def.heroSub}</p>
      </div>
      <div className="grid grid-cols-3 gap-1.5 p-2">
        {def.items.slice(0, 6).map((i) => (
          <div key={i.n} className="grid h-14 place-items-center rounded-lg bg-white/5 text-2xl">{i.e}</div>
        ))}
      </div>
    </div>
  );
}

/** Gallery-layer English names for engine demos, sliced per run (demo pages
 *  still render from engine-data.ts and are a separate, deeper item). */
const EN_GALLERY: Record<string, { name: string; type: string; desc: string; group: string; heroSub: string }> = {
  cafe: { name: "Coffee House", type: "Cafe Website", desc: "Modern cafe site with menu and online ordering.", group: "🍔 Food", heroSub: "Fresh brew • Home delivery" },
  grocery: { name: "Daily Bazaar", type: "Grocery Store", desc: "Online grocery market — order and get home delivery.", group: "🛍️ Shopping", heroSub: "Fresh products • Fast delivery" },
  bakery: { name: "Sweet Bites", type: "Bakery", desc: "Fresh bakery items — baked hot every day.", group: "🍔 Food", heroSub: "Fresh daily • Delivery on order" },
  pharmacy: { name: "Sheba Pharmacy", type: "Pharmacy", desc: "Medicine home delivery — upload your prescription.", group: "🛍️ Shopping", heroSub: "Genuine medicine • Fast delivery" },
  bookstore: { name: "The Book House", type: "Bookstore", desc: "A huge collection of books — courier delivery nationwide.", group: "🛍️ Shopping", heroSub: "Original books • Cash on delivery" },
  mobilestore: { name: "Mobile Point", type: "Mobile Accessories", desc: "Original mobile accessories — at wholesale prices.", group: "🛍️ Shopping", heroSub: "Original • With warranty" },
  cosmetics: { name: "Ruposhi", type: "Cosmetics Shop", desc: "Original brand cosmetics — including skincare.", group: "🛍️ Shopping", heroSub: "100% original • Dermatologist advice" },
  furniture: { name: "Home Decor", type: "Furniture Shop", desc: "Premium furniture — free delivery and fitting.", group: "🛍️ Shopping", heroSub: "Solid wood • 5-year warranty" },
  petshop: { name: "Pet Friend", type: "Pet Shop", desc: "Pet food and care — everything in one place.", group: "🛍️ Shopping", heroSub: "Vet advice • Home delivery" },
  sports: { name: "Sports House", type: "Sports Shop", desc: "Original sports gear — players' favourite.", group: "🛍️ Shopping", heroSub: "Original brands • Team discounts" },
};

export const ENGINE_DEMOS: Demo[] = ENGINE_DEFS.map((def) => {
  const en = EN_GALLERY[def.slug];
  if (!en) {
    return { slug: def.slug, name: def.name, type: def.type, desc: def.desc, price: def.price, group: def.group, render: () => engineMockup(def) };
  }
  const shown: EngineDef = { ...def, name: en.name, type: en.type, desc: en.desc, group: en.group, heroSub: en.heroSub };
  return { slug: def.slug, name: en.name, type: en.type, desc: en.desc, price: "From 4,999 Tk", group: en.group, render: () => engineMockup(shown) };
});
