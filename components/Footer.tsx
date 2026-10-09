"use client";

import SiteLogo from "@/components/SiteLogo";
import Link from "next/link";
import { useLang } from "@/lib/i18n";

export default function Footer() {
  const { t } = useLang();
  return (
    <footer className="relative mt-24 border-t border-white/5">
      <div className="divider-glow" />
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2.5">
            <SiteLogo className="h-10 w-10 rounded-xl" />
            <span className="font-display text-xl">
              <span className="font-bold text-white">Digi</span>
              <span className="font-bold text-[#d7ff3f]">Plyra</span>
            </span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
            {t("ft_tagline")}
          </p>
          <div className="mt-5 flex gap-2">
            <span className="chip">বিকাশ</span>
            <span className="chip">নগদ</span>
            <span className="chip">রকেট</span>
            <span className="chip">কার্ড</span>
          </div>
        </div>
        <div>
          <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-300">
            {t("ft_quick")}
          </h4>
          <ul className="space-y-2.5 text-sm text-slate-400">
            <li><Link href="/shop" className="hover:text-[#d7ff3f]">{t("ft_all_products")}</Link></li>
            <li><Link href="/dashboard" className="hover:text-[#d7ff3f]">{t("ft_my_orders")}</Link></li>
            <li><Link href="/auth/login" className="hover:text-[#d7ff3f]">{t("ft_login")}</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-300">
            {t("ft_help")}
          </h4>
          <ul className="space-y-2.5 text-sm text-slate-400">
            <li>{t("ft_delivery")}</li>
            <li>{t("ft_support")}</li>
            <li>{t("ft_payment")}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/5 py-6 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} DigiPlyra — {t("ft_rights")}
      </div>
    </footer>
  );
}
