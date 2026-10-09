"use client";

import { useCallback, useEffect, useState } from "react";
import { toBnDigits, timeAgo } from "@/lib/format";

const STATUS_BN: Record<string, string> = {
  new: "🆕 নতুন",
  contacted: "📞 যোগাযোগ হয়েছে",
  quoted: "💰 কোট দেওয়া",
  accepted: "✅ এক্সেপ্ট",
  done: "🎉 সম্পন্ন",
  cancelled: "❌ বাতিল",
};

export default function ServicesClient() {
  const [reqs, setReqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/services");
      const d = await res.json();
      if (d.ok) setReqs(d.requests);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function act(action: string, id: string, value: string) {
    await fetch("/api/admin/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, id, value }),
    });
    load();
  }

  if (loading) return <p className="text-slate-400">লোড হচ্ছে...</p>;

  return (
    <div className="grid gap-4">
      {reqs.length === 0 && <p className="text-slate-500">এখনো কোনো রিকোয়েস্ট নেই</p>}
      {reqs.map((r) => (
        <div key={r.id} className="glass rounded-2xl p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-bold text-white">{r.name} <span className="font-normal text-slate-400">• {r.phone}</span></p>
            <span className="rounded-full bg-[#d7ff3f]/15 px-3 py-1 text-xs font-bold text-[#d7ff3f]">
              {STATUS_BN[r.status] ?? r.status}
            </span>
          </div>
          <p className="mt-2 text-sm text-slate-300">
            🌐 <b>{r.site_type}</b> • 💰 বাজেট: {r.budget_range || "—"}
          </p>
          {r.features && <p className="mt-1 text-sm text-slate-400">✨ ফিচার: {r.features}</p>}
          {r.details && <p className="mt-1 whitespace-pre-wrap text-sm text-slate-400">📝 {r.details}</p>}
          <p className="mt-1 text-[11px] text-slate-600">{timeAgo(r.created_at)}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <select
              value={r.status}
              onChange={(e) => act("status", r.id, e.target.value)}
              className="rounded-xl bg-white/10 px-3 py-2 text-sm font-bold text-white"
            >
              {Object.entries(STATUS_BN).map(([k, v]) => <option key={k} value={k} className="bg-[#0b1120]">{v}</option>)}
            </select>
            <a href={`tel:${r.phone}`} className="rounded-xl bg-[#d7ff3f]/15 px-4 py-2 text-sm font-bold text-[#d7ff3f]">📞 কল করুন</a>
            <a href={`https://wa.me/880${r.phone.replace(/\D/g, "").slice(-10)}`} target="_blank" rel="noopener"
              className="rounded-xl bg-[#25D366]/15 px-4 py-2 text-sm font-bold text-[#25D366]">💬 WhatsApp</a>
          </div>
        </div>
      ))}
      {reqs.length > 0 && <p className="text-xs text-slate-600">মোট {toBnDigits(reqs.length)}টি রিকোয়েস্ট</p>}
    </div>
  );
}
