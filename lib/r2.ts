// lib/r2.ts — S3-compatible object storage (SERVER ONLY — never import in client components)
// Primary: Backblaze B2 (free 10GB, no credit card needed).
// Fallback: Cloudflare R2 (needs a card on file).
// Used for large product files (APK etc.) that exceed Supabase free plan's 50MB/file wall.
// Flow: admin browser PUTs directly to a presigned URL (bypasses Vercel 4.5MB body limit),
// customers download via a 2-minute presigned GET after their one-time token is consumed.

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutBucketCorsCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

type StoreCfg = {
  endpoint: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
};

function cfg(): StoreCfg | null {
  // Generic S3 — Backblaze B2 (no card needed)
  if (
    process.env.S3_ENDPOINT &&
    process.env.S3_ACCESS_KEY_ID &&
    process.env.S3_SECRET_ACCESS_KEY &&
    process.env.S3_BUCKET
  ) {
    const endpoint = process.env.S3_ENDPOINT.replace(/\/$/, "");
    // B2 endpoints look like https://s3.us-west-004.backblazeb2.com — derive region from it
    const m = endpoint.match(/s3\.([a-z0-9-]+)\.backblazeb2\.com/i);
    return {
      endpoint,
      region: process.env.S3_REGION || m?.[1] || "us-west-004",
      accessKeyId: process.env.S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
      bucket: process.env.S3_BUCKET,
    };
  }
  // Cloudflare R2 (needs billing on file)
  const accountId = process.env.R2_ACCOUNT_ID || "";
  if (
    accountId &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY &&
    process.env.R2_BUCKET
  ) {
    return {
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      region: "auto",
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      bucket: process.env.R2_BUCKET,
    };
  }
  return null;
}

export function r2Ready(): boolean {
  return cfg() !== null;
}

function client(): { s3: S3Client; bucket: string } {
  const c = cfg();
  if (!c) throw new Error("S3 storage env vars missing");
  const s3 = new S3Client({
    region: c.region,
    endpoint: c.endpoint,
    credentials: {
      accessKeyId: c.accessKeyId,
      secretAccessKey: c.secretAccessKey,
    },
    forcePathStyle: false,
  });
  return { s3, bucket: c.bucket };
}

/** Presigned PUT URL — the browser uploads the file bytes straight to storage. Single PUT up to 5GB. */
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

/** Apply browser-upload CORS rules to the bucket (one-time setup, admin-triggered). */
export async function s3EnsureCors(origin: string): Promise<void> {
  const { s3, bucket } = client();
  await s3.send(
    new PutBucketCorsCommand({
      Bucket: bucket,
      CORSConfiguration: {
        CORSRules: [
          {
            AllowedOrigins: [origin],
            AllowedMethods: ["GET", "PUT", "HEAD"],
            AllowedHeaders: ["*"],
            ExposeHeaders: ["ETag"],
            MaxAgeSeconds: 3600,
          },
        ],
      },
    })
  );
}
