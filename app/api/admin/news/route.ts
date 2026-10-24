import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin";
import { slugify, DAILY_SLOTS } from "@/lib/agency-news-shared";

/**
 * Admin News API (Phase 5). All routes admin-only via requireAdminApi.
 * If the agency_news_* tables do not exist yet (Phase 5 SQL not run),
 * reads return { ok: true, tables_ready: false, ...empty } and writes
 * return a clear 503-style message instead of a cryptic 500 — the admin
 * UI shows "run the Phase 5 SQL" in that case.
 *
 * Actions:
 *  GET  ?view=posts|categories|plan&date=YYYY-MM-DD
 *  POST { action: "post"|"category"|"plan", ...fields }
 *  PATCH { action: "post", id, ...fields } | { action: "plan", id, ...fields }
 *  DELETE ?type=post|category&id=...  (category delete only when unused)
 */

function tablesMissing(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error ?? "");
  return /relation .* does not exist|column .* does not exist|PGRST|42P01|42703/.test(msg);
}

export async function GET(req: Request) {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;
  const url = new URL(req.url);
  const view = url.searchParams.get("view") ?? "posts";
  try {
    if (view === "categories") {
      const { data, error } = await auth.svc
        .from("agency_news_categories")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) return NextResponse.json({ ok: true, tables_ready: false, categories: [] });
      return NextResponse.json({ ok: true, tables_ready: true, categories: data ?? [] });
    }
    if (view === "plan") {
      const date = url.searchParams.get("date") ?? new Date().toISOString().slice(0, 10);
      const { data, error } = await auth.svc
        .from("agency_news_daily_plan")
        .select("*, post:agency_news_posts(id, slug, title_en, status)")
        .eq("plan_date", date)
        .order("slot_index", { ascending: true });
      if (error) return NextResponse.json({ ok: true, tables_ready: false, slots: [], date });
      return NextResponse.json({ ok: true, tables_ready: true, slots: data ?? [], date });
    }
    const { data, error } = await auth.svc
      .from("agency_news_posts")
      .select("*, category:agency_news_categories(slug, name_en)")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) return NextResponse.json({ ok: true, tables_ready: false, posts: [] });
    return NextResponse.json({ ok: true, tables_ready: true, posts: data ?? [] });
  } catch {
    return NextResponse.json({ ok: true, tables_ready: false, posts: [], categories: [], slots: [] });
  }
}

