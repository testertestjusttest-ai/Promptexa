"use client";

import { useEffect, useMemo, useState } from "react";

type DemoInfo = { slug: string; name: string; type: string; layout: string };
type Handover = {
  id: string;
  demoSlug: string;
  demoName: string;
  clientName: string;
  siteTitle: string;
  contact: string;
  theme: string;
  accent: string;
  date: string;
  status: string;
};

const THEMES = [
  { id: "aurora", n: "🌌 অরোরা" }, { id: "split", n: "◧ স্প্লিট" },
  { id: "minimal", n: "○ মিনিমাল" }, { id: "bold", n: "💥 বোল্ড" },
  { id: "elegant", n: "✨ এলিগ্যান্ট" }, { id: "playful", n: "🎈 প্লেফুল" },
];
const ACCENTS = ["#f97316", "#ef4444", "#ec4899", "#8b5cf6", "#3b82f6", "#0ea5e9", "#10b981", "#84cc16", "#eab308"];

const LS = "dp_client_sites";

export default function ClientSitesPage() {
  const [demos, setDemos] = useState<DemoInfo[]>([]);
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<DemoInfo | null>(null);
  const [clientName, setClientName] = useState("");
  const [siteTitle, setSiteTitle] = useState("");
  const [contact, setContact] = useState("");
  const [theme, setTheme] = useState("aurora");
  const [accent, setAccent] = useState("#f97316");
  const [handovers, setHandovers] = useState<Handover[]>([]);
  const [done, setDone] = useState<Handover | null>(null);

  useEffect(() => {
    fetch("/api/demos/list").then((r) => r.json()).then((d) => {
      if (d.demos) setDemos(d.demos);
    }).catch(() => {});
    try {
      const v = localStorage.getItem(LS);
      if (v) setHandovers(JSON.parse(v));
    } catch {}
  }, []);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return demos;
    return demos.filter((d) => (d.name + " " + d.type + " " + d.slug).toLowerCase().includes(query));
  }, [demos, q]);

  function generate() {
    if (!sel) return;
    if (clientName.trim().length < 3) { alert("ক্লায়েন্টের নাম দিন"); return; }
    if (siteTitle.trim().length < 3) { alert("সাইটের টাইটেল দিন"); return; }
    const h: Handover = {
      id: "CS-" + Date.now().toString(36).toUpperCase(),
      demoSlug: sel.slug,
      demoName: sel.name,
      clientName: clientName.trim(),
      siteTitle: siteTitle.trim(),
      contact: contact.trim(),
      theme,
      accent,
      date: new Date().toLocaleDateString("bn-BD"),
      status: "প্রস্তুত",
    };
    const all = [h, ...handovers];
    setHandovers(all);
    try { localStorage.setItem(LS, JSON.stringify(all)); } catch {}
    setDone(h);
  }

  function downloadKit(h: Handover) {
    const kit = {
      handoverId: h.id,
      demoSlug: h.demoSlug,
      client: { name: h.clientName, siteTitle: h.siteTitle, contact: h.contact },
      custom: { theme: h.theme, accent: h.accent, siteName: h.siteTitle },
      deploySteps: [
        "১. Vercel-এ নতুন প্রজেক্ট বানিয়ে এই রিপো কানেক্ট করুন",
        "২. Supabase-এ নতুন প্রজেক্ট বানিয়ে migrations/001-011 চালান",
        "৩. Vercel env vars সেট করুন (Supabase URL/keys)",
        "৪. /demo" + h.demoSlug + "/admin থেকে কাস্টমাইজেশন দেখুন",
        "৫. ডোমেইন কানেক্ট করে ক্লায়েন্টকে হ্যান্ডওভার করুন",
      ],
      demoUrl: `https://promptexa.vercel.app/demo${h.demoSlug}`,
      adminUrl: `https://promptexa.vercel.app/demo${h.demoSlug}/admin`,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(kit, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${h.demoSlug}-${h.id}-handover.json`;
    a.click();
  }

  const input = "w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-[#d7ff3f]/50";

  return (
    <div>
      <h1 className="font-display text-xl font-bold text-white">🚀 ক্লায়েন্ট সাইট হ্যান্ডওভার</h1>
      <p className="mt-1 text-xs text-slate-500">
        ডেমো বেছে নিন → ক্লায়েন্টের তথ্য দিন → এক ক্লিকে হ্যান্ডওভার কিট তৈরি করুন
      </p>

      {done && (
        <div className="glass mt-4 rounded-2xl border-[#d7ff3f]/40 p-5">
          <p className="text-lg font-black text-[#d7ff3f]">✅ হ্যান্ডওভার প্রস্তুত!</p>
          <p className="mt-1 text-sm text-slate-300">
            <b>{done.clientName}</b> — <b>{done.siteTitle}</b> ({done.demoName} থেকে)
          </p>
          <p className="mt-1 text-xs text-slate-500">🆔 {done.id} • থিম: {done.theme} • কালার: {done.accent}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button onClick={() => downloadKit(done)} className="rounded-xl bg-[#d7ff3f] px-5 py-2.5 text-sm font-black text-black hover:brightness-110">
              📥 হ্যান্ডওভার কিট ডাউনলোড
            </button>
            <a href={`/demo${done.demoSlug}/admin`} target="_blank" className="rounded-xl bg-white/10 px-5 py-2.5 text-sm font-bold text-white hover:bg-white/15">
              ⚙️ ডেমো অ্যাডমিন দেখুন
            </a>
            <button onClick={() => setDone(null)} className="rounded-xl bg-white/5 px-5 py-2.5 text-sm text-slate-400 hover:bg-white/10">
              নতুন তৈরি করুন
            </button>
          </div>
        </div>
      )}

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="glass rounded-2xl p-4">
          <p className="mb-2 text-sm font-bold text-white">১. ডেমো বেছে নিন ({filtered.length})</p>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="🔍 খুঁজুন..." className={`${input} mb-2`} />
          <div className="max-h-[50vh] space-y-1.5 overflow-y-auto">
            {filtered.map((d) => (
              <button
                key={d.slug}
                onClick={() => setSel(d)}
                className={`w-full rounded-xl px-3 py-2.5 text-left ${sel?.slug === d.slug ? "bg-[#d7ff3f]/15 ring-1 ring-[#d7ff3f]/40" : "bg-white/5 hover:bg-white/10"}`}
              >
                <p className="text-sm font-bold text-white">{d.name} {sel?.slug === d.slug && "✓"}</p>
                <p className="text-[11px] text-slate-500">{d.type} • /demo{d.slug}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="glass rounded-2xl p-4">
          <p className="mb-2 text-sm font-bold text-white">২. ক্লায়েন্টের তথ্য</p>
          {!sel && <p className="py-8 text-center text-xs text-slate-500">আগে একটি ডেমো সিলেক্ট করুন 👈</p>}
          {sel && (
            <div className="space-y-3">
              <div className="rounded-xl bg-[#d7ff3f]/10 p-3">
                <p className="text-sm font-black text-[#d7ff3f]">বেস ডেমো: {sel.name}</p>
                <p className="text-[11px] text-slate-400">{sel.type}</p>
              </div>
              <input value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="ক্লায়েন্টের নাম *" className={input} />
              <input value={siteTitle} onChange={(e) => setSiteTitle(e.target.value)} placeholder="সাইটের টাইটেল * (যেমন: রহিম স্টোর)" className={input} />
              <input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="ক্লায়েন্টের মোবাইল/WhatsApp" className={input} />
              <div>
                <p className="mb-1.5 text-xs font-bold text-slate-300">🎨 থিম</p>
                <div className="grid grid-cols-3 gap-1.5">
                  {THEMES.map((t) => (
                    <button key={t.id} onClick={() => setTheme(t.id)}
                      className={`rounded-xl px-2 py-2 text-xs font-bold ${theme === t.id ? "bg-[#d7ff3f] text-black" : "bg-white/5 text-slate-300 hover:bg-white/10"}`}>
                      {t.n}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-1.5 text-xs font-bold text-slate-300">🌈 ব্র্যান্ড কালার</p>
                <div className="flex flex-wrap gap-1.5">
                  {ACCENTS.map((c) => (
                    <button key={c} onClick={() => setAccent(c)} aria-label={c}
                      className={`h-8 w-8 rounded-full ${accent === c ? "ring-2 ring-white" : "hover:scale-110"}`}
                      style={{ background: c }} />
                  ))}
                </div>
              </div>
              <button onClick={generate} className="w-full rounded-xl bg-[#d7ff3f] py-3 text-sm font-black text-black hover:brightness-110">
                🚀 এক ক্লিকে হ্যান্ডওভার কিট তৈরি করুন
              </button>
            </div>
          )}
        </div>
      </div>

      {handovers.length > 0 && (
        <div className="glass mt-4 rounded-2xl p-4">
          <p className="mb-2 text-sm font-bold text-white">📋 আগের হ্যান্ডওভার ({handovers.length})</p>
          <div className="space-y-2">
            {handovers.map((h) => (
              <div key={h.id} className="flex items-center justify-between gap-3 rounded-xl bg-white/5 p-3">
                <div>
                  <p className="text-sm font-bold text-white">{h.siteTitle} <span className="font-normal text-slate-500">— {h.clientName}</span></p>
                  <p className="text-[11px] text-slate-500">{h.id} • {h.demoName} • {h.date} • {h.status}</p>
                </div>
                <button onClick={() => downloadKit(h)} className="shrink-0 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-bold text-white hover:bg-white/15">
                  📥 কিট
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
