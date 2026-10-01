import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

type PromptRow = {
  id: number;
  slug: string;
  title: string;
  prompt_text: string;
  prompt_type: string;
};

const fallbackImages = {
  portrait: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1400&q=85",
  product: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1400&q=85",
  fashion: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1400&q=85",
  landscape: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=85",
  food: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1400&q=85",
  creative: "https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&w=1400&q=85",
} as const;

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createSupabaseClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function fallbackImage(prompt: string, type: string) {
  const lower = prompt.toLowerCase();
  if (/fashion|editorial|clothing|outfit|runway/.test(lower)) return fallbackImages.fashion;
  if (/portrait|person|face|people|human|model/.test(lower)) return fallbackImages.portrait;
  if (/food|cake|dessert|coffee|restaurant|dish/.test(lower)) return fallbackImages.food;
  if (/mountain|beach|forest|city|street|architecture|landscape/.test(lower)) return fallbackImages.landscape;
  if (/product|bottle|phone|car|watch|shoe|packaging|campaign/.test(lower)) return fallbackImages.product;
  return type.toLowerCase() === "image" ? fallbackImages.creative : fallbackImages.landscape;
}

async function generateAndStore(admin: ReturnType<typeof adminClient>, row: PromptRow) {
  if (!admin || !process.env.OPENAI_API_KEY) throw new Error("Image generation environment is not configured");

  const generationPrompt = [
    "Create a photorealistic, production-quality visual preview for this AI prompt.",
    "Depict the actual subject and scene described by the prompt with realistic materials, lighting, composition, camera perspective and depth.",
    "This is a visual reference, not a UI placeholder.",
    "Never create a placeholder, icon, illustration, geometric avatar, card, box, mockup, UI, diagram, logo, caption or text.",
    "Do not add a person or human figure unless the supplied prompt explicitly asks for one.",
    row.prompt_text,
  ].join("\n\n");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 50_000);

  try {
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: process.env.PROMPTEXA_IMAGE_MODEL || "gpt-image-2",
        prompt: generationPrompt,
        size: process.env.PROMPTEXA_IMAGE_SIZE || "1024x1024",
        quality: process.env.PROMPTEXA_IMAGE_QUALITY || "low",
        output_format: "webp",
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI image generation failed: ${response.status}`);
    }

    const json = await response.json() as { data?: Array<{ b64_json?: string }> };
    const b64 = json.data?.[0]?.b64_json;
    if (!b64) throw new Error("OpenAI returned no image");

    const bytes = Buffer.from(b64, "base64");
    const objectPath = `prompts/${row.id}.webp`;

    const { error: uploadError } = await admin.storage
      .from("prompt-images")
      .upload(objectPath, bytes, {
        contentType: "image/webp",
        cacheControl: "31536000",
        upsert: true,
      });

    if (uploadError) throw uploadError;

    const { data: publicUrl } = admin.storage
      .from("prompt-images")
      .getPublicUrl(objectPath);

    const { error: updateError } = await admin
      .from("prompts")
      .update({
        preview_image_url: publicUrl.publicUrl,
        preview_image_status: "ready",
        preview_image_generated_at: new Date().toISOString(),
        preview_image_started_at: null,
      })
      .eq("id", row.id);

    if (updateError) throw updateError;

    return { id: row.id, slug: row.slug, status: "ready" as const, url: publicUrl.publicUrl };
  } catch (error) {
    await admin.from("prompts").update({
      preview_image_status: "failed",
      preview_image_started_at: null,
    }).eq("id", row.id);

    return {
      id: row.id,
      slug: row.slug,
      status: "failed" as const,
      error: error instanceof Error ? error.message : "Unknown generation error",
      fallback: fallbackImage(row.prompt_text, row.prompt_type),
    };
  } finally {
    clearTimeout(timeout);
  }
}

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = adminClient();
  if (!admin || !process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "Image generation environment is not configured" }, { status: 503 });
  }

  const requestedBatch = Number(process.env.PROMPTEXA_IMAGE_BATCH_SIZE || 3);
  const batchSize = Math.min(4, Math.max(1, Number.isFinite(requestedBatch) ? Math.floor(requestedBatch) : 3));

  // Recover jobs that were interrupted before completion.
  await admin
    .from("prompts")
    .update({ preview_image_status: "failed", preview_image_started_at: null })
    .eq("preview_image_status", "generating")
    .lt("preview_image_started_at", new Date(Date.now() - 10 * 60 * 1000).toISOString());

  const { data: candidates, error: selectError } = await admin
    .from("prompts")
    .select("id,slug,title,prompt_text,prompt_type")
    .eq("published", true)
    .in("preview_image_status", ["pending", "failed"])
    .order("id", { ascending: true })
    .limit(batchSize);

  if (selectError) {
    return NextResponse.json({ error: selectError.message }, { status: 500 });
  }

  const rows = (candidates || []) as PromptRow[];
  if (!rows.length) {
    const { count } = await admin
      .from("prompts")
      .select("id", { count: "exact", head: true })
      .eq("published", true)
      .eq("preview_image_status", "ready");

    return NextResponse.json({
      ok: true,
      processed: 0,
      ready: count || 0,
      message: "No pending prompt images remain.",
    });
  }

  // Claim each row first. Only successfully claimed rows are sent to OpenAI.
  const claimed: PromptRow[] = [];
  const startedAt = new Date().toISOString();

  for (const row of rows) {
    const { data } = await admin
      .from("prompts")
      .update({
        preview_image_status: "generating",
        preview_image_started_at: startedAt,
      })
      .eq("id", row.id)
      .in("preview_image_status", ["pending", "failed"])
      .select("id")
      .maybeSingle();

    if (data) claimed.push(row);
  }

  const results = await Promise.all(claimed.map((row) => generateAndStore(admin, row)));
  const ready = results.filter((result) => result.status === "ready").length;
  const failed = results.length - ready;

  return NextResponse.json({
    ok: true,
    requested: batchSize,
    claimed: claimed.length,
    processed: results.length,
    ready,
    failed,
    results,
  });
}
