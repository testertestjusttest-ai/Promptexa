import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin";

/** GET — all settings + sslcommerz env status */
export async function GET() {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;
  const { data } = await auth.svc.from("site_settings").select("key, value");
  const map: Record<string, unknown> = {};
  for (const row of data ?? []) map[row.key] = row.value;
  return NextResponse.json({
    ok: true,
    settings: map,
    sslcommerz: {
      enabled: process.env.SSLCOMMERZ_ENABLED === "true",
      sandbox: process.env.SSLCOMMERZ_SANDBOX !== "false",
      configured: !!(process.env.SSLCOMMERZ_STORE_ID && process.env.SSLCOMMERZ_STORE_PASSWORD),
    },
  });
}

/** POST — update settings { key, value } (whitelisted keys only) */
export async function POST(req: Request) {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;
  const { key, value } = (await req.json()) as { key: string; value: unknown };
  if (!["payment_numbers", "store", "ads", "notifications", "rewards", "marketplace_fee_percent", "marketplace_boost_price", "marketplace_boost_days"].includes(key)) {
    return NextResponse.json({ error: "অনুমোদিত কী নয়" }, { status: 400 });
  }
  const { error } = await auth.svc
    .from("site_settings")
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });
  if (error) return NextResponse.json({ error: "সেভ হয়নি" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
