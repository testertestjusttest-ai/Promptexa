import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

/** POST /api/services/web-dev — submit a website-development quote request */
export async function POST(req: Request) {
  try {
    const { name, phone, site_type, features, budget_range, details } =
      (await req.json()) as Record<string, string>;

    if (!name?.trim()) return NextResponse.json({ error: "নাম দিন" }, { status: 400 });
    if (!/^01[3-9]\d{8}$/.test((phone || "").trim())) {
      return NextResponse.json({ error: "সঠিক মোবাইল নম্বর দিন" }, { status: 400 });
    }
    if (!site_type?.trim()) return NextResponse.json({ error: "সাইটের ধরন বেছে নিন" }, { status: 400 });

    const client = await createClient();
    const {
      data: { user },
    } = await client.auth.getUser();

    const svc = createServiceClient();
    const { error } = await svc.from("service_requests").insert({
      user_id: user?.id ?? null,
      name: name.trim(),
      phone: phone.trim(),
      site_type: site_type.trim(),
      features: (features || "").trim().slice(0, 1000),
      budget_range: (budget_range || "").trim(),
      details: (details || "").trim().slice(0, 2000),
      status: "new",
    });
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("web-dev request error", e);
    return NextResponse.json({ error: "সার্ভার সমস্যা" }, { status: 500 });
  }
}
