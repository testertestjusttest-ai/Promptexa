"use client";

import { useState } from "react";
import { toBnDigits } from "@/lib/format";
import type { DownloadToken } from "@/lib/types";

function fmtSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${toBnDigits((bytes / 1024 / 1024).toFixed(1))} MB`;
  if (bytes >= 1024) return `${toBnDigits((bytes / 1024).toFixed(0))} KB`;
  return `${toBnDigits(bytes)} B`;
}

export default function FileInstall({ files }: { files: DownloadToken[] }) {
  const [showGuide, setShowGuide] = useState(false);
  if (files.length === 0) return null;

  return (
    <div className="mt-4 rounded-2xl border border-cyan-400/25 bg-cyan-400/[0.05] p-4">
      <p className="text-sm font-bold text-cyan-300">📲 আপনার অ্যাপ ডাউনলোড</p>
      <p className="mt-1 text-xs text-slate-400">
        প্রতিটি ফাইল <b className="text-white">শুধু একবার</b> ডাউনলোড করা যাবে। লিংক শেয়ার করলেও কাজ করবে না।
      </p>
      <div className="mt-3 space-y-2.5">
        {files.map((f) => {
          const used = f.downloads_used >= f.max_downloads;
          const expired = new Date(f.expires_at) < new Date();
          const dead = used || expired;
          return (
            <div
              key={f.id}
              className="flex items-center justify-between gap-3 rounded-xl bg-black/40 p-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">
                  📦 {f.product_file?.file_name ?? "ফাইল"}
                </p>
                <p className="text-xs text-slate-500">
                  {f.product_file?.version_label && (
                    <span className="mr-2 rounded bg-white/10 px-1.5 py-0.5">
                      {f.product_file.version_label}
                    </span>
                  )}
                  {f.product_file ? fmtSize(f.product_file.file_size) : ""}
                  {dead && (
                    <span className="ml-2 text-amber-400">
                      {used ? "• ব্যবহার হয়ে গেছে" : "• মেয়াদ শেষ"}
                    </span>
                  )}
                </p>
              </div>
              {dead ? (
                <span className="shrink-0 rounded-lg bg-white/5 px-4 py-2 text-xs font-bold text-slate-500">
                  🔒 বন্ধ
                </span>
              ) : (
                <a
                  href={`/api/download/${f.token}`}
                  className="shrink-0 rounded-lg bg-cyan-400 px-4 py-2 text-xs font-bold text-[#060913] transition hover:brightness-110"
                >
                  ⬇ ইনস্টল
                </a>
              )}
            </div>
          );
        })}
      </div>

      <button
        onClick={() => setShowGuide((v) => !v)}
        className="mt-3 text-xs font-semibold text-cyan-300 underline"
      >
        {showGuide ? "▲ লুকান" : "❓ অ্যান্ড্রয়েডে কীভাবে ইনস্টল করবেন?"}
      </button>
      {showGuide && (
        <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-xs leading-relaxed text-slate-400">
          <li><b className="text-white">⬇ ইনস্টল</b> বাটনে ট্যাপ করুন — APK ফাইল ডাউনলোড হবে</li>
          <li>ডাউনলোড শেষে নোটিফিকেশনে বা ফাইল ম্যানেজারে ফাইলটিতে ট্যাপ করুন</li>
          <li>ফোন <b className="text-white">"Install unknown apps"</b> অনুমতি চাইবে — <b className="text-white">Allow</b> করুন</li>
          <li><b className="text-white">Install</b> চাপুন — ব্যস, অ্যাপ রেডি! 🎉</li>
        </ol>
      )}
    </div>
  );
}
