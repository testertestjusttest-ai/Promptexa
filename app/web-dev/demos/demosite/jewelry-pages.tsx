"use client";

/** AURELIA — luxury fine-jewelry demo (English, dark-luxury gold theme).
 * A faithful recreation of the Laravel AURELIA site inside the DemoSite
 * framework: home, collection with category filter, product detail,
 * atelier, concierge contact, bag / checkout / orders, auth and an
 * atelier admin. Photos are served from /jw-img (base64 data route).
 * All demo data is browser-local.
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useDemo, ORDER_STATUSES } from "./store";
import type { DemoProduct } from "./types";
import { Page, Back, Empty } from "./ui";

/* ---------------- theme helpers ---------------- */

const GOLD = "#c9a24b";
const GOLDLIGHT = "#e8cf8f";
const CREAM = "#f5efe4";
const INK = "#0b0b0f";
const COAL = "#121218";
const SERIF = { fontFamily: "'Playfair Display', Georgia, 'Times New Roman', serif" } as const;
const SANS = { fontFamily: "'Jost', 'Segoe UI', sans-serif" } as const;

const IMG = (n: string) => `/jw-img/${n}`;
const usd = (v: number) => `$${v.toLocaleString("en-US")}`;
const panel = "border border-white/10 bg-[#121218]";
const sub = "text-[#f5efe4]/60";
const label = "text-[11px] font-medium uppercase tracking-[0.28em] text-[#e8cf8f]";
const inputCls = "w-full border border-white/15 bg-[#0b0b0f] px-4 py-3 text-sm text-[#f5efe4] outline-none transition placeholder:text-[#f5efe4]/30 focus:border-[#c9a24b]";

/** Fonts + AURELIA keyframes (mirrors the Laravel layout's <style> block). */
export function JwStyle() {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Jost:wght@300;400;500;600&display=swap"
        rel="stylesheet"
      />
      <style>{`
        .jw-gold-text { background: linear-gradient(120deg, #a87f2d, #e8cf8f 45%, #c9a24b 70%, #f4e5bb); -webkit-background-clip: text; background-clip: text; color: transparent; }
        .jw-thin-line { background: linear-gradient(90deg, transparent, rgba(201,162,75,.7), transparent); height: 1px; }
        @keyframes jwHeroZoom { from { transform: scale(1); } to { transform: scale(1.12); } }
        .jw-hero-zoom { animation: jwHeroZoom 14s ease-in-out infinite alternate; }
        @keyframes jwFadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: none; } }
        .jw-fade-up { animation: jwFadeUp 1.1s ease both; }
        .jw-fade-up-1 { animation: jwFadeUp 1.1s .15s ease both; }
        .jw-fade-up-2 { animation: jwFadeUp 1.1s .3s ease both; }
        .jw-card-img { transition: transform 1.2s cubic-bezier(.19,1,.22,1); }
        .jw-product-card { transition: border-color .4s ease, transform .4s ease; }
        .jw-product-card:hover { border-color: rgba(201,162,75,.55); transform: translateY(-4px); }
        .jw-product-card:hover .jw-card-img { transform: scale(1.08); }
      `}</style>
    </>
  );
}

