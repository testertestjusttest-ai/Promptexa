import { requireAdminPage } from "@/lib/admin";
import KeysClient from "./KeysClient";

export const dynamic = "force-dynamic";

export default async function KeysPage() {
  const { svc } = await requireAdminPage();
  const { data: products } = await svc
    .from("products")
    .select("id, name, plans(id, label_bn)")
    .eq("is_active", true)
    .order("sort");

  return (
    <div>
      <h2 className="mb-5 font-display text-xl font-bold text-white">🔑 কী ইনভেন্টরি</h2>
      <KeysClient products={(products ?? []) as { id: string; name: string; plans: { id: string; label_bn: string }[] }[]} />
    </div>
  );
}
