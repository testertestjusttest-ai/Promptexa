"use client";

/** Per-demo admin panel — customize theme, colors, names, hero.
 * Changes apply live and persist in browser-local storage per demo slug.
 * When handing over to a client, these settings travel with the handover kit.
 */

import { useState } from "react";
import Link from "next/link";
import { useDemo } from "./store";
import { Page, SectionTitle, Back } from "./ui";

const THEMES = [
  { id: "aurora", n: "অরোরা", d: "স্লাইডার হিরো, গ্রেডিয়েন্ট", e: "🌌" },
  { id: "split", n: "স্প্লিট", d: "বামে লেখা, ডানে ছবি", e: "◧" },
  { id: "minimal", n: "মিনিমাল", d: "পরিষ্কার, হালকা", e: "○" },
  { id: "bold", n: "বোল্ড", d: "বড় টাইপ, ডার্ক", e: "💥" },
  { id: "elegant", n: "এলিগ্যান্ট", d: "সেরিফ, রিফাইন্ড", e: "✨" },
  { id: "playful", n: "প্লেফুল", d: "রঙিন, গোলগাল", e: "🎈" },
];

const ACCENTS = [
  "#f97316", "#ef4444", "#ec4899", "#8b5cf6", "#3b82f6",
  "#0ea5e9", "#10b981", "#84cc16", "#eab308", "#f59e0b",
];

