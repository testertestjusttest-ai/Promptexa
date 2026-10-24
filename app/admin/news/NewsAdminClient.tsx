"use client";

import { useCallback, useEffect, useState } from "react";
import { DAILY_SLOTS } from "@/lib/agency-news-shared";

type Post = Record<string, unknown>;
type Category = { id: string; slug: string; name_en: string; name_bn?: string | null; name_hi?: string | null };
type Slot = { id: string; slot_index: number; planned_topic?: string | null; is_agency_slot: boolean; status: string; post_id?: string | null; post?: { title_en: string } | null };

const EMPTY_FORM: Record<string, string | boolean> = {
  title_en: "", title_bn: "", title_hi: "",
  excerpt_en: "", excerpt_bn: "", excerpt_hi: "",
  body_en: "", body_bn: "", body_hi: "",
  cover_image_url: "", author_name: "DigiPlyra",
  category_id: "", slug: "", status: "draft",
  seo_title: "", seo_description: "", seo_keywords: "",
  published_at: "", is_agency_post: false,
};

/**
 * Agency News admin (Phase 5) — the owner posts from here, no developer help.
 * English-first UI (agency rule). Trilingual fields: English required, Bangla
 * and Hindi optional (untranslated fields fall back to English on the site).
 * Daily plan: 10 slots/day, slots 9-10 are agency stories. Missed slots stay
 * empty — no filler, no invented news.
 */
