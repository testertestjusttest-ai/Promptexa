import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

/**
 * POST /api/auth/link-orders
 * Links guest orders (same verified email) to the signed-in user's account,
 * so keys bought without login appear in their dashboard.
 */
export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user?.email) {
      return NextResponse.json({ error: "লগইন করুন" }, { status: 401 });
    }

    const svc = createServiceClient();
    const { data: linked } = await svc
      .from("orders")
      .update({ user_id: user.id })
      .is("user_id", null)
      .ilike("customer_email", user.email)
      .select("id");

    return NextResponse.json({ ok: true, linked: linked?.length ?? 0 });
  } catch (e) {
    console.error("link-orders error", e);
    return NextResponse.json({ error: "সার্ভার সমস্যা" }, { status: 500 });
  }
}
