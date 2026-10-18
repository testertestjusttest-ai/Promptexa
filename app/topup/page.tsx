import { createClient } from "@/lib/supabase/server";
import TopUpClient from "./_components/TopUpClient";
import type { TopUpPackage } from "@/lib/topup";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Free Fire Diamond Top-Up | DigiPlyra",
  description:
    "Player UID দিলেই সরাসরি গেমে Free Fire ডায়মন্ড — দ্রুত ডেলিভারি, নিরাপদ পেমেন্ট।",
};

export default async function TopUpPage() {
  const supabase = await createClient();
  let packages: TopUpPackage[] = [];
  try {
    const { data } = await supabase
      .from("topup_packages")
      .select("*")
      .eq("is_active", true)
      .order("sort");
    packages = (data ?? []) as TopUpPackage[];
  } catch {
    packages = [];
  }
  return <TopUpClient packages={packages} />;
}
