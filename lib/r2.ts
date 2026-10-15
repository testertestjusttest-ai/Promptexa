// lib/r2.ts — Cloudflare R2 via S3-compatible API (SERVER ONLY — never import in client components)
// Used for large product files (APK etc.) that exceed Supabase free plan's 50MB/file wall.
// Flow: admin browser PUTs directly to a presigned URL (bypasses Vercel 4.5MB body limit),
// customers download via a 2-minute presigned GET after their one-time token is consumed.

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

type R2Cfg = {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
};

function cfg(): R2Cfg | null {
  const accountId = process.env.R2_ACCOUNT_ID || "";
  const accessKeyId = process.env.R2_ACCESS_KEY_ID || "";
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || "";
  const bucket = process.env.R2_BUCKET || "";
  if (!accountId || !accessKeyId || !secretAccessKey || !bucket) return null;
  return { accountId, accessKeyId, secretAccessKey, bucket };
}

export function r2Ready(): boolean {
  return cfg() !== null;
}

function client(): { s3: S3Client; bucket: string } {
  const c = cfg();
  if (!c) throw new Error("R2 env vars missing");
  const s3 = new S3Client({
    region: "auto",
    endpoint: `https://${c.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: c.accessKeyId,
      secretAccessKey: c.secretAccessKey,
    },
    // R2 works with path-style or virtual-hosted; virtual-hosted is default and fine.
  });
  return { s3, bucket: c.bucket };
}

/** Presigned PUT URL — the browser uploads the file bytes straight to R2. Single PUT up to 5GB. */
export async function r2PutUrl(
  key: string,
  contentType: string,
  expiresSec = 3600
): Promise<string> {
  const { s3, bucket } = client();
  return getSignedUrl(
    s3,
    new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType }),
    { expiresIn: expiresSec }
  );
}

/** Presigned GET URL for customer download — 2 minutes, forces attachment download. */
export async function r2GetUrl(
  key: string,
  fileName: string,
  expiresSec = 120
): Promise<string> {
  const { s3, bucket } = client();
  const safe = fileName.replace(/["\r\n]/g, "").slice(0, 120);
  return getSignedUrl(
    s3,
    new GetObjectCommand({
      Bucket: bucket,
      Key: key,
      ResponseContentDisposition: `attachment; filename="${safe}"`,
    }),
    { expiresIn: expiresSec }
  );
}

/** Verify an object really landed (used by the confirm step). */
export async function r2Exists(key: string): Promise<boolean> {
  const { s3, bucket } = client();
  try {
    await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    return true;
  } catch {
    return false;
  }
}
