/**
 * Agency rework overrides — Phase 1 (bakery + salon only).
 *
 * The original defs in defs.ts / engine-data.ts stay untouched (legacy demos
 * keep working exactly as before). Reworked demo routes wrap their def with
 * applyAgencyDemoOverride() before passing it to DemositeProvider, so only
 * those two demos change.
 *
 * What "reworked" means here:
 * - English-first identity: name, hero, about, address, hours, contact in
 *   English with Latin digits (WhatsApp 01833402586, the standing sales
 *   number). No Bangla word in the demo's own content.
 * - Fuller catalogues than the originals, modelled on the researched
 *   real-world sites: occasion/snack grouping for the bakery (Breads
 *   Bakery-style location-first ordering is the pattern; our demo keeps one
 *   Dhaka branch in Phase 1), stylist-level service detail + a patch-test
 *   note for colour for the salon (Salon SCK / Grand Noir-style transparent
 *   pricing).
 * - agencyReworked: true — DemoSite renders the extended AgencyDemoAdmin
 *   for these demos instead of the basic DemoAdmin.
 * - Prices are kept from the original demo where the item is unchanged, so
 *   nothing already quoted to a visitor silently changes price.
 */

import type { DemoSiteDef } from "./types";

const CONTACT = "01833402586";
const ADDRESS = "House 12, Road 5, Dhanmondi, Dhaka 1205";
const HOURS = "Open daily, 9:00 AM – 10:00 PM";

const BAKERY: Partial<DemoSiteDef> = {
  agencyReworked: true,
  name: "Sweet Crust Bakery",
  type: "Online Bakery",
  logoEmoji: "🍰",
  accent: "#fb923c",
  dark: false,
  heroTitle: "Fresh from the oven, every morning",
  heroSub: "Baked fresh daily • Pickup & home delivery in Dhaka",
  heroEmoji: "🍰",
  cats: ["All", "Breads", "Cakes", "Snacks"],
  products: [
    { id: "p0", n: "White Loaf", p: 80, e: "🍞", c: "Breads", desc: "Baked fresh every morning — soft inside, golden crust. The everyday loaf.", rating: 4.8, reviews: 412, stock: 40 },
    { id: "p1", n: "Bun Roll", p: 60, e: "🥯", c: "Breads", desc: "Soft, slightly sweet buns — perfect with tea or as a sandwich base.", rating: 4.7, reviews: 238, stock: 36 },
    { id: "p2", n: "Sourdough", p: 180, e: "🥖", c: "Breads", desc: "Slow-fermented for 24 hours. Tangy, chewy, and made with no preservatives.", rating: 4.9, reviews: 96, stock: 12 },
    { id: "p3", n: "Chocolate Cake", p: 550, e: "🍰", c: "Cakes", desc: "Rich chocolate layers with ganache. Order a day ahead for custom messages.", rating: 4.9, reviews: 521, stock: 8 },
    { id: "p4", n: "Butter Croissant", p: 150, e: "🥐", c: "Snacks", desc: "Flaky, buttery, baked in small batches through the morning.", rating: 4.8, reviews: 187, stock: 20 },
    { id: "p5", n: "Cookies (Pack of 6)", p: 120, e: "🍪", c: "Snacks", desc: "Crisp edges, soft centre. Six cookies per pack — chocolate chip.", rating: 4.7, reviews: 304, stock: 30 },
    { id: "p6", n: "Chicken Patties", p: 40, e: "🥟", c: "Snacks", desc: "Flaky pastry, spiced chicken filling. Sold per piece, best served warm.", rating: 4.6, reviews: 158, stock: 44 },
    { id: "p7", n: "Chicken Wrap Roll", p: 90, e: "🌯", c: "Snacks", desc: "Grilled chicken, salad and sauce wrapped fresh to order.", rating: 4.7, reviews: 143, stock: 25 },
  ],
  about:
    "Sweet Crust Bakery is a neighbourhood bakery in Dhanmondi, Dhaka. Everything is baked fresh every morning — no day-old bread, no shortcuts. Order online for pickup or home delivery, or ask us about a custom cake for birthdays and events.",
  contact: CONTACT,
  address: ADDRESS,
  hours: HOURS,
  priceNote: "Prices in Tk. Pickup & home delivery available.",
};

const SALON: Partial<DemoSiteDef> = {
  agencyReworked: true,
  name: "Glow & Grace Studio",
  type: "Beauty Salon",
  logoEmoji: "💅",
  accent: "#f472b6",
  dark: false,
  heroTitle: "Look your best, every day",
  heroSub: "Expert stylists • Premium products • Book online",
  heroEmoji: "💅",
  cats: ["All", "Hair", "Skin", "Nails", "Makeup"],
  services: [
    { id: "s0", n: "Haircut + Spa", p: 800, e: "💇", desc: "Cut, wash and a relaxing head spa with a senior stylist. Includes a style finish.", duration: "45 min", rating: 4.8, c: "Hair" },
    { id: "s1", n: "Bridal Facial", p: 1500, e: "💆", desc: "Deep-cleanse, massage and glow treatment for the big day. Patch test on request.", duration: "90 min", rating: 4.9, c: "Skin" },
    { id: "s2", n: "Manicure + Pedicure", p: 900, e: "💅", desc: "Soak, shaping, cuticle care and polish — hands and feet, one sitting.", duration: "60 min", rating: 4.8, c: "Nails" },
    { id: "s3", n: "Hair Colour", p: 2000, e: "🎨", desc: "Full colour with premium dye and bond care. Patch test required 48 hours before colour appointments.", duration: "120 min", rating: 4.7, c: "Hair" },
    { id: "s4", n: "Keratin Treatment", p: 3500, e: "✨", desc: "Smoothing keratin for frizz-free, manageable hair for weeks. Consultation first.", duration: "150 min", rating: 4.9, c: "Hair" },
    { id: "s5", n: "Party Makeup", p: 2500, e: "💄", desc: "Full-face party look with lashes, styled to match your outfit and event.", duration: "90 min", rating: 4.8, c: "Makeup" },
  ],
  about:
    "Glow & Grace Studio is a beauty salon in Dhanmondi, Dhaka. Certified stylists, premium products, transparent prices — book your chair online in under a minute. Prices shown are starting prices; your stylist confirms the final price before starting.",
  contact: CONTACT,
  address: ADDRESS,
  hours: HOURS,
};


/* ---------------- Phase 2: shop family (merged from draft batches) ---------------- */

/**
 * Phase 2 shop-demo drafts — Batch 1 (DRAFT ONLY, not merged, not live).
 *
 * Do NOT copy this file into the repo as-is: the coordinator merges these
 * consts into agency-demo-overrides.ts, adjusts the import path, typechecks,
 * builds and smoke-checks. Nothing here touches the original engine defs.
 *
 * Pattern copied from Phase 1 (bakery/salon): agencyReworked: true,
 * English-first identity, standing contact/address/hours, prices kept from
 * the original demo where the item is unchanged, new items priced plausibly
 * in Tk. Catalogue rating/review/stock numbers are demo data only; no
 * review text is included. No real team size or customer count is claimed.
 *
 * NOTE on `dark`: engine-data.ts carries no dark field; the conversion in
 * demosite/defs.ts sets dark: true for every engine-derived demo, so these
 * drafts keep dark: true. Phase 1 bakery/salon overrides set dark: false,
 * so the coordinator should confirm which value the merged file should use.
 *
 * Research URLs (verbatim from browser search results):
 * - Pharmacy: https://www.arogga.com/category-home/medicines ,
 *   https://medeasy.health/ , https://deshiz.com/online-medicine-shops-bangladesh/
 * - Bookstore: https://bookscartbd.com/?utm_source=ig&utm_medium=paid&utm_campaign=120246859681440068&utm_term=120246859681280068&utm_content=120246859681270068&utm_id=120246859681440068 ,
 *   https://bookhouse.com.bd/terms-of-use ,
 *   https://bdbusinessfinder.com/top-5-online-book-shops-in-bangladesh/
 * - Mobile store: http://borofone.com.bd/ , https://baseus.com.bd/ ,
 *   https://aero.com.bd/
 * - Cosmetics: https://rusubd.com/ , https://beautybooth.com.bd/ ,
 *   https://authenticmakeupstorebd.com/
 * - Furniture: https://hatil.com/blog/en/furniture-that-redefines-modern-living/ ,
 *   https://ahadfurniture.com/ ,
 *   http://deshiz.com/online-furniture-shops-bangladesh/
 */

/* ------------------------------------------------------------------ */
/* PHARMACY                                                            */
/* Research: https://www.arogga.com/category-home/medicines            */
/*           https://medeasy.health/                                   */
/*           https://deshiz.com/online-medicine-shops-bangladesh/      */
/* What the real sites do well: prescription upload with a pharmacist  */
/* check before dispatch, browsing by medicine vs health-care grouping,*/
/* and same-day Dhaka delivery framing with cash on delivery. The demo */
/* copies the grouping and the prescription-check framing only.        */
/* ------------------------------------------------------------------ */
const PHARMACY: Partial<DemoSiteDef> = {
  agencyReworked: true,
  name: "CarePoint Pharmacy",
  type: "Pharmacy",
  logoEmoji: "💊",
  accent: "#2dd4bf",
  dark: true,
  heroTitle: "Genuine medicine, delivered to your door",
  heroSub: "Prescription upload • Pharmacist-checked orders • Home delivery in Dhaka",
  heroEmoji: "💊",
  cats: ["All", "Medicines", "Health Care"],
  products: [
    { id: "p0", n: "Paracetamol Tablets", p: 30, e: "💊", c: "Medicines", desc: "Fever and pain relief tablets. Follow your prescription or the directions on the pack.", rating: 4.8, reviews: 512, stock: 60 },
    { id: "p1", n: "Vitamin Tablets", p: 450, e: "💊", c: "Medicines", desc: "Daily vitamin supplement tablets. Check the pack for the recommended daily dose.", rating: 4.7, reviews: 189, stock: 32 },
    { id: "p2", n: "Cough Syrup", p: 180, e: "🧴", c: "Medicines", desc: "Soothing cough syrup for dry and chesty coughs. Shake well before use.", rating: 4.6, reviews: 214, stock: 28 },
    { id: "p3", n: "ORS Pack (10 Sachets)", p: 150, e: "🥤", c: "Medicines", desc: "Oral rehydration salts, ten sachets per pack. Mix one sachet per litre of clean water.", rating: 4.8, reviews: 167, stock: 45 },
    { id: "p4", n: "Bandage Pack", p: 80, e: "🩹", c: "Health Care", desc: "Assorted adhesive bandages for everyday cuts and blisters. Pack of assorted sizes.", rating: 4.7, reviews: 203, stock: 50 },
    { id: "p5", n: "Face Mask Pack", p: 120, e: "😷", c: "Health Care", desc: "Disposable face masks, pack of ten. Soft ear loops and a fitted nose strip.", rating: 4.6, reviews: 178, stock: 70 },
    { id: "p6", n: "Hand Sanitizer", p: 220, e: "🧼", c: "Health Care", desc: "Quick-drying hand sanitizer for use at home or on the go. Keep away from open flame.", rating: 4.7, reviews: 241, stock: 42 },
    { id: "p7", n: "Antiseptic Cream", p: 260, e: "🧴", c: "Health Care", desc: "Antiseptic cream for minor cuts and grazes. Apply a thin layer to clean skin.", rating: 4.7, reviews: 132, stock: 24 },
    { id: "p8", n: "Digital Thermometer", p: 850, e: "🌡️", c: "Health Care", desc: "Fast-reading digital thermometer with a clear display. Battery included.", rating: 4.8, reviews: 98, stock: 18 },
    { id: "p9", n: "Blood Pressure Monitor", p: 2850, e: "🩺", c: "Health Care", desc: "Upper-arm blood pressure monitor with memory for past readings. Cuff included.", rating: 4.8, reviews: 76, stock: 10 },
  ],
  about:
    "CarePoint Pharmacy is a neighbourhood pharmacy in Dhanmondi, Dhaka. Order everyday medicines and health-care items online for pickup or home delivery. Upload a photo of your prescription at checkout and our pharmacist checks it before dispatch — prescription-only items are supplied only against a valid prescription. Genuine stock, sealed packs, and clear expiry dates on every order.",
  contact: CONTACT,
  address: ADDRESS,
  hours: HOURS,
  priceNote: "Prices in Tk. Prescription-only items require a valid prescription.",
};

/* ------------------------------------------------------------------ */
/* BOOKSTORE                                                           */
/* Research: https://bookscartbd.com/?utm_source=ig&utm_medium=paid&utm_campaign=120246859681440068&utm_term=120246859681280068&utm_content=120246859681270068&utm_id=120246859681440068 */
/*           https://bookhouse.com.bd/terms-of-use                     */
/*           https://bdbusinessfinder.com/top-5-online-book-shops-in-bangladesh/ */
/* What the real sites do well: deep category browsing (fiction,       */
/* non-fiction, children, history), cash on delivery, and courier       */
/* delivery across the country. The demo copies the category depth and */
/* the cash-on-delivery framing only.                                  */
/* ------------------------------------------------------------------ */
const BOOKSTORE: Partial<DemoSiteDef> = {
  agencyReworked: true,
  name: "Bright Pages Bookstore",
  type: "Bookstore",
  logoEmoji: "📚",
  accent: "#a78bfa",
  dark: true,
  heroTitle: "Find your next great read",
  heroSub: "Original books • Cash on delivery • Courier across Bangladesh",
  heroEmoji: "📚",
  cats: ["All", "Fiction", "Non-Fiction", "Children"],
  products: [
    { id: "p0", n: "Novel", p: 350, e: "📖", c: "Fiction", desc: "A full-length novel — the kind you finish in one sitting and lend to a friend.", rating: 4.8, reviews: 342, stock: 25 },
    { id: "p1", n: "Short Story Collection", p: 280, e: "📗", c: "Fiction", desc: "A collection of short stories, perfect for reading one at a time before bed.", rating: 4.7, reviews: 196, stock: 30 },
    { id: "p2", n: "Poetry Collection", p: 220, e: "📜", c: "Fiction", desc: "A slim volume of poems to read slowly and return to often.", rating: 4.8, reviews: 141, stock: 22 },
    { id: "p3", n: "Classic Tales", p: 300, e: "📕", c: "Fiction", desc: "Timeless stories in a fresh edition — a good first classic or a gift.", rating: 4.7, reviews: 118, stock: 28 },
    { id: "p4", n: "Biography", p: 420, e: "👤", c: "Non-Fiction", desc: "A life story, well told — from early struggles to the work that made the name.", rating: 4.8, reviews: 173, stock: 20 },
    { id: "p5", n: "History Book", p: 450, e: "🏛️", c: "Non-Fiction", desc: "A readable history of people, places and turning points, with maps and notes.", rating: 4.9, reviews: 154, stock: 16 },
    { id: "p6", n: "Science Book", p: 380, e: "🔬", c: "Non-Fiction", desc: "Big ideas in plain language — how the world works, explained for curious readers.", rating: 4.8, reviews: 187, stock: 24 },
    { id: "p7", n: "Exam Guide", p: 520, e: "✏️", c: "Non-Fiction", desc: "A structured exam guide with practice questions and worked answers.", rating: 4.6, reviews: 209, stock: 35 },
    { id: "p8", n: "Children's Picture Book", p: 180, e: "🧒", c: "Children", desc: "Bright pictures and simple words for young readers, printed on sturdy pages.", rating: 4.9, reviews: 264, stock: 40 },
    { id: "p9", n: "Children's Activity Book", p: 240, e: "🎨", c: "Children", desc: "Puzzles, colouring and drawing pages to keep young minds busy for hours.", rating: 4.7, reviews: 149, stock: 33 },
  ],
  about:
    "Bright Pages Bookstore is a neighbourhood bookshop in Dhanmondi, Dhaka. Browse fiction, non-fiction and children's books online, then pick up in store or have them couriered to you anywhere in Bangladesh. Every book is an original edition — no photocopies, no pirated prints. Pay cash on delivery, or ask us about gift wrapping for a book you are sending to someone else.",
  contact: CONTACT,
  address: ADDRESS,
  hours: HOURS,
  priceNote: "Prices in Tk. Cash on delivery available.",
};

/* ------------------------------------------------------------------ */
/* MOBILE STORE                                                        */
/* Research: http://borofone.com.bd/ , https://baseus.com.bd/ ,       */
/*           https://aero.com.bd/                                      */
/* What the real sites do well: grouping by charging, audio and        */
/* protection, original-product plus warranty framing, and clear       */
/* compatibility guidance (connector type, fast-charge standard). The  */
/* demo copies the grouping and the warranty framing only.             */
/* ------------------------------------------------------------------ */
const MOBILESTORE: Partial<DemoSiteDef> = {
  agencyReworked: true,
  name: "Mobile Point",
  type: "Mobile Accessories Store",
  logoEmoji: "📱",
  accent: "#38bdf8",
  dark: true,
  heroTitle: "Everything for your phone, in one place",
  heroSub: "Original accessories • Warranty on eligible items • Pickup & delivery",
  heroEmoji: "📱",
  cats: ["All", "Chargers", "Accessories"],
  products: [
    { id: "p0", n: "Fast Charger", p: 450, e: "🔌", c: "Chargers", desc: "Fast-charging wall adapter. Check your phone's fast-charge standard before ordering.", rating: 4.7, reviews: 386, stock: 48 },
    { id: "p1", n: "Power Bank", p: 1800, e: "🔋", c: "Chargers", desc: "High-capacity power bank for a full day away from a socket. Cable included.", rating: 4.8, reviews: 292, stock: 26 },
    { id: "p2", n: "USB-C Cable", p: 380, e: "🔌", c: "Chargers", desc: "Braided USB-C cable for charging and data. One metre, tangle-resistant.", rating: 4.7, reviews: 174, stock: 55 },
    { id: "p3", n: "Back Cover", p: 350, e: "📱", c: "Accessories", desc: "Slim protective back cover. Tell us your phone model and we match the fit.", rating: 4.6, reviews: 421, stock: 60 },
    { id: "p4", n: "Earphones", p: 850, e: "🎧", c: "Accessories", desc: "Wired earphones with a built-in mic and clear, balanced sound.", rating: 4.7, reviews: 318, stock: 38 },
    { id: "p5", n: "Wireless Earbuds", p: 2200, e: "🎧", c: "Accessories", desc: "True wireless earbuds with a charging case and touch controls.", rating: 4.8, reviews: 203, stock: 22 },
    { id: "p6", n: "Bluetooth Speaker", p: 2800, e: "🔊", c: "Accessories", desc: "Portable Bluetooth speaker with all-day battery and a carry handle.", rating: 4.7, reviews: 141, stock: 15 },
    { id: "p7", n: "Glass Protector", p: 250, e: "🛡️", c: "Accessories", desc: "Tempered glass screen protector, fitted free in store. Model-matched.", rating: 4.6, reviews: 267, stock: 70 },
    { id: "p8", n: "Phone Stand", p: 350, e: "🗿", c: "Accessories", desc: "Adjustable phone stand for desk calls, video and hands-free viewing.", rating: 4.7, reviews: 129, stock: 44 },
    { id: "p9", n: "Car Mount", p: 650, e: "🚗", c: "Accessories", desc: "Dashboard and vent car mount with a firm grip for bumpy roads.", rating: 4.6, reviews: 98, stock: 29 },
  ],
  about:
    "Mobile Point is a neighbourhood mobile accessories shop in Dhanmondi, Dhaka. Chargers, cables, audio and protection — all original, with warranty support on eligible items. Not sure about fit or fast charging? Tell us your phone model before you order and we will confirm compatibility. Order online for pickup or home delivery.",
  contact: CONTACT,
  address: ADDRESS,
  hours: HOURS,
  priceNote: "Prices in Tk. Warranty support on eligible items — ask in store for details.",
};

/* ------------------------------------------------------------------ */
/* COSMETICS                                                           */
/* Research: https://rusubd.com/ , https://beautybooth.com.bd/ ,      */
/*           https://authenticmakeupstorebd.com/                       */
/* What the real sites do well: makeup vs skin-care vs fragrance       */
/* grouping, original-product authenticity framing (batch and pack     */
/* checks), and shade and skin-type help. The demo copies the grouping */
/* and the authenticity framing only.                                  */
/* ------------------------------------------------------------------ */
const COSMETICS: Partial<DemoSiteDef> = {
  agencyReworked: true,
  name: "Glow Beauty Store",
  type: "Cosmetics Shop",
  logoEmoji: "💄",
  accent: "#f472b6",
  dark: true,
  heroTitle: "Look good, feel confident",
  heroSub: "Original brands • Skin care & makeup • Shade help in store",
  heroEmoji: "💄",
  cats: ["All", "Makeup", "Skin Care", "Fragrance"],
  products: [
    { id: "p0", n: "Lipstick", p: 550, e: "💄", c: "Makeup", desc: "Long-wear lipstick with a smooth, comfortable finish. Try the shade in store first.", rating: 4.8, reviews: 412, stock: 34 },
    { id: "p1", n: "Foundation", p: 850, e: "🧴", c: "Makeup", desc: "Blendable foundation for even coverage that lasts through the day.", rating: 4.7, reviews: 298, stock: 27 },
    { id: "p2", n: "Kajal", p: 250, e: "✏️", c: "Makeup", desc: "Soft, smudge-resistant kajal for a clean line that stays put.", rating: 4.7, reviews: 186, stock: 52 },
    { id: "p3", n: "Mascara", p: 480, e: "👁️", c: "Makeup", desc: "Lengthening mascara for fuller-looking lashes without clumps.", rating: 4.6, reviews: 154, stock: 31 },
    { id: "p4", n: "Lip Gloss", p: 420, e: "💋", c: "Makeup", desc: "Shiny, non-sticky lip gloss — wear alone or over lipstick.", rating: 4.7, reviews: 139, stock: 36 },
    { id: "p5", n: "Face Wash", p: 450, e: "🧼", c: "Skin Care", desc: "Gentle daily face wash that cleans without drying the skin.", rating: 4.8, reviews: 356, stock: 44 },
    { id: "p6", n: "Moisturizer", p: 650, e: "🧪", c: "Skin Care", desc: "Lightweight daily moisturizer for soft, hydrated skin morning and night.", rating: 4.8, reviews: 289, stock: 30 },
    { id: "p7", n: "Sunscreen SPF 50", p: 780, e: "☀️", c: "Skin Care", desc: "Broad-spectrum SPF 50 sunscreen for daily sun protection. Reapply outdoors.", rating: 4.8, reviews: 176, stock: 26 },
    { id: "p8", n: "Body Lotion", p: 550, e: "🧴", c: "Skin Care", desc: "Fast-absorbing body lotion for all-day moisture without a greasy feel.", rating: 4.7, reviews: 163, stock: 38 },
    { id: "p9", n: "Perfume", p: 1200, e: "🌸", c: "Fragrance", desc: "A fresh everyday fragrance in a gift-ready bottle. Test it in store first.", rating: 4.9, reviews: 231, stock: 18 },
  ],
  about:
    "Glow Beauty Store is a neighbourhood cosmetics shop in Dhanmondi, Dhaka. Original makeup, skin care and fragrance — no replicas, sealed packs, and batch details you can check. Ask our staff for shade matching and skin-type help before you buy, and order online for pickup or home delivery.",
  contact: CONTACT,
  address: ADDRESS,
  hours: HOURS,
  priceNote: "Prices in Tk. Original products only — sealed packs.",
};

