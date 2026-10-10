"use client";

/** DemoSite chrome — navbar with hamburger drawer, search, account/cart, footer.
 * Makes every demo feel like a complete, original website.
 */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toBnDigits } from "@/lib/format";
import { useDemo } from "./store";

function navLinks(layout: string): { label: string; href: string }[] {
  switch (layout) {
    case "shop":
      return [
        { label: "🏠 হোম", href: "" },
        { label: "🛍️ শপ", href: "/shop" },
        { label: "🎁 অফার", href: "/offers" },
        { label: "📍 ট্র্যাক অর্ডার", href: "/track" },
        { label: "ℹ️ সম্পর্কে", href: "/about" },
        { label: "📞 যোগাযোগ", href: "/contact" },
      ];
    case "service":
      return [
        { label: "🏠 হোম", href: "" },
        { label: "🛠️ সার্ভিসেস", href: "/services" },
        { label: "⭐ রিভিউ", href: "/reviews" },
        { label: "ℹ️ সম্পর্কে", href: "/about" },
        { label: "📞 যোগাযোগ", href: "/contact" },
      ];
    case "gallery":
      return [
        { label: "🏠 হোম", href: "" },
        { label: "🖼️ গ্যালারি", href: "/gallery" },
        { label: "💰 প্রাইসিং", href: "/pricing" },
        { label: "📅 বুকিং", href: "/book" },
        { label: "ℹ️ সম্পর্কে", href: "/about" },
        { label: "📞 যোগাযোগ", href: "/contact" },
      ];
    case "booking":
      return [
        { label: "🏠 হোম", href: "" },
        { label: "🏨 লিস্টিং", href: "/stays" },
        { label: "📅 আমার বুকিং", href: "/my-bookings" },
        { label: "ℹ️ সম্পর্কে", href: "/about" },
        { label: "📞 যোগাযোগ", href: "/contact" },
      ];
    default:
      return [
        { label: "🏠 হোম", href: "" },
        { label: "ℹ️ সম্পর্কে", href: "/about" },
        { label: "📞 যোগাযোগ", href: "/contact" },
      ];
  }
}

