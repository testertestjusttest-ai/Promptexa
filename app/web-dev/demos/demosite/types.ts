/** DemoSite — multi-page demo website framework types.
 * Every demo becomes a complete, browsable website (home, shop, product,
 * cart, checkout, auth, account, wallet, orders...) with browser-local data.
 * Nothing here touches the real DigiPlyra database or admin panel.
 */

export type DemoLayout = "shop" | "service" | "gallery" | "booking" | "news";

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
}
