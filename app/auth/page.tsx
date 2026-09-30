"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AuthPage() {
  const [email,setEmail]=useState("");
  const [message,setMessage]=useState("");
  const [loading,setLoading]=useState(false);

  async function signIn() {
    setLoading(true); setMessage("");
    const supabase=createClient();
    const {error}=await supabase.auth.signInWithOtp({
      email,
      options:{emailRedirectTo: window.location.origin+"/auth/callback"},
    });
    setMessage(error?.message ?? "Check your email for the secure sign-in link.");
    setLoading(false);
  }

  return <main className="authpage">
    <div className="authcard">
      <a className="brand" href="/">PROMPT<span>EXA</span></a>
      <span className="eyebrow">YOUR PROMPT WORKSPACE</span>
      <h1>Save prompts.<br/><em>Build your library.</em></h1>
      <p>Sign in with your email. No password required.</p>
      <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" type="email" />
      <button onClick={signIn} disabled={loading || !email}>{loading?"Sending…":"Continue with email"}</button>
      {message && <div className="authmessage">{message}</div>}
      <a href="/">← Back to Promptexa</a>
    </div>
  </main>;
}
