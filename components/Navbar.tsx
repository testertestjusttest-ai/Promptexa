"use client";

import SiteLogo from "@/components/SiteLogo";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/cart";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import NotificationBell from "@/components/NotificationBell";
import { useLang, LangToggle } from "@/lib/i18n";

export default function Navbar() {
  const { count, openCart } = useCart();
  const { t } = useLang();
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

  const directLinks = [{ href: "/", label: t("nav_home") }];
  const menuLinks = [
    { href: "/shop", label: t("nav_shop") },
    { href: "/earn", label: t("nav_earn") },
    { href: "/marketplace", label: t("nav_market") },
    { href: "/chat", label: t("nav_chat") },
    { href: "/faq", label: t("nav_faq") },
    { href: "/dashboard", label: t("nav_dashboard") },
  ];

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setMenuOpen(false);
    window.location.href = "/";
  }

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-[#060913]/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <SiteLogo className="h-11 w-11 rounded-xl" />
          <span className="font-display text-xl font-bold tracking-tight">
            <span className="font-bold text-white">Digi</span>
            <span className="font-bold text-[#d7ff3f]">Plyra</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {directLinks.map((l) => (
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
          <LangToggle />
          {user && <NotificationBell />}
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
            <>
              <Link
                href="/dashboard"
                className="hidden rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15 sm:block"
              >
                {t("nav_dashboard_btn")}
              </Link>
              <button
                onClick={logout}
                className="hidden rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-red-400/50 hover:text-red-300 sm:block"
              >
                {t("nav_logout")}
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="btn-vault hidden !px-4 !py-2 text-sm sm:inline-flex">
                {t("nav_login")}
              </Link>
              <Link
                href="/auth/signup"
                className="hidden rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-[#d7ff3f]/50 sm:block"
              >
                {t("nav_signup")}
              </Link>
            </>
          )}
          <button
            className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-lg"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="মেনু"
          >
            ☰
          </button>
        </div>
      </div>
      {menuOpen && (
        <nav className="border-t border-white/5 px-4 py-3">
          {menuLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-200 hover:bg-white/5"
            >
              {l.label}
            </Link>
          ))}
          {!user ? (
            <>
              <Link
                href="/auth/login"
                onClick={() => setMenuOpen(false)}
                className="mt-1 block rounded-lg bg-[#d7ff3f] px-3 py-2.5 text-center text-sm font-bold text-[#060913]"
              >
                {t("nav_login")}
              </Link>
              <Link
                href="/auth/signup"
                onClick={() => setMenuOpen(false)}
                className="mt-1 block rounded-lg border border-white/10 px-3 py-2.5 text-center text-sm font-bold text-white"
              >
                {t("nav_signup")}
              </Link>
            </>
          ) : (
            <button
              onClick={logout}
              className="mt-1 block w-full rounded-lg border border-red-400/30 px-3 py-2.5 text-center text-sm font-bold text-red-300"
            >
              🚪 {t("nav_logout")}
            </button>
          )}
        </nav>
      )}
    </header>
  );
}
