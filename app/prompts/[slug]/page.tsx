import Image from "next/image";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PromptActions from "./PromptActions";
import GatedPrompt from "./GatedPrompt";
import SavePrompt from "./SavePrompt";
import ReferenceTry from "./ReferenceTry";

const demoPrompts = [
  { slug:"cinematic-product-campaign", title:"Cinematic Product Campaign", type:"Image", model:"Flux", category:"Image Prompts", prompt:"A premium studio product shot with dramatic lighting, refined material detail, controlled reflections and a polished commercial aesthetic.", excerpt:"Premium product photography designed for cinematic commercial campaigns.", example:"Use this structure when you need a hero product visual with strong lighting direction and clean composition.", videoConcept:"Slow 3-second push-in, subtle parallax, controlled highlights and a final centered hero frame." },
  { slug:"luxury-fashion-editorial", title:"Luxury Fashion Editorial", type:"Image", model:"Midjourney", category:"Creative", prompt:"Editorial fashion photography, sophisticated styling, controlled studio lighting, tactile fabric texture, refined composition, premium magazine aesthetic.", excerpt:"A structured editorial prompt for fashion campaigns and magazine-style visuals.", example:"Useful for campaign boards, lookbooks, covers and premium social creative.", videoConcept:"Gentle camera drift with fabric movement and a soft rack focus from garment detail to model." },
  { slug:"product-launch-film", title:"Product Launch Film", type:"Video", model:"Veo", category:"Video Prompts", prompt:"Cinematic product reveal with a slow camera push, atmospheric lighting, precise motion, premium materials and a clean final hero composition.", excerpt:"A concise cinematic structure for product-launch video concepts.", example:"Adapt the product, environment, lighting and camera movement to your campaign.", videoConcept:"Opening macro detail, reveal through light, slow push-in, controlled rotation and clean end card." }
];

export const dynamicParams=true;

export async function generateMetadata({params}:{params:Promise<{slug:string}>}) {
 const {slug}=await params;
 const demo=demoPrompts.find(x=>x.slug===slug);
 if(demo) return {title:demo.title,description:demo.excerpt,alternates:{canonical:"/prompts/"+demo.slug}};
 if(!process.env.NEXT_PUBLIC_SUPABASE_URL||!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) return {};
 const supabase=await createClient();
 const {data}=await supabase.from("prompts").select("title,excerpt").eq("slug",slug).eq("published",true).maybeSingle();
 return data?{title:data.title,description:data.excerpt,alternates:{canonical:"/prompts/"+slug}}:{};
}

export default async function PromptPage({params}:{params:Promise<{slug:string}>}) {
 const {slug}=await params;
 let p:any=demoPrompts.find(x=>x.slug===slug);
 if(!p && process.env.NEXT_PUBLIC_SUPABASE_URL&&process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY){
   const supabase=await createClient();
   const {data}=await supabase.from("prompts").select("id,slug,title,excerpt,prompt_text,prompt_type,tags,preview_image_url,example_description,video_concept,categories(name),ai_models(name)").eq("slug",slug).eq("published",true).maybeSingle();
   if(data){ const row=data as any; p={...row,type:row.prompt_type,model:Array.isArray(row.ai_models)?row.ai_models[0]?.name:row.ai_models?.name||"AI",category:Array.isArray(row.categories)?row.categories[0]?.name:row.categories?.name||"Prompts",example:row.example_description||"Adapt this prompt to your workflow.",videoConcept:row.video_concept||"Use the prompt as the creative brief for your video generation workflow."}; }
 }
 if(!p) notFound();
 return <main className="detail">
  <nav className="detailnav"><a className="brand" href="/">PROMPT<span>EXA</span></a><a href="/#discover">← Back to discovery</a></nav>
  <article className="detailwrap">
   <div className="detailvisual">{p.preview_image_url?<img src={p.preview_image_url} alt="" />:<Image src={"/api/prompt-image?slug="+encodeURIComponent(p.slug)+"&title="+encodeURIComponent(p.title)+"&type="+encodeURIComponent(p.type)+"&model="+encodeURIComponent(p.model)} alt="" fill unoptimized sizes="(max-width: 600px) 100vw, 980px" priority />}</div>
   <div className="detailmeta">{p.type} · {p.model} · {p.category}</div><h1>{p.title}</h1><p className="lead">{p.excerpt}</p>
   <section className="promptbox"><div><span className="eyebrow">PROMPT</span><div className="detailactions"><GatedPrompt slug={p.slug}/><SavePrompt promptId={p.id}/></div></div></section>
   {String(p.type).toLowerCase()==="image" && <ReferenceTry slug={p.slug}/>}\n   <div className="detailgrid"><section><span className="eyebrow">HOW TO USE</span><p>{p.example}</p></section><section><span className="eyebrow">VIDEO CONCEPT</span><p>{p.videoConcept}</p></section>{String(p.type).toLowerCase()==="image" && <section><span className="eyebrow">FACE / IDENTITY</span><p>If you provide a reference person, the prompt instructs the image model to preserve the same identity and facial features. This is an instruction for the model, not a guarantee across every generator.</p></section>}</div>
  </article>
 </main>;
}