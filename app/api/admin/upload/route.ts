import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin";

const MAX_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];

/**
 * POST /api/admin/upload — admin image upload to Supabase Storage
 * FormData: file (image), folder? (default "products")
 * Returns { ok, url }
 */
export async function POST(req: Request) {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;
  const { svc } = auth;

  try {
    const fd = await req.formData();
    const file = fd.get("file") as File | null;
    const folder = String(fd.get("folder") || "products").replace(/[^a-z0-9-]/gi, "");

    if (!file || file.size === 0) {
      return NextResponse.json({ error: "ফাইল দিন" }, { status: 400 });
    }
    if (!ALLOWED.includes(file.type)) {
      return NextResponse.json({ error: "শুধু JPG/PNG/WebP/GIF ছবি" }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "ছবি ৫MB-এর কম হতে হবে" }, { status: 400 });
    }

    const ext = file.type.split("/")[1] || "png";
    const name = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const buf = Buffer.from(await file.arrayBuffer());

    const { error } = await svc.storage
      .from("product-images")
      .upload(name, buf, { contentType: file.type, upsert: false });
    if (error) {
      return NextResponse.json({ error: "আপলোড হয়নি: " + error.message }, { status: 500 });
    }

    const { data } = svc.storage.from("product-images").getPublicUrl(name);
    return NextResponse.json({ ok: true, url: data.publicUrl });
  } catch (e) {
    console.error("upload error", e);
    return NextResponse.json({ error: "সার্ভার সমস্যা" }, { status: 500 });
  }
}
