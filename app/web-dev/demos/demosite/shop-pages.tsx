"use client";

/** DemoSite SHOP layout — all shop pages (home → product → cart → checkout → account...).
 * Browser-local data only; nothing touches the real DigiPlyra DB or admin. */

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toBnDigits } from "@/lib/format";
import { useDemo } from "./store";
import { useDemoLangOpt } from "./demo-lang";
import type { DemoProduct } from "./types";
import { Price, Stars, Btn, SectionTitle, Empty, ProductCard, Back, Page, LoginHint , HeroSlider, Hero, bannerSlides } from "./ui";

/**
 * Products hook — in client mode, loads real products from the database.
 * Falls back to demo products when DB is empty or not in client mode.
 */
export function useProducts(): DemoProduct[] {
  const { def, clientSlug } = useDemo();
  const [dbProducts, setDbProducts] = useState<DemoProduct[] | null>(null);

  useEffect(() => {
    if (!clientSlug) return;
    fetch(`/api/client/${clientSlug}/products`)
      .then((r) => r.json())
      .then((d) => {
        const list = (d.products || []).map((p: any) => ({
          id: p.id,
          n: p.name,
          p: Number(p.price_bdt),
          oldPrice: p.old_price_bdt ? Number(p.old_price_bdt) : undefined,
          e: p.image_emoji || "📦",
          c: p.category || "সব",
          desc: "",
          rating: 4.5,
          reviews: 10,
          stock: p.stock ?? 100,
          img: p.image_url || undefined,
        }));
        setDbProducts(list);
      })
      .catch(() => setDbProducts([]));
  }, [clientSlug]);

  if (clientSlug && dbProducts !== null && dbProducts.length > 0) return dbProducts;
  return def.products;
}

const FREE_DELIVERY_AT = 1000;
const DELIVERY_FEE = 60;
const bn = (n: number) => n.toLocaleString("en-IN");
const feeFor = (sub: number) => (sub >= FREE_DELIVERY_AT ? 0 : DELIVERY_FEE);

function useSkin() {
  const { def } = useDemo();
  return {
    dark: def.dark,
    accent: def.accent,
    card: `rounded-2xl border ${def.dark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"}`,
    sub: def.dark ? "text-slate-400" : "text-slate-500",
    chip: `rounded-full border px-4 py-2 text-sm font-bold transition ${
      def.dark ? "border-white/15 bg-white/5 text-white hover:bg-white/10" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
    }`,
  };
}


/** Phase 8: English by default via the demo-lang provider; Bangla only when
 *  the visitor switched to Bangla. No provider (legacy demo) keeps the
 *  original Bangla strings — same convention as chrome.tsx.
 *  dig() renders Latin digits in English/Hindi view, Bangla digits otherwise. */
function useDL() {
  const dl = useDemoLangOpt();
  const lang = dl?.lang ?? "bn";
  return {
    lang,
    L: (en: string, bn: string) => (dl ? dl.L(en, bn) : bn),
    dig: (v: string | number) => {
      const str = String(v);
      return lang === "bn" ? toBnDigits(str) : str;
    },
    cur: lang === "bn" ? "টাকা" : "Tk",
  };
}

function DField(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { def } = useDemo();
  const cls = def.dark
    ? "border-white/15 bg-white/5 text-white placeholder:text-slate-500 focus:border-white/40"
    : "border-slate-300 bg-white text-slate-800 placeholder:text-slate-400 focus:border-slate-500";
  return <input {...props} className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none ${cls} ${props.className ?? ""}`} />;
}

function DArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { def } = useDemo();
  const cls = def.dark
    ? "border-white/15 bg-white/5 text-white placeholder:text-slate-500 focus:border-white/40"
    : "border-slate-300 bg-white text-slate-800 placeholder:text-slate-400 focus:border-slate-500";
  return <textarea {...props} className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none ${cls} ${props.className ?? ""}`} />;
}

function StatusBadge({ s }: { s: string }) {
  return (
    <span className="rounded-full bg-amber-400/15 px-2.5 py-1 text-[10px] font-bold text-amber-500">
      🚚 {s}
    </span>
  );
}

function Timeline({ active = 0 }: { active?: number }) {
  const { def } = useDemo();
  const { L } = useDL();
  const steps = [L("✅ Confirmed", "✅ কনফার্মড"), L("📦 Packing", "📦 প্যাকিং"), L("🚚 Shipped", "🚚 শিপড"), L("🏠 Delivered", "🏠 ডেলিভার্ড")];
  return (
    <div className="flex items-start">
      {steps.map((st, i) => (
        <div key={st} className="flex flex-1 items-start last:flex-none">
          <div className="flex flex-col items-center">
            <div
              className="grid h-9 w-9 place-items-center rounded-full text-sm font-black"
              style={i <= active ? { background: def.accent, color: "#fff" } : undefined}
            >
              {i <= active ? "✓" : <span className="opacity-40">{i + 1}</span>}
            </div>
            <p className={`mt-1 text-center text-[10px] font-bold ${i <= active ? "" : "opacity-40"}`}>{st}</p>
          </div>
          {i < steps.length - 1 && (
            <div className="mx-1 mt-4 h-0.5 flex-1 rounded" style={i < active ? { background: def.accent } : undefined} />
          )}
        </div>
      ))}
    </div>
  );
}

const SAMPLE_REVIEWS = [
  { nEn: "Rahim U.", nBn: "রহিম U.", tEn: "Got exactly what the photos showed. Delivery was fast too.", tBn: "পণ্যটা একদম ছবির মতোই পেয়েছি। ডেলিভারিও দ্রুত ছিল।", r: 5 },
  { nEn: "Sumaiya A.", nBn: "সুমাইয়া A.", tEn: "Good value for the price. Packaging was nice too.", tBn: "দাম অনুযায়ী মান বেশ ভালো। প্যাকেজিংও সুন্দর ছিল।", r: 4 },
  { nEn: "Tanvir H.", nBn: "তানভীর H.", tEn: "Quite liked it. Customer service was friendly.", tBn: "মোটামুটি ভালো লেগেছে। কাস্টমার সার্ভিস বন্ধুসুলভ।", r: 4 },
];

/* ================= HOME ================= */

