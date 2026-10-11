import { createHash, createHmac } from "crypto";
import { createServiceClient } from "@/lib/supabase/server";

const SECRET = process.env.SUPABASE_SERVICE_ROLE_KEY || "dp-client-admin";

export function hashPin(pin: string): string {
  return createHash("sha256").update(`dp:${pin}`).digest("hex");
}

export function signToken(slug: string): string {
  const exp = Date.now() + 7 * 24 * 3600 * 1000; // 7 days
  const payload = `${slug}.${exp}`;
  const sig = createHmac("sha256", SECRET).update(payload).digest("hex").slice(0, 32);
  return `${payload}.${sig}`;
}

export function verifyToken(token: string, slug: string): boolean {
  try {
    const [tSlug, exp, sig] = token.split(".");
    if (tSlug !== slug || Date.now() > Number(exp)) return false;
    const expect = createHmac("sha256", SECRET).update(`${tSlug}.${exp}`).digest("hex").slice(0, 32);
    return sig === expect;
  } catch {
    return false;
  }
}

export async function requireClientAdmin(req: Request, slug: string) {
  const token = req.headers.get("x-client-token") || "";
  if (!verifyToken(token, slug)) {
    return { error: Response.json({ error: "অনুমতি নেই" }, { status: 403 }) };
  }
  const svc = createServiceClient();
  const { data: site } = await svc.from("client_sites").select("id, slug").eq("slug", slug).eq("is_active", true).single();
  if (!site) return { error: Response.json({ error: "সাইট পাওয়া যায়নি" }, { status: 404 }) };
  return { svc, site };
}
