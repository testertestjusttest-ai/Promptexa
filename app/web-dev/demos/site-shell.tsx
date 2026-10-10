"use client";

import { useState } from "react";

export type SiteNavLink = { label: string; href: string };

/**
 * Universal website chrome for every demo — real navbar with hamburger
 * drawer, working search, cart button, and a complete footer.
 * Makes each demo feel like an original, complete website.
 */
export default function SiteShell({
  logo,
  accent = "#d7ff3f",
  dark = true,
  links = [],
  categories = [],
  onCategory,
  activeCategory,
  onSearch,
  searchPlaceholder = "🔍 খুঁজুন...",
  cartCount,
  onCartOpen,
  contact = "📞 ০১XXXXXXXXX",
  children,
}: {
  logo: string;
  accent?: string;
  dark?: boolean;
  links?: SiteNavLink[];
  categories?: string[];
  onCategory?: (c: string) => void;
  activeCategory?: string;
  onSearch?: (q: string) => void;
  searchPlaceholder?: string;
  cartCount?: number;
  onCartOpen?: () => void;
  contact?: string;
  children: React.ReactNode;
}) {
  const [drawer, setDrawer] = useState(false);
  const [q, setQ] = useState("");
  const bg = dark ? "bg-[#0a0a12] text-white" : "bg-white text-slate-800";
  const barBg = dark ? "bg-[#0d1322]/95" : "bg-white/95";
  const muted = dark ? "text-slate-400" : "text-slate-500";
  const card = dark ? "bg-white/5" : "bg-slate-100";

  const submitSearch = (v: string) => {
    setQ(v);
    onSearch?.(v);
  };

  const drawerBody = (
    <>
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <span className="text-lg font-black text-white">{logo}</span>
        <button onClick={() => setDrawer(false)} aria-label="বন্ধ করুন"
          className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-lg text-white">✕</button>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {onSearch && (
          <input value={q} onChange={(e) => submitSearch(e.target.value)} placeholder={searchPlaceholder}
            className="mb-4 w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-white/40" />
        )}
        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">মেনু</p>
        <div className="mt-2 space-y-1">
          {[{ label: "🏠 হোম", href: "#site-top" }, ...links].map((l) => (
            <a key={l.label + l.href} href={l.href} onClick={() => setDrawer(false)}
              className="block rounded-xl px-3 py-2.5 text-[15px] font-bold text-slate-200 transition hover:bg-white/10">
              {l.label}
            </a>
          ))}
        </div>
        {categories.length > 0 && (
          <>
            <p className="mt-5 text-[11px] font-bold uppercase tracking-widest text-slate-500">ক্যাটাগরি</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {categories.map((c) => (
                <button key={c} onClick={() => { onCategory?.(c); setDrawer(false); }}
                  className={`rounded-full px-4 py-2 text-sm font-bold ${activeCategory === c ? "text-black" : "bg-white/10 text-slate-200"}`}
                  style={activeCategory === c ? { background: accent } : undefined}>
                  {c}
                </button>
              ))}
            </div>
          </>
        )}
        <div className="mt-6 rounded-2xl bg-white/5 p-4">
          <p className="text-sm font-bold text-white">📞 যোগাযোগ</p>
          <p className="mt-1 text-xs text-slate-400">{contact}</p>
          <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
            💡 এটি একটি ডেমো ওয়েবসাইট — DigiPlyra দিয়ে আপনার জন্য এরকম সাইট বানিয়ে দেওয়া হবে।
          </p>
        </div>
      </div>
    </>
  );

  return (
    <div id="site-top" className={`${bg} min-h-[60vh]`}>
      {/* ===== navbar ===== */}
      <header className={`sticky top-0 z-40 border-b backdrop-blur-xl ${barBg} ${dark ? "border-white/10" : "border-slate-200"}`}>
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3 sm:gap-4">
          <button onClick={() => setDrawer(true)} aria-label="মেনু"
            className="btn-demo-icon grid h-10 w-10 shrink-0 place-items-center rounded-xl text-lg font-black"
            style={{ background: accent, color: "#000" }}>
            ☰
          </button>
          <span className="truncate text-base font-black sm:text-lg">{logo}</span>
          <nav className="ml-2 hidden items-center gap-1 lg:flex">
            {links.slice(0, 4).map((l) => (
              <a key={l.label} href={l.href} className={`rounded-lg px-3 py-2 text-sm font-bold ${muted} transition hover:text-current`}>
                {l.label}
              </a>
            ))}
          </nav>
          <div className="flex-1" />
          {onSearch && (
            <input value={q} onChange={(e) => submitSearch(e.target.value)} placeholder={searchPlaceholder}
              className={`hidden w-44 rounded-full border px-4 py-2 text-sm outline-none transition focus:w-56 md:block ${dark ? "border-white/15 bg-white/5 text-white placeholder:text-slate-500" : "border-slate-200 bg-slate-100 text-slate-800"}`} />
          )}
          {cartCount !== undefined && (
            <button onClick={onCartOpen} className="btn-demo relative shrink-0 !rounded-full !px-4 !py-2 text-sm" style={{ background: accent }}>
              🛒 <span className="font-black">{cartCount}</span>টি
            </button>
          )}
        </div>
      </header>

      {/* ===== drawer ===== */}
      {drawer && (
        <div className="fixed inset-0 z-[80]" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDrawer(false)} />
          <div className="absolute bottom-0 left-0 top-0 flex w-[84vw] max-w-sm animate-drawer-in flex-col bg-[#0d1322] shadow-2xl">
            {drawerBody}
          </div>
        </div>
      )}

      {/* ===== page content ===== */}
      {children}

      {/* ===== footer ===== */}
      <footer className={`mt-0 border-t ${dark ? "border-white/10 bg-[#070b14]" : "border-slate-200 bg-slate-50"}`}>
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:grid-cols-3">
          <div>
            <p className="font-black">{logo}</p>
            <p className={`mt-2 text-xs leading-relaxed ${muted}`}>
              মানসম্মত সেবাই আমাদের অঙ্গীকার। অনলাইনে অর্ডার করুন — দ্রুত ডেলিভারি পান।
            </p>
          </div>
          <div>
            <p className="text-sm font-black">🔗 দরকারি লিংক</p>
            <div className={`mt-2 grid grid-cols-2 gap-1 text-xs ${muted}`}>
              {[{ label: "হোম", href: "#site-top" }, ...links].slice(0, 6).map((l) => (
                <a key={l.label} href={l.href} className="py-1 hover:underline">{l.label}</a>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-black">📞 যোগাযোগ</p>
            <p className={`mt-2 text-xs ${muted}`}>{contact}<br />প্রতিদিন সকাল ৯টা — রাত ১০টা</p>
          </div>
        </div>
        <div className={`border-t px-4 py-3 text-center text-[11px] ${dark ? "border-white/10 text-slate-500" : "border-slate-200 text-slate-400"}`}>
          © ২০২৬ {logo} <span className="opacity-70">(ডেমো)</span> • ⚡ DigiPlyra দিয়ে তৈরি
        </div>
      </footer>
    </div>
  );
}
