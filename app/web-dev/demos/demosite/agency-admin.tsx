"use client";

/**
 * Extended demo admin — Phase 1 + Phase 2, for agency-reworked demos only.
 *
 * It renders the standard DemoAdmin (theme, accent, dark mode, site info,
 * handover kit) PLUS:
 * 1. Products / Services / Gallery CRUD — add, rename, reprice and delete.
 *    Edits persist browser-locally (store.custom.customProducts /
 *    customServices / customGallery) and the live site updates immediately
 *    through the store's liveDef merge, so a visitor can try their own
 *    catalogue and see it on the demo at once. "Restore originals" drops
 *    the override.
 * 2. Live order / booking counts AND status management (Phase 2) via the
 *    store's updateOrderStatus / updateBookingStatus APIs.
 * 3. A Settings card (Phase 2) with the demo language switch — the only
 *    language switch inside a demo admin (drawer + Settings only, never a
 *    header pill).
 *
 * 4. Team manager + testimonials moderation (Phase 3): staff/team CRUD and
 *    testimonial add/approve/hide, stored browser-locally in store.custom and
 *    rendered on the demo's About page (approved testimonials only).
 *    Both start empty — no fake staff or reviews are seeded.
 *
 * Still to come (Phase 4+): banners/sliders, pages manager,
 * full per-demo Settings (hours, contact, payment methods), service-category
 * filtering (services carry no category field yet).
 */

import { useState, useEffect } from "react";
import Link from "next/link";
import { useDemo, ORDER_STATUSES, BOOKING_STATUSES } from "./store";
import { CEX_COINS } from "./cex-shared";
import { DemoLangSwitcher } from "./demo-lang";
import { DemoAdmin } from "./demo-admin";
import { Page, SectionTitle, Back } from "./ui";