export function ShopHome() {
  const { def, base, clientSlug, store } = useDemo();
  const banners = bannerSlides();
  const products = useProducts();
  const { card, sub, chip } = useSkin();
  const { L } = useDL();
  const deals = products.filter((p) => p.oldPrice).slice(0, 4);
  const featured = products.slice(0, 8);

  // Custom slider from client admin (overrides defaults in client mode)
  const [customSlides, setCustomSlides] = useState<any[] | null>(null);
  useEffect(() => {
    if (!clientSlug) return;
    fetch(`/api/client/${clientSlug}/settings`)
      .then((r) => r.json())
      .then((d) => {
        try {
          const arr = JSON.parse(d.settings?.hero_slides || "[]");
          if (Array.isArray(arr) && arr.length > 0) setCustomSlides(arr);
          else setCustomSlides([]);
        } catch { setCustomSlides([]); }
      })
      .catch(() => setCustomSlides([]));
  }, [clientSlug]);

  const defaultSlides = [
    { img: def.heroImg, emoji: def.heroEmoji, title: def.heroTitle, sub: def.heroSub, cta: L("🛍️ Start shopping", "🛍️ কেনাকাটা শুরু করুন"), href: "/shop", grad: def.grad },
    { emoji: "🎁", title: L("Limited-time offer", "সীমিত সময়ের অফার"), sub: L("Attractive discounts on your favourite products — before stock runs out!", "পছন্দের পণ্যে আকর্ষণীয় ছাড় — স্টক শেষ হওয়ার আগেই!"), cta: L("🎁 See offers", "🎁 অফার দেখুন"), href: "/offers", grad: def.grad },
    { emoji: "🚚", title: L("Home delivery across the country", "সারাদেশে হোম ডেলিভারি"), sub: L("Free delivery on orders over 1,000 Tk", "১,০০০ টাকার বেশি অর্ডারে ডেলিভারি একদম ফ্রি"), cta: L("🛍️ Shop now", "🛍️ শপ করুন"), href: "/shop", grad: def.grad },
  ];
  const baseSlides = customSlides && customSlides.length > 0
    ? customSlides.map((sl: any) => ({
        img: sl.img || undefined,
        emoji: sl.img ? "" : "🎉",
        title: sl.title || def.heroTitle,
        sub: sl.sub || def.heroSub,
        cta: L("🛍️ Shop now", "🛍️ কেনাকাটা করুন"),
        href: "/shop",
        grad: def.grad,
      }))
    : defaultSlides;
  const slides = [...baseSlides, ...banners];
  return (
    <div>
      <Hero
        accent={def.accent}
        slides={slides}
      />
      <Page>
        <div className="mb-5 flex flex-wrap gap-2">
          {def.cats.slice(1).map((c) => (
            <Link key={c} href={`${base}/c/${encodeURIComponent(c)}`} className={chip}>
              {c}
            </Link>
          ))}
        </div>
        {deals.length > 0 && (
          <>
            <SectionTitle t={L("🎁 Discounted products", "🎁 ছাড়ের পণ্য")} sub={L("Limited-time offers", "সীমিত সময়ের অফার")} link={`${base}/offers`} />
            <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {deals.map((p) => (
                <ProductCard key={p.id} p={p} />
              ))}
            </div>
          </>
        )}
        <SectionTitle t={L("🔥 Popular products", "🔥 জনপ্রিয় পণ্য")} link={`${base}/shop`} />
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {featured.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
        <div className={`grid grid-cols-3 gap-2 p-4 text-center ${card}`}>
          {[
            ["🚚", L("Fast delivery", "দ্রুত ডেলিভারি")],
            ["💵", L("Cash on delivery", "ক্যাশ অন ডেলিভারি")],
            ["🔄", L("Easy returns", "সহজ রিটার্ন")],
          ].map(([e, t]) => (
            <div key={t}>
              <p className="text-2xl">{e}</p>
              <p className={`mt-1 text-[11px] font-bold ${sub}`}>{t}</p>
            </div>
          ))}
        </div>
      </Page>
    </div>
  );
}

/* ================= ALL / CATEGORY ================= */

export function ShopAll() {
  const { def, base } = useDemo();
  const products = useProducts();
  const { chip } = useSkin();
  const { L } = useDL();
  return (
    <Page>
      <Back href={base} label={L("Home", "হোম")} />
      <SectionTitle t={L("🛍️ All products", "🛍️ সব পণ্য")} sub={L(`${bn(products.length)} products`, `${bn(products.length)}টি পণ্য`)} />
      <div className="mb-5 flex flex-wrap gap-2">
        {def.cats.slice(1).map((c) => (
          <Link key={c} href={`${base}/c/${encodeURIComponent(c)}`} className={chip}>
            {c}
          </Link>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} p={p} />
        ))}
      </div>
    </Page>
  );
}

