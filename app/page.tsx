"use client";

import { useMemo, useState } from "react";

const categories = [
  ["✦","Image Prompts","Create visuals, portraits, products and cinematic scenes."],
  ["◉","Video Prompts","Build cinematic shots, ads, reels and image-to-video concepts."],
  ["⌘","Chat & Writing","Writing, research, productivity and everyday AI."],
  ["</>","Coding","Debug, build, review and automate with AI."],
  ["↗","Marketing","Ads, SEO, branding, social content and sales."],
  ["✺","Creative","Illustration, 3D, fashion, posters and experimental ideas."]
];

const prompts = [
  ["Cinematic Product Campaign","Image","Flux","A premium studio product shot with dramatic lighting and a polished commercial aesthetic.","product"],
  ["Luxury Fashion Editorial","Image","Midjourney","Editorial fashion photography with controlled lighting, texture and a sophisticated magazine look.","editorial"],
  ["Product Launch Film","Video","Veo","A cinematic product reveal with a slow camera push, atmospheric lighting and precise motion.","cinematic"],
  ["YouTube Thumbnail Hook","Image","Image AI","A high-contrast thumbnail concept designed around a single clear visual hook.","creator"]
];

export default function Home() {
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState("");
  const filtered = useMemo(() => {
    const q=query.toLowerCase().trim();
    return q ? prompts.filter(p => p.join(" ").toLowerCase().includes(q)) : prompts;
  }, [query]);

  async function copyPrompt(title:string, text:string) {
    try { await navigator.clipboard.writeText(text); setCopied(title); setTimeout(()=>setCopied(""),1600); } catch {}
  }

  return <main>
    <header className="nav">
      <a className="brand" href="/">PROMPT<span>EXA</span></a>
      <nav className="navlinks"><a href="#discover">Discover</a><a href="#categories">Categories</a><a href="#models">AI Models</a><a href="#collections">Collections</a></nav>
      <div className="navactions"><button className="iconbtn" aria-label="Focus search" onClick={()=>document.getElementById("prompt-search")?.focus()}>⌕</button><button className="ghost">Sign in</button></div>
    </header>

    <section className="hero">
      <div className="eyebrow">THE VISUAL AI PROMPT DISCOVERY PLATFORM</div>
      <h1>Find the prompt.<br/><em>See the possibility.</em></h1>
      <p>Explore a growing library of carefully structured AI prompts for images, videos, writing, coding, marketing and more.</p>
      <div className="search"><span>⌕</span><input id="prompt-search" value={query} onChange={e=>setQuery(e.target.value)} aria-label="Search prompts" placeholder="Search 50,000+ AI prompts..." /><kbd>⌘ K</kbd></div>
      <div className="quick"><span>Popular:</span><button onClick={()=>setQuery("cinematic")}>cinematic</button><button onClick={()=>setQuery("product")}>product photography</button><button onClick={()=>setQuery("thumbnail")}>youtube thumbnail</button><button onClick={()=>setQuery("video")}>AI video</button></div>
    </section>

    <section className="section" id="discover">
      <div className="sectionhead"><div><span className="eyebrow">DISCOVER</span><h2>Prompts worth exploring</h2></div><a className="viewall" href="#categories">Explore categories →</a></div>
      <div className="promptgrid">{filtered.map((p,i)=><article className="promptcard" key={p[0]}>
        <div className={"visual v"+i}><span>{p[4].toUpperCase()}</span></div>
        <div className="cardbody"><div className="meta"><span>{p[1]}</span><span>•</span><span>{p[2]}</span></div><h3>{p[0]}</h3><p>{p[3]}</p><div className="cardfoot"><button className="copy" onClick={()=>copyPrompt(p[0],p[3])}>{copied===p[0]?"Copied ✓":"Copy prompt"}</button><button className="save" aria-label={"Save "+p[0]}>♡</button></div></div>
      </article>)}</div>
      {query && filtered.length===0 && <div className="empty">No demo prompts match “{query}”. Try another search.</div>}
    </section>

    <section className="section muted" id="categories">
      <div className="sectionhead"><div><span className="eyebrow">EXPLORE</span><h2>Start with a category</h2></div></div>
      <div className="catgrid">{categories.map(c=><a className="cat" href="#discover" key={c[1]} onClick={()=>setQuery(c[1].replace(" Prompts","").replace(" & Writing",""))}><div className="caticon">{c[0]}</div><h3>{c[1]}</h3><p>{c[2]}</p><span>Explore →</span></a>)}</div>
    </section>

    <section className="statement" id="models"><span className="eyebrow">BUILT FOR CREATION</span><h2>Discover → Understand → Copy → Create</h2><p>Every prompt is designed to show what it can create, how it works and where it fits into your workflow.</p></section>
    <footer id="collections"><div className="brand">PROMPT<span>EXA</span></div><p>Visual AI prompt discovery, built for creators.</p><div className="footerlinks"><a href="#discover">Discover</a><a href="#categories">Categories</a><a href="#models">AI Models</a><a href="/">Privacy</a></div></footer>
  </main>;
}