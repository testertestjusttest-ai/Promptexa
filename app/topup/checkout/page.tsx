import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import CheckoutWizard from "../_components/CheckoutWizard";
import type { TopUpPackage } from "@/lib/topup";

export const dynamic = "force-dynamic";

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ package?: string }> }) {
  const sp = await searchParams;
  return {
    title: "চেকআউট | Free Fire Diamond Top-Up",
    description: "প্যাকেজ চেকআউট — Player UID ও পেমেন্ট।",
  };
}

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ package?: string }>;
}) {
  const sp = await searchParams;
  const packageId = sp.package ?? "";

  let pkg: TopUpPackage | null = null;
  if (packageId) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("topup_packages")
      .select("*")
      .eq("id", packageId)
      .eq("is_active", true)
      .single();
    pkg = (data as TopUpPackage | null) ?? null;
  }

  if (!pkg) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0d0a07] px-4 text-white">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-center">
          <div className="text-5xl">😕</div>
          <h1 className="mt-4 text-xl font-black">প্যাকেজ পাওয়া যায়নি</h1>
          <p className="mt-2 text-sm text-orange-100/60">
            প্যাকেজটি হয়তো বন্ধ আছে বা লিংকটি ঠিক নেই।
          </p>
          <Link
            href="/topup"
            className="mt-6 inline-block rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 px-8 py-3 font-extrabold text-black"
          >
            ⬅️ প্যাকেজে ফিরে যান
          </Link>
        </div>
      </div>
    );
  }

  return <CheckoutWizard pkg={pkg} />;
}