export function ShopCategory({ cat }: { cat: string }) {
  const { def, base } = useDemo();
  const { L } = useDL();
  const products = useProducts();
  const list = products.filter((p) => p.c === cat);
  return (
    <Page>
      <Back href={`${base}/shop`} label={L("All products", "সব পণ্য")} />
      <SectionTitle t={cat} sub={L(`${bn(list.length)} products`, `${bn(list.length)}টি পণ্য`)} />
      {list.length === 0 ? (
        <Empty emoji="📭" text={L("No products in this category yet", "এই ক্যাটাগরিতে এখনো পণ্য নেই")} />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {list.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      )}
    </Page>
  );
}

/* ================= PRODUCT ================= */

export function ShopProduct({ id }: { id: string }) {
  const { def, base, store } = useDemo();
  const products = useProducts();
  const router = useRouter();
  const { accent, card, sub } = useSkin();
  const { L, cur, lang } = useDL();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const p = products.find((x) => x.id === id);
  if (!p) {
    return (
      <Page narrow>
        <Empty emoji="🔍" text={L("Product not found", "পণ্যটি পাওয়া যায়নি")} />
        <div className="text-center">
          <Link href={`${base}/shop`} className="btn-demo" style={{ background: accent }}>
            {L("🛍️ Back to shop", "🛍️ শপে ফিরুন")}
          </Link>
        </div>
      </Page>
    );
  }
  const off = p.oldPrice ? Math.round((1 - p.p / p.oldPrice) * 100) : 0;
  const related = products.filter((x) => x.c === p.c && x.id !== p.id).slice(0, 4);
  const maxQ = Math.max(1, Math.min(99, p.stock));
  const line = { id: p.id, n: p.n, p: p.p, e: p.e };
  const add = () => {
    store.addToCart(line, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };
  return (
    <Page>
      <Back href={`${base}/shop`} label={L("Shop", "শপ")} />
      <div className={`grid gap-6 overflow-hidden p-5 sm:grid-cols-2 ${card}`}>
        <div className="relative min-h-64 overflow-hidden rounded-2xl bg-gradient-to-br from-white/10 to-transparent">
          {p.img ? (
            <img src={p.img} alt={p.n} className="h-full min-h-64 w-full object-cover" />
          ) : (
            <div className="grid min-h-64 place-items-center p-10 text-8xl">{p.e}</div>
          )}
          {off > 0 && (
            <span className="absolute left-3 top-3 rounded-full bg-red-500 px-3 py-1 text-xs font-black text-white">
              −{bn(off)}% {L("off", "ছাড়")}
            </span>
          )}
        </div>
        <div>
          <p className={`text-xs font-bold ${sub}`}>{p.c}</p>
          <h1 className="mt-1 text-2xl font-black">{p.n}</h1>
          <div className="mt-1">
            <Stars rating={p.rating} reviews={p.reviews} en={lang !== "bn"} />
          </div>
          <div className="mt-3 flex items-center gap-3">
            <Price v={p.p} accent={accent} big note={p.priceNote ?? def.priceNote} />
            {p.oldPrice && <span className={`text-sm line-through ${sub}`}>{bn(p.oldPrice)} {cur}</span>}
          </div>
          {p.stock < 10 && <p className="mt-2 text-sm font-black text-red-500">{L(`⚡ Only ${bn(p.stock)} left!`, `⚡ মাত্র ${bn(p.stock)}টি বাকি!`)}</p>}
          <p className={`mt-3 text-sm leading-relaxed ${sub}`}>{p.desc}</p>
          <div className="mt-4 flex items-center gap-3">
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 px-3 py-2">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-lg font-black">
                −
              </button>
              <span className="min-w-6 text-center text-lg font-black">{bn(qty)}</span>
              <button onClick={() => setQty((q) => Math.min(maxQ, q + 1))} className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-lg font-black">
                +
              </button>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Btn accent={accent} onClick={add}>
              {added ? L("✅ Added to cart!", "✅ কার্টে যোগ হয়েছে!") : L("🛒 Add to cart", "🛒 কার্টে যোগ করুন")}
            </Btn>
            <Btn
              accent={accent}
              ghost
              onClick={() => {
                store.addToCart(line, qty);
                router.push(`${base}/cart`);
              }}
            >
              {L("⚡ Buy now", "⚡ এখনই কিনুন")}
            </Btn>
          </div>
          <p className={`mt-3 text-[11px] ${sub}`}>{L(`🚚 Free delivery on ${bn(FREE_DELIVERY_AT)}+ Tk orders • 💵 Cash on delivery`, `🚚 ${bn(FREE_DELIVERY_AT)}+ টাকার অর্ডারে ডেলিভারি ফ্রি • 💵 ক্যাশ অন ডেলিভারি`)}</p>
        </div>
      </div>
      {related.length > 0 && (
        <div className="mt-8">
          <SectionTitle t={L("🔗 Related products", "🔗 রিলেটেড পণ্য")} />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {related.map((r) => (
              <ProductCard key={r.id} p={r} />
            ))}
          </div>
        </div>
      )}
      <div className="mt-8">
        <SectionTitle t={L("⭐ Customer reviews", "⭐ কাস্টমার রিভিউ")} sub={L(`${bn(p.reviews)} reviews`, `${bn(p.reviews)}টি রিভিউ`)} />
        <div className="space-y-2">
          {SAMPLE_REVIEWS.map((r) => (
            <div key={r.nEn} className={`p-4 ${card}`}>
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold">{L(r.nEn, r.nBn)}</p>
                <Stars rating={r.r} en={lang !== "bn"} />
              </div>
              <p className={`mt-1 text-sm ${sub}`}>{L(r.tEn, r.tBn)}</p>
            </div>
          ))}
        </div>
        <p className={`mt-2 text-[11px] ${sub}`}>{L("💡 Demo reviews — verified buyer reviews will appear here on the real site.", "💡 ডেমো রিভিউ — আসল সাইটে এখানে যাচাইকৃত ক্রেতাদের রিভিউ থাকবে।")}</p>
      </div>
    </Page>
  );
}

/* ================= CART ================= */

export function ShopCart() {
  const { base, store } = useDemo();
  const { accent, card, sub } = useSkin();
  const subtotal = store.cartTotal;
  const fee = feeFor(subtotal);
  const total = subtotal + fee;
  return (
    <Page narrow>
      <Back href={`${base}/shop`} label="Shop" />
      <SectionTitle t="🛒 Cart" sub={subtotal > 0 ? `${bn(store.cartCount)} Product` : undefined} />
      {store.cart.length === 0 ? (
        <>
          <Empty emoji="🛒" text="Cart is empty — add products you like" />
          <div className="text-center">
            <Link href={`${base}/shop`} className="btn-demo" style={{ background: accent }}>
              🛍️ Shop now
            </Link>
          </div>
        </>
      ) : (
        <>
          <div className="space-y-2">
            {store.cart.map((l) => (
              <div key={l.id} className={`flex items-center gap-3 p-3 ${card}`}>
                <span className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-white/5 text-3xl">{l.e}</span>
                <div className="flex-1">
                  <p className="text-sm font-bold">{l.n}</p>
                  <p className="text-xs font-black" style={{ color: accent }}>
                    {bn(l.p)} Tk
                  </p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <button onClick={() => store.setQty(l.id, l.qty - 1)} className="grid h-7 w-7 place-items-center rounded-full bg-white/10 font-black">
                      −
                    </button>
                    <span className="text-sm font-black">{bn(l.qty)}</span>
                    <button onClick={() => store.setQty(l.id, l.qty + 1)} className="grid h-7 w-7 place-items-center rounded-full bg-white/10 font-black">
                      +
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black">{bn(l.p * l.qty)} Tk</p>
                  <button onClick={() => store.removeLine(l.id)} className={`mt-1 text-xs font-bold ${sub} hover:text-red-400`}>
                    🗑️ Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className={`mt-4 space-y-1.5 p-4 text-sm ${card}`}>
            <div className="flex justify-between">
              <span className={sub}>Subtotal</span>
              <b>{bn(subtotal)} Tk</b>
            </div>
            <div className="flex justify-between">
              <span className={sub}>Delivery fee</span>
              <b>{fee === 0 ? "🎉 Free" : `${bn(fee)} Tk`}</b>
            </div>
            {fee > 0 && <p className={`text-[11px] ${sub}`}>💡 Add {bn(FREE_DELIVERY_AT - subtotal)} Tk more products for free delivery!</p>}
            <div className="flex justify-between border-t border-white/10 pt-2 text-base">
              <span className="font-bold">Total</span>
              <span className="font-black" style={{ color: accent }}>
                {bn(total)} Tk
              </span>
            </div>
          </div>
          <Link href={`${base}/checkout`} className="btn-demo mt-4 block w-full !py-3.5 text-center text-base" style={{ background: accent }}>
            ➡️ Checkout
          </Link>
        </>
      )}
    </Page>
  );
}

/* ================= CHECKOUT ================= */

export function ShopCheckout() {
  const { base, store, clientSlug } = useDemo();
  const router = useRouter();
  const { accent, card, sub } = useSkin();
  const [name, setName] = useState(store.user?.name ?? "");
  const [phone, setPhone] = useState(store.user?.phone ?? "");
  const [address, setAddress] = useState(store.user?.address ?? "");
  const [pay, setPay] = useState("Cash on delivery");
  const [error, setError] = useState("");
  const [placing, setPlacing] = useState(false);
  const subtotal = store.cartTotal;
  const fee = feeFor(subtotal);
  const total = subtotal + fee;
  const walletOk = store.wallet >= total;

  if (store.cart.length === 0) {
    return (
      <Page narrow>
        <Empty emoji="🛒" text="Cart is empty — add products first" />
        <div className="text-center">
          <Link href={`${base}/shop`} className="btn-demo" style={{ background: accent }}>
            🛍️ Back to shop
          </Link>
        </div>
      </Page>
    );
  }

  const pays = ["Cash on delivery", "Wallet", "bKash", "Nagad", "Rocket"];
  const payIcon = (m: string) => (m === "Cash on delivery" ? "💵" : m === "Wallet" ? "👛" : m === "bKash" ? "🩷" : m === "Nagad" ? "🧡" : "💜");

  async function submit() {
    setError("");
    if (placing) return;
    if (name.trim().length < 3) return setError("Enter your name");
    if (!/^01[3-9]\d{8}$/.test(phone.trim())) return setError("Enter a valid 11-digit mobile number (01XXXXXXXXX)");
    if (address.trim().length < 8) return setError("Enter your full address");
    const items = store.cart.map((l) => ({ id: l.id, n: l.n, p: l.p, e: l.e, qty: l.qty }));
    if (pay === "Wallet") {
      const ok = store.payWithWallet(total, `🛒 Order — ${bn(items.length)} Product`);
      if (!ok) return setError("Not enough wallet balance — top up");
    }
    // Real client site: save order to database
    if (clientSlug) {
      setPlacing(true);
      try {
        const res = await fetch(`/api/client/${clientSlug}/orders`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customer_name: name.trim(),
            customer_phone: phone.trim(),
            customer_address: address.trim(),
            items: items.map((it) => ({ name: it.n, price: it.p, qty: it.qty, emoji: it.e })),
            total_bdt: total,
            payment_method: pay === "Cash on delivery" ? "cod" : pay === "Wallet" ? "wallet" : "mobile",
          }),
        });
        const d = await res.json();
        if (!res.ok || !d.ok) throw new Error(d.error || "Failed");
        const rec = store.placeOrder({ items, total, name: name.trim(), phone: phone.trim(), address: address.trim(), pay });
        router.push(`${base}/success/${rec.id}?no=${encodeURIComponent(d.order_no)}`);
      } catch (e: any) {
        setError(e.message || "Order failed — try again");
      } finally {
        setPlacing(false);
      }
      return;
    }
    const rec = store.placeOrder({ items, total, name: name.trim(), phone: phone.trim(), address: address.trim(), pay });
    router.push(`${base}/success/${rec.id}`);
  }

  return (
    <Page narrow>
      <Back href={`${base}/cart`} label="Cart" />
      <SectionTitle t="🧾 Checkout" />
      {!store.user && (
        <div className="mb-4">
          <LoginHint />
        </div>
      )}
      <div className={`space-y-1.5 p-4 text-sm ${card}`}>
        <div className="flex justify-between">
          <span className={sub}>Subtotal</span>
          <b>{bn(subtotal)} Tk</b>
        </div>
        <div className="flex justify-between">
          <span className={sub}>Delivery</span>
          <b>{fee === 0 ? "🎉 Free" : `${bn(fee)} Tk`}</b>
        </div>
        <div className="flex justify-between border-t border-white/10 pt-2 text-base">
          <span className="font-bold">Total</span>
          <span className="font-black" style={{ color: accent }}>
            {bn(total)} Tk
          </span>
        </div>
      </div>
      <div className="mt-4 space-y-3">
        <DField value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name *" />
        <DField value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Mobile number * (01XXXXXXXXX)" inputMode="numeric" />
        <DArea value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Full address * (house, road, area, district)" rows={2} />
      </div>
      <p className="mb-2 mt-5 text-sm font-bold">💳 Payment method</p>
      <div className="grid grid-cols-2 gap-2">
        {pays.map((m) => {
          const dis = m === "Wallet" && !walletOk;
          const sel = pay === m && !dis;
          return (
            <button
              key={m}
              disabled={dis}
              onClick={() => setPay(m)}
              className={`rounded-2xl border-2 px-3 py-3 text-left text-sm font-bold transition ${dis ? "cursor-not-allowed opacity-40" : ""}`}
              style={sel ? { borderColor: accent, background: `${accent}18` } : undefined}
            >
              {payIcon(m)} {m}
              {m === "Wallet" && <span className={`block text-[11px] font-normal ${sub}`}>Balance: {bn(store.wallet)} Tk</span>}
            </button>
          );
        })}
      </div>
      {pay === "Wallet" && !walletOk && (
        <p className={`mt-2 text-xs ${sub}`}>
          ⚠️ Low balance — <Link href={`${base}/wallet`} className="font-bold underline">Top up wallet</Link>
        </p>
      )}
      {(pay === "bKash" || pay === "Nagad" || pay === "Rocket") && (
        <p className={`mt-2 text-xs ${sub}`}>💡 Demo payment — no real money will be charged. On the real site, a {pay} payment gateway will be connected here.</p>
      )}
      {error && <p className="mt-3 rounded-xl bg-red-500/10 px-4 py-2.5 text-xs font-bold text-red-400">⚠️ {error}</p>}
      <button onClick={submit} disabled={placing} className="btn-demo mt-4 w-full !py-3.5 text-base disabled:opacity-50" style={{ background: accent }}>
        {placing ? "⏳ Placing order..." : `✅ Confirm order — ${bn(total)} Tk`}
      </button>
    </Page>
  );
}

/* ================= SUCCESS ================= */

export function ShopSuccess({ id }: { id: string }) {
  const { base, store } = useDemo();
  const { accent, card, sub } = useSkin();
  const sp = useSearchParams();
  const realNo = sp.get("no");
  const o = store.orders.find((x) => x.id === id);
  if (!o) {
    return (
      <Page narrow>
        <Empty emoji="🔍" text="Order not found" />
        <div className="text-center">
          <Link href={`${base}/shop`} className="btn-demo" style={{ background: accent }}>
            🛍️ Back to shop
          </Link>
        </div>
      </Page>
    );
  }
  return (
    <Page narrow>
      <div className="py-6 text-center">
        <p className="text-6xl">🎉</p>
        <h1 className="mt-3 text-2xl font-black text-emerald-400">Order successful!</h1>
        <p className={`mt-1 text-sm ${sub}`}>Thank you {o.name}! You will get a call soon.</p>
      </div>
      <div className={`space-y-2 p-5 ${card}`}>
        <div>
          <p className={`text-xs ${sub}`}>Order number</p>
          <p className="font-mono text-lg font-black" style={{ color: accent }}>
            {realNo || o.id}
          </p>
        </div>
        <div className="space-y-1.5 border-t border-white/10 pt-3">
          {o.items.map((i) => (
            <div key={i.id} className="flex items-center justify-between text-sm">
              <span>
                {i.e} {i.n} <span className={sub}>× {bn(i.qty)}</span>
              </span>
              <b>{bn(i.p * i.qty)} Tk</b>
            </div>
          ))}
        </div>
        <div className="flex justify-between border-t border-white/10 pt-2">
          <span className="font-bold">Total</span>
          <span className="font-black" style={{ color: accent }}>
            {bn(o.total)} Tk
          </span>
        </div>
        <p className={`text-xs ${sub}`}>💰 {o.pay}</p>
        <p className={`text-xs ${sub}`}>📍 {o.address}</p>
      </div>
      <div className={`mt-4 p-5 ${card}`}>
        <Timeline active={0} />
      </div>
      <div className="mt-5 flex gap-2">
        <Link href={`${base}/track`} className="btn-demo-ghost flex-1 text-center">
          📍 Track
        </Link>
        <Link href={`${base}/shop`} className="btn-demo flex-1 text-center" style={{ background: accent }}>
          🛍️ Shop more
        </Link>
      </div>
      <p className={`mt-3 text-center text-[11px] ${sub}`}>💡 Demo order — on the real site an SMS/email confirmation will be sent.</p>
    </Page>
  );
}

/* ================= TRACK ================= */

export function ShopTrack() {
  const { base, store } = useDemo();
  const { accent, card, sub } = useSkin();
  const [val, setVal] = useState("");
  const [searched, setSearched] = useState<string | null>(null);
  const found = searched ? store.orders.find((o) => o.id.trim().toLowerCase() === searched.trim().toLowerCase()) : undefined;
  return (
    <Page narrow>
      <Back href={base} label="Home" />
      <SectionTitle t="📍 Order tracking" sub="Search by order number" />
      <div className="flex gap-2">
        <DField value={val} onChange={(e) => setVal(e.target.value)} placeholder="e.g. DM-20261011-X7K2" className="font-mono" />
        <button onClick={() => setSearched(val)} className="btn-demo shrink-0" style={{ background: accent }}>
          🔍 Search
        </button>
      </div>
      {searched !== null &&
        (found ? (
          <div className={`mt-4 space-y-3 p-5 ${card}`}>
            <div className="flex items-center justify-between">
              <p className="font-mono text-sm font-black" style={{ color: accent }}>
                {found.id}
              </p>
              <StatusBadge s={found.status} />
            </div>
            <Timeline active={0} />
            <div className={`border-t border-white/10 pt-3 text-xs ${sub}`}>
              <p>
                📦 {bn(found.items.reduce((s, i) => s + i.qty, 0))} Product • <b>{bn(found.total)} Tk</b>
              </p>
              <p className="mt-1">📍 {found.address}</p>
              <p className="mt-1">🗓️ {new Date(found.date).toLocaleDateString("en-GB")}</p>
            </div>
          </div>
        ) : (
          <p className={`mt-4 rounded-2xl p-4 text-center text-sm ${card}`}>❌ No order found for this number</p>
        ))}
    </Page>
  );
}

/* ================= SEARCH ================= */

export function ShopSearch() {
  const { def, base } = useDemo();
  const { L } = useDL();
  const products = useProducts();
  const router = useRouter();
  const sp = useSearchParams();
  const q = (sp.get("q") ?? "").trim();
  const [val, setVal] = useState(q);
  const res = products.filter((p) => !q || (p.n + " " + p.c).includes(q));
  return (
    <Page>
      <Back href={base} label={L("Home", "হোম")} />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          router.push(`${base}/search?q=${encodeURIComponent(val.trim())}`);
        }}
        className="mb-5 flex gap-2"
      >
        <DField value={val} onChange={(e) => setVal(e.target.value)} placeholder={L("🔍 Search products...", "🔍 পণ্য খুঁজুন...")} />
        <button type="submit" className="btn-demo shrink-0" style={{ background: def.accent }}>
          {L("Search", "খুঁজুন")}
        </button>
      </form>
      {q ? (
        <>
          <SectionTitle t={L(`"${q}" — ${bn(res.length)} results`, `"${q}" — ${bn(res.length)}টি ফলাফল`)} />
          {res.length === 0 ? (
            <Empty emoji="🔍" text={L("Nothing found — try another name", "কিছু পাওয়া যায়নি — অন্য নামে খুঁজুন")} />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {res.map((p) => (
                <ProductCard key={p.id} p={p} />
              ))}
            </div>
          )}
        </>
      ) : (
        <Empty emoji="🔍" text={L("Type a product name to search", "খুঁজতে চান এমন পণ্যের নাম লিখুন")} />
      )}
    </Page>
  );
}

