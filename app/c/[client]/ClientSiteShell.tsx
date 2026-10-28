"use client";

/**
 * Client site shell — renders a demo as a 100% white-label client website.
 * NO DigiPlyra branding, NO demo badges, NO links to the main site.
 * The customer only sees their own site.
 */

import { DemositeProvider } from "@/app/web-dev/demos/demosite/store";
import { DemoLangProvider } from "@/app/web-dev/demos/demosite/demo-lang";
import DemoSite from "@/app/web-dev/demos/demosite/DemoSite";
import type { DemoSiteDef } from "@/app/web-dev/demos/demosite/types";
import type { DemoCustom } from "@/app/web-dev/demos/demosite/store";

export default function ClientSiteShell({
  clientSlug,
  def,
  custom,
  page,
  baseOverride,
}: {
  clientSlug: string;
  def: DemoSiteDef;
  custom: DemoCustom;
  page: string[];
  /** "" when served via the customer's own domain. */
  baseOverride?: string;
}) {
  // Mount the demo-language provider (same as every /demo* route) so a
  // customer site's chrome — navbar, drawer, footer — defaults to English
  // with the language switcher inside the drawer, instead of the legacy
  // Bangla chrome that /c sites rendered until now. Buying-house sites
  // are unaffected: chrome prefers bh-lang for that layout.
  return (
    <DemoLangProvider>
      <DemositeProvider
        slug={def.slug}
        def={def}
        clientSlug={clientSlug}
        initialCustom={custom}
        baseOverride={baseOverride}
      >
        <DemoSite page={page} />
      </DemositeProvider>
    </DemoLangProvider>
  );
}
