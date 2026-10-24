/**
 * DigiPlyra agency News — data layer (Phase 5, LOCAL ONLY until the user
 * runs the Phase 5 SQL and says "push করো").
 *
 * Tables (see agency-news-sql-2026-10-24.sql, draft for review):
 *   agency_news_categories, agency_news_posts, agency_news_daily_plan,
 *   agency_site_settings (default_lang + hero/announcement).
 *
 * Honesty rules built into this layer:
 * - Public reads return ONLY status='published' posts whose published_at
 *   is not in the future. Drafts never leak to the public site, RSS or sitemap.
 * - If the tables do not exist yet (SQL not run), every read degrades to
 *   an empty result with tables_ready=false instead of throwing a 500.
 *   The public /news page then shows an honest "no articles yet" state.
 * - No sample/placeholder articles are ever injected here. A post exists
 *   only if an admin created it (admin UI) or the SQL seed categories ran
 *   (categories only, never articles).
 * - Daily-10 schedule: slots 1-8 = website/tech/business stories,
 *   slots 9-10 = DigiPlyra agency stories (is_agency_slot=true). Missed
 *   slots stay empty — no filler, no invented news, no copied article
 *   without a source link.
 */

import { createServiceClient } from "./supabase/server";
import type { NewsLang } from "./agency-news-shared";
export { DAILY_SLOTS, slugify, postUrl } from "./agency-news-shared";

export interface NewsCategory {
  id: string;
  slug: string;
  name_en: string;
  name_bn: string | null;
  name_hi: string | null;
  sort_order: number;
}

export interface NewsPost {
  id: string;
  slug: string;
  category_id: string | null;
  title_en: string;
  title_bn: string | null;
  title_hi: string | null;
  excerpt_en: string | null;
  excerpt_bn: string | null;
  excerpt_hi: string | null;
  body_en: string | null;
  body_bn: string | null;
  body_hi: string | null;
  cover_image_url: string | null;
  author_name: string;
  status: "draft" | "published";
  is_agency_post: boolean;
  published_at: string | null;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string | null;
  view_count: number;
  created_at: string;
  updated_at: string;
  category?: NewsCategory | null;
}

export interface DailyPlanSlot {
  id: string;
  plan_date: string;
  slot_index: number;
  post_id: string | null;
  planned_topic: string | null;
  is_agency_slot: boolean;
  status: "planned" | "drafted" | "published" | "skipped";
  post?: { id: string; slug: string; title_en: string; status: string } | null;
}

export function pickLang(
  post: NewsPost,
  field: "title" | "excerpt" | "body",
  lang: NewsLang,
): string {
  const en = post[`${field}_en` as const] ?? "";
  if (lang === "bn") return post[`${field}_bn` as const] ?? en;
  if (lang === "hi") return post[`${field}_hi` as const] ?? en;
  return en;
}

/** Public read: published posts only, newest first. Never throws. */
export async function fetchPublishedPosts(limit = 50): Promise<{ posts: NewsPost[]; tables_ready: boolean }> {
  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("agency_news_posts")
      .select("*, category:agency_news_categories(*)")
      .eq("status", "published")
      .lte("published_at", new Date().toISOString())
      .order("published_at", { ascending: false })
      .limit(limit);
    if (error) return { posts: [], tables_ready: false };
    return { posts: (data ?? []) as NewsPost[], tables_ready: true };
  } catch {
    return { posts: [], tables_ready: false };
  }
}

/** Public read: one published post by slug, or null. Never throws. */
export async function fetchPublishedPostBySlug(slug: string): Promise<NewsPost | null> {
  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("agency_news_posts")
      .select("*, category:agency_news_categories(*)")
      .eq("slug", slug)
      .eq("status", "published")
      .lte("published_at", new Date().toISOString())
      .single();
    if (error || !data) return null;
    return data as NewsPost;
  } catch {
    return null;
  }
}

export async function fetchCategories(): Promise<{ categories: NewsCategory[]; tables_ready: boolean }> {
  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("agency_news_categories")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) return { categories: [], tables_ready: false };
    return { categories: (data ?? []) as NewsCategory[], tables_ready: true };
  } catch {
    return { categories: [], tables_ready: false };
  }
}

/** Site default language for NEW visitors (admin-controlled). Defaults to "en". */
export async function fetchSiteDefaultLang(): Promise<NewsLang> {
  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("agency_site_settings")
      .select("default_lang")
      .eq("id", 1)
      .single();
    if (error || !data) return "en";
    const v = (data as { default_lang?: string }).default_lang;
    return v === "bn" || v === "hi" ? v : "en";
  } catch {
    return "en";
  }
}

export async function fetchDailyPlan(planDate: string): Promise<{ slots: DailyPlanSlot[]; tables_ready: boolean }> {
  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("agency_news_daily_plan")
      .select("*, post:agency_news_posts(id, slug, title_en, status)")
      .eq("plan_date", planDate)
      .order("slot_index", { ascending: true });
    if (error) return { slots: [], tables_ready: false };
    return { slots: (data ?? []) as DailyPlanSlot[], tables_ready: true };
  } catch {
    return { slots: [], tables_ready: false };
  }
}