/* ================= OFFERS ================= */

export function ShopOffers() {
  const { def, base } = useDemo();
  const products = useProducts();
  const { accent, card, sub } = useSkin();
  const { L } = useDL();
  const [copied, setCopied] = useState("");
  const deals = products.filter((p) => p.oldPrice);
  const coupons = [
    { code: "WELCOME10", d: L("10% off your first order", "প্রথম অর্ডারে ১০% ছাড়") },
    { code: "SAVE20", d: L(`20% off orders over ${bn(2000)}+ Tk`, `${bn(2000)}+ টাকার অর্ডারে ২০% ছাড়`) },
  ];
  function copy(code: string) {
    try {
      if (navigator.clipboard) navigator.clipboard.writeText(code).catch(() => {});
      else {
        const ta = document.createElement("textarea");
        ta.value = code;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
    } catch {}
    setCopied(code);
    setTimeout(() => setCopied(""), 1500);
  }
  return (
    <Page>
      <Back href={base} label={L("Home", "হোম")} />
      <SectionTitle t={L("🎁 Offers & coupons", "🎁 অফার ও কুপন")} sub={L("Limited-time discounts", "সীমিত সময়ের ছাড়")} />
      <div className="mb-6 grid gap-2 sm:grid-cols-2">
        {coupons.map((c) => (
          <button key={c.code} onClick={() => copy(c.code)} className={`flex items-center justify-between p-4 text-left transition hover:-translate-y-0.5 ${card}`}>
            <div>
              <p className="font-mono text-lg font-black" style={{ color: accent }}>
                {c.code}
              </p>
              <p className={`text-xs ${sub}`}>{c.d}</p>
            </div>
            <span className="rounded-xl px-3 py-2 text-xs font-black text-white" style={{ background: accent }}>
              {copied === c.code ? L("✅ Copied!", "✅ কপি!") : L("📋 Copy", "📋 কপি")}
            </span>
          </button>
        ))}
      </div>
      <SectionTitle t={L("🔥 Discounted products", "🔥 ছাড়ের পণ্য")} />
      {deals.length === 0 ? (
        <Empty emoji="🎁" text={L("No discounts right now", "এই মুহূর্তে কোনো ছাড় নেই")} />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {deals.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      )}
    </Page>
  );
}

/* ================= AUTH ================= */

export function ShopLogin() {
  const { base, store } = useDemo();
  const { accent } = useSkin();
  const [phone, setPhone] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  function submit() {
    const err = store.login(phone, pass);
    if (err) return setError(err);
    router.push(`${base}/account`);
  }
  return (
    <Page narrow>
      <Back href={base} label="Home" />
      <div className="py-6 text-center">
        <p className="text-5xl">🔐</p>
        <h1 className="mt-2 text-xl font-black">Log in</h1>
      </div>
      <div className="space-y-3">
        <DField value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Mobile number (01XXXXXXXXX)" inputMode="numeric" />
        <DField value={pass} onChange={(e) => setPass(e.target.value)} placeholder="Password" type="password" />
      </div>
      {error && <p className="mt-3 rounded-xl bg-red-500/10 px-4 py-2.5 text-xs font-bold text-red-400">⚠️ {error}</p>}
      <button onClick={submit} className="btn-demo mt-4 w-full !py-3.5" style={{ background: accent }}>
        ➡️ Log in
      </button>
      <p className="mt-3 text-center text-sm">
        No account?{" "}
        <Link href={`${base}/signup`} className="font-bold underline" style={{ color: accent }}>
          Sign up
        </Link>
      </p>
    </Page>
  );
}

export function ShopSignup() {
  const { base, store } = useDemo();
  const { accent, sub } = useSkin();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  function submit() {
    const err = store.signup(name, phone, pass);
    if (err) return setError(err);
    router.push(`${base}/account`);
  }
  return (
    <Page narrow>
      <Back href={`${base}/login`} label="Log in" />
      <div className="py-6 text-center">
        <p className="text-5xl">✨</p>
        <h1 className="mt-2 text-xl font-black">New account</h1>
        <p className={`mt-1 text-sm ${sub}`}>
          🎁 On signup, a <b style={{ color: accent }}>{bn(5000)} Tk</b> bonus!
        </p>
      </div>
      <div className="space-y-3">
        <DField value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name *" />
        <DField value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Mobile number * (01XXXXXXXXX)" inputMode="numeric" />
        <DField value={pass} onChange={(e) => setPass(e.target.value)} placeholder="Password * (at least 4 characters)" type="password" />
      </div>
      {error && <p className="mt-3 rounded-xl bg-red-500/10 px-4 py-2.5 text-xs font-bold text-red-400">⚠️ {error}</p>}
      <button onClick={submit} className="btn-demo mt-4 w-full !py-3.5" style={{ background: accent }}>
        🎉 Sign up
      </button>
      <p className="mt-3 text-center text-sm">
        Already have an account?{" "}
        <Link href={`${base}/login`} className="font-bold underline" style={{ color: accent }}>
          Log in
        </Link>
      </p>
    </Page>
  );
}

/* ================= ACCOUNT ================= */

export function ShopAccount() {
  const { base, store } = useDemo();
  const { accent, card, sub } = useSkin();
  const [addr, setAddr] = useState(store.user?.address ?? "");
  const [saved, setSaved] = useState(false);
  if (!store.user) {
    return (
      <Page narrow>
        <Back href={base} label="Home" />
        <SectionTitle t="👤 Account" />
        <LoginHint />
        <div className="mt-4 flex gap-2">
          <Link href={`${base}/login`} className="btn-demo flex-1 text-center" style={{ background: accent }}>
            🔐 Log in
          </Link>
          <Link href={`${base}/signup`} className="btn-demo-ghost flex-1 text-center">
            ✨ Sign up
          </Link>
        </div>
      </Page>
    );
  }
  const u = store.user;
  const links = [
    { href: `${base}/orders`, e: "📦", t: "My orders", s: `${bn(store.orders.filter((o) => o.userPhone === u.phone || o.userPhone === "guest").length)}` },
    { href: `${base}/wallet`, e: "👛", t: "Wallet", s: `${bn(store.wallet)} Tk` },
  ];
  if (store.bookings.length > 0) links.push({ href: `${base}/bookings`, e: "📅", t: "My bookings", s: `${bn(store.bookings.length)}` });
  return (
    <Page narrow>
      <Back href={base} label="Home" />
      <div className={`flex items-center gap-4 p-5 ${card}`}>
        <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full text-2xl font-black text-white" style={{ background: accent }}>
          {u.name.charAt(0)}
        </div>
        <div>
          <p className="text-lg font-black">{u.name}</p>
          <p className={`text-sm ${sub}`}>📱 {u.phone}</p>
        </div>
      </div>
      <div className={`mt-3 p-5 ${card}`}>
        <p className="text-sm font-bold">📍 Delivery address</p>
        <DArea value={addr} onChange={(e) => setAddr(e.target.value)} placeholder="Enter address..." rows={2} className="mt-2" />
        <button
          onClick={() => {
            store.saveAddress(addr.trim());
            setSaved(true);
            setTimeout(() => setSaved(false), 1500);
          }}
          className="btn-demo mt-2 !py-2 !text-[13px]"
          style={{ background: accent }}
        >
          {saved ? "✅ Saved!" : "💾 Save address"}
        </button>
      </div>
      <div className="mt-3 space-y-2">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className={`flex items-center justify-between p-4 transition hover:-translate-y-0.5 ${card}`}>
            <span className="font-bold">
              {l.e} {l.t}
            </span>
            <span className={`text-sm ${sub}`}>
              {l.s} <span>→</span>
            </span>
          </Link>
        ))}
      </div>
      <button
        onClick={() => store.logout()}
        className="mt-4 w-full rounded-2xl border border-red-500/40 py-3 text-sm font-black text-red-400 transition hover:bg-red-500/10"
      >
        🚪 Log out
      </button>
    </Page>
  );
}

