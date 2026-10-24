/**
 * Agency News — shared constants/helpers (CLIENT-SAFE).
 * No Supabase, no next/headers, no server-only imports here: the admin
 * client imports DAILY_SLOTS/slugify from this file, while server code
 * imports the data layer (lib/agency-news.ts), which re-exports these.
 */

export type NewsLang = "en" | "bn" | "hi";

/** The 10 daily slots. Times are Asia/Dhaka; slots 9-10 are agency stories. */
export const DAILY_SLOTS: { index: number; time: string; agency: boolean; label: string }[] = [
  { index: 1, time: "08:00", agency: false, label: "Morning tip" },
  { index: 2, time: "09:30", agency: false, label: "Website / tech story" },
  { index: 3, time: "11:00", agency: false, label: "Business / how-to" },
  { index: 4, time: "12:30", agency: false, label: "Platform news" },
  { index: 5, time: "14:00", agency: false, label: "Client education" },
  { index: 6, time: "15:30", agency: false, label: "Website / tech story" },
  { index: 7, time: "17:00", agency: false, label: "Business / how-to" },
  { index: 8, time: "18:30", agency: false, label: "Evening story" },
  { index: 9, time: "20:00", agency: true, label: "DigiPlyra agency story" },
  { index: 10, time: "21:30", agency: true, label: "DigiPlyra agency story" },
];

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 100) || `news-${Date.now()}`;
}

export function postUrl(slug: string): string {
  return `https://promptexa.vercel.app/news/${slug}`;
}
