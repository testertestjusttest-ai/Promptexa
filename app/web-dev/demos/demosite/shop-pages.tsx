"use client";

/** DemoSite SHOP layout — all shop pages (home → product → cart → checkout → account...).
 * Browser-local data only; nothing touches the real DigiPlyra DB or admin. */

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toBnDigits } from "@/lib/format";
import { useDemo } from "./store";
import type { DemoProduct } from "./types";
import { Price, Stars, Btn, SectionTitle, Empty, ProductCard, Back, Page, LoginHint } from "./ui";

const FREE_DELIVERY_AT = 1000;
const DELIVERY_FEE = 60;
const bn = (n: number) => toBnDigits(n.toLocaleString("en-IN"));
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
  const steps = ["✅ কনফার্মড", "📦 প্যাকিং", "🚚 শিপড", "🏠 ডেলিভার্ড"];
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
  { n: "রহিম U.", t: "পণ্যটা একদম ছবির মতোই পেয়েছি। ডেলিভারিও দ্রুত ছিল।", r: 5 },
  { n: "সুমাইয়া A.", t: "দাম অনুযায়ী মান বেশ ভালো। প্যাকেজিংও সুন্দর ছিল।", r: 4 },
  { n: "তানভীর H.", t: "মোটামুটি ভালো লেগেছে। কাস্টমার সার্ভিস বন্ধুসুলভ।", r: 4 },
];

/* ================= HOME ================= */