/* ================= ORDERS ================= */

export function ShopOrders() {
  const { base, store } = useDemo();
  const { accent, card, sub } = useSkin();
  const list = store.orders.filter((o) => (store.user ? o.userPhone === store.user.phone || o.userPhone === "guest" : o.userPhone === "guest"));
  return (
    <Page narrow>
      <Back href={`${base}/account`} label="Account" />
      <SectionTitle t="📦 My orders" sub={list.length > 0 ? `${bn(list.length)}` : undefined} />
      {list.length === 0 ? (
        <>
          <Empty emoji="📭" text="You have not placed any orders yet" />
          <div className="text-center">
            <Link href={`${base}/shop`} className="btn-demo" style={{ background: accent }}>
              🛍️ Start shopping
            </Link>
          </div>
        </>
      ) : (
        <div className="space-y-2">
          {list.map((o) => (
            <Link key={o.id} href={`${base}/orders/${o.id}`} className={`block p-4 transition hover:-translate-y-0.5 ${card}`}>
              <div className="flex items-center justify-between">
                <p className="font-mono text-xs font-black" style={{ color: accent }}>
                  {o.id}
                </p>
                <StatusBadge s={o.status} />
              </div>
              <p className={`mt-1.5 text-xs ${sub}`}>
                {new Date(o.date).toLocaleDateString("en-GB")} • {bn(o.items.reduce((s, i) => s + i.qty, 0))} Product • {o.pay}
              </p>
              <p className="mt-1 font-black">{bn(o.total)} Tk</p>
            </Link>
          ))}
        </div>
      )}
    </Page>
  );
}

