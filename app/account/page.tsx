"use client"

import Link from 'next/link'
import { FormEvent, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function Account() {
  const supabase = createClient()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserEmail(data.user?.email || null))
  }, [])

  async function submit(e: FormEvent) {
    e.preventDefault()
    setLoading(true); setMessage('')
    if (mode === 'signup') {
      const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } })
      if (error) setMessage(error.message)
      else if (!data.session) setMessage('Account created. Check your email if confirmation is enabled, then sign in.')
      else window.location.href = '/account'
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setMessage(error.message)
      else window.location.href = '/account'
    }
    setLoading(false)
  }

  async function signOut() {
    await supabase.auth.signOut(); setUserEmail(null); setMessage('Signed out successfully.')
  }

  if (userEmail) return <main className="authpage"><div className="authcard account-dashboard">
    <Link className="brand" href="/">DigiPlyra</Link>
    <span className="eyebrow">CUSTOMER ACCOUNT</span>
    <h1>Your <em>library.</em></h1>
    <p>Signed in as <b>{userEmail}</b>. Approved digital products and access links appear here after payment verification.</p>
    <div className="account-actions"><Link className="copy" href="/">Continue shopping</Link><Link className="copy" href="/checkout">Open cart</Link></div>
    <div className="authmessage"><b>Order access</b><br/>Your account is connected to the order system. Paid orders can expose their download or delivery link here.</div>
    <button className="secondary-button" onClick={signOut}>Sign out</button>
    {message && <div className="authmessage">{message}</div>}
  </div></main>

  return <main className="authpage"><div className="authcard">
    <Link className="brand" href="/">DigiPlyra</Link>
    <span className="eyebrow">CUSTOMER ACCOUNT</span>
    <h1>{mode === 'login' ? <>Welcome <em>back.</em></> : <>Create <em>account.</em></>}</h1>
    <p>{mode === 'login' ? 'Sign in to view your orders and approved digital deliveries.' : 'Create an account so your paid downloads and access links stay in one place.'}</p>
    <form onSubmit={submit} className="authform">
      {mode === 'signup' && <input value={name} onChange={e=>setName(e.target.value)} placeholder="Full name" required />}
      <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email address" autoComplete="email" required />
      <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" autoComplete={mode==='login'?'current-password':'new-password'} minLength={6} required />
      <button disabled={loading}>{loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}</button>
    </form>
    {message && <div className="authmessage">{message}</div>}
    <button className="text-button" onClick={()=>{setMode(mode==='login'?'signup':'login');setMessage('')}}>{mode === 'login' ? 'New here? Create an account' : 'Already have an account? Sign in'}</button>
    <Link href="/">← Back to store</Link>
  </div></main>
}
