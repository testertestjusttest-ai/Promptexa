"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatBDT, toBnDigits } from "@/lib/format";

type Listing = {
  id: string;
  title: string;
  description: string;
  price_bdt: number;
  game_uid: string;
  images: string[];
  views: number;
  created_at: string;
};

export default function MarketClient() {
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
      <div className="glass ring-conic rounded-3xl p-8 text-center">
        <p className="text-5xl">🎮</p>
        <h1 className="font-display mt-3 text-3xl font-bold text-white">
          Free Fire <span className="text-[#d7ff3f]">ID বাজার</span>
        </h1>
        <p className="mx-auto mt-2 max-w-2xl text-sm text-slate-400">
          ১০০% নিরাপদে ID বেচাকেনা — টাকা আগে <b className="text-white">অ্যাডমিনের কাছে</b> জমা থাকে,
          আইডি হাতে পেয়ে কনফার্ম করলেই বিক্রেতা টাকা পায়। 🛡️
        </p>
        <Link href="/marketplace/sell" className="btn-vault mt-5 inline-flex !px-8 !py-3 text-sm">
          📢 আমার ID বিক্রি করুন
        </Link>
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

      <h2 className="font-display mt-10 text-xl font-bold text-white">
        🆕 বিক্রির জন্য ID ({toBnDigits(listings.length)})
      </h2>

      {loading ? (
        <p className="mt-6 text-center text-slate-500">লোড হচ্ছে...</p>
      ) : listings.length === 0 ? (
        <div className="glass mt-6 rounded-3xl p-10 text-center">
          <p className="text-4xl">🏝️</p>
          <p className="mt-3 font-bold text-white">এখনো কোনো ID বিক্রির জন্য নেই</p>
          <p className="mt-1 text-sm text-slate-400">প্রথম বিক্রেতা হয়ে যান!</p>
        </div>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((l) => (
            <Link key={l.id} href={`/marketplace/${l.id}`} className="glass group overflow-hidden rounded-3xl transition hover:border-[#d7ff3f]/40">
              <div className="relative aspect-video overflow-hidden bg-black/30">
                {l.images[0] ? (
                  <img src={l.images[0]} alt={l.title} className="h-full w-full object-cover transition group-hover:scale-105" />
                ) : (
                  <div className="grid h-full place-items-center text-4xl">🎮</div>
                )}
                <span className="absolute right-3 top-3 rounded-full bg-black/70 px-3 py-1 text-xs font-bold text-[#d7ff3f]">
                  {formatBDT(Number(l.price_bdt))}
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-white line-clamp-1">{l.title}</h3>
                <p className="mt-1 text-xs text-slate-500 line-clamp-2">{l.description}</p>
                <p className="mt-2 text-[11px] text-slate-500">👁️ {toBnDigits(l.views ?? 0)} বার দেখা হয়েছে</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