/* ------------------------------------------------------------------ */
/* FURNITURE                                                           */
/* Research: https://hatil.com/blog/en/furniture-that-redefines-modern-living/ */
/*           https://ahadfurniture.com/ ,                             */
/*           http://deshiz.com/online-furniture-shops-bangladesh/      */
/* What the real sites do well: room-based grouping (living, bedroom,  */
/* dining), material and size detail on each piece, and delivery plus  */
/* fitting plus warranty framing. The demo copies the room grouping    */
/* and the delivery-and-fitting framing only.                          */
/* ------------------------------------------------------------------ */
const FURNITURE: Partial<DemoSiteDef> = {
  agencyReworked: true,
  name: "HomeStyle Furniture",
  type: "Furniture Shop",
  logoEmoji: "🪑",
  accent: "#fbbf24",
  dark: true,
  heroTitle: "Furniture that makes a house a home",
  heroSub: "Solid wood options • Free fitting in Dhaka • Delivery & installation",
  heroEmoji: "🪑",
  cats: ["All", "Living", "Bedroom", "Dining"],
  products: [
    { id: "p0", n: "Chair", p: 2500, e: "🪑", c: "Living", desc: "Sturdy wooden chair with a comfortable seat — dining, study or extra seating.", rating: 4.7, reviews: 168, stock: 24 },
    { id: "p1", n: "Table", p: 4500, e: "🪟", c: "Living", desc: "Solid study and side table with a smooth, polished top.", rating: 4.7, reviews: 142, stock: 18 },
    { id: "p2", n: "Sofa", p: 25000, e: "🛋️", c: "Living", desc: "Three-seater sofa with deep cushions and a hardwood frame. Fabric options in store.", rating: 4.8, reviews: 121, stock: 8 },
    { id: "p3", n: "Bookshelf", p: 3500, e: "📚", c: "Living", desc: "Open bookshelf for books, plants and display pieces. Wall fixing available.", rating: 4.6, reviews: 97, stock: 20 },
    { id: "p4", n: "Coffee Table", p: 8500, e: "☕", c: "Living", desc: "Low coffee table with a lower shelf for magazines and remotes.", rating: 4.7, reviews: 83, stock: 12 },
    { id: "p5", n: "TV Stand", p: 9500, e: "📺", c: "Living", desc: "TV stand with cable management and storage for boxes and consoles.", rating: 4.7, reviews: 76, stock: 11 },
    { id: "p6", n: "Bed", p: 18000, e: "🛏️", c: "Bedroom", desc: "Solid wooden bed with a strong frame and headboard. Mattress sold separately.", rating: 4.8, reviews: 154, stock: 7 },
    { id: "p7", n: "Wardrobe", p: 15000, e: "🚪", c: "Bedroom", desc: "Spacious wardrobe with hanging space and shelves. Mirror door option in store.", rating: 4.8, reviews: 132, stock: 9 },
    { id: "p8", n: "Dressing Table", p: 12000, e: "🪞", c: "Bedroom", desc: "Dressing table with mirror and drawers for daily essentials.", rating: 4.7, reviews: 88, stock: 10 },
    { id: "p9", n: "Dining Table", p: 22000, e: "🍽️", c: "Dining", desc: "Six-seater dining table in solid wood — built for family meals and gatherings.", rating: 4.8, reviews: 104, stock: 6 },
  ],
  about:
    "HomeStyle Furniture is a neighbourhood furniture shop in Dhanmondi, Dhaka. Solid wood and board options for living rooms, bedrooms and dining rooms, with sizes and finishes you can check in store. Delivery and fitting are free in Dhaka, and custom sizes are available on request — ask us before ordering and we will confirm the size, finish and delivery date.",
  contact: CONTACT,
  address: ADDRESS,
  hours: HOURS,
  priceNote: "Prices in Tk. Free delivery & fitting in Dhaka.",
};

/**
 * Phase 2 shop-demo drafts — Batch 2 (petshop, sports, appliances, flower, toy).
 *
 * DRAFT ONLY. Do not merge, wrap routes, typecheck, build, or claim live
 * until the coordinator merges these into agency-demo-overrides.ts.
 * Follows the Phase 1 bakery/salon pattern exactly: agencyReworked: true,
 * English-first content, the standing WhatsApp contact, the shared Dhanmondi
 * address and hours, prices kept from the original demo where the item is
 * unchanged, and demo-only rating/review/stock numbers (no review text).
 * Accent colours are kept from the original engine defs; dark is kept as
 * true, matching the engine-converted defs (defs.ts sets dark: true for
 * engine demos). No real team size or real customer count is claimed.
 *
 * Research URLs (verbatim from web search results):
 * - Petshop:
 *   https://www.dkhardware.com/pet-supplies-ZC22529M0P1.html
 *   https://www.petzonebd.com/ (found via https://www.grameenphone.com/pet-food)
 *   https://www.petsuppliesplus.com/store/tx/montgomery/4134-montgomery/4134/events/3-16-2024-vip-pet-care-vet-cli
 * - Sports:
 *   https://www.sportsuncle.com/sports-shop-in-pune
 *   https://www.networldsports.co.uk/
 *   https://www.sky2ocean.com/
 * - Appliances:
 *   https://zulfielectronics.com/
 *   http://www.swappliances.com/
 *   https://www.tvhut.com.bd/home-appliances?page=5
 * - Flower:
 *   https://lefloristbd.com/
 *   https://radianbd.com/fresh-flower
 *   https://www.bloomsflora.com/in/ernakulam/flowers
 * - Toy:
 *   https://www.toynix.pk/collections/educational-toys
 *   https://toyify.pk
 *   https://kidifye.com/en-ae/collections/educational-toys
 */

/**
 * PETSHOP — research:
 * https://www.dkhardware.com/pet-supplies-ZC22529M0P1.html
 * https://www.petzonebd.com/ (found via https://www.grameenphone.com/pet-food)
 * https://www.petsuppliesplus.com/store/tx/montgomery/4134-montgomery/4134/events/3-16-2024-vip-pet-care-vet-cli
 * What the real sites do well: grouping by pet and by need (food, health,
 * grooming, accessories) so owners find daily essentials fast, and pairing
 * the shop with pickup/delivery plus care guidance — the admin-relevant
 * controls are stock per food line and care-category merchandising.
 */
const PETSHOP: Partial<DemoSiteDef> = {
  agencyReworked: true,
  name: "Paw Friends Pet Shop",
  type: "Pet Shop",
  logoEmoji: "🐕",
  accent: "#a3e635",
  dark: true,
  heroTitle: "Everything your pet needs, in one place",
  heroSub: "Pet food • Care essentials • Home delivery in Dhaka",
  heroEmoji: "🐕",
  cats: ["All", "Food", "Care"],
  products: [
    { id: "p0", n: "Dog Food", p: 1200, e: "🦴", c: "Food", desc: "Complete daily nutrition for adult dogs. Balanced protein, vitamins and minerals in every bowl.", rating: 4.8, reviews: 342, stock: 40 },
    { id: "p1", n: "Cat Food", p: 950, e: "🐟", c: "Food", desc: "Tasty, balanced meals for cats of all ages. Helps keep coats shiny and energy steady.", rating: 4.8, reviews: 418, stock: 45 },
    { id: "p2", n: "Bird Food", p: 550, e: "🐦", c: "Food", desc: "Seed mix for cage birds, packed fresh. A daily portion keeps birds active and healthy.", rating: 4.7, reviews: 96, stock: 30 },
    { id: "p3", n: "Pet Toy", p: 450, e: "🧶", c: "Care", desc: "Durable play toy for dogs and cats. Great for chewing, chasing and everyday play.", rating: 4.6, reviews: 187, stock: 50 },
    { id: "p4", n: "Pet Leash", p: 650, e: "🦮", c: "Care", desc: "Strong, comfortable leash for daily walks. Adjustable length with a secure clip.", rating: 4.7, reviews: 154, stock: 35 },
    { id: "p5", n: "Pet Shampoo", p: 380, e: "🧴", c: "Care", desc: "Gentle shampoo for dogs and cats. Cleans without drying the coat or irritating skin.", rating: 4.8, reviews: 223, stock: 42 },
    { id: "p6", n: "Pet Cage", p: 2500, e: "🏠", c: "Care", desc: "Spacious, ventilated cage for safe rest and travel. Easy to clean, with a secure door.", rating: 4.7, reviews: 89, stock: 12 },
    { id: "p7", n: "Cat Litter", p: 750, e: "🐱", c: "Care", desc: "Fast-clumping litter that keeps the litter box dry and odour-free. Easy to scoop daily.", rating: 4.8, reviews: 176, stock: 38 },
    { id: "p8", n: "Pet Bed", p: 1400, e: "🛏️", c: "Care", desc: "Soft, washable bed for dogs and cats. Raised edges give pets a cosy place to curl up.", rating: 4.9, reviews: 131, stock: 20 },
  ],
  about:
    "Paw Friends Pet Shop is a neighbourhood pet shop in Dhanmondi, Dhaka. We stock everyday pet food, grooming essentials and accessories for dogs, cats and birds, with advice on feeding and care. Order online for pickup or home delivery, and message us if you are unsure which food suits your pet.",
  contact: CONTACT,
  address: ADDRESS,
  hours: HOURS,
  priceNote: "Prices in Tk. Pickup & home delivery available.",
};

/**
 * SPORTS — research:
 * https://www.sportsuncle.com/sports-shop-in-pune
 * https://www.networldsports.co.uk/
 * https://www.sky2ocean.com/
 * What the real sites do well: grouping strictly by sport (football,
 * cricket, badminton) with full kits per sport — bat, ball, pads, gloves,
 * bag — plus team-order framing, which maps to admin controls for
 * sport categories, kit bundles and team discounts.
 */
const SPORTS: Partial<DemoSiteDef> = {
  agencyReworked: true,
  name: "Playfield Sports Shop",
  type: "Sports Shop",
  logoEmoji: "⚽",
  accent: "#f87171",
  dark: true,
  heroTitle: "Gear up and get in the game",
  heroSub: "Genuine sports gear • Team discounts • Delivery in Dhaka",
  heroEmoji: "⚽",
  cats: ["All", "Football", "Cricket", "Badminton"],
  products: [
    { id: "p0", n: "Football", p: 1200, e: "⚽", c: "Football", desc: "Durable match football with a steady bounce and strong outer cover. Suitable for grass and turf.", rating: 4.8, reviews: 389, stock: 36 },
    { id: "p1", n: "Cricket Bat", p: 1800, e: "🏏", c: "Cricket", desc: "Well-balanced bat with a comfortable grip. A solid choice for practice and weekend matches.", rating: 4.8, reviews: 264, stock: 24 },
    { id: "p2", n: "Team Jersey", p: 850, e: "👕", c: "Football", desc: "Light, breathable jersey that stays comfortable through a full match. Ask about team printing.", rating: 4.7, reviews: 312, stock: 48 },
    { id: "p3", n: "Football Boots", p: 2500, e: "👟", c: "Football", desc: "Firm-ground boots with grip and ankle support. Check your size with us before ordering.", rating: 4.8, reviews: 198, stock: 22 },
    { id: "p4", n: "Cricket Gloves", p: 950, e: "🧤", c: "Cricket", desc: "Padded batting gloves with a firm grip and flexible fingers. Sold as a pair.", rating: 4.7, reviews: 141, stock: 30 },
    { id: "p5", n: "Badminton Set", p: 1500, e: "🏸", c: "Badminton", desc: "Two rackets and shuttlecocks in one set — ready to play straight out of the box.", rating: 4.7, reviews: 176, stock: 28 },
    { id: "p6", n: "Cricket Ball", p: 350, e: "🔴", c: "Cricket", desc: "Leather-style practice ball with a consistent seam. Sold per ball.", rating: 4.6, reviews: 203, stock: 60 },
    { id: "p7", n: "Shin Guards", p: 600, e: "🦵", c: "Football", desc: "Lightweight shin guards with ankle protection. A must for every match player.", rating: 4.7, reviews: 118, stock: 40 },
    { id: "p8", n: "Sports Kit Bag", p: 1800, e: "🎒", c: "Cricket", desc: "Large kit bag with separate pockets for bat, pads and shoes. Padded straps for easy carrying.", rating: 4.8, reviews: 97, stock: 18 },
  ],
  about:
    "Playfield Sports Shop is a neighbourhood sports shop in Dhanmondi, Dhaka. We stock football, cricket and badminton gear for players of every level — from first kits to club equipment. Order online for pickup or home delivery, and ask us about team discounts for full squads.",
  contact: CONTACT,
  address: ADDRESS,
  hours: HOURS,
  priceNote: "Prices in Tk. Team discounts available on bulk orders.",
};

/**
 * APPLIANCES — research:
 * https://zulfielectronics.com/
 * http://www.swappliances.com/
 * https://www.tvhut.com.bd/home-appliances?page=5
 * What the real sites do well: framing every big item with delivery,
 * installation and warranty together (not price alone), and grouping by
 * room and job — kitchen, cooling, laundry — which maps to admin controls
 * for warranty notes, installation flags and room categories.
 */
const APPLIANCES: Partial<DemoSiteDef> = {
  agencyReworked: true,
  name: "HomeNest Appliances",
  type: "Home Appliances",
  logoEmoji: "🏠",
  accent: "#22d3ee",
  dark: true,
  heroTitle: "A smarter home, one appliance at a time",
  heroSub: "Energy-saving picks • Official warranty • Installation help",
  heroEmoji: "🏠",
  cats: ["All", "Kitchen", "Room"],
  products: [
    { id: "p0", n: "Ceiling Fan", p: 3500, e: "🌀", c: "Room", desc: "Quiet, energy-saving ceiling fan with smooth speed control. Installation help available on request.", rating: 4.8, reviews: 287, stock: 26 },
    { id: "p1", n: "LED Light", p: 850, e: "💡", c: "Room", desc: "Bright, long-life LED light that cuts power use. Fits standard holders and fixtures.", rating: 4.7, reviews: 342, stock: 80 },
    { id: "p2", n: "Rice Cooker", p: 2800, e: "🍚", c: "Kitchen", desc: "Automatic rice cooker with keep-warm mode. Cooks evenly and switches off by itself.", rating: 4.8, reviews: 256, stock: 22 },
    { id: "p3", n: "Iron", p: 1800, e: "👔", c: "Room", desc: "Smooth-glide iron with adjustable heat for cotton, linen and synthetics.", rating: 4.7, reviews: 189, stock: 34 },
    { id: "p4", n: "Room Heater", p: 2200, e: "🔥", c: "Room", desc: "Compact room heater with safety cut-off. Warms a bedroom quickly on cold nights.", rating: 4.6, reviews: 143, stock: 20 },
    { id: "p5", n: "Rechargeable Fan", p: 4500, e: "🔋", c: "Room", desc: "Rechargeable fan that keeps running during power cuts. Multiple speeds with a built-in light.", rating: 4.8, reviews: 211, stock: 16 },
    { id: "p6", n: "Electric Kettle", p: 1500, e: "🫖", c: "Kitchen", desc: "Fast-boiling electric kettle with auto shut-off. A kitchen essential for tea and instant cooking.", rating: 4.7, reviews: 168, stock: 30 },
    { id: "p7", n: "Blender", p: 2200, e: "🥤", c: "Kitchen", desc: "Multi-speed blender for juices, pastes and batter. Sturdy jar, easy to clean.", rating: 4.8, reviews: 154, stock: 24 },
    { id: "p8", n: "Table Fan", p: 2800, e: "🌬️", c: "Room", desc: "Oscillating table fan with quiet operation. Ideal for desks, study rooms and small spaces.", rating: 4.7, reviews: 132, stock: 28 },
  ],
  about:
    "HomeNest Appliances is a neighbourhood appliance shop in Dhanmondi, Dhaka. We stock kitchen and room appliances from trusted brands, with official warranty on branded items and installation help where it is needed. Order online for pickup or home delivery, and ask us before buying if you need help choosing the right size or model.",
  contact: CONTACT,
  address: ADDRESS,
  hours: HOURS,
  priceNote: "Prices in Tk. Official warranty included on branded appliances; installation help available on request.",
};

/**
 * FLOWER — research:
 * https://lefloristbd.com/
 * https://radianbd.com/fresh-flower
 * https://www.bloomsflora.com/in/ernakulam/flowers
 * What the real sites do well: occasion-first grouping (birthday,
 * anniversary, wedding) with same-day and scheduled delivery slots and
 * fresh-hand-tied framing, which maps to admin controls for occasion
 * categories, delivery slots and event decor orders.
 */
const FLOWER: Partial<DemoSiteDef> = {
  agencyReworked: true,
  name: "Flower Smile Shop",
  type: "Flower Shop",
  logoEmoji: "🌸",
  accent: "#fb7185",
  dark: true,
  heroTitle: "Fresh flowers, every morning",
  heroSub: "Hand-tied bouquets • Event decor • Same-day delivery in Dhaka",
  heroEmoji: "🌸",
  cats: ["All", "Flowers", "Decor"],
  products: [
    { id: "p0", n: "Roses (Dozen)", p: 350, e: "🌹", c: "Flowers", desc: "Twelve fresh roses, hand-picked in the morning. Classic for birthdays, anniversaries and apologies.", rating: 4.9, reviews: 487, stock: 30 },
    { id: "p1", n: "Marigold Garland", p: 200, e: "🌼", c: "Flowers", desc: "Bright marigold garland, strung fresh daily. Perfect for events, welcomes and celebrations.", rating: 4.8, reviews: 264, stock: 45 },
    { id: "p2", n: "Jasmine Flowers", p: 250, e: "🌸", c: "Flowers", desc: "Fragrant jasmine, sold fresh each morning. Lovely for hair, prayer and small gifts.", rating: 4.8, reviews: 198, stock: 40 },
    { id: "p3", n: "Flower Bouquet", p: 850, e: "💐", c: "Decor", desc: "Mixed seasonal bouquet, hand-tied and wrapped. Tell us the occasion and we pick the mix.", rating: 4.9, reviews: 356, stock: 18 },
    { id: "p4", n: "Wedding Garland", p: 450, e: "📿", c: "Decor", desc: "Wedding garland made to order with fresh flowers. Order a day ahead for custom colours.", rating: 4.9, reviews: 143, stock: 15 },
    { id: "p5", n: "Potted Plant", p: 650, e: "🪴", c: "Decor", desc: "Healthy potted plant in a decorative pot. A gift that lasts long after the occasion.", rating: 4.7, reviews: 167, stock: 25 },
    { id: "p6", n: "Lily Bouquet", p: 1200, e: "🤍", c: "Flowers", desc: "Elegant lily bouquet with a soft fragrance. A premium pick for anniversaries and formal gifts.", rating: 4.9, reviews: 112, stock: 12 },
    { id: "p7", n: "Sunflower Bouquet", p: 950, e: "🌻", c: "Flowers", desc: "Cheerful sunflower bouquet that brightens any room. Great for birthdays and congratulations.", rating: 4.8, reviews: 139, stock: 16 },
    { id: "p8", n: "Flower Basket", p: 1100, e: "🧺", c: "Decor", desc: "Mixed flowers arranged in a gift basket. Ready to carry to any event or celebration.", rating: 4.8, reviews: 98, stock: 14 },
  ],
  about:
    "Flower Smile Shop is a neighbourhood flower shop in Dhanmondi, Dhaka. Fresh flowers arrive every morning and every bouquet is hand-tied to order. Order online for pickup or same-day home delivery, or talk to us about wedding and event decoration.",
  contact: CONTACT,
  address: ADDRESS,
  hours: HOURS,
  priceNote: "Prices in Tk. Same-day delivery available in Dhaka; event decor quoted on request.",
};

/**
 * TOY — research:
 * https://www.toynix.pk/collections/educational-toys
 * https://toyify.pk
 * https://kidifye.com/en-ae/collections/educational-toys
 * What the real sites do well: grouping by age and by learning value
 * (toddlers, preschool, school age) with a stated age range and safety note
 * on every item, which maps to admin controls for age categories and
 * safety/age labels on each product.
 */
const TOY: Partial<DemoSiteDef> = {
  agencyReworked: true,
  name: "Toy Kingdom",
  type: "Toy Shop",
  logoEmoji: "🧸",
  accent: "#c084fc",
  dark: true,
  heroTitle: "Safe toys, happy kids",
  heroSub: "Age-matched picks • Learning through play • Delivery in Dhaka",
  heroEmoji: "🧸",
  cats: ["All", "Dolls", "Games", "Learning"],
  products: [
    { id: "p0", n: "Teddy Bear", p: 850, e: "🧸", c: "Dolls", desc: "Soft, huggable teddy bear made from child-safe fabric. Washable and perfect for bedtime.", rating: 4.9, reviews: 423, stock: 35 },
    { id: "p1", n: "Toy Car", p: 650, e: "🚗", c: "Games", desc: "Sturdy toy car with smooth rolling wheels. Built to survive daily crashes and races.", rating: 4.7, reviews: 287, stock: 42 },
    { id: "p2", n: "Puzzle", p: 450, e: "🧩", c: "Learning", desc: "Colourful puzzle that builds patience and problem-solving. Large pieces, safe for young children.", rating: 4.8, reviews: 234, stock: 48 },
    { id: "p3", n: "Doll", p: 750, e: "🪆", c: "Dolls", desc: "Classic doll with soft hair and a changeable outfit. Encourages imaginative play.", rating: 4.8, reviews: 196, stock: 30 },
    { id: "p4", n: "Football", p: 350, e: "⚽", c: "Games", desc: "Soft, lightweight football sized for young players. Safe for indoor and garden play.", rating: 4.6, reviews: 178, stock: 55 },
    { id: "p5", n: "Building Blocks", p: 950, e: "🧱", c: "Learning", desc: "Chunky building blocks for towers, houses and castles. Builds creativity and fine motor skills.", rating: 4.9, reviews: 312, stock: 32 },
    { id: "p6", n: "Board Game", p: 800, e: "🎲", c: "Games", desc: "Family board game for 2 to 4 players. Easy rules, quick rounds, hours of fun.", rating: 4.7, reviews: 145, stock: 26 },
    { id: "p7", n: "Remote Control Car", p: 1500, e: "🏎️", c: "Games", desc: "Remote control car with forward, reverse and steering. Batteries included in the box.", rating: 4.8, reviews: 167, stock: 18 },
    { id: "p8", n: "Art Set", p: 600, e: "🎨", c: "Learning", desc: "Art set with crayons, colours and drawing paper. Non-toxic materials, safe for young artists.", rating: 4.7, reviews: 129, stock: 36 },
  ],
  about:
    "Toy Kingdom is a neighbourhood toy shop in Dhanmondi, Dhaka. Every toy is chosen for safety first, with an age guide on each item so parents can pick with confidence. Order online for pickup or home delivery, and ask us for gift wrapping for birthdays.",
  contact: CONTACT,
  address: ADDRESS,
  hours: HOURS,
  priceNote: "Prices in Tk. Age guides on every item; gift wrapping available on request.",
};

/**
 * Phase 2 shop-demo drafts — Batch 3 (DRAFT ONLY, not merged, not live).
 *
 * Demos, in order: grocery, sweets, cafe, juicebar, biriyani.
 * Pattern copied from the Phase 1 bakery/salon overrides in
 * app/web-dev/demos/demosite/agency-demo-overrides.ts: agencyReworked true,
 * English identity, accent and dark kept from the original engine def
 * (engine demos convert with dark: true — see defs.ts baseDef), English
 * hero/about/contact, fuller catalogue than the original, original prices
 * kept where an item is unchanged, new-item prices estimated plausibly in Tk
 * (flagged in the coordinator report). Catalogue rating/review/stock numbers
 * are demo data only. No review text is included.
 *
 * Research URLs (verbatim from web search results):
 * - grocery: https://homefreshbd.com/en/shop
 * - grocery: https://blackbud.com.bd/product-category/groceries/
 * - grocery: https://joldimart.com/
 * - sweets: https://manhasweets.com/products/
 * - sweets: https://www.mishtanna.com/
 * - sweets: https://banglarmisti.com/
 * - cafe: https://coffeezone.shop/
 * - cafe: https://sites.google.com/view/caferaindrop
 * - cafe: https://laptopfriendlycafe.com/cafes/dhaka/brewers-den
 * - juicebar: https://www.juicyjuicy.biz/
 * - juicebar: https://fruitslash.com/
 * - juicebar: https://smoothiefactory.com.cy/our-menu/
 * - biriyani: https://jakariyapahlan.wixsite.com/dhaka-biryani-house
 * - biriyani: https://www.foodpanda.com.bd/restaurant/t8jq/kacchi-bhai-bashundhara
 * - biriyani: https://dhakakacchi.com/
 *
 * Coordinator note: on merge, change the import below to "./types"
 * (the path used inside app/web-dev/demos/demosite/).
 */

/**
 * GROCERY (slug: grocery)
 * Research: https://homefreshbd.com/en/shop
 *           https://blackbud.com.bd/product-category/groceries/
 *           https://joldimart.com/
 * What the real sites do well: clear catalogue grouping (staples, fresh,
 * dairy, household), a delivery promise framed up front, and admin-relevant
 * controls such as stock, offers and order tracking. This draft borrows the
 * grouping and delivery framing only.
 */
