import Link from "next/link";
import { requireAdminPage } from "@/lib/admin";

export const dynamic = "force-dynamic";

const NAV = [
  { href: "/admin", label: "📊 ওভারভিউ", exact: true },
  { href: "/admin/orders", label: "🧾 অর্ডার" },
  { href: "/admin/payments", label: "💳 পেমেন্ট যাচাই" },
  { href: "/admin/keys", label: "🔑 কী ইনভেন্টরি" },
  { href: "/admin/products", label: "📦 প্রোডাক্ট" },
  { href: "/admin/slides", label: "🎠 স্লাইডার" },
  { href: "/admin/withdrawals", label: "💸 উত্তোলন" },
  { href: "/admin/ads", label: "📢 বিজ্ঞাপন" },
  { href: "/admin/settings", label: "⚙️ সেটিংস" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdminPage();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-bold text-white">
          🛠️ অ্যাডমিন প্যানেল
        </h1>
        <Link href="/" className="btn-ghost !py-2 text-sm">
          ← সাইট দেখুন
        </Link>
      </div>
      <div className="no-scrollbar mb-8 flex gap-2 overflow-x-auto">
        {NAV.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            className="shrink-0 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-[#d7ff3f]/40 hover:text-white"
          >
            {n.label}
          </Link>
        ))}
      </div>
      {children}
    </div>
  );
}
