"use client";

/** QuoteModal — "এরকম সাইট চাই" → details form → WhatsApp message to DigiPlyra.
 * Lets a visitor describe the website they want and knock (নক) directly.
 */

import { useEffect, useState } from "react";

const TYPES = ["ই-কমার্স শপ", "রেস্টুরেন্ট / ফুড", "সার্ভিস / বুকিং", "পোর্টফোলিও", "নিউজ পোর্টাল", "অন্যান্য"];
const BUDGETS = ["৫–১০ হাজার", "১০–২৫ হাজার", "২৫–৫০ হাজার", "৫০ হাজার+"];

export default function QuoteModal({ demoName, slug, onClose }: { demoName: string; slug: string; onClose: () => void }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [type, setType] = useState(TYPES[0]);
  const [budget, setBudget] = useState(BUDGETS[1]);
  const [details, setDetails] = useState("");
  const [error, setError] = useState("");
  const [wa, setWa] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    setWa("8801833402586");
  }, []);

  function send() {
    setError("");
    if (name.trim().length < 3) return setError("আপনার নাম লিখুন");
    if (!/^01[3-9]\d{8}$/.test(phone.trim())) return setError("সঠিক ১১ সংখ্যার মোবাইল নম্বর দিন");
    if (!wa) return setError("WhatsApp নম্বর পাওয়া যাচ্ছে না — পেজ রিফ্রেশ করে আবার চেষ্টা করুন");
    setSending(true);
    const msg =
      `🆕 ওয়েবসাইট লাগবে (ডেমো থেকে)\n\n` +
      `👤 নাম: ${name.trim()}\n` +
      `📞 মোবাইল: ${phone.trim()}\n` +
      `🌐 ধরন: ${type}\n` +
      `💰 বাজেট: ${budget} টাকা\n` +
      `📝 বিস্তারিত: ${details.trim() || "(লেখেননি)"}\n\n` +
      `🔗 রেফারেন্স ডেমো: ${demoName} (demo.digiplyra.com/${slug})`;
    window.open(`https://wa.me/${wa}?text=${encodeURIComponent(msg)}`, "_blank", "noopener");
    setSending(false);
    onClose();
  }

  const field =
    "w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-white/40";

  return (
    <div className="fixed inset-0 z-[90] grid place-items-center bg-black/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="animate-modal-pop max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl bg-[#101828] p-6 text-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <p className="text-lg font-black">📝 এরকম সাইট চাই</p>
          <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-lg" aria-label="বন্ধ">
            ✕
          </button>
        </div>
        <p className="mt-1 text-xs text-slate-400">
          <b className="text-white">{demoName}</b>-এর মতো ওয়েবসাইট চান? নিচে লিখুন — WhatsApp-এ সরাসরি পাঠিয়ে দিন।
        </p>
        <div className="mt-4 space-y-3">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="আপনার নাম *" className={field} />
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="মোবাইল নম্বর * (01XXXXXXXXX)" className={field} inputMode="numeric" />
          <div>
            <p className="mb-1.5 text-xs font-bold text-slate-400">কী ধরনের ওয়েবসাইট চান?</p>
            <div className="flex flex-wrap gap-2">
              {TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`rounded-full px-3.5 py-2 text-xs font-bold transition ${type === t ? "bg-[#d7ff3f] text-black" : "bg-white/10 text-slate-300 hover:bg-white/20"}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-1.5 text-xs font-bold text-slate-400">বাজেট</p>
            <div className="flex flex-wrap gap-2">
              {BUDGETS.map((b) => (
                <button
                  key={b}
                  onClick={() => setBudget(b)}
                  className={`rounded-full px-3.5 py-2 text-xs font-bold transition ${budget === b ? "bg-[#d7ff3f] text-black" : "bg-white/10 text-slate-300 hover:bg-white/20"}`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="বিস্তারিত লিখুন... (যেমন: কী কী পেজ লাগবে, কী ফিচার চান)"
            rows={3}
            className={field}
          />
        </div>
        {error && <p className="mt-3 rounded-xl bg-red-500/10 px-4 py-2.5 text-xs font-bold text-red-300">⚠️ {error}</p>}
        <button
          onClick={send}
          disabled={sending}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#25D366] py-3.5 font-black text-white transition hover:brightness-110 active:scale-[0.98]"
        >
          <span className="text-lg">💬</span> WhatsApp-এ পাঠান
        </button>
        <p className="mt-2 text-center text-[11px] text-slate-500">বাটনে ক্লিক করলে WhatsApp ওপেন হবে — মেসেজ রেডি থাকবে</p>
      </div>
    </div>
  );
}
