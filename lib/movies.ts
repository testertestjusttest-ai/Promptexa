import { createClient, createServiceClient } from "@/lib/supabase/server";

export type MovieLink = { label: string; url: string };

export type Movie = {
  id: string;
  title: string;
  slug: string;
  poster_url: string | null;
  description: string | null;
  year: number | null;
  genre: string | null;
  video_url: string | null;
  download_url: string | null;
  quality: string | null;
  watch_links: MovieLink[];
  download_links: MovieLink[];
  is_active: boolean;
  is_featured: boolean;
  views: number;
  sort: number;
  created_at: string;
};

/** Public: active movies, featured first. */
export async function getMovies(): Promise<Movie[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("movies")
      .select("*")
      .eq("is_active", true)
      .order("is_featured", { ascending: false })
      .order("sort")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as Movie[];
  } catch {
    return [];
  }
}

/** Public: one active movie by slug. */
export async function getMovieBySlug(slug: string): Promise<Movie | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("movies")
      .select("*")
      .eq("slug", slug)
      .eq("is_active", true)
      .single();
    if (error || !data) return null;
    return data as Movie;
  } catch {
    return null;
  }
}

/** Best-effort view counter (non-blocking). */
export async function bumpMovieViews(id: string): Promise<void> {
  try {
    const svc = createServiceClient();
    const { data } = await svc.from("movies").select("views").eq("id", id).single();
    const v = Number((data as { views?: number } | null)?.views) || 0;
    await svc.from("movies").update({ views: v + 1 }).eq("id", id);
  } catch {
    /* non-critical */
  }
}

/** Direct video file (mp4/webm/ogg/m3u8) → <video>, otherwise <iframe> embed. */
export function isDirectVideo(url: string): boolean {
  return /\.(mp4|webm|ogg|m3u8)(\?|#|$)/i.test(url || "");
}

/** Normalize a stored link array: [{label,url}], http(s) only, max 8. */
export function cleanMovieLinks(v: unknown): MovieLink[] {
  if (!Array.isArray(v)) return [];
  return v
    .slice(0, 8)
    .map((x) => ({
      label: String((x as { label?: unknown })?.label || "").trim().slice(0, 40) || "লিংক",
      url: String((x as { url?: unknown })?.url || "").trim().slice(0, 2000),
    }))
    .filter((x) => /^https?:\/\//i.test(x.url));
}

export type MovieUnlockSettings = { ad_count: number; ad_links: string[] };

/** Public: unlock gate config (ad count + admin's direct ad links). */
export async function getMovieUnlockSettings(): Promise<MovieUnlockSettings> {
  const def: MovieUnlockSettings = { ad_count: 10, ad_links: [] };
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "movie_unlock")
      .single();
    const v = (data?.value ?? {}) as { ad_count?: unknown; ad_links?: unknown };
    const n = Math.floor(Number(v.ad_count));
    const ad_count = Number.isFinite(n) ? Math.min(20, Math.max(1, n)) : 10;
    const ad_links = Array.isArray(v.ad_links)
      ? (v.ad_links as unknown[])
          .filter((u): u is string => typeof u === "string" && /^https?:\/\//i.test(u.trim()))
          .map((u) => u.trim())
          .slice(0, 20)
      : [];
    return { ad_count, ad_links };
  } catch {
    return def;
  }
}
