"use client";

import { useEffect, useRef, useState } from "react";
import {
  formatBDT,
  toBnDigits,
  paymentKindBn,
  isPaymentMethodLive,
} from "@/lib/format";
import {
  isValidUid,
  topupStatusBn,
  payMethodBn,
  type TopUpPackage,
  type TopUpOrder,
} from "@/lib/topup";

import {
  soundEnabled,
  setSoundEnabled,
  bgmEnabled,
  setBgmEnabled,
  startBgm,
  sfxClick,
  sfxSelect,
  sfxSuccess,
  sfxFanfare,
  speakBn,
  VOICE,
} from "@/lib/topupSound";

const PAY_METHODS = ["bkash", "nagad", "rocket"] as const;
const METHOD_ICON: Record<string, string> = { bkash: "🩷", nagad: "🟠", rocket: "🟣" };
const METHOD_BN: Record<string, string> = { bkash: "বিকাশ", nagad: "নগদ", rocket: "রকেট" };

type PayInfo = { number: string; kind: string; image: string; enabled: boolean };

function payInfo(numbers: Record<string, unknown>, m: string): PayInfo {  const raw = (numbers as Record<string, any>)[m];
  if (!raw) return { number: "", kind: "sendmoney", image: "", enabled: true };
  if (typeof raw === "string")
    return { number: raw, kind: "sendmoney", image: "", enabled: true };
  return {
    number: raw.number ?? "",
    kind: raw.kind ?? "sendmoney",
    image: raw.image ?? "",
    enabled: raw.enabled !== false,
  };
}

/** card artwork by package size */
function packArt(p: TopUpPackage): string | null {
  if (p.kind === "membership") return null;
  if (p.diamonds >= 1000) return "/topup/pack-legend.webp";
  if (p.diamonds >= 200) return "/topup/pack-gold.webp";
  return "/topup/pack-bronze.webp";
}

