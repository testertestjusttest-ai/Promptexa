import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdminPage } from "@/lib/admin";
import { formatBDT, ORDER_STATUS_BN, PAYMENT_METHOD_BN, timeAgo } from "@/lib/format";
import { StatusBadge } from "@/components/Section";
import OrderActions from "./OrderActions";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { svc } = await requireAdminPage();

  const { data: order } = await svc.from("orders").select("*").eq("id", id).single();
  if (!order) notFound();

  const [{ data: items }, { data: payments }, { data: keys }] = await Promise.all([
    svc.from("order_items").select("*").eq("order_id", id),
    svc.from("payments").select("*").eq("order_id", id).order("created_at", { ascending: false }),
    svc.from("delivered_keys").select("*").eq("order_id", id),
  ]);

  return (
    <div>
      <Link href="/admin/orders" className="text-sm text-slate-400 hover:text-[#d7ff3f]">
        ← সব অর্ডার
      </Link>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-2xl font-bold text-white">{order.order_number}</h2>
        <StatusBadge status={order.status} label={ORDER_STATUS_BN[order.status] ?? order.status} />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <div className="glass rounded-2xl p-6">
          <h3 className="font-bold text-white">👤 কাস্টমার</h3>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-slate-500">নাম</dt><dd className="text-white">{order.customer_name}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">ফোন</dt><dd className="text-white">{order.customer_phone}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">ইমেইল</dt><dd className="text-white">{order.customer_email ?? "—"}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">সময়</dt><dd className="text-white">{timeAgo(order.created_at)}</dd></div>
          </dl>
          <h3 className="mt-6 font-bold text-white">🧾 আইটেম</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {(items ?? []).map((it) => (
              <li key={it.id} className="flex justify-between">
                <span className="text-slate-300">{it.product_name} <span className="text-slate-500">({it.plan_label_bn} × {it.qty})</span></span>
                <span className="font-semibold text-white">{formatBDT(it.price_bdt * it.qty)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex justify-between border-t border-white/10 pt-3 font-bold">
            <span className="text-slate-300">সর্বমোট</span>
            <span className="text-[#d7ff3f]">{formatBDT(order.total_bdt)}</span>
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <h3 className="font-bold text-white">💳 পেমেন্ট</h3>
          <div className="mt-3 space-y-3">
            {(payments ?? []).map((p) => (
              <div key={p.id} className="rounded-xl bg-white/[0.03] p-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white">
                    {PAYMENT_METHOD_BN[p.method] ?? p.method} — {formatBDT(p.amount_bdt)}
                  </span>
                  <StatusBadge status={p.status} label={p.status === "success" ? "সফল" : p.status === "pending" ? "অপেক্ষমাণ" : p.status === "failed" ? "ব্যর্থ" : "বাতিল"} />
                </div>
                {p.trx_id && <p className="mt-1.5 text-slate-400">TrxID: <code className="text-white">{p.trx_id}</code></p>}
                {p.sender_number && <p className="text-slate-400">সেন্ডার: <span className="text-white">{p.sender_number}</span></p>}
                {p.ssl_tran_id && <p className="text-slate-400">SSL tran_id: <span className="text-white">{p.ssl_tran_id}</span></p>}
                <p className="mt-1 text-xs text-slate-500">{timeAgo(p.created_at)}</p>
                {p.status === "pending" && ["bkash", "nagad", "rocket"].includes(p.method) && (
                  <OrderActions paymentId={p.id} orderId={order.id} />
                )}
              </div>
            ))}
            {(payments ?? []).length === 0 && <p className="text-sm text-slate-500">পেমেন্ট রেকর্ড নেই</p>}
          </div>

          {(keys ?? []).length > 0 && (
            <>
              <h3 className="mt-6 font-bold text-white">🔑 ডেলিভার্ড কী</h3>
              <div className="mt-3 space-y-2">
                {(keys ?? []).map((k) => (
                  <code key={k.id} className="block break-all rounded-xl bg-black/40 p-3 font-mono text-xs text-white">
                    {k.key_text}
                  </code>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
