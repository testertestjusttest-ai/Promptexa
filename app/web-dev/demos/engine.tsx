"use client";

import { useState } from "react";
import { Toast, MiniCart, ProductModal, DemoCheckout, type DemoProduct } from "./demo-ui";
import SiteShell from "./site-shell";
import type { EngineDef } from "./engine-data";
import { ENGINE_DEFS } from "./engine-data";
import { toBnDigits } from "@/lib/format";

function Hero({ def, id }: { def: EngineDef; id?: string }) {
  return (
    <div id={id} className={`bg-gradient-to-br ${def.grad} relative overflow-hidden px-5 py-12 text-white`}>
      <div className="animate-aurora-a pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full bg-white/20 blur-[70px]" />
      <div className="relative">
        <div className="text-5xl drop-shadow-lg">{def.heroEmoji}</div>
        <p className="mt-3 text-3xl font-black drop-shadow-lg">{def.heroTitle}</p>
        <p className="mt-1.5 text-sm opacity-90">{def.heroSub}</p>
      </div>
    </div>
  );
}

function shellProps(def: EngineDef) {
  return {
    logo: `${def.heroEmoji} ${def.name}`,
    accent: def.accent,
    dark: true,
    contact: "📞 ০১XXXXXXXXX • প্রতিদিন সকাল ৯টা — রাত ১০টা",
  };
}

