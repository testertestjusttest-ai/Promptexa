import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    return NextResponse.json({ prompt_text: "" }, { status: 404 });
  }
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("prompts")
    .select("prompt_text")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (error || !data) return NextResponse.json({ error: "Prompt not found" }, { status: 404 });
  return NextResponse.json({ prompt_text: data.prompt_text }, {
    headers: { "Cache-Control": "private, no-store" },
  });
}
