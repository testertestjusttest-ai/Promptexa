// Synthesized SFX + Bangla voice guidance for the /topup page.
// No audio files needed — everything is generated with Web Audio.

let ctx: AudioContext | null = null;

function ac(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctx = new AC();
    }
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

export function soundEnabled(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem("topup_sound") !== "off";
}

export function setSoundEnabled(on: boolean): void {
  try {
    localStorage.setItem("topup_sound", on ? "on" : "off");
  } catch {
    /* ignore */
  }
  if (!on) stopVoice();
}

function tone(
  freq: number,
  delay: number,
  dur: number,
  type: OscillatorType = "sine",
  vol = 0.18,
  slideTo?: number
) {
  const c = ac();
  if (!c || !soundEnabled()) return;
  const t = c.currentTime + delay;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(Math.max(vol, 0.0001), t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(c.destination);
  o.start(t);
  o.stop(t + dur + 0.05);
}

// tiny UI blip
export function sfxClick() {
  tone(700, 0, 0.09, "triangle", 0.12);
}

/** coin "cha-ching" on package select */
export function sfxSelect() {
  tone(880, 0, 0.12, "triangle", 0.2);
  tone(1318, 0.09, 0.22, "triangle", 0.2);
  tone(1760, 0.18, 0.3, "sine", 0.12);
}

/** victory arpeggio on order success */
export function sfxSuccess() {
  const notes = [523, 659, 784, 1046, 1318];
  notes.forEach((f, i) => tone(f, i * 0.11, 0.28, "triangle", 0.2));
  tone(261, 0, 0.5, "sine", 0.1);
}

/** epic entrance jingle */
export function sfxFanfare() {
  // deep boom + rising heroic arpeggio
  tone(98, 0, 0.6, "sawtooth", 0.12, 49);
  const notes = [392, 523, 659, 784, 1046];
  notes.forEach((f, i) => tone(f, 0.25 + i * 0.12, 0.35, "triangle", 0.18));
  tone(1568, 0.9, 0.6, "sine", 0.1);
}

/** Bangla voice guidance */
export function speakBn(text: string) {
  if (typeof window === "undefined" || !soundEnabled()) return;
  if (!("speechSynthesis" in window)) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "bn-BD";
    u.rate = 0.95;
    u.pitch = 1;
    const vs = window.speechSynthesis.getVoices();
    const bn = vs.find((v) => v.lang && v.lang.toLowerCase().startsWith("bn"));
    if (bn) u.voice = bn;
    window.speechSynthesis.speak(u);
  } catch {
    /* ignore */
  }
}

export function stopVoice() {
  try {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  } catch {
    /* ignore */
  }
}

export const VOICE = {
  welcome: "ফ্রি ফায়ার ডায়মন্ড টপ-আপে স্বাগতম! পছন্দের প্যাকেজ সিলেক্ট করুন।",
  selected: (name: string) =>
    `${name} সিলেক্ট হয়েছে। এখন নিচে আপনার প্লেয়ার ইউআইডি আর মোবাইল নম্বর দিন।`,
  success:
    "অর্ডার সফল হয়েছে! পেমেন্ট যাচাই করে পনেরো মিনিটের মধ্যে আপনার ইউআইডিতে ডায়মন্ড পাঠিয়ে দেওয়া হবে।",
};
