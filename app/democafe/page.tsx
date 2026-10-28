import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDemoDef } from "../web-dev/demos/demosite/defs";
import { DemositeProvider } from "../web-dev/demos/demosite/store";
import DemoSite from "../web-dev/demos/demosite/DemoSite";
import { DemoShell } from "../web-dev/demos/full-demos";
import { applyAgencyDemoOverride } from "../web-dev/demos/demosite/agency-demo-overrides";
import { DemoLangProvider } from "../web-dev/demos/demosite/demo-lang";
import { AgencyDemoBar } from "../web-dev/demos/demosite/agency-demo-bar";
import { localizeDemoDef } from "../web-dev/demos/demosite/demo-def-i18n";

export const dynamic = "force-dynamic";

export function generateMetadata(): Metadata {
  const raw = getDemoDef("cafe");
  if (!raw) return {};
  // Default view is English: metadata + shell/bar names use the EN def.
  // The provider below still gets the raw def, so the BN view localizes
  // client-side via the store (demo-def-i18n.ts) and stays Bangla.
  const def = localizeDemoDef(applyAgencyDemoOverride(raw), "en");
  return {
    title: `${def.name} — ${def.type}`,
    description: `${def.name}: ${def.heroTitle}. A DigiPlyra interactive demo website — explore it!`,
  };
}

/** Demo home — sub-pages served by app/demo[slug]/[[...page]] */
export default function Page() {
  const raw = getDemoDef("cafe");
  if (!raw) notFound();
  const def = applyAgencyDemoOverride(raw);
  const enDef = localizeDemoDef(def, "en");
  return (
    <DemoLangProvider>
      <DemositeProvider slug={def.slug} def={def}>
        <DemoShell name={enDef.name} type={enDef.type} slug={def.slug}>
          <AgencyDemoBar slug={def.slug} name={enDef.name} />
          <DemoSite page={[]} />
        </DemoShell>
      </DemositeProvider>
    </DemoLangProvider>
  );
}
