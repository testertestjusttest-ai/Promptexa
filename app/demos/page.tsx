import type { Metadata } from "next";
import DemosClient from "./DemosClient";

export const metadata: Metadata = {
  title: "All Demo Websites",
  description:
    "Browse every live demo website — shops, services, bookings and more. Open any demo and explore it — every button works. If you like one, get a site like it built for you.",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "DigiPlyra",
    url: "https://promptexa.vercel.app/demos",
    title: "All Demo Websites — DigiPlyra",
    description:
      "Browse every live demo website — shops, services, bookings and more. Open any demo and explore it — every button works. If you like one, get a site like it built for you.",
  },
};

export default function AllDemosPage() {
  return <DemosClient />;
}
