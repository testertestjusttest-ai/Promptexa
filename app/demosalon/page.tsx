import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDemoDef } from "../web-dev/demos/demosite/defs";
import { DemositeProvider } from "../web-dev/demos/demosite/store";
import DemoSite from "../web-dev/demos/demosite/DemoSite";
import { DemoShell } from "../web-dev/demos/full-demos";
import { applyAgencyDemoOverride } from "../web-dev/demos/demosite/agency-demo-overrides";
import { DemoLangProvider } from "../web-dev/demos/demosite/demo-lang";
import { AgencyDemoBar } from "../web-dev/demos/demosite/agency-demo-bar";

export const dynamic = "force-dynamic";

export function generateMetadata(): Metadata {
  const raw = getDemoDef("salon");
  if (!raw) return {};
  const def = applyAgencyDemoOverride(raw);
  return {
    title: `${def.name} — ${def.type}`,
    description: `${def.name}: ${def.heroTitle}. A DigiPlyra interactive demo website — explore it!`,
  };
}

/** Demo home — sub-pages served by app/demo[slug]/[[...page]] */
export default function Page() {
  const raw = getDemoDef("salon");
  if (!raw) notFound();
  const def = applyAgencyDemoOverride(raw);
  return (
    <DemoLangProvider>
      <DemositeProvider slug={def.slug} def={def}>
        <DemoShell name={def.name} type={def.type} slug={def.slug}>
          <AgencyDemoBar slug={def.slug} name={def.name} />
          <DemoSite page={[]} />
        </DemoShell>
      </DemositeProvider>
    </DemoLangProvider>
  );
}
