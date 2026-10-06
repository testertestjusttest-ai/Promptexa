import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase, error: NextResponse.json({ error: "Sign in required" }, { status: 401 }) };
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return { supabase, error: NextResponse.json({ error: "Admin access required" }, { status: 403 }) };
  return { supabase, error: null };
}

const defaultSlots = [
  ["home_top", "Home — Top"],
  ["home_middle", "Home — Middle"],
  ["product_bottom", "Product — Bottom"],
  ["checkout_top", "Checkout — Top"],
  ["footer", "Footer"],
];

export async function GET(request: Request) {
  const supabase = await createClient();
  const url = new URL(request.url);
  const slot = url.searchParams.get("slot");
  let query = supabase.from("ad_slots").select("id,slot_key,title,code,enabled,updated_at").eq("enabled", true);
  if (slot) query = query.eq("slot_key", slot);
  const { data, error } = await query.order("slot_key");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ads: data || [] }, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } });
}

export async function PATCH(request: Request) {
  const { supabase, error } = await requireAdmin();
  if (error) return error;
  const body = await request.json().catch(() => null);
  const slotKey = String(body?.slot_key || "").trim();
  const title = String(body?.title || slotKey).trim();
  const code = String(body?.code || "");
  const enabled = body?.enabled !== false;
  if (!slotKey || !/^[a-z0-9_-]{2,80}$/.test(slotKey)) return NextResponse.json({ error: "Invalid slot key" }, { status: 400 });
  const { data, error: dbError } = await supabase.from("ad_slots").upsert({ slot_key: slotKey, title, code, enabled, updated_at: new Date().toISOString() }, { onConflict: "slot_key" }).select().single();
  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 400 });
  return NextResponse.json({ ad: data });
}

export async function DELETE(request: Request) {
  const { supabase, error } = await requireAdmin();
  if (error) return error;
  const slotKey = new URL(request.url).searchParams.get("slot_key");
  if (!slotKey) return NextResponse.json({ error: "slot_key is required" }, { status: 400 });
  const { error: dbError } = await supabase.from("ad_slots").update({ code: "", enabled: false, updated_at: new Date().toISOString() }).eq("slot_key", slotKey);
  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