export default function TopUpClient({ packages }: { packages: TopUpPackage[] }) {
  const [selected, setSelected] = useState<TopUpPackage | null>(null);
  const [uid, setUid] = useState("");
  const [phone, setPhone] = useState("");
  const [method, setMethod] = useState<string>("bkash");
  const [numbers, setNumbers] = useState<Record<string, unknown>>({});
  const [sender, setSender] = useState("");
  const [trx, setTrx] = useState("");
  const [error, setError] = useState("");
  const [placing, setPlacing] = useState(false);
  const [done, setDone] = useState<TopUpOrder | null>(null);
  const [copied, setCopied] = useState(false);

  const [trackPhone, setTrackPhone] = useState("");
  const [tracked, setTracked] = useState<TopUpOrder[] | null>(null);
  const [tracking, setTracking] = useState(false);
  const [cat, setCat] = useState<"all" | "diamond" | "membership" | "offer">("all");
  const [soundOn, setSoundOn] = useState(true);
  const [bgmOn, setBgmOn] = useState(true);
  const [stats, setStats] = useState<{
    total_delivered: number;
    today_delivered: number;
    recent: { package_name: string; phone: string }[];
  } | null>(null);

  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/public/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) setNumbers(d.payment_numbers ?? {});
      })
      .catch(() => {});
  }, []);

  // epic entrance: fanfare + Bangla welcome voice + ambient BGM on first interaction
  // (browsers block audio before the user taps anything)
  useEffect(() => {
    setSoundOn(soundEnabled());
    setBgmOn(bgmEnabled());
    const go = () => {
      if (soundEnabled()) {
        sfxFanfare();
        setTimeout(() => speakBn(VOICE.welcome), 1000);
      }
      setTimeout(() => startBgm(), 2500);
    };
    window.addEventListener("pointerdown", go, { once: true });
    window.addEventListener("keydown", go, { once: true });
    return () => {
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

  function choose(p: TopUpPackage) {
    setSelected(p);
    setDone(null);
    setError("");
    sfxSelect();
    speakBn(VOICE.selected(p.name));
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  }

  function copyNumber(n: string) {
    navigator.clipboard?.writeText(n).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function submit() {
    setError("");
    if (!selected) return fail("একটি প্যাকেজ সিলেক্ট করুন");
    if (!isValidUid(uid)) return fail("সঠিক Player UID দিন — শুধু সংখ্যা, ৬ থেকে ১২ ডিজিট");
    if (!/^01[3-9]\d{8}$/.test(phone.trim())) return fail("সঠিক মোবাইল নম্বর দিন");
    const pinfo = payInfo(numbers, method);
    if (!isPaymentMethodLive(pinfo)) return fail("এই পেমেন্ট মাধ্যমটি এখন বন্ধ আছে");
    if (!sender.trim() || !trx.trim()) return fail("সেন্ডার নম্বর ও TrxID দুটোই দিন");
    setPlacing(true);
    try {
      const r = await fetch("/api/topup/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          package_id: selected.id,
          player_uid: uid.trim(),
          phone: phone.trim(),
          payment_method: method,
          sender_number: sender.trim(),
          trx_id: trx.trim().toUpperCase(),
        }),
      });
      const d = await r.json();
      if (!d.ok) throw new Error(d.error || "অর্ডার হয়নি");
      setDone(d.order as TopUpOrder);
      sfxSuccess();
      speakBn(VOICE.success);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      fail(e instanceof Error ? e.message : "অর্ডার হয়নি, আবার চেষ্টা করুন");
    } finally {
      setPlacing(false);
    }
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

  const info = payInfo(numbers, method);

  const CAT_VOICE = {
    all: VOICE.catAll,
    offer: VOICE.catOffer,
    diamond: VOICE.catDiamond,
    membership: VOICE.catMembership,
  } as const;

  function fail(msg: string) {
    setError(msg);
    speakBn(msg);
  }

  return (
    <div className="min-h-screen bg-[#0d0a07] text-white">
      {/* HERO */}
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <img src="/topup/hero.webp" alt="" className="h-full w-full object-cover opacity-50" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0d0a07]/40 via-[#0d0a07]/60 to-[#0d0a07]" />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 pb-10 pt-12 text-center sm:pt-16">
          <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">
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
        {done ? (
          /* SUCCESS */
          <div className="mx-auto max-w-lg rounded-3xl border border-emerald-400/30 bg-emerald-500/10 p-8 text-center">
            <div className="text-6xl">🎉</div>
            <h2 className="mt-4 text-2xl font-black text-emerald-300">অর্ডার সফল হয়েছে!</h2>
            <div className="mt-5 space-y-2 rounded-2xl bg-black/30 p-5 text-left text-sm">
              <Row k="প্যাকেজ" v={done.package_name} />
              <Row k="Player UID" v={done.player_uid} mono />
              <Row k="মূল্য" v={formatBDT(Number(done.price_bdt))} />
              <Row k="পেমেন্ট" v={`${payMethodBn(done.payment_method)} — TrxID: ${done.trx_id}`} mono />
              <Row k="স্ট্যাটাস" v={topupStatusBn(done.status)} />
            </div>
            <p className="mt-4 text-xs leading-relaxed text-emerald-100/70">
              পেমেন্ট যাচাই করে ৫–১৫ মিনিটের মধ্যে আপনার UID-তে ডায়মন্ড পাঠিয়ে দেওয়া হবে।
              নিচে ফোন নম্বর দিয়ে অর্ডার ট্র্যাক করতে পারবেন।
            </p>
            <button
              onClick={() => { setDone(null); setSelected(null); setUid(""); setSender(""); setTrx(""); }}
              className="mt-6 rounded-2xl bg-gradient-to-r from-orange-500 to-red-600 px-8 py-3 font-extrabold transition hover:brightness-110"
            >
              আরেকটি অর্ডার করুন
            </button>
          </div>
        ) : (
          <>
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
            <h2 className="mt-10 text-xl font-black sm:text-2xl">
              💎 প্যাকেজ সিলেক্ট করুন
            </h2>
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
                  onClick={() => { sfxClick(); setCat(k); speakBn(CAT_VOICE[k]); }}
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
            {(() => {
              const list = packages.filter((p) => {
                if (cat === "diamond") return p.kind === "diamond";
                if (cat === "membership") return p.kind === "membership";
                if (cat === "offer") return p.old_price_bdt != null && Number(p.old_price_bdt) > Number(p.price_bdt);
                return true;
              });
              if (list.length === 0)
                return (
                  <p className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center text-sm text-orange-100/60">
                    {packages.length === 0 ? "প্যাকেজ লোড হচ্ছে…" : "এই ক্যাটাগরিতে এখন কোনো প্যাকেজ নেই"}
                  </p>
                );
              return (
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {list.map((p) => {
                  const active = selected?.id === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => choose(p)}
                      className={`relative rounded-3xl border-2 p-4 text-left transition sm:p-5 ${
                        active
                          ? "border-amber-400 bg-gradient-to-b from-amber-500/25 to-orange-600/10 shadow-[0_0_30px_rgba(255,170,0,0.25)]"
                          : "border-white/10 bg-white/[0.03] hover:border-orange-400/40"
                      }`}
                    >
                      {p.badge && (
                        <span className="absolute -top-2.5 left-3 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-2.5 py-0.5 text-[10px] font-black text-black">
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
                      <div className={`mt-3 rounded-xl py-2 text-center text-xs font-extrabold ${active ? "bg-amber-400 text-black" : "bg-white/10 text-white"}`}>
                        {active ? "✓ সিলেক্টেড" : "সিলেক্ট করুন"}
                      </div>
                    </button>
                  );
                })}
              </div>
              );
            })()}

            {/* ORDER FORM */}
            <div ref={formRef} className="mt-10 scroll-mt-24 rounded-3xl border border-orange-400/25 bg-gradient-to-b from-orange-500/[0.07] to-transparent p-5 sm:p-8">
              <h2 className="text-xl font-black sm:text-2xl">📝 অর্ডার করুন</h2>
              {!selected ? (
                <p className="mt-3 text-sm text-orange-100/60">👆 ওপরে একটি প্যাকেজ সিলেক্ট করুন</p>
              ) : (
                <>
                  <div className="mt-3 flex items-center justify-between rounded-2xl bg-black/30 px-4 py-3 text-sm">
                    <span className="font-bold">{selected.name}</span>
                    <span className="font-black text-amber-300">{formatBDT(Number(selected.price_bdt))}</span>
                  </div>

                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-bold">🎮 Player UID *</label>
                      <input
                        value={uid}
                        onChange={(e) => setUid(e.target.value.replace(/\D/g, ""))}
                        placeholder="যেমন: 123456789"
                        inputMode="numeric"
                        className="w-full rounded-2xl border border-white/15 bg-black/40 px-4 py-3 font-mono text-lg tracking-widest outline-none placeholder:text-white/25 focus:border-amber-400"
                      />
                      <p className="mt-1.5 text-xs leading-relaxed text-orange-100/50">
                        💡 UID কোথায় পাবেন? Free Fire খুলুন → প্রোফাইলে ট্যাপ করুন → নামের নিচের নম্বরটাই UID। ভুল UID দিলে ডায়মন্ড অন্য অ্যাকাউন্টে যাবে!
                      </p>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-bold">📱 মোবাইল নম্বর *</label>
                      <input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
                        placeholder="01XXXXXXXXX"
                        inputMode="numeric"
                        className="w-full rounded-2xl border border-white/15 bg-black/40 px-4 py-3 font-mono text-lg tracking-widest outline-none placeholder:text-white/25 focus:border-amber-400"
                      />
                      <p className="mt-1.5 text-xs text-orange-100/50">অর্ডার আপডেট ও ট্র্যাকিংয়ের জন্য</p>
                    </div>
                  </div>

                  {/* PAYMENT */}
                  <h3 className="mt-6 text-sm font-black">💳 পেমেন্ট মাধ্যম</h3>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {PAY_METHODS.map((m) => {
                      const pi = payInfo(numbers, m);
                      const live = isPaymentMethodLive(pi);
                      return (
                        <button
                          key={m}
                          disabled={!live}
                          onClick={() => {
                            sfxClick();
                            setMethod(m);
                            const pm = payInfo(numbers, m);
                            if (isPaymentMethodLive(pm) && selected) {
                              speakBn(VOICE.payMethod(METHOD_BN[m], pm.number, formatBDT(Number(selected.price_bdt))));
                            }
                          }}
                          className={`rounded-2xl border-2 p-3 text-center transition ${
                            method === m && live
                              ? "border-amber-400 bg-amber-400/15"
                              : "border-white/10 bg-white/[0.03] opacity-60"
                          } ${!live ? "cursor-not-allowed" : ""}`}
                        >
                          <div className="text-2xl">{METHOD_ICON[m]}</div>
                          <p className="mt-1 text-xs font-extrabold">{METHOD_BN[m]}</p>
                          <p className="text-[10px] text-white/40">{live ? paymentKindBn(pi.kind) : "শীঘ্রই আসছে"}</p>
                        </button>
                      );
                    })}
                  </div>

                  {isPaymentMethodLive(info) && info.number && (
                    <div className="mt-3 rounded-2xl border border-amber-400/30 bg-amber-400/[0.07] p-4">
                      <p className="text-xs text-orange-100/60">
                        📲 <b className="text-white">{formatBDT(Number(selected.price_bdt))}</b> এই নম্বরে{" "}
                        <b className="text-amber-300">{paymentKindBn(info.kind)}</b> করুন:
                      </p>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <span className="font-mono text-2xl font-black tracking-widest text-amber-300">{info.number}</span>
                        <button
                          onClick={() => { sfxClick(); copyNumber(info.number); speakBn(VOICE.copied(METHOD_BN[method])); }}
                          className="rounded-xl bg-amber-400 px-4 py-2 text-xs font-black text-black transition hover:brightness-110"
                        >
                          {copied ? "✓ কপি হয়েছে" : "📋 কপি"}
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-bold">সেন্ডার নম্বর *</label>
                      <input
                        value={sender}
                        onChange={(e) => setSender(e.target.value.replace(/\D/g, "").slice(0, 11))}
                        placeholder="যে নম্বর থেকে টাকা পাঠিয়েছেন"
                        inputMode="numeric"
                        className="w-full rounded-2xl border border-white/15 bg-black/40 px-4 py-3 outline-none placeholder:text-white/25 focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-bold">TrxID *</label>
                      <input
                        value={trx}
                        onChange={(e) => setTrx(e.target.value.toUpperCase())}
                        placeholder="যেমন: 9HX7K2LMNQ"
                        className="w-full rounded-2xl border border-white/15 bg-black/40 px-4 py-3 font-mono uppercase outline-none placeholder:text-white/25 focus:border-amber-400"
                      />
                    </div>
                  </div>

                  {error && (
                    <p className="mt-4 rounded-2xl border border-red-400/30 bg-red-500/10 p-3 text-sm font-bold text-red-300">
                      ⚠️ {error}
                    </p>
                  )}

                  <button
                    onClick={submit}
                    disabled={placing}
                    className="mt-5 w-full rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-red-600 py-4 text-lg font-black text-black shadow-[0_8px_30px_rgba(255,120,0,0.35)] transition hover:brightness-110 disabled:opacity-50"
                  >
                    {placing ? "⏳ অর্ডার হচ্ছে…" : `🚀 অর্ডার কনফার্ম — ${formatBDT(Number(selected.price_bdt))}`}
                  </button>
                  <p className="mt-2 text-center text-xs text-orange-100/40">
                    অর্ডার করলে আমাদের শর্তাবলীতে সম্মতি দিচ্ছেন • ভুল UID-এর দায় কাস্টমারের
                  </p>
                </>
              )}
            </div>

            {/* TRACK */}
            <div className="mt-10 rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-8">
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
                  onClick={() => { sfxClick(); speakBn(VOICE.tracking); track(); }}
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
          </>
        )}
      </div>

      {/* floating sound toggles */}
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
          title="সাউন্ড (ভয়েস + এফেক্ট)"
          className="flex h-12 w-12 items-center justify-center rounded-full border border-orange-400/30 bg-black/60 text-xl shadow-lg backdrop-blur transition hover:scale-110 active:scale-95"
        >
          {soundOn ? "🔊" : "🔇"}
        </button>
        <button
          onClick={() => {
            const next = !bgmOn;
            setBgmEnabled(next);
            setBgmOn(next);
            if (next) speakBn(VOICE.bgmOn);
            else speakBn(VOICE.bgmOff);
          }}
          aria-label="ব্যাকগ্রাউন্ড মিউজিক চালু বা বন্ধ করুন"
          title="ব্যাকগ্রাউন্ড মিউজিক"
          className="flex h-12 w-12 items-center justify-center rounded-full border border-orange-400/30 bg-black/60 text-xl shadow-lg backdrop-blur transition hover:scale-110 active:scale-95"
        >
          {bgmOn ? "🎵" : "🚫"}
        </button>
      </div>
    </div>
  );
}

function Row({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-white/50">{k}</span>
      <span className={`font-bold text-white ${mono ? "font-mono" : ""}`}>{v}</span>
    </div>
  );
}
