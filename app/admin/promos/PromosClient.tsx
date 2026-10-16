"use client";

import { useEffect, useState } from "react";
import { formatBDT } from "@/lib/format";

type Promo = {
  id: string;
  code: string;
  label_bn: string | null;
  discount_percent: number;
  max_uses: number | null;
  used_count: number;
  min_order_bdt: number;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
};

export default function PromosClient() {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  // create form
  const [code, setCode] = useState("");
  const [label, setLabel] = useState("");
  const [percent, setPercent] = useState("10");
  const [maxUses, setMaxUses] = useState("");
  const [minOrder, setMinOrder] = useState("");
  const [expires, setExpires] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/promos");
      const d = await r.json();
      if (d.ok) setPromos(d.promos);
      else setMsg("⚠️ " + (d.error || "লোড হয়নি"));
    } catch {
      setMsg("⚠️ লোড হয়নি");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);

  async function create() {
    setMsg("");
    setSaving(true);
    try {
      const r = await fetch("/api/admin/promos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          label_bn: label,
          discount_percent: Number(percent),
          max_uses: maxUses,
          min_order_bdt: minOrder,
          expires_at: expires || null,
        }),
      });
      const d = await r.json();
      if (!r.ok || !d.ok) throw new Error(d.error || "তৈরি হয়নি");
      setCode("");
      setLabel("");
      setPercent("10");
      setMaxUses("");
      setMinOrder("");
      setExpires("");
      setMsg("✅ প্রোমো কোড তৈরি হয়েছে");
      load();
    } catch (e) {
      setMsg("⚠️ " + (e instanceof Error ? e.message : "তৈরি হয়নি"));
    } finally {
      setSaving(false);
    }
  }

  async function toggle(p: Promo) {
    const r = await fetch("/api/admin/promos", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: p.id, is_active: !p.is_active }),
    });
    if (r.ok) load();
  }

  async function remove(p: Promo) {
    if (!confirm(`"${p.code}" কোডটা মুছে দেবেন?`)) return;
    const r = await fetch(`/api/admin/promos?id=${p.id}`, { method: "DELETE" });
    if (r.ok) load();
  }

  return (
    <div className="space-y-6">
      {/* create form */}
      <div className="glass rounded-2xl p-5 sm:p-6">
        <h3 className="font-display text-base font-bold text-white">➕ নতুন প্রোমো কোড</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">কোড * (ইংরেজিতে)</label>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 24))}
              placeholder="যেমন: RAKIB20"
              className="field uppercase"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">নাম / নোট (কার জন্য)</label>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="যেমন: রাকিব ভাই"
              className="field"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">ছাড় % *</label>
            <input
              value={percent}
              onChange={(e) => setPercent(e.target.value.replace(/[^0-9]/g, "").slice(0, 2))}
              placeholder="10"
              inputMode="numeric"
              className="field"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">সর্বোচ্চ ব্যবহার (খালি = আনলিমিটেড)</label>
            <input
              value={maxUses}
              onChange={(e) => setMaxUses(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
              placeholder="যেমন: 100"
              inputMode="numeric"
              className="field"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">সর্বনিম্ন অর্ডার টাকা (ঐচ্ছিক)</label>
            <input
              value={minOrder}
              onChange={(e) => setMinOrder(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
              placeholder="0"
              inputMode="numeric"
              className="field"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">মেয়াদ (ঐচ্ছিক)</label>
            <input
              type="date"
              value={expires}
              onChange={(e) => setExpires(e.target.value)}
              className="field"
            />
          </div>
        </div>
        <button onClick={create} disabled={saving} className="btn-vault mt-4 text-sm">
          {saving ? "তৈরি হচ্ছে..." : "🎟️ কোড তৈরি করুন"}
        </button>
        {msg && <p className="mt-3 text-sm text-slate-300">{msg}</p>}
      </div>

      {/* list */}
      <div className="glass rounded-2xl p-5 sm:p-6">
        <h3 className="font-display text-base font-bold text-white">
          সব কোড {promos.length > 0 && <span className="text-slate-500">({promos.length})</span>}
        </h3>
        {loading ? (
          <p className="mt-4 text-sm text-slate-500">লোড হচ্ছে...</p>
        ) : promos.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">এখনো কোনো কোড বানানো হয়নি।</p>
        ) : (
          <div className="mt-4 space-y-3">
            {promos.map((p) => {
              const expired = p.expires_at && new Date(p.expires_at) < new Date();
              const maxed = p.max_uses != null && p.used_count >= p.max_uses;
              return (
                <div
                  key={p.id}
                  className={`rounded-2xl border p-4 ${p.is_active && !expired && !maxed ? "border-white/10 bg-white/[0.02]" : "border-white/5 bg-black/20 opacity-60"}`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <code className="rounded-lg bg-[#d7ff3f]/10 px-3 py-1.5 font-mono text-base font-bold text-[#d7ff3f]">
                          {p.code}
                        </code>
                        <span className="rounded-full bg-white/5 px-2.5 py-1 text-xs font-bold text-white">
                          {p.discount_percent}% ছাড়
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
                        {p.label_bn && <span>👤 {p.label_bn}</span>}
                        <span>🔁 ব্যবহার: {p.used_count}{p.max_uses != null ? `/${p.max_uses}` : ""}</span>
                        {p.min_order_bdt > 0 && <span>💰 মিন. {formatBDT(p.min_order_bdt)}</span>}
                        {p.expires_at && (
                          <span className={expired ? "text-red-300" : ""}>
                            📅 মেয়াদ: {new Date(p.expires_at).toLocaleDateString("bn-BD")}
                          </span>
                        )}
                        {!p.is_active && <span className="text-red-300">⏸️ বন্ধ</span>}
                        {expired && <span className="text-red-300">⌛ মেয়াদ শেষ</span>}
                        {maxed && <span className="text-red-300">🚫 সীমা শেষ</span>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggle(p)}
                        className={`rounded-xl px-3 py-2 text-xs font-bold ${p.is_active ? "bg-white/5 text-slate-300" : "bg-[#d7ff3f]/15 text-[#d7ff3f]"}`}
                      >
                        {p.is_active ? "বন্ধ করুন" : "চালু করুন"}
                      </button>
                      <button
                        onClick={() => remove(p)}
                        className="rounded-xl bg-red-500/10 px-3 py-2 text-xs font-bold text-red-300"
                      >
                        মুছুন
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
