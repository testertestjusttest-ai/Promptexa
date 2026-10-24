"use client";

import { useEffect, useState } from "react";

type Lang = "en" | "bn" | "hi";

const OPTS: { id: Lang; label: string }[] = [
  { id: "en", label: "English" },
  { id: "bn", label: "বাংলা" },
  { id: "hi", label: "हिन्दी" },
];

const KEY = "dp-agency-lang";

/**
 * Website Language card (Phase 5) — lives inside admin Settings, per the
 * agency language rule (switch in hamburger drawer + Settings only, never a
 * header pill). Two separate controls:
 *  1. "My language" — the signed-in admin's own language. Saved to this
 *     browser immediately AND mirrored to their profile (profiles.preferred_lang)
 *     so it follows them to a new device. If the Phase 5 SQL has not run,
 *     the profile save degrades to local-only and says so.
 *  2. "Site default for new visitors" — agency_site_settings.default_lang.
 *     New visitors with no saved choice get this language; a returning
 *     visitor's own saved choice always wins.
 */
export default function LanguageSettingsCard() {
  const [local, setLocal] = useState<Lang>("en");
  const [profileLang, setProfileLang] = useState<Lang | null>(null);
  const [siteDefault, setSiteDefault] = useState<Lang | null>(null);
  const [note, setNote] = useState("");

  useEffect(() => {
    try {
      const v = localStorage.getItem(KEY);
      if (v === "en" || v === "bn" || v === "hi") setLocal(v);
    } catch {
      /* ignore */
    }
    fetch("/api/admin/language")
      .then((r) => r.json())
      .then((d) => {
        if (d.my_lang === "en" || d.my_lang === "bn" || d.my_lang === "hi") setProfileLang(d.my_lang);
        if (d.site_default_lang === "en" || d.site_default_lang === "bn" || d.site_default_lang === "hi")
          setSiteDefault(d.site_default_lang);
      })
      .catch(() => {});
  }, []);

  async function setMyLang(l: Lang) {
    setLocal(l);
    try {
      localStorage.setItem(KEY, l);
    } catch {
      /* ignore */
    }
    const res = await fetch("/api/admin/language", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ my_lang: l }),
    });
    const d = await res.json().catch(() => ({}));
    if (d.ok) {
      setProfileLang(l);
      setNote("✓ Saved to your profile — it will follow you to a new device.");
    } else {
      setNote(`⚠️ Saved in this browser only. ${d.error ?? "Profile sync needs the Phase 5 SQL."}`);
    }
  }

  async function saveSiteDefault(l: Lang) {
    const res = await fetch("/api/admin/language", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ site_default_lang: l }),
    });
    const d = await res.json().catch(() => ({}));
    if (d.ok) {
      setSiteDefault(l);
      setNote("✓ Site default saved — new visitors will see this language first.");
    } else {
      setNote(`⚠️ ${d.error ?? "Site default could not be saved."}`);
    }
  }

  function applyProfileLang() {
    if (profileLang) setMyLang(profileLang);
  }

  return (
    <div className="glass rounded-2xl p-6 lg:col-span-2">
      <h3 className="font-display text-base font-bold text-white">🌐 Website Language</h3>
      <p className="mt-1 text-sm text-slate-400">
        The site is English by default. Visitors switch to Bangla or Hindi from the hamburger drawer or
        Settings — never from a header pill. Your own choice below is mirrored to your admin profile.
      </p>

      <div className="mt-4 grid gap-6 md:grid-cols-2">
        <div>
          <p className="mb-2 text-sm font-bold text-slate-200">My language (admin profile)</p>
          <div className="flex gap-2">
            {OPTS.map((o) => (
              <button
                key={o.id}
                onClick={() => setMyLang(o.id)}
                className={`flex-1 rounded-xl py-2.5 text-sm font-black ${local === o.id ? "bg-[#d7ff3f] text-black" : "bg-white/10 text-white hover:bg-white/20"}`}
              >
                {o.label}
              </button>
            ))}
          </div>
          {profileLang && profileLang !== local && (
            <button onClick={applyProfileLang} className="mt-2 text-sm font-bold text-[#d7ff3f] underline">
              Your profile language is {OPTS.find((o) => o.id === profileLang)?.label} — apply it here
            </button>
          )}
          {profileLang && profileLang === local && (
            <p className="mt-2 text-xs text-slate-500">✓ Matches your profile language.</p>
          )}
        </div>

        <div>
          <p className="mb-2 text-sm font-bold text-slate-200">Site default for new visitors</p>
          <div className="flex gap-2">
            {OPTS.map((o) => (
              <button
                key={o.id}
                onClick={() => saveSiteDefault(o.id)}
                className={`flex-1 rounded-xl py-2.5 text-sm font-black ${siteDefault === o.id ? "bg-[#d7ff3f] text-black" : "bg-white/10 text-white hover:bg-white/20"}`}
              >
                {o.label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Applies only to visitors with no saved choice. Returning visitors keep their own language.
            {siteDefault === null && " (Not set yet — defaults to English until the Phase 5 SQL runs.)"}
          </p>
        </div>
      </div>
      {note && <p className="mt-3 text-sm font-bold text-[#d7ff3f]">{note}</p>}
    </div>
  );
}
