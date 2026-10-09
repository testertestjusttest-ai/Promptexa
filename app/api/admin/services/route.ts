import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin";

/** GET — list service requests. POST — { action: "status"|"note", id, value } */
export async function GET() {
  const auth = await requireAdminApi({ support: "read" });
  if (auth.error) return auth.error;
  try {
    const { data } = await auth.svc
      .from("service_requests")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    return NextResponse.json({ ok: true, requests: data ?? [] });
  } catch (e) {
    console.error("admin services error", e);
    return NextResponse.json({ error: "সার্ভার সমস্যা" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;
  if (auth.role !== "admin") {
    return NextResponse.json({ error: "সাপোর্ট অ্যাডমিন পরিবর্তন করতে পারবে না" }, { status: 403 });
  }
  try {
    const { action, id, value } = (await req.json()) as Record<string, string>;
    if (action === "status") {
      await auth.svc.from("service_requests").update({ status: value }).eq("id", id);
    } else if (action === "note") {
      await auth.svc.from("service_requests").update({ admin_note: (value || "").slice(0, 1000) }).eq("id", id);
    } else {
      return NextResponse.json({ error: "ভুল অ্যাকশন" }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("admin services action error", e);
    return NextResponse.json({ error: "সার্ভার সমস্যা" }, { status: 500 });
  }
}
