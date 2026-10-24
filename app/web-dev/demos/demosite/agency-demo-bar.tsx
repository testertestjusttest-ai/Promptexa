"use client";

/**
 * Agency demo bar — Phase 1, rendered above reworked demos only.
 *
 * It makes the three visitor requirements impossible to miss:
 * 1. A clear "Demo only" label (no real orders are processed).
 * 2. An "I need this website" CTA (WhatsApp + free-quote form).
 * 3. A light-edit entry point ("Edit this demo" opens the demo admin,
 *    where the visitor can change names, hero text, colours, products or
 *    services and see the result live) plus "Reset demo" to undo it all.
 *
 * Everything is browser-local: resetting clears this demo's localStorage
 * keys (dmsite:{slug}:*) and reloads the page.
 */

export function AgencyDemoBar({ slug, name }: { slug: string; name: string }) {
  const waText = encodeURIComponent(`Hi, I want a website like the "${name}" demo.`);
  const reset = () => {
    try {
      const prefix = `dmsite:${slug}:`;
      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(prefix)) keys.push(k);
      }
      keys.forEach((k) => localStorage.removeItem(k));
    } catch {
      /* ignore */
    }
    window.location.reload();
  };

  return (
    <div className="border-b border-amber-200 bg-amber-50 px-4 py-3 text-slate-800">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2">
        <p className="min-w-0 flex-1 text-[13px] leading-snug">
          <span className="font-black">ⓘ Demo only</span> — this is a sample website by{" "}
          <b>DigiPlyra</b>. No real orders are processed here. Like what you see? Get
          the same kind of website built for your own business.
        </p>
        <div className="flex flex-wrap gap-2">
          <a
            href={`https://wa.me/8801833402586?text=${waText}`}
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-black text-white shadow transition hover:brightness-110"
          >
            💬 I need this website
          </a>
          <a
            href="/#quote"
            className="rounded-full bg-slate-900 px-4 py-2 text-xs font-black text-white shadow transition hover:brightness-110"
          >
            📝 Free quote
          </a>
          <a
            href={`/demo${slug}/admin`}
            className="rounded-full bg-white px-4 py-2 text-xs font-black text-slate-800 ring-1 ring-slate-300 transition hover:bg-slate-100"
          >
            ✏️ Edit this demo
          </a>
          <button
            onClick={reset}
            className="rounded-full bg-white px-4 py-2 text-xs font-black text-slate-800 ring-1 ring-slate-300 transition hover:bg-slate-100"
          >
            ↺ Reset demo
          </button>
        </div>
      </div>
    </div>
  );
}
