import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin";

export const dynamic = "force-dynamic";

/** GET /api/admin/deposits — list deposit requests (admin only). */
export async function GET() {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;
  const { data } = await auth.svc.from("deposits")
    .select("id, user_id, amount_bdt, method, trx_id, status, created_at, profiles!inner(full_name, email)")
    .order("created_at", { ascending: false })
    .limit(100);
  return NextResponse.json({ deposits: data ?? [] });
}

/**
 * POST /api/admin/deposits — approve/reject a deposit.
 * Body: { id, action: "approve" | "reject", note? }
 * On approve: wallet credited via claim_ad_reward-style RPC (atomic).
 */
export async function POST(req: Request) {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;
  const { id, action, note } = (await req.json()) as { id: string; action: string; note?: string };
  if (!id || !["approve", "reject"].includes(action)) {
    return NextResponse.json({ error: "ভুল রিকোয়েস্ট" }, { status: 400 });
  }

  const { data: dep } = await auth.svc.from("deposits").select("*").eq("id", id).single();
  if (!dep || (dep as any).status !== "pending") {
    return NextResponse.json({ error: "পেন্ডিং ডিপোজিট পাওয়া যায়নি" }, { status: 404 });
  }

  if (action === "reject") {
    await auth.svc.from("deposits").update({
      status: "rejected", admin_note: (note || "").slice(0, 200), decided_at: new Date().toISOString(),
    }).eq("id", id);
    return NextResponse.json({ ok: true });
  }

  // Approve: credit wallet atomically via wallet RPC
  const amt = Math.floor(Number((dep as any).amount_bdt) || 0);
  const { error: rpcErr } = await auth.svc.rpc("wallet_credit", {
    p_user_id: (dep as any).user_id,
    p_amount: amt,
    p_label: `💰 ডিপোজিট (${(dep as any).method})`,
  });
  // Fallback: direct profile update if RPC missing
  if (rpcErr) {
    const { data: prof } = await auth.svc.from("profiles").select("wallet_bdt").eq("id", (dep as any).user_id).single();
    const cur = Number((prof as any)?.wallet_bdt || 0);
    await auth.svc.from("profiles").update({ wallet_bdt: cur + amt }).eq("id", (dep as any).user_id);
    await auth.svc.from("wallet_txns").insert({
      user_id: (dep as any).user_id, amount_bdt: amt, label: `💰 ডিপোজিট (${(dep as any).method})`,
    });
  }

  await auth.svc.from("deposits").update({
    status: "approved", admin_note: (note || "").slice(0, 200), decided_at: new Date().toISOString(),
  }).eq("id", id);
  return NextResponse.json({ ok: true });
}
