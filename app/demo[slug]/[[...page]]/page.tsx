import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDemoDef } from "../../web-dev/demos/demosite/defs";
import { DemositeProvider } from "../../web-dev/demos/demosite/store";
import DemoSite from "../../web-dev/demos/demosite/DemoSite";
import { DemoShell } from "../../web-dev/demos/full-demos";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const def = getDemoDef(slug);
  if (!def) return {};
  return {
    title: `${def.name} — ${def.type} | ডেমো ওয়েবসাইট`,
    description: `${def.name}: ${def.heroTitle}। এটি DigiPlyra-এর একটি ইন্টারঅ্যাক্টিভ ডেমো ওয়েবসাইট — ঘেঁটে দেখুন!`,
  };
}

/** Dynamic multi-page demo route: /demorestaurant, /demorestaurant/shop, /demorestaurant/p/p0 ... */
export const dynamic = "force-dynamic";
export default async function Page({ params }: { params: Promise<{ slug: string; page?: string[] }> }) {
  const { slug, page } = await params;
  const def = getDemoDef(slug);
  if (!def) notFound();
  return (
    <DemositeProvider slug={def.slug} def={def}>
      <DemoShell name={def.name} type={def.type} slug={def.slug}>
        <DemoSite page={page ?? []} />
      </DemoShell>
    </DemositeProvider>
  );
}
