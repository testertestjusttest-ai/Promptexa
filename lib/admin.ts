import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "./supabase/server";

/**
 * Owner emails auto-promoted to admin. Set in Vercel →
 * Settings → Environment Variables as ADMIN_EMAILS
 * (comma-separated, e.g. "you@gmail.com,partner@gmail.com").
 * Any account signing in with one of these emails becomes admin
 * automatically — no SQL needed.
 */
export function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/** Promote the user to admin if their email is in ADMIN_EMAILS. */
async function autoPromoteOwner(
  svc: ReturnType<typeof createServiceClient>,
  userId: string,
  email: string | undefined
): Promise<boolean> {
  if (!email) return false;
  if (!getAdminEmails().includes(email.toLowerCase())) return false;
  await svc.from("profiles").update({ is_admin: true }).eq("id", userId);
  return true;
}

/** Page guard: redirects non-admins away. Returns service client + profile. */
export async function requireAdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?next=/admin");

  const svc = createServiceClient();
  const { data: profile } = await svc
    .from("profiles")
    .select("id, email, full_name, is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    const promoted = await autoPromoteOwner(svc, user.id, user.email);
    if (!promoted) redirect("/");
    return { svc, profile: { ...profile, is_admin: true }, user };
  }
  return { svc, profile, user };
}

/** API guard: returns service client or a 403 Response. */
export async function requireAdminApi(): Promise<
  | { svc: ReturnType<typeof createServiceClient>; error?: undefined }
  | { svc?: undefined; error: Response }
> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return {
        error: Response.json({ error: "লগইন করুন" }, { status: 401 }),
      };
    }
    const svc = createServiceClient();
    const { data: profile } = await svc
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();
    if (!profile?.is_admin) {
      const promoted = await autoPromoteOwner(svc, user.id, user.email);
      if (!promoted) {
        return {
          error: Response.json({ error: "অনুমতি নেই" }, { status: 403 }),
        };
      }
    }
    return { svc };
  } catch {
    return {
      error: Response.json({ error: "সার্ভার সমস্যা" }, { status: 500 }),
    };
  }
}
