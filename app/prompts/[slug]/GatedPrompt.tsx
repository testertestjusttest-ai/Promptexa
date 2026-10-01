"use client";

import { useEffect, useState } from "react";
import PromptActions from "./PromptActions";

declare global {
  interface Window {
    googletag?: any;
  }
}

export default function GatedPrompt({ slug }: { slug: string }) {
  const [unlocked, setUnlocked] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const adEnabled = process.env.NEXT_PUBLIC_REWARDED_AD_ENABLED === "true";

  useEffect(() => {
    if (!adEnabled) return;

    const script = document.createElement("script");
    script.async = true;
    script.src = "https://securepubads.g.doubleclick.net/tag/js/gpt.js";
    document.head.appendChild(script);

    window.googletag = window.googletag || { cmd: [] };
    window.googletag.cmd = window.googletag.cmd || [];
    return () => { script.remove(); };
  }, [adEnabled]);

  async function loadPrompt() {
    setLoading(true);
    const response = await fetch(`/api/prompts/${encodeURIComponent(slug)}/content`, { cache: "no-store" });
    if (response.ok) {
      const data = await response.json();
      setPrompt(data.prompt_text || "");
      setUnlocked(Boolean(data.prompt_text));
    }
    setLoading(false);
  }

  function showRewardedAd() {
    if (!adEnabled) {
      loadPrompt();
      return;
    }

    window.googletag?.cmd?.push(() => {
      const googletag = window.googletag;
      const slot = googletag.defineOutOfPageSlot(
        process.env.NEXT_PUBLIC_REWARDED_AD_UNIT || "/1234567/promptexa_rewarded",
        googletag.enums.OutOfPageFormat.REWARDED,
      );

      if (!slot) return;
      slot.addService(googletag.pubads());

      const granted = (event: any) => {
        if (event.slot === slot) {
          googletag.pubads().removeEventListener("rewardedSlotGranted", granted);
          loadPrompt();
        }
      };
      googletag.pubads().addEventListener("rewardedSlotGranted", granted);
      googletag.display(slot);
    });
  }

  if (unlocked) {
    return <div className="gated-unlocked"><PromptActions prompt={prompt}/><pre>{prompt}</pre></div>;
  }

  return (
    <div className="promptgate">
      <div className="promptgate-icon">✦</div>
      <strong>Unlock this prompt</strong>
      <p>Watch one short ad to reveal the full prompt. The prompt stays hidden until the ad reward is granted.</p>
      <button onClick={showRewardedAd} disabled={loading}>
        {loading ? "Preparing…" : adEnabled ? "Watch ad to unlock" : "Preview unlock"}
      </button>
      {!adEnabled && <small>Rewarded ads are not connected yet. Enable the ad unit later and this gate becomes enforced.</small>}
    </div>
  );
}
