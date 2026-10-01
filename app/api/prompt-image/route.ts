import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function escapeXml(value: string) {
  return value.replace(/[<>&'"]/g, (char) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[char] || char));
}

function fallbackSvg(title: string, type: string, model: string, prompt: string) {
  const lower = prompt.toLowerCase();
  const isPortrait = /portrait|person|model|face|fashion|editorial/.test(lower);
  const isFood = /food|cake|dessert|coffee|restaurant|dish/.test(lower);
  const isLandscape = /landscape|mountain|beach|forest|city|street|architecture/.test(lower);
  const isProduct = /product|bottle|phone|car|watch|shoe|packaging|campaign/.test(lower);
  const shape = isPortrait
    ? '<circle cx="600" cy="310" r="105" fill="#c8c1b8"/><path d="M390 690c20-175 110-245 210-245s190 70 210 245z" fill="#272522"/>'
    : isFood
    ? '<ellipse cx="600" cy="515" rx="250" ry="92" fill="#312d29"/><circle cx="600" cy="455" r="125" fill="#d0c2ad"/><circle cx="600" cy="420" r="82" fill="#8c6d54"/>'
    : isLandscape
    ? '<path d="M0 590 290 360 470 520 690 270 1200 690V800H0Z" fill="#4b514d"/><circle cx="850" cy="180" r="70" fill="#eee9df"/>'
    : isProduct
    ? '<rect x="430" y="255" width="340" height="360" rx="55" fill="#242321"/><rect x="475" y="300" width="250" height="260" rx="30" fill="#777168"/>'
    : '<rect x="400" y="300" width="400" height="250" rx="40" fill="#2c2a28"/><circle cx="600" cy="425" r="85" fill="#aaa39a"/>';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
    <defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#eeeae3"/><stop offset=".55" stop-color="#bbb5ab"/><stop offset="1" stop-color="#66615c"/></linearGradient><radialGradient id="light"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient><filter id="shadow"><feGaussianBlur stdDeviation="22"/></filter></defs>
    <rect width="1200" height="800" fill="url(#bg)"/><rect width="1200" height="800" fill="url(#light)"/><ellipse cx="600" cy="665" rx="330" ry="55" fill="#111" opacity=".25" filter="url(#shadow)"/>${shape}
    <text x="64" y="82" fill="#111" font-family="Arial,sans-serif" font-size="24" font-weight="700" letter-spacing="5">PROMPTEXA</text>
    <text x="64" y="690" fill="#111" font-family="Arial,sans-serif" font-size="20" font-weight="700" letter-spacing="3">${escapeXml(type)} · ${escapeXml(model)}</text>
    <text x="64" y="735" fill="#111" font-family="Arial,sans-serif" font-size="32" font-weight="800">${escapeXml(title)}</text>
  </svg>`;
}

async function getPrompt(slug: string) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) return "";
  const supabase = await createClient();
  const { data } = await supabase.from("prompts").select("prompt_text").eq("slug", slug).eq("published", true).maybeSingle();
  return data?.prompt_text || "";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug") || "";
  const title = (searchParams.get("title") || "Promptexa").slice(0, 120);
  const type = (searchParams.get("type") || "AI prompt").slice(0, 30);
  const model = (searchParams.get("model") || "AI").slice(0, 40);
  const prompt = (await getPrompt(slug)) || searchParams.get("prompt") || title;

  if (!process.env.OPENAI_API_KEY) {
    const svg = fallbackSvg(title, type, model, prompt);
    return new Response(svg, {
      headers: {
        "Content-Type": "image/svg+xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  }

  const generationPrompt = [
    "Create the actual visual preview for this AI prompt.",
    "The image must faithfully depict the prompt's subject, setting, composition, camera perspective, lighting, materials, color palette, mood and visual style.",
    "Do not make an abstract placeholder. Do not add UI, labels, captions, logos or text unless the prompt itself explicitly requests them.",
    "This is a reference preview for a prompt library, so make the result visually specific and immediately useful as a target for a creator.",
    prompt,
  ].join("\n\n");

  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.PROMPTEXA_IMAGE_MODEL || "gpt-image-2",
      prompt: generationPrompt,
      size: process.env.PROMPTEXA_IMAGE_SIZE || "1024x1024",
      quality: process.env.PROMPTEXA_IMAGE_QUALITY || "low",
      output_format: "webp",
    }),
  });

  if (!response.ok) {
    const message = await response.text();
    return new Response(message.slice(0, 800), { status: 502 });
  }

  const json = await response.json() as { data?: Array<{ b64_json?: string }> };
  const b64 = json.data?.[0]?.b64_json;
  if (!b64) return new Response("Image provider returned no image.", { status: 502 });

  return new Response(Buffer.from(b64, "base64"), {
    headers: {
      "Content-Type": "image/webp",
      "Cache-Control": "public, max-age=31536000, s-maxage=31536000, stale-while-revalidate=86400, immutable",
    },
  });
}
