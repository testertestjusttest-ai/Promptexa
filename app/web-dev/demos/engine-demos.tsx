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
  appliances: { name: "Smart Home", type: "Home Appliances", desc: "Home electronics — with official warranty.", group: "🛍️ Shopping", heroSub: "Energy saving • Free installation" },
  flower: { name: "Flower Smile", type: "Flower Shop", desc: "Fresh flowers daily — including event decoration.", group: "🛍️ Shopping", heroSub: "Morning flowers • Event decor" },
  toy: { name: "Toy Kingdom", type: "Toy Shop", desc: "Safe toys for children — by age group.", group: "🛍️ Shopping", heroSub: "Safe • Educational" },
  stationary: { name: "Study Corner", type: "Stationery Shop", desc: "All school and office stationery — at wholesale rates.", group: "🛍️ Shopping", heroSub: "School packages • Home delivery" },
  biriyani: { name: "Biriyani House", type: "Restaurant", desc: "Dhaka's best biriyani — cooked over a wood fire.", group: "🍔 Food", heroSub: "Wood-fired • 30-minute delivery" },
  juicebar: { name: "Juice Bar", type: "Juice Shop", desc: "Fresh fruit juice — with no-sugar options.", group: "🍔 Food", heroSub: "100% natural • No preservatives" },
  sweets: { name: "Mishtanno", type: "Sweet Shop", desc: "Traditional sweets — freshly made every day.", group: "🍔 Food", heroSub: "Pure chhana • Fresh daily" },
  chinese: { name: "Dragon", type: "Chinese Restaurant", desc: "Authentic Chinese — chef direct from China.", group: "🍔 Food", heroSub: "Authentic recipes • Family packs" },
  clinic: { name: "Sheba Clinic", type: "Clinic", desc: "Specialist doctors — book your serial online.", group: "🛠️ Services", heroSub: "Experienced doctors • Modern lab" },
  dental: { name: "Bright Smile", type: "Dental Care", desc: "Modern dental treatment — painless procedures.", group: "🛠️ Services", heroSub: "Painless • German machines" },
  carwash: { name: "Sparkle Wash", type: "Car Wash", desc: "Professional car wash — service at your doorstep.", group: "🛠️ Services", heroSub: "Doorstep service • Eco friendly" },
  laundry: { name: "Fresh Laundry", type: "Laundry Service", desc: "Laundry with pickup and delivery — returned in 24 hours.", group: "🛠️ Services", heroSub: "Free pickup • 24-hour delivery" },
  electrician: { name: "Power Service", type: "Electrician", desc: "Certified electricians — emergency service within 1 hour.", group: "🛠️ Services", heroSub: "Certified • Service in 1 hour" },
  tutor: { name: "Study Hub", type: "Tutoring Service", desc: "Experienced tutors — at home or online.", group: "🛠️ Services", heroSub: "Verified tutors • Free demo class" },
  eventplan: { name: "Utsab", type: "Event Planner", desc: "Any event — from planning to execution.", group: "🛠️ Services", heroSub: "500+ events • Full package" },
  weddingplan: { name: "Dream Wedding", type: "Wedding Planner", desc: "Your dream wedding — everything under one roof.", group: "🛠️ Services", heroSub: "200+ weddings • Custom packages" },
};

export const ENGINE_DEMOS: Demo[] = ENGINE_DEFS.map((def) => {
  const en = EN_GALLERY[def.slug];
  if (!en) {
    return { slug: def.slug, name: def.name, type: def.type, desc: def.desc, price: def.price, group: def.group, render: () => engineMockup(def) };
  }
  const shown: EngineDef = { ...def, name: en.name, type: en.type, desc: en.desc, group: en.group, heroSub: en.heroSub };
  return { slug: def.slug, name: en.name, type: en.type, desc: en.desc, price: "From 4,999 Tk", group: en.group, render: () => engineMockup(shown) };
});
