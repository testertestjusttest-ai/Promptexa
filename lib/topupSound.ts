// Synthesized SFX + Bangla (female) voice guidance + ambient BGM for /topup.
// No audio files needed — everything is generated with Web Audio.

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

/* ---------------- ambient background music ---------------- */
// Quiet epic loop: deep pulse + minor pad + sparkle. Free Fire lobby vibe.

let bgmTimer: ReturnType<typeof setInterval> | null = null;
let bgmBar = 0;
let bgmMaster: GainNode | null = null;
let bgmPlaying = false;
let bgmPausedHidden = false;

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

const BGM_CHORDS: number[][] = [
  [110, 130.81, 164.81], // Am
  [87.31, 110, 130.81], // F
  [130.81, 164.81, 196], // C
  [98, 123.47, 146.83], // G
];
const BGM_SPARKLE = [440, 523.25, 587.33, 659.25, 783.99, 880];

function bgmBar_() {
  const c = ac();
  if (!c || !bgmEnabled()) return;
  const t0 = c.currentTime + 0.05;
  const chord = BGM_CHORDS[bgmBar % BGM_CHORDS.length];
  bgmBar++;

  // pad — soft detuned saws through lowpass
  const master = getBgmMaster(c);
  const padGain = c.createGain();
  padGain.gain.setValueAtTime(0.0001, t0);
  padGain.gain.exponentialRampToValueAtTime(0.065, t0 + 1.2);
  padGain.gain.exponentialRampToValueAtTime(0.0001, t0 + 3.9);
  const lp = c.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 700;
  padGain.connect(lp).connect(master);
  chord.forEach((f) => {
    const o = c.createOscillator();
    o.type = "sawtooth";
    o.frequency.value = f;
    o.detune.value = 4;
    o.connect(padGain);
    o.start(t0);
    o.stop(t0 + 4);
  });

  // heartbeat pulse — 8 kicks per bar
  for (let i = 0; i < 8; i++) {
    const t = t0 + i * 0.5;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(65, t);
    o.frequency.exponentialRampToValueAtTime(38, t + 0.18);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.14, t + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
    o.connect(g).connect(master);
    o.start(t);
    o.stop(t + 0.3);
  }

  // sparkle arpeggio — pentatonic wander
  for (let i = 0; i < 4; i++) {
    const t = t0 + 0.25 + i * 0.9;
    const f = BGM_SPARKLE[(bgmBar * 3 + i * 2) % BGM_SPARKLE.length];
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = "triangle";
    o.frequency.value = f;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.06, t + 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.7);
    o.connect(g).connect(master);
    o.start(t);
    o.stop(t + 0.8);
  }
}

export function startBgm() {
  if (bgmTimer || typeof window === "undefined") return;
  if (!bgmEnabled()) return;
  ac();
  bgmPlaying = true;
  bgmBar_();
  bgmTimer = setInterval(bgmBar_, 4000);
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

/* ---------------- Bangla female voice ---------------- */

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

function isFemaleVoice(v: SpeechSynthesisVoice): boolean {
  return FEMALE_HINT.test(v.name);
}

function pickVoice(): { voice: SpeechSynthesisVoice | undefined; female: boolean } {
  const bn = cachedVoices.filter((v) => v.lang && v.lang.toLowerCase().startsWith("bn"));
  const femBn = bn.find(isFemaleVoice);
  if (femBn) return { voice: femBn, female: true };
  const googleBn = bn.find((v) => /google/i.test(v.name));
  if (googleBn) return { voice: googleBn, female: false };
  if (bn[0]) return { voice: bn[0], female: false };
  const femAny = cachedVoices.find(isFemaleVoice);
  if (femAny) return { voice: femAny, female: false };
  return { voice: cachedVoices[0], female: false };
}

/** Bangla voice guidance — female voice preferred, max volume, BGM ducks underneath */
export function speakBn(text: string) {
  if (typeof window === "undefined" || !soundEnabled()) return;
  if (!("speechSynthesis" in window)) return;
  try {
    loadVoices(); // refresh — voices can arrive after page load
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "bn-BD";
    u.rate = 0.95;
    u.volume = 1; // full volume
    const { voice, female } = pickVoice();
    if (voice) u.voice = voice;
    // no female voice on this device → raise pitch so it sounds feminine
    u.pitch = female ? 1.05 : 1.45;
    setDuck(true);
    u.onend = () => setDuck(false);
    u.onerror = () => setDuck(false);
    window.speechSynthesis.speak(u);
    // safety: never leave BGM ducked if events don't fire
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
  checkout: (name: string) =>
    `${name} সিলেক্ট হয়েছে। চেকআউট পেজে নিয়ে যাওয়া হচ্ছে।`,
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