const GROCERY: Partial<DemoSiteDef> = {
  agencyReworked: true,
  name: "Daily Bazar",
  type: "Online Grocery Store",
  logoEmoji: "🛒",
  accent: "#34d399",
  dark: true,
  heroTitle: "Your weekly bazaar, delivered to your door",
  heroSub: "Fresh staples • Daily essentials • Fast home delivery in Dhaka",
  heroEmoji: "🛒",
  cats: ["All", "Rice & Lentils", "Oil & Spices", "Fresh & Dairy"],
  products: [
    { id: "p0", n: "Rice (5 kg)", p: 650, e: "🍚", c: "Rice & Lentils", desc: "Everyday fine rice, 5 kg pack. Cleaned and packed for daily cooking.", rating: 4.8, reviews: 412, stock: 40 },
    { id: "p1", n: "Lentils (1 kg)", p: 140, e: "🫘", c: "Rice & Lentils", desc: "Protein-rich lentils, 1 kg pack. Cooks soft and even.", rating: 4.7, reviews: 238, stock: 36 },
    { id: "p2", n: "Soybean Oil (5 L)", p: 850, e: "🫗", c: "Oil & Spices", desc: "Pure soybean cooking oil, 5 litre pack for the family kitchen.", rating: 4.8, reviews: 305, stock: 24 },
    { id: "p3", n: "Sugar (1 kg)", p: 130, e: "🍬", c: "Oil & Spices", desc: "Refined white sugar, 1 kg pack. For tea, cooking and baking.", rating: 4.7, reviews: 189, stock: 44 },
    { id: "p4", n: "Flour (2 kg)", p: 180, e: "🌾", c: "Rice & Lentils", desc: "Fine wheat flour, 2 kg pack. For bread, roti and baking.", rating: 4.8, reviews: 176, stock: 32 },
    { id: "p5", n: "Spice Pack", p: 350, e: "🌶️", c: "Oil & Spices", desc: "A mixed pack of everyday cooking spices, ground fresh.", rating: 4.9, reviews: 261, stock: 28 },
    { id: "p6", n: "Fresh Eggs (12 pcs)", p: 180, e: "🥚", c: "Fresh & Dairy", desc: "Farm-fresh eggs, tray of 12. Checked and packed the same day.", rating: 4.8, reviews: 342, stock: 30 },
    { id: "p7", n: "Fresh Milk (1 L)", p: 110, e: "🥛", c: "Fresh & Dairy", desc: "Pasteurised fresh milk, 1 litre. Keep chilled after delivery.", rating: 4.7, reviews: 214, stock: 26 },
    { id: "p8", n: "Tea Leaves (500 g)", p: 320, e: "🍵", c: "Oil & Spices", desc: "Strong everyday tea leaves, 500 g pack. A rich, full cup.", rating: 4.8, reviews: 198, stock: 22 },
    { id: "p9", n: "Salt (1 kg)", p: 45, e: "🧂", c: "Oil & Spices", desc: "Iodised cooking salt, 1 kg pack. An everyday kitchen essential.", rating: 4.6, reviews: 143, stock: 48 },
  ],
  about:
    "Daily Bazar is a neighbourhood grocery store in Dhanmondi, Dhaka. Order your weekly staples, fresh items and daily essentials online and get them delivered to your door, or pick up from the store. Fresh stock arrives every morning, and every pack is checked before it leaves the store.",
  contact: CONTACT,
  address: ADDRESS,
  hours: HOURS,
  priceNote: "Prices in Tk. Home delivery available across Dhaka.",
};

/**
 * SWEETS (slug: sweets)
 * Research: https://manhasweets.com/products/
 *           https://www.mishtanna.com/
 *           https://banglarmisti.com/
 * What the real sites do well: sweets grouped by type with clear per-kg
 * pricing, freshness and packing notes per product, and gift-box framing for
 * festivals and family occasions. This draft borrows the grouping, per-kg
 * pricing and gift-box framing only.
 */
const SWEETS: Partial<DemoSiteDef> = {
  agencyReworked: true,
  name: "Mishti House",
  type: "Sweet Shop",
  logoEmoji: "🍬",
  accent: "#fbbf24",
  dark: true,
  heroTitle: "Traditional sweets, made fresh every day",
  heroSub: "Pure milk sweets • Made fresh daily • Pickup & home delivery",
  heroEmoji: "🍬",
  cats: ["All", "Sweets", "Gift Boxes"],
  products: [
    { id: "p0", n: "Rasgulla (1 kg)", p: 300, e: "⚪", c: "Sweets", desc: "Soft, syrup-soaked milk sweets, sold by the kilogram. Best served chilled.", rating: 4.8, reviews: 521, stock: 20 },
    { id: "p1", n: "Chomchom (1 kg)", p: 350, e: "🟤", c: "Sweets", desc: "Golden, oval milk sweets with a light syrup finish. A classic favourite.", rating: 4.8, reviews: 387, stock: 18 },
    { id: "p2", n: "Sandesh (1 kg)", p: 400, e: "🔶", c: "Sweets", desc: "Fresh milk sandesh, lightly sweetened. Made fresh every morning.", rating: 4.9, reviews: 296, stock: 16 },
    { id: "p3", n: "Kalojam (1 kg)", p: 380, e: "⚫", c: "Sweets", desc: "Dark, syrup-filled milk sweets with a soft centre. Sold by the kilogram.", rating: 4.7, reviews: 243, stock: 18 },
    { id: "p4", n: "Laddu (1 kg)", p: 320, e: "🟡", c: "Sweets", desc: "Classic round laddu, lightly sweet and crumbly. A festival staple.", rating: 4.7, reviews: 218, stock: 24 },
    { id: "p5", n: "Sweet Yogurt (1 kg)", p: 250, e: "🍶", c: "Sweets", desc: "Thick, creamy sweet yogurt set in the traditional style. Served chilled.", rating: 4.9, reviews: 431, stock: 22 },
    { id: "p6", n: "Rasmalai (1 kg)", p: 480, e: "🥛", c: "Sweets", desc: "Soft milk discs soaked in chilled, sweetened milk. Keep refrigerated.", rating: 4.9, reviews: 187, stock: 12 },
    { id: "p7", n: "Gulab Jamun (1 kg)", p: 360, e: "🟠", c: "Sweets", desc: "Warm, syrup-soaked jamun. Sold by the kilogram, best served warm.", rating: 4.8, reviews: 164, stock: 20 },
    { id: "p8", n: "Festival Gift Box (2 kg mixed)", p: 850, e: "🎁", c: "Gift Boxes", desc: "A 2 kg mixed box of our best-selling sweets, packed for gifting.", rating: 4.9, reviews: 132, stock: 10 },
  ],
  about:
    "Mishti House is a neighbourhood sweet shop in Dhanmondi, Dhaka. Our sweets are made fresh every day from pure milk, with no shortcuts on quality. Order online for pickup or home delivery, or choose a gift box for festivals, weddings and family occasions.",
  contact: CONTACT,
  address: ADDRESS,
  hours: HOURS,
  priceNote: "Prices in Tk. Sweets are made fresh daily; please refrigerate after delivery.",
};

/**
 * CAFE (slug: cafe)
 * Research: https://coffeezone.shop/
 *           https://sites.google.com/view/caferaindrop
 *           https://laptopfriendlycafe.com/cafes/dhaka/brewers-den
 * What the real sites do well: a short signature-drink menu with clear
 * prices, food grouped separately from drinks, and dine-in plus takeaway
 * framing. This draft borrows the drink-first grouping and the
 * dine-in/takeaway framing only.
 */
const CAFE: Partial<DemoSiteDef> = {
  agencyReworked: true,
  name: "Coffee House",
  type: "Cafe",
  logoEmoji: "☕",
  accent: "#fbbf24",
  dark: true,
  heroTitle: "The best coffee address in the neighbourhood",
  heroSub: "Freshly brewed • Dine in, take away, or home delivery",
  heroEmoji: "☕",
  cats: ["All", "Coffee", "Food"],
  products: [
    { id: "p0", n: "Cappuccino", p: 220, e: "☕", c: "Coffee", desc: "Espresso, steamed milk and thick foam. Our most-ordered classic.", rating: 4.8, reviews: 412, stock: 30 },
    { id: "p1", n: "Cafe Latte", p: 250, e: "🥛", c: "Coffee", desc: "Smooth espresso with silky steamed milk. Mild, creamy and balanced.", rating: 4.8, reviews: 296, stock: 30 },
    { id: "p2", n: "Espresso", p: 180, e: "☕", c: "Coffee", desc: "A strong, single shot of freshly ground coffee. Bold and clean.", rating: 4.7, reviews: 187, stock: 30 },
    { id: "p3", n: "Chocolate Cake", p: 320, e: "🍰", c: "Food", desc: "Rich chocolate cake, baked in-house. A slice with any coffee.", rating: 4.9, reviews: 354, stock: 14 },
    { id: "p4", n: "Cookies", p: 150, e: "🍪", c: "Food", desc: "Freshly baked cookies, crisp outside and soft inside.", rating: 4.7, reviews: 238, stock: 36 },
    { id: "p5", n: "Sandwich", p: 280, e: "🥪", c: "Food", desc: "Freshly made sandwich with salad and sauce, toasted to order.", rating: 4.7, reviews: 203, stock: 20 },
    { id: "p6", n: "Americano", p: 200, e: "☕", c: "Coffee", desc: "Espresso topped with hot water. Long, clean and full-flavoured.", rating: 4.8, reviews: 176, stock: 30 },
    { id: "p7", n: "Cold Coffee", p: 260, e: "🧊", c: "Coffee", desc: "Chilled coffee blended with milk and ice. Served cold, all day.", rating: 4.8, reviews: 219, stock: 28 },
    { id: "p8", n: "Blueberry Cheesecake", p: 380, e: "🍰", c: "Food", desc: "Creamy baked cheesecake topped with blueberry. Baked in-house.", rating: 4.9, reviews: 148, stock: 10 },
    { id: "p9", n: "Grilled Chicken Sandwich", p: 340, e: "🥪", c: "Food", desc: "Grilled chicken, salad and sauce in toasted bread. Made to order.", rating: 4.8, reviews: 167, stock: 18 },
  ],
  about:
    "Coffee House is a neighbourhood cafe in Dhanmondi, Dhaka. Freshly brewed coffee, in-house baking and a calm place to sit, work or meet friends. Dine in, take away, or order online for home delivery.",
  contact: CONTACT,
  address: ADDRESS,
  hours: HOURS,
  priceNote: "Prices in Tk. Dine in, takeaway and home delivery available.",
};

/**
 * JUICEBAR (slug: juicebar)
 * Research: https://www.juicyjuicy.biz/
 *           https://fruitslash.com/
 *           https://smoothiefactory.com.cy/our-menu/
 * What the real sites do well: juices and shakes grouped separately, a
 * no-added-sugar option flagged clearly, and add-on choices (extra fruit,
 * protein, seeds) as admin-relevant menu controls. This draft borrows the
 * grouping and the no-added-sugar framing only.
 */
const JUICEBAR: Partial<DemoSiteDef> = {
  agencyReworked: true,
  name: "Fresh Juice Bar",
  type: "Juice Shop",
  logoEmoji: "🧃",
  accent: "#a3e635",
  dark: true,
  heroTitle: "Fresh fruit juice, pressed to order",
  heroSub: "100% natural • No preservatives • No-added-sugar options",
  heroEmoji: "🧃",
  cats: ["All", "Juices", "Shakes"],
  products: [
    { id: "p0", n: "Mango Juice", p: 120, e: "🥭", c: "Juices", desc: "Ripe mango, pressed fresh to order. Thick, sweet and natural.", rating: 4.9, reviews: 421, stock: 30 },
    { id: "p1", n: "Orange Juice", p: 100, e: "🍊", c: "Juices", desc: "Fresh oranges, squeezed to order. No concentrate, no added sugar.", rating: 4.8, reviews: 356, stock: 30 },
    { id: "p2", n: "Lemon Mint", p: 80, e: "🍋", c: "Juices", desc: "Fresh lemon with crushed mint. Light, cool and refreshing.", rating: 4.7, reviews: 289, stock: 32 },
    { id: "p3", n: "Banana Shake", p: 150, e: "🍌", c: "Shakes", desc: "Banana blended thick with milk. A filling, natural shake.", rating: 4.8, reviews: 274, stock: 24 },
    { id: "p4", n: "Papaya Juice", p: 90, e: "🧡", c: "Juices", desc: "Ripe papaya, pressed fresh. Smooth, mild and naturally sweet.", rating: 4.7, reviews: 193, stock: 28 },
    { id: "p5", n: "Coconut Water", p: 70, e: "🥥", c: "Juices", desc: "Fresh coconut water, served chilled. Natural and hydrating.", rating: 4.8, reviews: 241, stock: 36 },
    { id: "p6", n: "Green Detox Juice", p: 140, e: "🥬", c: "Juices", desc: "Cucumber, green apple, lemon and ginger, pressed fresh. No added sugar.", rating: 4.8, reviews: 156, stock: 20 },
    { id: "p7", n: "Strawberry Shake", p: 170, e: "🍓", c: "Shakes", desc: "Strawberry blended thick with milk. Naturally sweet, no syrup.", rating: 4.9, reviews: 182, stock: 22 },
    { id: "p8", n: "Watermelon Juice", p: 110, e: "🍉", c: "Juices", desc: "Fresh watermelon, pressed to order. Light and hydrating.", rating: 4.8, reviews: 208, stock: 26 },
    { id: "p9", n: "Mixed Fruit Smoothie", p: 160, e: "🍹", c: "Shakes", desc: "A thick blend of seasonal fruits with yogurt. No added sugar.", rating: 4.8, reviews: 171, stock: 22 },
  ],
  about:
    "Fresh Juice Bar is a neighbourhood juice shop in Dhanmondi, Dhaka. Every drink is pressed or blended to order from fresh fruit — no concentrates, no preservatives, and no-added-sugar options on every juice. Order online for pickup or home delivery.",
  contact: CONTACT,
  address: ADDRESS,
  hours: HOURS,
  priceNote: "Prices in Tk. No-added-sugar options available on every juice.",
};

/**
 * BIRIYANI (slug: biriyani)
 * Research: https://jakariyapahlan.wixsite.com/dhaka-biryani-house
 *           https://www.foodpanda.com.bd/restaurant/t8jq/kacchi-bhai-bashundhara
 *           https://dhakakacchi.com/
 * What the real sites do well: the signature dish led from the top of the
 * menu, classic pairings (borhani, firni, kebab) grouped as sides and
 * desserts, and WhatsApp plus delivery ordering framed up front. This draft
 * borrows the signature-first menu order and the pairing grouping only.
 */
const BIRIYANI: Partial<DemoSiteDef> = {
  agencyReworked: true,
  name: "Biriyani House",
  type: "Restaurant",
  logoEmoji: "🍛",
  accent: "#fb923c",
  dark: true,
  heroTitle: "The real taste of kacchi",
  heroSub: "Slow-cooked • Served hot • Fast home delivery",
  heroEmoji: "🍛",
  cats: ["All", "Biryani", "Sides", "Dessert"],
  products: [
    { id: "p0", n: "Chicken Biryani", p: 180, e: "🍛", c: "Biryani", desc: "Fragrant rice layered with spiced chicken. Served hot with salad.", rating: 4.8, reviews: 512, stock: 30 },
    { id: "p1", n: "Beef Biryani", p: 220, e: "🥩", c: "Biryani", desc: "Slow-cooked beef with fragrant rice and whole spices.", rating: 4.8, reviews: 438, stock: 26 },
    { id: "p2", n: "Mutton Kacchi", p: 250, e: "🍖", c: "Biryani", desc: "Our signature: mutton slow-cooked under fragrant rice, served with potato and egg.", rating: 4.9, reviews: 624, stock: 24 },
    { id: "p3", n: "Chicken Pulao", p: 200, e: "🍗", c: "Biryani", desc: "Mild, fragrant chicken pulao with a light spice finish.", rating: 4.7, reviews: 289, stock: 24 },
    { id: "p4", n: "Borhani", p: 60, e: "🥛", c: "Dessert", desc: "Spiced yogurt drink — the classic partner to a biryani plate.", rating: 4.7, reviews: 312, stock: 40 },
    { id: "p5", n: "Firni", p: 80, e: "🍨", c: "Dessert", desc: "Creamy rice pudding, served chilled. The classic finish to the meal.", rating: 4.8, reviews: 276, stock: 30 },
    { id: "p6", n: "Mutton Tehari", p: 230, e: "🍛", c: "Biryani", desc: "Old-style tehari: small-cut mutton cooked through fragrant rice.", rating: 4.8, reviews: 198, stock: 22 },
    { id: "p7", n: "Chicken Chap", p: 160, e: "🍗", c: "Sides", desc: "Spiced, pan-fried chicken chap. Order as a side with any biryani.", rating: 4.7, reviews: 167, stock: 26 },
    { id: "p8", n: "Jorda", p: 90, e: "🍮", c: "Dessert", desc: "Sweet, saffron-tinted rice dessert with nuts. Served chilled.", rating: 4.8, reviews: 143, stock: 20 },
  ],
  about:
    "Biriyani House is a neighbourhood restaurant in Dhanmondi, Dhaka. Our kacchi and biryani are slow-cooked fresh through the day and served hot, for dine-in, pickup or fast home delivery. Order a full plate, add a chap on the side, and finish with firni.",
  contact: CONTACT,
  address: ADDRESS,
  hours: HOURS,
  priceNote: "Prices in Tk. Dine in, pickup and fast home delivery available.",
};

/**
 * Phase 2 shop-demo drafts — batch 4 (DRAFT ONLY, not merged, not live).
 *
 * Demos, in order: chinese, chef, stationary, laundry, carwash.
 * Pattern copied from Phase 1 (bakery/salon) in
 * digiplyra/app/web-dev/demos/demosite/agency-demo-overrides.ts:
 * agencyReworked: true, English-first text, the standing contact
 * (01833402586), the Dhanmondi address and hours below, prices in Tk kept
 * from the original demo where the item is unchanged. Catalogue
 * rating/review/stock numbers are demo data only; no review text is added.
 * No team size or customer count is claimed for the demo businesses.
 *
 * Research URLs (verbatim from web search results; see the per-demo header
 * for what each site does well):
 * - chinese: https://www.chinatownbd.net/menu
 * - chinese: https://palkichineserestaurant.com/
 * - chinese: https://dimsumtown.com/
 * - chef: https://www.hiechef.com/
 * - chef: https://www.takeachef.com/en-en/private-chef/dhaka-division
 * - chef: https://upchef.app/en
 * - stationary: https://www.realcanadiansuperstore.ca/en/school-office-supplies/stationery/c/56912
 * - stationary: https://play.google.com/store/apps/details?id=com.truewholesale.app&hl=en
 * - stationary: https://www.shops1000.com/GB/London/105300571130089/Ryman-Stationery
 * - laundry: https://drisoftlaundry.com/
 * - laundry: https://deliwash.app/
 * - laundry: https://iwashblu.netlify.app/
 * - carwash: https://www.washos.com/pricing
 * - carwash: https://turboluxurycarwash.ae/
 * - carwash: https://www.bigwashcardetailing.com/
 *
 * Dark-theme note: all five originals are engine demos, and the converted
 * defs in demosite/defs.ts set dark: true for every engine demo, so dark:
 * true is kept here. Phase 1 bakery/salon used dark: false (they are hand
 * defs with their own light themes); the coordinator can flip these to
 * false in one place if a light theme is wanted for this batch.
 */

/**
 * CHINESE — shop layout (original: 6 items, cats Rice/Soup).
 * Research:
 * - https://www.chinatownbd.net/menu
 * - https://palkichineserestaurant.com/
 * - https://dimsumtown.com/
 * What the real sites do well: Chinatown and Palki group the menu by
 * course (appetizers, soups, rice, mains) with a short description per dish
 * and an order-first layout; Dim Sum Town leads with its handmade speciality
 * and clear dine-in / takeaway / online-order options per branch. This
 * draft copies the course grouping and the order-first framing, not any
 * real menu prices.
 */
const CHINESE: Partial<DemoSiteDef> = {
  agencyReworked: true,
  name: "Dragon House",
  type: "Chinese Restaurant",
  logoEmoji: "🥡",
  accent: "#f87171",
  dark: true,
  heroTitle: "Authentic Chinese, cooked fresh to order",
  heroSub: "Dine in • Takeaway • Home delivery in Dhaka",
  heroEmoji: "🥡",
  cats: ["All", "Rice & Noodles", "Soups", "Starters", "Mains"],
  products: [
    { id: "p0", n: "Fried Rice", p: 180, e: "🍚", c: "Rice & Noodles", desc: "Wok-tossed rice with egg, vegetables and your choice of chicken — the house classic.", rating: 4.8, reviews: 342, stock: 40 },
    { id: "p1", n: "Chowmein", p: 160, e: "🍜", c: "Rice & Noodles", desc: "Stir-fried noodles with vegetables and chicken, tossed in a light soy sauce.", rating: 4.7, reviews: 286, stock: 36 },
    { id: "p2", n: "Thai Soup", p: 120, e: "🍲", c: "Soups", desc: "Tangy, lightly spiced Thai-style soup with chicken, prawn and mushrooms.", rating: 4.8, reviews: 254, stock: 30 },
    { id: "p3", n: "Chicken Fry", p: 220, e: "🍗", c: "Mains", desc: "Crisp fried chicken, marinated overnight and served hot with a dipping sauce.", rating: 4.7, reviews: 198, stock: 28 },
    { id: "p4", n: "Mixed Vegetables", p: 140, e: "🥬", c: "Mains", desc: "Seasonal vegetables stir-fried with garlic and a light oyster sauce.", rating: 4.6, reviews: 142, stock: 32 },
    { id: "p5", n: "Cashew Nut Salad", p: 280, e: "🥗", c: "Starters", desc: "Crunchy cashews, chicken and crisp vegetables in a light dressing.", rating: 4.8, reviews: 176, stock: 22 },
    { id: "p6", n: "Spring Rolls (4 pcs)", p: 200, e: "🥟", c: "Starters", desc: "Golden, crisp rolls filled with vegetables and chicken. New item — price estimated.", rating: 4.7, reviews: 64, stock: 24 },
    { id: "p7", n: "Hot & Sour Soup", p: 180, e: "🍲", c: "Soups", desc: "Spicy and tangy soup with chicken, egg and mushrooms. New item — price estimated.", rating: 4.7, reviews: 58, stock: 26 },
    { id: "p8", n: "Beef Chilli", p: 320, e: "🥩", c: "Mains", desc: "Tender beef strips tossed with peppers, onion and chilli. New item — price estimated.", rating: 4.8, reviews: 71, stock: 18 },
    { id: "p9", n: "Prawn Fried Rice", p: 320, e: "🍤", c: "Rice & Noodles", desc: "Wok-tossed rice with prawns, egg and spring onion. New item — price estimated.", rating: 4.8, reviews: 69, stock: 16 },
  ],
  about:
    "Dragon House is a neighbourhood Chinese restaurant in Dhanmondi, Dhaka. The menu is grouped by course — starters, soups, rice and noodles, and mains — so families can build a full meal in minutes. Order online for dine-in, takeaway or home delivery, and ask about family packs for gatherings.",
  contact: CONTACT,
  address: ADDRESS,
  hours: HOURS,
  priceNote: "Prices in Tk. Dine-in, takeaway & home delivery available.",
};

/**
 * CHEF — gallery layout (original: 6 gallery items, no prices).
 * Research:
 * - https://www.hiechef.com/
 * - https://www.takeachef.com/en-en/private-chef/dhaka-division
 * - https://upchef.app/en
 * What the real sites do well: all three lead with the booking flow
 * (event details first, then menus and quotes), show the chef by cuisine
 * and occasion, and spell out what is included — menu design, ingredient
 * shopping, cooking at home, table service and kitchen clean-up. This
 * draft copies the occasion-first gallery and the included-services
 * framing, not any real chef's rates.
 */
