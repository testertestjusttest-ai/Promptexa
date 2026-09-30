import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base="https://promptexa.com";
  const urls:MetadataRoute.Sitemap=[{url:base,lastModified:new Date(),changeFrequency:"daily",priority:1}];
  if(process.env.NEXT_PUBLIC_SUPABASE_URL&&process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY){
    const supabase=await createClient();
    const {data}=await supabase.from("prompts").select("slug,updated_at").eq("published",true).order("id",{ascending:true}).limit(50000);
    for(const p of data??[]) urls.push({url:`${base}/prompts/${p.slug}`,lastModified:p.updated_at?new Date(p.updated_at):new Date(),changeFrequency:"monthly",priority:.7});
  } else {
    for(const slug of ["cinematic-product-campaign","luxury-fashion-editorial","product-launch-film"]) urls.push({url:`${base}/prompts/${slug}`,priority:.7});
  }
  return urls;
}