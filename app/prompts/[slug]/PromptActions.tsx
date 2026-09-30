"use client";
import {useState} from "react";
export default function PromptActions({prompt}:{prompt:string}){const [copied,setCopied]=useState(false);return <button onClick={async()=>{try{await navigator.clipboard.writeText(prompt);setCopied(true);setTimeout(()=>setCopied(false),1600)}catch{}}}>{copied?"Copied ✓":"Copy prompt"}</button>}