import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

const base = "https://promptexa.com";
const CHUNK_SIZE = 45000;

export async function generateSitemaps() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    return [{ id: 0 }];
  }

  const supabase = await createClient();
  const { count } = await supabase
    .from("prompts")
    .select("id", { count: "exact", head: true })
    .eq("published", true);

  const total = count ?? 0;
  return Array.from({ length: Math.max(1, Math.ceil((total + 1) / CHUNK_SIZE)) }, (_, id) => ({ id }));
}

export default async function sitemap({ id }: { id: number }): Promise<MetadataRoute.Sitemap> {
  const urls: MetadataRoute.Sitemap = [];

  if (id === 0) {
    urls.push({
      url: base,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    });
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    if (id === 0) {
      for (const slug of ["cinematic-product-campaign", "luxury-fashion-editorial", "product-launch-film"]) {
        urls.push({ url: `${base}/prompts/${slug}`, priority: 0.7 });
      }
    }
    return urls;
  }

  const supabase = await createClient();
  const promptOffset = id * CHUNK_SIZE - (id === 0 ? 0 : 1);
  const { data } = await supabase
    .from("prompts")
    .select("slug,updated_at")
    .eq("published", true)
    .order("id", { ascending: true })
    .range(Math.max(0, promptOffset), Math.max(-1, promptOffset + CHUNK_SIZE - 1 - (id === 0 ? 1 : 0)));

  for (const prompt of data ?? []) {
    urls.push({
      url: `${base}/prompts/${prompt.slug}`,
      lastModified: prompt.updated_at ? new Date(prompt.updated_at) : new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    });
  }

  return urls;
}
