import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin";

/**
 * POST /api/admin/files/confirm
 * Called AFTER the browser finishes the direct upload.
 * JSON: { product_id, plan_id?, version_label?, file_name, storage_path, file_size, mime_type? }
 * Verifies the object really exists in storage, then registers the DB row.
 */
export async function POST(req: Request) {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;
  const { svc } = auth;

  try {
    const body = (await req.json()) as {
      product_id: string;
      plan_id?: string | null;
      version_label?: string;
      file_name: string;
      storage_path: string;
      file_size: number;
      mime_type?: string;
    };
    const { product_id, file_name, storage_path, file_size } = body;
    if (!product_id || !file_name || !storage_path || !file_size) {
      return NextResponse.json({ error: "তথ্য অসম্পূর্ণ" }, { status: 400 });
    }
    // safety: path must belong to this product
    if (!storage_path.startsWith(product_id + "/")) {
      return NextResponse.json({ error: "ভুল পাথ" }, { status: 400 });
    }

    // verify the object actually landed in storage
    const dir = storage_path.split("/").slice(0, -1).join("/");
    const base = storage_path.split("/").pop()!;
    const { data: listed, error: listErr } = await svc.storage
      .from("product-files")
      .list(dir, { search: base });
    if (listErr || !listed?.some((o) => o.name === base)) {
      return NextResponse.json(
        { error: "ফাইল স্টোরেজে পাওয়া যায়নি — আবার আপলোড করুন" },
        { status: 400 }
      );
    }

    const { data, error } = await svc
      .from("product_files")
      .insert({
        product_id,
        plan_id: body.plan_id || null,
        file_name,
        version_label: body.version_label?.trim() || "",
        storage_path,
        file_size,
        mime_type: body.mime_type || "application/vnd.android.package-archive",
      })
      .select("id")
      .single();
    if (error) {
      return NextResponse.json({ error: "সেভ হয়নি" }, { status: 500 });
    }
    return NextResponse.json({ ok: true, id: data.id });
  } catch (e) {
    console.error("confirm error", e);
    return NextResponse.json({ error: "সার্ভার সমস্যা" }, { status: 500 });
  }
}
