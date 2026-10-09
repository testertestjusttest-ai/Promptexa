"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { timeAgo } from "@/lib/format";

type Item = { id: string; title: string; body: string; link: string; is_read: boolean; created_at: string };

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  async function load() {
    try {
      const res = await fetch("/api/notifications");
      const d = await res.json();
      if (d.ok) {
        setItems(d.items ?? []);
        setUnread(d.unread ?? 0);
      }
    } catch {}
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 30000);
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => {
      clearInterval(t);
      document.removeEventListener("mousedown", onClick);
    };
  }, []);

  async function openPanel() {
    const willOpen = !open;
    setOpen(willOpen);
    if (willOpen && unread > 0) {
      try {
        await fetch("/api/notifications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "read_all" }),
        });
        setUnread(0);
        setItems((it) => it.map((i) => ({ ...i, is_read: true })));
      } catch {}
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={openPanel}
        className="relative grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-lg transition hover:border-[#d7ff3f]/50"
        aria-label="নোটিফিকেশন"
      >
        🔔
        {unread > 0 && (
          <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-12 z-50 w-80 overflow-hidden rounded-2xl border border-white/10 bg-[#0b1120] shadow-2xl">
          <p className="border-b border-white/5 px-4 py-3 text-sm font-bold text-white">🔔 নোটিফিকেশন</p>
          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 && (
              <p className="px-4 py-8 text-center text-sm text-slate-500">কোনো নোটিফিকেশন নেই</p>
            )}
            {items.map((n) => (
              <Link
                key={n.id}
                href={n.link || "/dashboard"}
                onClick={() => setOpen(false)}
                className={`block border-b border-white/5 px-4 py-3 transition hover:bg-white/5 ${n.is_read ? "" : "bg-[#d7ff3f]/5"}`}
              >
                <p className="text-sm font-bold text-white">{n.title}</p>
                <p className="mt-0.5 line-clamp-2 text-xs text-slate-400">{n.body}</p>
                <p className="mt-1 text-[11px] text-slate-600">{timeAgo(n.created_at)}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
