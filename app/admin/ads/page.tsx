"use client";

import { useEffect, useState } from "react";
import type { AdsConfig, AdSlotDef, AdPlacement } from "@/lib/catalog";

const PLACEMENTS: { id: AdPlacement; label: string }[] = [
  { id: "home_top", label: "হোম — উপরে" },
  { id: "home_bottom", label: "হোম — নিচে" },
  { id: "product_page", label: "প্রোডাক্ট পেজ" },
  { id: "popup", label: "পপআপ" },
  { id: "sitewide", label: "সব পেজে" },
  { id: "earn_top", label: "আয় পেজ — উপরে" },
  { id: "earn_bottom", label: "আয় পেজ — নিচে" },
];

function newSlot(): AdSlotDef {
  return {
    id: `slot_${Date.now()}`,
    name: "নতুন বিজ্ঞাপন",
    placement: "sitewide",
    code: "",
    enabled: true,
  };
}

export default function AdminAdsPage() {
  const [ads, setAds] = useState<AdsConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/admin/ads")
      .then((r) => r.json())
      .then((d) => setAds(d.ads))
      .catch(() => setMsg("লোড হয়নি"));
  }, []);

  const update = (patch: Partial<AdsConfig>) =>
    setAds((a) => (a ? { ...a, ...patch } : a));

  const updateSlot = (id: string, patch: Partial<AdSlotDef>) =>
    setAds((a) =>
      a ? { ...a, slots: a.slots.map((s) => (s.id === id ? { ...s, ...patch } : s)) } : a
    );

  const removeSlot = (id: string) =>
    setAds((a) => (a ? { ...a, slots: a.slots.filter((s) => s.id !== id) } : a));

  const save = async () => {
    if (!ads) return;
    setSaving(true);
    setMsg("");
    try {
      const r = await fetch("/api/admin/ads", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ads),
      });
      const d = await r.json();
      setMsg(r.ok ? "✅ সেভ হয়েছে" : "❌ " + (d.error || "সেভ হয়নি"));
    } catch {
      setMsg("❌ সেভ হয়নি");
    }
    setSaving(false);
  };

  if (!ads) return <p className="text-slate-400">লোড হচ্ছে…</p>;

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-bold text-white">📢 বিজ্ঞাপন ম্যানেজমেন্ট</h1>
      <p className="mt-1 text-sm text-slate-400">
        প্রতিটা বিজ্ঞাপন আলাদাভাবে চালু/বন্ধ করুন, অথবা মাস্টার সুইচে একসাথে সব বন্ধ করুন।
      </p>

      {/* Master switch */}
      <div className="glass mt-6 flex items-center justify-between rounded-2xl p-4">
        <div>
          <p className="font-semibold text-white">সব বিজ্ঞাপন</p>
          <p className="text-xs text-slate-400">বন্ধ করলে সাইটে কোনো বিজ্ঞাপন দেখাবে না</p>
        </div>
        <button
          onClick={() => update({ master_enabled: !ads.master_enabled })}
          className={`relative h-8 w-14 rounded-full transition ${
            ads.master_enabled ? "bg-lime-400" : "bg-white/10"
          }`}
        >
          <span
            className={`absolute top-1 h-6 w-6 rounded-full bg-white transition-all ${
              ads.master_enabled ? "left-7" : "left-1"
            }`}
          />
        </button>
      </div>

      {/* Slots */}
      <div className="mt-6 space-y-4">
        {ads.slots.map((s) => (
          <div key={s.id} className="glass rounded-2xl p-4">
            <div className="flex flex-wrap items-center gap-3">
              <input
                value={s.name}
                onChange={(e) => updateSlot(s.id, { name: e.target.value })}
                className="min-w-0 flex-1 rounded-xl bg-white/5 px-3 py-2 text-sm font-semibold text-white outline-none focus:ring-1 focus:ring-lime-400"
                placeholder="বিজ্ঞাপনের নাম"
              />
              <select
                value={s.placement}
                onChange={(e) => updateSlot(s.id, { placement: e.target.value as AdPlacement })}
                className="rounded-xl bg-white/5 px-3 py-2 text-sm text-white outline-none"
              >
                {PLACEMENTS.map((p) => (
                  <option key={p.id} value={p.id} className="bg-slate-900">
                    {p.label}
                  </option>
                ))}
              </select>
              <button
                onClick={() => updateSlot(s.id, { enabled: !s.enabled })}
                className={`relative h-8 w-14 shrink-0 rounded-full transition ${
                  s.enabled ? "bg-lime-400" : "bg-white/10"
                }`}
                title={s.enabled ? "বন্ধ করুন" : "চালু করুন"}
              >
                <span
                  className={`absolute top-1 h-6 w-6 rounded-full bg-white transition-all ${
                    s.enabled ? "left-7" : "left-1"
                  }`}
                />
              </button>
              <button
                onClick={() => removeSlot(s.id)}
                className="shrink-0 rounded-xl bg-red-500/10 px-3 py-2 text-sm text-red-400 hover:bg-red-500/20"
              >
                🗑
              </button>
            </div>
            <textarea
              value={s.code}
              onChange={(e) => updateSlot(s.id, { code: e.target.value })}
              rows={3}
              dir="ltr"
              placeholder="<script ...>...</script> — বিজ্ঞাপন কোড এখানে পেস্ট করুন"
              className="mt-3 w-full rounded-xl bg-black/30 p-3 font-mono text-xs text-lime-300 outline-none focus:ring-1 focus:ring-lime-400"
            />
            {!s.enabled && (
              <p className="mt-1 text-xs text-amber-400">⏸ এই বিজ্ঞাপনটি বন্ধ আছে</p>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          onClick={() => setAds((a) => (a ? { ...a, slots: [...a.slots, newSlot()] } : a))}
          className="rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/15"
        >
          ＋ নতুন বিজ্ঞাপন
        </button>
        <button
          onClick={save}
          disabled={saving}
          className="rounded-xl bg-lime-400 px-6 py-2.5 text-sm font-bold text-black hover:bg-lime-300 disabled:opacity-50"
        >
          {saving ? "সেভ হচ্ছে…" : "💾 সেভ করুন"}
        </button>
        {msg && <p className="self-center text-sm text-slate-300">{msg}</p>}
      </div>
    </div>
  );
}
