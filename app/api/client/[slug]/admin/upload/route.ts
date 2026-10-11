import { NextResponse } from "next/server";
import { requireClientAdmin } from "../_auth";

export const dynamic = "force-dynamic";

/**
 * POST /api/client/{slug}/admin/upload — upload an image for products/sliders.
 * FormData: { file: File }
 * Returns: { url }
 * Uses the public product-images bucket under clients/{slug}/ prefix.
 */
export async function POST(req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const auth = await requireClientAdmin(req, slug);
  if (auth.error) return auth.error;

  const form = await req.formData().catch(() => null);
  const file = form?.get("file") as File | null;
  if (!file || file.size === 0) {
    return NextResponse.json({ error: "ফাইল দিন" }, { status: 400 });
  }
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "৫MB এর কম ছবি দিন" }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "শুধু ছবি আপলোড করুন" }, { status: 400 });
  }

  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().slice(0, 4);
  const key = `clients/${slug}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error } = await auth.svc.storage
    .from("product-images")
    .upload(key, file, { contentType: file.type, upsert: false });

  if (error) {
    return NextResponse.json({ error: "আপলোড হয়নি — আবার চেষ্টা করুন" }, { status: 500 });
  }

  const { data } = auth.svc.storage.from("product-images").getPublicUrl(key);
  return NextResponse.json({ ok: true, url: data.publicUrl });
}
