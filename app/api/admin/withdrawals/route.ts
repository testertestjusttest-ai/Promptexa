import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin";

/** GET /api/admin/withdrawals?status=pending — list requests (newest first) */
export async function GET(req: Request) {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;
  const status = new URL(req.url).searchParams.get("status") || "pending";

  const { data, error } = await auth.svc
    .from("withdrawals")
    .select("*, profile:profiles!withdrawals_user_id_fkey(email, full_name)")
    .eq("status", status)
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) return NextResponse.json({ error: "লোড হয়নি" }, { status: 500 });
  return NextResponse.json({ ok: true, withdrawals: data });
}

/**
 * PATCH /api/admin/withdrawals
 * Body: { id, action: 'approve' | 'reject', admin_note? }
 * - approve: mark approved (money already debited at request time)
 * - reject: refund the amount to the user's wallet
 */
export async function PATCH(req: Request) {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;
  const { svc } = auth;

  try {
    const { id, action, admin_note } = (await req.json()) as {
      id: string;
      action: "approve" | "reject";
      admin_note?: string;
    };
    if (!id || !["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "ভুল রিকোয়েস্ট" }, { status: 400 });
    }

    const { data: wd } = await svc
      .from("withdrawals")
      .select("*")
      .eq("id", id)
      .eq("status", "pending")
      .single();
    if (!wd) return NextResponse.json({ error: "পাওয়া যায়নি" }, { status: 404 });

    if (action === "reject") {
      // refund
      const { data: w } = await svc
        .from("wallets")
        .select("balance_bdt, total_spent_bdt")
        .eq("user_id", wd.user_id)
        .single();
      if (w) {
        await svc
          .from("wallets")
          .update({
            balance_bdt: Number(w.balance_bdt) + Number(wd.amount_bdt),
            total_spent_bdt: Math.max(0, Number(w.total_spent_bdt) - Number(wd.amount_bdt)),
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", wd.user_id);
        await svc.from("wallet_transactions").insert({
          user_id: wd.user_id,
          amount_bdt: Number(wd.amount_bdt),
          type: "refund",
          note: "উত্তোলন রিকোয়েস্ট বাতিল — রিফান্ড",
          ref_id: wd.id,
        });
      }
    } else {
      const { data: w } = await svc
        .from("wallets")
        .select("total_withdrawn_bdt")
        .eq("user_id", wd.user_id)
        .single();
      if (w) {
        await svc
          .from("wallets")
          .update({
            total_withdrawn_bdt: Number(w.total_withdrawn_bdt) + Number(wd.amount_bdt),
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", wd.user_id);
      }
    }

    await svc
      .from("withdrawals")
      .update({
        status: action === "approve" ? "approved" : "rejected",
        admin_note: admin_note?.trim() || null,
        decided_at: new Date().toISOString(),
      })
      .eq("id", id);

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("withdrawal decide error", e);
    return NextResponse.json({ error: "সার্ভার সমস্যা" }, { status: 500 });
  }
}
