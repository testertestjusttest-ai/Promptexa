"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLang } from "@/lib/i18n";
import { formatBDT, formatTk, toBnDigits } from "@/lib/format";
import WebDevHeroBg from "./WebDevHeroBg";
import DemoSlider from "./DemoSlider";
import { DEMOS } from "./demos/demos";

export default function WebDevClient() {
  const { lang, t } = useLang();
  const digits = (n: string | number) => (lang === "bn" ? toBnDigits(n) : String(n));
  const price = (n: number) => (lang === "bn" ? formatBDT(n) : formatTk(n));
  const withN = (k: "wdev_cta_demos" | "wdev_gal_p" | "wdev_gal_all", n: number) =>
    t(k).replace("{n}", digits(n));

  const PACKAGES = [
    {
      name: t("wdev_pkg_s"),
      price: 4999,
      desc: t("wdev_pkg_s_d"),
      features: [t("wdev_pkg_s_f1"), t("wdev_pkg_s_f2"), t("wdev_pkg_s_f3"), t("wdev_pkg_s_f4"), t("wdev_pkg_s_f5")],
    },
    {
      name: t("wdev_pkg_b"),
      price: 12999,
      desc: t("wdev_pkg_b_d"),
      features: [t("wdev_pkg_b_f1"), t("wdev_pkg_b_f2"), t("wdev_pkg_b_f3"), t("wdev_pkg_b_f4"), t("wdev_pkg_b_f5")],
      hot: true,
    },
    {
      name: t("wdev_pkg_p"),
      price: 29999,
      desc: t("wdev_pkg_p_d"),
      features: [t("wdev_pkg_p_f1"), t("wdev_pkg_p_f2"), t("wdev_pkg_p_f3"), t("wdev_pkg_p_f4"), t("wdev_pkg_p_f5")],
    },
  ];

  const SITE_TYPES = [
    t("wdev_type_biz"),
    t("wdev_type_shop"),
    t("wdev_type_port"),
    t("wdev_type_blog"),
    t("wdev_type_mkt"),
    t("wdev_type_other"),
  ];

  const TECH = [
    "⚡ Next.js",
    "🎨 Tailwind",
    "📱 PWA",
    "🔍 SEO",
    t("wdev_tech_pay"),
    t("wdev_tech_multi"),
    t("wdev_tech_sec"),
    t("wdev_tech_fast"),
  ];

  const ROTATE = [
    t("wdev_rot_web"),
    t("wdev_rot_shop"),
    t("wdev_rot_cas"),
    t("wdev_rot_cry"),
    t("wdev_rot_news"),
    t("wdev_rot_book"),
  ];

  const BUDGETS = [t("wdev_bud_u"), t("wdev_bud_5"), t("wdev_bud_15"), t("wdev_bud_30")];

  const PROCESS = [
    ["📝", t("wdev_step1_t"), t("wdev_step1_d")],
    ["📞", t("wdev_step2_t"), t("wdev_step2_d")],
    ["💰", t("wdev_step3_t"), t("wdev_step3_d")],
    ["🚀", t("wdev_step4_t"), t("wdev_step4_d")],
  ];

  const [wordIdx, setWordIdx] = useState(0);
  useEffect(() => { const t = setInterval(() => setWordIdx((i) => (i + 1) % ROTATE.length), 2400); return () => clearInterval(t); }, [ROTATE.length]);
  const [form, setForm] = useState({ name: "", phone: "", site_type: SITE_TYPES[0], features: "", budget_range: BUDGETS[1], details: "" });
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    if (!form.name.trim()) return setMsg(t("wdev_msg_name"));
    if (!/^01[3-9]\d{8}$/.test(form.phone.trim())) return setMsg(t("wdev_msg_phone"));
    setSending(true);
    try {
      const res = await fetch("/api/services/web-dev", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || t("wdev_msg_fail"));
      setMsg(t("wdev_msg_ok"));
      setForm({ name: "", phone: "", site_type: SITE_TYPES[0], features: "", budget_range: BUDGETS[1], details: "" });
    } catch (e) {
      setMsg(`⚠️ ${e instanceof Error ? e.message : t("wdev_msg_err")}`);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      {/* hero — 2026 split design with live demo preview */}
      <div className="relative overflow-hidden rounded-[36px] border border-white/10 bg-[#070b16] shadow-[0_0_120px_rgba(215,255,63,0.07)]">
        {/* mesh background */}
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <WebDevHeroBg />
          <div className="absolute inset-0 opacity-[0.16]" style={{ backgroundImage: "linear-gradient(#ffffff22 1px, transparent 1px), linear-gradient(90deg, #ffffff22 1px, transparent 1px)", backgroundSize: "44px 44px", maskImage: "radial-gradient(ellipse 90% 70% at 50% 0%, black 30%, transparent 75%)", WebkitMaskImage: "radial-gradient(ellipse 90% 70% at 50% 0%, black 30%, transparent 75%)" }} />
          <div className="absolute -left-24 top-1/3 h-72 w-72 rounded-full bg-[#d7ff3f]/10 blur-[100px]" />
          <div className="absolute -right-16 top-10 h-64 w-64 rounded-full bg-fuchsia-500/10 blur-[100px]" />
        </div>

        <div className="relative grid items-center gap-10 p-7 sm:p-10 lg:grid-cols-[1.05fr_0.95fr] lg:p-12 [&>*]:min-w-0">
          {/* left — copy */}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#d7ff3f] px-3.5 py-1.5 text-[11px] font-black text-black shadow-[0_6px_20px_rgba(215,255,63,0.35)]">
                <span className="relative flex h-2 w-2"><span className="absolute h-full w-full animate-ping rounded-full bg-black/50" /><span className="h-2 w-2 rounded-full bg-black" /></span>
                {t("wdev_live_badge")}
              </span>
              <span className="rounded-full border border-white/20 bg-white/5 px-3.5 py-1.5 text-[11px] font-bold text-slate-300 backdrop-blur">✨ {digits(100)}+ {t("wdev_projects_label")}</span>
            </div>
            <h1 className="font-display mt-5 text-[34px] font-black leading-[1.12] text-white sm:text-5xl lg:text-[54px]">
              {t("wdev_h1_a")}
              <br />
              <span key={wordIdx} className="dp-word-in inline-block bg-gradient-to-r from-lime-300 via-[#d7ff3f] to-emerald-300 bg-clip-text text-transparent">{ROTATE[wordIdx]}</span>
              <br />
              {t("wdev_h1_b")}
            </h1>
            <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-slate-300">
              {t("wdev_hero_p1")}<b className="text-white">{t("wdev_hero_bold")}</b>{t("wdev_hero_p2")}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#demos" className="btn-vault inline-flex !px-7 !py-3.5 text-sm shadow-[0_10px_32px_rgba(215,255,63,0.35)]">
                {withN("wdev_cta_demos", DEMOS.length)}
              </a>
              <a href="#quote" className="inline-flex items-center rounded-xl border border-white/25 bg-white/5 px-7 py-3.5 text-sm font-bold text-white backdrop-blur transition hover:border-[#d7ff3f]/60 hover:bg-white/10">
                {t("wdev_cta_quote")}
              </a>
            </div>
            {/* stats */}
            <div className="mt-8 grid max-w-md grid-cols-3 divide-x divide-white/10 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur">
              {[[`${digits(DEMOS.length)}+`, t("wdev_stat_demos")], [digits("30–60+"), t("wdev_stat_pages")], [digits("7–14"), t("wdev_stat_days")]].map(([v, t]) => (
                <div key={t} className="px-4 py-3 text-center">
                  <p className="font-display text-lg font-black text-white">{v}</p>
                  <p className="text-[10px] font-bold text-slate-400">{t}</p>
                </div>
              ))}
            </div>
          </div>

          {/* right — live preview */}
          <div className="relative mx-auto w-full max-w-[430px] lg:max-w-[470px]">
            <div className="absolute -inset-6 rounded-[40px] bg-gradient-to-tr from-[#d7ff3f]/15 via-transparent to-fuchsia-500/15 blur-2xl" aria-hidden />
            <Link href="/demobinancepro" className="group relative block overflow-hidden rounded-3xl border border-white/15 bg-[#0b1120] shadow-[0_30px_80px_rgba(0,0,0,0.6)] transition duration-500 hover:-translate-y-1.5 hover:rotate-[0.5deg]">
              <span className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded-full bg-red-500 px-2.5 py-1 text-[9px] font-black text-white shadow-lg"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" /> {t("wdev_live_demo")}</span>
              <div className="pointer-events-none relative max-h-[340px] overflow-hidden [&_*]:!cursor-default">
                {DEMOS[0].render()}
                <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-[#0b1120] via-[#0b1120]/55 to-transparent" aria-hidden />
              </div>
              <div className="flex items-center justify-between border-t border-white/10 px-4 py-3">
                <div>
                  <p className="text-sm font-black text-white">{DEMOS[0].name}</p>
                  <p className="text-[11px] text-slate-400">{DEMOS[0].type} • {digits(66)}+ {t("wdev_pages")}</p>
                </div>
                <span className="rounded-full bg-[#d7ff3f] px-3.5 py-1.5 text-[11px] font-black text-black">{t("wdev_open_demo")}</span>
              </div>
            </Link>
            {/* floating glass cards — kept INSIDE the preview frame */}
            <div className="animate-float-slow pointer-events-none absolute left-3 top-14 z-10 hidden rounded-2xl border border-white/15 bg-[#0d1424]/90 px-3.5 py-2.5 shadow-2xl backdrop-blur sm:block" style={{ ["--tilt" as any]: "-4deg" }}>
              <p className="text-[10px] font-bold text-slate-400">{t("wdev_new_order")}</p>
              <p className="text-sm font-black text-white">#{digits(1024)} • {price(1250)}</p>
            </div>
            <div className="animate-float-slow pointer-events-none absolute bottom-16 right-3 z-10 hidden rounded-2xl border border-white/15 bg-[#0d1424]/90 px-3.5 py-2.5 shadow-2xl backdrop-blur sm:block" style={{ ["--tilt" as any]: "4deg", animationDelay: "-2.5s" }}>
              <p className="text-[10px] font-bold text-slate-400">{t("wdev_today_sales")}</p>
              <p className="text-sm font-black text-emerald-300">+{digits(34)}% {t("wdev_growth_label")}</p>
            </div>
          </div>
        </div>

        {/* marquee */}
        <div className="relative border-t border-white/10 bg-black/30 py-3">
          <div className="pointer-events-none overflow-hidden" aria-hidden>
            <div className="animate-marquee-x flex w-max gap-8">
              {[...TECH, ...TECH].map((t, i) => (
                <span key={i} className="whitespace-nowrap text-xs font-bold text-slate-300">{t}</span>
              ))}
            </div>
          </div>
        </div>
        <style>{`@keyframes dp-word { 0% { opacity: 0; transform: translateY(14px) } 100% { opacity: 1; transform: translateY(0) } } .dp-word-in { animation: dp-word .45s ease both }`}</style>
      </div>

      {/* demo showcase slider */}
      <DemoSlider />

      {/* bento features */}
      <div className="mt-14">
        <p className="text-center text-[11px] font-black uppercase tracking-[0.3em] text-[#d7ff3f]">{t("wdev_why")}</p>
        <h2 className="font-display mt-2 text-center text-2xl font-bold text-white sm:text-3xl">{t("wdev_bento_h")}</h2>
        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* big admin card */}
          <div className="glass relative overflow-hidden rounded-3xl p-5 sm:col-span-2">
            <div className="pointer-events-none absolute -right-8 -top-8 text-[110px] opacity-10">⚙️</div>
            <p className="text-2xl">⚙️</p>
            <p className="mt-2 font-display text-lg font-bold text-white">{t("wdev_admin_t")}</p>
            <p className="mt-1 max-w-sm text-sm text-slate-400">{t("wdev_admin_d")}</p>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              {[[digits("12,450"), t("wdev_admin_s1")], [digits(34), t("wdev_admin_s2")], [digits("98%"), t("wdev_admin_s3")]].map(([v, t]) => (
                <div key={t} className="rounded-xl bg-white/5 px-2 py-2.5 ring-1 ring-white/10">
                  <p className="font-black text-[#d7ff3f]">{v}</p>
                  <p className="text-[9px] font-bold text-slate-400">{t}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="glass rounded-3xl p-5">
            <p className="text-2xl">💳</p>
            <p className="mt-2 font-display text-lg font-bold text-white">{t("wdev_pay_t")}</p>
            <p className="mt-1 text-sm text-slate-400">{t("wdev_pay_d")}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {[t("wdev_pay_bk"), t("wdev_pay_ng"), t("wdev_pay_rk"), t("wdev_pay_card")].map((m) => <span key={m} className="rounded-full bg-white/8 px-2.5 py-1 text-[11px] font-bold text-slate-200 ring-1 ring-white/15">{m}</span>)}
            </div>
          </div>
          <div className="glass rounded-3xl p-5">
            <p className="text-2xl">🌐</p>
            <p className="mt-2 font-display text-lg font-bold text-white">{t("wdev_dom_t")}</p>
            <p className="mt-1 text-sm text-slate-400">{t("wdev_dom_d")}</p>
          </div>
          <div className="glass rounded-3xl p-5">
            <p className="text-2xl">📢</p>
            <p className="mt-2 font-display text-lg font-bold text-white">{t("wdev_ads_t")}</p>
            <p className="mt-1 text-sm text-slate-400">{t("wdev_ads_d")}</p>
          </div>
          <div className="glass rounded-3xl p-5">
            <p className="text-2xl">🔍</p>
            <p className="mt-2 font-display text-lg font-bold text-white">{t("wdev_seo_t")}</p>
            <p className="mt-1 text-sm text-slate-400">{t("wdev_seo_d")}</p>
          </div>
          <div className="glass relative overflow-hidden rounded-3xl p-5 sm:col-span-2">
            <div className="pointer-events-none absolute -right-8 -top-8 text-[110px] opacity-10">🎰</div>
            <p className="text-2xl">🎰</p>
            <p className="mt-2 font-display text-lg font-bold text-white">{t("wdev_big_t")}</p>
            <p className="mt-1 max-w-sm text-sm text-slate-400">{t("wdev_big_d")}</p>
            <Link href="/democasinoplay" className="mt-3 inline-block rounded-full bg-[#d7ff3f]/15 px-4 py-1.5 text-xs font-black text-[#d7ff3f] ring-1 ring-[#d7ff3f]/40">{t("wdev_big_cta")}</Link>
          </div>
        </div>
      </div>

      {/* packages */}
      <h2 className="font-display mt-12 text-center text-2xl font-bold text-white">{t("wdev_pkg_h")}</h2>
      <div className="mt-6 grid gap-5 md:grid-cols-3">
        {PACKAGES.map((p) => (
          <div key={p.name} className={`glass rounded-3xl p-6 ${p.hot ? "ring-2 ring-[#d7ff3f]/60" : ""}`}>
            {p.hot && (
              <span className="mb-3 inline-block rounded-full bg-[#d7ff3f] px-3 py-1 text-xs font-bold text-black">
                {t("wdev_popular")}
              </span>
            )}
            <h3 className="font-display text-xl font-bold text-white">{p.name}</h3>
            <p className="mt-1 text-xs text-slate-500">{p.desc}</p>
            <p className="font-display mt-3 text-3xl font-bold text-[#d7ff3f]">{price(p.price)}</p>
            <p className="text-[11px] text-slate-500">{t("wdev_from")}</p>
            <ul className="mt-4 space-y-2">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-slate-300">
                  <span className="text-[#d7ff3f]">✓</span> {f}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* process */}
      <h2 className="font-display mt-12 text-center text-2xl font-bold text-white">{t("wdev_proc_h")}</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        {PROCESS.map(([icon, t, d], i) => (
          <div key={t} className="glass rounded-2xl p-5 text-center">
            <div className="text-3xl">{icon}</div>
            <p className="mt-2 text-sm font-bold text-white">
              {digits(i + 1)}. {t}
            </p>
            <p className="mt-1 text-xs text-slate-400">{d}</p>
          </div>
        ))}
      </div>

      {/* demo gallery */}
      <div id="demos" className="mt-14 scroll-mt-24">
        <h2 className="font-display text-center text-2xl font-bold text-white">{t("wdev_gal_h")}</h2>
        <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-slate-400">
          {withN("wdev_gal_p", DEMOS.length)}
        </p>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {DEMOS.slice(0, 9).map((d) => (
            <Link key={d.slug} href={`/demo${d.slug}`} className="tilt-card group block overflow-hidden rounded-3xl border border-white/10 bg-[#0b1120] transition hover:border-[#d7ff3f]/40">
              <div className="pointer-events-none relative max-h-[300px] overflow-hidden [&_*]:!cursor-default">
                {d.render()}
                <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[#0b1120] via-[#0b1120]/50 to-transparent" aria-hidden />
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-white">{d.name}</p>
                  <span className="rounded-full bg-[#d7ff3f]/15 px-2.5 py-1 text-[10px] font-bold text-[#d7ff3f]">{d.price}</span>
                </div>
                <p className="mt-1 text-xs text-slate-400">{d.type}</p>
                <p className="mt-1 line-clamp-1 text-xs text-slate-500">{d.desc}</p>
                <span className="mt-2.5 block rounded-xl bg-[#d7ff3f]/10 px-3 py-2 text-center text-xs font-black text-[#d7ff3f] ring-1 ring-[#d7ff3f]/30 transition group-hover:bg-[#d7ff3f]/20">
                  {t("wdev_gal_cta")}
                </span>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link href="/demos" className="btn-vault inline-flex !px-10 !py-3.5 text-base">
            {withN("wdev_gal_all", DEMOS.length)}
          </Link>
        </div>
      </div>

      {/* quote form */}
      <div id="quote" className="glass mt-12 scroll-mt-24 rounded-3xl p-6 sm:p-8">
        <h2 className="font-display text-2xl font-bold text-white">{t("wdev_q_h")}</h2>
        <p className="mt-1 text-sm text-slate-400">{t("wdev_q_sub")}</p>
        <form onSubmit={submit} className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm text-slate-300">{t("wdev_q_name")}</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="field" placeholder={t("wdev_q_name_ph")} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-slate-300">{t("wdev_q_phone")}</label>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="field" placeholder="01XXXXXXXXX" inputMode="numeric" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-slate-300">{t("wdev_q_type")}</label>
            <select value={form.site_type} onChange={(e) => setForm({ ...form, site_type: e.target.value })} className="field">
              {SITE_TYPES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-slate-300">{t("wdev_q_budget")}</label>
            <select value={form.budget_range} onChange={(e) => setForm({ ...form, budget_range: e.target.value })} className="field">
              {BUDGETS.map((b) => <option key={b}>{b}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm text-slate-300">{t("wdev_q_feat")}</label>
            <input value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} className="field" placeholder={t("wdev_q_feat_ph")} />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm text-slate-300">{t("wdev_q_det")}</label>
            <textarea value={form.details} onChange={(e) => setForm({ ...form, details: e.target.value })} className="field min-h-[100px]" placeholder={t("wdev_q_det_ph")} maxLength={2000} />
          </div>
          {msg && <p className="sm:col-span-2 rounded-xl bg-[#d7ff3f]/10 px-4 py-3 text-sm text-[#d7ff3f]">{msg}</p>}
          <button type="submit" disabled={sending} className="btn-vault sm:col-span-2 !py-3.5 text-base">
            {sending ? t("wdev_q_sending") : t("wdev_q_submit")}
          </button>
        </form>
      </div>
    </div>
  );
}