const CHEF: Partial<DemoSiteDef> = {
  agencyReworked: true,
  name: "Chef Karim",
  type: "Private Chef Portfolio",
  logoEmoji: "👨‍🍳",
  accent: "#f87171",
  dark: true,
  heroTitle: "A private chef for your table, at your home",
  heroSub: "Custom menus • Cooked in your kitchen • Kitchen left spotless",
  heroEmoji: "👨‍🍳",
  cats: ["All"],
  gallery: [
    { id: "g0", e: "🍛", t: "Local Classics", c: "Local" },
    { id: "g1", e: "🥡", t: "Chinese Favourites", c: "Chinese" },
    { id: "g2", e: "🍲", t: "Thai Table", c: "Thai" },
    { id: "g3", e: "🍰", t: "Dessert Course", c: "Desserts" },
    { id: "g4", e: "🍖", t: "Kebab Night", c: "Kebabs" },
    { id: "g5", e: "🍖", t: "Biryani Feast", c: "Biryani" },
    { id: "g6", e: "🥗", t: "Continental Dinner", c: "Continental" },
    { id: "g7", e: "🔥", t: "Weekend BBQ", c: "BBQ" },
  ],
  about:
    "Chef Karim is a private chef serving homes in Dhanmondi, Dhaka. Tell him the date, the number of guests and what you love to eat, and he designs a custom menu, shops for fresh ingredients, cooks in your kitchen and leaves it spotless. Book for birthdays, family dinners and small celebrations — menus and prices are confirmed before you commit, and dietary needs are planned in advance.",
  contact: CONTACT,
  address: ADDRESS,
  hours: HOURS,
};

/**
 * STATIONARY — shop layout (original slug spelling kept: "stationary";
 * original: 6 items, cats Writing/Art).
 * Research:
 * - https://www.realcanadiansuperstore.ca/en/school-office-supplies/stationery/c/56912
 * - https://play.google.com/store/apps/details?id=com.truewholesale.app&hl=en
 * - https://www.shops1000.com/GB/London/105300571130089/Ryman-Stationery
 * What the real sites do well: clear school / office / art grouping with
 * filters by category, plus bulk and back-to-school bundles for families
 * and offices. This draft copies the school / office / art grouping and
 * adds a bundle-friendly office range, not any real store's prices.
 */
const STATIONARY: Partial<DemoSiteDef> = {
  agencyReworked: true,
  name: "Paper & Pen Stationery",
  type: "Stationery Shop",
  logoEmoji: "✏️",
  accent: "#60a5fa",
  dark: true,
  heroTitle: "Everything for school, office and art",
  heroSub: "School packs • Office supplies • Home delivery in Dhaka",
  heroEmoji: "✏️",
  cats: ["All", "Writing", "Art", "Office"],
  products: [
    { id: "p0", n: "Notebook", p: 80, e: "📓", c: "Writing", desc: "Ruled notebook with a sturdy cover — the everyday school and office pick.", rating: 4.8, reviews: 412, stock: 60 },
    { id: "p1", n: "Pen Pack", p: 120, e: "🖊️", c: "Writing", desc: "Smooth-writing ball pens in a value pack — stock up once, write for months.", rating: 4.7, reviews: 356, stock: 80 },
    { id: "p2", n: "Pencil", p: 20, e: "✏️", c: "Writing", desc: "Standard HB pencil with a clean eraser tip. Sold per piece.", rating: 4.6, reviews: 289, stock: 120 },
    { id: "p3", n: "Colour Pencils", p: 250, e: "🖍️", c: "Art", desc: "Bright, break-resistant colour pencils for school art and sketching.", rating: 4.8, reviews: 198, stock: 34 },
    { id: "p4", n: "School Bag", p: 1200, e: "🎒", c: "Art", desc: "Padded, water-resistant school bag with multiple pockets and a bottle holder.", rating: 4.7, reviews: 143, stock: 14 },
    { id: "p5", n: "Geometry Box", p: 350, e: "📐", c: "Writing", desc: "Full geometry set — compass, divider, rulers and protractor in one box.", rating: 4.7, reviews: 167, stock: 26 },
    { id: "p6", n: "A4 Paper Ream", p: 450, e: "📄", c: "Office", desc: "500 sheets of smooth A4 paper for printing and photocopying. New item — price estimated.", rating: 4.8, reviews: 88, stock: 40 },
    { id: "p7", n: "File Folder Set", p: 180, e: "📁", c: "Office", desc: "Set of durable folders to organise documents at home or in the office. New item — price estimated.", rating: 4.6, reviews: 72, stock: 48 },
    { id: "p8", n: "Highlighter Set", p: 220, e: "🖍️", c: "Writing", desc: "Assorted-colour highlighters with chisel tips for notes and study. New item — price estimated.", rating: 4.7, reviews: 65, stock: 36 },
    { id: "p9", n: "Watercolour Set", p: 380, e: "🎨", c: "Art", desc: "Watercolour paints with a brush, for beginners and young artists. New item — price estimated.", rating: 4.8, reviews: 59, stock: 20 },
  ],
  about:
    "Paper & Pen Stationery is a neighbourhood stationery shop in Dhanmondi, Dhaka, serving students, families and offices. Browse by writing, art or office, build a school pack in one order, or ask about bulk rates for classrooms and offices. Order online for pickup or home delivery across Dhaka.",
  contact: CONTACT,
  address: ADDRESS,
  hours: HOURS,
  priceNote: "Prices in Tk. Pickup & home delivery available. Bulk rates on request.",
};

/**
 * LAUNDRY — service layout (original: 6 services).
 * Research:
 * - https://drisoftlaundry.com/
 * - https://deliwash.app/
 * - https://iwashblu.netlify.app/
 * What the real sites do well: a four-step booking flow (book pickup,
 * we collect, we clean, we deliver), transparent per-item or per-basket
 * rates, and a clear turnaround promise with an express option. This
 * draft copies the pickup-first flow and the per-item rate card, not any
 * real laundry's prices.
 */
const LAUNDRY: Partial<DemoSiteDef> = {
  agencyReworked: true,
  name: "FreshFold Laundry",
  type: "Laundry Service",
  logoEmoji: "👕",
  accent: "#22d3ee",
  dark: true,
  heroTitle: "Clean clothes, zero effort",
  heroSub: "Free pickup & delivery • Washed, dried and folded",
  heroEmoji: "👕",
  cats: ["All", "Wash", "Dry Clean", "Ironing"],
  services: [
    { id: "s0", n: "Shirt Wash", p: 40, e: "👔", desc: "Wash, dry and press for everyday shirts. Sorted by fabric and colour before washing.", duration: "24 hours", rating: 4.8, c: "Wash" },
    { id: "s1", n: "Pants Wash", p: 50, e: "👖", desc: "Wash, dry and press for trousers and pants, with crease finish on request.", duration: "24 hours", rating: 4.8, c: "Wash" },
    { id: "s2", n: "Traditional Dress Wash", p: 120, e: "🥻", desc: "Gentle wash and careful pressing for traditional dresses and delicate weaves.", duration: "48 hours", rating: 4.9, c: "Wash" },
    { id: "s3", n: "Suit Dry Clean", p: 350, e: "🤵", desc: "Full dry clean and press for suits — inspected, spot-treated and finished by hand.", duration: "48 hours", rating: 4.9, c: "Dry Clean" },
    { id: "s4", n: "Blanket Wash", p: 400, e: "🛏️", desc: "Deep wash and thorough drying for blankets and quilts, folded and packed on return.", duration: "72 hours", rating: 4.7, c: "Wash" },
    { id: "s5", n: "Iron Only", p: 30, e: "🔥", desc: "Crisp steam press for already-clean clothes, ready for the next morning.", duration: "12 hours", rating: 4.7, c: "Ironing" },
    { id: "s6", n: "Wash & Fold (per kg)", p: 90, e: "🧺", desc: "Everyday laundry washed, dried and neatly folded by the kilo. New service — price estimated.", duration: "24 hours", rating: 4.8, c: "Wash" },
    { id: "s7", n: "Curtain Wash", p: 250, e: "🪟", desc: "Wash and press for curtains, including careful handling of linings and hooks. New service — price estimated.", duration: "48 hours", rating: 4.7, c: "Wash" },
  ],
  about:
    "FreshFold Laundry is a neighbourhood laundry service in Dhanmondi, Dhaka. Book a pickup online, and a rider collects your clothes, washes and folds them, and delivers them back to your door — free pickup and delivery in the area. Standard turnaround is 24 hours for everyday items; delicate and bulky items take longer, as shown per service. Please check pockets before handover.",
  contact: CONTACT,
  address: ADDRESS,
  hours: HOURS,
};

/**
 * CARWASH — service layout (original: 6 services).
 * Research:
 * - https://www.washos.com/pricing
 * - https://turboluxurycarwash.ae/
 * - https://www.bigwashcardetailing.com/
 * What the real sites do well: tiered packages (quick wash, full wash,
 * full detail) with an itemised list of what each tier includes, plus
 * doorstep booking with WhatsApp confirmation. This draft copies the
 * tiered-package structure and the doorstep-booking framing, not any
 * real detailer's prices.
 */
const CARWASH: Partial<DemoSiteDef> = {
  agencyReworked: true,
  name: "Sparkle Car Wash",
  type: "Car Wash Service",
  logoEmoji: "🚗",
  accent: "#60a5fa",
  dark: true,
  heroTitle: "Your car, looking brand new",
  heroSub: "Doorstep service • Eco-friendly products • Book online",
  heroEmoji: "🚗",
  cats: ["All", "Wash", "Detailing"],
  services: [
    { id: "s0", n: "Basic Wash", p: 300, e: "🧽", desc: "Exterior hand wash, tyre clean and window wipe — the quick weekly refresh.", duration: "30 min", rating: 4.7, c: "Wash" },
    { id: "s1", n: "Full Wash", p: 800, e: "🚿", desc: "Exterior wash plus interior vacuum, dashboard wipe and window clean inside and out.", duration: "60 min", rating: 4.8, c: "Wash" },
    { id: "s2", n: "Polish", p: 1500, e: "✨", desc: "Full wash plus wax polish for a deep shine and paint protection.", duration: "90 min", rating: 4.8, c: "Detailing" },
    { id: "s3", n: "Interior Clean", p: 1200, e: "💺", desc: "Deep interior clean — seats, carpets, dashboard and door panels, vacuumed and wiped.", duration: "60 min", rating: 4.8, c: "Detailing" },
    { id: "s4", n: "Ceramic Coating", p: 5000, e: "🛡️", desc: "Premium ceramic coating for long-lasting shine and paint protection. Final price confirmed after inspection.", duration: "120 min", rating: 4.9, c: "Detailing" },
    { id: "s5", n: "Vacuum Only", p: 400, e: "🌀", desc: "Thorough interior and boot vacuum — seats, carpets and floor mats.", duration: "20 min", rating: 4.6, c: "Wash" },
    { id: "s6", n: "Engine Bay Clean", p: 900, e: "🔧", desc: "Careful engine-bay degrease and wipe, with sensitive parts protected. New service — price estimated.", duration: "60 min", rating: 4.7, c: "Detailing" },
    { id: "s7", n: "Headlight Restoration", p: 1200, e: "💡", desc: "Polish and seal for cloudy headlights, restoring clarity and night visibility. New service — price estimated.", duration: "45 min", rating: 4.7, c: "Detailing" },
  ],
  about:
    "Sparkle Car Wash is a neighbourhood car wash service in Dhanmondi, Dhaka. Book a slot online and the team comes to your home or office with its own water and equipment, or drop your car at the wash point. Choose a quick wash, a full wash or a full detail — every package lists exactly what is included, and the final price for coating work is confirmed after inspection.",
  contact: CONTACT,
  address: ADDRESS,
  hours: HOURS,
};


/* ---------------- Phase 3: service + booking + gallery families ---------------- */

const CLINIC: Partial<DemoSiteDef> = {
  agencyReworked: true,
  name: "Seva Clinic",
  type: "Clinic & Diagnostics",
  logoEmoji: "🏥",
  accent: "#2dd4bf",
  dark: true,
  heroTitle: "Good health starts with a booked visit",
  heroSub: "Book with a doctor • Lab tests • Same-week appointments",
  heroEmoji: "🏥",
  cats: ["All", "Checkups", "Diagnostics", "Vaccination"],
  services: [
    { id: "s0", n: "General Checkup", p: 500, e: "🩺", desc: "A full consultation with a doctor: symptoms, history, examination and a written advice note. Book a doctor and a time slot online.", duration: "30 min", rating: 4.8, c: "Consultation" },
    { id: "s1", n: "Blood Test", p: 800, e: "🩸", desc: "Common blood tests with a printed report. Bring any previous reports so the doctor can compare results.", duration: "20 min", rating: 4.7, c: "Diagnostics" },
    { id: "s2", n: "ECG", p: 600, e: "❤️", desc: "Heart rhythm tracing, read and explained by a doctor. No preparation needed — walk in at your booked slot.", duration: "15 min", rating: 4.8, c: "Diagnostics" },
    { id: "s3", n: "Ultrasound Scan", p: 1200, e: "📡", desc: "Diagnostic ultrasound with a written report. Your doctor advises whether any preparation is needed before the scan.", duration: "30 min", rating: 4.8, c: "Diagnostics" },
    { id: "s4", n: "Vaccination", p: 300, e: "💉", desc: "Routine vaccinations for children and adults, with a vaccination card updated at every visit.", duration: "10 min", rating: 4.9, c: "Prevention" },
    { id: "s5", n: "Blood Pressure Check", p: 100, e: "🩸", desc: "Quick blood pressure and pulse check, recorded for your next visit. Free advice on the result from the duty doctor.", duration: "10 min", rating: 4.7, c: "Consultation" },
    { id: "s6", n: "Diabetes Screening", p: 900, e: "🩸", desc: "Blood sugar screening with same-day results and doctor advice. New service — price estimated.", duration: "20 min", rating: 4.7, c: "Diagnostics" },
    { id: "s7", n: "X-Ray", p: 1000, e: "🦴", desc: "Digital X-ray with a written report for your doctor. New service — price estimated.", duration: "20 min", rating: 4.7, c: "Diagnostics" },
    { id: "s8", n: "Nutrition Consultation", p: 700, e: "🥗", desc: "A one-to-one diet and lifestyle consultation, with a written plan to take home. New service — price estimated.", duration: "30 min", rating: 4.8, c: "Consultation" },
  ],
  about:
    "Seva Clinic is a neighbourhood clinic in Dhanmondi, Dhaka. Book with a doctor online: pick your doctor, pick a date and time slot, and arrive at your serial — no long waiting-room queue. Consultations come first: the doctor examines you, explains the findings and only then recommends tests or treatment, so you never pay for a test you do not need. Lab reports are handed over in print, and follow-up advice after a checkup is free.",
  contact: CONTACT,
  address: ADDRESS,
  hours: HOURS,
  priceNote: "Prices in Tk. Consultation first — tests are recommended only after examination.",
};

const DENTAL: Partial<DemoSiteDef> = {
  agencyReworked: true,
  name: "Bright Smile Dental",
  type: "Dental Care",
  logoEmoji: "🦷",
  accent: "#38bdf8",
  dark: true,
  heroTitle: "A healthier smile, one visit at a time",
  heroSub: "Consultation first • Painless methods • Book online",
  heroEmoji: "🦷",
  cats: ["All", "Checkups", "Treatments", "Cosmetic"],
  services: [
    { id: "s0", n: "Scaling", p: 1500, e: "✨", desc: "Full scaling to remove tartar and plaque, finished with a polish. Includes oral-hygiene advice for home care.", duration: "45 min", rating: 4.8, c: "Cleaning" },
    { id: "s1", n: "Filling", p: 2000, e: "🦷", desc: "Tooth-coloured filling for cavities, matched to your natural tooth colour. X-ray and consultation before treatment.", duration: "60 min", rating: 4.8, c: "Treatment" },
    { id: "s2", n: "Root Canal", p: 8000, e: "🔧", desc: "Root canal treatment to save a damaged tooth, done over one or more sittings as the dentist advises. X-ray and consultation before treatment.", duration: "90 min", rating: 4.7, c: "Treatment" },
    { id: "s3", n: "Braces", p: 50000, e: "😁", desc: "Orthodontic treatment planned after a full consultation and X-ray. Final price confirmed in a written plan before treatment starts.", duration: "Consultation", rating: 4.8, c: "Orthodontics" },
    { id: "s4", n: "Dental Checkup", p: 300, e: "🩺", desc: "Full mouth examination, X-ray where needed, and a written treatment plan with prices — no treatment starts without your agreement.", duration: "15 min", rating: 4.9, c: "Consultation" },
    { id: "s5", n: "Polishing", p: 1200, e: "💫", desc: "Polish after scaling for a smooth, clean finish and a brighter smile.", duration: "30 min", rating: 4.8, c: "Cleaning" },
    { id: "s6", n: "Teeth Whitening", p: 4000, e: "✨", desc: "Professional whitening after a checkup confirms your teeth and gums are suitable. New service — price estimated.", duration: "60 min", rating: 4.7, c: "Cosmetic" },
    { id: "s7", n: "Tooth Extraction", p: 2500, e: "🦷", desc: "Gentle extraction with aftercare instructions and a follow-up check. X-ray and consultation before treatment. New service — price estimated.", duration: "30 min", rating: 4.7, c: "Treatment" },
    { id: "s8", n: "Dental X-Ray", p: 800, e: "📡", desc: "Digital dental X-ray, read by the dentist before any treatment is planned. New service — price estimated.", duration: "15 min", rating: 4.8, c: "Diagnostics" },
  ],
  about:
    "Bright Smile Dental is a neighbourhood dental clinic in Dhanmondi, Dhaka. Book with a dentist online and start with a consultation: examination and X-ray first, then a written treatment plan with clear prices, so you always know the cost before treatment begins. Note: X-ray and consultation come before fillings, root canals, braces and extractions — treatment is never started on a first visit without diagnosis.",
  contact: CONTACT,
  address: ADDRESS,
  hours: HOURS,
  priceNote: "Prices in Tk. X-ray and consultation before treatment; written plan before work starts.",
};

const ELECTRICIAN: Partial<DemoSiteDef> = {
  agencyReworked: true,
  name: "PowerCare Electrical",
  type: "Electrician Service",
  logoEmoji: "💡",
  accent: "#facc15",
  dark: true,
  heroTitle: "Power problems, fixed at your door",
  heroSub: "Certified electricians • Emergency service • Doorstep visits",
  heroEmoji: "💡",
  cats: ["All", "Repairs", "Installation", "Safety"],
  services: [
    { id: "s0", n: "Fan Repair", p: 300, e: "🌀", desc: "Ceiling and table fan repair — noise, slow speed, regulator or capacitor faults diagnosed on the spot.", duration: "1 hour", rating: 4.7, c: "Repair" },
    { id: "s1", n: "Light Fitting", p: 200, e: "💡", desc: "New lights, tube lights and LED panels fitted and tested, with old fittings removed safely.", duration: "30 min", rating: 4.8, c: "Installation" },
    { id: "s2", n: "Home Wiring", p: 1500, e: "🔌", desc: "New wiring or rewiring for a room or a full home, with a written quote before work starts. Price confirmed after inspection.", duration: "1 day", rating: 4.8, c: "Installation" },
    { id: "s3", n: "Switch Board", p: 450, e: "🎛️", desc: "Switch board repair or replacement, sockets, regulators and dimmers fitted and tested.", duration: "1 hour", rating: 4.7, c: "Installation" },
    { id: "s4", n: "Motor Service", p: 800, e: "⚙️", desc: "Water-pump and motor servicing: winding check, bearing and capacitor replacement where needed.", duration: "2 hours", rating: 4.7, c: "Repair" },
    { id: "s5", n: "Circuit Breaker", p: 1200, e: "🔋", desc: "Breaker and distribution-board repair or replacement, with a full safety test after fitting.", duration: "1 hour", rating: 4.8, c: "Repair" },
    { id: "s6", n: "IPS / UPS Setup", p: 1800, e: "🔌", desc: "Inverter and battery setup for load-shedding backup, sized to your home. New service — price estimated.", duration: "2 hours", rating: 4.7, c: "Installation" },
    { id: "s7", n: "Exhaust Fan Installation", p: 500, e: "🌀", desc: "Kitchen and bathroom exhaust fans fitted with proper venting. New service — price estimated.", duration: "1 hour", rating: 4.7, c: "Installation" },
    { id: "s8", n: "Home Safety Inspection", p: 1000, e: "🛡️", desc: "A full check of wiring, boards, earthing and load balance, with a written report of anything that needs fixing. New service — price estimated.", duration: "2 hours", rating: 4.8, c: "Inspection" },
  ],
  about:
    "PowerCare Electrical is a neighbourhood electrician service in Dhanmondi, Dhaka. Book a doorstep visit online and a certified electrician arrives with tools and common parts — emergency calls are prioritised. Every job starts with a price agreed before work begins, and all work carries a service guarantee: if the same fault returns, the revisit is free. Safety note: if you smell burning, see sparks or scorch marks, or find water near electrics, switch off power only if it is safe to do so, keep clear, and call for help — do not open a panel or touch damaged wiring yourself.",
  contact: CONTACT,
  address: ADDRESS,
  hours: HOURS,
  priceNote: "Prices in Tk. Price agreed before work starts; service guarantee on all work.",
};

const TUTOR: Partial<DemoSiteDef> = {
  agencyReworked: true,
  name: "StudyPath Tutors",
  type: "Tuition Service",
  logoEmoji: "📖",
  accent: "#a78bfa",
  dark: true,
  heroTitle: "The right tutor, for every subject",
  heroSub: "Verified tutors • Home or online • Free demo class",
  heroEmoji: "📖",
  cats: ["All", "School Subjects", "Languages", "Exam Preparation"],
  services: [
    { id: "s0", n: "Mathematics", p: 2000, e: "🔢", desc: "One-to-one mathematics tuition, from school basics to advanced problem solving, with weekly practice sets.", duration: "Monthly", rating: 4.8, c: "School" },
    { id: "s1", n: "English", p: 2000, e: "🔤", desc: "English reading, writing, grammar and speaking, matched to the student's school level and syllabus.", duration: "Monthly", rating: 4.8, c: "Language" },
    { id: "s2", n: "Science", p: 2500, e: "🔬", desc: "General science tuition with concept-first explanations and exam-style practice questions.", duration: "Monthly", rating: 4.8, c: "School" },
    { id: "s3", n: "Bengali", p: 1500, e: "📝", desc: "Bengali language and literature tuition, covering reading, writing and syllabus texts.", duration: "Monthly", rating: 4.7, c: "Language" },
    { id: "s4", n: "ICT", p: 1800, e: "💻", desc: "ICT tuition covering computers, software and practical skills, with hands-on practice in every session.", duration: "Monthly", rating: 4.7, c: "School" },
    { id: "s5", n: "Admission Preparation", p: 3000, e: "🎓", desc: "Structured admission-test preparation: syllabus plan, mock tests and progress tracking until exam day.", duration: "Monthly", rating: 4.9, c: "Admission" },
    { id: "s6", n: "Physics", p: 2500, e: "⚛️", desc: "Physics tuition with worked examples and problem-solving practice, for school and college levels. New service — price estimated.", duration: "Monthly", rating: 4.8, c: "School" },
    { id: "s7", n: "Chemistry", p: 2500, e: "🧪", desc: "Chemistry tuition covering theory and numerical problems, with regular short tests. New service — price estimated.", duration: "Monthly", rating: 4.8, c: "School" },
    { id: "s8", n: "Spoken English", p: 2200, e: "🗣️", desc: "Conversation-focused spoken English: daily speaking practice, pronunciation and confidence building. New service — price estimated.", duration: "Monthly", rating: 4.7, c: "Language" },
  ],
  about:
    "StudyPath Tutors is a neighbourhood tuition service in Dhanmondi, Dhaka. Tutors are verified before listing, and subjects are grouped by school level — primary, secondary and college — so you book a tutor matched to the student's class, not just the subject. Lessons run at home or online, at a time that fits the family. Every new student starts with a free demo class: meet the tutor, try a real lesson, then decide — no commitment and no advance payment for the demo.",
  contact: CONTACT,
  address: ADDRESS,
  hours: HOURS,
  priceNote: "Prices in Tk per month. First demo class is free.",
};

