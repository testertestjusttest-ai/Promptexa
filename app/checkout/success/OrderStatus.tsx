"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatBDT, ORDER_STATUS_BN, PAYMENT_METHOD_BN, timeAgo } from "@/lib/format";
import { StatusBadge } from "@/components/Section";

type OrderInfo = {
  order_number: string;
  status: string;
  payment_method: string | null;
  total_bdt: number;
  customer_name: string;
  created_at: string;
};
type ItemInfo = {
  product_name: string;
  plan_label_bn: string;
  price_bdt: number;
  qty: number;
};

export default function OrderStatus({ orderNumber }: { orderNumber: string }) {
  const [order, setOrder] = useState<OrderInfo | null>(null);
  const [items, setItems] = useState<ItemInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/orders/by-number?number=${encodeURIComponent(orderNumber)}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) {
          setOrder(d.order);
          setItems(d.items);
        }
      })
      .finally(() => setLoading(false));
    const t = setInterval(() => {
      fetch(`/api/orders/by-number?number=${encodeURIComponent(orderNumber)}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.ok) setOrder(d.order);
        })
        .catch(() => {});
    }, 15000);
    return () => clearInterval(t);
  }, [orderNumber]);

  if (loading) {
    return <p className="py-10 text-center text-slate-400">লোড হচ্ছে...</p>;
  }
  if (!order) {
    return <p className="py-10 text-center text-slate-400">অর্ডার পাওয়া যায়নি।</p>;
  }

  const done = order.status === "delivered";
  const waiting = ["pending", "payment_pending", "paid", "keys_pending"].includes(order.status);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="glass ring-conic rounded-3xl p-8 text-center sm:p-10">
        <div className={`mx-auto grid h-20 w-20 place-items-center rounded-full text-4xl ${done ? "bg-[#d7ff3f]/15" : "bg-amber-400/15"}`}>
          {done ? "🎉" : "⏳"}
        </div>
        <h1 className="mt-5 font-display text-3xl font-bold text-white">
          {done ? "ডেলিভারি সম্পন্ন!" : "অর্ডার গ্রহণ করা হয়েছে!"}
        </h1>
        <p className="mt-2 text-slate-400">
          {done
            ? "আপনার প্রিমিয়াম কী ড্যাশবোর্ডে পৌঁছে গেছে।"
            : "পেমেন্ট যাচাই করে দ্রুত ডেলিভারি দেওয়া হবে। এই পেজটি রিফ্রেশ করলে স্ট্যাটাস আপডেট দেখবেন।"}
        </p>

        <div className="mt-6 flex items-center justify-center gap-3">
          <StatusBadge status={order.status} label={ORDER_STATUS_BN[order.status] ?? order.status} />
          <span className="text-sm text-slate-500">{timeAgo(order.created_at)}</span>
        </div>

        <div className="mt-6 rounded-2xl bg-white/[0.03] p-5 text-left">
          <div className="flex justify-between py-1.5 text-sm">
            <span className="text-slate-500">অর্ডার নম্বর</span>
            <span className="font-bold text-[#d7ff3f]">{order.order_number}</span>
          </div>
          <div className="flex justify-between py-1.5 text-sm">
            <span className="text-slate-500">নাম</span>
            <span className="font-semibold text-white">{order.customer_name}</span>
          </div>
          <div className="flex justify-between py-1.5 text-sm">
            <span className="text-slate-500">পেমেন্ট</span>
            <span className="text-white">{order.payment_method ? PAYMENT_METHOD_BN[order.payment_method] : "—"}</span>
          </div>
          <div className="divider-glow my-2" />
          {items.map((it, i) => (
            <div key={i} className="flex justify-between py-1.5 text-sm">
              <span className="text-slate-300">{it.product_name} <span className="text-slate-500">({it.plan_label_bn} × {it.qty})</span></span>
              <span className="font-semibold text-white">{formatBDT(it.price_bdt * it.qty)}</span>
            </div>
          ))}
          <div className="flex justify-between border-t border-white/10 pt-3 text-sm">
            <span className="font-bold text-slate-300">সর্বমোট</span>
            <span className="font-display text-xl font-bold text-[#d7ff3f]">{formatBDT(order.total_bdt)}</span>
          </div>
        </div>

        {waiting && (
          <p className="mt-4 text-xs text-slate-500">
            ℹ️ ম্যানুয়াল পেমেন্ট (বিকাশ/নগদ/রকেট) যাচাই করতে সাধারণত ৫–৩০ মিনিট লাগে।
          </p>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/dashboard" className="btn-vault">📦 আমার ডেলিভারি দেখুন</Link>
          <Link href="/shop" className="btn-ghost">আরও কিনুন</Link>
        </div>
      </div>
    </div>
  );
}
