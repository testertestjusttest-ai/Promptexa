import Image from "next/image";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const fallback: Record<string, { name: string; description: string }> = {
  "image-prompts": { name: "Image Prompts", description: "Explore visual prompts for product shots, portraits, editorial work, cinematic scenes and creative image generation." },
  "video-prompts": { name: "Video Prompts", description: "Explore cinematic video concepts for product films, ads, reels, camera movement and image-to-video workflows." },
  "chat-writing": { name: "Chat & Writing", description: "Explore prompts for writing, research, productivity, brainstorming and everyday AI conversations." },
  coding: { name: "Coding", description: "Explore prompts for debugging, architecture, code review, automation and software development." },
  marketing: { name: "Marketing", description: "Explore prompts for advertising, SEO, branding, social content, sales and growth." },
  creative: { name: "Creative", description: "Explore prompts for illustration, 3D, fashion, posters, storytelling and experimental creative work." },
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const fallbackCategory = fallback[slug];
  if (fallbackCategory) return { title: fallbackCategory.name, description: fallbackCategory.description, alternates: { canonical: `/categories/${slug}` } };
  return {};
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const base = fallback[slug];
  if (!base && (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)) notFound();

  let category: any = base;
  let prompts: any[] = [];

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    const supabase = await createClient();
    const { data: categoryData } = await supabase.from("categories").select("id,name,slug").eq("slug", slug).maybeSingle();
    category = (categoryData as any) || base;
    if (!category) notFound();

    const { data: promptData } = await supabase
      .from("prompts")
      .select("id,slug,title,excerpt,prompt_type,preview_image_url,ai_models(name)")
      .eq("published", true)
      .eq("category_id", category.id)
      .order("featured", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(48);

    prompts = (promptData || []) as any[];
  }

  if (!category) notFound();

  return (
    <main>
      <nav className="detailnav"><a className="brand" href="/">PROMPT<span>EXA</span></a><a href="/#categories">← All categories</a></nav>
      <section className="section">
        <span className="eyebrow">CATEGORY</span>
        <h1>{category.name}</h1>
        <p className="lead">{base?.description || `Explore AI prompts in ${category.name}.`}</p>
        <div className="promptgrid" style={{ marginTop: 42 }}>
          {prompts.map((p, i) => {
            const model = Array.isArray(p.ai_models) ? p.ai_models[0]?.name : p.ai_models?.name || "AI";
            return (
              <article className="promptcard" key={p.slug}>
                <a href={`/prompts/${p.slug}`} className={`visual v${i % 4}`}>
                  <Image src={p.preview_image_url || `/api/prompt-image?title=${encodeURIComponent(p.title)}&type=${encodeURIComponent(p.prompt_type)}&model=${encodeURIComponent(model)}`} alt="" fill sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 25vw" />
                  <span>{String(p.prompt_type).toUpperCase()}</span>
                </a>
                <div className="cardbody">
                  <div className="meta"><span>{p.prompt_type}</span><span>•</span><span>{model}</span></div>
                  <h3><a href={`/prompts/${p.slug}`}>{p.title}</a></h3>
                  <p>{p.excerpt}</p>
                  <div className="cardfoot"><a className="copy" href={`/prompts/${p.slug}`}>View prompt</a></div>
                </div>
              </article>
            );
          })}
        </div>
        {prompts.length === 0 && <div className="empty">New prompts are being prepared for this category.</div>}
      </section>
    </main>
  );
}
