import type { Metadata } from "next";
import { HomeView } from "./_views";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "FitForm — Fitness Course & Coaching",
  description:
    "FitForm: an 8-week online fitness course demo with a free starter guide, demo checkout, a course area, and coaching-call booking. A DigiPlyra interactive demo website.",
};

export default function Page() {
  return <HomeView />;
}