export function AgencyDemoAdmin() {
  const { def, base, store } = useDemo();
  const isShop = def.layout === "shop";
  // Booking demos store their catalogue as products (engine mapping), so the
  // admin must treat booking like shop for catalogue CRUD, not services.
  const isCatalogue = isShop || def.layout === "booking";
  const isGallery = def.layout === "gallery";
  const items = isCatalogue
    ? store.custom.customProducts ?? def.products
    : isGallery
      ? store.custom.customGallery ?? def.gallery
      : store.custom.customServices ?? def.services;
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [emoji, setEmoji] = useState(isShop ? "🍰" : "💅");
  const [cat, setCat] = useState(def.cats[1] ?? def.cats[0] ?? "All");
  const [duration, setDuration] = useState("60 min");
  const [msg, setMsg] = useState("");
  const [teamName, setTeamName] = useState("");
  const [teamRole, setTeamRole] = useState("");
  const [teamNote, setTeamNote] = useState("");
  const [testiName, setTestiName] = useState("");
  const [testiText, setTestiText] = useState("");
  const isFintech = ["invest", "exchange", "wallet", "news"].includes(def.layout);
  // Phase 4 managers: banners, announcement, pages, fintech catalogues.
  const [bannerTitle, setBannerTitle] = useState("");
  const [bannerSub, setBannerSub] = useState("");
  const [bannerEmoji, setBannerEmoji] = useState("🎉");
  const [announcement, setAnnouncement] = useState("");
  const [aboutText, setAboutText] = useState("");
  const [svcCat, setSvcCat] = useState("");
  const [planMax, setPlanMax] = useState("");
  const [planRoi, setPlanRoi] = useState("");
  const [planDaily, setPlanDaily] = useState("");
  const [planDuration, setPlanDuration] = useState("");
  const [planTag, setPlanTag] = useState("");
  const [rateCode, setRateCode] = useState("");
  const [rateBuy, setRateBuy] = useState("");
  const [rateSell, setRateSell] = useState("");
  const [coinCode, setCoinCode] = useState("");
  const [newsBody, setNewsBody] = useState("");
  useEffect(() => { setAnnouncement(store.custom.customAnnouncement ?? ""); }, [store.custom.customAnnouncement]);
  useEffect(() => { setAboutText(store.custom.customAbout ?? def.about); }, [store.custom.customAbout, def.about]);


  const addTeam = () => {
    const n = teamName.trim();
    if (!n) return setMsg("Enter a team member name first.");
    const next = [...(store.custom.customTeam ?? []), { id: `t${Date.now()}`, name: n, role: teamRole.trim(), note: teamNote.trim() }];
    store.saveCustom({ customTeam: next });
    setTeamName(""); setTeamRole(""); setTeamNote(""); setMsg("Team member added — it is live on the About page now.");
  };
  const removeTeam = (id: string) => {
    store.saveCustom({ customTeam: (store.custom.customTeam ?? []).filter((x) => x.id !== id) });
  };
  const addTesti = () => {
    const n = testiName.trim(); const t = testiText.trim();
    if (!n || !t) return setMsg("Enter a name and a testimonial first.");
    const next = [...(store.custom.customTestimonials ?? []), { id: `r${Date.now()}`, name: n, text: t, approved: false }];
    store.saveCustom({ customTestimonials: next });
    setTestiName(""); setTestiText(""); setMsg("Testimonial added — approve it below to show it on the About page.");
  };
  const toggleTesti = (id: string) => {
    store.saveCustom({ customTestimonials: (store.custom.customTestimonials ?? []).map((x) => (x.id === id ? { ...x, approved: !x.approved } : x)) });
  };
  const removeTesti = (id: string) => {
    store.saveCustom({ customTestimonials: (store.custom.customTestimonials ?? []).filter((x) => x.id !== id) });
  };

  const card = "rounded-2xl border border-slate-200 bg-white p-5";

  const addItem = () => {
    const n = name.trim();
    if (!n) return setMsg("Enter a name first.");
    if (isGallery) {
      const next = [...(store.custom.customGallery ?? def.gallery), {
        id: `g${Date.now()}`, e: emoji.trim() || "🖼️", t: n, c: cat,
      }];
      store.saveCustom({ customGallery: next });
      setName(""); setMsg("Added — it is live on the demo now.");
      return;
    }
    const p = Number(price);
    if (!Number.isFinite(p) || p < 0) return setMsg("Enter a valid price (Tk).");
    if (isCatalogue) {
      const next = [...(store.custom.customProducts ?? def.products), {
        id: `p${Date.now()}`, n, p, e: emoji.trim() || "📦", c: cat,
        desc: `${n} — added from the demo admin. Edit or delete it anytime.`,
        rating: 4.5, reviews: 0, stock: 20,
      }];
      store.saveCustom({ customProducts: next });
    } else {
      const next = [...(store.custom.customServices ?? def.services), {
        id: `s${Date.now()}`, n, p, e: emoji.trim() || "✨",
        desc: `${n} — added from the demo admin. Edit or delete it anytime.`,
        duration, rating: 4.5, c: svcCat.trim() || undefined,
      }];
      store.saveCustom({ customServices: next });
    }
    setName(""); setPrice(""); setMsg("Added — it is live on the demo now.");
  };

  const removeItem = (id: string) => {
    if (isCatalogue) {
      store.saveCustom({ customProducts: (store.custom.customProducts ?? def.products).filter((x) => x.id !== id) });
    } else if (isGallery) {
      store.saveCustom({ customGallery: (store.custom.customGallery ?? def.gallery).filter((x) => x.id !== id) });
    } else {
      store.saveCustom({ customServices: (store.custom.customServices ?? def.services).filter((x) => x.id !== id) });
    }
  };

  const reprice = (id: string, value: string) => {
    const p = Number(value);
    if (!Number.isFinite(p) || p < 0) return;
    if (isCatalogue) {
      store.saveCustom({ customProducts: (store.custom.customProducts ?? def.products).map((x) => (x.id === id ? { ...x, p } : x)) });
    } else {
      store.saveCustom({ customServices: (store.custom.customServices ?? def.services).map((x) => (x.id === id ? { ...x, p } : x)) });
    }
  };

  const restore = () => {
    store.saveCustom({ customProducts: undefined, customServices: undefined, customGallery: undefined, customBanners: undefined, customAnnouncement: undefined, customAbout: undefined });
    setMsg("Original catalogue, banners, announcement and About text restored.");
  };

  // Phase 4 handlers: banners, announcement, pages, fintech catalogues.
  const addBanner = () => {
    const title = bannerTitle.trim();
    if (!title) return setMsg("Enter a banner title first.");
    store.saveCustom({ customBanners: [...(store.custom.customBanners ?? []), { id: `b${Date.now()}`, title, sub: bannerSub.trim(), emoji: bannerEmoji.trim() || "🎉" }] });
    setBannerTitle(""); setBannerSub(""); setMsg("Banner added — it is live as an extra hero slide on the demo home.");
  };
  const removeBanner = (id: string) => {
    store.saveCustom({ customBanners: (store.custom.customBanners ?? []).filter((b) => b.id !== id) });
  };
  const saveAnnouncement = () => {
    store.saveCustom({ customAnnouncement: announcement.trim() || undefined });
    setMsg(announcement.trim() ? "Announcement saved — it shows as a strip above the demo." : "Announcement cleared.");
  };
  const saveAbout = () => {
    const v = aboutText.trim();
    store.saveCustom({ customAbout: v && v !== def.about ? v : undefined });
    setMsg("About text saved — it is live on the demo's About page.");
  };
  const addPlan = () => {
    const n = name.trim(); const mx = Number(planMax); const roi = Number(planRoi); const dr = Number(planDaily);
    const mn = Number(price);
    if (!n || !Number.isFinite(mn) || !Number.isFinite(mx) || !Number.isFinite(roi) || !Number.isFinite(dr)) return setMsg("Enter a plan name, min, max, ROI and daily ROI.");
    const next = [...(store.custom.customInvestPlans ?? def.investPlans ?? []), { id: `pl${Date.now()}`, n, e: emoji.trim() || "📈", min: mn, max: mx, roi, dailyRoi: dr, duration: planDuration.trim() || "30 days", desc: `${n} — added from the demo admin.`, tag: planTag.trim() || undefined }];
    store.saveCustom({ customInvestPlans: next });
    setName(""); setPrice(""); setPlanMax(""); setPlanRoi(""); setPlanDaily(""); setPlanDuration(""); setPlanTag(""); setMsg("Plan added — it is live on the demo now.");
  };
  const removePlan = (id: string) => {
    store.saveCustom({ customInvestPlans: (store.custom.customInvestPlans ?? def.investPlans ?? []).filter((x) => x.id !== id) });
  };
  const editRate = (code: string, field: "buy" | "sell", value: string) => {
    const v = Number(value);
    if (!Number.isFinite(v) || v < 0) return;
    store.saveCustom({ customRates: (store.custom.customRates ?? def.rates ?? []).map((r) => (r.code === code ? { ...r, [field]: v } : r)) });
  };
  const addRate = () => {
    const code = rateCode.trim().toUpperCase(); const buy = Number(rateBuy); const sell = Number(rateSell);
    if (!code || !name.trim() || !Number.isFinite(buy) || !Number.isFinite(sell)) return setMsg("Enter a code, name, buy and sell rate.");
    store.saveCustom({ customRates: [...(store.custom.customRates ?? def.rates ?? []), { code, name: name.trim(), buy, sell, e: emoji.trim() || "💱", change: 0 }] });
    setRateCode(""); setName(""); setRateBuy(""); setRateSell(""); setMsg("Rate added — it is live on the demo now.");
  };
  const removeRate = (code: string) => {
    store.saveCustom({ customRates: (store.custom.customRates ?? def.rates ?? []).filter((r) => r.code !== code) });
  };
  const editCoin = (code: string, value: string) => {
    const v = Number(value);
    if (!Number.isFinite(v) || v < 0) return;
    store.saveCustom({ customCoins: (store.custom.customCoins ?? def.coins ?? []).map((c) => (c.code === code ? { ...c, price: v } : c)) });
  };
  const addCoin = () => {
    const code = coinCode.trim().toUpperCase(); const pr = Number(price);
    if (!code || !name.trim() || !Number.isFinite(pr)) return setMsg("Enter a code, name and price.");
    store.saveCustom({ customCoins: [...(store.custom.customCoins ?? def.coins ?? []), { code, name: name.trim(), price: pr, change: 0, e: emoji.trim() || "🪙" }] });
    setCoinCode(""); setName(""); setPrice(""); setMsg("Coin added — it is live on the demo now.");
  };
  const removeCoin = (code: string) => {
    store.saveCustom({ customCoins: (store.custom.customCoins ?? def.coins ?? []).filter((c) => c.code !== code) });
  };
  const addNewsItem = () => {
    const title = name.trim();
    if (!title || !newsBody.trim()) return setMsg("Enter a headline and a body first.");
    const next = [...(store.custom.customNews ?? def.news), { id: `n${Date.now()}`, t: title, e: emoji.trim() || "📰", c: cat, time: "Just now", body: newsBody.trim() }];
    store.saveCustom({ customNews: next });
    setName(""); setNewsBody(""); setMsg("Article added — it is live on the demo now.");
  };
  const removeNewsItem = (id: string) => {
    store.saveCustom({ customNews: (store.custom.customNews ?? def.news).filter((x) => x.id !== id) });
  };

  return (
    <Page>
      <Back href={base} label="Back to site" />
      <SectionTitle t="⚙️ Demo Admin" sub={`${def.name} — full demo control (extended)`} />

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {[
          ["🛒", "Orders", store.orders.length],
          ["📅", "Bookings", store.bookings.length],
          [isShop ? "🍰" : isGallery ? "🖼️" : def.layout === "booking" ? "📅" : "💅", isShop ? "Products" : isGallery ? "Gallery items" : def.layout === "booking" ? "Packages" : "Services", items.length],
          ["👛", "Wallet top-ups", store.deposits.length],
          ["💱", "Exchanges", store.exchanges.length],
          ["🎁", "Signup bonus", 5000],
          ["👥", "Team members", (store.custom.customTeam ?? []).length],
          ["⭐", "Approved reviews", (store.custom.customTestimonials ?? []).filter((x) => x.approved).length],
        ].map(([e, t, v]) => (
          <div key={t as string} className={`${card} p-3 text-center`}>
            <p className="text-xl">{e}</p>
            <p className="mt-1 text-lg font-black">{String(v)}</p>
            <p className="text-[10px] text-slate-500">{t}</p>
          </div>
        ))}
      </div>

      {!isFintech && (<div className={`${card} mt-4`}>
        <p className="text-sm font-black">
          {isShop ? "🍰 Products — add, reprice, delete" : isGallery ? "🖼️ Gallery — add, delete" : def.layout === "booking" ? "📅 Packages — add, reprice, delete" : "💅 Services — add, reprice, delete"}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Changes apply live to this demo and stay in this browser only. This is the
          visitor light-edit: try your own catalogue, then ask us to build it for real.
        </p>
        <div className="mt-4 space-y-2">
          {items.map((it: any) => (
            <div key={it.id} className="flex flex-wrap items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 ring-1 ring-slate-100">
              <span className="text-xl">{it.e}</span>
              <span className="min-w-0 flex-1 text-sm font-bold">{isGallery ? it.t : it.n}</span>
              {def.layout === "service" && <span className="text-xs text-slate-500">{it.duration}</span>}
              {!isGallery && (
                <label className="flex items-center gap-1 text-xs text-slate-500">
                  Tk
                  <input
                    type="number"
                    defaultValue={it.p}
                    onBlur={(e) => reprice(it.id, e.target.value)}
                    className="w-20 rounded-lg border border-slate-200 px-2 py-1.5 text-sm font-bold text-slate-800 outline-none"
                  />
                </label>
              )}
              <button onClick={() => removeItem(it.id)} className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 ring-1 ring-red-100 transition hover:bg-red-100">
                Delete
              </button>
            </div>
          ))}
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder={isCatalogue ? "New product / package name" : isGallery ? "New gallery item title" : "New service name"} className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none" />
          {!isGallery && <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Price (Tk)" inputMode="numeric" className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none" />}
          <input value={emoji} onChange={(e) => setEmoji(e.target.value)} placeholder="Emoji" className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none" />
          {isGallery ? (
            <select value={cat} onChange={(e) => setCat(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none">
              {def.cats.filter((c) => c !== "All").map((c) => <option key={c}>{c}</option>)}
            </select>
          ) : isCatalogue ? (
            <select value={cat} onChange={(e) => setCat(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none">
              {def.cats.filter((c) => c !== "All").map((c) => <option key={c}>{c}</option>)}
            </select>
          ) : (
            <>
              <input value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="Duration (e.g. 60 min)" className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none" />
              <input value={svcCat} onChange={(e) => setSvcCat(e.target.value)} placeholder="Category (e.g. Hair, Repair)" className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none" />
            </>
          )}
          <button onClick={addItem} className="rounded-xl px-4 py-2.5 text-sm font-black text-white transition hover:brightness-110" style={{ background: def.accent }}>
            ➕ Add
          </button>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button onClick={restore} className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-200">
            ↺ Restore original catalogue
          </button>
          <Link href={base} className="text-xs font-bold underline" style={{ color: def.accent }}>
            See it live on the demo →
          </Link>
          {msg && <p className="text-xs font-bold text-emerald-600">{msg}</p>}
        </div>
      </div>)}


      {isFintech && def.layout === "invest" && (
        <div className={`${card} mt-4`}>
          <p className="text-sm font-black">📈 Plans — add, delete</p>
          <p className="mt-1 text-xs text-slate-500">Demo figures only — this is not a real investment offer. Changes stay in this browser.</p>
          <div className="mt-4 space-y-2">
            {(store.custom.customInvestPlans ?? def.investPlans ?? []).map((pl) => (
              <div key={pl.id} className="flex flex-wrap items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 ring-1 ring-slate-100">
                <span className="text-xl">{pl.e}</span>
                <span className="min-w-0 flex-1 text-sm font-bold">{pl.n}</span>
                <span className="text-xs text-slate-500">{pl.min}–{pl.max} Tk • {pl.roi}% / {pl.duration}</span>
                <button onClick={() => removePlan(pl.id)} className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 ring-1 ring-red-100 transition hover:bg-red-100">Delete</button>
              </div>
            ))}
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Plan name" className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none" />
            <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Min (Tk)" inputMode="numeric" className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none" />
            <input value={planMax} onChange={(e) => setPlanMax(e.target.value)} placeholder="Max (Tk)" inputMode="numeric" className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none" />
            <input value={planRoi} onChange={(e) => setPlanRoi(e.target.value)} placeholder="ROI %" inputMode="decimal" className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none" />
            <input value={planDaily} onChange={(e) => setPlanDaily(e.target.value)} placeholder="Daily ROI %" inputMode="decimal" className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none" />
            <input value={planDuration} onChange={(e) => setPlanDuration(e.target.value)} placeholder="Duration (e.g. 30 days)" className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none" />
            <input value={emoji} onChange={(e) => setEmoji(e.target.value)} placeholder="Emoji" className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none" />
            <input value={planTag} onChange={(e) => setPlanTag(e.target.value)} placeholder="Tag (optional)" className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none" />
            <button onClick={addPlan} className="rounded-xl px-4 py-2.5 text-sm font-black text-white transition hover:brightness-110" style={{ background: def.accent }}>➕ Add plan</button>
          </div>
          {msg && <p className="mt-2 text-xs font-bold text-emerald-600">{msg}</p>}
        </div>
      )}

      {isFintech && def.layout === "exchange" && (
        <div className={`${card} mt-4`}>
          <p className="text-sm font-black">💱 Rates — edit buy/sell, add, delete</p>
          <p className="mt-1 text-xs text-slate-500">Demo rates only — not live market rates. Changes stay in this browser.</p>
          <div className="mt-4 space-y-2">
            {(store.custom.customRates ?? def.rates ?? []).map((r) => (
              <div key={r.code} className="flex flex-wrap items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 ring-1 ring-slate-100">
                <span className="text-xl">{r.e}</span>
                <span className="min-w-0 flex-1 text-sm font-bold">{r.code} — {r.name}</span>
                <label className="flex items-center gap-1 text-xs text-slate-500">Buy <input type="number" defaultValue={r.buy} onBlur={(e) => editRate(r.code, "buy", e.target.value)} className="w-20 rounded-lg border border-slate-200 px-2 py-1.5 text-sm font-bold text-slate-800 outline-none" /></label>
                <label className="flex items-center gap-1 text-xs text-slate-500">Sell <input type="number" defaultValue={r.sell} onBlur={(e) => editRate(r.code, "sell", e.target.value)} className="w-20 rounded-lg border border-slate-200 px-2 py-1.5 text-sm font-bold text-slate-800 outline-none" /></label>
                <button onClick={() => removeRate(r.code)} className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 ring-1 ring-red-100 transition hover:bg-red-100">Delete</button>
              </div>
            ))}
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <input value={rateCode} onChange={(e) => setRateCode(e.target.value)} placeholder="Code (e.g. AUD)" className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none" />
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Currency name" className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none" />
            <input value={rateBuy} onChange={(e) => setRateBuy(e.target.value)} placeholder="Buy rate" inputMode="decimal" className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none" />
            <input value={rateSell} onChange={(e) => setRateSell(e.target.value)} placeholder="Sell rate" inputMode="decimal" className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none" />
            <input value={emoji} onChange={(e) => setEmoji(e.target.value)} placeholder="Emoji" className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none" />
            <button onClick={addRate} className="rounded-xl px-4 py-2.5 text-sm font-black text-white transition hover:brightness-110" style={{ background: def.accent }}>➕ Add rate</button>
          </div>
          {msg && <p className="mt-2 text-xs font-bold text-emerald-600">{msg}</p>}
        </div>
      )}

      {isFintech && def.layout === "wallet" && (
        <div className={`${card} mt-4`}>
          <p className="text-sm font-black">🪙 Coins — edit price, add, delete</p>
          <p className="mt-1 text-xs text-slate-500">Demo prices only — not live market prices. Changes stay in this browser.</p>
          <div className="mt-4 space-y-2">
            {(store.custom.customCoins ?? def.coins ?? []).map((c) => (
              <div key={c.code} className="flex flex-wrap items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 ring-1 ring-slate-100">
                <span className="text-xl">{c.e}</span>
                <span className="min-w-0 flex-1 text-sm font-bold">{c.code} — {c.name}</span>
                <label className="flex items-center gap-1 text-xs text-slate-500">$ <input type="number" defaultValue={c.price} onBlur={(e) => editCoin(c.code, e.target.value)} className="w-24 rounded-lg border border-slate-200 px-2 py-1.5 text-sm font-bold text-slate-800 outline-none" /></label>
                <button onClick={() => removeCoin(c.code)} className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 ring-1 ring-red-100 transition hover:bg-red-100">Delete</button>
              </div>
            ))}
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <input value={coinCode} onChange={(e) => setCoinCode(e.target.value)} placeholder="Code (e.g. XRP)" className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none" />
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Coin name" className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none" />
            <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Price (USD)" inputMode="decimal" className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none" />
            <input value={emoji} onChange={(e) => setEmoji(e.target.value)} placeholder="Emoji" className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none" />
            <button onClick={addCoin} className="rounded-xl px-4 py-2.5 text-sm font-black text-white transition hover:brightness-110" style={{ background: def.accent }}>➕ Add coin</button>
          </div>
          {msg && <p className="mt-2 text-xs font-bold text-emerald-600">{msg}</p>}
        </div>
      )}

      {isFintech && def.layout === "news" && (
        <div className={`${card} mt-4`}>
          <p className="text-sm font-black">📰 Articles — add, delete</p>
          <p className="mt-1 text-xs text-slate-500">Sample placeholder articles for layout only — not reports of real events. Changes stay in this browser.</p>
          <div className="mt-4 space-y-2">
            {(store.custom.customNews ?? def.news).map((n) => (
              <div key={n.id} className="flex flex-wrap items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 ring-1 ring-slate-100">
                <span className="text-xl">{n.e}</span>
                <span className="min-w-0 flex-1 text-sm font-bold">{n.t}</span>
                <span className="text-xs text-slate-500">{n.c} • {n.time}</span>
                <button onClick={() => removeNewsItem(n.id)} className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 ring-1 ring-red-100 transition hover:bg-red-100">Delete</button>
              </div>
            ))}
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Headline" className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none" />
            <select value={cat} onChange={(e) => setCat(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none">
              {def.cats.filter((c) => c !== "All").map((c) => <option key={c}>{c}</option>)}
            </select>
            <input value={emoji} onChange={(e) => setEmoji(e.target.value)} placeholder="Emoji" className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none" />
            <button onClick={addNewsItem} className="rounded-xl px-4 py-2.5 text-sm font-black text-white transition hover:brightness-110" style={{ background: def.accent }}>➕ Add article</button>
          </div>
          <textarea value={newsBody} onChange={(e) => setNewsBody(e.target.value)} placeholder="Article body (plain summary — no real event, person or quote)" rows={3} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none" />
          {msg && <p className="mt-2 text-xs font-bold text-emerald-600">{msg}</p>}
        </div>
      )}

      {def.layout === "casino" && (
        <div className={`${card} mt-4`}>
          <p className="text-sm font-black">🎰 Casino controls</p>
          <p className="mt-1 text-xs text-slate-500">
            Demo settings for CasinoPlay. These controls change the demo only — no real money is involved.
            Every balance, bet and win here is virtual credits.
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            <label className="text-xs text-slate-500">RTP — Return to Player (%)
              <input type="number" step="0.1" defaultValue={store.custom.casinoRtp ?? 96}
                onBlur={(e) => { const v = Number(e.target.value); if (Number.isFinite(v)) { store.saveCustom({ casinoRtp: Math.min(99.9, Math.max(50, v)) }); setMsg("RTP saved."); } }}
                className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-2 text-sm font-bold text-slate-800 outline-none" />
            </label>
            <label className="text-xs text-slate-500">Minimum bet (virtual credits)
              <input type="number" defaultValue={store.custom.casinoMinBet ?? 10}
                onBlur={(e) => { const v = Number(e.target.value); if (Number.isFinite(v) && v >= 0) { store.saveCustom({ casinoMinBet: v }); setMsg("Minimum bet saved."); } }}
                className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-2 text-sm font-bold text-slate-800 outline-none" />
            </label>
            <label className="text-xs text-slate-500">Maximum bet (virtual credits)
              <input type="number" defaultValue={store.custom.casinoMaxBet ?? 50000}
                onBlur={(e) => { const v = Number(e.target.value); if (Number.isFinite(v) && v >= 0) { store.saveCustom({ casinoMaxBet: v }); setMsg("Maximum bet saved."); } }}
                className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-2 text-sm font-bold text-slate-800 outline-none" />
            </label>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            RTP is the long-run average share of all virtual stakes that games return to players, over a very
            large number of rounds. Default 96% = 4% house edge on average. Lower RTP = higher house edge =
            the house keeps more on average over time. RTP never guarantees the result of any single round,
            spin or hand. Owner&apos;s setting: set RTP lower when you want games to lose more and win less on
            average — that is the owner&apos;s demo configuration, never a promise made to players.
          </p>
          <p className="mt-3 text-sm font-black">Game categories — lobby visibility</p>
          <p className="mt-1 text-xs text-slate-500">
            Switch a category off to hide it from the demo lobby pages. Disabled games stay in the catalogue
            and can be switched back on at any time — nothing is deleted.
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {[["slots", "🎰 Slots"], ["live", "🎥 Live Casino"], ["table", "🃏 Table Games"], ["desi", "🪔 Desi Games"], ["crash", "📈 Crash Games"]].map(([id, label]) => {
              const off = (store.custom.customDisabledGameCats ?? []).includes(id);
              return (
                <button key={id} onClick={() => { const cur = store.custom.customDisabledGameCats ?? []; store.saveCustom({ customDisabledGameCats: off ? cur.filter((x) => x !== id) : [...cur, id] }); setMsg(`${label} ${off ? "shown" : "hidden"} in the lobby.`); }}
                  className={`rounded-xl px-3 py-2 text-xs font-bold ring-1 transition ${off ? "bg-slate-100 text-slate-500 ring-slate-200" : "bg-emerald-50 text-emerald-700 ring-emerald-100"}`}>
                  {label} — {off ? "Hidden" : "Shown"}
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Bets: {store.bets.filter((b) => b.status === "Pending").length} open in this browser. Bet statuses are
            English since Phase 6: Pending / Won / Lost (older browser-saved bets are migrated on load).
            Play responsibly — demo for visitors aged 18 and over, virtual credits only, never a way to make money.
          </p>
          {msg && <p className="mt-2 text-xs font-bold text-emerald-600">{msg}</p>}
        </div>
      )}

      {def.layout === "crypto-exchange" && (
        <div className={`${card} mt-4`}>
          <p className="text-sm font-black">💱 Exchange Controls</p>
          <p className="mt-1 text-xs text-slate-500">
            These controls change only what visitors see in this demo. They do not trade, hold or move any real crypto.
            All prices here are demo figures for layout only — not live market prices — and this demo charges nothing.
          </p>
          <p className="mt-3 text-sm font-black">Trading pairs — markets-list visibility</p>
          <p className="mt-1 text-xs text-slate-500">
            Switch a pair off to hide it from the demo markets list. Hidden pairs can be switched back on at any
            time; direct trade links still open in demo mode, and pair toggles never open, close or settle any real position.
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {CEX_COINS.map((c) => {
              const off = (store.custom.customDisabledCexPairs ?? []).includes(c.code);
              return (
                <button key={c.code} onClick={() => { const cur = store.custom.customDisabledCexPairs ?? []; store.saveCustom({ customDisabledCexPairs: off ? cur.filter((x) => x !== c.code) : [...cur, c.code] }); setMsg(`${c.code}/USDT ${off ? "shown" : "hidden"} in the markets list.`); }}
                  className={`rounded-xl px-3 py-2 text-xs font-bold ring-1 transition ${off ? "bg-slate-100 text-slate-500 ring-slate-200" : "bg-emerald-50 text-emerald-700 ring-emerald-100"}`}>
                  {c.code}/USDT — {off ? "Hidden" : "Shown"}
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Fees: all fee figures in this demo are demo figures for layout only. This demo does not publish a real
            fee schedule. Use the Banners section below for demo announcements — never present one as a real exchange announcement.
          </p>
          <p className="mt-4 text-sm font-black">PlyraTrade engine prices — edit (demo only)</p>
          <p className="mt-1 text-xs text-slate-500">
            Edit the price the trading screens (home, markets, spot, futures, convert, charts, order book, wallets)
            show for each coin. This edits the <b>engine</b> prices — it is separate from the fintech "Coins" card
            used by other layouts, which does not affect these trading screens. Change/high/low stay at demo
            defaults; an edited price is clamped inside its own high/low range. Nothing real is traded.
          </p>
          <div className="mt-2 space-y-2">
            {CEX_COINS.map((c) => {
              const over = store.custom.customCexPrices?.[c.code];
              const eff = over?.price ?? c.price;
              return (
                <div key={c.code} className="flex flex-wrap items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 ring-1 ring-slate-100">
                  <span className="w-20 text-xs font-black">{c.code}/USDT</span>
                  <span className="text-xs text-slate-500">default ${c.price.toLocaleString("en-US")}</span>
                  <input type="number" min="0" step="any" defaultValue={eff} key={`${c.code}-${eff}`}
                    onBlur={(e) => { const v = parseFloat(e.target.value); if (Number.isFinite(v) && v > 0) { store.saveCustom({ customCexPrices: { ...(store.custom.customCexPrices ?? {}), [c.code]: { price: v } } }); setMsg(`${c.code} engine price set to $${v} (demo).`); } }}
                    className="w-32 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs outline-none" />
                  {over?.price !== undefined && (
                    <button onClick={() => { const next = { ...(store.custom.customCexPrices ?? {}) }; delete next[c.code]; store.saveCustom({ customCexPrices: next }); setMsg(`${c.code} engine price reset to default (demo).`); }}
                      className="rounded-lg bg-white px-2 py-1 text-xs font-bold text-slate-500 ring-1 ring-slate-200">Reset</button>
                  )}
                </div>
              );
            })}
          </div>
          {msg && <p className="mt-2 text-xs font-bold text-emerald-600">{msg}</p>}
        </div>
      )}

      <div className={`${card} mt-4`}>
        <p className="text-sm font-black">🎉 Banners & announcement — add, delete</p>
        <p className="mt-1 text-xs text-slate-500">
          Banners appear as extra slides on the demo home hero (auto-sliding, right-to-left).
          The announcement shows as a strip above the demo. Both stay in this browser only.
        </p>
        <div className="mt-3 space-y-2">
          {(store.custom.customBanners ?? []).length === 0 && (
            <p className="text-xs text-slate-500">No custom banners yet. Add the first one below.</p>
          )}
          {(store.custom.customBanners ?? []).map((b) => (
            <div key={b.id} className="flex flex-wrap items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 ring-1 ring-slate-100">
              <span className="text-xl">{b.emoji}</span>
              <span className="min-w-0 flex-1 text-sm font-bold">{b.title}</span>
              {b.sub && <span className="text-xs text-slate-500">{b.sub}</span>}
              <button onClick={() => removeBanner(b.id)} className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 ring-1 ring-red-100 transition hover:bg-red-100">Delete</button>
            </div>
          ))}
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <input value={bannerEmoji} onChange={(e) => setBannerEmoji(e.target.value)} placeholder="Emoji" className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none" />
          <input value={bannerTitle} onChange={(e) => setBannerTitle(e.target.value)} placeholder="Banner title" className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none" />
          <input value={bannerSub} onChange={(e) => setBannerSub(e.target.value)} placeholder="Banner subtitle" className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none" />
          <button onClick={addBanner} className="rounded-xl px-4 py-2.5 text-sm font-black text-white transition hover:brightness-110" style={{ background: def.accent }}>➕ Add banner</button>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <input value={announcement} onChange={(e) => setAnnouncement(e.target.value)} placeholder="Announcement strip text (leave empty to clear)" className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none" />
          <button onClick={saveAnnouncement} className="rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-200">💾 Save announcement</button>
        </div>
        {msg && <p className="mt-2 text-xs font-bold text-emerald-600">{msg}</p>}
      </div>

      <div className={`${card} mt-4`}>
        <p className="text-sm font-black">📄 Pages — About text</p>
        <p className="mt-1 text-xs text-slate-500">
          Edit what the demo's About page says. Save an empty text to restore the original.
        </p>
        <textarea value={aboutText} onChange={(e) => setAboutText(e.target.value)} rows={4} className="mt-3 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none" />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button onClick={saveAbout} className="rounded-xl px-4 py-2.5 text-sm font-black text-white transition hover:brightness-110" style={{ background: def.accent }}>💾 Save About text</button>
          {msg && <p className="text-xs font-bold text-emerald-600">{msg}</p>}
        </div>
      </div>
      <div className={`${card} mt-4`}>
        <p className="text-sm font-black">🛒 Orders & bookings — update status</p>
        <p className="mt-1 text-xs text-slate-500">
          Orders and bookings placed in this browser (by you, trying the demo) appear
          here. Change a status and it updates on the demo's order/booking pages too.
          Demo data only — nothing is sent anywhere.
        </p>
        {store.orders.length === 0 && store.bookings.length === 0 && (
          <p className="mt-3 text-xs text-slate-500">No orders or bookings yet in this browser. Place one on the demo first.</p>
        )}
        <div className="mt-3 space-y-2">
          {store.orders.map((o) => (
            <div key={o.id} className="flex flex-wrap items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 ring-1 ring-slate-100">
              <span className="text-sm font-bold">{o.id}</span>
              <span className="min-w-0 flex-1 text-xs text-slate-500">{o.items.map((i: any) => i.n).join(", ")} — {o.total} Tk</span>
              <select
                value={ORDER_STATUSES.includes(o.status as any) ? o.status : "Processing"}
                onChange={(e) => { store.updateOrderStatus(o.id, e.target.value); setMsg(`Order ${o.id} → ${e.target.value}.`); }}
                className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs font-bold outline-none"
              >
                {ORDER_STATUSES.map((st) => <option key={st}>{st}</option>)}
              </select>
            </div>
          ))}
          {store.bookings.map((b) => (
            <div key={b.id} className="flex flex-wrap items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 ring-1 ring-slate-100">
              <span className="text-sm font-bold">{b.id}</span>
              <span className="min-w-0 flex-1 text-xs text-slate-500">{b.itemName} — {b.date} {b.slot}</span>
              <select
                value={BOOKING_STATUSES.includes(b.status as any) ? b.status : "Confirmed"}
                onChange={(e) => { store.updateBookingStatus(b.id, e.target.value); setMsg(`Booking ${b.id} → ${e.target.value}.`); }}
                className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs font-bold outline-none"
              >
                {BOOKING_STATUSES.map((st) => <option key={st}>{st}</option>)}
              </select>
            </div>
          ))}
        </div>
        {msg && <p className="mt-2 text-xs font-bold text-emerald-600">{msg}</p>}
      </div>

      <div className={`${card} mt-4`}>
        <p className="text-sm font-black">👥 Team — add, remove</p>
        <p className="mt-1 text-xs text-slate-500">
          The people behind this demo (doctors, stylists, guides, designers — whoever
          fits this business). Team members show on the demo's About page. Starts empty:
          add only real team roles for this demo, never invented people.
        </p>
        <div className="mt-3 space-y-2">
          {(store.custom.customTeam ?? []).length === 0 && (
            <p className="text-xs text-slate-500">No team members yet. Add the first one below.</p>
          )}
          {(store.custom.customTeam ?? []).map((m) => (
            <div key={m.id} className="flex flex-wrap items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 ring-1 ring-slate-100">
              <span className="text-xl">👤</span>
              <span className="min-w-0 flex-1 text-sm font-bold">{m.name}{m.role ? ` — ${m.role}` : ""}</span>
              {m.note && <span className="text-xs text-slate-500">{m.note}</span>}
              <button onClick={() => removeTeam(m.id)} className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 ring-1 ring-red-100 transition hover:bg-red-100">
                Delete
              </button>
            </div>
          ))}
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <input value={teamName} onChange={(e) => setTeamName(e.target.value)} placeholder="Name (e.g. Dr. Ayesha Khan)" className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none" />
          <input value={teamRole} onChange={(e) => setTeamRole(e.target.value)} placeholder="Role (e.g. Senior Stylist)" className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none" />
          <input value={teamNote} onChange={(e) => setTeamNote(e.target.value)} placeholder="Note (e.g. 10 yrs experience)" className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none" />
          <button onClick={addTeam} className="rounded-xl px-4 py-2.5 text-sm font-black text-white transition hover:brightness-110" style={{ background: def.accent }}>
            ➕ Add member
          </button>
        </div>
      </div>

      <div className={`${card} mt-4`}>
        <p className="text-sm font-black">⭐ Reviews — moderation</p>
        <p className="mt-1 text-xs text-slate-500">
          Testimonials start empty — nothing here is seeded, so nothing fake is ever
          shown. Add a testimonial, then approve it to show it on the About page, or
          hide/delete it. Only approved testimonials appear on the demo.
        </p>
        <div className="mt-3 space-y-2">
          {(store.custom.customTestimonials ?? []).length === 0 && (
            <p className="text-xs text-slate-500">No testimonials yet. Add the first one below.</p>
          )}
          {(store.custom.customTestimonials ?? []).map((r) => (
            <div key={r.id} className="flex flex-wrap items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 ring-1 ring-slate-100">
              <span className="min-w-0 flex-1 text-sm"><span className="font-bold">{r.name}</span> — {r.text}</span>
              <span className={`rounded-full px-2 py-1 text-[10px] font-black ${r.approved ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{r.approved ? "Shown" : "Hidden"}</span>
              <button onClick={() => toggleTesti(r.id)} className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-200">
                {r.approved ? "Hide" : "Approve"}
              </button>
              <button onClick={() => removeTesti(r.id)} className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 ring-1 ring-red-100 transition hover:bg-red-100">
                Delete
              </button>
            </div>
          ))}
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          <input value={testiName} onChange={(e) => setTestiName(e.target.value)} placeholder="Customer name" className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none" />
          <input value={testiText} onChange={(e) => setTestiText(e.target.value)} placeholder="What they said" className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none sm:col-span-1" />
          <button onClick={addTesti} className="rounded-xl px-4 py-2.5 text-sm font-black text-white transition hover:brightness-110" style={{ background: def.accent }}>
            ➕ Add testimonial
          </button>
        </div>
        {msg && <p className="mt-2 text-xs font-bold text-emerald-600">{msg}</p>}
      </div>

      <div className={`${card} mt-4`}>
        <p className="text-sm font-black">⚙️ Settings — language</p>
        <p className="mt-1 text-xs text-slate-500">
          This demo is English by default. Switch the whole demo (and this admin) to
          Bangla or Hindi from here, or from the drawer menu on the demo itself.
        </p>
        <div className="mt-3 max-w-sm">
          <DemoLangSwitcher accent={def.accent} />
        </div>
      </div>

      <div className="mt-4">
        <DemoAdmin />
      </div>
    </Page>
  );
}
