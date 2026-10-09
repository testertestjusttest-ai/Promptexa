"use client";

import { useCallback, useEffect, useState } from "react";
import { toBnDigits, timeAgo } from "@/lib/format";

export default function StaffClient() {
  const [users, setUsers] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/staff?q=${encodeURIComponent(q)}`);
      const d = await res.json();
      if (d.ok) setUsers(d.users);
    } catch {}
    setLoading(false);
  }, [q]);

  useEffect(() => {
    const t = setTimeout(load, 400);
    return () => clearTimeout(t);
  }, [load]);

  async function toggle(u: any) {
    setMsg("");
    const res = await fetch("/api/admin/staff", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "set_support", user_id: u.id, value: !u.is_support }),
    });
    const d = await res.json();
    setMsg(d.ok ? `✅ ${u.email} ${!u.is_support ? "সাপোর্ট অ্যাডমিন হয়েছে" : "সাপোর্ট থেকে সরানো হয়েছে"}` : `⚠️ ${d.error}`);
    if (d.ok) load();
    setTimeout(() => setMsg(""), 3000);
  }

  return (
    <div>
      <div className="glass mb-6 rounded-2xl p-5">
        <h3 className="font-bold text-white">🛡️ সাপোর্ট অ্যাডমিন কী করতে পারবে?</h3>
        <ul className="mt-2 space-y-1 text-sm text-slate-400">
          <li>✅ অর্ডার দেখতে পারবে, ID বাজারের চ্যাট দেখতে ও রিপ্লাই দিতে পারবে</li>
          <li>✅ সার্ভিস রিকোয়েস্ট দেখতে পারবে</li>
          <li>❌ <b className="text-red-300">কিছুই পরিবর্তন করতে পারবে না</b> — সেটিংস, প্রোডাক্ট, পেমেন্ট, টাকা ছাড় — সব বন্ধ</li>
        </ul>
      </div>

      {msg && <p className="mb-4 rounded-xl bg-[#d7ff3f]/10 px-4 py-3 text-sm text-[#d7ff3f]">{msg}</p>}

      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ইমেইল দিয়ে খুঁজুন..."
        className="field mb-4 max-w-sm" />

      {loading ? <p className="text-slate-500">লোড হচ্ছে...</p> : (
        <div className="grid gap-3">
          {users.map((u) => (
            <div key={u.id} className="glass flex flex-wrap items-center justify-between gap-3 rounded-2xl p-4">
              <div>
                <p className="font-bold text-white">{u.full_name || "—"}</p>
                <p className="text-xs text-slate-500">{u.email} • {timeAgo(u.created_at)}</p>
                <p className="mt-1 text-xs">
                  {u.is_admin && <span className="rounded-full bg-[#d7ff3f]/15 px-2.5 py-0.5 font-bold text-[#d7ff3f]">👑 ফুল অ্যাডমিন</span>}
                  {!u.is_admin && u.is_support && <span className="rounded-full bg-cyan-400/15 px-2.5 py-0.5 font-bold text-cyan-300">🛡️ সাপোর্ট</span>}
                  {!u.is_admin && !u.is_support && <span className="text-slate-500">সাধারণ ইউজার</span>}
                </p>
              </div>
              {!u.is_admin && (
                <button onClick={() => toggle(u)}
                  className={`rounded-xl px-4 py-2 text-sm font-bold ${u.is_support ? "border border-red-400/30 text-red-300" : "bg-cyan-400/15 text-cyan-300"}`}>
                  {u.is_support ? "সাপোর্ট থেকে সরান" : "🛡️ সাপোর্ট বানান"}
                </button>
              )}
            </div>
          ))}
          {users.length === 0 && <p className="text-slate-500">কেউ পাওয়া যায়নি</p>}
        </div>
      )}
      <p className="mt-3 text-xs text-slate-600">মোট {toBnDigits(users.length)} জন</p>
    </div>
  );
}
