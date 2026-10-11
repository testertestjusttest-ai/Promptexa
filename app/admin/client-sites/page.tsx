"use client";

import { useEffect, useMemo, useState } from "react";
import { toBnDigits } from "@/lib/format";

type DemoInfo = { slug: string; name: string; type: string; layout: string };
type Site = {
  id: string; slug: string; demo_slug: string; site_title: string;
  client_name: string | null; contact: string | null; theme: string | null;
  accent: string | null; custom_domain: string | null; is_active: boolean;
  created_at: string;
};

const THEMES = [
  { id: "aurora", n: "🌌 অরোরা" }, { id: "split", n: "◧ স্প্লিট" },
  { id: "minimal", n: "○ মিনিমাল" }, { id: "bold", n: "💥 বোল্ড" },
  { id: "elegant", n: "✨ এলিগ্যান্ট" }, { id: "playful", n: "🎈 প্লেফুল" },
];
const ACCENTS = ["#f97316", "#ef4444", "#ec4899", "#8b5cf6", "#3b82f6", "#0ea5e9", "#10b981", "#84cc16", "#eab308"];

export default function ClientSitesPage() {
  const [demos, setDemos] = useState<DemoInfo[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<DemoInfo | null>(null);
  const [clientName, setClientName] = useState("");
  const [siteTitle, setSiteTitle] = useState("");
  const [contact, setContact] = useState("");
  const [theme, setTheme] = useState("aurora");
  const [accent, setAccent] = useState("#f97316");
  const [domain, setDomain] = useState("");
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);

  async function loadSites() {
    const d = await fetch("/api/admin/client-sites").then((r) => r.json()).catch(() => null);
    if (d?.sites) setSites(d.sites);
  }

  useEffect(() => {
    fetch("/api/demos/list").then((r) => r.json()).then((d) => {
      if (d.demos) setDemos(d.demos);
    }).catch(() => {});
    loadSites();
  }, []);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return demos;
    return demos.filter((d) => (d.name + " " + d.type + " " + d.slug).toLowerCase().includes(query));
  }, [demos, q]);

  async function create() {
    if (!sel) { alert("ডেমো বেছে নিন"); return; }
    if (siteTitle.trim().length < 3) { alert("সাইটের টাইটেল দিন"); return; }
    setCreating(true);
    try {
      const res = await fetch("/api/admin/client-sites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          demo_slug: sel.slug, site_title: siteTitle.trim(),
          client_name: clientName.trim(), contact: contact.trim(),
          theme, accent, custom_domain: domain.trim(),
        }),
      });
      const d = await res.json();
      if (!res.ok || !d.ok) throw new Error(d.error || "ব্যর্থ");
      setSiteTitle(""); setClientName(""); setContact(""); setDomain(""); setSel(null); setShowForm(false);
      loadSites();
      alert(`✅ সাইট তৈরি! লিংক: /c/${d.site.slug}`);
    } catch (e) {
      alert(`⚠️ ${e instanceof Error ? e.message : "ব্যর্থ"}`);
    } finally {
      setCreating(false);
    }
  }

  async function saveDomain(id: string, custom_domain: string) {
    const res = await fetch("/api/admin/client-sites", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, custom_domain }),
    });
    if (res.ok) loadSites();
    else alert("সেভ হয়নি");
  }

  async function remove(id: string) {
    if (!confirm("সাইটটি বন্ধ করবেন? (লিংক কাজ করবে না)")) return;
    await fetch(`/api/admin/client-sites?id=${id}`, { method: "DELETE" });
    loadSites();
  }

  const input = "w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-[#d7ff3f]/50";

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-bold text-white">🚀 ক্লায়েন্ট সাইট</h1>
          <p className="mt-1 text-xs text-slate-500">
            ডেমো থেকে কাস্টমারের নিজের সাইট — নিজের ডোমেইনেও চলবে, অ্যাডমিনসহ
          </p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="rounded-xl bg-[#d7ff3f] px-5 py-2.5 text-sm font-black text-black hover:brightness-110">
          {showForm ? "✕ বন্ধ" : "＋ নতুন সাইট"}
        </button>
      </div>

      {showForm && (
        <div className="glass mt-4 grid gap-4 rounded-2xl p-4 lg:grid-cols-2">
          <div>
            <p className="mb-2 text-sm font-bold text-white">১. ডেমো বেছে নিন</p>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="🔍 খুঁজুন..." className={`${input} mb-2`} />
            <div className="max-h-[40vh] space-y-1.5 overflow-y-auto">
              {filtered.map((d) => (
                <button key={d.slug} onClick={() => setSel(d)}
                  className={`w-full rounded-xl px-3 py-2 text-left ${sel?.slug === d.slug ? "bg-[#d7ff3f]/15 ring-1 ring-[#d7ff3f]/40" : "bg-white/5 hover:bg-white/10"}`}>
                  <p className="text-sm font-bold text-white">{d.name} {sel?.slug === d.slug && "✓"}</p>
                  <p className="text-[11px] text-slate-500">{d.type}</p>
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-sm font-bold text-white">২. কাস্টমারের তথ্য</p>
            <input value={siteTitle} onChange={(e) => setSiteTitle(e.target.value)} placeholder="সাইটের নাম * (যেমন: রহিম স্টোর)" className={input} />
            <input value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="ক্লায়েন্টের নাম" className={input} />
            <input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="মোবাইল / WhatsApp" className={input} />
            <input value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="কাস্টম ডোমেইন (ঐচ্ছিক, যেমন: shop.rahim.com)" className={input} />
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
            <button onClick={create} disabled={creating}
              className="w-full rounded-xl bg-[#d7ff3f] py-3 text-sm font-black text-black hover:brightness-110 disabled:opacity-50">
              {creating ? "তৈরি হচ্ছে..." : "🚀 এক ক্লিকে সাইট তৈরি করুন"}
            </button>
          </div>
        </div>
      )}

      <div className="mt-5 space-y-2">
        {sites.length === 0 && <p className="py-10 text-center text-sm text-slate-500">এখনো কোনো ক্লায়েন্ট সাইট নেই — উপরে "নতুন সাইট" চাপুন</p>}
        {sites.map((s) => (
          <SiteRow key={s.id} site={s} onSaveDomain={saveDomain} onRemove={remove} />
        ))}
      </div>

      <div className="glass mt-6 rounded-2xl p-5">
        <p className="text-sm font-black text-white">🌐 কাস্টম ডোমেইন কিভাবে লাগাবেন?</p>
        <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-xs text-slate-400">
          <li>কাস্টমার তার ডোমেইন (যেমন shop.rahim.com) এর DNS-এ CNAME দিয়ে <b className="text-slate-200">cname.vercel-dns.com</b> পয়েন্ট করবে</li>
          <li>আপনি Vercel প্রজেক্ট → Settings → Domains-এ ওই ডোমেইন যোগ করবেন</li>
          <li>উপরের সাইটে ডোমেইন লিখে সেভ করুন — ব্যাস, কাস্টমারের ডোমেইনে তার সাইট লাইভ!</li>
          <li>কাস্টমার <b className="text-slate-200">তার-ডোমেইন/admin</b> থেকে নিজের সাইট কাস্টমাইজ করতে পারবে</li>
        </ol>
      </div>
    </div>
  );
}

function SiteRow({ site, onSaveDomain, onRemove }: {
  site: Site;
  onSaveDomain: (id: string, d: string) => void;
  onRemove: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [dom, setDom] = useState(site.custom_domain || "");
  const link = `/c/${site.slug}`;
  return (
    <div className="glass rounded-2xl p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-bold text-white">
            {site.site_title}
            {!site.is_active && <span className="ml-2 rounded bg-red-500/20 px-2 py-0.5 text-[10px] text-red-300">বন্ধ</span>}
          </p>
          <p className="text-[11px] text-slate-500">
            {site.client_name && `${site.client_name} • `}{site.demo_slug} • {toBnDigits(new Date(site.created_at).toLocaleDateString("bn-BD"))}
          </p>
          <a href={link} target="_blank" className="mt-1 inline-block text-xs font-bold text-[#d7ff3f] hover:underline">
            🔗 {link}
          </a>
          {site.custom_domain && (
            <p className="text-xs text-slate-400">🌐 <b className="text-slate-200">{site.custom_domain}</b></p>
          )}
        </div>
        <div className="flex shrink-0 gap-1.5">
          <button onClick={() => setEditing(!editing)} className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-bold text-white hover:bg-white/15">
            🌐 ডোমেইন
          </button>
          <a href={`${link}/admin`} target="_blank" className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-bold text-white hover:bg-white/15">
            ⚙️ অ্যাডমিন
          </a>
          <button onClick={() => onRemove(site.id)} className="rounded-lg bg-white/5 px-3 py-1.5 text-xs text-red-300 hover:bg-white/10">
            🗑
          </button>
        </div>
      </div>
      {editing && (
        <div className="mt-3 flex gap-2">
          <input
            value={dom} onChange={(e) => setDom(e.target.value)}
            placeholder="যেমন: shop.rahim.com"
            className="flex-1 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs text-white outline-none placeholder:text-slate-500"
          />
          <button onClick={() => { onSaveDomain(site.id, dom.trim()); setEditing(false); }}
            className="shrink-0 rounded-xl bg-[#d7ff3f] px-4 py-2 text-xs font-black text-black">
            সেভ
          </button>
        </div>
      )}
    </div>
  );
}
