import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "./supabase/server";

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

  if (!profile?.is_admin) redirect("/");
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
      return {
        error: Response.json({ error: "অনুমতি নেই" }, { status: 403 }),
      };
    }
    return { svc };
  } catch {
    return {
      error: Response.json({ error: "সার্ভার সমস্যা" }, { status: 500 }),
    };
  }
}
