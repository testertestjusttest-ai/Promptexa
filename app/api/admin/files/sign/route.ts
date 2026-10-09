import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin";

// Direct browser → Supabase upload (bypasses Vercel's 4.5MB body limit).
// Real cap = your Supabase storage quota (1GB on the free plan).
export const MAX_BYTES = 2 * 1024 * 1024 * 1024; // 2GB per file

/**
 * POST /api/admin/files/sign
 * JSON: { product_id, file_name, file_size, mime_type? }
 * Returns a signed upload URL the browser PUTs the file to directly.
 */
export async function POST(req: Request) {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;

  try {
    const { product_id, file_name, file_size, mime_type } = (await req.json()) as {
      product_id: string;
      file_name: string;
      file_size: number;
      mime_type?: string;
    };

    if (!product_id || !file_name?.trim()) {
      return NextResponse.json({ error: "প্রোডাক্ট ও ফাইলের নাম দিন" }, { status: 400 });
    }
    if (!file_size || file_size <= 0) {
      return NextResponse.json({ error: "ফাইলের সাইজ পাওয়া যায়নি" }, { status: 400 });
    }
    if (file_size > MAX_BYTES) {
      return NextResponse.json({ error: "ফাইল ২GB-এর কম হতে হবে" }, { status: 400 });
    }

    const safeName = file_name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80);
    const path = `${product_id}/${Date.now()}-${safeName}`;

    const { data, error } = await auth.svc.storage
      .from("product-files")
      .createSignedUploadUrl(path);
    if (error || !data?.signedUrl) {
      return NextResponse.json(
        { error: "আপলোড URL তৈরি হয়নি: " + (error?.message ?? "") },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      signedUrl: data.signedUrl,
      path: data.path,
      token: data.token,
      mime_type: mime_type || "application/vnd.android.package-archive",
    });
  } catch (e) {
    console.error("sign error", e);
    return NextResponse.json({ error: "সার্ভার সমস্যা" }, { status: 500 });
  }
}
