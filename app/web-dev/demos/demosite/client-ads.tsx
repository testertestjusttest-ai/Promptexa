"use client";

/**
 * Client ad slots — renders Adsterra/Monetag code from client_settings.
 * Only active on client sites (not demos).
 */

import { useEffect, useState } from "react";
import { useDemo } from "./store";

/** Load client settings (ads, announcement) once per site. */
export function useClientSettings(): Record<string, string> {
  const { clientSlug } = useDemo();
  const [s, setS] = useState<Record<string, string>>({});
  useEffect(() => {
    if (!clientSlug) return;
    fetch(`/api/client/${clientSlug}/settings`)
      .then((r) => r.json())
      .then((d) => setS(d.settings || {}))
      .catch(() => {});
  }, [clientSlug]);
  return s;
}

/** Renders raw ad HTML (Adsterra/Monetag) at a slot. */
export function AdSlot({ slot }: { slot: "ad_top" | "ad_bottom" | "ad_popup" }) {
  const s = useClientSettings();
  const html = (s[slot] || "").trim();
  if (!html) return null;
  return (
    <div className="mx-auto max-w-6xl px-3 py-2 text-center" data-ad-slot={slot}>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}

/** Announcement bar (text) at the very top. */
export function AnnouncementBar() {
  const s = useClientSettings();
  const text = (s.announcement || "").trim();
  if (!text) return null;
  return (
    <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1.5 text-center text-xs font-bold text-white">
      📣 {text}
    </div>
  );
}