function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ob = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVis(true); ob.disconnect(); } },
      { threshold: 0.1 }
    );
    ob.observe(el);
    return () => ob.disconnect();
  }, []);
  return (
    <div ref={ref} className={`${className} transition-all duration-[900ms] ${vis ? "translate-y-0 opacity-100" : "translate-y-7 opacity-0"}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

/* ---------------- content ---------------- */

const FEATURED_IDS = ["p0", "p1", "p2", "p4"];

const PRODUCT_POINTS = [
  "Certified stone with full documentation",
  "Handmade in the Aurelia atelier",
  "Insured worldwide delivery in 5–7 days",
  "Lifetime resizing and care promise",
];

const FAQS = [
  { q: "Are your stones certified?", a: "Yes — every diamond and coloured stone arrives with independent certification and a traceable origin. No exceptions, no stories." },
  { q: "How long does a bespoke commission take?", a: "A private consultation, then a sketch and a quote — bespoke timing depends on the piece and is confirmed at consultation (demo estimate only)." },
  { q: "Do you deliver internationally?", a: "We deliver worldwide with full insurance in 5–7 business days. Every parcel is tracked and requires a signature." },
  { q: "What does the lifetime promise cover?", a: "Resizing, re-polishing, claw checks and repairs — free for the life of the piece, whoever in your family is wearing it." },
  { q: "Is your gold really recycled?", a: "We offer recycled-metal options in 18k gold and platinum — ask the atelier which pieces use them." },
];

/* ---------------- concierge messages (browser-local) ---------------- */

export type JwMessage = { name: string; email: string; subject: string; body: string; date: number };

export function loadMessages(): JwMessage[] {
  try {
    const raw = localStorage.getItem("aurelia_messages");
    return raw ? (JSON.parse(raw) as JwMessage[]) : [];
  } catch {
    return [];
  }
}

function saveMessage(m: JwMessage) {
  try {
    localStorage.setItem("aurelia_messages", JSON.stringify([m, ...loadMessages()]));
  } catch { /* ignore */ }
}

/* ---------------- shared bits ---------------- */

function JwCard({ p }: { p: DemoProduct }) {
  const { base, store } = useDemo();
  const [added, setAdded] = useState(false);
  return (
    <div className={`jw-product-card group flex flex-col overflow-hidden ${panel}`}>
      <Link href={`${base}/p/${p.id}`} className="block overflow-hidden">
        <div className="aspect-[4/5] overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={p.img ?? IMG("hero.webp")} alt={p.n} loading="lazy" className="jw-card-img h-full w-full object-cover" />
        </div>
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-1 text-[11px] uppercase tracking-[0.28em] text-[#c9a24b]">{p.c}</div>
        <Link href={`${base}/p/${p.id}`} style={SERIF} className="text-xl text-[#f5efe4] transition group-hover:text-[#e8cf8f]">
          {p.n}
        </Link>
        <div className="mt-2 flex items-center justify-between">
          <span className="tracking-wider text-[#e8cf8f]">
            {p.priceNote ? `${p.priceNote} ` : ""}{usd(p.p)}
          </span>
          <Link href={`${base}/p/${p.id}`} className="text-[11px] uppercase tracking-[0.22em] text-[#f5efe4]/50 transition hover:text-[#e8cf8f]">
            View →
          </Link>
        </div>
        <button
          onClick={() => {
            store.addToCart({ id: p.id, n: p.n, p: p.p, e: p.e });
            setAdded(true);
            setTimeout(() => setAdded(false), 1600);
          }}
          className="mt-4 border border-[#c9a24b]/60 py-2 text-[11px] font-medium uppercase tracking-[0.25em] text-[#e8cf8f] transition hover:bg-[#c9a24b] hover:text-[#0b0b0f]"
        >
          {added ? "✓ Added to Bag" : "Add to Bag"}
        </button>
      </div>
    </div>
  );
}

function SectionHead({ kicker, title, children }: { kicker: string; title: React.ReactNode; children?: React.ReactNode }) {
  return (
    <div className="mb-12 text-center">
      <div className="mb-3 text-[12px] uppercase tracking-[0.45em] text-[#e8cf8f]">{kicker}</div>
      <h2 style={SERIF} className="text-4xl text-[#f5efe4] md:text-5xl">{title}</h2>
      <div className="jw-thin-line mx-auto mt-6 w-40" />
      {children}
    </div>
  );
}

function GoldBtn({ href, children, outline = false }: { href: string; children: React.ReactNode; outline?: boolean }) {
  return (
    <Link
      href={href}
      className={
        outline
          ? "inline-block border border-[#f5efe4]/30 px-8 py-3 text-[12px] uppercase tracking-[0.25em] transition hover:border-[#c9a24b] hover:text-[#e8cf8f]"
          : "inline-block bg-[#c9a24b] px-8 py-3 text-[12px] font-medium uppercase tracking-[0.25em] text-[#0b0b0f] transition hover:bg-[#e8cf8f]"
      }
    >
      {children}
    </Link>
  );
}

/* ---------------- HOME ---------------- */

export function JwHome() {
  const { def, base, store } = useDemo();
  const approvedTestimonials = (store.custom.customTestimonials ?? []).filter((t) => t.approved);
  const featured = FEATURED_IDS.map((id) => def.products.find((p) => p.id === id)).filter(Boolean) as DemoProduct[];
  return (
    <div style={SANS} className="bg-[#0b0b0f] font-light text-[#f5efe4]">
      <JwStyle />
      {/* HERO */}
      <section className="relative overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={IMG("hero.webp")} alt="The Aurelia Solitaire diamond ring" className="jw-hero-zoom absolute inset-0 h-full w-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0b0b0f]/70 via-[#0b0b0f]/35 to-[#0b0b0f]" />
        <div className="relative mx-auto max-w-6xl px-4 py-24 text-center lg:py-36">
          <div className="jw-fade-up mb-5 text-[12px] uppercase tracking-[0.45em] text-[#e8cf8f]">Demo Atelier — Fine Jewelry</div>
          <h1 style={SERIF} className="jw-fade-up-1 text-5xl leading-[1.05] md:text-7xl">
            Jewelry that outlives<br />
            <span className="jw-gold-text italic">the moment</span> it marks.
          </h1>
          <p className="jw-fade-up-2 mx-auto mt-6 max-w-xl text-lg font-light text-[#f5efe4]/70">
            Hand-finished rings, necklaces and bespoke commissions — designed in our atelier, made to be inherited.
          </p>
          <div className="jw-fade-up-2 mt-9 flex flex-wrap justify-center gap-4">
            <GoldBtn href={`${base}/shop`}>Explore the Collection</GoldBtn>
            <GoldBtn href={`${base}/contact`} outline>Book a Consultation</GoldBtn>
          </div>
        </div>
      </section>

      {/* ADMIN BANNERS (gold strip, only when the admin added banners) */}
      {(store.custom.customBanners ?? []).length > 0 && (
        <section className="border-b border-white/5 bg-[#121218]">
          <div className="mx-auto flex max-w-6xl flex-wrap justify-center gap-3 px-4 py-4 text-center">
            {(store.custom.customBanners ?? []).map((b) => (
              <span key={b.id} className="border border-[#c9a24b]/50 px-4 py-2 text-sm text-[#e8cf8f]">{b.emoji} {b.title}{b.sub ? ` — ${b.sub}` : ""}</span>
            ))}
          </div>
        </section>
      )}

      {/* STATS */}
      <section className="border-y border-white/5 bg-[#121218]">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 py-10 text-center md:grid-cols-4">
          {[
            ["6", "Pieces in the demo collection"],
            ["5", "Collections"],
            ["Demo", "No real stones sold"],
            ["Bespoke", "Made to order in the demo"],
          ].map(([v, t]) => (
            <Reveal key={t}>
              <div style={SERIF} className="jw-gold-text text-4xl">{v}</div>
              <div className="mt-1 text-[11px] uppercase tracking-[0.28em] text-[#f5efe4]/55">{t}</div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* FEATURED */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <Reveal>
          <SectionHead kicker="The Collection" title={<>Signature <span className="jw-gold-text italic">pieces</span></>} />
        </Reveal>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((p, i) => (
            <Reveal key={p.id} delay={i * 70}>
              <JwCard p={p} />
            </Reveal>
          ))}
        </div>
        <div className="mt-12 text-center">
          <GoldBtn href={`${base}/shop`} outline>View All Pieces</GoldBtn>
        </div>
      </section>

      {/* CRAFT */}
      <section className="border-y border-white/5 bg-[#121218]">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 lg:grid-cols-2">
          <Reveal className="overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={IMG("craft.webp")} alt="Master jeweller at the bench" className="aspect-[4/3] w-full object-cover transition duration-[1200ms] hover:scale-105" />
          </Reveal>
          <Reveal>
            <div className="mb-4 text-[12px] uppercase tracking-[0.45em] text-[#e8cf8f]">The Atelier</div>
            <h2 style={SERIF} className="text-4xl leading-snug">
              Made by hand,<br />checked by <span className="jw-gold-text italic">obsession</span>.
            </h2>
            <p className="mt-5 leading-relaxed text-[#f5efe4]/65">
              Every Aurelia piece in this demo story is finished by hand in the atelier and checked under magnification before it carries our name. We describe certified stones and recycled 18k gold settings — because the details you cannot see are the ones that decide whether a piece lasts a season or a century.
            </p>
            <ul className="mt-6 space-y-3 text-[#f5efe4]/75">
              {[
                "Certified stones with documentation",
                "Recycled-metal options in 18k gold and platinum",
                "Lifetime resizing, re-polishing and repair promise",
              ].map((t) => (
                <li key={t} className="flex gap-3"><span className="text-[#c9a24b]">✦</span> {t}</li>
              ))}
            </ul>
            <Link href={`${base}/about`} className="mt-8 inline-block border-b border-[#c9a24b]/60 pb-1 text-[12px] uppercase tracking-[0.25em] text-[#e8cf8f] transition hover:text-[#f5efe4]">
              Inside the atelier →
            </Link>
          </Reveal>
        </div>
      </section>

      {/* TESTIMONIALS — approved-only, starts empty; no seeded quotes (Phase 7) */}
      {approvedTestimonials.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-20">
          <Reveal>
            <SectionHead kicker="Client Stories" title={<>Worn, loved, <span className="jw-gold-text italic">handed down</span></>} />
          </Reveal>
          <div className="grid gap-6 md:grid-cols-3">
            {approvedTestimonials.map((t, i) => (
              <Reveal key={t.id} delay={i * 80}>
                <figure className={`flex h-full flex-col p-7 ${panel}`}>
                  <div className="mb-4 tracking-[0.3em] text-[#c9a24b]">★★★★★</div>
                  <blockquote className="flex-1 leading-relaxed text-[#f5efe4]/75">&ldquo;{t.text}&rdquo;</blockquote>
                  <figcaption className="mt-6">
                    <div style={SERIF} className="text-lg text-[#f5efe4]">{t.name}</div>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="relative overflow-hidden border-t border-white/5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={IMG("necklace.webp")} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0b0b0f] via-[#0b0b0f]/80 to-[#0b0b0f]/40" />
        <div className="relative mx-auto max-w-6xl px-4 py-24 text-center">
          <Reveal>
            <h2 style={SERIF} className="text-4xl md:text-5xl">Begin your <span className="jw-gold-text italic">bespoke</span> piece</h2>
            <p className="mx-auto mt-4 max-w-lg text-[#f5efe4]/65">A private consultation, then a sketch and a quote — bespoke timing is confirmed at consultation (demo estimate only).</p>
            <div className="mt-8">
              <GoldBtn href={`${base}/contact`}>Start a Commission</GoldBtn>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

/* ---------------- SHOP (collection + category filter) ---------------- */

export function JwShop({ cat }: { cat?: string }) {
  const { def } = useDemo();
  const cats = def.cats;
  const [active, setActive] = useState<string>(cat && cats.includes(cat) ? cat : "All");
  useEffect(() => {
    if (cat && cats.includes(cat)) setActive(cat);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cat]);
  const list = active === "All" ? def.products : def.products.filter((p) => p.c === active);
  return (
    <div style={SANS} className="bg-[#0b0b0f] font-light text-[#f5efe4]">
      <JwStyle />
      <section className="mx-auto max-w-6xl px-4 py-16">
        <SectionHead kicker="Aurelia" title={<>The <span className="jw-gold-text italic">Collection</span></>} />
        <div className="mb-12 flex flex-wrap justify-center gap-3">
          {cats.map((c) => (
            <button
              key={c}
              onClick={() => setActive(c)}
              className={`border px-5 py-2 text-[12px] uppercase tracking-[0.22em] transition ${
                active === c
                  ? "border-[#c9a24b] bg-[#c9a24b] text-[#0b0b0f]"
                  : "border-white/15 text-[#f5efe4]/70 hover:border-[#c9a24b] hover:text-[#e8cf8f]"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        {list.length === 0 ? (
          <p className="py-16 text-center text-[#f5efe4]/60">No pieces in this collection yet — please explore the full range.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((p) => (
              <JwCard key={p.id} p={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

/* ---------------- PRODUCT DETAIL ---------------- */

export function JwProduct({ id }: { id: string }) {
  const { def, base, store } = useDemo();
  const router = useRouter();
  const p = def.products.find((x) => x.id === id);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  if (!p) {
    return (
      <div style={SANS} className="bg-[#0b0b0f] font-light text-[#f5efe4]">
        <JwStyle />
        <Page narrow>
          <Empty emoji="🔍" text="This piece could not be found" />
          <div className="text-center">
            <GoldBtn href={`${base}/shop`} outline>Back to the Collection</GoldBtn>
          </div>
        </Page>
      </div>
    );
  }
  const related = def.products.filter((x) => x.id !== p.id && x.c === p.c).concat(def.products.filter((x) => x.id !== p.id && x.c !== p.c)).slice(0, 3);
  return (
    <div style={SANS} className="bg-[#0b0b0f] font-light text-[#f5efe4]">
      <JwStyle />
      <section className="mx-auto max-w-6xl px-4 py-14">
        <Link href={`${base}/shop`} className="text-[12px] uppercase tracking-[0.25em] text-[#f5efe4]/50 transition hover:text-[#e8cf8f]">
          ← Back to the collection
        </Link>
        <div className="mt-8 grid items-start gap-12 lg:grid-cols-2">
          <div className="overflow-hidden border border-white/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.img ?? IMG("hero.webp")} alt={p.n} className="aspect-[4/5] w-full object-cover transition duration-[1200ms] hover:scale-105" />
          </div>
          <div>
            <div className="text-[12px] uppercase tracking-[0.35em] text-[#e8cf8f]">{p.c}</div>
            <h1 style={SERIF} className="mt-3 text-4xl leading-tight md:text-5xl">{p.n}</h1>
            <div className="mt-3">
              <span className="text-amber-400">{"★".repeat(Math.round(p.rating))}</span>
              <span className="ml-2 text-sm text-[#f5efe4]/50">{p.rating.toFixed(1)} · {p.reviews} client reviews</span>
            </div>
            <div style={SERIF} className="jw-gold-text mt-5 text-3xl">
              {p.priceNote ? `${p.priceNote} ` : ""}{usd(p.p)}
            </div>
            <div className="jw-thin-line my-7 w-28" style={{ marginLeft: 0, background: "linear-gradient(90deg, rgba(201,162,75,.7), transparent)" }} />
            <p className="text-lg leading-relaxed text-[#f5efe4]/70">{p.desc}</p>
            <ul className="mt-7 space-y-3 text-[#f5efe4]/70">
              {PRODUCT_POINTS.map((t) => (
                <li key={t} className="flex gap-3"><span className="text-[#c9a24b]">✦</span> {t}</li>
              ))}
            </ul>
            <p className="mt-5 text-sm text-[#f5efe4]/50">
              {p.stock > 0 ? `◆ In the atelier — ${p.stock} piece${p.stock > 1 ? "s" : ""} available` : "◆ Made to order"}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <div className="flex items-center border border-white/15">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3.5 py-2.5 text-lg hover:text-[#e8cf8f]" aria-label="Decrease quantity">−</button>
                <span className="min-w-8 text-center font-medium">{qty}</span>
                <button onClick={() => setQty(Math.min(9, qty + 1))} className="px-3.5 py-2.5 text-lg hover:text-[#e8cf8f]" aria-label="Increase quantity">+</button>
              </div>
              <button
                onClick={() => {
                  store.addToCart({ id: p.id, n: p.n, p: p.p, e: p.e }, qty);
                  setAdded(true);
                  setTimeout(() => setAdded(false), 1800);
                }}
                className="bg-[#c9a24b] px-8 py-3 text-[12px] font-medium uppercase tracking-[0.25em] text-[#0b0b0f] transition hover:bg-[#e8cf8f]"
              >
                {added ? "✓ Added to Bag" : "Add to Bag"}
              </button>
              <button
                onClick={() => {
                  store.addToCart({ id: p.id, n: p.n, p: p.p, e: p.e }, qty);
                  router.push(`${base}/cart`);
                }}
                className="border border-[#f5efe4]/25 px-8 py-3 text-[12px] uppercase tracking-[0.25em] transition hover:border-[#c9a24b] hover:text-[#e8cf8f]"
              >
                Buy Now
              </button>
            </div>
            <Link href={`${base}/contact`} className="mt-5 inline-block text-[12px] uppercase tracking-[0.25em] text-[#e8cf8f] underline decoration-[#c9a24b]/50 underline-offset-4 transition hover:text-[#f5efe4]">
              Enquire about this piece →
            </Link>
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-24">
            <h2 style={SERIF} className="text-center text-3xl">You may also <span className="jw-gold-text italic">love</span></h2>
            <div className="jw-thin-line mx-auto mb-10 mt-5 w-32" />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => (
                <JwCard key={r.id} p={r} />
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

/* ---------------- ABOUT / ATELIER ---------------- */

export function JwAbout() {
  const { base } = useDemo();
  return (
    <div style={SANS} className="bg-[#0b0b0f] font-light text-[#f5efe4]">
      <JwStyle />
      <section className="mx-auto max-w-6xl px-4 py-16">
        <SectionHead kicker="Since 1998" title={<>Inside the <span className="jw-gold-text italic">Atelier</span></>} />
        <div className="mb-20 grid items-center gap-12 lg:grid-cols-2">
          <Reveal className="overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={IMG("craft.webp")} alt="Master jeweller crafting a ring" className="aspect-[4/3] w-full object-cover transition duration-[1200ms] hover:scale-105" />
          </Reveal>
          <Reveal>
            <h2 style={SERIF} className="text-3xl leading-snug">A small bench,<br />a long memory.</h2>
            <p className="mt-5 leading-relaxed text-[#f5efe4]/65">
              Aurelia began in 1998 as a two-person workshop restoring antique pieces for London dealers. Word travelled the way it always does in this trade — slowly, and only when the work deserves it. Today our atelier designs its own collections and bespoke commissions for clients in thirty countries, but every piece is still finished the way the first ones were: by hand, under the lamp, one at a time.
            </p>
            <p className="mt-4 leading-relaxed text-[#f5efe4]/65">
              We buy fewer stones than we are offered. We reject more gold than we melt. And we sign nothing we would not hand to our own families — because most of what we make will outlive all of us.
            </p>
            <div className="mt-8">
              <GoldBtn href={`${base}/shop`} outline>Explore the Collection</GoldBtn>
            </div>
          </Reveal>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            ["01", "Honest stones", "Every diamond and coloured stone arrives with independent certification and a traceable origin. No exceptions, no stories."],
            ["02", "Recycled gold", "Our 18k gold and platinum are fully recycled — chemically identical, environmentally lighter, and kinder to the ground it came from."],
            ["03", "Lifetime promise", "Resizing, re-polishing, claw checks and repairs — free for the life of the piece, whoever in your family is wearing it."],
          ].map(([n, t, d], i) => (
            <Reveal key={n} delay={i * 80}>
              <div className={`h-full p-8 text-center ${panel}`}>
                <div style={SERIF} className="jw-gold-text mb-3 text-4xl">{n}</div>
                <h3 style={SERIF} className="mb-2 text-xl">{t}</h3>
                <p className="text-sm leading-relaxed text-[#f5efe4]/60">{d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ---------------- CONTACT / CONCIERGE ---------------- */

export function JwContact() {
  const { def } = useDemo();
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", subject: "", body: "" });
  return (
    <div style={SANS} className="bg-[#0b0b0f] font-light text-[#f5efe4]">
      <JwStyle />
      <section className="mx-auto max-w-4xl px-4 py-16">
        <SectionHead kicker="Concierge" title={<>Talk to the <span className="jw-gold-text italic">atelier</span></>}>
          <p className="mx-auto mt-5 max-w-xl text-[#f5efe4]/60">
            Commissions, sizing questions, or a piece you saw — write to us and a person (not a bot) will reply within one business day.
          </p>
        </SectionHead>
        <div className="mb-8 grid gap-3 text-center sm:grid-cols-3">
          {[
            ["📍", "The Atelier", def.address],
            ["✉️", "Email", "concierge@aurelia.example"],
            ["📞", "Phone", def.contact],
          ].map(([e, t, v]) => (
            <div key={t} className={`p-4 ${panel}`}>
              <p className="text-xl">{e}</p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.25em] text-[#e8cf8f]">{t}</p>
              <p className="mt-1 text-sm text-[#f5efe4]/70">{v}</p>
            </div>
          ))}
        </div>
        {sent ? (
          <div className="border border-[#c9a24b]/50 bg-[#c9a24b]/10 px-6 py-8 text-center tracking-wide text-[#e8cf8f]">
            <p style={SERIF} className="text-2xl">Thank you, {form.name.split(" ")[0] || "friend"}.</p>
            <p className="mt-2 text-sm text-[#f5efe4]/70">Your message is with the atelier — a person (not a bot) will reply within one business day.</p>
          </div>
        ) : (
          <form
            className={`space-y-6 p-7 md:p-10 ${panel}`}
            onSubmit={(e) => {
              e.preventDefault();
              saveMessage({ ...form, date: Date.now() });
              setSent(true);
            }}
          >
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className={`${label} mb-2 block`}>Your name</label>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} placeholder="Full name" />
              </div>
              <div>
                <label className={`${label} mb-2 block`}>Email</label>
                <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls} placeholder="you@example.com" />
              </div>
            </div>
            <div>
              <label className={`${label} mb-2 block`}>Subject (optional)</label>
              <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className={inputCls} placeholder="Bespoke commission, sizing, an order…" />
            </div>
            <div>
              <label className={`${label} mb-2 block`}>Message</label>
              <textarea required rows={6} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} className={inputCls} placeholder="Tell us what you are dreaming of…" />
            </div>
            <button type="submit" className="bg-[#c9a24b] px-10 py-3 text-[12px] font-medium uppercase tracking-[0.25em] text-[#0b0b0f] transition hover:bg-[#e8cf8f] md:w-auto">
              Send Message
            </button>
          </form>
        )}
      </section>
    </div>
  );
}

/* ---------------- BAG / CART ---------------- */

export function JwCart() {
  const { def, base, store } = useDemo();
  const imgOf = (id: string) => def.products.find((p) => p.id === id)?.img ?? IMG("hero.webp");
  return (
    <div style={SANS} className="bg-[#0b0b0f] font-light text-[#f5efe4]">
      <JwStyle />
      <Page narrow>
        <Back href={`${base}/shop`} label="Continue browsing" />
        <h1 style={SERIF} className="mb-6 text-3xl">Your <span className="jw-gold-text italic">Bag</span></h1>
        {store.cart.length === 0 ? (
          <>
            <Empty emoji="💎" text="Your bag is empty — the collection awaits" />
            <div className="text-center">
              <GoldBtn href={`${base}/shop`}>Explore the Collection</GoldBtn>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-3">
              {store.cart.map((l) => (
                <div key={l.id} className={`flex items-center gap-4 p-3 ${panel}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imgOf(l.id)} alt={l.n} className="h-16 w-14 shrink-0 object-cover" />
                  <div className="min-w-0 flex-1">
                    <p style={SERIF} className="truncate text-base">{l.n}</p>
                    <p className="text-sm text-[#e8cf8f]">{usd(l.p)}</p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <button onClick={() => store.setQty(l.id, l.qty - 1)} className="grid h-7 w-7 place-items-center border border-white/15 font-medium hover:border-[#c9a24b]" aria-label="Decrease">−</button>
                      <span className="min-w-6 text-center text-sm font-medium">{l.qty}</span>
                      <button onClick={() => store.setQty(l.id, l.qty + 1)} className="grid h-7 w-7 place-items-center border border-white/15 font-medium hover:border-[#c9a24b]" aria-label="Increase">+</button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{usd(l.p * l.qty)}</p>
                    <button onClick={() => store.removeLine(l.id)} className="mt-1 text-xs text-[#f5efe4]/50 transition hover:text-red-300">Remove</button>
                  </div>
                </div>
              ))}
            </div>
            <div className={`mt-5 space-y-2 p-5 ${panel}`}>
              <div className="flex justify-between text-sm">
                <span className={sub}>Subtotal</span>
                <b>{usd(store.cartTotal)}</b>
              </div>
              <div className="flex justify-between text-sm">
                <span className={sub}>Insured worldwide delivery</span>
                <b className="text-[#e8cf8f]">Complimentary</b>
              </div>
              <div className="flex justify-between border-t border-white/10 pt-3 text-base">
                <span>Total</span>
                <span style={SERIF} className="jw-gold-text text-xl">{usd(store.cartTotal)}</span>
              </div>
              <p className="text-xs text-[#f5efe4]/45">✦ Certified stones · insured delivery in 5–7 days · lifetime care promise</p>
            </div>
            <Link href={`${base}/checkout`} className="mt-5 block bg-[#c9a24b] py-3.5 text-center text-[12px] font-medium uppercase tracking-[0.25em] text-[#0b0b0f] transition hover:bg-[#e8cf8f]">
              Proceed to Checkout
            </Link>
          </>
        )}
      </Page>
    </div>
  );
}

/* ---------------- CHECKOUT ---------------- */

export function JwCheckout() {
  const { base, store } = useDemo();
  const router = useRouter();
  const [name, setName] = useState(store.user?.name ?? "");
  const [phone, setPhone] = useState(store.user?.phone ?? "");
  const [address, setAddress] = useState(store.user?.address ?? "");
  const [pay, setPay] = useState("Card Payment");
  const [error, setError] = useState("");
  if (store.cart.length === 0) {
    return (
      <div style={SANS} className="bg-[#0b0b0f] font-light text-[#f5efe4]">
        <JwStyle />
        <Page narrow>
          <Empty emoji="💎" text="Your bag is empty" />
          <div className="text-center">
            <GoldBtn href={`${base}/shop`}>Explore the Collection</GoldBtn>
          </div>
        </Page>
      </div>
    );
  }
  const place = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 3) return setError("Please enter your full name");
    if (phone.trim().length < 6) return setError("Please enter a contact number");
    if (address.trim().length < 8) return setError("Please enter a full delivery address");
    const rec = store.placeOrder({
      items: store.cart.map((l) => ({ id: l.id, n: l.n, p: l.p, e: l.e, qty: l.qty })),
      total: store.cartTotal,
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      pay,
    });
    router.push(`${base}/success/${rec.id}`);
  };
  return (
    <div style={SANS} className="bg-[#0b0b0f] font-light text-[#f5efe4]">
      <JwStyle />
      <Page narrow>
        <Back href={`${base}/cart`} label="Back to bag" />
        <h1 style={SERIF} className="mb-6 text-3xl">Secure <span className="jw-gold-text italic">Checkout</span></h1>
        <div className={`mb-4 space-y-1.5 p-5 ${panel}`}>
          {store.cart.map((l) => (
            <div key={l.id} className="flex items-center justify-between text-sm">
              <span>{l.e} {l.n} <span className={sub}>× {l.qty}</span></span>
              <b>{usd(l.p * l.qty)}</b>
            </div>
          ))}
          <div className="flex justify-between border-t border-white/10 pt-2">
            <span>Total (insured delivery included)</span>
            <span style={SERIF} className="jw-gold-text text-lg">{usd(store.cartTotal)}</span>
          </div>
        </div>
        <form onSubmit={place} className={`space-y-4 p-6 ${panel}`}>
          <div>
            <label className={`${label} mb-2 block`}>Full name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} placeholder="Your full name" />
          </div>
          <div>
            <label className={`${label} mb-2 block`}>Phone / WhatsApp</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} placeholder="Contact number" />
          </div>
          <div>
            <label className={`${label} mb-2 block`}>Delivery address</label>
            <textarea rows={3} value={address} onChange={(e) => setAddress(e.target.value)} className={inputCls} placeholder="House, road, city, country" />
          </div>
          <div>
            <label className={`${label} mb-2 block`}>Payment</label>
            <div className="grid gap-2 sm:grid-cols-3">
              {["Card Payment", "Bank Transfer", "Concierge Invoice"].map((m) => (
                <button
                  type="button"
                  key={m}
                  onClick={() => setPay(m)}
                  className={`border px-3 py-2.5 text-[12px] uppercase tracking-[0.15em] transition ${pay === m ? "border-[#c9a24b] bg-[#c9a24b] font-medium text-[#0b0b0f]" : "border-white/15 text-[#f5efe4]/70 hover:border-[#c9a24b]"}`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
          {error && <p className="border border-red-400/40 bg-red-400/10 px-3 py-2 text-xs text-red-200">{error}</p>}
          <button type="submit" className="w-full bg-[#c9a24b] py-3.5 text-[12px] font-medium uppercase tracking-[0.25em] text-[#0b0b0f] transition hover:bg-[#e8cf8f]">
            Place Order — {usd(store.cartTotal)}
          </button>
          <p className="text-center text-[11px] text-[#f5efe4]/40">Demo checkout — no real payment is taken.</p>
        </form>
      </Page>
    </div>
  );
}

/* ---------------- ORDER SUCCESS / ORDERS ---------------- */

const STATUS_EN: Record<string, string> = { "প্রসেসিং": "Processing" };

export function JwSuccess({ id }: { id: string }) {
  const { base, store } = useDemo();
  const o = store.orders.find((x) => x.id === id);
  if (!o) {
    return (
      <div style={SANS} className="bg-[#0b0b0f] font-light text-[#f5efe4]">
        <JwStyle />
        <Page narrow>
          <Empty emoji="🔍" text="Order not found" />
          <div className="text-center">
            <GoldBtn href={`${base}/shop`} outline>Back to the Collection</GoldBtn>
          </div>
        </Page>
      </div>
    );
  }
  return (
    <div style={SANS} className="bg-[#0b0b0f] font-light text-[#f5efe4]">
      <JwStyle />
      <Page narrow>
        <div className="py-6 text-center">
          <p className="text-6xl">✦</p>
          <h1 style={SERIF} className="mt-3 text-3xl">Thank you, {o.name.split(" ")[0]}.</h1>
          <p className={`mt-2 text-sm ${sub}`}>Your order is with the atelier. Our concierge will call to confirm before dispatch.</p>
        </div>
        <div className={`space-y-2 p-5 ${panel}`}>
          <div>
            <p className={`text-xs ${sub}`}>Order number</p>
            <p className="font-mono text-lg font-semibold text-[#e8cf8f]">{o.id}</p>
          </div>
          <div className="space-y-1.5 border-t border-white/10 pt-3">
            {o.items.map((i) => (
              <div key={i.id} className="flex items-center justify-between text-sm">
                <span>{i.e} {i.n} <span className={sub}>× {i.qty}</span></span>
                <b>{usd(i.p * i.qty)}</b>
              </div>
            ))}
          </div>
          <div className="flex justify-between border-t border-white/10 pt-2">
            <span>Total</span>
            <span style={SERIF} className="jw-gold-text text-lg">{usd(o.total)}</span>
          </div>
          <p className={`text-xs ${sub}`}>💳 {o.pay}</p>
          <p className={`text-xs ${sub}`}>📍 {o.address}</p>
          <p className={`text-xs ${sub}`}>Status: {STATUS_EN[o.status] ?? o.status} · insured delivery in 5–7 days</p>
        </div>
        <div className="mt-5 flex gap-2">
          <Link href={`${base}/orders`} className="flex-1 border border-[#f5efe4]/25 py-3 text-center text-[12px] uppercase tracking-[0.2em] transition hover:border-[#c9a24b] hover:text-[#e8cf8f]">My Orders</Link>
          <Link href={`${base}/shop`} className="flex-1 bg-[#c9a24b] py-3 text-center text-[12px] font-medium uppercase tracking-[0.2em] text-[#0b0b0f] transition hover:bg-[#e8cf8f]">Continue Browsing</Link>
        </div>
      </Page>
    </div>
  );
}

export function JwOrders() {
  const { base, store } = useDemo();
  const mine = store.user ? store.orders.filter((o) => o.userPhone === store.user?.phone) : store.orders;
  return (
    <div style={SANS} className="bg-[#0b0b0f] font-light text-[#f5efe4]">
      <JwStyle />
      <Page>
        <Back href={base} label="Home" />
        <h1 style={SERIF} className="mb-6 text-3xl">My <span className="jw-gold-text italic">Orders</span></h1>
        {mine.length === 0 ? (
          <>
            <Empty emoji="📦" text="No orders yet — your pieces will appear here" />
            <div className="text-center">
              <GoldBtn href={`${base}/shop`}>Explore the Collection</GoldBtn>
            </div>
          </>
        ) : (
          <div className="space-y-3">
            {mine.map((o) => (
              <div key={o.id} className={`p-5 ${panel}`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-mono text-sm font-semibold text-[#e8cf8f]">{o.id}</p>
                  <span className="border border-[#c9a24b]/50 px-2.5 py-1 text-[11px] uppercase tracking-[0.18em] text-[#e8cf8f]">{STATUS_EN[o.status] ?? o.status}</span>
                </div>
                <div className="mt-3 space-y-1 text-sm">
                  {o.items.map((i) => (
                    <div key={i.id} className="flex justify-between">
                      <span>{i.e} {i.n} <span className={sub}>× {i.qty}</span></span>
                      <span>{usd(i.p * i.qty)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex flex-wrap justify-between gap-2 border-t border-white/10 pt-3 text-xs text-[#f5efe4]/55">
                  <span>🗓️ {new Date(o.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })} · {o.pay}</span>
                  <span className="text-sm font-medium text-[#f5efe4]">Total {usd(o.total)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Page>
    </div>
  );
}

/* ---------------- SEARCH ---------------- */

export function JwSearch() {
  const { def, base } = useDemo();
  const router = useRouter();
  const sp = useSearchParams();
  const q = (sp.get("q") ?? "").trim();
  const [val, setVal] = useState(q);
  const res = def.products.filter((p) => !q || (p.n + " " + p.c + " " + p.desc).toLowerCase().includes(q.toLowerCase()));
  return (
    <div style={SANS} className="bg-[#0b0b0f] font-light text-[#f5efe4]">
      <JwStyle />
      <Page>
        <Back href={base} label="Home" />
        <form
          onSubmit={(e) => {
            e.preventDefault();
            router.push(`${base}/search?q=${encodeURIComponent(val.trim())}`);
          }}
          className="mb-8 flex gap-2"
        >
          <input value={val} onChange={(e) => setVal(e.target.value)} className={inputCls} placeholder="Search the collection…" />
          <button type="submit" className="shrink-0 bg-[#c9a24b] px-6 text-[12px] font-medium uppercase tracking-[0.2em] text-[#0b0b0f] transition hover:bg-[#e8cf8f]">Search</button>
        </form>
        {q ? (
          <>
            <h1 style={SERIF} className="mb-6 text-2xl">&ldquo;{q}&rdquo; — {res.length} result{res.length === 1 ? "" : "s"}</h1>
            {res.length === 0 ? (
              <Empty emoji="🔍" text="Nothing matched — try a piece name or category" />
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {res.map((p) => (
                  <JwCard key={p.id} p={p} />
                ))}
              </div>
            )}
          </>
        ) : (
          <Empty emoji="🔍" text="Type a piece name or category to search" />
        )}
      </Page>
    </div>
  );
}

/* ---------------- FAQ ---------------- */

export function JwFaq() {
  const [open, setOpen] = useState(0);
  return (
    <div style={SANS} className="bg-[#0b0b0f] font-light text-[#f5efe4]">
      <JwStyle />
      <Page narrow>
        <SectionHead kicker="Good to Know" title={<>Questions, <span className="jw-gold-text italic">answered</span></>} />
        <div className="space-y-3">
          {FAQS.map((f, i) => (
            <div key={f.q} className={panel}>
              <button onClick={() => setOpen(open === i ? -1 : i)} className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left">
                <span style={SERIF} className="text-lg">{f.q}</span>
                <span className="text-[#c9a24b]">{open === i ? "−" : "+"}</span>
              </button>
              {open === i && <p className="px-5 pb-5 text-sm leading-relaxed text-[#f5efe4]/65">{f.a}</p>}
            </div>
          ))}
        </div>
      </Page>
    </div>
  );
}

/* ---------------- AUTH ---------------- */

const AUTH_ERR_EN: Record<string, string> = {
  "আপনার নাম লিখুন": "Please enter your name",
  "সঠিক ১১ সংখ্যার মোবাইল নম্বর দিন": "Please enter a valid 11-digit mobile number",
  "পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের দিন": "Password must be at least 4 characters",
  "এই নম্বরে ইতিমধ্যে অ্যাকাউন্ট আছে — লগইন করুন": "An account already exists for this number — please log in",
  "এই নম্বরে অ্যাকাউন্ট নেই — সাইন আপ করুন": "No account for this number — please sign up",
  "পাসওয়ার্ড ভুল হয়েছে": "Incorrect password",
};
const errEn = (m: string) => AUTH_ERR_EN[m] ?? m;

function AuthShell({ title, subTitle, children, footer }: { title: string; subTitle: string; children: React.ReactNode; footer: React.ReactNode }) {
  return (
    <div style={SANS} className="bg-[#0b0b0f] font-light text-[#f5efe4]">
      <JwStyle />
      <Page narrow>
        <div className={`mx-auto mt-8 max-w-md p-7 ${panel}`}>
          <p className="text-center text-4xl">💎</p>
          <h1 style={SERIF} className="mt-2 text-center text-2xl">{title}</h1>
          <p className={`mt-1 text-center text-sm ${sub}`}>{subTitle}</p>
          {children}
          <p className={`mt-4 text-center text-sm ${sub}`}>{footer}</p>
        </div>
      </Page>
    </div>
  );
}

export function JwLogin() {
  const { base, store } = useDemo();
  const router = useRouter();
  const [form, setForm] = useState({ phone: "", pass: "" });
  const [err, setErr] = useState("");
  const go = (e: React.FormEvent) => {
    e.preventDefault();
    const msg = store.login(form.phone, form.pass);
    if (!msg) router.push(`${base}/account`);
    else setErr(msg);
  };
  return (
    <AuthShell
      title="Welcome Back"
      subTitle="Log in to your Aurelia account"
      footer={<>New to Aurelia? <Link href={`${base}/signup`} className="font-medium text-[#e8cf8f]">Create an account</Link></>}
    >
      <form onSubmit={go} className="mt-5 grid gap-3">
        <input required type="tel" placeholder="Mobile number (01xxxxxxxxx)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputCls} />
        <input required type="password" placeholder="Password" value={form.pass} onChange={(e) => setForm({ ...form, pass: e.target.value })} className={inputCls} />
        {err && <p className="border border-red-400/40 bg-red-400/10 px-3 py-2 text-xs text-red-200">{errEn(err)}</p>}
        <button type="submit" className="bg-[#c9a24b] py-3 text-[12px] font-medium uppercase tracking-[0.25em] text-[#0b0b0f] transition hover:bg-[#e8cf8f]">Log In</button>
      </form>
    </AuthShell>
  );
}

export function JwSignup() {
  const { base, store } = useDemo();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", phone: "", pass: "" });
  const [err, setErr] = useState("");
  const go = (e: React.FormEvent) => {
    e.preventDefault();
    const msg = store.signup(form.name, form.phone, form.pass);
    if (!msg) router.push(`${base}/account`);
    else setErr(msg);
  };
  return (
    <AuthShell
      title="Create Your Account"
      subTitle="Track orders, save pieces, faster checkout"
      footer={<>Already have an account? <Link href={`${base}/login`} className="font-medium text-[#e8cf8f]">Log in</Link></>}
    >
      <form onSubmit={go} className="mt-5 grid gap-3">
        <input required placeholder="Your full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} />
        <input required type="tel" placeholder="Mobile number (01xxxxxxxxx)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputCls} />
        <input required type="password" placeholder="Password" value={form.pass} onChange={(e) => setForm({ ...form, pass: e.target.value })} className={inputCls} />
        {err && <p className="border border-red-400/40 bg-red-400/10 px-3 py-2 text-xs text-red-200">{errEn(err)}</p>}
        <button type="submit" className="bg-[#c9a24b] py-3 text-[12px] font-medium uppercase tracking-[0.25em] text-[#0b0b0f] transition hover:bg-[#e8cf8f]">Create Account</button>
      </form>
    </AuthShell>
  );
}

export function JwAccount() {
  const { def, base, store } = useDemo();
  const router = useRouter();
  const user = store.user;
  if (!user) {
    return (
      <div style={SANS} className="bg-[#0b0b0f] font-light text-[#f5efe4]">
        <JwStyle />
        <Page narrow>
          <div className={`mt-8 p-7 text-center ${panel}`}>
            <p className="text-5xl">🔒</p>
            <p style={SERIF} className="mt-2 text-xl">Please log in first</p>
            <p className={`mt-1 text-sm ${sub}`}>Your orders and saved pieces live behind your account.</p>
            <div className="mt-4">
              <GoldBtn href={`${base}/login`}>Log In</GoldBtn>
            </div>
          </div>
        </Page>
      </div>
    );
  }
  const mine = store.orders.filter((o) => o.userPhone === user.phone);
  const spent = mine.reduce((s, o) => s + o.total, 0);
  return (
    <div style={SANS} className="bg-[#0b0b0f] font-light text-[#f5efe4]">
      <JwStyle />
      <Page>
        <div className={`flex flex-wrap items-center gap-4 p-6 ${panel}`}>
          <span className="grid h-14 w-14 place-items-center rounded-full bg-[#c9a24b] text-2xl font-semibold text-[#0b0b0f]">{user.name.charAt(0)}</span>
          <div className="min-w-0 flex-1">
            <p style={SERIF} className="text-xl">{user.name}</p>
            <p className="truncate text-sm text-[#f5efe4]/60">📱 {user.phone}</p>
          </div>
          <button onClick={() => { store.logout(); router.push(base); }} className="border border-white/15 px-4 py-2 text-xs uppercase tracking-[0.18em] transition hover:border-[#c9a24b] hover:text-[#e8cf8f]">Log Out</button>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3">
          {[
            ["📦", String(mine.length), "Orders"],
            ["💳", usd(spent), "Total Spent"],
            ["💎", String(def.products.length), "Pieces in Collection"],
          ].map(([e, v, t]) => (
            <div key={t} className={`p-4 text-center ${panel}`}>
              <p className="text-xl">{e}</p>
              <p style={SERIF} className="jw-gold-text mt-1 text-xl">{v}</p>
              <p className="text-[11px] uppercase tracking-[0.18em] text-[#f5efe4]/50">{t}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 flex items-center justify-between">
          <h2 style={SERIF} className="text-2xl">Recent Orders</h2>
          <Link href={`${base}/orders`} className="text-[12px] uppercase tracking-[0.2em] text-[#e8cf8f] hover:underline">View all →</Link>
        </div>
        {mine.length === 0 ? (
          <p className={`mt-3 p-5 text-sm ${panel} ${sub}`}>No orders yet — when a piece finds you, it will appear here.</p>
        ) : (
          <div className="mt-3 space-y-2">
            {mine.slice(0, 5).map((o) => (
              <div key={o.id} className={`flex flex-wrap items-center gap-2 px-4 py-3 ${panel}`}>
                <b className="font-mono text-sm text-[#e8cf8f]">{o.id}</b>
                <span className="text-sm text-[#f5efe4]/70">{o.items.reduce((s, i) => s + i.qty, 0)} piece(s)</span>
                <span className="ml-auto text-sm font-medium">{usd(o.total)}</span>
                <span className="border border-[#c9a24b]/50 px-2.5 py-1 text-[11px] uppercase tracking-[0.15em] text-[#e8cf8f]">{STATUS_EN[o.status] ?? o.status}</span>
              </div>
            ))}
          </div>
        )}
      </Page>
    </div>
  );
}

/* ---------------- ATELIER ADMIN ---------------- */

export function JwAdmin() {
  const { def, base, store } = useDemo();
  const [msgs, setMsgs] = useState<JwMessage[]>([]);
  const [bannerTitle, setBannerTitle] = useState("");
  const [bannerSub, setBannerSub] = useState("");
  const [announcement, setAnnouncement] = useState(store.custom.customAnnouncement ?? "");
  const [tName, setTName] = useState("");
  const [tText, setTText] = useState("");
  useEffect(() => { setMsgs(loadMessages()); }, []);
  const revenue = store.orders.reduce((s, o) => s + o.total, 0);
  const stats: [string, string, string][] = [
    ["💰", usd(revenue), "Revenue (demo)"],
    ["📦", String(store.orders.length), "Orders"],
    ["✉️", String(msgs.length), "Concierge Enquiries"],
    ["💎", String(def.products.length), "Pieces in Collection"],
  ];
  return (
    <div style={SANS} className="bg-[#0b0b0f] font-light text-[#f5efe4]">
      <JwStyle />
      <Page>
        <Back href={base} label="Back to site" />
        <div className="mb-6">
          <div className="text-[12px] uppercase tracking-[0.45em] text-[#e8cf8f]">AURELIA</div>
          <h1 style={SERIF} className="mt-1 text-3xl">Atelier <span className="jw-gold-text italic">Admin</span></h1>
          <p className={`mt-1 text-sm ${sub}`}>Orders, enquiries and inventory — demo data, stored in this browser only.</p>
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {stats.map(([e, v, t]) => (
            <div key={t} className={`p-5 ${panel}`}>
              <p className="text-2xl">{e}</p>
              <p style={SERIF} className="jw-gold-text mt-2 text-2xl">{v}</p>
              <p className="mt-0.5 text-[11px] uppercase tracking-[0.18em] text-[#f5efe4]/50">{t}</p>
            </div>
          ))}
        </div>

        <h2 style={SERIF} className="mb-3 mt-8 text-2xl">Recent Orders</h2>
        {store.orders.length === 0 ? (
          <p className={`p-5 text-sm ${panel} ${sub}`}>No orders yet in this demo session.</p>
        ) : (
          <div className={`overflow-x-auto ${panel}`}>
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-[11px] uppercase tracking-[0.18em] text-[#f5efe4]/50">
                  <th className="px-4 py-3">Order</th><th className="px-4 py-3">Client</th><th className="px-4 py-3">Pieces</th><th className="px-4 py-3">Total</th><th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {store.orders.slice(0, 10).map((o) => (
                  <tr key={o.id} className="border-b border-white/5 last:border-0">
                    <td className="px-4 py-3 font-mono text-[#e8cf8f]">{o.id}</td>
                    <td className="px-4 py-3">{o.name}<span className="block text-xs text-[#f5efe4]/45">{o.phone}</span></td>
                    <td className="px-4 py-3">{o.items.reduce((s, i) => s + i.qty, 0)}</td>
                    <td className="px-4 py-3 font-medium">{usd(o.total)}</td>
                    <td className="px-4 py-3">
                      <select value={STATUS_EN[o.status] ?? o.status} onChange={(e) => store.updateOrderStatus(o.id, e.target.value)} className="border border-white/15 bg-[#0b0b0f] px-2 py-1 text-xs text-[#f5efe4] outline-none">
                        {ORDER_STATUSES.map((st) => (<option key={st} value={st}>{st}</option>))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <h2 style={SERIF} className="mb-3 mt-8 text-2xl">Concierge Enquiries</h2>
        {msgs.length === 0 ? (
          <p className={`p-5 text-sm ${panel} ${sub}`}>No enquiries yet — messages sent from the contact page appear here.</p>
        ) : (
          <div className="space-y-2">
            {msgs.slice(0, 10).map((m, i) => (
              <div key={i} className={`p-4 ${panel}`}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-medium">{m.name} <span className="text-sm font-light text-[#f5efe4]/50">{m.email}</span></p>
                  <p className="text-xs text-[#f5efe4]/40">{new Date(m.date).toLocaleString("en-GB")}</p>
                </div>
                {m.subject && <p className="mt-1 text-sm text-[#e8cf8f]">{m.subject}</p>}
                <p className="mt-1 text-sm leading-relaxed text-[#f5efe4]/70">{m.body}</p>
              </div>
            ))}
          </div>
        )}

        <h2 style={SERIF} className="mb-3 mt-8 text-2xl">Inventory</h2>
        <div className={`overflow-x-auto ${panel}`}>
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-[11px] uppercase tracking-[0.18em] text-[#f5efe4]/50">
                <th className="px-4 py-3">Piece</th><th className="px-4 py-3">Collection</th><th className="px-4 py-3">Price</th><th className="px-4 py-3">Rating</th><th className="px-4 py-3">Atelier Stock</th>
              </tr>
            </thead>
            <tbody>
              {def.products.map((p) => (
                <tr key={p.id} className="border-b border-white/5 last:border-0">
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.img ?? IMG("hero.webp")} alt="" className="h-10 w-9 object-cover" />
                      {p.n}
                    </span>
                  </td>
                  <td className="px-4 py-3">{p.c}</td>
                  <td className="px-4 py-3">{usd(p.p)}</td>
                  <td className="px-4 py-3">★ {p.rating.toFixed(1)} ({p.reviews})</td>
                  <td className="px-4 py-3">{p.stock} pcs</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 style={SERIF} className="mb-3 mt-8 text-2xl">Banners &amp; Announcement</h2>
        <p className={`mb-3 text-sm ${sub}`}>Banners show as a gold strip on the home page; the announcement shows above the demo chrome (demo only, this browser only).</p>
        <div className={`mb-3 flex flex-wrap gap-2 p-4 ${panel}`}>
          <input value={bannerTitle} onChange={(e) => setBannerTitle(e.target.value)} placeholder="Banner title" className={inputCls} style={{ maxWidth: 260 }} />
          <input value={bannerSub} onChange={(e) => setBannerSub(e.target.value)} placeholder="Banner subtitle (optional)" className={inputCls} style={{ maxWidth: 260 }} />
          <button onClick={() => { if (!bannerTitle.trim()) return; store.saveCustom({ customBanners: [...(store.custom.customBanners ?? []), { id: `b${Date.now()}`, title: bannerTitle.trim(), sub: bannerSub.trim(), emoji: "✦" }] }); setBannerTitle(""); setBannerSub(""); }} className="border border-[#c9a24b] px-4 py-2 text-sm text-[#e8cf8f]">Add banner</button>
        </div>
        {(store.custom.customBanners ?? []).map((b) => (
          <div key={b.id} className={`mb-2 flex items-center justify-between gap-3 p-3 ${panel}`}>
            <p className="text-sm">{b.emoji} <b>{b.title}</b>{b.sub ? ` — ${b.sub}` : ""}</p>
            <button onClick={() => store.saveCustom({ customBanners: (store.custom.customBanners ?? []).filter((x) => x.id !== b.id) })} className="text-xs text-[#f5efe4]/50 underline">Delete</button>
          </div>
        ))}
        <div className={`flex flex-wrap gap-2 p-4 ${panel}`}>
          <input value={announcement} onChange={(e) => setAnnouncement(e.target.value)} placeholder="Announcement strip text" className={inputCls} style={{ maxWidth: 420 }} />
          <button onClick={() => store.saveCustom({ customAnnouncement: announcement.trim() || undefined })} className="border border-[#c9a24b] px-4 py-2 text-sm text-[#e8cf8f]">Save announcement</button>
        </div>

        <h2 style={SERIF} className="mb-3 mt-8 text-2xl">Testimonials — moderation</h2>
        <p className={`mb-3 text-sm ${sub}`}>Starts empty. Only approved testimonials appear on the home page; nothing here is a real customer quote unless you add it.</p>
        <div className={`mb-3 flex flex-wrap gap-2 p-4 ${panel}`}>
          <input value={tName} onChange={(e) => setTName(e.target.value)} placeholder="Name" className={inputCls} style={{ maxWidth: 200 }} />
          <input value={tText} onChange={(e) => setTText(e.target.value)} placeholder="Quote" className={inputCls} style={{ maxWidth: 420 }} />
          <button onClick={() => { if (!tName.trim() || !tText.trim()) return; store.saveCustom({ customTestimonials: [...(store.custom.customTestimonials ?? []), { id: `t${Date.now()}`, name: tName.trim(), text: tText.trim(), approved: false }] }); setTName(""); setTText(""); }} className="border border-[#c9a24b] px-4 py-2 text-sm text-[#e8cf8f]">Add (unapproved)</button>
        </div>
        {(store.custom.customTestimonials ?? []).length === 0 && (<p className={`p-5 text-sm ${panel} ${sub}`}>No testimonials yet.</p>)}
        {(store.custom.customTestimonials ?? []).map((t) => (
          <div key={t.id} className={`mb-2 flex items-start justify-between gap-3 p-4 ${panel}`}>
            <p className="text-sm">&ldquo;{t.text}&rdquo; <span className="text-[#f5efe4]/50">— {t.name} ({t.approved ? "approved" : "awaiting approval"})</span></p>
            <span className="flex shrink-0 gap-2 text-xs">
              <button onClick={() => store.saveCustom({ customTestimonials: (store.custom.customTestimonials ?? []).map((x) => x.id === t.id ? { ...x, approved: !x.approved } : x) })} className="underline">{t.approved ? "Hide" : "Approve"}</button>
              <button onClick={() => store.saveCustom({ customTestimonials: (store.custom.customTestimonials ?? []).filter((x) => x.id !== t.id) })} className="underline">Delete</button>
            </span>
          </div>
        ))}

        <h2 style={SERIF} className="mb-3 mt-8 text-2xl">Settings — language</h2>
        <p className={`p-5 text-sm ${panel} ${sub}`}>Language is switched from the drawer (hamburger menu) on this demo — English by default, Bangla or Hindi from the drawer. No header pill. Demo-only notice: no real orders are placed and no real stones are sold here.</p>
      </Page>
    </div>
  );
}
