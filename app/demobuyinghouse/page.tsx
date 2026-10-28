import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDemoDef } from "../web-dev/demos/demosite/defs";
import { DemositeProvider } from "../web-dev/demos/demosite/store";
import DemoSite from "../web-dev/demos/demosite/DemoSite";
import { DemoShell } from "../web-dev/demos/full-demos";
import { AgencyDemoBar } from "../web-dev/demos/demosite/agency-demo-bar";

export const dynamic = "force-dynamic";

export function generateMetadata(): Metadata {
  const def = getDemoDef("buyinghouse");
  if (!def) return {};
  // English by default (mirrors EN_NAME / EN_HERO_TITLE in demosite/bh-lang.tsx).
  // Written literally here rather than imported: bh-lang.tsx is a "use client"
  // module, so its exports cannot be imported into this server metadata
  // function. The in-page chrome already switches to Bangla via BhLangProvider
  // when the visitor picks Bangla; server metadata cannot read that
  // browser-local choice, so the default (English) title is served.
  return {
    title: "TexBridge Sourcing — Garments Buying House",
    description: "TexBridge Sourcing: World-Class Garment Sourcing from Bangladesh. A DigiPlyra interactive demo website — explore it!",
  };
}

/** Demo home — sub-pages served by app/demo[slug]/[[...page]] */
export default function Page() {
  const def = getDemoDef("buyinghouse");
  if (!def) notFound();
  return (
    <DemositeProvider slug={def.slug} def={def}>
      <DemoShell name={def.name} type={def.type} slug={def.slug}>
          <AgencyDemoBar slug={def.slug} name={def.name} />
        <DemoSite page={[]} />
      </DemoShell>
    </DemositeProvider>
  );
}
