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
import { Price, Stars, SectionTitle, Empty, ProductCard, Back, Page, LoginHint , HeroSlider, Hero, bannerSlides } from "./ui";
import { ShopLogin, ShopSignup, ShopAccount } from "./shop-pages";
import { useDemoLangOpt } from "./demo-lang";

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


/** Phase 8: English by default via the demo-lang provider; Bangla only when
 *  the visitor switched to Bangla. No provider (legacy demo) keeps the
 *  original Bangla strings — same convention as chrome.tsx.
 *  dig() renders Latin digits in English/Hindi view, Bangla digits otherwise. */
function useDL() {
  const dl = useDemoLangOpt();
  const lang = dl?.lang ?? "bn";
  return {
    lang,
    L: (en: string, bn: string) => (dl ? dl.L(en, bn) : bn),
    dig: (v: string | number) => {
      const str = String(v);
      return lang === "bn" ? toBnDigits(str) : str;
    },
    cur: lang === "bn" ? "টাকা" : "Tk",
  };
}

/* ================= shared helpers ================= */

function cardCls(def: DemoSiteDef) {
  const theme = def.theme ?? "aurora";
  const base = def.dark ? "text-white" : "text-slate-800";
  switch (theme) {
    case "split":
      return `rounded-none border-2 border-l-8 p-4 ${def.dark ? "border-white/15 bg-white/[0.04]" : "border-slate-300 bg-white"} ${base}`;
    case "minimal":
      return `rounded-xl p-5 ${def.dark ? "bg-white/[0.06]" : "bg-white shadow-[0_2px_16px_rgba(0,0,0,0.06)]"} ${base}`;
    case "bold":
      return `rounded-lg border-4 p-4 ${def.dark ? "border-white/25 bg-black/40" : "border-slate-900 bg-white"} ${base}`;
    case "elegant":
      return `rounded-xl border p-5 ${def.dark ? "border-amber-200/20 bg-white/[0.04]" : "border-stone-200 bg-[#fffdf8]"} ${base}`;
    case "playful":
      return `rounded-3xl border-2 p-4 ${def.dark ? "border-white/15 bg-white/[0.06]" : "border-slate-200 bg-white"} ${base}`;
    default:
      return `rounded-2xl border p-4 ${def.dark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"} ${base}`;
  }
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
const EN_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function nextDays(n: number, lang: string = "bn") {
  const out: { d: Date; label: string; day: string }[] = [];
  for (let i = 0; i < n; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    out.push({
      d,
      label: d.toLocaleDateString(lang === "bn" ? "bn-BD" : "en-US", { day: "numeric", month: "short" }),
      day: lang === "bn"
        ? (i === 0 ? "আজ" : i === 1 ? "আগামীকাল" : BN_DAYS[d.getDay()])
        : (i === 0 ? "Today" : i === 1 ? "Tomorrow" : EN_DAYS[d.getDay()]),
    });
  }
  return out;
}

function bnLong(d: Date, lang: string = "bn") {
  return d.toLocaleDateString(lang === "bn" ? "bn-BD" : "en-US", { day: "numeric", month: "long", year: "numeric" });
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
  const { dig, cur } = useDL();
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
      <p className="mt-1 text-sm font-black">{dig(b.total.toLocaleString("en-IN"))} {cur}</p>
    </div>
  );
}

