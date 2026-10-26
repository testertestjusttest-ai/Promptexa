"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatBDT, formatUSD, formatTk, paymentMethodLabel, timeAgo, translatePlanLabel } from "@/lib/format";
import { useLang } from "@/lib/i18n";
import { StatusBadge } from "@/components/Section";

/** Order-status label per language (admin-entered statuses are English keys;
 *  BN view keeps the established Bangla wording). */
function statusLabel(status: string, lang: string): string {
  if (lang === "bn") {
    const BN: Record<string, string> = {
      pending: "অপেক্ষমাণ",
      payment_pending: "পেমেন্ট প্রক্রিয়াধীন",
      paid: "পেমেন্ট সম্পন্ন",
      delivered: "ডেলিভারি সম্পন্ন",
      keys_pending: "কী প্রস্তুত হচ্ছে",
      service_pending: "সার্ভিস অর্ডার",
      cancelled: "বাতিল",
      refunded: "রিফান্ডেড",
    };
    return BN[status] ?? status;
  }
  const EN: Record<string, string> = {
    pending: "Pending",
    payment_pending: "Payment processing",
    paid: "Payment complete",
    delivered: "Delivered",
    keys_pending: "Key being prepared",
    service_pending: "Service order",
    cancelled: "Cancelled",
    refunded: "Refunded",
  };
  const HI: Record<string, string> = {
    pending: "लंबित",
    payment_pending: "भुगतान प्रक्रिया में",
    paid: "भुगतान पूरा",
    delivered: "डिलीवर हो गया",
    keys_pending: "की तैयार हो रही है",
    service_pending: "सेवा ऑर्डर",
    cancelled: "रद्द",
    refunded: "रिफंड",
  };
  return (lang === "hi" ? HI : EN)[status] ?? status;
}

/** Shown by the success page when no order number is in the URL. */
export function SuccessEmpty() {
  const { t } = useLang();
  return <p className="text-center text-slate-400">{t("co_succ_empty")}</p>;
}

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
  const { lang, t } = useLang();
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
    return <p className="py-10 text-center text-slate-400">{t("co_succ_loading")}</p>;
  }
  if (!order) {
    return <p className="py-10 text-center text-slate-400">{t("co_succ_notfound")}</p>;
  }

  const done = order.status === "delivered";
  const waiting = ["pending", "payment_pending", "paid", "keys_pending"].includes(order.status);
  /** Public price display: USD converted equivalent in EN/HI, Tk in BN —
   *  same rule as the cart/checkout (BD settlement stays in Tk). */
  const price = (bdt: number) => (lang === "bn" ? formatBDT(bdt) : formatUSD(bdt));

  return (
    <div className="mx-auto max-w-2xl">
      <div className="glass ring-conic rounded-3xl p-8 text-center sm:p-10">
        <div className={`mx-auto grid h-20 w-20 place-items-center rounded-full text-4xl ${done ? "bg-[#d7ff3f]/15" : "bg-amber-400/15"}`}>
          {done ? "🎉" : "⏳"}
        </div>
        <h1 className="mt-5 font-display text-3xl font-bold text-white">
          {done ? t("co_succ_done") : t("co_succ_received")}
        </h1>
        <p className="mt-2 text-slate-400">
          {done ? t("co_succ_done_sub") : t("co_succ_wait_sub")}
        </p>

        <div className="mt-6 flex items-center justify-center gap-3">
          <StatusBadge status={order.status} label={statusLabel(order.status, lang)} />
          <span className="text-sm text-slate-500">{timeAgo(order.created_at, lang)}</span>
        </div>

        <div className="mt-6 rounded-2xl bg-white/[0.03] p-5 text-left">
          <div className="flex justify-between py-1.5 text-sm">
            <span className="text-slate-500">{t("co_succ_order_no")}</span>
            <span className="font-bold text-[#d7ff3f]">{order.order_number}</span>
          </div>
          <div className="flex justify-between py-1.5 text-sm">
            <span className="text-slate-500">{t("co_succ_name")}</span>
            <span className="font-semibold text-white">{order.customer_name}</span>
          </div>
          <div className="flex justify-between py-1.5 text-sm">
            <span className="text-slate-500">{t("co_succ_payment")}</span>
            <span className="text-white">{order.payment_method ? paymentMethodLabel(order.payment_method, lang) : "—"}</span>
          </div>
          <div className="divider-glow my-2" />
          {items.map((it, i) => (
            <div key={i} className="flex justify-between py-1.5 text-sm">
              <span className="text-slate-300">{it.product_name} <span className="text-slate-500">({translatePlanLabel(it.plan_label_bn, lang)} × {it.qty})</span></span>
              <span className="font-semibold text-white">{price(it.price_bdt * it.qty)}</span>
            </div>
          ))}
          <div className="flex justify-between border-t border-white/10 pt-3 text-sm">
            <span className="font-bold text-slate-300">{t("co_succ_total")}</span>
            <span className="font-display text-xl font-bold text-[#d7ff3f]">{price(order.total_bdt)}</span>
          </div>
          {lang !== "bn" && (
            <p className="mt-1 text-right text-xs text-slate-500">{t("pp_settle_note")} ({formatTk(order.total_bdt)})</p>
          )}
        </div>

        {waiting && (
          <p className="mt-4 text-xs text-slate-500">
            {t("co_succ_manual_note")}
          </p>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/dashboard" className="btn-vault">{t("co_succ_dashboard")}</Link>
          <Link href="/shop" className="btn-ghost">{t("co_succ_shop")}</Link>
        </div>
      </div>
    </div>
  );
}
