"use client";

import { useEffect, useRef } from "react";

/**
 * Renders a third-party ad code (Adsterra / Monetag / etc.) pasted
 * in Admin → Settings. Scripts execute on mount.
 */
export default function AdSlot({
  code,
  className = "",
  label = "বিজ্ঞাপন",
}: {
  code: string;
  className?: string;
  label?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !code.trim()) return;
    el.innerHTML = "";
    // Re-create script tags so they actually execute
    const tmp = document.createElement("div");
    tmp.innerHTML = code;
    const scripts: HTMLScriptElement[] = [];
    tmp.querySelectorAll("script").forEach((old) => {
      const s = document.createElement("script");
      for (const attr of Array.from(old.attributes)) {
        s.setAttribute(attr.name, attr.value);
      }
      s.textContent = old.textContent;
      scripts.push(s);
      old.replaceWith(s);
    });
    el.appendChild(tmp);
    scripts.forEach(() => {});
    return () => {
      el.innerHTML = "";
    };
  }, [code]);

  if (!code.trim()) return null;

  return (
    <div className={`mx-auto max-w-7xl px-4 sm:px-6 ${className}`}>
      <p className="mb-1 text-center text-[10px] uppercase tracking-widest text-slate-600">
        {label}
      </p>
      <div ref={ref} className="flex justify-center overflow-hidden" />
    </div>
  );
}

/** Popup / popunder-style ad — shows once per session with a close button. */
export function AdPopup({ code }: { code: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!code.trim()) return;
    if (sessionStorage.getItem("dp_ad_popup_seen")) return;
    const t = setTimeout(() => {
      if (wrapRef.current) {
        wrapRef.current.style.display = "flex";
        sessionStorage.setItem("dp_ad_popup_seen", "1");
      }
      const el = ref.current;
      if (el) {
        const tmp = document.createElement("div");
        tmp.innerHTML = code;
        tmp.querySelectorAll("script").forEach((old) => {
          const s = document.createElement("script");
          for (const attr of Array.from(old.attributes)) {
            s.setAttribute(attr.name, attr.value);
          }
          s.textContent = old.textContent;
          old.replaceWith(s);
        });
        el.appendChild(tmp);
      }
    }, 8000);
    return () => clearTimeout(t);
  }, [code]);

  if (!code.trim()) return null;

  return (
    <div
      ref={wrapRef}
      style={{ display: "none" }}
      className="fixed inset-0 z-[60] items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
    >
      <div className="glass relative w-full max-w-md rounded-2xl p-4">
        <button
          onClick={() => {
            if (wrapRef.current) wrapRef.current.style.display = "none";
          }}
          className="absolute -right-2 -top-2 grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white"
        >
          ✕
        </button>
        <p className="mb-2 text-center text-[10px] uppercase tracking-widest text-slate-500">
          বিজ্ঞাপন
        </p>
        <div ref={ref} className="flex justify-center overflow-hidden" />
      </div>
    </div>
  );
}
