"use client";

import { useEffect, useState } from "react";
import { timeAgo, toBnDigits } from "@/lib/format";

type Product = { id: string; name: string; plans: { id: string; label_bn: string }[] };
type KeyRow = {
  id: string;
  key_text: string;
  key_note: string | null;
  is_used: boolean;
  created_at: string;
  plan: { label_bn: string } | null;
  product: { name: string } | null;
};

export default function KeysClient({ products }: { products: Product[] }) {
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const [planId, setPlanId] = useState("");
  const [note, setNote] = useState("");
  const [keysText, setKeysText] = useState("");
  const [keys, setKeys] = useState<KeyRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const product = products.find((p) => p.id === productId);

  async function load(pid: string) {
    setLoading(true);
    const res = await fetch(`/api/admin/keys?product_id=${pid}`);
    const data = await res.json();
    if (data.ok) setKeys(data.keys);
    setLoading(false);
  }

  useEffect(() => {
    if (productId) {
      setPlanId("");
      load(productId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  async function addKeys() {
    setMsg("");
    if (!keysText.trim()) return setMsg("কী লিখুন (প্রতি লাইনে একটি)");
    setLoading(true);
    const res = await fetch("/api/admin/keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_id: productId, plan_id: planId || null, note, keys_text: keysText }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.ok) {
      setMsg(`✓ ${toBnDigits(data.added)}টি কী যোগ হয়েছে`);
      setKeysText("");
      load(productId);
    } else {
      setMsg(`⚠️ ${data.error || "ব্যর্থ"}`);
    }
  }

  async function del(id: string) {
    if (!confirm("এই কী মুছে ফেলবেন?")) return;
    const res = await fetch(`/api/admin/keys?id=${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.ok) load(productId);
    else alert(data.error || "ব্যর্থ");
  }

  const unused = keys.filter((k) => !k.is_used).length;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="glass rounded-2xl p-6">
        <h2 className="font-display text-lg font-bold text-white">➕ নতুন কী যোগ করুন</h2>
        <p className="mt-1 text-xs text-slate-500">
          প্রতি লাইনে একটি কী/অ্যাকাউন্ট লিখুন। পেমেন্ট সফল হলে সবচেয়ে পুরনো অব্যবহৃত কী অটো-ডেলিভারি হবে।
        </p>
        <div className="mt-4 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm text-slate-300">প্রোডাক্ট</label>
            <select value={productId} onChange={(e) => setProductId(e.target.value)} className="field">
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-slate-300">প্ল্যান (ঐচ্ছিক — নির্দিষ্ট প্ল্যানের জন্য)</label>
            <select value={planId} onChange={(e) => setPlanId(e.target.value)} className="field">
              <option value="">সব প্ল্যানের জন্য</option>
              {(product?.plans ?? []).map((pl) => (
                <option key={pl.id} value={pl.id}>{pl.label_bn}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-slate-300">নোট (ঐচ্ছিক — কী-এর সাথে দেখাবে)</label>
            <input value={note} onChange={(e) => setNote(e.target.value)} className="field"
              placeholder="যেমন: user@gmail.com এ লগইন করুন" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-slate-300">কী-এর তালিকা</label>
            <textarea value={keysText} onChange={(e) => setKeysText(e.target.value)} rows={6}
              className="field font-mono text-sm" placeholder={"KEY-AAAA-1111\nKEY-BBBB-2222\nuser@mail.com : pass123"} />
          </div>
          {msg && <p className="text-sm text-slate-300">{msg}</p>}
          <button onClick={addKeys} disabled={loading || !productId} className="btn-vault w-full">
            {loading ? "যোগ হচ্ছে..." : "🔑 কী যোগ করুন"}
          </button>
        </div>
      </div>

      <div className="glass rounded-2xl p-6">
        <h2 className="font-display text-lg font-bold text-white">
          📋 ইনভেন্টরি <span className="text-sm font-normal text-slate-500">({toBnDigits(unused)}টি অব্যবহৃত)</span>
        </h2>
        <div className="thin-scroll mt-4 max-h-[560px] space-y-2 overflow-y-auto pr-1">
          {keys.map((k) => (
            <div key={k.id} className={`rounded-xl p-3 text-sm ${k.is_used ? "bg-white/[0.02] opacity-50" : "bg-white/[0.04]"}`}>
              <div className="flex items-start justify-between gap-2">
                <code className="break-all font-mono text-xs text-white">{k.key_text}</code>
                {!k.is_used && (
                  <button onClick={() => del(k.id)} className="shrink-0 text-slate-500 hover:text-red-400">🗑</button>
                )}
              </div>
              <div className="mt-1.5 flex flex-wrap gap-2 text-[11px] text-slate-500">
                {k.plan && <span className="rounded bg-white/10 px-1.5 py-0.5">{k.plan.label_bn}</span>}
                <span className={`rounded px-1.5 py-0.5 ${k.is_used ? "bg-slate-500/20 text-slate-400" : "bg-[#d7ff3f]/15 text-[#d7ff3f]"}`}>
                  {k.is_used ? "ব্যবহৃত" : "অব্যবহৃত"}
                </span>
                <span>{timeAgo(k.created_at)}</span>
              </div>
              {k.key_note && <p className="mt-1 text-xs text-slate-500">📝 {k.key_note}</p>}
            </div>
          ))}
          {keys.length === 0 && !loading && (
            <p className="py-8 text-center text-sm text-slate-500">এই প্রোডাক্টের কোনো কী নেই</p>
          )}
        </div>
      </div>
    </div>
  );
}
