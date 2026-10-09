import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin";

const MAX_BYTES = 200 * 1024 * 1024; // 200MB per file

/** GET /api/admin/files?product_id= — list files for a product */
export async function GET(req: Request) {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;
  const productId = new URL(req.url).searchParams.get("product_id");
  let q = auth.svc
    .from("product_files")
    .select("*, plan:plans(label_bn)")
    .order("sort");
  if (productId) q = q.eq("product_id", productId);
  const { data, error } = await q;
  if (error) return NextResponse.json({ error: "লোড হয়নি" }, { status: 500 });
  return NextResponse.json({ ok: true, files: data });
}

/**
 * POST /api/admin/files — upload APK/file to the PRIVATE bucket
 * FormData: file, product_id, plan_id?, version_label?
 */
export async function POST(req: Request) {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;
  const { svc } = auth;

  try {
    const fd = await req.formData();
    const file = fd.get("file") as File | null;
    const product_id = String(fd.get("product_id") || "");
    const plan_id = String(fd.get("plan_id") || "") || null;
    const version_label = String(fd.get("version_label") || "").trim();

    if (!file || file.size === 0) {
      return NextResponse.json({ error: "ফাইল দিন" }, { status: 400 });
    }
    if (!product_id) {
      return NextResponse.json({ error: "প্রোডাক্ট সিলেক্ট করুন" }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "ফাইল ২০০MB-এর কম হতে হবে" }, { status: 400 });
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80);
    const path = `${product_id}/${Date.now()}-${safeName}`;
    const buf = Buffer.from(await file.arrayBuffer());

    const { error: upErr } = await svc.storage
      .from("product-files")
      .upload(path, buf, {
        contentType: file.type || "application/vnd.android.package-archive",
        upsert: false,
      });
    if (upErr) {
      return NextResponse.json({ error: "আপলোড হয়নি: " + upErr.message }, { status: 500 });
    }

    const { data, error: insErr } = await svc
      .from("product_files")
      .insert({
        product_id,
        plan_id,
        file_name: file.name,
        version_label,
        storage_path: path,
        file_size: file.size,
        mime_type: file.type || "application/vnd.android.package-archive",
      })
      .select("id")
      .single();
    if (insErr) {
      await svc.storage.from("product-files").remove([path]);
      return NextResponse.json({ error: "সেভ হয়নি" }, { status: 500 });
    }
    return NextResponse.json({ ok: true, id: data.id });
  } catch (e) {
    console.error("file upload error", e);
    return NextResponse.json({ error: "সার্ভার সমস্যা" }, { status: 500 });
  }
}

/** DELETE /api/admin/files?id= — delete file (storage + row) */
export async function DELETE(req: Request) {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id আবশ্যক" }, { status: 400 });

  const { data: row } = await auth.svc
    .from("product_files")
    .select("storage_path")
    .eq("id", id)
    .single();
  if (!row) return NextResponse.json({ error: "পাওয়া যায়নি" }, { status: 404 });

  // block delete if a token was already issued for this file
  const { data: used } = await auth.svc
    .from("file_downloads")
    .select("id")
    .eq("product_file_id", id)
    .limit(1);
  if (used && used.length > 0) {
    // keep the row for history, just deactivate
    await auth.svc.from("product_files").update({ is_active: false }).eq("id", id);
    return NextResponse.json({ ok: true, deactivated: true });
  }

  await auth.svc.storage.from("product-files").remove([row.storage_path]);
  await auth.svc.from("product_files").delete().eq("id", id);
  return NextResponse.json({ ok: true });
}
