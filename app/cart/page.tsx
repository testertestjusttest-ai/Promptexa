"use client"

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

type Product={id:number;name:string;price:number;image_url?:string|null;description:string;product_type:string}
function readCart(){try{return JSON.parse(localStorage.getItem('digiplyra-cart')||'[]') as number[]}catch{return []}}
export default function Cart(){
 const [ids,setIds]=useState<number[]>([]); const [products,setProducts]=useState<Product[]>([])
 useEffect(()=>{setIds(readCart());fetch('/api/store/products').then(r=>r.json()).then(d=>setProducts(d.products||[]))},[])
 const items=useMemo(()=>ids.map(id=>products.find(p=>p.id===id)).filter(Boolean) as Product[],[ids,products])
 const total=items.reduce((s,p)=>s+Number(p.price),0)
 function remove(id:number){const i=ids.indexOf(id);if(i<0)return;const n=[...ids];n.splice(i,1);setIds(n);localStorage.setItem('digiplyra-cart',JSON.stringify(n));window.dispatchEvent(new Event('cart-updated'))}
 function clear(){setIds([]);localStorage.setItem('digiplyra-cart','[]');window.dispatchEvent(new Event('cart-updated'))}
 return <main className="cart-page"><div className="cart-wrap"><div className="cart-head"><div><span className="eyebrow">SHOPPING CART</span><h1>Your <em>selection.</em></h1></div><Link href="/">← Continue shopping</Link></div>{!items.length?<div className="cart-empty"><div className="empty-icon">🛒</div><h2>Your cart is empty</h2><p>Pick a digital product and it will stay here until you are ready to check out.</p><Link href="/" className="hero-primary">Browse products</Link></div>:<div className="cart-layout"><section className="cart-items">{items.map((p,i)=><article className="cart-item" key={`${p.id}-${i}`}>{p.image_url?<img src={p.image_url} alt=""/>:<div className="cart-thumb">{p.name.slice(0,1)}</div>}<div className="cart-item-copy"><span>{p.product_type==='link'?'Access link':'Digital delivery'}</span><h3>{p.name}</h3><p>{p.description}</p></div><strong>৳{Number(p.price).toLocaleString()}</strong><button onClick={()=>remove(p.id)} aria-label="Remove item">×</button></article>)}<button className="clear-cart" onClick={clear}>Clear cart</button></section><aside className="cart-summary"><span className="eyebrow">ORDER SUMMARY</span><div><span>Items</span><b>{items.length}</b></div><div><span>Delivery</span><b>Digital</b></div><hr/><div className="total"><span>Total</span><b>৳{total.toLocaleString()}</b></div><Link href="/checkout" className="checkout-btn">Proceed to checkout</Link><small>Payment is manually verified before digital access is released.</small></aside></div>}</div></main>
}
