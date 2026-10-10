import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DEMOS } from "../../demos/demos";
import { DemoShell, FULL_DEMOS } from "../../demos/full-demos";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const d = DEMOS.find((x) => x.slug === slug);
  return {
    title: d ? `${d.name} — লাইভ ডেমো | DigiPlyra` : "ডেমো",
    description: d ? `${d.desc} — ডেমোটি ঘেঁটে দেখুন, প্রতিটা বাটন কাজ করে।` : undefined,
  };
}

export default async function DemoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const demo = DEMOS.find((x) => x.slug === slug);
  if (!demo) notFound();
  const Full = FULL_DEMOS[slug];
  const others = DEMOS.filter((x) => x.slug !== slug).slice(0, 3);

  return (
    <div>
      {/* intro header */}
      <div className="mx-auto max-w-5xl px-4 pt-8 sm:px-6">
        <Link href="/web-dev#demos" className="text-sm font-bold text-[#d7ff3f] hover:underline">
          ← সব ডেমো
        </Link>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-black text-white">{demo.name}</h1>
            <p className="mt-1 text-sm text-slate-400">{demo.type} • {demo.desc}</p>
          </div>
          <span className="rounded-full bg-[#d7ff3f]/15 px-4 py-1.5 text-sm font-bold text-[#d7ff3f]">
            {demo.price}
          </span>
        </div>
        <p className="mt-3 rounded-xl border border-amber-400/25 bg-amber-400/5 px-4 py-3 text-xs leading-relaxed text-amber-200">
          👆 <b>ভেতরে ঢুকে ঘুরে দেখুন!</b> নিচে আসল ওয়েবসাইটের মতো পুরো ডেমো — বাটনে ক্লিক করুন,
          ট্যাব বদলান, কার্টে যোগ করুন। <b>এটি শুধু ডেমো</b>, আপনার পছন্দমতো কাস্টমাইজ করে দেওয়া হবে।
        </p>
      </div>

      {/* immersive full-bleed demo */}
      <div className="mt-6">
        <DemoShell name={demo.name} type={demo.type} slug={demo.slug}>
          {Full ? <Full /> : demo.render()}
        </DemoShell>
      </div>

      {/* CTA */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="glass mt-8 rounded-3xl p-8 text-center">
          <h2 className="font-display text-xl font-bold text-white">এরকম ওয়েবসাইট চান?</h2>
          <p className="mt-2 text-sm text-slate-400">
            ৭–১৪ দিনে ডেলিভারি • মোবাইল রেসপন্সিভ • ফ্রি সাপোর্ট • আপনার পছন্দমতো ডিজাইন
          </p>
          <Link href="/web-dev#quote" className="btn-vault mt-4 inline-flex !px-10 !py-3.5 text-base">
            📝 ফ্রি কোট নিন
          </Link>
        </div>

        <h3 className="font-display mt-10 text-lg font-bold text-white">আরও ডেমো দেখুন</h3>
        <div className="mt-4 grid gap-4 pb-12 sm:grid-cols-3">
          {others.map((o) => (
            <Link key={o.slug} href={`/web-dev/demo/${o.slug}`} className="glass rounded-2xl p-4 transition hover:border-[#d7ff3f]/40">
              <p className="font-bold text-white">{o.name}</p>
              <p className="mt-0.5 text-xs text-slate-500">{o.type}</p>
              <span className="mt-2 inline-block text-xs font-bold text-[#d7ff3f]">👁️ ডেমো দেখতে ক্লিক করুন →</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
