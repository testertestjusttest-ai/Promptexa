import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDemoDef } from "../web-dev/demos/demosite/defs";
import { DemositeProvider } from "../web-dev/demos/demosite/store";
import DemoSite from "../web-dev/demos/demosite/DemoSite";
import { DemoShell } from "../web-dev/demos/full-demos";

export const dynamic = "force-dynamic";

export function generateMetadata(): Metadata {
  const def = getDemoDef("salon");
  if (!def) return {};
  return {
    title: `${def.name} — ${def.type} | ডেমো ওয়েবসাইট`,
    description: `${def.name}: ${def.heroTitle}। এটি DigiPlyra-এর একটি ইন্টারঅ্যাক্টিভ ডেমো ওয়েবসাইট — ঘেঁটে দেখুন!`,
  };
}

/** Demo home — sub-pages served by app/demo[slug]/[[...page]] */
export default function Page() {
  const def = getDemoDef("salon");
  if (!def) notFound();
  return (
    <DemositeProvider slug={def.slug} def={def}>
      <DemoShell name={def.name} type={def.type} slug={def.slug}>
        <DemoSite page={[]} />
      </DemoShell>
    </DemositeProvider>
  );
}
