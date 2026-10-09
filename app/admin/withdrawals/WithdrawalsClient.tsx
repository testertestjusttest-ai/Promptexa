"use client";

import { useEffect, useState } from "react";
import { formatBDT, toBnDigits, timeAgo } from "@/lib/format";

type WD = {
  id: string;
  user_id: string;
  amount_bdt: number;
  method: string;
  account_number: string;
  status: string;
  admin_note: string | null;
  created_at: string;
  profile?: { email: string; full_name: string } | null;
};

const TABS = [
  ["pending", "⏳ পেন্ডিং"],
  ["approved", "✅ সম্পন্ন"],
  ["rejected", "❌ বাতিল"],
] as const;

export default function WithdrawalsClient() {
  const [tab, setTab] = useState<string>("pending");
  const [rows, setRows] = useState<WD[]>([]);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState("");

  async function load() {
    setLoading(true);
    const res = await fetch(`/api/admin/withdrawals?status=${tab}`);
    const d = await res.json();
    if (d.ok) setRows(d.withdrawals);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  async function decide(id: string, action: "approve" | "reject") {
    const label = action === "approve" ? "অ্যাপ্রুভ" : "বাতিল";
    if (!confirm(`এই রিকোয়েস্টটি ${label} করবেন?`)) return;
    setBusy(id);
    try {
      const res = await fetch("/api/admin/withdrawals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action, admin_note: note.trim() || undefined }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "ব্যর্থ");
      setNote("");
      load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "ব্যর্থ");
    } finally {
      setBusy("");
    }
  }

  return (
    <div>
      <div className="mb-6 flex gap-2">
        {TABS.map(([k, label]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
              tab === k
                ? "bg-[#d7ff3f] text-[#060913]"
                : "bg-white/5 text-slate-300 hover:bg-white/10"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-slate-400">লোড হচ্ছে...</p>
      ) : rows.length === 0 ? (
        <div className="glass rounded-2xl p-10 text-center text-slate-500">
          কোনো রিকোয়েস্ট নেই
        </div>
      ) : (
        <div className="space-y-3">
          {tab === "pending" && (
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="অ্যাডমিন নোট (ঐচ্ছিক — যেমন TrxID)"
              className="field"
            />
          )}
          {rows.map((w) => (
            <div key={w.id} className="glass rounded-2xl p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-display text-xl font-bold text-[#d7ff3f]">
                    {formatBDT(Number(w.amount_bdt))}
                  </p>
                  <p className="mt-1 text-sm text-slate-300">
                    {w.method === "bkash" ? "বিকাশ" : w.method === "nagad" ? "নগদ" : "রকেট"} →{" "}
                    <b className="font-mono text-white">{w.account_number}</b>
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {w.profile?.full_name ?? ""} {w.profile?.email ? `• ${w.profile.email}` : ""} • {timeAgo(w.created_at)}
                  </p>
                  {w.admin_note && (
                    <p className="mt-1 text-xs text-slate-400">📝 {w.admin_note}</p>
                  )}
                </div>
                {tab === "pending" && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => decide(w.id, "approve")}
                      disabled={busy === w.id}
                      className="rounded-xl bg-green-500/20 px-5 py-2.5 text-sm font-bold text-green-300 hover:bg-green-500/30"
                    >
                      ✅ টাকা পাঠিয়েছি
                    </button>
                    <button
                      onClick={() => decide(w.id, "reject")}
                      disabled={busy === w.id}
                      className="rounded-xl bg-red-500/15 px-5 py-2.5 text-sm font-bold text-red-300 hover:bg-red-500/25"
                    >
                      ❌ বাতিল (রিফান্ড)
                    </button>
                  </div>
                )}
              </div>
              <p className="mt-2 text-xs text-slate-500">
                💡 অ্যাপ্রুভ করার আগে আপনার {w.method} থেকে {w.account_number} নম্বরে{" "}
                {toBnDigits(Number(w.amount_bdt))} টাকা Send Money করুন।
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
