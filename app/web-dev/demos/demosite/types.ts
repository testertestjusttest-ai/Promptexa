/** DemoSite — multi-page demo website framework types.
 * Every demo becomes a complete, browsable website (home, shop, product,
 * cart, checkout, auth, account, wallet, orders...) with browser-local data.
 * Nothing here touches the real DigiPlyra database or admin panel.
 */

export type DemoLayout = "shop" | "service" | "gallery" | "booking" | "news" | "invest" | "exchange" | "wallet" | "casino" | "crypto-exchange" | "buyinghouse" | "jewelry";

/** Visual theme — each demo gets one so no two demos look alike. */
export type DemoTheme = "aurora" | "split" | "minimal" | "bold" | "elegant" | "playful";

export interface DemoProduct {
  id: string;
  n: string;
  p: number;
  e: string;
  c: string;
  desc: string;
  rating: number;
  reviews: number;
  stock: number;
  oldPrice?: number;
  priceNote?: string;
  img?: string;
}

export interface DemoServiceItem {
  id: string;
  n: string;
  p: number;
  e: string;
  desc: string;
  duration: string;
  rating: number;
  /** Phase 4: service category for the services-list filter. Optional so
   *  older services without a category keep working (they show under All). */
  c?: string;
}

export interface DemoGalleryItem {
  id: string;
  e: string;
  t: string;
  c: string;
}

export interface DemoNewsItem {
  id: string;
  t: string;
  e: string;
  c: string;
  time: string;
  body: string;
}

/** Investment plan (invest layout). */
export interface DemoInvestPlan {
  id: string;
  n: string;
  e: string;
  min: number;
  max: number;
  roi: number; // % per duration
  dailyRoi: number; // % per day
  duration: string;
  desc: string;
  tag?: string;
}

/** Currency rate (exchange layout). */
export interface DemoRate {
  code: string;
  name: string;
  buy: number; // BDT per unit when we sell to user
  sell: number; // BDT per unit when we buy from user
  e: string;
  change: number; // % 24h
}

/** Crypto coin (wallet layout). */
export interface DemoCoin {
  code: string;
  name: string;
  price: number; // USD
  change: number; // % 24h
  e: string;
}

export interface DemoSiteDef {
  slug: string;
  name: string;
  type: string;
  layout: DemoLayout;
  logoEmoji: string;
  accent: string;
  dark: boolean;
  grad: string;
  heroTitle: string;
  heroSub: string;
  heroEmoji: string;
  heroImg?: string;
  catImgs?: Record<string, string>;
  cats: string[];
  products: DemoProduct[];
  services: DemoServiceItem[];
  gallery: DemoGalleryItem[];
  news: DemoNewsItem[];
  about: string;
  contact: string;
  address: string;
  hours: string;
  priceNote?: string;
  /** Agency rework flag (Phase 1): true for demos rebuilt end-to-end with
   *  English-first content + the extended admin. DemoSite renders
   *  AgencyDemoAdmin for these instead of the basic DemoAdmin. */
  agencyReworked?: boolean;
  theme?: DemoTheme;
  investPlans?: DemoInvestPlan[];
  rates?: DemoRate[];
  coins?: DemoCoin[];
}
