import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const productId = Number(new URL(request.url).searchParams.get("productId"));
  if (!productId) return NextResponse.json({ error: "Product is required" }, { status: 400 });

  const { data: item, error } = await supabase
    .from("order_items")
    .select("product_id,products(id,name,product_type,delivery_url,storage_path)")
    .eq("product_id", productId)
    .limit(20);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rows = (item || []) as any[];
  const product = rows.find((row) => row.products)?.products;
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  const { data: paidOrder } = await supabase
    .from("orders")
    .select("id")
    .eq("user_id", user.id)
    .eq("status", "paid")
    .in("id", rows.map(() => "00000000-0000-0000-0000-000000000000"));

  const { data: owned } = await supabase
    .from("order_items")
    .select("order_id,orders!inner(user_id,status)")
    .eq("product_id", productId)
    .eq("orders.user_id", user.id)
    .eq("orders.status", "paid")
    .limit(1);

  if (!owned?.length) return NextResponse.json({ error: "Payment approval is required before access" }, { status: 403 });

  if (product.product_type === "link" || product.product_type === "license") {
    if (!product.delivery_url) return NextResponse.json({ error: "Delivery link is not configured" }, { status: 404 });
    return NextResponse.json({ url: product.delivery_url, type: product.product_type });
  }

  if (!product.storage_path) return NextResponse.json({ error: "Download file is not configured" }, { status: 404 });
  const { data: signed, error: signedError } = await supabase.storage.from("digital-products").createSignedUrl(product.storage_path, 300, { download: true });
  if (signedError || !signed?.signedUrl) return NextResponse.json({ error: signedError?.message || "Could not create download link" }, { status: 500 });
  return NextResponse.json({ url: signed.signedUrl, type: "download", expiresIn: 300 });
}
