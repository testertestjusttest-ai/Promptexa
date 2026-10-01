import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

async function getPrompt(slug: string) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) return "";
  const supabase = await createClient();
  const { data } = await supabase
    .from("prompts")
    .select("prompt_text")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  return data?.prompt_text || "";
}

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

function redirectToFallback(prompt: string, type: string) {
  return Response.redirect(fallbackImage(prompt, type), 302);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug") || "";
  const type = (searchParams.get("type") || "AI prompt").slice(0, 30);
  const prompt = (await getPrompt(slug)) || searchParams.get("prompt") || searchParams.get("title") || "creative AI visual";

  if (!process.env.OPENAI_API_KEY) {
    return redirectToFallback(prompt, type);
  }

  const generationPrompt = [
    "Create a photorealistic, production-quality visual preview for this AI prompt.",
    "Depict the actual subject and scene described by the prompt with realistic materials, lighting, composition, camera perspective and depth.",
    "Do not create a placeholder, icon, illustration, geometric avatar, card, box, mockup, UI, diagram, logo, caption or text.",
    "Do not add a person or human figure unless the supplied prompt explicitly asks for a person, portrait, model, face or human subject.",
    "The output must look like a finished image a creator could use as a visual reference.",
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

    if (!response.ok) return redirectToFallback(prompt, type);

    const json = await response.json() as { data?: Array<{ b64_json?: string }> };
    const b64 = json.data?.[0]?.b64_json;
    if (!b64) return redirectToFallback(prompt, type);

    return new Response(Buffer.from(b64, "base64"), {
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "public, max-age=31536000, s-maxage=31536000, stale-while-revalidate=86400, immutable",
        "X-Promptexa-Image-Source": "openai-gpt-image-2",
      },
    });
  } catch {
    return redirectToFallback(prompt, type);
  } finally {
    clearTimeout(timeout);
  }
}
