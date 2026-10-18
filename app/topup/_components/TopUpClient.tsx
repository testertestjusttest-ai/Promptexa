"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatBDT, toBnDigits } from "@/lib/format";
import type { TopUpPackage, TopUpOrder } from "@/lib/topup";
import { topupStatusBn } from "@/lib/topup";
import {
  soundEnabled,
  setSoundEnabled,
  gunshot,
  initTapGuns,
  sfxClick,
  sfxSelect,
  sfxFanfare,
  speakBn,
  VOICE,
} from "@/lib/topupSound";

/** card artwork by package size */
function packArt(p: TopUpPackage): string | null {
  if (p.kind === "membership") return null;
  if (p.diamonds >= 1000) return "/topup/pack-legend.webp";
  if (p.diamonds >= 200) return "/topup/pack-gold.webp";
  return "/topup/pack-bronze.webp";
}

const CAT_VOICE = {
  all: VOICE.catAll,
  offer: VOICE.catOffer,
  diamond: VOICE.catDiamond,
  membership: VOICE.catMembership,
} as const;

export default function TopUpClient({
  packages,
  userName,
}: {
  packages: TopUpPackage[];
  userName?: string | null;
}) {
  const router = useRouter();
  const [cat, setCat] = useState<"all" | "diamond" | "membership" | "offer">("all");
  const [soundOn, setSoundOn] = useState(true);
  const [stats, setStats] = useState<{
    total_delivered: number;
    today_delivered: number;
    recent: { package_name: string; phone: string }[];
  } | null>(null);

  const [trackPhone, setTrackPhone] = useState("");
  const [tracked, setTracked] = useState<TopUpOrder[] | null>(null);
  const [tracking, setTracking] = useState(false);

  // welcome voice fires as soon as the page shows — no tap needed.
  // (If the browser blocks speech before first interaction, the first tap replays it.)
  useEffect(() => {
    setSoundOn(soundEnabled());
    const cleanupGuns = initTapGuns();
    let welcomed = false;
    let fallbackTimer: ReturnType<typeof setTimeout> | null = null;

    const sayWelcome = () => {
      // first visit this session → full welcome; coming back → short prompt only
      let returning = false;
      try {
        returning = sessionStorage.getItem("topup_welcomed") === "1";
        sessionStorage.setItem("topup_welcomed", "1");
      } catch {
        /* ignore */
      }
      speakBn(returning ? VOICE.pickPackage : userName ? VOICE.welcomeUser(userName) : VOICE.welcome);
    };

    const tryWelcome = () => {
      if (typeof document !== "undefined" && document.hidden) return;
      if (!soundEnabled() || welcomed) return;
      welcomed = true;
      sayWelcome();
      // speech blocked without a user gesture? let the first tap replay it
      fallbackTimer = setTimeout(() => {
        try {
          if (
            typeof window !== "undefined" &&
            "speechSynthesis" in window &&
            !window.speechSynthesis.speaking &&
            !window.speechSynthesis.pending
          ) {
            welcomed = false;
          }
        } catch {
          /* ignore */
        }
      }, 700);
    };

    const welcomeTimer = setTimeout(tryWelcome, 1000);

    const go = () => {
      if (soundEnabled()) {
        sfxFanfare();
        if (!welcomed) {
          welcomed = true;
          fallbackTimer = setTimeout(sayWelcome, 900);
        }
      }
    };
    window.addEventListener("pointerdown", go, { once: true });
    window.addEventListener("keydown", go, { once: true });
    return () => {
      cleanupGuns();
      clearTimeout(welcomeTimer);
      if (fallbackTimer) clearTimeout(fallbackTimer);
      window.removeEventListener("pointerdown", go);
      window.removeEventListener("keydown", go);
    };
  }, []);

  useEffect(() => {
    fetch("/api/topup/stats")
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) setStats(d);
      })
      .catch(() => {});
  }, []);

  function goCheckout(p: TopUpPackage) {
    gunshot("sniper"); // same gunshot for every package (3000-diamond sound)
    sfxSelect();
    speakBn(VOICE.checkout(p.name));
    router.push(`/topup/checkout?package=${p.id}`);
  }

  async function track() {
    setTracked(null);
    if (!/^01[3-9]\d{8}$/.test(trackPhone.trim())) {
      setTracked([]);
      speakBn(VOICE.trackEmpty);
      return;
    }
    setTracking(true);
    try {
      const r = await fetch(`/api/topup/orders?phone=${encodeURIComponent(trackPhone.trim())}`);
      const d = await r.json();
      const list = (d.ok ? d.orders : []) as TopUpOrder[];
      setTracked(list);
      speakBn(list.length > 0 ? VOICE.trackFound(list.length) : VOICE.trackEmpty);
    } catch {
      setTracked([]);
      speakBn(VOICE.trackEmpty);
    } finally {
      setTracking(false);
    }
  }

  const list = packages.filter((p) => {
    if (cat === "diamond") return p.kind === "diamond";
    if (cat === "membership") return p.kind === "membership";
    if (cat === "offer") return p.old_price_bdt != null && Number(p.old_price_bdt) > Number(p.price_bdt);
    return true;
  });

  return (
    <div className="min-h-screen bg-[#0d0a07] text-white">
      {/* HERO */}
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <img src="/topup/hero.webp" alt="" className="h-full w-full object-cover opacity-50" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0d0a07]/40 via-[#0d0a07]/60 to-[#0d0a07]" />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 pb-10 pt-12 text-center sm:pt-16">
          <h1 className="text-3xl font-black tracking-tight sm:text-5xl">
            Free Fire <span className="bg-gradient-to-r from-amber-300 via-orange-400 to-red-500 bg-clip-text text-transparent">Diamond Top-Up</span>
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-orange-100/70 sm:text-base">
            Player UID দিন — <b className="text-amber-300">৫–১৫ মিনিটে</b> সরাসরি আপনার গেম
            অ্যাকাউন্টে ডায়মন্ড ডেলিভারি
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs font-bold">
            {["⚡ দ্রুত ডেলিভারি", "🔒 ১০০% নিরাপদ", "🇧🇩 বাংলাদেশ সার্ভার", "💬 ২৪/৭ সাপোর্ট"].map((c) => (
              <span key={c} className="rounded-full border border-orange-400/30 bg-orange-500/10 px-3 py-1.5 text-orange-100">
                {c}
              </span>
            ))}
          </div>
          {/* live proof */}
          {stats && stats.total_delivered > 0 && (
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs font-extrabold">
              <span className="rounded-full bg-emerald-500/15 px-3 py-1.5 text-emerald-300 ring-1 ring-emerald-400/30">
                🚚 মোট ডেলিভারি: {toBnDigits(stats.total_delivered)}
              </span>
              <span className="rounded-full bg-amber-500/15 px-3 py-1.5 text-amber-300 ring-1 ring-amber-400/30">
                ⚡ আজ: {toBnDigits(stats.today_delivered)}
              </span>
            </div>
          )}
        </div>

        {/* recent deliveries ticker */}
        {stats && stats.recent.length > 0 && (
          <div className="relative mx-auto max-w-6xl overflow-hidden px-4 pb-2">
            <style>{`@keyframes topup-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
            <div className="flex w-max animate-[topup-marquee_25s_linear_infinite] gap-3">
              {[...stats.recent, ...stats.recent].map((r, i) => (
                <span
                  key={i}
                  className="whitespace-nowrap rounded-full border border-emerald-400/20 bg-emerald-500/[0.07] px-3 py-1.5 text-[11px] font-bold text-emerald-100/80"
                >
                  ✅ {r.phone} → {r.package_name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-20">
        {/* STEPS — unique badges */}
        <div className="relative grid grid-cols-3 gap-2 sm:gap-4">
          <div className="absolute left-[18%] right-[18%] top-7 hidden h-[3px] rounded bg-gradient-to-r from-amber-500/10 via-amber-400/60 to-amber-500/10 sm:block" />
          {[
            ["১", "📦", "প্যাকেজ বেছে নিন", "পছন্দের ডায়মন্ড প্যাক সিলেক্ট করুন"],
            ["২", "💳", "UID ও পেমেন্ট দিন", "Player UID + বিকাশ/নগদে পেমেন্ট"],
            ["৩", "💎", "ডায়মন্ড পান", "৫–১৫ মিনিটে গেমে ডেলিভারি"],
          ].map(([n, icon, t, d]) => (
            <div key={t} className="relative rounded-3xl border border-orange-400/20 bg-gradient-to-b from-white/[0.05] to-transparent p-3 text-center sm:p-5">
              <div className="relative mx-auto flex h-14 w-14 items-center justify-center sm:h-16 sm:w-16">
                <span className="absolute inset-0 animate-ping rounded-full bg-amber-500/20 [animation-duration:2.5s]" />
                <span className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-300 via-orange-500 to-red-600 shadow-[0_0_28px_rgba(255,140,0,0.55)] ring-2 ring-amber-200/60" />
                <span className="relative text-xl font-black text-black sm:text-2xl">{n}</span>
              </div>
              <div className="mt-2 text-lg">{icon}</div>
              <p className="mt-1 text-xs font-extrabold sm:text-sm">{t}</p>
              <p className="mt-1 hidden text-xs text-orange-100/50 sm:block">{d}</p>
            </div>
          ))}
        </div>

        {/* PACKAGES */}
        <h2 className="mt-10 text-xl font-black sm:text-2xl">💎 প্যাকেজ সিলেক্ট করুন</h2>
        <p className="mt-1 text-xs text-orange-100/50">
          🎉 Free Fire-এর নতুন আপডেট/অফার এলে এখানেই নতুন প্যাকেজ যোগ হবে — পেজটি বুকমার্ক করে রাখুন
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {(
            [
              ["all", "📦 সব"],
              ["offer", "🔥 অফার"],
              ["diamond", "💎 ডায়মন্ড"],
              ["membership", "🎫 মেম্বারশিপ"],
            ] as const
          ).map(([k, label]) => (
            <button
              key={k}
              data-gun="smg"
              onClick={() => { gunshot("smg"); sfxClick(); setCat(k); speakBn(CAT_VOICE[k]); }}
              className={`rounded-full px-4 py-2 text-xs font-extrabold transition ${
                cat === k
                  ? "bg-gradient-to-r from-amber-400 to-orange-500 text-black"
                  : "border border-white/15 bg-white/[0.04] text-orange-100/70 hover:border-orange-400/40"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {list.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center text-sm text-orange-100/60">
            {packages.length === 0 ? "প্যাকেজ লোড হচ্ছে…" : "এই ক্যাটাগরিতে এখন কোনো প্যাকেজ নেই"}
          </p>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {list.map((p) => (
              <div
                key={p.id}
                className="relative rounded-3xl border-2 border-white/10 bg-white/[0.03] p-4 text-left transition hover:border-orange-400/40 sm:p-5"
              >
                {p.badge && (
                  <span className="absolute -top-2.5 left-3 z-10 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-2.5 py-0.5 text-[10px] font-black text-black">
                    {p.badge}
                  </span>
                )}
                <div className="text-3xl">
                  {packArt(p) ? (
                    <img
                      src={packArt(p)!}
                      alt={p.name}
                      loading="lazy"
                      className="h-24 w-full rounded-2xl object-cover ring-1 ring-white/10"
                    />
                  ) : (
                    <span className="flex h-24 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/30 to-orange-600/10 text-5xl ring-1 ring-white/10">
                      🎫
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm font-extrabold leading-tight">{p.name}</p>
                {p.kind === "diamond" && p.diamonds > 0 && (
                  <p className="mt-0.5 text-xs text-orange-200/70">
                    {toBnDigits(p.diamonds)} ডায়মন্ড{p.bonus > 0 ? ` + ${toBnDigits(p.bonus)} বোনাস` : ""}
                  </p>
                )}
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-lg font-black text-amber-300">{formatBDT(Number(p.price_bdt))}</span>
                  {p.old_price_bdt && Number(p.old_price_bdt) > Number(p.price_bdt) && (
                    <span className="text-xs text-white/40 line-through">{formatBDT(Number(p.old_price_bdt))}</span>
                  )}
                </div>
                <button
                  onClick={() => goCheckout(p)}
                  data-gun="tier"
                  className="mt-3 w-full rounded-xl bg-gradient-to-r from-amber-400 via-orange-500 to-red-600 py-2.5 text-sm font-black text-black transition hover:brightness-110 active:scale-[0.98]"
                >
                  🛒 কিনুন
                </button>
              </div>
            ))}
          </div>
        )}

        {/* TRACK */}
        <div id="track" className="mt-10 scroll-mt-24 rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-8">
          <h2 className="text-xl font-black sm:text-2xl">🔍 অর্ডার ট্র্যাক করুন</h2>
          <div className="mt-3 flex gap-2">
            <input
              value={trackPhone}
              onChange={(e) => setTrackPhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
              placeholder="মোবাইল নম্বর দিন"
              inputMode="numeric"
              className="flex-1 rounded-2xl border border-white/15 bg-black/40 px-4 py-3 outline-none placeholder:text-white/25 focus:border-amber-400"
            />
            <button
              data-gun="rifle"
              onClick={() => { gunshot("rifle"); sfxClick(); speakBn(VOICE.tracking); track(); }}
              disabled={tracking}
              className="rounded-2xl bg-gradient-to-r from-orange-500 to-red-600 px-6 font-extrabold transition hover:brightness-110 disabled:opacity-50"
            >
              {tracking ? "…" : "খুঁজুন"}
            </button>
          </div>
          {tracked !== null && (
            <div className="mt-4 space-y-2">
              {tracked.length === 0 ? (
                <p className="text-sm text-orange-100/50">এই নম্বরে কোনো অর্ডার পাওয়া যায়নি</p>
              ) : (
                tracked.map((o) => (
                  <div key={o.id} className="flex items-center justify-between gap-2 rounded-2xl bg-black/30 px-4 py-3 text-sm">
                    <div>
                      <p className="font-bold">{o.package_name}</p>
                      <p className="font-mono text-xs text-white/50">UID: {o.player_uid}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-amber-300">{topupStatusBn(o.status)}</p>
                      <p className="text-xs text-white/40">{formatBDT(Number(o.price_bdt))}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* FAQ */}
        <div className="mt-10">
          <h2 className="text-xl font-black sm:text-2xl">❓ সাধারণ প্রশ্ন</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {[
              ["⏱️ ডেলিভারি পেতে কতক্ষণ লাগবে?", "পেমেন্ট যাচাইয়ের পর সাধারণত ৫–১৫ মিনিট। ব্যস্ত সময়ে সর্বোচ্চ ১ ঘণ্টা লাগতে পারে।"],
              ["🎮 UID ভুল দিলে কী হবে?", "ডায়মন্ড ওই ভুল UID-তেই চলে যাবে — তাই অর্ডারের আগে UID দুইবার মিলিয়ে নিন।"],
              ["🔒 এটা কি নিরাপদ?", "হ্যাঁ। আমরা শুধু আপনার Player UID নিই — গেমের পাসওয়ার্ড কখনো চাওয়া হয় না।"],
              ["💸 রিফান্ড পাবো?", "ডেলিভারির আগে বাতিল হলে সম্পূর্ণ রিফান্ড। ডেলিভারির পর রিফান্ড হয় না।"],
            ].map(([q, a]) => (
              <div key={q} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-sm font-extrabold">{q}</p>
                <p className="mt-1.5 text-xs leading-relaxed text-orange-100/60">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* floating toggles */}
      <div className="fixed bottom-5 left-5 z-40 flex flex-col gap-2">
        <button
          onClick={() => {
            const next = !soundOn;
            setSoundEnabled(next);
            setSoundOn(next);
            if (next) {
              sfxClick();
              speakBn(VOICE.soundOn);
            }
          }}
          aria-label="সাউন্ড চালু বা বন্ধ করুন"
          className="flex h-12 w-12 items-center justify-center rounded-full border border-orange-400/30 bg-black/60 text-xl shadow-lg backdrop-blur transition hover:scale-110 active:scale-95"
        >
          {soundOn ? "🔊" : "🔇"}
        </button>
      </div>
    </div>
  );
}
