import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: [
      "https://promptexa.com/sitemap/0.xml",
      "https://promptexa.com/sitemap/1.xml",
    ],
  };
}