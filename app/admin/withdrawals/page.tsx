import type { Metadata } from "next";
import WithdrawalsClient from "./WithdrawalsClient";

export const metadata: Metadata = { title: "উত্তোলন রিকোয়েস্ট — অ্যাডমিন" };
export const dynamic = "force-dynamic";

export default function WithdrawalsPage() {
  return (
    <div>
      <h2 className="mb-6 font-display text-xl font-bold text-white">
        💸 উত্তোলন রিকোয়েস্ট
      </h2>
      <WithdrawalsClient />
    </div>
  );
}