const EVENTPLAN: Partial<DemoSiteDef> = {
  agencyReworked: true,
  name: "Utsab Events",
  type: "Event Planner",
  logoEmoji: "🎉",
  accent: "#e879f9",
  dark: true,
  heroTitle: "Events worth remembering",
  heroSub: "Full planning • Decoration • Catering coordination • Photography coordination",
  heroEmoji: "🎉",
  cats: ["All", "Family Events", "Corporate", "Ceremonies"],
  services: [
    { id: "s0", n: "Birthday Package", p: 15000, e: "🎂", desc: "Full package: theme decoration, cake coordination, photography coordination, music and a day-of coordinator. Start with a free consultation for a tailored quote.", duration: "Full package", rating: 4.8, c: "Birthday" },
    { id: "s1", n: "Wedding Event Package", p: 80000, e: "💒", desc: "Full package: venue coordination, decoration, catering coordination, photography coordination and day-of management. Start with a free consultation for a tailored quote.", duration: "Full package", rating: 4.9, c: "Wedding" },
    { id: "s2", n: "Corporate Event Package", p: 50000, e: "🏢", desc: "Full package: venue and staging, AV setup, branding, catering coordination and guest management. Start with a free consultation for a tailored quote.", duration: "Full package", rating: 4.8, c: "Corporate" },
    { id: "s3", n: "Holud Ceremony Package", p: 25000, e: "💛", desc: "Full package: traditional decoration, music, photography coordination and guest hospitality for the holud ceremony. Start with a free consultation for a tailored quote.", duration: "Full package", rating: 4.8, c: "Holud" },
    { id: "s4", n: "Seminar Package", p: 30000, e: "🎤", desc: "Full package: venue, stage and AV, registration desk, catering coordination and on-day coordination. Start with a free consultation for a tailored quote.", duration: "Full package", rating: 4.7, c: "Corporate" },
    { id: "s5", n: "Baby Shower Package", p: 12000, e: "👶", desc: "Full package: decoration, catering coordination, photography coordination and return-gift ideas. Start with a free consultation for a tailored quote.", duration: "Full package", rating: 4.8, c: "Family" },
    { id: "s6", n: "Anniversary Package", p: 20000, e: "💐", desc: "Full package: decoration, catering coordination, photography coordination and music for an anniversary celebration. New service — price estimated. Start with a free consultation for a tailored quote.", duration: "Full package", rating: 4.8, c: "Family" },
    { id: "s7", n: "Product Launch Package", p: 45000, e: "🚀", desc: "Full package: stage and branding, AV and live demo setup, catering coordination and guest management. New service — price estimated. Start with a free consultation for a tailored quote.", duration: "Full package", rating: 4.7, c: "Corporate" },
  ],
  about:
    "Utsab Events is a neighbourhood event planning service in Dhanmondi, Dhaka. Every event starts with a free consultation: tell us the occasion, the guest count and the budget, and you get a written quote listing exactly what is included — planning, decoration, catering coordination, photography coordination and day-of management — before you pay anything. Package prices shown are starting prices; the final quote depends on venue, guest count and decoration choices, and is confirmed in writing.",
  contact: CONTACT,
  address: ADDRESS,
  hours: HOURS,
  priceNote: "Prices in Tk, starting prices. Final quote confirmed in writing after a free consultation.",
};

const WEDDINGPLAN: Partial<DemoSiteDef> = {
  agencyReworked: true,
  name: "EverAfter Wedding Planners",
  type: "Wedding Planner",
  logoEmoji: "💒",
  accent: "#fb7185",
  dark: true,
  heroTitle: "Your dream wedding, planned end to end",
  heroSub: "Venue • Decoration • Catering • Photography • Day-of coordination",
  heroEmoji: "💒",
  cats: ["All", "Planning", "Decoration", "Catering & Venue"],
  services: [
    { id: "s0", n: "Wedding Photography", p: 25000, e: "📸", desc: "Full-day photography coordination: ceremony and reception coverage, edited album and digital copies. Start with a free consultation for a tailored quote.", duration: "Full day", rating: 4.9, c: "Photo & Video" },
    { id: "s1", n: "Wedding Decoration", p: 30000, e: "🎀", desc: "Full package: stage, floral and lighting decoration designed around your theme, set up and cleared by the team. Start with a free consultation for a tailored quote.", duration: "Full package", rating: 4.9, c: "Decoration" },
    { id: "s2", n: "Catering (per plate)", p: 500, e: "🍽️", desc: "Menu planning and catering coordination per guest plate, with tasting before the final menu is fixed. Start with a free consultation for a tailored quote.", duration: "Per plate", rating: 4.8, c: "Catering" },
    { id: "s3", n: "Bridal Makeup", p: 15000, e: "💄", desc: "Full package: bridal makeup, hairstyling and draping by an experienced artist, with a trial session before the day. Start with a free consultation for a tailored quote.", duration: "Full package", rating: 4.8, c: "Beauty" },
    { id: "s4", n: "Car Decoration", p: 8000, e: "🚗", desc: "Wedding car decoration with fresh flowers and ribbons, fitted on the day and removed afterwards. Start with a free consultation for a tailored quote.", duration: "1 day", rating: 4.7, c: "Decoration" },
    { id: "s5", n: "Venue Booking", p: 40000, e: "🏛️", desc: "Venue scouting and booking coordination for the ceremony and reception, matched to your guest count and budget. Start with a free consultation for a tailored quote.", duration: "1 day", rating: 4.8, c: "Venue" },
    { id: "s6", n: "Holud & Mehndi Decoration", p: 18000, e: "💛", desc: "Full package: holud and mehndi stage decoration, music coordination and guest seating. New service — price estimated. Start with a free consultation for a tailored quote.", duration: "Full package", rating: 4.8, c: "Decoration" },
    { id: "s7", n: "Wedding Videography", p: 30000, e: "🎥", desc: "Full-day videography coordination: cinematic highlights film and full ceremony edit. New service — price estimated. Start with a free consultation for a tailored quote.", duration: "Full day", rating: 4.8, c: "Photo & Video" },
    { id: "s8", n: "Guest Transport Coordination", p: 12000, e: "🚌", desc: "Transport planning for guests between venue, hotel and ceremony, with a coordinator on the day. New service — price estimated. Start with a free consultation for a tailored quote.", duration: "1 day", rating: 4.7, c: "Transport" },
  ],
  about:
    "EverAfter Wedding Planners is a neighbourhood wedding planning service in Dhanmondi, Dhaka. Every wedding starts with a free consultation: share your date, guest count and style, and you get a written plan listing exactly what is included — venue coordination, decoration, catering coordination, photography coordination and day-of management — before you commit. Prices shown are starting prices; the final quote depends on venue, guest count and decoration choices, and is confirmed in writing. A dedicated coordinator stays on site on the day so the couple and family can enjoy the event.",
  contact: CONTACT,
  address: ADDRESS,
  hours: HOURS,
  priceNote: "Prices in Tk, starting prices. Final quote confirmed in writing after a free consultation.",
};

const ITSUPPORT: Partial<DemoSiteDef> = {
  agencyReworked: true,
  name: "TechCare IT Support",
  type: "IT Support Service",
  logoEmoji: "💻",
  accent: "#94a3b8",
  dark: true,
  heroTitle: "Tech problems, solved at your desk",
  heroSub: "Remote support • Doorstep visits • Your data stays safe",
  heroEmoji: "💻",
  cats: ["All", "Repairs", "Setup", "Network & Security"],
  services: [
    { id: "s0", n: "Windows Setup", p: 500, e: "🪟", desc: "Fresh Windows installation, drivers and essential software, with your files backed up first where possible.", duration: "1 hour", rating: 4.8, c: "Setup" },
    { id: "s1", n: "Virus Removal", p: 800, e: "🛡️", desc: "Full virus and malware cleanup, security software setup and a safety briefing so it does not come back.", duration: "2 hours", rating: 4.8, c: "Repair" },
    { id: "s2", n: "Data Recovery", p: 2000, e: "💾", desc: "Recovery from formatted, damaged or unresponsive drives, attempted in a read-only way first. Success depends on the damage — the technician explains before charging for recovery work.", duration: "1 day", rating: 4.7, c: "Repair" },
    { id: "s3", n: "Network Setup", p: 1500, e: "📡", desc: "Home or office network setup: router, switches, cabling and Wi-Fi coverage tested in every room.", duration: "2 hours", rating: 4.8, c: "Setup" },
    { id: "s4", n: "Laptop Servicing", p: 1200, e: "🔧", desc: "Full laptop service: cleaning, thermal paste, keyboard, battery and performance check, with a written report.", duration: "1 day", rating: 4.8, c: "Repair" },
    { id: "s5", n: "Software Installation", p: 600, e: "💿", desc: "Licensed software installation and setup, with your own licence keys kept private and returned to you.", duration: "1 hour", rating: 4.7, c: "Setup" },
    { id: "s6", n: "Printer Setup", p: 700, e: "🖨️", desc: "Printer and scanner setup on Wi-Fi or USB, with test prints from every device you use. New service — price estimated.", duration: "1 hour", rating: 4.7, c: "Setup" },
    { id: "s7", n: "SSD Upgrade", p: 2500, e: "💾", desc: "SSD upgrade service including data migration to the new drive; the drive itself is quoted separately. New service — price estimated.", duration: "2 hours", rating: 4.8, c: "Upgrade" },
    { id: "s8", n: "Home Wi-Fi Coverage Fix", p: 1800, e: "📶", desc: "Dead-zone diagnosis and access-point placement so Wi-Fi reaches every room. New service — price estimated.", duration: "2 hours", rating: 4.8, c: "Network" },
  ],
  about:
    "TechCare IT Support is a neighbourhood IT support service in Dhanmondi, Dhaka. Most problems are fixed remotely in one session; when hands are needed, a technician visits your home or office. Every job starts with a written quote before work begins, and your data is handled carefully: nothing is copied off your device without your permission, and recovered files are handed back only to you. All work carries a service guarantee — if the same fault returns, the revisit is free.",
  contact: CONTACT,
  address: ADDRESS,
  hours: HOURS,
  priceNote: "Prices in Tk. Written quote before work starts; service guarantee on all work.",
};

const PLUMBER: Partial<DemoSiteDef> = {
  agencyReworked: true,
  name: "PipeMaster Plumbing",
  type: "Plumbing Service",
  logoEmoji: "🔧",
  accent: "#60a5fa",
  dark: true,
  heroTitle: "Water problems? No worries.",
  heroSub: "Emergency service • Doorstep visits • Guaranteed work",
  heroEmoji: "🔧",
  cats: ["All", "Repairs", "Installation", "Emergency"],
  services: [
    { id: "s0", n: "Tap Repair", p: 250, e: "🚰", desc: "Leaking, dripping or stiff taps repaired or replaced, with washers and fittings included in the visit.", duration: "1 hour", rating: 4.7, c: "Repair" },
    { id: "s1", n: "Pipe Fitting", p: 800, e: "🪠", desc: "New pipe runs, joints and fittings for kitchens and bathrooms, pressure-tested before handover.", duration: "2 hours", rating: 4.8, c: "Installation" },
    { id: "s2", n: "Water Tank Cleaning", p: 1500, e: "🛢️", desc: "Full tank drain, scrub and disinfection, with a flush-through before the water is used again.", duration: "3 hours", rating: 4.8, c: "Cleaning" },
    { id: "s3", n: "Basin Setup", p: 1200, e: "🚿", desc: "Basin and washroom fitting installation, sealed and leak-tested before the team leaves.", duration: "2 hours", rating: 4.7, c: "Installation" },
    { id: "s4", n: "Motor Installation", p: 2000, e: "⚙️", desc: "Water-pump motor installation and connection, tested under load before handover.", duration: "3 hours", rating: 4.8, c: "Installation" },
    { id: "s5", n: "Leakage Repair", p: 500, e: "💧", desc: "Leak tracing and repair for pipes, joints and fittings — emergency calls prioritised for active leaks.", duration: "1 hour", rating: 4.8, c: "Repair" },
    { id: "s6", n: "Drain Unblocking", p: 900, e: "🌀", desc: "Blocked drain clearing for kitchens and bathrooms, with a flow test before the team leaves. New service — price estimated.", duration: "1 hour", rating: 4.7, c: "Repair" },
    { id: "s7", n: "Toilet Installation", p: 2500, e: "🚽", desc: "Toilet fitting and replacement, sealed and flush-tested before handover. New service — price estimated.", duration: "2 hours", rating: 4.7, c: "Installation" },
    { id: "s8", n: "Water Heater Installation", p: 2200, e: "🔥", desc: "Electric water heater installation with safety checks on wiring and earthing. New service — price estimated.", duration: "2 hours", rating: 4.8, c: "Installation" },
  ],
  about:
    "PipeMaster Plumbing is a neighbourhood plumbing service in Dhanmondi, Dhaka. Book a doorstep visit online and a plumber arrives with tools and common parts — emergency calls for burst pipes and active leaks are prioritised. Every job starts with a price agreed before work begins, and all work carries a service guarantee: if the same leak or fault returns, the revisit is free. Emergency note: for a burst pipe, turn off the main water valve if you can reach it safely, move valuables away from the water, and call for help.",
  contact: CONTACT,
  address: ADDRESS,
  hours: HOURS,
  priceNote: "Prices in Tk. Price agreed before work starts; service guarantee on all work.",
};

const HOTEL: Partial<DemoSiteDef> = {
  agencyReworked: true,
  name: "Sea View Hotel",
  type: "Hotel Booking",
  logoEmoji: "🏨",
  accent: "#38bdf8",
  dark: true,
  heroTitle: "Stay by the sea in Cox's Bazar",
  heroSub: "Sea-view rooms • Complimentary breakfast • Beachfront location",
  heroEmoji: "🏨",
  cats: ["All", "Rooms", "Suites", "Family"],
  products: [
    { id: "p0", n: "Deluxe Room", p: 3500, e: "🛏️", c: "Rooms", desc: "Comfortable double room with air conditioning, Wi-Fi and TV. Complimentary breakfast for two included. Per night.", rating: 4.8, reviews: 412, stock: 12 },
    { id: "p1", n: "Suite", p: 6500, e: "🌊", c: "Suites", desc: "Spacious suite with a private balcony facing the sea. Breakfast for two, late check-out on request. Per night.", rating: 4.9, reviews: 238, stock: 6 },
    { id: "p2", n: "Family Room", p: 5000, e: "👨‍👩‍👧", c: "Family", desc: "Two double beds for up to four guests, with a sitting corner. Breakfast for the family included. Per night.", rating: 4.8, reviews: 196, stock: 8 },
    { id: "p3", n: "Sea View Deluxe Room", p: 4500, e: "🌅", c: "Rooms", desc: "Deluxe room with a full sea view from the window. Breakfast for two included. Per night. Price estimated.", rating: 4.8, reviews: 154, stock: 10 },
    { id: "p4", n: "Executive Room", p: 5500, e: "💼", c: "Rooms", desc: "Quiet upper-floor room with a work desk and faster Wi-Fi. Breakfast for two included. Per night. Price estimated.", rating: 4.7, reviews: 98, stock: 8 },
    { id: "p5", n: "Honeymoon Suite", p: 8500, e: "💕", c: "Suites", desc: "Sea-facing suite with a bathtub and a decorated bed on request. Breakfast for two included. Per night. Price estimated.", rating: 4.9, reviews: 87, stock: 4 },
    { id: "p6", n: "Twin Room", p: 3200, e: "🛏️", c: "Rooms", desc: "Two single beds, ideal for friends travelling together. Breakfast for two included. Per night. Price estimated.", rating: 4.7, reviews: 132, stock: 14 },
    { id: "p7", n: "Triple Room", p: 4200, e: "👨‍👩‍👧", c: "Family", desc: "One double bed plus one single bed for three guests. Breakfast for three included. Per night. Price estimated.", rating: 4.8, reviews: 76, stock: 9 },
    { id: "p8", n: "Premium Sea View Suite", p: 9500, e: "🏖️", c: "Suites", desc: "Top-floor suite with a wide sea-view terrace and a living area. Breakfast for two included. Per night. Price estimated.", rating: 4.9, reviews: 64, stock: 3 },
  ],
  about:
    "Sea View Hotel is a beachfront hotel in Cox's Bazar, a short walk from the beach. Every room rate includes complimentary breakfast, Wi-Fi and air conditioning; sea-view rooms and suites add a balcony facing the bay. Free cancellation up to 48 hours before check-in; bookings cancelled later are charged for the first night. Check-in from 2:00 PM, check-out by 12:00 noon. Book online and your confirmation arrives instantly.",
  contact: CONTACT,
  address: ADDRESS,
  hours: HOURS,
  priceNote: "Prices in Tk per night. Breakfast included. Free cancellation up to 48 hours before check-in.",
};

const RESORT: Partial<DemoSiteDef> = {
  agencyReworked: true,
  name: "Palm Resort",
  type: "Resort Booking",
  logoEmoji: "🌴",
  accent: "#4ade80",
  dark: true,
  heroTitle: "Escape into nature, in comfort",
  heroSub: "Swimming pool • Barbecue evenings • Gardens and open air",
  heroEmoji: "🌴",
  cats: ["All", "Cottages", "Villas", "Camping"],
  products: [
    { id: "p0", n: "Cottage", p: 4500, e: "🏕️", c: "Cottages", desc: "Cozy garden cottage for two, with a private veranda. Pool access and breakfast included. Per night.", rating: 4.8, reviews: 287, stock: 10 },
    { id: "p1", n: "Villa", p: 8000, e: "🏡", c: "Villas", desc: "Spacious villa with a living area and a garden terrace. Pool access and breakfast for the family included. Per night.", rating: 4.9, reviews: 176, stock: 5 },
    { id: "p2", n: "Tent", p: 2500, e: "⛺", c: "Camping", desc: "Comfortable camping tent with beds and bedding, set in the garden. Shared washrooms nearby. Per night.", rating: 4.6, reviews: 203, stock: 16 },
    { id: "p3", n: "Lake View Cottage", p: 5500, e: "🏞️", c: "Cottages", desc: "Cottage facing the lake, with a veranda for morning tea. Pool access and breakfast included. Per night. Price estimated.", rating: 4.8, reviews: 121, stock: 8 },
    { id: "p4", n: "Family Villa", p: 12000, e: "🏠", c: "Villas", desc: "Two-bedroom villa for up to six guests, with a kitchen corner and a large terrace. Pool access and breakfast included. Per night. Price estimated.", rating: 4.9, reviews: 94, stock: 4 },
    { id: "p5", n: "Premium Tent", p: 3500, e: "⛺", c: "Camping", desc: "Larger tent with proper beds, lighting and a private sitting area outside. Per night. Price estimated.", rating: 4.7, reviews: 88, stock: 12 },
    { id: "p6", n: "Treehouse", p: 7000, e: "🌳", c: "Cottages", desc: "Wooden treehouse stay for two, above the garden. Pool access and breakfast included. Per night. Price estimated.", rating: 4.8, reviews: 73, stock: 3 },
    { id: "p7", n: "Duplex Cottage", p: 6500, e: "🏡", c: "Cottages", desc: "Two-level cottage for a family of four, with a ground-floor sitting room. Pool access and breakfast included. Per night. Price estimated.", rating: 4.8, reviews: 67, stock: 6 },
    { id: "p8", n: "Pool Villa", p: 10000, e: "🏊", c: "Villas", desc: "Villa with a private plunge pool and a shaded terrace. Breakfast included. Per night. Price estimated.", rating: 4.9, reviews: 58, stock: 3 },
  ],
  about:
    "Palm Resort is a garden resort surrounded by greenery, with a swimming pool, barbecue evenings and open-air sitting areas. Stay in a cottage, a villa or a tent — every stay includes pool access and breakfast. Barbecue nights run on weekends; ask at booking to reserve a grill slot. Free cancellation up to 48 hours before check-in. Check-in from 2:00 PM, check-out by 12:00 noon.",
  contact: CONTACT,
  address: ADDRESS,
  hours: HOURS,
  priceNote: "Prices in Tk per night. Pool access & breakfast included. Free cancellation up to 48 hours before check-in.",
};

const BUSSERVICE: Partial<DemoSiteDef> = {
  agencyReworked: true,
  name: "Green Line",
  type: "Bus Service",
  logoEmoji: "🚌",
  accent: "#34d399",
  dark: true,
  heroTitle: "Safe journeys, across the country",
  heroSub: "AC coaches • Online tickets • Morning & night departures",
  heroEmoji: "🚌",
  cats: ["All", "AC Coach", "Business Class", "Sleeper"],
  products: [
    { id: "p0", n: "Dhaka-Chattogram", p: 800, e: "🚌", c: "AC Coach", desc: "AC coach, morning and night departures. Seat selection at booking. Per seat, one way.", rating: 4.7, reviews: 512, stock: 40 },
    { id: "p1", n: "Dhaka-Sylhet", p: 700, e: "🚍", c: "AC Coach", desc: "AC coach through the tea-garden route, morning and night departures. Per seat, one way.", rating: 4.7, reviews: 438, stock: 36 },
    { id: "p2", n: "Dhaka-Khulna", p: 650, e: "🚎", c: "AC Coach", desc: "AC coach, morning and night departures. Seat selection at booking. Per seat, one way.", rating: 4.6, reviews: 389, stock: 36 },
    { id: "p3", n: "Dhaka-Cox's Bazar", p: 1400, e: "🏖️", c: "AC Coach", desc: "AC coach to the beach, night departures with a rest stop. Per seat, one way. Price estimated.", rating: 4.8, reviews: 276, stock: 32 },
    { id: "p4", n: "Dhaka-Rajshahi", p: 800, e: "🚌", c: "AC Coach", desc: "AC coach, morning and afternoon departures. Per seat, one way. Price estimated.", rating: 4.7, reviews: 198, stock: 34 },
    { id: "p5", n: "Dhaka-Barisal", p: 600, e: "🚍", c: "AC Coach", desc: "AC coach, morning and night departures. Per seat, one way. Price estimated.", rating: 4.6, reviews: 167, stock: 36 },
    { id: "p6", n: "Dhaka-Chattogram Business Class", p: 1300, e: "💺", c: "Business Class", desc: "Wider business-class seats with extra legroom and a snack on board. Per seat, one way. Price estimated.", rating: 4.9, reviews: 143, stock: 20 },
    { id: "p7", n: "Dhaka-Khulna Business Class", p: 1100, e: "💺", c: "Business Class", desc: "Wider business-class seats with extra legroom. Per seat, one way. Price estimated.", rating: 4.8, reviews: 112, stock: 20 },
    { id: "p8", n: "Dhaka-Sylhet Sleeper", p: 1000, e: "🛏️", c: "Sleeper", desc: "Sleeper berths for overnight travel — lie flat and arrive rested. Per berth, one way. Price estimated.", rating: 4.7, reviews: 96, stock: 24 },
  ],
  about:
    "Green Line runs comfortable AC coaches from Dhaka to cities across Bangladesh. Book online, pick your seat, and travel with a printed or mobile ticket. Please arrive at the counter 30 minutes before departure; buses leave on time. Tickets are non-transferable — carry a photo ID matching the booking name. For date changes, contact us before departure; operator cancellation windows apply.",
  contact: CONTACT,
  address: ADDRESS,
  hours: HOURS,
  priceNote: "Prices in Tk per seat, one way. Arrive 30 minutes before departure.",
};

const CARRENTAL: Partial<DemoSiteDef> = {
  agencyReworked: true,
  name: "Rent A Car",
  type: "Car Rental",
  logoEmoji: "🚙",
  accent: "#94a3b8",
  dark: true,
  heroTitle: "A car with a driver, whenever you need it",
  heroSub: "Hourly & daily rates • Driver included • City & outstation trips",
  heroEmoji: "🚙",
  cats: ["All", "Daily Rental", "Hourly Rental", "Airport Transfer"],
  products: [
    { id: "p0", n: "Sedan (per day)", p: 3000, e: "🚗", c: "Daily Rental", desc: "Sedan with an experienced driver for a full day in the city. Fuel, tolls and parking are extra.", rating: 4.8, reviews: 342, stock: 8 },
    { id: "p1", n: "SUV (per day)", p: 5000, e: "🚙", c: "Daily Rental", desc: "SUV with a driver, ideal for family trips and rough roads. Fuel, tolls and parking are extra.", rating: 4.8, reviews: 256, stock: 6 },
    { id: "p2", n: "Micro (per day)", p: 4500, e: "🚐", c: "Daily Rental", desc: "Microbus with a driver for up to seven passengers — group trips and airport runs. Fuel, tolls and parking are extra.", rating: 4.7, reviews: 213, stock: 7 },
    { id: "p3", n: "Sedan (per hour)", p: 600, e: "🚗", c: "Hourly Rental", desc: "Sedan with a driver, charged by the hour. Minimum three hours. Fuel, tolls and parking are extra. Price estimated.", rating: 4.7, reviews: 148, stock: 10 },
    { id: "p4", n: "SUV (per hour)", p: 900, e: "🚙", c: "Hourly Rental", desc: "SUV with a driver, charged by the hour. Minimum three hours. Fuel, tolls and parking are extra. Price estimated.", rating: 4.8, reviews: 121, stock: 8 },
    { id: "p5", n: "Micro (per hour)", p: 800, e: "🚐", c: "Hourly Rental", desc: "Microbus with a driver, charged by the hour. Minimum three hours. Fuel, tolls and parking are extra. Price estimated.", rating: 4.7, reviews: 96, stock: 9 },
    { id: "p6", n: "Premium Sedan (per day)", p: 4500, e: "✨", c: "Daily Rental", desc: "Premium sedan with a driver for business meetings and events. Fuel, tolls and parking are extra. Price estimated.", rating: 4.9, reviews: 87, stock: 4 },
    { id: "p7", n: "Luxury SUV (per day)", p: 9000, e: "🌟", c: "Daily Rental", desc: "Luxury SUV with a professional driver for VIP guests and weddings. Fuel, tolls and parking are extra. Price estimated.", rating: 4.9, reviews: 64, stock: 3 },
    { id: "p8", n: "Airport Pickup (Sedan)", p: 2500, e: "✈️", c: "Airport Transfer", desc: "Meet-and-greet airport pickup in a sedan with a driver, including waiting time. Fuel and parking included. Price estimated.", rating: 4.8, reviews: 132, stock: 10 },
  ],
  about:
    "Rent A Car provides cars with experienced drivers for city trips, outstation travel, weddings and airport transfers. Every rental includes a driver; fuel, tolls, parking and the driver's meal allowance are charged separately unless a package states otherwise. Tell us your pickup point, date and return time when booking and we confirm the car and driver before your trip. Overtime is charged per hour after the booked period.",
  contact: CONTACT,
  address: ADDRESS,
  hours: HOURS,
  priceNote: "Prices in Tk. Driver included; fuel, tolls & parking extra unless stated.",
};

