import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { isSslEnabled } from "@/lib/sslcommerz";

/** Public storefront config: payment numbers + which methods are live. */
export async function GET() {
  try {
    const supabase = createServiceClient();
    const { data } = await supabase
      .from("site_settings")
      .select("key, value")
      .in("key", ["payment_numbers", "store"]);
    const map: Record<string, unknown> = {};
    for (const row of data ?? []) map[row.key] = row.value;
    return NextResponse.json({
      ok: true,
      payment_numbers: (map.payment_numbers as Record<string, string>) ?? {},
      store: map.store ?? {},
      sslcommerz_enabled: isSslEnabled(),
    });
  } catch {
    return NextResponse.json({
      ok: true,
      payment_numbers: {},
      store: {},
      sslcommerz_enabled: false,
    });
  }
}
