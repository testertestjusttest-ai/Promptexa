import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Assigns one unused product key per order item and records delivery.
 * Returns the number of items that could NOT be fulfilled (no keys left).
 *
 * Must be called with the SERVICE-ROLE client.
 */
export async function deliverOrderKeys(
  supabase: SupabaseClient,
  orderId: string
): Promise<{ delivered: number; missing: number }> {
  const { data: items, error } = await supabase
    .from("order_items")
    .select("id, product_id, plan_id")
    .eq("order_id", orderId);
  if (error || !items) throw new Error("Could not load order items");

  let delivered = 0;
  let missing = 0;

  for (const item of items) {
    // already delivered? skip
    const { data: existing } = await supabase
      .from("delivered_keys")
      .select("id")
      .eq("order_item_id", item.id)
      .limit(1);
    if (existing && existing.length > 0) {
      delivered++;
      continue;
    }

    // Prefer a plan-specific key, else any key for the product (oldest first)
    let key: { id: string; key_text: string; key_note: string | null } | null =
      null;

    if (item.plan_id) {
      const { data } = await supabase
        .from("product_keys")
        .select("id, key_text, key_note")
        .eq("product_id", item.product_id)
        .eq("plan_id", item.plan_id)
        .eq("is_used", false)
        .order("created_at", { ascending: true })
        .limit(1);
      if (data && data.length > 0) key = data[0];
    }
    if (!key) {
      const { data } = await supabase
        .from("product_keys")
        .select("id, key_text, key_note")
        .eq("product_id", item.product_id)
        .is("plan_id", null)
        .eq("is_used", false)
        .order("created_at", { ascending: true })
        .limit(1);
      if (data && data.length > 0) key = data[0];
    }

    if (!key) {
      missing++;
      continue;
    }

    const { error: useErr } = await supabase
      .from("product_keys")
      .update({ is_used: true, used_by_order_id: orderId })
      .eq("id", key.id)
      .eq("is_used", false); // guard against double-assign races
    if (useErr) {
      missing++;
      continue;
    }

    await supabase.from("delivered_keys").insert({
      order_id: orderId,
      order_item_id: item.id,
      product_key_id: key.id,
      key_text: key.key_text,
      key_note: key.key_note,
    });
    delivered++;
  }

  await supabase
    .from("orders")
    .update({ status: missing > 0 ? "keys_pending" : "delivered" })
    .eq("id", orderId);

  return { delivered, missing };
}

/** Marks payment success and triggers delivery. Idempotent. */
export async function confirmOrderPayment(
  supabase: SupabaseClient,
  orderId: string,
  paymentPatch: Record<string, unknown>
): Promise<{ delivered: number; missing: number }> {
  // mark latest pending payment as success
  const { data: payment } = await supabase
    .from("payments")
    .select("id, status")
    .eq("order_id", orderId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (payment && payment.status !== "success") {
    await supabase
      .from("payments")
      .update({ ...paymentPatch, status: "success", verified_at: new Date().toISOString() })
      .eq("id", payment.id);
  }

  const { data: order } = await supabase
    .from("orders")
    .select("status")
    .eq("id", orderId)
    .single();

  if (order && (order.status === "delivered" || order.status === "keys_pending")) {
    return { delivered: 0, missing: 0 }; // already handled
  }

  await supabase.from("orders").update({ status: "paid" }).eq("id", orderId);
  return deliverOrderKeys(supabase, orderId);
}
