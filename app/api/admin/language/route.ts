import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin";

/**
 * Language profile mirroring (Phase 5).
 * - GET: the signed-in admin's saved profile language (profiles.preferred_lang)
 *   and the site default language (agency_site_settings.default_lang).
 *   Both degrade gracefully when the Phase 5 SQL has not run yet.
 * - POST { my_lang }: save the admin's own language to their profile.
 * - POST { site_default_lang }: save the site-wide default for new visitors.
 * Neither write fails the UI when the column/table is missing — the response
 * says so plainly and the Settings card falls back to local-only storage.
 */
export async function GET() {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;
  let my_lang: string | null = null;
  let site_default_lang: string | null = null;
  try {
    const { data } = await auth.svc
      .from("profiles")
      .select("preferred_lang")
      .eq("id", auth.user.id)
      .single();
    my_lang = (data as { preferred_lang?: string } | null)?.preferred_lang ?? null;
  } catch {
    my_lang = null;
  }
  try {
    const { data } = await auth.svc
      .from("agency_site_settings")
      .select("default_lang")
      .eq("id", 1)
      .single();
    site_default_lang = (data as { default_lang?: string } | null)?.default_lang ?? null;
  } catch {
    site_default_lang = null;
  }
  return NextResponse.json({ ok: true, my_lang, site_default_lang });
}

export async function POST(req: Request) {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;
  const body = (await req.json()) as Record<string, unknown>;
  if (body.my_lang === "en" || body.my_lang === "bn" || body.my_lang === "hi") {
    const { error } = await auth.svc
      .from("profiles")
      .update({ preferred_lang: body.my_lang })
      .eq("id", auth.user.id);
    if (error)
      return NextResponse.json({
        ok: false,
        saved: "local",
        error: "Profile language could not be saved — run the Phase 5 SQL (profiles.preferred_lang) first. Your choice is still saved in this browser.",
      });
    return NextResponse.json({ ok: true, saved: "profile" });
  }
  if (body.site_default_lang === "en" || body.site_default_lang === "bn" || body.site_default_lang === "hi") {
    const { error } = await auth.svc
      .from("agency_site_settings")
      .upsert({ id: 1, default_lang: body.site_default_lang, updated_at: new Date().toISOString() }, { onConflict: "id" });
    if (error)
      return NextResponse.json({
        ok: false,
        saved: "none",
        error: "Site default language could not be saved — run the Phase 5 SQL (agency_site_settings) first.",
      });
    return NextResponse.json({ ok: true, saved: "site" });
  }
  return NextResponse.json({ error: "Invalid language." }, { status: 400 });
}
