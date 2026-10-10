"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import MotionBg from "@/components/MotionBg";

type Thread = { id: string; other_id: string; other_name: string; last_body: string; last_mine: boolean; last_at: string };
type Msg = { id: string; sender_id: string; body: string; created_at: string; mine: boolean };

export default function ChatPage() {
  return (
    <Suspense fallback={<p className="mx-auto max-w-3xl px-4 py-16 text-center text-slate-400">লোড হচ্ছে...</p>}>
      <ChatInner />
    </Suspense>
  );
}

function ChatInner() {
  const sp = useSearchParams();
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [loggedIn, setLoggedIn] = useState(true);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [otherName, setOtherName] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [q, setQ] = useState("");
  const [results, setResults] = useState<{ id: string; name: string }[]>([]);
  const [searching, setSearching] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadThreads = useCallback(async () => {
    const r = await fetch("/api/chat/threads").then((x) => x.json()).catch(() => null);
    if (r?.error === "লগইন করুন") { setLoggedIn(false); return; }
    if (r?.threads) setThreads(r.threads);
  }, []);

  const loadMsgs = useCallback(async (id: string) => {
    const r = await fetch(`/api/chat/thread/${id}`).then((x) => x.json()).catch(() => null);
    if (r?.messages) { setMsgs(r.messages); setOtherName(r.other_name ?? ""); }
  }, []);

  useEffect(() => {
    fetch("/api/chat/status").then((r) => r.json()).then((d) => setEnabled(d.enabled !== false)).catch(() => setEnabled(true));
  }, []);

  useEffect(() => {
    if (enabled) {
      loadThreads();
      const t = setInterval(loadThreads, 8000);
      return () => clearInterval(t);
    }
  }, [enabled, loadThreads]);

  useEffect(() => {
    const tid = sp.get("thread");
    if (tid && enabled) { setActive(tid); loadMsgs(tid); }
  }, [sp, enabled, loadMsgs]);

  useEffect(() => {
    if (!active) return;
    loadMsgs(active);
    const t = setInterval(() => loadMsgs(active), 5000);
    return () => clearInterval(t);
  }, [active, loadMsgs]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  useEffect(() => {
    if (q.trim().length < 2) { setResults([]); return; }
    setSearching(true);
    const t = setTimeout(async () => {
      const r = await fetch(`/api/chat/users?q=${encodeURIComponent(q.trim())}`).then((x) => x.json()).catch(() => null);
      setResults(r?.users ?? []);
      setSearching(false);
    }, 400);
    return () => clearTimeout(t);
  }, [q]);

  async function startChat(userId: string) {
    const r = await fetch("/api/chat/threads", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId }),
    }).then((x) => x.json()).catch(() => null);
    if (r?.thread_id) {
      setQ(""); setResults([]);
      setActive(r.thread_id);
      loadThreads(); loadMsgs(r.thread_id);
    }
  }

  async function send() {
    const text = draft.trim();
    if (!text || !active || sending) return;
    setSending(true);
    const r = await fetch(`/api/chat/thread/${active}`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: text }),
    }).then((x) => x.json()).catch(() => null);
    if (r?.message) {
      setMsgs((m) => [...m, r.message]);
      setDraft("");
      loadThreads();
    }
    setSending(false);
  }

  if (enabled === null) return <p className="mx-auto max-w-3xl px-4 py-16 text-center text-slate-400">লোড হচ্ছে...</p>;
  if (!loggedIn) return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <p className="text-4xl">💬</p>
      <h1 className="font-display mt-3 text-xl font-black text-white">চ্যাট করতে লগইন করুন</h1>
      <Link href="/auth/login" className="btn-vault mt-4 inline-flex">লগইন করুন</Link>
    </div>
  );
  if (!enabled) return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <p className="text-4xl">🔇</p>
      <h1 className="font-display mt-3 text-xl font-black text-white">কমিউনিটি চ্যাট এখন বন্ধ আছে</h1>
      <p className="mt-2 text-sm text-slate-400">অ্যাডমিন চ্যাট চালু করলে এখানে অন্য ইউজারদের সাথে কথা বলতে পারবেন।</p>
    </div>
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 px-6 py-6">
        <MotionBg intensity="soft" />
        <h1 className="font-display relative text-2xl font-black text-white">💬 কমিউনিটি চ্যাট</h1>
        <p className="relative mt-1 text-xs text-slate-500">শুধু আপনি আর যার সাথে কথা বলছেন — তৃতীয় কেউ দেখতে পাবে না (অ্যাডমিন ছাড়া)।</p>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-[300px_1fr]">
        {/* Thread list / search */}
        <div className={`${active ? "hidden md:block" : ""} glass rounded-3xl p-4`}>
          <input
            value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="🔍 ইউজার খুঁজুন (নাম লিখুন)…"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-[#d7ff3f]/50"
          />
          {searching && <p className="mt-2 text-xs text-slate-500">খুঁজছি...</p>}
          {results.length > 0 && (
            <div className="mt-2 space-y-1">
              {results.map((u) => (
                <button key={u.id} onClick={() => startChat(u.id)}
                  className="flex w-full items-center gap-2.5 rounded-xl bg-white/5 px-3 py-2.5 text-left hover:bg-white/10">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-[#d7ff3f]/20 text-sm font-black text-[#d7ff3f]">
                    {u.name.slice(0, 1)}
                  </span>
                  <span className="text-sm font-bold text-white">{u.name}</span>
                </button>
              ))}
            </div>
          )}
          <div className="mt-3 space-y-1.5">
            {threads.length === 0 && results.length === 0 && (
              <p className="py-6 text-center text-xs text-slate-500">এখনো কোনো চ্যাট নেই।<br />উপরে নাম লিখে খুঁজে চ্যাট শুরু করুন 👆</p>
            )}
            {threads.map((t) => (
              <button key={t.id} onClick={() => { setActive(t.id); loadMsgs(t.id); }}
                className={`w-full rounded-xl px-3 py-2.5 text-left transition ${active === t.id ? "bg-[#d7ff3f]/15 ring-1 ring-[#d7ff3f]/40" : "bg-white/5 hover:bg-white/10"}`}>
                <p className="text-sm font-bold text-white">{t.other_name}</p>
                <p className="mt-0.5 truncate text-xs text-slate-400">{t.last_mine ? "আপনি: " : ""}{t.last_body || "…"}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Conversation */}
        <div className={`${!active ? "hidden md:flex" : ""} glass min-h-[420px] flex-col rounded-3xl p-4 ${active ? "flex" : ""}`}>
          {!active ? (
            <div className="grid flex-1 place-items-center text-center">
              <div>
                <p className="text-5xl">💬</p>
                <p className="mt-3 text-sm text-slate-400">বাম পাশ থেকে একটি চ্যাট সিলেক্ট করুন</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                <button onClick={() => setActive(null)} className="rounded-lg bg-white/10 px-2.5 py-1.5 text-sm md:hidden">←</button>
                <span className="grid h-9 w-9 place-items-center rounded-full bg-[#d7ff3f]/20 text-sm font-black text-[#d7ff3f]">
                  {otherName.slice(0, 1)}
                </span>
                <p className="font-bold text-white">{otherName}</p>
              </div>
              <div className="max-h-[46vh] flex-1 space-y-2 overflow-y-auto py-4 pr-1">
                {msgs.map((m) => (
                  <div key={m.id} className={`flex ${m.mine ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm leading-relaxed ${m.mine ? "bg-[#d7ff3f] font-medium text-black" : "bg-white/10 text-slate-100"}`}>
                      {m.body}
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
              <div className="flex gap-2 pt-2">
                <input
                  value={draft} onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  placeholder="মেসেজ লিখুন…"
                  className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-[#d7ff3f]/50"
                />
                <button onClick={send} disabled={sending} className="btn-vault !px-5 !py-2.5 text-sm disabled:opacity-50">
                  {sending ? "…" : "পাঠান ➤"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
