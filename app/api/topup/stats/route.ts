import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/** GET — public top-up stats + recent deliveries (phones masked) */
export async function GET() {
  try {
    const svc = createServiceClient();
    const dayStart = new Date();
    dayStart.setHours(0, 0, 0, 0);

    const [{ count: total }, { count: today }, { data: recent }] = await Promise.all([
      svc.from("topup_orders").select("id", { count: "exact", head: true }).eq("status", "delivered"),
      svc
        .from("topup_orders")
        .select("id", { count: "exact", head: true })
        .eq("status", "delivered")
        .gte("created_at", dayStart.toISOString()),
      svc
        .from("topup_orders")
        .select("package_name,phone,created_at")
        .eq("status", "delivered")
        .order("created_at", { ascending: false })
        .limit(12),
    ]);

    const masked = (recent ?? []).map((r) => ({
      package_name: r.package_name,
      phone:
        r.phone && r.phone.length >= 5
          ? `${r.phone.slice(0, 3)}****${r.phone.slice(-2)}`
          : "****",
      created_at: r.created_at,
    }));

    return NextResponse.json({
      ok: true,
      total_delivered: total ?? 0,
      today_delivered: today ?? 0,
      recent: masked,
    });
  } catch {
    return NextResponse.json({ ok: true, total_delivered: 0, today_delivered: 0, recent: [] });
  }
}
