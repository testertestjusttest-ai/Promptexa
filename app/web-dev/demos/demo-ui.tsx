"use client";

import { useState } from "react";
import { toBnDigits } from "@/lib/format";

export function Toast({ msg }: { msg: string }) {
  if (!msg) return null;
  return (
    <div className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 animate-pulse rounded-2xl bg-[#d7ff3f] px-6 py-3 text-sm font-black text-black shadow-2xl">
      {msg}
    </div>
  );
}

/** Shared mini cart drawer — every demo cart fully works. */
export function MiniCart({ items, onClose, onClear, accent, onCheckout }: {
  items: { n: string; p: number }[];
  onClose: () => void;
  onClear: () => void;
  accent: string;
  onCheckout?: () => void;
}) {
  const [done, setDone] = useState(false);
  const total = items.reduce((s, i) => s + i.p, 0);
  return (
    <div className="fixed inset-0 z-[70] bg-black/70" onClick={onClose}>
      <div className="absolute bottom-0 left-0 right-0 mx-auto max-h-[75vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-[#101828] p-5 text-white" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between">
          <p className="font-black">🛒 আপনার কার্ট ({items.length})</p>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full bg-white/10">✕</button>
        </div>
        {done ? (
          <div className="py-8 text-center">
            <p className="text-5xl">🎉</p>
            <p className="mt-3 font-black text-emerald-300">অর্ডার সফল! (ডেমো)</p>
            <p className="mt-1 text-xs text-slate-400">আসল সাইটে এখানে পেমেন্ট অপশন আসবে।</p>
            <button onClick={() => { onClear(); onClose(); }} className="mt-4 rounded-xl bg-white/10 px-6 py-2 text-sm font-bold">ঠিক আছে</button>
          </div>
        ) : items.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">কার্ট খালি — কিছু যোগ করুন 🛒</p>
        ) : (
          <>
            <div className="space-y-2">
              {items.map((i, idx) => (
                <div key={idx} className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2.5">
                  <span className="text-sm font-bold">{i.n}</span>
                  <span className="text-sm font-black" style={{ color: accent }}>{toBnDigits(i.p.toLocaleString("en-IN"))} টাকা</span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
              <span className="font-bold">মোট</span>
              <span className="text-xl font-black" style={{ color: accent }}>{toBnDigits(total.toLocaleString("en-IN"))} টাকা</span>
            </div>
            <button onClick={() => { if (onCheckout) onCheckout(); else setDone(true); }} className="btn-demo mt-4 w-full !py-3" style={{ background: accent }}>
              {onCheckout ? "➡️ চেকআউট করুন" : "✅ অর্ডার কনফার্ম করুন"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export type DemoProduct = { n: string; p: number; e: string; c: string; d?: string };

/** Product detail modal — big visual, qty stepper, add to cart, related items. */
export function ProductModal({ product, related, accent, dark = true, onClose, onAdd }: {
  product: DemoProduct;
  related: DemoProduct[];
  accent: string;
  dark?: boolean;
  onClose: () => void;
  onAdd: (p: DemoProduct, qty: number) => void;
}) {
  const [qty, setQty] = useState(1);
  const bg = dark ? "bg-[#101828] text-white" : "bg-white text-slate-800";
  const sub = dark ? "text-slate-400" : "text-slate-500";
  return (
    <div className="fixed inset-0 z-[75] grid place-items-center bg-black/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className={`animate-modal-pop max-h-[88vh] w-full max-w-md overflow-y-auto rounded-3xl ${bg} shadow-2xl`} onClick={(e) => e.stopPropagation()}>
        <div className="relative grid h-52 place-items-center overflow-hidden rounded-t-3xl bg-gradient-to-br from-white/10 to-transparent">
          <span className="text-8xl drop-shadow-2xl">{product.e}</span>
          <button onClick={onClose} aria-label="বন্ধ করুন"
            className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-black/50 text-lg text-white backdrop-blur">✕</button>
          <span className="absolute left-3 top-3 rounded-full bg-black/50 px-3 py-1 text-[11px] font-bold text-white backdrop-blur">{product.c}</span>
        </div>
        <div className="p-5">
          <p className="text-xl font-black">{product.n}</p>
          <p className={`mt-1 text-xs leading-relaxed ${sub}`}>
            {product.d ?? "প্রিমিয়াম কোয়ালিটি • সারাদেশে হোম ডেলিভারি • ৭ দিনের রিপ্লেসমেন্ট গ্যারান্টি"}
          </p>
          <div className="mt-2 flex items-center gap-1 text-sm">
            <span className="text-amber-400">★★★★★</span>
            <span className={`text-xs ${sub}`}>৪.৮ (২৩০+ রিভিউ)</span>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <p className="text-2xl font-black" style={{ color: accent }}>{toBnDigits(product.p.toLocaleString("en-IN"))} টাকা</p>
            <div className={`flex items-center gap-3 rounded-full px-2 py-1 ${dark ? "bg-white/10" : "bg-slate-100"}`}>
              <button onClick={() => setQty((x) => Math.max(1, x - 1))} className="grid h-8 w-8 place-items-center rounded-full bg-black/20 text-lg font-black">−</button>
              <span className="min-w-6 text-center text-lg font-black">{toBnDigits(qty)}</span>
              <button onClick={() => setQty((x) => Math.min(20, x + 1))} className="grid h-8 w-8 place-items-center rounded-full bg-black/20 text-lg font-black">+</button>
            </div>
          </div>
          <button onClick={() => { onAdd(product, qty); onClose(); }}
            className="btn-demo mt-4 w-full !py-3.5 text-base" style={{ background: accent }}>
            🛒 কার্টে নিন — {toBnDigits((product.p * qty).toLocaleString("en-IN"))} টাকা
          </button>
          {related.length > 0 && (
            <>
              <p className="mt-5 text-sm font-black">🔗 আরও দেখুন</p>
              <div className="mt-2 grid grid-cols-4 gap-2">
                {related.slice(0, 4).map((r) => (
                  <div key={r.n} className={`rounded-xl p-2 text-center ${dark ? "bg-white/5" : "bg-slate-100"}`}>
                    <div className="text-2xl">{r.e}</div>
                    <p className="mt-1 truncate text-[10px] font-bold">{r.n}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ================= Demo order system (Daraz-like, browser-local) ================= */

export type DemoOrderItem = { n: string; p: number };
export type DemoOrder = {
  id: string;
  shop: string;
  items: DemoOrderItem[];
  total: number;
  name: string;
  phone: string;
  address: string;
  pay: string;
  date: number;
};

function ordersKey(slug: string) {
  return `demo_orders_${slug}`;
}

export function getDemoOrders(slug: string): DemoOrder[] {
  try {
    return JSON.parse(localStorage.getItem(ordersKey(slug)) || "[]");
  } catch {
    return [];
  }
}

export function saveDemoOrder(slug: string, order: DemoOrder) {
  const all = getDemoOrders(slug);
  all.unshift(order);
  localStorage.setItem(ordersKey(slug), JSON.stringify(all.slice(0, 20)));
}

function demoOrderId() {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `DM-${ymd}-${rand}`;
}

/** Full checkout: cart → address form → confirmed order with order number. */
export function DemoCheckout({ slug, shopName, items, accent, dark = true, onClose, onClear }: {
  slug: string;
  shopName: string;
  items: DemoOrderItem[];
  accent: string;
  dark?: boolean;
  onClose: () => void;
  onClear: () => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [pay, setPay] = useState("ক্যাশ অন ডেলিভারি");
  const [error, setError] = useState("");
  const [order, setOrder] = useState<DemoOrder | null>(null);
  const total = items.reduce((s, i) => s + i.p, 0);
  const bg = dark ? "bg-[#101828] text-white" : "bg-white text-slate-800";
  const field = dark
    ? "w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-white/40"
    : "w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400";
  const sub = dark ? "text-slate-400" : "text-slate-500";

  function place() {
    setError("");
    if (name.trim().length < 3) return setError("আপনার নাম লিখুন");
    if (!/^01[3-9]\d{8}$/.test(phone.trim())) return setError("সঠিক ১১ সংখ্যার মোবাইল নম্বর দিন");
    if (address.trim().length < 8) return setError("সম্পূর্ণ ঠিকানা লিখুন");
    const o: DemoOrder = {
      id: demoOrderId(), shop: shopName, items, total,
      name: name.trim(), phone: phone.trim(), address: address.trim(), pay, date: Date.now(),
    };
    saveDemoOrder(slug, o);
    setOrder(o);
    onClear();
  }

  return (
    <div className="fixed inset-0 z-[78] grid place-items-center bg-black/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className={`animate-modal-pop max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl ${bg} p-6 shadow-2xl`} onClick={(e) => e.stopPropagation()}>
        {order ? (
          <div className="py-4 text-center">
            <p className="text-6xl">🎉</p>
            <p className="mt-3 text-xl font-black text-emerald-400">অর্ডার সফল!</p>
            <p className={`mt-1 text-xs ${sub}`}>ধন্যবাদ {order.name}! শীঘ্রই কল পাবেন।</p>
            <div className={`mt-4 rounded-2xl p-4 text-left ${dark ? "bg-white/5" : "bg-slate-50"}`}>
              <p className={`text-xs ${sub}`}>অর্ডার নম্বর</p>
              <p className="font-mono text-lg font-black" style={{ color: accent }}>{order.id}</p>
              <div className="mt-2 space-y-1 text-xs">
                <p>📦 {order.items.length}টি পণ্য • <b>{toBnDigits(order.total.toLocaleString("en-IN"))} টাকা</b></p>
                <p>💰 {order.pay}</p>
                <p>📍 {order.address}</p>
                <p>🚚 ডেলিভারি: ২–৩ দিনের মধ্যে</p>
              </div>
            </div>
            <p className={`mt-3 text-[11px] ${sub}`}>💡 এটি ডেমো অর্ডার — আসল সাইটে এখানে SMS/ইমেইল কনফার্মেশন যাবে।</p>
            <button onClick={onClose} className="btn-demo mt-4 w-full !py-3" style={{ background: accent }}>🛍️ আরও কেনাকাটা</button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <p className="text-lg font-black">🧾 চেকআউট</p>
              <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full bg-black/20 text-lg">✕</button>
            </div>
            <div className={`mt-3 rounded-2xl p-3 text-sm ${dark ? "bg-white/5" : "bg-slate-50"}`}>
              <p className={sub}>{items.length}টি পণ্য</p>
              <p className="text-xl font-black" style={{ color: accent }}>{toBnDigits(total.toLocaleString("en-IN"))} টাকা</p>
            </div>
            <div className="mt-4 space-y-3">
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="আপনার নাম *" className={field} />
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="মোবাইল নম্বর * (01XXXXXXXXX)" className={field} inputMode="numeric" />
              <textarea value={address} onChange={(e) => setAddress(e.target.value)} placeholder="সম্পূর্ণ ঠিকানা * (বাসা/হোল্ডিং, রোড, এলাকা, জেলা)" className={field} rows={2} />
              <div>
                <p className={`mb-1.5 text-xs font-bold ${sub}`}>পেমেন্ট মাধ্যম</p>
                <div className="grid grid-cols-2 gap-2">
                  {["ক্যাশ অন ডেলিভারি", "বিকাশ", "নগদ", "রকেট"].map((m) => (
                    <button key={m} onClick={() => setPay(m)}
                      className={`rounded-xl border-2 px-3 py-2.5 text-sm font-bold transition ${pay === m ? "" : dark ? "border-white/10 text-slate-300" : "border-slate-200 text-slate-600"}`}
                      style={pay === m ? { borderColor: accent, background: `${accent}18` } : undefined}>
                      {m === "ক্যাশ অন ডেলিভারি" ? "💵 " : m === "বিকাশ" ? "🩷 " : m === "নগদ" ? "🧡 " : "💜 "}{m}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {error && <p className="mt-3 rounded-xl bg-red-500/10 px-4 py-2.5 text-xs font-bold text-red-400">⚠️ {error}</p>}
            <button onClick={place} className="btn-demo mt-4 w-full !py-3.5 text-base" style={{ background: accent }}>
              ✅ অর্ডার কনফার্ম করুন
            </button>
            <p className={`mt-2 text-center text-[11px] ${sub}`}>ডেমো চেকআউট — কোনো আসল টাকা কাটা হবে না</p>
          </>
        )}
      </div>
    </div>
  );
}

/** Order history for a demo shop (from browser storage). */
export function DemoOrders({ slug, accent, dark = true, onClose }: {
  slug: string;
  accent: string;
  dark?: boolean;
  onClose: () => void;
}) {
  const [orders] = useState<DemoOrder[]>(() => getDemoOrders(slug));
  const bg = dark ? "bg-[#101828] text-white" : "bg-white text-slate-800";
  const sub = dark ? "text-slate-400" : "text-slate-500";
  return (
    <div className="fixed inset-0 z-[78] grid place-items-center bg-black/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className={`animate-modal-pop max-h-[85vh] w-full max-w-md overflow-y-auto rounded-3xl ${bg} p-6 shadow-2xl`} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <p className="text-lg font-black">📦 আমার অর্ডার</p>
          <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full bg-black/20 text-lg">✕</button>
        </div>
        {orders.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-5xl">📭</p>
            <p className={`mt-3 text-sm ${sub}`}>এখনো কোনো অর্ডার করেননি</p>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {orders.map((o) => (
              <div key={o.id} className={`rounded-2xl p-4 ${dark ? "bg-white/5" : "bg-slate-50"}`}>
                <div className="flex items-center justify-between">
                  <p className="font-mono text-sm font-black" style={{ color: accent }}>{o.id}</p>
                  <span className="rounded-full bg-amber-400/15 px-2.5 py-1 text-[10px] font-bold text-amber-400">🚚 প্রসেসিং</span>
                </div>
                <p className="mt-1.5 text-xs">{o.items.map((i) => i.n).join(", ")}</p>
                <p className={`mt-1 text-xs ${sub}`}>
                  {new Date(o.date).toLocaleDateString("bn-BD")} • {toBnDigits(o.total.toLocaleString("en-IN"))} টাকা • {o.pay}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
