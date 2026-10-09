"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { formatBDT, toBnDigits, timeAgo } from "@/lib/format";
import { DEAL_BN } from "@/lib/escrow";

export default function MarketAdminClient() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [tab, setTab] = useState<"pending" | "deals" | "all" | "chats">("pending");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/marketplace");
      const d = await res.json();
      if (d.ok) setData(d);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function act(action: string, id: string, note?: string) {
    setMsg("");
    const res = await fetch("/api/admin/marketplace", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, id, note }),
    });
    const d = await res.json();
    setMsg(d.ok ? "✅ সম্পন্ন" : `⚠️ ${d.error}`);
    if (d.ok) load();
    setTimeout(() => setMsg(""), 2500);
  }

  if (loading) return <p className="text-slate-400">লোড হচ্ছে...</p>;

  const pending = data?.pending ?? [];
  const deals = data?.deals ?? [];
  const listings = data?.listings ?? [];
  const chats = data?.chats ?? [];

  return (
    <div>
      {msg && <p className="mb-4 rounded-xl bg-[#d7ff3f]/10 px-4 py-3 text-sm text-[#d7ff3f]">{msg}</p>}

      <div className="mb-6 flex gap-2">
        {([["pending", `⏳ পেন্ডিং (${toBnDigits(pending.length)})`], ["deals", `💰 এসক্রো ডিল (${toBnDigits(deals.length)})`], ["chats", `💬 সব চ্যাট (${toBnDigits(chats.length)})`], ["all", "📋 সব লিস্টিং"]] as const).map(([t, label]) => (
          <button key={t} onClick={() => setTab(t)}
            className={`rounded-xl px-4 py-2.5 text-sm font-bold ${tab === t ? "bg-[#d7ff3f] text-black" : "bg-white/5 text-slate-300"}`}>
            {label}
          </button>
        ))}
      </div>

      {tab === "pending" && (
        <div className="grid gap-4">
          {pending.length === 0 && <p className="text-slate-500">কোনো পেন্ডিং পোস্ট নেই 🎉</p>}
          {pending.map((l: any) => (
            <div key={l.id} className="glass rounded-2xl p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-white">{l.title}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    👤 {l.profiles?.full_name ?? l.seller_id.slice(0, 8)} • {formatBDT(Number(l.price_bdt))} • {timeAgo(l.created_at)}
                  </p>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-slate-300">{l.description}</p>
                  <div className="mt-3 flex gap-2 overflow-x-auto">
                    {(l.images ?? []).map((u: string, i: number) => (
                      <a key={i} href={u} target="_blank" rel="noopener" className="h-20 w-20 shrink-0 overflow-hidden rounded-xl">
                        <img src={u} alt="" className="h-full w-full object-cover" />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <button onClick={() => act("approve_listing", l.id)} className="btn-vault !py-2 text-sm">✅ অনুমোদন</button>
                <button onClick={() => act("reject_listing", l.id)} className="rounded-xl border border-red-400/30 px-4 py-2 text-sm font-bold text-red-300">❌ বাতিল</button>
                <button onClick={() => { if (confirm("পোস্টটি ডিলিট করবেন?")) act("delete_listing", l.id); }} className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-slate-400">🗑️ ডিলিট</button>
                <Link href={`/marketplace/${l.id}`} target="_blank" className="rounded-xl bg-white/5 px-4 py-2 text-sm font-bold text-slate-300">👁️ দেখুন + চ্যাট</Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "deals" && (
        <div className="grid gap-4">
          {deals.length === 0 && <p className="text-slate-500">এখনো কোনো ডিল নেই</p>}
          {deals.map((d: any) => (
            <div key={d.id} className="glass rounded-2xl p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-bold text-white">#{d.id.slice(0, 8)} — {formatBDT(Number(d.amount_bdt))}</p>
                <span className="rounded-full bg-[#d7ff3f]/15 px-3 py-1 text-xs font-bold text-[#d7ff3f]">
                  {DEAL_BN[d.status] ?? d.status}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                TrxID: <b className="text-slate-300">{d.buyer_trxid || "—"}</b> • সেন্ডার: {d.buyer_sender_number || "—"} • {timeAgo(d.created_at)}
              </p>
              {(d.fee_bdt > 0 || d.status === "completed") && (
                <p className="mt-1 text-xs text-amber-200/80">
                  💰 ফি (২%): {formatBDT(Number(d.fee_bdt || 0))} • বিক্রেতা পাবে: {formatBDT(Number(d.seller_payout_bdt || 0))}
                </p>
              )}
              {d.admin_note && <p className="mt-1 text-xs text-slate-500">📝 {d.admin_note}</p>}
              <div className="mt-3 flex flex-wrap gap-2">
                {["paid_to_admin", "id_delivered", "disputed"].includes(d.status) && (
                  <>
                    <button onClick={() => act("release_deal", d.id)} className="btn-vault !py-2 text-sm">💸 বিক্রেতাকে টাকা ছাড়ুন</button>
                    <button onClick={() => { const n = prompt("রিফান্ড নোট:"); if (n !== null) act("refund_deal", d.id, n); }}
                      className="rounded-xl border border-red-400/30 px-4 py-2 text-sm font-bold text-red-300">↩️ রিফান্ড</button>
                  </>
                )}
                <Link href={`/marketplace/${d.listing_id}`} target="_blank" className="rounded-xl bg-white/5 px-4 py-2 text-sm font-bold text-slate-300">💬 চ্যাট দেখুন</Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "chats" && (
        <div className="glass overflow-hidden rounded-2xl">
          <p className="border-b border-white/5 px-4 py-3 text-xs text-slate-500">
            সব লিস্টিংয়ের ক্রেতা-বিক্রেতা কথোপকথন — যেকোনো চ্যাটে ঢুকে রিপ্লাই দিতে পারবেন।
          </p>
          {chats.length === 0 && <p className="px-4 py-8 text-center text-slate-500">এখনো কোনো মেসেজ নেই</p>}
          {chats.map((c: any) => (
            <Link key={c.id} href={`/marketplace/${c.listing_id}`} target="_blank"
              className="block border-b border-white/5 px-4 py-3 transition hover:bg-white/5">
              <p className="text-sm font-bold text-white line-clamp-1">
                {(c.id_listings as any)?.title || "লিস্টিং"} <span className="font-normal text-slate-500">• {timeAgo(c.created_at)}</span>
              </p>
              <p className="mt-0.5 text-sm text-slate-400 line-clamp-1">{c.body}</p>
            </Link>
          ))}
        </div>
      )}

      {tab === "all" && (
        <div className="glass overflow-x-auto rounded-2xl">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-xs text-slate-500">
                <th className="p-3">টাইটেল</th><th className="p-3">দাম</th><th className="p-3">স্ট্যাটাস</th><th className="p-3">তারিখ</th><th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {listings.map((l: any) => (
                <tr key={l.id} className="border-b border-white/5">
                  <td className="p-3 font-semibold text-white">{l.title}</td>
                  <td className="p-3 text-[#d7ff3f]">{formatBDT(Number(l.price_bdt))}</td>
                  <td className="p-3 text-slate-400">{l.status}</td>
                  <td className="p-3 text-slate-500">{timeAgo(l.created_at)}</td>
                  <td className="p-3 flex gap-3">
                    <Link href={`/marketplace/${l.id}`} target="_blank" className="text-[#d7ff3f]">দেখুন</Link>
                    <button onClick={() => { if (confirm("পোস্টটি ডিলিট করবেন?")) act("delete_listing", l.id); }} className="text-red-300">🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