export async function POST(req: Request) {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;
  const body = (await req.json()) as Record<string, unknown>;
  const action = body.action as string;

  if (action === "category") {
    const slug = slugify(String(body.slug ?? body.name_en ?? ""));
    const { data, error } = await auth.svc
      .from("agency_news_categories")
      .insert({
        slug,
        name_en: String(body.name_en ?? ""),
        name_bn: (body.name_bn as string) || null,
        name_hi: (body.name_hi as string) || null,
        sort_order: Number(body.sort_order ?? 0),
      })
      .select()
      .single();
    if (error)
      return NextResponse.json(
        { error: tablesMissing(error) ? "News tables not created yet — run the Phase 5 SQL first." : "Category could not be saved." },
        { status: tablesMissing(error) ? 503 : 400 },
      );
    return NextResponse.json({ ok: true, category: data });
  }

  if (action === "plan") {
    // Create the 10 slots for a date (idempotent per slot via unique constraint).
    const date = String(body.date ?? new Date().toISOString().slice(0, 10));
    const rows = DAILY_SLOTS.map((s) => ({
      plan_date: date,
      slot_index: s.index,
      planned_topic: (body as Record<string, string>)[`topic_${s.index}`] ?? null,
      is_agency_slot: s.agency,
      status: "planned",
    }));
    const { error } = await auth.svc
      .from("agency_news_daily_plan")
      .upsert(rows, { onConflict: "plan_date,slot_index", ignoreDuplicates: true });
    if (error)
      return NextResponse.json(
        { error: tablesMissing(error) ? "News tables not created yet — run the Phase 5 SQL first." : "Daily plan could not be created." },
        { status: tablesMissing(error) ? 503 : 400 },
      );
    return NextResponse.json({ ok: true });
  }

  // Default: create a post.
  const titleEn = String(body.title_en ?? "").trim();
  if (!titleEn) return NextResponse.json({ error: "English title is required." }, { status: 400 });
  const slug = slugify(String(body.slug ?? titleEn));
  const status = body.status === "published" ? "published" : "draft";
  const { data, error } = await auth.svc
    .from("agency_news_posts")
    .insert({
      slug,
      category_id: (body.category_id as string) || null,
      title_en: titleEn,
      title_bn: (body.title_bn as string) || null,
      title_hi: (body.title_hi as string) || null,
      excerpt_en: (body.excerpt_en as string) || null,
      excerpt_bn: (body.excerpt_bn as string) || null,
      excerpt_hi: (body.excerpt_hi as string) || null,
      body_en: (body.body_en as string) || null,
      body_bn: (body.body_bn as string) || null,
      body_hi: (body.body_hi as string) || null,
      cover_image_url: (body.cover_image_url as string) || null,
      author_name: String(body.author_name ?? "DigiPlyra"),
      status,
      is_agency_post: body.is_agency_post === true,
      published_at: status === "published" ? (body.published_at as string) || new Date().toISOString() : null,
      seo_title: (body.seo_title as string) || null,
      seo_description: (body.seo_description as string) || null,
      seo_keywords: (body.seo_keywords as string) || null,
    })
    .select()
    .single();
  if (error)
    return NextResponse.json(
      { error: tablesMissing(error) ? "News tables not created yet — run the Phase 5 SQL first." : "Post could not be saved." },
      { status: tablesMissing(error) ? 503 : 400 },
    );
  return NextResponse.json({ ok: true, post: data });
}

export async function PATCH(req: Request) {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;
  const body = (await req.json()) as Record<string, unknown>;
  if (body.action === "plan") {
    const patch: Record<string, unknown> = {};
    if (body.post_id !== undefined) patch.post_id = (body.post_id as string) || null;
    if (body.planned_topic !== undefined) patch.planned_topic = (body.planned_topic as string) || null;
    if (body.status !== undefined) patch.status = body.status;
    const { error } = await auth.svc.from("agency_news_daily_plan").update(patch).eq("id", String(body.id));
    if (error) return NextResponse.json({ error: "Plan slot could not be updated." }, { status: 400 });
    return NextResponse.json({ ok: true });
  }
  // Post update.
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const k of [
    "slug", "category_id", "title_en", "title_bn", "title_hi",
    "excerpt_en", "excerpt_bn", "excerpt_hi",
    "body_en", "body_bn", "body_hi", "cover_image_url", "author_name",
    "status", "is_agency_post", "published_at",
    "seo_title", "seo_description", "seo_keywords",
  ]) {
    if (body[k] !== undefined) patch[k] = body[k] === "" ? null : body[k];
  }
  if (patch.slug) patch.slug = slugify(String(patch.slug));
  if (patch.status === "published" && !patch.published_at) patch.published_at = new Date().toISOString();
  const { data, error } = await auth.svc
    .from("agency_news_posts")
    .update(patch)
    .eq("id", String(body.id))
    .select()
    .single();
  if (error) return NextResponse.json({ error: "Post could not be updated." }, { status: 400 });
  return NextResponse.json({ ok: true, post: data });
}

export async function DELETE(req: Request) {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;
  const url = new URL(req.url);
  const type = url.searchParams.get("type") ?? "post";
  const id = url.searchParams.get("id") ?? "";
  if (!id) return NextResponse.json({ error: "Missing id." }, { status: 400 });
  const table = type === "category" ? "agency_news_categories" : "agency_news_posts";
  const { error } = await auth.svc.from(table).delete().eq("id", id);
  if (error) return NextResponse.json({ error: "Could not be deleted (a category in use cannot be deleted)." }, { status: 400 });
  return NextResponse.json({ ok: true });
}
