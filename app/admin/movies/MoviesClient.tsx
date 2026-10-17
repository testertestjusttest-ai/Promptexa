"use client";

import { useEffect, useState } from "react";

type MovieLink = { label: string; url: string };

type Movie = {
  id: string;
  title: string;
  slug: string;
  poster_url: string | null;
  description: string | null;
  year: number | null;
  genre: string | null;
  video_url: string | null;
  download_url: string | null;
  quality: string | null;
  watch_links: MovieLink[];
  download_links: MovieLink[];
  is_active: boolean;
  is_featured: boolean;
  views: number;
  sort: number;
};

const EMPTY = {
  title: "",
  slug: "",
  poster_url: "",
  description: "",
  year: "",
  genre: "",
  video_url: "",
  download_url: "",
  quality: "",
  watch_links: [] as MovieLink[],
  download_links: [] as MovieLink[],
  is_active: true,
  is_featured: false,
  sort: "0",
};

/** Dynamic label+URL rows editor (watch/download buttons). */
function LinkEditor({
  title,
  hint,
  value,
  onChange,
}: {
  title: string;
  hint: string;
  value: MovieLink[];
  onChange: (v: MovieLink[]) => void;
}) {
  function upd(i: number, k: "label" | "url", v: string) {
    onChange(value.map((l, j) => (j === i ? { ...l, [k]: v } : l)));
  }
  return (
    <div className="rounded-xl border border-white/10 p-3 sm:col-span-2">
      <label className="mb-1 block text-xs font-medium text-slate-400">
        {title} <span className="text-slate-500">({hint})</span>
      </label>
      {value.map((l, i) => (
        <div key={i} className="mt-2 flex gap-2">
          <input
            value={l.label}
            onChange={(e) => upd(i, "label", e.target.value)}
            placeholder="যেমন: 1080p Full HD"
            className="field w-36 shrink-0"
          />
          <input
            value={l.url}
            onChange={(e) => upd(i, "url", e.target.value)}
            placeholder="https://..."
            className="field flex-1 font-mono text-xs"
            dir="ltr"
          />
          <button
            onClick={() => onChange(value.filter((_, j) => j !== i))}
            className="shrink-0 rounded-xl bg-red-500/10 px-3 text-red-300"
            title="মুছুন"
          >
            ✕
          </button>
        </div>
      ))}
      {value.length < 8 && (
        <button
          onClick={() => onChange([...value, { label: "", url: "" }])}
          className="mt-2 rounded-xl bg-white/5 px-3 py-1.5 text-xs font-bold text-slate-300 hover:bg-white/10"
        >
          ＋ লিংক যোগ করুন
        </button>
      )}
    </div>
  );
}

