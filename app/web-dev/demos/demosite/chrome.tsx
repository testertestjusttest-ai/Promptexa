"use client";

/** DemoSite chrome — navbar with hamburger drawer, search, account/cart, footer.
 * Makes every demo feel like a complete, original website.
 */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toBnDigits } from "@/lib/format";
import { useDemo } from "./store";
import { useBh, BhLogo, EN_NAME, EN_ADDRESS, EN_HOURS, EN_ABOUT } from "./bh-lang";
import { useDemoLangOpt, DemoLangSwitcher, type DemoLang } from "./demo-lang";
import { AdSlot, AnnouncementBar } from "./client-ads";

function navLinks(layout: string, lang?: string | DemoLang): { label: string; href: string }[] {
  // Reworked demos (demo-lang provider mounted): English nav in "en", and
  // English fallback in "hi" until Hindi strings land (Phase 2). Legacy
  // demos pass undefined and keep the existing Bangla labels untouched.
  const enNav = lang === "en" || lang === "hi";
  switch (layout) {
    case "shop":
      return enNav
        ? [
            { label: "🏠 Home", href: "" },
            { label: "🛍️ Shop", href: "/shop" },
            { label: "🎁 Offers", href: "/offers" },
            { label: "📍 Track Order", href: "/track" },
            { label: "ℹ️ About", href: "/about" },
            { label: "📞 Contact", href: "/contact" },
          ]
        : [
            { label: "🏠 হোম", href: "" },
            { label: "🛍️ শপ", href: "/shop" },
            { label: "🎁 অফার", href: "/offers" },
            { label: "📍 ট্র্যাক অর্ডার", href: "/track" },
            { label: "ℹ️ সম্পর্কে", href: "/about" },
            { label: "📞 যোগাযোগ", href: "/contact" },
          ];
    case "service":
      return enNav
        ? [
            { label: "🏠 Home", href: "" },
            { label: "🛠️ Services", href: "/services" },
            { label: "⭐ Reviews", href: "/reviews" },
            { label: "ℹ️ About", href: "/about" },
            { label: "📞 Contact", href: "/contact" },
          ]
        : [
            { label: "🏠 হোম", href: "" },
            { label: "🛠️ সার্ভিসেস", href: "/services" },
            { label: "⭐ রিভিউ", href: "/reviews" },
            { label: "ℹ️ সম্পর্কে", href: "/about" },
            { label: "📞 যোগাযোগ", href: "/contact" },
          ];
    case "gallery":
      return [
        { label: "🏠 Home", href: "" },
        { label: "🖼️ Gallery", href: "/gallery" },
        { label: "💰 Pricing", href: "/pricing" },
        { label: "📅 Booking", href: "/book" },
        { label: "ℹ️ About", href: "/about" },
        { label: "📞 Contact", href: "/contact" },
      ];
    case "booking":
      return [
        { label: "🏠 Home", href: "" },
        { label: "🏨 Listings", href: "/stays" },
        { label: "📅 My bookings", href: "/my-bookings" },
        { label: "ℹ️ About", href: "/about" },
        { label: "📞 Contact", href: "/contact" },
      ];
    case "invest":
      return [
        { label: "🏠 Home", href: "" },
        { label: "📈 Plans", href: "/plans" },
        { label: "💰 Deposit", href: "/deposit" },
        { label: "💼 My investments", href: "/dashboard" },
        { label: "❓ How it works", href: "/how" },
        { label: "ℹ️ About", href: "/about" },
        { label: "📞 Contact", href: "/contact" },
      ];
    case "exchange":
      return [
        { label: "🏠 Home", href: "" },
        { label: "💱 Exchange", href: "/exchange" },
        { label: "💰 Deposit", href: "/deposit" },
        { label: "📊 Live rates", href: "/rates" },
        { label: "📍 Track", href: "/track" },
        { label: "ℹ️ About", href: "/about" },
        { label: "📞 Contact", href: "/contact" },
      ];
    case "wallet":
      return [
        { label: "🏠 Home", href: "" },
        { label: "👛 Wallet", href: "/wallet" },
        { label: "💰 Deposit", href: "/deposit" },
        { label: "📤 Send", href: "/send" },
        { label: "📥 Receive", href: "/receive" },
        { label: "ℹ️ About", href: "/about" },
        { label: "📞 Contact", href: "/contact" },
      ];
    case "news":
      return [
        { label: "🏠 Home", href: "" },
        { label: "📰 Latest", href: "/cat/National" },
        { label: "🔍 Search", href: "/search" },
        { label: "ℹ️ About", href: "/about" },
        { label: "📞 Contact", href: "/contact" },
      ];
    case "buyinghouse":
      return lang === "en"
        ? [
            { label: "🏠 Home", href: "" },
            { label: "🛠️ Services", href: "/services" },
            { label: "👕 Products", href: "/products" },
            { label: "🔍 Quality", href: "/quality" },
            { label: "🏭 Factories", href: "/factories" },
            { label: "🖼️ Gallery", href: "/gallery" },
            { label: "📰 Blog", href: "/blog" },
            { label: "📩 RFQ", href: "/rfq" },
            { label: "📞 Contact", href: "/contact" },
          ]
        : [
            { label: "🏠 হোম", href: "" },
            { label: "🛠️ সার্ভিস", href: "/services" },
            { label: "👕 প্রোডাক্ট", href: "/products" },
            { label: "🔍 কোয়ালিটি", href: "/quality" },
            { label: "🏭 ফ্যাক্টরি", href: "/factories" },
            { label: "🖼️ Gallery", href: "/gallery" },
            { label: "📰 ব্লগ", href: "/blog" },
            { label: "📩 RFQ", href: "/rfq" },
            { label: "📞 যোগাযোগ", href: "/contact" },
          ];
    case "jewelry":
      return [
        { label: "🏠 Home", href: "" },
        { label: "💎 Collection", href: "/shop" },
        { label: "🏛️ Atelier", href: "/about" },
        { label: "❓ FAQ", href: "/faq" },
        { label: "📞 Contact", href: "/contact" },
      ];
    case "casino":
      return [
        { label: "🏠 হোম", href: "" },
        { label: "⚽ স্পোর্টস", href: "/sports" },
        { label: "🔴 লাইভ", href: "/live" },
        { label: "🎰 ক্যাসিনো", href: "/casino" },
        { label: "💰 জ্যাকপট", href: "/casino/jackpots" },
        { label: "🎁 প্রোমোশন", href: "/promotions" },
        { label: "👑 ভিআইপি", href: "/vip" },
        { label: "🧾 আমার বাজি", href: "/my-bets" },
        { label: "ℹ️ সম্পর্কে", href: "/about" },
        { label: "📞 যোগাযোগ", href: "/contact" },
      ];
    case "crypto-exchange":
      return [
        { label: "🏠 হোম", href: "" },
        { label: "📊 মার্কেটস", href: "/markets" },
        { label: "📈 স্পট ট্রেড", href: "/trade/BTCUSDT" },
        { label: "⚡ ফিউচার্স", href: "/futures" },
        { label: "🤝 P2P", href: "/p2p" },
        { label: "🔄 কনভার্ট", href: "/convert" },
        { label: "🌱 আর্ন", href: "/earn" },
        { label: "👛 Wallet", href: "/wallet" },
        { label: "🎓 অ্যাকাডেমি", href: "/academy" },
        { label: "🎧 সাপোর্ট", href: "/support" },
      ];
    default:
      return [
        { label: "🏠 হোম", href: "" },
        { label: "ℹ️ সম্পর্কে", href: "/about" },
        { label: "📞 যোগাযোগ", href: "/contact" },
      ];
  }
}

