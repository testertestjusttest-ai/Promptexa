import type { Metadata } from "next";
import AgencyClient from "./web-dev/AgencyClient";
import { DEMOS } from "./web-dev/demos/demos";

export async function generateMetadata(): Promise<Metadata> {
  const n = DEMOS.length;
  return {
    title: "DigiPlyra — Website Design Agency",
    description: `DigiPlyra builds complete websites for your business — ${n}+ live demo designs, packages from 4,999 Tk, every site with 30+ pages and a full admin panel. Pick a demo, get a free quote.`,
    alternates: { canonical: "https://promptexa.vercel.app/" },
    openGraph: {
      type: "website",
      locale: "en_US",
      alternateLocale: ["bn_BD", "hi_IN"],
      siteName: "DigiPlyra",
      url: "https://promptexa.vercel.app/",
      title: "DigiPlyra — Website Design Agency",
      description: `Complete websites for your business — ${n}+ live demos, packages from 4,999 Tk, 30+ pages and a full admin panel per site.`,
      images: [{ url: "/logo.jpg", width: 512, height: 512, alt: "DigiPlyra" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "DigiPlyra — Website Design Agency",
      description: `Complete websites for your business — ${n}+ live demos, packages from 4,999 Tk, 30+ pages and a full admin panel per site.`,
      images: ["/logo.jpg"],
    },
  };
}

export default function HomePage() {
  return <AgencyClient />;
}
