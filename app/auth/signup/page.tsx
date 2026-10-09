"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

function SignupForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [referral, setReferral] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  // auto-fill referral code from ?ref= link
  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) {
      setReferral(ref.toUpperCase());
      try {
        localStorage.setItem("dp_ref", ref.toUpperCase());
      } catch {
        /* ignore */
      }
    } else {
      try {
        const saved = localStorage.getItem("dp_ref");
        if (saved) setReferral(saved);
      } catch {
        /* ignore */
      }
    }
  }, [searchParams]);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 6) return setError("পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে");
    setLoading(true);
    try {
      // create account (email pre-confirmed server-side — no verification link)
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
          referral_code: referral.trim() || undefined,
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "রেজিস্ট্রেশন হয়নি");

      // sign in immediately
      const supabase = createClient();
      const { error: signErr } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signErr) throw new Error("অ্যাকাউন্ট হয়েছে — লগইন করুন");

      try {
        localStorage.removeItem("dp_ref");
      } catch {
        /* ignore */
      }
      await fetch("/api/auth/link-orders", { method: "POST" }).catch(() => {});
      router.push("/dashboard");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "রেজিস্ট্রেশন হয়নি");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="glass ring-conic rounded-3xl p-8">
        <h1 className="font-display text-2xl font-bold text-white">✨ রেজিস্টার</h1>
        <p className="mt-1 text-sm text-slate-400">
          ফ্রি অ্যাকাউন্ট খুলুন — ইমেইল ভেরিফিকেশন লাগবে না
        </p>
        {referral && (
          <p className="mt-3 rounded-xl bg-[#d7ff3f]/10 px-4 py-2.5 text-sm text-[#d7ff3f]">
            🎁 রেফারেল কোড প্রয়োগ হয়েছে: <b className="font-mono">{referral}</b>
          </p>
        )}
        <form onSubmit={handleSignup} className="mt-6 space-y-4">
          <input required value={name} onChange={(e) => setName(e.target.value)}
            placeholder="আপনার নাম" className="field" />
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="ইমেইল" className="field" />
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)" className="field" />
          <input value={referral} onChange={(e) => setReferral(e.target.value.toUpperCase())}
            placeholder="রেফারেল কোড (যদি থাকে)" className="field font-mono" />
          {error && <p className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-300">⚠️ {error}</p>}
          <button type="submit" disabled={loading} className="btn-vault w-full">
            {loading ? "অ্যাকাউন্ট হচ্ছে..." : "অ্যাকাউন্ট খুলুন"}
          </button>
        </form>
        <p className="mt-5 text-center text-sm text-slate-400">
          অ্যাকাউন্ট আছে?{" "}
          <Link href="/auth/login" className="font-bold text-[#d7ff3f]">লগইন করুন</Link>
        </p>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  );
}
