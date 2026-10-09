"use client";

import { useState } from "react";
import { formatBDT, toBnDigits } from "@/lib/format";
import { WEBDEV_HERO } from "@/lib/webdevArt";

const PACKAGES = [
  {
    name: "স্টার্টার",
    price: 4999,
    desc: "ছোট ব্যবসা / পোর্টফোলিওর জন্য",
    features: ["৫ পেজ পর্যন্ত", "মোবাইল রেসপন্সিভ", "WhatsApp বাটন", "বেসিক SEO", "১ মাস ফ্রি সাপোর্ট"],
  },
  {
    name: "বিজনেস",
    price: 12999,
    desc: "ই-কমার্স / কোম্পানির জন্য (জনপ্রিয়)",
    features: ["আনলিমিটেড পেজ", "অ্যাডমিন প্যানেল", "পেমেন্ট গেটওয়ে", "অ্যাডভান্সড SEO", "৩ মাস ফ্রি সাপোর্ট"],
    hot: true,
  },
  {
    name: "প্রিমিয়াম",
    price: 29999,
    desc: "কাস্টম ওয়েব অ্যাপ / মার্কেটপ্লেস",
    features: ["কাস্টম ডিজাইন + ফিচার", "মোবাইল অ্যাপ (PWA)", "লাইভ চ্যাট সিস্টেম", "পারফরম্যান্স অপটিমাইজ", "৬ মাস ফ্রি সাপোর্ট"],
  },
];

const SITE_TYPES = ["বিজনেস ওয়েবসাইট", "ই-কমার্স শপ", "পোর্টফোলিও", "ব্লগ / নিউজ", "মার্কেটপ্লেস", "অন্যান্য"];

