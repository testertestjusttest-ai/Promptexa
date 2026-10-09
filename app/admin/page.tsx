import Link from "next/link";
import { requireAdminPage } from "@/lib/admin";
import { formatBDT, toBnDigits } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminOverview() {
  const { svc, role } = await requireAdminPage();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    { data: orders },
    { data: pendingPayments },
    { data: keyStock },
    { count: pendingListings },
    { count: activeDeals },
    { count: newServiceReqs },
    { count: pendingWithdrawals },
  ] = await Promise.all([
    svc.from("orders").select("total_bdt, status, created_at").neq("status", "cancelled"),
    svc.from("payments").select("id", { count: "exact" }).eq("status", "pending").in("method", ["bkash", "nagad", "rocket"]),
    svc.from("product_keys").select("product_id, is_used").eq("is_used", false),
    svc.from("id_listings").select("id", { count: "exact", head: true }).eq("status", "pending"),
    svc.from("escrow_deals").select("id", { count: "exact", head: true }).not("status", "in", "(completed,refunded,cancelled)"),
    svc.from("service_requests").select("id", { count: "exact", head: true }).eq("status", "new"),
    svc.from("withdrawals").select("id", { count: "exact", head: true }).eq("status", "pending"),
  ]);

  const revenue = (orders ?? [])
    .filter((o) => ["paid", "delivered", "keys_pending"].includes(o.status))
    .reduce((n, o) => n + o.total_bdt, 0);
  const todayOrders = (orders ?? []).filter(
    (o) => new Date(o.created_at) >= today
  ).length;
  const pendingCount = pendingPayments?.length ?? 0;

  // stock per product
  const stockByProduct: Record<string, number> = {};
  for (const k of keyStock ?? []) {
    stockByProduct[k.product_id] = (stockByProduct[k.product_id] ?? 0) + 1;
  }
  const { data: products } = await svc.from("products").select("id, name").eq("is_active", true);
  const lowStock = (products ?? []).filter((p) => (stockByProduct[p.id] ?? 0) < 5);

  const cards = [
    { icon: "💰", label: "মোট রেভিনিউ", value: formatBDT(revenue), href: "/admin/orders", roles: ["admin"] },
    { icon: "🧾", label: "আজকের অর্ডার", value: toBnDigits(todayOrders), href: "/admin/orders", roles: ["admin", "support"] },
    { icon: "⏳", label: "পেমেন্ট যাচাই বাকি", value: toBnDigits(pendingCount), href: "/admin/payments", roles: ["admin"] },
    { icon: "🔑", label: "অব্যবহৃত কী", value: toBnDigits(keyStock?.length ?? 0), href: "/admin/keys", roles: ["admin"] },
    { icon: "🎮", label: "ID পোস্ট পেন্ডিং", value: toBnDigits(pendingListings ?? 0), href: "/admin/marketplace", roles: ["admin", "support"] },
    { icon: "💸", label: "চলমান এসক্রো ডিল", value: toBnDigits(activeDeals ?? 0), href: "/admin/marketplace", roles: ["admin", "support"] },
    { icon: "🌐", label: "নতুন সার্ভিস রিকোয়েস্ট", value: toBnDigits(newServiceReqs ?? 0), href: "/admin/services", roles: ["admin", "support"] },
    { icon: "💳", label: "উত্তোলন পেন্ডিং", value: toBnDigits(pendingWithdrawals ?? 0), href: "/admin/withdrawals", roles: ["admin"] },
  ].filter((c) => (c.roles as string[]).includes(role));

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link key={c.label} href={c.href} className="glass card-hover rounded-2xl p-5">
            <div className="text-3xl">{c.icon}</div>
            <p className="mt-3 font-display text-2xl font-bold text-white">{c.value}</p>
            <p className="text-sm text-slate-400">{c.label}</p>
          </Link>
        ))}
      </div>

      {lowStock.length > 0 && (
        <div className="glass mt-6 rounded-2xl border-l-2 border-l-amber-400 p-5">
          <p className="font-bold text-amber-300">⚠️ কী স্টক কম — শীঘ্রই শেষ হবে</p>
          <ul className="mt-2 space-y-1 text-sm text-slate-300">
            {lowStock.map((p) => (
              <li key={p.id}>
                {p.name} — মাত্র <b className="text-amber-300">{toBnDigits(stockByProduct[p.id] ?? 0)}</b>টি কী বাকি
              </li>
            ))}
          </ul>
          <Link href="/admin/keys" className="mt-3 inline-block text-sm font-bold text-[#d7ff3f]">
            কী যোগ করুন →
          </Link>
        </div>
      )}

      <div className="glass mt-6 rounded-2xl p-6">
        <h2 className="font-display text-lg font-bold text-white">🚀 দ্রুত কাজ</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {role === "admin" && (
            <>
              <Link href="/admin/payments" className="btn-ghost !justify-start">💳 পেমেন্ট যাচাই করুন</Link>
              <Link href="/admin/keys" className="btn-ghost !justify-start">🔑 নতুন কী যোগ করুন</Link>
              <Link href="/admin/products" className="btn-ghost !justify-start">📦 প্রোডাক্ট ম্যানেজ করুন</Link>
              <Link href="/admin/marketplace" className="btn-ghost !justify-start">🎮 ID পোস্ট যাচাই করুন</Link>
              <Link href="/admin/services" className="btn-ghost !justify-start">🌐 সার্ভিস রিকোয়েস্ট দেখুন</Link>
              <Link href="/admin/staff" className="btn-ghost !justify-start">👥 সাপোর্ট স্টাফ ম্যানেজ করুন</Link>
            </>
          )}
          {role === "support" && (
            <>
              <Link href="/admin/orders" className="btn-ghost !justify-start">🧾 অর্ডার দেখুন</Link>
              <Link href="/admin/marketplace" className="btn-ghost !justify-start">💬 ID বাজার চ্যাটে সাহায্য করুন</Link>
              <Link href="/admin/services" className="btn-ghost !justify-start">🌐 সার্ভিস রিকোয়েস্ট দেখুন</Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
