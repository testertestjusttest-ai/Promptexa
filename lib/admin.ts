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

export type AdminRole = "admin" | "support";

export type AdminAccess =
  | { ok: true; svc: ReturnType<typeof createServiceClient>; user: { id: string; email?: string }; role: AdminRole }
  | { ok: false; reason: "login" }
  | { ok: false; reason: "denied"; email: string };

/** Check admin access without redirecting — lets the UI explain the problem. */
export async function getAdminAccess(): Promise<AdminAccess> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, reason: "login" };

  const svc = createServiceClient();
  const { data: profile } = await svc
    .from("profiles")
    .select("id, email, is_admin, is_support")
    .eq("id", user.id)
    .single();

  if (profile?.is_admin) return { ok: true, svc, user, role: "admin" };
  if (profile?.is_support) return { ok: true, svc, user, role: "support" };

  const promoted = await autoPromoteOwner(svc, user.id, user.email);
  if (promoted) return { ok: true, svc, user, role: "admin" };
  return { ok: false, reason: "denied", email: user.email ?? profile?.email ?? "?" };
}

/** Page guard: redirects non-admins away. Returns service client + profile + role. */
export async function requireAdminPage() {
  const access = await getAdminAccess();
  if (!access.ok) {
    redirect("/auth/login?next=/admin");
  }
  const svc = access.svc;
  const { data: profile } = await svc
    .from("profiles")
    .select("id, email, full_name, is_admin")
    .eq("id", access.user.id)
    .single();
  return { svc, profile, user: access.user, role: access.role };
}

/** API guard: returns service client or a 403 Response. */
/**
 * API guard. Set opts.support = "read" to allow support-admins read-only
 * access (they can view + chat, but never change data).
 */
export async function requireAdminApi(opts?: { support?: "read" }): Promise<
  | { svc: ReturnType<typeof createServiceClient>; role: AdminRole; user: { id: string }; error?: undefined }
  | { svc?: undefined; role?: undefined; user?: undefined; error: Response }
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
      .select("is_admin, is_support")
      .eq("id", user.id)
      .single();
    let role: AdminRole | null = null;
    if (profile?.is_admin) role = "admin";
    else if (profile?.is_support && opts?.support === "read") role = "support";
    if (!role) {
      const promoted = await autoPromoteOwner(svc, user.id, user.email);
      if (!promoted) {
        return {
          error: Response.json({ error: "অনুমতি নেই" }, { status: 403 }),
        };
      }
      role = "admin";
    }
    return { svc, role, user: { id: user.id } };
  } catch {
    return {
      error: Response.json({ error: "সার্ভার সমস্যা" }, { status: 500 }),
    };
  }
}
