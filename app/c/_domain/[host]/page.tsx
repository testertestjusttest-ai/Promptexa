import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import { getDemoDef } from "@/app/web-dev/demos/demosite/defs";
import ClientSiteShell from "@/app/c/[client]/ClientSiteShell";
import type { DemoCustom } from "@/app/web-dev/demos/demosite/store";

export const dynamic = "force-dynamic";

/** Resolve a custom domain to its client site. */
async function getClientByDomain(host: string) {
  const svc = createServiceClient();
  const { data } = await svc
    .from("client_sites")
    .select("*")
    .eq("custom_domain", host.toLowerCase())
    .eq("is_active", true)
    .single();
  return data as any | null;
}

/** Custom-domain home: https://customer-domain.com/ */
export default async function Page({ params }: { params: Promise<{ host: string }> }) {
  const { host } = await params;
  const c = await getClientByDomain(host);
  if (!c) notFound();
  const def = getDemoDef(c.demo_slug);
  if (!def) notFound();

  const custom: DemoCustom = {
    siteName: c.site_title,
    theme: c.theme || undefined,
    accent: c.accent || undefined,
    logoEmoji: c.logo_emoji || undefined,
    heroTitle: c.hero_title || undefined,
    heroSub: c.hero_sub || undefined,
  };

  return <ClientSiteShell clientSlug={c.slug} def={def} custom={custom} page={[]} />;
}
