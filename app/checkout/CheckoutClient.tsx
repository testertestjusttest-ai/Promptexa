"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/lib/cart";
import { formatBDT, PAYMENT_METHOD_BN } from "@/lib/format";
import type { PaymentMethod } from "@/lib/types";

type Step = "info" | "manual-pay";

export default function CheckoutClient() {
  const { items, total, clear } = useCart();
  const router = useRouter();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("bkash");
  const [numbers, setNumbers] = useState<Record<string, { number: string; kind: string; image: string }>>({});

  function payInfo(m: string) {
    const raw: any = (numbers as any)[m];
    if (!raw) return { number: "", kind: "merchant", image: "" };
    if (typeof raw === "string") return { number: raw, kind: "merchant", image: "" };
    return { number: raw.number ?? "", kind: raw.kind ?? "merchant", image: raw.image ?? "" };
  }
  const [sslOn, setSslOn] = useState(false);
  const [step, setStep] = useState<Step>("info");
  const [orderId, setOrderId] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [orderTotal, setOrderTotal] = useState(0);
  const [orderItems, setOrderItems] = useState<typeof items>([]);
  const [senderNumber, setSenderNumber] = useState("");
  const [trxId, setTrxId] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [walletBal, setWalletBal] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/public/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) {
          setNumbers(d.payment_numbers ?? {});
          setSslOn(!!d.sslcommerz_enabled);
          if (d.sslcommerz_enabled) setMethod("sslcommerz");
        }
      })
      .catch(() => {});
    fetch("/api/wallet")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.ok) setWalletBal(Number(d.wallet.balance_bdt) || 0);
      })
      .catch(() => {});
  }, []);

  if (items.length === 0 && step === "info") {
    return (
      <div className="glass mx-auto max-w-md rounded-2xl p-10 text-center">
        <div className="text-5xl">🛒</div>
        <p className="mt-4 font-bold text-white">কার্ট খালি</p>
        <Link href="/shop" className="btn-vault mt-6 inline-flex text-sm">
          শপে ফিরে যান
        </Link>
      </div>
    );
  }

  const validPhone = /^01[3-9]\d{8}$/.test(phone.trim());

  async function placeOrder() {
    setError("");
    if (!name.trim()) return setError("আপনার নাম লিখুন");
    if (!validPhone) return setError("সঠিক ১১ সংখ্যার মোবাইল নম্বর দিন (01XXXXXXXXX)");
    if (method !== "sslcommerz" && method !== "wallet" && !payInfo(method).number) {
      return setError("এই পেমেন্ট মাধ্যম এখন চালু নেই");
    }
    if (method === "wallet" && (walletBal === null || walletBal < total)) {
      return setError("ওয়ালেটে যথেষ্ট ব্যালেন্স নেই — অ্যাড দেখে আয় করুন!");
    }
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: { name: name.trim(), phone: phone.trim(), email: email.trim() || undefined },
          items: items.map((i) => ({
            product_id: i.product.id,
            plan_id: i.plan.id,
            qty: i.qty,
          })),
          payment_method: method,
          notes: notes.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "অর্ডার হয়নি");

      // snapshot totals BEFORE clearing — step 2 shows these
      setOrderTotal(Number(data.total_bdt) || total);
      setOrderItems(items);
      clear();

      if (data.paid) {
        // wallet: paid instantly → straight to success
        router.push(`/checkout/success?order=${data.order_number}`);
        return;
      }

      if (method === "sslcommerz") {
        const init = await fetch("/api/payments/sslcommerz/initiate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order_id: data.order_id }),
        });
        const initData = await init.json();
        if (!init.ok || !initData.ok) throw new Error(initData.error || "পেমেন্ট শুরু হয়নি");
        window.location.href = initData.gateway_url;
        return;
      }

      // manual → show TrxID submission step
      setOrderId(data.order_id);
      setOrderNumber(data.order_number);
      setStep("manual-pay");
    } catch (e) {
      setError(e instanceof Error ? e.message : "কিছু ভুল হয়েছে");
    } finally {
      setLoading(false);
    }
  }

  async function submitTrx() {
    setError("");
    if (!senderNumber.trim() || !trxId.trim()) {
      return setError("সেন্ডার নম্বর ও TrxID দুটোই দিন");
    }
    setLoading(true);
    try {
      const res = await fetch("/api/payments/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: orderId, sender_number: senderNumber.trim(), trx_id: trxId.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "জমা হয়নি");
      router.push(`/checkout/success?order=${orderNumber}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "কিছু ভুল হয়েছে");
    } finally {
      setLoading(false);
    }
  }

  const methodLabel = PAYMENT_METHOD_BN[method] ?? method;

  return (
    <div className="grid gap-8 lg:grid-cols-5">
      {/* left: form */}
      <div className="lg:col-span-3">
        {step === "info" ? (
          <div className="glass rounded-3xl p-6 sm:p-8">
            <h2 className="font-display text-xl font-bold text-white">👤 আপনার তথ্য</h2>
            <div className="mt-5 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">নাম *</label>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="আপনার পুরো নাম" className="field" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">মোবাইল নম্বর *</label>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01XXXXXXXXX" inputMode="numeric" className="field" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">ইমেইল (ঐচ্ছিক)</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" type="email" className="field" />
                <p className="mt-1 text-xs text-slate-500">এই ইমেইলে রেজিস্টার করলে অর্ডারটি আপনার ড্যাশবোর্ডে যোগ হবে</p>
              </div>
            </div>

            <h2 className="mt-8 font-display text-xl font-bold text-white">💳 পেমেন্ট মাধ্যম</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {sslOn && (
                <MethodCard active={method === "sslcommerz"} onClick={() => setMethod("sslcommerz")}
                  icon="💳" title="কার্ড / মোবাইল ব্যাংকিং" desc="SSLCommerz — অটো কনফার্ম" />
              )}
              <MethodCard active={method === "wallet"} onClick={() => setMethod("wallet")}
                icon="💰" title="ওয়ালেট ব্যালেন্স"
                desc={walletBal === null ? "লগইন করুন" : `ব্যালেন্স: ${formatBDT(walletBal)}`}
                disabled={walletBal === null} />
              {(["bkash", "nagad", "rocket"] as PaymentMethod[]).map((m) => {
                const info = payInfo(m);
                const kindBn = info.kind === "sendmoney" ? "সেন্ড মানি" : "মার্চেন্ট";
                return (
                  <MethodCard key={m} active={method === m} onClick={() => setMethod(m)}
                    icon={info.image ? "" : m === "bkash" ? "🩷" : m === "nagad" ? "🟠" : "🟣"}
                    img={info.image || undefined}
                    title={PAYMENT_METHOD_BN[m]} desc={info.number ? `${kindBn}: ${info.number}` : "শীঘ্রই আসছে"}
                    disabled={!info.number} />
                );
              })}
            </div>

            <div className="mt-5">
              <label className="mb-1.5 block text-sm font-medium text-slate-300">
                অতিরিক্ত তথ্য / রিকোয়ারমেন্ট <span className="text-slate-500">(ঐচ্ছিক)</span>
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="ওয়েবসাইট অর্ডারের ক্ষেত্রে কী ধরনের সাইট চান, ফিচার, রেফারেন্স লিংক ইত্যাদি লিখুন"
                className="field min-h-[90px]"
                maxLength={2000}
              />
            </div>

            {error && (
              <p className="mt-4 rounded-xl bg-red-500/10 px-4 py-3 text-sm font-medium text-red-300">⚠️ {error}</p>
            )}

            <button onClick={placeOrder} disabled={loading} className="btn-vault mt-6 w-full text-base">
              {loading ? "প্রসেস হচ্ছে..." : method === "sslcommerz" ? `পেমেন্ট করুন — ${formatBDT(total)}` : `অর্ডার করুন — ${formatBDT(total)}`}
            </button>
            <p className="mt-3 text-center text-xs text-slate-500">🔒 আপনার তথ্য সম্পূর্ণ নিরাপদ</p>
          </div>
        ) : (
          <div className="glass ring-conic rounded-3xl p-6 sm:p-8">
            <span className="chip chip-lime">ধাপ ২ / ২</span>
            <h2 className="mt-3 font-display text-xl font-bold text-white">
              {methodLabel}-এ টাকা পাঠান
            </h2>
            <div className="mt-5 rounded-2xl bg-white/[0.03] p-5">
              <p className="text-sm text-slate-400">অর্ডার নম্বর</p>
              <p className="font-display text-lg font-bold text-[#d7ff3f]">{orderNumber}</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-slate-400">
                    পাঠাবেন এই নম্বরে ({methodLabel} — {payInfo(method).kind === "sendmoney" ? "সেন্ড মানি" : "মার্চেন্ট"})
                  </p>
                  <p className="font-display text-2xl font-bold text-white">{payInfo(method).number}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">টাকার পরিমাণ</p>
                  <p className="font-display text-2xl font-bold text-[#d7ff3f]">{formatBDT(orderTotal)}</p>
                </div>
              </div>
              <ol className="mt-4 list-decimal space-y-1.5 pl-5 text-sm text-slate-400">
                <li><b className="text-white">{payInfo(method).kind === "sendmoney" ? "Send Money" : "Payment"}</b> করে উপরের নম্বরে টাকা পাঠান</li>
                <li>ট্রানজেকশন আইডি (TrxID) কপি করুন</li>
                <li>নিচের ফর্মে সেন্ডার নম্বর ও TrxID দিয়ে জমা দিন</li>
              </ol>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">যে নম্বর থেকে টাকা পাঠিয়েছেন *</label>
                <input value={senderNumber} onChange={(e) => setSenderNumber(e.target.value)} placeholder="01XXXXXXXXX" className="field" inputMode="numeric" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">TrxID *</label>
                <input value={trxId} onChange={(e) => setTrxId(e.target.value)} placeholder="যেমন: 9HX7K2LMNQ" className="field uppercase" />
              </div>
            </div>

            {error && (
              <p className="mt-4 rounded-xl bg-red-500/10 px-4 py-3 text-sm font-medium text-red-300">⚠️ {error}</p>
            )}
            <button onClick={submitTrx} disabled={loading} className="btn-vault mt-6 w-full text-base">
              {loading ? "জমা হচ্ছে..." : "✓ পেমেন্ট জমা দিন"}
            </button>
          </div>
        )}
      </div>

      {/* right: summary */}
      <div className="lg:col-span-2">
        <div className="glass sticky top-24 rounded-3xl p-6">
          <h3 className="font-display text-lg font-bold text-white">🧾 অর্ডার সামারি</h3>
          <ul className="mt-4 space-y-3">
            {(step === "manual-pay" ? orderItems : items).map((i) => (
              <li key={i.plan.id} className="flex items-center justify-between gap-3 text-sm">
                <div className="flex items-center gap-2.5">
                  <span className="grid h-9 w-9 place-items-center rounded-lg text-base" style={{ background: i.product.badge_bg }}>
                    {i.product.badge}
                  </span>
                  <div>
                    <p className="font-semibold text-white">{i.product.name}</p>
                    <p className="text-xs text-slate-500">{i.plan.label_bn} × {i.qty}</p>
                  </div>
                </div>
                <p className="font-bold text-slate-200">{formatBDT(i.plan.price_bdt * i.qty)}</p>
              </li>
            ))}
          </ul>
          <div className="divider-glow my-4" />
          <div className="flex items-center justify-between">
            <span className="text-slate-400">সর্বমোট</span>
            <span className="font-display text-2xl font-bold text-[#d7ff3f]">{formatBDT(step === "manual-pay" ? orderTotal : total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function MethodCard({ active, onClick, icon, img, title, desc, disabled }: {
  active: boolean; onClick: () => void; icon: string; img?: string; title: string; desc: string; disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-2xl border p-4 text-left transition ${
        active ? "border-[#d7ff3f]/60 bg-[#d7ff3f]/5" : "border-white/10 bg-white/[0.02] hover:border-white/25"
      } ${disabled ? "opacity-40" : ""}`}
    >
      {img ? (
        <img src={img} alt={title} className="h-8 w-8 rounded-lg object-contain" />
      ) : (
        <div className="text-2xl">{icon}</div>
      )}
      <p className="mt-2 font-bold text-white">{title}</p>
      <p className="text-xs text-slate-500">{desc}</p>
    </button>
  );
}
