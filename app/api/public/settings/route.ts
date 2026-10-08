import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { isSslEnabled } from "@/lib/sslcommerz";

/** Public storefront config: payment numbers + which methods are live + ads. */
export async function GET() {
  const fallback = {
    ok: true,
    payment_numbers: {},
    store: {},
    ads: { enabled: false, home_top: "", home_bottom: "", product_page: "", popup: "" },
    notifications: { onesignal_app_id: "" },
    sslcommerz_enabled: isSslEnabled(),
  };
  try {
    const supabase = createServiceClient();
    const { data } = await supabase
      .from("site_settings")
      .select("key, value")
      .in("key", ["payment_numbers", "store", "ads", "notifications"]);
    const map: Record<string, unknown> = {};
    for (const row of data ?? []) map[row.key] = row.value;
    return NextResponse.json({
      ...fallback,
      payment_numbers: (map.payment_numbers as Record<string, string>) ?? {},
      store: map.store ?? {},
      ads: { ...fallback.ads, ...((map.ads as object) ?? {}) },
      notifications: { ...fallback.notifications, ...((map.notifications as object) ?? {}) },
    });
  } catch {
    return NextResponse.json(fallback);
  }
}
