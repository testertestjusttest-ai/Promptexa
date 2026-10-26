import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardChrome from "./DashboardChrome";
import type { DashboardOrder } from "./OrderCard";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login?next=/dashboard");

  // ensure profile row
  await supabase.from("profiles").upsert(
    { id: user.id, email: user.email },
    { onConflict: "id" }
  );

  const { data: orders } = await supabase
    .from("orders")
    .select("id, order_number, status, payment_method, total_bdt, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const enriched: DashboardOrder[] = [];
  for (const o of orders ?? []) {
    const [{ data: items }, { data: keys }, { data: files }] = await Promise.all([
      supabase
        .from("order_items")
        .select("product_name, plan_label_bn, price_bdt, qty")
        .eq("order_id", o.id),
      supabase
        .from("delivered_keys")
        .select("key_text, key_note, delivered_at")
        .eq("order_id", o.id),
      supabase
        .from("file_downloads")
        .select(
          "id, order_id, order_item_id, product_file_id, token, max_downloads, downloads_used, expires_at, created_at, product_file:product_files(file_name, version_label, file_size)"
        )
        .eq("order_id", o.id)
        .order("created_at"),
    ]);
    enriched.push({
      id: o.id,
      order_number: o.order_number,
      status: o.status,
      payment_method: o.payment_method,
      total_bdt: o.total_bdt,
      created_at: o.created_at,
      items: items ?? [],
      keys: keys ?? [],
      files: (files ?? []) as unknown as DashboardOrder["files"],
    });
  }

  const [{ data: profile }, { data: wallet }] = await Promise.all([
    supabase.from("profiles").select("is_admin, referral_code").eq("id", user.id).single(),
    supabase.from("wallets").select("balance_bdt").eq("user_id", user.id).single(),
  ]);

  return (
    <DashboardChrome
      isAdmin={!!profile?.is_admin}
      walletBalance={Number(wallet?.balance_bdt ?? 0)}
      referralCode={profile?.referral_code ?? null}
      orders={enriched}
    />
  );
}
