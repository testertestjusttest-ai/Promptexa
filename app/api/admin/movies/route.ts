import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin";
import { cleanMovieLinks } from "@/lib/movies";

function cleanSlug(raw: string, fallback: string): string {
  const s = (raw || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return s || fallback;
}

/** GET /api/admin/movies — all movies (incl. inactive) */
export async function GET() {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;
  const { data, error } = await auth.svc
    .from("movies")
    .select("*")
    .order("sort")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: "লোড হয়নি" }, { status: 500 });
  return NextResponse.json({ ok: true, movies: data });
}

/** POST — create movie */
export async function POST(req: Request) {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;
  const b = await req.json();
  if (!String(b.title || "").trim())
    return NextResponse.json({ error: "মুভির নাম দিন" }, { status: 400 });
  const fallback = `movie-${Date.now().toString(36)}`;
  const { data, error } = await auth.svc
    .from("movies")
    .insert({
      title: String(b.title).trim().slice(0, 200),
      slug: cleanSlug(String(b.slug || b.title || ""), fallback),
      poster_url: String(b.poster_url || "").trim() || null,
      description: String(b.description || "").trim().slice(0, 2000) || null,
      year: b.year ? Math.floor(Number(b.year)) : null,
      genre: String(b.genre || "").trim().slice(0, 80) || null,
      video_url: String(b.video_url || "").trim() || null,
      download_url: String(b.download_url || "").trim() || null,
      quality: String(b.quality || "").trim().slice(0, 20) || null,
      watch_links: cleanMovieLinks(b.watch_links),
      download_links: cleanMovieLinks(b.download_links),
      is_active: b.is_active !== false,
      is_featured: !!b.is_featured,
      sort: Math.floor(Number(b.sort)) || 0,
    })
    .select("id")
    .single();
  if (error) {
    const dup = (error as { code?: string }).code === "23505";
    return NextResponse.json(
      { error: dup ? "এই স্লাগে আরেকটা মুভি আছে" : "তৈরি হয়নি" },
      { status: 400 }
    );
  }
  return NextResponse.json({ ok: true, id: data.id });
}

/** PATCH — update movie */
export async function PATCH(req: Request) {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;
  const b = await req.json();
  if (!b.id) return NextResponse.json({ error: "id দিন" }, { status: 400 });
  const patch: Record<string, unknown> = {};
  if (b.title !== undefined) patch.title = String(b.title).trim().slice(0, 200);
  if (b.slug !== undefined)
    patch.slug = cleanSlug(String(b.slug), `movie-${String(b.id).slice(0, 8)}`);
  if (b.poster_url !== undefined) patch.poster_url = String(b.poster_url).trim() || null;
  if (b.description !== undefined)
    patch.description = String(b.description).trim().slice(0, 2000) || null;
  if (b.year !== undefined) patch.year = b.year ? Math.floor(Number(b.year)) : null;
  if (b.genre !== undefined) patch.genre = String(b.genre).trim().slice(0, 80) || null;
  if (b.video_url !== undefined) patch.video_url = String(b.video_url).trim() || null;
  if (b.download_url !== undefined)
    patch.download_url = String(b.download_url).trim() || null;
  if (b.quality !== undefined)
    patch.quality = String(b.quality).trim().slice(0, 20) || null;
  if (b.watch_links !== undefined) patch.watch_links = cleanMovieLinks(b.watch_links);
  if (b.download_links !== undefined)
    patch.download_links = cleanMovieLinks(b.download_links);
  if (b.is_active !== undefined) patch.is_active = !!b.is_active;
  if (b.is_featured !== undefined) patch.is_featured = !!b.is_featured;
  if (b.sort !== undefined) patch.sort = Math.floor(Number(b.sort)) || 0;
  if (Object.keys(patch).length === 0)
    return NextResponse.json({ error: "বদলানোর কিছু নেই" }, { status: 400 });
  const { error } = await auth.svc.from("movies").update(patch).eq("id", b.id);
  if (error) return NextResponse.json({ error: "আপডেট হয়নি" }, { status: 400 });
  return NextResponse.json({ ok: true });
}

/** DELETE /api/admin/movies?id= */
export async function DELETE(req: Request) {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id দিন" }, { status: 400 });
  const { error } = await auth.svc.from("movies").delete().eq("id", id);
  if (error) return NextResponse.json({ error: "মোছা যায়নি" }, { status: 400 });
  return NextResponse.json({ ok: true });
}
