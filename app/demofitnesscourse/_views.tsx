"use client";

/**
 * FitForm — focused fitness-course demo (concept portfolio piece).
 * Everything is browser-local (localStorage keys dmsite:fitnesscourse:*).
 * No real payment, email, or calendar account is connected: checkout is a
 * test-mode flow, the guide is sample content, and bookings are demo-only.
 * Copy contains no invented testimonials, stats, reviews, or client work.
 */

import { useEffect, useMemo, useState } from "react";

export const WA_LINK =
  "https://wa.me/8801833402586?text=" +
  encodeURIComponent('Hi, I want a website like the "FitForm" demo.');

const LS = "dmsite:fitnesscourse:";

function read<T>(key: string, fallback: T): T {
  try {
    const v = window.localStorage.getItem(LS + key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write(key: string, value: unknown) {
  try {
    window.localStorage.setItem(LS + key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}
function useMounted() {
  const [m, setM] = useState(false);
  useEffect(() => setM(true), []);
  return m;
}
function resetDemo() {
  try {
    const keys: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k && k.startsWith(LS)) keys.push(k);
    }
    keys.forEach((k) => window.localStorage.removeItem(k));
  } catch {
    /* ignore */
  }
  window.location.reload();
}

export function DemoBar() {
  return (
    <div className="border-b border-amber-200 bg-amber-50 px-4 py-3 text-slate-800">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2">
        <p className="min-w-0 flex-1 text-[13px] leading-snug">
          <span className="font-black">ⓘ Demo only</span> — this is a sample
          website by <b>DigiPlyra</b>. No real orders, payments, or bookings are
          processed here. Like what you see? Get the same kind of website built
          for your own business.
        </p>
        <div className="flex flex-wrap gap-2">
          <a
            href={WA_LINK}
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-black text-white shadow transition hover:brightness-110"
          >
            💬 I need this website
          </a>
          <button
            onClick={resetDemo}
            className="rounded-full bg-white px-4 py-2 text-xs font-black text-slate-800 ring-1 ring-slate-300 transition hover:bg-slate-100"
          >
            ↺ Reset demo
          </button>
        </div>
      </div>
    </div>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <DemoBar />
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <a href="/demofitnesscourse" className="text-lg font-black tracking-tight">
            💪 <span className="text-emerald-600">Fit</span>Form
          </a>
          <nav className="flex items-center gap-3 text-sm font-semibold sm:gap-5">
            <a href="/demofitnesscourse/course" className="hover:text-emerald-600">Course</a>
            <a href="/demofitnesscourse/book" className="hover:text-emerald-600">Coaching</a>
            <a href="/demofitnesscourse/guide" className="hover:text-emerald-600">Free Guide</a>
            <a
              href="/demofitnesscourse#pricing"
              className="rounded-full bg-emerald-600 px-3.5 py-1.5 text-white shadow hover:brightness-110"
            >
              Join — $79
            </a>
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <footer className="border-t border-slate-200 bg-white px-4 py-8">
        <div className="mx-auto max-w-6xl text-center text-xs leading-relaxed text-slate-500">
          <p className="font-black text-slate-700">FitForm — Fitness Course &amp; Coaching (Demo)</p>
          <p className="mt-1">
            Sample website by DigiPlyra. All content is sample content; checkout, guide delivery,
            and bookings in this demo are test-mode only and create no real order, payment, or calendar event.
          </p>
          <p className="mt-2">
            <a href={WA_LINK} target="_blank" rel="noreferrer" className="font-bold text-emerald-600">
              💬 I need a website like this →
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

export const PLANS = [
  {
    id: "course",
    name: "Full Course",
    price: 79,
    blurb: "The complete 8-week course. Every module, every lesson, lifetime access in this demo.",
    features: ["8 weekly modules", "12 guided lessons", "Progress tracking", "Lifetime access in this demo"],
  },
  {
    id: "bundle",
    name: "Course + Nutrition",
    price: 119,
    blurb: "Everything in Full Course, plus the simple nutrition system and meal-plan templates.",
    features: ["Everything in Full Course", "Nutrition basics module", "7-day meal-plan templates", "Grocery list builder"],
  },
  {
    id: "coaching",
    name: "Course + Coaching",
    price: 199,
    blurb: "Everything in Course + Nutrition, plus 4 one-on-one coaching calls to keep you on track.",
    features: ["Everything in Course + Nutrition", "4 coaching calls (45 min)", "Personal form checks", "Weekly check-in messages"],
  },
  {
    id: "call",
    name: "Single Coaching Call",
    price: 49,
    blurb: "One 45-minute call: form review, plan tweaks, or a fresh start plan.",
    features: ["45-minute video call", "Written recap after the call", "No course purchase required"],
  },
] as const;

export const MODULES: { title: string; lessons: { id: string; title: string; mins: number; body: string }[] }[] = [
  {
    title: "Week 1 — Foundations",
    lessons: [
      {
        id: "w1l1",
        title: "How to warm up in 5 minutes",
        mins: 6,
        body: "Sample lesson. A good warm-up raises your heart rate gently and moves every joint you are about to train. Try this order: 1 minute of easy marching in place, 1 minute of arm circles and shoulder rolls, 1 minute of hip circles and leg swings, 1 minute of bodyweight squats at half depth, and 1 minute of easy walking. You should feel warm, not tired. If anything pinches or hurts, skip it and tell your coach.",
      },
      {
        id: "w1l2",
        title: "Your first strength session",
        mins: 12,
        body: "Sample lesson. Your first session has just four moves: goblet squat, wall push-up, glute bridge, and dead bug. Do 2 rounds of 8–10 slow reps each, resting 60 seconds between moves. Use a weight that feels challenging on the last two reps but still lets you keep good form. Write down what you did — the log is how progress becomes visible week to week.",
      },
      {
        id: "w1l3",
        title: "Form basics: squat & hinge",
        mins: 10,
        body: "Sample lesson. Squat: feet shoulder-width apart, chest tall, sit your hips back and down as if into a chair, knees tracking over your toes. Hinge: soft knees, push your hips straight back with a flat back, feel your hamstrings load, then drive your hips forward. Film yourself from the side once a week — what you feel and what you do are often two different things.",
      },
    ],
  },
  {
    title: "Week 2 — Strength Basics",
    lessons: [
      { id: "w2l1", title: "Progressive overload, explained simply", mins: 8, body: "Sample lesson. To get stronger, do a little more over time: one more rep, a slightly heavier weight, or one extra set. Change only one thing at a time, and keep the same moves for a few weeks so progress is easy to track." },
      { id: "w2l2", title: "Push, pull, legs: the weekly split", mins: 9, body: "Sample lesson. A simple week: Day 1 push (push-ups, overhead press), Day 2 legs (squat, hinge), Day 3 pull (rows, carries). Rest at least one day between sessions that train the same muscles." },
    ],
  },
  {
    title: "Week 3 — Core & Mobility",
    lessons: [
      { id: "w3l1", title: "A core routine that is not crunches", mins: 7, body: "Sample lesson. Dead bug, side plank, and farmer carry train your core to brace and resist movement — which is what your core actually does all day. Two rounds, slow and controlled." },
      { id: "w3l2", title: "10-minute mobility reset", mins: 10, body: "Sample lesson. Hips, thoracic spine, ankles, shoulders: one gentle drill each, 60 seconds per side. Do it after training or on rest days while watching something you enjoy." },
    ],
  },
  {
    title: "Week 4 — Conditioning",
    lessons: [
      { id: "w4l1", title: "Cardio without running", mins: 8, body: "Sample lesson. Intervals on a bike, brisk walking uphill, or kettlebell swings in short rounds all build conditioning. Start with 6 rounds of 30 seconds of work and 90 seconds of rest." },
    ],
  },
  {
    title: "Week 5 — Progressive Overload",
    lessons: [
      { id: "w5l1", title: "When to add weight", mins: 7, body: "Sample lesson. When you can finish all sets with two reps left in the tank, add the smallest weight available next session. Small jumps, made often, beat big jumps that break your form." },
    ],
  },
  {
    title: "Week 6 — Nutrition Habits",
    lessons: [
      { id: "w6l1", title: "Protein, water, sleep: the big three", mins: 9, body: "Sample lesson. Most results come from three habits: a palm-sized protein portion at most meals, water through the day, and a regular sleep window. Master these before worrying about anything advanced." },
    ],
  },
  {
    title: "Week 7 — Full Routines",
    lessons: [
      { id: "w7l1", title: "Putting it together: a full week", mins: 10, body: "Sample lesson. This week combines everything: three strength days, two short conditioning sessions, and daily mobility. Follow the written plan exactly once, then adjust it with your coach." },
    ],
  },
  {
    title: "Week 8 — Keep Going Plan",
    lessons: [
      { id: "w8l1", title: "After the course: your next 8 weeks", mins: 8, body: "Sample lesson. Keep the same structure, swap one or two moves per month, and re-test your baseline every 8 weeks. Fitness is a practice, not a finish line." },
    ],
  },
];

const GUIDE_DAYS = [
  ["Day 1", "Walk 20 minutes + 5-minute warm-up drill."],
  ["Day 2", "First strength session: squat, push-up, glute bridge, dead bug — 2 rounds."],
  ["Day 3", "Rest + 10-minute mobility reset."],
  ["Day 4", "Repeat Day 2, adding one rep to each move."],
  ["Day 5", "Conditioning: 6 rounds of 30 seconds easy / 90 seconds rest."],
  ["Day 6", "Full routine: warm-up + strength + 5-minute walk."],
  ["Day 7", "Review your week, pick your three favourite moves, plan next week."],
];

function LeadForm({ compact = false }: { compact?: boolean }) {
  const mounted = useMounted();
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (mounted) setDone(!!read<string>("lead", ""));
  }, [mounted]);
  if (!mounted) return null;
  if (done)
    return (
      <div className="rounded-2xl bg-emerald-50 p-4 ring-1 ring-emerald-200">
        <p className="font-black text-emerald-800">✅ You are on the list (demo).</p>
        <p className="mt-1 text-sm text-emerald-700">
          In this demo, nothing is emailed. Read the sample guide right here:{" "}
          <a href="/demofitnesscourse/guide" className="font-bold underline">Open the free guide →</a>
        </p>
      </div>
    );
  return (
    <form
      className={compact ? "" : "rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200"}
      onSubmit={(e) => {
        e.preventDefault();
        if (!email.includes("@")) return;
        write("lead", email);
        setDone(true);
      }}
    >
      <label className="block text-sm font-bold" htmlFor="lead-email">
        Get the free 7-day starter guide
      </label>
      <p className="mt-1 text-xs text-slate-500">
        Enter your email in this demo and the sample guide unlocks instantly. No email is actually sent.
      </p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <input
          id="lead-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
        />
        <button className="rounded-xl bg-emerald-600 px-5 py-2 text-sm font-black text-white hover:brightness-110">
          Send me the guide
        </button>
      </div>
    </form>
  );
}

export function HomeView() {
  return (
    <Shell>
      {/* Hero */}
      <section className="relative overflow-hidden bg-slate-900 text-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/fc-img/hero.webp" alt="Home fitness space with mat, dumbbells and kettlebell" className="absolute inset-0 h-full w-full object-cover opacity-50" />
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:py-24">
          <p className="inline-block rounded-full bg-emerald-500/90 px-3 py-1 text-[11px] font-black tracking-widest uppercase">
            8-week online fitness course
          </p>
          <h1 className="mt-4 max-w-2xl text-4xl leading-tight font-black sm:text-5xl">
            Build strength at home, one week at a time.
          </h1>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-slate-200">
            Guided workouts, simple nutrition, and a coach on call — no gym, no guesswork.
            Start free, then join the full course when you are ready.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="#guide" className="rounded-full bg-emerald-500 px-6 py-3 text-sm font-black text-white shadow hover:brightness-110">
              Get the free guide
            </a>
            <a href="#pricing" className="rounded-full bg-white px-6 py-3 text-sm font-black text-slate-900 shadow hover:bg-slate-100">
              See the course — $79
            </a>
          </div>
          <p className="mt-4 text-xs text-slate-300">
            Demo checkout only — no real payment is processed on this sample site.
          </p>
        </div>
      </section>

      {/* Lead magnet */}
      <section id="guide" className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-6 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="text-2xl font-black">Start free: the 7-day starter guide</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Seven days of short workouts, one per day, that show you exactly how the course feels —
              before you spend anything. Enter your email and read it instantly in this demo.
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              {["No equipment needed for week one", "Every workout under 20 minutes", "Written so a complete beginner can follow along"].map((t) => (
                <li key={t} className="flex gap-2"><span className="text-emerald-600">✓</span>{t}</li>
              ))}
            </ul>
          </div>
          <LeadForm />
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <h2 className="text-2xl font-black">How it works</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {[
              ["1. Start free", "Read the 7-day starter guide and try the first workouts."],
              ["2. Join the course", "Get instant access to all 8 modules in the demo checkout — test mode, no real charge."],
              ["3. Train + get coached", "Follow the plan, track progress, and book a coaching call when you want feedback."],
            ].map(([t, d]) => (
              <div key={t} className="rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200">
                <p className="font-black">{t}</p>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Curriculum */}
      <section className="mx-auto max-w-6xl px-4 py-10">
        <h2 className="text-2xl font-black">Inside the course</h2>
        <p className="mt-2 text-sm text-slate-600">
          Eight weekly modules. Open the course area after demo checkout to read the sample lessons.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {MODULES.map((m) => (
            <div key={m.title} className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
              <p className="font-black">{m.title}</p>
              <ul className="mt-2 space-y-1 text-sm text-slate-600">
                {m.lessons.map((l) => (
                  <li key={l.id}>• {l.title} <span className="text-slate-400">({l.mins} min)</span></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-6 overflow-hidden rounded-2xl ring-1 ring-slate-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/fc-img/nutrition.webp" alt="Healthy meal prep with oats, berries and workout gear" className="h-56 w-full object-cover sm:h-72" />
          <p className="bg-white px-4 py-3 text-sm text-slate-600">
            The nutrition module keeps it simple: protein, water, sleep — then meal templates you can actually cook.
          </p>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <h2 className="text-2xl font-black">Pricing (USD)</h2>
          <p className="mt-2 text-sm text-slate-600">
            One-time prices. Demo checkout only — no real charge is made.
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PLANS.map((p) => (
              <div key={p.id} className="flex flex-col rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200">
                <p className="font-black">{p.name}</p>
                <p className="mt-1 text-3xl font-black text-emerald-600">${p.price}</p>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{p.blurb}</p>
                <ul className="mt-3 space-y-1 text-sm text-slate-600">
                  {p.features.map((f) => (
                    <li key={f}>✓ {f}</li>
                  ))}
                </ul>
                <a
                  href={`/demofitnesscourse/checkout?plan=${p.id}`}
                  className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-center text-sm font-black text-white hover:brightness-110"
                >
                  Choose {p.name}
                </a>
              </div>
            ))}
          </div>
          <p className="mt-5 text-center text-sm">
            Want a human first?{" "}
            <a href="/demofitnesscourse/book" className="font-bold text-emerald-600 underline">
              Book a single coaching call — $49 →
            </a>
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-6xl px-4 py-10">
        <h2 className="text-2xl font-black">Questions</h2>
        <div className="mt-4 space-y-3 text-sm leading-relaxed">
          <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
            <p className="font-black">Do I need a gym or equipment?</p>
            <p className="mt-1 text-slate-600">No. Week one needs no equipment. Later weeks work with dumbbells or resistance bands if you have them, with bodyweight alternatives for every move.</p>
          </div>
          <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
            <p className="font-black">How do coaching calls work?</p>
            <p className="mt-1 text-slate-600">Pick a date and time on the booking page, tell the coach your goal, and you get a written recap after the call. In this demo, bookings are stored in your browser only — no real calendar event is created.</p>
          </div>
          <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
            <p className="font-black">Is this a real store?</p>
            <p className="mt-1 text-slate-600">No — this is a DigiPlyra demo website. Checkout is test mode, the guide is sample content, and nothing here charges you or sends real emails.</p>
          </div>
        </div>
      </section>
    </Shell>
  );
}

export function GuideView() {
  const mounted = useMounted();
  const [hasLead, setHasLead] = useState(false);
  useEffect(() => {
    if (mounted) setHasLead(!!read<string>("lead", ""));
  }, [mounted]);
  return (
    <Shell>
      <div className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-3xl font-black">The 7-Day Home Strength Starter (Free Guide)</h1>
        <p className="mt-2 text-sm text-slate-600">
          Sample guide content. In a real store this would arrive by email after opt-in; in this demo it is right here.
        </p>
        {!mounted ? null : !hasLead ? (
          <div className="mt-6">
            <LeadForm />
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {GUIDE_DAYS.map(([d, t]) => (
              <div key={d} className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                <p className="font-black">{d}</p>
                <p className="mt-1 text-sm text-slate-600">{t}</p>
              </div>
            ))}
            <div className="rounded-2xl bg-emerald-50 p-5 ring-1 ring-emerald-200">
              <p className="font-black text-emerald-800">Liked the week?</p>
              <p className="mt-1 text-sm text-emerald-700">
                The full course continues this plan for 8 weeks, with coaching when you want it.{" "}
                <a href="/demofitnesscourse#pricing" className="font-bold underline">See pricing →</a>
              </p>
            </div>
          </div>
        )}
      </div>
    </Shell>
  );
}

export function CheckoutView() {
  const mounted = useMounted();
  const [planId, setPlanId] = useState<string>("course");
  const [name, setName] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("plan");
      if (q && PLANS.some((p) => p.id === q)) setPlanId(q);
    }
  }, []);
  const plan = useMemo(() => PLANS.find((p) => p.id === planId) ?? PLANS[0], [planId]);
  if (!mounted) return null;
  if (done)
    return (
      <Shell>
        <div className="mx-auto max-w-xl px-4 py-14 text-center">
          <p className="text-5xl">🎉</p>
          <h1 className="mt-3 text-3xl font-black">Demo order complete</h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            No real payment was processed and no card data was sent anywhere. In this demo your{" "}
            <b>{plan.name} (${plan.price})</b> is now unlocked in your browser.
          </p>
          <a href="/demofitnesscourse/course?welcome=1" className="mt-6 inline-block rounded-full bg-emerald-600 px-6 py-3 text-sm font-black text-white hover:brightness-110">
            Open my course →
          </a>
        </div>
      </Shell>
    );
  return (
    <Shell>
      <div className="mx-auto max-w-xl px-4 py-10">
        <p className="rounded-xl bg-amber-100 px-4 py-2 text-center text-xs font-bold text-amber-800 ring-1 ring-amber-300">
          🧪 Demo checkout — test mode. No real charge, no card data leaves this page.
        </p>
        <h1 className="mt-5 text-3xl font-black">Checkout</h1>
        <label className="mt-5 block text-sm font-bold" htmlFor="plan">Choose a plan</label>
        <select
          id="plan"
          value={planId}
          onChange={(e) => setPlanId(e.target.value)}
          className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none"
        >
          {PLANS.map((p) => (
            <option key={p.id} value={p.id}>{p.name} — ${p.price} USD</option>
          ))}
        </select>
        <form
          className="mt-5 space-y-3 rounded-2xl bg-white p-5 ring-1 ring-slate-200"
          onSubmit={(e) => {
            e.preventDefault();
            write("purchase", { plan: plan.id, name, at: new Date().toISOString() });
            setDone(true);
          }}
        >
          <div>
            <label className="block text-sm font-bold" htmlFor="co-name">Full name</label>
            <input id="co-name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex Morgan" className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500" />
          </div>
          <div>
            <label className="block text-sm font-bold" htmlFor="co-card">Card number (test only — use 4242 4242 4242 4242)</label>
            <input id="co-card" required inputMode="numeric" placeholder="4242 4242 4242 4242" className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold" htmlFor="co-exp">Expiry</label>
              <input id="co-exp" required placeholder="12 / 28" className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-bold" htmlFor="co-cvc">CVC</label>
              <input id="co-cvc" required inputMode="numeric" placeholder="123" className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500" />
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-slate-200 pt-3">
            <span className="text-sm font-bold">Total (USD)</span>
            <span className="text-xl font-black text-emerald-600">${plan.price}</span>
          </div>
          <button className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-black text-white hover:brightness-110">
            Complete demo purchase — ${plan.price}
          </button>
          <p className="text-center text-xs text-slate-500">
            This button only saves a demo purchase in your browser. Nothing is charged.
          </p>
        </form>
      </div>
    </Shell>
  );
}

export function CourseView() {
  const mounted = useMounted();
  const [purchase, setPurchase] = useState<{ plan: string } | null>(null);
  const [openLesson, setOpenLesson] = useState<string | null>(null);
  const [doneLessons, setDoneLessons] = useState<string[]>([]);
  const [welcome, setWelcome] = useState(false);
  useEffect(() => {
    if (typeof window !== "undefined") {
      setPurchase(read<{ plan: string } | null>("purchase", null));
      setDoneLessons(read<string[]>("progress", []));
      setWelcome(new URLSearchParams(window.location.search).get("welcome") === "1");
    }
  }, []);
  const total = MODULES.flatMap((m) => m.lessons).length;
  const pct = total ? Math.round((doneLessons.length / total) * 100) : 0;
  const toggle = (id: string) => {
    const next = doneLessons.includes(id) ? doneLessons.filter((x) => x !== id) : [...doneLessons, id];
    setDoneLessons(next);
    write("progress", next);
  };
  if (!mounted) return null;
  return (
    <Shell>
      <div className="mx-auto max-w-4xl px-4 py-10">
        <h1 className="text-3xl font-black">My Course</h1>
        {welcome && purchase && (
          <p className="mt-3 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800 ring-1 ring-emerald-200">
            🎉 Welcome! Your demo purchase unlocked the full course in this browser.
          </p>
        )}
        {!purchase ? (
          <div className="mt-6 rounded-2xl bg-white p-6 text-center ring-1 ring-slate-200">
            <p className="text-4xl">🔒</p>
            <p className="mt-2 text-lg font-black">The course area is locked in this demo</p>
            <p className="mx-auto mt-1 max-w-md text-sm leading-relaxed text-slate-600">
              In a real store, lessons unlock instantly after purchase. Here, run the demo checkout
              (test mode, no real charge) and this page unlocks immediately.
            </p>
            <a href="/demofitnesscourse#pricing" className="mt-5 inline-block rounded-full bg-emerald-600 px-6 py-3 text-sm font-black text-white hover:brightness-110">
              See pricing →
            </a>
          </div>
        ) : (
          <>
            <div className="mt-5 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
              <div className="flex justify-between text-sm font-bold">
                <span>Your progress</span>
                <span>{doneLessons.length} / {total} lessons · {pct}%</span>
              </div>
              <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
              </div>
            </div>
            <div className="mt-6 space-y-5">
              {MODULES.map((m) => (
                <div key={m.title} className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
                  <p className="font-black">{m.title}</p>
                  <div className="mt-3 space-y-2">
                    {m.lessons.map((l) => (
                      <div key={l.id} className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-100">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <button onClick={() => setOpenLesson(openLesson === l.id ? null : l.id)} className="text-left text-sm font-bold hover:text-emerald-600">
                            {doneLessons.includes(l.id) ? "✅ " : "▶ "}{l.title} <span className="font-normal text-slate-400">({l.mins} min)</span>
                          </button>
                          <button
                            onClick={() => toggle(l.id)}
                            className="rounded-full bg-white px-3 py-1 text-xs font-bold ring-1 ring-slate-300 hover:bg-emerald-50"
                          >
                            {doneLessons.includes(l.id) ? "Mark not done" : "Mark complete"}
                          </button>
                        </div>
                        {openLesson === l.id && (
                          <p className="mt-2 text-sm leading-relaxed text-slate-600">{l.body}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </Shell>
  );
}

type Booking = { name: string; email: string; date: string; time: string; goal: string };

export function BookView() {
  const mounted = useMounted();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState<Booking>({ name: "", email: "", date: "", time: "10:00 AM", goal: "Form check" });
  useEffect(() => {
    if (mounted) setBookings(read<Booking[]>("bookings", []));
  }, [mounted]);
  if (!mounted) return null;
  return (
    <Shell>
      <div className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-3xl font-black">Book a coaching call</h1>
        <p className="mt-2 text-sm text-slate-600">
          45 minutes, one-on-one. Single call $49 — or included in the Course + Coaching plan. Demo bookings
          are stored in your browser only; no real calendar event is created.
        </p>
        {saved && (
          <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800 ring-1 ring-emerald-200">
            ✅ Demo booking saved. In a real store you would get a confirmation email and calendar invite.
          </p>
        )}
        <form
          className="mt-6 space-y-3 rounded-2xl bg-white p-5 ring-1 ring-slate-200"
          onSubmit={(e) => {
            e.preventDefault();
            const next = [...bookings, form];
            setBookings(next);
            write("bookings", next);
            setSaved(true);
          }}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-bold" htmlFor="bk-name">Full name</label>
              <input id="bk-name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Alex Morgan" className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-bold" htmlFor="bk-email">Email</label>
              <input id="bk-email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500" />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-bold" htmlFor="bk-date">Preferred date</label>
              <input id="bk-date" type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-bold" htmlFor="bk-time">Time slot</label>
              <select id="bk-time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none">
                {["08:00 AM", "10:00 AM", "12:00 PM", "04:00 PM", "06:00 PM", "08:00 PM"].map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold" htmlFor="bk-goal">What do you want from the call?</label>
            <select id="bk-goal" value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none">
              {["Form check", "Fresh start plan", "Nutrition questions", "Plateau help"].map((g) => (
                <option key={g}>{g}</option>
              ))}
            </select>
          </div>
          <button className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-black text-white hover:brightness-110">
            Book demo call
          </button>
        </form>
        {bookings.length > 0 && (
          <div className="mt-6">
            <h2 className="font-black">Your demo bookings</h2>
            <div className="mt-3 space-y-2">
              {bookings.map((b, i) => (
                <div key={i} className="rounded-xl bg-white p-4 text-sm ring-1 ring-slate-200">
                  <p className="font-bold">{b.date} · {b.time} — {b.goal}</p>
                  <p className="text-slate-500">{b.name} · {b.email}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Shell>
  );
}
