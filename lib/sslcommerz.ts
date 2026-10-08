/**
 * SSLCommerz integration (raw HTTPS, no extra dependency).
 * Docs: https://developer.sslcommerz.com
 *
 * Required env:
 *   SSLCOMMERZ_STORE_ID, SSLCOMMERZ_STORE_PASSWORD,
 *   SSLCOMMERZ_SANDBOX=true|false, NEXT_PUBLIC_SITE_URL
 */

type SslConfig = {
  storeId: string;
  storePassword: string;
  sandbox: boolean;
};

export function getSslConfig(): SslConfig | null {
  const storeId = process.env.SSLCOMMERZ_STORE_ID;
  const storePassword = process.env.SSLCOMMERZ_STORE_PASSWORD;
  if (!storeId || !storePassword) return null;
  return {
    storeId,
    storePassword,
    sandbox: process.env.SSLCOMMERZ_SANDBOX !== "false",
  };
}

export function isSslEnabled(): boolean {
  return (
    process.env.SSLCOMMERZ_ENABLED === "true" && getSslConfig() !== null
  );
}

function baseUrl(cfg: SslConfig): string {
  return cfg.sandbox
    ? "https://sandbox.sslcommerz.com"
    : "https://securepay.sslcommerz.com";
}

export type InitSessionArgs = {
  tranId: string; // our order number (unique)
  amount: number;
  currency?: string;
  customer: { name: string; email?: string; phone: string };
  productName: string;
};

export type InitSessionResult = {
  ok: boolean;
  gatewayUrl?: string;
  sessionKey?: string;
  error?: string;
};

/** Step 1 — create a payment session, returns the GatewayPageURL. */
export async function initSession(
  args: InitSessionArgs
): Promise<InitSessionResult> {
  const cfg = getSslConfig();
  if (!cfg) return { ok: false, error: "SSLCommerz is not configured" };

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");
  const body = new URLSearchParams({
    store_id: cfg.storeId,
    store_passwd: cfg.storePassword,
    total_amount: String(args.amount),
    currency: args.currency ?? "BDT",
    tran_id: args.tranId,
    success_url: `${siteUrl}/api/payments/sslcommerz/callback?status=success`,
    fail_url: `${siteUrl}/api/payments/sslcommerz/callback?status=fail`,
    cancel_url: `${siteUrl}/api/payments/sslcommerz/callback?status=cancel`,
    ipn_url: `${siteUrl}/api/payments/sslcommerz/callback?status=ipn`,
    cus_name: args.customer.name,
    cus_email: args.customer.email || "customer@digiplyra.com",
    cus_phone: args.customer.phone,
    cus_add1: "Dhaka",
    cus_city: "Dhaka",
    cus_country: "Bangladesh",
    product_name: args.productName,
    product_category: "Digital Goods",
    product_profile: "general",
    shipping_method: "NO",
    num_of_item: "1",
  });

  try {
    const res = await fetch(`${baseUrl(cfg)}/gwprocess/v4/api.php`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });
    const data = await res.json();
    if (data?.status === "SUCCESS" && data.GatewayPageURL) {
      return {
        ok: true,
        gatewayUrl: data.GatewayPageURL,
        sessionKey: data.sessionkey,
      };
    }
    return {
      ok: false,
      error: data?.failedreason || "SSLCommerz session failed",
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Network error" };
  }
}

export type ValidationResult = {
  ok: boolean;
  status?: string; // VALID / VALIDATED / INVALID ...
  valId?: string;
  tranId?: string;
  amount?: string;
  raw?: unknown;
  error?: string;
};

/** Step 2 — server-side validation of a transaction (val_id). */
export async function validateTransaction(
  valId: string
): Promise<ValidationResult> {
  const cfg = getSslConfig();
  if (!cfg) return { ok: false, error: "SSLCommerz is not configured" };
  try {
    const qs = new URLSearchParams({
      val_id: valId,
      store_id: cfg.storeId,
      store_passwd: cfg.storePassword,
      v: "1",
      format: "json",
    });
    const res = await fetch(
      `${baseUrl(cfg)}/validator/api/validationserverAPI.php?${qs.toString()}`
    );
    const data = await res.json();
    const status = String(data?.status || "").toUpperCase();
    if (status === "VALID" || status === "VALIDATED") {
      return {
        ok: true,
        status,
        valId,
        tranId: data.tran_id,
        amount: data.amount,
        raw: data,
      };
    }
    return { ok: false, status, error: "Transaction not valid", raw: data };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Network error" };
  }
}
