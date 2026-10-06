"use client";
import { useEffect, useState } from "react";

export default function OrdersPage(){
  const [orders,setOrders]=useState<any[]>([]); const [error,setError]=useState("");
  useEffect(()=>{fetch("/api/store/orders").then(async r=>{const j=await r.json(); if(!r.ok) throw new Error(j.error); setOrders(j.orders||[])}).catch(e=>setError(e.message));},[]);
  async function openAccess(productId:number){const r=await fetch(`/api/store/download?productId=${productId}`); const j=await r.json(); if(!r.ok){alert(j.error);return;} window.open(j.url,"_blank","noopener,noreferrer");}
  return <main style={{maxWidth:900,margin:"0 auto",padding:"48px 20px"}}><h1>My orders</h1>{error&&<p>{error}</p>}{orders.map(o=><section key={o.id} style={{border:"1px solid #ddd",borderRadius:16,padding:20,marginTop:16}}><strong>Order {o.id.slice(0,8)}</strong><p>Status: {o.status} · Total: {o.total}</p>{o.order_items?.map((i:any)=><div key={i.id} style={{display:"flex",justifyContent:"space-between",padding:"10px 0"}}><span>{i.product_name}</span>{o.status==="paid"&&<button onClick={()=>openAccess(i.product_id)}>Access / Download</button>}</div>)}</section>)}</main>
}
