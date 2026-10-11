import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import { getDemoDef } from "@/app/web-dev/demos/demosite/defs";
import ClientSiteShell from "./ClientSiteShell";
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
    title: `${c.site_title} — ${c.demo_slug}`,
    description: `${c.site_title}: ${c.hero_title || ""}`,
  };
}

/** Client home page: /c/{client} */
export default async function Page({ params }: { params: Promise<{ client: string }> }) {
  const { client } = await params;
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

  return <ClientSiteShell clientSlug={c.slug} def={def} custom={custom} page={[]} />;
}
