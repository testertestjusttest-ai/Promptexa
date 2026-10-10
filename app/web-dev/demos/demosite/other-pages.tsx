"use client";

/**
 * DemoSite — service / gallery / booking / news layout pages.
 * Browser-local demo data only; nothing touches the real database.
 */

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toBnDigits } from "@/lib/format";
import { useDemo, type DemoStore } from "./store";
import type { DemoSiteDef, DemoServiceItem, DemoGalleryItem, DemoNewsItem } from "./types";
import { Price, Stars, SectionTitle, Empty, ProductCard, Back, Page, LoginHint , HeroSlider } from "./ui";
import { ShopLogin, ShopSignup, ShopAccount } from "./shop-pages";

/* ================= auth aliases (reuse shop auth — no duplicates) ================= */
export const SvcLogin = ShopLogin;
export const SvcSignup = ShopSignup;
export const SvcAccount = ShopAccount;
export const GalLogin = ShopLogin;
export const GalSignup = ShopSignup;
export const GalAccount = ShopAccount;
export const BookLogin = ShopLogin;
export const BookSignup = ShopSignup;
export const BookAccount = ShopAccount;
export const NewsLogin = ShopLogin;
export const NewsSignup = ShopSignup;
export const NewsAccount = ShopAccount;

/* ================= shared helpers ================= */

function cardCls(def: DemoSiteDef) {
  return `rounded-2xl border p-4 ${def.dark ? "border-white/10 bg-white/5 text-white" : "border-slate-200 bg-white text-slate-800"}`;
}
function subCls(def: DemoSiteDef) {
  return def.dark ? "text-slate-400" : "text-slate-500";
}
function chipCls(def: DemoSiteDef, active: boolean) {
  if (active) return "border-transparent text-white";
  return def.dark ? "border-white/15 text-slate-300 hover:bg-white/10" : "border-slate-200 text-slate-600 hover:bg-slate-100";
}

function Cta({ href, accent, ghost, children, small }: {
  href: string; accent: string; ghost?: boolean; small?: boolean; children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`${ghost ? "btn-demo-ghost" : "btn-demo"} ${small ? "!px-4 !py-2 !text-[13px]" : ""}`}
      style={ghost ? undefined : { background: accent }}
    >
      {children}
    </Link>
  );
}

