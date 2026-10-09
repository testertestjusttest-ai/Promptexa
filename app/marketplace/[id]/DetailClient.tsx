"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { formatBDT, toBnDigits, timeAgo } from "@/lib/format";
import { DEAL_BN, DEAL_STEPS } from "@/lib/escrow";

type Deal = {
  id: string;
  buyer_id: string;
  seller_id: string;
  amount_bdt: number;
  status: string;
  buyer_trxid: string;
  admin_note: string;
  created_at: string;
};

type Msg = { id: string; sender_id: string; body: string; created_at: string };

export default function DetailClient({ id }: { id: string }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [chatText, setChatText] = useState("");
  const [sending, setSending] = useState(false);
  const [buying, setBuying] = useState(false);
  const [trxid, setTrxid] = useState("");
  const [senderNo, setSenderNo] = useState("");
  const [acting, setActing] = useState(false);
  const [imgIdx, setImgIdx] = useState(0);
  const chatRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch(`/api/marketplace/${id}`);
      const d = await res.json();
      if (res.ok) setData(d);
    } catch {}
    if (!silent) setLoading(false);
  }, [id]);

  useEffect(() => {
    load();
    const t = setInterval(() => load(true), 8000);
    return () => clearInterval(t);
  }, [load]);

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight });
  }, [data?.messages]);

  async function sendChat(e: React.FormEvent) {
    e.preventDefault();
    if (!chatText.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch(`/api/marketplace/${id}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: chatText }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      setChatText("");
      load(true);
    } catch (e) {
      setMsg(`⚠️ ${e instanceof Error ? e.message : "হয়নি"}`);
    } finally {
      setSending(false);
    }
  }

  async function buy() {
    setBuying(true);
    setMsg("");
    try {
      const res = await fetch("/api/marketplace/escrow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listing_id: id }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      load(true);
    } catch (e) {
      setMsg(`⚠️ ${e instanceof Error ? e.message : "হয়নি"}`);
    } finally {
      setBuying(false);
    }
  }

  async function dealAction(deal: Deal, action: string, extra: Record<string, string> = {}) {
    if (!deal) return;
    if (action === "dispute" && !confirm("বিরোধ খুলবেন? অ্যাডমিন বিষয়টি দেখবে।")) return;
    setActing(true);
    setMsg("");
    try {
      const res = await fetch(`/api/marketplace/escrow/${deal.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...extra }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      setMsg(`✅ ${d.label ?? "সম্পন্ন"}`);
      load(true);
    } catch (e) {
      setMsg(`⚠️ ${e instanceof Error ? e.message : "হয়নি"}`);
    } finally {
      setActing(false);
    }
  }

  if (loading) return <p className="mx-auto max-w-4xl px-4 py-16 text-center text-slate-500">লোড হচ্ছে...</p>;
  if (!data) return <p className="mx-auto max-w-4xl px-4 py-16 text-center text-slate-500">লিস্টিং পাওয়া যায়নি</p>;

  const l = data.listing;
  const me = data.me;
  const isSeller = me && l.seller_id === me;
  const deals: Deal[] = data.deals ?? [];
  const myDeal = deals.find((d) => d.status !== "completed" && d.status !== "refunded" && d.status !== "cancelled") ?? deals[0];
  const images: string[] = l.images ?? [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Link href="/marketplace" className="text-sm text-slate-400 hover:text-white">← সব ID</Link>

      {l.status !== "approved" && (
        <div className="mt-4 rounded-2xl bg-amber-400/10 p-4 text-sm text-amber-200">
          {l.status === "pending" && "⏳ এই পোস্টটি অ্যাডমিন রিভিউতে আছে — অনুমোদনের পর লাইভ হবে।"}
          {l.status === "sold" && "✅ এই ID বিক্রি হয়ে গেছে।"}
          {l.status === "rejected" && "❌ এই পোস্টটি বাতিল করা হয়েছে।"}
        </div>
      )}

      <div className="mt-4 grid gap-6 lg:grid-cols-2">
        {/* gallery + info */}
        <div>
          <div className="glass overflow-hidden rounded-3xl">
            <div className="relative aspect-video bg-black/40">
              {images[imgIdx] ? (
                <img src={images[imgIdx]} alt={l.title} className="h-full w-full object-contain" />
              ) : (
                <div className="grid h-full place-items-center text-6xl">🎮</div>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto p-3">
                {images.map((u, i) => (
                  <button key={i} onClick={() => setImgIdx(i)}
                    className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl ${i === imgIdx ? "ring-2 ring-[#d7ff3f]" : "opacity-60"}`}>
                    <img src={u} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="glass mt-4 rounded-3xl p-6">
            <div className="flex items-start justify-between gap-3">
              <h1 className="font-display text-2xl font-bold text-white">{l.title}</h1>
              <p className="font-display shrink-0 text-2xl font-bold text-[#d7ff3f]">{formatBDT(Number(l.price_bdt))}</p>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              👤 বিক্রেতা: <b className="text-slate-300">{data.seller_name}</b>
              {l.game_uid && <> • 🆔 UID: <b className="text-slate-300">{l.game_uid}</b></>}
              {" "}• 👁️ {toBnDigits(l.views ?? 0)}
            </p>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-slate-300">{l.description}</p>
          </div>
        </div>

        {/* buy / escrow / chat */}
        <div className="space-y-4">
          {msg && <p className="rounded-xl bg-white/5 px-4 py-3 text-sm text-amber-200">{msg}</p>}

          {/* escrow steps */}
          <div className="glass rounded-3xl p-6">
            <h3 className="font-bold text-white">🛡️ নিরাপদ এসক্রো সিস্টেম</h3>
            <ol className="mt-3 space-y-2">
              {DEAL_STEPS.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#d7ff3f]/15 text-xs font-bold text-[#d7ff3f]">{toBnDigits(i + 1)}</span>
                  {s}
                </li>
              ))}
            </ol>
          </div>

          {/* buy / deal box */}
          {!isSeller && l.status === "approved" && (
            <div className="glass rounded-3xl p-6">
              {!myDeal ? (
                <>
                  <p className="text-sm text-slate-400">টাকা সরাসরি বিক্রেতার কাছে যাবে না — আগে অ্যাডমিনের কাছে জমা থাকবে।</p>
                  <button onClick={buy} disabled={buying} className="btn-vault mt-4 w-full !py-3.5 text-base">
                    {buying ? "প্রসেস হচ্ছে..." : `🛡️ নিরাপদে কিনুন — ${formatBDT(Number(l.price_bdt))}`}
                  </button>
                </>
              ) : (
                <DealBox deal={myDeal} role={me === myDeal.seller_id ? "seller" : "buyer"}
                  trxid={trxid} setTrxid={setTrxid} senderNo={senderNo} setSenderNo={setSenderNo}
                  acting={acting} onAction={(a, e) => dealAction(myDeal, a, e)} />
              )}
            </div>
          )}

          {isSeller && deals.length > 0 && (
            <div className="glass rounded-3xl p-6">
              <h3 className="font-bold text-white">📦 আপনার ডিল ({toBnDigits(deals.length)})</h3>
              <div className="mt-3 space-y-3">
                {deals.map((d) => (
                  <DealBox key={d.id} deal={d} role="seller" acting={acting} onAction={(a, e) => dealAction(d, a, e)} />
                ))}
              </div>
            </div>
          )}

          {/* chat */}
          {data.canChat ? (
            <div className="glass rounded-3xl p-6">
              <h3 className="font-bold text-white">💬 ক্রেতা-বিক্রেতা চ্যাট</h3>
              <p className="mt-1 text-[11px] text-slate-500">এই চ্যাট অ্যাডমিনও দেখতে পারে — নিরাপত্তার জন্য এখানেই কথা বলুন।</p>
              <div ref={chatRef} className="mt-3 max-h-72 space-y-2 overflow-y-auto rounded-2xl bg-black/25 p-3">
                {(data.messages as Msg[]).length === 0 && (
                  <p className="py-6 text-center text-xs text-slate-500">এখনো কোনো মেসেজ নেই — প্রথম মেসেজ পাঠান! 👋</p>
                )}
                {(data.messages as Msg[]).map((m) => {
                  const mine = m.sender_id === me;
                  const isStaffMsg = (data.staff_ids ?? []).includes(m.sender_id);
                  return (
                    <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[80%] rounded-2xl px-3.5 py-2 ${mine ? "bg-[#d7ff3f]/15 text-white" : "bg-white/[0.06] text-slate-200"}`}>
                        {isStaffMsg && <p className="text-[10px] font-bold text-cyan-300">🛡️ সাপোর্ট</p>}
                        <p className="text-sm">{m.body}</p>
                        <p className="mt-0.5 text-[10px] text-slate-500">{timeAgo(m.created_at)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <form onSubmit={sendChat} className="mt-3 flex gap-2">
                <input value={chatText} onChange={(e) => setChatText(e.target.value)}
                  className="field !py-2.5" placeholder="মেসেজ লিখুন..." maxLength={1000} />
                <button type="submit" disabled={sending} className="btn-vault shrink-0 !px-5 !py-2.5 text-sm">
                  {sending ? "..." : "পাঠান"}
                </button>
              </form>
            </div>
          ) : (
            me && !isSeller && l.status === "approved" && (
              <div className="glass rounded-3xl p-6 text-center text-sm text-slate-400">
                💬 বিক্রেতার সাথে চ্যাট করতে প্রথমে <b className="text-white">নিরাপদে কিনুন</b> চাপুন।
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

/** Role-aware escrow deal card */
function DealBox({
  deal, role, trxid, setTrxid, senderNo, setSenderNo, acting, onAction,
}: {
  deal: Deal; role: "buyer" | "seller";
  trxid?: string; setTrxid?: (v: string) => void;
  senderNo?: string; setSenderNo?: (v: string) => void;
  acting: boolean; onAction: (action: string, extra?: Record<string, string>) => void;
}) {
  return (
    <div className="rounded-2xl bg-black/25 p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-white">ডিল #{deal.id.slice(0, 8)}</p>
        <span className="rounded-full bg-[#d7ff3f]/15 px-3 py-1 text-xs font-bold text-[#d7ff3f]">
          {DEAL_BN[deal.status] ?? deal.status}
        </span>
      </div>
      <p className="mt-1 text-xs text-slate-500">পরিমাণ: {formatBDT(Number(deal.amount_bdt))}</p>

      {role === "buyer" && deal.status === "awaiting_payment" && (
        <div className="mt-3 space-y-2">
          <p className="text-xs text-slate-400">📱 বিকাশ/নগদ/রকেটে <b className="text-white">{formatBDT(Number(deal.amount_bdt))}</b> পাঠিয়ে TrxID দিন — টাকা অ্যাডমিনের কাছে জমা থাকবে।</p>
          <input value={trxid ?? ""} onChange={(e) => setTrxid?.(e.target.value)} className="field !py-2.5 uppercase" placeholder="TrxID" />
          <input value={senderNo ?? ""} onChange={(e) => setSenderNo?.(e.target.value)} className="field !py-2.5" placeholder="সেন্ডার নম্বর (01XXXXXXXXX)" inputMode="numeric" />
          <button onClick={() => onAction("pay", { trxid: trxid ?? "", sender_number: senderNo ?? "" })}
            disabled={acting} className="btn-vault w-full !py-2.5 text-sm">
            {acting ? "..." : "✓ পেমেন্ট কনফার্ম করুন"}
          </button>
        </div>
      )}

      {role === "buyer" && deal.status === "paid_to_admin" && (
        <p className="mt-3 rounded-xl bg-cyan-400/10 p-3 text-xs text-cyan-200">
          ✅ টাকা অ্যাডমিনের কাছে জমা আছে। বিক্রেতা এখন আপনাকে ID বুঝিয়ে দেবে — চ্যাটে যোগাযোগ রাখুন।
        </p>
      )}

      {role === "buyer" && deal.status === "id_delivered" && (
        <div className="mt-3 grid gap-2">
          <button onClick={() => onAction("confirm")} disabled={acting} className="btn-vault w-full !py-2.5 text-sm">
            ✅ আইডি পেয়েছি — টাকা ছাড়ুন
          </button>
          <button onClick={() => onAction("dispute")} disabled={acting} className="w-full rounded-xl border border-red-400/30 py-2.5 text-sm font-bold text-red-300">
            ⚠️ সমস্যা আছে — বিরোধ খুলুন
          </button>
        </div>
      )}

      {role === "seller" && deal.status === "awaiting_payment" && (
        <p className="mt-3 rounded-xl bg-white/5 p-3 text-xs text-slate-400">⏳ ক্রেতার পেমেন্টের অপেক্ষায়...</p>
      )}

      {role === "seller" && deal.status === "paid_to_admin" && (
        <div className="mt-3">
          <p className="rounded-xl bg-green-400/10 p-3 text-xs text-green-200">
            ✅ ক্রেতা <b>অ্যাডমিনকে টাকা দিয়েছে</b> — নিশ্চিন্তে ID বুঝিয়ে দিন! টাকা আটকে আছে অ্যাডমিনের কাছে, ক্রেতা কনফার্ম করলেই পাবেন।
          </p>
          <button onClick={() => onAction("deliver")} disabled={acting} className="btn-vault mt-2 w-full !py-2.5 text-sm">
            {acting ? "..." : "🎮 আইডি বুঝিয়ে দিয়েছি"}
          </button>
        </div>
      )}

      {role === "seller" && deal.status === "id_delivered" && (
        <p className="mt-3 rounded-xl bg-white/5 p-3 text-xs text-slate-400">⏳ ক্রেতার কনফার্মেশনের অপেক্ষায় — কনফার্ম করলেই টাকা পাবেন।</p>
      )}

      {deal.status === "completed" && (
        <p className="mt-3 rounded-xl bg-[#d7ff3f]/10 p-3 text-center text-sm font-bold text-[#d7ff3f]">🎉 ডিল সম্পন্ন!</p>
      )}
      {deal.status === "disputed" && (
        <p className="mt-3 rounded-xl bg-red-400/10 p-3 text-xs text-red-200">⚠️ বিরোধ চলছে — অ্যাডমিন যাচাই করে সিদ্ধান্ত দেবে।</p>
      )}
      {deal.status === "refunded" && (
        <p className="mt-3 rounded-xl bg-white/5 p-3 text-xs text-slate-400">↩️ ক্রেতাকে রিফান্ড করা হয়েছে।</p>
      )}
      {deal.admin_note && (
        <p className="mt-2 text-[11px] text-slate-500">📝 অ্যাডমিন নোট: {deal.admin_note}</p>
      )}
    </div>
  );
}