/* ---------------- SHOP layout — complete store ---------------- */
function EngineShop({ def }: { def: EngineDef }) {
  const [cat, setCat] = useState(def.cats[0]);
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState<DemoProduct[]>([]);
  const [open, setOpen] = useState(false);
  const [checkout, setCheckout] = useState(false);
  const [toast, setToast] = useState("");
  const [detail, setDetail] = useState<DemoProduct | null>(null);

  const q = query.trim().toLowerCase();
  const show = def.items.filter((i) =>
    q ? (i.n + " " + i.c).toLowerCase().includes(q) : cat === def.cats[0] || i.c === cat
  );
  const add = (p: DemoProduct, qty = 1) => {
    setCart((c) => [...c, ...Array(qty).fill(p)]);
    setToast(`✅ ${p.n} কার্টে!`);
    setTimeout(() => setToast(""), 1500);
  };

  return (
    <SiteShell
      {...shellProps(def)}
      demoSlug={def.slug}
      links={[
        { label: "🏠 হোম", href: "#site-top" },
        { label: "🛍️ পণ্যসমূহ", href: "#shop-products" },
        { label: "🎁 অফার", href: "#shop-offer" },
      ]}
      categories={def.cats}
      onCategory={setCat}
      activeCategory={cat}
      onSearch={setQuery}
      searchPlaceholder="🔍 পণ্য খুঁজুন..."
      cartCount={cart.length}
      onCartOpen={() => setOpen(true)}
    >
      <Toast msg={toast} />
      {open && <MiniCart items={cart} onClose={() => setOpen(false)} onClear={() => setCart([])} accent={def.accent} onCheckout={() => { setOpen(false); setCheckout(true); }} />}
      {checkout && <DemoCheckout slug={def.slug} shopName={def.name} items={cart} accent={def.accent} onClose={() => setCheckout(false)} onClear={() => setCart([])} />}
      {detail && (
        <ProductModal product={detail} accent={def.accent}
          related={def.items.filter((i) => i.n !== detail.n && i.c === detail.c)}
          onClose={() => setDetail(null)} onAdd={add} />
      )}
      <Hero def={def} id="site-top" />
      <div id="shop-offer" className="flex items-center justify-between px-5 py-3 text-sm font-bold text-white" style={{ background: `${def.accent}22` }}>
        <span>🎉 <span style={{ color: def.accent }}>বিশেষ অফার</span> — আজই অর্ডার করুন!</span>
        <span className="text-xs text-slate-400">🚚 সারাদেশে ডেলিভারি</span>
      </div>
      <div id="shop-products" className="px-5 pt-4">
        <div className="flex items-center justify-between">
          <p className="font-black text-white">🛍️ পণ্যসমূহ {q && <span className="text-xs font-normal text-slate-400">— "{query}" এর ফলাফল</span>}</p>
          <p className="text-xs text-slate-500">{toBnDigits(show.length)}টি পণ্য</p>
        </div>
        {!q && (
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {def.cats.map((c) => (
              <button key={c} onClick={() => setCat(c)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold transition ${cat === c ? "text-black scale-105" : "bg-white/10 text-slate-300 hover:bg-white/15"}`}
                style={cat === c ? { background: def.accent } : undefined}>{c}</button>
            ))}
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3 px-5 py-4 sm:grid-cols-3">
        {show.map((i) => (
          <div key={i.n} onClick={() => setDetail(i)}
            className="group cursor-pointer overflow-hidden rounded-2xl bg-white/5 transition hover:-translate-y-1 hover:bg-white/10 hover:shadow-2xl">
            <div className="grid h-28 place-items-center bg-gradient-to-br from-white/10 to-transparent text-5xl transition group-hover:scale-110">{i.e}</div>
            <div className="p-3">
              <p className="truncate text-sm font-bold text-white">{i.n}</p>
              <div className="mt-0.5 text-[11px] text-amber-400">★★★★★ <span className="text-slate-500">৪.৮</span></div>
              <p className="font-black" style={{ color: def.accent }}>{toBnDigits(i.p.toLocaleString("en-IN"))} টাকা</p>
              <button
                onClick={(e) => { e.stopPropagation(); add(i); }}
                className="btn-demo mt-2 w-full !py-2 !text-[13px]" style={{ background: def.accent }}>
                🛒 কার্টে নিন
              </button>
            </div>
          </div>
        ))}
      </div>
      {show.length === 0 && (
        <p className="px-5 pb-8 text-center text-sm text-slate-500">😅 "{query}" — কিছু পাওয়া যায়নি</p>
      )}
      <div className="px-5 pb-8">
        <div className="grid grid-cols-3 gap-2 text-center">
          {[["🚚", "দ্রুত ডেলিভারি"], ["💰", "ক্যাশ অন ডেলিভারি"], ["↩️", "সহজ রিটার্ন"]].map(([e, t]) => (
            <div key={t} className="rounded-2xl bg-white/5 p-3">
              <p className="text-2xl">{e}</p>
              <p className="mt-1 text-[11px] font-bold text-slate-300">{t}</p>
            </div>
          ))}
        </div>
      </div>
    </SiteShell>
  );
}

/* ---------------- SERVICE layout ---------------- */
function EngineService({ def }: { def: EngineDef }) {
  const [booked, setBooked] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  return (
    <SiteShell
      {...shellProps(def)}
      links={[
        { label: "🏠 হোম", href: "#site-top" },
        { label: "🛠️ সার্ভিস", href: "#svc-list" },
      ]}
    >
      <Toast msg={toast} />
      <Hero def={def} id="site-top" />
      <div id="svc-list" className="mx-auto max-w-xl space-y-3 p-5">
        <p className="text-sm font-bold text-slate-300">👆 সার্ভিস বেছে বুক করুন</p>
        {def.items.map((s) => (
          <div key={s.n} className="flex items-center gap-3 rounded-2xl bg-white/5 p-4 transition hover:bg-white/10">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/10 text-3xl">{s.e}</span>
            <div className="flex-1">
              <p className="font-bold text-white">{s.n}</p>
              <p className="text-xs text-slate-400">{s.d ? `⏱️ ${s.d} • ` : ""}<b style={{ color: def.accent }}>{toBnDigits(s.p.toLocaleString("en-IN"))} টাকা</b></p>
            </div>
            <button onClick={() => { setBooked(s.n); setToast(`✅ "${s.n}" বুকিং সফল! (ডেমো)`); setTimeout(() => setToast(""), 2000); }}
              className={`btn-demo !px-4 !py-2 !text-[13px] ${booked === s.n ? "!bg-emerald-500" : ""}`}
              style={booked !== s.n ? { background: def.accent } : undefined}>
              {booked === s.n ? "✓ বুকড" : "বুক করুন"}
            </button>
          </div>
        ))}
        <div className="rounded-2xl bg-white/5 p-4 text-center">
          <p className="text-xs text-slate-400">📞 ফোনে বুকিং: <b className="text-white">০১XXXXXXXXX</b></p>
        </div>
      </div>
    </SiteShell>
  );
}

/* ---------------- GALLERY layout ---------------- */
function EngineGallery({ def }: { def: EngineDef }) {
  const [open, setOpen] = useState<number | null>(null);
  const [booked, setBooked] = useState(false);
  return (
    <SiteShell
      {...shellProps(def)}
      links={[
        { label: "🏠 হোম", href: "#site-top" },
        { label: "🖼️ গ্যালারি", href: "#gal-grid" },
        { label: "📅 বুকিং", href: "#gal-book" },
      ]}
    >
      <Hero def={def} id="site-top" />
      <div id="gal-grid" className="px-5 py-6">
        <p className="text-center text-sm text-slate-400">👆 ছবিতে ক্লিক করে বড় করে দেখুন</p>
        <div className="mx-auto mt-4 grid max-w-3xl grid-cols-3 gap-2">
          {def.items.map((s, i) => (
            <button key={i} onClick={() => setOpen(i)}
              className={`group relative grid h-28 place-items-center overflow-hidden rounded-xl bg-gradient-to-br ${def.grad} text-4xl transition hover:scale-[1.03]`}>
              <span className="transition group-hover:scale-125">{s.e}</span>
              <span className="absolute inset-x-0 bottom-0 bg-black/50 py-1 text-[10px] font-bold text-white opacity-0 transition group-hover:opacity-100">{s.n}</span>
            </button>
          ))}
        </div>
      </div>
      {open !== null && (
        <div className="fixed inset-0 z-[75] grid place-items-center bg-black/90 p-6 backdrop-blur-sm" onClick={() => setOpen(null)}>
          <div className="animate-modal-pop text-center">
            <div className={`grid h-64 w-64 place-items-center rounded-3xl bg-gradient-to-br ${def.grad} text-8xl shadow-2xl`}>{def.items[open].e}</div>
            <p className="mt-4 font-bold text-white">{def.items[open].n}</p>
            <div className="mt-6 flex justify-center gap-2">
              <button disabled={open === 0} onClick={(e) => { e.stopPropagation(); setOpen(open - 1); }}
                className="btn-demo-ghost !px-4 !py-2 text-sm text-white disabled:opacity-30">‹ আগের</button>
              <button disabled={open === def.items.length - 1} onClick={(e) => { e.stopPropagation(); setOpen(open + 1); }}
                className="btn-demo-ghost !px-4 !py-2 text-sm text-white disabled:opacity-30">পরের ›</button>
            </div>
            <p className="mt-3 text-xs text-slate-400">বন্ধ করতে বাইরে ক্লিক করুন</p>
          </div>
        </div>
      )}
      <div id="gal-book" className="mx-auto max-w-md px-5 pb-8">
        <div className="rounded-2xl bg-white/5 p-5 text-center">
          {booked ? (
            <p className="rounded-xl bg-emerald-500/15 px-4 py-3 text-sm font-bold text-emerald-300">✅ বুকিং রিকোয়েস্ট পাঠানো হয়েছে! (ডেমো)</p>
          ) : (
            <>
              <p className="font-black text-white">📅 বুকিং করুন</p>
              <p className="mt-1 text-xs text-slate-400">তারিখ ও সময় আলোচনা করে ঠিক করা হবে</p>
              <button onClick={() => setBooked(true)} className="btn-demo mt-3 !px-8" style={{ background: def.accent }}>বুক করুন</button>
            </>
          )}
        </div>
      </div>
    </SiteShell>
  );
}

/* ---------------- BOOKING layout ---------------- */
function EngineBooking({ def }: { def: EngineDef }) {
  const [d, setD] = useState(0);
  const [qty, setQty] = useState(2);
  const [done, setDone] = useState(false);
  const total = def.items[d].p * qty;
  return (
    <SiteShell
      {...shellProps(def)}
      links={[
        { label: "🏠 হোম", href: "#site-top" },
        { label: "🎫 বুকিং", href: "#bk-form" },
      ]}
    >
      <Hero def={def} id="site-top" />
      <div id="bk-form" className="mx-auto max-w-xl space-y-4 p-5">
        <div>
          <p className="mb-2 text-sm font-bold text-slate-300">📍 অপশন বেছে নিন</p>
          <div className="grid grid-cols-3 gap-2">
            {def.items.map((x, i) => (
              <button key={x.n} onClick={() => { setD(i); setDone(false); }}
                className={`rounded-2xl border-2 p-3 text-center transition ${d === i ? "bg-white/10 scale-[1.03]" : "border-white/10 hover:border-white/25"}`}
                style={d === i ? { borderColor: def.accent } : undefined}>
                <div className="text-3xl">{x.e}</div>
                <p className="mt-1 text-xs font-bold text-white">{x.n}</p>
                <p className="text-xs font-black" style={{ color: def.accent }}>{toBnDigits(x.p.toLocaleString("en-IN"))} টাকা</p>
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between rounded-2xl bg-white/5 p-4">
          <p className="text-sm font-bold text-white">👥 সংখ্যা</p>
          <div className="flex items-center gap-3">
            <button onClick={() => setQty((x) => Math.max(1, x - 1))} className="btn-demo-icon grid h-9 w-9 place-items-center rounded-full bg-white/10 text-lg font-black text-white">−</button>
            <span className="min-w-8 text-center text-lg font-black text-white">{toBnDigits(qty)}</span>
            <button onClick={() => setQty((x) => Math.min(10, x + 1))} className="btn-demo-icon grid h-9 w-9 place-items-center rounded-full bg-white/10 text-lg font-black text-white">+</button>
          </div>
        </div>
        <div className="flex items-center justify-between rounded-2xl p-4" style={{ background: `linear-gradient(135deg, ${def.accent}, ${def.accent}cc)` }}>
          <p className="font-bold text-black/70">মোট খরচ</p>
          <p className="text-2xl font-black text-black">{toBnDigits(total.toLocaleString("en-IN"))} টাকা</p>
        </div>
        {done ? (
          <div className="animate-modal-pop rounded-2xl bg-emerald-500/15 p-5 text-center">
            <p className="text-4xl">🎉</p>
            <p className="mt-2 text-sm font-bold text-emerald-300">বুকিং সফল! (ডেমো)</p>
            <p className="mt-1 text-xs text-slate-400">{def.items[d].n} • {toBnDigits(qty)} জন • {toBnDigits(total.toLocaleString("en-IN"))} টাকা</p>
            <button onClick={() => setDone(false)} className="btn-demo-ghost mt-3 !px-5 !py-2 text-xs text-white">নতুন বুকিং</button>
          </div>
        ) : (
          <button onClick={() => setDone(true)} className="btn-demo w-full !py-4 text-base" style={{ background: def.accent }}>🎫 এখনই বুক করুন</button>
        )}
      </div>
    </SiteShell>
  );
}

export function EngineDemo({ def }: { def: EngineDef }) {
  if (def.layout === "service") return <EngineService def={def} />;
  if (def.layout === "gallery") return <EngineGallery def={def} />;
  if (def.layout === "booking") return <EngineBooking def={def} />;
  return <EngineShop def={def} />;
}

export const ENGINE_FULL: Record<string, () => React.ReactNode> = Object.fromEntries(
  ENGINE_DEFS.map((def) => [def.slug, () => <EngineDemo def={def} />])
);
