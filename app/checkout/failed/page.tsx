import FailedContent from "./FailedContent";

export const dynamic = "force-dynamic";

export default async function FailedPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <FailedContent order={order} />
    </div>
  );
}
