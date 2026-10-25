"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart";
import type { Product } from "@/lib/types";
import { isSoldOut } from "@/lib/types";
import { formatBDT, formatUSD, toBnDigits, translatePlanLabel } from "@/lib/format";
import { useLang } from "@/lib/i18n";

export default function ProductBuy({ product }: { product: Product }) {
  const { lang, t } = useLang();
  /** Public price display: USD converted equivalent in EN/HI, Tk in BN. */
  const price = (bdt: number) => (lang === "bn" ? formatBDT(bdt) : formatUSD(bdt));
  const plans = product.plans ?? [];
  const [planId, setPlanId] = useState(
    plans.find((p) => p.is_popular)?.id ?? plans[0]?.id
  );
  const [qty, setQty] = useState(1);
  const { addItem, openCart } = useCart();
  const router = useRouter();

  /** Plan labels are admin-entered Bangla; translate for EN/HI views. */
  const planLabel = (label: string) => translatePlanLabel(label, lang);
  const durationText = (days: number) =>
    lang === "bn"
      ? `${toBnDigits(days)} দিনের অ্যাক্সেস`
      : lang === "hi"
        ? `${days} दिनों की एक्सेस`
        : `${days} days of access`;
  const digits = (n: number) => (lang === "bn" ? toBnDigits(n) : String(n));

  const plan = plans.find((p) => p.id === planId);
  if (!plan) return null;

  if (isSoldOut(product)) {
    return (
      <div className="glass rounded-3xl p-8 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-red-500/15 text-3xl">
          📦
        </div>
        <h3 className="mt-4 font-display text-xl font-bold text-white">{t("pp_soldout_t")}</h3>
        <p className="mt-2 text-sm text-slate-400">
          {t("pp_soldout_s")}
        </p>
      </div>
    );
  }

  const discount = plan.old_price_bdt
    ? Math.round((1 - plan.price_bdt / plan.old_price_bdt) * 100)
    : 0;

  const handleAdd = () => {
    addItem(product, plan, qty);
    openCart();
  };

  const handleBuyNow = () => {
    addItem(product, plan, qty);
    router.push("/checkout");
  };

  return (
    <div className="glass ring-conic rounded-3xl p-6 sm:p-8">
      <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
        {t("pp_select")}
      </p>
      <div className="mt-3 grid gap-3">
        {plans.map((p) => {
          const active = p.id === planId;
          return (
            <button
              key={p.id}
              onClick={() => setPlanId(p.id)}
              className={`relative flex items-center justify-between rounded-2xl border p-4 text-left transition ${
                active
                  ? "border-[#d7ff3f]/60 bg-[#d7ff3f]/5"
                  : "border-white/10 bg-white/[0.02] hover:border-white/25"
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`grid h-6 w-6 place-items-center rounded-full border text-xs ${
                    active
                      ? "border-[#d7ff3f] bg-[#d7ff3f] text-[#060913]"
                      : "border-slate-600 text-transparent"
                  }`}
                >
                  ✓
                </span>
                <div>
                  <p className="font-bold text-white">{planLabel(p.label_bn)}</p>
                  {p.duration_days ? (
                    <p className="text-xs text-slate-500">
                      {durationText(p.duration_days)}
                    </p>
                  ) : (
                    <p className="text-xs text-slate-500">{t("pp_lifetime")}</p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="font-display text-lg font-bold text-[#d7ff3f]">
                  {price(p.price_bdt)}
                </p>
                {p.old_price_bdt && p.old_price_bdt > p.price_bdt && (
                  <p className="price-strike text-xs">{price(p.old_price_bdt)}</p>
                )}
              </div>
              {p.is_popular && (
                <span className="absolute -top-2.5 right-4 rounded-full bg-[#d7ff3f] px-2.5 py-0.5 text-[10px] font-bold text-[#060913]">
                  {t("pp_popular")}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-400">{t("pp_qty")}</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="grid h-9 w-9 place-items-center rounded-lg bg-white/5 text-lg text-slate-200 hover:bg-white/10"
            >
              −
            </button>
            <span className="w-8 text-center font-display text-lg font-bold text-white">
              {digits(qty)}
            </span>
            <button
              onClick={() => setQty((q) => Math.min(9, q + 1))}
              className="grid h-9 w-9 place-items-center rounded-lg bg-white/5 text-lg text-slate-200 hover:bg-white/10"
            >
              +
            </button>
          </div>
        </div>
        {discount > 0 && (
          <span className="rounded-full bg-[#f43f5e]/15 px-3 py-1 text-sm font-bold text-[#fda4af]">
            {digits(discount)}% {t("pp_off")}
          </span>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
        <span className="text-slate-400">{t("pp_total")}</span>
        <span className="font-display text-3xl font-bold text-[#d7ff3f]">
          {price(plan.price_bdt * qty)}
        </span>
      </div>
      {lang !== "bn" && (
        <p className="mt-1 text-right text-xs text-slate-500">{t("pp_settle_note")}</p>
      )}

      {product.product_type === "service" && (
        <p className="rounded-xl bg-[#8b5cf6]/10 px-4 py-3 text-sm text-violet-200">
          🛠️ {t("pp_service_note")}
        </p>
      )}

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <button onClick={handleAdd} className="btn-ghost">
          {t("pp_add")}
        </button>
        <button onClick={handleBuyNow} className="btn-vault">
          {product.product_type === "service" ? t("pp_order") : t("pp_buy")}
        </button>
      </div>

      <div className="mt-5 space-y-2 text-xs text-slate-500">
        {product.product_type === "service" ? (
          <>
            <p>✓ {t("pp_svc_bullet1")}</p>
            <p>✓ {t("pp_svc_bullet2")}</p>
            <p>✓ {t("pp_svc_bullet3")}</p>
          </>
        ) : (
          <>
            <p>✓ {t("pp_bullet_delivery")}</p>
            <p>✓ {t("pp_bullet_pay")}</p>
            <p>✓ {t("pp_bullet_replace")}</p>
          </>
        )}
      </div>
    </div>
  );
}
