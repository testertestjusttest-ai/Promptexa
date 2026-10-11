"use client";

import { useEffect, useState } from "react";
import { toBnDigits } from "@/lib/format";

type Dep = {
  id: string; user_id: string; amount_bdt: number; method: string;
  trx_id: string; status: string; created_at: string;
  profiles: { full_name: string; email: string };
};

const METHOD_EMOJI: Record<string, string> = { bkash: "🩷", nagad: "🧡", rocket: "💜", card: "💳" };

export default function AdminDepositsPage() {
  const [list, setList] = useState<Dep[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");

  async function load() {
    setLoading(true);
    const d = await fetch("/api/admin/deposits").then((r) => r.json()).catch(() => null);
    if (d?.deposits) setList(d.deposits);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function decide(id: string, action: "approve" | "reject") {
    const note = action === "reject" ? prompt("বাতিলের কারণ (ঐচ্ছিক):") || "" : "";
    if (!confirm(action === "approve" ? "ডিপোজিট approve করে ওয়ালেটে টাকা যোগ করবেন?" : "ডিপোজিট বাতিল করবেন?")) return;
    const res = await fetch("/api/admin/deposits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action, note }),
    });
    const d = await res.json();
    if (d.ok) load();
    else alert(d.error || "ব্যর্থ");
  }

  const shown = list.filter((x) => filter === "all" || x.status === filter);
  const pending = list.filter((x) => x.status === "pending").length;

  return (
    <div>
      <h1 className="font-display text-xl font-bold text-white">
        💰 ডিপোজিট যাচাই {pending > 0 && <span className="ml-2 rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs text-amber-300">{toBnDigits(pending)} পেন্ডিং</span>}
      </h1>
      <p className="mt-1 text-xs text-slate-500">ইউজারদের টাকা জমার রিকোয়েস্ট — TrxID মিলিয়ে approve করুন</p>

      <div className="mt-4 flex gap-2">
        {[["pending", "⏳ পেন্ডিং"], ["approved", "✅ অনুমোদিত"], ["rejected", "❌ বাতিল"], ["all", "📋 সব"]].map(([v, t]) => (
          <button key={v} onClick={() => setFilter(v)}
            className={`rounded-full px-4 py-1.5 text-xs font-bold ${filter === v ? "bg-[#d7ff3f] text-black" : "bg-white/10 text-slate-300 hover:bg-white/15"}`}>
            {t}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-2">
        {loading && <p className="text-sm text-slate-500">লোড হচ্ছে...</p>}
        {!loading && shown.length === 0 && <p className="py-10 text-center text-sm text-slate-500">কোনো রিকোয়েস্ট নেই</p>}
        {shown.map((d) => (
          <div key={d.id} className="glass rounded-2xl p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-white">
                  {METHOD_EMOJI[d.method] ?? "💰"} {toBnDigits(Number(d.amount_bdt).toLocaleString("en-IN"))} টাকা
                  <span className="ml-2 font-normal text-slate-500">• {d.method}</span>
                </p>
                <p className="mt-1 text-xs text-slate-400">👤 {d.profiles?.full_name || d.profiles?.email || d.user_id.slice(0, 8)}</p>
                <p className="text-xs text-slate-500">🔑 TrxID: <b className="text-slate-300">{d.trx_id}</b></p>
                <p className="text-[11px] text-slate-600">{new Date(d.created_at).toLocaleString("bn-BD")}</p>
              </div>
              {d.status === "pending" ? (
                <div className="flex shrink-0 gap-2">
                  <button onClick={() => decide(d.id, "approve")} className="rounded-xl bg-emerald-500 px-4 py-2 text-xs font-black text-white hover:brightness-110">
                    ✅ Approve
                  </button>
                  <button onClick={() => decide(d.id, "reject")} className="rounded-xl bg-white/10 px-4 py-2 text-xs font-bold text-red-300 hover:bg-white/15">
                    ✖ বাতিল
                  </button>
                </div>
              ) : (
                <span className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-black ${d.status === "approved" ? "bg-emerald-500/15 text-emerald-300" : "bg-red-500/15 text-red-300"}`}>
                  {d.status === "approved" ? "✅ অনুমোদিত" : "❌ বাতিল"}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