const TOURPACKAGE: Partial<DemoSiteDef> = {
  agencyReworked: true,
  name: "Bangladesh Wander Tours",
  type: "Tour Packages",
  logoEmoji: "🗺️",
  accent: "#2dd4bf",
  dark: true,
  heroTitle: "See Bangladesh, with everything arranged",
  heroSub: "Guide • Hotel • Food included • Day-by-day itineraries",
  heroEmoji: "🗺️",
  cats: ["All", "Beach", "Hills", "Nature"],
  products: [
    { id: "p0", n: "Cox's Bazar (3 days)", p: 9000, e: "🏖️", c: "Beach", desc: "Three days by the sea with a guide, hotel stay and meals. Beach, Himchari and Inani sightseeing included. Per person.", rating: 4.8, reviews: 421, stock: 20 },
    { id: "p1", n: "Sajek (2 days)", p: 13000, e: "🏔️", c: "Hills", desc: "Two days in the hill clouds with a guide, hillside hotel stay and meals. Sunrise viewpoints included. Per person.", rating: 4.9, reviews: 312, stock: 14 },
    { id: "p2", n: "Sylhet (3 days)", p: 11000, e: "🍃", c: "Nature", desc: "Three days of tea gardens, waterfalls and river views with a guide, hotel stay and meals. Per person.", rating: 4.8, reviews: 287, stock: 16 },
    { id: "p3", n: "Bandarban (3 days)", p: 12000, e: "🏔️", c: "Hills", desc: "Three days in the hills with a guide, hotel stay and meals. Nilachal and hill viewpoints included. Per person. Price estimated.", rating: 4.8, reviews: 176, stock: 14 },
    { id: "p4", n: "Rangamati (2 days)", p: 9500, e: "🚣", c: "Nature", desc: "Two days on Kaptai Lake with a guide, hotel stay and meals. Boat trip and hanging bridge included. Per person. Price estimated.", rating: 4.7, reviews: 143, stock: 16 },
    { id: "p5", n: "Kuakata (2 days)", p: 8500, e: "🌅", c: "Beach", desc: "Two days at the sea beach where you can watch sunrise and sunset, with a guide, hotel stay and meals. Per person. Price estimated.", rating: 4.7, reviews: 128, stock: 18 },
    { id: "p6", n: "Cox's Bazar (2 days)", p: 6500, e: "🏖️", c: "Beach", desc: "A short two-day beach break with a guide, hotel stay and meals. Beach and market sightseeing included. Per person. Price estimated.", rating: 4.7, reviews: 154, stock: 22 },
    { id: "p7", n: "Sajek (3 days)", p: 16000, e: "🏔️", c: "Hills", desc: "Three unhurried days in Sajek with a guide, hillside hotel stay and meals, plus a Khagrachari day trip. Per person. Price estimated.", rating: 4.9, reviews: 98, stock: 12 },
    { id: "p8", n: "Sundarbans (3 days)", p: 18000, e: "🐅", c: "Nature", desc: "Three days in the mangrove forest by boat with a guide, cabin stay and meals. Forest entry and boat included. Per person. Price estimated.", rating: 4.8, reviews: 87, stock: 10 },
  ],
  about:
    "Bangladesh Wander Tours runs guided group tours across Bangladesh. Every package includes transport, hotel stay, meals as per the itinerary, a local guide and sightseeing. Not included: personal expenses, tips for the guide and driver, and anything not listed in the itinerary. You receive a day-by-day itinerary after booking. Group departures need a minimum number of travellers; we confirm your departure before you pay the balance.",
  contact: CONTACT,
  address: ADDRESS,
  hours: HOURS,
  priceNote: "Prices in Tk per person. Guide, hotel & meals included; personal expenses excluded.",
};

const YOGA: Partial<DemoSiteDef> = {
  agencyReworked: true,
  name: "Serenity Yoga Centre",
  type: "Yoga Centre",
  logoEmoji: "🧘",
  accent: "#c084fc",
  dark: true,
  heroTitle: "Calm your mind, strengthen your body",
  heroSub: "Certified instructors • Meditation • All levels welcome",
  heroEmoji: "🧘",
  cats: ["All", "Memberships", "Classes", "Workshops"],
  products: [
    { id: "p0", n: "Monthly Membership", p: 1500, e: "🧘", c: "Memberships", desc: "Unlimited instructor-led classes for one month, morning and evening slots. Mats provided.", rating: 4.8, reviews: 342, stock: 30 },
    { id: "p1", n: "3 Months Membership", p: 4000, e: "🧘‍♀️", c: "Memberships", desc: "Unlimited instructor-led classes for three months. Build a steady practice with any instructor. Mats provided.", rating: 4.9, reviews: 256, stock: 24 },
    { id: "p2", n: "Yearly Membership", p: 12000, e: "🧘‍♂️", c: "Memberships", desc: "Unlimited instructor-led classes for a full year, plus workshop discounts. Mats provided.", rating: 4.9, reviews: 187, stock: 18 },
    { id: "p3", n: "Beginner Course (4 weeks)", p: 2000, e: "🌱", c: "Classes", desc: "Four progressive classes in order: sun salutations, standing postures, seated postures, then gentle backbends. No experience needed. Price estimated.", rating: 4.9, reviews: 143, stock: 20 },
    { id: "p4", n: "Drop-in Class", p: 400, e: "🎟️", c: "Classes", desc: "A single instructor-led class. Perfect for trying yoga for the first time — mats and props provided. Price estimated.", rating: 4.7, reviews: 198, stock: 25 },
    { id: "p5", n: "Hatha Yoga Class Pack (8 classes)", p: 2800, e: "🕉️", c: "Classes", desc: "Eight instructor-led Hatha classes to use within two months, any slot. Mats provided. Price estimated.", rating: 4.8, reviews: 112, stock: 20 },
    { id: "p6", n: "Meditation & Pranayama (monthly)", p: 1800, e: "🧘‍♀️", c: "Classes", desc: "Monthly breathing and meditation sessions with an instructor, morning slots. No experience needed. Price estimated.", rating: 4.8, reviews: 96, stock: 22 },
    { id: "p7", n: "Prenatal Yoga (monthly)", p: 2500, e: "🤰", c: "Classes", desc: "Gentle instructor-led prenatal classes for expecting mothers, with posture modifications. Doctor's clearance requested. Price estimated.", rating: 4.9, reviews: 74, stock: 12 },
    { id: "p8", n: "Weekend Workshop", p: 1200, e: "🎪", c: "Workshops", desc: "A half-day weekend workshop on one theme: flexibility, back care or deep relaxation. Mats provided. Price estimated.", rating: 4.8, reviews: 83, stock: 15 },
  ],
  about:
    "Serenity Yoga Centre is a yoga studio in Dhanmondi, Dhaka. All classes are instructor-led in small groups, with mats and props provided — just bring comfortable clothes. Beginners are fully welcome: you do not need to be flexible or experienced, and instructors offer posture modifications for every level. Book a drop-in class to try us, join the four-week beginner course to learn the foundations, or take a membership for unlimited classes.",
  contact: CONTACT,
  address: ADDRESS,
  hours: HOURS,
  priceNote: "Prices in Tk. Mats & props provided. Beginners welcome — no experience needed.",
};

const ARTIST: Partial<DemoSiteDef> = {
  agencyReworked: true,
  name: "Colour Touch Art Studio",
  type: "Painter & Artist Portfolio",
  logoEmoji: "🎨",
  accent: "#fb923c",
  dark: true,
  heroTitle: "Paintings made by hand, one canvas at a time",
  heroSub: "Selected works • Commissions open",
  heroEmoji: "🎨",
  cats: ["All", "Landscapes", "Portraits", "Abstract", "Village Life"],
  gallery: [
    { id: "g0", e: "🌅", t: "Sunset", c: "Landscapes" },
    { id: "g1", e: "🏡", t: "Village Bengal", c: "Village Life" },
    { id: "g2", e: "🖼️", t: "Portrait Study", c: "Portraits" },
    { id: "g3", e: "🌳", t: "Nature", c: "Landscapes" },
    { id: "g4", e: "🌀", t: "Abstract", c: "Abstract" },
    { id: "g5", e: "🌊", t: "River", c: "Landscapes" },
    { id: "g6", e: "🌾", t: "Harvest Field", c: "Village Life" },
    { id: "g7", e: "🌆", t: "City Light Study", c: "Abstract" },
  ],
  about:
    "Colour Touch Art Studio is a painter's portfolio and studio in Dhanmondi, Dhaka. Browse the selected works by series — landscapes, village life, portraits and abstract — and commission a custom portrait or painting of your own. Commission open: message with your reference photo, preferred size and timeline, and the price is confirmed before any work starts. Every painting is made by hand; no two commissions are alike.",
  contact: CONTACT,
  address: ADDRESS,
  hours: HOURS,
};

const INTERIOR: Partial<DemoSiteDef> = {
  agencyReworked: true,
  name: "Dream Home Interiors",
  type: "Interior Design Studio",
  logoEmoji: "🛋️",
  accent: "#fbbf24",
  dark: true,
  heroTitle: "Rooms designed around the way you live",
  heroSub: "3D visuals • Turnkey projects • Free consultation",
  heroEmoji: "🛋️",
  cats: ["All", "Living Spaces", "Bedrooms", "Kitchens", "Workspaces", "Outdoor"],
  gallery: [
    { id: "g0", e: "🛋️", t: "Living Room", c: "Living Spaces" },
    { id: "g1", e: "🛏️", t: "Bedroom", c: "Bedrooms" },
    { id: "g2", e: "🍳", t: "Kitchen", c: "Kitchens" },
    { id: "g3", e: "🏢", t: "Office", c: "Workspaces" },
    { id: "g4", e: "🚿", t: "Bathroom", c: "Living Spaces" },
    { id: "g5", e: "🌿", t: "Balcony", c: "Outdoor" },
    { id: "g6", e: "🍽️", t: "Dining Room", c: "Living Spaces" },
    { id: "g7", e: "🧸", t: "Kids Room", c: "Bedrooms" },
  ],
  about:
    "Dream Home Interiors is an interior design studio in Dhanmondi, Dhaka, working on homes and offices. Browse the selected projects by room, then book a free consultation to talk through your space, your budget and your timeline. The studio shows a 3D design before work starts, so you can see the room before it is built, and turnkey projects are handed over finished — design, furniture and fitting included. Final prices are confirmed after the site visit and the 3D design.",
  contact: CONTACT,
  address: ADDRESS,
  hours: HOURS,
};

const ARCHITECT: Partial<DemoSiteDef> = {
  agencyReworked: true,
  name: "Sthapati Architects",
  type: "Architecture Firm",
  logoEmoji: "🏛️",
  accent: "#a8a29e",
  dark: true,
  heroTitle: "Buildings designed for the people who use them",
  heroSub: "Selected projects • Homes, workplaces and public spaces",
  heroEmoji: "🏛️",
  cats: ["All", "Residential", "Commercial", "Public & Institutional", "Hospitality"],
  gallery: [
    { id: "g0", e: "🏠", t: "Duplex House", c: "Residential" },
    { id: "g1", e: "🏢", t: "Apartment Building", c: "Residential" },
    { id: "g2", e: "🕌", t: "Mosque", c: "Public & Institutional" },
    { id: "g3", e: "🏫", t: "School", c: "Public & Institutional" },
    { id: "g4", e: "🏝️", t: "Resort", c: "Hospitality" },
    { id: "g5", e: "🏬", t: "Shopping Mall", c: "Commercial" },
    { id: "g6", e: "🏡", t: "Family Villa", c: "Residential" },
    { id: "g7", e: "🏙️", t: "Office Tower", c: "Commercial" },
  ],
  about:
    "Sthapati Architects is an architecture firm in Dhanmondi, Dhaka, designing homes, workplaces and public buildings. Browse the selected projects by sector, then book a consultation to discuss your plot, your brief and your budget. Services include architectural design, working drawings, interior coordination and approval support — approval support means the firm prepares and submits the drawings and follows up with the authority; approval itself is decided by the authority and is never guaranteed. Fees and timelines are confirmed after the first site visit.",
  contact: CONTACT,
  address: ADDRESS,
  hours: HOURS,
};

const MAKEUPARTIST: Partial<DemoSiteDef> = {
  agencyReworked: true,
  name: "Sajgoj Makeup Studio",
  type: "Makeup Artist Portfolio",
  logoEmoji: "💋",
  accent: "#f472b6",
  dark: true,
  heroTitle: "Looks made for your day, not just for the camera",
  heroSub: "Bridal specialist • Premium products • Home service",
  heroEmoji: "💋",
  cats: ["All", "Bridal", "Party", "Traditional", "Natural", "Photoshoot"],
  gallery: [
    { id: "g0", e: "👰", t: "Bridal Look", c: "Bridal" },
    { id: "g1", e: "💃", t: "Party Look", c: "Party" },
    { id: "g2", e: "💛", t: "Holud Look", c: "Traditional" },
    { id: "g3", e: "🥻", t: "Saree Look", c: "Traditional" },
    { id: "g4", e: "🌿", t: "Natural Look", c: "Natural" },
    { id: "g5", e: "📸", t: "Photoshoot Look", c: "Photoshoot" },
    { id: "g6", e: "💍", t: "Engagement Look", c: "Bridal" },
    { id: "g7", e: "✨", t: "Reception Look", c: "Party" },
  ],
  about:
    "Sajgoj Makeup Studio is a makeup artist portfolio and booking page in Dhanmondi, Dhaka, covering bridal, party, holud, engagement and photoshoot looks, with home service available. A trial session is available before a bridal booking: try the look, check it in daylight and in photos, and confirm or adjust it before the wedding day. Share your event date, venue and outfit when you message, and the final price and schedule are confirmed before booking.",
  contact: CONTACT,
  address: ADDRESS,
  hours: HOURS,
};

/* ---------------- Phase 4: news + invest + exchange + wallet (7 demos) ---------------- */
/* Drafts: ~/workspace/phase4-news-invest-drafts/draft.ts (news, investpro, agroinvest)
 * and ~/workspace/phase4-exchange-wallet-drafts/draft.ts (swiftex, payex, cryptovault,
 * trustpay). Research URLs are in those draft headers. All figures are demo figures
 * only — invest/exchange/wallet about texts state this is not a real offer and
 * returns/rates are not guaranteed or live. News articles are generic placeholder
 * summaries, not reports of real events. InvestHome stat tiles in fintech-pages.tsx
 * were neutralised in Phase 4 (no invented investor counts or profit totals). */

const NEWS: Partial<DemoSiteDef> = {
  agencyReworked: true,
  name: "Dhaka News 24",
  type: "News Portal",
  logoEmoji: "📰",
  accent: "#ef4444",
  dark: false,
  grad: "from-red-600 to-rose-700",
  heroTitle: "Latest news, first",
  heroSub: "Live updates around the clock • National, sports, technology and business",
  heroEmoji: "📰",
  cats: ["All", "Sports", "Technology", "National", "Business"],
  news: [
    {
      id: "a0",
      t: "Historic win for the national cricket team",
      e: "🏏",
      c: "Sports",
      time: "2 hours ago",
      body: "The national cricket team closed out a memorable match with a win that supporters will be talking about for a long time. The result capped a strong all-round performance from the side. Attention now turns to the next fixture and what this win means for the season ahead.",
    },
    {
      id: "a1",
      t: "New technology park opens its doors",
      e: "💻",
      c: "Technology",
      time: "5 hours ago",
      body: "A new technology park has opened, offering workspace and shared facilities for startups and established firms alike. Organisers say the site is designed to bring developers, designers and founders together under one roof. More tenants are expected to move in over the coming months.",
    },
    {
      id: "a2",
      t: "River bridge sets a new daily crossing record",
      e: "🏛️",
      c: "National",
      time: "8 hours ago",
      body: "A major river bridge has recorded its busiest day yet, with crossings passing the previous daily high. Officials link the rise to smoother traffic flow and growing travel between the two banks. Commuters say the crossing has become noticeably quicker at peak hours.",
    },
    {
      id: "a3",
      t: "National football team earns a welcome win",
      e: "⚽",
      c: "Sports",
      time: "10 hours ago",
      body: "The national football team picked up a welcome win after a hard-fought match. The side held its shape under late pressure to see the game out. Fans will hope the result builds momentum for the matches still to come.",
    },
    {
      id: "a4",
      t: "Fifth-generation mobile service expands to more areas",
      e: "📱",
      c: "Technology",
      time: "12 hours ago",
      body: "Fifth-generation mobile service is being extended to more areas, bringing faster connections to new neighbourhoods. Providers say the rollout focuses on busy urban zones first. Users in the new coverage areas should see improved speeds for video, calls and downloads.",
    },
    {
      id: "a5",
      t: "New opportunities open up in agriculture",
      e: "🌾",
      c: "National",
      time: "14 hours ago",
      body: "New opportunities are opening up in agriculture as farmers try fresh crops, better storage and direct routes to buyers. Extension workers say small changes in timing and handling can make a real difference to income. The season ahead will show how widely the new approaches are taken up.",
    },
    {
      id: "a6",
      t: "Small businesses find new customers online",
      e: "💼",
      c: "Business",
      time: "16 hours ago",
      body: "Demo article: small businesses are reaching new customers through online shops, social pages and home delivery. Owners say a simple online listing can bring in orders from well beyond their own neighbourhood. The shift is also pushing shops to improve photos, prices and packaging.",
    },
    {
      id: "a7",
      t: "Local startups showcase new digital tools",
      e: "🤖",
      c: "Technology",
      time: "18 hours ago",
      body: "Demo article: local startups have showcased a range of new digital tools, from budgeting apps to classroom platforms. Visitors tried the demos and spoke with the teams behind them. Several founders said early feedback will shape the next version of their products.",
    },
    {
      id: "a8",
      t: "Markets steady as traders watch the week ahead",
      e: "📈",
      c: "Business",
      time: "20 hours ago",
      body: "Demo article: markets held steady as traders weighed the week ahead. Activity was calm, with buyers and sellers waiting for clearer signals before making big moves. Analysts in this demo story expect attention to stay on the broader economic picture.",
    },
    {
      id: "a9",
      t: "Community health camps bring care closer to home",
      e: "🏥",
      c: "National",
      time: "22 hours ago",
      body: "Demo article: community health camps are bringing basic checkups and advice closer to home for residents. Visitors can have routine measurements taken and ask questions about everyday health. Organisers say the camps work best when they return to the same area regularly.",
    },
  ],
  about:
    "Dhaka News 24 is a demo news portal covering national news, sports, technology and business, with a breaking-news strip and category browsing. All articles on this demo site are sample placeholder content written to show the layout — they are not reports of real events. A real portal would publish its own verified reporting here, with author names, photos and publication times.",
  contact: CONTACT,
  address: ADDRESS,
  hours: HOURS,
};

const INVESTPRO: Partial<DemoSiteDef> = {
  agencyReworked: true,
  name: "InvestPro",
  type: "Investment Platform",
  logoEmoji: "📈",
  accent: "#10b981",
  dark: true,
  grad: "from-emerald-600 to-teal-800",
  heroTitle: "Grow your money with smart investing",
  heroSub: "Tiered plans • Illustrative daily returns • Flexible terms",
  heroEmoji: "📈",
  cats: ["All"],
  theme: "bold",
  investPlans: [
    { id: "starter", n: "Starter Plan", e: "🌱", min: 1000, max: 9999, roi: 8, dailyRoi: 0.27, duration: "30 days", desc: "For beginners — start with lower risk.", tag: "Popular" },
    { id: "growth", n: "Growth Plan", e: "🚀", min: 10000, max: 99999, roi: 12, dailyRoi: 0.4, duration: "60 days", desc: "More return for a mid-range budget.", tag: "Best value" },
    { id: "premium", n: "Premium Plan", e: "💎", min: 100000, max: 1000000, roi: 18, dailyRoi: 0.6, duration: "90 days", desc: "The highest return illustration for larger budgets." },
    { id: "flexi", n: "Flexi Savings", e: "🪙", min: 500, max: 50000, roi: 5, dailyRoi: 0.17, duration: "Anytime", desc: "Withdraw anytime — flexible saving." },
    { id: "wealth", n: "Wealth Builder Plan", e: "📊", min: 50000, max: 500000, roi: 15, dailyRoi: 0.5, duration: "120 days", desc: "Demo figures only: a longer mid-to-large tier illustration for the plan grid.", tag: "Demo figures" },
    { id: "short", n: "Short Saver Plan", e: "⏱️", min: 1000, max: 20000, roi: 6, dailyRoi: 0.2, duration: "15 days", desc: "Demo figures only: a short-term tier illustration for smaller budgets.", tag: "Demo figures" },
  ],
  about:
    "InvestPro is a demo investment platform layout with tiered plans, a plan detail view and a demo dashboard. All plan figures on this demo are illustrative figures for layout only — this is not a real investment offer, returns are not guaranteed, and no money is actually invested here. A real platform would publish its own verified terms, risks and regulatory information.",
  contact: CONTACT,
  address: ADDRESS,
  hours: HOURS,
  priceNote: "Prices in Tk. All plan figures are demo figures only — not a real investment offer and not guaranteed returns.",
};

const AGROINVEST: Partial<DemoSiteDef> = {
  agencyReworked: true,
  name: "AgroInvest",
  type: "Agricultural Investment",
  logoEmoji: "🌾",
  accent: "#84cc16",
  dark: false,
  grad: "from-lime-600 to-green-700",
  heroTitle: "Invest in farming, grow with nature",
  heroSub: "Paddy, fish and dairy — invest directly in farm projects (demo figures only)",
  heroEmoji: "🌾",
  cats: ["All"],
  theme: "elegant",
  investPlans: [
    { id: "paddy", n: "Paddy Farming Project", e: "🌾", min: 5000, max: 50000, roi: 15, dailyRoi: 0.42, duration: "4 months", desc: "Join the Boro season paddy farming cycle.", tag: "Seasonal" },
    { id: "fish", n: "Fish Farm", e: "🐟", min: 10000, max: 200000, roi: 20, dailyRoi: 0.55, duration: "6 months", desc: "Pangasius and tilapia farming project.", tag: "Popular" },
    { id: "dairy", n: "Dairy Farm", e: "🐄", min: 20000, max: 500000, roi: 22, dailyRoi: 0.61, duration: "12 months", desc: "Long-term investment in cow rearing." },
    { id: "poultry", n: "Poultry Farm Project", e: "🐓", min: 8000, max: 150000, roi: 18, dailyRoi: 0.5, duration: "5 months", desc: "Demo figures only: a layer and broiler rearing cycle illustration.", tag: "Demo figures" },
    { id: "vegetable", n: "Vegetable Greenhouse Project", e: "🥬", min: 15000, max: 300000, roi: 16, dailyRoi: 0.44, duration: "6 months", desc: "Demo figures only: a greenhouse vegetable growing cycle illustration.", tag: "Demo figures" },
  ],
  about:
    "AgroInvest is a demo agricultural investment layout listing farm projects by sector — paddy, fish, dairy, poultry and greenhouse vegetables — with a plan detail view and a demo dashboard. All project figures on this demo are illustrative figures for layout only — this is not a real investment offer, returns are not guaranteed, and no money is actually invested here. A real platform would publish its own verified farm details, risks and payout terms.",
  contact: CONTACT,
  address: ADDRESS,
  hours: HOURS,
  priceNote: "Prices in Tk. All project figures are demo figures only — not a real investment offer and not guaranteed returns.",
};

