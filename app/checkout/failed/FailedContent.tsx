"use client";

import Link from "next/link";
import { useLang } from "@/lib/i18n";

/** Client wrapper so the failed-payment page follows the drawer language
 *  (the page itself stays a server component). */
export default function FailedContent({ order }: { order?: string }) {
  const { t } = useLang();
  return (
    <div className="glass mx-auto max-w-lg rounded-3xl p-10 text-center">
      <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-red-500/15 text-4xl">
        ❌
      </div>
      <h1 className="mt-5 font-display text-2xl font-bold text-white">
        {t("co_fail_title")}
      </h1>
      <p className="mt-2 text-sm text-slate-400">
        {t("co_fail_sub")}
      </p>
      {order && (
        <p className="mt-4 text-sm text-slate-500">
          {t("co_fail_order_no")} <span className="font-bold text-white">{order}</span>
        </p>
      )}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link href="/checkout" className="btn-vault">{t("co_fail_retry")}</Link>
        <Link href="/shop" className="btn-ghost">{t("co_fail_shop")}</Link>
      </div>
    </div>
  );
}
