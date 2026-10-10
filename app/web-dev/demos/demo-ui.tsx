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
export function MiniCart({ items, onClose, onClear, accent }: {
  items: { n: string; p: number }[];
  onClose: () => void;
  onClear: () => void;
  accent: string;
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
            <button onClick={() => setDone(true)} className="mt-4 w-full rounded-2xl py-3 font-black text-black" style={{ background: accent }}>
              ✅ অর্ডার কনফার্ম করুন
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
