"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SellClient() {
  const router = useRouter();
  const [form, setForm] = useState({ title: "", description: "", price_bdt: "", game_uid: "" });
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState("");

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).slice(0, 6 - images.length);
    if (!files.length) return;
    setUploading(true);
    setMsg("");
    try {
      for (const f of files) {
        const fd = new FormData();
        fd.append("file", f);
        const res = await fetch("/api/marketplace/upload", { method: "POST", body: fd });
        const d = await res.json();
        if (!res.ok) throw new Error(d.error || "আপলোড হয়নি");
        setImages((im) => [...im, d.url]);
      }
    } catch (e) {
      setMsg(`⚠️ ${e instanceof Error ? e.message : "আপলোড ব্যর্থ"}`);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    if (!form.title.trim()) return setMsg("⚠️ টাইটেল দিন (যেমন: লেভেল ৬৫, ৩০০+ স্কিন)");
    if (!(Number(form.price_bdt) > 0)) return setMsg("⚠️ সঠিক দাম দিন");
    if (images.length === 0) return setMsg("⚠️ কমপক্ষে ১টি স্ক্রিনশট আপলোড করুন");
    setSending(true);
    try {
      const res = await fetch("/api/marketplace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, price_bdt: Number(form.price_bdt), images }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "হয়নি");
      router.push(`/marketplace/${d.id}`);
    } catch (e) {
      setMsg(`⚠️ ${e instanceof Error ? e.message : "ব্যর্থ"}`);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <div className="glass rounded-3xl p-6 sm:p-8">
        <h1 className="font-display text-2xl font-bold text-white">📢 ID বিক্রির পোস্ট দিন</h1>
        <p className="mt-1 text-sm text-slate-400">
          অ্যাডমিন যাচাই করে পোস্টটি লাইভ করবে। টাকা সরাসরি আপনার কাছে আসবে না —
          ক্রেতা অ্যাডমিনকে দেবে, আইডি বুঝিয়ে দিলে টাকা পাবেন। 🛡️
        </p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm text-slate-300">টাইটেল *</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="field" placeholder="যেমন: লেভেল ৬৮ ID, ৪০০+ স্কিন, সব ক্যারেক্টার" maxLength={120} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm text-slate-300">দাম (৳) *</label>
              <input value={form.price_bdt} onChange={(e) => setForm({ ...form, price_bdt: e.target.value })}
                className="field" placeholder="5000" inputMode="numeric" type="number" min={1} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-slate-300">Free Fire UID</label>
              <input value={form.game_uid} onChange={(e) => setForm({ ...form, game_uid: e.target.value })}
                className="field" placeholder="UID (ঐচ্ছিক)" maxLength={60} />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-slate-300">বিস্তারিত *</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="field min-h-[120px]" maxLength={3000}
              placeholder="ID-টি কেমন — লেভেল, স্কিন সংখ্যা, ক্যারেক্টার, পেট, ডায়মন্ড, র‍্যাংক... বিস্তারিত লিখুন" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-slate-300">স্ক্রিনশট * (সর্বোচ্চ ৬টি)</label>
            <div className="grid grid-cols-3 gap-2">
              {images.map((u, i) => (
                <div key={i} className="relative aspect-square overflow-hidden rounded-xl bg-black/30">
                  <img src={u} alt="" className="h-full w-full object-cover" />
                  <button type="button" onClick={() => setImages(images.filter((_, j) => j !== i))}
                    className="absolute right-1 top-1 grid h-7 w-7 place-items-center rounded-lg bg-black/70 text-white">✕</button>
                </div>
              ))}
              {images.length < 6 && (
                <label className="grid aspect-square cursor-pointer place-items-center rounded-xl border-2 border-dashed border-white/15 text-3xl text-slate-500 hover:border-[#d7ff3f]/50">
                  {uploading ? "⏳" : "+"}
                  <input type="file" accept="image/*" multiple className="hidden" onChange={onFile} disabled={uploading} />
                </label>
              )}
            </div>
          </div>
          {msg && <p className="rounded-xl bg-white/5 px-4 py-3 text-sm text-amber-200">{msg}</p>}
          <button type="submit" disabled={sending || uploading} className="btn-vault w-full !py-3.5 text-base">
            {sending ? "পাঠানো হচ্ছে..." : "📨 রিভিউয়ের জন্য পাঠান"}
          </button>
        </form>
      </div>
    </div>
  );
}
