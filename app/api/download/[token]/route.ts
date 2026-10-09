import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function errorPage(title: string, message: string): NextResponse {
  const html = `<!DOCTYPE html><html lang="bn"><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${title} — DigiPlyra</title>
<style>body{background:#060913;color:#e8edf7;font-family:system-ui,sans-serif;display:flex;min-height:100vh;margin:0}
.card{margin:auto;max-width:420px;text-align:center;padding:40px 24px;background:#101827;border:1px solid #1c2740;border-radius:20px}
h1{font-size:22px;margin:16px 0 8px}.sub{color:#8b94ad;font-size:14px;line-height:1.7}
a{display:inline-block;margin-top:20px;background:#d7ff3f;color:#060913;font-weight:700;padding:12px 28px;border-radius:12px;text-decoration:none}</style>
</head><body><div class="card"><div style="font-size:48px">🔒</div>
<h1>${title}</h1><p class="sub">${message}</p>
<a href="/dashboard">ড্যাশবোর্ডে ফিরুন</a></div></body></html>`;
  return new NextResponse(html, {
    status: 410,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

/**
 * GET /api/download/<token>
 * One-time secure download: validates the token, consumes it atomically,
 * then redirects to a 2-minute signed URL. Sharing the link is useless.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const svc = createServiceClient();

  const { data: dl } = await svc
    .from("file_downloads")
    .select(
      "id, downloads_used, max_downloads, expires_at, order_id, product_files!inner(storage_path, file_name, is_active)"
    )
    .eq("token", token)
    .single();

  if (!dl) {
    return errorPage("লিংক পাওয়া যায়নি", "এই ডাউনলোড লিংকটি সঠিক নয়।");
  }
  if (new Date(dl.expires_at) < new Date()) {
    return errorPage("লিংক মেয়াদোত্তীর্ণ", "ডাউনলোডের সময়সীমা শেষ হয়ে গেছে।");
  }
  if (dl.downloads_used >= dl.max_downloads) {
    return errorPage(
      "ইতিমধ্যে ব্যবহার হয়েছে",
      "এই লিংক একবারই ব্যবহার করা যায় — ইতিমধ্যে ডাউনলোড সম্পন্ন হয়েছে।"
    );
  }

  const file = dl.product_files as unknown as {
    storage_path: string;
    file_name: string;
    is_active: boolean;
  };
  if (!file?.is_active) {
    return errorPage("ফাইল উপলব্ধ নেই", "এই ফাইলটি এখন আর উপলব্ধ নেই।");
  }

  const { data: order } = await svc
    .from("orders")
    .select("status")
    .eq("id", dl.order_id)
    .single();
  if (!order || !["paid", "delivered", "keys_pending"].includes(order.status)) {
    return errorPage("পেমেন্ট সম্পন্ন নয়", "এই অর্ডারের পেমেন্ট এখনো কনফার্ম হয়নি।");
  }

  // Atomically consume the token (guards against double-click races)
  const { data: consumed } = await svc
    .from("file_downloads")
    .update({ downloads_used: dl.downloads_used + 1 })
    .eq("id", dl.id)
    .eq("downloads_used", dl.downloads_used)
    .select("id");
  if (!consumed || consumed.length === 0) {
    return errorPage(
      "ইতিমধ্যে ব্যবহার হয়েছে",
      "এই লিংক একবারই ব্যবহার করা যায় — ইতিমধ্যে ডাউনলোড সম্পন্ন হয়েছে।"
    );
  }

  // Short-lived signed URL (2 min) — useless if shared afterwards
  const { data: signed, error } = await svc.storage
    .from("product-files")
    .createSignedUrl(file.storage_path, 120, {
      download: file.file_name,
    });
  if (error || !signed?.signedUrl) {
    return errorPage("ডাউনলোড শুরু হয়নি", "আবার চেষ্টা করুন অথবা সাপোর্টে জানান।");
  }
  return NextResponse.redirect(signed.signedUrl);
}
