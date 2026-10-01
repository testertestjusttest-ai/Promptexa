"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";

type Prompt={id?:number;slug:string;title:string;excerpt:string;prompt_text?:string;prompt_type:string;model?:string;tags?:string[];preview_image_url?:string|null;categories?:{name:string;slug:string}|{name:string;slug:string}[]|null;ai_models?:{name:string;slug:string}|{name:string;slug:string}[]|null};

const categories=[["✦","Image Prompts","Create visuals, portraits, products and cinematic scenes.","image"],["◉","Video Prompts","Build cinematic shots, ads, reels and image-to-video concepts.","video"],["⌘","Chat & Writing","Writing, research, productivity and everyday AI.","chat"],["</>","Coding","Debug, build, review and automate with AI.","coding"],["↗","Marketing","Ads, SEO, branding, social content and sales.","marketing"],["✺","Creative","Illustration, 3D, fashion, posters and experimental ideas.","creative"]];

const demo:Prompt[]=[
{slug:"cinematic-product-campaign",title:"Cinematic Product Campaign",prompt_type:"image",model:"Flux",excerpt:"A premium studio product shot with dramatic lighting and a polished commercial aesthetic.",tags:["product","cinematic"]},
{slug:"luxury-fashion-editorial",title:"Luxury Fashion Editorial",prompt_type:"image",model:"Midjourney",excerpt:"Editorial fashion photography with controlled lighting, texture and a sophisticated magazine look.",tags:["fashion","editorial"]},
{slug:"product-launch-film",title:"Product Launch Film",prompt_type:"video",model:"Veo",excerpt:"A cinematic product reveal with a slow camera push, atmospheric lighting and precise motion.",tags:["product","cinematic"]},
{slug:"youtube-thumbnail-hook",title:"YouTube Thumbnail Hook",prompt_type:"image",model:"Image AI",excerpt:"A high-contrast thumbnail concept designed around a single clear visual hook.",tags:["youtube","creator"]}
];

export default function Home(){
 const [query,setQuery]=useState(""); const [type,setType]=useState(""); const [items,setItems]=useState<Prompt[]>(demo); const [loading,setLoading]=useState(false); const [copied,setCopied]=useState("");
 const filtered=useMemo(()=>query?items:items,[query,items]);

 useEffect(()=>{let cancelled=false; const load=async()=>{setLoading(true); try{const qs=new URLSearchParams(); if(query)qs.set("q",query); if(type)qs.set("type",type); qs.set("limit","24"); const r=await fetch("/api/prompts?"+qs.toString(),{cache:"no-store"}); if(r.ok){const j=await r.json(); if(!cancelled&&Array.isArray(j.data))setItems(j.data)}}catch{} finally{if(!cancelled)setLoading(false)}}; const t=setTimeout(load,180); return()=>{cancelled=true;clearTimeout(t)}},[query,type]);

 async function copyPrompt(title:string,prompt:string){try{await navigator.clipboard.writeText(prompt);setCopied(title);setTimeout(()=>setCopied(""),1400)}catch{}}

 return <main>
 <header className="nav"><a className="brand" href="/">PROMPT<span>EXA</span></a><nav className="navlinks"><a href="#discover">Discover</a><a href="#categories">Categories</a><a href="#models">AI Models</a><a href="#collections">Collections</a></nav><div className="navactions"><button className="iconbtn" aria-label="Focus search" onClick={()=>document.getElementById("prompt-search")?.focus()}>⌕</button><a className="ghost" href="/auth">Sign in</a></div></header>
 <section className="hero"><div className="eyebrow">THE VISUAL AI PROMPT DISCOVERY PLATFORM</div><h1>Find the prompt.<br/><em>See the possibility.</em></h1><p>Explore a growing library of carefully structured AI prompts for images, videos, writing, coding, marketing and more.</p><div className="search"><span>⌕</span><input id="prompt-search" value={query} onChange={e=>setQuery(e.target.value)} aria-label="Search prompts" placeholder="Search 50,000+ AI prompts..." /><kbd>⌘ K</kbd></div><div className="quick"><span>Filter:</span>{["","image","video","coding","marketing"].map(v=><button key={v} onClick={()=>setType(v)} className={type===v?"active":""}>{v||"all"}</button>)}</div></section>
 <section className="section" id="discover"><div className="sectionhead"><div><span className="eyebrow">DISCOVER {loading?"· UPDATING":""}</span><h2>Prompts worth exploring</h2></div><a className="viewall" href="#categories">Explore categories →</a></div><div className="promptgrid">{filtered.map((p,i)=>{const model=Array.isArray(p.ai_models)?p.ai_models[0]?.name:p.ai_models?.name||p.model||"AI"; const slug=p.slug; return <article className="promptcard" key={slug}><a href={"/prompts/"+slug} className={"visual v"+(i%4)}><Image src={"/api/prompt-image?title="+encodeURIComponent(p.title)+"&type="+encodeURIComponent(p.prompt_type)+"&model="+encodeURIComponent(model)} alt="" fill sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 25vw" priority={i<4} /><span>{p.prompt_type.toUpperCase()}</span></a><div className="cardbody"><div className="meta"><span>{p.prompt_type}</span><span>•</span><span>{model}</span></div><h3><a href={"/prompts/"+slug}>{p.title}</a></h3><p>{p.excerpt}</p><div className="cardfoot"><button className="copy" onClick={()=>copyPrompt(p.title,p.prompt_text||p.excerpt)}>{copied===p.title?"Copied ✓":"Copy prompt"}</button><a className="save" href={"/prompts/"+slug} aria-label={"Open "+p.title}>↗</a></div></div></article>})}</div>{!loading&&filtered.length===0&&<div className="empty">No prompts match “{query}”. Try another search.</div>}</section>
 <section className="section muted" id="categories"><div className="sectionhead"><div><span className="eyebrow">EXPLORE</span><h2>Start with a category</h2></div></div><div className="catgrid">{categories.map(c=><a className="cat" key={c[1]} href={"/categories/"+c[3]}><div className="caticon">{c[0]}</div><h3>{c[1]}</h3><p>{c[2]}</p><span>Explore →</span></a>)}</div></section>
 <section className="statement" id="models"><span className="eyebrow">BUILT FOR CREATION</span><h2>Discover → Understand → Copy → Create</h2><p>Every prompt is designed to show what it can create, how it works and where it fits into your workflow.</p></section>
 <footer id="collections"><div className="brand">PROMPT<span>EXA</span></div><p>Visual AI prompt discovery, built for creators.</p><div className="footerlinks"><a href="#discover">Discover</a><a href="#categories">Categories</a><a href="#models">AI Models</a><a href="/auth">Account</a></div></footer>
 </main>
}