"use client";

import { useEffect, useState } from "react";

export default function SettingsClient() {
  const [numbers, setNumbers] = useState<Record<string, any>>({ bkash: "", nagad: "", rocket: "" });
  const [store, setStore] = useState({ name: "DigiPlyra", tagline: "", support_whatsapp: "", notice_bn: "" });
  const [ssl, setSsl] = useState({ enabled: false, sandbox: true, configured: false });
  const [ads, setAds] = useState({ enabled: false, home_top: "", home_bottom: "", product_page: "", popup: "" });
  const [rewards, setRewards] = useState({
    enabled: true,
    ad_reward_bdt: 2,
    ad_cooldown_sec: 60,
    ad_daily_limit: 20,
    referral_bonus_bdt: 20,
    min_withdraw_bdt: 500,
    reward_ad_code: "",
    reward_direct_link: "",
  });
  const [onesignal, setOnesignal] = useState("");
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) {
          setNumbers({ bkash: "", nagad: "", rocket: "", ...d.settings.payment_numbers });
          setStore((s) => ({ ...s, ...d.settings.store }));
          setSsl(d.sslcommerz);
          if (d.settings.ads) setAds((a) => ({ ...a, ...d.settings.ads }));
          if (d.settings.rewards) setRewards((r) => ({ ...r, ...d.settings.rewards }));
          if (d.settings.notifications?.onesignal_app_id) {
            setOnesignal(d.settings.notifications.onesignal_app_id);
          }
        }
        setLoading(false);
      });
  }, []);

  async function save(key: string, value: unknown) {
    setMsg("");
    const res = await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value }),
    });
    const data = await res.json();
    setMsg(data.ok ? "✓ সেভ হয়েছে" : `⚠️ ${data.error}`);
    setTimeout(() => setMsg(""), 2500);
  }

  if (loading) return <p className="text-slate-400">লোড হচ্ছে...</p>;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="glass rounded-2xl p-6">
        <h2 className="font-display text-lg font-bold text-white">💳 ম্যানুয়াল পেমেন্ট নম্বর</h2>
        <p className="mt-1 text-xs text-slate-500">চেকআউটে কাস্টমার এই নম্বরগুলো দেখবে। খালি রাখলে সেই মাধ্যম বন্ধ থাকবে।</p>
        <div className="mt-4 space-y-5">
          {([["bkash", "বিকাশ"], ["nagad", "নগদ"], ["rocket", "রকেট"]] as const).map(([k, label]) => {
            const info = numbers[k] && typeof numbers[k] === "object" ? numbers[k] : { number: numbers[k] ?? "", kind: "merchant", image: "" };
            const set = (patch: Partial<{ number: string; kind: string; image: string }>) =>
              setNumbers({ ...numbers, [k]: { ...info, ...patch } });
            return (
              <div key={k} className="rounded-xl bg-black/20 p-4">
                <p className="mb-2 text-sm font-bold text-white">{label}</p>
                <label className="mb-1 block text-xs text-slate-400">নম্বর</label>
                <input value={info.number} onChange={(e) => set({ number: e.target.value })}
                  placeholder="01XXXXXXXXX" className="field" inputMode="numeric" />
                <div className="mt-2 flex gap-2">
                  {(["merchant", "sendmoney"] as const).map((kind) => (
                    <button key={kind} onClick={() => set({ kind })}
                      className={`flex-1 rounded-lg px-3 py-2 text-xs font-bold transition ${info.kind === kind ? "bg-[#d7ff3f] text-black" : "bg-white/10 text-slate-300"}`}>
                      {kind === "merchant" ? "🏪 মার্চেন্ট" : "📤 সেন্ড মানি"}
                    </button>
                  ))}
                </div>
                <label className="mb-1 mt-2 block text-xs text-slate-400">{label} লোগো/ছবি URL (ঐচ্ছিক)</label>
                <input value={info.image} onChange={(e) => set({ image: e.target.value })}
                  placeholder="https://...png" className="field font-mono text-xs" dir="ltr" />
              </div>
            );
          })}
          <button onClick={() => save("payment_numbers", numbers)} className="btn-vault w-full !py-2.5 text-sm">
            💾 নম্বর সেভ করুন
          </button>
        </div>
      </div>

      <div className="glass rounded-2xl p-6">
        <h2 className="font-display text-lg font-bold text-white">🏪 স্টোর তথ্য</h2>
        <div className="mt-4 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm text-slate-300">ট্যাগলাইন</label>
            <input value={store.tagline} onChange={(e) => setStore({ ...store, tagline: e.target.value })} className="field" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-slate-300">হোয়াটসঅ্যাপ সাপোর্ট নম্বর</label>
            <input value={store.support_whatsapp} onChange={(e) => setStore({ ...store, support_whatsapp: e.target.value })} className="field" placeholder="8801XXXXXXXXX" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-slate-300">নোটিশ (হোমপেজে দেখাবে)</label>
            <textarea value={store.notice_bn} onChange={(e) => setStore({ ...store, notice_bn: e.target.value })} rows={3} className="field" />
          </div>
          <button onClick={() => save("store", store)} className="btn-vault w-full !py-2.5 text-sm">
            💾 তথ্য সেভ করুন
          </button>
        </div>
      </div>

      <div className="glass rounded-2xl p-6 lg:col-span-2">
        <h2 className="font-display text-lg font-bold text-white">📢 বিজ্ঞাপন (Adsterra / Monetag)</h2>
        <p className="mt-1 text-xs text-slate-500">
          Adsterra বা Monetag থেকে পাওয়া Ad Code এখানে পেস্ট করুন — সাইটে অটো শো হবে।
        </p>
        <label className="mt-4 flex items-center gap-2 text-sm font-semibold text-slate-200">
          <input
            type="checkbox"
            checked={ads.enabled}
            onChange={(e) => setAds({ ...ads, enabled: e.target.checked })}
            className="h-4 w-4 accent-[#d7ff3f]"
          />
          বিজ্ঞাপন চালু করুন
        </label>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {([
            ["home_top", "হোমপেজ — উপরে (স্লাইডারের নিচে)"],
            ["home_bottom", "হোমপেজ — নিচে (CTA-এর উপরে)"],
            ["product_page", "প্রোডাক্ট পেজ"],
            ["popup", "পপআপ বিজ্ঞাপন (৮ সেকেন্ড পর, সেশনে ১ বার)"],
          ] as const).map(([k, label]) => (
            <div key={k}>
              <label className="mb-1.5 block text-sm text-slate-300">{label}</label>
              <textarea
                value={ads[k]}
                onChange={(e) => setAds({ ...ads, [k]: e.target.value })}
                rows={3}
                className="field font-mono text-xs"
                placeholder="<script>...</script>"
              />
            </div>
          ))}
        </div>
        <button onClick={() => save("ads", ads)} className="btn-vault mt-4 !py-2.5 text-sm">
          💾 বিজ্ঞাপন সেভ করুন
        </button>
      </div>

      <div className="glass rounded-2xl p-6 lg:col-span-2">
        <h2 className="font-display text-lg font-bold text-white">💰 রিওয়ার্ড সিস্টেম (অ্যাড + রেফারেল + উত্তোলন)</h2>
        <p className="mt-1 text-xs text-slate-500">
          কাস্টমার অ্যাড দেখে ও রেফার করে টাকা আয় করবে — সব রেট এখান থেকে নিয়ন্ত্রণ করুন।
        </p>
        <label className="mt-4 flex items-center gap-2 text-sm font-semibold text-slate-200">
          <input
            type="checkbox"
            checked={rewards.enabled}
            onChange={(e) => setRewards({ ...rewards, enabled: e.target.checked })}
            className="h-4 w-4 accent-[#d7ff3f]"
          />
          রিওয়ার্ড সিস্টেম চালু করুন
        </label>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {([
            ["ad_reward_bdt", "প্রতি অ্যাডে বোনাস (৳)"],
            ["ad_cooldown_sec", "দুই অ্যাডের ব্যবধান (সেকেন্ড)"],
            ["ad_daily_limit", "দৈনিক সর্বোচ্চ অ্যাড"],
            ["referral_bonus_bdt", "রেফারেল বোনাস (৳)"],
            ["min_withdraw_bdt", "সর্বনিম্ন উত্তোলন (৳)"],
          ] as const).map(([k, label]) => (
            <div key={k}>
              <label className="mb-1.5 block text-sm text-slate-300">{label}</label>
              <input
                type="number"
                min={0}
                value={rewards[k]}
                onChange={(e) => setRewards({ ...rewards, [k]: Number(e.target.value) })}
                className="field"
              />
            </div>
          ))}
        </div>
        <div className="mt-4">
          <label className="mb-1.5 block text-sm text-slate-300">
            রিওয়ার্ড অ্যাড কোড (Monetag / Adsterra / Monetag)
          </label>
          <textarea
            value={rewards.reward_ad_code}
            onChange={(e) => setRewards({ ...rewards, reward_ad_code: e.target.value })}
            rows={4}
            className="field font-mono text-xs"
            placeholder="<script>...</script> — কাস্টমার 'অ্যাড দেখুন' চাপলে এই অ্যাড শো হবে"
          />
          <p className="mt-1 text-xs text-slate-500">
            💡 Monetag-এর Rewarded Ad / Adsterra-এর Smartlink কোড এখানে বসান।
          </p>
        </div>
        <div className="mt-4">
          <label className="mb-1.5 block text-sm text-slate-300">
            রিওয়ার্ড ডাইরেক্ট লিংক (কার্ডে ক্লিক করলে যেখানে যাবে)
          </label>
          <input
            value={rewards.reward_direct_link ?? ""}
            onChange={(e) => setRewards({ ...rewards, reward_direct_link: e.target.value })}
            className="field font-mono text-xs"
            placeholder="https://... — Adsterra Direct Link / Smartlink"
            dir="ltr"
          />
          <p className="mt-1 text-xs text-slate-500">
            💡 ২০-বক্স ফ্লোতে প্রতিটি বক্সে ক্লিক করলে এই লিংক নতুন ট্যাবে খুলবে।
          </p>
        </div>
        <button onClick={() => save("rewards", rewards)} className="btn-vault mt-4 !py-2.5 text-sm">
          💾 রিওয়ার্ড সেটিংস সেভ করুন
        </button>
      </div>

      <div className="glass rounded-2xl p-6 lg:col-span-2">
        <h2 className="font-display text-lg font-bold text-white">🔔 পুশ নোটিফিকেশন (OneSignal)</h2>
        <p className="mt-1 text-xs text-slate-500">
          <a href="https://onesignal.com" target="_blank" rel="noreferrer" className="text-[#d7ff3f] underline">onesignal.com</a> থেকে
          ফ্রি App ID নিয়ে এখানে বসান — কাস্টমাররা অফার/ডেলিভারি নোটিফিকেশন পাবে (PWA + ওয়েব)।
        </p>
        <div className="mt-4 flex max-w-xl gap-2">
          <input
            value={onesignal}
            onChange={(e) => setOnesignal(e.target.value)}
            className="field font-mono text-sm"
            placeholder="OneSignal App ID"
          />
          <button
            onClick={() => save("notifications", { onesignal_app_id: onesignal.trim() })}
            className="btn-vault shrink-0 !py-2.5 text-sm"
          >
            💾 সেভ
          </button>
        </div>
      </div>

      <div className="glass rounded-2xl p-6 lg:col-span-2">
        <h2 className="font-display text-lg font-bold text-white">🔌 SSLCommerz (কার্ড পেমেন্ট)</h2>
        <div className="mt-3 flex flex-wrap gap-2 text-sm">
          <span className={`chip ${ssl.configured ? "chip-lime" : ""}`}>
            {ssl.configured ? "✓ API কী সেট করা আছে" : "✕ API কী সেট নেই"}
          </span>
          <span className={`chip ${ssl.enabled ? "chip-lime" : ""}`}>
            {ssl.enabled ? "✓ চেকআউটে চালু" : "✕ চেকআউটে বন্ধ"}
          </span>
          <span className="chip">{ssl.sandbox ? "🧪 Sandbox মোড" : "💰 Live মোড"}</span>
        </div>
        <div className="mt-4 rounded-xl bg-white/[0.03] p-4 text-sm leading-relaxed text-slate-400">
          <p className="font-bold text-white">সেটআপ পদ্ধতি:</p>
          <ol className="mt-2 list-decimal space-y-1 pl-5">
            <li><a href="https://www.sslcommerz.com" target="_blank" rel="noreferrer" className="text-[#d7ff3f] underline">sslcommerz.com</a> থেকে মার্চেন্ট অ্যাকাউন্ট খুলে <b className="text-white">Store ID</b> ও <b className="text-white">Store Password</b> নিন</li>
            <li>Vercel → Project → Settings → Environment Variables-এ যোগ করুন:
              <code className="mx-1 rounded bg-black/50 px-1.5 py-0.5 font-mono text-xs text-white">SSLCOMMERZ_STORE_ID</code>,
              <code className="mx-1 rounded bg-black/50 px-1.5 py-0.5 font-mono text-xs text-white">SSLCOMMERZ_STORE_PASSWORD</code>,
              <code className="mx-1 rounded bg-black/50 px-1.5 py-0.5 font-mono text-xs text-white">SSLCOMMERZ_ENABLED=true</code>
            </li>
            <li>টেস্টের জন্য <code className="rounded bg-black/50 px-1.5 py-0.5 font-mono text-xs text-white">SSLCOMMERZ_SANDBOX=true</code> রাখুন; লাইভে <code className="rounded bg-black/50 px-1.5 py-0.5 font-mono text-xs text-white">false</code> করুন</li>
            <li>Redeploy করলেই কার্ড পেমেন্ট চালু হয়ে যাবে ✅</li>
          </ol>
        </div>
      </div>

      {msg && (
        <p className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-xl bg-[#d7ff3f] px-5 py-2.5 text-sm font-bold text-[#060913] shadow-xl">
          {msg}
        </p>
      )}
    </div>
  );
}
