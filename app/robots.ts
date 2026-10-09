import type { MetadataRoute } from "next";

const BASE = "https://promptexa.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin/", "/dashboard"],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  };
}
