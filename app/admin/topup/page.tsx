import TopUpAdmin from "./TopUpAdmin";

export const dynamic = "force-dynamic";

export default function TopUpAdminPage() {
  return (
    <div>
      <h2 className="mb-5 font-display text-xl font-bold text-white">💎 ডায়মন্ড টপ-আপ</h2>
      <p className="mb-5 text-sm text-slate-500">
        প্যাকেজের দাম/অফার এখানেই বদলান — <b className="text-slate-300">/topup</b> পেজে সাথে
        সাথে আপডেট হবে। অর্ডার এলে কাস্টমারের UID দেখে রিসেলার প্যানেল থেকে টপ-আপ করে{" "}
        <b className="text-slate-300">ডেলিভারড</b> চাপুন।
      </p>
      <TopUpAdmin />
    </div>
  );
}
