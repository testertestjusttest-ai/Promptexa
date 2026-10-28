"use client";

import { useLang } from "@/lib/i18n";

/** Hint shown under the movie player (language-aware; movie data stays as stored). */
export default function PlayerNote() {
  const { t } = useLang();
  return <p className="mt-3 text-center text-xs text-blue-100/60">{t("mv_wd_player_note")}</p>;
}
