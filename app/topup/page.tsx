import { createClient } from "@/lib/supabase/server";
import TopUpClient from "./_components/TopUpClient";
import type { TopUpPackage } from "@/lib/topup";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Free Fire Diamond Top-Up",
  description:
    "Enter your Player UID and get Free Fire diamonds delivered straight to your game — fast delivery, secure payment.",
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

  // logged-in user's full name for a personalized voice welcome
  let userName: string | null = null;
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data: prof } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();
      const raw =
        (prof?.full_name as string | null) ||
        ((user.user_metadata as Record<string, unknown>)?.full_name as string | undefined) ||
        user.email?.split("@")[0] ||
        "";
      userName = raw.trim() ? raw.trim() : null;
    }
  } catch {
    userName = null;
  }

  return <TopUpClient packages={packages} userName={userName} />;
}
