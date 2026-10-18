"use client";

import { useEffect, useState } from "react";
import { formatBDT, timeAgo } from "@/lib/format";
import { topupStatusBn, payMethodBn, type TopUpPackage, type TopUpOrder } from "@/lib/topup";

const EMPTY_PKG = {
  name: "",
  kind: "diamond",
  diamonds: "",
  bonus: "",
  price_bdt: "",
  old_price_bdt: "",
  badge: "",
  sort: "0",
  is_active: true,
};

export default function TopUpAdmin() {
  const [tab, setTab] = useState<"pkgs" | "orders">("orders");
  const [pkgs, setPkgs] = useState<TopUpPackage[]>([]);
  const [orders, setOrders] = useState<TopUpOrder[]>([]);
  const [filter, setFilter] = useState("");
  const [form, setForm] = useState<Record<string, string | boolean>>(EMPTY_PKG);
  const [editId, setEditId] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function loadPkgs() {
    const r = await fetch("/api/admin/topup");
    const d = await r.json();
    if (d.ok) setPkgs(d.packages);
  }
  async function loadOrders() {
    const r = await fetch(`/api/admin/topup/orders${filter ? `?status=${filter}` : ""}`);
    const d = await r.json();
    if (d.ok) setOrders(d.orders);
  }
  useEffect(() => {
    loadPkgs();
    loadOrders();
  }, []);
  useEffect(() => {
    loadOrders();
  }, [filter]);

  function set(k: string, v: string | boolean) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function savePkg() {
    setMsg("");
    if (!String(form.name).trim()) return setMsg("প্যাকেজের নাম দিন");
    if (!(Number(form.price_bdt) > 0)) return setMsg("দাম দিন");
    setBusy(true);
    try {
      const r = await fetch(editId ? `/api/admin/topup?id=${editId}` : "/api/admin/topup", {
        method: editId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const d = await r.json();
      if (!d.ok) throw new Error(d.error);
      setForm(EMPTY_PKG);
      setEditId(null);
      setMsg("✅ সেভ হয়েছে");
      loadPkgs();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "সেভ হয়নি");
    } finally {
      setBusy(false);
    }
  }

  async function delPkg(id: string) {
    if (!confirm("প্যাকেজটি ডিলিট করবেন?")) return;
    await fetch(`/api/admin/topup?id=${id}`, { method: "DELETE" });
    loadPkgs();
  }

  function startEdit(p: TopUpPackage) {
    setEditId(p.id);
    setForm({
      name: p.name,
      kind: p.kind,
      diamonds: String(p.diamonds),
      bonus: String(p.bonus),
      price_bdt: String(p.price_bdt),
      old_price_bdt: p.old_price_bdt ? String(p.old_price_bdt) : "",
      badge: p.badge ?? "",
      sort: String(p.sort),
      is_active: p.is_active,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function setStatus(id: string, status: string) {
    const note = status === "rejected" ? prompt("বাতিলের কারণ (ঐচ্ছিক):") ?? "" : "";
    await fetch(`/api/admin/topup/orders?id=${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, admin_note: note }),
    });
    loadOrders();
  }

  const pendingCount = orders.filter((o) => o.status === "pending").length;

  return (
    <div>
      <div className="mb-5 flex gap-2">
        {(
          [
            ["orders", `🧾 অর্ডার${pendingCount > 0 ? ` (${pendingCount})` : ""}`],
            ["pkgs", "📦 প্যাকেজ"],
          ] as const
        ).map(([k, label]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`rounded-xl px-5 py-2.5 text-sm font-bold transition ${
              tab === k ? "bg-amber-400 text-black" : "bg-white/5 text-slate-300 hover:bg-white/10"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "pkgs" ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
            <h3 className="mb-4 font-bold text-white">{editId ? "✏️ প্যাকেজ এডিট" : "➕ নতুন প্যাকেজ"}</h3>
            <div className="grid gap-3">
              <label className="text-xs text-slate-400">নাম *<input value={String(form.name)} onChange={(e) => set("name", e.target.value)} placeholder="যেমন: ১১৫ ডায়মন্ড" className="field mt-1" /></label>
              <div className="grid grid-cols-2 gap-3">
                <label className="text-xs text-slate-400">টাইপ
                  <select value={String(form.kind)} onChange={(e) => set("kind", e.target.value)} className="field mt-1">
                    <option value="diamond">💎 ডায়মন্ড</option>
                    <option value="membership">🎫 মেম্বারশিপ</option>
                  </select>
                </label>
                <label className="text-xs text-slate-400">ডায়মন্ড সংখ্যা<input value={String(form.diamonds)} onChange={(e) => set("diamonds", e.target.value)} placeholder="115" inputMode="numeric" className="field mt-1" /></label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="text-xs text-slate-400">বোনাস<input value={String(form.bonus)} onChange={(e) => set("bonus", e.target.value)} placeholder="0" inputMode="numeric" className="field mt-1" /></label>
                <label className="text-xs text-slate-400">সর্ট<input value={String(form.sort)} onChange={(e) => set("sort", e.target.value)} inputMode="numeric" className="field mt-1" /></label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="text-xs text-slate-400">দাম (টাকা) *<input value={String(form.price_bdt)} onChange={(e) => set("price_bdt", e.target.value)} placeholder="155" inputMode="decimal" className="field mt-1" /></label>
                <label className="text-xs text-slate-400">আগের দাম (ঐচ্ছিক)<input value={String(form.old_price_bdt)} onChange={(e) => set("old_price_bdt", e.target.value)} placeholder="180" inputMode="decimal" className="field mt-1" /></label>
              </div>
              <label className="text-xs text-slate-400">ব্যাজ (ঐচ্ছিক)<input value={String(form.badge)} onChange={(e) => set("badge", e.target.value)} placeholder="🔥 জনপ্রিয়" className="field mt-1" /></label>
              <label className="flex items-center gap-2 text-sm text-slate-300">
                <input type="checkbox" checked={form.is_active === true} onChange={(e) => set("is_active", e.target.checked)} className="h-4 w-4 accent-amber-400" />
                চালু (সাইটে দেখাবে)
              </label>
              <div className="flex gap-2">
                <button onClick={savePkg} disabled={busy} className="btn-vault flex-1 disabled:opacity-50">
                  {busy ? "…" : editId ? "আপডেট করুন" : "যোগ করুন"}
                </button>
                {editId && (
                  <button onClick={() => { setEditId(null); setForm(EMPTY_PKG); }} className="rounded-xl bg-white/10 px-4 text-sm font-bold text-slate-300">
                    বাতিল
                  </button>
                )}
              </div>
              {msg && <p className="text-sm font-bold text-amber-300">{msg}</p>}
            </div>
          </div>

          <div className="space-y-2">
            {pkgs.map((p) => (
              <div key={p.id} className={`flex items-center justify-between gap-2 rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 ${!p.is_active ? "opacity-50" : ""}`}>
                <div>
                  <p className="text-sm font-bold text-white">{p.name}</p>
                  <p className="text-xs text-slate-400">
                    {p.kind === "membership" ? "🎫 মেম্বারশিপ" : `💎 ${p.diamonds}${p.bonus > 0 ? ` +${p.bonus}` : ""}`} • {formatBDT(Number(p.price_bdt))}
                  </p>
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => startEdit(p)} className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-bold text-slate-200">এডিট</button>
                  <button onClick={() => delPkg(p.id)} className="rounded-lg bg-red-500/15 px-3 py-1.5 text-xs font-bold text-red-300">ডিলিট</button>
                </div>
              </div>
            ))}
            {pkgs.length === 0 && <p className="text-sm text-slate-500">কোনো প্যাকেজ নেই</p>}
          </div>
        </div>
      ) : (
        <div>
          <div className="mb-4 flex gap-2 text-xs">
            {["", "pending", "approved", "delivered", "rejected"].map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`rounded-lg px-3 py-1.5 font-bold ${filter === s ? "bg-amber-400 text-black" : "bg-white/5 text-slate-300"}`}
              >
                {s === "" ? "সব" : topupStatusBn(s)}
              </button>
            ))}
          </div>
          <div className="space-y-3">
            {orders.map((o) => (
              <div key={o.id} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-white">
                      {o.package_name} <span className="text-xs font-normal text-slate-400">• {formatBDT(Number(o.price_bdt))}</span>
                    </p>
                    <p className="mt-1 font-mono text-sm text-amber-300">🎮 UID: {o.player_uid}</p>
                    <p className="mt-0.5 text-xs text-slate-400">
                      📱 {o.phone} • {payMethodBn(o.payment_method)} • TrxID: <span className="font-mono">{o.trx_id}</span> • {timeAgo(o.created_at)}
                    </p>
                    {o.admin_note && <p className="mt-1 text-xs text-red-300">📝 {o.admin_note}</p>}
                  </div>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white">{topupStatusBn(o.status)}</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {o.status === "pending" && (
                    <button onClick={() => setStatus(o.id, "approved")} className="rounded-lg bg-emerald-500/20 px-3 py-1.5 text-xs font-bold text-emerald-300">
                      ✅ পেমেন্ট কনফার্ম
                    </button>
                  )}
                  {(o.status === "pending" || o.status === "approved") && (
                    <button onClick={() => setStatus(o.id, "delivered")} className="rounded-lg bg-amber-400 px-3 py-1.5 text-xs font-black text-black">
                      🎉 ডেলিভারড (টপ-আপ সম্পন্ন)
                    </button>
                  )}
                  {o.status !== "rejected" && o.status !== "delivered" && (
                    <button onClick={() => setStatus(o.id, "rejected")} className="rounded-lg bg-red-500/15 px-3 py-1.5 text-xs font-bold text-red-300">
                      ❌ বাতিল
                    </button>
                  )}
                  <button
                    onClick={() => { navigator.clipboard?.writeText(o.player_uid).catch(() => {}); }}
                    className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-bold text-slate-200"
                  >
                    📋 UID কপি
                  </button>
                </div>
              </div>
            ))}
            {orders.length === 0 && <p className="text-sm text-slate-500">কোনো অর্ডার নেই</p>}
          </div>
        </div>
      )}
    </div>
  );
}
