"use client"

import { useEffect, useState } from 'react'
export default function CartCount(){const [count,setCount]=useState(0);useEffect(()=>{const read=()=>{try{setCount(JSON.parse(localStorage.getItem('digiplyra-cart')||'[]').length)}catch{setCount(0)}};read();window.addEventListener('cart-updated',read);return()=>window.removeEventListener('cart-updated',read)},[]);return <span className="cart-count">{count}</span>}