function F({ dark, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { dark: boolean }) {
  return (
    <input
      {...props}
      className={
        dark
          ? "w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-white/40"
          : "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-slate-400"
      }
    />
  );
}

function TA({ dark, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { dark: boolean }) {
  return (
    <textarea
      {...props}
      className={
        dark
          ? "w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-white/40"
          : "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-slate-400"
      }
    />
  );
}

function Sel({ dark, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { dark: boolean }) {
  return (
    <select
      {...props}
      className={
        dark
          ? "w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-white/40 [&>option]:text-black"
          : "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-slate-400"
      }
    />
  );
}

const BN_DAYS = ["রবি", "সোম", "মঙ্গল", "বুধ", "বৃহস্পতি", "শুক্র", "শনি"];

function nextDays(n: number) {
  const out: { d: Date; label: string; day: string }[] = [];
  for (let i = 0; i < n; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    out.push({
      d,
      label: d.toLocaleDateString("bn-BD", { day: "numeric", month: "short" }),
      day: i === 0 ? "আজ" : i === 1 ? "আগামীকাল" : BN_DAYS[d.getDay()],
    });
  }
  return out;
}

function bnLong(d: Date) {
  return d.toLocaleDateString("bn-BD", { day: "numeric", month: "long", year: "numeric" });
}

function myBookings(store: DemoStore) {
  const id = store.user ? store.user.phone : "guest";
  return store.bookings.filter((b) => b.userPhone === id);
}

function StatusBadge({ s }: { s: string }) {
  return (
    <span className="rounded-full bg-emerald-400/15 px-2.5 py-1 text-[10px] font-bold text-emerald-400">
      {s}
    </span>
  );
}

function BookingRow({ b, dark }: { b: DemoStore["bookings"][number]; dark: boolean }) {
  return (
    <div className={cardCls({ dark } as DemoSiteDef)}>
      <div className="flex items-center justify-between gap-2">
        <p className="font-mono text-sm font-black">{b.id}</p>
        <StatusBadge s={b.status} />
      </div>
      <p className="mt-2 font-bold">
        <span className="mr-1 text-xl">{b.itemEmoji}</span> {b.itemName}
      </p>
      <p className={`mt-1 text-xs ${subCls({ dark } as DemoSiteDef)}`}>
        📅 {b.date}
        {b.slot ? ` • ⏰ ${b.slot}` : ""} • 👤 {b.name} • 📞 {b.phone}
      </p>
      <p className="mt-1 text-sm font-black">{toBnDigits(b.total.toLocaleString("en-IN"))} টাকা</p>
    </div>
  );
}

/** Generic about page body shared by all layouts. */
function AboutBody() {
  const { def, base } = useDemo();
  const stats: [string, string][] = [
    ["⭐", `${toBnDigits((def.services[0]?.rating ?? 4.8).toFixed(1))} গড় রেটিং`],
    ["🛠️", `${toBnDigits(def.services.length)}টি সার্ভিস`],
    ["🛍️", `${toBnDigits(def.products.length)}টি পণ্য`],
  ];
  return (
    <Page narrow>
      <Back href={base} label="হোম" />
      <h1 className="text-2xl font-black">ℹ️ আমাদের সম্পর্কে</h1>
      <p className={`mt-3 text-sm leading-relaxed ${subCls(def)}`}>{def.about}</p>
      <div className="mt-5 grid grid-cols-3 gap-2">
        {stats.map(([e, t]) => (
          <div key={t} className={`${cardCls(def)} text-center !p-3`}>
            <p className="text-2xl">{e}</p>
            <p className="mt-1 text-[11px] font-bold">{t}</p>
          </div>
        ))}
      </div>
      <div className={`${cardCls(def)} mt-4`}>
        <p className="font-bold">📞 যোগাযোগ</p>
        <p className={`mt-1 text-sm ${subCls(def)}`}>{def.contact}</p>
        <p className={`text-sm ${subCls(def)}`}>📍 {def.address}</p>
        <p className={`text-sm ${subCls(def)}`}>🕐 {def.hours}</p>
      </div>
      <div className="mt-5">
        <Cta href={`${base}/contact`} accent={def.accent}>✉️ মেসেজ পাঠান</Cta>
      </div>
    </Page>
  );
}

/** Generic contact page body shared by all layouts. */
function ContactBody() {
  const { def, base } = useDemo();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);
  function send() {
    setErr("");
    if (name.trim().length < 3) return setErr("আপনার নাম লিখুন");
    if (!/^01[3-9]\d{8}$/.test(phone.trim())) return setErr("সঠিক ১১ সংখ্যার মোবাইল নম্বর দিন");
    if (msg.trim().length < 5) return setErr("মেসেজ লিখুন");
    setDone(true);
  }
  return (
    <Page narrow>
      <Back href={base} label="হোম" />
      <h1 className="text-2xl font-black">✉️ যোগাযোগ করুন</h1>
      <div className={`${cardCls(def)} mt-4 space-y-1.5 text-sm`}>
        <p className="font-bold">📞 {def.contact}</p>
        <p className={subCls(def)}>📍 {def.address}</p>
        <p className={subCls(def)}>🕐 {def.hours}</p>
      </div>
      {done ? (
        <div className={`${cardCls(def)} mt-4 border-emerald-400/40 text-center`}>
          <p className="text-5xl">✅</p>
          <p className="mt-2 font-black text-emerald-400">মেসেজ পাঠানো হয়েছে!</p>
          <p className={`mt-1 text-xs ${subCls(def)}`}>ধন্যবাদ {name.trim()} — শীঘ্রই যোগাযোগ করবো। (ডেমো)</p>
          <button onClick={() => setDone(false)} className={`mt-3 text-xs font-bold underline ${subCls(def)}`}>
            আরেকটি মেসেজ
          </button>
        </div>
      ) : (
        <div className={`${cardCls(def)} mt-4 space-y-3`}>
          <F dark={def.dark} value={name} onChange={(e) => setName(e.target.value)} placeholder="আপনার নাম *" />
          <F dark={def.dark} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="মোবাইল নম্বর * (01XXXXXXXXX)" inputMode="numeric" />
          <TA dark={def.dark} value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="আপনার মেসেজ *" rows={4} />
          {err && <p className="rounded-xl bg-red-500/10 px-4 py-2.5 text-xs font-bold text-red-400">⚠️ {err}</p>}
          <button onClick={send} className="btn-demo w-full !py-3" style={{ background: def.accent }}>
            📨 পাঠিয়ে দিন
          </button>
          <p className={`text-center text-[11px] ${subCls(def)}`}>ডেমো ফর্ম — কোনো আসল মেসেজ যাবে না</p>
        </div>
      )}
    </Page>
  );
}

/* ================================================================
   SERVICE layout
================================================================ */

function ServiceCard({ s }: { s: DemoServiceItem }) {
  const { def, base } = useDemo();
  return (
    <Link href={`${base}/s/${s.id}`} className={`${cardCls(def)} group block transition hover:-translate-y-1 hover:shadow-xl`}>
      <div className="flex items-start gap-3">
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-3xl" style={{ background: `${def.accent}18` }}>
          {s.e}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-bold">{s.n}</p>
          <Stars rating={s.rating} />
          <p className={`mt-0.5 text-xs ${subCls(def)}`}>⏱️ {s.duration}</p>
        </div>
      </div>
      <p className={`mt-2 line-clamp-2 text-xs ${subCls(def)}`}>{s.desc}</p>
      <div className="mt-2 flex items-center justify-between">
        <Price v={s.p} accent={def.accent} />
        <span className="text-xs font-bold opacity-70 group-hover:opacity-100">বিস্তারিত →</span>
      </div>
    </Link>
  );
}

export function SvcHome() {
  const { def, base } = useDemo();
  const steps: [string, string, string][] = [
    ["1️⃣", "সার্ভিস বেছে নিন", "পছন্দের সার্ভিসে ক্লিক করে বিস্তারিত দেখুন"],
    ["2️⃣", "তারিখ ও সময় দিন", "সুবিধামতো দিন ও স্লট সিলেক্ট করুন"],
    ["3️⃣", "বুকিং কনফার্ম", "নাম-মোবাইল দিয়ে বুকিং সম্পন্ন করুন"],
  ];
  return (
    <>
      <HeroSlider
        accent={def.accent}
        slides={[
          { img: def.heroImg, emoji: def.heroEmoji, title: def.heroTitle, sub: def.heroSub, cta: "🛠️ সার্ভিস দেখুন", href: "/services", grad: def.grad },
          { emoji: "📅", title: "অনলাইনে বুকিং করুন", sub: "পছন্দের তারিখ ও সময় বেছে নিন — কনফার্মেশন সাথে সাথে", cta: "📅 বুক করুন", href: "/services", grad: def.grad },
          { emoji: "⭐", title: "সন্তুষ্ট গ্রাহকদের পছন্দ", sub: "রিভিউ পড়ে নিশ্চিন্তে সার্ভিস নিন", cta: "⭐ রিভিউ দেখুন", href: "/reviews", grad: def.grad },
        ]}
      />
      <Page>
        <SectionTitle t="🔥 জনপ্রিয় সার্ভিস" link={`${base}/services`} />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {def.services.slice(0, 4).map((s) => <ServiceCard key={s.id} s={s} />)}
        </div>

        <div className="mt-10">
          <SectionTitle t="⚙️ কীভাবে কাজ করে" />
          <div className="grid gap-3 sm:grid-cols-3">
            {steps.map(([e, t, d]) => (
              <div key={t} className={`${cardCls(def)} text-center`}>
                <p className="text-4xl">{e}</p>
                <p className="mt-2 font-black">{t}</p>
                <p className={`mt-1 text-xs ${subCls(def)}`}>{d}</p>
              </div>
            ))}
          </div>
        </div>

        <div className={`${cardCls(def)} mt-10 flex flex-col items-center justify-between gap-4 sm:flex-row`}>
          <div>
            <p className="text-lg font-black">⭐ গ্রাহকরা যা বলছেন</p>
            <p className={`mt-1 text-sm ${subCls(def)}`}>শত শত সন্তুষ্ট গ্রাহকের রিভিউ পড়ুন</p>
          </div>
          <Cta href={`${base}/reviews`} accent={def.accent} small>রিভিউ দেখুন →</Cta>
        </div>

        <div className="mt-10 rounded-3xl bg-gradient-to-br from-black/60 to-black/30 p-8 text-center text-white" style={{ background: `linear-gradient(135deg, ${def.accent}55, transparent)` }}>
          <p className="text-2xl font-black">আজই সার্ভিস বুক করুন</p>
          <p className="mt-1 text-sm opacity-80">দ্রুত, নির্ভরযোগ্য ও প্রফেশনাল</p>
          <div className="mt-4 flex justify-center">
            <Cta href={`${base}/services`} accent={def.accent}>🚀 শুরু করুন</Cta>
          </div>
        </div>
      </Page>
    </>
  );
}

export function SvcList() {
  const { def, base } = useDemo();
  return (
    <Page>
      <Back href={base} label="হোম" />
      <h1 className="text-2xl font-black">🛠️ সব সার্ভিস</h1>
      <p className={`mt-1 text-sm ${subCls(def)}`}>{toBnDigits(def.services.length)}টি সার্ভিস রয়েছে</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {def.services.map((s) => <ServiceCard key={s.id} s={s} />)}
      </div>
    </Page>
  );
}

export function SvcDetail({ id }: { id: string }) {
  const { def, base } = useDemo();
  const s = def.services.find((x) => x.id === id);
  if (!s) return <Page><Empty emoji="😅" text="সার্ভিস পাওয়া যায়নি" /></Page>;
  const feats = [
    `✅ ${s.n} — প্রশিক্ষিত প্রফেশনাল টিম`,
    `✅ সময়কাল: ${s.duration}`,
    "✅ স্বচ্ছ মূল্য — কোনো লুকানো চার্জ নেই",
    "✅ কাজ শেষে ফ্রি ফলো-আপ সাপোর্ট",
  ];
  const related = def.services.filter((x) => x.id !== s.id).slice(0, 3);
  return (
    <Page narrow>
      <Back href={`${base}/services`} label="সার্ভিস" />
      <div className="grid place-items-center rounded-3xl p-10 text-8xl" style={{ background: `${def.accent}15` }}>
        {s.e}
      </div>
      <h1 className="mt-4 text-2xl font-black">{s.n}</h1>
      <div className="mt-1 flex items-center gap-3">
        <Stars rating={s.rating} />
        <span className={`text-xs ${subCls(def)}`}>⏱️ {s.duration}</span>
      </div>
      <div className="mt-2"><Price v={s.p} accent={def.accent} big /></div>
      <p className={`mt-3 text-sm leading-relaxed ${subCls(def)}`}>{s.desc}</p>
      <div className={`${cardCls(def)} mt-4`}>
        <p className="mb-2 font-bold">✨ যা যা পাবেন</p>
        <ul className="space-y-1.5 text-sm">{feats.map((f) => <li key={f}>{f}</li>)}</ul>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-2">
        <Cta href={`${base}/book/${s.id}`} accent={def.accent}>📅 বুক করুন</Cta>
        <Cta href={`${base}/contact`} accent={def.accent} ghost>💬 জিজ্ঞাসা করুন</Cta>
      </div>
      {related.length > 0 && (
        <div className="mt-8">
          <SectionTitle t="🔗 অন্যান্য সার্ভিস" />
          <div className="grid gap-3 sm:grid-cols-3">
            {related.map((r) => <ServiceCard key={r.id} s={r} />)}
          </div>
        </div>
      )}
    </Page>
  );
}

const SLOTS = ["সকাল ৯টা", "সকাল ১১টা", "দুপুর ২টা", "বিকাল ৪টা", "সন্ধ্যা ৬টা"];

export function SvcBook({ id }: { id: string }) {
  const { def, base, store } = useDemo();
  const s = def.services.find((x) => x.id === id);
  const days = nextDays(7);
  const [day, setDay] = useState(0);
  const [slot, setSlot] = useState(SLOTS[0]);
  const [name, setName] = useState(store.user?.name ?? "");
  const [phone, setPhone] = useState(store.user?.phone ?? "");
  const [address, setAddress] = useState(store.user?.address ?? "");
  const [err, setErr] = useState("");
  const [done, setDone] = useState<{ id: string } | null>(null);

  if (!s) return <Page><Empty emoji="😅" text="সার্ভিস পাওয়া যায়নি" /></Page>;

  function confirm() {
    setErr("");
    if (name.trim().length < 3) return setErr("আপনার নাম লিখুন");
    if (!/^01[3-9]\d{8}$/.test(phone.trim())) return setErr("সঠিক ১১ সংখ্যার মোবাইল নম্বর দিন");
    if (address.trim().length < 5) return setErr("ঠিকানা লিখুন");
    const rec = store.placeBooking({
      itemName: s!.n,
      itemEmoji: s!.e,
      date: bnLong(days[day].d),
      slot,
      name: name.trim(),
      phone: phone.trim(),
      total: s!.p,
    });
    setDone({ id: rec.id });
  }

  if (done) {
    return (
      <Page narrow>
        <div className={`${cardCls(def)} py-8 text-center`}>
          <p className="text-6xl">🎉</p>
          <p className="mt-3 text-xl font-black text-emerald-400">বুকিং কনফার্মড!</p>
          <p className={`mt-1 text-xs ${subCls(def)}`}>ধন্যবাদ {name.trim()}!</p>
          <div className={`mx-auto mt-4 max-w-xs rounded-2xl p-4 text-left ${def.dark ? "bg-white/5" : "bg-slate-50"}`}>
            <p className={`text-xs ${subCls(def)}`}>বুকিং নম্বর</p>
            <p className="font-mono text-lg font-black" style={{ color: def.accent }}>{done.id}</p>
            <p className="mt-2 text-sm">{s.e} {s.n}</p>
            <p className={`text-xs ${subCls(def)}`}>📅 {bnLong(days[day].d)} • ⏰ {slot}</p>
            <p className="mt-1 font-black">{toBnDigits(s.p.toLocaleString("en-IN"))} টাকা</p>
          </div>
          <p className={`mt-3 text-[11px] ${subCls(def)}`}>💡 ডেমো বুকিং — আসল সাইটে SMS কনফার্মেশন যাবে</p>
          <div className="mt-4 flex justify-center gap-2">
            <Cta href={`${base}/bookings`} accent={def.accent} small>📋 আমার বুকিং</Cta>
            <Cta href={base} accent={def.accent} ghost small>🏠 হোম</Cta>
          </div>
        </div>
      </Page>
    );
  }

  return (
    <Page narrow>
      <Back href={`${base}/s/${s.id}`} label={s.n} />
      <h1 className="text-2xl font-black">📅 বুকিং করুন</h1>
      <p className={`mt-1 text-sm ${subCls(def)}`}>{s.e} {s.n} • <Price v={s.p} accent={def.accent} /></p>

      <p className="mb-2 mt-5 text-sm font-bold">📆 তারিখ বেছে নিন</p>
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
        {days.map((x, i) => (
          <button
            key={i}
            onClick={() => setDay(i)}
            className={`rounded-2xl border-2 p-2 text-center transition ${day === i ? "" : chipCls(def, false) + " border"}`}
            style={day === i ? { borderColor: def.accent, background: `${def.accent}18` } : undefined}
          >
            <p className="text-[10px] font-bold opacity-70">{x.day}</p>
            <p className="text-xs font-black">{x.label}</p>
          </button>
        ))}
      </div>

      <p className="mb-2 mt-5 text-sm font-bold">⏰ সময় বেছে নিন</p>
      <div className="flex flex-wrap gap-2">
        {SLOTS.map((t) => (
          <button
            key={t}
            onClick={() => setSlot(t)}
            className={`rounded-full border-2 px-4 py-2 text-sm font-bold transition ${slot === t ? "text-white" : chipCls(def, false) + " border"}`}
            style={slot === t ? { background: def.accent, borderColor: def.accent } : undefined}
          >
            {t}
          </button>
        ))}
      </div>

      <div className={`${cardCls(def)} mt-5 space-y-3`}>
        <F dark={def.dark} value={name} onChange={(e) => setName(e.target.value)} placeholder="আপনার নাম *" />
        <F dark={def.dark} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="মোবাইল নম্বর * (01XXXXXXXXX)" inputMode="numeric" />
        <TA dark={def.dark} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="ঠিকানা *" rows={2} />
      </div>

      <div className={`${cardCls(def)} mt-4 flex items-center justify-between`}>
        <span className={subCls(def)}>সর্বমোট</span>
        <Price v={s.p} accent={def.accent} big />
      </div>

      {err && <p className="mt-3 rounded-xl bg-red-500/10 px-4 py-2.5 text-xs font-bold text-red-400">⚠️ {err}</p>}
      {!store.user && <div className="mt-3"><LoginHint /></div>}
      <button onClick={confirm} className="btn-demo mt-4 w-full !py-3.5 text-base" style={{ background: def.accent }}>
        ✅ বুকিং কনফার্ম করুন
      </button>
      <p className={`mt-2 text-center text-[11px] ${subCls(def)}`}>ডেমো বুকিং — কোনো আসল টাকা লাগবে না</p>
    </Page>
  );
}

export function SvcBookings() {
  const { def, base, store } = useDemo();
  const list = myBookings(store);
  return (
    <Page narrow>
      <Back href={base} label="হোম" />
      <h1 className="text-2xl font-black">📋 আমার বুকিং</h1>
      {!store.user && <div className="mt-3"><LoginHint /></div>}
      {list.length === 0 ? (
        <Empty emoji="📭" text="এখনো কোনো বুকিং করেননি" />
      ) : (
        <div className="mt-4 space-y-3">
          {list.map((b) => <BookingRow key={b.id} b={b} dark={def.dark} />)}
        </div>
      )}
      <div className="mt-5 flex justify-center">
        <Cta href={`${base}/services`} accent={def.accent} small>🛠️ নতুন বুকিং করুন</Cta>
      </div>
    </Page>
  );
}

export function SvcReviews() {
  const { def, base } = useDemo();
  const seed = [
    { n: "রহিম উদ্দিন", r: 5, t: "খুবই ভালো সার্ভিস! সময়মতো এসেছে, কাজও একদম পরিষ্কার।", d: "২ দিন আগে" },
    { n: "শারমিন আক্তার", r: 5, t: "দাম অনুযায়ী সেরা। আবার নেবো ইনশাআল্লাহ।", d: "১ সপ্তাহ আগে" },
    { n: "করিম শেখ", r: 4, t: "ভালো লেগেছে। একটু দেরি হয়েছিল, তবে কাজ চমৎকার।", d: "২ সপ্তাহ আগে" },
    { n: "নুসরাত জাহান", r: 5, t: "প্রফেশনাল আচরণ, ধন্যবাদ!", d: "১ মাস আগে" },
  ];
  const [list, setList] = useState(seed);
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [err, setErr] = useState("");
  function add() {
    setErr("");
    if (name.trim().length < 2) return setErr("নাম লিখুন");
    if (text.trim().length < 5) return setErr("রিভিউ লিখুন");
    setList([{ n: name.trim(), r: rating, t: text.trim(), d: "এইমাত্র" }, ...list]);
    setName(""); setText(""); setRating(5);
  }
  return (
    <Page narrow>
      <Back href={base} label="হোম" />
      <h1 className="text-2xl font-black">⭐ গ্রাহক রিভিউ</h1>
      <p className={`mt-1 text-sm ${subCls(def)}`}>{toBnDigits(list.length)}টি রিভিউ</p>
      <div className="mt-4 space-y-3">
        {list.map((r, i) => (
          <div key={i} className={cardCls(def)}>
            <div className="flex items-center justify-between">
              <p className="font-bold">👤 {r.n}</p>
              <span className="text-[11px] opacity-60">{r.d}</span>
            </div>
            <p className="mt-0.5 text-amber-400 text-sm">{"★".repeat(r.r)}{"☆".repeat(5 - r.r)}</p>
            <p className="mt-1 text-sm">{r.t}</p>
          </div>
        ))}
      </div>
      <div className={`${cardCls(def)} mt-5`}>
        <p className="mb-3 font-bold">✍️ আপনার রিভিউ দিন</p>
        <div className="space-y-3">
          <F dark={def.dark} value={name} onChange={(e) => setName(e.target.value)} placeholder="আপনার নাম *" />
          <Sel dark={def.dark} value={rating} onChange={(e) => setRating(Number(e.target.value))}>
            {[5, 4, 3, 2, 1].map((r) => <option key={r} value={r}>{"★".repeat(r)} ({toBnDigits(r)})</option>)}
          </Sel>
          <TA dark={def.dark} value={text} onChange={(e) => setText(e.target.value)} placeholder="আপনার অভিজ্ঞতা লিখুন *" rows={3} />
          {err && <p className="rounded-xl bg-red-500/10 px-4 py-2.5 text-xs font-bold text-red-400">⚠️ {err}</p>}
          <button onClick={add} className="btn-demo w-full !py-3" style={{ background: def.accent }}>
            ⭐ রিভিউ জমা দিন
          </button>
        </div>
      </div>
    </Page>
  );
}

export function SvcAbout() {
  return <AboutBody />;
}
export function SvcContact() {
  return <ContactBody />;
}

/* ================================================================
   GALLERY layout (photography / portfolio)
================================================================ */

function GalCard({ g }: { g: DemoGalleryItem }) {
  const { def, base } = useDemo();
  return (
    <Link
      href={`${base}/g/${g.id}`}
      className={`group block break-inside-avoid overflow-hidden rounded-2xl border transition hover:-translate-y-1 hover:shadow-xl ${
        def.dark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"
      }`}
    >
      <div className={`grid place-items-center p-8 text-6xl ${def.dark ? "bg-white/[0.03]" : "bg-slate-50"}`}>
        {g.e}
      </div>
      <div className="p-3">
        <p className="text-sm font-bold">{g.t}</p>
        <p className={`text-[11px] ${subCls(def)}`}>{g.c}</p>
      </div>
    </Link>
  );
}

export function GalHome() {
  const { def, base } = useDemo();
  return (
    <>
      <HeroSlider
        accent={def.accent}
        slides={[
          { img: def.heroImg, emoji: def.heroEmoji, title: def.heroTitle, sub: def.heroSub, cta: "🖼️ গ্যালারি দেখুন", href: "/gallery", grad: def.grad },
          { emoji: "💰", title: "স্বচ্ছ প্রাইসিং", sub: "প্যাকেজ দেখে বাজেট অনুযায়ী বেছে নিন", cta: "💰 প্রাইসিং", href: "/pricing", grad: def.grad },
          { emoji: "📸", title: "আপনার ইভেন্টের জন্য বুক করুন", sub: "তারিখ কনফার্ম করুন মিনিটেই", cta: "📸 বুক করুন", href: "/book", grad: def.grad },
        ]}
      />
      <Page>
        <div className="mb-3 flex flex-wrap gap-2">
          {def.cats.slice(0, 5).map((c) => (
            <Link
              key={c}
              href={`${base}/gallery?cat=${encodeURIComponent(c)}`}
              className={`rounded-full border px-4 py-1.5 text-xs font-bold transition ${chipCls(def, false)}`}
            >
              {c}
            </Link>
          ))}
        </div>
        <div className="columns-2 gap-3 space-y-3 sm:columns-3">
          {def.gallery.slice(0, 6).map((g) => <GalCard key={g.id} g={g} />)}
        </div>
        <div className={`${cardCls(def)} mt-8 flex flex-col items-center justify-between gap-4 sm:flex-row`}>
          <div>
            <p className="text-lg font-black">💰 প্যাকেজ ও মূল্য</p>
            <p className={`mt-1 text-sm ${subCls(def)}`}>{toBnDigits(5000)} টাকা থেকে শুরু</p>
          </div>
          <Cta href={`${base}/pricing`} accent={def.accent} small>প্যাকেজ দেখুন →</Cta>
        </div>
        <div className="mt-8 rounded-3xl p-8 text-center text-white" style={{ background: `linear-gradient(135deg, ${def.accent}66, transparent)` }}>
          <p className="text-2xl font-black">📸 আপনার মুহূর্ত, আমাদের লেন্সে</p>
          <p className="mt-1 text-sm opacity-80">আজই সেশন বুক করুন</p>
          <div className="mt-4 flex justify-center">
            <Cta href={`${base}/book`} accent={def.accent}>বুক করুন</Cta>
          </div>
        </div>
      </Page>
    </>
  );
}

function GalGridInner() {
  const { def, base } = useDemo();
  const sp = useSearchParams();
  const cat = sp.get("cat") ?? "সব";
  const cats = ["সব", ...def.cats];
  const items = cat === "সব" ? def.gallery : def.gallery.filter((g) => g.c === cat);
  return (
    <Page>
      <Back href={base} label="হোম" />
      <h1 className="text-2xl font-black">🖼️ গ্যালারি</h1>
      <div className="mb-4 mt-3 flex flex-wrap gap-2">
        {cats.map((c) => (
          <Link
            key={c}
            href={c === "সব" ? `${base}/gallery` : `${base}/gallery?cat=${encodeURIComponent(c)}`}
            className={`rounded-full border px-4 py-1.5 text-xs font-bold transition ${chipCls(def, c === cat)}`}
            style={c === cat ? { background: def.accent, borderColor: def.accent } : undefined}
          >
            {c}
          </Link>
        ))}
      </div>
      {items.length === 0 ? (
        <Empty emoji="🖼️" text="এই ক্যাটাগরিতে ছবি নেই" />
      ) : (
        <div className="columns-2 gap-3 space-y-3 sm:columns-3">
          {items.map((g) => <GalCard key={g.id} g={g} />)}
        </div>
      )}
    </Page>
  );
}

export function GalGrid() {
  return (
    <Suspense fallback={<Page><p className="py-10 text-center text-sm opacity-60">লোড হচ্ছে…</p></Page>}>
      <GalGridInner />
    </Suspense>
  );
}

export function GalDetail({ id }: { id: string }) {
  const { def, base } = useDemo();
  const g = def.gallery.find((x) => x.id === id);
  if (!g) return <Page><Empty emoji="😅" text="ছবি পাওয়া যায়নি" /></Page>;
  const related = def.gallery.filter((x) => x.id !== g.id && x.c === g.c).slice(0, 3);
  return (
    <Page narrow>
      <Back href={`${base}/gallery`} label="গ্যালারি" />
      <div className={`relative grid place-items-center overflow-hidden rounded-3xl ${def.dark ? "bg-white/[0.03]" : "bg-slate-50"}`}>
        {def.heroImg && <img src={def.heroImg} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />}
        <div className="relative p-16 text-9xl drop-shadow-lg">{g.e}</div>
      </div>
      <h1 className="mt-4 text-2xl font-black">{g.t}</h1>
      <p className={`mt-1 text-sm ${subCls(def)}`}>🏷️ {g.c}</p>
      <p className={`mt-3 text-sm leading-relaxed ${subCls(def)}`}>
        এই ধরনের শুটের জন্য আমাদের টিম প্রস্তুত। প্যাকেজ দেখে পছন্দমতো সেশন বুক করুন — প্রফেশনাল এডিটিংসহ ডেলিভারি।
      </p>
      <div className="mt-5 grid grid-cols-2 gap-2">
        <Cta href={`${base}/book`} accent={def.accent}>📸 বুকিং করুন</Cta>
        <Cta href={`${base}/pricing`} accent={def.accent} ghost>💰 প্যাকেজ</Cta>
      </div>
      {related.length > 0 && (
        <div className="mt-8">
          <SectionTitle t="🔗 একই ক্যাটাগরি" />
          <div className="columns-2 gap-3 space-y-3">
            {related.map((r) => <GalCard key={r.id} g={r} />)}
          </div>
        </div>
      )}
    </Page>
  );
}

const GAL_PKGS = [
  { id: "basic", n: "বেসিক", p: 5000, f: ["২ ঘণ্টা ফটোশুট", "২০টি এডিটেড ছবি", "অনলাইন গ্যালারি"] },
  { id: "standard", n: "স্ট্যান্ডার্ড", p: 12000, f: ["৫ ঘণ্টা ফটোশুট", "৬০টি এডিটেড ছবি", "প্রিমিয়াম অ্যালবাম", "অনলাইন গ্যালারি"], hot: true },
  { id: "premium", n: "প্রিমিয়াম", p: 25000, f: ["সারাদিন শুট", "২০০+ এডিটেড ছবি", "প্রিমিয়াম অ্যালবাম", "ভিডিও হাইলাইট", "ড্রোন শট"] },
];

export function GalPricing() {
  const { def, base } = useDemo();
  return (
    <Page>
      <Back href={base} label="হোম" />
      <h1 className="text-2xl font-black">💰 প্যাকেজ ও মূল্য</h1>
      <p className={`mt-1 text-sm ${subCls(def)}`}>পছন্দের প্যাকেজ বেছে নিয়ে বুক করুন</p>
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        {GAL_PKGS.map((p) => (
          <div
            key={p.id}
            className={`${cardCls(def)} relative ${p.hot ? "!border-2" : ""}`}
            style={p.hot ? { borderColor: def.accent } : undefined}
          >
            {p.hot && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-[10px] font-black text-white" style={{ background: def.accent }}>
                🔥 জনপ্রিয়
              </span>
            )}
            <p className="text-lg font-black">{p.n}</p>
            <p className="mt-1"><Price v={p.p} accent={def.accent} big /></p>
            <ul className="mt-3 space-y-1.5 text-xs">
              {p.f.map((f) => <li key={f}>✓ {f}</li>)}
            </ul>
            <div className="mt-4">
              <Cta href={`${base}/book?pkg=${p.id}`} accent={def.accent} small>📸 বুক করুন</Cta>
            </div>
          </div>
        ))}
      </div>
    </Page>
  );
}

function GalBookInner() {
  const { def, base, store } = useDemo();
  const sp = useSearchParams();
  const pkg = GAL_PKGS.find((p) => p.id === sp.get("pkg")) ?? GAL_PKGS[1];
  const days = nextDays(14);
  const [etype, setEtype] = useState("বিয়ে");
  const [day, setDay] = useState(3);
  const [name, setName] = useState(store.user?.name ?? "");
  const [phone, setPhone] = useState(store.user?.phone ?? "");
  const [err, setErr] = useState("");
  const [done, setDone] = useState<{ id: string } | null>(null);

  function confirm() {
    setErr("");
    if (name.trim().length < 3) return setErr("আপনার নাম লিখুন");
    if (!/^01[3-9]\d{8}$/.test(phone.trim())) return setErr("সঠিক ১১ সংখ্যার মোবাইল নম্বর দিন");
    const rec = store.placeBooking({
      itemName: `${pkg.n} প্যাকেজ — ${etype}`,
      itemEmoji: "📸",
      date: bnLong(days[day].d),
      slot: etype,
      name: name.trim(),
      phone: phone.trim(),
      total: pkg.p,
    });
    setDone({ id: rec.id });
  }

  if (done) {
    return (
      <Page narrow>
        <div className={`${cardCls(def)} py-8 text-center`}>
          <p className="text-6xl">🎉</p>
          <p className="mt-3 text-xl font-black text-emerald-400">বুকিং কনফার্মড!</p>
          <div className={`mx-auto mt-4 max-w-xs rounded-2xl p-4 text-left ${def.dark ? "bg-white/5" : "bg-slate-50"}`}>
            <p className={`text-xs ${subCls(def)}`}>বুকিং নম্বর</p>
            <p className="font-mono text-lg font-black" style={{ color: def.accent }}>{done.id}</p>
            <p className="mt-2 text-sm">📸 {pkg.n} প্যাকেজ — {etype}</p>
            <p className={`text-xs ${subCls(def)}`}>📅 {bnLong(days[day].d)}</p>
            <p className="mt-1 font-black">{toBnDigits(pkg.p.toLocaleString("en-IN"))} টাকা</p>
          </div>
          <p className={`mt-3 text-[11px] ${subCls(def)}`}>💡 ডেমো বুকিং — আসল সাইটে কল করে কনফার্ম করা হবে</p>
          <div className="mt-4 flex justify-center gap-2">
            <Cta href={`${base}/bookings`} accent={def.accent} small>📋 আমার বুকিং</Cta>
            <Cta href={base} accent={def.accent} ghost small>🏠 হোম</Cta>
          </div>
        </div>
      </Page>
    );
  }

  return (
    <Page narrow>
      <Back href={`${base}/pricing`} label="প্যাকেজ" />
      <h1 className="text-2xl font-black">📸 সেশন বুক করুন</h1>
      <div className={`${cardCls(def)} mt-4 flex items-center justify-between`}>
        <span className="font-bold">{pkg.n} প্যাকেজ</span>
        <Price v={pkg.p} accent={def.accent} />
      </div>
      <div className="mt-4 space-y-3">
        <div>
          <p className="mb-1.5 text-sm font-bold">🎭 ইভেন্টের ধরন</p>
          <Sel dark={def.dark} value={etype} onChange={(e) => setEtype(e.target.value)}>
            {["বিয়ে", "পোর্ট্রেট", "ইভেন্ট", "পণ্য", "পরিবার"].map((t) => <option key={t} value={t}>{t}</option>)}
          </Sel>
        </div>
        <div>
          <p className="mb-1.5 text-sm font-bold">📆 তারিখ</p>
          <Sel dark={def.dark} value={day} onChange={(e) => setDay(Number(e.target.value))}>
            {days.map((x, i) => <option key={i} value={i}>{x.day} — {bnLong(x.d)}</option>)}
          </Sel>
        </div>
        <F dark={def.dark} value={name} onChange={(e) => setName(e.target.value)} placeholder="আপনার নাম *" />
        <F dark={def.dark} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="মোবাইল নম্বর * (01XXXXXXXXX)" inputMode="numeric" />
      </div>
      {err && <p className="mt-3 rounded-xl bg-red-500/10 px-4 py-2.5 text-xs font-bold text-red-400">⚠️ {err}</p>}
      {!store.user && <div className="mt-3"><LoginHint /></div>}
      <button onClick={confirm} className="btn-demo mt-4 w-full !py-3.5 text-base" style={{ background: def.accent }}>
        ✅ বুকিং কনফার্ম করুন
      </button>
    </Page>
  );
}

export function GalBook() {
  return (
    <Suspense fallback={<Page><p className="py-10 text-center text-sm opacity-60">লোড হচ্ছে…</p></Page>}>
      <GalBookInner />
    </Suspense>
  );
}

export function GalAbout() {
  return <AboutBody />;
}
export function GalContact() {
  return <ContactBody />;
}

/* ================================================================
   BOOKING layout (hotel / tour stays — products reused as listings)
================================================================ */

const AMENITIES = ["📶 ফ্রি WiFi", "🅿️ ফ্রি পার্কিং", "🍳 কমপ্লিমেন্টারি ব্রেকফাস্ট", "🏊 সুইমিং পুল", "❄️ এসি রুম", "📺 স্মার্ট টিভি"];

export function BookHome() {
  const { def, base } = useDemo();
  const [loc, setLoc] = useState("");
  const [guests, setGuests] = useState(2);
  const feat = def.products.slice(0, 4);
  return (
    <>
      <HeroSlider
        accent={def.accent}
        slides={[
          { img: def.heroImg, emoji: def.heroEmoji, title: def.heroTitle, sub: def.heroSub, cta: "🏨 লিস্টিং দেখুন", href: "/stays", grad: def.grad },
          { emoji: "💳", title: "সহজ বুকিং, নিরাপদ পেমেন্ট", sub: "অনলাইনে বুক করে নিশ্চিন্তে ঘুরুন", cta: "📅 বুক করুন", href: "/stays", grad: def.grad },
        ]}
      />
      <div className="px-4">
        <div className="mx-auto -mt-2 max-w-4xl text-center">
          <div className={`mx-auto mt-6 max-w-2xl rounded-3xl p-4 text-left ${def.dark ? "bg-black/40" : "bg-white/90 shadow-xl"}`}>
            <F dark={def.dark} value={loc} onChange={(e) => setLoc(e.target.value)} placeholder="📍 কোথায় যেতে চান? (যেমন: কক্সবাজার)" />
            <div className="mt-3 flex items-center justify-between rounded-2xl px-1">
              <span className={`text-sm font-bold ${def.dark ? "text-white" : "text-slate-700"}`}>👥 অতিথি</span>
              <div className="flex items-center gap-3">
                <button onClick={() => setGuests((g) => Math.max(1, g - 1))} className="grid h-9 w-9 place-items-center rounded-full bg-black/20 text-lg font-black text-white">−</button>
                <span className={`text-lg font-black ${def.dark ? "text-white" : "text-slate-800"}`}>{toBnDigits(guests)}</span>
                <button onClick={() => setGuests((g) => Math.min(10, g + 1))} className="grid h-9 w-9 place-items-center rounded-full bg-black/20 text-lg font-black text-white">+</button>
              </div>
            </div>
            <Link
              href={`${base}/stays${loc.trim() ? `?loc=${encodeURIComponent(loc.trim())}` : ""}`}
              className="btn-demo mt-3 block w-full !py-3.5 text-center text-base"
              style={{ background: def.accent }}
            >
              🔍 খুঁজুন
            </Link>
          </div>
        </div>
      </div>
      <Page>
        <SectionTitle t="⭐ ফিচার্ড স্টে" sub="সবচেয়ে জনপ্রিয়" link={`${base}/stays`} />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {feat.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {[["💳", "সহজ পেমেন্ট", "বিকাশ/কার্ড/ক্যাশ"], ["🛡️", "নিরাপদ বুকিং", "কনফার্মেশন গ্যারান্টি"], ["🎧", "২৪/৭ সাপোর্ট", "যেকোনো সময় কল করুন"]].map(([e, t, d]) => (
            <div key={t} className={`${cardCls(def)} text-center`}>
              <p className="text-3xl">{e}</p>
              <p className="mt-1 font-bold">{t}</p>
              <p className={`text-xs ${subCls(def)}`}>{d}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 flex justify-center gap-2">
          <Cta href={`${base}/stays`} accent={def.accent}>🏨 সব স্টে দেখুন</Cta>
          <Cta href={`${base}/my`} accent={def.accent} ghost>📋 আমার বুকিং</Cta>
        </div>
      </Page>
    </>
  );
}

export function BookStays() {
  const { def, base } = useDemo();
  return (
    <Page>
      <Back href={base} label="হোম" />
      <h1 className="text-2xl font-black">🏨 সব স্টে</h1>
      <p className={`mt-1 text-sm ${subCls(def)}`}>{toBnDigits(def.products.length)}টি অপশন</p>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {def.products.map((p) => <ProductCard key={p.id} p={p} />)}
      </div>
    </Page>
  );
}

export function BookDetail({ id }: { id: string }) {
  const { def, base } = useDemo();
  const p = def.products.find((x) => x.id === id);
  if (!p) return <Page><Empty emoji="😅" text="পাওয়া যায়নি" /></Page>;
  const amen = AMENITIES.slice(0, 4);
  const related = def.products.filter((x) => x.id !== p.id).slice(0, 4);
  return (
    <Page narrow>
      <Back href={`${base}/stays`} label="স্টে" />
      <div className={`grid place-items-center rounded-3xl p-14 text-8xl ${def.dark ? "bg-white/[0.03]" : "bg-slate-50"}`}>
        {p.e}
      </div>
      <h1 className="mt-4 text-2xl font-black">{p.n}</h1>
      <div className="mt-1"><Stars rating={p.rating} reviews={p.reviews} /></div>
      <div className="mt-2"><Price v={p.p} accent={def.accent} big note={p.priceNote ?? def.priceNote} /></div>
      <p className={`mt-3 text-sm leading-relaxed ${subCls(def)}`}>{p.desc}</p>
      <div className={`${cardCls(def)} mt-4`}>
        <p className="mb-2 font-bold">✨ সুবিধাসমূহ</p>
        <div className="grid grid-cols-2 gap-2">
          {amen.map((a) => (
            <p key={a} className="rounded-xl bg-black/10 px-3 py-2 text-xs font-bold">{a}</p>
          ))}
        </div>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-2">
        <Cta href={`${base}/book/${p.id}`} accent={def.accent}>📅 বুক করুন</Cta>
        <Cta href={`${base}/contact`} accent={def.accent} ghost>💬 জিজ্ঞাসা</Cta>
      </div>
      {related.length > 0 && (
        <div className="mt-8">
          <SectionTitle t="🔗 আরও দেখুন" />
          <div className="grid grid-cols-2 gap-3">
            {related.map((r) => <ProductCard key={r.id} p={r} />)}
          </div>
        </div>
      )}
    </Page>
  );
}

export function BookFlow({ id }: { id: string }) {
  const { def, base, store } = useDemo();
  const p = def.products.find((x) => x.id === id);
  const days = nextDays(14);
  const [ci, setCi] = useState(0);
  const [co, setCo] = useState(2);
  const [guests, setGuests] = useState(2);
  const [name, setName] = useState(store.user?.name ?? "");
  const [phone, setPhone] = useState(store.user?.phone ?? "");
  const [err, setErr] = useState("");
  const [done, setDone] = useState<{ id: string } | null>(null);

  if (!p) return <Page><Empty emoji="😅" text="পাওয়া যায়নি" /></Page>;

  const coFixed = Math.max(co, ci + 1);
  const nights = coFixed - ci;
  const total = p.p * nights;

  function confirm() {
    setErr("");
    if (name.trim().length < 3) return setErr("আপনার নাম লিখুন");
    if (!/^01[3-9]\d{8}$/.test(phone.trim())) return setErr("সঠিক ১১ সংখ্যার মোবাইল নম্বর দিন");
    const rec = store.placeBooking({
      itemName: p!.n,
      itemEmoji: p!.e,
      date: `${bnLong(days[ci].d)} → ${bnLong(days[coFixed].d)}`,
      slot: `${toBnDigits(guests)} জন • ${toBnDigits(nights)} রাত`,
      name: name.trim(),
      phone: phone.trim(),
      total,
    });
    setDone({ id: rec.id });
  }

  if (done) {
    return (
      <Page narrow>
        <div className={`${cardCls(def)} py-8 text-center`}>
          <p className="text-6xl">🎉</p>
          <p className="mt-3 text-xl font-black text-emerald-400">বুকিং কনফার্মড!</p>
          <div className={`mx-auto mt-4 max-w-xs rounded-2xl p-4 text-left ${def.dark ? "bg-white/5" : "bg-slate-50"}`}>
            <p className={`text-xs ${subCls(def)}`}>বুকিং নম্বর</p>
            <p className="font-mono text-lg font-black" style={{ color: def.accent }}>{done.id}</p>
            <p className="mt-2 text-sm">{p.e} {p.n}</p>
            <p className={`text-xs ${subCls(def)}`}>📅 {bnLong(days[ci].d)} → {bnLong(days[coFixed].d)}</p>
            <p className={`text-xs ${subCls(def)}`}>👥 {toBnDigits(guests)} জন • 🌙 {toBnDigits(nights)} রাত</p>
            <p className="mt-1 font-black">{toBnDigits(total.toLocaleString("en-IN"))} টাকা</p>
          </div>
          <p className={`mt-3 text-[11px] ${subCls(def)}`}>💡 ডেমো বুকিং — আসল সাইটে কনফার্মেশন SMS যাবে</p>
          <div className="mt-4 flex justify-center gap-2">
            <Cta href={`${base}/my`} accent={def.accent} small>📋 আমার বুকিং</Cta>
            <Cta href={base} accent={def.accent} ghost small>🏠 হোম</Cta>
          </div>
        </div>
      </Page>
    );
  }

  return (
    <Page narrow>
      <Back href={`${base}/p/${p.id}`} label={p.n} />
      <h1 className="text-2xl font-black">📅 বুকিং করুন</h1>
      <p className={`mt-1 text-sm ${subCls(def)}`}>{p.e} {p.n}</p>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <div>
          <p className="mb-1.5 text-sm font-bold">🛬 চেক-ইন</p>
          <Sel dark={def.dark} value={ci} onChange={(e) => { const v = Number(e.target.value); setCi(v); if (coFixed <= v) setCo(v + 1); }}>
            {days.map((x, i) => <option key={i} value={i}>{x.day} — {bnLong(x.d)}</option>)}
          </Sel>
        </div>
        <div>
          <p className="mb-1.5 text-sm font-bold">🛫 চেক-আউট</p>
          <Sel dark={def.dark} value={coFixed} onChange={(e) => setCo(Number(e.target.value))}>
            {days.map((x, i) => i > ci && <option key={i} value={i}>{x.day} — {bnLong(x.d)}</option>)}
          </Sel>
        </div>
      </div>

      <div className={`${cardCls(def)} mt-3 flex items-center justify-between`}>
        <span className="text-sm font-bold">👥 অতিথি সংখ্যা</span>
        <div className="flex items-center gap-3">
          <button onClick={() => setGuests((g) => Math.max(1, g - 1))} className="grid h-9 w-9 place-items-center rounded-full bg-black/20 text-lg font-black">−</button>
          <span className="text-lg font-black">{toBnDigits(guests)}</span>
          <button onClick={() => setGuests((g) => Math.min(10, g + 1))} className="grid h-9 w-9 place-items-center rounded-full bg-black/20 text-lg font-black">+</button>
        </div>
      </div>

      <div className={`${cardCls(def)} mt-3 space-y-1.5 text-sm`}>
        <div className="flex justify-between"><span className={subCls(def)}>প্রতি রাত</span><span className="font-bold">{toBnDigits(p.p.toLocaleString("en-IN"))} টাকা{def.priceNote ? ` ${def.priceNote}` : ""}</span></div>
        <div className="flex justify-between"><span className={subCls(def)}>মোট রাত</span><span className="font-bold">{toBnDigits(nights)}</span></div>
        <div className="flex justify-between border-t border-white/10 pt-2"><span className="font-black">সর্বমোট</span><Price v={total} accent={def.accent} big /></div>
      </div>

      <div className={`${cardCls(def)} mt-3 space-y-3`}>
        <F dark={def.dark} value={name} onChange={(e) => setName(e.target.value)} placeholder="আপনার নাম *" />
        <F dark={def.dark} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="মোবাইল নম্বর * (01XXXXXXXXX)" inputMode="numeric" />
      </div>

      {err && <p className="mt-3 rounded-xl bg-red-500/10 px-4 py-2.5 text-xs font-bold text-red-400">⚠️ {err}</p>}
      {!store.user && <div className="mt-3"><LoginHint /></div>}
      <button onClick={confirm} className="btn-demo mt-4 w-full !py-3.5 text-base" style={{ background: def.accent }}>
        ✅ বুকিং কনফার্ম করুন
      </button>
      <p className={`mt-2 text-center text-[11px] ${subCls(def)}`}>ডেমো বুকিং — কোনো আসল টাকা লাগবে না</p>
    </Page>
  );
}

export function BookMy() {
  const { def, base, store } = useDemo();
  const list = myBookings(store);
  return (
    <Page narrow>
      <Back href={base} label="হোম" />
      <h1 className="text-2xl font-black">📋 আমার বুকিং</h1>
      {!store.user && <div className="mt-3"><LoginHint /></div>}
      {list.length === 0 ? (
        <Empty emoji="📭" text="এখনো কোনো বুকিং করেননি" />
      ) : (
        <div className="mt-4 space-y-3">
          {list.map((b) => <BookingRow key={b.id} b={b} dark={def.dark} />)}
        </div>
      )}
      <div className="mt-5 flex justify-center">
        <Cta href={`${base}/stays`} accent={def.accent} small>🏨 নতুন বুকিং করুন</Cta>
      </div>
    </Page>
  );
}

export function BookWallet() {
  const { def, base, store } = useDemo();
  return (
    <Page narrow>
      <Back href={base} label="হোম" />
      <h1 className="text-2xl font-black">💳 ওয়ালেট</h1>
      <div className={`${cardCls(def)} mt-4 text-center !p-6`}>
        <p className={`text-xs ${subCls(def)}`}>বর্তমান ব্যালেন্স</p>
        <p className="mt-1 text-4xl font-black" style={{ color: def.accent }}>
          {toBnDigits(store.wallet.toLocaleString("en-IN"))} টাকা
        </p>
        <p className={`mt-1 text-[11px] ${subCls(def)}`}>ডেমো ওয়ালেট — বুকিংয়ে ব্যবহার করা যাবে</p>
      </div>
      <p className="mb-2 mt-5 text-sm font-bold">💰 টপ-আপ করুন (ডেমো)</p>
      <div className="grid grid-cols-3 gap-2">
        {[1000, 2000, 5000].map((a) => (
          <button
            key={a}
            onClick={() => store.topUp(a)}
            className="btn-demo !py-3 !text-sm"
            style={{ background: def.accent }}
          >
            +{toBnDigits(a.toLocaleString("en-IN"))}
          </button>
        ))}
      </div>
      <p className="mb-2 mt-6 text-sm font-bold">🧾 লেনদেন হিস্ট্রি</p>
      {store.txs.length === 0 ? (
        <Empty emoji="🧾" text="এখনো কোনো লেনদেন হয়নি" />
      ) : (
        <div className="space-y-2">
          {store.txs.map((t, i) => (
            <div key={i} className={`${cardCls(def)} flex items-center justify-between !p-3`}>
              <div>
                <p className="text-sm font-bold">{t.label}</p>
                <p className={`text-[11px] ${subCls(def)}`}>{new Date(t.date).toLocaleDateString("bn-BD")}</p>
              </div>
              <p className={`font-black ${t.amount >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {t.amount >= 0 ? "+" : "−"}{toBnDigits(Math.abs(t.amount).toLocaleString("en-IN"))}
              </p>
            </div>
          ))}
        </div>
      )}
    </Page>
  );
}

export function BookAbout() {
  return <AboutBody />;
}
export function BookContact() {
  return <ContactBody />;
}

/* ================================================================
   NEWS layout
================================================================ */

function NewsRow({ n }: { n: DemoNewsItem }) {
  const { def, base } = useDemo();
  return (
    <Link
      href={`${base}/a/${n.id}`}
      className={`flex w-full items-center gap-3 rounded-2xl p-3 text-left transition hover:shadow ${
        def.dark ? "bg-white/5 hover:bg-white/10" : "bg-slate-50 hover:bg-slate-100"
      }`}
    >
      <span className={`grid h-14 w-14 shrink-0 place-items-center rounded-xl text-3xl ${def.dark ? "bg-white/10" : "bg-white"}`}>
        {n.e}
      </span>
      <span className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold">{n.t}</p>
        <p className={`text-[11px] ${subCls(def)}`}>{n.c} • {n.time}</p>
      </span>
      <span className="text-xs opacity-50">→</span>
    </Link>
  );
}

export function NewsHome() {
  const { def, base } = useDemo();
  const [first, ...rest] = def.news;
  return (
    <>
      <div className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-white ${def.dark ? "bg-red-600" : "bg-red-600"}`}>
        <span className="animate-pulse rounded bg-white/25 px-2 py-0.5 text-xs">🔴 লাইভ</span>
        <span className="truncate">সর্বশেষ খবর সবার আগে</span>
        <Link href={`${base}/search`} className="ml-auto rounded-full bg-white/20 px-3 py-1 text-xs">🔍 খুঁজুন</Link>
      </div>
      <Page>
        {first && (
          <Link href={`${base}/a/${first.id}`} className={`${cardCls(def)} group mb-5 block !p-0 overflow-hidden`}>
            <div className={`relative grid place-items-center overflow-hidden p-10 text-7xl ${def.dark ? "bg-white/[0.03]" : "bg-slate-50"}`}>
              {def.heroImg ? (
                <img src={def.heroImg} alt="" className="absolute inset-0 h-full w-full object-cover" />
              ) : (
                <span className="relative">{first.e}</span>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
            <div className="p-4">
              <span className="rounded-full bg-red-500/15 px-2.5 py-1 text-[10px] font-black text-red-400">⚡ ব্রেকিং</span>
              <p className="mt-2 text-lg font-black group-hover:underline">{first.t}</p>
              <p className={`mt-1 text-xs ${subCls(def)}`}>{first.c} • {first.time}</p>
            </div>
          </Link>
        )}
        <div className="mb-4 flex flex-wrap gap-2">
          {def.cats.map((c) => (
            <Link
              key={c}
              href={`${base}/cat/${encodeURIComponent(c)}`}
              className={`rounded-full border px-4 py-1.5 text-xs font-bold transition ${chipCls(def, false)}`}
            >
              {c}
            </Link>
          ))}
        </div>
        <SectionTitle t="📰 সর্বশেষ খবর" />
        <div className="space-y-2">
          {rest.map((n) => <NewsRow key={n.id} n={n} />)}
        </div>
      </Page>
    </>
  );
}

export function NewsCat({ cat }: { cat: string }) {
  const { def, base } = useDemo();
  const list = def.news.filter((n) => n.c === cat);
  return (
    <Page narrow>
      <Back href={base} label="হোম" />
      <h1 className="text-2xl font-black">🏷️ {cat}</h1>
      <p className={`mt-1 text-sm ${subCls(def)}`}>{toBnDigits(list.length)}টি খবর</p>
      {list.length === 0 ? (
        <Empty emoji="📰" text="এই ক্যাটাগরিতে খবর নেই" />
      ) : (
        <div className="mt-4 space-y-2">
          {list.map((n) => <NewsRow key={n.id} n={n} />)}
        </div>
      )}
    </Page>
  );
}

export function NewsArticle({ id }: { id: string }) {
  const { def, base } = useDemo();
  const n = def.news.find((x) => x.id === id);
  const [copied, setCopied] = useState(false);
  if (!n) return <Page><Empty emoji="😅" text="খবর পাওয়া যায়নি" /></Page>;
  const paras = n.body.split("।").map((s) => s.trim()).filter(Boolean).map((s) => s + "।");
  const related = def.news.filter((x) => x.id !== n.id && x.c === n.c).slice(0, 4);
  function share() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const nav = navigator as Navigator & { share?: (d: { title: string; url: string }) => Promise<void> };
    if (nav.share) {
      nav.share({ title: n!.t, url }).catch(() => {});
      return;
    }
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  }
  return (
    <Page narrow>
      <Back href={base} label="হোম" />
      <div className={`grid place-items-center rounded-3xl p-12 text-8xl ${def.dark ? "bg-white/[0.03]" : "bg-slate-50"}`}>
        {n.e}
      </div>
      <span className="mt-4 inline-block rounded-full bg-red-500/15 px-3 py-1 text-[11px] font-black text-red-400">{n.c}</span>
      <h1 className="mt-2 text-2xl font-black leading-snug">{n.t}</h1>
      <p className={`mt-1 text-xs ${subCls(def)}`}>🕐 {n.time} • ✍️ ডেমো নিউজ ডেস্ক</p>
      <div className="mt-5 space-y-3">
        {paras.map((p, i) => (
          <p key={i} className={`text-[15px] leading-relaxed ${def.dark ? "text-slate-200" : "text-slate-700"}`}>{p}</p>
        ))}
      </div>
      <div className="mt-6 flex gap-2">
        <button onClick={share} className="btn-demo !py-2.5 !text-sm" style={{ background: def.accent }}>
          {copied ? "✅ লিংক কপি হয়েছে!" : "🔗 শেয়ার করুন"}
        </button>
        <Cta href={`${base}/cat/${encodeURIComponent(n.c)}`} accent={def.accent} ghost small>🏷️ {n.c}</Cta>
      </div>
      {related.length > 0 && (
        <div className="mt-8">
          <SectionTitle t="🔗 সম্পর্কিত খবর" />
          <div className="space-y-2">
            {related.map((r) => <NewsRow key={r.id} n={r} />)}
          </div>
        </div>
      )}
    </Page>
  );
}

export function NewsSearch() {
  const { def, base } = useDemo();
  const [q, setQ] = useState("");
  const query = q.trim();
  const list = query
    ? def.news.filter((n) => n.t.includes(query) || n.body.includes(query) || n.c.includes(query))
    : def.news;
  return (
    <Page narrow>
      <Back href={base} label="হোম" />
      <h1 className="text-2xl font-black">🔍 খবর খুঁজুন</h1>
      <div className="mt-3">
        <F dark={def.dark} value={q} onChange={(e) => setQ(e.target.value)} placeholder="খবরের শিরোনাম লিখুন…" autoFocus />
      </div>
      {query && <p className={`mt-2 text-xs ${subCls(def)}`}>{toBnDigits(list.length)}টি ফলাফল</p>}
      <div className="mt-3 space-y-2">
        {list.map((n) => <NewsRow key={n.id} n={n} />)}
      </div>
      {query && list.length === 0 && <Empty emoji="🔍" text="কোনো খবর পাওয়া যায়নি" />}
    </Page>
  );
}

export function NewsAbout() {
  return <AboutBody />;
}
export function NewsContact() {
  return <ContactBody />;
}