/** Generic about page body shared by all layouts. */
function AboutBody() {
  const { def, base, store } = useDemo();
  const team = store.custom.customTeam ?? [];
  const approvedReviews = (store.custom.customTestimonials ?? []).filter((r) => r.approved);
  const stats: [string, string][] = [
    ["⭐", `${(def.services[0]?.rating ?? 4.8).toFixed(1)} avg rating`],
    ["🛠️", `${def.services.length}services`],
    ["🛍️", `${def.products.length} Product`],
  ];
  return (
    <Page narrow>
      <Back href={base} label="Home" />
      <h1 className="text-2xl font-black">ℹ️ About us</h1>
      <p className={`mt-3 text-sm leading-relaxed ${subCls(def)}`}>{def.about}</p>
      <div className="mt-5 grid grid-cols-3 gap-2">
        {stats.map(([e, t]) => (
          <div key={t} className={`${cardCls(def)} text-center !p-3`}>
            <p className="text-2xl">{e}</p>
            <p className="mt-1 text-[11px] font-bold">{t}</p>
          </div>
        ))}
      </div>
      {team.length > 0 && (
        <div className="mt-5">
          <h2 className="text-lg font-black">👥 Our team</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {team.map((m) => (
              <div key={m.id} className={cardCls(def)}>
                <p className="font-bold">{m.name}</p>
                {m.role && <p className={`text-sm ${subCls(def)}`}>{m.role}</p>}
                {m.note && <p className={`mt-1 text-sm ${subCls(def)}`}>{m.note}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
      {approvedReviews.length > 0 && (
        <div className="mt-5">
          <h2 className="text-lg font-black">⭐ What customers say</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {approvedReviews.map((r) => (
              <div key={r.id} className={cardCls(def)}>
                <p className="text-sm leading-relaxed">“{r.text}”</p>
                <p className={`mt-2 text-sm font-bold ${subCls(def)}`}>— {r.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className={`${cardCls(def)} mt-4`}>
        <p className="font-bold">📞 Contact</p>
        <p className={`mt-1 text-sm ${subCls(def)}`}>{def.contact}</p>
        <p className={`text-sm ${subCls(def)}`}>📍 {def.address}</p>
        <p className={`text-sm ${subCls(def)}`}>🕐 {def.hours}</p>
      </div>
      <div className="mt-5">
        <Cta href={`${base}/contact`} accent={def.accent}>✉️ Send a message</Cta>
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
    if (name.trim().length < 3) return setErr("Enter your name");
    if (!/^01[3-9]\d{8}$/.test(phone.trim())) return setErr("Enter a valid 11-digit mobile number");
    if (msg.trim().length < 5) return setErr("Write a message");
    setDone(true);
  }
  return (
    <Page narrow>
      <Back href={base} label="Home" />
      <h1 className="text-2xl font-black">✉️ Contact us</h1>
      <div className={`${cardCls(def)} mt-4 space-y-1.5 text-sm`}>
        <p className="font-bold">📞 {def.contact}</p>
        <p className={subCls(def)}>📍 {def.address}</p>
        <p className={subCls(def)}>🕐 {def.hours}</p>
      </div>
      {done ? (
        <div className={`${cardCls(def)} mt-4 border-emerald-400/40 text-center`}>
          <p className="text-5xl">✅</p>
          <p className="mt-2 font-black text-emerald-400">Message sent!</p>
          <p className={`mt-1 text-xs ${subCls(def)}`}>Thank you {name.trim()} — we will get back soon. (Demo)</p>
          <button onClick={() => setDone(false)} className={`mt-3 text-xs font-bold underline ${subCls(def)}`}>
            Another message
          </button>
        </div>
      ) : (
        <div className={`${cardCls(def)} mt-4 space-y-3`}>
          <F dark={def.dark} value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name *" />
          <F dark={def.dark} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Mobile number * (01XXXXXXXXX)" inputMode="numeric" />
          <TA dark={def.dark} value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Your message *" rows={4} />
          {err && <p className="rounded-xl bg-red-500/10 px-4 py-2.5 text-xs font-bold text-red-400">⚠️ {err}</p>}
          <button onClick={send} className="btn-demo w-full !py-3" style={{ background: def.accent }}>
            📨 Send
          </button>
          <p className={`text-center text-[11px] ${subCls(def)}`}>Demo form — no real message will be sent</p>
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
  const { L, lang } = useDL();
  return (
    <Link href={`${base}/s/${s.id}`} className={`${cardCls(def)} group block transition hover:-translate-y-1 hover:shadow-xl`}>
      <div className="flex items-start gap-3">
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-3xl" style={{ background: `${def.accent}18` }}>
          {s.e}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-bold">{s.n}</p>
          <Stars rating={s.rating} en={lang !== "bn"} />
          <p className={`mt-0.5 text-xs ${subCls(def)}`}>⏱️ {s.duration}</p>
        </div>
      </div>
      <p className={`mt-2 line-clamp-2 text-xs ${subCls(def)}`}>{s.desc}</p>
      {s.c && <p className="mt-2"><span className="rounded-full px-2 py-0.5 text-[10px] font-black" style={{ background: `${def.accent}18`, color: def.accent }}>{s.c}</span></p>}
      <div className="mt-2 flex items-center justify-between">
        <Price v={s.p} accent={def.accent} />
        <span className="text-xs font-bold opacity-70 group-hover:opacity-100">{L("Details →", "বিস্তারিত →")}</span>
      </div>
    </Link>
  );
}

export function SvcHome() {
  const { def, base, store } = useDemo();
  const { L } = useDL();
  const banners = bannerSlides();
  const steps: [string, string, string][] = [
    ["1️⃣", L("Choose a service", "সার্ভিস বেছে নিন"), L("Click a service to see details", "পছন্দের সার্ভিসে ক্লিক করে বিস্তারিত দেখুন")],
    ["2️⃣", L("Pick date & time", "তারিখ ও সময় দিন"), L("Choose a convenient day and slot", "সুবিধামতো দিন ও স্লট সিলেক্ট করুন")],
    ["3️⃣", L("Confirm booking", "বুকিং কনফার্ম"), L("Complete booking with name and mobile", "নাম-মোবাইল দিয়ে বুকিং সম্পন্ন করুন")],
  ];
  return (
    <>
      <Hero
        accent={def.accent}
        slides={[
          { img: def.heroImg, emoji: def.heroEmoji, title: def.heroTitle, sub: def.heroSub, cta: L("🛠️ View services", "🛠️ সার্ভিস দেখুন"), href: "/services", grad: def.grad },
          { emoji: "📅", title: L("Book online", "অনলাইনে বুকিং করুন"), sub: L("Pick your preferred date and time — confirmation right away", "পছন্দের তারিখ ও সময় বেছে নিন — কনফার্মেশন সাথে সাথে"), cta: L("📅 Book now", "📅 বুক করুন"), href: "/services", grad: def.grad },
          { emoji: "⭐", title: L("Loved by happy customers", "সন্তুষ্ট গ্রাহকদের পছন্দ"), sub: L("Read reviews and book with confidence", "রিভিউ পড়ে নিশ্চিন্তে সার্ভিস নিন"), cta: L("⭐ See reviews", "⭐ রিভিউ দেখুন"), href: "/reviews", grad: def.grad },
          ...banners,
        ]}
      />
      <Page>
        <SectionTitle t={L("🔥 Popular services", "🔥 জনপ্রিয় সার্ভিস")} link={`${base}/services`} />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {def.services.slice(0, 4).map((s) => <ServiceCard key={s.id} s={s} />)}
        </div>

        <div className="mt-10">
          <SectionTitle t={L("⚙️ How it works", "⚙️ কীভাবে কাজ করে")} />
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
            <p className="text-lg font-black">{L("⭐ What customers say", "⭐ গ্রাহকরা যা বলছেন")}</p>
            <p className={`mt-1 text-sm ${subCls(def)}`}>{L("Read reviews from hundreds of happy customers", "শত শত সন্তুষ্ট গ্রাহকের রিভিউ পড়ুন")}</p>
          </div>
          <Cta href={`${base}/reviews`} accent={def.accent} small>{L("See reviews →", "রিভিউ দেখুন →")}</Cta>
        </div>

        <div className="mt-10 rounded-3xl bg-gradient-to-br from-black/60 to-black/30 p-8 text-center text-white" style={{ background: `linear-gradient(135deg, ${def.accent}55, transparent)` }}>
          <p className="text-2xl font-black">{L("Book a service today", "আজই সার্ভিস বুক করুন")}</p>
          <p className="mt-1 text-sm opacity-80">{L("Fast, reliable & professional", "দ্রুত, নির্ভরযোগ্য ও প্রফেশনাল")}</p>
          <div className="mt-4 flex justify-center">
            <Cta href={`${base}/services`} accent={def.accent}>{L("🚀 Get started", "🚀 শুরু করুন")}</Cta>
          </div>
        </div>
      </Page>
    </>
  );
}

export function SvcList() {
  const { def, base } = useDemo();
  const { L, dig } = useDL();
  const [cat, setCat] = useState("All");
  // Phase 4: filter by service category. Categories come from the services
  // themselves (their `c` field); demos whose services carry no category
  // simply show the full list with no filter chips.
  const cats = ["All", ...Array.from(new Set(def.services.map((s) => s.c).filter((c): c is string => !!c)))];
  const shown = cat === "All" ? def.services : def.services.filter((s) => s.c === cat);
  return (
    <Page>
      <Back href={base} label={L("Home", "হোম")} />
      <h1 className="text-2xl font-black">{L("🛠️ All services", "🛠️ সব সার্ভিস")}</h1>
      <p className={`mt-1 text-sm ${subCls(def)}`}>{dig(def.services.length)} {L("services available", "টি সার্ভিস রয়েছে")}</p>
      {cats.length > 1 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {cats.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`rounded-full border px-4 py-1.5 text-xs font-bold transition ${chipCls(def, cat === c)}`}
            >
              {c}
            </button>
          ))}
        </div>
      )}
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((s) => <ServiceCard key={s.id} s={s} />)}
      </div>
    </Page>
  );
}

export function SvcDetail({ id }: { id: string }) {
  const { def, base } = useDemo();
  const { L, lang } = useDL();
  const s = def.services.find((x) => x.id === id);
  if (!s) return <Page><Empty emoji="😅" text={L("Service not found", "সার্ভিস পাওয়া যায়নি")} /></Page>;
  const feats = [
    L(`✅ ${s.n} — trained professional team`, `✅ ${s.n} — প্রশিক্ষিত প্রফেশনাল টিম`),
    L(`✅ Duration: ${s.duration}`, `✅ সময়কাল: ${s.duration}`),
    L("✅ Transparent pricing — no hidden charges", "✅ স্বচ্ছ মূল্য — কোনো লুকানো চার্জ নেই"),
    L("✅ Free follow-up support after the work is done", "✅ কাজ শেষে ফ্রি ফলো-আপ সাপোর্ট"),
  ];
  const related = def.services.filter((x) => x.id !== s.id).slice(0, 3);
  return (
    <Page narrow>
      <Back href={`${base}/services`} label={L("Services", "সার্ভিস")} />
      <div className="grid place-items-center rounded-3xl p-10 text-8xl" style={{ background: `${def.accent}15` }}>
        {s.e}
      </div>
      <h1 className="mt-4 text-2xl font-black">{s.n}</h1>
      <div className="mt-1 flex items-center gap-3">
        <Stars rating={s.rating} en={lang !== "bn"} />
        <span className={`text-xs ${subCls(def)}`}>⏱️ {s.duration}</span>
      </div>
      <div className="mt-2"><Price v={s.p} accent={def.accent} big /></div>
      <p className={`mt-3 text-sm leading-relaxed ${subCls(def)}`}>{s.desc}</p>
      <div className={`${cardCls(def)} mt-4`}>
        <p className="mb-2 font-bold">{L("✨ What you get", "✨ যা যা পাবেন")}</p>
        <ul className="space-y-1.5 text-sm">{feats.map((f) => <li key={f}>{f}</li>)}</ul>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-2">
        <Cta href={`${base}/book/${s.id}`} accent={def.accent}>{L("📅 Book now", "📅 বুক করুন")}</Cta>
        <Cta href={`${base}/contact`} accent={def.accent} ghost>{L("💬 Ask a question", "💬 জিজ্ঞাসা করুন")}</Cta>
      </div>
      {related.length > 0 && (
        <div className="mt-8">
          <SectionTitle t={L("🔗 Other services", "🔗 অন্যান্য সার্ভিস")} />
          <div className="grid gap-3 sm:grid-cols-3">
            {related.map((r) => <ServiceCard key={r.id} s={r} />)}
          </div>
        </div>
      )}
    </Page>
  );
}

/* Phase 8: time slots are built inside SvcBook via L() so the stored slot
 *  matches the language the visitor booked in. */

export function SvcBook({ id }: { id: string }) {
  const { def, base, store } = useDemo();
  const { L, lang } = useDL();
  const s = def.services.find((x) => x.id === id);
  const days = nextDays(7, lang);
  const SLOTS = [L("9:00 AM", "সকাল ৯টা"), L("11:00 AM", "সকাল ১১টা"), L("2:00 PM", "দুপুর ২টা"), L("4:00 PM", "বিকাল ৪টা"), L("6:00 PM", "সন্ধ্যা ৬টা")];
  const [day, setDay] = useState(0);
  const [slot, setSlot] = useState(SLOTS[0]);
  const [name, setName] = useState(store.user?.name ?? "");
  const [phone, setPhone] = useState(store.user?.phone ?? "");
  const [address, setAddress] = useState(store.user?.address ?? "");
  const [err, setErr] = useState("");
  const [done, setDone] = useState<{ id: string } | null>(null);

  if (!s) return <Page><Empty emoji="😅" text="Service not found" /></Page>;

  function confirm() {
    setErr("");
    if (name.trim().length < 3) return setErr("Enter your name");
    if (!/^01[3-9]\d{8}$/.test(phone.trim())) return setErr("Enter a valid 11-digit mobile number");
    if (address.trim().length < 5) return setErr("Enter your address");
    const rec = store.placeBooking({
      itemName: s!.n,
      itemEmoji: s!.e,
      date: bnLong(days[day].d, lang),
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
          <p className="mt-3 text-xl font-black text-emerald-400">Booking confirmed!</p>
          <p className={`mt-1 text-xs ${subCls(def)}`}>Thank you {name.trim()}!</p>
          <div className={`mx-auto mt-4 max-w-xs rounded-2xl p-4 text-left ${def.dark ? "bg-white/5" : "bg-slate-50"}`}>
            <p className={`text-xs ${subCls(def)}`}>Booking number</p>
            <p className="font-mono text-lg font-black" style={{ color: def.accent }}>{done.id}</p>
            <p className="mt-2 text-sm">{s.e} {s.n}</p>
            <p className={`text-xs ${subCls(def)}`}>📅 {bnLong(days[day].d, lang)} • ⏰ {slot}</p>
            <p className="mt-1 font-black">{s.p.toLocaleString("en-IN")} Tk</p>
          </div>
          <p className={`mt-3 text-[11px] ${subCls(def)}`}>💡 Demo booking — on the real site an SMS confirmation will be sent</p>
          <div className="mt-4 flex justify-center gap-2">
            <Cta href={`${base}/bookings`} accent={def.accent} small>📋 My bookings</Cta>
            <Cta href={base} accent={def.accent} ghost small>🏠 Home</Cta>
          </div>
        </div>
      </Page>
    );
  }

  return (
    <Page narrow>
      <Back href={`${base}/s/${s.id}`} label={s.n} />
      <h1 className="text-2xl font-black">📅 Book now</h1>
      <p className={`mt-1 text-sm ${subCls(def)}`}>{s.e} {s.n} • <Price v={s.p} accent={def.accent} /></p>

      <p className="mb-2 mt-5 text-sm font-bold">📆 Choose a date</p>
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

      <p className="mb-2 mt-5 text-sm font-bold">⏰ Choose a time</p>
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
        <F dark={def.dark} value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name *" />
        <F dark={def.dark} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Mobile number * (01XXXXXXXXX)" inputMode="numeric" />
        <TA dark={def.dark} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Address *" rows={2} />
      </div>

      <div className={`${cardCls(def)} mt-4 flex items-center justify-between`}>
        <span className={subCls(def)}>Total</span>
        <Price v={s.p} accent={def.accent} big />
      </div>

      {err && <p className="mt-3 rounded-xl bg-red-500/10 px-4 py-2.5 text-xs font-bold text-red-400">⚠️ {err}</p>}
      {!store.user && <div className="mt-3"><LoginHint /></div>}
      <button onClick={confirm} className="btn-demo mt-4 w-full !py-3.5 text-base" style={{ background: def.accent }}>
        ✅ Confirm booking
      </button>
      <p className={`mt-2 text-center text-[11px] ${subCls(def)}`}>Demo booking — no real money needed</p>
    </Page>
  );
}

export function SvcBookings() {
  const { def, base, store } = useDemo();
  const list = myBookings(store);
  return (
    <Page narrow>
      <Back href={base} label="Home" />
      <h1 className="text-2xl font-black">📋 My bookings</h1>
      {!store.user && <div className="mt-3"><LoginHint /></div>}
      {list.length === 0 ? (
        <Empty emoji="📭" text="You have not made any bookings yet" />
      ) : (
        <div className="mt-4 space-y-3">
          {list.map((b) => <BookingRow key={b.id} b={b} dark={def.dark} />)}
        </div>
      )}
      <div className="mt-5 flex justify-center">
        <Cta href={`${base}/services`} accent={def.accent} small>🛠️ Book a new service</Cta>
      </div>
    </Page>
  );
}

export function SvcReviews() {
  const { def, base } = useDemo();
  const seed = [
    { n: "Rahim Uddin", r: 5, t: "Excellent service! They arrived on time and the work was spotless.", d: "2 days ago" },
    { n: "Sharmin Akter", r: 5, t: "Best value for the price. I will book again.", d: "1 week ago" },
    { n: "Karim Sheikh", r: 4, t: "Liked it. Slightly late, but the work was excellent.", d: "2 weeks ago" },
    { n: "Nusrat Jahan", r: 5, t: "Professional behaviour, thank you!", d: "1 month ago" },
  ];
  const [list, setList] = useState(seed);
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [err, setErr] = useState("");
  function add() {
    setErr("");
    if (name.trim().length < 2) return setErr("Enter a name");
    if (text.trim().length < 5) return setErr("Write a review");
    setList([{ n: name.trim(), r: rating, t: text.trim(), d: "Just now" }, ...list]);
    setName(""); setText(""); setRating(5);
  }
  return (
    <Page narrow>
      <Back href={base} label="Home" />
      <h1 className="text-2xl font-black">⭐ Customer reviews</h1>
      <p className={`mt-1 text-sm ${subCls(def)}`}>{list.length}reviews</p>
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
        <p className="mb-3 font-bold">✍️ Leave your review</p>
        <div className="space-y-3">
          <F dark={def.dark} value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name *" />
          <Sel dark={def.dark} value={rating} onChange={(e) => setRating(Number(e.target.value))}>
            {[5, 4, 3, 2, 1].map((r) => <option key={r} value={r}>{"★".repeat(r)} ({r})</option>)}
          </Sel>
          <TA dark={def.dark} value={text} onChange={(e) => setText(e.target.value)} placeholder="Write your experience *" rows={3} />
          {err && <p className="rounded-xl bg-red-500/10 px-4 py-2.5 text-xs font-bold text-red-400">⚠️ {err}</p>}
          <button onClick={add} className="btn-demo w-full !py-3" style={{ background: def.accent }}>
            ⭐ Submit review
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
  const theme = def.theme ?? "aurora";
  const radius = theme === "split" ? "rounded-none" : theme === "minimal" ? "rounded-xl" : theme === "bold" ? "rounded-lg" : theme === "playful" ? "rounded-3xl" : "rounded-2xl";
  return (
    <Link
      href={`${base}/g/${g.id}`}
      className={`group block break-inside-avoid overflow-hidden ${radius} border transition hover:-translate-y-1 hover:shadow-xl ${
        def.dark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"
      }`}
    >
      <div className={`grid place-items-center p-8 text-6xl ${def.dark ? "bg-white/[0.03]" : "bg-slate-50"} ${theme === "playful" ? "group-hover:rotate-3 transition" : ""}`}>
        {g.e}
      </div>
      <div className="p-3">
        <p className={`text-sm font-bold ${theme === "elegant" ? "font-serif text-[15px]" : ""}`}>{g.t}</p>
        <p className={`text-[11px] ${subCls(def)}`}>{g.c}</p>
      </div>
    </Link>
  );
}

export function GalHome() {
  const { def, base, store } = useDemo();
  const { L, dig, cur } = useDL();
  const banners = bannerSlides();
  return (
    <>
      <Hero
        accent={def.accent}
        slides={[
          { img: def.heroImg, emoji: def.heroEmoji, title: def.heroTitle, sub: def.heroSub, cta: L("🖼️ View gallery", "🖼️ গ্যালারি দেখুন"), href: "/gallery", grad: def.grad },
          { emoji: "💰", title: L("Transparent pricing", "স্বচ্ছ প্রাইসিং"), sub: L("Pick a package that fits your budget", "প্যাকেজ দেখে বাজেট অনুযায়ী বেছে নিন"), cta: L("💰 Pricing", "💰 প্রাইসিং"), href: "/pricing", grad: def.grad },
          { emoji: "📸", title: L("Book for your event", "আপনার ইভেন্টের জন্য বুক করুন"), sub: L("Confirm your date in minutes", "তারিখ কনফার্ম করুন মিনিটেই"), cta: L("📸 Book now", "📸 বুক করুন"), href: "/book", grad: def.grad },
          ...banners,
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
            <p className="text-lg font-black">{L("💰 Packages & pricing", "💰 প্যাকেজ ও মূল্য")}</p>
            <p className={`mt-1 text-sm ${subCls(def)}`}>{L(`Starting from ${dig("5,000")} ${cur}`, `${dig("5,000")} টাকা থেকে শুরু`)}</p>
          </div>
          <Cta href={`${base}/pricing`} accent={def.accent} small>{L("See packages →", "প্যাকেজ দেখুন →")}</Cta>
        </div>
        <div className="mt-8 rounded-3xl p-8 text-center text-white" style={{ background: `linear-gradient(135deg, ${def.accent}66, transparent)` }}>
          <p className="text-2xl font-black">{L("📸 Your moments, through our lens", "📸 আপনার মুহূর্ত, আমাদের লেন্সে")}</p>
          <p className="mt-1 text-sm opacity-80">{L("Book a session today", "আজই সেশন বুক করুন")}</p>
          <div className="mt-4 flex justify-center">
            <Cta href={`${base}/book`} accent={def.accent}>{L("Book now", "বুক করুন")}</Cta>
          </div>
        </div>
      </Page>
    </>
  );
}

function GalGridInner() {
  const { def, base } = useDemo();
  const { L } = useDL();
  const sp = useSearchParams();
  const cat = sp.get("cat") ?? "সব";
  const cats = ["সব", ...def.cats];
  const items = cat === "সব" ? def.gallery : def.gallery.filter((g) => g.c === cat);
  return (
    <Page>
      <Back href={base} label={L("Home", "হোম")} />
      <h1 className="text-2xl font-black">{L("🖼️ Gallery", "🖼️ গ্যালারি")}</h1>
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
        <Empty emoji="🖼️" text={L("No photos in this category", "এই ক্যাটাগরিতে ছবি নেই")} />
      ) : (
        <div className="columns-2 gap-3 space-y-3 sm:columns-3">
          {items.map((g) => <GalCard key={g.id} g={g} />)}
        </div>
      )}
    </Page>
  );
}

export function GalGrid() {
  const { L } = useDL();
  return (
    <Suspense fallback={<Page><p className="py-10 text-center text-sm opacity-60">{L("Loading…", "লোড হচ্ছে…")}</p></Page>}>
      <GalGridInner />
    </Suspense>
  );
}

export function GalDetail({ id }: { id: string }) {
  const { def, base } = useDemo();
  const { L } = useDL();
  const g = def.gallery.find((x) => x.id === id);
  if (!g) return <Page><Empty emoji="😅" text={L("Photo not found", "ছবি পাওয়া যায়নি")} /></Page>;
  const related = def.gallery.filter((x) => x.id !== g.id && x.c === g.c).slice(0, 3);
  return (
    <Page narrow>
      <Back href={`${base}/gallery`} label={L("Gallery", "গ্যালারি")} />
      <div className={`relative grid place-items-center overflow-hidden rounded-3xl ${def.dark ? "bg-white/[0.03]" : "bg-slate-50"}`}>
        {def.heroImg && <img src={def.heroImg} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />}
        <div className="relative p-16 text-9xl drop-shadow-lg">{g.e}</div>
      </div>
      <h1 className="mt-4 text-2xl font-black">{g.t}</h1>
      <p className={`mt-1 text-sm ${subCls(def)}`}>🏷️ {g.c}</p>
      <p className={`mt-3 text-sm leading-relaxed ${subCls(def)}`}>
        {L("Our team is ready for this kind of shoot. Pick a package and book your preferred session — delivery with professional editing.", "এই ধরনের শুটের জন্য আমাদের টিম প্রস্তুত। প্যাকেজ দেখে পছন্দমতো সেশন বুক করুন — প্রফেশনাল এডিটিংসহ ডেলিভারি।")}
      </p>
      <div className="mt-5 grid grid-cols-2 gap-2">
        <Cta href={`${base}/book`} accent={def.accent}>{L("📸 Book now", "📸 বুকিং করুন")}</Cta>
        <Cta href={`${base}/pricing`} accent={def.accent} ghost>{L("💰 Packages", "💰 প্যাকেজ")}</Cta>
      </div>
      {related.length > 0 && (
        <div className="mt-8">
          <SectionTitle t={L("🔗 Same category", "🔗 একই ক্যাটাগরি")} />
          <div className="columns-2 gap-3 space-y-3">
            {related.map((r) => <GalCard key={r.id} g={r} />)}
          </div>
        </div>
      )}
    </Page>
  );
}

const GAL_PKGS: { id: string; n: [string, string]; p: number; f: [string, string][]; hot?: boolean }[] = [
  { id: "basic", n: ["Basic", "বেসিক"], p: 5000, f: [["2 hours photoshoot", "২ ঘণ্টা ফটোশুট"], ["20 edited photos", "২০টি এডিটেড ছবি"], ["Online gallery", "অনলাইন গ্যালারি"]] },
  { id: "standard", n: ["Standard", "স্ট্যান্ডার্ড"], p: 12000, f: [["5 hours photoshoot", "৫ ঘণ্টা ফটোশুট"], ["60 edited photos", "৬০টি এডিটেড ছবি"], ["Premium album", "প্রিমিয়াম অ্যালবাম"], ["Online gallery", "অনলাইন গ্যালারি"]], hot: true },
  { id: "premium", n: ["Premium", "প্রিমিয়াম"], p: 25000, f: [["Full-day shoot", "সারাদিন শুট"], ["200+ edited photos", "২০০+ এডিটেড ছবি"], ["Premium album", "প্রিমিয়াম অ্যালবাম"], ["Video highlight", "ভিডিও হাইলাইট"], ["Drone shot", "ড্রোন শট"]] },
];

export function GalPricing() {
  const { def, base } = useDemo();
  const { L } = useDL();
  return (
    <Page>
      <Back href={base} label={L("Home", "হোম")} />
      <h1 className="text-2xl font-black">{L("💰 Packages & pricing", "💰 প্যাকেজ ও মূল্য")}</h1>
      <p className={`mt-1 text-sm ${subCls(def)}`}>{L("Pick your favourite package and book", "পছন্দের প্যাকেজ বেছে নিয়ে বুক করুন")}</p>
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        {GAL_PKGS.map((p) => (
          <div
            key={p.id}
            className={`${cardCls(def)} relative ${p.hot ? "!border-2" : ""}`}
            style={p.hot ? { borderColor: def.accent } : undefined}
          >
            {p.hot && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-[10px] font-black text-white" style={{ background: def.accent }}>
                {L("🔥 Popular", "🔥 জনপ্রিয়")}
              </span>
            )}
            <p className="text-lg font-black">{L(p.n[0], p.n[1])}</p>
            <p className="mt-1"><Price v={p.p} accent={def.accent} big /></p>
            <ul className="mt-3 space-y-1.5 text-xs">
              {p.f.map(([en, bn]) => <li key={en}>✓ {L(en, bn)}</li>)}
            </ul>
            <div className="mt-4">
              <Cta href={`${base}/book?pkg=${p.id}`} accent={def.accent} small>{L("📸 Book now", "📸 বুক করুন")}</Cta>
            </div>
          </div>
        ))}
      </div>
    </Page>
  );
}

function GalBookInner() {
  const { def, base, store } = useDemo();
  const { L, lang } = useDL();
  const sp = useSearchParams();
  const pkg = GAL_PKGS.find((p) => p.id === sp.get("pkg")) ?? GAL_PKGS[1];
  const days = nextDays(14, lang);
  const [etype, setEtype] = useState("Wedding");
  const [day, setDay] = useState(3);
  const [name, setName] = useState(store.user?.name ?? "");
  const [phone, setPhone] = useState(store.user?.phone ?? "");
  const [err, setErr] = useState("");
  const [done, setDone] = useState<{ id: string } | null>(null);

  function confirm() {
    setErr("");
    if (name.trim().length < 3) return setErr("Enter your name");
    if (!/^01[3-9]\d{8}$/.test(phone.trim())) return setErr("Enter a valid 11-digit mobile number");
    const rec = store.placeBooking({
      itemName: `${L(pkg.n[0], pkg.n[1])} Package — ${etype}`,
      itemEmoji: "📸",
      date: bnLong(days[day].d, lang),
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
          <p className="mt-3 text-xl font-black text-emerald-400">Booking confirmed!</p>
          <div className={`mx-auto mt-4 max-w-xs rounded-2xl p-4 text-left ${def.dark ? "bg-white/5" : "bg-slate-50"}`}>
            <p className={`text-xs ${subCls(def)}`}>Booking number</p>
            <p className="font-mono text-lg font-black" style={{ color: def.accent }}>{done.id}</p>
            <p className="mt-2 text-sm">📸 {L(pkg.n[0], pkg.n[1])} Package — {etype}</p>
            <p className={`text-xs ${subCls(def)}`}>📅 {bnLong(days[day].d, lang)}</p>
            <p className="mt-1 font-black">{pkg.p.toLocaleString("en-IN")} Tk</p>
          </div>
          <p className={`mt-3 text-[11px] ${subCls(def)}`}>💡 Demo booking — on the real site we will call to confirm</p>
          <div className="mt-4 flex justify-center gap-2">
            <Cta href={`${base}/bookings`} accent={def.accent} small>📋 My bookings</Cta>
            <Cta href={base} accent={def.accent} ghost small>🏠 Home</Cta>
          </div>
        </div>
      </Page>
    );
  }

  return (
    <Page narrow>
      <Back href={`${base}/pricing`} label="Package" />
      <h1 className="text-2xl font-black">📸 Book a session</h1>
      <div className={`${cardCls(def)} mt-4 flex items-center justify-between`}>
        <span className="font-bold">{L(pkg.n[0], pkg.n[1])} Package</span>
        <Price v={pkg.p} accent={def.accent} />
      </div>
      <div className="mt-4 space-y-3">
        <div>
          <p className="mb-1.5 text-sm font-bold">🎭 Event type</p>
          <Sel dark={def.dark} value={etype} onChange={(e) => setEtype(e.target.value)}>
            {["Wedding", "Portrait", "Event", "Product", "Family"].map((t) => <option key={t} value={t}>{t}</option>)}
          </Sel>
        </div>
        <div>
          <p className="mb-1.5 text-sm font-bold">📆 Date</p>
          <Sel dark={def.dark} value={day} onChange={(e) => setDay(Number(e.target.value))}>
            {days.map((x, i) => <option key={i} value={i}>{x.day} — {bnLong(x.d, lang)}</option>)}
          </Sel>
        </div>
        <F dark={def.dark} value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name *" />
        <F dark={def.dark} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Mobile number * (01XXXXXXXXX)" inputMode="numeric" />
      </div>
      {err && <p className="mt-3 rounded-xl bg-red-500/10 px-4 py-2.5 text-xs font-bold text-red-400">⚠️ {err}</p>}
      {!store.user && <div className="mt-3"><LoginHint /></div>}
      <button onClick={confirm} className="btn-demo mt-4 w-full !py-3.5 text-base" style={{ background: def.accent }}>
        ✅ Confirm booking
      </button>
    </Page>
  );
}

export function GalBook() {
  const { L } = useDL();
  return (
    <Suspense fallback={<Page><p className="py-10 text-center text-sm opacity-60">{L("Loading…", "লোড হচ্ছে…")}</p></Page>}>
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

const AMENITIES: [string, string][] = [["📶 Free WiFi", "📶 ফ্রি WiFi"], ["🅿️ Free parking", "🅿️ ফ্রি পার্কিং"], ["🍳 Complimentary breakfast", "🍳 কমপ্লিমেন্টারি ব্রেকফাস্ট"], ["🏊 Swimming pool", "🏊 সুইমিং পুল"], ["❄️ AC room", "❄️ এসি রুম"], ["📺 Smart TV", "📺 স্মার্ট টিভি"]];

export function BookHome() {
  const { def, base, store } = useDemo();
  const { L, dig } = useDL();
  const banners = bannerSlides();
  const [loc, setLoc] = useState("");
  const [guests, setGuests] = useState(2);
  const feat = def.products.slice(0, 4);
  return (
    <>
      <Hero
        accent={def.accent}
        slides={[
          { img: def.heroImg, emoji: def.heroEmoji, title: def.heroTitle, sub: def.heroSub, cta: L("🏨 View listings", "🏨 লিস্টিং দেখুন"), href: "/stays", grad: def.grad },
          { emoji: "💳", title: L("Easy booking, secure payment", "সহজ বুকিং, নিরাপদ পেমেন্ট"), sub: L("Book online and travel with peace of mind", "অনলাইনে বুক করে নিশ্চিন্তে ঘুরুন"), cta: L("📅 Book now", "📅 বুক করুন"), href: "/stays", grad: def.grad },
          ...banners,
        ]}
      />
      <div className="px-4">
        <div className="mx-auto -mt-2 max-w-4xl text-center">
          <div className={`mx-auto mt-6 max-w-2xl rounded-3xl p-4 text-left ${def.dark ? "bg-black/40" : "bg-white/90 shadow-xl"}`}>
            <F dark={def.dark} value={loc} onChange={(e) => setLoc(e.target.value)} placeholder={L("📍 Where do you want to go? (e.g. Cox's Bazar)", "📍 কোথায় যেতে চান? (যেমন: কক্সবাজার)")} />
            <div className="mt-3 flex items-center justify-between rounded-2xl px-1">
              <span className={`text-sm font-bold ${def.dark ? "text-white" : "text-slate-700"}`}>{L("👥 Guests", "👥 অতিথি")}</span>
              <div className="flex items-center gap-3">
                <button onClick={() => setGuests((g) => Math.max(1, g - 1))} className="grid h-9 w-9 place-items-center rounded-full bg-black/20 text-lg font-black text-white">−</button>
                <span className={`text-lg font-black ${def.dark ? "text-white" : "text-slate-800"}`}>{dig(guests)}</span>
                <button onClick={() => setGuests((g) => Math.min(10, g + 1))} className="grid h-9 w-9 place-items-center rounded-full bg-black/20 text-lg font-black text-white">+</button>
              </div>
            </div>
            <Link
              href={`${base}/stays${loc.trim() ? `?loc=${encodeURIComponent(loc.trim())}` : ""}`}
              className="btn-demo mt-3 block w-full !py-3.5 text-center text-base"
              style={{ background: def.accent }}
            >
              {L("🔍 Search", "🔍 খুঁজুন")}
            </Link>
          </div>
        </div>
      </div>
      <Page>
        <SectionTitle t={L("⭐ Featured stays", "⭐ ফিচার্ড স্টে")} sub={L("Most popular", "সবচেয়ে জনপ্রিয়")} link={`${base}/stays`} />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {feat.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {[["💳", L("Easy payment", "সহজ পেমেন্ট"), L("bKash/card/cash", "বিকাশ/কার্ড/ক্যাশ")], ["🛡️", L("Secure booking", "নিরাপদ বুকিং"), L("Confirmation guaranteed", "কনফার্মেশন গ্যারান্টি")], ["🎧", L("24/7 support", "২৪/৭ সাপোর্ট"), L("Call any time", "যেকোনো সময় কল করুন")]].map(([e, t, d]) => (
            <div key={t} className={`${cardCls(def)} text-center`}>
              <p className="text-3xl">{e}</p>
              <p className="mt-1 font-bold">{t}</p>
              <p className={`text-xs ${subCls(def)}`}>{d}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 flex justify-center gap-2">
          <Cta href={`${base}/stays`} accent={def.accent}>{L("🏨 View all stays", "🏨 সব স্টে দেখুন")}</Cta>
          <Cta href={`${base}/my`} accent={def.accent} ghost>{L("📋 My bookings", "📋 আমার বুকিং")}</Cta>
        </div>
      </Page>
    </>
  );
}

export function BookStays() {
  const { def, base } = useDemo();
  const { L, dig } = useDL();
  return (
    <Page>
      <Back href={base} label={L("Home", "হোম")} />
      <h1 className="text-2xl font-black">{L("🏨 All stays", "🏨 সব স্টে")}</h1>
      <p className={`mt-1 text-sm ${subCls(def)}`}>{dig(def.products.length)} {L("options", "টি অপশন")}</p>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {def.products.map((p) => <ProductCard key={p.id} p={p} />)}
      </div>
    </Page>
  );
}

export function BookDetail({ id }: { id: string }) {
  const { def, base } = useDemo();
  const { L, lang } = useDL();
  const p = def.products.find((x) => x.id === id);
  if (!p) return <Page><Empty emoji="😅" text={L("Not found", "পাওয়া যায়নি")} /></Page>;
  const amen = AMENITIES.slice(0, 4);
  const related = def.products.filter((x) => x.id !== p.id).slice(0, 4);
  return (
    <Page narrow>
      <Back href={`${base}/stays`} label={L("Stays", "স্টে")} />
      <div className={`grid place-items-center rounded-3xl p-14 text-8xl ${def.dark ? "bg-white/[0.03]" : "bg-slate-50"}`}>
        {p.e}
      </div>
      <h1 className="mt-4 text-2xl font-black">{p.n}</h1>
      <div className="mt-1"><Stars rating={p.rating} reviews={p.reviews} en={lang !== "bn"} /></div>
      <div className="mt-2"><Price v={p.p} accent={def.accent} big note={p.priceNote ?? def.priceNote} /></div>
      <p className={`mt-3 text-sm leading-relaxed ${subCls(def)}`}>{p.desc}</p>
      <div className={`${cardCls(def)} mt-4`}>
        <p className="mb-2 font-bold">{L("✨ Amenities", "✨ সুবিধাসমূহ")}</p>
        <div className="grid grid-cols-2 gap-2">
          {amen.map((a) => (
            <p key={a[0]} className="rounded-xl bg-black/10 px-3 py-2 text-xs font-bold">{L(a[0], a[1])}</p>
          ))}
        </div>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-2">
        <Cta href={`${base}/book/${p.id}`} accent={def.accent}>{L("📅 Book now", "📅 বুক করুন")}</Cta>
        <Cta href={`${base}/contact`} accent={def.accent} ghost>{L("💬 Ask", "💬 জিজ্ঞাসা")}</Cta>
      </div>
      {related.length > 0 && (
        <div className="mt-8">
          <SectionTitle t={L("🔗 See more", "🔗 আরও দেখুন")} />
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
  const { lang } = useDL();
  const p = def.products.find((x) => x.id === id);
  const days = nextDays(14, lang);
  const [ci, setCi] = useState(0);
  const [co, setCo] = useState(2);
  const [guests, setGuests] = useState(2);
  const [name, setName] = useState(store.user?.name ?? "");
  const [phone, setPhone] = useState(store.user?.phone ?? "");
  const [err, setErr] = useState("");
  const [done, setDone] = useState<{ id: string } | null>(null);

  if (!p) return <Page><Empty emoji="😅" text="Not found" /></Page>;

  const coFixed = Math.max(co, ci + 1);
  const nights = coFixed - ci;
  const total = p.p * nights;

  function confirm() {
    setErr("");
    if (name.trim().length < 3) return setErr("Enter your name");
    if (!/^01[3-9]\d{8}$/.test(phone.trim())) return setErr("Enter a valid 11-digit mobile number");
    const rec = store.placeBooking({
      itemName: p!.n,
      itemEmoji: p!.e,
      date: `${bnLong(days[ci].d, lang)} → ${bnLong(days[coFixed].d, lang)}`,
      slot: `${guests} guests • ${nights} nights`,
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
          <p className="mt-3 text-xl font-black text-emerald-400">Booking confirmed!</p>
          <div className={`mx-auto mt-4 max-w-xs rounded-2xl p-4 text-left ${def.dark ? "bg-white/5" : "bg-slate-50"}`}>
            <p className={`text-xs ${subCls(def)}`}>Booking number</p>
            <p className="font-mono text-lg font-black" style={{ color: def.accent }}>{done.id}</p>
            <p className="mt-2 text-sm">{p.e} {p.n}</p>
            <p className={`text-xs ${subCls(def)}`}>📅 {bnLong(days[ci].d, lang)} → {bnLong(days[coFixed].d, lang)}</p>
            <p className={`text-xs ${subCls(def)}`}>👥 {guests} guests • 🌙 {nights} nights</p>
            <p className="mt-1 font-black">{total.toLocaleString("en-IN")} Tk</p>
          </div>
          <p className={`mt-3 text-[11px] ${subCls(def)}`}>💡 Demo booking — on the real site a confirmation SMS will be sent</p>
          <div className="mt-4 flex justify-center gap-2">
            <Cta href={`${base}/my`} accent={def.accent} small>📋 My bookings</Cta>
            <Cta href={base} accent={def.accent} ghost small>🏠 Home</Cta>
          </div>
        </div>
      </Page>
    );
  }

  return (
    <Page narrow>
      <Back href={`${base}/p/${p.id}`} label={p.n} />
      <h1 className="text-2xl font-black">📅 Book now</h1>
      <p className={`mt-1 text-sm ${subCls(def)}`}>{p.e} {p.n}</p>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <div>
          <p className="mb-1.5 text-sm font-bold">🛬 Check-in</p>
          <Sel dark={def.dark} value={ci} onChange={(e) => { const v = Number(e.target.value); setCi(v); if (coFixed <= v) setCo(v + 1); }}>
            {days.map((x, i) => <option key={i} value={i}>{x.day} — {bnLong(x.d, lang)}</option>)}
          </Sel>
        </div>
        <div>
          <p className="mb-1.5 text-sm font-bold">🛫 Check-out</p>
          <Sel dark={def.dark} value={coFixed} onChange={(e) => setCo(Number(e.target.value))}>
            {days.map((x, i) => i > ci && <option key={i} value={i}>{x.day} — {bnLong(x.d, lang)}</option>)}
          </Sel>
        </div>
      </div>

      <div className={`${cardCls(def)} mt-3 flex items-center justify-between`}>
        <span className="text-sm font-bold">👥 Number of guests</span>
        <div className="flex items-center gap-3">
          <button onClick={() => setGuests((g) => Math.max(1, g - 1))} className="grid h-9 w-9 place-items-center rounded-full bg-black/20 text-lg font-black">−</button>
          <span className="text-lg font-black">{guests}</span>
          <button onClick={() => setGuests((g) => Math.min(10, g + 1))} className="grid h-9 w-9 place-items-center rounded-full bg-black/20 text-lg font-black">+</button>
        </div>
      </div>

      <div className={`${cardCls(def)} mt-3 space-y-1.5 text-sm`}>
        <div className="flex justify-between"><span className={subCls(def)}>Per night</span><span className="font-bold">{p.p.toLocaleString("en-IN")} Tk{def.priceNote ? ` ${def.priceNote}` : ""}</span></div>
        <div className="flex justify-between"><span className={subCls(def)}>Total nights</span><span className="font-bold">{nights}</span></div>
        <div className="flex justify-between border-t border-white/10 pt-2"><span className="font-black">Total</span><Price v={total} accent={def.accent} big /></div>
      </div>

      <div className={`${cardCls(def)} mt-3 space-y-3`}>
        <F dark={def.dark} value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name *" />
        <F dark={def.dark} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Mobile number * (01XXXXXXXXX)" inputMode="numeric" />
      </div>

      {err && <p className="mt-3 rounded-xl bg-red-500/10 px-4 py-2.5 text-xs font-bold text-red-400">⚠️ {err}</p>}
      {!store.user && <div className="mt-3"><LoginHint /></div>}
      <button onClick={confirm} className="btn-demo mt-4 w-full !py-3.5 text-base" style={{ background: def.accent }}>
        ✅ Confirm booking
      </button>
      <p className={`mt-2 text-center text-[11px] ${subCls(def)}`}>Demo booking — no real money needed</p>
    </Page>
  );
}

export function BookMy() {
  const { def, base, store } = useDemo();
  const list = myBookings(store);
  return (
    <Page narrow>
      <Back href={base} label="Home" />
      <h1 className="text-2xl font-black">📋 My bookings</h1>
      {!store.user && <div className="mt-3"><LoginHint /></div>}
      {list.length === 0 ? (
        <Empty emoji="📭" text="You have not made any bookings yet" />
      ) : (
        <div className="mt-4 space-y-3">
          {list.map((b) => <BookingRow key={b.id} b={b} dark={def.dark} />)}
        </div>
      )}
      <div className="mt-5 flex justify-center">
        <Cta href={`${base}/stays`} accent={def.accent} small>🏨 Book a new stay</Cta>
      </div>
    </Page>
  );
}

export function BookWallet() {
  const { def, base, store } = useDemo();
  const { L, dig, cur, lang } = useDL();
  return (
    <Page narrow>
      <Back href={base} label={L("Home", "হোম")} />
      <h1 className="text-2xl font-black">{L("💳 Wallet", "💳 ওয়ালেট")}</h1>
      <div className={`${cardCls(def)} mt-4 text-center !p-6`}>
        <p className={`text-xs ${subCls(def)}`}>{L("Current balance", "বর্তমান ব্যালেন্স")}</p>
        <p className="mt-1 text-4xl font-black" style={{ color: def.accent }}>
          {dig(store.wallet.toLocaleString("en-IN"))} {cur}
        </p>
        <p className={`mt-1 text-[11px] ${subCls(def)}`}>{L("Demo wallet — can be used for bookings", "ডেমো ওয়ালেট — বুকিংয়ে ব্যবহার করা যাবে")}</p>
      </div>
      <p className="mb-2 mt-5 text-sm font-bold">{L("💰 Top up (demo)", "💰 টপ-আপ করুন (ডেমো)")}</p>
      <div className="grid grid-cols-3 gap-2">
        {[1000, 2000, 5000].map((a) => (
          <button
            key={a}
            onClick={() => store.topUp(a)}
            className="btn-demo !py-3 !text-sm"
            style={{ background: def.accent }}
          >
            +{dig(a.toLocaleString("en-IN"))}
          </button>
        ))}
      </div>
      <p className="mb-2 mt-6 text-sm font-bold">{L("🧾 Transaction history", "🧾 লেনদেন হিস্ট্রি")}</p>
      {store.txs.length === 0 ? (
        <Empty emoji="🧾" text={L("No transactions yet", "এখনো কোনো লেনদেন হয়নি")} />
      ) : (
        <div className="space-y-2">
          {store.txs.map((t, i) => (
            <div key={i} className={`${cardCls(def)} flex items-center justify-between !p-3`}>
              <div>
                <p className="text-sm font-bold">{t.label}</p>
                <p className={`text-[11px] ${subCls(def)}`}>{new Date(t.date).toLocaleDateString(lang === "bn" ? "bn-BD" : "en-US")}</p>
              </div>
              <p className={`font-black ${t.amount >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {t.amount >= 0 ? "+" : "−"}{dig(Math.abs(t.amount).toLocaleString("en-IN"))}
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
  const theme = def.theme ?? "aurora";
  const radius = theme === "split" ? "rounded-none border-l-4" : theme === "minimal" ? "rounded-lg" : theme === "playful" ? "rounded-3xl" : "rounded-2xl";
  return (
    <Link
      href={`${base}/a/${n.id}`}
      className={`flex w-full items-center gap-3 ${radius} p-3 text-left transition hover:shadow ${
        def.dark ? "bg-white/5 hover:bg-white/10" : "bg-slate-50 hover:bg-slate-100"
      }`}
      style={theme === "split" ? { borderLeftColor: def.accent } : undefined}
    >
      <span className={`grid h-14 w-14 shrink-0 place-items-center rounded-xl text-3xl ${def.dark ? "bg-white/10" : "bg-white"}`}>
        {n.e}
      </span>
      <span className="min-w-0 flex-1">
        <p className={`truncate text-sm font-bold ${theme === "elegant" ? "font-serif text-[15px]" : ""}`}>{n.t}</p>
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
        <span className="animate-pulse rounded bg-white/25 px-2 py-0.5 text-xs">🔴 Live</span>
        <span className="truncate">Latest news, first</span>
        <Link href={`${base}/search`} className="ml-auto rounded-full bg-white/20 px-3 py-1 text-xs">🔍 Search</Link>
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
              <span className="rounded-full bg-red-500/15 px-2.5 py-1 text-[10px] font-black text-red-400">⚡ Breaking</span>
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
        <SectionTitle t="📰 Latest news" />
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
      <Back href={base} label="Home" />
      <h1 className="text-2xl font-black">🏷️ {cat}</h1>
      <p className={`mt-1 text-sm ${subCls(def)}`}>{list.length}news</p>
      {list.length === 0 ? (
        <Empty emoji="📰" text="No news in this category" />
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
  if (!n) return <Page><Empty emoji="😅" text="News not found" /></Page>;
  const paras = n.body.includes("।")
    ? n.body.split("।").map((s) => s.trim()).filter(Boolean).map((s) => s + "।")
    : n.body.split(/(?<=\.)\s+/).map((s) => s.trim()).filter(Boolean);
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
      <Back href={base} label="Home" />
      <div className={`grid place-items-center rounded-3xl p-12 text-8xl ${def.dark ? "bg-white/[0.03]" : "bg-slate-50"}`}>
        {n.e}
      </div>
      <span className="mt-4 inline-block rounded-full bg-red-500/15 px-3 py-1 text-[11px] font-black text-red-400">{n.c}</span>
      <h1 className="mt-2 text-2xl font-black leading-snug">{n.t}</h1>
      <p className={`mt-1 text-xs ${subCls(def)}`}>🕐 {n.time} • ✍️ Demo news desk</p>
      <div className="mt-5 space-y-3">
        {paras.map((p, i) => (
          <p key={i} className={`text-[15px] leading-relaxed ${def.dark ? "text-slate-200" : "text-slate-700"}`}>{p}</p>
        ))}
      </div>
      <div className="mt-6 flex gap-2">
        <button onClick={share} className="btn-demo !py-2.5 !text-sm" style={{ background: def.accent }}>
          {copied ? "✅ Link copied!" : "🔗 Share"}
        </button>
        <Cta href={`${base}/cat/${encodeURIComponent(n.c)}`} accent={def.accent} ghost small>🏷️ {n.c}</Cta>
      </div>
      {related.length > 0 && (
        <div className="mt-8">
          <SectionTitle t="🔗 Related news" />
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
      <Back href={base} label="Home" />
      <h1 className="text-2xl font-black">🔍 Search news</h1>
      <div className="mt-3">
        <F dark={def.dark} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Enter a news headline…" autoFocus />
      </div>
      {query && <p className={`mt-2 text-xs ${subCls(def)}`}>{list.length}results</p>}
      <div className="mt-3 space-y-2">
        {list.map((n) => <NewsRow key={n.id} n={n} />)}
      </div>
      {query && list.length === 0 && <Empty emoji="🔍" text="No news found" />}
    </Page>
  );
}

export function NewsAbout() {
  return <AboutBody />;
}
export function NewsContact() {
  return <ContactBody />;
}
