import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const fallbackImages = {
  portrait: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1400&q=85",
  product: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1400&q=85",
  fashion: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1400&q=85",
  landscape: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=85",
  food: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1400&q=85",
  creative: "https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&w=1400&q=85",
} as const;

function fallbackImage(prompt: string, type: string) {
  const lower = prompt.toLowerCase();
  if (/fashion|editorial|clothing|outfit|runway/.test(lower)) return fallbackImages.fashion;
  if (/portrait|person|face|people|human|model/.test(lower)) return fallbackImages.portrait;
  if (/food|cake|dessert|coffee|restaurant|dish/.test(lower)) return fallbackImages.food;
  if (/mountain|beach|forest|city|street|architecture|landscape/.test(lower)) return fallbackImages.landscape;
  if (/product|bottle|phone|car|watch|shoe|packaging|campaign/.test(lower)) return fallbackImages.product;
  return type.toLowerCase() === "image" ? fallbackImages.creative : fallbackImages.landscape;
}

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createSupabaseClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug") || "";
  const type = (searchParams.get("type") || "AI prompt").slice(0, 30);

  if (!slug) return new Response("Missing slug", { status: 400 });

  const supabase = await createClient();
  const { data: promptRow } = await supabase
    .from("prompts")
    .select("id,slug,title,prompt_text,prompt_type,preview_image_url,preview_image_status,preview_image_started_at")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  const prompt = promptRow?.prompt_text || searchParams.get("prompt") || searchParams.get("title") || "creative AI visual";

  if (promptRow?.preview_image_url && promptRow.preview_image_status === "ready") {
    return Response.redirect(promptRow.preview_image_url, 302);
  }

  const fallback = () => Response.redirect(fallbackImage(prompt, type), 302);
  const admin = adminClient();

  if (!admin || !process.env.OPENAI_API_KEY) return fallback();

  // Claim generation so repeated card renders do not create duplicate OpenAI jobs.
  if (promptRow) {
    const stale = promptRow.preview_image_status === "generating" &&
      promptRow.preview_image_started_at &&
      Date.now() - new Date(promptRow.preview_image_started_at).getTime() > 10 * 60 * 1000;

    if (stale) {
      await admin.from("prompts").update({ preview_image_status: "failed" }).eq("id", promptRow.id);
    }

    if (!stale && promptRow.preview_image_status === "generating") return fallback();

    const { data: claimed } = await admin
      .from("prompts")
      .update({
        preview_image_status: "generating",
        preview_image_started_at: new Date().toISOString(),
      })
      .eq("id", promptRow.id)
      .in("preview_image_status", ["pending", "failed"])
      .select("id")
      .maybeSingle();

    if (!claimed) return fallback();
  }

  const generationPrompt = [
    "Create a photorealistic, production-quality visual preview for this AI prompt.",
    "Depict the actual subject and scene described by the prompt with realistic materials, lighting, composition, camera perspective and depth.",
    "This is a visual reference, not a UI placeholder.",
    "Never create a placeholder, icon, illustration, geometric avatar, card, box, mockup, UI, diagram, logo, caption or text.",
    "Do not add a person or human figure unless the supplied prompt explicitly asks for one.",
    prompt,
  ].join("\n\n");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 55_000);

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

    if (!response.ok) throw new Error("OpenAI image generation failed");
    const json = await response.json() as { data?: Array<{ b64_json?: string }> };
    const b64 = json.data?.[0]?.b64_json;
    if (!b64) throw new Error("OpenAI returned no image");

    const bytes = Buffer.from(b64, "base64");
    const objectPath = `prompts/${promptRow?.id || encodeURIComponent(slug)}.webp`;
    const { error: uploadError } = await admin.storage
      .from("prompt-images")
      .upload(objectPath, bytes, {
        contentType: "image/webp",
        cacheControl: "31536000",
        upsert: true,
      });

    if (uploadError) throw uploadError;

    const { data: publicUrl } = admin.storage.from("prompt-images").getPublicUrl(objectPath);
    if (promptRow) {
      await admin.from("prompts").update({
        preview_image_url: publicUrl.publicUrl,
        preview_image_status: "ready",
        preview_image_generated_at: new Date().toISOString(),
        preview_image_started_at: null,
      }).eq("id", promptRow.id);
    }

    return Response.redirect(publicUrl.publicUrl, 302);
  } catch {
    if (promptRow) {
      await admin.from("prompts").update({
        preview_image_status: "failed",
        preview_image_started_at: null,
      }).eq("id", promptRow.id);
    }
    return fallback();
  } finally {
    clearTimeout(timeout);
  }
}
