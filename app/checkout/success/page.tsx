import OrderStatus from "./OrderStatus";

export const dynamic = "force-dynamic";

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      {order ? (
        <OrderStatus orderNumber={order} />
      ) : (
        <p className="text-center text-slate-400">অর্ডার নম্বর পাওয়া যায়নি।</p>
      )}
    </div>
  );
}
