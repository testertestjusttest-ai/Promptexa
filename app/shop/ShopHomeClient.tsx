"use client";

import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { SectionHeading } from "@/components/Section";
import HeroSlider from "@/components/HeroSlider";
import AdSlot, { AdPopup } from "@/components/AdSlot";
import ReviewsSection from "@/components/ReviewsSection";
import { DEMOS } from "../web-dev/demos/demos";
import { useLang } from "@/lib/i18n";
import type { Category, Product, Slide } from "@/lib/types";

/** Plain ad-slot data computed server-side (lib/catalog is server-only). */
export type ShopAdSlot = { id: string; code: string };

/**
 * /shop homepage chrome — English by default, Bangla/Hindi via the
 * drawer/Settings language switch (same rule as CartDrawer/Footer).
 * Server data arrives as props; all chrome strings come from lib/i18n.
 * Product names, slide content and review texts stay as stored (admin/DB
 * content) — only the page chrome is language-aware here.
 */
export default function ShopHomeClient({
  showcase,
  categories,
  storeNotice,
  slides,
  topSlots,
  bottomSlots,
  popupSlots,
}: {
  showcase: Product[];
  categories: Category[];
  storeNotice: string;
  slides: Slide[];
  topSlots: ShopAdSlot[];
  bottomSlots: ShopAdSlot[];
  popupSlots: ShopAdSlot[];
}) {
  const { lang, t } = useLang();
  const payItems = [t("ft_pay_1"), t("ft_pay_2"), t("ft_pay_3"), t("ft_pay_4")].filter(Boolean);
  const notice = lang === "bn" ? storeNotice : t("shop_notice");

  return (
    <div>
      {/* ================= HERO SLIDER ================= */}
      <HeroSlider slides={slides} />

      {/* trust stats strip */}
      <section className="border-b border-white/5">
        <div className="mx-auto grid max-w-4xl grid-cols-3 gap-3 px-4 py-8 sm:px-6">
          {[
            ["⚡", t("shop_trust_1_big"), t("shop_trust_1_small")],
            ["🛡️", t("shop_trust_2_big"), t("shop_trust_2_small")],
            ["💬", t("shop_trust_3_big"), t("shop_trust_3_small")],
          ].map(([icon, big, small]) => (
            <div key={small} className="glass rounded-2xl px-3 py-4 text-center">
              <div className="text-2xl">{icon}</div>
              <div className="mt-1 font-display text-lg font-bold text-[#d7ff3f]">
                {big}
              </div>
              <div className="text-xs text-slate-400">{small}</div>
            </div>
          ))}
        </div>
      </section>

      {topSlots.map((slot) => (
        <div key={slot.id} className="py-6">
          <AdSlot code={slot.code} />
        </div>
      ))}

      {/* ================= PAYMENT STRIP ================= */}
      <section className="border-y border-white/5 bg-white/[0.02]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-8 gap-y-3 px-4 py-5 sm:px-6">
          <span className="text-sm text-slate-500">{t("shop_pay_label")}</span>
          {payItems.map((p) => (
            <span key={p} className="text-sm font-semibold text-slate-300">✓ {p}</span>
          ))}
        </div>
      </section>

      {/* ================= FEATURED ================= */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <SectionHeading
          kicker={t("shop_feat_kicker")}
          title={t("shop_feat_title")}
          sub={t("shop_feat_sub")}
        />
        {showcase.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {showcase.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <EmptyCatalog />
        )}
        <div className="mt-10 text-center">
          <Link href="/shop/catalog" className="btn-ghost">
            {t("shop_all_products")}
          </Link>
        </div>
      </section>

      {/* ================= CATEGORIES ================= */}
      {categories.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <SectionHeading kicker={t("shop_cat_kicker")} title={t("shop_cat_title")} />
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/shop/catalog?cat=${c.slug}`}
                className="glass card-hover rounded-2xl p-6 text-center"
              >
                <div className="text-4xl">{c.icon}</div>
                <div className="mt-3 font-bold text-white">
                  {lang === "bn" ? c.name_bn : c.name_en || c.name_bn}
                </div>
                {lang === "bn" && c.name_en && (
                  <div className="text-xs text-slate-500">{c.name_en}</div>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ================= WEB DEV DEMOS ================= */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <SectionHeading
          kicker={t("shop_demo_kicker")}
          title={t("shop_demo_title")}
          sub={t("shop_demo_sub")}
        />
        <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-4 sm:overflow-visible sm:px-0">
          {DEMOS.slice(0, 4).map((d) => (
            <Link
              key={d.slug}
              href={`/demo${d.slug}`}
              className="tilt-card w-64 shrink-0 snap-start overflow-hidden rounded-2xl border border-white/10 bg-[#0b1120] transition hover:border-[#d7ff3f]/40 sm:w-auto"
            >
              <div className="pointer-events-none max-h-[220px] overflow-hidden">
                {d.render()}
              </div>
              <div className="p-3">
                <p className="text-sm font-bold text-white">{d.name}</p>
                <p className="text-[11px] text-slate-500">{d.type}</p>
                <p className="mt-1.5 text-[11px] font-bold text-[#d7ff3f]">{t("shop_demo_click")}</p>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link href="/demos" className="btn-ghost">
            {t("shop_demo_all")}
          </Link>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section id="how" className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <SectionHeading
          kicker={t("shop_how_kicker")}
          title={t("shop_how_title")}
        />
        <div className="grid gap-5 md:grid-cols-3">
          {[
            ["🛒", t("shop_step1_t"), t("shop_step1_d")],
            ["💳", t("shop_step2_t"), t("shop_step2_d")],
            ["⚡", t("shop_step3_t"), t("shop_step3_d")],
          ].map(([icon, title, desc], i) => (
            <div key={title} className="glass ring-conic relative rounded-2xl p-7">
              <span className="absolute right-5 top-5 font-display text-5xl font-bold text-white/5">
                {i + 1}
              </span>
              <div className="text-4xl">{icon}</div>
              <h3 className="mt-4 font-display text-xl font-bold text-white">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{desc}</p>
            </div>
          ))}
        </div>
        <p className="mx-auto mt-8 max-w-xl text-center text-sm text-slate-500">
          ℹ️ {notice}
        </p>
      </section>

      {/* ================= TESTIMONIALS ================= */}
      <section className="border-y border-white/5 bg-white/[0.02]">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <SectionHeading kicker={t("shop_rev_kicker")} title={t("shop_rev_title")} />
          <ReviewsSection />
        </div>
      </section>

      {/* ================= FAQ ================= */}
      <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
        <SectionHeading kicker={t("shop_faq_kicker")} title={t("shop_faq_title")} />
        <div className="space-y-3">
          {[
            [t("shop_faq1_q"), t("shop_faq1_a")],
            [t("shop_faq2_q"), t("shop_faq2_a")],
            [t("shop_faq3_q"), t("shop_faq3_a")],
            [t("shop_faq4_q"), t("shop_faq4_a")],
          ].map(([q, a]) => (
            <details key={q} className="glass group rounded-xl px-5 py-4">
              <summary className="cursor-pointer font-semibold text-white marker:text-[#d7ff3f]">
                {q}
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{a}</p>
            </details>
          ))}
        </div>
      </section>

      {bottomSlots.map((slot) => (
        <div key={slot.id} className="py-6">
          <AdSlot code={slot.code} />
        </div>
      ))}

      {/* ================= CTA ================= */}
      <section className="mx-auto max-w-7xl px-4 pb-4 sm:px-6">
        <div className="glass ring-conic relative overflow-hidden rounded-3xl px-6 py-14 text-center sm:px-12">
          <div className="dot-grid absolute inset-0 opacity-60" />
          <div className="relative">
            <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
              {t("shop_cta_a")} <span className="text-[#d7ff3f]">{t("shop_cta_b")}</span>
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-slate-400">
              {t("shop_cta_sub")}
            </p>
            <Link href="/shop/catalog" className="btn-vault mt-8 text-base">
              {t("shop_cta_btn")}
            </Link>
          </div>
        </div>
      </section>

      {popupSlots.map((slot) => (
        <AdPopup key={slot.id} code={slot.code} />
      ))}
    </div>
  );
}

function EmptyCatalog() {
  const { t } = useLang();
  return (
    <div className="glass mx-auto max-w-lg rounded-2xl p-10 text-center">
      <div className="text-5xl">📦</div>
      <p className="mt-4 font-bold text-white">{t("shop_empty_t")}</p>
      <p className="mt-2 text-sm text-slate-400">{t("shop_empty_s")}</p>
    </div>
  );
}
