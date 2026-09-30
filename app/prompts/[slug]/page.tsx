import { notFound } from "next/navigation";

const demoPrompts = [
  { slug:"cinematic-product-campaign", title:"Cinematic Product Campaign", type:"Image", model:"Flux", category:"Image Prompts", prompt:"A premium studio product shot with dramatic lighting, refined material detail, controlled reflections and a polished commercial aesthetic.", excerpt:"Premium product photography designed for cinematic commercial campaigns.", example:"Use this structure when you need a hero product visual with strong lighting direction and clean composition.", videoConcept:"Slow 3-second push-in, subtle parallax, controlled highlights and a final centered hero frame." },
  { slug:"luxury-fashion-editorial", title:"Luxury Fashion Editorial", type:"Image", model:"Midjourney", category:"Creative", prompt:"Editorial fashion photography, sophisticated styling, controlled studio lighting, tactile fabric texture, refined composition, premium magazine aesthetic.", excerpt:"A structured editorial prompt for fashion campaigns and magazine-style visuals.", example:"Useful for campaign boards, lookbooks, covers and premium social creative.", videoConcept:"Gentle camera drift with fabric movement and a soft rack focus from garment detail to model." },
  { slug:"product-launch-film", title:"Product Launch Film", type:"Video", model:"Veo", category:"Video Prompts", prompt:"Cinematic product reveal with a slow camera push, atmospheric lighting, precise motion, premium materials and a clean final hero composition.", excerpt:"A concise cinematic structure for product-launch video concepts.", example:"Adapt the product, environment, lighting and camera movement to your campaign.", videoConcept:"Opening macro detail, reveal through light, slow push-in, controlled rotation and clean end card." }
];

export function generateStaticParams() { return demoPrompts.map(p => ({ slug:p.slug })); }

export async function generateMetadata({ params }: { params: Promise<{slug:string}> }) {
  const {slug}=await params; const p=demoPrompts.find(x=>x.slug===slug);
  return p ? { title:p.title, description:p.excerpt } : {};
}

export default async function PromptPage({ params }: { params: Promise<{slug:string}> }) {
  const {slug}=await params; const p=demoPrompts.find(x=>x.slug===slug);
  if(!p) notFound();
  return <main className="detail">
    <nav className="detailnav"><a className="brand" href="/">PROMPT<span>EXA</span></a><a href="/#discover">← Back to discovery</a></nav>
    <article className="detailwrap">
      <div className="detailvisual"><span>{p.type.toUpperCase()}</span></div>
      <div className="detailmeta">{p.type} · {p.model} · {p.category}</div>
      <h1>{p.title}</h1><p className="lead">{p.excerpt}</p>
      <section className="promptbox"><div><span className="eyebrow">PROMPT</span><button onClick={undefined} aria-label="Copy prompt is enabled in the discovery UI">Copy from discovery</button></div><pre>{p.prompt}</pre></section>
      <div className="detailgrid"><section><span className="eyebrow">HOW TO USE</span><p>{p.example}</p></section><section><span className="eyebrow">VIDEO CONCEPT</span><p>{p.videoConcept}</p></section></div>
    </article>
  </main>;
}