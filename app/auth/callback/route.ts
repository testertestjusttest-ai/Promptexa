import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** Handles email-confirmation / magic-link / OAuth code exchange. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.user) {
      await supabase.from("profiles").upsert(
        { id: data.user.id, email: data.user.email },
        { onConflict: "id" }
      );
      // link guest orders bought with this email
      if (data.user.email) {
        const { createServiceClient } = await import("@/lib/supabase/server");
        const svc = createServiceClient();
        await svc
          .from("orders")
          .update({ user_id: data.user.id })
          .is("user_id", null)
          .ilike("customer_email", data.user.email);
      }
    }
  }
  return NextResponse.redirect(new URL(next, url.origin));
}
