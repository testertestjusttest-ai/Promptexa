import { NextResponse } from "next/server";

/**
 * RETIRED — the per-card payout model was replaced by hourly rounds:
 * watch 20 cards → claim ৳20 lump sum via /api/rewards/claim-round.
 * This stub stays so old clients fail safely instead of crediting money.
 */
export async function POST() {
  return NextResponse.json(
    { error: "পুরনো সিস্টেম বন্ধ — নতুন রাউন্ড সিস্টেমে ২০ কার্ড শেষে বোনাস নিন" },
    { status: 410 }
  );
}
