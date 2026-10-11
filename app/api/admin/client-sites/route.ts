import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin";

export const dynamic = "force-dynamic";

function slugify(s: string): string {
  return s.toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "site";
}

/** GET /api/admin/client-sites — list all client sites. */
export async function GET() {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;
  const { data } = await auth.svc.from("client_sites").select("*").order("created_at", { ascending: false });
  return NextResponse.json({ sites: data ?? [] });
}

/**
 * POST /api/admin/client-sites — create a client site.
 * Body: { demo_slug, site_title, client_name?, contact?, theme?, accent?, logo_emoji?, hero_title?, hero_sub?, custom_domain?, slug? }
 */
export async function POST(req: Request) {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;
  const b = (await req.json().catch(() => ({}))) as Record<string, string>;
  if (!b.demo_slug || !b.site_title?.trim()) {
    return NextResponse.json({ error: "ডেমো ও সাইটের নাম দিন" }, { status: 400 });
  }
  let slug = slugify(b.slug || b.site_title);
  // ensure unique
  const { data: existing } = await auth.svc.from("client_sites").select("slug").eq("slug", slug).single();
  if (existing) slug = `${slug}-${Date.now().toString(36)}`;

  const domain = (b.custom_domain || "").trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "");
  const { data, error } = await auth.svc.from("client_sites").insert({
    slug,
    demo_slug: b.demo_slug,
    site_title: b.site_title.trim(),
    client_name: (b.client_name || "").trim() || null,
    contact: (b.contact || "").trim() || null,
    theme: (b.theme || "").trim() || null,
    accent: (b.accent || "").trim() || null,
    logo_emoji: (b.logo_emoji || "").trim() || null,
    hero_title: (b.hero_title || "").trim() || null,
    hero_sub: (b.hero_sub || "").trim() || null,
    custom_domain: domain || null,
  }).select("*").single();

  if (error || !data) {
    return NextResponse.json({ error: "তৈরি হয়নি: " + (error?.message ?? "") }, { status: 500 });
  }
  return NextResponse.json({ ok: true, site: data });
}

/** PATCH /api/admin/client-sites — update (domain, theme, active...). Body: { id, ...fields } */
export async function PATCH(req: Request) {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;
  const b = (await req.json().catch(() => ({}))) as Record<string, any>;
  if (!b.id) return NextResponse.json({ error: "ID দিন" }, { status: 400 });
  const allowed = ["site_title", "client_name", "contact", "theme", "accent", "logo_emoji", "hero_title", "hero_sub", "custom_domain", "is_active"];
  const patch: Record<string, any> = {};
  for (const k of allowed) {
    if (b[k] !== undefined) {
      patch[k] = k === "custom_domain" && b[k]
        ? String(b[k]).trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "") || null
        : b[k];
    }
  }
  const { error } = await auth.svc.from("client_sites").update(patch).eq("id", b.id);
  if (error) return NextResponse.json({ error: "আপডেট হয়নি" }, { status: 500 });
  return NextResponse.json({ ok: true });
}

/** DELETE /api/admin/client-sites?id= — deactivate (soft delete). */
export async function DELETE(req: Request) {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID দিন" }, { status: 400 });
  await auth.svc.from("client_sites").update({ is_active: false }).eq("id", id);
  return NextResponse.json({ ok: true });
}
