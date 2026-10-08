import { SectionHeading } from "@/components/Section";
import CheckoutClient from "./CheckoutClient";

export const dynamic = "force-dynamic";

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <SectionHeading kicker="চেকআউট" title="অর্ডার সম্পন্ন করুন" />
      <CheckoutClient />
    </div>
  );
}
