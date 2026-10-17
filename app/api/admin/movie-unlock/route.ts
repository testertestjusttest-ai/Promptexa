import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin";

/** GET /api/admin/movie-unlock — unlock gate config */
export async function GET() {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;
  const { data } = await auth.svc
    .from("site_settings")
    .select("value")
    .eq("key", "movie_unlock")
    .single();
  const v = (data?.value ?? {}) as { ad_count?: unknown; ad_links?: unknown };
  return NextResponse.json({
    ok: true,
    ad_count: v.ad_count ?? 10,
    ad_links: Array.isArray(v.ad_links) ? v.ad_links : [],
  });
}

/** PUT /api/admin/movie-unlock — { ad_count (1-20), ad_links (string[]) } */
export async function PUT(req: Request) {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;
  const b = await req.json();
  const n = Math.floor(Number(b.ad_count));
  const ad_count = Number.isFinite(n) ? Math.min(20, Math.max(1, n)) : 10;
  const ad_links = Array.isArray(b.ad_links)
    ? (b.ad_links as unknown[])
        .filter((u): u is string => typeof u === "string" && /^https?:\/\//i.test(u.trim()))
        .map((u) => u.trim())
        .slice(0, 20)
    : [];
  const { error } = await auth.svc.from("site_settings").upsert(
    { key: "movie_unlock", value: { ad_count, ad_links } },
    { onConflict: "key" }
  );
  if (error) return NextResponse.json({ error: "সেভ হয়নি" }, { status: 400 });
  return NextResponse.json({ ok: true, ad_count, ad_links });
}
