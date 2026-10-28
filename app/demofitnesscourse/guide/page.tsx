import type { Metadata } from "next";
import { GuideView } from "../_views";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Free 7-Day Starter Guide — FitForm",
  description: "FitForm free starter guide — sample content from the demo.",
};

export default function Page() {
  return <GuideView />;
}
