"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatBDT, paymentKindBn, isPaymentMethodLive } from "@/lib/format";
import { isValidUid, topupStatusBn, payMethodBn, type TopUpPackage, type TopUpOrder } from "@/lib/topup";
import {
  soundEnabled,
  setSoundEnabled,
  bgmEnabled,
  setBgmEnabled,
  startBgm,
  gunshot,
  initTapGuns,
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

function payInfo(numbers: Record<string, unknown>, m: string): PayInfo {
  const raw = (numbers as Record<string, any>)[m];
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

function packArt(p: TopUpPackage): string | null {
  if (p.kind === "membership") return null;
  if (p.diamonds >= 1000) return "/topup/pack-legend.webp";
  if (p.diamonds >= 200) return "/topup/pack-gold.webp";
  return "/topup/pack-bronze.webp";
}

export default function CheckoutWizard({ pkg }: { pkg: TopUpPackage }) {
  const [step, setStep] = useState<1 | 2>(1);
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
  const [soundOn, setSoundOn] = useState(true);
  const [bgmOn, setBgmOn] = useState(true);

  useEffect(() => {
    fetch("/api/public/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) setNumbers(d.payment_numbers ?? {});
      })
      .catch(() => {});
  }, []);

  // entrance: fanfare + voice + bgm on first interaction
  useEffect(() => {
    setSoundOn(soundEnabled());
    setBgmOn(bgmEnabled());
    initTapGuns();
    const go = () => {
      if (soundEnabled()) {
        sfxFanfare();
        setTimeout(
          () => speakBn(`${pkg.name} চেকআউট। আপনার প্লেয়ার ইউআইডি আর মোবাইল নম্বর দিন।`),
          1000
        );
      }
      setTimeout(() => startBgm(), 2500);
    };
    window.addEventListener("pointerdown", go, { once: true });
    window.addEventListener("keydown", go, { once: true });
    return () => {
      window.removeEventListener("pointerdown", go);
      window.removeEventListener("keydown", go);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function fail(msg: string) {
    setError(msg);
    speakBn(msg);
  }

  function nextStep() {
    setError("");
    if (!isValidUid(uid)) return fail("সঠিক Player UID দিন — শুধু সংখ্যা, ৬ থেকে ১২ ডিজিট");
    if (!/^01[3-9]\d{8}$/.test(phone.trim())) return fail("সঠিক মোবাইল নম্বর দিন");
    gunshot("rifle");
    speakBn("তথ্য ঠিক আছে। এখন পেমেন্ট সম্পন্ন করুন।");
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function prevStep() {
    setError("");
    sfxClick();
    speakBn("তথ্য পরিবর্তন করতে পারেন।");
    setStep(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function copyNumber(n: string) {
    navigator.clipboard?.writeText(n).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function submit() {
    setError("");
    const pinfo = payInfo(numbers, method);
    if (!isPaymentMethodLive(pinfo)) return fail("এই পেমেন্ট মাধ্যমটি এখন বন্ধ আছে");
    if (!sender.trim() || !trx.trim()) return fail("সেন্ডার নম্বর ও TrxID দুটোই দিন");
    setPlacing(true);
    try {
      const r = await fetch("/api/topup/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          package_id: pkg.id,
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

  const info = payInfo(numbers, method);
  const art = packArt(pkg);

  return (
    <div className="min-h-screen bg-[#0d0a07] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,110,0,0.16),transparent_60%)]" />
      <div className="relative mx-auto max-w-2xl px-4 pb-24 pt-6">
        <Link
          href="/topup"
          onClick={() => sfxClick()}
          className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-bold text-orange-100/80 transition hover:border-orange-400/40"
        >
          ⬅️ প্যাকেজে ফিরে যান
        </Link>

        {done ? (
          <div className="mt-6 rounded-3xl border border-emerald-400/30 bg-emerald-500/10 p-8 text-center">
            <div className="text-6xl">🎉</div>
            <h1 className="mt-4 text-2xl font-black text-emerald-300">অর্ডার সফল হয়েছে!</h1>
            <div className="mt-5 space-y-2 rounded-2xl bg-black/30 p-5 text-left text-sm">
              <Row k="প্যাকেজ" v={done.package_name} />
              <Row k="Player UID" v={done.player_uid} mono />
              <Row k="মূল্য" v={formatBDT(Number(done.price_bdt))} />
              <Row k="পেমেন্ট" v={`${payMethodBn(done.payment_method)} — TrxID: ${done.trx_id}`} mono />
              <Row k="স্ট্যাটাস" v={topupStatusBn(done.status)} />
            </div>
            <p className="mt-4 text-xs leading-relaxed text-emerald-100/70">
              পেমেন্ট যাচাই করে ৫–১৫ মিনিটের মধ্যে আপনার UID-তে ডায়মন্ড পাঠিয়ে দেওয়া হবে।
            </p>
            <div className="mt-6 grid grid-cols-2 gap-2">
              <Link
                href="/topup"
                className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-extrabold transition hover:bg-white/10"
              >
                🏠 প্যাকেজ পেজ
              </Link>
              <Link
                href="/topup#track"
                className="rounded-2xl bg-gradient-to-r from-orange-500 to-red-600 px-4 py-3 text-sm font-extrabold transition hover:brightness-110"
              >
                🔍 অর্ডার ট্র্যাক
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* package hero card */}
            <div className="relative mt-6 overflow-hidden rounded-3xl border border-amber-400/25">
              {art ? (
                <img src={art} alt={pkg.name} className="h-44 w-full object-cover sm:h-56" />
              ) : (
                <div className="flex h-44 items-center justify-center bg-gradient-to-br from-amber-500/30 to-orange-600/10 text-7xl sm:h-56">
                  🎫
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d0a07] via-[#0d0a07]/40 to-transparent" />
              {pkg.badge && (
                <span className="absolute left-4 top-4 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-3 py-1 text-xs font-black text-black">
                  {pkg.badge}
                </span>
              )}
              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                <div>
                  <h1 className="text-2xl font-black sm:text-3xl">{pkg.name}</h1>
                  {pkg.kind === "diamond" && pkg.diamonds > 0 && (
                    <p className="text-sm text-orange-200/70">
                      💎 {pkg.diamonds} ডায়মন্ড{pkg.bonus > 0 ? ` + ${pkg.bonus} বোনাস` : ""}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-amber-300">{formatBDT(Number(pkg.price_bdt))}</p>
                  {pkg.old_price_bdt && Number(pkg.old_price_bdt) > Number(pkg.price_bdt) && (
                    <p className="text-sm text-white/40 line-through">{formatBDT(Number(pkg.old_price_bdt))}</p>
                  )}
                </div>
              </div>
            </div>

            {/* progress */}
            <div className="mt-6 flex items-center gap-1.5 text-[11px] font-extrabold sm:text-xs">
              <StepPill n="১" t="আপনার তথ্য" active={step === 1} done={step > 1} />
              <div className={`h-0.5 flex-1 rounded ${step > 1 ? "bg-emerald-400/60" : "bg-white/10"}`} />
              <StepPill n="২" t="পেমেন্ট" active={step === 2} done={false} />
              <div className="h-0.5 flex-1 rounded bg-white/10" />
              <StepPill n="৩" t="ডেলিভারি" active={false} done={false} />
            </div>

            {step === 1 ? (
              <div className="mt-6 rounded-3xl border border-orange-400/25 bg-gradient-to-b from-orange-500/[0.07] to-transparent p-5 sm:p-7">
                <h2 className="text-lg font-black">📝 আপনার তথ্য দিন</h2>
                <div className="mt-4 grid gap-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-bold">🎮 Player UID *</label>
                    <input
                      value={uid}
                      onChange={(e) => setUid(e.target.value.replace(/\D/g, ""))}
                      placeholder="যেমন: 123456789"
                      inputMode="numeric"
                      className="w-full rounded-2xl border border-white/15 bg-black/40 px-4 py-3.5 font-mono text-lg tracking-widest outline-none placeholder:text-white/25 focus:border-amber-400"
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
                      className="w-full rounded-2xl border border-white/15 bg-black/40 px-4 py-3.5 font-mono text-lg tracking-widest outline-none placeholder:text-white/25 focus:border-amber-400"
                    />
                    <p className="mt-1.5 text-xs text-orange-100/50">অর্ডার আপডেট ও ট্র্যাকিংয়ের জন্য</p>
                  </div>
                </div>

                {error && (
                  <p className="mt-4 rounded-2xl border border-red-400/30 bg-red-500/10 p-3 text-sm font-bold text-red-300">
                    ⚠️ {error}
                  </p>
                )}

                <button
                  onClick={nextStep}
                  data-gun="rifle"
                  className="mt-5 w-full rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-red-600 py-4 text-lg font-black text-black shadow-[0_8px_30px_rgba(255,120,0,0.35)] transition hover:brightness-110 active:scale-[0.99]"
                >
                  💳 পেমেন্টে এগিয়ে যান ➡️
                </button>
                <p className="mt-2 text-center text-xs text-orange-100/40">
                  পরের ধাপে পেমেন্ট করবেন — এখনো টাকা পাঠাতে হবে না
                </p>
              </div>
            ) : (
              <div className="mt-6">
                {/* summary with UID + phone on top */}
                <div className="relative overflow-hidden rounded-3xl border border-amber-400/30 bg-gradient-to-br from-amber-500/[0.12] via-black/40 to-orange-600/[0.08] p-5">
                  <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-amber-500/20 blur-2xl" />
                  <div className="relative flex items-center justify-between">
                    <p className="text-xs font-black uppercase tracking-widest text-amber-300/80">🧾 অর্ডার সামারি</p>
                    <button
                      onClick={prevStep}
                      className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white transition hover:bg-white/20"
                    >
                      ✏️ পরিবর্তন
                    </button>
                  </div>
                  <div className="relative mt-3 space-y-2 text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold">{pkg.name}</span>
                      <span className="font-black text-amber-300">{formatBDT(Number(pkg.price_bdt))}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2 border-t border-white/10 pt-2">
                      <span className="text-white/50">🎮 Player UID</span>
                      <span className="font-mono text-base font-black tracking-widest text-white">{uid}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-white/50">📱 মোবাইল</span>
                      <span className="font-mono font-bold text-white">{phone}</span>
                    </div>
                  </div>
                </div>

                {/* payment */}
                <div className="mt-5 rounded-3xl border border-orange-400/25 bg-gradient-to-b from-orange-500/[0.07] to-transparent p-5 sm:p-7">
                  <h2 className="text-lg font-black">💳 পেমেন্ট মাধ্যম</h2>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {PAY_METHODS.map((m) => {
                      const pi = payInfo(numbers, m);
                      const live = isPaymentMethodLive(pi);
                      return (
                        <button
                          key={m}
                          disabled={!live}
                          data-gun="pistol"
                          onClick={() => {
                            gunshot("pistol");
                            sfxClick();
                            setMethod(m);
                            const pm = payInfo(numbers, m);
                            if (isPaymentMethodLive(pm)) {
                              speakBn(VOICE.payMethod(METHOD_BN[m], pm.number, formatBDT(Number(pkg.price_bdt))));
                            }
                          }}
                          className={`rounded-2xl border-2 p-3 text-center transition ${
                            method === m && live
                              ? "border-amber-400 bg-amber-400/15 shadow-[0_0_20px_rgba(255,170,0,0.25)]"
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
                    <div className="mt-4 rounded-2xl border border-amber-400/30 bg-amber-400/[0.07] p-4">
                      <p className="text-xs text-orange-100/60">
                        📲 <b className="text-white">{formatBDT(Number(pkg.price_bdt))}</b> এই নম্বরে{" "}
                        <b className="text-amber-300">{paymentKindBn(info.kind)}</b> করুন:
                      </p>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <span className="font-mono text-2xl font-black tracking-widest text-amber-300">{info.number}</span>
                        <button
                          data-gun="pistol"
                          onClick={() => {
                            gunshot("pistol");
                            sfxClick();
                            copyNumber(info.number);
                            speakBn(VOICE.copied(METHOD_BN[method]));
                          }}
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

                  <div className="mt-5 flex gap-2">
                    <button
                      onClick={prevStep}
                      aria-label="আগের ধাপে ফিরে যান"
                      className="rounded-2xl border border-white/15 bg-white/5 px-5 py-4 text-lg font-black text-white transition hover:bg-white/10 active:scale-95"
                    >
                      ⬅️
                    </button>
                    <button
                      onClick={() => { gunshot("sniper"); submit(); }}
                      data-gun="sniper"
                      disabled={placing}
                      className="flex-1 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-red-600 py-4 text-lg font-black text-black shadow-[0_8px_30px_rgba(255,120,0,0.35)] transition hover:brightness-110 active:scale-[0.99] disabled:opacity-50"
                    >
                      {placing ? "⏳ অর্ডার হচ্ছে…" : `🚀 অর্ডার কনফার্ম — ${formatBDT(Number(pkg.price_bdt))}`}
                    </button>
                  </div>
                  <p className="mt-2 text-center text-xs text-orange-100/40">
                    অর্ডার করলে আমাদের শর্তাবলীতে সম্মতি দিচ্ছেন • ভুল UID-এর দায় কাস্টমারের
                  </p>
                </div>
              </div>
            )}
          </>
        )}
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
        <button
          onClick={() => {
            const next = !bgmOn;
            setBgmEnabled(next);
            setBgmOn(next);
            if (next) speakBn(VOICE.bgmOn);
            else speakBn(VOICE.bgmOff);
          }}
          aria-label="ব্যাকগ্রাউন্ড মিউজিক চালু বা বন্ধ করুন"
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

function StepPill({ n, t, active, done }: { n: string; t: string; active: boolean; done: boolean }) {
  return (
    <div
      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 transition ${
        active
          ? "bg-gradient-to-r from-amber-400 to-orange-500 text-black shadow-[0_0_18px_rgba(255,150,0,0.55)]"
          : done
            ? "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/40"
            : "bg-white/5 text-white/40"
      }`}
    >
      <span className="font-black">{done ? "✓" : n}</span>
      <span className="whitespace-nowrap">{t}</span>
    </div>
  );
}
