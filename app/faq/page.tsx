"use client";

import { useMemo, useState } from "react";
import MotionBg from "@/components/MotionBg";

type QA = { q: string; a: string; keys: string[]; cat: string };

const BANK: QA[] = [
  { cat: "🌐 ওয়েবসাইট সার্ভিস", q: "ওয়েবসাইট বানাতে কত টাকা লাগবে?", a: "ডেমোর ধরন অনুযায়ী দাম ভিন্ন — প্রতিটি ডেমো কার্ডে দাম লেখা আছে। আপনার চাহিদা অনুযায়ী কাস্টম কোটের জন্য /web-dev পেজের ফর্মটি পূরণ করুন, ২৪ ঘণ্টার মধ্যে আমরা জানিয়ে দেবো।", keys: ["দাম", "খরচ", "টাকা", "প্রাইস", "কত", "price", "cost"] },
  { cat: "🌐 ওয়েবসাইট সার্ভিস", q: "ওয়েবসাইট ডেলিভারি পেতে কতদিন লাগবে?", a: "সাধারণত ৭–১৪ দিন। আপনার কনটেন্ট (ছবি, লেখা) দ্রুত দিলে আরও তাড়াতাড়ি ডেলিভারি সম্ভব।", keys: ["দিন", "সময়", "ডেলিভারি", "কতদিন", "delivery", "time"] },
  { cat: "🌐 ওয়েবসাইট সার্ভিস", q: "ডেমো মানে কী? আমার সাইট কি এরকমই হবে?", a: "ডেমো শুধু নমুনা — আপনার ব্যবসার নাম, লোগো, ছবি ও কনটেন্ট দিয়ে আপনার পছন্দমতো ১০০% কাস্টমাইজ করে বানিয়ে দেওয়া হবে। ডেমোর প্রতিটা বাটন ঘেঁটে দেখুন, এরকমই কাজ করবে আপনার সাইটে।", keys: ["ডেমো", "নমুনা", "demo"] },
  { cat: "🌐 ওয়েবসাইট সার্ভিস", q: "ওয়েবসাইটের সাথে কী কী সাপোর্ট পাবো?", a: "ডোমেইন সেটআপ, হোস্টিং, বিকাশ/নগদ পেমেন্ট ইন্টিগ্রেশন, গুগল SEO, ফেসবুক পিক্সেল, বাংলায় ট্রেনিং এবং ফ্রি টেকনিক্যাল সাপোর্ট — সবই আমরা করে দিই।", keys: ["সাপোর্ট", "সাহায্য", "support", "হেল্প"] },
  { cat: "💰 আয় ও রিওয়ার্ড", q: "আর্ন পেজে কীভাবে টাকা আয় করবো?", a: "\"Earn Now\" চাপুন → ২০টি কার্ড আসবে। প্রতিটি কার্ডে ক্লিক করলে অ্যাড খুলবে, ১৫ সেকেন্ড পর কার্ডে ✓ পড়বে। ২০টি শেষ হলে একসাথে ২০ টাকা বোনাস ওয়ালেটে নিন! প্রতি রাউন্ড ১ ঘণ্টা।", keys: ["আয়", "আর্ন", "রিওয়ার্ড", "বোনাস", "কার্ড", "earn", "reward"] },
  { cat: "💰 আয় ও রিওয়ার্ড", q: "টাকা কখন তুলতে পারবো? (উইথড্র)", a: "ওয়ালেটে সর্বনিম্ন ৫০০ টাকা হলেই উইথড্র করা যায়। আর্ন পেজের উইথড্র ফর্মে বিকাশ/নগদ/রকেট নম্বর দিন — অ্যাডমিন যাচাই করে পাঠিয়ে দেবে।", keys: ["উইথড্র", "তুলতে", "টাকা তোলা", "withdraw", "বিকাশ"] },
  { cat: "💰 আয় ও রিওয়ার্ড", q: "রেফার করে কী পাবো?", a: "আপনার রেফারেল লিংকে কেউ জয়েন করে প্রথম কেনাকাটা করলেই আপনি ২০ টাকা বোনাস পাবেন। লিংক পাবেন আর্ন পেজে।", keys: ["রেফার", "refer", "বন্ধু"] },
  { cat: "🛒 কেনাকাটা", q: "পেমেন্ট কীভাবে করবো?", a: "কার্ড/মোবাইল ব্যাংকিং (SSLCommerz) দিয়ে সরাসরি, অথবা বিকাশ/নগদ/রকেটে ম্যানুয়ালি টাকা পাঠিয়ে TrxID সাবমিট করুন — অ্যাডমিন কনফার্ম করলেই ডেলিভারি।", keys: ["পেমেন্ট", "বিকাশ", "নগদ", "payment", "trx"] },
  { cat: "🛒 কেনাকাটা", q: "APK/ফাইল কীভাবে ডাউনলোড করবো?", a: "পেমেন্ট কনফার্ম হলে ড্যাশবোর্ডে ডাউনলোড বাটন আসবে। লিংক একবার ব্যবহারযোগ্য ও ৭ দিন মেয়াদি — সময়মতো ডাউনলোড করে নিন।", keys: ["apk", "ডাউনলোড", "ফাইল", "download", "ইনস্টল"] },
  { cat: "🛒 কেনাকাটা", q: "রিফান্ড পাবো কি?", a: "ডিজিটাল প্রোডাক্টে সাধারণত রিফান্ড হয় না, তবে ভুল প্রোডাক্ট বা ডেলিভারি সমস্যা হলে সাপোর্টে জানান — আমরা সমাধান করে দেবো।", keys: ["রিফান্ড", "ফেরত", "refund"] },
  { cat: "🎮 ID বাজার", q: "ID কেনাবেচা কি নিরাপদ?", a: "১০০% এসক্রো সিস্টেম — ক্রেতার টাকা আগে অ্যাডমিনের কাছে জমা থাকে। ID বুঝে পেয়ে কনফার্ম করলেই বিক্রেতা টাকা পায়। বিক্রেতাকে সরাসরি টাকা দেবেন না!", keys: ["নিরাপদ", "এসক্রো", "প্রতারণা", "safe", "escrow"] },
  { cat: "🎮 ID বাজার", q: "ID বিক্রিতে অ্যাডমিন ফি কত?", a: "মাত্র ২% — বিক্রি সম্পন্ন হলে দামের ২% কেটে বাকি টাকা বিক্রেতাকে দেওয়া হয়।", keys: ["ফি", "কমিশন", "fee", "২%"] },
  { cat: "👤 অ্যাকাউন্ট", q: "লগইন করতে পারছি না, কী করবো?", a: "পাসওয়ার্ড ভুলে গেলে লগইন পেজের 'পাসওয়ার্ড ভুলে গেছেন?' অপশন ব্যবহার করুন। তাও না হলে WhatsApp সাপোর্টে মেসেজ দিন।", keys: ["লগইন", "পাসওয়ার্ড", "login", "password"] },
  { cat: "👤 অ্যাকাউন্ট", q: "সাপোর্টের সাথে কীভাবে যোগাযোগ করবো?", a: "সাইটের ডান-নিচে সবুজ WhatsApp বাটনে ক্লিক করুন — প্রতিদিন সকাল ৯টা থেকে রাত ১১টা পর্যন্ত সাপোর্ট পাবেন।", keys: ["যোগাযোগ", "সাপোর্ট", "whatsapp", "হোয়াটসঅ্যাপ", "ফোন"] },
];

