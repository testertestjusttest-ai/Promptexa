import MarketAdminClient from "./MarketAdminClient";

export const dynamic = "force-dynamic";

export default function AdminMarketplacePage() {
  return (
    <div>
      <h2 className="mb-6 text-xl font-bold text-white">🎮 ID মার্কেটপ্লেস ম্যানেজমেন্ট</h2>
      <MarketAdminClient />
    </div>
  );
}