export default function WebDevClient() {
  const [form, setForm] = useState({ name: "", phone: "", site_type: SITE_TYPES[0], features: "", budget_range: "৫–১৫ হাজার", details: "" });
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    if (!form.name.trim()) return setMsg("⚠️ আপনার নাম দিন");
    if (!/^01[3-9]\d{8}$/.test(form.phone.trim())) return setMsg("⚠️ সঠিক মোবাইল নম্বর দিন");
    setSending(true);
    try {
      const res = await fetch("/api/services/web-dev", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "হয়নি");
      setMsg("🎉 রিকোয়েস্ট পাঠানো হয়েছে! আমাদের টিম শীঘ্রই কল করবে।");
      setForm({ name: "", phone: "", site_type: SITE_TYPES[0], features: "", budget_range: "৫–১৫ হাজার", details: "" });
    } catch (e) {
      setMsg(`⚠️ ${e instanceof Error ? e.message : "ব্যর্থ"}`);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      {/* hero */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${WEBDEV_HERO})` }} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#060913] via-[#060913]/60 to-[#060913]/25" />
        <div className="glass relative p-8 text-center sm:p-12">
          <h1 className="font-display mt-4 text-3xl font-bold text-white sm:text-4xl">
            আপনার <span className="text-[#d7ff3f]">ওয়েবসাইট</span> বানিয়ে নিন
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-slate-300">
            DigiPlyra টিমের মাধ্যমে প্রফেশনাল ওয়েবসাইট — ডিজাইন থেকে ডেলিভারি পর্যন্ত সব দায়িত্ব আমাদের।
            নিচে প্যাকেজ দেখুন অথবা কাস্টম কোটের জন্য ফর্ম পূরণ করুন।
          </p>
        </div>
      </div>

      {/* packages */}
      <h2 className="font-display mt-12 text-center text-2xl font-bold text-white">💎 প্যাকেজ ও আনুমানিক প্রাইস</h2>
      <div className="mt-6 grid gap-5 md:grid-cols-3">
        {PACKAGES.map((p) => (
          <div key={p.name} className={`glass rounded-3xl p-6 ${p.hot ? "ring-2 ring-[#d7ff3f]/60" : ""}`}>
            {p.hot && (
              <span className="mb-3 inline-block rounded-full bg-[#d7ff3f] px-3 py-1 text-xs font-bold text-black">
                🔥 জনপ্রিয়
              </span>
            )}
            <h3 className="font-display text-xl font-bold text-white">{p.name}</h3>
            <p className="mt-1 text-xs text-slate-500">{p.desc}</p>
            <p className="font-display mt-3 text-3xl font-bold text-[#d7ff3f]">{formatBDT(p.price)}</p>
            <p className="text-[11px] text-slate-500">থেকে শুরু</p>
            <ul className="mt-4 space-y-2">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-slate-300">
                  <span className="text-[#d7ff3f]">✓</span> {f}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* process */}
      <h2 className="font-display mt-12 text-center text-2xl font-bold text-white">⚙️ যেভাবে কাজ করি</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        {[
          ["📝", "রিকোয়েস্ট", "ফর্ম পূরণ করুন — কী ধরনের সাইট চান"],
          ["📞", "আলোচনা", "আমাদের টিম কল করে ডিটেইল বুঝে নেবে"],
          ["💰", "কোট ও পেমেন্ট", "ফাইনাল প্রাইস ঠিক করে ৫০% অ্যাডভান্স"],
          ["🚀", "ডেলিভারি", "৭–১৪ দিনে সাইট লাইভ + সাপোর্ট"],
        ].map(([icon, t, d], i) => (
          <div key={t} className="glass rounded-2xl p-5 text-center">
            <div className="text-3xl">{icon}</div>
            <p className="mt-2 text-sm font-bold text-white">
              {toBnDigits(i + 1)}. {t}
            </p>
            <p className="mt-1 text-xs text-slate-400">{d}</p>
          </div>
        ))}
      </div>

      {/* quote form */}
      <div className="glass mt-12 rounded-3xl p-6 sm:p-8">
        <h2 className="font-display text-2xl font-bold text-white">📋 ফ্রি কোট রিকোয়েস্ট</h2>
        <p className="mt-1 text-sm text-slate-400">ফর্মটি পূরণ করুন — ২৪ ঘণ্টার মধ্যে কল পাবেন।</p>
        <form onSubmit={submit} className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm text-slate-300">আপনার নাম *</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="field" placeholder="নাম" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-slate-300">মোবাইল নম্বর *</label>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="field" placeholder="01XXXXXXXXX" inputMode="numeric" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-slate-300">কী ধরনের ওয়েবসাইট চান? *</label>
            <select value={form.site_type} onChange={(e) => setForm({ ...form, site_type: e.target.value })} className="field">
              {SITE_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-slate-300">আনুমানিক বাজেট</label>
            <select value={form.budget_range} onChange={(e) => setForm({ ...form, budget_range: e.target.value })} className="field">
              {["৫ হাজারের নিচে", "৫–১৫ হাজার", "১৫–৩০ হাজার", "৩০ হাজার+"].map((b) => <option key={b}>{b}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm text-slate-300">কী কী ফিচার লাগবে?</label>
            <input value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} className="field" placeholder="যেমন: অনলাইন পেমেন্ট, লাইভ চ্যাট, বাংলা ভাষা..." />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm text-slate-300">বিস্তারিত লিখুন</label>
            <textarea value={form.details} onChange={(e) => setForm({ ...form, details: e.target.value })} className="field min-h-[100px]" placeholder="আপনার ব্যবসা / আইডিয়া সম্পর্কে বিস্তারিত..." maxLength={2000} />
          </div>
          {msg && <p className="sm:col-span-2 rounded-xl bg-[#d7ff3f]/10 px-4 py-3 text-sm text-[#d7ff3f]">{msg}</p>}
          <button type="submit" disabled={sending} className="btn-vault sm:col-span-2 !py-3.5 text-base">
            {sending ? "পাঠানো হচ্ছে..." : "📨 ফ্রি কোট চান"}
          </button>
        </form>
      </div>
    </div>
  );
}
