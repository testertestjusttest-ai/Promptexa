import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin";
import { r2Ready, r2PutUrl } from "@/lib/r2";

// Direct browser → S3 storage upload (Backblaze B2 / Cloudflare R2).
// Bypasses Vercel's 4.5MB body limit AND Supabase free plan's 50MB/file wall.
export const MAX_R2_BYTES = 5 * 1024 * 1024 * 1024; // 5GB single PUT

/**
 * POST /api/admin/files/r2-sign
 * JSON: { product_id, file_name, file_size, mime_type? }
 * Returns a presigned R2 PUT URL the browser uploads to directly.
 */
export async function POST(req: Request) {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;

  if (!r2Ready()) {
    return NextResponse.json(
      {
        error:
          "স্টোরেজ সেটআপ হয়নি — Vercel → Environment Variables-এ S3_ENDPOINT, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_BUCKET দিন (Backblaze B2), তারপর Redeploy করুন।",
      },
      { status: 400 }
    );
  }

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
    if (file_size > MAX_R2_BYTES) {
      return NextResponse.json({ error: "ফাইল ৫GB-এর কম হতে হবে" }, { status: 400 });
    }

    const safeName = file_name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80);
    const key = `${product_id}/${Date.now()}-${safeName}`;
    const url = await r2PutUrl(
      key,
      mime_type || "application/vnd.android.package-archive"
    );

    return NextResponse.json({ ok: true, signedUrl: url, path: key, storage: "r2" });
  } catch (e) {
    console.error("r2-sign error", e);
    return NextResponse.json({ error: "সার্ভার সমস্যা" }, { status: 500 });
  }
}
