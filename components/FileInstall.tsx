"use client";

import { useState } from "react";
import { useLang } from "@/lib/i18n";
import { toBnDigits } from "@/lib/format";
import type { DownloadToken } from "@/lib/types";

function fmtSize(bytes: number, lang: string): string {
  const n = (v: string) => (lang === "bn" ? toBnDigits(v) : v);
  if (bytes >= 1024 * 1024) return `${n((bytes / 1024 / 1024).toFixed(1))} MB`;
  if (bytes >= 1024) return `${n((bytes / 1024).toFixed(0))} KB`;
  return `${n(String(bytes))} B`;
}

export default function FileInstall({ files }: { files: DownloadToken[] }) {
  const { t, lang } = useLang();
  const [showGuide, setShowGuide] = useState(false);
  if (files.length === 0) return null;

  return (
    <div className="mt-4 rounded-2xl border border-cyan-400/25 bg-cyan-400/[0.05] p-4">
      <p className="text-sm font-bold text-cyan-300">{t("db_fi_title")}</p>
      <p className="mt-1 text-xs text-slate-400">
        {t("db_fi_once_pre")}
        <b className="text-white">{t("db_fi_once_bold")}</b>
        {t("db_fi_once_post")}
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
                  📦 {f.product_file?.file_name ?? t("db_fi_file")}
                </p>
                <p className="text-xs text-slate-500">
                  {f.product_file?.version_label && (
                    <span className="mr-2 rounded bg-white/10 px-1.5 py-0.5">
                      {f.product_file.version_label}
                    </span>
                  )}
                  {f.product_file ? fmtSize(f.product_file.file_size, lang) : ""}
                  {dead && (
                    <span className="ml-2 text-amber-400">
                      {used ? t("db_fi_used") : t("db_fi_expired")}
                    </span>
                  )}
                </p>
              </div>
              {dead ? (
                <span className="shrink-0 rounded-lg bg-white/5 px-4 py-2 text-xs font-bold text-slate-500">
                  {t("db_fi_closed")}
                </span>
              ) : (
                <a
                  href={`/api/download/${f.token}`}
                  className="shrink-0 rounded-lg bg-cyan-400 px-4 py-2 text-xs font-bold text-[#060913] transition hover:brightness-110"
                >
                  {t("db_fi_install")}
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
        {showGuide ? t("db_fi_guide_hide") : t("db_fi_guide_show")}
      </button>
      {showGuide && (
        <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-xs leading-relaxed text-slate-400">
          <li>{t("db_fi_step1")}</li>
          <li>{t("db_fi_step2")}</li>
          <li>{t("db_fi_step3")}</li>
          <li>{t("db_fi_step4")}</li>
        </ol>
      )}
    </div>
  );
}