export function ShopHome() {
  const { def, base } = useDemo();
  const { card, sub, chip } = useSkin();
  const deals = def.products.filter((p) => p.oldPrice).slice(0, 4);
  const featured = def.products.slice(0, 8);
  return (
    <div>
      <div className="px-4 pt-6" style={def.grad ? { background: def.grad } : { background: `linear-gradient(135deg, ${def.accent}, #0a0a12)` }}>
        <div className="mx-auto max-w-6xl py-10 text-center text-white">
          <p className="text-6xl">{def.heroEmoji}</p>
          <h1 className="mt-3 text-3xl font-black sm:text-4xl">{def.heroTitle}</h1>
          <p className="mx-auto mt-2 max-w-xl text-sm opacity-90">{def.heroSub}</p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <Link href={`${base}/shop`} className="btn-demo" style={{ background: "#fff", color: "#111" }}>
              🛍️ কেনাকাটা শুরু করুন
            </Link>
            <Link href={`${base}/offers`} className="btn-demo-ghost !text-white">
              🎁 অফার দেখুন
            </Link>
          </div>
        </div>
      </div>
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
            <SectionTitle t="🎁 ছাড়ের পণ্য" sub="সীমিত সময়ের অফার" link={`${base}/offers`} />
            <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {deals.map((p) => (
                <ProductCard key={p.id} p={p} />
              ))}
            </div>
          </>
        )}
        <SectionTitle t="🔥 জনপ্রিয় পণ্য" link={`${base}/shop`} />
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {featured.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
        <div className={`grid grid-cols-3 gap-2 p-4 text-center ${card}`}>
          {[
            ["🚚", "দ্রুত ডেলিভারি"],
            ["💵", "ক্যাশ অন ডেলিভারি"],
            ["🔄", "সহজ রিটার্ন"],
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
  const { chip } = useSkin();
  return (
    <Page>
      <Back href={base} label="হোম" />
      <SectionTitle t="🛍️ সব পণ্য" sub={`${bn(def.products.length)}টি পণ্য`} />
      <div className="mb-5 flex flex-wrap gap-2">
        {def.cats.slice(1).map((c) => (
          <Link key={c} href={`${base}/c/${encodeURIComponent(c)}`} className={chip}>
            {c}
          </Link>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {def.products.map((p) => (
          <ProductCard key={p.id} p={p} />
        ))}
      </div>
    </Page>
  );
}

export function ShopCategory({ cat }: { cat: string }) {
  const { def, base } = useDemo();
  const list = def.products.filter((p) => p.c === cat);
  return (
    <Page>
      <Back href={`${base}/shop`} label="সব পণ্য" />
      <SectionTitle t={cat} sub={`${bn(list.length)}টি পণ্য`} />
      {list.length === 0 ? (
        <Empty emoji="📭" text="এই ক্যাটাগরিতে এখনো পণ্য নেই" />
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
  const router = useRouter();
  const { accent, card, sub } = useSkin();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const p = def.products.find((x) => x.id === id);
  if (!p) {
    return (
      <Page narrow>
        <Empty emoji="🔍" text="পণ্যটি পাওয়া যায়নি" />
        <div className="text-center">
          <Link href={`${base}/shop`} className="btn-demo" style={{ background: accent }}>
            🛍️ শপে ফিরুন
          </Link>
        </div>
      </Page>
    );
  }
  const off = p.oldPrice ? Math.round((1 - p.p / p.oldPrice) * 100) : 0;
  const related = def.products.filter((x) => x.c === p.c && x.id !== p.id).slice(0, 4);
  const maxQ = Math.max(1, Math.min(99, p.stock));
  const line = { id: p.id, n: p.n, p: p.p, e: p.e };
  const add = () => {
    store.addToCart(line, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };
  return (
    <Page>
      <Back href={`${base}/shop`} label="শপ" />
      <div className={`grid gap-6 overflow-hidden p-5 sm:grid-cols-2 ${card}`}>
        <div className="relative grid min-h-64 place-items-center rounded-2xl bg-gradient-to-br from-white/10 to-transparent p-10 text-8xl">
          {p.e}
          {off > 0 && (
            <span className="absolute left-3 top-3 rounded-full bg-red-500 px-3 py-1 text-xs font-black text-white">
              −{bn(off)}% ছাড়
            </span>
          )}
        </div>
        <div>
          <p className={`text-xs font-bold ${sub}`}>{p.c}</p>
          <h1 className="mt-1 text-2xl font-black">{p.n}</h1>
          <div className="mt-1">
            <Stars rating={p.rating} reviews={p.reviews} />
          </div>
          <div className="mt-3 flex items-center gap-3">
            <Price v={p.p} accent={accent} big note={p.priceNote ?? def.priceNote} />
            {p.oldPrice && <span className={`text-sm line-through ${sub}`}>{bn(p.oldPrice)} টাকা</span>}
          </div>
          {p.stock < 10 && <p className="mt-2 text-sm font-black text-red-500">⚡ মাত্র {bn(p.stock)}টি বাকি!</p>}
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
              {added ? "✅ কার্টে যোগ হয়েছে!" : "🛒 কার্টে যোগ করুন"}
            </Btn>
            <Btn
              accent={accent}
              ghost
              onClick={() => {
                store.addToCart(line, qty);
                router.push(`${base}/cart`);
              }}
            >
              ⚡ এখনই কিনুন
            </Btn>
          </div>
          <p className={`mt-3 text-[11px] ${sub}`}>🚚 {bn(FREE_DELIVERY_AT)}+ টাকার অর্ডারে ডেলিভারি ফ্রি • 💵 ক্যাশ অন ডেলিভারি</p>
        </div>
      </div>
      {related.length > 0 && (
        <div className="mt-8">
          <SectionTitle t="🔗 রিলেটেড পণ্য" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {related.map((r) => (
              <ProductCard key={r.id} p={r} />
            ))}
          </div>
        </div>
      )}
      <div className="mt-8">
        <SectionTitle t="⭐ কাস্টমার রিভিউ" sub={`${bn(p.reviews)}টি রিভিউ`} />
        <div className="space-y-2">
          {SAMPLE_REVIEWS.map((r) => (
            <div key={r.n} className={`p-4 ${card}`}>
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold">{r.n}</p>
                <Stars rating={r.r} />
              </div>
              <p className={`mt-1 text-sm ${sub}`}>{r.t}</p>
            </div>
          ))}
        </div>
        <p className={`mt-2 text-[11px] ${sub}`}>💡 ডেমো রিভিউ — আসল সাইটে এখানে যাচাইকৃত ক্রেতাদের রিভিউ থাকবে।</p>
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
      <Back href={`${base}/shop`} label="শপ" />
      <SectionTitle t="🛒 কার্ট" sub={subtotal > 0 ? `${bn(store.cartCount)}টি পণ্য` : undefined} />
      {store.cart.length === 0 ? (
        <>
          <Empty emoji="🛒" text="কার্ট খালি — পছন্দের পণ্য যোগ করুন" />
          <div className="text-center">
            <Link href={`${base}/shop`} className="btn-demo" style={{ background: accent }}>
              🛍️ কেনাকাটা করুন
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
                    {bn(l.p)} টাকা
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
                  <p className="text-sm font-black">{bn(l.p * l.qty)} টাকা</p>
                  <button onClick={() => store.removeLine(l.id)} className={`mt-1 text-xs font-bold ${sub} hover:text-red-400`}>
                    🗑️ মুছুন
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className={`mt-4 space-y-1.5 p-4 text-sm ${card}`}>
            <div className="flex justify-between">
              <span className={sub}>সাবটোটাল</span>
              <b>{bn(subtotal)} টাকা</b>
            </div>
            <div className="flex justify-between">
              <span className={sub}>ডেলিভারি চার্জ</span>
              <b>{fee === 0 ? "🎉 ফ্রি" : `${bn(fee)} টাকা`}</b>
            </div>
            {fee > 0 && <p className={`text-[11px] ${sub}`}>💡 আরও {bn(FREE_DELIVERY_AT - subtotal)} টাকার পণ্য নিলে ডেলিভারি ফ্রি!</p>}
            <div className="flex justify-between border-t border-white/10 pt-2 text-base">
              <span className="font-bold">সর্বমোট</span>
              <span className="font-black" style={{ color: accent }}>
                {bn(total)} টাকা
              </span>
            </div>
          </div>
          <Link href={`${base}/checkout`} className="btn-demo mt-4 block w-full !py-3.5 text-center text-base" style={{ background: accent }}>
            ➡️ চেকআউট করুন
          </Link>
        </>
      )}
    </Page>
  );
}

/* ================= CHECKOUT ================= */

export function ShopCheckout() {
  const { base, store } = useDemo();
  const router = useRouter();
  const { accent, card, sub } = useSkin();
  const [name, setName] = useState(store.user?.name ?? "");
  const [phone, setPhone] = useState(store.user?.phone ?? "");
  const [address, setAddress] = useState(store.user?.address ?? "");
  const [pay, setPay] = useState("ক্যাশ অন ডেলিভারি");
  const [error, setError] = useState("");
  const subtotal = store.cartTotal;
  const fee = feeFor(subtotal);
  const total = subtotal + fee;
  const walletOk = store.wallet >= total;

  if (store.cart.length === 0) {
    return (
      <Page narrow>
        <Empty emoji="🛒" text="কার্ট খালি — আগে পণ্য যোগ করুন" />
        <div className="text-center">
          <Link href={`${base}/shop`} className="btn-demo" style={{ background: accent }}>
            🛍️ শপে ফিরুন
          </Link>
        </div>
      </Page>
    );
  }

  const pays = ["ক্যাশ অন ডেলিভারি", "ওয়ালেট", "বিকাশ", "নগদ", "রকেট"];
  const payIcon = (m: string) => (m === "ক্যাশ অন ডেলিভারি" ? "💵" : m === "ওয়ালেট" ? "👛" : m === "বিকাশ" ? "🩷" : m === "নগদ" ? "🧡" : "💜");

  function submit() {
    setError("");
    if (name.trim().length < 3) return setError("আপনার নাম লিখুন");
    if (!/^01[3-9]\d{8}$/.test(phone.trim())) return setError("সঠিক ১১ সংখ্যার মোবাইল নম্বর দিন (01XXXXXXXXX)");
    if (address.trim().length < 8) return setError("সম্পূর্ণ ঠিকানা লিখুন");
    const items = store.cart.map((l) => ({ id: l.id, n: l.n, p: l.p, e: l.e, qty: l.qty }));
    if (pay === "ওয়ালেট") {
      const ok = store.payWithWallet(total, `🛒 অর্ডার — ${bn(items.length)}টি পণ্য`);
      if (!ok) return setError("ওয়ালেটে যথেষ্ট ব্যালেন্স নেই — টপ-আপ করুন");
    }
    const rec = store.placeOrder({ items, total, name: name.trim(), phone: phone.trim(), address: address.trim(), pay });
    router.push(`${base}/success/${rec.id}`);
  }

  return (
    <Page narrow>
      <Back href={`${base}/cart`} label="কার্ট" />
      <SectionTitle t="🧾 চেকআউট" />
      {!store.user && (
        <div className="mb-4">
          <LoginHint />
        </div>
      )}
      <div className={`space-y-1.5 p-4 text-sm ${card}`}>
        <div className="flex justify-between">
          <span className={sub}>সাবটোটাল</span>
          <b>{bn(subtotal)} টাকা</b>
        </div>
        <div className="flex justify-between">
          <span className={sub}>ডেলিভারি</span>
          <b>{fee === 0 ? "🎉 ফ্রি" : `${bn(fee)} টাকা`}</b>
        </div>
        <div className="flex justify-between border-t border-white/10 pt-2 text-base">
          <span className="font-bold">সর্বমোট</span>
          <span className="font-black" style={{ color: accent }}>
            {bn(total)} টাকা
          </span>
        </div>
      </div>
      <div className="mt-4 space-y-3">
        <DField value={name} onChange={(e) => setName(e.target.value)} placeholder="আপনার নাম *" />
        <DField value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="মোবাইল নম্বর * (01XXXXXXXXX)" inputMode="numeric" />
        <DArea value={address} onChange={(e) => setAddress(e.target.value)} placeholder="সম্পূর্ণ ঠিকানা * (বাসা, রোড, এলাকা, জেলা)" rows={2} />
      </div>
      <p className="mb-2 mt-5 text-sm font-bold">💳 পেমেন্ট মাধ্যম</p>
      <div className="grid grid-cols-2 gap-2">
        {pays.map((m) => {
          const dis = m === "ওয়ালেট" && !walletOk;
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
              {m === "ওয়ালেট" && <span className={`block text-[11px] font-normal ${sub}`}>ব্যালেন্স: {bn(store.wallet)} টাকা</span>}
            </button>
          );
        })}
      </div>
      {pay === "ওয়ালেট" && !walletOk && (
        <p className={`mt-2 text-xs ${sub}`}>
          ⚠️ ব্যালেন্স কম — <Link href={`${base}/wallet`} className="font-bold underline">ওয়ালেটে টপ-আপ করুন</Link>
        </p>
      )}
      {(pay === "বিকাশ" || pay === "নগদ" || pay === "রকেট") && (
        <p className={`mt-2 text-xs ${sub}`}>💡 ডেমো পেমেন্ট — কোনো আসল টাকা কাটা হবে না। আসল সাইটে এখানে {pay} পেমেন্ট গেটওয়ে যুক্ত থাকবে।</p>
      )}
      {error && <p className="mt-3 rounded-xl bg-red-500/10 px-4 py-2.5 text-xs font-bold text-red-400">⚠️ {error}</p>}
      <button onClick={submit} className="btn-demo mt-4 w-full !py-3.5 text-base" style={{ background: accent }}>
        ✅ অর্ডার কনফার্ম করুন — {bn(total)} টাকা
      </button>
    </Page>
  );
}

/* ================= SUCCESS ================= */

export function ShopSuccess({ id }: { id: string }) {
  const { base, store } = useDemo();
  const { accent, card, sub } = useSkin();
  const o = store.orders.find((x) => x.id === id);
  if (!o) {
    return (
      <Page narrow>
        <Empty emoji="🔍" text="অর্ডারটি পাওয়া যায়নি" />
        <div className="text-center">
          <Link href={`${base}/shop`} className="btn-demo" style={{ background: accent }}>
            🛍️ শপে ফিরুন
          </Link>
        </div>
      </Page>
    );
  }
  return (
    <Page narrow>
      <div className="py-6 text-center">
        <p className="text-6xl">🎉</p>
        <h1 className="mt-3 text-2xl font-black text-emerald-400">অর্ডার সফল!</h1>
        <p className={`mt-1 text-sm ${sub}`}>ধন্যবাদ {o.name}! শীঘ্রই কল পাবেন।</p>
      </div>
      <div className={`space-y-2 p-5 ${card}`}>
        <div>
          <p className={`text-xs ${sub}`}>অর্ডার নম্বর</p>
          <p className="font-mono text-lg font-black" style={{ color: accent }}>
            {o.id}
          </p>
        </div>
        <div className="space-y-1.5 border-t border-white/10 pt-3">
          {o.items.map((i) => (
            <div key={i.id} className="flex items-center justify-between text-sm">
              <span>
                {i.e} {i.n} <span className={sub}>× {bn(i.qty)}</span>
              </span>
              <b>{bn(i.p * i.qty)} টাকা</b>
            </div>
          ))}
        </div>
        <div className="flex justify-between border-t border-white/10 pt-2">
          <span className="font-bold">সর্বমোট</span>
          <span className="font-black" style={{ color: accent }}>
            {bn(o.total)} টাকা
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
          📍 ট্র্যাক করুন
        </Link>
        <Link href={`${base}/shop`} className="btn-demo flex-1 text-center" style={{ background: accent }}>
          🛍️ আরও কেনাকাটা
        </Link>
      </div>
      <p className={`mt-3 text-center text-[11px] ${sub}`}>💡 ডেমো অর্ডার — আসল সাইটে SMS/ইমেইল কনফার্মেশন যাবে।</p>
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
      <Back href={base} label="হোম" />
      <SectionTitle t="📍 অর্ডার ট্র্যাকিং" sub="অর্ডার নম্বর দিয়ে খুঁজুন" />
      <div className="flex gap-2">
        <DField value={val} onChange={(e) => setVal(e.target.value)} placeholder="যেমন: DM-20261011-X7K2" className="font-mono" />
        <button onClick={() => setSearched(val)} className="btn-demo shrink-0" style={{ background: accent }}>
          🔍 খুঁজুন
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
                📦 {bn(found.items.reduce((s, i) => s + i.qty, 0))}টি পণ্য • <b>{bn(found.total)} টাকা</b>
              </p>
              <p className="mt-1">📍 {found.address}</p>
              <p className="mt-1">🗓️ {new Date(found.date).toLocaleDateString("bn-BD")}</p>
            </div>
          </div>
        ) : (
          <p className={`mt-4 rounded-2xl p-4 text-center text-sm ${card}`}>❌ এই নম্বরে কোনো অর্ডার পাওয়া যায়নি</p>
        ))}
    </Page>
  );
}

/* ================= SEARCH ================= */

export function ShopSearch() {
  const { def, base } = useDemo();
  const router = useRouter();
  const sp = useSearchParams();
  const q = (sp.get("q") ?? "").trim();
  const [val, setVal] = useState(q);
  const res = def.products.filter((p) => !q || (p.n + " " + p.c).includes(q));
  return (
    <Page>
      <Back href={base} label="হোম" />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          router.push(`${base}/search?q=${encodeURIComponent(val.trim())}`);
        }}
        className="mb-5 flex gap-2"
      >
        <DField value={val} onChange={(e) => setVal(e.target.value)} placeholder="🔍 পণ্য খুঁজুন..." />
        <button type="submit" className="btn-demo shrink-0" style={{ background: def.accent }}>
          খুঁজুন
        </button>
      </form>
      {q ? (
        <>
          <SectionTitle t={`"${q}" — ${bn(res.length)}টি ফলাফল`} />
          {res.length === 0 ? (
            <Empty emoji="🔍" text="কিছু পাওয়া যায়নি — অন্য নামে খুঁজুন" />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {res.map((p) => (
                <ProductCard key={p.id} p={p} />
              ))}
            </div>
          )}
        </>
      ) : (
        <Empty emoji="🔍" text="খুঁজতে চান এমন পণ্যের নাম লিখুন" />
      )}
    </Page>
  );
}

/* ================= OFFERS ================= */

export function ShopOffers() {
  const { def, base } = useDemo();
  const { accent, card, sub } = useSkin();
  const [copied, setCopied] = useState("");
  const deals = def.products.filter((p) => p.oldPrice);
  const coupons = [
    { code: "WELCOME10", d: "প্রথম অর্ডারে ১০% ছাড়" },
    { code: "SAVE20", d: `${bn(2000)}+ টাকার অর্ডারে ২০% ছাড়` },
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
      <Back href={base} label="হোম" />
      <SectionTitle t="🎁 অফার ও কুপন" sub="সীমিত সময়ের ছাড়" />
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
              {copied === c.code ? "✅ কপি!" : "📋 কপি"}
            </span>
          </button>
        ))}
      </div>
      <SectionTitle t="🔥 ছাড়ের পণ্য" />
      {deals.length === 0 ? (
        <Empty emoji="🎁" text="এই মুহূর্তে কোনো ছাড় নেই" />
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
      <Back href={base} label="হোম" />
      <div className="py-6 text-center">
        <p className="text-5xl">🔐</p>
        <h1 className="mt-2 text-xl font-black">লগইন করুন</h1>
      </div>
      <div className="space-y-3">
        <DField value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="মোবাইল নম্বর (01XXXXXXXXX)" inputMode="numeric" />
        <DField value={pass} onChange={(e) => setPass(e.target.value)} placeholder="পাসওয়ার্ড" type="password" />
      </div>
      {error && <p className="mt-3 rounded-xl bg-red-500/10 px-4 py-2.5 text-xs font-bold text-red-400">⚠️ {error}</p>}
      <button onClick={submit} className="btn-demo mt-4 w-full !py-3.5" style={{ background: accent }}>
        ➡️ লগইন
      </button>
      <p className="mt-3 text-center text-sm">
        অ্যাকাউন্ট নেই?{" "}
        <Link href={`${base}/signup`} className="font-bold underline" style={{ color: accent }}>
          সাইন আপ করুন
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
      <Back href={`${base}/login`} label="লগইন" />
      <div className="py-6 text-center">
        <p className="text-5xl">✨</p>
        <h1 className="mt-2 text-xl font-black">নতুন অ্যাকাউন্ট</h1>
        <p className={`mt-1 text-sm ${sub}`}>
          🎁 সাইনআপে <b style={{ color: accent }}>{bn(5000)} টাকা</b> বোনাস!
        </p>
      </div>
      <div className="space-y-3">
        <DField value={name} onChange={(e) => setName(e.target.value)} placeholder="আপনার নাম *" />
        <DField value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="মোবাইল নম্বর * (01XXXXXXXXX)" inputMode="numeric" />
        <DField value={pass} onChange={(e) => setPass(e.target.value)} placeholder="পাসওয়ার্ড * (কমপক্ষে ৪ অক্ষর)" type="password" />
      </div>
      {error && <p className="mt-3 rounded-xl bg-red-500/10 px-4 py-2.5 text-xs font-bold text-red-400">⚠️ {error}</p>}
      <button onClick={submit} className="btn-demo mt-4 w-full !py-3.5" style={{ background: accent }}>
        🎉 সাইন আপ করুন
      </button>
      <p className="mt-3 text-center text-sm">
        ইতিমধ্যে অ্যাকাউন্ট আছে?{" "}
        <Link href={`${base}/login`} className="font-bold underline" style={{ color: accent }}>
          লগইন করুন
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
        <Back href={base} label="হোম" />
        <SectionTitle t="👤 অ্যাকাউন্ট" />
        <LoginHint />
        <div className="mt-4 flex gap-2">
          <Link href={`${base}/login`} className="btn-demo flex-1 text-center" style={{ background: accent }}>
            🔐 লগইন
          </Link>
          <Link href={`${base}/signup`} className="btn-demo-ghost flex-1 text-center">
            ✨ সাইন আপ
          </Link>
        </div>
      </Page>
    );
  }
  const u = store.user;
  const links = [
    { href: `${base}/orders`, e: "📦", t: "আমার অর্ডার", s: `${bn(store.orders.filter((o) => o.userPhone === u.phone || o.userPhone === "guest").length)}টি` },
    { href: `${base}/wallet`, e: "👛", t: "ওয়ালেট", s: `${bn(store.wallet)} টাকা` },
  ];
  if (store.bookings.length > 0) links.push({ href: `${base}/bookings`, e: "📅", t: "আমার বুকিং", s: `${bn(store.bookings.length)}টি` });
  return (
    <Page narrow>
      <Back href={base} label="হোম" />
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
        <p className="text-sm font-bold">📍 ডেলিভারি ঠিকানা</p>
        <DArea value={addr} onChange={(e) => setAddr(e.target.value)} placeholder="ঠিকানা লিখুন..." rows={2} className="mt-2" />
        <button
          onClick={() => {
            store.saveAddress(addr.trim());
            setSaved(true);
            setTimeout(() => setSaved(false), 1500);
          }}
          className="btn-demo mt-2 !py-2 !text-[13px]"
          style={{ background: accent }}
        >
          {saved ? "✅ সেভ হয়েছে!" : "💾 ঠিকানা সেভ করুন"}
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
        🚪 লগআউট
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
      <Back href={`${base}/account`} label="অ্যাকাউন্ট" />
      <SectionTitle t="📦 আমার অর্ডার" sub={list.length > 0 ? `${bn(list.length)}টি` : undefined} />
      {list.length === 0 ? (
        <>
          <Empty emoji="📭" text="এখনো কোনো অর্ডার করেননি" />
          <div className="text-center">
            <Link href={`${base}/shop`} className="btn-demo" style={{ background: accent }}>
              🛍️ কেনাকাটা শুরু করুন
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
                {new Date(o.date).toLocaleDateString("bn-BD")} • {bn(o.items.reduce((s, i) => s + i.qty, 0))}টি পণ্য • {o.pay}
              </p>
              <p className="mt-1 font-black">{bn(o.total)} টাকা</p>
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
        <Empty emoji="🔍" text="অর্ডারটি পাওয়া যায়নি" />
        <div className="text-center">
          <Link href={`${base}/orders`} className="btn-demo" style={{ background: accent }}>
            📦 অর্ডার লিস্ট
          </Link>
        </div>
      </Page>
    );
  }
  return (
    <Page narrow>
      <Back href={`${base}/orders`} label="অর্ডার লিস্ট" />
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
                  {bn(i.p)} টাকা × {bn(i.qty)}
                </p>
              </div>
              <b>{bn(i.p * i.qty)} টাকা</b>
            </div>
          ))}
        </div>
        <div className="flex justify-between border-t border-white/10 pt-3">
          <span className="font-bold">সর্বমোট</span>
          <span className="text-lg font-black" style={{ color: accent }}>
            {bn(o.total)} টাকা
          </span>
        </div>
        <div className={`space-y-1 border-t border-white/10 pt-3 text-xs ${sub}`}>
          <p>👤 {o.name} • 📱 {o.phone}</p>
          <p>📍 {o.address}</p>
          <p>💰 {o.pay}</p>
          <p>🗓️ {new Date(o.date).toLocaleDateString("bn-BD")}</p>
        </div>
      </div>
      <Link href={`${base}/track`} className="btn-demo mt-4 block w-full text-center" style={{ background: accent }}>
        📍 লাইভ ট্র্যাক করুন
      </Link>
    </Page>
  );
}

