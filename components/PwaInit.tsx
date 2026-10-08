"use client";

import { useEffect, useState } from "react";

/** Registers the service worker + loads OneSignal (if configured) */
export default function PwaInit() {
  const [showInstall, setShowInstall] = useState(false);
  const [deferred, setDeferred] = useState<unknown>(null);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e);
      setShowInstall(true);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);

    // OneSignal push notifications (App ID from Admin → Settings)
    fetch("/api/public/settings")
      .then((r) => r.json())
      .then((d) => {
        const appId = d?.notifications?.onesignal_app_id;
        if (appId && !(window as unknown as { OneSignal?: unknown }).OneSignal) {
          const s = document.createElement("script");
          s.src = "https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js";
          s.defer = true;
          s.onload = () => {
            const w = window as unknown as {
              OneSignalDeferred?: Array<(os: unknown) => void>;
            };
            w.OneSignalDeferred = w.OneSignalDeferred || [];
            w.OneSignalDeferred.push((OneSignal: unknown) => {
              (OneSignal as { init: (o: object) => Promise<void> }).init({
                appId,
                notifyButton: { enable: true },
              });
            });
          };
          document.head.appendChild(s);
        }
      })
      .catch(() => {});

    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  async function install() {
    const e = deferred as { prompt: () => Promise<void> } | null;
    if (!e) return;
    await e.prompt();
    setShowInstall(false);
    setDeferred(null);
  }

  if (!showInstall) return null;
  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 sm:left-auto sm:right-6 sm:max-w-sm">
      <div className="glass ring-conic flex items-center gap-3 rounded-2xl p-4">
        <img src="/logo.png" alt="DigiPlyra" className="h-11 w-11 rounded-xl" />
        <div className="flex-1">
          <p className="text-sm font-bold text-white">অ্যাপ ইনস্টল করুন 📲</p>
          <p className="text-xs text-slate-400">হোম স্ক্রিনে DigiPlyra যোগ করুন</p>
        </div>
        <button onClick={install} className="rounded-xl bg-[#d7ff3f] px-4 py-2 text-sm font-bold text-[#060913]">
          ইনস্টল
        </button>
        <button onClick={() => setShowInstall(false)} className="text-slate-500">✕</button>
      </div>
    </div>
  );
}
