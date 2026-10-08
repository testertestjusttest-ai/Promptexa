"use client";

import { useEffect, useState } from "react";
import { formatBDT, toBnDigits } from "@/lib/format";

type Plan = {
  id: string; label_bn: string; duration_days: number | null;
  price_bdt: number; old_price_bdt: number | null;
  is_popular: boolean; is_active: boolean; sort: number;
};
type Product = {
  id: string; slug: string; name: string; tagline_bn: string;
  description_bn: string; features_bn: string[]; delivery_note_bn: string;
  badge: string; badge_bg: string; category_id: string | null;
  is_active: boolean; is_featured: boolean; sort: number;
  image_url: string | null; sold_out_manual: boolean; track_stock: boolean;
  category: { id: string; name_bn: string } | null;
  plans: Plan[];
  stock?: number;
};
type Category = { id: string; name_bn: string; slug: string };

const EMPTY: Omit<Product, "id" | "category" | "plans"> = {
  slug: "", name: "", tagline_bn: "", description_bn: "",
  features_bn: [], delivery_note_bn: "", badge: "✦", badge_bg: "#8b5cf6",
  category_id: null, is_active: true, is_featured: false, sort: 0,
  image_url: null, sold_out_manual: false, track_stock: true,
};

export default function ProductsClient({ categories }: { categories: Category[] }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<(typeof EMPTY & { id?: string }) | null>(null);
  const [featuresText, setFeaturesText] = useState("");
  const [plans, setPlans] = useState<Plan[]>([]);
  const [msg, setMsg] = useState("");
  const [uploading, setUploading] = useState(false);

  async function uploadImage(file: File): Promise<string | null> {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "products");
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);
      return data.url;
    } catch (e) {
      alert(e instanceof Error ? e.message : "আপলোড হয়নি");
      return null;
    } finally {
      setUploading(false);
    }
  }

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/products");
    const data = await res.json();
    if (data.ok) setProducts(data.products);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  function openNew() {
    setEditing({ ...EMPTY });
    setFeaturesText("");
    setPlans([]);
    setMsg("");
  }
  function openEdit(p: Product) {
    setEditing({
      id: p.id, slug: p.slug, name: p.name, tagline_bn: p.tagline_bn,
      description_bn: p.description_bn, features_bn: p.features_bn,
      delivery_note_bn: p.delivery_note_bn, badge: p.badge, badge_bg: p.badge_bg,
      category_id: p.category_id, is_active: p.is_active,
      is_featured: p.is_featured, sort: p.sort,
      image_url: p.image_url, sold_out_manual: p.sold_out_manual,
      track_stock: p.track_stock,
    });
    setFeaturesText((p.features_bn ?? []).join("\n"));
    setPlans([...(p.plans ?? [])].sort((a, b) => a.sort - b.sort));
    setMsg("");
  }

  async function save() {
    if (!editing) return;
    setMsg("");
    if (!editing.name.trim() || !editing.slug.trim()) {
      setMsg("⚠️ নাম ও slug দিন"); return;
    }
    const payload = {
      ...editing,
      features_bn: featuresText.split("\n").map((s) => s.trim()).filter(Boolean),
    };
    const res = await fetch("/api/admin/products", {
      method: editing.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!data.ok) { setMsg(`⚠️ ${data.error}`); return; }
    const productId = editing.id ?? data.id;
    // save plans (create new ones / update existing)
    for (const pl of plans) {
      if (pl.id.startsWith("new-")) {
        await fetch("/api/admin/plans", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...pl, id: undefined, product_id: productId }),
        });
      } else {
        await fetch("/api/admin/plans", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(pl),
        });
      }
    }
    setEditing(null);
    load();
  }

  async function removePlan(planId: string) {
    if (planId.startsWith("new-")) {
      setPlans((ps) => ps.filter((p) => p.id !== planId));
      return;
    }
    if (!confirm("প্ল্যান মুছে ফেলবেন?")) return;
    await fetch(`/api/admin/plans?id=${planId}`, { method: "DELETE" });
    setPlans((ps) => ps.filter((p) => p.id !== planId));
  }

  async function removeProduct(id: string) {
    if (!confirm("প্রোডাক্টটি মুছে ফেলবেন? (প্ল্যান ও কী-ও মুছে যাবে)")) return;
    const res = await fetch(`/api/admin/products?id=${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.ok) load(); else alert(data.error);
  }

  function addPlanRow() {
    setPlans((ps) => [...ps, {
      id: `new-${Date.now()}`, label_bn: "", duration_days: 30,
      price_bdt: 0, old_price_bdt: null, is_popular: false, is_active: true, sort: ps.length,
    }]);
  }

  const setField = <K extends keyof typeof EMPTY>(k: K, v: (typeof EMPTY)[K]) =>
    setEditing((e) => (e ? { ...e, [k]: v } : e));

  return (
    <div>
      <div className="mb-5 flex justify-between">
        <p className="text-sm text-slate-500">{toBnDigits(products.length)}টি প্রোডাক্ট</p>
        <button onClick={openNew} className="btn-vault !py-2 text-sm">＋ নতুন প্রোডাক্ট</button>
      </div>

      {loading ? <p className="text-slate-400">লোড হচ্ছে...</p> : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <div key={p.id} className={`glass rounded-2xl p-5 ${!p.is_active ? "opacity-50" : ""}`}>
              <div className="flex items-center gap-3">
                {p.image_url ? (
                  <img src={p.image_url} alt={p.name} className="h-11 w-11 rounded-xl object-cover" />
                ) : (
                  <span className="grid h-11 w-11 place-items-center rounded-xl text-xl" style={{ background: p.badge_bg }}>
                    {p.badge}
                  </span>
                )}
                <div>
                  <p className="font-bold text-white">{p.name}</p>
                  <p className="text-xs text-slate-500">
                    {p.category?.name_bn ?? "—"} • {toBnDigits(p.plans?.length ?? 0)}টি প্ল্যান
                    {!p.is_active && " • ⛔ বন্ধ"}
                    {p.is_featured && " • ⭐ ফিচার্ড"}
                  </p>
                  <p className="mt-1 text-xs">
                    {p.sold_out_manual ? (
                      <span className="font-bold text-red-400">🔴 স্টক শেষ (ম্যানুয়াল)</span>
                    ) : p.track_stock && (p.stock ?? 0) <= 0 ? (
                      <span className="font-bold text-amber-400">🟡 কী শেষ — অটো সোল্ড আউট</span>
                    ) : (
                      <span className="text-slate-500">🔑 {toBnDigits(p.stock ?? 0)}টি কী</span>
                    )}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <button onClick={() => openEdit(p)} className="flex-1 rounded-lg bg-white/10 py-2 text-sm font-semibold text-white hover:bg-white/15">
                  ✏️ এডিট
                </button>
                <button onClick={() => removeProduct(p.id)} className="rounded-lg bg-red-500/15 px-4 py-2 text-sm font-bold text-red-300">
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 p-4 backdrop-blur-sm">
          <div className="glass-bright mx-auto my-8 max-w-2xl rounded-3xl p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-bold text-white">
                {editing.id ? "✏️ প্রোডাক্ট এডিট" : "＋ নতুন প্রোডাক্ট"}
              </h2>
              <button onClick={() => setEditing(null)} className="grid h-9 w-9 place-items-center rounded-lg bg-white/10">✕</button>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div><label className="mb-1 block text-xs text-slate-400">নাম *</label>
                <input value={editing.name} onChange={(e) => setField("name", e.target.value)} className="field" placeholder="CapCut Pro" /></div>
              <div><label className="mb-1 block text-xs text-slate-400">Slug * (ইংরেজি, unique)</label>
                <input value={editing.slug} onChange={(e) => setField("slug", e.target.value)} className="field" placeholder="capcut-pro" /></div>
              <div className="sm:col-span-2"><label className="mb-1 block text-xs text-slate-400">ট্যাগলাইন (বাংলা)</label>
                <input value={editing.tagline_bn} onChange={(e) => setField("tagline_bn", e.target.value)} className="field" /></div>
              <div className="sm:col-span-2"><label className="mb-1 block text-xs text-slate-400">বিবরণ (বাংলা)</label>
                <textarea value={editing.description_bn} onChange={(e) => setField("description_bn", e.target.value)} rows={3} className="field" /></div>
              <div className="sm:col-span-2"><label className="mb-1 block text-xs text-slate-400">ফিচার (প্রতি লাইনে একটি)</label>
                <textarea value={featuresText} onChange={(e) => setFeaturesText(e.target.value)} rows={4} className="field" /></div>
              <div className="sm:col-span-2"><label className="mb-1 block text-xs text-slate-400">ডেলিভারি নোট</label>
                <input value={editing.delivery_note_bn} onChange={(e) => setField("delivery_note_bn", e.target.value)} className="field" /></div>
              <div><label className="mb-1 block text-xs text-slate-400">ব্যাজ ইমোজি</label>
                <input value={editing.badge} onChange={(e) => setField("badge", e.target.value)} className="field" /></div>
              <div><label className="mb-1 block text-xs text-slate-400">ব্যাজ কালার</label>
                <input type="color" value={editing.badge_bg} onChange={(e) => setField("badge_bg", e.target.value)} className="field h-11 cursor-pointer" /></div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs text-slate-400">প্রোডাক্ট ছবি</label>
                <div className="flex gap-2">
                  <input value={editing.image_url ?? ""} onChange={(e) => setField("image_url", e.target.value || null)} className="field" placeholder="https://... বা আপলোড করুন" />
                  <label className="btn-ghost shrink-0 cursor-pointer !py-2 text-sm">
                    {uploading ? "..." : "📤 আপলোড"}
                    <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        const url = await uploadImage(f);
                        if (url) setField("image_url", url);
                      }
                    }} />
                  </label>
                </div>
                {editing.image_url && (
                  <img src={editing.image_url} alt="" className="mt-2 h-28 w-28 rounded-2xl border border-white/10 object-cover" />
                )}
              </div>
              <div><label className="mb-1 block text-xs text-slate-400">ক্যাটাগরি</label>
                <select value={editing.category_id ?? ""} onChange={(e) => setField("category_id", e.target.value || null)} className="field">
                  <option value="">—</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name_bn}</option>)}
                </select></div>
              <div><label className="mb-1 block text-xs text-slate-400">সর্ট অর্ডার</label>
                <input type="number" value={editing.sort} onChange={(e) => setField("sort", Number(e.target.value))} className="field" /></div>
              <label className="flex items-center gap-2 text-sm text-slate-300">
                <input type="checkbox" checked={editing.is_active} onChange={(e) => setField("is_active", e.target.checked)} className="h-4 w-4 accent-[#d7ff3f]" /> সক্রিয়</label>
              <label className="flex items-center gap-2 text-sm text-slate-300">
                <input type="checkbox" checked={editing.is_featured} onChange={(e) => setField("is_featured", e.target.checked)} className="h-4 w-4 accent-[#d7ff3f]" /> ফিচার্ড</label>
              <label className="flex items-center gap-2 text-sm text-slate-300" title="চালু থাকলে কী শেষ হলে অটো 'স্টক শেষ' দেখাবে">
                <input type="checkbox" checked={editing.track_stock} onChange={(e) => setField("track_stock", e.target.checked)} className="h-4 w-4 accent-[#d7ff3f]" /> স্টক ট্র্যাকিং</label>
              <label className="flex items-center gap-2 text-sm text-slate-300" title="চালু করলে প্রোডাক্ট 'স্টক শেষ' হিসেবে দেখাবে">
                <input type="checkbox" checked={editing.sold_out_manual} onChange={(e) => setField("sold_out_manual", e.target.checked)} className="h-4 w-4 accent-[#f43f5e]" /> জোর করে স্টক শেষ</label>
            </div>

            <h3 className="mt-6 font-bold text-white">💰 প্রাইস প্ল্যান</h3>
            <div className="mt-3 space-y-3">
              {plans.map((pl, idx) => (
                <div key={pl.id} className="grid grid-cols-2 gap-2 rounded-xl bg-white/[0.03] p-3 sm:grid-cols-6">
                  <input value={pl.label_bn} onChange={(e) => setPlans((ps) => ps.map((p, i) => i === idx ? { ...p, label_bn: e.target.value } : p))}
                    placeholder="১ মাস" className="field !py-2 text-sm" />
                  <input type="number" value={pl.duration_days ?? ""} placeholder="দিন"
                    onChange={(e) => setPlans((ps) => ps.map((p, i) => i === idx ? { ...p, duration_days: Number(e.target.value) || null } : p))}
                    className="field !py-2 text-sm" />
                  <input type="number" value={pl.price_bdt}
                    onChange={(e) => setPlans((ps) => ps.map((p, i) => i === idx ? { ...p, price_bdt: Number(e.target.value) } : p))}
                    placeholder="দাম" className="field !py-2 text-sm" />
                  <input type="number" value={pl.old_price_bdt ?? ""} placeholder="আগের দাম"
                    onChange={(e) => setPlans((ps) => ps.map((p, i) => i === idx ? { ...p, old_price_bdt: Number(e.target.value) || null } : p))}
                    className="field !py-2 text-sm" />
                  <label className="flex items-center gap-1.5 text-xs text-slate-300">
                    <input type="checkbox" checked={pl.is_popular}
                      onChange={(e) => setPlans((ps) => ps.map((p, i) => i === idx ? { ...p, is_popular: e.target.checked } : p))}
                      className="h-4 w-4 accent-[#d7ff3f]" /> জনপ্রিয়</label>
                  <button onClick={() => removePlan(pl.id)} className="text-sm text-red-400 hover:text-red-300">🗑 মুছুন</button>
                </div>
              ))}
              <button onClick={addPlanRow} className="w-full rounded-xl border border-dashed border-white/20 py-2.5 text-sm text-slate-400 hover:border-[#d7ff3f]/50 hover:text-white">
                ＋ প্ল্যান যোগ করুন
              </button>
            </div>
            {plans.length > 0 && (
              <p className="mt-2 text-xs text-slate-500">
                {plans.map((p) => `${p.label_bn || "?"}: ${formatBDT(p.price_bdt)}`).join(" • ")}
              </p>
            )}

            {msg && <p className="mt-4 text-sm text-amber-300">{msg}</p>}
            <div className="mt-6 flex gap-3">
              <button onClick={save} className="btn-vault flex-1">💾 সেভ করুন</button>
              <button onClick={() => setEditing(null)} className="btn-ghost">বাতিল</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
