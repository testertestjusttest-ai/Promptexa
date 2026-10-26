"use client";

import Link from "next/link";
import { useLang } from "@/lib/i18n";
import { displayPrice } from "@/lib/format";
import OrderCard, { type DashboardOrder } from "./OrderCard";

export default function DashboardChrome({
  isAdmin,
  walletBalance,
  referralCode,
  orders,
}: {
  isAdmin: boolean;
  walletBalance: number;
  referralCode: string | null;
  orders: DashboardOrder[];
}) {
  const { t, lang } = useLang();

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">{t("db_welcome")}</p>
          <h1 className="font-display text-3xl font-bold text-white">{t("db_title")}</h1>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <Link href="/admin" className="btn-ghost !py-2.5 text-sm">
              {t("db_admin")}
            </Link>
          )}
          <form action="/auth/signout" method="post">
            <button type="submit" className="btn-ghost !py-2.5 text-sm">
              {t("db_logout")}
            </button>
          </form>
        </div>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <Link href="/earn" className="glass card-hover rounded-2xl p-5">
          <p className="text-xs uppercase tracking-wide text-slate-500">{t("db_wallet")}</p>
          <p className="font-display mt-1 text-3xl font-bold text-[#d7ff3f]">
            {displayPrice(walletBalance, lang)}
          </p>
          <p className="mt-1 text-xs text-slate-500">{t("db_wallet_sub")}</p>
        </Link>
        <div className="glass rounded-2xl p-5">
          <p className="text-xs uppercase tracking-wide text-slate-500">{t("db_referral")}</p>
          <p className="font-display mt-1 font-mono text-2xl font-bold text-white">
            {referralCode ?? "—"}
          </p>
          <Link href="/earn" className="mt-1 inline-block text-xs font-bold text-[#d7ff3f]">
            {t("db_referral_cta")}
          </Link>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="glass mx-auto max-w-md rounded-2xl p-10 text-center">
          <div className="text-5xl">📭</div>
          <p className="mt-4 font-bold text-white">{t("db_empty_title")}</p>
          <p className="mt-1 text-sm text-slate-400">{t("db_empty_sub")}</p>
          <Link href="/shop" className="btn-vault mt-6 inline-flex text-sm">
            {t("db_empty_cta")}
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {orders.map((o) => (
            <OrderCard key={o.id} order={o} />
          ))}
        </div>
      )}
    </div>
  );
}
