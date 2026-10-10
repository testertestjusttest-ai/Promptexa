"use client";

import { useState } from "react";

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
                  <span className="text-sm font-black" style={{ color: accent }}>{i.p.toLocaleString("en-IN")} টাকা</span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
              <span className="font-bold">মোট</span>
              <span className="text-xl font-black" style={{ color: accent }}>{total.toLocaleString("en-IN")} টাকা</span>
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
