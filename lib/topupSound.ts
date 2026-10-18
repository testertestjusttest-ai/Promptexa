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

export function bgmEnabled(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem("topup_bgm") !== "off";
}

export function setBgmEnabled(on: boolean): void {
  try {
    localStorage.setItem("topup_bgm", on ? "on" : "off");
  } catch {
    /* ignore */
  }
  if (on) startBgm();
  else stopBgm();
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
  tap: { dur: 0.12, cutoff: 4500, vol: 0.16, base: 170 },
  pistol: { dur: 0.18, cutoff: 4000, vol: 0.34, base: 150 },
  smg: { dur: 0.1, cutoff: 3800, vol: 0.26, base: 165 },
  rifle: { dur: 0.32, cutoff: 2400, vol: 0.4, base: 110 },
  shotgun: { dur: 0.5, cutoff: 1100, vol: 0.5, base: 70 },
  sniper: { dur: 0.7, cutoff: 5200, vol: 0.44, base: 130 },
};

/** Free Fire style gunshot — kind varies the weapon character */
export function gunshot(kind: GunKind = "pistol") {
  const c = ac();
  if (!c || !soundEnabled()) return;
  const t = c.currentTime + 0.01;
  const p = GUN[kind];

  // noise crack
  const src = noiseSrc(c, p.dur);
  const f = c.createBiquadFilter();
  f.type = "lowpass";
  f.frequency.setValueAtTime(p.cutoff, t);
  f.frequency.exponentialRampToValueAtTime(Math.max(p.cutoff * 0.15, 40), t + p.dur);
  const g = c.createGain();
  g.gain.setValueAtTime(p.vol, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + p.dur);
  src.connect(f).connect(g).connect(c.destination);
  src.start(t);

  // body thump
  const o = c.createOscillator();
  o.type = "sine";
  o.frequency.setValueAtTime(p.base, t);
  o.frequency.exponentialRampToValueAtTime(38, t + 0.16);
  const og = c.createGain();
  og.gain.setValueAtTime(p.vol * 0.9, t);
  og.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
  o.connect(og).connect(c.destination);
  o.start(t);
  o.stop(t + 0.3);

  // sniper gets a distant echo crack
  if (kind === "sniper") {
    const t2 = t + 0.28;
    const src2 = noiseSrc(c, 0.25);
    const f2 = c.createBiquadFilter();
    f2.type = "lowpass";
    f2.frequency.value = 1800;
    const g2 = c.createGain();
    g2.gain.setValueAtTime(0.16, t2);
    g2.gain.exponentialRampToValueAtTime(0.001, t2 + 0.25);
    src2.connect(f2).connect(g2).connect(c.destination);
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

let tapGunInit = false;
/** every tap on the page fires a soft shot — unless the element plays its own gun */
export function initTapGuns() {
  if (tapGunInit || typeof document === "undefined") return;
  tapGunInit = true;
  document.addEventListener("pointerdown", (e) => {
    if (!soundEnabled()) return;
    const t = e.target as HTMLElement | null;
    if (t && t.closest && t.closest("[data-gun]")) return;
    gunshot("tap");
  });
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

/* ---------------- Free Fire style trap BGM ---------------- */

let bgmTimer: ReturnType<typeof setInterval> | null = null;
let bgmBar = 0;
let bgmMaster: GainNode | null = null;
let bgmPlaying = false;
let bgmPausedHidden = false;

const BGM_BB = 60 / 132; // beat seconds @132bpm
const BGM_BAR_MS = BGM_BB * 8 * 1000;
const BGM_ROOTS = [55, 55, 43.65, 49]; // A1 A1 F1 G1
const BGM_LEAD = [220, 246.94, 261.63, 293.66, 329.63, 392]; // A minor

function getBgmMaster(c: AudioContext): GainNode {
  if (!bgmMaster || bgmMaster.context !== c) {
    bgmMaster = c.createGain();
    bgmMaster.gain.value = 1;
    bgmMaster.connect(c.destination);
  }
  return bgmMaster;
}

/** duck BGM under voice guidance so speech stays loud and clear */
function setDuck(on: boolean) {
  const c = ac();
  if (!c) return;
  try {
    getBgmMaster(c).gain.setTargetAtTime(on ? 0.12 : 1, c.currentTime, 0.25);
  } catch {
    /* ignore */
  }
}

function bgmBar_() {
  const c = ac();
  if (!c || !bgmEnabled()) return;
  const master = getBgmMaster(c);
  const t0 = c.currentTime + 0.06;
  const bar = bgmBar++;
  const root = BGM_ROOTS[bar % BGM_ROOTS.length];

  const env = (t: number, peak: number, dur: number): GainNode => {
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0001), t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    g.connect(master);
    return g;
  };

  // hard kicks — four on the floor
  [0, 2, 4, 6].forEach((b) => {
    const t = t0 + b * BGM_BB;
    const o = c.createOscillator();
    o.type = "sine";
    o.frequency.setValueAtTime(130, t);
    o.frequency.exponentialRampToValueAtTime(38, t + 0.12);
    o.connect(env(t, 0.5, 0.2));
    o.start(t);
    o.stop(t + 0.28);
  });

  // clap/snare on 2 & 6
  [2, 6].forEach((b) => {
    const t = t0 + b * BGM_BB;
    const src = noiseSrc(c, 0.22);
    const f = c.createBiquadFilter();
    f.type = "bandpass";
    f.frequency.value = 1900;
    f.Q.value = 0.9;
    src.connect(f).connect(env(t, 0.2, 0.2));
    src.start(t);
  });

  // hi-hats — 16ths with extra snap
  for (let i = 0; i < 16; i++) {
    const t = t0 + i * (BGM_BB / 2);
    const src = noiseSrc(c, 0.05);
    const f = c.createBiquadFilter();
    f.type = "highpass";
    f.frequency.value = 7500;
    src.connect(f).connect(env(t, i % 4 === 0 ? 0.085 : 0.045, 0.04));
    src.start(t);
  }

  // 808 bass slides
  for (let i = 0; i < 4; i++) {
    const t = t0 + i * BGM_BB * 2;
    const next = BGM_ROOTS[(bar + (i === 3 ? 1 : 0)) % BGM_ROOTS.length];
    const o = c.createOscillator();
    o.type = "sawtooth";
    o.frequency.setValueAtTime(root, t);
    o.frequency.setValueAtTime(root, t + BGM_BB * 1.4);
    o.frequency.exponentialRampToValueAtTime(next, t + BGM_BB * 2);
    const f = c.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.value = 320;
    o.connect(f).connect(env(t, 0.3, BGM_BB * 1.9));
    o.start(t);
    o.stop(t + BGM_BB * 2);
  }

  // aggressive lead riff — minor 8ths
  const riff = [0, 2, 4, 3, 5, 4, 2, 1];
  riff.forEach((s, i) => {
    const t = t0 + i * BGM_BB;
    const o = c.createOscillator();
    o.type = "square";
    o.frequency.value = BGM_LEAD[(s + bar) % BGM_LEAD.length];
    const f = c.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.value = 2300;
    o.connect(f).connect(env(t, 0.06, BGM_BB * 0.9));
    o.start(t);
    o.stop(t + BGM_BB);
  });
}

export function startBgm() {
  if (bgmTimer || typeof window === "undefined") return;
  if (!bgmEnabled()) return;
  ac();
  bgmPlaying = true;
  bgmBar_();
  bgmTimer = setInterval(bgmBar_, BGM_BAR_MS);
}

export function stopBgm() {
  if (bgmTimer) {
    clearInterval(bgmTimer);
    bgmTimer = null;
  }
  bgmPlaying = false;
}

// auto-stop when the user leaves the site / tab hidden;
// resume when they come back (if it was playing)
if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      if (bgmPlaying) {
        bgmPausedHidden = true;
        stopBgm();
      }
      stopVoice();
    } else if (bgmPausedHidden && bgmEnabled()) {
      bgmPausedHidden = false;
      startBgm();
    }
  });
  window.addEventListener("pagehide", () => {
    bgmPausedHidden = false;
    stopBgm();
    stopVoice();
    try {
      ctx?.close();
    } catch {
      /* ignore */
    }
    ctx = null;
    bgmMaster = null;
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
    u.rate = 0.95;
    u.volume = 1;
    u.pitch = 1; // natural — no pitch shifting
    const v = pickVoice();
    if (v) u.voice = v;
    setDuck(true);
    u.onend = () => setDuck(false);
    u.onerror = () => setDuck(false);
    window.speechSynthesis.speak(u);
    setTimeout(() => setDuck(false), Math.max(4000, text.length * 120));
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
  bgmOn: "ব্যাকগ্রাউন্ড মিউজিক চালু হয়েছে।",
  bgmOff: "ব্যাকগ্রাউন্ড মিউজিক বন্ধ হয়েছে।",
  soundOn: "সাউন্ড চালু হয়েছে।",
};
