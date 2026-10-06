import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function adminClient() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase, error: NextResponse.json({ error: "Sign in required" }, { status: 401 }) };
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return { supabase, error: NextResponse.json({ error: "Admin access required" }, { status: 403 }) };
  return { supabase, error: null };
}

export async function GET() {
  const { supabase, error } = await adminClient();
  if (error) return error;
  const { data, error: dbError } = await supabase.from("products").select("*,store_categories(name,slug)").order("created_at", { ascending: false });
  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });
  return NextResponse.json({ products: data || [] });
}

export async function POST(request: Request) {
  const { supabase, error } = await adminClient();
  if (error) return error;
  const body = await request.json().catch(() => null);
  const name = String(body?.name || "").trim();
  const slug = String(body?.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
  const price = Number(body?.price);
  const productType = String(body?.productType || "download");
  if (!name || !slug || !Number.isFinite(price) || price < 0 || !["download", "link", "license"].includes(productType)) return NextResponse.json({ error: "Invalid product data" }, { status: 400 });
  const { data, error: dbError } = await supabase.from("products").insert({ category_id: body?.categoryId || null, name, slug, description: String(body?.description || ""), price, product_type: productType, delivery_url: body?.deliveryUrl || null, storage_path: body?.storagePath || null, image_url: body?.image_url || body?.imageUrl || null, active: body?.active !== false, featured: body?.featured === true }).select().single();
  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 400 });
  return NextResponse.json({ product: data });
}

export async function PATCH(request: Request) {
  const { supabase, error } = await adminClient();
  if (error) return error;
  const body = await request.json().catch(() => null);
  const id = Number(body?.id);
  if (!id) return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const key of ["name", "slug", "description", "delivery_url", "storage_path", "product_type", "category_id", "price", "active", "featured", "image_url"]) if (body?.[key] !== undefined) update[key] = body[key];
  const { data, error: dbError } = await supabase.from("products").update(update).eq("id", id).select().single();
  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 400 });
  return NextResponse.json({ product: data });
}