/** Drawer styling varies per theme so each demo's menu feels unique. */
function drawerTheme(theme: string | undefined, dark: boolean) {
  switch (theme) {
    case "split":
      return { aside: `rounded-none border-r-4 ${dark ? "bg-[#0d1117] border-white/20" : "bg-white border-slate-300"}`, item: "rounded-none border-b", search: "rounded-none" };
    case "minimal":
      return { aside: `${dark ? "bg-[#0a0a0f]" : "bg-[#fafafa]"}`, item: "rounded-full", search: "rounded-full" };
    case "bold":
      return { aside: `border-r-8 ${dark ? "bg-black border-white/30" : "bg-white border-slate-900"}`, item: "rounded-lg", search: "rounded-lg" };
    case "elegant":
      return { aside: `${dark ? "bg-[#141210]" : "bg-[#fffdf8]"}`, item: "rounded-xl", search: "rounded-xl" };
    case "playful":
      return { aside: `${dark ? "bg-[#14101f]" : "bg-white"}`, item: "rounded-3xl", search: "rounded-3xl" };
    default:
      return { aside: `${dark ? "bg-[#101828]" : "bg-white"}`, item: "rounded-xl", search: "rounded-2xl" };
  }
}

export default function Chrome({ children }: { children: React.ReactNode }) {
  const { def, base, store, clientSlug } = useDemo();
  const bh = useBh();
  const dl = useDemoLangOpt();
  const isBh = def.layout === "buyinghouse";
  // Phase 4: reworked demos mount the demo-lang provider, so their chrome
  // (drawer, footer, aria labels) follows it — English by default, Bangla
  // only when the visitor switched to Bangla. Legacy demos (no provider)
  // keep the previous Bangla strings untouched.
  const L = (bn: string, en: string) => (isBh ? bh.tx(bn, en) : dl ? (dl.lang === "bn" ? bn : en) : bn);
  const siteName = isBh && bh.lang !== "bn" ? EN_NAME : def.name;
  const router = useRouter();
  const [drawer, setDrawer] = useState(false);
  const [q, setQ] = useState("");
  const [mSearch, setMSearch] = useState(false);
  // Reworked demos use the demo-lang provider; buying-house keeps its own
  // bh-lang; every other demo passes undefined and keeps legacy strings.
  const links = navLinks(def.layout, dl ? dl.lang : isBh ? bh.lang : undefined);
  const dark = def.dark;
  const showCart = def.layout === "shop" || def.layout === "jewelry";
  const dt = drawerTheme(def.theme, dark);

  const goSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!q.trim()) return;
    setDrawer(false);
    setMSearch(false);
    router.push(`${base}${searchPath}?q=${encodeURIComponent(q.trim())}`);
  };

  const searchPath = "/search";

  return (
    <div className={`min-h-screen ${dark ? "bg-[#0a0a12] text-white" : "bg-slate-50 text-slate-800"}`}>
      {def.agencyReworked && store.custom.customAnnouncement ? (
        <div className="px-4 py-2 text-center text-xs font-bold text-white" style={{ background: def.accent }}>
          📢 {store.custom.customAnnouncement}
        </div>
      ) : null}
      {clientSlug && <AnnouncementBar />}
      {/* ===== top navbar ===== */}
      <header className={`sticky top-0 z-[60] backdrop-blur-md ${dark ? "bg-[#0a0a12]/90 border-b border-white/10" : "bg-white/90 border-b border-slate-200"}`}>
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3">
          <button
            onClick={() => setDrawer(true)}
            aria-label={L("মেনু", "Menu")}
            className={`grid h-10 w-10 place-items-center rounded-xl text-xl transition hover:scale-105 ${dark ? "bg-white/10 hover:bg-white/20" : "bg-slate-100 hover:bg-slate-200"}`}
          >
            ☰
          </button>
          <Link href={base} className="flex items-center gap-2">
            {isBh ? <BhLogo size={38} /> : <span className="text-2xl">{def.logoEmoji}</span>}
            {isBh ? (
              <span className="leading-none">
                <span className="block whitespace-nowrap text-[17px] font-black tracking-tight">{siteName}</span>
                <span className="mt-1 block text-[9px] font-black uppercase tracking-[0.22em] text-sky-600">{bh.tx("গার্মেন্টস বায়িং হাউস", "Garments Buying House")}</span>
              </span>
            ) : (
              <span className="text-lg font-black tracking-tight">{siteName}</span>
            )}
          </Link>
          <form onSubmit={goSearch} className="mx-2 hidden flex-1 md:block">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={isBh ? bh.tx("🔍 খুঁজুন...", "🔍 Search...") : dl && dl.lang !== "bn" ? `🔍 ${def.layout === "news" ? "news" : def.layout === "shop" ? "products" : "Search"}...` : `🔍 ${def.layout === "news" ? "খবর" : def.layout === "shop" ? "পণ্য" : "খুঁজুন"}...`}
              className={`w-full rounded-full border px-4 py-2 text-sm outline-none ${
                dark ? "border-white/15 bg-white/5 text-white placeholder:text-slate-500" : "border-slate-200 bg-slate-100 placeholder:text-slate-400"
              }`}
            />
          </form>
          <div className="ml-auto flex items-center gap-1.5">
            <button
              onClick={() => setMSearch((v) => !v)}
              aria-label={L("সার্চ", "Search")}
              className={`grid h-10 w-10 place-items-center rounded-xl text-lg md:hidden ${dark ? "bg-white/10" : "bg-slate-100"}`}
            >
              🔍
            </button>
            <Link
              href={`${base}/${store.user ? "account" : "login"}`}
              aria-label={L("অ্যাকাউন্ট", "Account")}
              className={`grid h-10 w-10 place-items-center rounded-xl text-lg ${dark ? "bg-white/10 hover:bg-white/20" : "bg-slate-100 hover:bg-slate-200"}`}
            >
              {store.user ? <span className="grid h-7 w-7 place-items-center rounded-full text-sm font-black text-white" style={{ background: def.accent }}>{store.user.name[0]}</span> : "👤"}
            </Link>
            {showCart && (
              <Link
                href={`${base}/cart`}
                aria-label={L("কার্ট", "Cart")}
                className={`relative grid h-10 w-10 place-items-center rounded-xl text-lg ${dark ? "bg-white/10 hover:bg-white/20" : "bg-slate-100 hover:bg-slate-200"}`}
              >
                🛒
                {store.cartCount > 0 && (
                  <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full px-1 text-[10px] font-black text-white" style={{ background: def.accent }}>
                    {dl && dl.lang !== "bn" ? store.cartCount : toBnDigits(store.cartCount)}
                  </span>
                )}
              </Link>
            )}
          </div>
        </div>
        {mSearch && (
          <form onSubmit={goSearch} className="border-t border-white/10 px-4 py-2 md:hidden">
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={isBh ? bh.tx("🔍 খুঁজুন...", "🔍 Search...") : "🔍 খুঁজুন..."}
              className={`w-full rounded-full border px-4 py-2 text-sm outline-none ${dark ? "border-white/15 bg-white/5 text-white" : "border-slate-200 bg-slate-100"}`}
            />
          </form>
        )}
        {/* desktop category strip */}
        <nav className={`hidden border-t md:block ${dark ? "border-white/5" : "border-slate-100"}`}>
          <div className="mx-auto flex max-w-6xl items-center gap-1 overflow-x-auto px-4 py-1.5">
            {links.map((l) => (
              <Link key={l.href} href={`${base}${l.href}`} className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-[13px] font-bold opacity-70 transition hover:opacity-100 ${dark ? "hover:bg-white/10" : "hover:bg-slate-100"}`}>
                {l.label}
              </Link>
            ))}
          </div>
        </nav>
      </header>

      {/* ===== hamburger drawer ===== */}
      {drawer && (
        <div className="fixed inset-0 z-[80]">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDrawer(false)} />
          <aside className={`absolute left-0 top-0 flex h-full w-80 max-w-[85vw] flex-col overflow-y-auto shadow-2xl animate-drawer-in ${dt.aside} ${dark ? "text-white" : "text-slate-800"}`}>
            {/* Professional header with brand */}
            <div className="p-5 pb-4" style={{ background: `linear-gradient(135deg, ${def.accent}22, transparent)` }}>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2.5">
                  {isBh ? <BhLogo size={44} /> : (
                    <span className="grid h-11 w-11 place-items-center rounded-2xl text-2xl shadow-lg" style={{ background: def.accent }}>
                      {def.logoEmoji}
                    </span>
                  )}
                  <span>
                    <span className="block text-base font-black leading-tight">{siteName}</span>
                    <span className="block text-[10px] font-bold uppercase tracking-widest opacity-50">
                      {isBh ? bh.tx("গার্মেন্টস বায়িং হাউস", "Garments Buying House") : def.layout === "shop" ? "অনলাইন শপ" : def.layout === "service" ? "সার্ভিস" : def.layout === "booking" ? "বুকিং" : def.layout === "news" ? "নিউজ পোর্টাল" : "ওয়েবসাইট"}
                    </span>
                  </span>
                </span>
                <button onClick={() => setDrawer(false)} aria-label={L("বন্ধ", "Close")} className="grid h-9 w-9 place-items-center rounded-full bg-black/10 text-lg transition hover:scale-105">✕</button>
              </div>
              {/* User profile card */}
              {store.user ? (
                <Link href={`${base}/account`} onClick={() => setDrawer(false)}
                  className={`mt-4 flex items-center gap-3 rounded-2xl p-3 transition ${dark ? "bg-white/10 hover:bg-white/15" : "bg-slate-100 hover:bg-slate-200"}`}>
                  <span className="grid h-10 w-10 place-items-center rounded-full text-lg font-black text-white" style={{ background: def.accent }}>
                    {store.user.name.charAt(0)}
                  </span>
                  <span className="flex-1">
                    <span className="block text-sm font-black">{store.user.name}</span>
                    <span className="block text-[11px] opacity-60">{store.user.phone}</span>
                  </span>
                  <span className="text-lg">›</span>
                </Link>
              ) : (
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Link href={`${base}/login`} onClick={() => setDrawer(false)}
                    className="rounded-xl py-2.5 text-center text-sm font-black text-white shadow-lg transition hover:brightness-110" style={{ background: def.accent }}>
                    {L("🔑 লগইন", "🔑 Login")}
                  </Link>
                  <Link href={`${base}/signup`} onClick={() => setDrawer(false)}
                    className={`rounded-xl py-2.5 text-center text-sm font-black transition ${dark ? "bg-white/10 hover:bg-white/20" : "bg-slate-100 hover:bg-slate-200"}`}>
                    {L("📝 সাইন আপ", "📝 Sign Up")}
                  </Link>
                </div>
              )}
            </div>
            <div className="flex-1 px-4 pb-4">
            <form onSubmit={goSearch} className="mt-1">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={isBh ? bh.tx("🔍 খুঁজুন...", "🔍 Search...") : "🔍 খুঁজুন..."}
                className={`w-full ${dt.search} border px-4 py-2.5 text-sm outline-none ${dark ? "border-white/15 bg-white/5 text-white" : "border-slate-200 bg-slate-50"}`}
              />
            </form>
            <p className="mb-1 mt-5 text-[11px] font-bold uppercase tracking-wider opacity-50">{L("মেনু", "Menu")}</p>
            <nav className="space-y-1">
              {links.map((l) => (
                <Link key={l.href} href={`${base}${l.href}`} onClick={() => setDrawer(false)}
                  className={`flex items-center justify-between ${dt.item} px-4 py-3 font-bold transition ${dark ? "hover:bg-white/10" : "hover:bg-slate-100"}`}>
                  <span>{l.label}</span>
                  <span className="opacity-30">›</span>
                </Link>
              ))}
            </nav>
            {isBh && (
              <>
                <p className="mb-1 mt-5 text-[11px] font-bold uppercase tracking-wider opacity-50">{bh.tx("ভাষা", "Language", "भाषा")}</p>
                <div className="flex gap-2">
                  <button onClick={() => bh.setLang("en")} className={`flex-1 rounded-xl py-2.5 text-sm font-black transition ${bh.lang === "en" ? "text-white shadow-lg" : dark ? "bg-white/10 hover:bg-white/20" : "bg-slate-100 hover:bg-slate-200"}`} style={bh.lang === "en" ? { background: def.accent } : undefined}>English</button>
                  <button onClick={() => bh.setLang("bn")} className={`flex-1 rounded-xl py-2.5 text-sm font-black transition ${bh.lang === "bn" ? "text-white shadow-lg" : dark ? "bg-white/10 hover:bg-white/20" : "bg-slate-100 hover:bg-slate-200"}`} style={bh.lang === "bn" ? { background: def.accent } : undefined}>বাংলা</button>
                  <button onClick={() => bh.setLang("hi")} className={`flex-1 rounded-xl py-2.5 text-sm font-black transition ${bh.lang === "hi" ? "text-white shadow-lg" : dark ? "bg-white/10 hover:bg-white/20" : "bg-slate-100 hover:bg-slate-200"}`} style={bh.lang === "hi" ? { background: def.accent } : undefined}>हिन्दी</button>
                </div>
              </>
            )}
            {dl && (
              <>
                <p className="mb-1 mt-5 text-[11px] font-bold uppercase tracking-wider opacity-50">Language</p>
                <DemoLangSwitcher accent={def.accent} />
              </>
            )}
            {(def.layout === "shop" || def.layout === "jewelry" || def.layout === "gallery" || def.layout === "news") && def.cats.length > 1 && (
              <>
                <p className="mb-1 mt-5 text-[11px] font-bold uppercase tracking-wider opacity-50">ক্যাটাগরি</p>
                <div className="flex flex-wrap gap-2">
                  {def.cats.filter((c) => c !== "সব" && c !== "All").map((c) => (
                    <Link
                      key={c}
                      href={def.layout === "news" ? `${base}/cat/${encodeURIComponent(c)}` : def.layout === "gallery" ? `${base}/gallery?cat=${encodeURIComponent(c)}` : `${base}/c/${encodeURIComponent(c)}`}
                      onClick={() => setDrawer(false)}
                      className={`rounded-full px-3.5 py-1.5 text-xs font-bold ${dark ? "bg-white/10 hover:bg-white/20" : "bg-slate-100 hover:bg-slate-200"}`}
                    >
                      {c}
                    </Link>
                  ))}
                </div>
              </>
            )}
            <p className="mb-1 mt-5 text-[11px] font-bold uppercase tracking-wider opacity-50">{L("আমার", "Account")}</p>
            <nav className="space-y-1">
              {store.user ? (
                <>
                  {(def.layout === "shop" || def.layout === "jewelry") && <Link href={`${base}/orders`} onClick={() => setDrawer(false)} className={`flex items-center justify-between ${dt.item} px-4 py-3 font-bold ${dark ? "hover:bg-white/10" : "hover:bg-slate-100"}`}><span>📦 আমার অর্ডার</span><span className="opacity-30">›</span></Link>}
                  {(def.layout === "shop" || def.layout === "booking") && <Link href={`${base}/wallet`} onClick={() => setDrawer(false)} className={`flex items-center justify-between ${dt.item} px-4 py-3 font-bold ${dark ? "hover:bg-white/10" : "hover:bg-slate-100"}`}><span>💳 Wallet</span><span className="opacity-30">›</span></Link>}
                  {(def.layout === "service" || def.layout === "gallery" || def.layout === "booking") && <Link href={`${base}/my-bookings`} onClick={() => setDrawer(false)} className={`flex items-center justify-between ${dt.item} px-4 py-3 font-bold ${dark ? "hover:bg-white/10" : "hover:bg-slate-100"}`}><span>📅 আমার বুকিং</span><span className="opacity-30">›</span></Link>}
                  {def.layout === "invest" && <Link href={`${base}/dashboard`} onClick={() => setDrawer(false)} className={`flex items-center justify-between ${dt.item} px-4 py-3 font-bold ${dark ? "hover:bg-white/10" : "hover:bg-slate-100"}`}><span>💼 My investments</span><span className="opacity-30">›</span></Link>}
                  {def.layout === "exchange" && <Link href={`${base}/track`} onClick={() => setDrawer(false)} className={`flex items-center justify-between ${dt.item} px-4 py-3 font-bold ${dark ? "hover:bg-white/10" : "hover:bg-slate-100"}`}><span>📍 এক্সচেঞ্জ ট্র্যাক</span><span className="opacity-30">›</span></Link>}
                  {def.layout === "wallet" && <Link href={`${base}/wallet`} onClick={() => setDrawer(false)} className={`flex items-center justify-between ${dt.item} px-4 py-3 font-bold ${dark ? "hover:bg-white/10" : "hover:bg-slate-100"}`}><span>👛 My wallet</span><span className="opacity-30">›</span></Link>}
                </>
              ) : (
                <p className={`px-4 py-2 text-xs ${dark ? "text-slate-400" : "text-slate-500"}`}>
                  {L("💡 লগইন করলে অর্ডার হিস্ট্রি ও অফার পাবেন", "💡 Log in to track your RFQs and orders")}
                </p>
              )}
            </nav>
            </div>
            <div className={`mx-4 mb-4 mt-auto rounded-2xl p-4 text-sm ${dark ? "bg-white/5" : "bg-slate-50"}`}>
              <p className="font-bold">{isBh ? bh.dg(def.contact) : def.contact}</p>
              <p className="mt-1 text-xs opacity-60">{isBh ? bh.tx(def.hours, EN_HOURS) : def.hours}</p>
              <Link href={`${base}/admin`} onClick={() => setDrawer(false)} className="mt-2 inline-block text-xs font-bold opacity-50 hover:opacity-100">
                ⚙️ {isBh ? bh.tx(clientSlug ? "অ্যাডমিন প্যানেল" : "ডেমো অ্যাডমিন", clientSlug ? "Admin Panel" : "Demo Admin") : clientSlug ? "অ্যাডমিন প্যানেল" : "ডেমো অ্যাডমিন"}
              </Link>
            </div>
          </aside>
        </div>
      )}

      {/* ===== page ===== */}
      {clientSlug && <AdSlot slot="ad_top" />}
      <main className={def.layout === "casino" ? "pb-20" : ""}>{children}</main>
      {clientSlug && <AdSlot slot="ad_bottom" />}

      {/* ===== casino app bottom nav (MegaPari-style) ===== */}
      {def.layout === "casino" && (
        <nav className="fixed bottom-0 left-0 right-0 z-[70] border-t border-white/10 bg-[#0d1322]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md">
          <div className="mx-auto flex max-w-lg items-end justify-around px-2">
            <Link href={base} className="flex flex-col items-center gap-0.5 py-2 text-slate-300 transition active:scale-95">
              <span className="text-xl">🔥</span>
              <span className="text-[10px] font-bold">জনপ্রিয়</span>
            </Link>
            <Link href={`${base}/games`} className="flex flex-col items-center gap-0.5 py-2 text-slate-300 transition active:scale-95">
              <span className="text-xl">⭐</span>
              <span className="text-[10px] font-bold">ফেভারিট</span>
            </Link>
            <Link href={`${base}/betslip`} className="relative -top-3 flex flex-col items-center transition active:scale-95">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-b from-red-500 to-red-700 text-xl shadow-lg shadow-red-900/50 ring-4 ring-[#0d1322]">🧾</span>
              <span className="mt-0.5 text-[10px] font-bold text-slate-200">বেট স্লিপ</span>
            </Link>
            <Link href={`${base}/bet-history`} className="flex flex-col items-center gap-0.5 py-2 text-slate-300 transition active:scale-95">
              <span className="text-xl">🕘</span>
              <span className="text-[10px] font-bold">ইতিহাস</span>
            </Link>
            <button onClick={() => setDrawer(true)} className="flex flex-col items-center gap-0.5 py-2 text-slate-300 transition active:scale-95">
              <span className="text-xl">▦</span>
              <span className="text-[10px] font-bold">মেনু</span>
            </button>
          </div>
        </nav>
      )}

      {/* ===== footer ===== */}
      <footer className={`mt-10 border-t ${dark ? "border-white/10 bg-black/30" : "border-slate-200 bg-white"}`}>
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="flex items-center gap-2 text-lg font-black">{isBh ? <BhLogo size={30} /> : <span className="text-2xl">{def.logoEmoji}</span>}{siteName}</p>
            <p className="mt-2 text-xs leading-relaxed opacity-60">{(isBh ? bh.tx(def.about, EN_ABOUT) : def.about).slice(0, 120)}...</p>
          </div>
          <div>
            <p className="mb-3 text-sm font-black">{L("লিংক", "Links")}</p>
            <div className="space-y-2 text-sm opacity-70">
              {links.slice(0, 5).map((l) => (
                <Link key={l.href} href={`${base}${l.href}`} className="block hover:opacity-100 hover:underline">{l.label}</Link>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-3 text-sm font-black">{L("অ্যাকাউন্ট", "Account")}</p>
            <div className="space-y-2 text-sm opacity-70">
              {store.user ? (
                <>
                  <Link href={`${base}/account`} className="block hover:underline">{L("👤 আমার অ্যাকাউন্ট", "👤 My Account")}</Link>
                  {(def.layout === "shop" || def.layout === "jewelry") && <Link href={`${base}/orders`} className="block hover:underline">📦 আমার অর্ডার</Link>}
                  {(def.layout === "shop" || def.layout === "booking") && <Link href={`${base}/wallet`} className="block hover:underline">💳 Wallet</Link>}
                </>
              ) : (
                <>
                  <Link href={`${base}/login`} className="block hover:underline">{L("🔑 লগইন", "🔑 Login")}</Link>
                  <Link href={`${base}/signup`} className="block hover:underline">{L("📝 সাইন আপ", "📝 Sign Up")}</Link>
                </>
              )}
              {def.layout === "shop" && <Link href={`${base}/track`} className="block hover:underline">📍 অর্ডার ট্র্যাক</Link>}
            </div>
          </div>
          <div>
            <p className="mb-3 text-sm font-black">{L("তথ্য", "Information")}</p>
            <div className="space-y-2 text-sm opacity-70">
              <Link href={`${base}/faq`} className="block hover:underline">{L("❓ সচরাচর জিজ্ঞাসা", "❓ FAQ")}</Link>
              {def.layout === "shop" && (
                <>
                  <Link href={`${base}/shipping`} className="block hover:underline">🚚 ডেলিভারি নীতি</Link>
                  <Link href={`${base}/returns`} className="block hover:underline">↩️ রিটার্ন নীতি</Link>
                  <Link href={`${base}/privacy`} className="block hover:underline">🔒 প্রাইভেসি</Link>
                  <Link href={`${base}/terms`} className="block hover:underline">📜 শর্তাবলী</Link>
                </>
              )}
            </div>
          </div>
          <div>
            <p className="mb-3 text-sm font-black">{L("যোগাযোগ", "Contact")}</p>
            <div className="space-y-2 text-sm opacity-70">
              <p>📞 {isBh ? bh.dg(def.contact) : def.contact}</p>
              <p>📍 {isBh ? bh.tx(def.address, EN_ADDRESS) : def.address}</p>
              <p>🕘 {isBh ? bh.tx(def.hours, EN_HOURS) : def.hours}</p>
            </div>
          </div>
        </div>
        <div className={`border-t py-4 text-center text-xs opacity-50 ${dark ? "border-white/10" : "border-slate-200"}`}>
          © {isBh && bh.lang === "en" ? new Date().getFullYear() : dl && dl.lang !== "bn" ? new Date().getFullYear() : toBnDigits(new Date().getFullYear())} {siteName}{clientSlug ? "" : isBh ? bh.tx(" • ডেমো ওয়েবসাইট", " • Demo Website") : dl && dl.lang !== "bn" ? " • Demo Website" : " • ডেমো ওয়েবসাইট"}
        </div>
      </footer>
    </div>
  );
}
