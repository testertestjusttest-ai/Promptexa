import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin";

/**
 * NOTE: uploads go DIRECTLY browser → Supabase via
 * POST /api/admin/files/sign  →  PUT signedUrl  →  POST /api/admin/files/confirm
 * (Vercel serverless caps request bodies at ~4.5MB, so proxying big
 * APKs through this route would always fail.)
 */

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