export function ShopOrderDetail({ id }: { id: string }) {
  const { base, store } = useDemo();
  const { accent, card, sub } = useSkin();
  const o = store.orders.find((x) => x.id === id);
  if (!o) {
    return (
      <Page narrow>
        <Empty emoji="🔍" text="Order not found" />
        <div className="text-center">
          <Link href={`${base}/orders`} className="btn-demo" style={{ background: accent }}>
            📦 Order list
          </Link>
        </div>
      </Page>
    );
  }
  return (
    <Page narrow>
      <Back href={`${base}/orders`} label="Order list" />
      <div className={`space-y-3 p-5 ${card}`}>
        <div className="flex items-center justify-between">
          <p className="font-mono text-sm font-black" style={{ color: accent }}>
            {o.id}
          </p>
          <StatusBadge s={o.status} />
        </div>
        <Timeline active={0} />
        <div className="space-y-2 border-t border-white/10 pt-3">
          {o.items.map((i) => (
            <div key={i.id} className="flex items-center gap-3 text-sm">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/5 text-2xl">{i.e}</span>
              <div className="flex-1">
                <p className="font-bold">{i.n}</p>
                <p className={`text-xs ${sub}`}>
                  {bn(i.p)} Tk × {bn(i.qty)}
                </p>
              </div>
              <b>{bn(i.p * i.qty)} Tk</b>
            </div>
          ))}
        </div>
        <div className="flex justify-between border-t border-white/10 pt-3">
          <span className="font-bold">Total</span>
          <span className="text-lg font-black" style={{ color: accent }}>
            {bn(o.total)} Tk
          </span>
        </div>
        <div className={`space-y-1 border-t border-white/10 pt-3 text-xs ${sub}`}>
          <p>👤 {o.name} • 📱 {o.phone}</p>
          <p>📍 {o.address}</p>
          <p>💰 {o.pay}</p>
          <p>🗓️ {new Date(o.date).toLocaleDateString("en-GB")}</p>
        </div>
      </div>
      <Link href={`${base}/track`} className="btn-demo mt-4 block w-full text-center" style={{ background: accent }}>
        📍 Track live
      </Link>
    </Page>
  );
}

/* ================= WALLET ================= */