export default function MoviesClient() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/movies");
      const d = await r.json();
      if (d.ok) setMovies(d.movies);
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

  function set(k: string, v: unknown) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function uploadPoster(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "movies");
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "আপলোড হয়নি");
      set("poster_url", data.url);
      setMsg("✓ পোস্টার আপলোড হয়েছে");
    } catch (e) {
      setMsg("⚠️ " + (e instanceof Error ? e.message : "আপলোড হয়নি"));
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    setMsg("");
    if (!form.title.trim()) return setMsg("⚠️ মুভির নাম দিন");
    setSaving(true);
    try {
      const url = "/api/admin/movies";
      const body = {
        ...(editing ? { id: editing } : {}),
        title: form.title,
        slug: form.slug,
        poster_url: form.poster_url,
        description: form.description,
        year: form.year,
        genre: form.genre,
        video_url: form.video_url,
        download_url: form.download_url,
        quality: form.quality,
        watch_links: form.watch_links,
        download_links: form.download_links,
        is_active: form.is_active,
        is_featured: form.is_featured,
        sort: form.sort,
      };
      const r = await fetch(url, {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const d = await r.json();
      if (!r.ok || !d.ok) throw new Error(d.error || "সেভ হয়নি");
      setForm(EMPTY);
      setEditing(null);
      setMsg("✅ সেভ হয়েছে");
      load();
    } catch (e) {
      setMsg("⚠️ " + (e instanceof Error ? e.message : "সেভ হয়নি"));
    } finally {
      setSaving(false);
    }
  }

  function edit(m: Movie) {
    setEditing(m.id);
    setForm({
      title: m.title,
      slug: m.slug,
      poster_url: m.poster_url ?? "",
      description: m.description ?? "",
      year: m.year ? String(m.year) : "",
      genre: m.genre ?? "",
      video_url: m.video_url ?? "",
      download_url: m.download_url ?? "",
      quality: m.quality ?? "",
      watch_links: Array.isArray(m.watch_links) ? m.watch_links : [],
      download_links: Array.isArray(m.download_links) ? m.download_links : [],
      is_active: m.is_active,
      is_featured: m.is_featured,
      sort: String(m.sort),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function toggleActive(m: Movie) {
    await fetch("/api/admin/movies", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: m.id, is_active: !m.is_active }),
    });
    load();
  }

  async function remove(m: Movie) {
    if (!confirm(`"${m.title}" মুছে দেবেন?`)) return;
    await fetch(`/api/admin/movies?id=${m.id}`, { method: "DELETE" });
    load();
  }

  // ---------- unlock gate settings ----------
  const [ucount, setUcount] = useState("10");
  const [ulinks, setUlinks] = useState("");
  const [umsg, setUmsg] = useState("");
  const [usaving, setUsaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/movie-unlock")
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) {
          setUcount(String(d.ad_count ?? 10));
          setUlinks(((d.ad_links as string[]) ?? []).join("\n"));
        }
      })
      .catch(() => {});
  }, []);

  async function saveUnlock() {
    setUmsg("");
    setUsaving(true);
    try {
      const r = await fetch("/api/admin/movie-unlock", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ad_count: ucount,
          ad_links: ulinks.split("\n").map((s) => s.trim()).filter(Boolean),
        }),
      });
      const d = await r.json();
      if (!r.ok || !d.ok) throw new Error(d.error || "সেভ হয়নি");
      setUmsg("✅ আনলক সেটিংস সেভ হয়েছে");
    } catch (e) {
      setUmsg("⚠️ " + (e instanceof Error ? e.message : "সেভ হয়নি"));
    } finally {
      setUsaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* unlock settings */}
      <div className="glass rounded-2xl p-5 sm:p-6">
        <h3 className="font-display text-base font-bold text-white">
          🔓 আনলক সিস্টেম সেটিংস
        </h3>
        <p className="mt-1 text-xs text-slate-500">
          দর্শক কয়টা এডে ক্লিক করলে মুভি লিংক আনলক হবে, আর প্রতিটা এডে ক্লিক করলে
          কোন লিংকে যাবে — এখানে সেট করুন।
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-[160px_1fr]">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">
              এড সংখ্যা (১–২০)
            </label>
            <input
              value={ucount}
              onChange={(e) => setUcount(e.target.value.replace(/[^0-9]/g, "").slice(0, 2))}
              inputMode="numeric"
              className="field"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">
              এড লিংকগুলো <span className="text-slate-500">(আপনার ডাইরেক্ট/স্মার্ট লিংক — প্রতি লাইনে ১টা; ঘুরিয়ে দেখাবে)</span>
            </label>
            <textarea
              value={ulinks}
              onChange={(e) => setUlinks(e.target.value)}
              placeholder={"https://your-direct-link-1\nhttps://your-direct-link-2"}
              className="field min-h-[80px] font-mono text-xs"
              dir="ltr"
            />
          </div>
        </div>
        <button onClick={saveUnlock} disabled={usaving} className="btn-vault mt-3 text-sm">
          {usaving ? "সেভ হচ্ছে..." : "💾 সেটিংস সেভ করুন"}
        </button>
        {umsg && <p className="mt-2 text-sm text-slate-300">{umsg}</p>}
      </div>

      {/* form */}
      <div className="glass rounded-2xl p-5 sm:p-6">
        <h3 className="font-display text-base font-bold text-white">
          {editing ? "✏️ মুভি এডিট করুন" : "➕ নতুন মুভি যোগ করুন"}
        </h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">মুভির নাম *</label>
            <input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="যেমন: Jawan" className="field" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">স্লাগ (লিংকের জন্য, ইংরেজিতে)</label>
            <input value={form.slug} onChange={(e) => set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} placeholder="খালি রাখলে নাম থেকে বানাবে" className="field font-mono" dir="ltr" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">পোস্টার</label>
            <div className="flex items-center gap-2">
              {form.poster_url ? (
                <img src={form.poster_url} alt="" className="h-14 w-10 rounded-lg object-cover" />
              ) : null}
              <label className={`cursor-pointer rounded-xl bg-white/10 px-4 py-2.5 text-xs font-bold text-slate-200 hover:bg-white/20 ${uploading ? "pointer-events-none opacity-50" : ""}`}>
                {uploading ? "আপলোড হচ্ছে..." : "📤 পোস্টার আপলোড"}
                <input type="file" accept="image/*" className="hidden" disabled={uploading}
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadPoster(f); e.target.value = ""; }} />
              </label>
            </div>
            <input value={form.poster_url} onChange={(e) => set("poster_url", e.target.value)} placeholder="অথবা ছবির URL" className="field mt-2 font-mono text-xs" dir="ltr" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-400">বছর</label>
              <input value={form.year} onChange={(e) => set("year", e.target.value.replace(/[^0-9]/g, "").slice(0, 4))} placeholder="2024" inputMode="numeric" className="field" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-400">জনরা</label>
              <input value={form.genre} onChange={(e) => set("genre", e.target.value)} placeholder="অ্যাকশন" className="field" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-400">কোয়ালিটি ব্যাজ</label>
              <input value={form.quality} onChange={(e) => set("quality", e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 12))} placeholder="WEB-DL" className="field font-mono" dir="ltr" />
            </div>
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-medium text-slate-400">বর্ণনা</label>
            <textarea value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="মুভি সম্পর্কে ছোট বর্ণনা" className="field min-h-[70px]" />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-medium text-slate-400">
              🎥 ভিডিও URL <span className="text-slate-500">(যেখানে মুভি রেখেছেন সেই সাইটের লিংক — সরাসরি ফাইল বা এমবেড লিংক)</span>
            </label>
            <input value={form.video_url} onChange={(e) => set("video_url", e.target.value)} placeholder="https://..." className="field font-mono text-xs" dir="ltr" />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-medium text-slate-400">
              ⬇ ডাউনলোড URL <span className="text-slate-500">(ডাউনলোড বাটনে ক্লিক করলে যেখানে যাবে)</span>
            </label>
            <input value={form.download_url} onChange={(e) => set("download_url", e.target.value)} placeholder="https://..." className="field font-mono text-xs" dir="ltr" />
          </div>
          <LinkEditor
            title="🎬 দেখুন বাটনগুলো"
            hint="কোয়ালিটি অনুযায়ী ৪টা দিন — যেমন: 480p, 720p HD, 1080p, 4K"
            value={form.watch_links}
            onChange={(v) => set("watch_links", v)}
          />
          <LinkEditor
            title="⬇ ডাউনলোড বাটনগুলো"
            hint="কোয়ালিটি অনুযায়ী ৪টা দিন — যেমন: 480p, 720p HD, 1080p, 4K"
            value={form.download_links}
            onChange={(v) => set("download_links", v)}
          />
          <div className="flex items-center gap-6">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-300">
              <input type="checkbox" checked={form.is_active} onChange={(e) => set("is_active", e.target.checked)} className="h-4 w-4 accent-[#d7ff3f]" />
              সক্রিয়
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-300">
              <input type="checkbox" checked={form.is_featured} onChange={(e) => set("is_featured", e.target.checked)} className="h-4 w-4 accent-[#d7ff3f]" />
              ⭐ ফিচার্ড
            </label>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <button onClick={save} disabled={saving} className="btn-vault text-sm">
            {saving ? "সেভ হচ্ছে..." : editing ? "💾 আপডেট করুন" : "➕ মুভি যোগ করুন"}
          </button>
          {editing && (
            <button onClick={() => { setEditing(null); setForm(EMPTY); }} className="btn-ghost text-sm">
              বাতিল
            </button>
          )}
        </div>
        {msg && <p className="mt-3 text-sm text-slate-300">{msg}</p>}
      </div>

      {/* list */}
      <div className="glass rounded-2xl p-5 sm:p-6">
        <h3 className="font-display text-base font-bold text-white">
          সব মুভি {movies.length > 0 && <span className="text-slate-500">({movies.length})</span>}
        </h3>
        {loading ? (
          <p className="mt-4 text-sm text-slate-500">লোড হচ্ছে...</p>
        ) : movies.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">এখনো কোনো মুভি যোগ করা হয়নি।</p>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {movies.map((m) => (
              <div key={m.id} className={`flex gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-3 ${m.is_active ? "" : "opacity-50"}`}>
                {m.poster_url ? (
                  <img src={m.poster_url} alt="" className="h-24 w-16 shrink-0 rounded-lg object-cover" />
                ) : (
                  <div className="grid h-24 w-16 shrink-0 place-items-center rounded-lg bg-white/5 text-2xl">🎬</div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-white">
                    {m.is_featured && "⭐ "}{m.title}
                    {m.year ? <span className="ml-2 text-xs font-medium text-slate-500">{m.year}</span> : null}
                  </p>
                  <p className="mt-0.5 truncate font-mono text-xs text-slate-500" dir="ltr">/movies/{m.slug}</p>
                  <p className="mt-0.5 text-xs text-slate-500">👁 {m.views} বার দেখা</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <button onClick={() => edit(m)} className="rounded-lg bg-white/5 px-2.5 py-1 text-xs font-bold text-slate-300">এডিট</button>
                    <button onClick={() => toggleActive(m)} className="rounded-lg bg-white/5 px-2.5 py-1 text-xs font-bold text-slate-300">
                      {m.is_active ? "⏸️ বন্ধ" : "▶️ চালু"}
                    </button>
                    <button onClick={() => remove(m)} className="rounded-lg bg-red-500/10 px-2.5 py-1 text-xs font-bold text-red-300">মুছুন</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
