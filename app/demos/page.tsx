"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { DEMOS } from "../web-dev/demos/demos";
import MotionBg from "@/components/MotionBg";

const GROUPS = ["All", ...Array.from(new Set(DEMOS.map((d) => d.group ?? "🌐 Other")))];

export default function AllDemosPage() {
  const [q, setQ] = useState("");
  const [group, setGroup] = useState("All");

  const list = useMemo(() => {
    const query = q.trim().toLowerCase();
    return DEMOS.filter((d) => {
      if (group !== "All" && (d.group ?? "🌐 Other") !== group) return false;
      if (!query) return true;
      return (d.name + " " + d.type + " " + d.desc).toLowerCase().includes(query);
    });
  }, [q, group]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 px-6 py-10 text-center">
        <MotionBg />
        <p className="relative inline-block rounded-full bg-[#d7ff3f]/15 px-4 py-1.5 text-xs font-bold text-[#d7ff3f] ring-1 ring-[#d7ff3f]/40">
          🖥️ {DEMOS.length} live demos
        </p>
        <h1 className="font-display relative mt-4 text-3xl font-black text-white sm:text-4xl">
          All <span className="text-[#d7ff3f]">demo</span> websites
        </h1>
        <p className="relative mx-auto mt-2 max-w-xl text-sm text-slate-400">
          Open any demo and explore it — every button works. If you like one, get a site like it built for you.
        </p>
        <div className="relative mx-auto mt-5 max-w-md">
          <input
            value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="🔍 Search… (e.g. restaurant, pharmacy)"
            className="w-full rounded-2xl border border-white/15 bg-black/50 px-5 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-[#d7ff3f]/60"
          />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {GROUPS.map((g) => (
          <button key={g} onClick={() => setGroup(g)}
            className={`rounded-full px-4 py-2 text-xs font-bold transition ${group === g ? "bg-[#d7ff3f] text-black" : "bg-white/10 text-slate-300 hover:bg-white/15"}`}>
            {g}
          </button>
        ))}
      </div>

      <p className="mt-4 text-xs text-slate-500">{list.length} demos found</p>

      <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((d) => (
          <Link key={d.slug} href={`/demo${d.slug}`} className="tilt-card group block overflow-hidden rounded-3xl border border-white/10 bg-[#0b1120] transition hover:border-[#d7ff3f]/40">
            <div className="pointer-events-none max-h-[260px] overflow-hidden [&_*]:!cursor-default">
              {d.render()}
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="font-bold text-white">{d.name}</p>
                <span className="shrink-0 rounded-full bg-[#d7ff3f]/15 px-2.5 py-1 text-[10px] font-bold text-[#d7ff3f]">{d.price}</span>
              </div>
              <p className="mt-1 text-xs text-slate-400">{d.type}</p>
              <span className="mt-2.5 block rounded-xl bg-[#d7ff3f]/10 px-3 py-2 text-center text-xs font-black text-[#d7ff3f] ring-1 ring-[#d7ff3f]/30 transition group-hover:bg-[#d7ff3f]/20">
                👁️ Click to view the demo website
              </span>
            </div>
          </Link>
        ))}
      </div>

      {list.length === 0 && (
        <p className="py-16 text-center text-sm text-slate-500">😅 Nothing found — try a different search</p>
      )}

      <div className="glass mt-10 rounded-3xl p-8 text-center">
        <h2 className="font-display text-xl font-bold text-white">Want a website like this?</h2>
        <p className="mt-2 text-sm text-slate-400">Delivery in 7–14 days • 100% customised to your choice</p>
        <Link href="/#quote" className="btn-vault mt-4 inline-flex !px-10 !py-3.5 text-base">📝 Get a free quote</Link>
      </div>
    </div>
  );
}