export default function NewsAdminClient() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [planDate, setPlanDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [tablesReady, setTablesReady] = useState(true);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [editing, setEditing] = useState<Post | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Record<string, string | boolean>>(EMPTY_FORM);
  const [newCat, setNewCat] = useState({ name_en: "", name_bn: "", name_hi: "" });
  const [tab, setTab] = useState<"posts" | "plan" | "categories">("posts");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [p, c, s] = await Promise.all([
        fetch("/api/admin/news?view=posts").then((r) => r.json()),
        fetch("/api/admin/news?view=categories").then((r) => r.json()),
        fetch(`/api/admin/news?view=plan&date=${planDate}`).then((r) => r.json()),
      ]);
      setPosts(p.posts ?? []);
      setCategories(c.categories ?? []);
      setSlots(s.slots ?? []);
      setTablesReady(p.tables_ready !== false && c.tables_ready !== false);
    } catch {
      setMsg("Could not load news data.");
    } finally {
      setLoading(false);
    }
  }, [planDate]);

  useEffect(() => {
    load();
  }, [load]);

  function startEdit(p: Post | null) {
    setEditing(p);
    if (!p) {
      setForm(EMPTY_FORM);
      return;
    }
    const next: Record<string, string | boolean> = { ...EMPTY_FORM };
    for (const k of Object.keys(EMPTY_FORM)) {
      const v = p[k];
      next[k] = typeof v === "boolean" ? v : v == null ? "" : String(v);
    }
    if (typeof next.published_at === "string" && next.published_at) next.published_at = next.published_at.slice(0, 16);
    setForm(next);
  }

  async function savePost() {
    const title = String(form.title_en).trim();
    if (!title) {
      setMsg("English title is required.");
      return;
    }
    const payload = { ...form, published_at: form.published_at ? new Date(String(form.published_at)).toISOString() : undefined };
    const res = await fetch("/api/admin/news", {
      method: editing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing ? { action: "post", id: editing.id, ...payload } : { action: "post", ...payload }),
    });
    const d = await res.json();
    setMsg(d.ok ? "✓ Saved." : `⚠️ ${d.error ?? "Save failed."}`);
    if (d.ok) {
      startEdit(null);
      setShowForm(false);
      load();
    }
  }

  async function deletePost(id: string) {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    await fetch(`/api/admin/news?type=post&id=${id}`, { method: "DELETE" });
    load();
  }

  async function saveCategory() {
    if (!newCat.name_en.trim()) return;
    const res = await fetch("/api/admin/news", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "category", ...newCat }),
    });
    const d = await res.json();
    setMsg(d.ok ? "✓ Category saved." : `⚠️ ${d.error ?? "Save failed."}`);
    if (d.ok) {
      setNewCat({ name_en: "", name_bn: "", name_hi: "" });
      load();
    }
  }

  async function createPlan() {
    const res = await fetch("/api/admin/news", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "plan", date: planDate }),
    });
    const d = await res.json();
    setMsg(d.ok ? "✓ Daily plan created (10 slots)." : `⚠️ ${d.error ?? "Plan failed."}`);
    load();
  }

  async function updateSlot(slot: Slot, patch: Partial<Slot>) {
    await fetch("/api/admin/news", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "plan", id: slot.id, ...patch }),
    });
    load();
  }

  const set = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));
  const inputCls = "w-full rounded-xl bg-black/40 px-3 py-2.5 text-sm text-white outline-none ring-1 ring-white/10 focus:ring-[#d7ff3f]";

  if (loading) return <p className="text-sm text-slate-400">Loading news…</p>;

  return (
    <div>
      {!tablesReady && (
        <div className="mb-5 rounded-2xl bg-amber-500/15 p-4 text-sm text-amber-200">
          ⚠️ News tables are not created yet. Run the Phase 5 SQL file (agency-news-sql-2026-10-24.sql) in
          Supabase first — then this panel becomes fully live. Nothing here publishes to the public site until then.
        </div>
      )}
      {msg && <p className="mb-4 text-sm font-bold text-[#d7ff3f]">{msg}</p>}

      <div className="mb-5 flex gap-2">
        {(["posts", "plan", "categories"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-xl px-4 py-2 text-sm font-black ${tab === t ? "bg-[#d7ff3f] text-black" : "bg-white/10 text-white"}`}
          >
            {t === "posts" ? "Posts" : t === "plan" ? "Daily plan (10/day)" : "Categories"}
          </button>
        ))}
        <button onClick={() => { startEdit(null); setShowForm(true); }} className="ml-auto rounded-xl bg-white/10 px-4 py-2 text-sm font-black text-white">
          + New post
        </button>
      </div>

      {tab === "posts" && (
        <div className="space-y-5">
          {showForm && (
            <div className="glass rounded-3xl p-5">
              <h3 className="font-display text-lg font-bold text-white">{editing ? "Edit post" : "New post"}</h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <input className={inputCls} placeholder="Title (English) *" value={String(form.title_en)} onChange={(e) => set("title_en", e.target.value)} />
                <input className={inputCls} placeholder="Slug (auto from title if empty)" value={String(form.slug)} onChange={(e) => set("slug", e.target.value)} />
                <input className={inputCls} placeholder="Title (Bangla, optional)" value={String(form.title_bn)} onChange={(e) => set("title_bn", e.target.value)} />
                <input className={inputCls} placeholder="Title (Hindi, optional)" value={String(form.title_hi)} onChange={(e) => set("title_hi", e.target.value)} />
                <select className={inputCls} value={String(form.category_id)} onChange={(e) => set("category_id", e.target.value)}>
                  <option value="">No category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name_en}</option>
                  ))}
                </select>
                <input className={inputCls} placeholder="Cover image URL (optional)" value={String(form.cover_image_url)} onChange={(e) => set("cover_image_url", e.target.value)} />
                <textarea className={inputCls} placeholder="Excerpt (English)" value={String(form.excerpt_en)} onChange={(e) => set("excerpt_en", e.target.value)} />
                <textarea className={inputCls} placeholder="Body (English)" rows={5} value={String(form.body_en)} onChange={(e) => set("body_en", e.target.value)} />
                <textarea className={inputCls} placeholder="Excerpt (Bangla, optional)" value={String(form.excerpt_bn)} onChange={(e) => set("excerpt_bn", e.target.value)} />
                <textarea className={inputCls} placeholder="Body (Bangla, optional)" rows={5} value={String(form.body_bn)} onChange={(e) => set("body_bn", e.target.value)} />
                <textarea className={inputCls} placeholder="Excerpt (Hindi, optional)" value={String(form.excerpt_hi)} onChange={(e) => set("excerpt_hi", e.target.value)} />
                <textarea className={inputCls} placeholder="Body (Hindi, optional)" rows={5} value={String(form.body_hi)} onChange={(e) => set("body_hi", e.target.value)} />
                <input className={inputCls} placeholder="SEO title (≤60 chars)" value={String(form.seo_title)} onChange={(e) => set("seo_title", e.target.value)} />
                <input className={inputCls} placeholder="SEO description (≤160 chars)" value={String(form.seo_description)} onChange={(e) => set("seo_description", e.target.value)} />
                <input className={inputCls} placeholder="SEO keywords (comma separated)" value={String(form.seo_keywords)} onChange={(e) => set("seo_keywords", e.target.value)} />
                <input className={inputCls} placeholder="Author" value={String(form.author_name)} onChange={(e) => set("author_name", e.target.value)} />
                <input className={inputCls} type="datetime-local" value={String(form.published_at)} onChange={(e) => set("published_at", e.target.value)} />
                <select className={inputCls} value={String(form.status)} onChange={(e) => set("status", e.target.value)}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
              <label className="mt-3 flex items-center gap-2 text-sm text-slate-300">
                <input type="checkbox" checked={form.is_agency_post === true} onChange={(e) => set("is_agency_post", e.target.checked)} />
                This is a DigiPlyra agency story (counts toward the 2/day agency slots)
              </label>
              <div className="mt-4 flex gap-2">
                <button onClick={savePost} className="rounded-xl bg-[#d7ff3f] px-5 py-2.5 text-sm font-black text-black">Save post</button>
                <button onClick={() => setShowForm(false)} className="rounded-xl bg-white/10 px-5 py-2.5 text-sm font-black text-white">Cancel</button>
              </div>
            </div>
          )}

          <div className="glass overflow-x-auto rounded-3xl">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="text-slate-400">
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Agency</th>
                  <th className="px-4 py-3">Published</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((p) => (
                  <tr key={String(p.id)} className="border-t border-white/10">
                    <td className="px-4 py-3 font-bold text-white">{String(p.title_en)}</td>
                    <td className="px-4 py-3 text-slate-300">{String(p.status)}</td>
                    <td className="px-4 py-3 text-slate-300">{p.is_agency_post ? "Yes" : "No"}</td>
                    <td className="px-4 py-3 text-slate-300">{p.published_at ? String(p.published_at).slice(0, 10) : "—"}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => { startEdit(p); setShowForm(true); }} className="mr-3 font-bold text-[#d7ff3f]">Edit</button>
                      <button onClick={() => deletePost(String(p.id))} className="font-bold text-red-400">Delete</button>
                    </td>
                  </tr>
                ))}
                {posts.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-slate-400">No posts yet. Create the first one above.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "plan" && (
        <div className="glass rounded-3xl p-5">
          <div className="flex flex-wrap items-center gap-3">
            <input type="date" className={inputCls + " !w-auto"} value={planDate} onChange={(e) => setPlanDate(e.target.value)} />
            <button onClick={createPlan} className="rounded-xl bg-[#d7ff3f] px-4 py-2.5 text-sm font-black text-black">Create 10 slots for this date</button>
          </div>
          <p className="mt-3 text-sm text-slate-400">
            Slots 1–8: website/tech/business stories. Slots 9–10: DigiPlyra agency stories.
            Suggested Asia/Dhaka times: 08:00, 09:30, 11:00, 12:30, 14:00, 15:30, 17:00, 18:30, 20:00 (agency), 21:30 (agency).
            Missed slots stay empty — never publish filler.
          </p>
          <div className="mt-4 space-y-2">
            {DAILY_SLOTS.map((def) => {
              const slot = slots.find((s) => s.slot_index === def.index);
              return (
                <div key={def.index} className="flex flex-wrap items-center gap-2 rounded-2xl bg-black/30 p-3 text-sm">
                  <span className="w-16 font-black text-white">#{def.index} {def.time}</span>
                  <span className={`rounded-full px-2 py-1 text-[11px] font-bold ${def.agency ? "bg-[#d7ff3f]/20 text-[#d7ff3f]" : "bg-white/10 text-slate-300"}`}>
                    {def.agency ? "Agency" : def.label}
                  </span>
                  <input
                    className="min-w-[180px] flex-1 rounded-xl bg-black/40 px-3 py-2 text-white outline-none ring-1 ring-white/10"
                    placeholder="Planned topic (optional)"
                    defaultValue={slot?.planned_topic ?? ""}
                    key={slot?.id ?? `new-${def.index}`}
                    onBlur={(e) => slot && e.target.value !== (slot.planned_topic ?? "") && updateSlot(slot, { planned_topic: e.target.value })}
                  />
                  <select
                    className="rounded-xl bg-black/40 px-3 py-2 text-white outline-none ring-1 ring-white/10"
                    value={slot?.post_id ?? ""}
                    onChange={(e) => slot && updateSlot(slot, { post_id: e.target.value || null })}
                  >
                    <option value="">No post assigned</option>
                    {posts.map((p) => (
                      <option key={String(p.id)} value={String(p.id)}>{String(p.title_en)}</option>
                    ))}
                  </select>
                  <select
                    className="rounded-xl bg-black/40 px-3 py-2 text-white outline-none ring-1 ring-white/10"
                    value={slot?.status ?? "planned"}
                    onChange={(e) => slot && updateSlot(slot, { status: e.target.value })}
                  >
                    <option value="planned">Planned</option>
                    <option value="drafted">Drafted</option>
                    <option value="published">Published</option>
                    <option value="skipped">Skipped</option>
                  </select>
                  {!slot && <span className="text-xs text-slate-500">Not created yet</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tab === "categories" && (
        <div className="glass rounded-3xl p-5">
          <div className="grid gap-3 sm:grid-cols-3">
            <input className={inputCls} placeholder="Category name (English)" value={newCat.name_en} onChange={(e) => setNewCat({ ...newCat, name_en: e.target.value })} />
            <input className={inputCls} placeholder="Name (Bangla, optional)" value={newCat.name_bn} onChange={(e) => setNewCat({ ...newCat, name_bn: e.target.value })} />
            <input className={inputCls} placeholder="Name (Hindi, optional)" value={newCat.name_hi} onChange={(e) => setNewCat({ ...newCat, name_hi: e.target.value })} />
          </div>
          <button onClick={saveCategory} className="mt-3 rounded-xl bg-[#d7ff3f] px-5 py-2.5 text-sm font-black text-black">Add category</button>
          <ul className="mt-5 space-y-2 text-sm text-slate-300">
            {categories.map((c) => (
              <li key={c.id} className="flex items-center justify-between rounded-2xl bg-black/30 px-4 py-2">
                <span className="font-bold text-white">{c.name_en} <span className="font-normal text-slate-500">({c.slug})</span></span>
                <button
                  onClick={async () => {
                    await fetch(`/api/admin/news?type=category&id=${c.id}`, { method: "DELETE" });
                    load();
                  }}
                  className="font-bold text-red-400"
                >
                  Delete
                </button>
              </li>
            ))}
            {categories.length === 0 && <li className="text-slate-500">No categories yet — the Phase 5 SQL seeds 4 defaults.</li>}
          </ul>
        </div>
      )}
    </div>
  );
}
