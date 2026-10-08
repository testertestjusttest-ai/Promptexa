import Link from "next/link";
import { requireAdminPage } from "@/lib/admin";
import { formatBDT, ORDER_STATUS_BN, PAYMENT_METHOD_BN, timeAgo } from "@/lib/format";
import { StatusBadge } from "@/components/Section";

export const dynamic = "force-dynamic";

export default async function AdminOrders({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { svc } = await requireAdminPage();
  const { status } = await searchParams;

  let q = svc
    .from("orders")
    .select("id, order_number, customer_name, customer_phone, status, payment_method, total_bdt, created_at")
    .order("created_at", { ascending: false })
    .limit(100);
  if (status) q = q.eq("status", status);
  const { data: orders } = await q;

  const statuses = ["pending", "payment_pending", "paid", "keys_pending", "delivered", "cancelled"];

  return (
    <div>
      <div className="mb-5 flex flex-wrap gap-2">
        <Link href="/admin/orders" className={`rounded-full px-4 py-1.5 text-sm font-semibold ${!status ? "bg-[#d7ff3f] text-[#060913]" : "bg-white/5 text-slate-300"}`}>
          সব
        </Link>
        {statuses.map((s) => (
          <Link key={s} href={`/admin/orders?status=${s}`}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold ${status === s ? "bg-[#d7ff3f] text-[#060913]" : "bg-white/5 text-slate-300"}`}>
            {ORDER_STATUS_BN[s]}
          </Link>
        ))}
      </div>

      <div className="glass overflow-hidden rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-slate-500">
                <th className="px-5 py-4">অর্ডার</th>
                <th className="px-5 py-4">কাস্টমার</th>
                <th className="px-5 py-4">পেমেন্ট</th>
                <th className="px-5 py-4">মোট</th>
                <th className="px-5 py-4">স্ট্যাটাস</th>
                <th className="px-5 py-4">সময়</th>
              </tr>
            </thead>
            <tbody>
              {(orders ?? []).map((o) => (
                <tr key={o.id} className="border-b border-white/5 transition hover:bg-white/[0.02]">
                  <td className="px-5 py-4">
                    <Link href={`/admin/orders/${o.id}`} className="font-bold text-[#d7ff3f] hover:underline">
                      {o.order_number}
                    </Link>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-semibold text-white">{o.customer_name}</p>
                    <p className="text-xs text-slate-500">{o.customer_phone}</p>
                  </td>
                  <td className="px-5 py-4 text-slate-300">
                    {o.payment_method ? PAYMENT_METHOD_BN[o.payment_method] : "—"}
                  </td>
                  <td className="px-5 py-4 font-bold text-white">{formatBDT(o.total_bdt)}</td>
                  <td className="px-5 py-4">
                    <StatusBadge status={o.status} label={ORDER_STATUS_BN[o.status] ?? o.status} />
                  </td>
                  <td className="px-5 py-4 text-xs text-slate-500">{timeAgo(o.created_at)}</td>
                </tr>
              ))}
              {(orders ?? []).length === 0 && (
                <tr><td colSpan={6} className="px-5 py-10 text-center text-slate-500">কোনো অর্ডার নেই</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
