import CheckoutClient, { CheckoutHeading } from "./CheckoutClient";

export const dynamic = "force-dynamic";

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <CheckoutHeading />
      <CheckoutClient />
    </div>
  );
}
