import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DEMOS } from "../../demos/demos";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const d = DEMOS.find((x) => x.slug === slug);
  return { title: d ? `${d.name} — ডেমো` : "ডেমো" };
}

export default async function DemoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const demo = DEMOS.find((x) => x.slug === slug);
  if (!demo) notFound();
  const others = DEMOS.filter((x) => x.slug !== slug).slice(0, 3);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <Link href="/web-dev#demos" className="text-sm font-bold text-[#d7ff3f] hover:underline">
        ← সব ডেমো
      </Link>
      <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-black text-white">{demo.name}</h1>
          <p className="mt-1 text-sm text-slate-400">{demo.type} • {demo.desc}</p>
        </div>
        <span className="rounded-full bg-[#d7ff3f]/15 px-4 py-1.5 text-sm font-bold text-[#d7ff3f]">
          {demo.price}
        </span>
      </div>

      <p className="mt-3 rounded-xl border border-sky-400/20 bg-sky-400/5 px-4 py-2.5 text-xs text-sky-200">
        🖥️ এটি একটি <b>ডেমো প্রিভিউ</b> — আপনার ব্যবসার নাম, ছবি, কনটেন্ট দিয়ে এরকম
        প্রফেশনাল ওয়েবসাইট বানিয়ে দেওয়া হবে।
      </p>

      <div className="mt-6 overflow-hidden rounded-3xl border border-white/10 shadow-2xl">
        {demo.render()}
      </div>

      <div className="glass mt-8 rounded-3xl p-8 text-center">
        <h2 className="font-display text-xl font-bold text-white">এরকম ওয়েবসাইট চান?</h2>
        <p className="mt-2 text-sm text-slate-400">
          ৭–১৪ দিনে ডেলিভারি • মোবাইল রেসপন্সিভ • ফ্রি সাপোর্ট
        </p>
        <Link href="/web-dev#quote" className="btn-vault mt-4 inline-flex !px-10 !py-3.5 text-base">
          📝 ফ্রি কোট নিন
        </Link>
      </div>

      <h3 className="font-display mt-10 text-lg font-bold text-white">আরও ডেমো দেখুন</h3>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {others.map((o) => (
          <Link key={o.slug} href={`/web-dev/demo/${o.slug}`} className="glass rounded-2xl p-4 transition hover:border-[#d7ff3f]/40">
            <p className="font-bold text-white">{o.name}</p>
            <p className="mt-0.5 text-xs text-slate-500">{o.type}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
