// Free Fire style audio for /topup — all synthesized with Web Audio, no files.
// Gunshots, UI SFX, Bangla voice guidance, epic trap BGM.

let ctx: AudioContext | null = null;

function ac(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!ctx) {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctx = new AC();
    }
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

/* ---------------- toggles ---------------- */

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

/* ---------------- synth helpers ---------------- */

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

function noiseSrc(c: AudioContext, dur: number): AudioBufferSourceNode {
  const b = c.createBuffer(1, Math.max(1, Math.ceil(c.sampleRate * dur)), c.sampleRate);
  const d = b.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const s = c.createBufferSource();
  s.buffer = b;
  return s;
}

/* ---------------- gunshots ---------------- */

export type GunKind = "tap" | "pistol" | "smg" | "rifle" | "shotgun" | "sniper";

const GUN: Record<GunKind, { dur: number; cutoff: number; vol: number; base: number }> = {
  tap: { dur: 0.14, cutoff: 4200, vol: 0.45, base: 160 },
  pistol: { dur: 0.2, cutoff: 3800, vol: 0.9, base: 145 },
  smg: { dur: 0.12, cutoff: 3600, vol: 0.75, base: 160 },
  rifle: { dur: 0.34, cutoff: 2300, vol: 1.0, base: 105 },
  shotgun: { dur: 0.55, cutoff: 1000, vol: 1.0, base: 65 },
  sniper: { dur: 0.75, cutoff: 5000, vol: 1.0, base: 125 },
};

let gunBus: GainNode | null = null;
let gunVerb: ConvolverNode | null = null;

/** shared gun bus: limiter + generated outdoor reverb for realism */
function getGunBus(c: AudioContext): GainNode {
  if (!gunBus || gunBus.context !== c) {
    gunBus = c.createGain();
    const comp = c.createDynamicsCompressor();
    comp.threshold.value = -10;
    comp.knee.value = 18;
    comp.ratio.value = 14;
    comp.attack.value = 0.002;
    comp.release.value = 0.24;
    gunBus.connect(comp).connect(c.destination);
    // synthetic outdoor impulse — makes shots feel real, not dry
    const dur = 1.1;
    const len = Math.max(1, Math.floor(c.sampleRate * dur));
    const ir = c.createBuffer(2, len, c.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = ir.getChannelData(ch);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.2);
    }
    gunVerb = c.createConvolver();
    gunVerb.buffer = ir;
    const wet = c.createGain();
    wet.gain.value = 0.32;
    gunVerb.connect(wet).connect(comp);
  }
  return gunBus;
}

/**
 * Realistic loud gunshot — muzzle crack + body boom + sub thump + outdoor echo.
 * Slight random jitter per shot so it never sounds like a loop.
 */
export function gunshot(kind: GunKind = "pistol") {
  const c = ac();
  if (!c || !soundEnabled()) return;
  const t = c.currentTime + 0.01;
  const p = GUN[kind];
  const bus = getGunBus(c);
  const jit = 1 + (Math.random() - 0.5) * 0.14;

  // 1) muzzle crack — ultra-short bright transient
  const crack = noiseSrc(c, 0.05);
  const hf = c.createBiquadFilter();
  hf.type = "highpass";
  hf.frequency.value = 1400;
  const cg = c.createGain();
  cg.gain.setValueAtTime(Math.min(p.vol * 1.25, 1.0), t);
  cg.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
  crack.connect(hf).connect(cg).connect(bus);
  crack.start(t);

  // 2) body boom — filtered noise sweeping down
  const src = noiseSrc(c, p.dur);
  const f = c.createBiquadFilter();
  f.type = "lowpass";
  f.frequency.setValueAtTime(p.cutoff * jit, t);
  f.frequency.exponentialRampToValueAtTime(Math.max(p.cutoff * 0.12, 40), t + p.dur);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(p.vol, t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.001, t + p.dur);
  src.connect(f).connect(g);
  g.connect(bus);
  if (gunVerb) {
    const send = c.createGain();
    send.gain.value = 0.55;
    g.connect(send).connect(gunVerb);
  }
  src.start(t);

  // 3) chest sub thump
  const o = c.createOscillator();
  o.type = "sine";
  o.frequency.setValueAtTime(p.base * jit, t);
  o.frequency.exponentialRampToValueAtTime(34, t + 0.2);
  const og = c.createGain();
  og.gain.setValueAtTime(Math.min(p.vol * 0.95, 1.0), t);
  og.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
  o.connect(og).connect(bus);
  o.start(t);
  o.stop(t + 0.35);

  // sniper gets a distant echo crack
  if (kind === "sniper") {
    const t2 = t + 0.3;
    const src2 = noiseSrc(c, 0.25);
    const f2 = c.createBiquadFilter();
    f2.type = "lowpass";
    f2.frequency.value = 1700;
    const g2 = c.createGain();
    g2.gain.setValueAtTime(0.4, t2);
    g2.gain.exponentialRampToValueAtTime(0.001, t2 + 0.25);
    src2.connect(f2).connect(g2).connect(bus);
    if (gunVerb) {
      const send2 = c.createGain();
      send2.gain.value = 0.8;
      g2.connect(send2).connect(gunVerb);
    }
    src2.start(t2);
  }
}

