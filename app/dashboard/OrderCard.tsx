"use client";

import { useState } from "react";
import { useLang } from "@/lib/i18n";
import {
  displayPrice,
  orderStatusLabel,
  paymentMethodLabel,
  timeAgo,
  translatePlanLabel,
} from "@/lib/format";
import { StatusBadge } from "@/components/Section";
import FileInstall from "@/components/FileInstall";
import type { DownloadToken } from "@/lib/types";

export type DashboardOrder = {
  id: string;
  order_number: string;
  status: string;
  payment_method: string | null;
  total_bdt: number;
  created_at: string;
  items: { product_name: string; plan_label_bn: string; price_bdt: number; qty: number }[];
  keys: { key_text: string; key_note: string | null; delivered_at: string }[];
  files: DownloadToken[];
};

export default function OrderCard({ order }: { order: DashboardOrder }) {
  const { t, lang } = useLang();
  const [copied, setCopied] = useState<string | null>(null);

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(text);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      /* clipboard unavailable */
    }
  }

  const delivered = order.status === "delivered";
  // Demo placeholder keys (seed data) must never show to customers —
  // they contain an admin instruction ("অ্যাডমিন প্যানেল থেকে আসল কী যোগ করুন").
  const realKeys = order.keys.filter((k) => !k.key_text.startsWith("DEMO-"));

  return (
    <div className="glass rounded-2xl p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-display font-bold text-[#d7ff3f]">{order.order_number}</p>
          <p className="text-xs text-slate-500">{timeAgo(order.created_at, lang)}</p>
        </div>
        <StatusBadge status={order.status} label={orderStatusLabel(order.status, lang)} />
      </div>

      <ul className="mt-4 space-y-1.5">
        {order.items.map((it, i) => (
          <li key={i} className="flex justify-between text-sm">
            <span className="text-slate-300">
              {it.product_name}{" "}
              <span className="text-slate-500">
                ({translatePlanLabel(it.plan_label_bn, lang)} × {it.qty})
              </span>
            </span>
            <span className="font-semibold text-white">
              {displayPrice(it.price_bdt * it.qty, lang)}
            </span>
          </li>
        ))}
      </ul>

      {delivered && realKeys.length > 0 && (
        <div className="mt-4 rounded-2xl border border-[#d7ff3f]/25 bg-[#d7ff3f]/[0.04] p-4">
          <p className="text-sm font-bold text-[#d7ff3f]">{t("db_delivery")}</p>
          <div className="mt-3 space-y-3">
            {realKeys.map((k, i) => (
              <div key={i} className="rounded-xl bg-black/40 p-3">
                <div className="flex items-start justify-between gap-2">
                  <code className="break-all font-mono text-sm text-white">{k.key_text}</code>
                  <button
                    onClick={() => copy(k.key_text)}
                    className="shrink-0 rounded-lg bg-[#d7ff3f]/15 px-3 py-1.5 text-xs font-bold text-[#d7ff3f] hover:bg-[#d7ff3f]/25"
                  >
                    {copied === k.key_text ? t("db_copied") : t("db_copy")}
                  </button>
                </div>
                {k.key_note && <p className="mt-1.5 text-xs text-slate-400">{k.key_note}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {(order.status === "delivered" || order.status === "paid" || order.status === "keys_pending") && order.files.length > 0 && (
        <FileInstall files={order.files} />
      )}

      {order.status === "keys_pending" && (
        <p className="mt-4 rounded-xl bg-violet-500/10 px-4 py-3 text-sm text-violet-300">
          {t("db_note_keys_pending")}
        </p>
      )}

      {order.status === "service_pending" && (
        <p className="mt-4 rounded-xl bg-[#8b5cf6]/10 px-4 py-3 text-sm text-violet-200">
          {t("db_note_service")}
        </p>
      )}
      {(order.status === "pending" || order.status === "payment_pending") && (
        <p className="mt-4 rounded-xl bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
          {t("db_note_pending")}
        </p>
      )}

      <div className="mt-4 flex justify-between border-t border-white/5 pt-3 text-sm">
        <span className="text-slate-500">
          {order.payment_method ? paymentMethodLabel(order.payment_method, lang) : ""}
        </span>
        <span className="font-display font-bold text-white">
          {t("db_total")} {displayPrice(order.total_bdt, lang)}
        </span>
      </div>
    </div>
  );
}
