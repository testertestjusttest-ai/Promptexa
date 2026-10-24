import { JW_IMG_DATA } from "../data";

/** Serves the AURELIA jewelry demo photos embedded as base64 in data.ts. */
export async function GET(_req: Request, ctx: { params: Promise<{ name: string }> }) {
  const { name } = await ctx.params;
  const b64 = JW_IMG_DATA[name];
  if (!b64) return new Response("Not found", { status: 404 });
  const bytes = Buffer.from(b64, "base64");
  return new Response(new Uint8Array(bytes), {
    headers: {
      "Content-Type": "image/webp",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