export function DemoAdmin() {
  const { def, base, store } = useDemo();
  const dark = def.dark;
  const [name, setName] = useState(store.custom.siteName ?? def.name);
  const [logo, setLogo] = useState(store.custom.logoEmoji ?? def.logoEmoji);
  const [heroT, setHeroT] = useState(store.custom.heroTitle ?? def.heroTitle);
  const [heroS, setHeroS] = useState(store.custom.heroSub ?? def.heroSub);
  const [saved, setSaved] = useState(false);

  const card = `rounded-2xl border ${dark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"}`;
  const sub = dark ? "text-slate-400" : "text-slate-500";
  const input = `w-full rounded-xl border px-4 py-2.5 text-sm outline-none ${dark ? "border-white/15 bg-white/5 text-white" : "border-slate-200 bg-white"}`;

  const save = () => {
    store.saveCustom({ siteName: name.trim() || def.name, logoEmoji: logo.trim() || def.logoEmoji, heroTitle: heroT.trim(), heroSub: heroS.trim() });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const stats = [
    ["🛒", "অর্ডার", store.orders.length],
    ["📅", "বুকিং", store.bookings.length],
    ["💼", "বিনিয়োগ", store.investments.length],
    ["💱", "এক্সচেঞ্জ", store.exchanges.length],
    ["💰", "ডিপোজিট", store.deposits.length],
    ["👛", "কয়েন Tx", store.coinTxs.length],
  ];

  return (
    <Page>
      <Back href={base} label="সাইটে ফিরুন" />
      <SectionTitle t="⚙️ ডেমো অ্যাডমিন" sub={`${def.name} — কাস্টমাইজেশন`} />

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {stats.map(([e, t, v]) => (
          <div key={t as string} className={`${card} p-3 text-center`}>
            <p className="text-xl">{e}</p>
            <p className="mt-1 text-lg font-black">{String(v)}</p>
            <p className={`text-[10px] ${sub}`}>{t}</p>
          </div>
        ))}
      </div>

      <div className={`${card} mt-4 p-5`}>
        <p className="text-sm font-black">🎨 থিম বেছে নিন</p>
        <p className={`mt-1 text-xs ${sub}`}>পুরো সাইটের লুক বদলে যাবে</p>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {THEMES.map((t) => {
            const active = (store.custom.theme ?? def.theme) === t.id;
            return (
              <button
                key={t.id}
                onClick={() => store.saveCustom({ theme: t.id })}
                className={`rounded-2xl border p-3 text-left transition ${active ? "ring-2" : "opacity-70 hover:opacity-100"} ${dark ? "border-white/15 bg-white/5" : "border-slate-200"}`}
                style={active ? ({ "--tw-ring-color": def.accent } as any) : undefined}
              >
                <p className="text-2xl">{t.e}</p>
                <p className="mt-1 text-sm font-black">{t.n} {active && "✓"}</p>
                <p className={`text-[11px] ${sub}`}>{t.d}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div className={`${card} mt-4 p-5`}>
        <p className="text-sm font-black">🌈 অ্যাকসেন্ট কালার</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {ACCENTS.map((c) => {
            const active = (store.custom.accent ?? def.accent) === c;
            return (
              <button
                key={c}
                onClick={() => store.saveCustom({ accent: c })}
                aria-label={c}
                className={`h-10 w-10 rounded-full transition ${active ? "ring-2 ring-offset-2" : "hover:scale-110"}`}
                style={{ background: c, ["--tw-ring-color" as any]: c }}
              >
                {active && <span className="text-white">✓</span>}
              </button>
            );
          })}
        </div>
        <div className="mt-4 flex items-center gap-3">
          <p className="text-sm font-black">🌙 ডার্ক মোড</p>
          <button
            onClick={() => store.saveCustom({ dark: !(store.custom.dark ?? def.dark) })}
            className={`relative h-7 w-12 rounded-full transition ${(store.custom.dark ?? def.dark) ? "bg-emerald-500" : "bg-slate-300"}`}
          >
            <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${(store.custom.dark ?? def.dark) ? "left-6" : "left-1"}`} />
          </button>
        </div>
      </div>

      <div className={`${card} mt-4 space-y-3 p-5`}>
        <p className="text-sm font-black">✏️ সাইটের তথ্য</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className={`text-[11px] ${sub}`}>সাইটের নাম</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className={`${input} mt-1`} />
          </div>
          <div>
            <label className={`text-[11px] ${sub}`}>লোগো ইমোজি</label>
            <input value={logo} onChange={(e) => setLogo(e.target.value)} className={`${input} mt-1`} />
          </div>
        </div>
        <div>
          <label className={`text-[11px] ${sub}`}>হিরো টাইটেল</label>
          <input value={heroT} onChange={(e) => setHeroT(e.target.value)} className={`${input} mt-1`} />
        </div>
        <div>
          <label className={`text-[11px] ${sub}`}>হিরো সাবটাইটেল</label>
          <input value={heroS} onChange={(e) => setHeroS(e.target.value)} className={`${input} mt-1`} />
        </div>
        <div className="flex gap-2">
          <button onClick={save} className="btn-demo flex-1" style={{ background: def.accent }}>
            {saved ? "✅ সেভ হয়েছে!" : "💾 সেভ করুন"}
          </button>
          <button
            onClick={() => { store.resetCustom(); setName(def.name); setLogo(def.logoEmoji); setHeroT(def.heroTitle); setHeroS(def.heroSub); }}
            className="btn-demo-ghost"
          >
            ↺ রিসেট
          </button>
        </div>
      </div>

      <div className={`${card} mt-4 p-5`}>
        <p className="text-sm font-black">📦 হ্যান্ডওভার</p>
        <p className={`mt-1 text-xs ${sub}`}>কাস্টমারকে দেওয়ার সময় এই সেটিংসসহ পুরো সাইটের কনফিগ ডাউনলোড করুন</p>
        <button
          onClick={() => {
            const kit = {
              site: def.slug,
              exportedAt: new Date().toISOString(),
              custom: store.custom,
              defaults: { theme: def.theme, accent: def.accent, name: def.name, logoEmoji: def.logoEmoji },
            };
            const blob = new Blob([JSON.stringify(kit, null, 2)], { type: "application/json" });
            const a = document.createElement("a");
            a.href = URL.createObjectURL(blob);
            a.download = `${def.slug}-handover.json`;
            a.click();
          }}
          className="btn-demo mt-3 w-full"
          style={{ background: def.accent }}
        >
          📥 হ্যান্ডওভার কিট ডাউনলোড
        </button>
      </div>

      <p className={`mt-4 text-center text-[11px] ${sub}`}>
        ডেমো অ্যাডমিন — পরিবর্তন শুধু এই ব্রাউজারে দেখা যাবে
      </p>
    </Page>
  );
}
