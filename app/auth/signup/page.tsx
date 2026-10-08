"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const router = useRouter();

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 6) return setError("পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে");
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { full_name: name.trim() } },
      });
      if (error) throw error;
      if (data.user) {
        await supabase.from("profiles").upsert(
          { id: data.user.id, email: data.user.email, full_name: name.trim() },
          { onConflict: "id" }
        );
      }
      if (data.session) {
        await fetch("/api/auth/link-orders", { method: "POST" }).catch(() => {});
        router.push("/dashboard");
        router.refresh();
      } else {
        setDone(true); // email confirmation required
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "রেজিস্ট্রেশন হয়নি");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <div className="glass rounded-3xl p-8 text-center">
          <div className="text-5xl">📧</div>
          <h1 className="mt-4 font-display text-xl font-bold text-white">ইমেইল চেক করুন</h1>
          <p className="mt-2 text-sm text-slate-400">
            <b className="text-white">{email}</b>-এ একটি কনফার্মেশন লিংক পাঠানো হয়েছে। লিংকে ক্লিক করে অ্যাকাউন্ট অ্যাক্টিভ করুন।
          </p>
          <Link href="/auth/login" className="btn-vault mt-6 inline-flex text-sm">লগইন পেজে যান</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="glass ring-conic rounded-3xl p-8">
        <h1 className="font-display text-2xl font-bold text-white">✨ রেজিস্টার</h1>
        <p className="mt-1 text-sm text-slate-400">ফ্রি অ্যাকাউন্ট খুলে ডেলিভারি ট্র্যাক করুন</p>
        <form onSubmit={handleSignup} className="mt-6 space-y-4">
          <input required value={name} onChange={(e) => setName(e.target.value)}
            placeholder="আপনার নাম" className="field" />
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="ইমেইল" className="field" />
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)" className="field" />
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
