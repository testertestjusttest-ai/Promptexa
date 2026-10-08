import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { validateTransaction } from "@/lib/sslcommerz";
import { confirmOrderPayment } from "@/lib/delivery";

export const dynamic = "force-dynamic";

function siteUrl(req: Request): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin
  ).replace(/\/$/, "");
}

/** Read params from either GET query or POST form (SSLCommerz posts to success_url). */
async function readParams(req: Request): Promise<URLSearchParams> {
  const url = new URL(req.url);
  const statusHint = url.searchParams.get("status"); // success | fail | cancel | ipn
  if (req.method === "POST") {
    const form = await req.formData();
    const p = new URLSearchParams();
    form.forEach((v, k) => p.set(k, String(v)));
    if (statusHint) p.set("__status_hint", statusHint);
    return p;
  }
  const p = new URLSearchParams(url.searchParams);
  return p;
}

async function handleSuccess(params: URLSearchParams) {
  const tranId = params.get("tran_id");
  const valId = params.get("val_id");
  if (!tranId || !valId) return { ok: false as const };

  // Server-side validation — never trust the redirect alone
  const v = await validateTransaction(valId);
  if (!v.ok) {
    console.error("SSL validation failed", v.error, tranId);
    return { ok: false as const, tranId };
  }

  const supabase = createServiceClient();
  const { data: order } = await supabase
    .from("orders")
    .select("id, order_number, total_bdt")
    .eq("order_number", tranId)
    .single();
  if (!order) return { ok: false as const, tranId };

  // Amount sanity check
  if (v.amount && Math.round(Number(v.amount)) !== order.total_bdt) {
    console.error("SSL amount mismatch", tranId, v.amount, order.total_bdt);
    return { ok: false as const, tranId };
  }

  await confirmOrderPayment(supabase, order.id, {
    ssl_tran_id: tranId,
    ssl_val_id: valId,
    gateway_response: v.raw,
  });
  return { ok: true as const, tranId };
}

async function handleFailOrCancel(params: URLSearchParams, kind: "failed" | "cancelled") {
  const tranId = params.get("tran_id");
  if (!tranId) return null;
  const supabase = createServiceClient();
  const { data: order } = await supabase
    .from("orders")
    .select("id")
    .eq("order_number", tranId)
    .single();
  if (order) {
    await supabase
      .from("payments")
      .update({ status: kind, gateway_response: Object.fromEntries(params.entries()) })
      .eq("order_id", order.id)
      .eq("status", "pending");
  }
  return tranId;
}

export async function GET(req: Request) {
  const params = await readParams(req);
  const hint = params.get("status") || params.get("__status_hint");
  const base = siteUrl(req);

  if (hint === "success") {
    const r = await handleSuccess(params);
    if (r.ok && r.tranId) {
      return NextResponse.redirect(`${base}/checkout/success?order=${r.tranId}`);
    }
    const order = r.tranId ? `?order=${r.tranId}` : "";
    return NextResponse.redirect(`${base}/checkout/failed${order}`);
  }
  if (hint === "fail" || hint === "cancel") {
    const tranId = await handleFailOrCancel(
      params,
      hint === "fail" ? "failed" : "cancelled"
    );
    return NextResponse.redirect(
      `${base}/checkout/failed${tranId ? `?order=${tranId}` : ""}`
    );
  }
  if (hint === "ipn") {
    // IPN: validate silently, no redirect
    await handleSuccess(params);
    return new NextResponse("OK", { status: 200 });
  }
  return NextResponse.redirect(`${base}/`);
}

export async function POST(req: Request) {
  return GET(req);
}
