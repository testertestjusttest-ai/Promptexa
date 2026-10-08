import { requireAdminPage } from "@/lib/admin";
import ProductsClient from "./ProductsClient";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const { svc } = await requireAdminPage();
  const { data: categories } = await svc
    .from("categories")
    .select("id, name_bn, slug")
    .eq("is_active", true)
    .order("sort");

  return (
    <div>
      <h2 className="mb-5 font-display text-xl font-bold text-white">📦 প্রোডাক্ট ম্যানেজমেন্ট</h2>
      <ProductsClient categories={(categories ?? []) as { id: string; name_bn: string; slug: string }[]} />
    </div>
  );
}
