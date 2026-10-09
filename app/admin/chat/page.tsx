"use client";

import { useEffect, useState } from "react";

type Thread = { id: string; a_name: string; b_name: string; msg_count: number; last_msg_at: string };
type Msg = { id: string; sender_id: string; sender_name: string; body: string; created_at: string };

export default function AdminChatPage() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/chat/threads").then((r) => r.json()).then((d) => {
      if (d.threads) setThreads(d.threads);
      setLoading(false);
    });
  }, []);

  async function open(id: string, t: string) {
    setActive(id); setTitle(t);
    const d = await fetch(`/api/admin/chat/thread/${id}`).then((r) => r.json()).catch(() => null);
    if (d?.messages) setMsgs(d.messages);
  }

  if (loading) return <p className="text-slate-400">লোড হচ্ছে...</p>;

  return (
    <div>
      <h1 className="font-display text-xl font-bold text-white">💬 কমিউনিটি চ্যাট মনিটর</h1>
      <p className="mt-1 text-xs text-slate-500">
        ইউজারদের প্রাইভেট কথোপকথন — শুধু মনিটরিংয়ের জন্য। অপব্যবহার দেখলে অ্যাডমিন সেটিংস থেকে চ্যাট বন্ধ করতে পারবেন।
      </p>
      <div className="mt-5 grid gap-4 lg:grid-cols-[320px_1fr]">
        <div className="glass rounded-2xl p-4">
          <p className="mb-2 text-sm font-bold text-white">সব থ্রেড ({threads.length})</p>
          <div className="max-h-[60vh] space-y-1.5 overflow-y-auto">
            {threads.length === 0 && <p className="py-6 text-center text-xs text-slate-500">এখনো কোনো চ্যাট হয়নি</p>}
            {threads.map((t) => (
              <button key={t.id} onClick={() => open(t.id, `${t.a_name} ↔ ${t.b_name}`)}
                className={`w-full rounded-xl px-3 py-2.5 text-left ${active === t.id ? "bg-[#d7ff3f]/15 ring-1 ring-[#d7ff3f]/40" : "bg-white/5 hover:bg-white/10"}`}>
                <p className="text-sm font-bold text-white">{t.a_name} <span className="text-slate-500">↔</span> {t.b_name}</p>
                <p className="mt-0.5 text-[11px] text-slate-500">{t.msg_count}টি মেসেজ</p>
              </button>
            ))}
          </div>
        </div>
        <div className="glass rounded-2xl p-4">
          {!active ? (
            <p className="py-16 text-center text-sm text-slate-500">একটি থ্রেড সিলেক্ট করুন 👈</p>
          ) : (
            <>
              <p className="border-b border-white/10 pb-2 text-sm font-bold text-white">👁️ {title} <span className="ml-1 font-normal text-slate-500">(শুধু দেখা যাবে)</span></p>
              <div className="max-h-[60vh] space-y-2 overflow-y-auto py-3">
                {msgs.map((m) => (
                  <div key={m.id} className="rounded-xl bg-white/5 px-3 py-2">
                    <p className="text-[11px] font-bold text-[#d7ff3f]">{m.sender_name}</p>
                    <p className="text-sm text-slate-200">{m.body}</p>
                  </div>
                ))}
                {msgs.length === 0 && <p className="py-8 text-center text-xs text-slate-500">কোনো মেসেজ নেই</p>}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
