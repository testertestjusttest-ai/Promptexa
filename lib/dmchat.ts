import type { SupabaseClient } from "@supabase/supabase-js";

/** Canonical (user_a, user_b) ordering so each pair has exactly one thread. */
export function canonPair(u1: string, u2: string): [string, string] {
  return u1 < u2 ? [u1, u2] : [u2, u1];
}

export async function chatEnabled(svc: SupabaseClient): Promise<boolean> {
  try {
    const { data } = await svc.from("site_settings").select("value").eq("key", "community_chat").single();
    return (data?.value as any)?.enabled !== false;
  } catch {
    return true;
  }
}

export async function isStaff(svc: SupabaseClient, userId: string): Promise<boolean> {
  const { data } = await svc.from("profiles").select("is_admin, is_support").eq("id", userId).single();
  return !!((data as any)?.is_admin || (data as any)?.is_support);
}

export function displayName(p: { full_name?: string | null; email?: string | null } | null): string {
  if (p?.full_name?.trim()) return p.full_name.trim();
  if (p?.email) return p.email.split("@")[0];
  return "ইউজার";
}
