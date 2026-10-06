"use client"

import { useEffect, useState } from "react"

type Ad = { id?: number; slot_key: string; title: string; code: string; enabled: boolean }
const defaults: Ad[] = [
  { slot_key: "home_top", title: "Home — Top", code: "", enabled: false },
  { slot_key: "home_middle", title: "Home — Middle", code: "", enabled: false },
  { slot_key: "product_bottom", title: "Product — Bottom", code: "", enabled: false },
  { slot_key: "checkout_top", title: "Checkout — Top", code: "", enabled: false },
  { slot_key: "footer", title: "Footer", code: "", enabled: false },
]

export default function AdSettings() {
  const [ads, setAds] = useState<Ad[]>(defaults)
  const [msg, setMsg] = useState("")
  const [busy, setBusy] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/store/ads")
      .then(r => r.json())
      .then(d => {
        const map = new Map((d.ads || []).map((a: Ad) => [a.slot_key, a]))
        setAds(defaults.map(a => ({ ...a, ...(map.get(a.slot_key) as Ad || {}) })))
      })
      .catch(() => {})
  }, [])

  function change(slot: string, patch: Partial<Ad>) {
    setAds(current => current.map(a => a.slot_key === slot ? { ...a, ...patch } : a))
  }

  async function save(ad: Ad) {
    setBusy(ad.slot_key); setMsg("")
    const r = await fetch("/api/store/ads", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(ad) })
    const d = await r.json().catch(() => ({}))
    setBusy(null)
    setMsg(r.ok ? `${ad.title} saved.` : (d.error || "Could not save ad."))
  }

  return <div>
    <p className="ad-code-note">Paste the complete ad tag/code supplied by your ad provider. The code is isolated inside its own iframe so it cannot change the store layout. Only enabled slots with code are rendered on the public store.</p>
    <div className="ad-admin-grid">
      {ads.map(ad => <article className="ad-admin-card" key={ad.slot_key}>
        <h3>{ad.title}</h3>
        <small>Slot: {ad.slot_key}</small>
        <div className="ad-admin-row"><input value={ad.title} onChange={e => change(ad.slot_key, { title: e.target.value })} aria-label="Ad title"/><label className="ad-toggle"><input type="checkbox" checked={ad.enabled} onChange={e => change(ad.slot_key, { enabled: e.target.checked })}/> Enabled</label></div>
        <textarea value={ad.code} onChange={e => change(ad.slot_key, { code: e.target.value })} placeholder="Paste ad HTML / script code here…" spellCheck={false}/>
        <div className="ad-admin-actions"><span className="ad-code-note">Empty code stays hidden.</span><button className="ad-save" disabled={busy === ad.slot_key} onClick={() => save(ad)}>{busy === ad.slot_key ? "Saving…" : "Save slot"}</button></div>
      </article>)}
    </div>
    {msg && <div className="admin-message" style={{ marginTop: 16 }}>{msg}</div>}
  </div>
}
