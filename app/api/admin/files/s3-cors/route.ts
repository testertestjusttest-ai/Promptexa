import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin";
import { r2Ready, s3EnsureCors } from "@/lib/r2";

/**
 * POST /api/admin/files/s3-cors
 * One-time setup: applies browser-upload CORS rules to the S3 bucket
 * (Backblaze B2 / Cloudflare R2). Admin only.
 * JSON: { origin? } — defaults to the request's Origin header.
 */
export async function POST(req: Request) {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;
  if (!r2Ready()) {
    return NextResponse.json(
      { error: "স্টোরেজ সেটআপ হয়নি — Vercel-এ S3_* env vars দিন, তারপর Redeploy করুন।" },
      { status: 400 }
    );
  }
  try {
    const body = (await req.json().catch(() => ({}))) as { origin?: string };
    const origin =
      body.origin?.trim() ||
      req.headers.get("origin") ||
      "https://promptexa.vercel.app";
    await s3EnsureCors(origin);
    return NextResponse.json({ ok: true, origin });
  } catch (e) {
    console.error("s3-cors error", e);
    const name = (e as { name?: string })?.name || "";
    const msg = e instanceof Error ? e.message : "অজানা সমস্যা";
    // Surface the real storage error (no secrets in AWS error messages)
    return NextResponse.json(
      { error: `CORS সেট হয়নি [${name}]: ${msg}`.slice(0, 220) },
      { status: 500 }
    );
  }
}
