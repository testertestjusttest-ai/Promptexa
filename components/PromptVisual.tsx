"use client";

import Image from "next/image";
import { useState } from "react";

export default function PromptVisual({
  src,
  alt,
  label,
  priority = false,
}: {
  src: string;
  alt: string;
  label?: string;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="visualPending" role="img" aria-label="Prompt visual is being generated">
        <span>VISUAL GENERATION</span>
        <strong>Creating this prompt's image…</strong>
        <small>Each prompt gets its own visual — no shared stock fallback.</small>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      unoptimized
      sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 25vw"
      priority={priority}
      onError={() => setFailed(true)}
    />
  );
}
