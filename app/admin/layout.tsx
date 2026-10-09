import Link from "next/link";
import { getAdminAccess } from "@/lib/admin";

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
  const access = await getAdminAccess();
  if (!access.ok) {
    const email = access.reason === "denied" ? access.email : "";
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="glass rounded-3xl p-8">
          <div className="text-5xl">🔒</div>
          <h1 className="font-display mt-4 text-xl font-bold text-white">
            অ্যাডমিন এক্সেস নেই
          </h1>
          {access.reason === "login" ? (
            <>
              <p className="mt-2 text-sm text-slate-400">
                অ্যাডমিন প্যানেলে ঢুকতে আগে লগইন করুন।
              </p>
              <Link href="/auth/login?next=/admin" className="btn-vault mt-6 inline-flex">
                লগইন করুন
              </Link>
            </>
          ) : (
            <>
              <p className="mt-2 text-sm text-slate-400">
                আপনি এই অ্যাকাউন্টে লগইন আছেন:
              </p>
              <code className="mt-2 block truncate rounded-xl bg-black/40 px-4 py-3 text-sm text-[#d7ff3f]">
                {email}
              </code>
              <div className="mt-4 rounded-2xl bg-black/30 p-4 text-left text-sm text-slate-300">
                <p className="font-bold text-white">✅ সমাধান (যেকোনো একটা):</p>
                <ol className="mt-2 list-decimal space-y-2 pl-5">
                  <li>
                    Vercel → Settings → Environment Variables-এ{" "}
                    <code className="text-[#d7ff3f]">ADMIN_EMAILS</code> নামে এই ইমেইলটা
                    বসিয়ে Redeploy করুন — অটো অ্যাডমিন হয়ে যাবেন।
                  </li>
                  <li>
                    অথবা Supabase SQL Editor-এ চালান:
                    <code className="mt-1 block rounded-lg bg-black/50 p-2 font-mono text-xs text-lime-300">
                      update public.profiles set is_admin = true where email = '{email}';
                    </code>
                  </li>
                </ol>
              </div>
              <Link href="/" className="btn-ghost mt-6 inline-flex text-sm">
                ← হোমে ফিরুন
              </Link>
            </>
          )}
        </div>
      </div>
    );
  }

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