/** different gun per package tier */
export function tierGun(diamonds: number, kind: string): GunKind {
  if (kind === "membership") return "shotgun";
  if (diamonds >= 1000) return "sniper";
  if (diamonds >= 200) return "rifle";
  return "pistol";
}

let tapGunHandler: ((e: PointerEvent) => void) | null = null;
/**
 * every tap on the page fires a soft shot — unless the element plays its own gun.
 * Returns a cleanup: call it when the page unmounts so the sound
 * does NOT leak onto other pages (Next.js SPA navigation keeps the document alive).
 */
export function initTapGuns(): () => void {
  if (typeof document === "undefined") return () => {};
  if (tapGunHandler) document.removeEventListener("pointerdown", tapGunHandler);
  tapGunHandler = (e: PointerEvent) => {
    if (!soundEnabled()) return;
    const t = e.target as HTMLElement | null;
    if (t && t.closest && t.closest("[data-gun]")) return;
    gunshot("tap");
  };
  document.addEventListener("pointerdown", tapGunHandler);
  return () => {
    if (tapGunHandler) document.removeEventListener("pointerdown", tapGunHandler);
    tapGunHandler = null;
    stopVoice();
  };
}

/* ---------------- UI SFX ---------------- */

/** tiny UI blip */
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
  tone(98, 0, 0.6, "sawtooth", 0.12, 49);
  const notes = [392, 523, 659, 784, 1046];
  notes.forEach((f, i) => tone(f, 0.25 + i * 0.12, 0.35, "triangle", 0.18));
  tone(1568, 0.9, 0.6, "sine", 0.1);
}

// no background music — gunshots + voice only (removed per user request)

// stop voice when the user leaves the site / tab hidden
if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopVoice();
  });
  window.addEventListener("pagehide", () => {
    stopVoice();
    try {
      ctx?.close();
    } catch {
      /* ignore */
    }
    ctx = null;
    gunBus = null;
    gunVerb = null;
  });
}

/* ---------------- Bangla voice ---------------- */

let cachedVoices: SpeechSynthesisVoice[] = [];

function loadVoices() {
  try {
    cachedVoices = window.speechSynthesis.getVoices();
  } catch {
    cachedVoices = [];
  }
}

if (typeof window !== "undefined" && "speechSynthesis" in window) {
  loadVoices();
  window.speechSynthesis.onvoiceschanged = loadVoices;
}

const FEMALE_HINT = /female|woman|girl|nari|mahila|mohila|zira|samantha|lekha|isha|tessa|veena/i;

function pickVoice(): SpeechSynthesisVoice | undefined {
  const bn = cachedVoices.filter((v) => v.lang && v.lang.toLowerCase().startsWith("bn"));
  return (
    bn.find((v) => FEMALE_HINT.test(v.name)) ||
    bn.find((v) => /google/i.test(v.name)) ||
    bn[0] ||
    cachedVoices.find((v) => FEMALE_HINT.test(v.name)) ||
    cachedVoices[0]
  );
}

/**
 * Bangla voice guidance — female voice when the device supports one,
 * otherwise the device default (male) voice naturally. Max volume,
 * BGM ducks underneath while speaking.
 */
export function speakBn(text: string) {
  if (typeof window === "undefined" || !soundEnabled()) return;
  if (!("speechSynthesis" in window)) return;
  try {
    loadVoices();
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "bn-BD";
    u.rate = 0.92; // slightly slower = clearer, complete delivery
    u.volume = 1;
    u.pitch = 1; // natural — no pitch shifting
    const v = pickVoice();
    if (v) u.voice = v;
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
  welcomeUser: (name: string) =>
    `${name}, ডিজিপ্লাইরাতে আপনাকে স্বাগতম! পছন্দের প্যাকেজ সিলেক্ট করুন।`,
  /** short prompt for return visits (no repeat welcome) */
  pickPackage: "পছন্দের প্যাকেজ সিলেক্ট করুন।",
  selected: (name: string) =>
    `${name} সিলেক্ট হয়েছে। এখন নিচে আপনার প্লেয়ার ইউআইডি আর মোবাইল নম্বর দিন।`,
  checkout: (name: string) => `${name} সিলেক্ট হয়েছে। চেকআউট পেজে নিয়ে যাওয়া হচ্ছে।`,
  success:
    "অর্ডার সফল হয়েছে! পেমেন্ট যাচাই করে পনেরো মিনিটের মধ্যে আপনার ইউআইডিতে ডায়মন্ড পাঠিয়ে দেওয়া হবে।",
  catAll: "সব প্যাকেজ দেখানো হচ্ছে।",
  catOffer: "ছাড়ের অফারগুলো দেখুন।",
  catDiamond: "ডায়মন্ড প্যাকেজগুলো দেখুন।",
  catMembership: "মেম্বারশিপ প্যাকেজগুলো দেখুন।",
  payMethod: (methodBn: string, number: string, amount: string) =>
    `${methodBn} সিলেক্ট হয়েছে। ${number} নম্বরে ${amount} টাকা সেন্ড মানি করুন।`,
  copied: (methodBn: string) => `${methodBn} নম্বর কপি হয়েছে।`,
  tracking: "অর্ডার খোঁজা হচ্ছে।",
  trackFound: (n: number) => `${n}টি অর্ডার পাওয়া গেছে।`,
  trackEmpty: "এই নম্বরে কোনো অর্ডার পাওয়া যায়নি।",
  soundOn: "সাউন্ড চালু হয়েছে।",
};
