import type { SupabaseClient } from "@supabase/supabase-js";

/** Insert an in-app notification (fire-and-forget safe). */
export async function pushNotification(
  svc: SupabaseClient,
  userId: string,
  title: string,
  body: string,
  link = ""
) {
  try {
    if (!userId) return;
    await svc.from("notifications").insert({
      user_id: userId,
      title: title.slice(0, 120),
      body: body.slice(0, 300),
      link: link.slice(0, 300),
    });
  } catch (e) {
    console.error("pushNotification failed", e);
  }
}
