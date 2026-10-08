"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OrderActions({
  paymentId,
  orderId,
}: {
  paymentId: string;
  orderId: string;
}) {
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);
  const [error, setError] = useState("");
  const router = useRouter();

  async function act(kind: "approve" | "reject") {
    if (!confirm(kind === "approve" ? "পেমেন্ট অ্যাপ্রুভ করে কী ডেলিভারি দেবেন?" : "পেমেন্ট রিজেক্ট করবেন?")) return;
    setLoading(kind);
    setError("");
    try {
      const res = await fetch(`/api/admin/payments/${kind}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payment_id: paymentId, order_id: orderId }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "ব্যর্থ");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "ব্যর্থ");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="mt-3">
      <div className="flex gap-2">
        <button
          onClick={() => act("approve")}
          disabled={!!loading}
          className="rounded-lg bg-[#d7ff3f] px-4 py-2 text-sm font-bold text-[#060913] disabled:opacity-50"
        >
          {loading === "approve" ? "..." : "✓ অ্যাপ্রুভ ও ডেলিভার"}
        </button>
        <button
          onClick={() => act("reject")}
          disabled={!!loading}
          className="rounded-lg bg-red-500/15 px-4 py-2 text-sm font-bold text-red-300 disabled:opacity-50"
        >
          {loading === "reject" ? "..." : "✕ রিজেক্ট"}
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-red-300">⚠️ {error}</p>}
    </div>
  );
}
