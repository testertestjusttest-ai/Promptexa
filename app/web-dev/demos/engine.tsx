"use client";

import { useState } from "react";
import { Toast, MiniCart } from "./demo-ui";
import type { EngineDef } from "./engine-data";
import { ENGINE_DEFS } from "./engine-data";

function Head({ def }: { def: EngineDef }) {
  return (
    <div className="flex items-center justify-between px-5 py-4">
      <span className="text-lg font-black text-white">{def.heroEmoji} {def.name}</span>
      <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold text-slate-300">{def.type}</span>
    </div>
  );
}

function Hero({ def }: { def: EngineDef }) {
  return (
    <div className={`bg-gradient-to-br ${def.grad} px-5 py-10 text-white`}>
      <div className="text-5xl">{def.heroEmoji}</div>
      <p className="mt-3 text-3xl font-black drop-shadow-lg">{def.heroTitle}</p>
      <p className="mt-1.5 text-sm opacity-90">{def.heroSub}</p>
    </div>
  );
}

/* ---------------- SHOP layout ---------------- */
function EngineShop({ def }: { def: EngineDef }) {
  const [cat, setCat] = useState(def.cats[0]);
  const [cart, setCart] = useState<{ n: string; p: number }[]>([]);
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState("");
  const show = def.items.filter((i) => cat === def.cats[0] || i.c === cat);
  return (
    <div className="bg-[#0a0a12] text-white">
      <Toast msg={toast} />
      {open && <MiniCart items={cart} onClose={() => setOpen(false)} onClear={() => setCart([])} accent={def.accent} />}
      <Head def={def} />
      <div className="px-5 pb-1 text-right">
        <button onClick={() => setOpen(true)} className="rounded-full bg-white/10 px-4 py-1.5 text-sm font-bold hover:bg-white/20">🛒 কার্ট ({cart.length})</button>
      </div>
      <Hero def={def} />
      <div className="flex gap-2 overflow-x-auto px-5 py-4">
        {def.cats.map((c) => (
          <button key={c} onClick={() => setCat(c)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold ${cat === c ? "text-black" : "bg-white/10 text-slate-300"}`}
            style={cat === c ? { background: def.accent } : undefined}>{c}</button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 px-5 pb-6 sm:grid-cols-3">
        {show.map((i) => (
          <div key={i.n} className="rounded-2xl bg-white/5 p-4 text-center">
            <div className="text-4xl">{i.e}</div>
            <p className="mt-2 text-sm font-bold">{i.n}</p>
            {i.d && <p className="text-[11px] text-slate-400">{i.d}</p>}
            <p className="font-bold" style={{ color: def.accent }}>{i.p.toLocaleString("en-IN")} টাকা</p>
            <button
              onClick={() => { setCart((c) => [...c, i]); setToast(`✅ ${i.n} কার্টে!`); setTimeout(() => setToast(""), 1500); }}
              className="mt-2 w-full rounded-xl py-2 text-sm font-bold text-black" style={{ background: def.accent }}>+ যোগ করুন</button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- SERVICE layout ---------------- */
function EngineService({ def }: { def: EngineDef }) {
  const [booked, setBooked] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  return (
    <div className="bg-[#0a0a12] text-white">
      <Toast msg={toast} />
      <Head def={def} />
      <Hero def={def} />
      <div className="mx-auto max-w-xl space-y-3 p-5">
        <p className="text-sm font-bold text-slate-300">👆 সার্ভিস বেছে বুক করুন</p>
        {def.items.map((s) => (
          <div key={s.n} className="flex items-center gap-3 rounded-2xl bg-white/5 p-4">
            <span className="text-4xl">{s.e}</span>
            <div className="flex-1">
              <p className="font-bold">{s.n}</p>
              <p className="text-xs text-slate-400">{s.d ? `⏱️ ${s.d} • ` : ""}<b style={{ color: def.accent }}>{s.p.toLocaleString("en-IN")} টাকা</b></p>
            </div>
            <button onClick={() => { setBooked(s.n); setToast(`✅ "${s.n}" বুকিং সফল! (ডেমো)`); setTimeout(() => setToast(""), 2000); }}
              className={`rounded-xl px-4 py-2 text-sm font-bold ${booked === s.n ? "bg-emerald-500 text-white" : "text-black"}`}
              style={booked !== s.n ? { background: def.accent } : undefined}>
              {booked === s.n ? "✓ বুকড" : "বুক করুন"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- GALLERY layout ---------------- */
function EngineGallery({ def }: { def: EngineDef }) {
  const [open, setOpen] = useState<number | null>(null);
  const [booked, setBooked] = useState(false);
  return (
    <div className="bg-[#0a0a12] px-5 py-8 text-white">
      <p className="text-center text-2xl font-black">{def.heroEmoji} {def.name}</p>
      <p className="mt-1 text-center text-sm text-slate-400">{def.heroSub}</p>
      <p className="mt-2 text-center text-xs text-slate-500">👆 ছবিতে ক্লিক করে বড় করে দেখুন</p>
      <div className="mx-auto mt-6 grid max-w-3xl grid-cols-3 gap-2">
        {def.items.map((s, i) => (
          <button key={i} onClick={() => setOpen(i)}
            className={`grid h-28 place-items-center rounded-xl bg-gradient-to-br ${def.grad} text-4xl transition hover:scale-105`}>{s.e}</button>
        ))}
      </div>
      {open !== null && (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-black/90 p-6" onClick={() => setOpen(null)}>
          <div className="text-center">
            <div className={`grid h-64 w-64 place-items-center rounded-3xl bg-gradient-to-br ${def.grad} text-8xl`}>{def.items[open].e}</div>
            <p className="mt-4 font-bold text-white">{def.items[open].n}</p>
            <p className="mt-1 text-xs text-slate-400">বন্ধ করতে যেকোনো জায়গায় ক্লিক করুন</p>
          </div>
        </div>
      )}
      <div className="mx-auto mt-6 max-w-md rounded-2xl bg-white/5 p-4 text-center">
        {booked ? (
          <p className="rounded-xl bg-emerald-500/15 px-4 py-2.5 text-sm font-bold text-emerald-300">✅ বুকিং রিকোয়েস্ট পাঠানো হয়েছে! (ডেমো)</p>
        ) : (
          <>
            <p className="text-sm font-bold">📅 বুকিং করুন</p>
            <button onClick={() => setBooked(true)} className="mt-3 rounded-xl px-6 py-2 text-sm font-bold text-black" style={{ background: def.accent }}>বুক করুন</button>
          </>
        )}
      </div>
    </div>
  );
}

/* ---------------- BOOKING layout ---------------- */
function EngineBooking({ def }: { def: EngineDef }) {
  const [d, setD] = useState(0);
  const [qty, setQty] = useState(2);
  const [done, setDone] = useState(false);
  const total = def.items[d].p * qty;
  return (
    <div className="bg-[#0a0a12] text-white">
      <Head def={def} />
      <Hero def={def} />
      <div className="mx-auto max-w-xl space-y-4 p-5">
        <div>
          <p className="mb-2 text-sm font-bold text-slate-300">📍 অপশন বেছে নিন</p>
          <div className="grid grid-cols-3 gap-2">
            {def.items.map((x, i) => (
              <button key={x.n} onClick={() => { setD(i); setDone(false); }}
                className={`rounded-2xl border-2 p-3 text-center ${d === i ? "bg-white/10" : "border-white/10"}`}
                style={d === i ? { borderColor: def.accent } : undefined}>
                <div className="text-3xl">{x.e}</div>
                <p className="mt-1 text-xs font-bold">{x.n}</p>
                <p className="text-xs" style={{ color: def.accent }}>{x.p.toLocaleString("en-IN")} টাকা</p>
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between rounded-2xl bg-white/5 p-4">
          <p className="text-sm font-bold">👥 সংখ্যা</p>
          <div className="flex items-center gap-3">
            <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-lg font-bold">−</button>
            <span className="text-lg font-black">{qty}</span>
            <button onClick={() => setQty((q) => Math.min(10, q + 1))} className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-lg font-bold">+</button>
          </div>
        </div>
        <div className="flex items-center justify-between rounded-2xl p-4 text-white" style={{ background: def.accent }}>
          <p className="font-bold text-black/70">মোট খরচ</p>
          <p className="text-2xl font-black text-black">{total.toLocaleString("en-IN")} টাকা</p>
        </div>
        {done ? (
          <div className="rounded-2xl bg-emerald-500/15 p-4 text-center">
            <p className="text-sm font-bold text-emerald-300">✅ বুকিং সফল! (ডেমো)</p>
            <p className="mt-1 text-xs text-slate-400">{def.items[d].n} • {qty} জন • {total.toLocaleString("en-IN")} টাকা</p>
            <button onClick={() => setDone(false)} className="mt-2 text-xs font-bold underline" style={{ color: def.accent }}>নতুন বুকিং</button>
          </div>
        ) : (
          <button onClick={() => setDone(true)} className="w-full rounded-2xl py-3.5 font-black text-black" style={{ background: def.accent }}>🎫 এখনই বুক করুন</button>
        )}
      </div>
    </div>
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
