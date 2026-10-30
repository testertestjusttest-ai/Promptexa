import CheckoutClient, { CheckoutHeading } from "./CheckoutClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Checkout",
  description:
    "Complete your order securely — review your premium subscriptions and pay with card or mobile wallet.",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "DigiPlyra",
    url: "https://promptexa.vercel.app/checkout",
    title: "Checkout — DigiPlyra",
    description:
      "Complete your order securely — review your premium subscriptions and pay with card or mobile wallet.",
  },
};

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <CheckoutHeading />
      <CheckoutClient />
    </div>
  );
}
