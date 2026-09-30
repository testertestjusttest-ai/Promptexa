import type { MetadataRoute } from "next";
export default function sitemap(): MetadataRoute.Sitemap {
  const base="https://promptexa.com";
  const slugs=["cinematic-product-campaign","luxury-fashion-editorial","product-launch-film"];
  return [
    {url:base,lastModified:new Date(),changeFrequency:"daily",priority:1},
    ...slugs.map(slug=>({url:`${base}/prompts/${slug}`,lastModified:new Date(),changeFrequency:"weekly" as const,priority:.8}))
  ];
}