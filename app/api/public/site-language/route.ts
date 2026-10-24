import { NextResponse } from "next/server";
import { fetchSiteDefaultLang } from "@/lib/agency-news";

/** Site default language for NEW visitors (admin-controlled). Always "en" when unset. */
export async function GET() {
  const default_lang = await fetchSiteDefaultLang();
  return NextResponse.json({ ok: true, default_lang });
}
