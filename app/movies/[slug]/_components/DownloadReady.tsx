"use client";

import { useLang } from "@/lib/i18n";

/** Final download step: the ready panel (language-aware; the URL itself is stored data). */
export default function DownloadReady({
  downloadUrl,
  totalSteps,
}: {
  downloadUrl: string;
  totalSteps: number;
}) {
  const { t } = useLang();
  return (
    <div className="mx-auto mt-6 max-w-xl rounded-2xl bg-black/25 p-6 text-center ring-1 ring-white/10 sm:p-8">
      <div className="flex items-center justify-center gap-2">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <span key={i} className="h-2 w-10 rounded-full bg-yellow-400" />
        ))}
      </div>
      <div className="mt-4 text-5xl">✅</div>
      <h2 className="mt-3 text-xl font-extrabold text-white">{t("mv_wd_dl_ready_t")}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-blue-50/80">
        {t("mv_wd_dl_ready_d")}
      </p>
      <a
        href={downloadUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-[#0b84ff] px-6 py-3.5 text-base font-extrabold text-white transition hover:bg-[#006fe0]"
      >
        {t("mv_wd_dl_ready_btn")}
      </a>
      <p className="mt-3 text-xs text-blue-100/60">{t("mv_wd_dl_ready_note")}</p>
    </div>
  );
}
