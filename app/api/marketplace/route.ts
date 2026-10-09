import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

/**
 * GET /api/marketplace — public list of approved ID listings.
 * POST /api/marketplace — seller creates a listing (goes to pending review).
 */
export async function GET() {
  try {
    const svc = createServiceClient();
    const { data, error } = await svc
      .from("id_listings")
      .select("id, title, description, price_bdt, game_uid, images, views, created_at, seller_id, seller_phone, featured_until")
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(60);
    if (error) throw error;
    const now = Date.now();
    const rows = (data ?? []).sort((a: any, b: any) => {
      const fa = a.featured_until && new Date(a.featured_until).getTime() > now ? 1 : 0;
      const fb = b.featured_until && new Date(b.featured_until).getTime() > now ? 1 : 0;
      if (fa !== fb) return fb - fa;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    return NextResponse.json({ ok: true, listings: rows });
  } catch (e) {
    console.error("marketplace list error", e);
    return NextResponse.json({ error: "সার্ভার সমস্যা" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const client = await createClient();
    const {
      data: { user },
    } = await client.auth.getUser();
    if (!user) return NextResponse.json({ error: "লগইন করুন" }, { status: 401 });

    const { title, description, price_bdt, game_uid, images, seller_phone } =
      (await req.json()) as Record<string, unknown>;

    if (!String(title || "").trim()) return NextResponse.json({ error: "টাইটেল দিন" }, { status: 400 });
    const price = Number(price_bdt);
    if (!(price > 0)) return NextResponse.json({ error: "সঠিক দাম দিন" }, { status: 400 });
    const imgs = Array.isArray(images) ? images.filter((x) => typeof x === "string").slice(0, 6) : [];
    if (imgs.length === 0) return NextResponse.json({ error: "কমপক্ষে ১টি স্ক্রিনশট দিন" }, { status: 400 });
    const phone = String(seller_phone || "").trim().slice(0, 20);

    const svc = createServiceClient();
    const { data, error } = await svc
      .from("id_listings")
      .insert({
        seller_id: user.id,
        title: String(title).trim().slice(0, 120),
        description: String(description || "").trim().slice(0, 3000),
        price_bdt: price,
        game_uid: String(game_uid || "").trim().slice(0, 60),
        seller_phone: phone,
        images: imgs,
        status: "pending",
      })
      .select("id")
      .single();
    if (error) throw error;
    return NextResponse.json({ ok: true, id: data.id });
  } catch (e) {
    console.error("marketplace create error", e);
    return NextResponse.json({ error: "সার্ভার সমস্যা" }, { status: 500 });
  }
}
