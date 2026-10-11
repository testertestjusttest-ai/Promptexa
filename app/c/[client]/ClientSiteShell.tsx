"use client";

/** Client site shell — renders a demo as a white-label client website. */

import { DemositeProvider } from "@/app/web-dev/demos/demosite/store";
import DemoSite from "@/app/web-dev/demos/demosite/DemoSite";
import { DemoShell } from "@/app/web-dev/demos/full-demos";
import type { DemoSiteDef } from "@/app/web-dev/demos/demosite/types";
import type { DemoCustom } from "@/app/web-dev/demos/demosite/store";

export default function ClientSiteShell({
  clientSlug,
  def,
  custom,
  page,
}: {
  clientSlug: string;
  def: DemoSiteDef;
  custom: DemoCustom;
  page: string[];
}) {
  return (
    <DemositeProvider slug={def.slug} def={def} clientSlug={clientSlug} initialCustom={custom}>
      <DemoShell name={def.name} type={def.type} slug={def.slug}>
        <DemoSite page={page} />
      </DemoShell>
    </DemositeProvider>
  );
}
