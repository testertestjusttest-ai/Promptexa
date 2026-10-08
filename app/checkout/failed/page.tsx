import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function FailedPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="glass mx-auto max-w-lg rounded-3xl p-10 text-center">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-red-500/15 text-4xl">
          ❌
        </div>
        <h1 className="mt-5 font-display text-2xl font-bold text-white">
          পেমেন্ট সম্পন্ন হয়নি
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          পেমেন্ট বাতিল হয়েছে বা ব্যর্থ হয়েছে। কোনো টাকা কাটা হলে তা ফেরত
          যাবে। আবার চেষ্টা করুন।
        </p>
        {order && (
          <p className="mt-4 text-sm text-slate-500">
            অর্ডার নম্বর: <span className="font-bold text-white">{order}</span>
          </p>
        )}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/checkout" className="btn-vault">🔄 আবার চেষ্টা করুন</Link>
          <Link href="/shop" className="btn-ghost">শপে ফিরুন</Link>
        </div>
      </div>
    </div>
  );
}
