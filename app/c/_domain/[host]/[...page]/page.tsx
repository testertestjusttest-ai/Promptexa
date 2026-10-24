import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import { getDemoDef } from "@/app/web-dev/demos/demosite/defs";
import ClientSiteShell from "@/app/c/[client]/ClientSiteShell";
import type { DemoCustom } from "@/app/web-dev/demos/demosite/store";

export const dynamic = "force-dynamic";

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

export async function generateMetadata({ params }: { params: Promise<{ host: string }> }): Promise<Metadata> {
  const { host } = await params;
  const c = await getClientByDomain(host);
  if (!c) return {};
  return {
    // absolute: bypass the root "%s -- DigiPlyra" template -- client sites are 100% white-label
    title: { absolute: c.site_title },
    description: `${c.site_title}: ${c.hero_title || ""}`,
    openGraph: { title: c.site_title, siteName: c.site_title, description: c.hero_title || undefined },
  };
}

/** Custom-domain sub-pages: https://customer-domain.com/shop ... */
export default async function Page({ params }: { params: Promise<{ host: string; page?: string[] }> }) {
  const { host, page } = await params;
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

  return <ClientSiteShell clientSlug={c.slug} def={def} custom={custom} page={page ?? []} baseOverride="" />;
}