export function ShopWallet() {
  const { base, store } = useDemo();
  const { accent, card, sub } = useSkin();
  const { L, cur, lang } = useDL();
  return (
    <Page narrow>
      <Back href={`${base}/account`} label={L("Account", "অ্যাকাউন্ট")} />
      <SectionTitle t={L("👛 Wallet", "👛 ওয়ালেট")} />
      <div className={`p-6 text-center ${card}`} style={{ background: `linear-gradient(135deg, ${accent}22, transparent)` }}>
        <p className={`text-xs ${sub}`}>{L("Current balance", "বর্তমান ব্যালেন্স")}</p>
        <p className="mt-1 text-4xl font-black" style={{ color: accent }}>
          {bn(store.wallet)} {cur}
        </p>
        <div className="mt-4 flex justify-center gap-2">
          {[1000, 2000, 5000].map((a) => (
            <Btn key={a} accent={accent} small onClick={() => store.topUp(a)}>
              +{bn(a)}
            </Btn>
          ))}
        </div>
        <p className={`mt-2 text-[11px] ${sub}`}>{L("💡 Demo top-up — no real money will be added", "💡 ডেমো টপ-আপ — কোনো আসল টাকা যোগ হবে না")}</p>
      </div>
      <p className="mb-2 mt-5 text-sm font-bold">{L("🧾 Transaction history", "🧾 লেনদেন হিস্ট্রি")}</p>
      {store.txs.length === 0 ? (
        <Empty emoji="🧾" text={L("No transactions yet", "এখনো কোনো লেনদেন হয়নি")} />
      ) : (
        <div className="space-y-2">
          {store.txs.map((t, i) => (
            <div key={i} className={`flex items-center justify-between p-3.5 ${card}`}>
              <div>
                <p className="text-sm font-bold">{t.label}</p>
                <p className={`text-[11px] ${sub}`}>{new Date(t.date).toLocaleDateString(lang === "bn" ? "bn-BD" : "en-US")}</p>
              </div>
              <p className={`text-sm font-black ${t.amount >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {t.amount >= 0 ? "+" : "−"}
                {bn(Math.abs(t.amount))} {cur}
              </p>
            </div>
          ))}
        </div>
      )}
    </Page>
  );
}

/* ================= ABOUT / CONTACT ================= */

export function ShopAbout() {
  const { def, base } = useDemo();
  const products = useProducts();
  const { accent, card, sub } = useSkin();
  const { L, dig } = useDL();
  const avg = products.length ? products.reduce((s, p) => s + p.rating, 0) / products.length : 0;
  return (
    <Page>
      <Back href={base} label={L("Home", "হোম")} />
      <div className="py-6 text-center">
        <p className="text-6xl">{def.logoEmoji}</p>
        <h1 className="mt-2 text-2xl font-black">{def.name}</h1>
      </div>
      <div className={`p-5 ${card}`}>
        <p className={`text-sm leading-relaxed ${sub}`}>{def.about}</p>
      </div>
      <div className={`mt-3 grid grid-cols-3 gap-2 p-4 text-center ${card}`}>
        {[
          [bn(products.length), L("Products", "পণ্য")],
          [bn(def.cats.length - 1 > 0 ? def.cats.length - 1 : def.cats.length), L("Categories", "ক্যাটাগরি")],
          [`${dig(avg.toFixed(1))}★`, L("Avg rating", "গড় রেটিং")],
        ].map(([v, t]) => (
          <div key={t}>
            <p className="text-2xl font-black" style={{ color: accent }}>
              {v}
            </p>
            <p className={`text-xs ${sub}`}>{t}</p>
          </div>
        ))}
      </div>
      <div className={`mt-3 space-y-1.5 p-5 text-sm ${card}`}>
        <p>📞 {def.contact}</p>
        <p>📍 {def.address}</p>
        <p>🕒 {def.hours}</p>
      </div>
      <Link href={`${base}/contact`} className="btn-demo mt-4 block w-full text-center" style={{ background: accent }}>
        {L("💬 Contact us", "💬 যোগাযোগ করুন")}
      </Link>
    </Page>
  );
}

export function ShopContact() {
  const { def, base } = useDemo();
  const { accent, card } = useSkin();
  const { L } = useDL();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [msg, setMsg] = useState("");
  const [sent, setSent] = useState(false);
  const infos = [
    { e: "📞", t: L("Contact", "যোগাযোগ"), v: def.contact },
    { e: "📍", t: L("Address", "ঠিকানা"), v: def.address },
    { e: "🕒", t: L("Opening hours", "খোলার সময়"), v: def.hours },
  ];
  return (
    <Page narrow>
      <Back href={base} label={L("Home", "হোম")} />
      <SectionTitle t={L("💬 Contact us", "💬 যোগাযোগ")} sub={L("Message us with any question", "যেকোনো প্রশ্নে মেসেজ করুন")} />
      <div className="grid gap-2 sm:grid-cols-3">
        {infos.map((x) => (
          <div key={x.t} className={`p-4 text-center ${card}`}>
            <p className="text-2xl">{x.e}</p>
            <p className="mt-1 text-xs font-bold">{x.t}</p>
            <p className="mt-0.5 text-xs opacity-70">{x.v}</p>
          </div>
        ))}
      </div>
      {sent ? (
        <p className={`mt-4 rounded-2xl p-5 text-center text-sm font-bold text-emerald-400 ${card}`}>
          {L("✅ Message sent! (Demo)", "✅ মেসেজ পাঠানো হয়েছে! (ডেমো)")}
          <button onClick={() => setSent(false)} className="mt-2 block w-full text-xs font-bold underline opacity-70">
            {L("Send another message", "আরেকটি মেসেজ পাঠান")}
          </button>
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          <DField value={name} onChange={(e) => setName(e.target.value)} placeholder={L("Your name *", "আপনার নাম *")} />
          <DField value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={L("Mobile number *", "মোবাইল নম্বর *")} inputMode="numeric" />
          <DArea value={msg} onChange={(e) => setMsg(e.target.value)} placeholder={L("Write your message... *", "আপনার মেসেজ লিখুন... *")} rows={4} />
          <button
            onClick={() => {
              if (name.trim().length >= 3 && msg.trim().length >= 5) setSent(true);
            }}
            className="btn-demo w-full !py-3.5"
            style={{ background: accent }}
          >
            {L("📨 Send message", "📨 মেসেজ পাঠান")}
          </button>
        </div>
      )}
    </Page>
  );
}

/* ---------- Extra pages (30+ page target) ---------- */

export function ShopWishlist() {
  const { base } = useDemo();
  const { accent } = useSkin();
  const { L } = useDL();
  const products = useProducts();
  // Wishlist stored in localStorage via store
  const { store } = useDemo();
  const [wishlist] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(`wishlist:${store ? "x" : "x"}`) || "[]"); } catch { return []; }
  });
  const items = products.filter((p) => wishlist.includes(p.id));
  return (
    <Page>
      <Back href={base} label={L("Home", "হোম")} />
      <SectionTitle t={L("❤️ Wishlist", "❤️ উইশলিস্ট")} sub={L(`${bn(items.length)} products`, `${bn(items.length)}টি পণ্য`)} />
      {items.length === 0 ? (
        <Empty emoji="💔" text={L("Wishlist is empty — tap the heart on a product you like", "উইশলিস্ট খালি — পছন্দের পণ্যে হার্ট চাপুন")} />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {items.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      )}
    </Page>
  );
}

export function ShopFaq() {
  const { base, def } = useDemo();
  const { card } = useSkin();
  const { L } = useDL();
  const [open, setOpen] = useState<number | null>(0);
  const faqs: [string, string, string, string][] = [
    ["🛒 How do I order?", "🛒 অর্ডার কীভাবে করবো?", "Add a product to cart → enter name, mobile, address at checkout → confirm the order.", "পছন্দের পণ্য কার্টে যোগ করুন → চেকআউটে নাম, মোবাইল, ঠিকানা দিন → অর্ডার কনফার্ম করুন।"],
    ["🚚 How long does delivery take?", "🚚 ডেলিভারি কতদিনে?", "24–48 hours in Dhaka, 3–5 days outside Dhaka. Free delivery over 1,000 Tk.", "ঢাকায় ২৪-৪৮ ঘণ্টা, ঢাকার বাইরে ৩-৫ দিন। ১,০০০ টাকার বেশি অর্ডারে ডেলিভারি ফ্রি।"],
    ["💵 What payment methods are there?", "💵 পেমেন্ট মাধ্যম কী কী?", "Cash on delivery, bKash, Nagad, Rocket — all supported.", "ক্যাশ অন ডেলিভারি, বিকাশ, নগদ, রকেট — সব সাপোর্ট করে।"],
    ["↩️ What is the return policy?", "↩️ রিটার্ন পলিসি কী?", "Any defective product can be returned/exchanged within 7 days.", "৭ দিনের মধ্যে যেকোনো ত্রুটিপূর্ণ পণ্য রিটার্ন/এক্সচেঞ্জ করা যায়।"],
    ["📞 How do I contact?", "📞 যোগাযোগ কীভাবে?", `Call directly: ${def.contact} (${def.hours})`, `সরাসরি কল করুন: ${def.contact} (${def.hours})`],
  ];
  return (
    <Page narrow>
      <Back href={base} label={L("Home", "হোম")} />
      <SectionTitle t={L("❓ Frequently asked questions", "❓ সচরাচর জিজ্ঞাসা")} />
      <div className="space-y-2">
        {faqs.map(([qEn, qBn, aEn, aBn], i) => (
          <div key={i} className={card}>
            <button onClick={() => setOpen(open === i ? null : i)} className="flex w-full items-center justify-between p-4 text-left text-sm font-bold">
              {L(qEn, qBn)}<span>{open === i ? "−" : "+"}</span>
            </button>
            {open === i && <p className="px-4 pb-4 text-sm opacity-70">{L(aEn, aBn)}</p>}
          </div>
        ))}
      </div>
    </Page>
  );
}

export function ShopPolicy({ kind }: { kind: "shipping" | "returns" | "privacy" | "terms" }) {
  const { base, def } = useDemo();
  const { card } = useSkin();
  const { L } = useDL();
  const content: Record<string, [[string, string], [string, string][]]> = {
    shipping: [["🚚 Delivery policy", "🚚 ডেলিভারি নীতি"], [
      ["Delivery within 24–48 hours inside Dhaka.", "ঢাকার ভিতরে ২৪-৪৮ ঘণ্টায় ডেলিভারি।"],
      ["3–5 working days outside Dhaka.", "ঢাকার বাইরে ৩-৫ কর্মদিবস।"],
      ["Free delivery charge on orders over 1,000 Tk.", "১,০০০ টাকার বেশি অর্ডারে ডেলিভারি চার্জ ফ্রি।"],
      ["To track an order, enter your phone number on the 'Track order' page.", "অর্ডার ট্র্যাক করতে 'ট্র্যাক অর্ডার' পেজে ফোন নম্বর দিন।"],
    ]],
    returns: [["↩️ Returns & refunds", "↩️ রিটার্ন ও রিফান্ড"], [
      ["Defective products can be returned within 7 days.", "৭ দিনের মধ্যে ত্রুটিপূর্ণ পণ্য রিটার্ন করা যায়।"],
      ["The product must be unused and in its packaging.", "পণ্য অবশ্যই অব্যবহৃত ও প্যাকেজিংসহ থাকতে হবে।"],
      ["Refunds are sent to bKash/Nagad within 3–5 working days.", "রিফান্ড ৩-৫ কর্মদিবসে বিকাশ/নগদে পাঠানো হয়।"],
    ]],
    privacy: [["🔒 Privacy policy", "🔒 প্রাইভেসি পলিসি"], [
      ["Your information is used only for order processing.", "আপনার তথ্য শুধু অর্ডার প্রসেসিংয়ে ব্যবহার হয়।"],
      ["Information is not shared with third parties.", "তৃতীয় পক্ষের সাথে তথ্য শেয়ার করা হয় না।"],
      ["Contact us any time to delete your information.", "যেকোনো সময় তথ্য মুছতে যোগাযোগ করুন।"],
    ]],
    terms: [["📜 Terms & conditions", "📜 শর্তাবলী"], [
      [`The following terms apply to purchases from ${def.name}.`, `${def.name} থেকে কেনাকাটায় নিচের শর্ত প্রযোজ্য।`],
      ["Prices and stock may change — confirmed at order time.", "দাম ও স্টক পরিবর্তনশীল — অর্ডারের সময় কনফার্ম হয়।"],
      ["Orders may be cancelled if wrong information is given.", "ভুল তথ্য দিলে অর্ডার বাতিল হতে পারে।"],
    ]],
  };
  const [[titleEn, titleBn], pointPairs] = content[kind];
  const title = L(titleEn, titleBn);
  const points = pointPairs.map(([en, bn]) => L(en, bn));
  return (
    <Page narrow>
      <Back href={base} label={L("Home", "হোম")} />
      <SectionTitle t={title} />
      <div className={`space-y-2.5 p-5 ${card}`}>
        {points.map((pt, i) => <p key={i} className="text-sm leading-relaxed">• {pt}</p>)}
      </div>
    </Page>
  );
}

export function ShopDeals() {
  const { base } = useDemo();
  const { L } = useDL();
  const products = useProducts();
  const deals = products.filter((p) => p.oldPrice);
  return (
    <Page>
      <Back href={base} label={L("Home", "হোম")} />
      <SectionTitle t={L("⚡ Today's deals", "⚡ আজকের ডিল")} sub={L("Limited stock!", "সীমিত স্টক!")} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {deals.map((p) => <ProductCard key={p.id} p={p} />)}
      </div>
      {deals.length === 0 && <Empty emoji="🏷️" text={L("No deals right now", "এখন কোনো ডিল নেই")} />}
    </Page>
  );
}

export function ShopNew() {
  const { base } = useDemo();
  const { L } = useDL();
  const products = useProducts();
  const items = [...products].reverse().slice(0, 12);
  return (
    <Page>
      <Back href={base} label={L("Home", "হোম")} />
      <SectionTitle t={L("🆕 New products", "🆕 নতুন পণ্য")} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {items.map((p) => <ProductCard key={p.id} p={p} />)}
      </div>
    </Page>
  );
}

export function ShopBestsellers() {
  const { base } = useDemo();
  const { L } = useDL();
  const products = useProducts();
  const items = [...products].sort((a, b) => b.reviews - a.reviews).slice(0, 12);
  return (
    <Page>
      <Back href={base} label={L("Home", "হোম")} />
      <SectionTitle t={L("🏆 Bestsellers", "🏆 বেস্টসেলার")} sub={L("Best selling", "সবচেয়ে বেশি বিক্রিত")} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {items.map((p) => <ProductCard key={p.id} p={p} />)}
      </div>
    </Page>
  );
}

export type { DemoProduct };