/* ================= WALLET ================= */

export function ShopWallet() {
  const { base, store } = useDemo();
  const { accent, card, sub } = useSkin();
  return (
    <Page narrow>
      <Back href={`${base}/account`} label="অ্যাকাউন্ট" />
      <SectionTitle t="👛 ওয়ালেট" />
      <div className={`p-6 text-center ${card}`} style={{ background: `linear-gradient(135deg, ${accent}22, transparent)` }}>
        <p className={`text-xs ${sub}`}>বর্তমান ব্যালেন্স</p>
        <p className="mt-1 text-4xl font-black" style={{ color: accent }}>
          {bn(store.wallet)} টাকা
        </p>
        <div className="mt-4 flex justify-center gap-2">
          {[1000, 2000, 5000].map((a) => (
            <Btn key={a} accent={accent} small onClick={() => store.topUp(a)}>
              +{bn(a)}
            </Btn>
          ))}
        </div>
        <p className={`mt-2 text-[11px] ${sub}`}>💡 ডেমো টপ-আপ — কোনো আসল টাকা যোগ হবে না</p>
      </div>
      <p className="mb-2 mt-5 text-sm font-bold">🧾 লেনদেন হিস্ট্রি</p>
      {store.txs.length === 0 ? (
        <Empty emoji="🧾" text="এখনো কোনো লেনদেন হয়নি" />
      ) : (
        <div className="space-y-2">
          {store.txs.map((t, i) => (
            <div key={i} className={`flex items-center justify-between p-3.5 ${card}`}>
              <div>
                <p className="text-sm font-bold">{t.label}</p>
                <p className={`text-[11px] ${sub}`}>{new Date(t.date).toLocaleDateString("bn-BD")}</p>
              </div>
              <p className={`text-sm font-black ${t.amount >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {t.amount >= 0 ? "+" : "−"}
                {bn(Math.abs(t.amount))} টাকা
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
  const { accent, card, sub } = useSkin();
  const avg = def.products.length ? def.products.reduce((s, p) => s + p.rating, 0) / def.products.length : 0;
  return (
    <Page>
      <Back href={base} label="হোম" />
      <div className="py-6 text-center">
        <p className="text-6xl">{def.logoEmoji}</p>
        <h1 className="mt-2 text-2xl font-black">{def.name}</h1>
      </div>
      <div className={`p-5 ${card}`}>
        <p className={`text-sm leading-relaxed ${sub}`}>{def.about}</p>
      </div>
      <div className={`mt-3 grid grid-cols-3 gap-2 p-4 text-center ${card}`}>
        {[
          [bn(def.products.length), "পণ্য"],
          [bn(def.cats.length - 1 > 0 ? def.cats.length - 1 : def.cats.length), "ক্যাটাগরি"],
          [`${toBnDigits(avg.toFixed(1))}★`, "গড় রেটিং"],
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
        💬 যোগাযোগ করুন
      </Link>
    </Page>
  );
}

export function ShopContact() {
  const { def, base } = useDemo();
  const { accent, card } = useSkin();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [msg, setMsg] = useState("");
  const [sent, setSent] = useState(false);
  const infos = [
    { e: "📞", t: "যোগাযোগ", v: def.contact },
    { e: "📍", t: "ঠিকানা", v: def.address },
    { e: "🕒", t: "খোলার সময়", v: def.hours },
  ];
  return (
    <Page narrow>
      <Back href={base} label="হোম" />
      <SectionTitle t="💬 যোগাযোগ" sub="যেকোনো প্রশ্নে মেসেজ করুন" />
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
          ✅ মেসেজ পাঠানো হয়েছে! (ডেমো)
          <button onClick={() => setSent(false)} className="mt-2 block w-full text-xs font-bold underline opacity-70">
            আরেকটি মেসেজ পাঠান
          </button>
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          <DField value={name} onChange={(e) => setName(e.target.value)} placeholder="আপনার নাম *" />
          <DField value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="মোবাইল নম্বর *" inputMode="numeric" />
          <DArea value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="আপনার মেসেজ লিখুন... *" rows={4} />
          <button
            onClick={() => {
              if (name.trim().length >= 3 && msg.trim().length >= 5) setSent(true);
            }}
            className="btn-demo w-full !py-3.5"
            style={{ background: accent }}
          >
            📨 মেসেজ পাঠান
          </button>
        </div>
      )}
    </Page>
  );
}

export type { DemoProduct };
