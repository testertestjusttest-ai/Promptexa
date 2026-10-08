"use client";

import { useEffect, useState } from "react";
import type { Slide } from "@/lib/types";

type Form = {
  id?: string;
  title_bn: string;
  subtitle_bn: string;
  cta_text: string;
  cta_link: string;
  image_url: string;
  bg_from: string;
  bg_to: string;
  sort: number;
  is_active: boolean;
};

const EMPTY: Form = {
  title_bn: "", subtitle_bn: "", cta_text: "এখনই কিনুন", cta_link: "/shop",
  image_url: "", bg_from: "#8b5cf6", bg_to: "#d7ff3f", sort: 0, is_active: true,
};

export default function SlidesClient() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Form | null>(null);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState("");

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/slides");
    const data = await res.json();
    if (data.ok) setSlides(data.slides);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function uploadImage(file: File): Promise<string | null> {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "slides");
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

  async function save() {
    if (!form || !form.title_bn.trim()) return setMsg("⚠️ টাইটেল দিন");
    const res = await fetch("/api/admin/slides", {
      method: form.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, image_url: form.image_url || null }),
    });
    const data = await res.json();
    if (data.ok) { setForm(null); load(); }
    else setMsg(`⚠️ ${data.error}`);
  }

  async function remove(id: string) {
    if (!confirm("স্লাইড মুছে ফেলবেন?")) return;
    await fetch(`/api/admin/slides?id=${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <div className="mb-5 flex justify-end">
        <button onClick={() => { setForm({ ...EMPTY }); setMsg(""); }} className="btn-vault !py-2 text-sm">
          ＋ নতুন স্লাইড
        </button>
      </div>

      {loading ? <p className="text-slate-400">লোড হচ্ছে...</p> : (
        <div className="grid gap-4 md:grid-cols-2">
          {slides.map((s) => (
            <div key={s.id} className={`glass overflow-hidden rounded-2xl ${!s.is_active ? "opacity-50" : ""}`}>
              <div className="h-24" style={{ background: `linear-gradient(120deg, ${s.bg_from}, ${s.bg_to})` }} />
              <div className="p-4">
                <p className="font-bold text-white">{s.title_bn}</p>
                <p className="mt-1 line-clamp-1 text-xs text-slate-500">{s.subtitle_bn}</p>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => setForm({
                      id: s.id, title_bn: s.title_bn, subtitle_bn: s.subtitle_bn,
                      cta_text: s.cta_text, cta_link: s.cta_link, image_url: s.image_url ?? "",
                      bg_from: s.bg_from, bg_to: s.bg_to, sort: s.sort, is_active: (s as unknown as { is_active: boolean }).is_active ?? true,
                    })}
                    className="flex-1 rounded-lg bg-white/10 py-2 text-sm font-semibold text-white"
                  >
                    ✏️ এডিট
                  </button>
                  <button onClick={() => remove(s.id)} className="rounded-lg bg-red-500/15 px-4 py-2 text-sm text-red-300">🗑</button>
                </div>
              </div>
            </div>
          ))}
          {slides.length === 0 && <p className="text-slate-500">কোনো স্লাইড নেই</p>}
        </div>
      )}

      {form && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 p-4 backdrop-blur-sm">
          <div className="glass-bright mx-auto my-8 max-w-xl rounded-3xl p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-white">
                {form.id ? "✏️ স্লাইড এডিট" : "＋ নতুন স্লাইড"}
              </h2>
              <button onClick={() => setForm(null)} className="grid h-9 w-9 place-items-center rounded-lg bg-white/10">✕</button>
            </div>
            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-xs text-slate-400">টাইটেল (বাংলা) *</label>
                <input value={form.title_bn} onChange={(e) => setForm({ ...form, title_bn: e.target.value })} className="field" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-slate-400">সাবটাইটেল</label>
                <textarea value={form.subtitle_bn} onChange={(e) => setForm({ ...form, subtitle_bn: e.target.value })} rows={2} className="field" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs text-slate-400">বাটন লেখা</label>
                  <input value={form.cta_text} onChange={(e) => setForm({ ...form, cta_text: e.target.value })} className="field" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-slate-400">বাটন লিংক</label>
                  <input value={form.cta_link} onChange={(e) => setForm({ ...form, cta_link: e.target.value })} className="field" placeholder="/shop" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs text-slate-400">ব্যাকগ্রাউন্ড ছবি (ঐচ্ছিক)</label>
                <div className="flex gap-2">
                  <input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} className="field" placeholder="https://... বা আপলোড করুন" />
                  <label className="btn-ghost shrink-0 cursor-pointer !py-2 text-sm">
                    {uploading ? "..." : "📤"}
                    <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        const url = await uploadImage(f);
                        if (url) setForm({ ...form, image_url: url });
                      }
                    }} />
                  </label>
                </div>
                {form.image_url && <img src={form.image_url} alt="" className="mt-2 h-24 w-full rounded-xl object-cover" />}
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="mb-1 block text-xs text-slate-400">কালার ১</label>
                  <input type="color" value={form.bg_from} onChange={(e) => setForm({ ...form, bg_from: e.target.value })} className="field h-11 cursor-pointer" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-slate-400">কালার ২</label>
                  <input type="color" value={form.bg_to} onChange={(e) => setForm({ ...form, bg_to: e.target.value })} className="field h-11 cursor-pointer" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-slate-400">সর্ট</label>
                  <input type="number" value={form.sort} onChange={(e) => setForm({ ...form, sort: Number(e.target.value) })} className="field" />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-slate-300">
                <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="h-4 w-4 accent-[#d7ff3f]" /> সক্রিয়
              </label>
              {msg && <p className="text-sm text-amber-300">{msg}</p>}
              <div className="flex gap-3">
                <button onClick={save} className="btn-vault flex-1">💾 সেভ</button>
                <button onClick={() => setForm(null)} className="btn-ghost">বাতিল</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
