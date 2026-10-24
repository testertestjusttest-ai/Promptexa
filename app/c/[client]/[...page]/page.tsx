import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import { getDemoDef } from "@/app/web-dev/demos/demosite/defs";
import ClientSiteShell from "../ClientSiteShell";
import type { DemoCustom } from "@/app/web-dev/demos/demosite/store";

export const dynamic = "force-dynamic";

async function getClient(slug: string) {
  const svc = createServiceClient();
  const { data } = await svc.from("client_sites").select("*").eq("slug", slug).eq("is_active", true).single();
  return data as any | null;
}

export async function generateMetadata({ params }: { params: Promise<{ client: string }> }): Promise<Metadata> {
  const { client } = await params;
  const c = await getClient(client);
  if (!c) return {};
  return {
    // absolute: bypass the root "%s -- DigiPlyra" template -- client sites are 100% white-label
    title: { absolute: c.site_title },
    description: `${c.site_title}: ${c.hero_title || ""}`,
    openGraph: { title: c.site_title, siteName: c.site_title, description: c.hero_title || undefined },
  };
}

/** Client sub-pages: /c/{client}/shop, /c/{client}/p/..., /c/{client}/admin ... */
export default async function Page({ params }: { params: Promise<{ client: string; page?: string[] }> }) {
  const { client, page } = await params;
  const c = await getClient(client);
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

  return <ClientSiteShell clientSlug={c.slug} def={def} custom={custom} page={page ?? []} />;
}
