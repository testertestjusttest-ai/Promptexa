"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatBDT, PAYMENT_METHOD_BN, timeAgo } from "@/lib/format";

type PendingPayment = {
  id: string;
  order_id: string;
  method: string;
  amount_bdt: number;
  sender_number: string | null;
  trx_id: string | null;
  created_at: string;
  order: { order_number: string; customer_name: string; customer_phone: string } | null;
};

export default function PaymentsPage() {
  const [list, setList] = useState<PendingPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);
  const router = useRouter();

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/payments/pending");
    const data = await res.json();
    if (data.ok) setList(data.payments);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function act(kind: "approve" | "reject", p: PendingPayment) {
    const msg =
      kind === "approve"
        ? `${p.trx_id} অ্যাপ্রুভ করে কী ডেলিভারি দেবেন?`
        : "এই পেমেন্ট রিজেক্ট করবেন?";
    if (!confirm(msg)) return;
    setActing(p.id);
    const res = await fetch(`/api/admin/payments/${kind}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payment_id: p.id, order_id: p.order_id }),
    });
    const data = await res.json();
    setActing(null);
    if (data.ok) {
      if (data.message) alert(data.message);
      load();
      router.refresh();
    } else {
      alert(data.error || "ব্যর্থ");
    }
  }

  return (
    <div>
      <h2 className="mb-5 font-display text-xl font-bold text-white">
        💳 ম্যানুয়াল পেমেন্ট যাচাই <span className="text-slate-500">({list.length})</span>
      </h2>
      {loading ? (
        <p className="text-slate-400">লোড হচ্ছে...</p>
      ) : list.length === 0 ? (
        <div className="glass rounded-2xl p-10 text-center">
          <div className="text-5xl">✅</div>
          <p className="mt-3 font-bold text-white">সব পেমেন্ট যাচাই সম্পন্ন!</p>
          <p className="text-sm text-slate-400">কোনো অপেক্ষমাণ পেমেন্ট নেই।</p>
        </div>
      ) : (
        <div className="space-y-4">
          {list.map((p) => (
            <div key={p.id} className="glass rounded-2xl p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <Link href={`/admin/orders/${p.order_id}`} className="font-display font-bold text-[#d7ff3f] hover:underline">
                    {p.order?.order_number}
                  </Link>
                  <p className="mt-1 text-sm text-slate-300">
                    {p.order?.customer_name} • {p.order?.customer_phone}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2 text-sm">
                    <span className="chip">{PAYMENT_METHOD_BN[p.method] ?? p.method}</span>
                    <span className="chip chip-lime">{formatBDT(p.amount_bdt)}</span>
                  </div>
                  <div className="mt-3 rounded-xl bg-black/40 p-3 font-mono text-sm">
                    <p>TrxID: <b className="text-white">{p.trx_id}</b></p>
                    <p className="text-slate-400">সেন্ডার: <span className="text-white">{p.sender_number}</span></p>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">{timeAgo(p.created_at)}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => act("approve", p)}
                    disabled={acting === p.id}
                    className="rounded-xl bg-[#d7ff3f] px-5 py-2.5 text-sm font-bold text-[#060913] disabled:opacity-50"
                  >
                    {acting === p.id ? "..." : "✓ অ্যাপ্রুভ"}
                  </button>
                  <button
                    onClick={() => act("reject", p)}
                    disabled={acting === p.id}
                    className="rounded-xl bg-red-500/15 px-5 py-2.5 text-sm font-bold text-red-300 disabled:opacity-50"
                  >
                    ✕ রিজেক্ট
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