function findAnswer(query: string): QA | null {
  const q = query.toLowerCase();
  let best: QA | null = null;
  let bestScore = 0;
  for (const item of BANK) {
    let score = 0;
    for (const k of item.keys) if (q.includes(k.toLowerCase())) score += k.length > 3 ? 2 : 1;
    // bonus for question-word overlap
    const qw = item.q.replace(/[?।]/g, "").split(/[\s,]+/);
    for (const w of qw) if (w.length > 3 && q.includes(w.toLowerCase())) score += 1;
    if (score > bestScore) { bestScore = score; best = item; }
  }
  return bestScore > 0 ? best : null;
}

const CATS = [...new Set(BANK.map((b) => b.cat))];

export default function FaqPage() {
  const [ask, setAsk] = useState("");
  const [chat, setChat] = useState<{ me: boolean; text: string }[]>([
    { me: false, text: "👋 আসসালামু আলাইকুম! আমি DigiPlyra সহকারী। আপনার প্রশ্ন লিখুন — সাথে সাথে উত্তর দেবো।" },
  ]);
  const [openCat, setOpenCat] = useState<string>(CATS[0]);
  const [openQ, setOpenQ] = useState<number | null>(null);

  function send() {
    const q = ask.trim();
    if (!q) return;
    const ans = findAnswer(q);
    setChat((c) => [
      ...c,
      { me: true, text: q },
      { me: false, text: ans ? ans.a : "😅 এই বিষয়ে তথ্য পাইনি। WhatsApp সাপোর্টে (ডান-নিচের সবুজ বাটন) জিজ্ঞেস করুন — সাথে সাথে সাহায্য পাবেন!" },
    ]);
    setAsk("");
  }

  const catItems = useMemo(() => BANK.map((b, i) => ({ ...b, i })).filter((b) => b.cat === openCat), [openCat]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 px-6 py-8 text-center">
        <MotionBg intensity="soft" />
        <h1 className="font-display relative text-3xl font-black text-white">❓ সাধারণ জিজ্ঞাসা</h1>
        <p className="relative mt-2 text-sm text-slate-400">প্রশ্ন লিখুন — অটোমেটিক উত্তর পাবেন ⚡</p>
      </div>

      {/* Auto-answer ask box */}
      <div className="glass mt-6 rounded-3xl p-5">
        <div className="max-h-72 space-y-2.5 overflow-y-auto pr-1">
          {chat.map((m, i) => (
            <div key={i} className={`flex ${m.me ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${m.me ? "bg-[#d7ff3f] font-bold text-black" : "bg-white/10 text-slate-100"}`}>
                {m.text}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          <input
            value={ask}
            onChange={(e) => setAsk(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="আপনার প্রশ্ন লিখুন… (যেমন: ওয়েবসাইটের দাম কত?)"
            className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-[#d7ff3f]/50"
          />
          <button onClick={send} className="btn-vault !px-5 !py-2.5 text-sm">পাঠান ➤</button>
        </div>
      </div>

      {/* Category Q&A */}
      <div className="mt-8 flex flex-wrap gap-2">
        {CATS.map((c) => (
          <button key={c} onClick={() => { setOpenCat(c); setOpenQ(null); }}
            className={`rounded-full px-4 py-2 text-xs font-bold ${openCat === c ? "bg-[#d7ff3f] text-black" : "bg-white/10 text-slate-300"}`}>{c}</button>
        ))}
      </div>
      <div className="mt-4 space-y-2">
        {catItems.map((b) => (
          <div key={b.i} className="glass overflow-hidden rounded-2xl">
            <button onClick={() => setOpenQ(openQ === b.i ? null : b.i)} className="flex w-full items-center justify-between px-4 py-3.5 text-left">
              <span className="text-sm font-bold text-white">{b.q}</span>
              <span className="text-[#d7ff3f]">{openQ === b.i ? "▲" : "▼"}</span>
            </button>
            {openQ === b.i && <p className="border-t border-white/5 px-4 py-3.5 text-sm leading-relaxed text-slate-300">{b.a}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
