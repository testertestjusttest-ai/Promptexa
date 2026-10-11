import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/** Custom domain routing for client sites (multi-tenant). */
const MAIN_HOSTS = new Set([
  "promptexa.vercel.app",
  "www.promptexa.vercel.app",
  "localhost",
  "127.0.0.1",
]);

function clientDomainRewrite(request: NextRequest): NextResponse | null {
  const host = request.headers.get("host")?.split(":")[0]?.toLowerCase() ?? "";
  if (
    MAIN_HOSTS.has(host) ||
    host.endsWith(".vercel.app") ||
    request.nextUrl.pathname.startsWith("/c/") ||
    request.nextUrl.pathname.startsWith("/_")
  ) {
    return null;
  }
  const url = request.nextUrl.clone();
  const origPath = url.pathname;
  url.pathname = `/c/_domain/${host}${origPath === "/" ? "" : origPath}`;
  return NextResponse.rewrite(url);
}

/** Refreshes the Supabase auth session on every request. */
export async function proxy(request: NextRequest) {
  // Custom client domains first
  const rewrite = clientDomainRewrite(request);
  if (rewrite) return rewrite;

  let response = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });
  await supabase.auth.getClaims();
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg).*)"],
};
