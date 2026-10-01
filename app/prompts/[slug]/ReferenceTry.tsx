"use client";

import { useRef, useState } from "react";

export default function ReferenceTry({ slug }: { slug: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [src, setSrc] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function generate() {
    const file = inputRef.current?.files?.[0];
    if (!file) {
      setError("Choose a photo first.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const body = new FormData();
      body.append("slug", slug);
      body.append("image", file);
      const response = await fetch("/api/generate-reference-image", { method: "POST", body });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Could not generate the image.");
      }
      const blob = await response.blob();
      setSrc(URL.createObjectURL(blob));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not generate the image.");
    } finally {
      setBusy(false);
    }
  }

  return <section className="referenceTry">
    <div>
      <span className="eyebrow">USE YOUR OWN PHOTO</span>
      <h2>Make the same visual with your image</h2>
      <p>Upload your photo and Promptexa will apply this prompt's composition, lighting and style while instructing the image model to preserve your identity.</p>
    </div>
    <div className="referenceControls">
      <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={() => setError("")} />
      <button onClick={generate} disabled={busy}>{busy ? "Generating…" : "Generate with my photo"}</button>
    </div>
    {error && <p className="referenceError">{error}</p>}
    {src && <div className="referenceResult"><img src={src} alt="Generated result using the uploaded reference photo" /></div>}
  </section>;
}