const SWIFTEX: Partial<DemoSiteDef> = {
  agencyReworked: true,
  name: "SwiftEx",
  type: "Currency Exchange",
  logoEmoji: "💱",
  accent: "#3b82f6",
  dark: true,
  grad: "from-blue-600 to-indigo-800",
  theme: "split",
  heroTitle: "Every currency, one platform",
  heroSub: "US dollars, euros, pounds and crypto — compare demo rates side by side",
  heroEmoji: "💱",
  cats: ["All"],
  rates: [
    { code: "USD", name: "US Dollar", buy: 121.5, sell: 119.8, e: "💵", change: 0.3 },
    { code: "EUR", name: "Euro", buy: 131.2, sell: 129.4, e: "💶", change: -0.2 },
    { code: "GBP", name: "British Pound", buy: 153.8, sell: 151.5, e: "💷", change: 0.5 },
    { code: "BTC", name: "Bitcoin", buy: 8150000, sell: 7980000, e: "₿", change: 2.4 },
    { code: "ETH", name: "Ethereum", buy: 385000, sell: 372000, e: "Ξ", change: 1.8 },
    { code: "USDT", name: "Tether", buy: 122.0, sell: 120.5, e: "₮", change: 0.1 },
    { code: "AUD", name: "Australian Dollar (demo rate)", buy: 79.5, sell: 77.8, e: "🇦🇺", change: 0.2 },
    { code: "CAD", name: "Canadian Dollar (demo rate)", buy: 87.0, sell: 85.4, e: "🇨🇦", change: -0.1 },
    { code: "SGD", name: "Singapore Dollar (demo rate)", buy: 91.5, sell: 89.8, e: "🇸🇬", change: 0.4 },
  ],
  about:
    "SwiftEx is a currency exchange demo in Dhanmondi, Dhaka. Pick a currency, enter an amount, and see the converted figure in the demo calculator before anything is confirmed — the same converter-first layout used by real exchange platforms. All rates shown here are demo figures for layout only: they are not live market rates, and this is not a real exchange service, so no real money moves here. The Australian dollar, Canadian dollar and Singapore dollar rows are added demo rates, shown only to fill out the rate table.",
  contact: CONTACT,
  address: ADDRESS,
  hours: HOURS,
  priceNote: "Rates shown are demo figures for layout only — not live market rates.",
};

const PAYEX: Partial<DemoSiteDef> = {
  agencyReworked: true,
  name: "PayEx",
  type: "Mobile Banking Exchange",
  logoEmoji: "📲",
  accent: "#f59e0b",
  dark: false,
  grad: "from-amber-500 to-orange-600",
  theme: "playful",
  heroTitle: "Move money between mobile wallets",
  heroSub: "bKash, Nagad, Rocket and more — one simple exchange layout",
  heroEmoji: "📲",
  cats: ["All"],
  rates: [
    { code: "BKASH", name: "bKash", buy: 100, sell: 98, e: "🩷", change: 0 },
    { code: "NAGAD", name: "Nagad", buy: 100, sell: 98.2, e: "🧡", change: 0 },
    { code: "ROCKET", name: "Rocket", buy: 100, sell: 97.8, e: "💜", change: 0 },
    { code: "UPAY", name: "Upay", buy: 100, sell: 98.1, e: "💚", change: 0 },
    { code: "SURECASH", name: "SureCash (demo rate)", buy: 100, sell: 98.4, e: "💛", change: 0 },
    { code: "BANK", name: "Bank Transfer (demo rate)", buy: 100, sell: 99.0, e: "🏦", change: 0 },
  ],
  about:
    "PayEx is a mobile banking exchange demo in Dhanmondi, Dhaka. Pick a from-wallet and a to-wallet, enter an amount, review the details and confirm — the same step order as a real send-money flow. All figures shown here are demo figures for layout only: they are not live rates, and this is not a real exchange service, so no real money moves between any wallet here. The SureCash and Bank Transfer rows are added demo rates, shown only to fill out the method list.",
  contact: CONTACT,
  address: ADDRESS,
  hours: HOURS,
  priceNote: "Figures shown are demo figures for layout only — no real money moves here.",
};

const CRYPTOVAULT: Partial<DemoSiteDef> = {
  agencyReworked: true,
  name: "CryptoVault",
  type: "Crypto Wallet",
  logoEmoji: "🔐",
  accent: "#8b5cf6",
  dark: true,
  grad: "from-violet-600 to-purple-800",
  theme: "aurora",
  heroTitle: "Your crypto, kept safe in one place",
  heroSub: "Bitcoin, Ethereum and more — send, receive and track in this demo wallet",
  heroEmoji: "🔐",
  cats: ["All"],
  coins: [
    { code: "BTC", name: "Bitcoin", price: 67250, change: 2.4, e: "₿" },
    { code: "ETH", name: "Ethereum", price: 3150, change: 1.8, e: "Ξ" },
    { code: "USDT", name: "Tether", price: 1.0, change: 0.1, e: "₮" },
    { code: "BNB", name: "Binance Coin", price: 585, change: -0.8, e: "🟡" },
    { code: "XRP", name: "Ripple (demo price)", price: 2.35, change: 0.9, e: "💧" },
    { code: "ADA", name: "Cardano (demo price)", price: 0.45, change: 1.2, e: "🔷" },
    { code: "DOGE", name: "Dogecoin (demo price)", price: 0.16, change: -1.5, e: "🐶" },
  ],
  about:
    "CryptoVault is a crypto wallet demo in Dhanmondi, Dhaka. The demo layout shows a portfolio view with send, receive and swap tabs, plus a safety note about backing up a recovery phrase and locking the app with a PIN — the same framing real wallet apps use. All prices shown here are demo figures for layout only: they are not live market prices, and this is not a real wallet service, so no real coins are held or moved here. The Ripple, Cardano and Dogecoin rows are added demo prices, shown only to fill out the coin list.",
  contact: CONTACT,
  address: ADDRESS,
  hours: HOURS,
  priceNote: "Prices shown are demo figures for layout only — not live market prices.",
};

const TRUSTPAY: Partial<DemoSiteDef> = {
  agencyReworked: true,
  name: "TrustPay",
  type: "Multi-Coin Wallet",
  logoEmoji: "🛡️",
  accent: "#0ea5e9",
  dark: true,
  grad: "from-sky-600 to-blue-800",
  theme: "minimal",
  heroTitle: "Every coin, one wallet",
  heroSub: "Swap, stake and browse apps — all in one demo wallet layout",
  heroEmoji: "🛡️",
  cats: ["All"],
  coins: [
    { code: "BTC", name: "Bitcoin", price: 67250, change: 2.4, e: "₿" },
    { code: "ETH", name: "Ethereum", price: 3150, change: 1.8, e: "Ξ" },
    { code: "USDT", name: "Tether", price: 1.0, change: 0.1, e: "₮" },
    { code: "BNB", name: "Binance Coin", price: 585, change: -0.8, e: "🟡" },
    { code: "SOL", name: "Solana", price: 142, change: 3.2, e: "◎" },
    { code: "TRX", name: "Tron", price: 0.12, change: 0.8, e: "🔺" },
    { code: "ADA", name: "Cardano (demo price)", price: 0.45, change: 1.2, e: "🔷" },
    { code: "DOGE", name: "Dogecoin (demo price)", price: 0.16, change: -1.5, e: "🐶" },
  ],
  about:
    "TrustPay is a multi-coin wallet demo in Dhanmondi, Dhaka. The demo layout holds several coins on one screen, with swap and staking tabs and a simple app browser — the same feature grouping real multi-coin wallets use, kept minimal. All prices shown here are demo figures for layout only: they are not live market prices, and this is not a real wallet service, so no real coins are held or moved here. The Cardano and Dogecoin rows are added demo prices, shown only to fill out the coin list.",
  contact: CONTACT,
  address: ADDRESS,
  hours: HOURS,
  priceNote: "Prices shown are demo figures for layout only — not live market prices.",
};

/* ------------------------------------------------------------------ */
/* Phase 6 — CASINOPLAY + PLYRATRADE (crypto-exchange).               */
/* Casino: English brand/hero/about, demo-only + virtual-credits      */
/* framing, owner RTP/min/max-bet control kept (see AgencyDemoAdmin  */
/* "Casino controls" card). The casino page renderers themselves     */
/* (casino-data/games/sports/catalog/account) still carry Bangla     */
/* strings — full renderer conversion is a Phase 7 item, so this      */
/* demo must NOT be described as fully English yet.                   */
/* Exchange: the old displayed name evoked the real Binance brand,    */
/* so the displayed brand is renamed to the neutral invented name     */
/* "PlyraTrade" (derived from the agency's own DigiPlyra brand; a     */
/* web search found no exact "PlyraTrade" exchange or token, though   */
/* full trademark clearance was not verified). The worker-proposed    */
/* "NovaTrade" was REJECTED at merge time: a search found a real      */
/* NovaTrade (NOVA) / NovaTrade RWA (NRWA) crypto project listed on  */
/* MEXC, so that name would have traded one collision for another.   */
/* Route slug stays "binancepro" — routes are not renamed here.       */
/* Coin figures: def originals BTC/ETH/BNB/SOL kept; TRX comes from   */
/* the trading engine (cex-shared CEX_COINS), not from defs.ts; the   */
/* added USDT/XRP/ADA/DOGE rows reuse the trading engine's demo       */
/* figures exactly and are flagged "(demo price)" in their name.      */
/* ------------------------------------------------------------------ */
const CASINOPLAY: Partial<DemoSiteDef> = {
  agencyReworked: true,
  name: "CasinoPlay",
  type: "Casino & Sports Betting",
  logoEmoji: "🎰",
  accent: "#f5c518",
  dark: true,
  grad: "from-amber-600 to-yellow-800",
  heroTitle: "A casino and sportsbook demo — play with virtual credits",
  heroSub: "Slots • Live casino • Table games • Desi games • Crash games • Sportsbook — demo only, no real money",
  heroEmoji: "🎰",
  cats: ["All"],
  theme: "bold",
  about:
    "CasinoPlay is a demo website built to show what a casino and sports-betting site looks like. Every balance, bet, win, promotion and VIP reward on this demo is virtual: no real money is deposited, withdrawn, won or paid out here, and nothing on this site is a real betting or gambling service. Play responsibly and for fun only — this demo is intended for visitors aged 18 and over. The site owner controls the demo's payout setting (RTP) and the minimum and maximum bet from the admin panel; a lower RTP means a higher house edge on average over a very large number of rounds, and it never guarantees the result of any single game. A real casino or sportsbook would need its own licence, verified payment providers, real odds providers and responsible-gaming tools before accepting any real player.",
  contact: CONTACT,
  address: ADDRESS,
  hours: HOURS,
  priceNote: "Demo only: all balances and bets are virtual credits. No real money is deposited, withdrawn or paid out.",
};

const PLYRATRADE: Partial<DemoSiteDef> = {
  agencyReworked: true,
  name: "PlyraTrade",
  type: "Crypto Exchange",
  logoEmoji: "🟡",
  accent: "#f0b90b",
  dark: true,
  grad: "from-yellow-600 to-amber-800",
  theme: "aurora",
  heroTitle: "Trade crypto in this demo exchange",
  heroSub: "Spot, futures, P2P and convert layouts — every figure on this page is a demo figure only",
  heroEmoji: "₿",
  cats: ["All"],
  coins: [
    { code: "BTC", name: "Bitcoin", price: 97400, change: 2.4, e: "₿" },
    { code: "ETH", name: "Ethereum", price: 3420, change: 1.8, e: "Ξ" },
    { code: "BNB", name: "BNB", price: 692, change: -0.8, e: "🟡" },
    { code: "SOL", name: "Solana", price: 214, change: 5.2, e: "◎" },
    { code: "TRX", name: "Tron", price: 0.27, change: 1.5, e: "🔱" },
    { code: "USDT", name: "Tether (demo price)", price: 1.0, change: 0.01, e: "₮" },
    { code: "XRP", name: "Ripple (demo price)", price: 2.35, change: 3.1, e: "✕" },
    { code: "ADA", name: "Cardano (demo price)", price: 0.98, change: 0.7, e: "₳" },
    { code: "DOGE", name: "Dogecoin (demo price)", price: 0.32, change: -1.2, e: "Ð" },
  ],
  about:
    "PlyraTrade is a crypto exchange demo in Dhanmondi, Dhaka. This is a demo exchange only: all coins, prices and balances shown here are demo figures for layout purposes, no real crypto is held or traded, and there are no real deposits or withdrawals. The figures are not live market prices and this page is not a real trading service. Browse the demo markets list, try a demo spot order with a chart and order book, explore demo futures, P2P and convert layouts, and check the demo spot, futures and funding wallets. The Tether, Ripple, Cardano and Dogecoin rows are added demo prices, shown only to fill out the coin list, and they match the demo figures already used by the trading screens.",
  contact: CONTACT,
  address: ADDRESS,
  hours: HOURS,
  priceNote: "All prices are demo figures for layout only — not live market prices.",
};


/* ------------------------------------------------------------------ */
/* RESTAURANT (slug: restaurant, layout: shop)                         */
/* Original def (defs.ts): name "Swader Thikana", type "Restaurant     */
/* Website", logo/hero 🍔, accent #fb923c, dark true, cats All/Pizza/  */
/* Burger/Dessert. Original items (kept at original prices): Chicken   */
/* Pizza 350, Beef Burger 220, Chocolate Cake 450, Veggie Pizza 300,    */
/* Cheese Burger 250, Ice Cream 150. Four new items added, flagged.    */
/* ------------------------------------------------------------------ */
const RESTAURANT: Partial<DemoSiteDef> = {
  agencyReworked: true,
  name: "Taste Address",
  type: "Restaurant",
  logoEmoji: "🍔",
  accent: "#fb923c",
  dark: true,
  heroTitle: "Restaurant taste, delivered to your home",
  heroSub: "Freshly cooked • Home delivery in Dhaka • Dine in or take away",
  heroEmoji: "🍔",
  cats: ["All", "Pizza", "Burger", "Dessert"],
  products: [
    { id: "p0", n: "Chicken Pizza", p: 350, e: "🍕", c: "Pizza", desc: "Oven-baked pizza with spiced chicken, cheese and a crisp base. Serves one generously.", rating: 4.8, reviews: 412, stock: 30 },
    { id: "p1", n: "Beef Burger", p: 220, e: "🍔", c: "Burger", desc: "Grilled beef patty, salad and sauce in a soft toasted bun. Served with fries on request.", rating: 4.7, reviews: 356, stock: 36 },
    { id: "p2", n: "Chocolate Cake", p: 450, e: "🍰", c: "Dessert", desc: "Rich chocolate cake, baked fresh daily. Order a day ahead for a custom message.", rating: 4.9, reviews: 298, stock: 12 },
    { id: "p3", n: "Veggie Pizza", p: 300, e: "🍕", c: "Pizza", desc: "Garden vegetables, cheese and tomato sauce on a crisp base. A lighter pizza choice.", rating: 4.7, reviews: 243, stock: 28 },
    { id: "p4", n: "Cheese Burger", p: 250, e: "🍔", c: "Burger", desc: "Beef patty with melted cheese, salad and house sauce in a toasted bun.", rating: 4.8, reviews: 301, stock: 32 },
    { id: "p5", n: "Ice Cream", p: 150, e: "🍨", c: "Dessert", desc: "Creamy ice cream, served chilled. Ask in store for today's flavours.", rating: 4.8, reviews: 267, stock: 40 },
    { id: "p6", n: "BBQ Chicken Pizza", p: 420, e: "🍕", c: "Pizza", desc: "Smoky barbecue chicken, onion and cheese on a crisp base. New item - price estimated.", rating: 4.8, reviews: 96, stock: 20 },
    { id: "p7", n: "Grilled Chicken Burger", p: 280, e: "🍔", c: "Burger", desc: "Grilled chicken fillet, salad and garlic sauce in a toasted bun. New item - price estimated.", rating: 4.7, reviews: 88, stock: 26 },
    { id: "p8", n: "Chocolate Brownie", p: 180, e: "🍫", c: "Dessert", desc: "Warm, fudgy chocolate brownie, baked in small batches. New item - price estimated.", rating: 4.9, reviews: 74, stock: 24 },
    { id: "p9", n: "Fruit Custard", p: 200, e: "🍮", c: "Dessert", desc: "Chilled custard with seasonal fruit. A light finish to any meal. New item - price estimated.", rating: 4.7, reviews: 63, stock: 18 },
  ],
  about:
    "Taste Address is a neighbourhood restaurant in Dhanmondi, Dhaka. This is a demo website: browse the menu, build a demo order and try the checkout flow, but no real order is placed and no real food is delivered. The menu is grouped by pizza, burger and dessert, with home delivery and takeaway shown as the demo fulfilment options. A real restaurant using this layout would connect its own kitchen, delivery team and payment handling before taking live orders.",
  contact: CONTACT,
  address: ADDRESS,
  hours: HOURS,
  priceNote: "Prices in Tk. Demo website - no real orders are placed here.",
};

/* ------------------------------------------------------------------ */
/* FASHION (slug: fashion, layout: shop)                               */
/* Original def (defs.ts): name "Style Hub", type "Fashion             */
/* E-Commerce", logo/hero 👗, accent #db2777, dark false, cats All/    */
/* Saree/Panjabi/Shoes. Original items (kept at original prices):     */
/* Jamdani Saree 2500, Silk Saree 1800, Cotton Panjabi 1200, Slim       */
/* Panjabi 1500, Sneakers 2200, Loafer 1900. Four new items added.     */
/* ------------------------------------------------------------------ */
const FASHION: Partial<DemoSiteDef> = {
  agencyReworked: true,
  name: "Style Hub",
  type: "Fashion E-Commerce",
  logoEmoji: "👗",
  accent: "#db2777",
  dark: false,
  heroTitle: "Festive fashion, everyday prices",
  heroSub: "Sarees • Panjabis • Shoes • Cash on delivery across Bangladesh",
  heroEmoji: "👗",
  cats: ["All", "Saree", "Panjabi", "Shoes"],
  products: [
    { id: "p0", n: "Jamdani Saree", p: 2500, e: "🥻", c: "Saree", desc: "Handwoven jamdani saree with a traditional motif. Blouse piece included.", rating: 4.9, reviews: 432, stock: 14 },
    { id: "p1", n: "Silk Saree", p: 1800, e: "👘", c: "Saree", desc: "Smooth silk saree with a soft shine, for weddings and festive occasions.", rating: 4.8, reviews: 287, stock: 18 },
    { id: "p2", n: "Cotton Panjabi", p: 1200, e: "👔", c: "Panjabi", desc: "Breathable cotton panjabi for everyday wear and family occasions.", rating: 4.7, reviews: 354, stock: 30 },
    { id: "p3", n: "Slim Panjabi", p: 1500, e: "🤵", c: "Panjabi", desc: "Slim-fit panjabi with a modern cut. Check the size chart before ordering.", rating: 4.8, reviews: 219, stock: 22 },
    { id: "p4", n: "Sneakers", p: 2200, e: "👟", c: "Shoes", desc: "Comfortable everyday sneakers with a cushioned sole. Check your size with us before ordering.", rating: 4.7, reviews: 298, stock: 26 },
    { id: "p5", n: "Loafer", p: 1900, e: "👞", c: "Shoes", desc: "Classic slip-on loafer for formal and semi-formal wear. Leather-look finish.", rating: 4.8, reviews: 176, stock: 20 },
    { id: "p6", n: "Cotton Saree", p: 1500, e: "🥻", c: "Saree", desc: "Light everyday cotton saree, easy to drape and comfortable all day. New item - price estimated.", rating: 4.7, reviews: 112, stock: 24 },
    { id: "p7", n: "Printed Saree", p: 1400, e: "👘", c: "Saree", desc: "Printed saree in a seasonal print, for casual outings and office wear. New item - price estimated.", rating: 4.7, reviews: 98, stock: 26 },
    { id: "p8", n: "Festive Panjabi", p: 1900, e: "🤵", c: "Panjabi", desc: "Embroidered festive panjabi for Eid and weddings. New item - price estimated.", rating: 4.8, reviews: 87, stock: 16 },
    { id: "p9", n: "Running Shoes", p: 2600, e: "👟", c: "Shoes", desc: "Lightweight running shoes with grip for daily walks and training. New item - price estimated.", rating: 4.8, reviews: 93, stock: 18 },
  ],
  about:
    "Style Hub is a neighbourhood fashion store in Dhanmondi, Dhaka. This is a demo website: browse sarees, panjabis and shoes, try the cart and checkout flow, but no real order is placed and no real parcel is shipped. Size charts and the cash-on-delivery option are shown as the demo checkout framing. A real store using this layout would connect its own stock, courier and payment handling before taking live orders.",
  contact: CONTACT,
  address: ADDRESS,
  hours: HOURS,
  priceNote: "Prices in Tk. Demo website - no real orders are placed here. Cash on delivery shown for layout only.",
};

/* ------------------------------------------------------------------ */
/* GADGET (slug: gadget, layout: shop)                                 */
/* Original def (defs.ts): name "Tech Zone", type "Gadget Shop",       */
/* logo/hero 🔌, accent #22d3ee, dark true, cats All/Mobile/Computer/  */
/* Accessories. Original items (kept at original prices): Smartphone  */
/* X 25990, Laptop Pro 75990, Earbuds 2990, Smartwatch 8990, Tablet    */
/* 18990, Keyboard 2500. Four new items added, flagged.                */
/* ------------------------------------------------------------------ */
const GADGET: Partial<DemoSiteDef> = {
  agencyReworked: true,
  name: "Tech Zone",
  type: "Gadget Shop",
  logoEmoji: "🔌",
  accent: "#22d3ee",
  dark: true,
  heroTitle: "The latest gadgets, with official warranty",
  heroSub: "Original products • Warranty support • Pickup & home delivery",
  heroEmoji: "🔌",
  cats: ["All", "Mobile", "Computer", "Accessories"],
  products: [
    { id: "p0", n: "Smartphone X", p: 25990, e: "📱", c: "Mobile", desc: "Everyday smartphone with a sharp display and all-day battery. Check storage options in store.", rating: 4.8, reviews: 486, stock: 15 },
    { id: "p1", n: "Laptop Pro", p: 75990, e: "💻", c: "Computer", desc: "Full-size laptop for work and study, with a fast processor and solid build.", rating: 4.9, reviews: 213, stock: 8 },
    { id: "p2", n: "Earbuds", p: 2990, e: "🎧", c: "Accessories", desc: "Wireless earbuds with a charging case and clear sound for calls and music.", rating: 4.7, reviews: 342, stock: 28 },
    { id: "p3", n: "Smartwatch", p: 8990, e: "⌚", c: "Accessories", desc: "Smartwatch with fitness tracking, notifications and a bright display.", rating: 4.8, reviews: 267, stock: 18 },
    { id: "p4", n: "Tablet", p: 18990, e: "📲", c: "Mobile", desc: "Light tablet for reading, video and study, with a long battery life.", rating: 4.7, reviews: 198, stock: 14 },
    { id: "p5", n: "Keyboard", p: 2500, e: "⌨️", c: "Computer", desc: "Comfortable full-size keyboard for desk work, with quiet keys.", rating: 4.7, reviews: 154, stock: 32 },
    { id: "p6", n: "Power Bank", p: 3200, e: "🔋", c: "Accessories", desc: "High-capacity power bank for a full day away from a socket. Cable included. New item - price estimated.", rating: 4.8, reviews: 121, stock: 24 },
    { id: "p7", n: "Wireless Mouse", p: 1500, e: "🖱️", c: "Computer", desc: "Smooth wireless mouse for desk and laptop use. Battery included. New item - price estimated.", rating: 4.7, reviews: 108, stock: 30 },
    { id: "p8", n: "Bluetooth Speaker", p: 4500, e: "🔊", c: "Accessories", desc: "Portable Bluetooth speaker with all-day battery and a carry handle. New item - price estimated.", rating: 4.8, reviews: 96, stock: 16 },
    { id: "p9", n: "Phone Case", p: 800, e: "📱", c: "Accessories", desc: "Protective phone case with raised edges for screen and camera. Tell us your phone model for the right fit. New item - price estimated.", rating: 4.6, reviews: 143, stock: 45 },
  ],
  about:
    "Tech Zone is a neighbourhood gadget shop in Dhanmondi, Dhaka. This is a demo website: browse phones, laptops and accessories, try the cart and checkout flow, but no real order is placed and no real gadget is shipped. Official warranty and compatibility checks are shown as the demo purchase framing. A real shop using this layout would connect its own stock, warranty handling and payment processing before taking live orders.",
  contact: CONTACT,
  address: ADDRESS,
  hours: HOURS,
  priceNote: "Prices in Tk. Demo website - no real orders are placed here. Warranty shown for layout only.",
};

