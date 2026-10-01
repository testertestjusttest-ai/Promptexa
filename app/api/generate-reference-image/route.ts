import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

async function getPrompt(slug: string) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) return "";
  const supabase = await createClient();
  const { data } = await supabase.from("prompts").select("prompt_text").eq("slug", slug).eq("published", true).maybeSingle();
  return data?.prompt_text || "";
}

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) return Response.json({ error: "Image generation is not configured yet." }, { status: 503 });

  const form = await request.formData();
  const slug = String(form.get("slug") || "");
  const file = form.get("image");
  if (!(file instanceof File)) return Response.json({ error: "Please upload a reference image." }, { status: 400 });
  if (!file.type.startsWith("image/")) return Response.json({ error: "The reference file must be an image." }, { status: 400 });
  if (file.size > 8 * 1024 * 1024) return Response.json({ error: "Please use an image smaller than 8 MB." }, { status: 400 });

  const prompt = (await getPrompt(slug)) || String(form.get("prompt") || "");
  if (!prompt) return Response.json({ error: "Prompt not found." }, { status: 404 });

  const editPrompt = [
    "Create a new image that follows the visual direction of the supplied AI prompt.",
    "Use the uploaded image as the reference for the person or main subject when applicable.",
    "Preserve the same person's recognizable identity, facial structure, proportions and distinctive facial features when a person is present.",
    "Keep the reference person's identity; do not replace, redesign, beautify, age, de-age or otherwise change the face.",
    "Match the composition, camera perspective, lighting, environment, styling, materials, color palette and mood described by the prompt so the result follows the same visual recipe as the prompt preview.",
    "Do not add UI, captions, watermarks or unrelated objects unless explicitly requested by the prompt.",
    prompt,
  ].join("\n\n");

  const body = new FormData();
  body.append("model", process.env.PROMPTEXA_REFERENCE_MODEL || "gpt-image-1");
  body.append("image", file, file.name || "reference.png");
  body.append("prompt", editPrompt);
  body.append("input_fidelity", "high");
  body.append("size", process.env.PROMPTEXA_IMAGE_SIZE || "1024x1024");
  body.append("quality", process.env.PROMPTEXA_IMAGE_QUALITY || "low");
  body.append("output_format", "webp");

  const response = await fetch("https://api.openai.com/v1/images/edits", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    body,
  });

  if (!response.ok) {
    const message = await response.text();
    return Response.json({ error: message.slice(0, 800) }, { status: 502 });
  }

  const json = await response.json() as { data?: Array<{ b64_json?: string }> };
  const b64 = json.data?.[0]?.b64_json;
  if (!b64) return Response.json({ error: "Image provider returned no image." }, { status: 502 });

  return new Response(Buffer.from(b64, "base64"), {
    headers: { "Content-Type": "image/webp", "Cache-Control": "private, no-store" },
  });
}
