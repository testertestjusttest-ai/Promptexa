import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

/**
 * POST /api/marketplace/upload — seller uploads an ID screenshot (≤5MB).
 * Stored in the product-images bucket under listings/.
 */
export async function POST(req: Request) {
  try {
    const client = await createClient();
    const {
      data: { user },
    } = await client.auth.getUser();
    if (!user) return NextResponse.json({ error: "লগইন করুন" }, { status: 401 });

    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "ফাইল দিন" }, { status: 400 });
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "শুধু ছবি আপলোড করা যাবে" }, { status: 400 });
    }
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "ছবি ৫MB-এর কম হতে হবে" }, { status: 400 });
    }

    const svc = createServiceClient();
    const ext = (file.name.split(".").pop() || "jpg").slice(0, 5);
    const path = `listings/${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const buf = Buffer.from(await file.arrayBuffer());
    const { error } = await svc.storage.from("product-images").upload(path, buf, {
      contentType: file.type,
      upsert: false,
    });
    if (error) throw error;
    const { data } = svc.storage.from("product-images").getPublicUrl(path);
    return NextResponse.json({ ok: true, url: data.publicUrl });
  } catch (e) {
    console.error("listing upload error", e);
    return NextResponse.json({ error: "আপলোড হয়নি" }, { status: 500 });
  }
}
