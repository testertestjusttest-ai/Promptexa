"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) throw error;
      // ensure profile row exists
      if (data.user) {
        await supabase.from("profiles").upsert(
          { id: data.user.id, email: data.user.email },
          { onConflict: "id" }
        );
        // link guest orders bought with this email
        await fetch("/api/auth/link-orders", { method: "POST" }).catch(() => {});
      }
      router.push("/dashboard");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "লগইন হয়নি");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="glass ring-conic rounded-3xl p-8">
        <h1 className="font-display text-2xl font-bold text-white">🔐 লগইন</h1>
        <p className="mt-1 text-sm text-slate-400">ড্যাশবোর্ডে আপনার ডেলিভারি দেখুন</p>
        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="ইমেইল" className="field" />
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="পাসওয়ার্ড" className="field" />
          {error && <p className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-300">⚠️ {error}</p>}
          <button type="submit" disabled={loading} className="btn-vault w-full">
            {loading ? "লগইন হচ্ছে..." : "লগইন করুন"}
          </button>
        </form>
        <p className="mt-5 text-center text-sm text-slate-400">
          অ্যাকাউন্ট নেই?{" "}
          <Link href="/auth/signup" className="font-bold text-[#d7ff3f]">রেজিস্টার করুন</Link>
        </p>
      </div>
    </div>
  );
}
