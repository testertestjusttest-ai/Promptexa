"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatBDT, toBnDigits } from "@/lib/format";
import { FF_HERO, resolveListingImage } from "@/lib/ffAssets";
import { useLang } from "@/lib/i18n";

type Listing = {
  id: string;
  title: string;
  description: string;
  price_bdt: number;
  game_uid: string;
  images: string[];
  views: number;
  created_at: string;
  featured_until?: string | null;
};

export default function MarketClient() {
  const { t } = useLang();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/marketplace")
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) setListings(d.listings);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="relative overflow-hidden rounded-3xl border border-white/10">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${FF_HERO})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#060913] via-[#060913]/70 to-[#060913]/30" />
        <div className="relative p-8 text-center sm:p-12">
          <span className="inline-block rounded-full bg-red-500/20 px-4 py-1.5 text-xs font-bold tracking-widest text-red-300 ring-1 ring-red-400/40">
            {t("m_badge")}
          </span>
          <h1 className="font-display mt-4 text-4xl font-black text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)] sm:text-5xl">
            {t("m_title_a")} <span className="bg-gradient-to-r from-amber-300 via-orange-400 to-red-400 bg-clip-text text-transparent">{t("m_title_b")}</span>
          </h1>
          <p className="mx-auto mt-3 max-w-2xl rounded-2xl bg-black/50 px-5 py-3 text-sm leading-relaxed text-slate-200 backdrop-blur-sm">
            {t("m_sub")}
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <Link href="/marketplace/sell" className="btn-vault inline-flex !px-8 !py-3 text-sm shadow-[0_0_24px_rgba(215,255,63,0.35)]">
              {t("m_sell")}
            </Link>
            <a href="#listings" className="inline-flex rounded-xl border border-white/20 bg-black/40 px-8 py-3 text-sm font-bold text-white backdrop-blur-sm transition hover:border-[#d7ff3f]/60">
              {t("m_browse")}
            </a>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-[11px] font-semibold">
            {["✅ এসক্রো সুরক্ষা", "💬 ইন-সাইট চ্যাট", "⚡ দ্রুত ডিল", "🛡️ অ্যাডমিন যাচাই"].map((t) => (
              <span key={t} className="rounded-full bg-white/10 px-3 py-1.5 text-slate-200 backdrop-blur-sm">{t}</span>
            ))}
          </div>
        </div>
      </div>

      {/* how escrow works */}
      <div className="mt-6 grid gap-3 sm:grid-cols-4">
        {[
          ["💰", "ক্রেতা পেমেন্ট করে", "টাকা DigiPlyra অ্যাডমিনের কাছে জমা"],
          ["👀", "বিক্রেতা দেখতে পায়", "অ্যাডমিন টাকা পেয়েছে — নিশ্চিন্তে ID দিন"],
          ["🎮", "ID হস্তান্তর", "ক্রেতাকে ID বুঝিয়ে দিন"],
          ["✅", "কনফার্ম → টাকা", "ক্রেতা 'পেয়েছি' বললেই বিক্রেতা টাকা পায়"],
        ].map(([i, t, d]) => (
          <div key={t} className="glass rounded-2xl p-4 text-center">
            <div className="text-2xl">{i}</div>
            <p className="mt-1 text-sm font-bold text-white">{t}</p>
            <p className="mt-1 text-xs text-slate-400">{d}</p>
          </div>
        ))}
      </div>

      <h2 id="listings" className="font-display mt-10 scroll-mt-24 text-xl font-bold text-white">
        🆕 {t("m_listings")} ({toBnDigits(listings.length)})
      </h2>

      {loading ? (
        <p className="mt-6 text-center text-slate-500">{t("c_loading")}</p>
      ) : listings.length === 0 ? (
        <div className="glass mt-6 rounded-3xl p-10 text-center">
          <p className="text-4xl">🏝️</p>
          <p className="mt-3 font-bold text-white">{t("m_empty_t")}</p>
          <p className="mt-1 text-sm text-slate-400">{t("m_empty_s")}</p>
        </div>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((l) => (
            <Link key={l.id} href={`/marketplace/${l.id}`} className="glass group overflow-hidden rounded-3xl transition hover:border-[#d7ff3f]/40">
              <div className="relative aspect-video overflow-hidden bg-black/30">
                {l.images[0] ? (
                  <img src={resolveListingImage(l.images[0])} alt={l.title} className="h-full w-full object-cover transition group-hover:scale-105" />
                ) : (
                  <div className="grid h-full place-items-center bg-gradient-to-br from-orange-900/40 via-[#0b1120] to-cyan-900/30">
                    <div className="text-center">
                      <div className="text-5xl">🎮</div>
                      <p className="mt-2 text-[10px] font-bold tracking-widest text-amber-300/80">FF ID</p>
                    </div>
                  </div>
                )}
                <span className="absolute right-3 top-3 rounded-full bg-black/70 px-3 py-1 text-xs font-bold text-[#d7ff3f]">
                  {formatBDT(Number(l.price_bdt))}
                </span>
                {l.featured_until && new Date(l.featured_until).getTime() > Date.now() && (
                  <span className="absolute left-3 top-3 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-3 py-1 text-xs font-bold text-black">
                    {t("c_featured")}
                  </span>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-bold text-white line-clamp-1">{l.title}</h3>
                <p className="mt-1 text-xs text-slate-500 line-clamp-2">{l.description}</p>
                <p className="mt-2 text-[11px] text-slate-500">👁️ {toBnDigits(l.views ?? 0)} {t("c_views")}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
