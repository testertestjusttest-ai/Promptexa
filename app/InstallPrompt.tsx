"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

const STORAGE_KEY = "promptexa-install-dismissed";

export default function InstallPrompt() {
  const [event, setEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone) {
      return;
    }
    if (localStorage.getItem(STORAGE_KEY) === "1") return;

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setEvent(e as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);

  if (!visible || !event) return null;

  async function install(installEvent: BeforeInstallPromptEvent) {
    await installEvent.prompt();
    const choice = await installEvent.userChoice;
    if (choice.outcome === "accepted") setVisible(false);
  }

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  }

  return (
    <aside className="installprompt" aria-label="Install Promptexa">
      <div className="installprompt-copy">
        <strong>Install Promptexa</strong>
        <p>Keep your prompt library one tap away with the Promptexa app experience.</p>
        <div className="installprompt-actions">
          <button className="install-primary" onClick={() => install(event)}>Install app</button>
          <button onClick={dismiss}>Not now</button>
        </div>
      </div>
      <button className="installprompt-close" onClick={dismiss} aria-label="Close">×</button>
    </aside>
  );
}