export default function Chrome({ children }: { children: React.ReactNode }) {
  const { def, base, store } = useDemo();
  const router = useRouter();
  const [drawer, setDrawer] = useState(false);
  const [q, setQ] = useState("");
  const [mSearch, setMSearch] = useState(false);
  const links = navLinks(def.layout);
  const dark = def.dark;
  const showCart = def.layout === "shop";

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
      {/* ===== top navbar ===== */}
      <header className={`sticky top-0 z-[60] backdrop-blur-md ${dark ? "bg-[#0a0a12]/90 border-b border-white/10" : "bg-white/90 border-b border-slate-200"}`}>
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3">
          <button
            onClick={() => setDrawer(true)}
            aria-label="মেনু"
            className={`grid h-10 w-10 place-items-center rounded-xl text-xl transition hover:scale-105 ${dark ? "bg-white/10 hover:bg-white/20" : "bg-slate-100 hover:bg-slate-200"}`}
          >
            ☰
          </button>
          <Link href={base} className="flex items-center gap-2">
            <span className="text-2xl">{def.logoEmoji}</span>
            <span className="text-lg font-black tracking-tight">{def.name}</span>
          </Link>
          <form onSubmit={goSearch} className="mx-2 hidden flex-1 md:block">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={`🔍 ${def.layout === "news" ? "খবর" : def.layout === "shop" ? "পণ্য" : "খুঁজুন"}...`}
              className={`w-full rounded-full border px-4 py-2 text-sm outline-none ${
                dark ? "border-white/15 bg-white/5 text-white placeholder:text-slate-500" : "border-slate-200 bg-slate-100 placeholder:text-slate-400"
              }`}
            />
          </form>
          <div className="ml-auto flex items-center gap-1.5">
            <button
              onClick={() => setMSearch((v) => !v)}
              aria-label="সার্চ"
              className={`grid h-10 w-10 place-items-center rounded-xl text-lg md:hidden ${dark ? "bg-white/10" : "bg-slate-100"}`}
            >
              🔍
            </button>
            <Link
              href={`${base}/${store.user ? "account" : "login"}`}
              aria-label="অ্যাকাউন্ট"
              className={`grid h-10 w-10 place-items-center rounded-xl text-lg ${dark ? "bg-white/10 hover:bg-white/20" : "bg-slate-100 hover:bg-slate-200"}`}
            >
              {store.user ? <span className="grid h-7 w-7 place-items-center rounded-full text-sm font-black text-white" style={{ background: def.accent }}>{store.user.name[0]}</span> : "👤"}
            </Link>
            {showCart && (
              <Link
                href={`${base}/cart`}
                aria-label="কার্ট"
                className={`relative grid h-10 w-10 place-items-center rounded-xl text-lg ${dark ? "bg-white/10 hover:bg-white/20" : "bg-slate-100 hover:bg-slate-200"}`}
              >
                🛒
                {store.cartCount > 0 && (
                  <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full px-1 text-[10px] font-black text-white" style={{ background: def.accent }}>
                    {toBnDigits(store.cartCount)}
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
              placeholder="🔍 খুঁজুন..."
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
          <aside className={`absolute left-0 top-0 flex h-full w-80 max-w-[85vw] flex-col overflow-y-auto p-5 shadow-2xl animate-drawer-in ${dark ? "bg-[#101828] text-white" : "bg-white text-slate-800"}`}>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-lg font-black">
                <span className="text-2xl">{def.logoEmoji}</span> {def.name}
              </span>
              <button onClick={() => setDrawer(false)} aria-label="বন্ধ" className="grid h-9 w-9 place-items-center rounded-full bg-black/10 text-lg">✕</button>
            </div>
            <form onSubmit={goSearch} className="mt-4">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="🔍 খুঁজুন..."
                className={`w-full rounded-2xl border px-4 py-2.5 text-sm outline-none ${dark ? "border-white/15 bg-white/5 text-white" : "border-slate-200 bg-slate-50"}`}
              />
            </form>
            <p className="mb-1 mt-5 text-[11px] font-bold uppercase tracking-wider opacity-50">মেনু</p>
            <nav className="space-y-1">
              {links.map((l) => (
                <Link key={l.href} href={`${base}${l.href}`} onClick={() => setDrawer(false)}
                  className={`block rounded-xl px-4 py-3 font-bold transition ${dark ? "hover:bg-white/10" : "hover:bg-slate-100"}`}>
                  {l.label}
                </Link>
              ))}
            </nav>
            {(def.layout === "shop" || def.layout === "gallery" || def.layout === "news") && def.cats.length > 1 && (
              <>
                <p className="mb-1 mt-5 text-[11px] font-bold uppercase tracking-wider opacity-50">ক্যাটাগরি</p>
                <div className="flex flex-wrap gap-2">
                  {def.cats.filter((c) => c !== "সব").map((c) => (
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
            <p className="mb-1 mt-5 text-[11px] font-bold uppercase tracking-wider opacity-50">অ্যাকাউন্ট</p>
            <nav className="space-y-1">
              {store.user ? (
                <>
                  <Link href={`${base}/account`} onClick={() => setDrawer(false)} className={`block rounded-xl px-4 py-3 font-bold ${dark ? "hover:bg-white/10" : "hover:bg-slate-100"}`}>👤 {store.user.name}</Link>
                  {def.layout === "shop" && <Link href={`${base}/orders`} onClick={() => setDrawer(false)} className={`block rounded-xl px-4 py-3 font-bold ${dark ? "hover:bg-white/10" : "hover:bg-slate-100"}`}>📦 আমার অর্ডার</Link>}
                  {(def.layout === "shop" || def.layout === "booking") && <Link href={`${base}/wallet`} onClick={() => setDrawer(false)} className={`block rounded-xl px-4 py-3 font-bold ${dark ? "hover:bg-white/10" : "hover:bg-slate-100"}`}>💳 ওয়ালেট</Link>}
                  {(def.layout === "service" || def.layout === "gallery" || def.layout === "booking") && <Link href={`${base}/my-bookings`} onClick={() => setDrawer(false)} className={`block rounded-xl px-4 py-3 font-bold ${dark ? "hover:bg-white/10" : "hover:bg-slate-100"}`}>📅 আমার বুকিং</Link>}
                </>
              ) : (
                <>
                  <Link href={`${base}/login`} onClick={() => setDrawer(false)} className={`block rounded-xl px-4 py-3 font-bold ${dark ? "hover:bg-white/10" : "hover:bg-slate-100"}`}>🔑 লগইন</Link>
                  <Link href={`${base}/signup`} onClick={() => setDrawer(false)} className={`block rounded-xl px-4 py-3 font-bold ${dark ? "hover:bg-white/10" : "hover:bg-slate-100"}`}>📝 সাইন আপ</Link>
                </>
              )}
            </nav>
            <div className={`mt-auto rounded-2xl p-4 pt-4 text-sm ${dark ? "bg-white/5" : "bg-slate-50"}`}>
              <p className="font-bold">{def.contact}</p>
              <p className="mt-1 text-xs opacity-60">{def.hours}</p>
            </div>
          </aside>
        </div>
      )}

      {/* ===== page ===== */}
      <main>{children}</main>

      {/* ===== footer ===== */}
      <footer className={`mt-10 border-t ${dark ? "border-white/10 bg-black/30" : "border-slate-200 bg-white"}`}>
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="flex items-center gap-2 text-lg font-black"><span className="text-2xl">{def.logoEmoji}</span>{def.name}</p>
            <p className="mt-2 text-xs leading-relaxed opacity-60">{def.about.slice(0, 120)}...</p>
          </div>
          <div>
            <p className="mb-3 text-sm font-black">লিংক</p>
            <div className="space-y-2 text-sm opacity-70">
              {links.slice(0, 5).map((l) => (
                <Link key={l.href} href={`${base}${l.href}`} className="block hover:opacity-100 hover:underline">{l.label}</Link>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-3 text-sm font-black">অ্যাকাউন্ট</p>
            <div className="space-y-2 text-sm opacity-70">
              {store.user ? (
                <>
                  <Link href={`${base}/account`} className="block hover:underline">👤 আমার অ্যাকাউন্ট</Link>
                  {def.layout === "shop" && <Link href={`${base}/orders`} className="block hover:underline">📦 আমার অর্ডার</Link>}
                  {(def.layout === "shop" || def.layout === "booking") && <Link href={`${base}/wallet`} className="block hover:underline">💳 ওয়ালেট</Link>}
                </>
              ) : (
                <>
                  <Link href={`${base}/login`} className="block hover:underline">🔑 লগইন</Link>
                  <Link href={`${base}/signup`} className="block hover:underline">📝 সাইন আপ</Link>
                </>
              )}
              {def.layout === "shop" && <Link href={`${base}/track`} className="block hover:underline">📍 অর্ডার ট্র্যাক</Link>}
            </div>
          </div>
          <div>
            <p className="mb-3 text-sm font-black">যোগাযোগ</p>
            <div className="space-y-2 text-sm opacity-70">
              <p>📞 {def.contact}</p>
              <p>📍 {def.address}</p>
              <p>🕘 {def.hours}</p>
            </div>
          </div>
        </div>
        <div className={`border-t py-4 text-center text-xs opacity-50 ${dark ? "border-white/10" : "border-slate-200"}`}>
          © {toBnDigits(new Date().getFullYear())} {def.name} • ডেমো ওয়েবসাইট
        </div>
      </footer>
    </div>
  );
}
