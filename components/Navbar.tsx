"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/cart";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function Navbar() {
  const { count, openCart } = useCart();
  const pathname = usePathname();
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) =>
      setUser(session?.user ?? null)
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  const links = [
    { href: "/", label: "হোম" },
    { href: "/shop", label: "শপ" },
    { href: "/dashboard", label: "আমার অর্ডার" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-[#060913]/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <img
            src="/logo.jpg"
            alt="DigiPlyra"
            className="h-10 w-10 rounded-xl shadow-[0_0_20px_rgba(139,92,246,0.5)]"
          />
          <span className="font-display text-xl font-bold tracking-tight">
            <span className="font-bold text-white">Digi</span>
            <span className="font-bold text-[#d7ff3f]">Plyra</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                pathname === l.href
                  ? "bg-white/10 text-[#d7ff3f]"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={openCart}
            className="relative grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-lg transition hover:border-[#d7ff3f]/50"
            aria-label="কার্ট"
          >
            🛒
            {count > 0 && (
              <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-[#d7ff3f] px-1 text-[11px] font-bold text-[#060913]">
                {count}
              </span>
            )}
          </button>
          {user ? (
            <Link
              href="/dashboard"
              className="hidden rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15 sm:block"
            >
              ড্যাশবোর্ড
            </Link>
          ) : (
            <Link href="/auth/login" className="btn-vault hidden !px-4 !py-2 text-sm sm:inline-flex">
              লগইন
            </Link>
          )}
          <button
            className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 md:hidden"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="মেনু"
          >
            ☰
          </button>
        </div>
      </div>
      {menuOpen && (
        <nav className="border-t border-white/5 px-4 py-3 md:hidden">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-200 hover:bg-white/5"
            >
              {l.label}
            </Link>
          ))}
          {!user && (
            <Link
              href="/auth/login"
              onClick={() => setMenuOpen(false)}
              className="mt-1 block rounded-lg bg-[#d7ff3f] px-3 py-2.5 text-center text-sm font-bold text-[#060913]"
            >
              লগইন
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}
