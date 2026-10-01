"use client";

import { useMemo, useState } from "react";

const formats = ["Image", "Video", "Chat", "Writing", "Coding", "Marketing", "Research", "Audio"];
const models = ["Auto", "ChatGPT", "Gemini", "Midjourney", "FLUX", "Veo", "Runway", "Leonardo AI"];
const tones = ["Professional", "Cinematic", "Minimal", "Creative", "Technical", "Persuasive"];

export default function AIToolsPage() {
  const [task, setTask] = useState("");
  const [format, setFormat] = useState("Image");
  const [model, setModel] = useState("Auto");
  const [tone, setTone] = useState("Professional");
  const [result, setResult] = useState("");

  const prompt = useMemo(() => {
    if (!task.trim()) return "";
    return [
      `Create a ${format.toLowerCase()} prompt for: ${task.trim()}`,
      `Target AI: ${model}.`,
      `Style/tone: ${tone}.`,
      format === "Image" ? "Preserve the identity and facial features of any supplied reference person; do not redesign the face." : "",
      "Make the instructions specific, production-ready, and easy to copy."
    ].filter(Boolean).join(" ");
  }, [task, format, model, tone]);

  return <main className="aipage">
    <nav className="detailnav"><a className="brand" href="/">PROMPT<span>EXA</span></a><a href="/">← Back</a></nav>
    <section className="aiwrap">
      <span className="eyebrow">PROMPTEXA AI</span>
      <h1>Build the right prompt<br/><em>for any AI workflow.</em></h1>
      <p className="ailead">Choose a format and target tool. Promptexa AI structures your brief into a production-ready prompt.</p>
      <div className="aiform">
        <label>What do you want to create?
          <textarea value={task} onChange={e=>setTask(e.target.value)} placeholder="Example: a premium cinematic product campaign for a new black smartwatch..." />
        </label>
        <div className="aifields">
          <label>Format<select value={format} onChange={e=>setFormat(e.target.value)}>{formats.map(x=><option key={x}>{x}</option>)}</select></label>
          <label>AI tool<select value={model} onChange={e=>setModel(e.target.value)}>{models.map(x=><option key={x}>{x}</option>)}</select></label>
          <label>Style<select value={tone} onChange={e=>setTone(e.target.value)}>{tones.map(x=><option key={x}>{x}</option>)}</select></label>
        </div>
        <button className="aibuild" onClick={()=>setResult(prompt)} disabled={!task.trim()}>Build prompt →</button>
      </div>
      {result && <section className="airesult"><div><span className="eyebrow">GENERATED STRUCTURE</span><button onClick={()=>navigator.clipboard.writeText(result)}>Copy</button></div><pre>{result}</pre><small>Promptexa AI is provider-ready; a server-side model connection can be enabled without changing this interface.</small></section>}
    </section>
  </main>;
}
