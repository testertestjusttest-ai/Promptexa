import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function decodeCursor(value: string | null) {
  if (!value) return null;
  try {
    const decoded = JSON.parse(Buffer.from(value, "base64url").toString("utf8"));
    if (
      typeof decoded?.featured !== "boolean" ||
      typeof decoded?.created_at !== "string" ||
      typeof decoded?.id !== "number"
    ) return null;
    return decoded as { featured: boolean; created_at: string; id: number };
  } catch {
    return null;
  }
}

function encodeCursor(row: { featured?: boolean | null; created_at?: string | null; id: number }) {
  return Buffer.from(
    JSON.stringify({
      featured: Boolean(row.featured),
      created_at: row.created_at,
      id: row.id,
    }),
  ).toString("base64url");
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const type = searchParams.get("type") ?? "";
  const category = searchParams.get("category") ?? "";
  const model = searchParams.get("model") ?? "";
  const limit = Math.min(48, Math.max(1, Number(searchParams.get("limit") || 24)));
  const cursor = decodeCursor(searchParams.get("cursor"));

  const supabase = await createClient();
  let query = supabase
    .from("prompts")
    .select(
      "id,slug,title,excerpt,prompt_text,prompt_type,tags,preview_image_url,preview_image_status,featured,copy_count,save_count,created_at,categories!inner(name,slug),ai_models(name,slug)",
    )
    .eq("published", true)
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(limit + 1);

  if (q) {
    const safe = q.replace(/[,%()]/g, " ").replace(/\s+/g, " ").trim();
    if (safe) query = query.textSearch("search_document", safe, { type: "websearch" });
  }
  if (type) query = query.eq("prompt_type", type);
  if (category) query = query.eq("categories.slug", category);
  if (model) query = query.eq("ai_models.slug", model);

  if (cursor) {
    const timestamp = cursor.created_at.replace(/,/g, "");
    query = query.or(
      `featured.lt.${cursor.featured},and(featured.eq.${cursor.featured},created_at.lt.${timestamp}),and(featured.eq.${cursor.featured},created_at.eq.${timestamp},id.lt.${cursor.id})`,
    );
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rows = data ?? [];
  const hasMore = rows.length > limit;
  const pageRows = hasMore ? rows.slice(0, limit) : rows;
  const last = pageRows[pageRows.length - 1] as any;

  return NextResponse.json({
    data: pageRows,
    count: pageRows.length,
    hasMore,
    nextCursor: hasMore && last ? encodeCursor(last) : null,
  }, {
    headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=300" },
  });
}