/* ------------------------------------------------------------------ */
/* PORTFOLIO (slug: portfolio, layout: gallery)                        */
/* Original def (defs.ts): name "Lens o Alo", type "Photographer       */
/* Portfolio", logo/hero 📸, accent #e2e8f0, dark true, cats ["All"].  */
/* Original works (kept, no prices): Sunrise - Cox's Bazar, Wedding -  */
/* Dhaka, Theatre - Shilpakala, City - Night, Sea - Saint Martin,     */
/* Fair - Village. Two new works added; categories expanded from the   */
/* original single "All" following the Phase 3 gallery pattern.        */
/* ------------------------------------------------------------------ */
const PORTFOLIO: Partial<DemoSiteDef> = {
  agencyReworked: true,
  name: "Lens & Light",
  type: "Photographer Portfolio",
  logoEmoji: "📸",
  accent: "#e2e8f0",
  dark: true,
  heroTitle: "Moments, kept forever",
  heroSub: "Weddings • Events • Portraits • Nature — selected works",
  heroEmoji: "📸",
  cats: ["All", "Nature", "Events", "City Life"],
  gallery: [
    { id: "g0", e: "🌅", t: "Sunrise - Cox's Bazar", c: "Nature" },
    { id: "g1", e: "👰", t: "Wedding - Dhaka", c: "Events" },
    { id: "g2", e: "🎭", t: "Theatre - Shilpakala", c: "Events" },
    { id: "g3", e: "🏙️", t: "City - Night", c: "City Life" },
    { id: "g4", e: "🌊", t: "Sea - Saint Martin", c: "Nature" },
    { id: "g5", e: "🎪", t: "Fair - Village", c: "Events" },
    { id: "g6", e: "🍃", t: "Tea Garden - Srimangal", c: "Nature" },
    { id: "g7", e: "👤", t: "Portrait - Studio", c: "City Life" },
  ],
  about:
    "Lens & Light is a photographer's portfolio and studio in Dhanmondi, Dhaka. This is a demo website: the works shown are demo gallery entries, and no real booking is made here. Browse the selected works by type - nature, events and city life - and use the contact route to ask about a shoot, as a real studio's visitors would. A real photographer using this layout would replace these demo works with their own photographs and confirm dates, coverage hours and delivery details before any booking.",
  contact: CONTACT,
  address: ADDRESS,
  hours: HOURS,
};

/* ------------------------------------------------------------------ */
/* REAL ESTATE (slug: realestate, layout: booking)                     */
/* Original def (defs.ts): name "Swapno Nibas", type "Real Estate",    */
/* logo/hero 🏠, accent #f59e0b, dark false, cats ["All"], priceNote   */
/* "lakh" (prices below are in Tk lakh, kept exactly as in the         */
/* original). Original listings (kept at original prices): Gulshan     */
/* Luxury Flat 185, Uttara Duplex 95, Mirpur Family Flat 65, Banani    */
/* Penthouse 250. Five new listings added, flagged; categories         */
/* expanded from the original item types, following the Phase 3        */
/* booking pattern.                                                    */
/* ------------------------------------------------------------------ */
const REALESTATE: Partial<DemoSiteDef> = {
  agencyReworked: true,
  name: "Dream Home",
  type: "Real Estate",
  logoEmoji: "🏠",
  accent: "#f59e0b",
  dark: false,
  heroTitle: "Your dream address, found",
  heroSub: "Verified listings • Book a visit online • Easy instalments",
  heroEmoji: "🏠",
  cats: ["All", "Flat", "Duplex", "Penthouse"],
  products: [
    { id: "p0", n: "Gulshan Luxury Flat", p: 185, e: "🏢", c: "Flat", desc: "Luxury flat in Gulshan with modern fittings. Book a visit to see the flat in person before deciding.", rating: 4.8, reviews: 132, stock: 3 },
    { id: "p1", n: "Uttara Duplex", p: 95, e: "🏡", c: "Duplex", desc: "Spacious duplex in Uttara, ideal for a growing family. Book a visit to walk through both floors.", rating: 4.7, reviews: 118, stock: 4 },
    { id: "p2", n: "Mirpur Family Flat", p: 65, e: "🏠", c: "Flat", desc: "Family flat in Mirpur with easy access to schools and markets. Book a visit to check the layout.", rating: 4.7, reviews: 154, stock: 5 },
    { id: "p3", n: "Banani Penthouse", p: 250, e: "🌆", c: "Penthouse", desc: "Penthouse in Banani with a wide terrace and city views. Book a visit for a private viewing.", rating: 4.9, reviews: 87, stock: 2 },
    { id: "p4", n: "Dhanmondi Family Flat", p: 120, e: "🏠", c: "Flat", desc: "Family flat in Dhanmondi, close to schools and hospitals. Book a visit to see the rooms. New listing - price estimated.", rating: 4.8, reviews: 76, stock: 4 },
    { id: "p5", n: "Bashundhara Apartment", p: 140, e: "🏢", c: "Flat", desc: "Modern apartment in Bashundhara R/A with lift and parking. Book a visit to check the building facilities. New listing - price estimated.", rating: 4.8, reviews: 69, stock: 3 },
    { id: "p6", n: "Uttara Studio Flat", p: 55, e: "🏠", c: "Flat", desc: "Compact studio flat in Uttara, ideal for a small family or a first home. New listing - price estimated.", rating: 4.6, reviews: 58, stock: 6 },
    { id: "p7", n: "Mirpur Duplex", p: 110, e: "🏡", c: "Duplex", desc: "Duplex in Mirpur with a private terrace and parking. Book a visit to walk through both floors. New listing - price estimated.", rating: 4.7, reviews: 64, stock: 3 },
    { id: "p8", n: "Mohammadpur Family Flat", p: 75, e: "🏠", c: "Flat", desc: "Family flat in Mohammadpur with good light and ventilation. Book a visit to check the layout. New listing - price estimated.", rating: 4.7, reviews: 71, stock: 5 },
  ],
  about:
    "Dream Home is a neighbourhood property listing site in Dhanmondi, Dhaka. This is a demo website: the listings shown are demo listings, and no real visit is booked and no real property is sold here. Browse flats, duplexes and penthouses, and try the visit-booking flow as a demo. A real agency using this layout would verify every listing, confirm availability and documents, and handle visits and payments through its own team before any sale.",
  contact: CONTACT,
  address: ADDRESS,
  hours: HOURS,
  priceNote: "Prices in Tk lakh. Demo website - no real visits are booked and no real property is sold here.",
};

/* ------------------------------------------------------------------ */
/* GYM (slug: gym, layout: service)                                    */
/* Original def (defs.ts): name "Power Gym", type "Gym & Fitness",     */
/* logo/hero 💪, accent #ef4444, dark true, cats ["All"]. Original     */
/* services (kept at original prices): Monthly Membership 1500 / 30    */
/* days, 6-Month Package 7000 / 180 days, Annual Membership 12000 /    */
/* 365 days, Personal Training 5000 / 10 sessions. Five new services   */
/* added, flagged; categories added following the Phase 3 service      */
/* pattern.                                                            */
/* ------------------------------------------------------------------ */
const GYM: Partial<DemoSiteDef> = {
  agencyReworked: true,
  name: "Power Gym",
  type: "Gym & Fitness",
  logoEmoji: "💪",
  accent: "#ef4444",
  dark: true,
  heroTitle: "Stay fit, stay strong",
  heroSub: "Certified trainers • Modern equipment • Book your plan online",
  heroEmoji: "💪",
  cats: ["All", "Membership", "Training", "Classes"],
  services: [
    { id: "s0", n: "Monthly Membership", p: 1500, e: "🎫", desc: "Full gym access for one month: cardio, strength and free-weight areas, plus locker access.", duration: "30 days", rating: 4.8, c: "Membership" },
    { id: "s1", n: "6-Month Package", p: 7000, e: "📅", desc: "Six months of full gym access at a lower monthly rate, with a free fitness assessment in week one.", duration: "180 days", rating: 4.9, c: "Membership" },
    { id: "s2", n: "Annual Membership", p: 12000, e: "🏆", desc: "A full year of gym access, the best value for regular training, with a free assessment and a written plan.", duration: "365 days", rating: 4.9, c: "Membership" },
    { id: "s3", n: "Personal Training", p: 5000, e: "👨‍🏫", desc: "One-to-one coaching with a certified trainer: a custom plan, form correction and progress tracking.", duration: "10 sessions", rating: 4.9, c: "Training" },
    { id: "s4", n: "Daily Pass", p: 300, e: "🎟️", desc: "One full day of gym access - try the floor, the equipment and a class with space before joining. New service - price estimated.", duration: "1 day", rating: 4.7, c: "Membership" },
    { id: "s5", n: "3-Month Package", p: 4000, e: "📅", desc: "Three months of full gym access with a free fitness assessment in week one. New service - price estimated.", duration: "90 days", rating: 4.8, c: "Membership" },
    { id: "s6", n: "Couple Membership", p: 2200, e: "👫", desc: "Monthly gym access for two people training together, with shared locker access. New service - price estimated.", duration: "30 days", rating: 4.8, c: "Membership" },
    { id: "s7", n: "Group Fitness Class", p: 1200, e: "🏋️", desc: "Monthly group classes: warm-up, strength and cardio sessions led by a certified instructor. New service - price estimated.", duration: "30 days", rating: 4.8, c: "Classes" },
    { id: "s8", n: "Diet Plan Consultation", p: 1500, e: "🥗", desc: "A one-to-one diet and lifestyle consultation with a written eating plan to take home. New service - price estimated.", duration: "1 session", rating: 4.7, c: "Training" },
  ],
  about:
    "Power Gym is a neighbourhood gym in Dhanmondi, Dhaka. This is a demo website: memberships and training shown here are demo plans, and no real membership is sold and no real training session is booked here. Pick a plan, try the booking flow, and ask about a free trial day as a real gym's visitors would. A real gym using this layout would confirm trainer availability, class times and its own joining terms before taking live signups.",
  contact: CONTACT,
  address: ADDRESS,
  hours: HOURS,
  priceNote: "Prices in Tk. Demo website - no real memberships are sold here.",
};

/* ------------------------------------------------------------------ */
/* TRAVEL (slug: travel, layout: booking)                              */
/* Original def (defs.ts): name "Ghure Asi", type "Travel Agency",     */
/* logo/hero ✈️, accent #14b8a6, dark false, cats ["All"], priceNote   */
/* "/person" (prices below are in Tk per person, kept exactly as in    */
/* the original). Original packages (kept at original prices): Cox's  */
/* Bazar Package 9000, Sajek Package 13000, Maldives Package 85000,    */
/* Sundarbans Package 7500. Five new packages added, flagged;          */
/* categories added following the Phase 3 booking pattern.             */
/* ------------------------------------------------------------------ */
const TRAVEL: Partial<DemoSiteDef> = {
  agencyReworked: true,
  name: "Let's Travel",
  type: "Travel Agency",
  logoEmoji: "✈️",
  accent: "#14b8a6",
  dark: false,
  heroTitle: "See the world, one trip at a time",
  heroSub: "Cox's Bazar to the Maldives • Hotel, meals & guide included",
  heroEmoji: "✈️",
  cats: ["All", "Domestic", "International"],
  products: [
    { id: "p0", n: "Cox's Bazar Package", p: 9000, e: "🏖️", c: "Domestic", desc: "Beach holiday in Cox's Bazar with hotel stay, transport and a guide. Per person, twin sharing.", rating: 4.8, reviews: 412, stock: 20 },
    { id: "p1", n: "Sajek Package", p: 13000, e: "🏔️", c: "Domestic", desc: "Hill trip to Sajek with resort stay, transport and sightseeing. Per person, twin sharing.", rating: 4.9, reviews: 287, stock: 16 },
    { id: "p2", n: "Maldives Package", p: 85000, e: "🌊", c: "International", desc: "Island holiday in the Maldives with resort stay, transfers and island activities. Per person, twin sharing.", rating: 4.9, reviews: 176, stock: 8 },
    { id: "p3", n: "Sundarbans Package", p: 7500, e: "🌳", c: "Domestic", desc: "River trip through the Sundarbans with boat stay, meals and a forest guide. Per person, twin sharing.", rating: 4.8, reviews: 243, stock: 18 },
    { id: "p4", n: "Bandarban Package", p: 11000, e: "⛰️", c: "Domestic", desc: "Hill trip to Bandarban with hotel stay, transport and guided sightseeing. Per person, twin sharing. New package - price estimated.", rating: 4.8, reviews: 96, stock: 14 },
    { id: "p5", n: "Srimangal Package", p: 8000, e: "🍃", c: "Domestic", desc: "Tea-garden trip to Srimangal with hotel stay, transport and garden visits. Per person, twin sharing. New package - price estimated.", rating: 4.7, reviews: 88, stock: 16 },
    { id: "p6", n: "Saint Martin Package", p: 12000, e: "🏝️", c: "Domestic", desc: "Island trip to Saint Martin with ship tickets, hotel stay and beach time. Per person, twin sharing. New package - price estimated.", rating: 4.8, reviews: 79, stock: 12 },
    { id: "p7", n: "Rangamati Package", p: 10000, e: "🚣", c: "Domestic", desc: "Lake trip to Rangamati with boat ride, hotel stay and sightseeing. Per person, twin sharing. New package - price estimated.", rating: 4.7, reviews: 71, stock: 14 },
    { id: "p8", n: "Thailand Package", p: 65000, e: "🌴", c: "International", desc: "City and beach holiday in Thailand with hotel stay, flights and a guide. Per person, twin sharing. New package - price estimated.", rating: 4.8, reviews: 64, stock: 10 },
  ],
  about:
    "Let's Travel is a neighbourhood travel agency in Dhanmondi, Dhaka. This is a demo website: the packages shown are demo packages, and no real trip is booked and no real payment is taken here. Browse domestic and international packages, check what each package includes, and try the booking flow as a demo. A real agency using this layout would confirm dates, seats, hotel availability and its own cancellation terms before taking live bookings.",
  contact: CONTACT,
  address: ADDRESS,
  hours: HOURS,
  priceNote: "Prices in Tk per person, twin sharing. Demo website - no real trips are booked here.",
};

/* ------------------------------------------------------------------ */
/* SAAS (slug: saas, layout: service)                                  */
/* Original def (defs.ts): name "Cloud Seba", type "Tech Startup       */
/* (SaaS)", logo/hero ☁️, accent #818cf8, dark true, cats ["All"].     */
/* Original plans (kept at original prices): Basic Plan 990 / month,   */
/* Pro Plan 2990 / month, Enterprise 9990 / month. Six new plans and   */
/* add-ons added, flagged; categories added following the Phase 3      */
/* service pattern.                                                    */
/* ------------------------------------------------------------------ */
const SAAS: Partial<DemoSiteDef> = {
  agencyReworked: true,
  name: "CloudServe",
  type: "Tech Startup (SaaS)",
  logoEmoji: "☁️",
  accent: "#818cf8",
  dark: true,
  heroTitle: "Run your business on autopilot",
  heroSub: "30-day free trial • No card needed for the trial • Cancel anytime",
  heroEmoji: "☁️",
  cats: ["All", "Plans", "Add-ons"],
  services: [
    { id: "s0", n: "Basic Plan", p: 990, e: "📦", desc: "For a small business getting started: core dashboard, one user seat and email support.", duration: "Per month", rating: 4.7, c: "Plans" },
    { id: "s1", n: "Pro Plan", p: 2990, e: "🚀", desc: "For a growing team: everything in Basic, plus five user seats, automation and priority support.", duration: "Per month", rating: 4.8, c: "Plans" },
    { id: "s2", n: "Enterprise", p: 9990, e: "🏢", desc: "For a large operation: unlimited seats, dedicated support, custom integrations and a service agreement.", duration: "Per month", rating: 4.9, c: "Plans" },
    { id: "s3", n: "Starter Plus Plan", p: 1490, e: "🌱", desc: "Between Basic and Pro: three user seats, reports and automation for one workflow. New plan - price estimated.", duration: "Per month", rating: 4.7, c: "Plans" },
    { id: "s4", n: "Team Plan", p: 1990, e: "👥", desc: "For a small team: five user seats, shared dashboards and chat support. New plan - price estimated.", duration: "Per month", rating: 4.8, c: "Plans" },
    { id: "s5", n: "Business Plan", p: 4990, e: "💼", desc: "For a mid-size business: ten user seats, advanced reports, automation and priority support. New plan - price estimated.", duration: "Per month", rating: 4.8, c: "Plans" },
    { id: "s6", n: "Priority Support Add-on", p: 990, e: "🎧", desc: "Same-day support replies and a dedicated help channel, added to any plan. New add-on - price estimated.", duration: "Per month", rating: 4.8, c: "Add-ons" },
    { id: "s7", n: "Data Migration Service", p: 3000, e: "🔄", desc: "One-time import of your existing data into CloudServe, checked and confirmed with you before going live. New add-on - price estimated.", duration: "One time", rating: 4.7, c: "Add-ons" },
    { id: "s8", n: "Custom Setup Service", p: 5000, e: "🛠️", desc: "One-time guided setup: dashboards, users and workflows configured with you in a live session. New add-on - price estimated.", duration: "One time", rating: 4.8, c: "Add-ons" },
  ],
  about:
    "CloudServe is a demo software service run from Dhanmondi, Dhaka. This is a demo website: the plans and add-ons shown are demo plans, and no real subscription is sold and no real account is created here. Compare the tiers, start a demo trial flow, and check what each plan includes. A real SaaS business using this layout would connect its own billing, user accounts and support team before taking live signups, and would state its own refund and data terms.",
  contact: CONTACT,
  address: ADDRESS,
  hours: HOURS,
  priceNote: "Prices in Tk. Demo website - no real subscriptions are sold here. Free trial shown for layout only.",
};


const JEWELRY: Partial<DemoSiteDef> = {
  agencyReworked: true,
  name: "AURELIA",
  type: "Luxury Jewelry Atelier",
  logoEmoji: "💎",
  accent: "#c9a24b",
  dark: true,
  heroTitle: "Jewelry that outlives the moment it marks.",
  heroSub: "Hand-finished rings, necklaces and bespoke commissions — designed in our atelier, made to be inherited.",
  heroEmoji: "💎",
  about:
    "AURELIA is a demo atelier: hand-finished rings, necklaces and bespoke commissions, shown as demo pieces. No real stones are sold here and no real orders are placed — browse the collection, try the demo bag and checkout, and ask the atelier about a bespoke piece as a demo enquiry. A real atelier using this layout would confirm stones, timing and delivery itself before taking any live order.",
  contact: CONTACT,
  // Address/hours kept from the original demo (London atelier setting, demo fiction);
  // the standing sales contact above is the route a visitor uses from this demo.
  priceNote: "Prices in USD. Demo website - no real orders are placed here.",
};

export function applyAgencyDemoOverride(def: DemoSiteDef): DemoSiteDef {
  // Phase 4: hand-crafted defs carry raw extra keys (newsItems, desc) via the
  // baseDef spread. They are never rendered, but they ride into the client
  // prop payload — strip them for reworked demos so no Bangla raw data leaks
  // into the serialised page data. `desc` is not rendered by any demo page.
  const cleanDef = { ...def } as unknown as Record<string, unknown>;
  delete cleanDef.newsItems;
  delete cleanDef.desc;
  const base = cleanDef as unknown as DemoSiteDef;
  if (def.slug === "bakery") return { ...base, ...BAKERY };
  if (def.slug === "salon") return { ...base, ...SALON };
  if (def.slug === "pharmacy") return { ...base, ...PHARMACY };
  if (def.slug === "bookstore") return { ...base, ...BOOKSTORE };
  if (def.slug === "mobilestore") return { ...base, ...MOBILESTORE };
  if (def.slug === "cosmetics") return { ...base, ...COSMETICS };
  if (def.slug === "furniture") return { ...base, ...FURNITURE };
  if (def.slug === "petshop") return { ...base, ...PETSHOP };
  if (def.slug === "sports") return { ...base, ...SPORTS };
  if (def.slug === "appliances") return { ...base, ...APPLIANCES };
  if (def.slug === "flower") return { ...base, ...FLOWER };
  if (def.slug === "toy") return { ...base, ...TOY };
  if (def.slug === "grocery") return { ...base, ...GROCERY };
  if (def.slug === "sweets") return { ...base, ...SWEETS };
  if (def.slug === "cafe") return { ...base, ...CAFE };
  if (def.slug === "juicebar") return { ...base, ...JUICEBAR };
  if (def.slug === "biriyani") return { ...base, ...BIRIYANI };
  if (def.slug === "chinese") return { ...base, ...CHINESE };
  if (def.slug === "chef") return { ...base, ...CHEF };
  if (def.slug === "stationary") return { ...base, ...STATIONARY };
  if (def.slug === "laundry") return { ...base, ...LAUNDRY };
  if (def.slug === "carwash") return { ...base, ...CARWASH };
  if (def.slug === "clinic") return { ...base, ...CLINIC };
  if (def.slug === "dental") return { ...base, ...DENTAL };
  if (def.slug === "electrician") return { ...base, ...ELECTRICIAN };
  if (def.slug === "tutor") return { ...base, ...TUTOR };
  if (def.slug === "eventplan") return { ...base, ...EVENTPLAN };
  if (def.slug === "weddingplan") return { ...base, ...WEDDINGPLAN };
  if (def.slug === "itsupport") return { ...base, ...ITSUPPORT };
  if (def.slug === "plumber") return { ...base, ...PLUMBER };
  if (def.slug === "hotel") return { ...base, ...HOTEL };
  if (def.slug === "resort") return { ...base, ...RESORT };
  if (def.slug === "busservice") return { ...base, ...BUSSERVICE };
  if (def.slug === "carrental") return { ...base, ...CARRENTAL };
  if (def.slug === "tourpackage") return { ...base, ...TOURPACKAGE };
  if (def.slug === "yoga") return { ...base, ...YOGA };
  if (def.slug === "artist") return { ...base, ...ARTIST };
  if (def.slug === "interior") return { ...base, ...INTERIOR };
  if (def.slug === "architect") return { ...base, ...ARCHITECT };
  if (def.slug === "makeupartist") return { ...base, ...MAKEUPARTIST };
  if (def.slug === "news") return { ...base, ...NEWS };
  if (def.slug === "investpro") return { ...base, ...INVESTPRO };
  if (def.slug === "agroinvest") return { ...base, ...AGROINVEST };
  if (def.slug === "swiftex") return { ...base, ...SWIFTEX };
  if (def.slug === "payex") return { ...base, ...PAYEX };
  if (def.slug === "cryptovault") return { ...base, ...CRYPTOVAULT };
  if (def.slug === "trustpay") return { ...base, ...TRUSTPAY };
  if (def.slug === "casinoplay") return { ...base, ...CASINOPLAY };
  if (def.slug === "binancepro") return { ...base, ...PLYRATRADE };
  if (def.slug === "restaurant") return { ...base, ...RESTAURANT };
  if (def.slug === "fashion") return { ...base, ...FASHION };
  if (def.slug === "gadget") return { ...base, ...GADGET };
  if (def.slug === "portfolio") return { ...base, ...PORTFOLIO };
  if (def.slug === "realestate") return { ...base, ...REALESTATE };
  if (def.slug === "gym") return { ...base, ...GYM };
  if (def.slug === "travel") return { ...base, ...TRAVEL };
  if (def.slug === "saas") return { ...base, ...SAAS };
  if (def.slug === "jewelry") return { ...base, ...JEWELRY };
  return def;
}
