import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatBDT } from "@/lib/format";
import OrderCard, { type DashboardOrder } from "./OrderCard";

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
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">স্বাগতম,</p>
          <h1 className="font-display text-3xl font-bold text-white">
            📦 আমার অর্ডার
          </h1>
        </div>
        <div className="flex gap-2">
          {profile?.is_admin && (
            <Link href="/admin" className="btn-ghost !py-2.5 text-sm">
              🛠️ অ্যাডমিন প্যানেল
            </Link>
          )}
          <form action="/auth/signout" method="post">
            <button type="submit" className="btn-ghost !py-2.5 text-sm">
              লগআউট
            </button>
          </form>
        </div>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <Link href="/earn" className="glass card-hover rounded-2xl p-5">
          <p className="text-xs uppercase tracking-wide text-slate-500">💰 ওয়ালেট ব্যালেন্স</p>
          <p className="font-display mt-1 text-3xl font-bold text-[#d7ff3f]">
            {formatBDT(Number(wallet?.balance_bdt ?? 0))}
          </p>
          <p className="mt-1 text-xs text-slate-500">ব্যালেন্স দিয়ে কিনুন বা উত্তোলন করুন →</p>
        </Link>
        <div className="glass rounded-2xl p-5">
          <p className="text-xs uppercase tracking-wide text-slate-500">👥 আপনার রেফারেল কোড</p>
          <p className="font-display mt-1 font-mono text-2xl font-bold text-white">
            {profile?.referral_code ?? "—"}
          </p>
          <Link href="/earn" className="mt-1 inline-block text-xs font-bold text-[#d7ff3f]">
            রেফার করে আয় করুন →
          </Link>
        </div>
      </div>

      {enriched.length === 0 ? (
        <div className="glass mx-auto max-w-md rounded-2xl p-10 text-center">
          <div className="text-5xl">📭</div>
          <p className="mt-4 font-bold text-white">এখনো কোনো অর্ডার নেই</p>
          <p className="mt-1 text-sm text-slate-400">পছন্দের প্রিমিয়াম সাবস্ক্রিপশন কিনুন</p>
          <Link href="/shop" className="btn-vault mt-6 inline-flex text-sm">
            শপ দেখুন
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {enriched.map((o) => (
            <OrderCard key={o.id} order={o} />
          ))}
        </div>
      )}
    </div>
  );
}
