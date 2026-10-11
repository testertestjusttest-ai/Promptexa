"use client";

/**
 * Full client admin panel — real business management for client sites.
 * Dashboard (revenue/profit), products CRUD, orders, ads, settings.
 * Auth: 4-12 digit PIN (set on first login), 7-day token in localStorage.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { useDemo } from "./store";
import { Page, SectionTitle, Back } from "./ui";
import { toBnDigits } from "@/lib/format";

const bn = (n: number) => toBnDigits(Math.round(n).toLocaleString("en-IN"));
type Tab = "dash" | "products" | "orders" | "ads" | "slider" | "settings";

export function ClientAdmin() {
  const { def, base, store, clientSlug } = useDemo();
  const dark = def.dark;
  const [token, setToken] = useState<string | null>(null);
  const [pin, setPin] = useState("");
  const [err, setErr] = useState("");
  const [tab, setTab] = useState<Tab>("dash");
  const [checking, setChecking] = useState(true);

  const card = `rounded-2xl border ${dark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"}`;
  const sub = dark ? "text-slate-400" : "text-slate-500";
  const input = `w-full rounded-xl border px-4 py-2.5 text-sm outline-none ${dark ? "border-white/15 bg-white/5 text-white placeholder:text-slate-500" : "border-slate-200 bg-white placeholder:text-slate-400"}`;

  useEffect(() => {
    if (!clientSlug) { setChecking(false); return; }
    const t = localStorage.getItem(`client:${clientSlug}:token`);
    if (!t) { setChecking(false); return; }
    fetch(`/api/client/${clientSlug}/admin/auth`, { headers: { "x-client-token": t } })
      .then((r) => { if (r.ok) setToken(t); })
      .finally(() => setChecking(false));
  }, [clientSlug]);

  async function login() {
    setErr("");
    if (!clientSlug) return;
    const res = await fetch(`/api/client/${clientSlug}/admin/auth`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin }),
    });
    const d = await res.json();
    if (!res.ok || !d.token) { setErr(d.error || "ব্যর্থ"); return; }
    localStorage.setItem(`client:${clientSlug}:token`, d.token);
    setToken(d.token);
    setPin("");
  }

  function logout() {
    if (clientSlug) localStorage.removeItem(`client:${clientSlug}:token`);
    setToken(null);
  }

  if (!clientSlug) {
    return (
      <Page narrow>
        <Back href={base} label="ফিরুন" />
        <SectionTitle t="⚙️ অ্যাডমিন" />
        <p className={`text-sm ${sub}`}>এটি ডেমো সাইট — ক্লায়েন্ট সাইটের ফুল অ্যাডমিন <b>/c/{"{slug}"}/admin</b> এ পাবেন।</p>
        <Link href={base} className="btn-demo mt-4 inline-block" style={{ background: def.accent }}>সাইটে ফিরুন</Link>
      </Page>
    );
  }

  if (checking) return <Page narrow><p className={`py-16 text-center text-sm ${sub}`}>লোড হচ্ছে...</p></Page>;

  if (!token) {
    return (
      <Page narrow>
        <Back href={base} label="সাইটে ফিরুন" />
        <div className={`${card} mx-auto mt-8 max-w-sm p-6 text-center`}>
          <p className="text-4xl">🔐</p>
          <h1 className="mt-2 text-xl font-black">অ্যাডমিন লগইন</h1>
          <p className={`mt-1 text-xs ${sub}`}>প্রথমবার PIN সেট করুন (৪–১২ সংখ্যা), পরে ওই PIN দিয়ে ঢুকবেন</p>
          <input
            value={pin} onChange={(e) => { setPin(e.target.value.replace(/\D/g, "").slice(0, 12)); setErr(""); }}
            onKeyDown={(e) => e.key === "Enter" && login()}
            type="password" inputMode="numeric" placeholder="PIN"
            className={`${input} mt-4 text-center text-2xl tracking-[0.5em]`} autoFocus
          />
          {err && <p className="mt-2 text-xs font-bold text-red-500">{err}</p>}
          <button onClick={login} className="btn-demo mt-4 w-full" style={{ background: def.accent }}>
            {pin ? "প্রবেশ করুন" : "PIN দিন"}
          </button>
        </div>
      </Page>
    );
  }

  const headers = { "x-client-token": token };

  return (
    <Page>
      <div className="flex items-center justify-between">
        <SectionTitle t="⚙️ অ্যাডমিন প্যানেল" sub={def.name} />
        <button onClick={logout} className={`rounded-xl px-3 py-1.5 text-xs font-bold ${dark ? "bg-white/10" : "bg-slate-100"}`}>
          🚪 লগআউট
        </button>
      </div>

      <div className="mt-2 flex gap-1.5 overflow-x-auto">
        {([["dash", "📊 ড্যাশবোর্ড"], ["products", "📦 প্রোডাক্ট"], ["orders", "🧾 অর্ডার"], ["ads", "📢 বিজ্ঞাপন"], ["slider", "🎠 স্লাইডার"], ["settings", "🎨 সেটিংস"]] as [Tab, string][]).map(([t, label]) => (
          <button key={t} onClick={() => setTab(t)}
            className={`whitespace-nowrap rounded-xl px-4 py-2 text-xs font-black transition ${tab === t ? "text-white" : dark ? "bg-white/5 text-slate-400" : "bg-slate-100 text-slate-600"}`}
            style={tab === t ? { background: def.accent } : undefined}>
            {label}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {tab === "dash" && <DashTab headers={headers} card={card} sub={sub} accent={def.accent} />}
        {tab === "products" && <ProductsTab headers={headers} card={card} sub={sub} input={input} accent={def.accent} dark={dark} />}
        {tab === "orders" && <OrdersTab headers={headers} card={card} sub={sub} input={input} accent={def.accent} dark={dark} />}
        {tab === "ads" && <AdsTab headers={headers} card={card} sub={sub} input={input} accent={def.accent} />}
        {tab === "slider" && <SliderTab headers={headers} card={card} sub={sub} input={input} accent={def.accent} dark={dark} />}
        {tab === "settings" && <SettingsTab card={card} sub={sub} input={input} accent={def.accent} dark={dark} />}
      </div>
    </Page>
  );
}

/* ---------- Dashboard ---------- */
function DashTab({ headers, card, sub, accent }: any) {
  const [s, setS] = useState<any>(null);
  const { clientSlug } = useDemo() as any;
  useEffect(() => {
    fetch(`/api/client/${clientSlug}/admin/stats`, { headers }).then((r) => r.json()).then(setS).catch(() => {});
  }, []);
  if (!s) return <p className={`py-10 text-center text-sm ${sub}`}>লোড হচ্ছে...</p>;
  const max = Math.max(1, ...s.chart.map((c: any) => c.v));
  return (
    <div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          ["💰", "মোট রেভিনিউ", `${bn(s.revenue)} টাকা`],
          ["🧾", "মোট অর্ডার", bn(s.orders)],
          ["⏳", "পেন্ডিং", bn(s.pending)],
          ["📦", "প্রোডাক্ট", bn(s.products)],
        ].map(([e, t, v]) => (
          <div key={t as string} className={`${card} p-4 text-center`}>
            <p className="text-2xl">{e}</p>
            <p className="mt-1 text-lg font-black" style={{ color: accent }}>{v}</p>
            <p className={`text-[11px] ${sub}`}>{t}</p>
          </div>
        ))}
      </div>
      <div className={`${card} mt-4 p-4`}>
        <p className="text-sm font-black">📈 শেষ ৭ দিনের বিক্রি</p>
        <div className="mt-3 flex h-32 items-end gap-1.5">
          {s.chart.map((c: any) => (
            <div key={c.d} className="flex flex-1 flex-col items-center gap-1">
              <div className="w-full rounded-t" style={{ height: `${Math.max(4, (c.v / max) * 100)}%`, background: accent, opacity: 0.85 }} />
              <span className={`text-[9px] ${sub}`}>{c.d}</span>
            </div>
          ))}
        </div>
      </div>
      <div className={`${card} mt-4 p-4`}>
        <p className="text-sm font-black">🕘 সাম্প্রতিক অর্ডার</p>
        <div className="mt-2 space-y-1.5">
          {s.recent.length === 0 && <p className={`text-xs ${sub}`}>এখনো অর্ডার নেই</p>}
          {s.recent.map((o: any) => (
            <div key={o.order_no} className="flex justify-between text-xs">
              <span>{o.order_no} • {bn(o.total_bdt)} টাকা</span>
              <span className={sub}>{o.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- Products ---------- */
function ProductsTab({ headers, card, sub, input, accent, dark }: any) {
  const { clientSlug } = useDemo() as any;
  const [list, setList] = useState<any[]>([]);
  const [form, setForm] = useState<any>({ name: "", price_bdt: "", old_price_bdt: "", image_emoji: "📦", image_url: "", category: "", stock: "100" });
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);

  const load = () => fetch(`/api/client/${clientSlug}/admin/products`, { headers }).then((r) => r.json()).then((d) => setList(d.products || [])).catch(() => {});
  useEffect(() => { load(); }, []);

  async function save() {
    if (!form.name.trim()) { alert("নাম দিন"); return; }
    const method = editing ? "PATCH" : "POST";
    const res = await fetch(`/api/client/${clientSlug}/admin/products`, {
      method, headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify(editing ? { id: editing, ...form } : form),
    });
    if (res.ok) { setForm({ name: "", price_bdt: "", old_price_bdt: "", image_emoji: "📦", image_url: "", category: "", stock: "100" }); setEditing(null); load(); }
    else alert("সেভ হয়নি");
  }

  async function uploadImage(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", f);
    try {
      const res = await fetch(`/api/client/${clientSlug}/admin/upload`, { method: "POST", headers, body: fd });
      const d = await res.json();
      if (res.ok && d.url) setForm({ ...form, image_url: d.url });
      else alert(d.error || "আপলোড হয়নি");
    } catch { alert("আপলোড হয়নি"); }
    setUploading(false);
  }

  async function del(id: string) {
    if (!confirm("মুছবেন?")) return;
    await fetch(`/api/client/${clientSlug}/admin/products?id=${id}`, { method: "DELETE", headers });
    load();
  }

  return (
    <div>
      <div className={`${card} p-4`}>
        <p className="text-sm font-black">{editing ? "✏️ এডিট" : "＋ নতুন প্রোডাক্ট"}</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="নাম *" className={input} />
          <input value={form.price_bdt} onChange={(e) => setForm({ ...form, price_bdt: e.target.value })} placeholder="দাম (টাকা) *" type="number" className={input} />
          <input value={form.old_price_bdt} onChange={(e) => setForm({ ...form, old_price_bdt: e.target.value })} placeholder="আগের দাম (ঐচ্ছিক)" type="number" className={input} />
          <input value={form.image_emoji} onChange={(e) => setForm({ ...form, image_emoji: e.target.value })} placeholder="ইমোজি" className={input} />
          <div className="sm:col-span-3">
            <label className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-3 text-sm font-bold ${dark ? "border-white/15 bg-white/5" : "border-slate-200 bg-slate-50"}`}>
              {uploading ? "⏳ আপলোড হচ্ছে..." : form.image_url ? "✅ ছবি আপলোড হয়েছে — বদলাতে ক্লিক করুন" : "📷 প্রোডাক্টের ছবি আপলোড করুন"}
              <input type="file" accept="image/*" className="hidden" onChange={uploadImage} disabled={uploading} />
            </label>
            {form.image_url && <img src={form.image_url} alt="" className="mt-2 h-20 w-20 rounded-xl object-cover" />}
          </div>
          <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="ক্যাটাগরি" className={input} />
          <input value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} placeholder="স্টক" type="number" className={input} />
        </div>
        <div className="mt-3 flex gap-2">
          <button onClick={save} className="btn-demo flex-1" style={{ background: accent }}>{editing ? "আপডেট" : "যোগ করুন"}</button>
          {editing && <button onClick={() => { setEditing(null); setForm({ name: "", price_bdt: "", old_price_bdt: "", image_emoji: "📦", image_url: "", category: "", stock: "100" }); }} className="btn-demo-ghost">বাতিল</button>}
        </div>
      </div>
      <div className="mt-3 space-y-2">
        {list.map((p) => (
          <div key={p.id} className={`${card} flex items-center gap-3 p-3`}>
            {p.image_url ? <img src={p.image_url} alt="" className="h-12 w-12 rounded-xl object-cover" /> : <span className="text-3xl">{p.image_emoji}</span>}
            <div className="flex-1">
              <p className="text-sm font-bold">{p.name} {!p.is_active && <span className="text-red-400">(বন্ধ)</span>}</p>
              <p className={`text-xs ${sub}`}>{bn(p.price_bdt)} টাকা • স্টক {bn(p.stock)} • {p.category}</p>
            </div>
            <button onClick={() => { setEditing(p.id); setForm({ name: p.name, price_bdt: p.price_bdt, old_price_bdt: p.old_price_bdt || "", image_emoji: p.image_emoji, image_url: p.image_url || "", category: p.category, stock: p.stock }); }} className="text-xs font-bold text-blue-400">✏️</button>
            <button onClick={() => del(p.id)} className="text-xs font-bold text-red-400">🗑</button>
          </div>
        ))}
        {list.length === 0 && <p className={`py-8 text-center text-sm ${sub}`}>প্রোডাক্ট যোগ করুন — সাইটে দেখা যাবে</p>}
      </div>
    </div>
  );
}

/* ---------- Orders ---------- */
function OrdersTab({ headers, card, sub, input, accent, dark }: any) {
  const { clientSlug } = useDemo() as any;
  const [list, setList] = useState<any[]>([]);
  const [filter, setFilter] = useState("");
  const load = () => fetch(`/api/client/${clientSlug}/admin/orders${filter ? `?status=${filter}` : ""}`, { headers }).then((r) => r.json()).then((d) => setList(d.orders || [])).catch(() => {});
  useEffect(() => { load(); }, [filter]);

  async function setStatus(id: string, status: string) {
    const res = await fetch(`/api/client/${clientSlug}/admin/orders`, {
      method: "PATCH", headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) load();
  }

  const ST = [["", "সব"], ["pending", "⏳ পেন্ডিং"], ["confirmed", "✅ কনফার্ম"], ["shipped", "🚚 শিপড"], ["delivered", "📦 ডেলিভার্ড"], ["cancelled", "❌ বাতিল"]];

  return (
    <div>
      <div className="flex gap-1.5 overflow-x-auto">
        {ST.map(([v, t]) => (
          <button key={v} onClick={() => setFilter(v)} className={`whitespace-nowrap rounded-full px-3 py-1.5 text-[11px] font-bold ${filter === v ? "text-white" : dark ? "bg-white/5 text-slate-400" : "bg-slate-100 text-slate-600"}`} style={filter === v ? { background: accent } : undefined}>{t}</button>
        ))}
      </div>
      <div className="mt-3 space-y-2">
        {list.map((o) => (
          <div key={o.id} className={`${card} p-3`}>
            <div className="flex justify-between text-sm">
              <b>{o.order_no}</b>
              <b style={{ color: accent }}>{bn(o.total_bdt)} টাকা</b>
            </div>
            <p className={`mt-1 text-xs ${sub}`}>👤 {o.customer_name} • 📞 {o.customer_phone}</p>
            <p className={`text-xs ${sub}`}>📍 {o.customer_address || "—"}</p>
            <div className="mt-1 text-xs opacity-70">
              {(o.items || []).map((it: any, i: number) => <span key={i}>{it.emoji} {it.name} ×{bn(it.qty)}{i < o.items.length - 1 ? ", " : ""}</span>)}
            </div>
            <div className="mt-2 flex gap-1.5">
              <select value={o.status} onChange={(e) => setStatus(o.id, e.target.value)} className={`${input} !py-1.5 !text-xs`}>
                <option value="pending">⏳ পেন্ডিং</option>
                <option value="confirmed">✅ কনফার্ম</option>
                <option value="shipped">🚚 শিপড</option>
                <option value="delivered">📦 ডেলিভার্ড</option>
                <option value="cancelled">❌ বাতিল</option>
              </select>
            </div>
          </div>
        ))}
        {list.length === 0 && <p className={`py-8 text-center text-sm ${sub}`}>অর্ডার নেই</p>}
      </div>
    </div>
  );
}

/* ---------- Ads ---------- */
function AdsTab({ headers, card, sub, input, accent }: any) {
  const { clientSlug } = useDemo() as any;
  const [s, setS] = useState<Record<string, string>>({ ad_head: "", ad_top: "", ad_bottom: "", ad_popup: "", announcement: "" });
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    fetch(`/api/client/${clientSlug}/admin/settings`, { headers }).then((r) => r.json()).then((d) => {
      if (d.settings) setS({ ...s, ...d.settings });
    }).catch(() => {});
  }, []);
  async function save() {
    const res = await fetch(`/api/client/${clientSlug}/admin/settings`, {
      method: "POST", headers: { ...headers, "Content-Type": "application/json" }, body: JSON.stringify(s),
    });
    if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 2000); }
    else alert("সেভ হয়নি");
  }
  const F = (k: string, label: string, hint: string, rows = 3) => (
    <div>
      <p className="text-xs font-black">{label}</p>
      <p className={`mt-0.5 text-[11px] ${sub}`}>{hint}</p>
      <textarea value={s[k] || ""} onChange={(e) => setS({ ...s, [k]: e.target.value })} rows={rows}
        placeholder="<script>...</script>" className={`${input} mt-1.5 font-mono !text-[11px]`} dir="ltr" />
    </div>
  );
  return (
    <div className={`${card} space-y-4 p-4`}>
      <p className="text-sm font-black">📢 বিজ্ঞাপন সেটআপ</p>
      <p className={`text-xs ${sub}`}>Adsterra / Monetag থেকে কোড কপি করে নিচে বসান — সাইটে অটো দেখাবে</p>
      {F("ad_head", "Head কোড", "সব পেজের <head>-এ (যেমন: Monetag multi-tag)", 2)}
      {F("ad_top", "টপ ব্যানার", "সাইটের উপরে ব্যানার", 2)}
      {F("ad_bottom", "বটম ব্যানার", "সাইটের নিচে ব্যানার", 2)}
      {F("ad_popup", "পপআপ / সোশ্যাল বার", "পপআন্ডার বা সোশ্যাল বার কোড", 2)}
      <div>
        <p className="text-xs font-black">📣 অ্যানাউন্সমেন্ট বার</p>
        <input value={s.announcement || ""} onChange={(e) => setS({ ...s, announcement: e.target.value })}
          placeholder="যেমন: ঈদ অফার! সব পণ্যে ২০% ছাড় 🎉" className={`${input} mt-1.5`} />
      </div>
      <button onClick={save} className="btn-demo w-full" style={{ background: accent }}>{saved ? "✅ সেভ হয়েছে!" : "💾 সেভ করুন"}</button>
    </div>
  );
}

/* ---------- Slider ---------- */
function SliderTab({ headers, card, sub, input, accent, dark }: any) {
  const { clientSlug } = useDemo() as any;
  const [slides, setSlides] = useState<any[]>([{ img: "", title: "", sub: "" }, { img: "", title: "", sub: "" }, { img: "", title: "", sub: "" }]);
  const [uploading, setUploading] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch(`/api/client/${clientSlug}/admin/settings`, { headers }).then((r) => r.json()).then((d) => {
      try {
        const arr = JSON.parse(d.settings?.hero_slides || "[]");
        if (Array.isArray(arr) && arr.length > 0) {
          const filled = [0, 1, 2].map((i) => arr[i] || { img: "", title: "", sub: "" });
          setSlides(filled);
        }
      } catch {}
    }).catch(() => {});
  }, []);

  async function uploadImage(i: number, e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploading(i);
    const fd = new FormData();
    fd.append("file", f);
    try {
      const res = await fetch(`/api/client/${clientSlug}/admin/upload`, { method: "POST", headers, body: fd });
      const d = await res.json();
      if (res.ok && d.url) {
        const next = [...slides];
        next[i] = { ...next[i], img: d.url };
        setSlides(next);
      } else alert(d.error || "আপলোড হয়নি");
    } catch { alert("আপলোড হয়নি"); }
    setUploading(null);
  }

  async function save() {
    const clean = slides.filter((sl) => sl.img || sl.title);
    const res = await fetch(`/api/client/${clientSlug}/admin/settings`, {
      method: "POST", headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ hero_slides: JSON.stringify(clean) }),
    });
    if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 2000); }
    else alert("সেভ হয়নি");
  }

  return (
    <div className={`${card} p-4`}>
      <p className="text-sm font-black">🎠 হোম স্লাইডার</p>
      <p className={`mt-1 text-xs ${sub}`}>নিজের ছবি দিন — সাইটের হোমে স্লাইড হবে</p>
      <div className="mt-3 space-y-3">
        {slides.map((sl, i) => (
          <div key={i} className={`rounded-2xl border p-3 ${dark ? "border-white/10" : "border-slate-200"}`}>
            <p className="text-xs font-black">স্লাইড {["১", "২", "৩"][i]}</p>
            <div className="mt-2 flex gap-2">
              {sl.img ? (
                <img src={sl.img} alt="" className="h-16 w-24 rounded-xl object-cover" />
              ) : (
                <div className={`grid h-16 w-24 place-items-center rounded-xl text-2xl ${dark ? "bg-white/5" : "bg-slate-100"}`}>🖼️</div>
              )}
              <label className={`flex flex-1 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed px-3 text-xs font-bold ${dark ? "border-white/15" : "border-slate-200"}`}>
                {uploading === i ? "⏳..." : "📷 ছবি দিন"}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => uploadImage(i, e)} disabled={uploading !== null} />
              </label>
            </div>
            <input value={sl.title} onChange={(e) => { const n = [...slides]; n[i] = { ...n[i], title: e.target.value }; setSlides(n); }}
              placeholder="টাইটেল (যেমন: ঈদ অফার!)" className={`${input} mt-2 !py-2 !text-xs`} />
            <input value={sl.sub} onChange={(e) => { const n = [...slides]; n[i] = { ...n[i], sub: e.target.value }; setSlides(n); }}
              placeholder="সাবটাইটেল" className={`${input} mt-1.5 !py-2 !text-xs`} />
          </div>
        ))}
      </div>
      <button onClick={save} className="btn-demo mt-3 w-full" style={{ background: accent }}>
        {saved ? "✅ সেভ হয়েছে!" : "💾 সেভ করুন"}
      </button>
    </div>
  );
}

/* ---------- Settings (theme etc.) ---------- */
function SettingsTab({ card, sub, input, accent, dark }: any) {
  const { store } = useDemo();
  return (
    <div className={`${card} p-4`}>
      <p className="text-sm font-black">🎨 সাইট কাস্টমাইজেশন</p>
      <p className={`mt-1 text-xs ${sub}`}>থিম, কালার, নাম — ডেমো অ্যাডমিন থেকে বদলান</p>
      <Link href={`${useDemo().base}/admin`} className="btn-demo mt-3 inline-block" style={{ background: accent }}>
        ⚙️ ডিজাইন সেটিংস খুলুন
      </Link>
      <p className={`mt-3 text-[11px] ${sub}`}>💡 ডেমো অ্যাডমিনে থিম (৬টি), ব্র্যান্ড কালার, ডার্ক মোড, সাইটের নাম/লোগো বদলানো যায়</p>
    </div>
  );
}
