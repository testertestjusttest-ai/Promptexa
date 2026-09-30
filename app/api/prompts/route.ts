import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams }=new URL(request.url);
  const q=searchParams.get("q")?.trim() ?? "";
  const type=searchParams.get("type") ?? "";
  const category=searchParams.get("category") ?? "";
  const model=searchParams.get("model") ?? "";
  const page=Math.max(1,Number(searchParams.get("page")||1));
  const limit=Math.min(48,Math.max(1,Number(searchParams.get("limit")||24)));
  const from=(page-1)*limit;
  const to=from+limit-1;

  const supabase=await createClient();
  let query=supabase.from("prompts").select("id,slug,title,excerpt,prompt_type,tags,preview_image_url,featured,copy_count,save_count,categories(name,slug),ai_models(name,slug)",{count:"exact"}).eq("published",true);
  if(q) query=query.or(`title.ilike.%${q}%,excerpt.ilike.%${q}%,prompt_text.ilike.%${q}%`);
  if(type) query=query.eq("prompt_type",type);
  if(category) query=query.eq("categories.slug",category);
  if(model) query=query.eq("ai_models.slug",model);
  const {data,error,count}=await query.order("featured",{ascending:false}).order("created_at",{ascending:false}).range(from,to);
  if(error) return NextResponse.json({error:error.message},{status:500});
  return NextResponse.json({data:data??[],count:count??0,page,limit});
}
