"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SavePrompt({promptId}:{promptId?:number}) {
  const [saved,setSaved]=useState(false);
  const [busy,setBusy]=useState(false);
  if(!promptId) return null;
  async function toggle() {
    setBusy(true);
    const supabase=createClient();
    const {data:{user}}=await supabase.auth.getUser();
    if(!user){ window.location.href="/auth"; return; }
    if(saved) {
      await supabase.from("prompt_saves").delete().eq("user_id",user.id).eq("prompt_id",promptId);
      setSaved(false);
    } else {
      const {error}=await supabase.from("prompt_saves").insert({user_id:user.id,prompt_id:promptId});
      if(!error)setSaved(true);
    }
    setBusy(false);
  }
  useEffect(()=>{ if(!promptId)return; const load=async()=>{const s=createClient(); const {data:{user}}=await s.auth.getUser(); if(!user)return; const {data}=await s.from("prompt_saves").select("prompt_id").eq("user_id",user.id).eq("prompt_id",promptId).maybeSingle(); setSaved(!!data)}; load()},[promptId]);
  return <button className="saveDetail" onClick={toggle} disabled={busy}>{saved?"Saved ✓":"Save prompt"}</button>;
}
