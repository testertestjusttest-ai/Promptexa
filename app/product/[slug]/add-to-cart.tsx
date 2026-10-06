"use client"
import {useState} from 'react'
import Link from 'next/link'
export default function AddToCart({id}:{id:number}){const [added,setAdded]=useState(false);function add(){let cart:number[]=[];try{cart=JSON.parse(localStorage.getItem('digiplyra-cart')||'[]')}catch{};cart.push(id);localStorage.setItem('digiplyra-cart',JSON.stringify(cart));window.dispatchEvent(new Event('cart-updated'));setAdded(true)}return <div className="detail-buy"><button onClick={add}>{added?'Added to cart ✓':'Add to cart'}</button>{added&&<Link href="/cart">View cart →</Link>}</div>}
