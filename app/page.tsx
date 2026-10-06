"use client"

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import AdSlot from './components/ad-slot'

type Product = { id:number; name:string; slug:string; description:string; price:number; product_type:string; image_url?:string|null; featured:boolean; store_categories?:{name:string;slug:string}|null }

function readCart(): number[] { try { return JSON.parse(localStorage.getItem('digiplyra-cart') || '[]') } catch { return [] } }

export default function Home(){
  const [products,setProducts]=useState<Product[]>([])
  const [query,setQuery]=useState('')
  const [category,setCategory]=useState('All')
  const [cart,setCart]=useState<number[]>([])
  const [notice,setNotice]=useState('')

  useEffect(()=>{ setCart(readCart()); fetch('/api/store/products').then(r=>r.json()).then(d=>setProducts(d.products||[])).catch(()=>{}); fetch('/api/store/notices').then(r=>r.json()).then(d=>setNotice(d.notices?.[0]?.body||'' )).catch(()=>{}) },[])
  function add(id:number){ const next=[...readCart(),id]; localStorage.setItem('digiplyra-cart',JSON.stringify(next)); setCart(next); window.dispatchEvent(new Event('cart-updated')) }
  const categories=['All',...Array.from(new Set(products.map(p=>p.store_categories?.name).filter(Boolean) as string[]))]
  const filtered=useMemo(()=>products.filter(p=>(category==='All'||p.store_categories?.name===category)&&(`${p.name} ${p.description}`.toLowerCase().includes(query.toLowerCase()))),[products,category,query])
  return <main className="store-home">
    {notice && <div className="noticebar">✦ {notice}</div>}
    <AdSlot slot="home_top" />
    <section className="hero hero-new"><div className="hero-orb orb-one"/><div className="hero-orb orb-two"/><div className="hero-inner"><span className="eyebrow">DIGITAL GOODS · BANGLADESH · INSTANT ACCESS</span><h1>A better way to buy<br/><em>digital.</em></h1><p>Original templates, creator tools, software assets and digital services — with a clear cart, trusted local payment options and account-based delivery.</p><div className="hero-actions"><a href="#products" className="hero-primary">Explore products</a><Link href="/account" className="hero-secondary">Create account</Link></div><div className="search search-new"><span>⌕</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search products, templates, apps…"/><kbd>⌘ K</kbd></div></div></section>
    <section className="trust-row"><div><b>✓</b><span>Legal digital products</span></div><div><b>⚡</b><span>Fast delivery after approval</span></div><div><b>▣</b><span>Orders saved to your account</span></div><div><b>৳</b><span>bKash · Nagad · Rocket</span></div></section>
    <AdSlot slot="home_middle" />
    <section className="shop-section" id="products"><div className="shop-heading"><div><span className="eyebrow">SHOP THE LIBRARY</span><h2>Featured digital goods</h2></div><Link href="/checkout" className="cart-link">Cart · {cart.length}</Link></div><div className="category-strip">{categories.map(c=><button key={c} className={category===c?'active':''} onClick={()=>setCategory(c)}>{c}</button>)}</div><div className="product-grid-new">{filtered.map(p=><article className="product-card-new" key={p.id}><Link href={`/product/${p.slug}`} className="product-image">{p.image_url?<img src={p.image_url} alt={p.name}/>:<div className="product-art"><span>{p.store_categories?.name||'DIGITAL'}</span><strong>{p.name.slice(0,1)}</strong></div>}<span className="delivery-badge">{p.product_type==='link'?'ACCESS LINK':'INSTANT DELIVERY'}</span></Link><div className="product-info"><span className="product-cat">{p.store_categories?.name||'Digital product'}</span><Link href={`/product/${p.slug}`}><h3>{p.name}</h3></Link><p>{p.description}</p><div className="product-bottom"><strong>৳{Number(p.price).toLocaleString()}</strong><button onClick={()=>add(p.id)}>Add to cart</button></div></div></article>)}</div>{!filtered.length&&<div className="empty-state"><h3>No matching products</h3><p>Try another search or category.</p></div>}</section>
    <section className="feature-band"><div><span className="eyebrow">HOW IT WORKS</span><h2>From product to access in three clear steps.</h2></div><div className="steps"><div><b>01</b><strong>Choose</strong><p>Open a product, review its details and add it to your cart.</p></div><div><b>02</b><strong>Pay</strong><p>Select bKash, Nagad or Rocket and submit the transaction reference.</p></div><div><b>03</b><strong>Access</strong><p>After admin approval, the purchased download or website link appears in your account.</p></div></div></section>
    <section className="final-cta"><span className="eyebrow">YOUR DIGITAL LIBRARY</span><h2>Buy once. Keep your access organized.</h2><p>Your account keeps order status, payment verification and approved delivery links together.</p><Link href="/account">Open customer account →</Link></section>
  </main>
}
