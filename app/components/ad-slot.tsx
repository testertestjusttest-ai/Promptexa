"use client"

import { useEffect, useRef, useState } from "react"

type Ad = { id: number; slot_key: string; title: string; code: string; enabled: boolean }

export default function AdSlot({ slot, className = "" }: { slot: string; className?: string }) {
  const frame = useRef<HTMLIFrameElement>(null)
  const [ad, setAd] = useState<Ad | null>(null)

  useEffect(() => {
    let alive = true
    fetch(`/api/store/ads?slot=${encodeURIComponent(slot)}`)
      .then(r => r.ok ? r.json() : { ads: [] })
      .then(d => { if (alive) setAd((d.ads || [])[0] || null) })
      .catch(() => {})
    return () => { alive = false }
  }, [slot])

  useEffect(() => {
    if (!ad?.code || !frame.current) return
    const doc = frame.current.contentDocument
    if (!doc) return
    doc.open()
    doc.write(`<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body{margin:0;padding:0;background:transparent;overflow:hidden}body{display:flex;justify-content:center;align-items:center;min-height:100%;font-family:Arial,sans-serif}</style></head><body>${ad.code}</body></html>`)
    doc.close()
  }, [ad])

  if (!ad?.code || !ad.enabled) return null
  return <aside className={`managed-ad managed-ad-${slot} ${className}`} aria-label={ad.title || "Advertisement"}>
    <iframe ref={frame} title={ad.title || "Advertisement"} loading="lazy" scrolling="no" />
  </aside>
}
