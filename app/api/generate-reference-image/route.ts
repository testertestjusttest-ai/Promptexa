import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

async function getPrompt(slug: string) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) return "";
  const supabase = await createClient();
  const { data } = await supabase
    .from("prompts")
    .select("prompt_text,preview_image_url,title")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  return data || { prompt_text: "", preview_image_url: "", title: "" };
}

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) return Response.json({ error: "Image generation is not configured yet." }, { status: 503 });

  const form = await request.formData();
  const slug = String(form.get("slug") || "");
  const file = form.get("image");
  if (!(file instanceof File)) return Response.json({ error: "Please upload a reference image." }, { status: 400 });
  if (!file.type.startsWith("image/")) return Response.json({ error: "The reference file must be an image." }, { status: 400 });
  if (file.size > 8 * 1024 * 1024) return Response.json({ error: "Please use an image smaller than 8 MB." }, { status: 400 });

  const promptRow = await getPrompt(slug);
  const prompt = promptRow.prompt_text || String(form.get("prompt") || "");
  if (!prompt) return Response.json({ error: "Prompt not found." }, { status: 404 });

  const editPrompt = [
    "EDIT THE USER'S UPLOADED PHOTO. Do not generate a replacement person from scratch.",
    "Use the uploaded user photo as the identity/source image and preserve the same person's recognizable identity, facial structure, proportions, skin details and distinctive features.",
    "Use the prompt preview image, when supplied, as the visual style/composition reference. Recreate its camera angle, framing, lighting, environment, styling, materials, color palette and mood around the user's photo.",
    "Do not copy a different person's face from the preview image. The uploaded user's identity always wins.",
    "Do not add unrelated people, UI, captions, watermarks or logos unless the prompt explicitly requests them.",
    prompt,
  ].join("\n\n");

  const body = new FormData();
  body.append("model", process.env.PROMPTEXA_REFERENCE_MODEL || "gpt-image-1");
  body.append("image[]", file, file.name || "reference.png");

  if (promptRow.preview_image_url) {
    try {
      const previewResponse = await fetch(promptRow.preview_image_url, { cache: "no-store" });
      if (previewResponse.ok) {
        const previewBuffer = await previewResponse.arrayBuffer();
        const previewType = previewResponse.headers.get("content-type") || "image/webp";
        body.append(
          "image[]",
          new File([previewBuffer], "prompt-preview.webp", { type: previewType }),
          "prompt-preview.webp",
        );
      }
    } catch {}
  }
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
